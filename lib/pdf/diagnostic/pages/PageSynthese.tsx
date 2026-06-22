import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { DiagnosticPayload } from '../types';
import { fmtInt, fmtPct } from '../format';
import { VERDICT_COLORS } from '../styles';
import { interiorBase, PageHeader, PageFooter, SectionHeader } from './PageChrome';

const s = StyleSheet.create({
  kpiGrid: { flexDirection: 'row', gap: 12 },
  kpiMain: { flex: 1, borderRadius: 14, padding: 22, justifyContent: 'center' },
  kpiLabel: { fontSize: 10, fontFamily: 'Montserrat', fontWeight: 700, letterSpacing: 0.6, opacity: 0.75, marginBottom: 8 },
  kpiValue: { fontSize: 38, fontFamily: 'Montserrat', fontWeight: 700, marginBottom: 4 },
  kpiSub: { fontSize: 12, opacity: 0.7 },
  sideCol: { flex: 1, flexDirection: 'column', gap: 10 },
  smallCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: '12 16',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  smallLabel: { fontSize: 11, color: '#64748B' },
  smallValue: { fontSize: 15, fontFamily: 'Montserrat', fontWeight: 700, color: '#0F172A' },

  financementGrid: { flexDirection: 'row', gap: 10 },
  financementCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  financementLabel: { fontSize: 9, color: '#94A3B8', fontFamily: 'Montserrat', fontWeight: 700, marginBottom: 6, textAlign: 'center' },
  financementValue: { fontSize: 14, fontFamily: 'Montserrat', fontWeight: 700, color: '#1E293B' },

  verdictBlock: { borderRadius: 12, padding: '16 18', flexDirection: 'row', gap: 12, borderLeftWidth: 4 },
  verdictIcon: { fontSize: 16, fontFamily: 'Montserrat', fontWeight: 700 },
  verdictTitle: { fontSize: 13, fontFamily: 'Montserrat', fontWeight: 700, color: '#0F172A', marginBottom: 3 },
  verdictMsg: { fontSize: 11, color: '#475569', lineHeight: 1.5 },

  paramsSection: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: '16 18' },
  paramsTitle: { fontSize: 10, fontFamily: 'Montserrat', fontWeight: 700, letterSpacing: 0.6, color: '#94A3B8', marginBottom: 10 },
  paramsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  paramItem: { width: '30%' },
  paramLabel: { fontSize: 10, color: '#94A3B8' },
  paramValue: { fontSize: 12, fontFamily: 'Montserrat', fontWeight: 700, color: '#334155' },
});

export function PageSynthese({ p }: { p: DiagnosticPayload }) {
  const vc = VERDICT_COLORS[p.verdictNiveau] ?? VERDICT_COLORS.neutre;
  const cfPositif = p.cashFlowMensuel >= 0;
  return (
    <Page size="A4" style={interiorBase.page}>
      <PageHeader section="Synthèse exécutive" p={p} />
      <View style={interiorBase.content}>
        <SectionHeader
          title="Votre projet en chiffres"
          subtitle="Métriques clés calculées sur la base de votre simulation"
        />

        <View style={s.kpiGrid}>
          <View style={[s.kpiMain, { backgroundColor: vc.bg }]}>
            <Text style={[s.kpiLabel, { color: vc.text }]}>CASH-FLOW MENSUEL</Text>
            <Text style={[s.kpiValue, { color: cfPositif ? '#16A34A' : '#DC2626' }]}>
              {fmtInt(p.cashFlowMensuel)} €
            </Text>
            <Text style={[s.kpiSub, { color: vc.text }]}>
              soit {fmtInt(p.cashFlowAnnuel)} € sur l'année
            </Text>
          </View>
          <View style={s.sideCol}>
            <View style={s.smallCard}>
              <Text style={s.smallLabel}>Rentabilité brute</Text>
              <Text style={s.smallValue}>{fmtPct(p.rentabiliteBrute)} %</Text>
            </View>
            <View style={s.smallCard}>
              <Text style={s.smallLabel}>Rentabilité nette</Text>
              <Text style={s.smallValue}>{fmtPct(p.rentabiliteNette)} %</Text>
            </View>
            <View style={s.smallCard}>
              <Text style={s.smallLabel}>Mensualité crédit</Text>
              <Text style={s.smallValue}>{fmtInt(p.mensualiteTotale)} €/mois</Text>
            </View>
          </View>
        </View>

        <View style={s.financementGrid}>
          <View style={s.financementCard}>
            <Text style={s.financementLabel}>COÛT TOTAL ACQUISITION</Text>
            <Text style={s.financementValue}>{fmtInt(p.coutTotalAcquisition)} €</Text>
          </View>
          <View style={s.financementCard}>
            <Text style={s.financementLabel}>CAPITAL EMPRUNTÉ</Text>
            <Text style={s.financementValue}>{fmtInt(p.capitalEmprunte)} €</Text>
          </View>
          <View style={s.financementCard}>
            <Text style={s.financementLabel}>FRAIS DE NOTAIRE</Text>
            <Text style={s.financementValue}>{fmtInt(p.fraisNotaire)} €</Text>
          </View>
          <View style={s.financementCard}>
            <Text style={s.financementLabel}>COÛT TOTAL DU CRÉDIT</Text>
            <Text style={s.financementValue}>{fmtInt(p.coutTotalCredit)} €</Text>
          </View>
        </View>

        <View style={[s.verdictBlock, { backgroundColor: vc.bg, borderLeftColor: vc.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={s.verdictTitle}>{p.verdictTitre}</Text>
            <Text style={s.verdictMsg}>{p.verdictMessage}</Text>
          </View>
        </View>

        <View style={s.paramsSection}>
          <Text style={s.paramsTitle}>PARAMÈTRES DE VOTRE SIMULATION</Text>
          <View style={s.paramsGrid}>
            <View style={s.paramItem}>
              <Text style={s.paramLabel}>Prix du bien</Text>
              <Text style={s.paramValue}>{fmtInt(p.prixBien)} €</Text>
            </View>
            <View style={s.paramItem}>
              <Text style={s.paramLabel}>Apport personnel</Text>
              <Text style={s.paramValue}>{fmtInt(p.apport)} €</Text>
            </View>
            <View style={s.paramItem}>
              <Text style={s.paramLabel}>Durée du crédit</Text>
              <Text style={s.paramValue}>{fmtInt(p.dureeAnnees)} ans</Text>
            </View>
            <View style={s.paramItem}>
              <Text style={s.paramLabel}>Taux d'intérêt</Text>
              <Text style={s.paramValue}>{fmtPct(p.tauxInteret)} %</Text>
            </View>
            <View style={s.paramItem}>
              <Text style={s.paramLabel}>Loyer mensuel</Text>
              <Text style={s.paramValue}>{fmtInt(p.loyerMensuel)} €</Text>
            </View>
            <View style={s.paramItem}>
              <Text style={s.paramLabel}>Taxe foncière</Text>
              <Text style={s.paramValue}>{fmtInt(p.taxeFonciere)} €/an</Text>
            </View>
          </View>
        </View>
      </View>
      <PageFooter p={p} page={2} />
    </Page>
  );
}
