import React from 'react'
import { Page, View, Text, Link, StyleSheet } from '@react-pdf/renderer'
import { colors, sizes } from '../common/styles'
import { PdfBackground } from '../common/background'
import { FicheData } from '../types'

const SITE_URL = 'https://capsul-france.com/projets-investissement-locatif'

const s = StyleSheet.create({
  page: {
    fontFamily: 'Montserrat',
    backgroundColor: colors.navy,
    flexDirection: 'column',
  },
  accent: {
    height: 3,
    backgroundColor: colors.gold,
  },
  wordmark: {
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 3,
    color: colors.gold,
    paddingLeft: sizes.marginAccent,
    paddingRight: sizes.margin,
    paddingTop: 34,
  },

  // ─── Bloc central ─────────────────────────────────────────────────────────
  center: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: sizes.marginAccent,
    paddingRight: sizes.margin,
  },
  overline: {
    width: 32,
    height: 1.5,
    backgroundColor: colors.gold,
    marginBottom: 20,
    opacity: 0.8,
  },
  title: {
    fontSize: 38,
    fontWeight: 900,
    letterSpacing: -1.2,
    lineHeight: 1.1,
    color: colors.white,
    marginBottom: 18,
  },
  text: {
    fontSize: 10,
    fontWeight: 300,
    color: '#b6cbe0',
    lineHeight: 1.8,
    maxWidth: 400,
    marginBottom: 34,
  },
  textStrong: {
    fontWeight: 600,
    color: colors.white,
  },
  linkLabel: {
    fontSize: 6.5,
    fontWeight: 700,
    letterSpacing: 1.8,
    color: '#b6cbe0',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  link: {
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: -0.3,
    color: colors.gold,
    textDecoration: 'none',
  },

  // ─── Footer ───────────────────────────────────────────────────────────────
  footer: {
    paddingTop: 10,
    paddingBottom: 14,
    paddingLeft: sizes.marginAccent,
    paddingRight: sizes.margin,
    borderTopWidth: 0.5,
    borderTopColor: '#2a4a6a',
    borderTopStyle: 'solid',
  },
  footerLegal: {
    fontSize: 5.5,
    fontWeight: 300,
    color: '#4a6a8a',
    marginBottom: 7,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerL: {
    fontSize: 6,
    fontWeight: 300,
    color: '#4a6a8a',
  },
  footerR: {
    fontSize: 6.5,
    fontWeight: 900,
    color: colors.gold,
    letterSpacing: 2,
  },
})

const MENTIONS_LEGALES =
  'Capsul France · SIRET 881 554 679 00053 · 33 rue Libergier, 51100 Reims, FR · ' +
  'www.capsul-france.com · Backoffice@capsul-france.com · +33 9 78 81 03 30'

interface Props {
  data: FicheData
  pageNumber: number
}

export default function PageConclusion({ data }: Props) {
  const { chargeNom } = data
  const annee = new Date().getFullYear()

  return (
    <Page size="A4" style={s.page}>
      <PdfBackground variant="cover" />
      <View style={s.accent} />
      <Text style={s.wordmark}>CAPSUL</Text>

      <View style={s.center}>
        <View style={s.overline} />
        <Text style={s.title}>Merci de votre{'\n'}confiance</Text>
        <Text style={s.text}>
          Plus de 200 projets accompagnés de bout en bout : recherche du bien, financement,
          travaux et mise en location.{' '}
          <Text style={s.textStrong}>{chargeNom}</Text> reste votre interlocuteur à chaque
          étape de ce dossier.
        </Text>

        <Text style={s.linkLabel}>Découvrez nos réalisations</Text>
        <Link src={SITE_URL} style={s.link}>capsul-france.com</Link>
      </View>

      <View style={s.footer}>
        <Text style={s.footerLegal}>{MENTIONS_LEGALES}</Text>
        <View style={s.footerRow}>
          <Text style={s.footerL}>Dossier confidentiel · Capsul France {annee}</Text>
          <Text style={s.footerR}>CAPSUL</Text>
        </View>
      </View>
    </Page>
  )
}
