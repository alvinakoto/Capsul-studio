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
  plan3d: number
  autresFrais: number
}

// Financement (Bloc D)
export interface DonneesFinancement {
  apport: number
  dureeAnnees: number
  tauxInteretPct: number        // ex: 3.6 pour 3,6%
  tauxAssurancePct: number      // ex: 0.36 pour 0,36%
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
}

// Paramètres spécifiques LMNP meublé
export interface ParamsLMNP {
  loyerMensuel: number
  vacancePct: number            // ex: 5 pour 5%
  regimeFiscal: 'micro_bic' | 'lmnp_reel'
  tmiClientPct: number          // ex: 30 pour 30%
}

// Paramètres spécifiques Colocation
export interface ParamsColocation {
  nbChambres: number
  loyerParChambre: number
  vacancePct: number
  regimeFiscal: 'micro_bic' | 'lmnp_reel'
  tmiClientPct: number
}

// Paramètres spécifiques Courte durée
export interface ParamsCourteDuree {
  prixNuitee: number
  nuitsConservateur: number     // défaut 16
  nuitsOptimiste: number        // défaut 22
  conciergeriePct: number       // défaut 20
  electriciteEau: number        // annuel
  internet: number              // annuel
  chauffage: number             // annuel
  regimeFiscal: 'micro_bic' | 'lmnp_reel'
  tmiClientPct: number
}

// Résultats communs à tous les scénarios
export interface ResultatsScenario {
  revenusAnnuelsBruts: number
  revenusAnnuelsNets: number
  chargesAnnuelles: number
  rentabiliteBrutePct: number
  rentabiliteNettePct: number
  impotMensuelEstime: number
  cashflowMensuel: number
  cashflowMensuelApresIR: number
}

// Résultats spécifiques Courte durée
export interface ResultatsCourteDuree extends ResultatsScenario {
  revenusConservateur: number
  revenusOptimiste: number
  cashflowConservateur: number
  cashflowOptimiste: number
}

// Une année de projection
export interface AnneeProjection {
  annee: number
  capitalRembourseCumul: number
  cashflowCumul: number
  patrimoineNet: number
  valeurBien: number
}

// Résultats complets d'un calcul
export interface ResultatsComplets {
  prixProjetTotal: number
  honorairesCapsul: number
  fraisNotaireEuros: number
  capitalEmprunte: number
  mensualiteCredit: number
  assuranceMensuelle: number
  mensualiteTotale: number
  scenario: ResultatsScenario | ResultatsCourteDuree
  projectionConservateur: AnneeProjection[]
  projectionRealiste: AnneeProjection[]
}