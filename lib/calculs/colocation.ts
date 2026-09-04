// ============================================================
// CAPSUL STUDIO — Scénario Colocation
// ============================================================
// Flux exprimés avant impôt (cf. note dans types.ts).

import { DonneesCharges, ParamsColocation, ResultatsScenario } from './types'

export function calculerColocation(
  charges: DonneesCharges,
  params: ParamsColocation,
  prixProjetTotal: number,
  mensualiteTotale: number
): ResultatsScenario {

  // ── Revenus ──────────────────────────────────────────────────
  const loyerMensuelTotal = params.nbChambres * params.loyerParChambre
  const revenusAnnuelsBruts = loyerMensuelTotal * 12
  const revenusAnnuelsNets = Math.round(
    revenusAnnuelsBruts * (1 - params.vacancePct / 100)
  )

  // ── Charges annuelles ─────────────────────────────────────────
  // En colocation : fluides souvent à charge bailleur
  const fraisGestionAnnuels = Math.round(
    revenusAnnuelsNets * ((params.fraisGestionPct ?? 0) / 100)
  )
  const chargesAnnuelles =
    charges.taxeFonciere +
    charges.chargesCoproAnnuelles +
    charges.assurancePno +
    charges.electriciteEau +
    charges.internet +
    charges.chauffage +
    charges.fraisComptabilite +
    charges.autresCharges +
    charges.cfe +
    fraisGestionAnnuels

  // ── Rentabilité ───────────────────────────────────────────────
  const rentabiliteBrutePct = Math.round(
    (revenusAnnuelsBruts / prixProjetTotal) * 1000
  ) / 10

  const rentabiliteNettePct = Math.round(
    ((revenusAnnuelsNets - chargesAnnuelles) / prixProjetTotal) * 1000
  ) / 10

  // ── Cash-flow ─────────────────────────────────────────────────
  const chargesMensuelles = Math.round(chargesAnnuelles / 12)
  const revenusMensuelsNets = Math.round(revenusAnnuelsNets / 12)

  const cashflowMensuel =
    revenusMensuelsNets - chargesMensuelles - mensualiteTotale

  return {
    revenusAnnuelsBruts,
    revenusAnnuelsNets,
    chargesAnnuelles,
    rentabiliteBrutePct,
    rentabiliteNettePct,
    cashflowMensuel,
  }
}
