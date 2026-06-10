// ============================================================
// CAPSUL STUDIO — Calcul fiscal (micro vs LMNP réel)
// ============================================================

// Taux prélèvements sociaux fixes
const TAUX_PS = 0.172

// ── Amortissements LMNP réel (méthode simplifiée) ────────────
// Bien : 2%/an sur 85% du prix achat (hors terrain 15%)
// Mobilier : 10%/an
// Travaux : 5%/an
export function calculerAmortissementsAnnuels(
  prixAchat: number,
  mobilier: number,
  travaux: number
): number {
  const amortBien = prixAchat * 0.85 * 0.02
  const amortMobilier = mobilier * 0.10
  const amortTravaux = travaux * 0.05
  return Math.round(amortBien + amortMobilier + amortTravaux)
}

// ── Impôt Micro-foncier (LLD nue) ────────────────────────────
// Abattement 30%, TMI + PS sur le reste
export function calculerImpotMicroFoncier(
  revenusNetsAnnuels: number,
  tmiPct: number
): number {
  const baseImposable = revenusNetsAnnuels * 0.70
  return Math.round(baseImposable * (tmiPct / 100 + TAUX_PS))
}

// ── Impôt Micro-BIC (meublé non classé) ──────────────────────
// Abattement 50%, TMI + PS sur le reste
export function calculerImpotMicroBIC(
  revenusNetsAnnuels: number,
  tmiPct: number
): number {
  const baseImposable = revenusNetsAnnuels * 0.50
  return Math.round(baseImposable * (tmiPct / 100 + TAUX_PS))
}

// ── Impôt LMNP réel ──────────────────────────────────────────
// Revenus - charges déductibles - amortissements
// Si résultat < 0 → impôt = 0 (déficit reportable)
export function calculerImpotLMNPReel(
  revenusNetsAnnuels: number,
  chargesDeductibles: number,  // charges courantes + intérêts crédit
  amortissementsAnnuels: number,
  tmiPct: number
): number {
  const resultatFiscal =
    revenusNetsAnnuels - chargesDeductibles - amortissementsAnnuels

  // Déficitaire → 0€ d'impôt
  if (resultatFiscal <= 0) return 0

  return Math.round(resultatFiscal * (tmiPct / 100 + TAUX_PS))
}

// ── Intérêts crédit année N ───────────────────────────────────
// Approximation : intérêts de la 1ère année (conservateur)
export function calculerInteretsAnnee1(
  capital: number,
  tauxAnnuelPct: number
): number {
  return Math.round(capital * (tauxAnnuelPct / 100))
}