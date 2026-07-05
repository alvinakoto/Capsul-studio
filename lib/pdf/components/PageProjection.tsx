import React from 'react'
import { Page, View, Text, StyleSheet, Svg, Rect, Defs, LinearGradient, Stop } from '@react-pdf/renderer'
import { colors, sizes, common } from '../common/styles'
import { FicheData } from '../types'
import { euros } from '../helpers'

// SVG Text avec props correctes pour react-pdf
const SvgText = Text as any

const s = StyleSheet.create({
  page: {
    ...common.page,
    paddingBottom: 0,
  },
  body: {
    paddingLeft: sizes.marginAccent,
    paddingRight: sizes.margin,
    paddingTop: 22,
    flex: 1,
    flexDirection: 'column',
  },

  // ─── Chiffre choc ─────────────────────────────────────────────────────────
  hero: {
    backgroundColor: colors.navy,
    borderRadius: 8,
    paddingVertical: 34,
    paddingHorizontal: 26,
    marginBottom: 26,
    alignItems: 'center',
  },
  heroLabel: {
    fontSize: 7.5,
    fontWeight: 600,
    letterSpacing: 2,
    color: '#8aa4bd',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  heroValue: {
    fontSize: 46,
    fontWeight: 900,
    color: colors.white,
    letterSpacing: -1.2,
    lineHeight: 1,
  },
  heroSub: {
    fontSize: 8,
    fontWeight: 300,
    color: '#8aa4bd',
    marginTop: 10,
  },
  heroSubStrong: {
    fontSize: 8,
    fontWeight: 700,
    color: colors.gold,
  },

  chartCard: {
    backgroundColor: colors.paper,
    borderRadius: 8,
    paddingVertical: 28,
    paddingHorizontal: 20,
    flex: 1,
  },

  chartWrap: {
    marginTop: 4,
    marginBottom: 18,
    alignItems: 'center',
  },

  caption: {
    fontSize: 7,
    fontWeight: 300,
    color: colors.muted,
    textAlign: 'center',
  },
  captionStrong: {
    fontSize: 7,
    fontWeight: 700,
    color: colors.navy,
  },

  disclaimer: {
    fontSize: 6,
    fontWeight: 300,
    color: '#aaa8a2',
    lineHeight: 1.8,
    fontStyle: 'italic',
    marginTop: 'auto',
    paddingBottom: 12,
  },
  disclaimerStrong: {
    fontSize: 6,
    fontWeight: 600,
    fontStyle: 'normal',
    color: colors.muted,
  },
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

interface Props { data: FicheData }

const MILESTONES = [5, 10, 15, 20]

export default function PageProjection({ data }: Props) {
  const { project, projectionRealiste, projectionConservateur } = data
  const footerLabel = [project.adresse, project.city].filter(Boolean).join(' · ')
  const hasData = projectionRealiste?.length > 0

  const CW = 449
  const CH = 340
  const PAD_T = 40   // espace pour l'étiquette de valeur au-dessus de la barre
  const PAD_B = 36   // espace pour l'étiquette d'année + valeur conservatrice

  const realisteVals = MILESTONES.map(yr => hasData ? (projectionRealiste[yr - 1]?.patrimoineNet ?? 0) : 0)
  const conservateurVals = MILESTONES.map(yr => hasData ? (projectionConservateur[yr - 1]?.patrimoineNet ?? 0) : 0)
  const maxVal = Math.max(...realisteVals, 1)

  const patrimoineA20 = realisteVals[3]

  const colW = CW / MILESTONES.length
  const barW = colW * 0.42

  return (
    <Page size="A4" style={s.page}>
      <View style={common.accentBar} />

      <View style={common.header}>
        <Text style={common.headerLogo}>CAPSUL</Text>
        <View style={common.headerRight}>
          <Text style={common.eyebrow}>Projection patrimoniale</Text>
          <Text style={common.pageNum}>04</Text>
        </View>
      </View>

      <View style={s.body}>
        <Text style={common.secLabel}>Évolution du patrimoine net sur 20 ans</Text>

        {/* Chiffre choc */}
        <View style={s.hero}>
          <Text style={s.heroLabel}>Patrimoine net constitué à 20 ans</Text>
          <Text style={s.heroValue}>{hasData ? euros(patrimoineA20) : '—'}</Text>
          <Text style={s.heroSub}>
            {'Scénario '}<Text style={s.heroSubStrong}>réaliste</Text>{' (+2 % /an de revalorisation)'}
          </Text>
        </View>

        {/* Barres par palier */}
        <View style={s.chartCard}>
        <View style={s.chartWrap}>
          <Svg width={CW} height={CH}>
            <Defs>
              <LinearGradient id="barGrad" x1="0" y1="1" x2="0" y2="0">
                <Stop offset="0" stopColor={colors.navy} />
                <Stop offset="1" stopColor={colors.navyLight} />
              </LinearGradient>
            </Defs>

            {/* Ligne de base */}
            <Rect x={0} y={CH - PAD_B} width={CW} height={0.75} fill={colors.rule} />

            {MILESTONES.map((yr, i) => {
              const val = realisteVals[i]
              const consVal = conservateurVals[i]
              const barH = hasData ? Math.max(2, (val / maxVal) * (CH - PAD_T - PAD_B)) : 2
              const colX = i * colW
              const barX = colX + (colW - barW) / 2
              const barY = CH - PAD_B - barH

              return (
                <React.Fragment key={yr}>
                  <Rect x={barX} y={barY} width={barW} height={barH} rx={4} fill="url(#barGrad)" />
                  <Rect x={barX} y={barY} width={barW} height={3.5} fill={colors.gold} />

                  <SvgText
                    x={colX + colW / 2} y={barY - 13}
                    fontSize={13} fontFamily="Montserrat" fontWeight={800}
                    fill={colors.navy} textAnchor="middle"
                  >
                    {hasData ? euros(val, false) : '—'}
                  </SvgText>

                  <SvgText
                    x={colX + colW / 2} y={CH - PAD_B + 17}
                    fontSize={9} fontFamily="Montserrat" fontWeight={700}
                    fill={colors.navy} textAnchor="middle"
                  >
                    {`${yr} ans`}
                  </SvgText>
                  <SvgText
                    x={colX + colW / 2} y={CH - PAD_B + 29}
                    fontSize={7} fontFamily="Montserrat" fontWeight={300}
                    fill={colors.muted} textAnchor="middle"
                  >
                    {`Cons. ${hasData ? euros(consVal, false) : '—'}`}
                  </SvgText>
                </React.Fragment>
              )
            })}
          </Svg>
        </View>

        <Text style={s.caption}>
          {'Barres : patrimoine net en scénario '}
          <Text style={s.captionStrong}>réaliste</Text>
          {' (+2 % /an). "Cons." : valeur en scénario '}
          <Text style={s.captionStrong}>conservateur</Text>
          {' (0 % /an), sans plus-value latente.'}
        </Text>
        </View>

        <Text style={s.disclaimer}>
          {'Les projections sont établies sur la base des données du marché à la date de préparation. Elles reposent sur des hypothèses de revalorisation (+2 % réaliste, +0 % conservateur) et ne constituent pas une garantie de performance. Dossier confidentiel préparé par '}
          <Text style={s.disclaimerStrong}>{data.chargeNom}</Text>
          {' · capsul-france.com'}
        </Text>
      </View>

      <View style={s.footerDark}>
        <Text style={s.footerDarkL}>Dossier confidentiel · Capsul France 2026 · capsul-france.com</Text>
        <Text style={s.footerDarkR}>CAPSUL</Text>
      </View>
    </Page>
  )
}
