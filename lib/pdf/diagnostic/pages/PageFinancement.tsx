import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { DiagnosticPayload } from '../types';
import { fmtInt } from '../format';
import { getAmortizationTable, getCoutGlobal, getMensualiteSplit } from '../calculations';
import { interiorBase, PageHeader, PageFooter, SectionHeader } from './PageChrome';

const s = StyleSheet.create({
  mensualiteGrid: { flexDirection: 'row', gap: 10 },
  mensualiteCard: { flex: 1, borderRadius: 12, padding: 14, flexDirection: 'column', gap: 5 },
  mensualiteLabel: { fontSize: 9, fontFamily: 'Montserrat', fontWeight: 700, letterSpacing: 0.6, opacity: 0.75 },
  mensualiteValue: { fontSize: 20, fontFamily: 'Montserrat', fontWeight: 700 },
  mensualiteSub: { fontSize: 9, opacity: 0.7 },

  repartitionSection: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: '16 18' },
  repartitionTitle: { fontSize: 10, fontFamily: 'Montserrat', fontWeight: 700, letterSpacing: 0.6, color: '#94A3B8', marginBottom: 12 },
  barWrap: { height: 12, borderRadius: 6, flexDirection: 'row', overflow: 'hidden', backgroundColor: '#E2E8F0', marginBottom: 12 },
  legend: { flexDirection: 'row', gap: 18 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  legendLabel: { fontSize: 10, color: '#475569' },
  legendValue: { fontSize: 10, fontFamily: 'Montserrat', fontWeight: 700, color: '#1E293B' },

  table: { width: '100%' },
  tHeadRow: { flexDirection: 'row', backgroundColor: '#16314E' },
  tHeadCell: { flex: 1, padding: '8 12', fontSize: 9, fontFamily: 'Montserrat', fontWeight: 700, color: '#FFFFFF', letterSpacing: 0.4 },
  tRow: { flexDirection: 'row' },
  tRowEven: { backgroundColor: '#F8FAFC' },
  tCell: { flex: 1, padding: '8 12', fontSize: 11, color: '#334155', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  tCellFirst: { fontFamily: 'Montserrat', fontWeight: 700, color: '#0F172A' },

  coutGrid: { flexDirection: 'row', gap: 10 },
  coutCard: { flex: 1, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 12, alignItems: 'center' },
  coutHighlight: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  coutLabel: { fontSize: 9, color: '#94A3B8', fontFamily: 'Montserrat', fontWeight: 700, marginBottom: 6, textAlign: 'center' },
  coutValue: { fontSize: 15, fontFamily: 'Montserrat', fontWeight: 700, color: '#1E293B' },
});

export function PageFinancement({ p }: { p: DiagnosticPayload }) {
  const split = getMensualiteSplit(p);
  const amort = getAmortizationTable(p);
  const global = getCoutGlobal(p);

  return (
    <Page size="A4" style={interiorBase.page}>
      <PageHeader section="Détail financement" p={p} />
      <View style={interiorBase.content}>
        <SectionHeader
          title="Décomposition de votre mensualité"
          subtitle={`Répartition des ${fmtInt(p.mensualiteTotale)} € que vous remboursez chaque mois`}
        />

        <View style={s.mensualiteGrid}>
          <View style={[s.mensualiteCard, { backgroundColor: '#16314E' }]}>
            <Text style={[s.mensualiteLabel, { color: '#FFFFFF' }]}>MENSUALITÉ TOTALE</Text>
            <Text style={[s.mensualiteValue, { color: '#FFFFFF' }]}>{fmtInt(p.mensualiteTotale)} €</Text>
            <Text style={[s.mensualiteSub, { color: '#FFFFFF' }]}>chaque mois pendant {fmtInt(p.dureeAnnees)} ans</Text>
          </View>
          <View style={[s.mensualiteCard, { backgroundColor: '#EFF6FF' }]}>
            <Text style={[s.mensualiteLabel, { color: '#1E40AF' }]}>DONT CAPITAL</Text>
            <Text style={[s.mensualiteValue, { color: '#1E40AF' }]}>{fmtInt(p.capitalMois)} €</Text>
            <Text style={[s.mensualiteSub, { color: '#1E40AF' }]}>remboursement du prêt</Text>
          </View>
          <View style={[s.mensualiteCard, { backgroundColor: '#FFF7ED' }]}>
            <Text style={[s.mensualiteLabel, { color: '#9A3412' }]}>DONT INTÉRÊTS</Text>
            <Text style={[s.mensualiteValue, { color: '#9A3412' }]}>{fmtInt(p.interetsMois)} €</Text>
            <Text style={[s.mensualiteSub, { color: '#9A3412' }]}>coût du crédit mensuel</Text>
          </View>
          <View style={[s.mensualiteCard, { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' }]}>
            <Text style={[s.mensualiteLabel, { color: '#334155' }]}>DONT ASSURANCE</Text>
            <Text style={[s.mensualiteValue, { color: '#334155' }]}>{fmtInt(p.assuranceMensuelle)} €</Text>
            <Text style={[s.mensualiteSub, { color: '#334155' }]}>assurance emprunteur</Text>
          </View>
        </View>

        <View style={s.repartitionSection}>
          <Text style={s.repartitionTitle}>RÉPARTITION VISUELLE — ANNÉE 1</Text>
          <View style={s.barWrap}>
            <View style={{ width: `${split.pctCapital}%`, backgroundColor: '#2563EB' }} />
            <View style={{ width: `${split.pctInterets}%`, backgroundColor: '#F97316' }} />
            <View style={{ width: `${split.pctAssurance}%`, backgroundColor: '#94A3B8' }} />
          </View>
          <View style={s.legend}>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: '#2563EB' }]} />
              <Text style={s.legendLabel}>Capital remboursé</Text>
              <Text style={s.legendValue}>{split.pctCapital} %</Text>
            </View>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: '#F97316' }]} />
              <Text style={s.legendLabel}>Intérêts</Text>
              <Text style={s.legendValue}>{split.pctInterets} %</Text>
            </View>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: '#94A3B8' }]} />
              <Text style={s.legendLabel}>Assurance</Text>
              <Text style={s.legendValue}>{split.pctAssurance} %</Text>
            </View>
          </View>
        </View>

        <View>
          <SectionHeader
            title="Tableau d'amortissement — 5 premières années"
            subtitle="Évolution du capital restant dû et des intérêts payés"
          />
          <View style={[s.table, { marginTop: 12 }]}>
            <View style={s.tHeadRow}>
              <Text style={s.tHeadCell}>ANNÉE</Text>
              <Text style={[s.tHeadCell, { textAlign: 'right' }]}>CAPITAL REMBOURSÉ</Text>
              <Text style={[s.tHeadCell, { textAlign: 'right' }]}>INTÉRÊTS PAYÉS</Text>
              <Text style={[s.tHeadCell, { textAlign: 'right' }]}>CAPITAL RESTANT DÛ</Text>
            </View>
            {amort.map((row, i) => (
              <View key={row.annee} style={[s.tRow, i % 2 === 1 ? s.tRowEven : {}]}>
                <Text style={[s.tCell, s.tCellFirst]}>Année {row.annee}</Text>
                <Text style={[s.tCell, { textAlign: 'right', color: '#1D4ED8', fontFamily: 'Montserrat', fontWeight: 700 }]}>
                  {fmtInt(row.capitalRembourse)} €
                </Text>
                <Text style={[s.tCell, { textAlign: 'right', color: '#EA580C', fontFamily: 'Montserrat', fontWeight: 700 }]}>
                  {fmtInt(row.interetsPayes)} €
                </Text>
                <Text style={[s.tCell, { textAlign: 'right', color: '#475569', fontFamily: 'Montserrat', fontWeight: 700 }]}>
                  {fmtInt(row.capitalRestantDu)} €
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.coutGrid}>
          <View style={s.coutCard}>
            <Text style={s.coutLabel}>CAPITAL EMPRUNTÉ</Text>
            <Text style={s.coutValue}>{fmtInt(global.capitalEmprunte)} €</Text>
          </View>
          <View style={[s.coutCard, s.coutHighlight]}>
            <Text style={[s.coutLabel, { color: '#F87171' }]}>COÛT TOTAL DES INTÉRÊTS</Text>
            <Text style={[s.coutValue, { color: '#991B1B' }]}>{fmtInt(global.coutTotalCredit)} €</Text>
          </View>
          <View style={s.coutCard}>
            <Text style={s.coutLabel}>TOTAL REMBOURSÉ</Text>
            <Text style={s.coutValue}>{fmtInt(global.totalRembourse)} €</Text>
          </View>
        </View>
      </View>
      <PageFooter p={p} page={3} />
    </Page>
  );
}
