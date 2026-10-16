// Saisie du wizard (WizardState) → moteur de calcul.
// Pendant de lib/calculs/depuisProjet.ts pour les écrans où le projet n'est pas
// encore enregistré : le récap et le bloc Financement affichent ainsi les mêmes
// chiffres que la page projet et les cartes du dashboard.

import type { WizardState } from './WizardShell'
import { calculerPrixProjet, calculerFinancement, calculerApportMinimum } from '@/lib/calculs/communs'

function donneesProjetDepuisSaisie(s: WizardState) {
  return {
    prixAchat:          Number(s.prix_achat) || 0,
    fraisNotairePct:    s.frais_notaire_pct,
    travaux:            Number(s.travaux) || 0,
    mobilier:           Number(s.mobilier) || 0,
    honorairesCapsul:   Number(s.honoraires_capsul) || 0,
    honorairesOverride: s.honoraires_override,
    autresFrais:        Number(s.autres_frais) || 0,
    fraisAgence:        Number(s.frais_agence) || undefined,
  }
}

export function prixProjetDepuisSaisie(s: WizardState) {
  return calculerPrixProjet(donneesProjetDepuisSaisie(s))
}

/** Plan de financement calculé par le moteur ; `null` tant que l'apport n'est pas saisi. */
export function financementDepuisSaisie(s: WizardState) {
  if (s.apport === '') return null
  const { prixProjetTotal } = prixProjetDepuisSaisie(s)
  return calculerFinancement(prixProjetTotal, {
    apport:             Number(s.apport) || 0,
    dureeAnnees:        s.duree_annees || 20,
    tauxInteretPct:     Number(s.taux_interet_pct) || 0,
    tauxAssurancePct:   Number(s.taux_assurance_pct) || 0,
    isComptantOverride: s.is_comptant,
  })
}

/** Même alerte que `alerteApport()` (lib/calculs/depuisProjet.ts), sur la saisie en cours. */
export function alerteApportDepuisSaisie(s: WizardState): { minimum: number; manque: number } | null {
  if (s.apport === '' || s.is_comptant || !(Number(s.prix_achat) > 0)) return null
  const minimum = calculerApportMinimum(donneesProjetDepuisSaisie(s))
  const manque = minimum - (Number(s.apport) || 0)
  return manque > 0 ? { minimum, manque } : null
}
