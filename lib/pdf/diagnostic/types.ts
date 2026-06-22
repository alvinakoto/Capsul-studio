/**
 * Payload reçu par la route de génération du PDF de diagnostic.
 * Ce sont exactement les champs que Make envoyait jusqu'ici à PDFMonkey
 * (calculés côté Framer). On ne change rien côté simulateur / Make,
 * seule la destination de l'appel change (PDFMonkey -> cette route).
 *
 * Tous les champs numériques peuvent arriver en string depuis le webhook ;
 * `normalizePayload()` dans calculations.ts s'occupe de la coercition.
 */

export type VerdictNiveau =
  | 'positif'
  | 'neutre'
  | 'negatif_modere'
  | 'negatif_fort';

export interface DiagnosticPayloadRaw {
  prenom: string;
  villeProjet: string;
  dateRapport: string; // déjà formatée côté Framer, ex: "12 juin 2026"

  // Métriques clés
  rentabiliteBrute: number | string;
  rentabiliteNette: number | string;
  cashFlowMensuel: number | string;
  cashFlowAnnuel: number | string;

  // Verdict (déjà décidé côté Framer)
  verdictNiveau: VerdictNiveau;
  verdictTitre: string;
  verdictMessage: string;

  // Financement
  mensualiteTotale: number | string;
  coutTotalAcquisition: number | string;
  capitalEmprunte: number | string;
  fraisNotaire: number | string;
  coutTotalCredit: number | string;
  prixBien: number | string;
  apport: number | string;
  dureeAnnees: number | string;
  tauxInteret: number | string;
  tauxMensuel: number | string; // taux mensuel en décimal, ex 0.00292 pour 3.5%/an
  mensualiteCredit: number | string; // mensualité hors assurance (capital + intérêts)
  interetsMois: number | string; // intérêts du 1er mois
  capitalMois: number | string; // capital remboursé le 1er mois
  assuranceMensuelle: number | string;

  // Loyer / charges
  loyerMensuel: number | string;
  loyerAnnuelNet: number | string;
  taxeFonciere: number | string; // annuelle
  chargesCoproMensuelles: number | string;
  assurancePnoAnnuelle: number | string;
  recettesMensuelles: number | string;
  depensesMensuelles: number | string;

  // Leviers (3 recommandations, texte déjà généré côté Framer)
  levier1Titre: string;
  levier1Description: string;
  levier2Titre: string;
  levier2Description: string;
  levier3Titre: string;
  levier3Description: string;
}

/** Version avec tous les champs numériques coercés en `number`. */
export type DiagnosticPayload = {
  [K in keyof DiagnosticPayloadRaw]: DiagnosticPayloadRaw[K] extends
    | number
    | string
    ? K extends
        | 'prenom'
        | 'villeProjet'
        | 'dateRapport'
        | 'verdictNiveau'
        | 'verdictTitre'
        | 'verdictMessage'
        | 'levier1Titre'
        | 'levier1Description'
        | 'levier2Titre'
        | 'levier2Description'
        | 'levier3Titre'
        | 'levier3Description'
      ? string
      : number
    : DiagnosticPayloadRaw[K];
};

export interface AmortYearRow {
  annee: number;
  capitalRembourse: number;
  interetsPayes: number;
  capitalRestantDu: number;
}

export interface ProjectionYearRow {
  annee: number;
  cumulCapital: number;
  pctCapital: number;
  cashFlowCumule: number;
  patrimoineNet: number;
}

export interface MarketData {
  villeConnue: boolean;
  villeNom?: string;
  villeEmoji?: string;
  villeDesc?: string;
  villeTension?: string;
  villeTensionDesc?: string;
  villePrixRange?: string;
  villeStrategie?: string;
  villeStrategieDesc?: string;
  marcheRdtBrut: number;
  marcheRdtNet: number;
}

export type EcartClass = 'superieur' | 'egal' | 'inferieur';
