import { WizardState } from '@/components/wizard/WizardShell'
import { libelleLot, type LotImmeuble } from '@/lib/data/immeuble'

export type TypeScenario = 'lmnp_meuble' | 'colocation' | 'courte_duree'

export interface Suggestion {
  type: TypeScenario
  label: string
  raison: string
  score: number
}

export interface AlerteReglementaire {
  niveau: 'warning' | 'error'
  titre: string
  message: string
}

/**
 * `villeTouristique` : case « Ville touristique » de la ville dans le catalogue
 * (écran Villes), qui remplace l'ancienne liste de villes écrite en dur.
 */
export function suggererScenarios(state: WizardState, villeTouristique: boolean): Suggestion[] {
  return suggererPourBien(state.type_bien, Number(state.surface_m2) || 0, villeTouristique)
}

/** Suggestion pour un lot d'immeuble : mêmes critères qu'un bien simple, sur la typologie et la surface du lot. */
export function suggererPourLot(lot: LotImmeuble, villeTouristique: boolean): Suggestion[] {
  return suggererPourBien(lot.typeBien, lot.surfaceM2 ?? 0, villeTouristique)
}

function suggererPourBien(type: string, surface: number, villeTouristique: boolean): Suggestion[] {

  // LMNP meublé
  let scoreLMNP = 60
  if (['T1', 'studio', 'T2'].includes(type)) scoreLMNP += 15
  if (surface < 50) scoreLMNP += 10

  // Colocation
  let scoreColoc = 40
  if (['T3', 'T4', 'T5', 'T6+', 'maison', 'immeuble'].includes(type)) scoreColoc += 25
  if (type === 'immeuble') scoreColoc += 15  // immeuble = plusieurs lots, colocation naturelle
  if (surface >= 80) scoreColoc += 10

  // Courte durée
  let scoreCourte = 35
  if (['T1', 'studio', 'T2'].includes(type)) scoreCourte += 15
  if (type === 'immeuble') scoreCourte += 10  // plusieurs unités exploitables
  if (villeTouristique) scoreCourte += 20
  if (surface < 40) scoreCourte += 10

  return [
  {
    type: 'lmnp_meuble' as const,
    label: 'LMNP Meublé',
    raison: 'Meublé classique : forte demande locative sur les petites surfaces, gestion simple.',
    score: scoreLMNP,
  },
  {
    type: 'colocation' as const,
    label: 'Colocation',
    raison: 'Rendement optimisé par chambre. Idéal pour les grandes surfaces.',
    score: scoreColoc,
  },
  {
    type: 'courte_duree' as const,
    label: 'Courte durée',
    raison: 'Potentiel élevé sur les plateformes type Airbnb. Idéal en centre-ville.',
    score: scoreCourte,
  },
].sort((a, b) => b.score - a.score)
}

// ─── Alertes réglementaires ───────────────────────────────────────────────────

const MESSAGES_DPE: Record<'G' | 'F' | 'E', AlerteReglementaire> = {
  G: {
    niveau: 'error',
    titre: 'Location interdite (DPE G)',
    message: 'Les logements classés G sont interdits à la location depuis le 1er janvier 2025. Des travaux de rénovation énergétique sont nécessaires avant toute mise en location.',
  },
  F: {
    niveau: 'warning',
    titre: 'Passoire thermique (DPE F)',
    message: 'Les logements classés F seront interdits à la location à partir de 2028. Prévoir un budget travaux pour améliorer la performance énergétique.',
  },
  E: {
    niveau: 'warning',
    titre: 'DPE E : échéance 2034',
    message: 'Les logements classés E seront interdits à la location à partir de 2034. Anticipez les travaux dans votre plan d\'investissement.',
  },
}

/** Courte durée en zone tendue et zone ABF : ne dépendent pas du DPE. */
function alertesCommunes(state: WizardState): AlerteReglementaire[] {
  const alertes: AlerteReglementaire[] = []
  const ville = state.ville?.toLowerCase() || ''

  // ─── Courte durée en zone tendue
  if (['paris', 'reims', 'toulouse', 'nancy'].includes(ville)) {
    alertes.push({
      niveau: 'warning',
      titre: 'Réglementation courte durée en zone tendue',
      message: `${state.ville} est soumis à des restrictions sur la location courte durée. Une déclaration en mairie et une compensation peuvent être requises.`,
    })
  }

  // ─── Zones ABF (alerte générique si travaux)
  const travaux = Number(state.travaux) || 0
  if (travaux > 0) {
    alertes.push({
      niveau: 'warning',
      titre: 'Vérifier la zone ABF',
      message: 'Si le bien est situé en zone protégée (ABF, site patrimonial), les travaux nécessitent une autorisation spéciale. Vérifier avec la mairie.',
    })
  }
  return alertes
}

export function detecterAlertes(state: WizardState): AlerteReglementaire[] {
  const dpe = state.dpe_actuel
  const alerteDpe = dpe === 'G' || dpe === 'F' || dpe === 'E' ? [MESSAGES_DPE[dpe]] : []
  return [...alerteDpe, ...alertesCommunes(state)]
}

/** Immeuble : une alerte par classe DPE concernée, avec les lots qui y sont (« Lots 2 et 5 »). */
export function detecterAlertesImmeuble(state: WizardState, lots: LotImmeuble[]): AlerteReglementaire[] {
  const parClasse = (['G', 'F', 'E'] as const)
    .map((classe) => ({
      classe,
      noms: lots.map((l, i) => (l.dpeActuel === classe ? libelleLot(l, i) : null)).filter((n): n is string => n !== null),
    }))
    .filter(({ noms }) => noms.length > 0)
    .map(({ classe, noms }) => ({
      ...MESSAGES_DPE[classe],
      titre: `${MESSAGES_DPE[classe].titre} : ${noms.length > 1 ? `${noms.slice(0, -1).join(', ')} et ${noms[noms.length - 1]}` : noms[0]}`,
    }))
  return [...parClasse, ...alertesCommunes(state)]
}
