// ============================================================
// CAPSUL STUDIO — Types & interfaces du moteur de calcul
// ============================================================

// Données du projet (Blocs A, B, C)
export interface DonneesProjet {
  prixAchat: number
  fraisNotairePct: number       // ex: 7.5 pour 7,5%
  travaux: number
  mobilier: number
  honorairesCapsul?: number     // si null → calculé auto
  honorairesOverride: boolean
  autresFrais: number
  fraisAgence?: number          // optionnel — si renseigné, honoraires calculés sur (prixAchat - fraisAgence) = prix net vendeur
}

// Financement (Bloc D)
export interface DonneesFinancement {
  apport: number
  dureeAnnees: number
  tauxInteretPct: number        // ex: 3.6 pour 3,6%
  tauxAssurancePct: number      // ex: 0.36 pour 0,36%
  isComptantOverride?: boolean  // flag explicite BD — court-circuite la détection auto
}

// Charges récurrentes (Bloc E)
export interface DonneesCharges {
  taxeFonciere: number          // annuel
  chargesCoproAnnuelles: number // annuel
  assurancePno: number          // annuel
  electriciteEau: number        // annuel
  internet: number              // annuel
  chauffage: number             // annuel
  fraisComptabilite: number     // annuel
  autresCharges: number         // annuel
  cfe: number                   // Cotisation Foncière des Entreprises, défaut 300, exonérée année 1
}

// ⚠️ Fiscalité volontairement absente du moteur : la situation fiscale de
// l'investisseur (TMI, régime micro/réel, amortissements) n'est pas modélisée.
// Tous les flux ci-dessous sont exprimés AVANT impôt (décision direction, sept. 2026).

// Paramètres spécifiques LMNP meublé
export interface ParamsLMNP {
  loyerMensuel: number
  vacancePct: number            // ex: 5 pour 5%
  fraisGestionPct?: number      // ex: 7 pour 7% — défaut 0 si absent
}

// Paramètres spécifiques Colocation
export interface ParamsColocation {
  nbChambres: number
  loyerParChambre: number
  vacancePct: number
  fraisGestionPct?: number      // ex: 7 pour 7%
}

// Paramètres spécifiques Courte durée
export interface ParamsCourteDuree {
  prixNuitee: number
  nuitsConservateur: number     // défaut 16
  nuitsOptimiste: number        // défaut 22
  conciergeriePct: number       // défaut 20
  // Bien simple : fluides du projet (toujours à charge du bailleur en courte durée).
  // Lot d'immeuble : fluides passés à part, cf. ChargesPropresLot.
  electriciteEau?: number       // annuel
  internet?: number             // annuel
  chauffage?: number            // annuel
}

export type TypeScenario = 'lmnp_meuble' | 'colocation' | 'courte_duree'

export type ParamsScenario =
  | { type: 'lmnp_meuble'; params: ParamsLMNP }
  | { type: 'colocation'; params: ParamsColocation }
  | { type: 'courte_duree'; params: ParamsCourteDuree }

// Résultats communs à tous les scénarios
export interface ResultatsScenario {
  revenusAnnuelsBruts: number
  revenusAnnuelsNets: number    // après vacance / conciergerie
  chargesAnnuelles: number
  rentabiliteBrutePct: number
  rentabiliteNettePct: number
  cashflowMensuel: number       // revenus nets − charges − mensualité (avant impôt)
}

// Résultats spécifiques Courte durée
export interface ResultatsCourteDuree extends ResultatsScenario {
  revenusConservateur: number
  revenusOptimiste: number
  cashflowConservateur: number
  cashflowOptimiste: number
}

// ─── Lots ────────────────────────────────────────────────────────────────────
// Un bien simple est un immeuble d'un seul lot : même calcul, mêmes formules
// (cf. calculerImmeuble). Un lot porte ses recettes et ses charges propres ;
// l'immeuble porte les charges communes (taxe foncière, assurance…) et le crédit.

// Charges propres à un lot, annuelles : fluides à charge du bailleur. Comptées en
// colocation et en courte durée, jamais en meublé classique (payées par le locataire).
export interface ChargesPropresLot {
  electriciteEau: number
  internet: number
  chauffage: number
}

export interface LotCalcul {
  scenario: ParamsScenario
  chargesPropres: ChargesPropresLot
  comparaison?: ParamsScenario | null   // autre exploitation envisagée pour ce lot
}

// Résultat d'exploitation d'un lot, annuel, avant charges de l'immeuble et crédit
export interface ResultatsLot {
  type: TypeScenario
  revenusAnnuelsBruts: number
  revenusAnnuelsNets: number          // après vacance (meublé, colocation) ou conciergerie (courte durée)
  chargesAnnuelles: number            // propres au lot : gestion locative + charges propres
  resultatAnnuel: number              // revenusAnnuelsNets − chargesAnnuelles
  detail: { vacance: number; conciergerie: number; gestion: number; chargesPropres: number }
  // Courte durée : hypothèse optimiste (nuitsOptimiste)
  optimiste?: { revenusAnnuelsBruts: number; revenusAnnuelsNets: number; resultatAnnuel: number }
}

export interface ResultatsLotImmeuble extends ResultatsLot {
  // Autre exploitation envisagée : son résultat et l'écart de cash-flow de l'immeuble si on la retenait
  alternative: { exploitation: ResultatsLot; effetCashflowMensuel: number } | null
}

// Une année de projection
export interface AnneeProjection {
  annee: number
  capitalRembourseCumul: number
  cashflowCumul: number
  patrimoineNet: number
  valeurBien: number
}

// Résultats complets d'un calcul (bien simple)
export interface ResultatsComplets {
  prixProjetTotal: number
  honorairesCapsul: number
  fraisNotaireEuros: number
  capitalEmprunte: number
  mensualiteCredit: number
  assuranceMensuelle: number
  mensualiteTotale: number
  isComptant: boolean
  scenario: ResultatsScenario | ResultatsCourteDuree
  projectionConservateur: AnneeProjection[]
  projectionRealiste: AnneeProjection[]
}
// Résultats complets d'un immeuble (un bien simple en est un cas à un lot)
export interface ResultatsImmeuble extends ResultatsComplets {
  lots: ResultatsLotImmeuble[]
  chargesImmeubleAnnuelles: number    // charges communes, hors charges propres aux lots
}
