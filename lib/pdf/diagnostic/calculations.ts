import {
  AmortYearRow,
  DiagnosticPayload,
  DiagnosticPayloadRaw,
  ProjectionYearRow,
} from './types';
import { toNumber } from './format';

const NUMERIC_KEYS: Array<keyof DiagnosticPayloadRaw> = [
  'rentabiliteBrute',
  'rentabiliteNette',
  'cashFlowMensuel',
  'cashFlowAnnuel',
  'mensualiteTotale',
  'coutTotalAcquisition',
  'capitalEmprunte',
  'fraisNotaire',
  'coutTotalCredit',
  'prixBien',
  'apport',
  'dureeAnnees',
  'tauxInteret',
  'tauxMensuel',
  'mensualiteCredit',
  'interetsMois',
  'capitalMois',
  'assuranceMensuelle',
  'loyerMensuel',
  'loyerAnnuelNet',
  'taxeFonciere',
  'chargesCoproMensuelles',
  'assurancePnoAnnuelle',
  'recettesMensuelles',
  'depensesMensuelles',
];

/** Coerce tous les champs numériques du payload brut (webhook → JSON). */
export function normalizePayload(raw: DiagnosticPayloadRaw): DiagnosticPayload {
  const out: any = { ...raw };
  for (const key of NUMERIC_KEYS) {
    out[key] = toNumber(raw[key]) ?? 0;
  }
  return out as DiagnosticPayload;
}

/**
 * Répartition de la mensualité — page 3 ("Répartition visuelle").
 * Identique au Liquid : pct_capital + pct_assurance arrondis,
 * pct_interets = reste (pour que le total fasse toujours 100%).
 */
export function getMensualiteSplit(p: DiagnosticPayload) {
  if (p.mensualiteTotale === 0) {
    return { pctCapital: 0, pctInterets: 0, pctAssurance: 0 };
  }
  const pctCapital = Math.round((p.capitalMois * 100) / p.mensualiteTotale);
  const pctAssurance = Math.round((p.assuranceMensuelle * 100) / p.mensualiteTotale);
  const pctInterets = 100 - pctCapital - pctAssurance;
  return { pctCapital, pctInterets, pctAssurance };
}

/**
 * Tableau d'amortissement 5 ans — page 3.
 * Reprend exactement la boucle Liquid : intérêts de l'année = capital
 * restant * taux mensuel * 12 (approximation déjà utilisée côté Capsul),
 * capital de l'année = mensualité crédit annuelle (hors assurance) - intérêts.
 */
export function getAmortizationTable(p: DiagnosticPayload): AmortYearRow[] {
  if (p.capitalEmprunte === 0) return [];
  const rows: AmortYearRow[] = [];
  let capitalRestant = p.capitalEmprunte;
  for (let i = 1; i <= 5; i++) {
    const interetsAnnee = Math.round(capitalRestant * p.tauxMensuel * 12);
    const capitalAnnee = p.mensualiteCredit * 12 - interetsAnnee;
    capitalRestant -= capitalAnnee;
    rows.push({
      annee: i,
      capitalRembourse: capitalAnnee,
      interetsPayes: interetsAnnee,
      capitalRestantDu: capitalRestant,
    });
  }
  return rows;
}

export function getCoutGlobal(p: DiagnosticPayload) {
  return {
    capitalEmprunte: p.capitalEmprunte,
    coutTotalCredit: p.coutTotalCredit,
    totalRembourse: p.capitalEmprunte + p.coutTotalCredit,
  };
}

/** Vacance locative — page 4 : 5% du loyer mensuel brut. */
export function getVacanceEuros(p: DiagnosticPayload): number {
  return (p.loyerMensuel * 5) / 100;
}

export function getDepensesAnnuelles(p: DiagnosticPayload): number {
  return p.depensesMensuelles * 12;
}

export function getTaxeMois(p: DiagnosticPayload): number {
  return p.taxeFonciere / 12;
}

export function getAssuranceMois(p: DiagnosticPayload): number {
  return p.assurancePnoAnnuelle / 12;
}

/**
 * Projection patrimoniale 5 ans — page 5.
 * Recalcule un cumul de capital remboursé indépendant (même logique que
 * l'amortissement, mais accumulé année par année) + cash-flow cumulé +
 * patrimoine net estimé (apport + capital cumulé remboursé).
 */
export function getProjectionTable(p: DiagnosticPayload): ProjectionYearRow[] {
  // Mode comptant : bien possédé à 100% dès l'achat, patrimoine = prixBien + cashflow cumulé
  if (p.capitalEmprunte === 0) {
    const rows: ProjectionYearRow[] = [];
    for (let i = 1; i <= 5; i++) {
      const cashFlowCumule = p.cashFlowAnnuel * i;
      rows.push({
        annee: i,
        cumulCapital: 0,
        pctCapital: 100,
        cashFlowCumule,
        patrimoineNet: p.prixBien + cashFlowCumule,
      });
    }
    return rows;
  }

  const rows: ProjectionYearRow[] = [];
  let capitalRestant = p.capitalEmprunte;
  let cumul = 0;
  for (let i = 1; i <= 5; i++) {
    const interetsAnnee = Math.round(capitalRestant * p.tauxMensuel * 12);
    const capitalAnnee = p.mensualiteCredit * 12 - interetsAnnee;
    capitalRestant -= capitalAnnee;
    cumul += capitalAnnee;

    const pctCapital = Math.round((cumul * 100) / p.capitalEmprunte);
    const cashFlowCumule = p.cashFlowAnnuel * i;
    const patrimoineNet = p.apport + cumul;

    rows.push({
      annee: i,
      cumulCapital: cumul,
      pctCapital,
      cashFlowCumule,
      patrimoineNet,
    });
  }
  return rows;
}

/** Plus-value à 5 ans si appréciation conservatrice de 2%/an (page 5, note). */
export function getPlusValueEstimee(p: DiagnosticPayload): number {
  return (p.prixBien * 10) / 100;
}
