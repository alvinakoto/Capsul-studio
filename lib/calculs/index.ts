import {
  DonneesProjet,
  DonneesFinancement,
  DonneesCharges,
  ParamsLMNP,
  ParamsColocation,
  ParamsCourteDuree,
  ResultatsComplets,
} from './types'
import { calculerPrixProjet, calculerFinancement, calculerProjection } from './communs'
import { calculerLMNP } from './lmnp'
import { calculerColocation } from './colocation'
import { calculerCourteDuree } from './courteDuree'

export type TypeScenario = 'lmnp_meuble' | 'colocation' | 'courte_duree'

export type ParamsScenario =
  | { type: 'lmnp_meuble'; params: ParamsLMNP }
  | { type: 'colocation'; params: ParamsColocation }
  | { type: 'courte_duree'; params: ParamsCourteDuree }

export function calculerScenario(
  projet: DonneesProjet,
  financement: DonneesFinancement,
  charges: DonneesCharges,
  scenarioInput: ParamsScenario,
  revalorisationRealistePct: number = 2.0,
  revalorisationLoyerPct: number = 1.5
): ResultatsComplets {

  const { fraisNotaireEuros, honorairesCapsul, prixProjetTotal } =
    calculerPrixProjet(projet)

  const {
    capitalEmprunte,
    mensualiteCredit,
    assuranceMensuelle,
    mensualiteTotale,
    coutTotalCredit,
    isComptant,
  } = calculerFinancement(prixProjetTotal, financement)

  let scenario

  if (scenarioInput.type === 'lmnp_meuble') {
    scenario = calculerLMNP(charges, scenarioInput.params, prixProjetTotal, mensualiteTotale)
  } else if (scenarioInput.type === 'colocation') {
    scenario = calculerColocation(charges, scenarioInput.params, prixProjetTotal, mensualiteTotale)
  } else {
    scenario = calculerCourteDuree(charges, scenarioInput.params, prixProjetTotal, mensualiteTotale)
  }

  const valeurBienApresTravaux = projet.valeurBienApresTravaux ?? (projet.prixAchat + projet.travaux)

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
  }
}
