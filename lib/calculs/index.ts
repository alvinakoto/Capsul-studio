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
    scenario = calculerLMNP(
      projet, financement, charges, scenarioInput.params,
      prixProjetTotal, mensualiteTotale, capitalEmprunte
    )
  } else if (scenarioInput.type === 'colocation') {
    scenario = calculerColocation(
      projet, financement, charges, scenarioInput.params,
      prixProjetTotal, mensualiteTotale, capitalEmprunte
    )
  } else {
    scenario = calculerCourteDuree(
      projet, financement, charges, scenarioInput.params,
      prixProjetTotal, mensualiteTotale, capitalEmprunte
    )
  }

  const projectionConservateur = calculerProjection(
    projet.prixAchat, financement.apport, capitalEmprunte,
    financement.tauxInteretPct, financement.dureeAnnees,
    scenario.cashflowMensuelApresIR, 0
  )

  const projectionRealiste = calculerProjection(
    projet.prixAchat, financement.apport, capitalEmprunte,
    financement.tauxInteretPct, financement.dureeAnnees,
    scenario.cashflowMensuelApresIR, revalorisationRealistePct
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
