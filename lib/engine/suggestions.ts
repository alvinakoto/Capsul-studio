import { WizardState } from '@/components/wizard/WizardShell'

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

export function suggererScenarios(state: WizardState): Suggestion[] {
  const surface = Number(state.surface_m2) || 0
  const type = state.type_bien
  const ville = state.ville?.toLowerCase() || ''
  const villesTouristiques = ['paris', 'reims', 'toulouse', 'nancy', 'épernay']

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
  if (villesTouristiques.includes(ville)) scoreCourte += 20
  if (surface < 40) scoreCourte += 10

  return [
  {
    type: 'lmnp_meuble' as const,
    label: 'LMNP Meublé',
    raison: 'Régime fiscal avantageux grâce aux amortissements. Idéal pour les petites surfaces.',
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

export function detecterAlertes(state: WizardState): AlerteReglementaire[] {
  const alertes: AlerteReglementaire[] = []
  const dpe = state.dpe_actuel
  const ville = state.ville?.toLowerCase() || ''

  // ─── Passoire thermique
  if (dpe === 'G') {
    alertes.push({
      niveau: 'error',
      titre: 'DPE G — Location interdite',
      message: 'Les logements classés G sont interdits à la location depuis le 1er janvier 2025. Des travaux de rénovation énergétique sont nécessaires avant toute mise en location.',
    })
  } else if (dpe === 'F') {
    alertes.push({
      niveau: 'warning',
      titre: 'DPE F — Passoire thermique',
      message: 'Les logements classés F seront interdits à la location à partir de 2028. Prévoir un budget travaux pour améliorer la performance énergétique.',
    })
  } else if (dpe === 'E') {
    alertes.push({
      niveau: 'warning',
      titre: 'DPE E — Attention à l\'échéance 2034',
      message: 'Les logements classés E seront interdits à la location à partir de 2034. Anticipez les travaux dans votre plan d\'investissement.',
    })
  }

  // ─── Courte durée en zone tendue
  if (['paris', 'reims', 'toulouse', 'nancy'].includes(ville)) {

    alertes.push({
      niveau: 'warning',
      titre: 'Zone tendue — Réglementation courte durée',
      message: `${state.ville} est soumis à des restrictions sur la location courte durée. Une déclaration en mairie et une compensation peuvent être requises.`,
    })
  }

  // ─── Zones ABF (alerte générique si travaux)
  const travaux = Number(state.travaux) || 0
  if (travaux > 0) {
    alertes.push({
      niveau: 'warning',
      titre: 'Travaux — Vérifier zone ABF',
      message: 'Si le bien est situé en zone protégée (ABF, site patrimonial), les travaux nécessitent une autorisation spéciale. Vérifier avec la mairie.',
    })
  }

  return alertes
}