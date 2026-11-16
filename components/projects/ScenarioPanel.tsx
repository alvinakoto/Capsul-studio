'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import { calculerScenario } from '@/lib/calculs/index'
import { donneesProjet, donneesFinancement, donneesCharges, alerteApport } from '@/lib/calculs/depuisProjet'
import AlerteApport from './AlerteApport'
import { updateProjectScenario } from '@/lib/supabase/projects'
import { euros, eurosSigne, pct } from '@/lib/utils/format'
import ProjectionChart from './ProjectionChart'
import {
  BoutonsDocuments, IndicateurEnregistrement, Kpi, NumField, ResultatFlottant, Toggle, useEnregistrementAuto,
  type StatutEnregistrement,
} from './simulateur'

type TypeScenario = 'lmnp_meuble' | 'colocation' | 'courte_duree'

const SCENARIOS: { id: TypeScenario; label: string }[] = [
  { id: 'lmnp_meuble',  label: 'LMNP meublé' },
  { id: 'colocation',   label: 'Colocation' },
  { id: 'courte_duree', label: 'Courte durée' },
]

// ─── Champs par scénario ────────────────────────────────────────────────────
// Un seul objet par « emplacement » (principal / comparaison), aux mêmes clés
// que scenarioInput.params — permet de le persister tel quel dans la colonne
// JSONB scenario_comparaison_data et de le relire sans transformation.

interface ScenarioFields {
  loyerMensuel: number | ''
  nbChambres: number | ''
  loyerParChambre: number | ''
  prixNuitee: number | ''
  nuitsConservateur: number | ''
  nuitsOptimiste: number | ''
  vacancePct: number | ''
  fraisGestionPct: number | ''
  conciergeriePct: number | ''
}

function defaultFields(type: TypeScenario): ScenarioFields {
  return {
    loyerMensuel: '',
    nbChambres: 2,
    loyerParChambre: '',
    prixNuitee: '',
    nuitsConservateur: 16,
    nuitsOptimiste: 22,
    vacancePct: type === 'colocation' ? 8 : 5,
    fraisGestionPct: 7,
    conciergeriePct: 20,
  }
}

function primaryFieldsFromProject(project: any, type: TypeScenario): ScenarioFields {
  const base = defaultFields(type)
  return {
    ...base,
    loyerMensuel:    type === 'lmnp_meuble'  ? (project.loyer_cible || '') : base.loyerMensuel,
    loyerParChambre: type === 'colocation'   ? (project.loyer_cible || '') : base.loyerParChambre,
    prixNuitee:      type === 'courte_duree' ? (project.loyer_cible || '') : base.prixNuitee,
    nbChambres:          project.nb_chambres ?? base.nbChambres,
    nuitsConservateur:   project.nuits_conservateur ?? base.nuitsConservateur,
    nuitsOptimiste:      project.nuits_optimiste ?? base.nuitsOptimiste,
    vacancePct:          project.vacance_pct ?? base.vacancePct,
    fraisGestionPct:     project.frais_gestion_pct ?? base.fraisGestionPct,
    conciergeriePct:     project.concierge_pct ?? base.conciergeriePct,
  }
}

/** { error } si champ obligatoire manquant, sinon { input } prêt pour calculerScenario(). */
function buildScenarioInput(type: TypeScenario, f: ScenarioFields, chargesData: any):
  { error: string } | { input: { type: TypeScenario; params: Record<string, number> } } {
  if (type === 'lmnp_meuble') {
    if (!f.loyerMensuel) return { error: 'Renseignez le loyer mensuel.' }
    return { input: { type, params: {
      loyerMensuel: Number(f.loyerMensuel), vacancePct: Number(f.vacancePct) || 0, fraisGestionPct: Number(f.fraisGestionPct) || 0,
    } } }
  }
  if (type === 'colocation') {
    if (!f.loyerParChambre) return { error: 'Renseignez le loyer par chambre.' }
    return { input: { type, params: {
      nbChambres: Number(f.nbChambres) || 1, loyerParChambre: Number(f.loyerParChambre),
      vacancePct: Number(f.vacancePct) || 0, fraisGestionPct: Number(f.fraisGestionPct) || 0,
    } } }
  }
  if (!f.prixNuitee) return { error: 'Renseignez le prix par nuit.' }
  return { input: { type, params: {
    prixNuitee: Number(f.prixNuitee), nuitsConservateur: Number(f.nuitsConservateur) || 0, nuitsOptimiste: Number(f.nuitsOptimiste) || 0,
    conciergeriePct: Number(f.conciergeriePct) || 0,
    electriciteEau: chargesData.electriciteEau, internet: chargesData.internet, chauffage: chargesData.chauffage,
  } } }
}

