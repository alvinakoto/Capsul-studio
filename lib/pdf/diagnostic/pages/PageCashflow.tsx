import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { DiagnosticPayload } from '../types';
import { fmtInt } from '../format';
import { getDepensesAnnuelles, getTaxeMois, getAssuranceMois, getVacanceEuros } from '../calculations';
import { VERDICT_COLORS } from '../styles';
import { interiorBase, PageHeader, PageFooter, SectionHeader } from './PageChrome';

const s = StyleSheet.create({
  columns: { flexDirection: 'row', gap: 14 },
  col: { flex: 1, borderRadius: 12 },
  colHeader: { padding: '10 14', flexDirection: 'row', alignItems: 'center' },
  colHeaderLabel: { fontSize: 9, fontFamily: 'Montserrat', fontWeight: 700, letterSpacing: 0.6 },
  colHeaderAmount: { marginLeft: 'auto', fontSize: 13, fontFamily: 'Montserrat', fontWeight: 700 },
  colBody: { borderWidth: 1, borderColor: '#E2E8F0', borderTopWidth: 0 },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '8 14', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  itemEven: { backgroundColor: '#F8FAFC' },
  itemLabel: { fontSize: 11, color: '#475569' },
  itemNote: { fontSize: 8, color: '#94A3B8', marginTop: 1 },
  itemValue: { fontSize: 12, fontFamily: 'Montserrat', fontWeight: 700, color: '#1E293B' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '10 14', fontFamily: 'Montserrat', fontWeight: 700 },

  result: { borderRadius: 14, padding: '18 20', borderWidth: 2, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultLabel: { fontSize: 9, fontFamily: 'Montserrat', fontWeight: 700, letterSpacing: 0.6, color: '#94A3B8' },
  resultFormula: { fontSize: 11, color: '#64748B', marginTop: 2 },
  resultValue: { fontSize: 38, fontFamily: 'Montserrat', fontWeight: 700, marginTop: 2 },
  resultAnnualLabel: { fontSize: 9, color: '#94A3B8', marginBottom: 3, textAlign: 'right' },
  resultAnnualValue: { fontSize: 17, fontFamily: 'Montserrat', fontWeight: 700, color: '#1E293B', textAlign: 'right' },

  bilanGrid: { flexDirection: 'row', gap: 10 },
  bilanCard: { flex: 1, borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1 },
  bilanLabel: { fontSize: 9, fontFamily: 'Montserrat', fontWeight: 700, marginBottom: 5, textAlign: 'center' },
  bilanValue: { fontSize: 16, fontFamily: 'Montserrat', fontWeight: 700, color: '#1E293B' },

  noteBox: { backgroundColor: '#F8FAFC', borderRadius: 8, padding: '10 14', borderLeftWidth: 3, borderLeftColor: '#CBD5E1' },
  noteText: { fontSize: 9.5, color: '#64748B', lineHeight: 1.5 },
});

export function PageCashflow({ p }: { p: DiagnosticPayload }) {
  const vacanceEuros = getVacanceEuros(p);
  const taxeMois = getTaxeMois(p);
  const assuranceMois = getAssuranceMois(p);
  const depensesAnnuelles = getDepensesAnnuelles(p);
  const vc = VERDICT_COLORS[p.verdictNiveau] ?? VERDICT_COLORS.neutre;
  const cfPositif = p.cashFlowMensuel >= 0;

  return (
    <Page size="A4" style={interiorBase.page}>
      <PageHeader section="Analyse cash-flow" p={p} />
      <View style={interiorBase.content}>
        <SectionHeader
          title="Recettes et dépenses mensuelles"
          subtitle="Décomposition détaillée de votre flux de trésorerie chaque mois"
        />

        <View style={s.columns}>
          {/* RECETTES */}
          <View style={s.col}>
            <View style={[s.colHeader, { backgroundColor: '#DCFCE7' }]}>
              <Text style={[s.colHeaderLabel, { color: '#166534' }]}>RECETTES</Text>
              <Text style={[s.colHeaderAmount, { color: '#166534' }]}>+ {fmtInt(p.recettesMensuelles)} €</Text>
            </View>
            <View style={s.colBody}>
              <View style={s.item}>
                <View>
                  <Text style={s.itemLabel}>Loyer mensuel brut</Text>
                </View>
                <Text style={s.itemValue}>{fmtInt(p.loyerMensuel)} €</Text>
              </View>
              <View style={[s.item, s.itemEven]}>
                <View>
                  <Text style={s.itemLabel}>Vacance locative</Text>
                  <Text style={s.itemNote}>5 % du loyer annuel estimé</Text>
                </View>
                <Text style={[s.itemValue, { color: '#EA580C' }]}>- {fmtInt(vacanceEuros)} €</Text>
              </View>
              <View style={[s.totalRow, { backgroundColor: '#F0FDF4', color: '#166534', borderTopWidth: 2, borderTopColor: '#BBF7D0' }]}>
                <Text style={{ color: '#166534', fontFamily: 'Montserrat', fontWeight: 700 }}>Loyer net mensuel</Text>
                <Text style={{ color: '#166534', fontFamily: 'Montserrat', fontWeight: 700 }}>{fmtInt(p.recettesMensuelles)} €</Text>
              </View>
            </View>
          </View>

          {/* DÉPENSES */}
          <View style={s.col}>
            <View style={[s.colHeader, { backgroundColor: '#FEE2E2' }]}>
              <Text style={[s.colHeaderLabel, { color: '#991B1B' }]}>DÉPENSES</Text>
              <Text style={[s.colHeaderAmount, { color: '#991B1B' }]}>- {fmtInt(p.depensesMensuelles)} €</Text>
            </View>
            <View style={s.colBody}>
              <View style={s.item}>
                <View>
                  <Text style={s.itemLabel}>Mensualité crédit</Text>
                  <Text style={s.itemNote}>capital + intérêts + assurance</Text>
                </View>
                <Text style={[s.itemValue, { color: '#DC2626' }]}>{fmtInt(p.mensualiteTotale)} €</Text>
              </View>
              <View style={[s.item, s.itemEven]}>
                <View>
                  <Text style={s.itemLabel}>Charges copropriété</Text>
                  <Text style={s.itemNote}>part propriétaire</Text>
                </View>
                <Text style={[s.itemValue, { color: '#DC2626' }]}>{fmtInt(p.chargesCoproMensuelles)} €</Text>
              </View>
              <View style={s.item}>
                <View>
                  <Text style={s.itemLabel}>Taxe foncière</Text>
                  <Text style={s.itemNote}>{fmtInt(p.taxeFonciere)} € / 12 mois</Text>
                </View>
                <Text style={[s.itemValue, { color: '#DC2626' }]}>{fmtInt(taxeMois)} €</Text>
              </View>
              <View style={[s.item, s.itemEven]}>
                <View>
                  <Text style={s.itemLabel}>Assurance PNO</Text>
                  <Text style={s.itemNote}>propriétaire non occupant</Text>
                </View>
                <Text style={[s.itemValue, { color: '#DC2626' }]}>{fmtInt(assuranceMois)} €</Text>
              </View>
              <View style={[s.totalRow, { backgroundColor: '#FFF1F2', color: '#9F1239', borderTopWidth: 2, borderTopColor: '#FECDD3' }]}>
                <Text style={{ color: '#9F1239', fontFamily: 'Montserrat', fontWeight: 700 }}>Total dépenses</Text>
                <Text style={{ color: '#9F1239', fontFamily: 'Montserrat', fontWeight: 700 }}>{fmtInt(p.depensesMensuelles)} €</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[s.result, { backgroundColor: vc.bg, borderColor: vc.border }]}>
          <View>
            <Text style={s.resultLabel}>CASH-FLOW MENSUEL NET</Text>
            <Text style={s.resultFormula}>
              {fmtInt(p.recettesMensuelles)} € recettes − {fmtInt(p.depensesMensuelles)} € dépenses
            </Text>
            <Text style={[s.resultValue, { color: cfPositif ? '#16A34A' : '#DC2626' }]}>{fmtInt(p.cashFlowMensuel)} €</Text>
          </View>
          <View>
            <Text style={s.resultAnnualLabel}>SUR 12 MOIS</Text>
            <Text style={s.resultAnnualValue}>{fmtInt(p.cashFlowAnnuel)} €/an</Text>
          </View>
        </View>

        <View>
          <SectionHeader title="Bilan sur 12 mois" />
          <View style={[s.bilanGrid, { marginTop: 12 }]}>
            <View style={[s.bilanCard, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
              <Text style={[s.bilanLabel, { color: '#16A34A' }]}>RECETTES ANNUELLES</Text>
              <Text style={s.bilanValue}>{fmtInt(p.loyerAnnuelNet)} €</Text>
            </View>
            <View style={[s.bilanCard, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
              <Text style={[s.bilanLabel, { color: '#DC2626' }]}>DÉPENSES ANNUELLES</Text>
              <Text style={s.bilanValue}>{fmtInt(depensesAnnuelles)} €</Text>
            </View>
            <View style={[s.bilanCard, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }]}>
              <Text style={[s.bilanLabel, { color: '#64748B' }]}>CASH-FLOW ANNUEL NET</Text>
              <Text style={s.bilanValue}>{fmtInt(p.cashFlowAnnuel)} €</Text>
            </View>
          </View>
        </View>

        <View style={s.noteBox}>
          <Text style={s.noteText}>
            Important : ce cash-flow est calculé avant impôt sur le revenu. Selon
            votre régime fiscal (micro-BIC, régime réel, LMNP), l'imposition sur
            les loyers peut représenter 10 à 30 % de vos recettes locatives.
            Consultez la page 6 pour les recommandations fiscales adaptées à
            votre profil.
          </Text>
        </View>
      </View>
      <PageFooter p={p} page={4} />
    </Page>
  );
}
