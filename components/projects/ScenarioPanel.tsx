'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { calculerScenario } from '@/lib/calculs/index'
import { updateProjectScenario } from '@/lib/supabase/projects'
import ProjectionChart from './ProjectionChart'

type TypeScenario = 'lmnp_meuble' | 'colocation' | 'courte_duree'

const SCENARIOS: { id: TypeScenario; label: string }[] = [
  { id: 'lmnp_meuble',  label: 'LMNP Meublé' },
  { id: 'colocation',   label: 'Colocation' },
  { id: 'courte_duree', label: 'Courte durée' },
]

function euros(n: number) {
  return n?.toLocaleString('fr-FR') + ' €'
}

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

const SCENARIO_LABELS: Record<TypeScenario, string> = {
  lmnp_meuble: 'LMNP Meublé', colocation: 'Colocation', courte_duree: 'Courte durée',
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

  const [result, setResult]   = useState<any>(null)
  const [result2, setResult2] = useState<any>(null)
  const [error, setError]     = useState<string | null>(null)
  const [saved, setSaved]     = useState(false)

  useEffect(() => {
    if (!saved) return
    const t = setTimeout(() => setSaved(false), 2500)
    return () => clearTimeout(t)
  }, [saved])

  const setField = <K extends keyof ScenarioFields>(k: K, v: ScenarioFields[K]) =>
    setFields((prev) => ({ ...prev, [k]: v }))
  const setComparaisonField = <K extends keyof ScenarioFields>(k: K, v: ScenarioFields[K]) =>
    setComparaisonFields((prev) => ({ ...prev, [k]: v }))

  const otherTypes = SCENARIOS.filter((s) => s.id !== scenarioType)

  const handleChangeScenarioType = (type: TypeScenario) => {
    setScenarioType(type)
    setFields((prev) => ({ ...prev, vacancePct: type === 'colocation' ? 8 : 5 }))
    setResult(null)
    setError(null)
    // Le scénario de comparaison ne peut pas être identique au scénario principal
    if (comparaisonType === type) {
      setComparaisonType(SCENARIOS.find((s) => s.id !== type)?.id ?? null)
    }
  }

  // ─── Données projet → format moteur ───────────────────────────────────────

  const projetData = {
    prixAchat:          project.prix_achat,
    fraisNotairePct:    project.frais_notaire_pct,
    travaux:            project.travaux || 0,
    mobilier:           project.mobilier || 0,
    honorairesCapsul:   project.honoraires_capsul || 0,
    honorairesOverride: project.honoraires_override,
    autresFrais:        project.autres_frais || 0,
    fraisAgence:        project.frais_agence || undefined,
  }

  const financementData = {
    apport:                project.apport || 0,
    dureeAnnees:           project.duree_annees || 20,
    tauxInteretPct:        project.taux_interet_pct || 0,
    tauxAssurancePct:      project.taux_assurance_pct || 0,
    isComptantOverride:    project.is_comptant ?? false,
  }

  const chargesData = {
    taxeFonciere:             project.taxe_fonciere || 0,
    chargesCoproAnnuelles:    project.charges_copro_annuelles || 0,
    assurancePno:             project.assurance_pno || 0,
    electriciteEau:           project.electricite_eau || 0,
    internet:                 project.internet || 0,
    chauffage:                project.chauffage || 0,
    fraisComptabilite:        project.frais_comptabilite || 0,
    autresCharges:            project.autres_charges || 0,
    cfe:                      project.cfe ?? 300,
  }

  // ─── Calcul ───────────────────────────────────────────────────────────────

  const handleCalculer = () => {
    setError(null)
    const primary = buildScenarioInput(scenarioType, fields, chargesData)
    if ('error' in primary) { setError(primary.error); return }

    let r2: any = null
    let comparaisonParams: Record<string, number> | null = null
    if (comparaisonActive && comparaisonType) {
      const comp = buildScenarioInput(comparaisonType, comparaisonFields, chargesData)
      if ('error' in comp) { setError(`Pour la comparaison : ${comp.error.charAt(0).toLowerCase()}${comp.error.slice(1)}`); return }
      comparaisonParams = comp.input.params
      try {
        r2 = calculerScenario(projetData, financementData, chargesData, comp.input as any)
      } catch (err: any) {
        setError(err?.message ?? 'Erreur de calcul (comparaison).')
        return
      }
    }

    try {
      const r = calculerScenario(projetData, financementData, chargesData, primary.input as any)
      setResult(r)
      setResult2(r2)
      setSaved(false)

      const loyerCible =
        scenarioType === 'lmnp_meuble' ? Number(fields.loyerMensuel) :
        scenarioType === 'colocation'  ? Number(fields.loyerParChambre) :
                                         Number(fields.prixNuitee)

      updateProjectScenario(project.id, loyerCible, scenarioType, {
        fraisGestionPct: Number(fields.fraisGestionPct) || 0,
        conciergePct: Number(fields.conciergeriePct) || 0,
        vacancePct: Number(fields.vacancePct) || 0,
        nuitsConservateur: Number(fields.nuitsConservateur) || 0,
        nuitsOptimiste: Number(fields.nuitsOptimiste) || 0,
        nbChambres: Number(fields.nbChambres) || 1,
        scenarioComparaisonType: comparaisonActive ? comparaisonType : null,
        scenarioComparaisonData: comparaisonActive ? comparaisonParams : null,
      }).then(() => setSaved(true))

    } catch (err: any) {
      setError(err?.message ?? 'Erreur de calcul.')
      console.error(err)
    }
  }

  // ─── Rendu ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Sélection scénario principal */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold mb-4">Simuler un scénario</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          <div className="space-y-1.5">
            <Label>Type de location</Label>
            <div className="flex flex-col gap-1.5 mt-1">
              {SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleChangeScenarioType(s.id)}
                  className={`px-3 py-2 rounded-lg text-sm border text-left transition ${
                    scenarioType === s.id
                      ? 'bg-foreground text-background border-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <ScenarioFieldsInputs type={scenarioType} fields={fields} setField={setField} />

          <div className="flex flex-col justify-end gap-3">
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              onClick={handleCalculer}
              className="w-full px-4 py-2.5 rounded-lg bg-foreground text-background
                         text-sm font-medium hover:opacity-90 transition"
            >
              Calculer
            </button>
          </div>

        </div>
      </div>

      {/* Comparaison avec un autre scénario */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Comparer avec un autre scénario</h2>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Activer</span>
            <Switch checked={comparaisonActive} onCheckedChange={setComparaisonActive} />
          </div>
        </div>

        {comparaisonActive && comparaisonType && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <Label>Type de location</Label>
              <div className="flex flex-col gap-1.5 mt-1">
                {otherTypes.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => { setComparaisonType(s.id); setResult2(null) }}
                    className={`px-3 py-2 rounded-lg text-sm border text-left transition ${
                      comparaisonType === s.id
                        ? 'bg-foreground text-background border-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <ScenarioFieldsInputs type={comparaisonType} fields={comparaisonFields} setField={setComparaisonField} />
          </div>
        )}

        {!comparaisonActive && (
          <p className="text-sm text-muted-foreground">
            Pratique pour montrer au client deux options côte à côte, par exemple courte durée et LMNP meublé.
            Chaque scénario garde ses propres chiffres, remplir l'un n'efface jamais l'autre.
          </p>
        )}
      </div>

      {/* Résultats */}
      {result && (
        <>
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Résultats — {SCENARIO_LABELS[scenarioType]}</h2>
              <div className="flex items-center gap-3">
                {saved && (
                  <span className="text-xs text-muted-foreground">Scénario sauvegardé</span>
                )}
                <a
                  href={`/api/projets/${project.id}/rapport`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-muted transition"
                >
                  Rapport analytique
                </a>
                <a
                  href={`/api/projets/${project.id}/fiche`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition"
                >
                  Fiche commerciale
                </a>
              </div>
            </div>
            <ResultsGrid result={result} />
          </div>

          {result2 && comparaisonType && (
            <div className="rounded-xl border bg-card p-6" style={{ borderStyle: 'dashed' }}>
              <h2 className="font-semibold mb-4 text-muted-foreground">
                Comparaison — {SCENARIO_LABELS[comparaisonType]}
              </h2>
              <ResultsGrid result={result2} />
            </div>
          )}

          <ProjectionChart
            conservateur={result.projectionConservateur}
            realiste={result.projectionRealiste}
            isComptant={result.isComptant}
          />
        </>
      )}
    </div>
  )
}

// ─── Composants utilitaires ───────────────────────────────────────────────────

function ScenarioFieldsInputs({ type, fields, setField }: {
  type: TypeScenario
  fields: ScenarioFields
  setField: <K extends keyof ScenarioFields>(k: K, v: ScenarioFields[K]) => void
}) {
  return (
    <div className="space-y-3">
      {type === 'lmnp_meuble' && (
        <EuroField id="loyer" label="Loyer mensuel estimé" value={fields.loyerMensuel}
          onChange={(v) => setField('loyerMensuel', v)} />
      )}

      {type === 'colocation' && (
        <>
          <div className="space-y-1.5">
            <Label>Nombre de chambres</Label>
            <Input
              type="number" min={1} max={10}
              value={fields.nbChambres}
              onChange={(e) => setField('nbChambres', e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>
          <EuroField id="loyerChambre" label="Loyer / chambre" value={fields.loyerParChambre}
            onChange={(v) => setField('loyerParChambre', v)} />
        </>
      )}

      {type === 'courte_duree' && (
        <>
          <EuroField id="prixNuit" label="Prix par nuit" value={fields.prixNuitee}
            onChange={(v) => setField('prixNuitee', v)} />
          <div className="space-y-1.5">
            <Label>Nuits/mois conservateur</Label>
            <Input type="number" min={0} value={fields.nuitsConservateur}
              onChange={(e) => setField('nuitsConservateur', e.target.value === '' ? '' : Number(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label>Nuits/mois optimiste</Label>
            <Input type="number" min={0} value={fields.nuitsOptimiste}
              onChange={(e) => setField('nuitsOptimiste', e.target.value === '' ? '' : Number(e.target.value))} />
          </div>
        </>
      )}

      {type !== 'courte_duree' && (
        <div className="space-y-1.5">
          <Label>Vacance locative (%)</Label>
          <Input type="number" min={0} max={100} value={fields.vacancePct}
            onChange={(e) => setField('vacancePct', e.target.value === '' ? '' : Number(e.target.value))} />
        </div>
      )}

      {type !== 'courte_duree' && (
        <div className="space-y-1.5">
          <Label>Frais de gestion locative (%)</Label>
          <div className="relative">
            <Input type="number" min={0} max={30} value={fields.fraisGestionPct} className="pr-8"
              onChange={(e) => setField('fraisGestionPct', e.target.value === '' ? '' : Number(e.target.value))} />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
          </div>
        </div>
      )}

      {type === 'courte_duree' && (
        <div className="space-y-1.5">
          <Label>Conciergerie (%)</Label>
          <div className="relative">
            <Input type="number" min={0} max={50} value={fields.conciergeriePct} className="pr-8"
              onChange={(e) => setField('conciergeriePct', e.target.value === '' ? '' : Number(e.target.value))} />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
          </div>
        </div>
      )}
    </div>
  )
}

function EuroField({ id, label, value, onChange }: {
  id: string
  label: string
  value: number | ''
  onChange: (v: number | '') => void
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id} type="number" min={0} value={value} className="pr-8"
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
      </div>
    </div>
  )
}

function ResultsGrid({ result }: { result: any }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      <Metric label="Prix projet total"   value={euros(result.prixProjetTotal)} />
      {result.isComptant ? (
        <div className="col-span-2">
          <span
            className="inline-block px-2 py-1 rounded-md text-[11px] font-semibold"
            style={{ backgroundColor: '#EDE9E1', color: '#0E2240' }}
          >
            Achat comptant, aucun crédit
          </span>
        </div>
      ) : (
        <>
          <Metric label="Capital emprunté" value={euros(result.capitalEmprunte)} />
          <Metric label="Mensualité"       value={euros(result.mensualiteTotale)} />
        </>
      )}
      <Metric label="Revenus nets/mois"   value={euros(Math.round(result.scenario.revenusAnnuelsNets / 12))} />
      <Metric label="Charges/mois"        value={euros(Math.round(result.scenario.chargesAnnuelles / 12))} />
      <Metric
        label="Cash-flow mensuel"
        value={euros(result.scenario.cashflowMensuel)}
        highlight={result.scenario.cashflowMensuel >= 0 ? 'green' : 'red'}
      />
      <Metric label="Rentabilité brute"   value={`${result.scenario.rentabiliteBrutePct?.toFixed(2)} %`} />
      <Metric label="Rentabilité nette"   value={`${result.scenario.rentabiliteNettePct?.toFixed(2)} %`} />
    </div>
  )
}

function Metric({ label, value, highlight }: {
  label: string
  value: string
  highlight?: 'green' | 'red'
}) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-sm tabular-nums font-semibold ${
        highlight === 'green' ? 'text-green-600' :
        highlight === 'red'   ? 'text-red-500'   : ''
      }`}>
        {value}
      </p>
    </div>
  )
}
