import React from 'react'
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { colors, sizes, common } from '../common/styles'
import { euros, pct } from '../helpers'
import type { RapportData } from '../types'

const COL = [30, 108, 108, 108, 108]  // largeurs colonnes en pt
const ROW_H = 22

const s = StyleSheet.create({
  page: { ...common.page, paddingBottom: 40 },
  body: { paddingHorizontal: sizes.marginAccent, paddingTop: 22, flex: 1 },

  intro: {
    flexDirection: 'row',
    gap: 0,
    marginBottom: 22,
    borderRadius: 4,
    overflow: 'hidden',
  },
  introCell: {
    flex: 1,
    backgroundColor: colors.paper,
    padding: 14,
    borderRight: `0.5pt solid ${colors.rule}`,
  },
  introCellLast: {
    flex: 1,
    backgroundColor: colors.paper,
    padding: 14,
  },
  introLabel: { fontSize: 7, color: colors.muted, fontWeight: 300, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.8 },
  introValue: { fontSize: 15, fontWeight: 700, color: colors.navy },

  tableWrap: {
    borderRadius: 4,
    overflow: 'hidden',
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.navy,
    height: ROW_H,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  thCell0: { width: COL[0], fontSize: 7, fontWeight: 700, color: colors.gold, textAlign: 'center' },
  thCell:  { flex: 1, fontSize: 7, fontWeight: 700, color: colors.gold, textAlign: 'right' },

  row: {
    flexDirection: 'row',
    height: ROW_H,
    alignItems: 'center',
    paddingHorizontal: 8,
    borderBottom: `0.5pt solid ${colors.rule}`,
  },
  rowAlt: { backgroundColor: colors.paper },
  tdAnnee:    { width: COL[0], fontSize: 8, fontWeight: 600, color: colors.navy, textAlign: 'center' },
  tdVal:      { flex: 1, fontSize: 8, fontWeight: 300, color: colors.ink, textAlign: 'right' },
  tdValBold:  { flex: 1, fontSize: 8, fontWeight: 700, color: colors.navy, textAlign: 'right' },

  totalRow: {
    flexDirection: 'row',
    height: 28,
    alignItems: 'center',
    paddingHorizontal: 8,
    backgroundColor: colors.navy,
  },
  totalLabel: { flexGrow: 0, flexShrink: 0, fontSize: 8, fontWeight: 700, color: colors.gold, textAlign: 'center' },
  totalVal:   { flex: 1, fontSize: 8, fontWeight: 700, color: colors.white, textAlign: 'right' },

  noDataWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  noDataTitle: { fontSize: 12, fontWeight: 700, color: colors.navy, marginBottom: 8 },
  noData: { fontSize: 9, color: colors.muted, fontStyle: 'italic', textAlign: 'center', maxWidth: 320 },
})

export default function PageAmortissement({ data }: { data: RapportData }) {
  const { project, capitalEmprunte, mensualiteTotale, coutTotalInterets, tableauAmortissement } = data
  const footerLabel = [project.adresse, project.city].filter(Boolean).join(' · ')
  const totalCapital = tableauAmortissement.reduce((s, l) => s + l.capitalRembourse, 0)
  const totalInterets = tableauAmortissement.reduce((s, l) => s + l.interets, 0)

  return (
    <Page size="A4" style={s.page}>
      <View style={common.accentBar} />

      <View style={common.header}>
        <Text style={common.headerLogo}>CAPSUL</Text>
        <View style={common.headerRight}>
          <Text style={common.eyebrow}>Amortissement du crédit</Text>
          <Text style={common.pageNum}>02</Text>
        </View>
      </View>

      <View style={s.body}>

        {/* Chiffres clés intro */}
        <View style={s.intro}>
          <View style={s.introCell}>
            <Text style={s.introLabel}>Capital emprunté</Text>
            <Text style={s.introValue}>{euros(capitalEmprunte)}</Text>
          </View>
          <View style={s.introCell}>
            <Text style={s.introLabel}>Taux d'intérêt</Text>
            <Text style={s.introValue}>{pct(project.taux_interet_pct ?? 0)}</Text>
          </View>
          <View style={s.introCell}>
            <Text style={s.introLabel}>Durée</Text>
            <Text style={s.introValue}>{project.duree_annees ?? 20} ans</Text>
          </View>
          <View style={s.introCell}>
            <Text style={s.introLabel}>Mensualité totale</Text>
            <Text style={s.introValue}>{euros(mensualiteTotale)}</Text>
          </View>
          <View style={s.introCellLast}>
            <Text style={s.introLabel}>Coût total intérêts</Text>
            <Text style={s.introValue}>{euros(coutTotalInterets)}</Text>
          </View>
        </View>

        {/* Tableau */}
        {tableauAmortissement.length === 0 ? (
          <View style={s.noDataWrap}>
            <Text style={s.noDataTitle}>Aucun tableau d'amortissement</Text>
            <Text style={s.noData}>
              {capitalEmprunte === 0
                ? "Achat comptant : ce projet ne comporte aucun crédit, donc aucun tableau d'amortissement à afficher."
                : 'Données de financement insuffisantes pour générer le tableau.'}
            </Text>
          </View>
        ) : (
          <View style={s.tableWrap}>
            <View style={s.tableHeader}>
              <Text style={s.thCell0}>An.</Text>
              <Text style={s.thCell}>Mensualité</Text>
              <Text style={s.thCell}>Capital remboursé</Text>
              <Text style={s.thCell}>Intérêts payés</Text>
              <Text style={s.thCell}>Capital restant</Text>
            </View>

            {tableauAmortissement.map((l, i) => (
              <View key={l.annee} style={[s.row, i % 2 === 1 ? s.rowAlt : {}]}>
                <Text style={s.tdAnnee}>{l.annee}</Text>
                <Text style={s.tdVal}>{euros(mensualiteTotale * 12)}</Text>
                <Text style={s.tdVal}>{euros(l.capitalRembourse)}</Text>
                <Text style={s.tdVal}>{euros(l.interets)}</Text>
                <Text style={l.capitalRestant === 0 ? s.tdValBold : s.tdVal}>
                  {euros(l.capitalRestant)}
                </Text>
              </View>
            ))}

            <View style={s.totalRow}>
              <Text style={[s.totalLabel, { width: COL[0] }]}>Total</Text>
              <Text style={s.totalVal}>{euros(mensualiteTotale * 12 * tableauAmortissement.length)}</Text>
              <Text style={s.totalVal}>{euros(totalCapital)}</Text>
              <Text style={s.totalVal}>{euros(totalInterets)}</Text>
              <Text style={s.totalVal}>—</Text>
            </View>
          </View>
        )}
      </View>

      <View style={common.footer}>
        <Text style={common.footerL}>{footerLabel}</Text>
        <Text style={common.footerR}>capsul-france.com</Text>
      </View>
    </Page>
  )
}
