// ============================================================
// CAPSUL STUDIO — Immeuble : lots tels que saisis par le chargé
// ============================================================
// Stocké tel quel dans `projects.immeuble` (JSONB, null pour un bien simple).
// Conversion vers le moteur : lib/calculs/depuisProjet.ts (donneesImmeuble).
// Un seul achat, un seul budget travaux et un seul crédit pour tout l'immeuble ;
// chaque lot a sa typologie, son DPE et son exploitation.

import type { ChargesPropresLot, TypeScenario } from '@/lib/calculs/types'

export const TYPES_LOT = ['studio', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6+'] as const
export type TypeLot = (typeof TYPES_LOT)[number]

export const CLASSES_DPE = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const
export type ClasseDpe = (typeof CLASSES_DPE)[number]

// Calé sur la fiche commerciale : la page « Les lots » tient sur une page
// jusqu'à 8 lots (validé par rendu réel). Capsul traite 5 à 7 lots en général.
export const MAX_LOTS = 8

// Libellé d'un lot : tient sur une ligne dans la colonne « Lot » de la page « Les lots »
export const LIBELLE_LOT_MAX = 22

/**
 * Exploitation d'un lot telle que saisie. Les pourcentages absents suivent les
 * paramètres communs de l'immeuble : le chargé ne détaille que s'il le souhaite.
 */
export interface ExploitationSaisie {
  type: TypeScenario
  loyerMensuel?: number          // meublé
  nbChambres?: number            // colocation
  loyerParChambre?: number       // colocation
  prixNuitee?: number            // courte durée
  nuitsConservateur?: number     // courte durée, 16 par défaut
  nuitsOptimiste?: number        // courte durée, 22 par défaut
  vacancePct?: number            // meublé, colocation ; absent = commun
  fraisGestionPct?: number       // meublé, colocation ; absent = commun
  conciergeriePct?: number       // courte durée ; absent = commun
}

export interface LotImmeuble {
  id: string                                // stable : clé d'affichage et de comparaison
  libelle: string                           // '' = « Lot n »
  typeBien: TypeLot
  surfaceM2: number | null
  dpeActuel: ClasseDpe | null               // null = non communiqué
  dpeVise: ClasseDpe | null
  exploitation: ExploitationSaisie | null   // choisie au Bloc F, chiffrée dans le simulateur
  comparaison: ExploitationSaisie | null    // autre exploitation envisagée pour ce lot
  chargesPropres: ChargesPropresLot | null  // annuelles, utilisées en mode « par lot » uniquement
}

export interface ParametresCommuns {
  vacanceMeublePct: number
  vacanceColocationPct: number
  fraisGestionPct: number
  conciergeriePct: number
}

export interface ImmeubleSaisie {
  lots: LotImmeuble[]
  parametres: ParametresCommuns
  // Électricité, internet, chauffage : un montant global pour l'immeuble (charges
  // du projet, Bloc E) ou un montant par lot (simulateur).
  chargesPropres: 'global' | 'par_lot'
}

// Mêmes valeurs par défaut que le simulateur d'un bien simple
export const PARAMETRES_COMMUNS_DEFAUT: ParametresCommuns = {
  vacanceMeublePct: 5,
  vacanceColocationPct: 8,
  fraisGestionPct: 7,
  conciergeriePct: 20,
}

export function nouveauLot(typeBien: TypeLot = 'T2'): LotImmeuble {
  return {
    id: crypto.randomUUID(),
    libelle: '',
    typeBien,
    surfaceM2: null,
    dpeActuel: null,
    dpeVise: null,
    exploitation: null,
    comparaison: null,
    chargesPropres: null,
  }
}

export function nouvelImmeuble(): ImmeubleSaisie {
  return {
    lots: [nouveauLot('studio'), nouveauLot('T2')],
    parametres: { ...PARAMETRES_COMMUNS_DEFAUT },
    chargesPropres: 'global',
  }
}

/** Nom affiché d'un lot : son libellé, sinon « Lot n ». */
export function libelleLot(lot: LotImmeuble, index: number): string {
  return lot.libelle.trim() || `Lot ${index + 1}`
}

/** Type affiché d'un projet : « Immeuble de 5 lots » pour un immeuble détaillé, sinon le type saisi. */
export function libelleTypeProjet(project: { type_bien?: string | null; immeuble?: unknown }): string | null {
  const immeuble = lireImmeuble(project.immeuble)
  return immeuble ? `Immeuble de ${immeuble.lots.length} lots` : project.type_bien ?? null
}

/** Surface totale des lots renseignés ; null si aucune surface n'est saisie. */
export function surfaceTotale(lots: LotImmeuble[]): number | null {
  const surfaces = lots.map((l) => l.surfaceM2).filter((s): s is number => !!s && s > 0)
  return surfaces.length ? Math.round(surfaces.reduce((n, s) => n + s, 0) * 10) / 10 : null
}

/** « 2 studios, 2 T2, 1 T3 », dans l'ordre des typologies. */
export function compositionLots(lots: LotImmeuble[]): string {
  return TYPES_LOT
    .map((t) => ({ t, n: lots.filter((l) => l.typeBien === t).length }))
    .filter(({ n }) => n > 0)
    .map(({ t, n }) => `${n} ${t === 'studio' && n > 1 ? 'studios' : t}`)
    .join(', ')
}

// ─── Lecture de la colonne JSONB ──────────────────────────────────────────────
// Tolérante : une donnée absente ou mal formée retombe sur sa valeur par défaut
// plutôt que de faire échouer l'écran ou le PDF.

const nombreOuNull = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null)
const nombreOuAbsent = (v: unknown): number | undefined => nombreOuNull(v) ?? undefined
const estType = (v: unknown): v is TypeScenario => v === 'lmnp_meuble' || v === 'colocation' || v === 'courte_duree'
const estDpe = (v: unknown): v is ClasseDpe => typeof v === 'string' && (CLASSES_DPE as readonly string[]).includes(v)

