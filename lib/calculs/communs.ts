// ============================================================
// CAPSUL STUDIO — Formules communes à tous les scénarios
// ============================================================

import { DonneesProjet, DonneesFinancement, AnneeProjection } from './types'

// ── Honoraires Capsul ────────────────────────────────────────
// Formule : MAX(prixAchat × 8,28%, 8 280€) + travaux × 5%
export function calculerHonorairesCapsul(
  prixAchat: number,
  travaux: number
): number {
  const honorairesAchat = Math.max(prixAchat * 0.0828, 8280)
  const honorairesTravaux = travaux * 0.05
  return Math.round(honorairesAchat + honorairesTravaux)
}

// ── Prix du projet total ─────────────────────────────────────
export function calculerPrixProjet(projet: DonneesProjet): {
  fraisNotaireEuros: number
  honorairesCapsul: number
  prixProjetTotal: number
} {
  const fraisNotaireEuros = Math.round(
    projet.prixAchat * (projet.fraisNotairePct / 100)
  )

  const honorairesCapsul = projet.honorairesOverride && projet.honorairesCapsul
    ? projet.honorairesCapsul
    : calculerHonorairesCapsul(projet.prixAchat, projet.travaux)

  const prixProjetTotal =
    projet.prixAchat +
    fraisNotaireEuros +
    projet.travaux +
    projet.mobilier +
    honorairesCapsul +
    projet.plan3d +
    projet.autresFrais

  return { fraisNotaireEuros, honorairesCapsul, prixProjetTotal }
}

// ── Mensualité de crédit (formule des annuités) ──────────────
export function calculerMensualite(
  capital: number,
  tauxAnnuelPct: number,
  dureeAnnees: number
): number {
  if (tauxAnnuelPct === 0) return Math.round(capital / (dureeAnnees * 12))

  const tauxMensuel = tauxAnnuelPct / 100 / 12
  const nbMensualites = dureeAnnees * 12
  const mensualite =
    capital *
    (tauxMensuel * Math.pow(1 + tauxMensuel, nbMensualites)) /
    (Math.pow(1 + tauxMensuel, nbMensualites) - 1)

  return Math.round(mensualite)
}

// ── Plan de financement complet ──────────────────────────────
export function calculerFinancement(
  prixProjetTotal: number,
  financement: DonneesFinancement
): {
  capitalEmprunte: number
  mensualiteCredit: number
  assuranceMensuelle: number
  mensualiteTotale: number
  coutTotalCredit: number
} {
  const capitalEmprunte = prixProjetTotal - financement.apport

  const mensualiteCredit = calculerMensualite(
    capitalEmprunte,
    financement.tauxInteretPct,
    financement.dureeAnnees
  )

  const assuranceMensuelle = Math.round(
    (capitalEmprunte * (financement.tauxAssurancePct / 100)) / 12
  )

  const mensualiteTotale = mensualiteCredit + assuranceMensuelle

  const coutTotalCredit =
    mensualiteTotale * financement.dureeAnnees * 12 - capitalEmprunte

  return {
    capitalEmprunte,
    mensualiteCredit,
    assuranceMensuelle,
    mensualiteTotale,
    coutTotalCredit,
  }
}

// ── Tableau d'amortissement du crédit ────────────────────────
export function calculerAmortissement(
  capital: number,
  tauxAnnuelPct: number,
  dureeAnnees: number
): { annee: number; capitalRembourse: number; interets: number; capitalRestant: number }[] {
  const tauxMensuel = tauxAnnuelPct / 100 / 12
  const mensualite = calculerMensualite(capital, tauxAnnuelPct, dureeAnnees)
  const tableau = []
  let capitalRestant = capital

  for (let annee = 1; annee <= dureeAnnees; annee++) {
    let interetsAnnee = 0
    let capitalAnnee = 0

    for (let mois = 0; mois < 12; mois++) {
      const interetsMois = capitalRestant * tauxMensuel
      const capitalMois = mensualite - interetsMois
      interetsAnnee += interetsMois
      capitalAnnee += capitalMois
      capitalRestant -= capitalMois
    }

    tableau.push({
      annee,
      capitalRembourse: Math.round(capitalAnnee),
      interets: Math.round(interetsAnnee),
      capitalRestant: Math.max(0, Math.round(capitalRestant)),
    })
  }

  return tableau
}

// ── Projection patrimoniale ───────────────────────────────────
export function calculerProjection(
  prixBien: number,
  apport: number,
  capital: number,
  tauxAnnuelPct: number,
  dureeAnnees: number,
  cashflowMensuelApresIR: number,
  revalorisation: number = 0   // 0 = conservateur, 2 = réaliste
): AnneeProjection[] {
  const amortissement = calculerAmortissement(capital, tauxAnnuelPct, dureeAnnees)
  const projection: AnneeProjection[] = []
  let capitalRembourseCumul = 0
  let cashflowCumul = 0

  for (let annee = 1; annee <= 20; annee++) {
    const ligne = amortissement[annee - 1]
    if (ligne) capitalRembourseCumul += ligne.capitalRembourse
    cashflowCumul += cashflowMensuelApresIR * 12

    const valeurBien = Math.round(
      prixBien * Math.pow(1 + revalorisation / 100, annee)
    )

    const patrimoineNet = Math.round(
      apport + capitalRembourseCumul + cashflowCumul
    )

    projection.push({
      annee,
      capitalRembourseCumul: Math.round(capitalRembourseCumul),
      cashflowCumul: Math.round(cashflowCumul),
      patrimoineNet,
      valeurBien,
    })
  }

  return projection
}