interface Resultats {
  r: any | null
  /** Champ requis encore vide : état normal pendant la saisie, pas une erreur. */
  manquant: string | null
  erreur: string | null
  r2: any | null
  manquantComparaison: string | null
  erreurComparaison: string | null
  comparaisonParams: Record<string, number> | null
}

/**
 * Calcule le scénario principal et la comparaison indépendamment, sans rien enregistrer :
 * une comparaison incomplète ne doit pas empêcher d'afficher ni d'enregistrer le principal.
 */
function calculerResultats(
  project: any,
  scenarioType: TypeScenario, fields: ScenarioFields,
  comparaison: { type: TypeScenario; fields: ScenarioFields } | null,
): Resultats {
  const projetData = donneesProjet(project)
  const financementData = donneesFinancement(project)
  const chargesData = donneesCharges(project)
  const out: Resultats = {
    r: null, manquant: null, erreur: null,
    r2: null, manquantComparaison: null, erreurComparaison: null, comparaisonParams: null,
  }

  const primary = buildScenarioInput(scenarioType, fields, chargesData)
  if ('error' in primary) {
    out.manquant = primary.error
  } else {
    try {
      out.r = calculerScenario(projetData, financementData, chargesData, primary.input as any)
    } catch (err: any) {
      console.error(err)
      out.erreur = err?.message ?? 'Erreur de calcul.'
    }
  }

  if (comparaison) {
    const comp = buildScenarioInput(comparaison.type, comparaison.fields, chargesData)
    if ('error' in comp) {
      out.manquantComparaison = comp.error
    } else {
      try {
        out.r2 = calculerScenario(projetData, financementData, chargesData, comp.input as any)
        out.comparaisonParams = comp.input.params
      } catch (err: any) {
        out.erreurComparaison = err?.message ?? 'Erreur de calcul (comparaison).'
      }
    }
  }

  return out
}

interface PayloadScenario {
  loyerCible: number
  scenarioType: TypeScenario
  extras: Parameters<typeof updateProjectScenario>[3]
}

/**
 * Ce qui part en base pour l'état courant du simulateur, ou null si le scénario principal
 * n'est pas calculable. Comparaison active mais incomplète : `undefined` laisse les colonnes
 * de comparaison intactes en base, plutôt que d'effacer l'encart pendant la saisie.
 */
function construirePayload(
  res: Resultats, scenarioType: TypeScenario, fields: ScenarioFields,
  comparaisonActive: boolean, comparaisonType: TypeScenario | null,
): PayloadScenario | null {
  if (!res.r) return null
  const loyerCible =
    scenarioType === 'lmnp_meuble' ? Number(fields.loyerMensuel) :
    scenarioType === 'colocation'  ? Number(fields.loyerParChambre) :
                                     Number(fields.prixNuitee)
  const comparaisonPrete = comparaisonActive && !!res.r2
  return {
    loyerCible,
    scenarioType,
    extras: {
      fraisGestionPct: Number(fields.fraisGestionPct) || 0,
      conciergePct: Number(fields.conciergeriePct) || 0,
      vacancePct: Number(fields.vacancePct) || 0,
      nuitsConservateur: Number(fields.nuitsConservateur) || 0,
      nuitsOptimiste: Number(fields.nuitsOptimiste) || 0,
      nbChambres: Number(fields.nbChambres) || 1,
      scenarioComparaisonType: !comparaisonActive ? null : comparaisonPrete ? comparaisonType : undefined,
      scenarioComparaisonData: !comparaisonActive ? null : comparaisonPrete ? res.comparaisonParams : undefined,
    },
  }
}

