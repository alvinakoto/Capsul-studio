import { StyleSheet } from '@react-pdf/renderer'

// ─── Palette Capsul ───────────────────────────────────────────────────────────

export const colors = {
  navy:      '#16314e',
  navyLight: '#1e3e62',
  gold:      '#fcd57f',
  goldDeep:  '#c9a235',
  white:     '#ffffff',
  paper:     '#f6f4f1',
  ink:       '#1a1918',
  muted:     '#7a7872',
  rule:      '#e4e0d8',
  posGreen:  '#246b3e',
  negRed:    '#b83232',
}

// ─── Mesures (en points, 1pt = 1/72 inch) ────────────────────────────────────
// A4 = 595 × 842 points

export const sizes = {
  pageW: 595,
  pageH: 842,
  margin: 36,         // marge standard
  marginAccent: 38,   // marge + offset pour la barre or
  accentBar: 2,       // largeur de la barre or
}

// ─── Styles communs aux pages ────────────────────────────────────────────────

export const common = StyleSheet.create({
  page: {
    fontFamily: 'Montserrat',
    fontWeight: 400,
    fontSize: 9,
    color: colors.ink,
    backgroundColor: colors.white,
  },

  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: sizes.accentBar,
    backgroundColor: colors.gold,
  },

  // ─── Header ─────────────────────────────────────────────────────────────────
  header: {
    height: 38,
    paddingHorizontal: sizes.margin,
    paddingLeft: sizes.marginAccent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: `0.5pt solid ${colors.rule}`,
  },
  headerLogo: {
    fontSize: 7,
    fontWeight: 800,
    letterSpacing: 2,
    color: colors.navy,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  eyebrow: {
    fontSize: 6,
    fontWeight: 500,
    letterSpacing: 1.5,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  pageNum: {
    fontSize: 6.5,
    fontWeight: 700,
    color: colors.navy,
    letterSpacing: 0.8,
  },

  // ─── Footer ─────────────────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 32,
    paddingHorizontal: sizes.margin,
    paddingLeft: sizes.marginAccent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTop: `0.5pt solid ${colors.rule}`,
  },
  footerL: {
    fontSize: 6,
    fontWeight: 300,
    color: colors.muted,
  },
  footerR: {
    fontSize: 6,
    fontWeight: 700,
    color: colors.navy,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // ─── Section labels ─────────────────────────────────────────────────────────
  secLabel: {
    fontSize: 6,
    fontWeight: 600,
    letterSpacing: 1.5,
    color: colors.navy,
    textTransform: 'uppercase',
    paddingBottom: 7,
    borderBottom: `1.2pt solid ${colors.navy}`,
    marginBottom: 10,
  },
})