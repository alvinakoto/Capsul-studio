// ============================================================
// Ligne `projects` (Supabase, snake_case) → données du moteur
// ============================================================
// Point unique de conversion pour l'UI (en-tête projet, cartes du dashboard,
// simulateur) : chaque écran qui affiche un prix projet ou une mensualité passe
// par ici puis par le moteur, au lieu de recalculer à sa façon.

import { DonneesProjet, DonneesFinancement, DonneesCharges } from './types'
import { calculerPrixProjet, calculerFinancement } from './communs'

export function donneesProjet(project: any): DonneesProjet {
  return {
    prixAchat:          project.prix_achat || 0,
    fraisNotairePct:    project.frais_notaire_pct || 0,
    travaux:            project.travaux || 0,
    mobilier:           project.mobilier || 0,
    honorairesCapsul:   project.honoraires_capsul || 0,
    honorairesOverride: project.honoraires_override ?? false,
    autresFrais:        project.autres_frais || 0,
    fraisAgence:        project.frais_agence || undefined,
  }
}

export function donneesFinancement(project: any): DonneesFinancement {
  return {
    apport:             project.apport || 0,
    dureeAnnees:        project.duree_annees || 20,
    tauxInteretPct:     project.taux_interet_pct || 0,
    tauxAssurancePct:   project.taux_assurance_pct || 0,
    isComptantOverride: project.is_comptant ?? false,
  }
}

export function donneesCharges(project: any): DonneesCharges {
  return {
    taxeFonciere:          project.taxe_fonciere || 0,
    chargesCoproAnnuelles: project.charges_copro_annuelles || 0,
    assurancePno:          project.assurance_pno || 0,
    electriciteEau:        project.electricite_eau || 0,
    internet:              project.internet || 0,
    chauffage:             project.chauffage || 0,
    fraisComptabilite:     project.frais_comptabilite || 0,
    autresCharges:         project.autres_charges || 0,
    cfe:                   project.cfe ?? 300,
  }
}

/** Prix projet total et plan de financement d'un projet, tels que les calcule le moteur. */
export function syntheseProjet(project: any) {
  const prix = calculerPrixProjet(donneesProjet(project))
  const financement = calculerFinancement(prix.prixProjetTotal, donneesFinancement(project))
  return { ...prix, ...financement }
}
