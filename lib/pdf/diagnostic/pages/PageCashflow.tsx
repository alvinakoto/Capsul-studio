import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { DiagnosticPayload } from '../types';
import { fmtInt } from '../format';
import { getDepensesAnnuelles, getTaxeMois, getAssuranceMois, getVacanceEuros } from '../calculations';
import { VERDICT_COLORS } from '../styles';
import {
  C, interiorBase, dS,
  PageHeader, PageFooter, SecLabel,
} from './PageChrome';

const s = StyleSheet.create({
  columns: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },

  colHead: {
    paddingTop: 8, paddingBottom: 8, paddingLeft: 12, paddingRight: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  colHeadLabel: { fontSize: 6, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase' },
  colHeadAmount: { fontSize: 11, fontWeight: 700 },

  colBody: { borderWidth: 1, borderColor: C.rule, borderTopWidth: 0 },
  item: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 7, paddingBottom: 7, paddingLeft: 10, paddingRight: 10,
    borderBottom: `0.5pt solid ${C.rule}`,
  },
  itemAlt: { backgroundColor: C.paper },
  itemLabel: { fontSize: 8, color: C.ink, fontWeight: 300 },
  itemNote: { fontSize: 6.5, color: C.muted, fontWeight: 300, marginTop: 1 },
  itemValue: { fontSize: 9, fontWeight: 700, color: C.navy },

  colFoot: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 8, paddingBottom: 8, paddingLeft: 10, paddingRight: 10,
    borderTopWidth: 1,
  },
  colFootLabel: { fontSize: 7.5, fontWeight: 700 },
  colFootValue: { fontSize: 10, fontWeight: 700 },

  // Résultat net
  resultBox: {
    paddingTop: 14, paddingBottom: 14, paddingLeft: 18, paddingRight: 18,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderLeftWidth: 3,
  },
  resultLabel: { fontSize: 6, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 5 },
  resultFormula: { fontSize: 7.5, color: C.muted, fontWeight: 300, marginBottom: 4 },
  resultValue: { fontSize: 28, fontWeight: 700 },
  resultAnnualLabel: { fontSize: 6, color: C.muted, fontWeight: 300, textAlign: 'right', marginBottom: 3 },
  resultAnnualValue: { fontSize: 14, fontWeight: 700, color: C.navy, textAlign: 'right' },
});

