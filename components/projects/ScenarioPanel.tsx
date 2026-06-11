'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { calculerScenario } from '@/lib/calculs/index'
import ProjectionChart from './ProjectionChart'

const SCENARIOS = [
  { id: 'lmnp_meuble',  label: 'LMNP Meublé' },
  { id: 'colocation',   label: 'Colocation' },
  { id: 'courte_duree', label: 'Courte durée' },
]

const TMI_OPTIONS = [0, 11, 30, 41, 45]

function euros(n: number) {
  return n?.toLocaleString('fr-FR') + ' €'
}

function pct(n: number) {
  return (n * 100).toFixed(2) + ' %'
}

export default function ScenarioPanel({ project }: { project: any }) {
  const [scenarioType, setScenarioType] = useState<'lmnp_meuble' | 'colocation' | 'courte_duree'>('lmnp_meuble')
  const [loyerMensuel, setLoyerMensuel]       = useState<number | ''>('')
  const [tmi, setTmi]                         = useState(30)
  const [vacance, setVacance]                 = useState(5)
  const [nbChambres, setNbChambres]           = useState(2)
  const [loyerParChambre, setLoyerParChambre] = useState<number | ''>('')
  const [prixNuit, setPrixNuit]               = useState<number | ''>('')
  const [nuitsCons, setNuitsCons]             = useState(16)
  const [nuitsOpti, setNuitsOpti]             = useState(22)
  const [result, setResult]                   = useState<any>(null)
  const [error, setError]                     = useState<string | null>(null)

  // ─── Données projet → format moteur ───────────────────────────────────────

  const projetData = {
    prixAchat:          project.prix_achat,
    fraisNotairePct:    project.frais_notaire_pct,
    travaux:            project.travaux || 0,
    mobilier:           project.mobilier || 0,
    honorairesCapsul:   project.honoraires_capsul || 0,
    honorairesOverride: project.honoraires_override,
    plan3d:             project.plan_3d || 0,
    autresFrais:        project.autres_frais || 0,
  }

  const financementData = {
    apport:            project.apport || 0,
    dureeAnnees:       project.duree_annees || 20,
    tauxInteretPct:    project.taux_interet_pct || 0,
    tauxAssurancePct:  project.taux_assurance_pct || 0,
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
  }

  // ─── Calcul ───────────────────────────────────────────────────────────────

  const handleCalculer = () => {
    setError(null)
    try {
      let scenarioInput: any

      if (scenarioType === 'lmnp_meuble') {
        if (!loyerMensuel) { setError('Renseignez le loyer mensuel.'); return }
        scenarioInput = {
          type: 'lmnp_meuble' as const,
          params: {
            loyerMensuel:  Number(loyerMensuel),
            vacancePct:    vacance,
            regimeFiscal:  'lmnp_reel' as const,
            tmiClientPct:  tmi,
          },
        }
      } else if (scenarioType === 'colocation') {
        if (!loyerParChambre) { setError('Renseignez le loyer par chambre.'); return }
        scenarioInput = {
          type: 'colocation' as const,
          params: {
            nbChambres,
            loyerParChambre: Number(loyerParChambre),
            vacancePct:      vacance,
            tmiClientPct:    tmi,
            regimeFiscal:    'lmnp_reel' as const,
          },
        }
      } else {
        if (!prixNuit) { setError('Renseignez le prix par nuit.'); return }
        scenarioInput = {
          type: 'courte_duree' as const,
          params: {
            prixNuit:               Number(prixNuit),
            nuitsMoisConservateur:  nuitsCons,
            nuitsMoisOptimiste:     nuitsOpti,
            tmiClientPct:           tmi,
            vacancePct:             vacance,
          },
        }
      }

      const r = calculerScenario(projetData, financementData, chargesData, scenarioInput)
// ↓ Ajoute ces deux lignes ici
console.log('Résultat moteur:', r)
console.log('Scénario:', r.scenario)
setResult(r)
    } catch (err: any) {
      setError(err?.message ?? 'Erreur de calcul.')
      console.error(err)
    }
  }

  // ─── Rendu ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Sélection scénario */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold mb-4">Simuler un scénario</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Type */}
          <div className="space-y-1.5">
            <Label>Type de location</Label>
            <div className="flex flex-col gap-1.5 mt-1">
              {SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => { setScenarioType(s.id as any); setResult(null); setError(null) }}
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

          {/* Paramètres selon scénario */}
          <div className="space-y-3">

            {/* LMNP */}
            {scenarioType === 'lmnp_meuble' && (
              <EuroField id="loyer" label="Loyer mensuel estimé" value={loyerMensuel}
                onChange={setLoyerMensuel} />
            )}

            {/* Colocation */}
            {scenarioType === 'colocation' && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="nbChambres">Nombre de chambres</Label>
                  <Input
                    id="nbChambres" type="number" min={1} max={10}
                    value={nbChambres}
                    onChange={(e) => setNbChambres(Number(e.target.value))}
                  />
                </div>
                <EuroField id="loyerChambre" label="Loyer / chambre" value={loyerParChambre}
                  onChange={setLoyerParChambre} />
              </>
            )}

            {/* Courte durée */}
            {scenarioType === 'courte_duree' && (
              <>
                <EuroField id="prixNuit" label="Prix par nuit" value={prixNuit}
                  onChange={setPrixNuit} />
                <div className="space-y-1.5">
                  <Label>Nuits/mois conservateur</Label>
                  <Input type="number" min={0} value={nuitsCons}
                    onChange={(e) => setNuitsCons(Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Nuits/mois optimiste</Label>
                  <Input type="number" min={0} value={nuitsOpti}
                    onChange={(e) => setNuitsOpti(Number(e.target.value))} />
                </div>
              </>
            )}

            {/* Vacance (commun) */}
            <div className="space-y-1.5">
              <Label htmlFor="vacance">Vacance locative (%)</Label>
              <Input id="vacance" type="number" min={0} max={100} value={vacance}
                onChange={(e) => setVacance(Number(e.target.value))} />
            </div>
          </div>

          {/* TMI */}
          <div className="space-y-1.5">
            <Label>TMI client</Label>
            <div className="flex flex-col gap-1.5 mt-1">
              {TMI_OPTIONS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTmi(t)}
                  className={`px-3 py-2 rounded-lg text-sm border text-left transition ${
                    tmi === t
                      ? 'bg-foreground text-background border-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  {t} %
                </button>
              ))}
            </div>
          </div>

          {/* Bouton + erreur */}
          <div className="flex flex-col justify-end gap-3">
            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}
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

      {/* Résultats */}
      {result && (
        <>
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-semibold mb-4">Résultats</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
  <Metric label="Prix projet total"   value={euros(result.prixProjetTotal)} />
  <Metric label="Capital emprunté"    value={euros(result.capitalEmprunte)} />
  <Metric label="Mensualité"          value={euros(result.mensualiteTotale)} />
  <Metric label="Revenus nets/mois"   value={euros(Math.round(result.scenario.revenusAnnuelsNets / 12))} />
  <Metric label="Charges/mois"        value={euros(Math.round(result.scenario.chargesAnnuelles / 12))} />
  <Metric label="Impôt/mois"          value={euros(result.scenario.impotMensuelEstime)} />
  <Metric
    label="Cash-flow après IR"
    value={euros(result.scenario.cashflowMensuelApresIR)}
    highlight={result.scenario.cashflowMensuelApresIR >= 0 ? 'green' : 'red'}
  />
  <Metric label="Rentabilité brute"   value={`${result.scenario.rentabiliteBrutePct?.toFixed(2)} %`} />
  <Metric label="Rentabilité nette"   value={`${result.scenario.rentabiliteNettePct?.toFixed(2)} %`} />
</div>
          </div>

          <ProjectionChart
            conservateur={result.projectionConservateur}
            realiste={result.projectionRealiste}
          />
        </>
      )}
    </div>
  )
}

// ─── Composants utilitaires ───────────────────────────────────────────────────

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

function Metric({ label, value, bold = false, highlight }: {
  label: string
  value: string
  bold?: boolean
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