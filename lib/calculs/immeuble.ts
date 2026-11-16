// ============================================================
// CAPSUL STUDIO — Immeuble : plusieurs lots, un achat, un crédit
// ============================================================
// Chaque lot a son exploitation (meublé, colocation, courte durée) et ses
// charges propres ; l'immeuble porte les charges communes et le crédit.
// Un bien simple est un immeuble d'un seul lot : calculerScenario (index.ts)
// passe par ici, il n'existe qu'une seule formule de cash-flow.
// Flux exprimés avant impôt (cf. note dans types.ts).

import {
  ChargesPropresLot,
  DonneesCharges,
  DonneesFinancement,
  DonneesProjet,
  LotCalcul,
  ParamsScenario,
  ResultatsCourteDuree,
  ResultatsImmeuble,
  ResultatsLot,
  ResultatsLotImmeuble,
  ResultatsScenario,
} from './types'
import { calculerFinancement, calculerPrixProjet, calculerProjection } from './communs'
import { exploitationLMNP } from './lmnp'
import { exploitationColocation } from './colocation'
import { exploitationCourteDuree } from './courteDuree'

export function calculerExploitationLot(scenario: ParamsScenario, chargesPropres: ChargesPropresLot): ResultatsLot {
  if (scenario.type === 'lmnp_meuble') return exploitationLMNP(scenario.params)
  if (scenario.type === 'colocation') return exploitationColocation(scenario.params, chargesPropres)
  return exploitationCourteDuree(scenario.params, chargesPropres)
}

/** Charges communes de l'immeuble, annuelles. Les fluides n'y entrent que s'ils sont saisis en global. */
function chargesCommunes(charges: DonneesCharges, fluidesGlobaux: number): number {
  return (
    charges.taxeFonciere +
    charges.chargesCoproAnnuelles +
    charges.assurancePno +
    charges.fraisComptabilite +
    charges.autresCharges +
    charges.cfe +
    fluidesGlobaux
  )
}

/** Totaux de l'immeuble : recettes des lots, charges communes et propres, crédit. */
function agreger(
  lots: ResultatsLot[],
  chargesImmeubleAnnuelles: number,
  prixProjetTotal: number,
  mensualiteTotale: number,
): ResultatsScenario | ResultatsCourteDuree {
  const revenusAnnuelsBruts = lots.reduce((n, l) => n + l.revenusAnnuelsBruts, 0)
  const revenusAnnuelsNets = lots.reduce((n, l) => n + l.revenusAnnuelsNets, 0)
  const chargesAnnuelles = lots.reduce((n, l) => n + l.chargesAnnuelles, chargesImmeubleAnnuelles)

  // ── Rentabilité (sur le prix projet total, un seul prix pour tout l'immeuble) ──
  const rentabiliteBrutePct = Math.round((revenusAnnuelsBruts / prixProjetTotal) * 1000) / 10
  const rentabiliteNettePct = Math.round(((revenusAnnuelsNets - chargesAnnuelles) / prixProjetTotal) * 1000) / 10

  // ── Cash-flow ───────────────────────────────────────────────────────────────
  const chargesMensuelles = Math.round(chargesAnnuelles / 12)
  const cashflowMensuel = Math.round(revenusAnnuelsNets / 12) - chargesMensuelles - mensualiteTotale

  const resultat: ResultatsScenario = {
    revenusAnnuelsBruts,
    revenusAnnuelsNets,
    chargesAnnuelles,
    rentabiliteBrutePct,
    rentabiliteNettePct,
    cashflowMensuel,
  }
  if (!lots.some((l) => l.optimiste)) return resultat

  // Au moins un lot en courte durée : hypothèse optimiste pour l'immeuble, les
  // autres lots gardant leurs recettes habituelles.
  const revenusOptimiste = lots.reduce((n, l) => n + (l.optimiste?.revenusAnnuelsBruts ?? l.revenusAnnuelsBruts), 0)
  const revenusNetsOptimiste = lots.reduce((n, l) => n + (l.optimiste?.revenusAnnuelsNets ?? l.revenusAnnuelsNets), 0)
  return {
    ...resultat,
    revenusConservateur: revenusAnnuelsBruts,
    revenusOptimiste,
    cashflowConservateur: cashflowMensuel,
    cashflowOptimiste: Math.round(revenusNetsOptimiste / 12) - chargesMensuelles - mensualiteTotale,
  }
}

