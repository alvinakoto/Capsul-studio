'use client'

import { WizardState } from './WizardShell'
import { euros } from '@/lib/utils/format'
import { prixProjetDepuisSaisie, financementDepuisSaisie, alerteApportDepuisSaisie } from './calculsSaisie'
import AlerteApport from '@/components/projects/AlerteApport'

// ─── Composant ────────────────────────────────────────────────────────────────

export default function RecapSticky({ state }: { state: WizardState }) {
  const prixAchat = Number(state.prix_achat) || 0
  const { prixProjetTotal: prixProjet, fraisNotaireEuros, honorairesCapsul } = prixProjetDepuisSaisie(state)

  // Même plan de financement que le simulateur : capital = prix projet total − apport
  const financement = financementDepuisSaisie(state)
  const apport = financement ? Number(state.apport) || 0 : null
  const tauxSaisi = (Number(state.taux_interet_pct) || 0) > 0
  const mensualiteTotale = financement && !financement.isComptant && tauxSaisi ? financement.mensualiteTotale : null
  const assuranceMensuelle = financement?.assuranceMensuelle ?? 0

  const comptant = state.is_comptant || !!financement?.isComptant
  const titre = state.nom_projet?.trim() || [state.adresse, state.ville].filter(Boolean).join(', ')

  return (
    <aside
      className="rounded-[14px] p-5 text-white tabular-nums"
      style={{ backgroundColor: 'var(--cs-navy)', boxShadow: '0 18px 40px -22px rgba(14,34,64,.6)' }}
      aria-label="Récapitulatif du projet"
    >
      <p className="cs-label" style={{ color: 'var(--cs-sky)' }}>Récapitulatif</p>
      <p className="mt-0.5 mb-3.5 text-[14px] font-bold leading-snug">{titre || 'Nouveau projet'}</p>

      {prixAchat === 0 ? (
        <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--cs-sky)' }}>
          Renseignez le prix d’achat à l’étape Finances pour voir les estimations.
        </p>
      ) : (
        <>
          <Line label="Prix d'achat" value={euros(prixAchat)} />
          {Number(state.travaux) > 0 && <Line label="Travaux" value={euros(Number(state.travaux))} />}
          {Number(state.mobilier) > 0 && <Line label="Ameublement" value={euros(Number(state.mobilier))} />}
          <Line label="Frais de notaire" value={euros(fraisNotaireEuros)} />
          <Line label="Honoraires Capsul" value={euros(honorairesCapsul)} />
          {Number(state.autres_frais) > 0 && <Line label="Autres frais" value={euros(Number(state.autres_frais))} />}

          {financement && (
            <>
              <div className="h-px my-2" style={{ backgroundColor: 'rgba(255,255,255,.1)' }} />
              <Line label="Apport" value={euros(apport!)} />
              {!comptant && <Line label="Capital emprunté" value={euros(financement.capitalEmprunte)} strong />}
            </>
          )}

          <div className="mt-3 rounded-[11px] p-3.5" style={{ backgroundColor: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)' }}>
            <p className="cs-label" style={{ color: 'var(--cs-sky)' }}>Prix projet total</p>
            <p className="mt-0.5 text-[26px] font-extrabold tracking-[-0.01em]" style={{ color: 'var(--cs-gold)' }}>
              {euros(prixProjet)}
            </p>
            {comptant ? (
              <p className="text-[11.5px]" style={{ color: 'var(--cs-sky)' }}>Achat comptant, aucun crédit</p>
            ) : mensualiteTotale ? (
              <p className="text-[11.5px]" style={{ color: 'var(--cs-sky)' }}>
                Mensualité : <b className="text-white">{euros(mensualiteTotale)}</b> / mois sur {state.duree_annees} ans
                {assuranceMensuelle > 0 && ` (dont ${euros(assuranceMensuelle)} d'assurance)`}
              </p>
            ) : null}
          </div>

          <AlerteApport alerte={alerteApportDepuisSaisie(state)} sombre className="mt-3" />

        </>
      )}
    </aside>
  )
}

function Line({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-2.5 py-1.5 text-[12.5px]" style={{ color: strong ? '#fff' : '#D7E2EE' }}>
      <span className="truncate" style={{ fontWeight: strong ? 600 : 400 }}>{label}</span>
      <b style={{ fontWeight: strong ? 700 : 600, color: '#fff' }}>{value}</b>
    </div>
  )
}
