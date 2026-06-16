import React from 'react'
import { Page, View, Text, StyleSheet, Svg, Line, Polyline, Circle } from '@react-pdf/renderer'
import { colors, sizes, common } from '../common/styles'
import { FicheData } from '../types'
import { eurosShort } from '../helpers'

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
  chartWrap: {
    marginTop: 16,
    marginBottom: 16,
    position: 'relative',
  },
  milestones: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderTopColor: colors.rule,
    borderTopStyle: 'solid',
    marginBottom: 20,
  },
  milestone: {
    flex: 1,
    paddingTop: 14,
    paddingBottom: 14,
    paddingLeft: 14,
    paddingRight: 14,
    borderRightWidth: 0.5,
    borderRightColor: colors.rule,
    borderRightStyle: 'solid',
  },
  milestoneLast: {
    flex: 1,
    paddingTop: 14,
    paddingBottom: 14,
    paddingLeft: 14,
    paddingRight: 14,
  },
  msYear: {
    fontSize: 5.5,
    fontWeight: 600,
    letterSpacing: 1.5,
    color: colors.muted,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  msValue: {
    fontSize: 20,
    fontWeight: 900,
    color: colors.navy,
    letterSpacing: -0.5,
    lineHeight: 1,
    marginBottom: 3,
  },
  msLabel: {
    fontSize: 6,
    fontWeight: 300,
    color: colors.muted,
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

function buildPoints(
  data: any[], cw: number, ch: number,
  maxVal: number, padL: number, padR: number, padT: number, padB: number
): string {
  if (!data?.length) return ''
  return data.map((d, i) => {
    const x = padL + (i / (data.length - 1)) * (cw - padL - padR)
    const val = Math.max(0, d.patrimoineNet)
    const y = padT + (1 - val / Math.max(maxVal, 1)) * (ch - padT - padB)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
}

interface Props { data: FicheData }

export default function PageProjection({ data }: Props) {
  const { project, projectionRealiste, projectionConservateur } = data
  const footerLabel = [project.adresse, project.city].filter(Boolean).join(' · ')
  const hasData = projectionRealiste?.length > 0

  const CW = 489
  const CH = 150
  const PAD_L = 36
  const PAD_R = 10 // marge droite pour que la dernière étiquette ne dépasse pas
  const PAD_T = 6
  const PAD_B = 18

  const maxVal = hasData
    ? Math.max(...projectionRealiste.map(d => d.patrimoineNet), 1)
    : 300000

  const gridVals = [maxVal, maxVal * 0.5, 0]
  const realistePoints = hasData ? buildPoints(projectionRealiste, CW, CH, maxVal, PAD_L, PAD_R, PAD_T, PAD_B) : ''
  const consPoints = hasData ? buildPoints(projectionConservateur, CW, CH, maxVal, PAD_L, PAD_R, PAD_T, PAD_B) : ''

  const at10 = hasData ? projectionRealiste[9]?.patrimoineNet ?? 0 : 0
  const at15 = hasData ? projectionRealiste[14]?.patrimoineNet ?? 0 : 0
  const at20 = hasData ? projectionRealiste[19]?.patrimoineNet ?? 0 : 0

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

        {/* Chart */}
        <View style={s.chartWrap}>
          <Svg width={CW} height={CH}>
            {/* Grid */}
            {gridVals.map((val, i) => {
              const y = PAD_T + (1 - val / Math.max(maxVal, 1)) * (CH - PAD_T - PAD_B)
              return (
                <React.Fragment key={i}>
                  <Line x1={PAD_L} y1={y} x2={CW - PAD_R} y2={y}
                    stroke={colors.rule} strokeWidth={0.5} />
                  <SvgText
                    x={PAD_L - 3} y={y + 2}
                    fontSize={6} fontFamily="Montserrat" fontWeight={300}
                    fill={colors.muted} textAnchor="end"
                  >
                    {eurosShort(val)}
                  </SvgText>
                </React.Fragment>
              )
            })}

            {/* X labels — la dernière (A20) est ancrée à droite pour ne pas dépasser */}
            {[1, 5, 10, 15, 20].map((yr) => {
              const x = PAD_L + ((yr - 1) / 19) * (CW - PAD_L - PAD_R)
              const isLast = yr === 20
              return (
                <SvgText
                  key={yr} x={isLast ? CW - PAD_R : x} y={CH - 4}
                  fontSize={6} fontFamily="Montserrat" fontWeight={300}
                  fill={colors.muted} textAnchor={isLast ? 'end' : 'middle'}
                >
                  {`A${yr}`}
                </SvgText>
              )
            })}

            {/* Conservateur */}
            {consPoints && (
              <Polyline points={consPoints} fill="none"
                stroke={colors.muted} strokeWidth={1.2} strokeDasharray="4,3" />
            )}

            {/* Réaliste */}
            {realistePoints && (
              <Polyline points={realistePoints} fill="none"
                stroke={colors.navy} strokeWidth={2} />
            )}

            {/* Dots at A10 and A20 */}
            {hasData && (() => {
              const x10 = PAD_L + (9 / 19) * (CW - PAD_L - PAD_R)
              const y10 = PAD_T + (1 - Math.max(0, at10) / maxVal) * (CH - PAD_T - PAD_B)
              const x20 = PAD_L + (19 / 19) * (CW - PAD_L - PAD_R)
              const y20 = PAD_T + (1 - Math.max(0, at20) / maxVal) * (CH - PAD_T - PAD_B)
              return <>
                <Circle cx={x10} cy={y10} r={3} fill={colors.navy} />
                <Circle cx={x20} cy={y20} r={3} fill={colors.navy} />
              </>
            })()}

            {/* Legend */}
            <Line x1={CW - PAD_R - 120} y1={12} x2={CW - PAD_R - 102} y2={12}
              stroke={colors.navy} strokeWidth={2} />
            <SvgText x={CW - PAD_R - 98} y={15}
              fontSize={6} fontFamily="Montserrat" fontWeight={600}
              fill={colors.navy}>
              Réaliste
            </SvgText>
            <Line x1={CW - PAD_R - 120} y1={24} x2={CW - PAD_R - 102} y2={24}
              stroke={colors.muted} strokeWidth={1.2} strokeDasharray="4,3" />
            <SvgText x={CW - PAD_R - 98} y={27}
              fontSize={6} fontFamily="Montserrat" fontWeight={300}
              fill={colors.muted}>
              Conservateur
            </SvgText>
          </Svg>
        </View>

        {/* Milestones */}
        <View style={s.milestones}>
          <View style={s.milestone}>
            <Text style={s.msYear}>Patrimoine à 10 ans</Text>
            <Text style={s.msValue}>{hasData ? eurosShort(at10) : '—'}</Text>
            <Text style={s.msLabel}>Scénario réaliste</Text>
          </View>
          <View style={s.milestone}>
            <Text style={s.msYear}>Patrimoine à 15 ans</Text>
            <Text style={s.msValue}>{hasData ? eurosShort(at15) : '—'}</Text>
            <Text style={s.msLabel}>Scénario réaliste</Text>
          </View>
          <View style={s.milestoneLast}>
            <Text style={s.msYear}>Patrimoine à 20 ans</Text>
            <Text style={s.msValue}>{hasData ? eurosShort(at20) : '—'}</Text>
            <Text style={s.msLabel}>Scénario réaliste</Text>
          </View>
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