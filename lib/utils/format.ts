// Formatage des montants à l'écran (pendant UI de lib/pdf/helpers.ts).
// Les espaces insécables de toLocaleString('fr-FR') sont gardés : contrairement
// au PDF, le navigateur les rend correctement et ils évitent qu'un montant soit
// coupé en fin de ligne.

export function euros(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  return Math.round(n).toLocaleString('fr-FR') + ' €'
}

/** Montant signé, « + 1 568 € » / « − 212 € » (vrai signe moins). */
export function eurosSigne(n: number): string {
  const abs = Math.abs(Math.round(n)).toLocaleString('fr-FR') + ' €'
  return (n < 0 ? '− ' : '+ ') + abs
}

export function pct(n: number | null | undefined, decimales = 2): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  return n.toLocaleString('fr-FR', { minimumFractionDigits: decimales, maximumFractionDigits: decimales }) + ' %'
}
