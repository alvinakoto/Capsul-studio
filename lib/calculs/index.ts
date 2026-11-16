import {
  DonneesProjet,
  DonneesFinancement,
  DonneesCharges,
  ParamsScenario,
  ResultatsComplets,
} from './types'
import { calculerImmeuble } from './immeuble'

export type { TypeScenario, ParamsScenario } from './types'
export { calculerImmeuble, calculerExploitationLot, mensualiserSansEcart } from './immeuble'

/**
 * Bien simple : un immeuble d'un seul lot. Les fluides du projet restent comptés
 * comme avant, en colocation (charges du projet) et en courte durée (paramètres
 * du scénario), jamais en meublé classique.
 */
export function calculerScenario(
  projet: DonneesProjet,
  financement: DonneesFinancement,
  charges: DonneesCharges,
  scenarioInput: ParamsScenario,
  revalorisationRealistePct: number = 2.0,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- signature historique, pas encore utilisée
  revalorisationLoyerPct: number = 1.5
): ResultatsComplets {
  const fluides = scenarioInput.type === 'courte_duree'
    ? {
        electriciteEau: scenarioInput.params.electriciteEau ?? 0,
        internet: scenarioInput.params.internet ?? 0,
        chauffage: scenarioInput.params.chauffage ?? 0,
      }
    : { electriciteEau: charges.electriciteEau, internet: charges.internet, chauffage: charges.chauffage }

  const r = calculerImmeuble(
    projet, financement, charges,
    [{ scenario: scenarioInput, chargesPropres: fluides }],
    0, revalorisationRealistePct,
  )
  return {
    prixProjetTotal: r.prixProjetTotal,
    honorairesCapsul: r.honorairesCapsul,
    fraisNotaireEuros: r.fraisNotaireEuros,
    capitalEmprunte: r.capitalEmprunte,
    mensualiteCredit: r.mensualiteCredit,
    assuranceMensuelle: r.assuranceMensuelle,
    mensualiteTotale: r.mensualiteTotale,
    isComptant: r.isComptant,
    scenario: r.scenario,
    projectionConservateur: r.projectionConservateur,
    projectionRealiste: r.projectionRealiste,
  }
}
