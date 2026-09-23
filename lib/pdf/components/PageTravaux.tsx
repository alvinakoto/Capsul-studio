import React from 'react'
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { colors, sizes, common, DPE_BG } from '../common/styles'
import { LucideIcon } from '../common/LucideIcon'
import { PdfBackground } from '../common/background'
import { FicheData } from '../types'
import { euros, pageNum } from '../helpers'

const s = StyleSheet.create({
  page: {
    ...common.page,
    paddingBottom: 32,
  },

  // ─── Hero navy ────────────────────────────────────────────────────────────
  hero: {
    position: 'relative',
    backgroundColor: colors.navy,
    paddingLeft: sizes.marginAccent,
    paddingRight: sizes.margin,
    paddingTop: 26,
    paddingBottom: 26,
  },
  heroOver: {
    fontSize: 6,
    fontWeight: 700,
    letterSpacing: 1.8,
    color: '#b6cbe0',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1,
    color: colors.white,
    marginBottom: 22,
    textTransform: 'uppercase',
  },
  heroKpis: {
    flexDirection: 'row',
  },
  heroKpi: {
    flex: 1,
    paddingRight: 20,
    marginRight: 20,
    borderRightWidth: 0.5,
    borderRightColor: '#2a4a6a',
    borderRightStyle: 'solid',
  },
  heroKpiLast: {
    flex: 1,
  },
  heroKpiLabel: {
    fontSize: 6,
    fontWeight: 600,
    letterSpacing: 1.4,
    color: '#b6cbe0',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  heroKpiValue: {
    fontSize: 24,
    fontWeight: 900,
    color: colors.white,
    letterSpacing: -0.8,
    lineHeight: 1,
  },
  heroKpiValueGold: {
    fontSize: 24,
    fontWeight: 900,
    color: colors.gold,
    letterSpacing: -0.8,
    lineHeight: 1,
  },
  heroKpiUnit: {
    fontSize: 9,
    fontWeight: 300,
    color: '#5a7a9a',
  },
  heroKpiNote: {
    fontSize: 6,
    fontWeight: 300,
    fontStyle: 'italic',
    color: '#5a7a9a',
    marginTop: 5,
  },
  dpeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  dpeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 3,
    fontSize: 11,
    fontWeight: 900,
    color: colors.white,
  },
  dpeArrow: {
    fontSize: 10,
    fontWeight: 300,
    color: '#8ba4bf',
  },

  // ─── Corps ────────────────────────────────────────────────────────────────
  body: {
    paddingLeft: sizes.marginAccent,
    paddingRight: sizes.margin,
    paddingTop: 22,
    flex: 1,
    flexDirection: 'column',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  tile: {
    width: '31.6%',
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: colors.paper,
    borderRadius: 6,
    paddingTop: 18,
    paddingBottom: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  tileLabel: {
    fontSize: 8,
    fontWeight: 700,
    color: colors.navy,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 1.3,
  },
  bottomBlock: {
    marginTop: 'auto',
  },
  comment: {
    marginBottom: 14,
    paddingLeft: 14,
    paddingRight: 14,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: colors.paper,
    borderLeftWidth: 2.5,
    borderLeftColor: colors.gold,
    borderLeftStyle: 'solid',
  },
  commentLabel: {
    fontSize: 5.5,
    fontWeight: 500,
    letterSpacing: 1.5,
    color: colors.muted,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  commentText: {
    fontSize: 7.5,
    fontWeight: 300,
    color: colors.ink,
    lineHeight: 1.7,
  },
  closing: {
    paddingTop: 16,
    paddingBottom: 14,
    borderTopWidth: 0.5,
    borderTopColor: colors.rule,
    borderTopStyle: 'solid',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  closingText: {
    flex: 1,
    fontSize: 7,
    fontWeight: 300,
    color: colors.muted,
    lineHeight: 1.6,
  },
  closingStrong: {
    fontWeight: 600,
    color: colors.navy,
  },
})

interface Props {
  data: FicheData
  pageNumber: number
}

export default function PageTravaux({ data, pageNumber }: Props) {
  const { project, travauxPostes, chargeNom } = data
  const commentaire = project.commentaire_travaux?.trim()
  const budget = project.travaux ?? 0
  const dpeActuel = project.dpe_actuel
  const dpeVise = project.dpe_apres_travaux
  const hasDpe = !!(dpeActuel || dpeVise)
  const footerLabel = [project.adresse, project.city].filter(Boolean).join(' · ')

  const kpis: React.ReactNode[] = []

  if (budget > 0) {
    kpis.push(
      <View key="budget">
        <Text style={s.heroKpiLabel}>Budget travaux</Text>
        <Text style={s.heroKpiValueGold}>
          {euros(budget, false)}
          <Text style={s.heroKpiUnit}> €</Text>
        </Text>
        {project.travaux_estime && <Text style={s.heroKpiNote}>Estimation</Text>}
      </View>
    )
  }

  kpis.push(
    <View key="postes">
      <Text style={s.heroKpiLabel}>Postes concernés</Text>
      <Text style={s.heroKpiValue}>
        {travauxPostes.length}
        <Text style={s.heroKpiUnit}> {travauxPostes.length > 1 ? 'postes' : 'poste'}</Text>
      </Text>
    </View>
  )

  if (hasDpe) {
    kpis.push(
      <View key="dpe">
        <Text style={s.heroKpiLabel}>{dpeActuel && dpeVise ? 'DPE actuel → visé' : dpeVise ? 'DPE visé' : 'DPE actuel'}</Text>
        <View style={s.dpeRow}>
          {dpeActuel && (
            <Text style={[s.dpeBadge, { backgroundColor: DPE_BG[dpeActuel] ?? colors.muted }]}>{dpeActuel}</Text>
          )}
          {dpeActuel && dpeVise && <Text style={s.dpeArrow}>→</Text>}
          {dpeVise && (
            <Text style={[s.dpeBadge, { backgroundColor: DPE_BG[dpeVise] ?? colors.muted }]}>{dpeVise}</Text>
          )}
        </View>
      </View>
    )
  }

  return (
    <Page size="A4" style={s.page}>
      <View style={common.accentBar} />

      {/* Header */}
      <View style={common.header}>
        <Text style={common.headerLogo}>CAPSUL</Text>
        <View style={common.headerRight}>
          <Text style={common.eyebrow}>Travaux prévus</Text>
          <Text style={common.pageNum}>{pageNum(pageNumber)}</Text>
        </View>
      </View>

      {/* Hero */}
      <View style={s.hero}>
        <PdfBackground variant="bande" />
        <Text style={s.heroOver}>Rénovation clé en main</Text>
        <Text style={s.heroTitle}>Programme de travaux</Text>
        <View style={s.heroKpis}>
          {kpis.map((kpi, i) => (
            <View key={i} style={i === kpis.length - 1 ? s.heroKpiLast : s.heroKpi}>
              {kpi}
            </View>
          ))}
        </View>
      </View>

      {/* Corps */}
      <View style={s.body}>
        <Text style={common.secLabel}>Postes de travaux</Text>
        <View style={s.grid}>
          {travauxPostes.map((poste) => (
            <View key={poste.id} style={s.tile}>
              <LucideIcon name={poste.icon} size={26} color={colors.goldDeep} strokeWidth={1.75} />
              <Text style={s.tileLabel}>{poste.label}</Text>
            </View>
          ))}
        </View>

        <View style={s.bottomBlock}>
          {commentaire && (
            <View style={s.comment}>
              <Text style={s.commentLabel}>Note du chargé de projet</Text>
              <Text style={s.commentText}>{commentaire}</Text>
            </View>
          )}
          <View style={s.closing}>
            <LucideIcon name="house" size={14} color={colors.goldDeep} />
            <Text style={s.closingText}>
              <Text style={s.closingStrong}>Travaux pilotés par Capsul France</Text>
              {' : sélection des artisans, suivi de chantier et réception. Dossier préparé par '}
              <Text style={s.closingStrong}>{chargeNom}</Text>.
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={common.footer}>
        <Text style={common.footerL}>{footerLabel}</Text>
        <Text style={common.footerR}>Capsul France</Text>
      </View>
    </Page>
  )
}
