import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { DiagnosticPayload } from '../types';
import { fmtInt, fmtPct } from '../format';
import { VERDICT_COLORS } from '../styles';
import {
  C, interiorBase, dS,
  PageHeader, PageFooter, SecLabel,
} from './PageChrome';

const s = StyleSheet.create({
  // KPI hero
  kpiRow: { flexDirection: 'row', gap: 10 },
  kpiMain: {
    flex: 2,
    backgroundColor: C.navy,
    borderRadius: 3,
    paddingTop: 18, paddingBottom: 18, paddingLeft: 20, paddingRight: 20,
  },
  kpiLabel: {
    fontSize: 6, fontWeight: 700, letterSpacing: 1.2,
    color: C.goldLight, textTransform: 'uppercase', marginBottom: 8,
  },
  kpiValue: { fontSize: 30, fontWeight: 700, color: C.white, marginBottom: 4 },
  kpiSub: { fontSize: 7.5, color: C.goldLight, fontWeight: 300 },

  kpiSide: { flex: 3, flexDirection: 'column', gap: 8 },
  kpiCard: {
    backgroundColor: C.paper,
    borderRadius: 3,
    paddingTop: 10, paddingBottom: 10, paddingLeft: 12, paddingRight: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottom: `0.5pt solid ${C.rule}`,
  },
  kpiCardLabel: { fontSize: 7, color: C.muted, fontWeight: 300 },
  kpiCardValue: { fontSize: 13, fontWeight: 700, color: C.navy },

  // Verdict
  verdictBox: {
    paddingTop: 10, paddingBottom: 10, paddingLeft: 14, paddingRight: 14,
    borderLeftWidth: 3,
  },
  verdictTitle: { fontSize: 10, fontWeight: 700, color: C.ink, marginBottom: 4 },
  verdictMsg: { fontSize: 8, color: C.muted, fontWeight: 300, lineHeight: 1.55 },

  // Params grid
  paramsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 0 },
  paramCell: {
    width: '33.33%',
    paddingTop: 8, paddingBottom: 8, paddingRight: 12,
    borderBottom: `0.5pt solid ${C.rule}`,
  },
  paramLabel: { fontSize: 6, color: C.muted, fontWeight: 300, marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.6 },
  paramValue: { fontSize: 10, fontWeight: 700, color: C.navy },
});

export function PageSynthese({ p }: { p: DiagnosticPayload }) {
  const vc = VERDICT_COLORS[p.verdictNiveau] ?? VERDICT_COLORS.neutre;
  const cfPos = p.cashFlowMensuel >= 0;

  return (
    <Page size="A4" style={interiorBase.page}>
      <PageHeader section="Synthèse exécutive" page={2} />
      <View style={interiorBase.content}>

        <SecLabel>Métriques clés</SecLabel>

        <View style={s.kpiRow}>
          <View style={s.kpiMain}>
            <Text style={s.kpiLabel}>Cash-flow mensuel</Text>
            <Text style={[s.kpiValue, { color: cfPos ? '#7ee8a2' : '#f5a5a5' }]}>
              {fmtInt(p.cashFlowMensuel)} €
            </Text>
            <Text style={s.kpiSub}>
              soit {fmtInt(p.cashFlowAnnuel)} € sur 12 mois
            </Text>
          </View>
          <View style={s.kpiSide}>
            <View style={s.kpiCard}>
              <Text style={s.kpiCardLabel}>Rentabilité brute</Text>
              <Text style={s.kpiCardValue}>{fmtPct(p.rentabiliteBrute)} %</Text>
            </View>
            <View style={s.kpiCard}>
              <Text style={s.kpiCardLabel}>Rentabilité nette</Text>
              <Text style={s.kpiCardValue}>{fmtPct(p.rentabiliteNette)} %</Text>
            </View>
            <View style={s.kpiCard}>
              <Text style={s.kpiCardLabel}>Mensualité totale</Text>
              <Text style={s.kpiCardValue}>{fmtInt(p.mensualiteTotale)} €/mois</Text>
            </View>
          </View>
        </View>

        <SecLabel>Financement</SecLabel>

        <View style={dS.introRow}>
          <View style={dS.introCell}>
            <Text style={dS.introLabel}>Coût total acquisition</Text>
            <Text style={dS.introValue}>{fmtInt(p.coutTotalAcquisition)} €</Text>
          </View>
          <View style={dS.introCell}>
            <Text style={dS.introLabel}>Capital emprunté</Text>
            <Text style={dS.introValue}>{fmtInt(p.capitalEmprunte)} €</Text>
          </View>
          <View style={dS.introCell}>
            <Text style={dS.introLabel}>Frais de notaire</Text>
            <Text style={dS.introValue}>{fmtInt(p.fraisNotaire)} €</Text>
          </View>
          <View style={dS.introCellLast}>
            <Text style={dS.introLabel}>Coût total du crédit</Text>
            <Text style={dS.introValue}>{fmtInt(p.coutTotalCredit)} €</Text>
          </View>
        </View>

        <SecLabel>Verdict</SecLabel>

        <View style={[s.verdictBox, { backgroundColor: vc.bg, borderLeftColor: vc.border }]}>
          <Text style={[s.verdictTitle, { color: vc.text }]}>{p.verdictTitre}</Text>
          <Text style={[s.verdictMsg, { color: vc.text }]}>{p.verdictMessage}</Text>
        </View>

        <SecLabel>Paramètres de simulation</SecLabel>

        <View style={s.paramsGrid}>
          {[
            { label: 'Prix du bien', value: `${fmtInt(p.prixBien)} €` },
            { label: 'Apport personnel', value: `${fmtInt(p.apport)} €` },
            { label: 'Durée du crédit', value: `${fmtInt(p.dureeAnnees)} ans` },
            { label: "Taux d'intérêt", value: `${fmtPct(p.tauxInteret)} %` },
            { label: 'Loyer mensuel', value: `${fmtInt(p.loyerMensuel)} €` },
            { label: 'Taxe foncière', value: `${fmtInt(p.taxeFonciere)} €/an` },
          ].map((item) => (
            <View key={item.label} style={s.paramCell}>
              <Text style={s.paramLabel}>{item.label}</Text>
              <Text style={s.paramValue}>{item.value}</Text>
            </View>
          ))}
        </View>

      </View>
      <PageFooter p={p} />
    </Page>
  );
}
