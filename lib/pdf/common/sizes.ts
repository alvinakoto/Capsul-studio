// ─── Mesures (en points, 1pt = 1/72 inch) ────────────────────────────────────
// A4 = 595 × 842 points. Module sans dépendance à react-pdf : importable côté
// navigateur (aperçu de l'écran Villes) comme côté PDF (via styles.ts).

export const sizes = {
  pageW: 595,
  pageH: 842,
  margin: 36,         // marge standard
  marginAccent: 38,   // marge + offset pour la barre or
  accentBar: 2,       // largeur de la barre or
}