function lireExploitation(v: unknown): ExploitationSaisie | null {
  if (!v || typeof v !== 'object') return null
  const e = v as Record<string, unknown>
  if (!estType(e.type)) return null
  return {
    type: e.type,
    loyerMensuel: nombreOuAbsent(e.loyerMensuel),
    nbChambres: nombreOuAbsent(e.nbChambres),
    loyerParChambre: nombreOuAbsent(e.loyerParChambre),
    prixNuitee: nombreOuAbsent(e.prixNuitee),
    nuitsConservateur: nombreOuAbsent(e.nuitsConservateur),
    nuitsOptimiste: nombreOuAbsent(e.nuitsOptimiste),
    vacancePct: nombreOuAbsent(e.vacancePct),
    fraisGestionPct: nombreOuAbsent(e.fraisGestionPct),
    conciergeriePct: nombreOuAbsent(e.conciergeriePct),
  }
}

function lireChargesPropres(v: unknown): ChargesPropresLot | null {
  if (!v || typeof v !== 'object') return null
  const c = v as Record<string, unknown>
  return {
    electriciteEau: nombreOuNull(c.electriciteEau) ?? 0,
    internet: nombreOuNull(c.internet) ?? 0,
    chauffage: nombreOuNull(c.chauffage) ?? 0,
  }
}

function lireLot(v: unknown): LotImmeuble | null {
  if (!v || typeof v !== 'object') return null
  const l = v as Record<string, unknown>
  return {
    id: typeof l.id === 'string' && l.id ? l.id : crypto.randomUUID(),
    libelle: typeof l.libelle === 'string' ? l.libelle : '',
    typeBien: (TYPES_LOT as readonly string[]).includes(l.typeBien as string) ? (l.typeBien as TypeLot) : 'T2',
    surfaceM2: nombreOuNull(l.surfaceM2),
    dpeActuel: estDpe(l.dpeActuel) ? l.dpeActuel : null,
    dpeVise: estDpe(l.dpeVise) ? l.dpeVise : null,
    exploitation: lireExploitation(l.exploitation),
    comparaison: lireExploitation(l.comparaison),
    chargesPropres: lireChargesPropres(l.chargesPropres),
  }
}

/** Colonne `projects.immeuble` → saisie ; null pour un bien simple (ou un immeuble sans lot). */
export function lireImmeuble(v: unknown): ImmeubleSaisie | null {
  if (!v || typeof v !== 'object') return null
  const i = v as Record<string, unknown>
  const lots = Array.isArray(i.lots)
    ? i.lots.map(lireLot).filter((l): l is LotImmeuble => l !== null).slice(0, MAX_LOTS)
    : []
  if (lots.length === 0) return null
  const p = (i.parametres && typeof i.parametres === 'object' ? i.parametres : {}) as Record<string, unknown>
  return {
    lots,
    parametres: {
      vacanceMeublePct: nombreOuNull(p.vacanceMeublePct) ?? PARAMETRES_COMMUNS_DEFAUT.vacanceMeublePct,
      vacanceColocationPct: nombreOuNull(p.vacanceColocationPct) ?? PARAMETRES_COMMUNS_DEFAUT.vacanceColocationPct,
      fraisGestionPct: nombreOuNull(p.fraisGestionPct) ?? PARAMETRES_COMMUNS_DEFAUT.fraisGestionPct,
      conciergeriePct: nombreOuNull(p.conciergeriePct) ?? PARAMETRES_COMMUNS_DEFAUT.conciergeriePct,
    },
    chargesPropres: i.chargesPropres === 'par_lot' ? 'par_lot' : 'global',
  }
}