export function calculerImmeuble(
  projet: DonneesProjet,
  financement: DonneesFinancement,
  charges: DonneesCharges,
  lots: LotCalcul[],
  fluidesGlobaux: number = 0,
  revalorisationRealistePct: number = 2.0,
): ResultatsImmeuble {
  if (lots.length === 0) throw new Error('Un immeuble compte au moins un lot.')

  const { fraisNotaireEuros, honorairesCapsul, prixProjetTotal } = calculerPrixProjet(projet)
  const {
    capitalEmprunte,
    mensualiteCredit,
    assuranceMensuelle,
    mensualiteTotale,
    isComptant,
  } = calculerFinancement(prixProjetTotal, financement)

  const chargesImmeubleAnnuelles = chargesCommunes(charges, fluidesGlobaux)
  const retenus = lots.map((l) => calculerExploitationLot(l.scenario, l.chargesPropres))
  const scenario = agreger(retenus, chargesImmeubleAnnuelles, prixProjetTotal, mensualiteTotale)

  // Autre exploitation envisagée pour un lot : effet exact sur le cash-flow de
  // l'immeuble, en recalculant les totaux avec ce lot exploité autrement.
  const resultatsLots: ResultatsLotImmeuble[] = retenus.map((retenu, i) => {
    const comparaison = lots[i].comparaison
    if (!comparaison) return { ...retenu, alternative: null }
    const exploitation = calculerExploitationLot(comparaison, lots[i].chargesPropres)
    const avecAlternative = agreger(
      retenus.map((r, j) => (j === i ? exploitation : r)),
      chargesImmeubleAnnuelles, prixProjetTotal, mensualiteTotale,
    )
    return {
      ...retenu,
      alternative: { exploitation, effetCashflowMensuel: avecAlternative.cashflowMensuel - scenario.cashflowMensuel },
    }
  })

  // Base patrimoniale : prix d'achat + travaux. Capsul ne s'engage pas sur une
  // valeur de revente estimée (décision direction, septembre 2026).
  const valeurBienApresTravaux = projet.prixAchat + projet.travaux

  const projectionConservateur = calculerProjection(
    valeurBienApresTravaux, financement.apport, capitalEmprunte,
    financement.tauxInteretPct, financement.dureeAnnees,
    scenario.cashflowMensuel, 0
  )
  const projectionRealiste = calculerProjection(
    valeurBienApresTravaux, financement.apport, capitalEmprunte,
    financement.tauxInteretPct, financement.dureeAnnees,
    scenario.cashflowMensuel, revalorisationRealistePct
  )

  return {
    prixProjetTotal,
    honorairesCapsul,
    fraisNotaireEuros,
    capitalEmprunte,
    mensualiteCredit,
    assuranceMensuelle,
    mensualiteTotale,
    isComptant,
    scenario,
    projectionConservateur,
    projectionRealiste,
    lots: resultatsLots,
    chargesImmeubleAnnuelles,
  }
}

/**
 * Montants annuels → mensuels arrondis à l'euro, dont la somme tombe juste sur
 * `totalMensuel` (par défaut le total mensuel arrondi), par la méthode du plus
 * fort reste. Pour les tableaux du PDF : une colonne s'additionne exactement au
 * total affiché, et les flux d'un immeuble au cash-flow calculé par le moteur.
 */
