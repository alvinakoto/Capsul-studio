// ============================================================
// CAPSUL STUDIO — Catalogue des postes de travaux
// ============================================================
// Sélectionnés dans le wizard (Bloc C), persistés dans `projects.travaux_postes`
// (text[] d'identifiants) et illustrés en page « Travaux » de la fiche commerciale.
// L'ordre ci-dessous est l'ordre d'affichage sur la fiche.

import type { IconName } from './icons'

export interface PosteTravaux {
  id: string
  label: string
  icon: IconName
}

export const POSTES_TRAVAUX: PosteTravaux[] = [
  { id: 'cloisons',      label: 'Cloisons & agencement',   icon: 'brickWall'   },
  { id: 'chambres',      label: 'Création de chambres',    icon: 'bedDouble'   },
  { id: 'isolation',     label: 'Isolation',               icon: 'layers'      },
  { id: 'menuiseries',   label: 'Menuiseries & fenêtres',  icon: 'appWindow'   },
  { id: 'electricite',   label: 'Électricité',             icon: 'zap'         },
  { id: 'plomberie',     label: 'Plomberie',               icon: 'droplets'    },
  { id: 'chauffage',     label: 'Chauffage',               icon: 'heater'      },
  { id: 'salle_de_bain', label: 'Salle de bain',           icon: 'bath'        },
  { id: 'cuisine',       label: 'Cuisine',                 icon: 'cookingPot'  },
  { id: 'sols',          label: 'Sols',                    icon: 'grid2x2'     },
  { id: 'peinture',      label: 'Peinture',                icon: 'paintRoller' },
  { id: 'toiture',       label: 'Toiture & façade',        icon: 'house'       },
  { id: 'ameublement',   label: 'Ameublement & déco',      icon: 'sofa'        },
]

/** Postes correspondant aux identifiants donnés, dans l'ordre du catalogue (identifiants inconnus ignorés). */
export function getPostesTravaux(ids: readonly string[] | null | undefined): PosteTravaux[] {
  if (!ids || ids.length === 0) return []
  const set = new Set(ids)
  return POSTES_TRAVAUX.filter((p) => set.has(p.id))
}
