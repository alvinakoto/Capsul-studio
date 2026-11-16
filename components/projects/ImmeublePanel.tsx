'use client'

import { useCallback, useMemo, useState } from 'react'
import { ChevronDownIcon } from 'lucide-react'
import ProjectionChart from './ProjectionChart'
import AlerteApport from './AlerteApport'
import { BoutonsDocuments, IndicateurEnregistrement, Kpi, NumField, Toggle, useEnregistrementAuto } from './simulateur'
import { alerteApport, calculerProjetImmeuble, donneesCharges, resoudreExploitation } from '@/lib/calculs/depuisProjet'
import { calculerExploitationLot, fluxMensuelsImmeuble } from '@/lib/calculs/immeuble'
import type { ResultatsImmeuble, TypeScenario } from '@/lib/calculs/types'
import {
  libelleLot,
  type ExploitationSaisie, type ImmeubleSaisie, type LotImmeuble, type ParametresCommuns,
} from '@/lib/data/immeuble'
import { updateProjectImmeuble } from '@/lib/supabase/projects'
import { euros, eurosSigne, pct } from '@/lib/utils/format'

// Simulateur d'un immeuble : une exploitation par lot (et une comparaison
// facultative), des paramètres communs, un seul crédit. Calcul en direct et
// enregistrement automatique, comme le simulateur d'un bien simple.

const TYPES: { id: TypeScenario; label: string }[] = [
  { id: 'lmnp_meuble', label: 'Meublé' },
  { id: 'colocation', label: 'Colocation' },
  { id: 'courte_duree', label: 'Courte durée' },
]
const LABEL: Record<TypeScenario, string> = { lmnp_meuble: 'Meublé', colocation: 'Colocation', courte_duree: 'Courte durée' }

const sansCharges = { electriciteEau: 0, internet: 0, chauffage: 0 }