export function PageCashflow({ p }: { p: DiagnosticPayload }) {
  const vacanceEuros = getVacanceEuros(p);
  const taxeMois = getTaxeMois(p);
  const assuranceMois = getAssuranceMois(p);
  const depensesAnnuelles = getDepensesAnnuelles(p);
  const vc = VERDICT_COLORS[p.verdictNiveau] ?? VERDICT_COLORS.neutre;
  const cfPos = p.cashFlowMensuel >= 0;

  return (
    <Page size="A4" style={interiorBase.page}>
      <PageHeader section="Analyse cash-flow" page={4} />
      <View style={interiorBase.content}>

        <SecLabel>Recettes et dépenses mensuelles</SecLabel>

        <View style={s.columns}>
          {/* RECETTES */}
          <View style={s.col}>
            <View style={[s.colHead, { backgroundColor: '#d1fae5' }]}>
              <Text style={[s.colHeadLabel, { color: C.green }]}>Recettes</Text>
              <Text style={[s.colHeadAmount, { color: C.green }]}>+ {fmtInt(p.recettesMensuelles)} €</Text>
            </View>
            <View style={s.colBody}>
              <View style={s.item}>
                <Text style={s.itemLabel}>Loyer mensuel brut</Text>
                <Text style={s.itemValue}>{fmtInt(p.loyerMensuel)} €</Text>
              </View>
              <View style={[s.item, s.itemAlt]}>
                <View>
                  <Text style={s.itemLabel}>Vacance locative</Text>
                  <Text style={s.itemNote}>5 % du loyer annuel estimé</Text>
                </View>
                <Text style={[s.itemValue, { color: C.red }]}>- {fmtInt(vacanceEuros)} €</Text>
              </View>
            </View>
            <View style={[s.colFoot, { backgroundColor: '#f0fdf4', borderTopColor: '#bbf7d0' }]}>
              <Text style={[s.colFootLabel, { color: C.green }]}>Loyer net mensuel</Text>
              <Text style={[s.colFootValue, { color: C.green }]}>{fmtInt(p.recettesMensuelles)} €</Text>
            </View>
          </View>

          {/* DÉPENSES */}
          <View style={s.col}>
            <View style={[s.colHead, { backgroundColor: '#fee2e2' }]}>
              <Text style={[s.colHeadLabel, { color: C.red }]}>Dépenses</Text>
              <Text style={[s.colHeadAmount, { color: C.red }]}>- {fmtInt(p.depensesMensuelles)} €</Text>
            </View>
            <View style={s.colBody}>
              <View style={s.item}>
                <View>
                  <Text style={s.itemLabel}>Mensualité crédit</Text>
                  <Text style={s.itemNote}>capital + intérêts + assurance</Text>
                </View>
                <Text style={[s.itemValue, { color: C.red }]}>{fmtInt(p.mensualiteTotale)} €</Text>
              </View>
              <View style={[s.item, s.itemAlt]}>
                <View>
                  <Text style={s.itemLabel}>Charges copropriété</Text>
                  <Text style={s.itemNote}>part propriétaire</Text>
                </View>
                <Text style={[s.itemValue, { color: C.red }]}>{fmtInt(p.chargesCoproMensuelles)} €</Text>
              </View>
              <View style={s.item}>
                <View>
                  <Text style={s.itemLabel}>Taxe foncière</Text>
                  <Text style={s.itemNote}>{fmtInt(p.taxeFonciere)} € / 12 mois</Text>
                </View>
                <Text style={[s.itemValue, { color: C.red }]}>{fmtInt(taxeMois)} €</Text>
              </View>
              <View style={[s.item, s.itemAlt]}>
                <View>
                  <Text style={s.itemLabel}>Assurance PNO</Text>
                  <Text style={s.itemNote}>propriétaire non occupant</Text>
                </View>
                <Text style={[s.itemValue, { color: C.red }]}>{fmtInt(assuranceMois)} €</Text>
              </View>
            </View>
            <View style={[s.colFoot, { backgroundColor: '#fff1f2', borderTopColor: '#fecdd3' }]}>
              <Text style={[s.colFootLabel, { color: C.red }]}>Total dépenses</Text>
              <Text style={[s.colFootValue, { color: C.red }]}>{fmtInt(p.depensesMensuelles)} €</Text>
            </View>
          </View>
        </View>

        <SecLabel>Résultat mensuel net</SecLabel>

        <View style={[s.resultBox, { backgroundColor: vc.bg, borderLeftColor: vc.border }]}>
          <View>
            <Text style={[s.resultLabel, { color: vc.text }]}>Cash-flow mensuel net</Text>
            <Text style={[s.resultFormula, { color: vc.text }]}>
              {fmtInt(p.recettesMensuelles)} € recettes − {fmtInt(p.depensesMensuelles)} € dépenses
            </Text>
            <Text style={[s.resultValue, { color: cfPos ? C.green : C.red }]}>
              {fmtInt(p.cashFlowMensuel)} €
            </Text>
          </View>
          <View>
            <Text style={s.resultAnnualLabel}>Sur 12 mois</Text>
            <Text style={s.resultAnnualValue}>{fmtInt(p.cashFlowAnnuel)} €/an</Text>
          </View>
        </View>

        <SecLabel>Bilan annuel</SecLabel>

        <View style={dS.introRow}>
          <View style={dS.introCell}>
            <Text style={[dS.introLabel, { color: C.green }]}>Recettes annuelles</Text>
            <Text style={[dS.introValue, { color: C.green }]}>{fmtInt(p.loyerAnnuelNet)} €</Text>
          </View>
          <View style={dS.introCell}>
            <Text style={[dS.introLabel, { color: C.red }]}>Dépenses annuelles</Text>
            <Text style={[dS.introValue, { color: C.red }]}>{fmtInt(depensesAnnuelles)} €</Text>
          </View>
          <View style={dS.introCellLast}>
            <Text style={dS.introLabel}>Cash-flow annuel net</Text>
            <Text style={[dS.introValue, { color: cfPos ? C.green : C.red }]}>
              {fmtInt(p.cashFlowAnnuel)} €
            </Text>
          </View>
        </View>

        <View style={dS.noteBox}>
          <Text style={dS.noteText}>
            Ce cash-flow est calculé avant impôt sur le revenu. Selon votre régime fiscal
            (micro-BIC ou LMNP réel), l'imposition sur les loyers peut représenter 10 à 30 %
            de vos recettes locatives. Consultez la page des recommandations pour les
            optimisations fiscales adaptées à votre profil.
          </Text>
        </View>

      </View>
      <PageFooter p={p} />
    </Page>
  );
}