const SCENARIO_LABELS: Record<TypeScenario, string> = {
  lmnp_meuble: 'LMNP meublé', colocation: 'Colocation', courte_duree: 'Courte durée',
}

export default function ScenarioPanel({ project }: { project: any }) {
  const initScenario = (project.scenario_type ?? 'lmnp_meuble') as TypeScenario

  const [scenarioType, setScenarioType] = useState<TypeScenario>(initScenario)
  const [fields, setFields] = useState<ScenarioFields>(primaryFieldsFromProject(project, initScenario))

  const initComparaisonType = (project.scenario_comparaison_type ?? null) as TypeScenario | null
  const [comparaisonActive, setComparaisonActive] = useState(!!initComparaisonType)
  const [comparaisonType, setComparaisonType] = useState<TypeScenario | null>(
    initComparaisonType ?? SCENARIOS.find((s) => s.id !== initScenario)?.id ?? null
  )
  const [comparaisonFields, setComparaisonFields] = useState<ScenarioFields>(
    initComparaisonType
      ? { ...defaultFields(initComparaisonType), ...(project.scenario_comparaison_data ?? {}) }
      : defaultFields(comparaisonType ?? 'colocation')
  )

  // Les résultats suivent la saisie : ce qui est affiché est toujours ce qui sortira dans le PDF.
  const resultats = useMemo(
    () => calculerResultats(
      project, scenarioType, fields,
      comparaisonActive && comparaisonType ? { type: comparaisonType, fields: comparaisonFields } : null,
    ),
    [project, scenarioType, fields, comparaisonActive, comparaisonType, comparaisonFields],
  )
  const result = resultats.r
  const result2 = resultats.r2

  const payload = useMemo(
    () => construirePayload(resultats, scenarioType, fields, comparaisonActive, comparaisonType),
    [resultats, scenarioType, fields, comparaisonActive, comparaisonType],
  )
  // ─── Enregistrement automatique ───────────────────────────────────────────
  const enregistrer = useCallback(
    (p: PayloadScenario) => updateProjectScenario(project.id, p.loyerCible, p.scenarioType, p.extras),
    [project.id],
  )
  const { statut, enregistrerMaintenant, telecharger } = useEnregistrementAuto(payload, enregistrer)
  const refResultat = useRef<HTMLDivElement>(null)

  const setField = <K extends keyof ScenarioFields>(k: K, v: ScenarioFields[K]) =>
    setFields((prev) => ({ ...prev, [k]: v }))
  const setComparaisonField = <K extends keyof ScenarioFields>(k: K, v: ScenarioFields[K]) =>
    setComparaisonFields((prev) => ({ ...prev, [k]: v }))

  const otherTypes = SCENARIOS.filter((s) => s.id !== scenarioType)

  const handleChangeScenarioType = (type: TypeScenario) => {
    setScenarioType(type)
    setFields((prev) => ({ ...prev, vacancePct: type === 'colocation' ? 8 : 5 }))
    // Le scénario de comparaison ne peut pas être identique au scénario principal
    if (comparaisonType === type) {
      setComparaisonType(SCENARIOS.find((s) => s.id !== type)?.id ?? null)
    }
  }

  // ─── Rendu ────────────────────────────────────────────────────────────────

  return (
    <section className="space-y-5">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h2 className="cs-h2">Simulation</h2>
        <p className="text-[13px]" style={{ color: 'var(--cs-mist)' }}>Tous les montants sont avant impôt.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[5fr_7fr] gap-5 items-start">

        {/* ── Paramètres ── */}
        <div className="cs-card">
          <div className="p-[22px]">
            <h3 className="cs-h3">Scénario principal</h3>
            <p className="cs-sub mt-0.5">C’est lui qui figure sur la fiche commerciale.</p>

            <div className="cs-seg mt-4" role="group" aria-label="Type de location">
              {SCENARIOS.map((s) => (
                <button key={s.id} type="button" aria-pressed={scenarioType === s.id} onClick={() => handleChangeScenarioType(s.id)}>
                  {s.label}
                </button>
              ))}
            </div>

            <ScenarioFieldsInputs prefix="p" type={scenarioType} fields={fields} setField={setField} large />

            {resultats.erreur && (
              <p className="mt-4 text-[12.5px] font-medium px-3 py-2 rounded-lg" style={{ color: 'var(--cs-neg)', backgroundColor: 'var(--cs-neg-wash)' }} role="alert">
                {resultats.erreur}
              </p>
            )}
          </div>

          {/* Comparaison */}
          <div className="p-[22px] border-t cs-divider">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="cs-h3">Comparer avec un autre scénario</h3>
                <p className="cs-sub mt-0.5">
                  {comparaisonActive
                    ? 'Affiché en encart sur la fiche commerciale.'
                    : "Pour montrer deux options au client. Chaque scénario garde ses propres chiffres."}
                </p>
              </div>
              <Toggle checked={comparaisonActive} onChange={setComparaisonActive} label="Activer la comparaison" />
            </div>

            {comparaisonActive && comparaisonType && (
              <>
                <div className="cs-seg mt-4" role="group" aria-label="Type de location comparé">
                  {otherTypes.map((s) => (
                    <button key={s.id} type="button" aria-pressed={comparaisonType === s.id} onClick={() => setComparaisonType(s.id)}>
                      {s.label}
                    </button>
                  ))}
                </div>
                <ScenarioFieldsInputs prefix="c" type={comparaisonType} fields={comparaisonFields} setField={setComparaisonField} />
                {resultats.manquantComparaison && (
                  <p className="cs-hint mt-3">
                    {resultats.manquantComparaison} L’encart de la fiche commerciale sera mis à jour dès que ce champ sera rempli.
                  </p>
                )}
                {resultats.erreurComparaison && (
                  <p className="mt-3 text-[12.5px] font-medium px-3 py-2 rounded-lg" style={{ color: 'var(--cs-neg)', backgroundColor: 'var(--cs-neg-wash)' }} role="alert">
                    {resultats.erreurComparaison}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Résultats ── */}
        <div className="space-y-5 min-w-0">
          <AlerteApport alerte={alerteApport(project)} />
          {result ? (
            <>
              <div ref={refResultat} className="scroll-mt-4">
                <ResultCard
                  result={result}
                  scenarioType={scenarioType}
                  statut={statut}
                  onReessayer={() => { void enregistrerMaintenant() }}
                  onTelecharger={telecharger}
                  projectId={project.id}
                />
              </div>
              {result2 && comparaisonType && (
                <ComparisonTable
                  a={result} b={result2}
                  labelA={SCENARIO_LABELS[scenarioType]} labelB={SCENARIO_LABELS[comparaisonType]}
                />
              )}
            </>
          ) : (
            <div className="cs-card flex flex-col items-center justify-center text-center px-8 py-16" style={{ boxShadow: 'none', borderStyle: 'dashed' }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--cs-stone)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--cs-navy)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h2M14 10h2M8 14h2M14 14h2M8 18h2M14 18h2"/></svg>
              </div>
              <p className="cs-h3">Aucun résultat pour l’instant</p>
              <p className="cs-sub mt-1 max-w-[34ch]">
                Renseignez le loyer du scénario : les résultats s’affichent au fil de la saisie et sont enregistrés automatiquement. Les fiches se téléchargent ensuite d’ici.
              </p>
            </div>
          )}
        </div>
      </div>

      {result && (
        <ProjectionChart
          conservateur={result.projectionConservateur}
          realiste={result.projectionRealiste}
          isComptant={result.isComptant}
        />
      )}

      <ResultatFlottant
        cible={refResultat}
        libelle={SCENARIO_LABELS[scenarioType]}
        cashflow={result ? result.scenario.cashflowMensuel : null}
        rentabiliteBrute={result ? result.scenario.rentabiliteBrutePct : null}
        statut={statut}
      />
    </section>
  )
}

// ─── Composants utilitaires ───────────────────────────────────────────────────

function ScenarioFieldsInputs({ prefix, type, fields, setField, large = false }: {
  prefix: string
  type: TypeScenario
  fields: ScenarioFields
  setField: <K extends keyof ScenarioFields>(k: K, v: ScenarioFields[K]) => void
  large?: boolean
}) {
  const num = (k: keyof ScenarioFields) => (v: number | '') => setField(k, v)
  return (
    <div className="mt-[18px] grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-3.5">
      {type === 'lmnp_meuble' && (
        <NumField id={`${prefix}-loyer`} label="Loyer mensuel estimé" unit="€" value={fields.loyerMensuel} onChange={num('loyerMensuel')} full large={large} />
      )}

      {type === 'colocation' && (
        <>
          <NumField id={`${prefix}-chambres`} label="Nombre de chambres" value={fields.nbChambres} onChange={num('nbChambres')} min={1} max={10} />
          <NumField id={`${prefix}-loyer-chambre`} label="Loyer par chambre" unit="€" value={fields.loyerParChambre} onChange={num('loyerParChambre')} />
        </>
      )}

      {type === 'courte_duree' && (
        <>
          <NumField
            id={`${prefix}-nuit`} label="Prix par nuit" unit="€" value={fields.prixNuitee} onChange={num('prixNuitee')} full large={large}
            hint="Tarif affiché aux voyageurs, avant commission de conciergerie."
          />
          <NumField id={`${prefix}-nuits-cons`} label="Nuits / mois (prudent)" value={fields.nuitsConservateur} onChange={num('nuitsConservateur')} />
          <NumField id={`${prefix}-nuits-opti`} label="Nuits / mois (optimiste)" value={fields.nuitsOptimiste} onChange={num('nuitsOptimiste')} />
          <NumField id={`${prefix}-conciergerie`} label="Conciergerie" unit="%" value={fields.conciergeriePct} onChange={num('conciergeriePct')} max={50} full />
        </>
      )}

      {type !== 'courte_duree' && (
        <>
          <NumField id={`${prefix}-vacance`} label="Vacance locative" unit="%" value={fields.vacancePct} onChange={num('vacancePct')} max={100} />
          <NumField id={`${prefix}-gestion`} label="Gestion locative" unit="%" value={fields.fraisGestionPct} onChange={num('fraisGestionPct')} max={30} />
        </>
      )}
    </div>
  )
}

function ResultCard({ result, scenarioType, statut, onReessayer, onTelecharger, projectId }: {
  result: any
  scenarioType: TypeScenario
  statut: StatutEnregistrement
  onReessayer: () => void
  onTelecharger: (e: React.MouseEvent<HTMLAnchorElement>) => void
  projectId: string
}) {
  const s = result.scenario
  const cashflow: number = s.cashflowMensuel
  const positif = cashflow >= 0
  const revenus = Math.round(s.revenusAnnuelsNets / 12)
  const charges = Math.round(s.chargesAnnuelles / 12)
  const mensualite = result.isComptant ? 0 : result.mensualiteTotale
  const sorties = charges + mensualite
  const couverture = sorties > 0 ? revenus / sorties : 1
  const couverturePct = Math.round(couverture * 100)

  return (
    <div className="cs-card">
      <div className="flex items-center justify-between gap-3 flex-wrap px-[22px] py-[18px] border-b cs-divider">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.06em] px-2.5 py-1 rounded-md text-white" style={{ backgroundColor: 'var(--cs-navy)' }}>
            {SCENARIO_LABELS[scenarioType]}
          </span>
          <h3 className="cs-h3">Résultat mensuel</h3>
        </div>
        <IndicateurEnregistrement statut={statut} onReessayer={onReessayer} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1.25fr_1fr]">
        <div className="px-[22px] py-6">
          <p className="cs-label">Cash-flow mensuel</p>
          <p className="mt-1.5 flex items-baseline gap-2 tabular-nums">
            <span className="text-[40px] leading-none font-extrabold tracking-[-0.02em]" style={{ color: positif ? 'var(--cs-pos)' : 'var(--cs-neg)' }}>
              {eurosSigne(cashflow).replace('+\u00a0', '+')}
            </span>
            <span className="text-[15px] font-semibold" style={{ color: 'var(--cs-mist)' }}>/ mois</span>
          </p>
          <p
            className="inline-flex mt-3 px-2.5 py-1 rounded-full text-[12px] font-semibold"
            style={positif
              ? { backgroundColor: 'var(--cs-pos-wash)', color: 'var(--cs-pos)' }
              : { backgroundColor: 'var(--cs-neg-wash)', color: 'var(--cs-neg)' }}
          >
            {positif
              ? `Excédent de ${euros(cashflow * 12)} par an`
              : `Effort d'épargne de ${euros(-cashflow * 12)} par an`}
          </p>
          {scenarioType === 'courte_duree' && s.cashflowOptimiste !== undefined && (
            <p className="cs-hint mt-2.5">Hypothèse optimiste : {eurosSigne(s.cashflowOptimiste)} / mois</p>
          )}
        </div>
        <div className="border-t sm:border-t-0 sm:border-l cs-divider">
          <Kpi label="Rentabilité brute" value={pct(s.rentabiliteBrutePct)} />
          <Kpi label="Rentabilité nette" value={pct(s.rentabiliteNettePct)} />
          <Kpi label="Mensualité" value={result.isComptant ? 'Comptant' : euros(result.mensualiteTotale)} />
        </div>
      </div>

      <div className="px-[22px] pt-[18px] pb-5 border-t cs-divider">
        <p className="cs-label">D’où vient ce chiffre</p>
        <div className="mt-2.5">
          <div className="cs-row">
            <span>Revenus nets <span className="text-[12px] ml-1.5" style={{ color: 'var(--cs-mist)' }}>{scenarioType === 'courte_duree' ? 'après conciergerie' : 'après vacance'}</span></span>
            <span className="font-semibold" style={{ color: 'var(--cs-navy)' }}>{eurosSigne(revenus)}</span>
          </div>
          <div className="cs-row">
            <span>Charges courantes <span className="text-[12px] ml-1.5" style={{ color: 'var(--cs-mist)' }}>taxe foncière, copro, assurance…</span></span>
            <span className="font-semibold" style={{ color: 'var(--cs-navy)' }}>{eurosSigne(-charges)}</span>
          </div>
          {!result.isComptant && (
            <div className="cs-row">
              <span>Mensualité du crédit <span className="text-[12px] ml-1.5" style={{ color: 'var(--cs-mist)' }}>{euros(result.capitalEmprunte)} empruntés</span></span>
              <span className="font-semibold" style={{ color: 'var(--cs-navy)' }}>{eurosSigne(-result.mensualiteTotale)}</span>
            </div>
          )}
          <div className="cs-row pt-3 font-bold">
            <span>Cash-flow mensuel</span>
            <span className="text-[15px]" style={{ color: positif ? 'var(--cs-pos)' : 'var(--cs-neg)' }}>{eurosSigne(cashflow)}</span>
          </div>
        </div>

        {sorties > 0 && (
          <>
            <div className="mt-3.5 flex h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--cs-stone)' }} aria-hidden="true">
              <i className="block h-full" style={{ width: `${Math.min(couverturePct, 100)}%`, backgroundColor: 'var(--cs-navy)' }} />
            </div>
            <p className="mt-2 text-[11.5px]" style={{ color: 'var(--cs-mist)' }}>
              {couverture >= 1
                ? `Les loyers couvrent toutes les sorties (${couverturePct}\u00a0%).`
                : `Le loyer couvre ${couverturePct}\u00a0% des sorties, le client complète de ${euros(-cashflow)} par mois.`}
            </p>
          </>
        )}
      </div>

      <BoutonsDocuments projectId={projectId} onTelecharger={onTelecharger} />
    </div>
  )
}