export default function ImmeublePanel({ project, immeubleInitial }: { project: any; immeubleInitial: ImmeubleSaisie }) {
  const [immeuble, setImmeuble] = useState<ImmeubleSaisie>(immeubleInitial)
  // Lots dépliés à l'ouverture : ceux qui restent à chiffrer, sinon le premier
  const [ouverts, setOuverts] = useState<Set<string>>(() => {
    const aChiffrer = immeubleInitial.lots.filter((l) => !l.exploitation || 'manquant' in resoudreExploitation(l.exploitation, immeubleInitial.parametres))
    return new Set((aChiffrer.length ? aChiffrer : immeubleInitial.lots.slice(0, 1)).map((l) => l.id))
  })

  // Les résultats suivent la saisie : ce qui est affiché est ce qui sortira dans le PDF.
  const calcul = useMemo(() => calculerProjetImmeuble({ ...project, immeuble }), [project, immeuble])
  const resultats = calcul?.resultats ?? null
  const manquants = calcul?.manquants ?? []
  const fluidesProjet = (Number(project.electricite_eau) || 0) + (Number(project.internet) || 0) + (Number(project.chauffage) || 0)
  const flux = resultats
    ? fluxMensuelsImmeuble(resultats, donneesCharges(project), immeuble.chargesPropres === 'global' ? fluidesProjet : 0)
    : null

  // ─── Enregistrement automatique ─────────────────────────────────────────────
  const payload = useMemo(() => ({ immeuble, complet: !!resultats }), [immeuble, resultats])
  const enregistrer = useCallback(
    (p: { immeuble: ImmeubleSaisie; complet: boolean }) => updateProjectImmeuble(project.id, p.immeuble, p.complet),
    [project.id],
  )
  const { statut, enregistrerMaintenant, telecharger } = useEnregistrementAuto(payload, enregistrer)

  const modifierLot = (id: string, champs: Partial<LotImmeuble>) =>
    setImmeuble((prev) => ({ ...prev, lots: prev.lots.map((l) => (l.id === id ? { ...l, ...champs } : l)) }))
  const setParametre = (k: keyof ParametresCommuns) => (v: number | '') =>
    setImmeuble((prev) => ({ ...prev, parametres: { ...prev.parametres, [k]: v === '' ? 0 : v } }))
  const basculer = (id: string) => setOuverts((prev) => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })
  const ouvrirLot = (id: string) => {
    setOuverts((prev) => new Set(prev).add(id))
    requestAnimationFrame(() => document.getElementById(`lot-carte-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  // Net mensuel de chaque lot : celui des flux affichés quand l'immeuble est complet
  // (la colonne tombe juste sur le total), sinon le résultat du lot seul.
  const netLot = (lot: LotImmeuble, i: number): number | null => {
    if (flux) return flux.lots[i].net
    if (!lot.exploitation) return null
    const r = resoudreExploitation(lot.exploitation, immeuble.parametres)
    if ('manquant' in r) return null
    const charges = immeuble.chargesPropres === 'par_lot' ? (lot.chargesPropres ?? sansCharges) : sansCharges
    return Math.round(calculerExploitationLot(r.scenario, charges).resultatAnnuel / 12)
  }

  return (
    <section className="space-y-5">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h2 className="cs-h2">Simulation</h2>
        <p className="text-[13px]" style={{ color: 'var(--cs-mist)' }}>
          {`Immeuble de ${immeuble.lots.length} lots, un seul crédit. Tous les montants sont avant impôt.`}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[5fr_7fr] gap-5 items-start">

        {/* ── Paramètres ── */}
        <div className="space-y-4 min-w-0">
          <div className="cs-card p-[22px]">
            <h3 className="cs-h3">Paramètres communs</h3>
            <p className="cs-sub mt-0.5">Valables pour tous les lots, sauf si un lot les précise.</p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-3.5">
              <NumField id="pc-vacance-meuble" label="Vacance, meublé" unit="%" max={100} value={immeuble.parametres.vacanceMeublePct} onChange={setParametre('vacanceMeublePct')} />
              <NumField id="pc-vacance-coloc" label="Vacance, colocation" unit="%" max={100} value={immeuble.parametres.vacanceColocationPct} onChange={setParametre('vacanceColocationPct')} />
              <NumField id="pc-gestion" label="Gestion locative" unit="%" max={30} value={immeuble.parametres.fraisGestionPct} onChange={setParametre('fraisGestionPct')} />
              <NumField id="pc-conciergerie" label="Conciergerie" unit="%" max={50} value={immeuble.parametres.conciergeriePct} onChange={setParametre('conciergeriePct')} />
            </div>

            <div className="mt-5 pt-4 border-t cs-divider">
              <p className="cs-field-label" id="pc-charges-label">Électricité, internet, chauffage</p>
              <div className="cs-seg mt-2" role="group" aria-labelledby="pc-charges-label">
                <button type="button" aria-pressed={immeuble.chargesPropres === 'global'} onClick={() => setImmeuble((p) => ({ ...p, chargesPropres: 'global' }))}>
                  Global pour l’immeuble
                </button>
                <button type="button" aria-pressed={immeuble.chargesPropres === 'par_lot'} onClick={() => setImmeuble((p) => ({ ...p, chargesPropres: 'par_lot' }))}>
                  Par lot
                </button>
              </div>
              <p className="cs-hint mt-2">
                {immeuble.chargesPropres === 'global'
                  ? `${euros(fluidesProjet)} par an saisis à l’étape Charges, comptés dans les charges de l’immeuble.`
                  : 'Saisies dans chaque lot en colocation ou en courte durée. En meublé, le locataire les paie.'}
              </p>
            </div>
          </div>

          {immeuble.lots.map((lot, i) => (
            <LotCarte
              key={lot.id}
              lot={lot}
              index={i}
              immeuble={immeuble}
              net={netLot(lot, i)}
              effetAlternative={resultats?.lots[i]?.alternative?.effetCashflowMensuel ?? null}
              ouvert={ouverts.has(lot.id)}
              onBasculer={() => basculer(lot.id)}
              onChange={(champs) => modifierLot(lot.id, champs)}
            />
          ))}
        </div>

        {/* ── Résultats ── */}
        <div className="space-y-5 min-w-0">
          <AlerteApport alerte={alerteApport(project)} />

          <div className="cs-card">
            <div className="flex items-center justify-between gap-3 flex-wrap px-[22px] py-[18px] border-b cs-divider">
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.06em] px-2.5 py-1 rounded-md text-white" style={{ backgroundColor: 'var(--cs-navy)' }}>
                  {`Immeuble · ${immeuble.lots.length} lots`}
                </span>
                <h3 className="cs-h3">Résultat mensuel</h3>
              </div>
              <IndicateurEnregistrement statut={statut} onReessayer={() => { void enregistrerMaintenant() }} />
            </div>

            {resultats && flux ? (
              <ResultatImmeuble resultats={resultats} flux={flux} nbLots={immeuble.lots.length} />
            ) : (
              <div className="px-[22px] py-6">
                <p className="cs-h3">Encore quelques chiffres</p>
                <p className="cs-sub mt-1">Le résultat de l’immeuble s’affiche dès que chaque lot est chiffré :</p>
                <ul className="mt-3 space-y-1.5">
                  {manquants.map((m, k) => {
                    const lot = immeuble.lots.find((l, i) => m.startsWith(`${libelleLot(l, i)} :`))
                    return (
                      <li key={k}>
                        <button
                          type="button"
                          onClick={() => lot && ouvrirLot(lot.id)}
                          className="text-left text-[13px] font-medium underline decoration-[var(--cs-gold)] underline-offset-[3px]"
                          style={{ color: 'var(--cs-navy)' }}
                        >
                          {m}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            <BoutonsDocuments projectId={project.id} onTelecharger={telecharger} />
          </div>

          {resultats && flux && (
            <TableauLots immeuble={immeuble} flux={flux} effets={resultats.lots.map((l) => l.alternative?.effetCashflowMensuel ?? null)} />
          )}
        </div>
      </div>

      {resultats && (
        <ProjectionChart
          conservateur={resultats.projectionConservateur}
          realiste={resultats.projectionRealiste}
          isComptant={resultats.isComptant}
        />
      )}
    </section>
  )
}

// ─── Un lot ───────────────────────────────────────────────────────────────────

function LotCarte({ lot, index, immeuble, net, effetAlternative, ouvert, onBasculer, onChange }: {
  lot: LotImmeuble
  index: number
  immeuble: ImmeubleSaisie
  net: number | null
  effetAlternative: number | null
  ouvert: boolean
  onBasculer: () => void
  onChange: (champs: Partial<LotImmeuble>) => void
}) {
  const nom = libelleLot(lot, index)
  const exploitation = lot.exploitation ?? { type: 'lmnp_meuble' as TypeScenario }
  const type = exploitation.type
  const chargesParLot = immeuble.chargesPropres === 'par_lot'
  const charges = lot.chargesPropres ?? sansCharges
  const setCharge = (k: keyof typeof charges) => (v: number | '') =>
    onChange({ chargesPropres: { ...charges, [k]: v === '' ? 0 : v } })

  const autresTypes = TYPES.filter((t) => t.id !== type)
  const changerType = (t: TypeScenario) => onChange({
    exploitation: { ...exploitation, type: t },
    // La comparaison ne peut pas reprendre l'exploitation retenue : elles s'échangent
    ...(lot.comparaison?.type === t && { comparaison: { ...lot.comparaison, type } }),
  })

  const panneauId = `lot-panneau-${lot.id}`
  return (
    <div id={`lot-carte-${lot.id}`} className="cs-card overflow-hidden scroll-mt-6">
      <button
        type="button"
        onClick={onBasculer}
        aria-expanded={ouvert}
        aria-controls={panneauId}
        className="flex w-full items-center justify-between gap-3 px-[22px] py-4 text-left transition-colors hover:bg-[#FBFAF7]"
      >
        <span className="min-w-0">
          <span className="block text-[14px] font-bold" style={{ color: 'var(--cs-navy)' }}>{nom}</span>
          <span className="block cs-hint mt-0.5">
            {[lot.typeBien, lot.surfaceM2 ? `${lot.surfaceM2}\u00a0m²` : null, LABEL[type]].filter(Boolean).join(' · ')}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-3">
          {net !== null ? (
            <span className="text-[14px] font-bold tabular-nums" style={{ color: 'var(--cs-navy)' }}>
              {euros(net)}<span className="text-[11.5px] font-medium" style={{ color: 'var(--cs-mist)' }}> nets / mois</span>
            </span>
          ) : (
            <span className="text-[12px] font-semibold" style={{ color: 'var(--cs-gold-ink)' }}>À chiffrer</span>
          )}
          <ChevronDownIcon size={18} strokeWidth={2} className={`text-[var(--cs-mist)] transition-transform motion-reduce:transition-none ${ouvert ? 'rotate-180' : ''}`} aria-hidden="true" />
        </span>
      </button>

      {ouvert && (
        <div id={panneauId} className="border-t cs-divider px-[22px] pt-4 pb-5">
          <div className="cs-seg" role="group" aria-label={`Exploitation de ${nom}`}>
            {TYPES.map((t) => (
              <button key={t.id} type="button" aria-pressed={type === t.id} onClick={() => changerType(t.id)}>{t.label}</button>
            ))}
          </div>
          <ChampsExploitation prefix={`l${lot.id}`} exploitation={exploitation} parametres={immeuble.parametres} onChange={(e) => onChange({ exploitation: e })} />

          {chargesParLot && (type === 'lmnp_meuble' ? (
            <p className="cs-hint mt-3">En meublé, électricité, internet et chauffage sont payés par le locataire.</p>
          ) : (
            <div className="mt-4">
              <p className="cs-field-label">Charges propres au lot, par an</p>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <NumField id={`l${lot.id}-elec`} label="Électricité, eau" unit="€" value={charges.electriciteEau || ''} placeholder="0" onChange={setCharge('electriciteEau')} />
                <NumField id={`l${lot.id}-internet`} label="Internet" unit="€" value={charges.internet || ''} placeholder="0" onChange={setCharge('internet')} />
                <NumField id={`l${lot.id}-chauffage`} label="Chauffage" unit="€" value={charges.chauffage || ''} placeholder="0" onChange={setCharge('chauffage')} />
              </div>
            </div>
          ))}

          {/* Autre exploitation envisagée pour ce lot */}
          <div className="mt-5 pt-4 border-t cs-divider">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="cs-field-label">Comparer avec une autre exploitation</p>
                <p className="cs-hint mt-0.5">Montrée au client avec son effet sur le cash-flow de l’immeuble.</p>
              </div>
              <Toggle
                checked={!!lot.comparaison}
                onChange={(v) => onChange({ comparaison: v ? { type: autresTypes[0].id } : null })}
                label={`Comparer ${nom} avec une autre exploitation`}
              />
            </div>
            {lot.comparaison && (
              <>
                <div className="cs-seg mt-3" role="group" aria-label={`Autre exploitation de ${nom}`}>
                  {autresTypes.map((t) => (
                    <button key={t.id} type="button" aria-pressed={lot.comparaison?.type === t.id} onClick={() => onChange({ comparaison: { ...lot.comparaison, type: t.id } })}>
                      {t.label}
                    </button>
                  ))}
                </div>
                <ChampsExploitation prefix={`c${lot.id}`} exploitation={lot.comparaison} parametres={immeuble.parametres} onChange={(e) => onChange({ comparaison: e })} />
                {effetAlternative !== null && (
                  <p className="mt-3 text-[12.5px] font-semibold" style={{ color: effetAlternative >= 0 ? 'var(--cs-pos)' : 'var(--cs-neg)' }}>
                    {`${LABEL[lot.comparaison.type]} : ${eurosSigne(effetAlternative)} par mois sur le cash-flow de l’immeuble`}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/** Champs d'une exploitation. Pourcentages vides = paramètres communs (affichés en indication). */
function ChampsExploitation({ prefix, exploitation, parametres, onChange }: {
  prefix: string
  exploitation: ExploitationSaisie
  parametres: ParametresCommuns
  onChange: (e: ExploitationSaisie) => void
}) {
  const v = (k: keyof ExploitationSaisie) => (exploitation[k] as number | undefined) ?? ''
  const set = (k: keyof ExploitationSaisie) => (val: number | '') => onChange({ ...exploitation, [k]: val === '' ? undefined : val })
  const t = exploitation.type
  return (
    <>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-3.5">
        {t === 'lmnp_meuble' && (
          <NumField id={`${prefix}-loyer`} label="Loyer mensuel" unit="€" value={v('loyerMensuel')} onChange={set('loyerMensuel')} full />
        )}
        {t === 'colocation' && (
          <>
            <NumField id={`${prefix}-chambres`} label="Nombre de chambres" value={v('nbChambres')} onChange={set('nbChambres')} min={1} max={10} />
            <NumField id={`${prefix}-loyer-ch`} label="Loyer par chambre" unit="€" value={v('loyerParChambre')} onChange={set('loyerParChambre')} />
          </>
        )}
        {t === 'courte_duree' && (
          <>
            <NumField id={`${prefix}-nuit`} label="Prix par nuit" unit="€" value={v('prixNuitee')} onChange={set('prixNuitee')} full
              hint="Tarif affiché aux voyageurs, avant commission de conciergerie." />
            <NumField id={`${prefix}-nuits-p`} label="Nuits / mois (prudent)" value={v('nuitsConservateur')} placeholder="16" onChange={set('nuitsConservateur')} />
            <NumField id={`${prefix}-nuits-o`} label="Nuits / mois (optimiste)" value={v('nuitsOptimiste')} placeholder="22" onChange={set('nuitsOptimiste')} />
          </>
        )}
        {t !== 'courte_duree' ? (
          <>
            <NumField id={`${prefix}-vacance`} label="Vacance" unit="%" max={100} value={v('vacancePct')}
              placeholder={String(t === 'colocation' ? parametres.vacanceColocationPct : parametres.vacanceMeublePct)} onChange={set('vacancePct')} />
            <NumField id={`${prefix}-gestion`} label="Gestion locative" unit="%" max={30} value={v('fraisGestionPct')}
              placeholder={String(parametres.fraisGestionPct)} onChange={set('fraisGestionPct')} />
          </>
        ) : (
          <NumField id={`${prefix}-conciergerie`} label="Conciergerie" unit="%" max={50} value={v('conciergeriePct')}
            placeholder={String(parametres.conciergeriePct)} onChange={set('conciergeriePct')} full />
        )}
      </div>
      <p className="cs-hint mt-2">Pourcentages laissés vides : paramètres communs de l’immeuble.</p>
    </>
  )
}

// ─── Résultat et détail ───────────────────────────────────────────────────────

function ResultatImmeuble({ resultats, flux, nbLots }: {
  resultats: ResultatsImmeuble
  flux: ReturnType<typeof fluxMensuelsImmeuble>
  nbLots: number
}) {
  const s = resultats.scenario as typeof resultats.scenario & { cashflowOptimiste?: number }
  const cashflow = flux.cashflow
  const positif = cashflow >= 0
  const chargesImmeuble = flux.charges.reduce((n, c) => n + c.montant, 0)
  return (
    <>
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
            style={positif ? { backgroundColor: 'var(--cs-pos-wash)', color: 'var(--cs-pos)' } : { backgroundColor: 'var(--cs-neg-wash)', color: 'var(--cs-neg)' }}
          >
            {positif ? `Excédent de ${euros(cashflow * 12)} par an` : `Effort d'épargne de ${euros(-cashflow * 12)} par an`}
          </p>
          {s.cashflowOptimiste !== undefined && (
            <p className="cs-hint mt-2.5">{`Courte durée, hypothèse optimiste : ${eurosSigne(s.cashflowOptimiste)} / mois`}</p>
          )}
        </div>
        <div className="border-t sm:border-t-0 sm:border-l cs-divider">
          <Kpi label="Rentabilité brute" value={pct(s.rentabiliteBrutePct)} />
          <Kpi label="Rentabilité nette" value={pct(s.rentabiliteNettePct)} />
          <Kpi label="Mensualité" value={resultats.isComptant ? 'Comptant' : euros(resultats.mensualiteTotale)} />
        </div>
      </div>

      <div className="px-[22px] pt-[18px] pb-5 border-t cs-divider">
        <p className="cs-label">D’où vient ce chiffre</p>
        <div className="mt-2.5">
          <div className="cs-row">
            <span>{`Recettes nettes des ${nbLots} lots`} <span className="text-[12px] ml-1.5" style={{ color: 'var(--cs-mist)' }}>après vacance, frais et charges propres</span></span>
            <span className="font-semibold" style={{ color: 'var(--cs-navy)' }}>{eurosSigne(flux.recettesNettesLots)}</span>
          </div>
          <div className="cs-row">
            <span>Charges de l’immeuble <span className="text-[12px] ml-1.5" style={{ color: 'var(--cs-mist)' }}>taxe foncière, assurance…</span></span>
            <span className="font-semibold" style={{ color: 'var(--cs-navy)' }}>{eurosSigne(-chargesImmeuble)}</span>
          </div>
          {!resultats.isComptant && (
            <div className="cs-row">
              <span>Mensualité du crédit <span className="text-[12px] ml-1.5" style={{ color: 'var(--cs-mist)' }}>{`${euros(resultats.capitalEmprunte)} empruntés`}</span></span>
              <span className="font-semibold" style={{ color: 'var(--cs-navy)' }}>{eurosSigne(-flux.mensualite)}</span>
            </div>
          )}
          <div className="cs-row pt-3 font-bold">
            <span>Cash-flow mensuel</span>
            <span className="text-[15px]" style={{ color: positif ? 'var(--cs-pos)' : 'var(--cs-neg)' }}>{eurosSigne(cashflow)}</span>
          </div>
        </div>
      </div>
    </>
  )
}

function TableauLots({ immeuble, flux, effets }: {
  immeuble: ImmeubleSaisie
  flux: ReturnType<typeof fluxMensuelsImmeuble>
  effets: (number | null)[]
}) {
  const avecAlternatives = effets.some((e) => e !== null)
  return (
    <div className="cs-card overflow-hidden">
      <div className="flex items-center justify-between gap-3 flex-wrap px-[22px] py-[18px] border-b cs-divider">
        <h3 className="cs-h3">Détail par lot</h3>
        <span className="cs-sub">Montants nets, par mois</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[13.5px] tabular-nums">
          <thead>
            <tr style={{ backgroundColor: '#FBFAF7' }}>
              <th scope="col" className="cs-label px-[22px] py-3 text-left">Lot</th>
              <th scope="col" className="cs-label px-3 py-3 text-left">Exploitation</th>
              <th scope="col" className="cs-label px-3 py-3 text-right">Brut</th>
              <th scope="col" className="cs-label px-[22px] py-3 text-right">Net</th>
              {avecAlternatives && <th scope="col" className="cs-label px-[22px] py-3 text-right">Autre exploitation</th>}
            </tr>
          </thead>
          <tbody>
            {immeuble.lots.map((lot, i) => (
              <tr key={lot.id} className="border-t cs-divider">
                <th scope="row" className="px-[22px] py-3 text-left font-semibold" style={{ color: 'var(--cs-navy)' }}>
                  {libelleLot(lot, i)}
                  <span className="block text-[11.5px] font-normal" style={{ color: 'var(--cs-mist)' }}>
                    {[lot.typeBien, lot.surfaceM2 ? `${lot.surfaceM2}\u00a0m²` : null].filter(Boolean).join(' · ')}
                  </span>
                </th>
                <td className="px-3 py-3" style={{ color: 'var(--cs-ink)' }}>{lot.exploitation ? LABEL[lot.exploitation.type] : '—'}</td>
                <td className="px-3 py-3 text-right" style={{ color: 'var(--cs-mist)' }}>{euros(flux.lots[i].brut)}</td>
                <td className="px-[22px] py-3 text-right font-semibold" style={{ color: 'var(--cs-navy)' }}>{euros(flux.lots[i].net)}</td>
                {avecAlternatives && (
                  <td className="px-[22px] py-3 text-right text-[12.5px]">
                    {effets[i] !== null && lot.comparaison ? (
                      <span className="font-semibold" style={{ color: (effets[i] ?? 0) >= 0 ? 'var(--cs-pos)' : 'var(--cs-neg)' }}>
                        {`${LABEL[lot.comparaison.type]} ${eurosSigne(effets[i] ?? 0)}`}
                      </span>
                    ) : <span style={{ color: 'var(--cs-mist)' }}>—</span>}
                  </td>
                )}
              </tr>
            ))}
            <tr className="border-t-2" style={{ borderColor: 'var(--cs-navy)' }}>
              <th scope="row" colSpan={2} className="px-[22px] py-3 text-left font-bold" style={{ color: 'var(--cs-navy)' }}>Total</th>
              <td className="px-3 py-3 text-right font-semibold" style={{ color: 'var(--cs-mist)' }}>{euros(flux.lots.reduce((n, l) => n + l.brut, 0))}</td>
              <td className="px-[22px] py-3 text-right font-bold" style={{ color: 'var(--cs-navy)' }}>{euros(flux.recettesNettesLots)}</td>
              {avecAlternatives && <td />}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
