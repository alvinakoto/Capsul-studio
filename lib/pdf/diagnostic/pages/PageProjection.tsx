import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { DiagnosticPayload } from '../types';
import { fmtInt } from '../format';
import { getProjectionTable, getPlusValueEstimee } from '../calculations';
import {
  C, interiorBase, dS,
  PageHeader, PageFooter, SecLabel,
} from './PageChrome';

const s = StyleSheet.create({
  // Barres de capital
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barYear: { fontSize: 7, fontWeight: 600, color: C.muted, width: 44 },
  barTrack: { flex: 1, height: 12, backgroundColor: C.rule, borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: C.navy, borderRadius: 2 },
  barAmount: { fontSize: 8, fontWeight: 700, color: C.navy, width: 70, textAlign: 'right' },
  barPct: { fontSize: 7, color: C.muted, fontWeight: 300, width: 30, textAlign: 'right' },

  // Col fixe "Année" dans le tableau
  tdAnnee: {
    width: 40,
    paddingTop: 7, paddingBottom: 7, paddingLeft: 8,
    fontSize: 8, fontWeight: 600, color: C.navy,
  },
  thAnnee: {
    width: 40,
    paddingTop: 7, paddingBottom: 7, paddingLeft: 8,
    fontSize: 6, fontWeight: 700, color: C.goldLight, letterSpacing: 0.4,
  },

  // Bilan à 5 ans
  bilanRow: { flexDirection: 'row', gap: 10 },
  bilanCard: {
    flex: 1, backgroundColor: C.paper, paddingTop: 10, paddingBottom: 10,
    paddingLeft: 12, paddingRight: 12,
    borderBottom: `0.5pt solid ${C.rule}`,
  },
  bilanLabel: { fontSize: 6, color: C.muted, fontWeight: 300, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.6 },
  bilanValue: { fontSize: 13, fontWeight: 700, color: C.navy },
  bilanSub: { fontSize: 7, color: C.muted, fontWeight: 300, marginTop: 3 },
});

export function PageProjection({ p }: { p: DiagnosticPayload }) {
  const isComptant = p.capitalEmprunte === 0;
  const rows = getProjectionTable(p);
  const plusValue = getPlusValueEstimee(p);
  const last = rows[rows.length - 1];

  return (
    <Page size="A4" style={interiorBase.page}>
      <PageHeader section="Projection 5 ans" page={5} />
      <View style={interiorBase.content}>

        {isComptant ? (
          <>
            <SecLabel>Propriété à 100 % dès l'acquisition</SecLabel>
            <View style={dS.noteBox}>
              <Text style={dS.noteText}>
                En achat comptant, le bien vous appartient intégralement depuis le
                premier jour — aucun capital restant à rembourser. La colonne
                ci-dessous reflète uniquement l'évolution du cash-flow cumulé et du
                patrimoine net (valeur du bien + trésorerie accumulée).
              </Text>
            </View>
          </>
        ) : (
          <>
            <SecLabel>{`Capital remboursé cumulé — sur ${fmtInt(p.capitalEmprunte)} € empruntés`}</SecLabel>
            <View style={{ flexDirection: 'column', gap: 8 }}>
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
          </>
        )}

        <SecLabel>Tableau récapitulatif</SecLabel>

        <View>
          <View style={dS.tHead}>
            <Text style={s.thAnnee}>An.</Text>
            {!isComptant && (
              <Text style={[dS.tHeadCell, dS.tCellR]}>Capital remboursé (cumulé)</Text>
            )}
            <Text style={[dS.tHeadCell, dS.tCellR]}>Cash-flow cumulé</Text>
            <Text style={[dS.tHeadCell, dS.tCellR]}>Patrimoine net estimé</Text>
          </View>
          {rows.map((row, i) => (
            <View key={row.annee} style={[dS.tRow, i % 2 === 1 ? dS.tRowAlt : {}]}>
              <Text style={s.tdAnnee}>{row.annee}</Text>
              {!isComptant && (
                <Text style={[dS.tCell, dS.tCellR, { fontWeight: 600 }]}>
                  {fmtInt(row.cumulCapital)} €
                </Text>
              )}
              <Text style={[
                dS.tCell, dS.tCellR,
                { fontWeight: 700, color: row.cashFlowCumule >= 0 ? C.green : C.red },
              ]}>
                {fmtInt(row.cashFlowCumule)} €
              </Text>
              <Text style={[dS.tCell, dS.tCellR, { fontWeight: 700, color: C.navy }]}>
                {fmtInt(row.patrimoineNet)} €
              </Text>
            </View>
          ))}
          <View style={dS.tTotal}>
            <Text style={[dS.tTotalLabel, { width: 40 + 8 }]}>Bilan</Text>
            {!isComptant && <Text style={dS.tTotalVal}>{fmtInt(last.cumulCapital)} €</Text>}
            <Text style={dS.tTotalVal}>{fmtInt(last.cashFlowCumule)} €</Text>
            <Text style={dS.tTotalVal}>{fmtInt(last.patrimoineNet)} €</Text>
          </View>
        </View>

        <SecLabel>Synthèse à 5 ans</SecLabel>

        <View style={s.bilanRow}>
          {isComptant ? (
            <View style={s.bilanCard}>
              <Text style={s.bilanLabel}>Bien possédé à 100 %</Text>
              <Text style={s.bilanValue}>{fmtInt(p.prixBien)} €</Text>
              <Text style={s.bilanSub}>valeur du bien à l'acquisition</Text>
            </View>
          ) : (
            <View style={s.bilanCard}>
              <Text style={s.bilanLabel}>Capital remboursé en 5 ans</Text>
              <Text style={s.bilanValue}>{fmtInt(last.cumulCapital)} €</Text>
              <Text style={s.bilanSub}>financé par vos locataires</Text>
            </View>
          )}
          <View style={s.bilanCard}>
            <Text style={[s.bilanLabel, { color: last.cashFlowCumule >= 0 ? C.green : C.red }]}>
              {last.cashFlowCumule >= 0 ? 'Gain de trésorerie cumulé' : 'Effort de trésorerie cumulé'}
            </Text>
            <Text style={[s.bilanValue, { color: last.cashFlowCumule >= 0 ? C.green : C.red }]}>
              {fmtInt(last.cashFlowCumule)} €
            </Text>
            <Text style={s.bilanSub}>
              {last.cashFlowCumule < 0 ? 'mise personnelle sur 5 ans' : 'trésorerie générée'}
            </Text>
          </View>
          <View style={s.bilanCard}>
            <Text style={s.bilanLabel}>Patrimoine net estimé</Text>
            <Text style={s.bilanValue}>{fmtInt(last.patrimoineNet)} €</Text>
            <Text style={s.bilanSub}>
              {isComptant ? 'valeur bien + trésorerie' : 'apport + capital remboursé'}
            </Text>
          </View>
        </View>

        <View style={dS.noteBox}>
          <Text style={dS.noteText}>
            Projection conservatrice : ne tient pas compte d'une revalorisation du bien.
            En France, l'immobilier résidentiel a progressé en moyenne de 2 à 3 % par an
            sur les 20 dernières années. Une appréciation de 2 %/an sur votre bien de{' '}
            {fmtInt(p.prixBien)} € représenterait {fmtInt(plusValue)} € de plus-value
            supplémentaire à l'issue de 5 ans, sans effort additionnel de votre part.
          </Text>
        </View>

      </View>
      <PageFooter p={p} />
    </Page>
  );
}
