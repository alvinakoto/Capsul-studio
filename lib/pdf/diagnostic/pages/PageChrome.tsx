import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { DiagnosticPayload } from '../types';

// ─── Palette Capsul (identique à lib/pdf/common/styles.ts) ───────────────────
export const C = {
  navy:      '#16314e',
  gold:      '#e6b64c',
  goldLight: '#fcd57f',
  paper:     '#f6f4f1',
  ink:       '#1a1918',
  muted:     '#7a7872',
  rule:      '#e4e0d8',
  green:     '#246b3e',
  red:       '#b83232',
  white:     '#ffffff',
} as const;

// ─── Chrome commun ─────────────────────────────────────────────────────────────
export const interiorBase = StyleSheet.create({
  page: {
    backgroundColor: C.white,
    color: C.ink,
    fontFamily: 'Montserrat',
    fontWeight: 400,
    fontSize: 9,
    flexDirection: 'column',
  },
  accentBar: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: 2,
    backgroundColor: C.gold,
  },
  header: {
    height: 38,
    paddingLeft: 38,
    paddingRight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: `0.5pt solid ${C.rule}`,
  },
  headerLogo: {
    fontSize: 7,
    fontWeight: 800,
    letterSpacing: 2,
    color: C.navy,
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
    color: C.muted,
    textTransform: 'uppercase',
  },
  pageNum: {
    fontSize: 6.5,
    fontWeight: 700,
    color: C.navy,
    letterSpacing: 0.8,
  },
  content: {
    flexGrow: 1,
    paddingLeft: 38,
    paddingRight: 36,
    paddingTop: 14,
    paddingBottom: 40,
    flexDirection: 'column',
    gap: 13,
  },
  footer: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    height: 32,
    paddingLeft: 38,
    paddingRight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTop: `0.5pt solid ${C.rule}`,
  },
  footerL: { fontSize: 6, fontWeight: 300, color: C.muted },
  footerR: { fontSize: 6, fontWeight: 700, color: C.navy, letterSpacing: 1.5, textTransform: 'uppercase' },
});