function ComparisonTable({ a, b, labelA, labelB }: { a: any; b: any; labelA: string; labelB: string }) {
  // plusHaut : sens favorable de l'écart (un cash-flow plus haut est mieux, des charges plus hautes non)
  const rows: { label: string; va: number; vb: number; fmt: (n: number) => string; ecart: (d: number) => string; plusHaut: boolean }[] = [
    { label: 'Cash-flow mensuel', va: a.scenario.cashflowMensuel, vb: b.scenario.cashflowMensuel, fmt: euros, ecart: (d) => eurosSigne(d), plusHaut: true },
    { label: 'Revenus nets / mois', va: Math.round(a.scenario.revenusAnnuelsNets / 12), vb: Math.round(b.scenario.revenusAnnuelsNets / 12), fmt: euros, ecart: (d) => eurosSigne(d), plusHaut: true },
    { label: 'Charges / mois', va: Math.round(a.scenario.chargesAnnuelles / 12), vb: Math.round(b.scenario.chargesAnnuelles / 12), fmt: euros, ecart: (d) => eurosSigne(d), plusHaut: false },
    { label: 'Rentabilité brute', va: a.scenario.rentabiliteBrutePct, vb: b.scenario.rentabiliteBrutePct, fmt: (n) => pct(n), ecart: (d) => `${d >= 0 ? '+' : '−'}${Math.abs(d).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} pt`, plusHaut: true },
    { label: 'Rentabilité nette', va: a.scenario.rentabiliteNettePct, vb: b.scenario.rentabiliteNettePct, fmt: (n) => pct(n), ecart: (d) => `${d >= 0 ? '+' : '−'}${Math.abs(d).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} pt`, plusHaut: true },
  ]

  return (
    <div className="cs-card overflow-hidden">
      <div className="flex items-center justify-between gap-3 flex-wrap px-[22px] py-[18px] border-b cs-divider">
        <h3 className="cs-h3">Comparaison des scénarios</h3>
        <span className="cs-sub">Écart de {labelB.toLowerCase()} par rapport au scénario principal</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[13.5px] tabular-nums">
          <thead>
            <tr style={{ backgroundColor: '#FBFAF7' }}>
              <th className="pl-4 pr-2 sm:px-[22px] py-3" />
              <th className="cs-label px-2 sm:px-[22px] py-3 text-right" style={{ color: 'var(--cs-navy)' }}>{labelA}</th>
              <th className="cs-label pl-2 pr-4 sm:px-[22px] py-3 text-right">{labelB}</th>
              <th className="cs-label hidden sm:table-cell px-[22px] py-3 text-right">Écart</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const d = Math.round((r.vb - r.va) * 100) / 100
              const favorable = r.plusHaut ? d >= 0 : d <= 0
              const isCashflow = r.label === 'Cash-flow mensuel'
              const ecart = d === 0 ? (
                <span style={{ color: 'var(--cs-mist)' }}>=</span>
              ) : (
                <span
                  className="inline-block min-w-[64px] px-2 py-0.5 rounded-md text-[12px] font-bold text-center"
                  style={favorable
                    ? { backgroundColor: 'var(--cs-pos-wash)', color: 'var(--cs-pos)' }
                    : { backgroundColor: 'var(--cs-neg-wash)', color: 'var(--cs-neg)' }}
                >
                  {r.ecart(d)}
                </span>
              )
              return (
                <tr key={r.label} className="border-t cs-divider">
                  <td className="pl-4 pr-2 sm:px-[22px] py-3 align-top sm:align-middle font-medium" style={{ color: 'var(--cs-ink)' }}>{r.label}</td>
                  <td className="px-2 sm:px-[22px] py-3 text-right align-top sm:align-middle font-semibold whitespace-nowrap" style={{ color: isCashflow && r.va < 0 ? 'var(--cs-neg)' : 'var(--cs-navy)' }}>{r.fmt(r.va)}</td>
                  <td className="pl-2 pr-4 sm:px-[22px] py-3 text-right align-top sm:align-middle font-semibold whitespace-nowrap" style={{ color: isCashflow && r.vb < 0 ? 'var(--cs-neg)' : 'var(--cs-navy)' }}>
                    {r.fmt(r.vb)}
                    {/* Téléphone : l'écart passe sous la valeur comparée, faute de place pour sa colonne */}
                    <span className="block mt-1 sm:hidden">{ecart}</span>
                  </td>
                  <td className="hidden sm:table-cell px-[22px] py-3 text-right">{ecart}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
