import { sizes } from './sizes'

// ============================================================
// Mesures de la page « La ville » (en points)
// ============================================================
// Partagées entre le PDF (lib/pdf/components/PageVille.tsx) et l'écran Villes,
// pour que l'aperçu du bandeau et l'avertissement « carte réduite » montrent
// exactement ce que produira la fiche. Sans dépendance à react-pdf.

export const PAGE_A4_LARGEUR = 595.28

/** Hauteur du bandeau photo, réduite quand la ville a une carte des quartiers (pour lui laisser la place). */
export const BANDEAU_VILLE_H = 290
export const BANDEAU_VILLE_H_AVEC_CARTE = 125

export const GAP_ENCARTS_INVESTIR = 16
export const PADDING_ENCART_INVESTIR = 14

// Plafond de hauteur de la carte des quartiers. Au-delà, react-pdf ajoute une page
// quasi vide sans prévenir. Une carte plus verticale, ou un encart pleine largeur
// (ville sans « projets à venir »), est réduite en gardant ses proportions.
// Validé par rendu réel (novembre 2026) : avec tous les champs au maximum des
// limites de saisie, la page déborde dès 247 pt ; Épernay et Nancy, avec leurs
// données actuelles et une carte aussi verticale que celle de Reims, débordaient
// dès 254 pt. L'ancienne hauteur implicite (258 pt, carte de Reims) n'avait donc
// aucune marge. 235 pt garde ~10 pt sous le seuil ; seule la carte de Reims est
// un peu réduite, les 5 autres cartes déposées sont moins hautes que ce plafond.
export const CARTE_H_MAX = 235

const LARGEUR_CORPS = PAGE_A4_LARGEUR - sizes.marginAccent - sizes.margin

// Nom de la ville dans le bandeau : react-pdf ne coupe jamais un mot trop long
// (césure désactivée), il le laisse déborder à droite. Un nom long réduit donc sa
// taille pour tenir sur une ligne. CHASSE_NOM = largeur moyenne d'une capitale en
// Montserrat Black, en em, avec marge (validé par rendu réel jusqu'à 30 caractères).
const CHASSE_NOM = 0.85

/** Taille du nom de la ville dans le bandeau, au plus `base` (30 avec photo, 40 sans). */
export function tailleNomVille(nom: string, base: number): number {
  return Math.min(base, Math.floor(LARGEUR_CORPS / (CHASSE_NOM * Math.max(nom.length, 1))))
}

/** Proportions largeur / hauteur du bandeau photo sur la fiche. */
export function ratioBandeauVille(avecCarte: boolean): number {
  return PAGE_A4_LARGEUR / (avecCarte ? BANDEAU_VILLE_H_AVEC_CARTE : BANDEAU_VILLE_H)
}

/**
 * Taille d'affichage de la carte dans son encart : toute la largeur disponible,
 * hauteur déduite de ses proportions, plafonnée à CARTE_H_MAX (jamais rognée).
 * `reduite` : la carte n'occupe pas toute la largeur de l'encart.
 */
export function tailleCarteVille(
  carte: { largeur: number; hauteur: number },
  pleineLargeur: boolean,
): { width: number; height: number; reduite: boolean } {
  const largeurEncart = pleineLargeur ? LARGEUR_CORPS : (LARGEUR_CORPS - GAP_ENCARTS_INVESTIR) / 2
  const ratio = carte.largeur / carte.hauteur
  const width = largeurEncart - 2 * PADDING_ENCART_INVESTIR
  const height = width / ratio
  return height <= CARTE_H_MAX
    ? { width, height, reduite: false }
    : { width: CARTE_H_MAX * ratio, height: CARTE_H_MAX, reduite: true }
}
