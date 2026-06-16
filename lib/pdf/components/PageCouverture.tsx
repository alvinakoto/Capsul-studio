import React from 'react'
import { Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import { colors, sizes } from '../common/styles'
import { FicheData } from '../types'
import { euros, pct } from '../helpers'

const s = StyleSheet.create({
  page: {
    fontFamily: 'Montserrat',
    backgroundColor: colors.navy,
    flexDirection: 'column',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },

  // ─── Left column ──────────────────────────────────────────────────────────
  left: {
    width: '38%',
    paddingLeft: sizes.margin,
    paddingRight: 24,
    paddingTop: 44,
    paddingBottom: 44,
    flexDirection: 'column',
  },
  wordmark: {
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 3,
    color: colors.gold,
    marginBottom: 'auto',
  },
  overline: {
    width: 24,
    height: 1.5,
    backgroundColor: colors.gold,
    marginBottom: 14,
    opacity: 0.7,
  },
  eyebrow: {
    fontSize: 6,
    fontWeight: 500,
    letterSpacing: 1.8,
    color: '#8ba4bf',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  address: {
    fontSize: 28,
    fontWeight: 900,
    lineHeight: 1.0,
    letterSpacing: -0.5,
    color: colors.white,
    marginBottom: 8,
  },
  addressSub: {
    fontSize: 8,
    fontWeight: 300,
    color: '#8ba4bf',
    letterSpacing: 0.8,
    marginBottom: 36,
  },
  divider: {
    width: '100%',
    height: 0.5,
    backgroundColor: '#2a4a6a',
    marginBottom: 16,
  },
  preparedBy: {
    fontSize: 7,
    fontWeight: 300,
    color: '#5a7a9a',
    lineHeight: 1.8,
  },
  preparedStrong: {
    fontSize: 7,
    fontWeight: 500,
    color: '#7a9abd',
  },

  // ─── Right column ──────────────────────────────────────────────────────────
  right: {
    flex: 1,
  },
  photo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  photoFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1e3e62',
  },
  sep: {
    position: 'absolute',
    left: 0,
    top: '10%',
    bottom: '10%',
    width: 0.5,
    backgroundColor: '#2a4a6a',
  },

  // ─── Metrics strip ────────────────────────────────────────────────────────
  metrics: {
    height: 62,
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderTopColor: '#2a4a6a',
    borderTopStyle: 'solid',
    backgroundColor: '#0e2338',
  },
  metric: {
    flex: 1,
    paddingLeft: sizes.margin,
    paddingRight: 12,
    justifyContent: 'center',
    borderRightWidth: 0.5,
    borderRightColor: '#2a4a6a',
    borderRightStyle: 'solid',
  },
  metricLast: {
    flex: 1,
    paddingLeft: sizes.margin,
    paddingRight: 12,
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: 5.5,
    fontWeight: 500,
    letterSpacing: 1.5,
    color: '#5a7a9a',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: 700,
    color: colors.white,
    letterSpacing: -0.5,
  },
  metricUnit: {
    fontSize: 8,
    fontWeight: 300,
    color: '#5a7a9a',
  },
})

interface Props {
  data: FicheData
}

export default function PageCouverture({ data }: Props) {
  const { project, coverPhotoUrl, chargeNom } = data

  const addressLine1 = project.adresse
    ? project.adresse.length > 20
      ? project.adresse.substring(0, project.adresse.lastIndexOf(' ', 20))
      : project.adresse
    : project.name

  const addressLine2 = project.adresse && project.adresse.length > 20
    ? project.adresse.substring(project.adresse.lastIndexOf(' ', 20) + 1)
    : null

  const subParts = [
    project.city?.toUpperCase(),
    project.type_bien,
    project.surface_m2 ? `${project.surface_m2} M²` : null,
    project.dpe_actuel ? `DPE ${project.dpe_actuel}` : null,
  ].filter(Boolean).join('  ·  ')

  const budgetTotal = data.prixProjetTotal

  return (
    <Page size="A4" style={s.page}>
      <View style={s.body}>

        {/* Left */}
        <View style={s.left}>
          <Text style={s.wordmark}>CAPSUL</Text>

          <View>
            <View style={s.overline} />
            <Text style={s.eyebrow}>Analyse d'investissement</Text>
            <Text style={s.address}>
              {addressLine1}{addressLine2 ? '\n' + addressLine2 : ''}
            </Text>
            <Text style={s.addressSub}>{subParts}</Text>
            <View style={s.divider} />
            <Text style={s.preparedBy}>
              {'Dossier préparé par\n'}
              <Text style={s.preparedStrong}>{chargeNom}</Text>
              {'\nCapsul France · 2026'}
            </Text>
          </View>
        </View>

        {/* Right */}
        <View style={s.right}>
          {coverPhotoUrl ? (
            <Image src={coverPhotoUrl} style={s.photo} />
          ) : (
            <View style={s.photoFallback} />
          )}
          <View style={s.sep} />
        </View>

      </View>

      {/* Metrics */}
      <View style={s.metrics}>
        <View style={s.metric}>
          <Text style={s.metricLabel}>Prix d'achat</Text>
          <Text style={s.metricValue}>
            {Math.round(project.prix_achat / 1000)} <Text style={s.metricUnit}>k€</Text>
          </Text>
        </View>
        <View style={s.metric}>
          <Text style={s.metricLabel}>Budget total</Text>
          <Text style={s.metricValue}>
            {Math.round(budgetTotal / 1000)} <Text style={s.metricUnit}>k€</Text>
          </Text>
        </View>
        <View style={s.metric}>
          <Text style={s.metricLabel}>Mensualité</Text>
          <Text style={s.metricValue}>
            {euros(data.mensualiteTotale, false)} <Text style={s.metricUnit}>€/mois</Text>
          </Text>
        </View>
        <View style={s.metricLast}>
          <Text style={s.metricLabel}>Rentabilité brute</Text>
          <Text style={s.metricValue}>
            {pct(data.scenarioResult?.rentabiliteBrutePct, 1)}
          </Text>
        </View>
      </View>
    </Page>
  )
}