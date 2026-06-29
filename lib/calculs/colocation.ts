// ============================================================
// CAPSUL STUDIO — Scénario Colocation
// ============================================================

import {
  DonneesProjet,
  DonneesFinancement,
  DonneesCharges,
  ParamsColocation,
  ResultatsScenario,
} from './types'
import {
  calculerAmortissementsAnnuels,
  calculerImpotMicroBIC,
  calculerImpotLMNPReel,
  calculerInteretsAnnee1,
} from './fiscalite'

export function calculerColocation(
  projet: DonneesProjet,
  financement: DonneesFinancement,
  charges: DonneesCharges,
  params: ParamsColocation,
  prixProjetTotal: number,
  mensualiteTotale: number,
  capitalEmprunte: number
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
    fraisGestionAnnuels

  // ── Rentabilité ───────────────────────────────────────────────
  const rentabiliteBrutePct = Math.round(
    (revenusAnnuelsBruts / prixProjetTotal) * 1000
  ) / 10

  const rentabiliteNettePct = Math.round(
    ((revenusAnnuelsNets - chargesAnnuelles) / prixProjetTotal) * 1000
  ) / 10

  // ── Fiscalité ─────────────────────────────────────────────────
  let impotAnnuel = 0

  if (params.regimeFiscal === 'micro_bic') {
    impotAnnuel = calculerImpotMicroBIC(
      revenusAnnuelsNets,
      params.tmiClientPct
    )
  } else {
    const interetsAnnee1 = calculerInteretsAnnee1(
      capitalEmprunte,
      financement.tauxInteretPct
    )
    const chargesDeductibles = chargesAnnuelles + interetsAnnee1
    const amortissements = calculerAmortissementsAnnuels(
      projet.prixAchat,
      projet.mobilier,
      projet.travaux
    )
    impotAnnuel = calculerImpotLMNPReel(
      revenusAnnuelsNets,
      chargesDeductibles,
      amortissements,
      params.tmiClientPct
    )
  }

  const impotMensuelEstime = Math.round(impotAnnuel / 12)

  // ── Cash-flow ─────────────────────────────────────────────────
  const chargesMensuelles = Math.round(chargesAnnuelles / 12)
  const revenusMensuelsNets = Math.round(revenusAnnuelsNets / 12)

  const cashflowMensuel =
    revenusMensuelsNets - chargesMensuelles - mensualiteTotale

  const cashflowMensuelApresIR = cashflowMensuel - impotMensuelEstime

  return {
    revenusAnnuelsBruts,
    revenusAnnuelsNets,
    chargesAnnuelles,
    rentabiliteBrutePct,
    rentabiliteNettePct,
    impotMensuelEstime,
    cashflowMensuel,
    cashflowMensuelApresIR,
  }
}