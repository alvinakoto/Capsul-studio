import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { DiagnosticPayload } from '../types';
import { fmtInt } from '../format';
import { getAmortizationTable, getCoutGlobal, getMensualiteSplit } from '../calculations';
import {
  C, interiorBase, dS,
  PageHeader, PageFooter, SecLabel,
} from './PageChrome';

const s = StyleSheet.create({
  // Barres de répartition
  barWrap: {
    height: 10,
    borderRadius: 3,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: C.rule,
    marginBottom: 8,
  },
  legend: { flexDirection: 'row', gap: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  legendLabel: { fontSize: 7, color: C.muted, fontWeight: 300 },
  legendValue: { fontSize: 7, fontWeight: 700, color: C.navy },

  // Col fixe "Année"
  tdAnnee: {
    width: 34,
    paddingTop: 7, paddingBottom: 7, paddingLeft: 8,
    fontSize: 8,
    fontWeight: 600,
    color: C.navy,
  },
  thAnnee: {
    width: 34,
    paddingTop: 7, paddingBottom: 7, paddingLeft: 8,
    fontSize: 6, fontWeight: 700, color: C.goldLight, letterSpacing: 0.4,
  },
});

export function PageFinancement({ p }: { p: DiagnosticPayload }) {
  const split = getMensualiteSplit(p);
  const amort = getAmortizationTable(p);
  const global = getCoutGlobal(p);

  return (
    <Page size="A4" style={interiorBase.page}>
      <PageHeader section="Financement" page={3} />
      <View style={interiorBase.content}>

        <SecLabel>Décomposition de la mensualité</SecLabel>

        <View style={dS.introRow}>
          <View style={dS.introCell}>
            <Text style={dS.introLabel}>Mensualité totale</Text>
            <Text style={[dS.introValue, { color: C.navy }]}>{fmtInt(p.mensualiteTotale)} €</Text>
          </View>
          <View style={dS.introCell}>
            <Text style={dS.introLabel}>Dont capital (mois 1)</Text>
            <Text style={dS.introValue}>{fmtInt(p.capitalMois)} €</Text>
          </View>
          <View style={dS.introCell}>
            <Text style={dS.introLabel}>Dont intérêts (mois 1)</Text>
            <Text style={dS.introValue}>{fmtInt(p.interetsMois)} €</Text>
          </View>
          <View style={dS.introCellLast}>
            <Text style={dS.introLabel}>Dont assurance</Text>
            <Text style={dS.introValue}>{fmtInt(p.assuranceMensuelle)} €</Text>
          </View>
        </View>

        <SecLabel>Répartition visuelle — Année 1</SecLabel>

        <View>
          <View style={s.barWrap}>
            <View style={{ width: `${split.pctCapital}%`, backgroundColor: C.navy }} />
            <View style={{ width: `${split.pctInterets}%`, backgroundColor: C.gold }} />
            <View style={{ width: `${split.pctAssurance}%`, backgroundColor: C.muted }} />
          </View>
          <View style={s.legend}>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: C.navy }]} />
              <Text style={s.legendLabel}>Capital remboursé</Text>
              <Text style={s.legendValue}>{split.pctCapital} %</Text>
            </View>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: C.gold }]} />
              <Text style={s.legendLabel}>Intérêts</Text>
              <Text style={s.legendValue}>{split.pctInterets} %</Text>
            </View>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: C.muted }]} />
              <Text style={s.legendLabel}>Assurance</Text>
              <Text style={s.legendValue}>{split.pctAssurance} %</Text>
            </View>
          </View>
        </View>

        <SecLabel>Tableau d'amortissement — 5 premières années</SecLabel>

        <View>
          <View style={dS.tHead}>
            <Text style={s.thAnnee}>An.</Text>
            <Text style={[dS.tHeadCell, dS.tCellR]}>Capital remboursé</Text>
            <Text style={[dS.tHeadCell, dS.tCellR]}>Intérêts payés</Text>
            <Text style={[dS.tHeadCell, dS.tCellR]}>Capital restant dû</Text>
          </View>
          {amort.map((row, i) => (
            <View key={row.annee} style={[dS.tRow, i % 2 === 1 ? dS.tRowAlt : {}]}>
              <Text style={s.tdAnnee}>{row.annee}</Text>
              <Text style={[dS.tCell, dS.tCellR, { fontWeight: 600, color: C.navy }]}>
                {fmtInt(row.capitalRembourse)} €
              </Text>
              <Text style={[dS.tCell, dS.tCellR, { color: C.gold }]}>
                {fmtInt(row.interetsPayes)} €
              </Text>
              <Text style={[dS.tCell, dS.tCellR]}>
                {fmtInt(row.capitalRestantDu)} €
              </Text>
            </View>
          ))}
        </View>

        <SecLabel>Coût global du crédit</SecLabel>

        <View style={dS.introRow}>
          <View style={dS.introCell}>
            <Text style={dS.introLabel}>Capital emprunté</Text>
            <Text style={dS.introValue}>{fmtInt(global.capitalEmprunte)} €</Text>
          </View>
          <View style={dS.introCell}>
            <Text style={dS.introLabel}>Coût total des intérêts</Text>
            <Text style={[dS.introValue, { color: C.red }]}>{fmtInt(global.coutTotalCredit)} €</Text>
          </View>
          <View style={dS.introCellLast}>
            <Text style={dS.introLabel}>Total remboursé</Text>
            <Text style={dS.introValue}>{fmtInt(global.totalRembourse)} €</Text>
          </View>
        </View>

      </View>
      <PageFooter p={p} />
    </Page>
  );
}
