'use client'

import { WizardState } from './WizardShell'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calculerMensualite(capital: number, tauxPct: number, duree: number): number {
  const t = tauxPct / 100 / 12
  const n = duree * 12
  if (t === 0) return Math.round(capital / n)
  return Math.round(capital * t / (1 - Math.pow(1 + t, -n)))
}

// Ce que la banque accepte de financer : prix achat + travaux
function calculerMontantFinancable(s: WizardState): number {
  return (Number(s.prix_achat) || 0) + (Number(s.travaux) || 0)
}

// Prix projet total (tout compris)
function calculerPrixProjet(s: WizardState): number {
  const prixAchat = Number(s.prix_achat) || 0
  if (prixAchat === 0) return 0
  const fraisNotaire = Math.round(prixAchat * s.frais_notaire_pct / 100)
  const travaux = Number(s.travaux) || 0
  const mobilier = Number(s.mobilier) || 0
  let honoraires = Number(s.honoraires_capsul) || 0
  if (!s.honoraires_override) {
    honoraires = Math.max(Math.round(prixAchat * 0.0828), 8280)
    if (travaux > 0) honoraires += Math.round(travaux * 0.05)
  }
  return (
    prixAchat + fraisNotaire + travaux + mobilier + honoraires +
    Number(s.plan_3d || 0) + Number(s.autres_frais || 0)
  )
}

function euros(n: number) {
  return n.toLocaleString('fr-FR') + ' €'
}

// ─── Composant ────────────────────────────────────────────────────────────────

export default function RecapSticky({ state }: { state: WizardState }) {
  const prixAchat = Number(state.prix_achat) || 0
  const prixProjet = calculerPrixProjet(state)
  const montantFinancable = calculerMontantFinancable(state)
  const fraisAnnexes = prixProjet - montantFinancable

  // apport '' = non renseigné | 0 = sans apport (valide)
  const apportSaisi = state.apport !== ''
  const apport = apportSaisi ? Number(state.apport) : null
  const capital = apport !== null ? Math.max(0, montantFinancable - apport) : null

  const taux = Number(state.taux_interet_pct) || 0

  const mensualiteCredit =
    capital !== null && capital > 0 && taux > 0
      ? calculerMensualite(capital, taux, state.duree_annees)
      : null

  const assuranceMensuelle =
    capital !== null && capital > 0 && state.taux_assurance_pct > 0
      ? Math.round((capital * state.taux_assurance_pct) / 100 / 12)
      : 0

  const mensualiteTotale = mensualiteCredit
    ? mensualiteCredit + assuranceMensuelle
    : null

  return (
    <div className="rounded-xl border bg-card p-4 text-sm space-y-4">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Récap en temps réel
      </p>

      {prixAchat === 0 ? (
        <p className="text-xs text-muted-foreground leading-relaxed">
          Renseignez le prix d'achat dans le bloc C pour voir les estimations.
        </p>
      ) : (
        <>
          {/* Prix projet */}
          <div className="space-y-1.5">
            <Line label="Prix achat" value={euros(prixAchat)} />
            {Number(state.travaux) > 0 && (
              <Line label="Travaux" value={euros(Number(state.travaux))} />
            )}
            {Number(state.mobilier) > 0 && (
              <Line label="Mobilier" value={euros(Number(state.mobilier))} />
            )}
            {Number(state.plan_3d) > 0 && (
              <Line label="Plan 3D" value={euros(Number(state.plan_3d))} />
            )}
            {Number(state.autres_frais) > 0 && (
              <Line label="Autres frais" value={euros(Number(state.autres_frais))} />
            )}

            <div className="border-t pt-2 mt-1 space-y-1.5">
              <Line label="Montant finançable" value={euros(montantFinancable)} bold />
              <Line
                label="Frais annexes ¹"
                value={euros(fraisAnnexes)}
              />
              <Line label="Prix projet total" value={euros(prixProjet)} bold />
            </div>

            <p className="text-[10px] text-muted-foreground pt-1">
              ¹ Notaire + honoraires — fonds propres
            </p>
          </div>

          {/* Financement */}
          {apportSaisi && (
            <div className="border-t pt-3 space-y-1.5">
              <Line label="Apport" value={euros(apport!)} />
              <Line label="Capital emprunté" value={euros(capital ?? 0)} bold />
            </div>
          )}

          {/* Mensualité */}
          {mensualiteTotale && (
            <div className="border-t pt-3 space-y-1.5">
              {assuranceMensuelle > 0 && (
                <>
                  <Line label="Crédit seul" value={euros(mensualiteCredit!)} />
                  <Line label="Assurance" value={euros(assuranceMensuelle)} />
                </>
              )}
              <div className="flex justify-between items-baseline">
                <span className="text-muted-foreground">Mensualité totale</span>
                <span className="text-lg font-bold tabular-nums">
                  {euros(mensualiteTotale)}
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Line({
  label,
  value,
  bold = false,
}: {
  label: string
  value: string
  bold?: boolean
}) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground truncate">{label}</span>
      <span className={bold ? 'font-semibold tabular-nums' : 'tabular-nums'}>{value}</span>
    </div>
  )
}