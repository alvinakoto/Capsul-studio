import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { DiagnosticPayload } from '../types';
import { fmtInt } from '../format';
import { getProjectionTable, getPlusValueEstimee } from '../calculations';
import { interiorBase, PageHeader, PageFooter, SectionHeader } from './PageChrome';

const s = StyleSheet.create({
  barsBox: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 18, flexDirection: 'column', gap: 11 },
  barsTitle: { fontSize: 10, fontFamily: 'Montserrat', fontWeight: 700, letterSpacing: 0.6, color: '#94A3B8', marginBottom: 2 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barYear: { fontSize: 10, fontFamily: 'Montserrat', fontWeight: 700, color: '#64748B', width: 48 },
  barTrack: { flex: 1, height: 16, backgroundColor: '#E2E8F0', borderRadius: 8, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#2563EB', borderRadius: 8 },
  barAmount: { fontSize: 11, fontFamily: 'Montserrat', fontWeight: 700, color: '#1E293B', width: 76, textAlign: 'right' },
  barPct: { fontSize: 9, color: '#94A3B8', width: 32, textAlign: 'right' },

  table: { width: '100%' },
  tHeadRow: { flexDirection: 'row', backgroundColor: '#16314E' },
  tHeadCell: { flex: 1, padding: '8 10', fontSize: 8.5, fontFamily: 'Montserrat', fontWeight: 700, color: '#FFFFFF', letterSpacing: 0.3 },
  tRow: { flexDirection: 'row' },
  tRowEven: { backgroundColor: '#F8FAFC' },
  tCell: { flex: 1, padding: '8 10', fontSize: 10, color: '#334155', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  tCellFirst: { fontFamily: 'Montserrat', fontWeight: 700, color: '#0F172A' },

  year5Grid: { flexDirection: 'row', gap: 10 },
  year5Card: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center' },
  year5Label: { fontSize: 9, fontFamily: 'Montserrat', fontWeight: 700, marginBottom: 6, textAlign: 'center' },
  year5Value: { fontSize: 17, fontFamily: 'Montserrat', fontWeight: 700, color: '#0F172A' },
  year5Sub: { fontSize: 9, color: '#94A3B8', marginTop: 3, textAlign: 'center' },

  appreciationNote: { backgroundColor: '#EFF6FF', borderRadius: 10, padding: '12 16', borderLeftWidth: 3, borderLeftColor: '#2563EB' },
  appreciationText: { fontSize: 9.5, color: '#475569', lineHeight: 1.55 },
});

export function PageProjection({ p }: { p: DiagnosticPayload }) {
  const rows = getProjectionTable(p);
  const plusValue = getPlusValueEstimee(p);
  const last = rows[rows.length - 1];

  return (
    <Page size="A4" style={interiorBase.page}>
      <PageHeader section="Projection 5 ans" p={p} />
      <View style={interiorBase.content}>
        <SectionHeader
          title="Évolution de votre patrimoine sur 5 ans"
          subtitle="Capital remboursé, flux de trésorerie cumulés et patrimoine net estimé"
        />

        <View style={s.barsBox}>
          <Text style={s.barsTitle}>
            CAPITAL REMBOURSÉ (CUMULÉ) — SUR {fmtInt(p.capitalEmprunte)} € EMPRUNTÉS
          </Text>
          {rows.map((row) => (
            <View key={row.annee} style={s.barRow}>
              <Text style={s.barYear}>Année {row.annee}</Text>
              <View style={s.barTrack}>
                <View style={[s.barFill, { width: `${row.pctCapital}%` }]} />
              </View>
              <Text style={s.barAmount}>{fmtInt(row.cumulCapital)} €</Text>
              <Text style={s.barPct}>{row.pctCapital} %</Text>
            </View>
          ))}
        </View>

        <View>
          <SectionHeader title="Tableau récapitulatif" />
          <View style={[s.table, { marginTop: 12 }]}>
            <View style={s.tHeadRow}>
              <Text style={s.tHeadCell}>ANNÉE</Text>
              <Text style={[s.tHeadCell, { textAlign: 'right' }]}>CAPITAL REMBOURSÉ (CUMULÉ)</Text>
              <Text style={[s.tHeadCell, { textAlign: 'right' }]}>CASH-FLOW CUMULÉ</Text>
              <Text style={[s.tHeadCell, { textAlign: 'right' }]}>PATRIMOINE NET ESTIMÉ</Text>
            </View>
            {rows.map((row, i) => (
              <View key={row.annee} style={[s.tRow, i % 2 === 1 ? s.tRowEven : {}]}>
                <Text style={[s.tCell, s.tCellFirst]}>Année {row.annee}</Text>
                <Text style={[s.tCell, { textAlign: 'right', fontFamily: 'Montserrat', fontWeight: 700 }]}>
                  {fmtInt(row.cumulCapital)} €
                </Text>
                <Text
                  style={[
                    s.tCell,
                    { textAlign: 'right', fontFamily: 'Montserrat', fontWeight: 700, color: row.cashFlowCumule >= 0 ? '#16A34A' : '#DC2626' },
                  ]}
                >
                  {fmtInt(row.cashFlowCumule)} €
                </Text>
                <Text style={[s.tCell, { textAlign: 'right', fontFamily: 'Montserrat', fontWeight: 700, color: '#1D4ED8' }]}>
                  {fmtInt(row.patrimoineNet)} €
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.year5Grid}>
          <View style={[s.year5Card, { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' }]}>
            <Text style={[s.year5Label, { color: '#1D4ED8' }]}>CAPITAL REMBOURSÉ EN 5 ANS</Text>
            <Text style={s.year5Value}>{fmtInt(last.cumulCapital)} €</Text>
            <Text style={s.year5Sub}>payé par vos locataires</Text>
          </View>
          <View style={[s.year5Card, { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' }]}>
            <Text style={[s.year5Label, { color: '#DC2626' }]}>EFFORT DE TRÉSORERIE CUMULÉ</Text>
            <Text style={s.year5Value}>{fmtInt(last.cashFlowCumule)} €</Text>
            <Text style={s.year5Sub}>
              {last.cashFlowCumule < 0 ? 'votre mise personnelle sur 5 ans' : 'gain de trésorerie sur 5 ans'}
            </Text>
          </View>
          <View style={[s.year5Card, { backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0' }]}>
            <Text style={[s.year5Label, { color: '#16A34A' }]}>PATRIMOINE NET ESTIMÉ</Text>
            <Text style={s.year5Value}>{fmtInt(last.patrimoineNet)} €</Text>
            <Text style={s.year5Sub}>apport + capital remboursé</Text>
          </View>
        </View>

        <View style={s.appreciationNote}>
          <Text style={s.appreciationText}>
            Et si le bien prenait de la valeur ? Cette projection est
            volontairement conservatrice : elle ne tient pas compte d'une
            revalorisation du bien. En France, l'immobilier résidentiel a
            progressé en moyenne de 2 à 3 % par an sur les 20 dernières
            années. Une appréciation modeste de 2 %/an sur votre bien de{' '}
            {fmtInt(p.prixBien)} € représenterait environ {fmtInt(plusValue)} €
            de plus-value supplémentaire à l'issue de 5 ans — sans effort
            additionnel de votre part.
          </Text>
        </View>
      </View>
      <PageFooter p={p} page={5} />
    </Page>
  );
}