export function mensualiserSansEcart(
  annuels: number[],
  totalMensuel: number = Math.round(annuels.reduce((n, a) => n + a, 0) / 12),
): number[] {
  const exacts = annuels.map((a) => a / 12)
  const arrondis = exacts.map((m) => Math.round(m))
  let ecart = totalMensuel - arrondis.reduce((n, m) => n + m, 0)
  if (ecart === 0) return arrondis
  // Corrige d'un euro les montants dont l'arrondi a le plus éloigné de la valeur exacte
  const ordre = exacts
    .map((m, i) => ({ i, reste: m - arrondis[i] }))
    .sort((a, b) => (ecart > 0 ? b.reste - a.reste : a.reste - b.reste))
  for (const { i } of ordre) {
    if (ecart === 0) break
    arrondis[i] += ecart > 0 ? 1 : -1
    ecart += ecart > 0 ? -1 : 1
  }
  return arrondis
}

// ─── Flux mensuels affichés (simulateur, fiche, rapport) ─────────────────────

export type CleChargeImmeuble =
  | 'taxeFonciere' | 'chargesCopro' | 'assurancePno' | 'fraisComptabilite' | 'cfe' | 'chargesPropresGlobales' | 'autresCharges'

export interface FluxMensuelsImmeuble {
  recettesNettesLots: number                                // somme des résultats des lots, par mois
  charges: { cle: CleChargeImmeuble; montant: number }[]   // charges communes, par mois (montants positifs)
  mensualite: number
  cashflow: number
  // Par lot, par mois : brut et net (après vacance ou conciergerie, gestion et charges propres)
  lots: { brut: number; net: number }[]
}

/**
 * Flux d'un immeuble à l'euro près, qui tombent juste : recettes − charges −
 * mensualité = cash-flow du moteur, et la colonne « net » des lots s'additionne
 * aux recettes. Les arrondis sont répartis par mensualiserSansEcart, sans
 * jamais modifier le cash-flow calculé.
 */
export function fluxMensuelsImmeuble(
  r: ResultatsImmeuble,
  charges: DonneesCharges,
  fluidesGlobaux: number,
): FluxMensuelsImmeuble {
  const resultats = r.lots.reduce((n, l) => n + l.resultatAnnuel, 0)
  // Taxe foncière, assurance, comptabilité et CFE toujours affichées ; les autres seulement si saisies
  const postes: { cle: CleChargeImmeuble; annuel: number; toujours: boolean }[] = [
    { cle: 'taxeFonciere', annuel: charges.taxeFonciere, toujours: true },
    { cle: 'chargesCopro', annuel: charges.chargesCoproAnnuelles, toujours: false },
    { cle: 'assurancePno', annuel: charges.assurancePno, toujours: true },
    { cle: 'fraisComptabilite', annuel: charges.fraisComptabilite, toujours: true },
    { cle: 'cfe', annuel: charges.cfe, toujours: true },
    { cle: 'chargesPropresGlobales', annuel: fluidesGlobaux, toujours: false },
    { cle: 'autresCharges', annuel: charges.autresCharges, toujours: false },
  ]
  const affiches = postes.filter((p) => p.toujours || p.annuel > 0)
  const mensualite = r.mensualiteTotale
  const cashflow = r.scenario.cashflowMensuel
  const mensuels = mensualiserSansEcart([resultats, ...affiches.map((p) => -p.annuel)], cashflow + mensualite)
  const recettesNettesLots = mensuels[0]

  const nets = mensualiserSansEcart(r.lots.map((l) => l.resultatAnnuel), recettesNettesLots)
  const bruts = mensualiserSansEcart(r.lots.map((l) => l.revenusAnnuelsBruts))
  return {
    recettesNettesLots,
    charges: affiches.map((p, i) => ({ cle: p.cle, montant: -mensuels[i + 1] })),
    mensualite,
    cashflow,
    lots: r.lots.map((_, i) => ({ brut: bruts[i], net: nets[i] })),
  }
}