// ─── Styles partagés entre pages ───────────────────────────────────────────────
export const dS = StyleSheet.create({
  // Section labels (style rapport)
  secLabel: {
    fontSize: 6,
    fontWeight: 700,
    letterSpacing: 1.5,
    color: C.navy,
    textTransform: 'uppercase',
    paddingBottom: 6,
    borderBottom: `1.2pt solid ${C.navy}`,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: C.navy,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 8,
    color: C.muted,
    fontWeight: 300,
  },

  // Tableaux (style rapport : header navy / texte goldLight)
  tHead: { flexDirection: 'row', backgroundColor: C.navy },
  tHeadCell: {
    flex: 1,
    paddingTop: 7, paddingBottom: 7, paddingLeft: 8, paddingRight: 8,
    fontSize: 6,
    fontWeight: 700,
    color: C.goldLight,
    letterSpacing: 0.4,
  },
  tRow: {
    flexDirection: 'row',
    borderBottom: `0.5pt solid ${C.rule}`,
  },
  tRowAlt: { backgroundColor: C.paper },
  tCell: {
    flex: 1,
    paddingTop: 7, paddingBottom: 7, paddingLeft: 8, paddingRight: 8,
    fontSize: 8,
    color: C.ink,
    fontWeight: 300,
  },
  tCellBold: {
    flex: 1,
    paddingTop: 7, paddingBottom: 7, paddingLeft: 8, paddingRight: 8,
    fontSize: 8,
    color: C.navy,
    fontWeight: 700,
  },
  tCellR: { textAlign: 'right' },
  tTotal: {
    flexDirection: 'row',
    backgroundColor: C.navy,
    marginTop: 1,
  },
  tTotalLabel: {
    flex: 1,
    paddingTop: 8, paddingBottom: 8, paddingLeft: 8, paddingRight: 8,
    fontSize: 7,
    fontWeight: 700,
    color: C.goldLight,
  },
  tTotalVal: {
    flex: 1,
    paddingTop: 8, paddingBottom: 8, paddingLeft: 8, paddingRight: 8,
    fontSize: 7,
    fontWeight: 700,
    color: C.white,
    textAlign: 'right',
  },

  // Cellules intro (style rapport)
  introRow: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
  introCell: {
    flex: 1,
    backgroundColor: C.paper,
    paddingTop: 9, paddingBottom: 9, paddingLeft: 10, paddingRight: 10,
    borderRight: `0.5pt solid ${C.rule}`,
  },
  introCellLast: {
    flex: 1,
    backgroundColor: C.paper,
    paddingTop: 9, paddingBottom: 9, paddingLeft: 10, paddingRight: 10,
  },
  introLabel: {
    fontSize: 5.5,
    color: C.muted,
    fontWeight: 300,
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  introValue: {
    fontSize: 13,
    fontWeight: 700,
    color: C.navy,
  },

  // Note / callout
  noteBox: {
    backgroundColor: C.paper,
    paddingTop: 9, paddingBottom: 9, paddingLeft: 12, paddingRight: 12,
    borderLeftWidth: 2,
    borderLeftColor: C.navy,
  },
  noteText: {
    fontSize: 7.5,
    color: C.muted,
    fontWeight: 300,
    lineHeight: 1.55,
  },

  // Ligne clé-valeur (style rapport)
  kvRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4, paddingBottom: 4,
    borderBottom: `0.5pt solid ${C.rule}`,
  },
  kvLabel: { fontSize: 7.5, color: C.ink, fontWeight: 300 },
  kvValue: { fontSize: 7.5, fontWeight: 600, color: C.ink, textAlign: 'right' },
  kvValuePos: { fontSize: 7.5, fontWeight: 700, color: C.green, textAlign: 'right' },
  kvValueNeg: { fontSize: 7.5, fontWeight: 700, color: C.red, textAlign: 'right' },
  kvBoldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4, paddingBottom: 4,
    borderBottom: `0.5pt solid ${C.rule}`,
    backgroundColor: C.paper,
  },
  kvBoldLabel: { fontSize: 7.5, color: C.ink, fontWeight: 600 },
  kvBoldValue: { fontSize: 7.5, fontWeight: 700, color: C.navy, textAlign: 'right' },
});

// ─── Composants chrome ─────────────────────────────────────────────────────────

export function PageHeader({ section, page }: { section: string; page: number }) {
  return (
    <>
      <View style={interiorBase.accentBar} />
      <View style={interiorBase.header}>
        <Text style={interiorBase.headerLogo}>CAPSUL</Text>
        <View style={interiorBase.headerRight}>
          <Text style={interiorBase.eyebrow}>{section}</Text>
          <Text style={interiorBase.pageNum}>{String(page).padStart(2, '0')}</Text>
        </View>
      </View>
    </>
  );
}

export function PageFooter({ p }: { p: DiagnosticPayload }) {
  return (
    <View style={interiorBase.footer}>
      <Text style={interiorBase.footerL}>
        Rapport confidentiel — {p.prenom} — {p.dateRapport}
      </Text>
      <Text style={interiorBase.footerR}>capsul-france.com</Text>
    </View>
  );
}

export function SecLabel({ children }: { children: string }) {
  return <Text style={dS.secLabel}>{children}</Text>;
}

export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View>
      <Text style={dS.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={dS.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function KvRow({
  label, value, bold, pos, neg,
}: {
  label: string; value: string; bold?: boolean; pos?: boolean; neg?: boolean;
}) {
  if (bold) {
    return (
      <View style={dS.kvBoldRow}>
        <Text style={dS.kvBoldLabel}>{label}</Text>
        <Text style={[dS.kvBoldValue, pos ? { color: C.green } : neg ? { color: C.red } : {}]}>
          {value}
        </Text>
      </View>
    );
  }
  return (
    <View style={dS.kvRow}>
      <Text style={dS.kvLabel}>{label}</Text>
      <Text style={pos ? dS.kvValuePos : neg ? dS.kvValueNeg : dS.kvValue}>{value}</Text>
    </View>
  );
}
