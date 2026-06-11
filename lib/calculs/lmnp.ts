// ============================================================
// CAPSUL STUDIO — Scénario LMNP meublé
// ============================================================

import {
  DonneesProjet,
  DonneesFinancement,
  DonneesCharges,
  ParamsLMNP,
  ResultatsScenario,
} from './types'
import {
  calculerAmortissementsAnnuels,
  calculerImpotMicroBIC,
  calculerImpotLMNPReel,
  calculerInteretsAnnee1,
} from './fiscalite'

export function calculerLMNP(
  projet: DonneesProjet,
  financement: DonneesFinancement,
  charges: DonneesCharges,
  params: ParamsLMNP,
  prixProjetTotal: number,
  mensualiteTotale: number,
  capitalEmprunte: number
): ResultatsScenario {

  // ── Revenus ─────────────────────────────────────────────────
  const revenusAnnuelsBruts = params.loyerMensuel * 12
  const revenusAnnuelsNets = Math.round(
    revenusAnnuelsBruts * (1 - params.vacancePct / 100)
  )

  // ── Charges annuelles ────────────────────────────────────────
  // En LMNP meublé : fluides généralement à charge locataire
  // On inclut uniquement les charges propriétaire
  const chargesAnnuelles =
    charges.taxeFonciere +
    charges.chargesCoproAnnuelles +
    charges.assurancePno +
    charges.fraisComptabilite +
    charges.autresCharges

  // ── Rentabilité ──────────────────────────────────────────────
  const rentabiliteBrutePct = Math.round(
    (revenusAnnuelsBruts / prixProjetTotal) * 1000
  ) / 10

  const rentabiliteNettePct = Math.round(
    ((revenusAnnuelsNets - chargesAnnuelles) / prixProjetTotal) * 1000
  ) / 10

  // ── Fiscalité ────────────────────────────────────────────────
  let impotAnnuel = 0

  if (params.regimeFiscal === 'micro_bic') {
    impotAnnuel = calculerImpotMicroBIC(revenusAnnuelsNets, params.tmiClientPct)
  } else {
    // LMNP réel — charges déductibles = charges + intérêts crédit
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

  // ── Cash-flow ────────────────────────────────────────────────
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