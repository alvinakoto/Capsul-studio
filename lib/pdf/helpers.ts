/**
 * Remplace les espaces insécables (U+00A0) et insécables fines (U+202F)
 * par des espaces classiques. Montserrat n'a pas de glyphe pour ces
 * caractères dans react-pdf, ce qui produit un caractère de fallback
 * (barre verticale) à l'affichage.
 */
export function stripNbsp(s: string): string {
  return s.replace(/[\u00A0\u202F]/g, ' ')
}

/**
 * Formate un nombre en euros avec séparateurs FR.
 * Ex: 230000 → "230 000 €"
 */
export function euros(n: number | null | undefined, withUnit = true): string {
  if (n === null || n === undefined) return '—'
  const rounded = Math.round(n)
  const formatted = stripNbsp(rounded.toLocaleString('fr-FR'))
  return withUnit ? `${formatted} €` : formatted
}

/**
 * Formate un pourcentage.
 * Ex: 6.8 → "6,8 %"
 */
export function pct(n: number | null | undefined, decimals = 2): string {
  if (n === null || n === undefined) return '—'
  return stripNbsp(`${n.toFixed(decimals).replace('.', ',')} %`)
}

/**
 * Formate un entier avec séparateurs FR, sans unité.
 * Ex: 179992 → "179 992"
 */
export function nombre(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—'
  return stripNbsp(Math.round(n).toLocaleString('fr-FR'))
}

/**
 * Numéro de page sur deux chiffres pour l'en-tête. Ex: 3 → "03"
 */
export function pageNum(n: number): string {
  return String(n).padStart(2, '0')
}

/**
 * Affiche un tiret discret si la valeur est null/undefined/empty.
 */
export function orDash(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === '') return '—'
  return String(v)
}