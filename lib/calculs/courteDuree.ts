import {
  DonneesProjet,
  DonneesFinancement,
  DonneesCharges,
  ParamsCourteDuree,
  ResultatsCourteDuree,
} from './types'
import {
  calculerAmortissementsAnnuels,
  calculerImpotMicroBIC,
  calculerImpotLMNPReel,
  calculerInteretsAnnee1,
} from './fiscalite'

export function calculerCourteDuree(
  projet: DonneesProjet,
  financement: DonneesFinancement,
  charges: DonneesCharges,
  params: ParamsCourteDuree,
  prixProjetTotal: number,
  mensualiteTotale: number,
  capitalEmprunte: number
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

  const chargesAnnuelles = chargesGenerales + chargesSpecifiquesCD

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

  const revenusMensuelsNetsConservateur = Math.round(revenusNetsConservateur / 12)
  const cashflowConservateur =
    revenusMensuelsNetsConservateur - chargesMensuelles - mensualiteTotale - impotMensuelEstime

  const revenusMensuelsNetsOptimiste = Math.round(revenusNetsOptimiste / 12)
  const cashflowOptimiste =
    revenusMensuelsNetsOptimiste - chargesMensuelles - mensualiteTotale - impotMensuelEstime

  const cashflowMensuel =
    revenusMensuelsNetsConservateur - chargesMensuelles - mensualiteTotale
  const cashflowMensuelApresIR = cashflowConservateur

  return {
    revenusAnnuelsBruts,
    revenusAnnuelsNets,
    chargesAnnuelles,
    rentabiliteBrutePct,
    rentabiliteNettePct,
    impotMensuelEstime,
    cashflowMensuel,
    cashflowMensuelApresIR,
    revenusConservateur,
    revenusOptimiste,
    cashflowConservateur,
    cashflowOptimiste,
  }
}
