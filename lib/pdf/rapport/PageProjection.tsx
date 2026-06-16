import React from 'react'
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { colors, sizes, common } from '../common/styles'
import { euros, eurosShort } from '../helpers'
import type { RapportData } from '../types'

const ROW_H = 16
const MILESTONES = [5, 10, 15, 20]

const s = StyleSheet.create({
  page: { ...common.page, paddingBottom: 40 },
  body: { paddingHorizontal: sizes.marginAccent, paddingTop: 18 },

  intro: { marginBottom: 14 },
  introText: { fontSize: 7, color: colors.muted, fontWeight: 300, lineHeight: 1.6 },
  introStrong: { fontWeight: 600, color: colors.ink },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.navy,
    height: ROW_H,
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  thAnnee: { width: 30, fontSize: 6, fontWeight: 700, color: colors.gold, textAlign: 'center' },
  thCell:  { flex: 1, fontSize: 6, fontWeight: 700, color: colors.gold, textAlign: 'right', paddingRight: 4 },

  row: {
    flexDirection: 'row',
    height: ROW_H,
    alignItems: 'center',
    paddingHorizontal: 6,
    borderBottom: `0.5pt solid ${colors.rule}`,
  },
  rowAlt:       { backgroundColor: colors.paper },
  rowMilestone: { backgroundColor: '#e8edf2', borderBottom: `0.5pt solid ${colors.navy}` },

  tdAnnee:    { width: 30, fontSize: 6.5, fontWeight: 700, color: colors.navy, textAlign: 'center' },
  tdVal:      { flex: 1, fontSize: 6.5, fontWeight: 300, color: colors.ink,  textAlign: 'right', paddingRight: 4 },
  tdCons:     { flex: 1, fontSize: 6.5, fontWeight: 400, color: colors.muted, textAlign: 'right', paddingRight: 4 },
  tdRealiste: { flex: 1, fontSize: 6.5, fontWeight: 700, color: colors.navy, textAlign: 'right', paddingRight: 4 },

  milestones: {
    flexDirection: 'row',
    marginTop: 18,
    borderTop: `0.5pt solid ${colors.rule}`,
  },
  msCell: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 12,
    borderRight: `0.5pt solid ${colors.rule}`,
  },
  msCellLast: { flex: 1, paddingTop: 10, paddingHorizontal: 12 },
  msLabel: { fontSize: 5.5, fontWeight: 600, color: colors.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  msCons:  { fontSize: 9,   fontWeight: 400, color: colors.muted, marginBottom: 1 },
  msReal:  { fontSize: 14,  fontWeight: 900, color: colors.navy, letterSpacing: -0.5 },
  msSub:   { fontSize: 6,   fontWeight: 300, color: colors.muted, marginTop: 2 },

  disclaimer: {
    fontSize: 6, fontWeight: 300, color: '#aaa8a2',
    lineHeight: 1.8, fontStyle: 'italic',
    marginTop: 'auto', paddingBottom: 8,
    paddingHorizontal: sizes.marginAccent,
  },
})

export default function PageProjection({ data }: { data: RapportData }) {
  const { project, projectionConservateur, projectionRealiste, tableauAmortissement } = data
  const footerLabel = [project.adresse, project.city].filter(Boolean).join(' · ')
  const hasData = projectionRealiste.length > 0

  // Aligne le capital restant sur l'année (0 après fin du crédit)
  function capitalRestant(annee: number) {
    const ligne = tableauAmortissement[annee - 1]
    return ligne?.capitalRestant ?? 0
  }

  return (
    <Page size="A4" style={s.page}>
      <View style={common.accentBar} />

      <View style={common.header}>
        <Text style={common.headerLogo}>CAPSUL</Text>
        <View style={common.headerRight}>
          <Text style={common.eyebrow}>Projection patrimoniale — 20 ans</Text>
          <Text style={common.pageNum}>03</Text>
        </View>
      </View>

      <View style={s.body}>
        <View style={s.intro}>
          <Text style={s.introText}>
            <Text style={s.introStrong}>Conservateur</Text>
            {' — revalorisation 0 % /an (pas de plus-value latente) · '}
            <Text style={s.introStrong}>Réaliste</Text>
            {' — revalorisation +2 % /an. '}
            Patrimoine net = apport + capital remboursé + cash-flow cumulé + plus-value latente.
          </Text>
        </View>

        {!hasData ? (
          <Text style={{ fontSize: 8, color: colors.muted, fontStyle: 'italic', textAlign: 'center', marginTop: 20 }}>
            Aucune projection disponible — relancez une simulation.
          </Text>
        ) : (
          <>
            <View style={s.tableHeader}>
              <Text style={s.thAnnee}>An.</Text>
              <Text style={s.thCell}>Valeur bien (réal.)</Text>
              <Text style={s.thCell}>Capital restant dû</Text>
              <Text style={s.thCell}>CF cumulé</Text>
              <Text style={s.thCell}>Patrimoine cons.</Text>
              <Text style={s.thCell}>Patrimoine réal.</Text>
            </View>

            {projectionRealiste.map((r, i) => {
              const c = projectionConservateur[i]
              const isMilestone = MILESTONES.includes(r.annee)
              return (
                <View
                  key={r.annee}
                  style={[
                    s.row,
                    isMilestone ? s.rowMilestone : i % 2 === 1 ? s.rowAlt : undefined,
                  ]}
                >
                  <Text style={s.tdAnnee}>{r.annee}</Text>
                  <Text style={s.tdVal}>{euros(r.valeurBien)}</Text>
                  <Text style={s.tdVal}>{euros(capitalRestant(r.annee))}</Text>
                  <Text style={r.cashflowCumul >= 0 ? s.tdVal : { ...s.tdVal, color: colors.negRed }}>
                    {euros(r.cashflowCumul)}
                  </Text>
                  <Text style={s.tdCons}>{euros(c?.patrimoineNet ?? 0)}</Text>
                  <Text style={s.tdRealiste}>{euros(r.patrimoineNet)}</Text>
                </View>
              )
            })}
          </>
        )}
      </View>

      {/* Milestones */}
      {hasData && (
        <View style={s.milestones}>
          {MILESTONES.map((yr, i) => {
            const r = projectionRealiste[yr - 1]
            const c = projectionConservateur[yr - 1]
            const isLast = i === MILESTONES.length - 1
            return (
              <View key={yr} style={isLast ? s.msCellLast : s.msCell}>
                <Text style={s.msLabel}>Patrimoine à {yr} ans</Text>
                <Text style={s.msCons}>Cons. {eurosShort(c?.patrimoineNet ?? 0)}</Text>
                <Text style={s.msReal}>{eurosShort(r?.patrimoineNet ?? 0)}</Text>
                <Text style={s.msSub}>Scénario réaliste</Text>
              </View>
            )
          })}
        </View>
      )}

      <Text style={s.disclaimer}>
        Projections non contractuelles. Hypothèses : revalorisation +2 % réaliste / 0 % conservateur, cash-flow constant sur 20 ans, pas de fiscalité sur plus-value.
      </Text>

      <View style={common.footer}>
        <Text style={common.footerL}>{footerLabel}</Text>
        <Text style={common.footerR}>capsul-france.com</Text>
      </View>
    </Page>
  )
}
