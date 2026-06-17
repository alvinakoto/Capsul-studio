'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { calculerScenario } from '@/lib/calculs/index'
import { updateProjectScenario } from '@/lib/supabase/projects'
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

export default function ScenarioPanel({ project }: { project: any }) {
  const [scenarioType, setScenarioType] = useState<'lmnp_meuble' | 'colocation' | 'courte_duree'>('lmnp_meuble')
  const [loyerMensuel, setLoyerMensuel]       = useState<number | ''>('')
  const [tmi, setTmi]                         = useState(30)
  const [vacance, setVacance]                 = useState<number | ''>(5)
  const [nbChambres, setNbChambres]           = useState<number | ''>(2)
  const [loyerParChambre, setLoyerParChambre] = useState<number | ''>('')
  const [prixNuit, setPrixNuit]               = useState<number | ''>('')
  const [nuitsCons, setNuitsCons]             = useState<number | ''>(16)
  const [nuitsOpti, setNuitsOpti]             = useState<number | ''>(22)
  const [cfe, setCfe]                         = useState(300)
  const [result, setResult]                   = useState<any>(null)
  const [error, setError]                     = useState<string | null>(null)
  const [saved, setSaved]                     = useState(false)

  useEffect(() => {
    if (!saved) return
    const t = setTimeout(() => setSaved(false), 2500)
    return () => clearTimeout(t)
  }, [saved])

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
            vacancePct:    Number(vacance) || 0,
            regimeFiscal:  'lmnp_reel' as const,
            tmiClientPct:  tmi,
          },
        }
      } else if (scenarioType === 'colocation') {
        if (!loyerParChambre) { setError('Renseignez le loyer par chambre.'); return }
        scenarioInput = {
          type: 'colocation' as const,
          params: {
            nbChambres:      Number(nbChambres) || 1,
            loyerParChambre: Number(loyerParChambre),
            vacancePct:      Number(vacance) || 0,
            tmiClientPct:    tmi,
            regimeFiscal:    'lmnp_reel' as const,
          },
        }
      } else {
        if (!prixNuit) { setError('Renseignez le prix par nuit.'); return }
        scenarioInput = {
          type: 'courte_duree' as const,
          params: {
            prixNuitee:          Number(prixNuit),
            nuitsConservateur:   Number(nuitsCons) || 0,
            nuitsOptimiste:      Number(nuitsOpti) || 0,
            conciergeriePct:     20,
            electriciteEau:      chargesData.electriciteEau,
            internet:            chargesData.internet,
            chauffage:           chargesData.chauffage,
            cfe,
            tmiClientPct:        tmi,
            regimeFiscal:        'lmnp_reel' as const,
          },
        }
      }

      const r = calculerScenario(projetData, financementData, chargesData, scenarioInput)
      setResult(r)
      setSaved(false)

      const loyerCible =
        scenarioType === 'lmnp_meuble' ? Number(loyerMensuel) :
        scenarioType === 'colocation'  ? Number(loyerParChambre) :
                                         Number(prixNuit)

      updateProjectScenario(project.id, loyerCible, scenarioType).then(() => setSaved(true))

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
                  onClick={() => {
                    setScenarioType(s.id as any)
                    setVacance(s.id === 'colocation' ? 8 : 5)
                    setResult(null)
                    setError(null)
                  }}
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
                    onChange={(e) => setNbChambres(e.target.value === '' ? '' : Number(e.target.value))}
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
                    onChange={(e) => setNuitsCons(e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Nuits/mois optimiste</Label>
                  <Input type="number" min={0} value={nuitsOpti}
                    onChange={(e) => setNuitsOpti(e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
                <EuroField id="cfe" label="CFE annuelle" value={cfe}
                  onChange={(v) => setCfe(v === '' ? 0 : v)} />
              </>
            )}

            {/* Vacance (LMNP et colocation uniquement) */}
            {scenarioType !== 'courte_duree' && (
              <div className="space-y-1.5">
                <Label htmlFor="vacance">Vacance locative (%)</Label>
                <Input id="vacance" type="number" min={0} max={100} value={vacance}
                  onChange={(e) => setVacance(e.target.value === '' ? '' : Number(e.target.value))} />
              </div>
            )}
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Résultats</h2>
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