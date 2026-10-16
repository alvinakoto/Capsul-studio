// Statuts de projet : libellé et couleurs, partagés par l'en-tête projet,
// les cartes et les filtres du dashboard.

export type StatutProjet = 'draft' | 'simulation' | 'validated' | 'archived'

export const STATUS_CONFIG: Record<StatutProjet, { label: string; bg: string; color: string; dot: string }> = {
  draft:      { label: 'Brouillon',  bg: '#F0EDE7', color: '#6E6E73', dot: '#6E6E73' },
  simulation: { label: 'Simulation', bg: '#F6EEDF', color: '#946A22', dot: '#C9943A' },
  validated:  { label: 'Validé',     bg: '#E6EAF0', color: '#0E2240', dot: '#0E2240' },
  archived:   { label: 'Archivé',    bg: '#F0EDE7', color: '#8E8E93', dot: '#A5A5AA' },
}

export const STATUS_ORDER: StatutProjet[] = ['draft', 'simulation', 'validated', 'archived']

export function statusConfig(status: string | null | undefined) {
  return STATUS_CONFIG[(status as StatutProjet) ?? 'draft'] ?? STATUS_CONFIG.draft
}
