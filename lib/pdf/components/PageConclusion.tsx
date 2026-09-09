import React from 'react'
import { Page, View, Text, Image, Link, StyleSheet } from '@react-pdf/renderer'
import { colors, sizes, common } from '../common/styles'
import { LucideIcon } from '../common/LucideIcon'
import { PdfBackground } from '../common/background'
import { findRealisationPhotoPath } from '../common/realisationPhoto'
import { REALISATIONS } from '../../data/realisations'
import { FicheData } from '../types'
import { euros, pct, pageNum } from '../helpers'

const SITE_URL = 'https://capsul-france.com/projets-investissement-locatif'

const s = StyleSheet.create({
  page: {
    ...common.page,
    paddingBottom: 0,
  },

  // ─── Hero navy ────────────────────────────────────────────────────────────
  hero: {
    position: 'relative',
    backgroundColor: colors.navy,
    paddingLeft: sizes.marginAccent,
    paddingRight: sizes.margin,
    paddingTop: 26,
    paddingBottom: 22,
  },
  heroOver: {
    fontSize: 6,
    fontWeight: 500,
    letterSpacing: 1.8,
    color: '#5a7a9a',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 900,
    letterSpacing: -0.6,
    color: colors.white,
    marginBottom: 8,
  },
  heroText: {
    fontSize: 8,
    fontWeight: 300,
    color: '#a8c0d8',
    lineHeight: 1.7,
    maxWidth: 380,
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
    gap: 16,
    marginTop: 6,
  },
  card: {
    width: '47%',
    flexGrow: 0,
    flexShrink: 0,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: colors.paper,
  },
  cardPhoto: {
    width: '100%',
    height: 148,
    objectFit: 'cover',
  },
  cardPhotoFallback: {
    width: '100%',
    height: 148,
    backgroundColor: '#c4c0b8',
  },
  cardBody: {
    paddingTop: 13,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  cardVille: {
    fontSize: 12.5,
    fontWeight: 800,
    color: colors.navy,
    letterSpacing: -0.2,
  },
  cardTypologie: {
    fontSize: 7,
    fontWeight: 500,
    letterSpacing: 0.8,
    color: colors.muted,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  cardMetrics: {
    flexDirection: 'row',
    gap: 22,
  },
  cardMetricLabel: {
    fontSize: 6,
    fontWeight: 500,
    letterSpacing: 1,
    color: colors.muted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cardMetricValue: {
    fontSize: 12.5,
    fontWeight: 800,
    color: colors.navy,
  },
  cardMetricValueGold: {
    fontSize: 12.5,
    fontWeight: 800,
    color: colors.goldDeep,
  },

  // ─── CTA site ─────────────────────────────────────────────────────────────
  cta: {
    marginTop: 'auto',
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 18,
    borderRadius: 6,
    backgroundColor: colors.navy,
  },
  ctaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ctaText: {
    fontSize: 8,
    fontWeight: 600,
    color: colors.white,
  },
  ctaSub: {
    fontSize: 6.5,
    fontWeight: 300,
    color: '#8ba4bf',
    marginTop: 2,
  },
  ctaLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    textDecoration: 'none',
  },
  ctaLinkText: {
    fontSize: 7,
    fontWeight: 700,
    letterSpacing: 0.6,
    color: colors.gold,
    textTransform: 'uppercase',
  },

  // ─── Footer sombre (dernière page du dossier) ─────────────────────────────
  footerDark: {
    height: 36,
    backgroundColor: colors.navy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: sizes.marginAccent,
    paddingRight: sizes.margin,
  },
  footerDarkL: {
    fontSize: 5.5,
    fontWeight: 300,
    color: '#4a6a8a',
  },
  footerDarkR: {
    fontSize: 6,
    fontWeight: 900,
    color: colors.gold,
    letterSpacing: 2,
  },
})

interface Props {
  data: FicheData
  pageNumber: number
}

export default function PageConclusion({ data, pageNumber }: Props) {
  const { chargeNom } = data
  const annee = new Date().getFullYear()
  const cards = REALISATIONS.map((r) => ({ ...r, photoPath: findRealisationPhotoPath(r.slug) }))

  return (
    <Page size="A4" style={s.page}>
      <View style={common.accentBar} />

      {/* Header */}
      <View style={common.header}>
        <Text style={common.headerLogo}>CAPSUL</Text>
        <View style={common.headerRight}>
          <Text style={common.eyebrow}>Conclusion</Text>
          <Text style={common.pageNum}>{pageNum(pageNumber)}</Text>
        </View>
      </View>

      {/* Hero */}
      <View style={s.hero}>
        <PdfBackground variant="bande" />
        <Text style={s.heroOver}>Merci de votre confiance</Text>
        <Text style={s.heroTitle}>Ils ont investi avec Capsul</Text>
        <Text style={s.heroText}>
          Plus de 200 projets accompagnés de bout en bout — recherche du bien, financement, travaux
          et mise en location. {chargeNom} reste votre interlocuteur à chaque étape de ce dossier.
        </Text>
      </View>

      {/* Corps */}
      <View style={s.body}>
        <Text style={common.secLabel}>Quelques réalisations récentes</Text>
        <View style={s.grid}>
          {cards.map((c) => (
            <View key={c.slug} style={s.card}>
              {c.photoPath ? (
                <Image src={c.photoPath} style={s.cardPhoto} />
              ) : (
                <View style={s.cardPhotoFallback} />
              )}
              <View style={s.cardBody}>
                <View style={s.cardTopRow}>
                  <LucideIcon name="mapPin" size={11} color={colors.goldDeep} strokeWidth={2.25} />
                  <Text style={s.cardVille}>{c.ville}</Text>
                </View>
                <Text style={s.cardTypologie}>{c.typologie}</Text>
                <View style={s.cardMetrics}>
                  <View>
                    <Text style={s.cardMetricLabel}>Budget total</Text>
                    <Text style={s.cardMetricValue}>{euros(c.budgetTotal, false)} €</Text>
                  </View>
                  <View>
                    <Text style={s.cardMetricLabel}>Rentabilité brute</Text>
                    <Text style={s.cardMetricValueGold}>{pct(c.rentabiliteBrutePct, 1)}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* CTA site */}
        <View style={s.cta}>
          <View style={s.ctaLeft}>
            <LucideIcon name="trendingUp" size={16} color={colors.gold} strokeWidth={1.75} />
            <View>
              <Text style={s.ctaText}>Découvrez tous nos projets d'investissement locatif</Text>
              <Text style={s.ctaSub}>capsul-france.com</Text>
            </View>
          </View>
          <Link src={SITE_URL} style={s.ctaLink}>
            <Text style={s.ctaLinkText}>Voir nos réalisations</Text>
            <LucideIcon name="arrowUpRight" size={9} color={colors.gold} strokeWidth={2.5} />
          </Link>
        </View>
      </View>

      {/* Footer sombre : dernière page du dossier */}
      <View style={s.footerDark}>
        <Text style={s.footerDarkL}>Dossier confidentiel · Capsul France {annee} · capsul-france.com</Text>
        <Text style={s.footerDarkR}>CAPSUL</Text>
      </View>
    </Page>
  )
}
