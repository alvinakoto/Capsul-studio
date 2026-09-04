// ============================================================
// CAPSUL STUDIO — Scénario Courte durée
// ============================================================
// Flux exprimés avant impôt (cf. note dans types.ts).

import { DonneesCharges, ParamsCourteDuree, ResultatsCourteDuree } from './types'

export function calculerCourteDuree(
  charges: DonneesCharges,
  params: ParamsCourteDuree,
  prixProjetTotal: number,
  mensualiteTotale: number
): ResultatsCourteDuree {

  // ── Revenus bruts (2 hypothèses) ─────────────────────────────
  const revenusConservateur = Math.round(
    params.prixNuitee * params.nuitsConservateur * 12
  )
  const revenusOptimiste = Math.round(
    params.prixNuitee * params.nuitsOptimiste * 12
  )
  const revenusAnnuelsBruts = revenusConservateur

  // ── Frais conciergerie ────────────────────────────────────────
  const conciergierieConservateur = Math.round(
    revenusConservateur * (params.conciergeriePct / 100)
  )
  const conciergierieOptimiste = Math.round(
    revenusOptimiste * (params.conciergeriePct / 100)
  )

  // ── Revenus nets après conciergerie ──────────────────────────
  const revenusNetsConservateur = revenusConservateur - conciergierieConservateur
  const revenusNetsOptimiste = revenusOptimiste - conciergierieOptimiste
  const revenusAnnuelsNets = revenusNetsConservateur

  // ── Charges annuelles ─────────────────────────────────────────
  // Charges générales (propriétaire)
  const chargesGenerales =
    charges.taxeFonciere +
    charges.chargesCoproAnnuelles +
    charges.assurancePno +
    charges.fraisComptabilite +
    charges.autresCharges

  // Charges spécifiques CD (toujours à charge bailleur)
  const chargesSpecifiquesCD =
    params.electriciteEau +
    params.internet +
    params.chauffage

  const chargesAnnuelles = chargesGenerales + chargesSpecifiquesCD + charges.cfe

  // ── Rentabilité ───────────────────────────────────────────────
  const rentabiliteBrutePct = Math.round(
    (revenusAnnuelsBruts / prixProjetTotal) * 1000
  ) / 10

  const rentabiliteNettePct = Math.round(
    ((revenusAnnuelsNets - chargesAnnuelles) / prixProjetTotal) * 1000
  ) / 10

  // ── Cash-flow ─────────────────────────────────────────────────
  const chargesMensuelles = Math.round(chargesAnnuelles / 12)

  const revenusMensuelsNetsConservateur = Math.round(revenusNetsConservateur / 12)
  const cashflowConservateur =
    revenusMensuelsNetsConservateur - chargesMensuelles - mensualiteTotale

  const revenusMensuelsNetsOptimiste = Math.round(revenusNetsOptimiste / 12)
  const cashflowOptimiste =
    revenusMensuelsNetsOptimiste - chargesMensuelles - mensualiteTotale

  // Le cash-flow de référence est l'hypothèse conservatrice
  const cashflowMensuel = cashflowConservateur

  return {
    revenusAnnuelsBruts,
    revenusAnnuelsNets,
    chargesAnnuelles,
    rentabiliteBrutePct,
    rentabiliteNettePct,
    cashflowMensuel,
    revenusConservateur,
    revenusOptimiste,
    cashflowConservateur,
    cashflowOptimiste,
  }
}
