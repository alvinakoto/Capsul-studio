import React from 'react'
import { Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import { colors, sizes } from '../common/styles'
import { PdfBackground } from '../common/background'
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
  // position: 'relative' + enfants en 'absolute' (plutôt que width/height: '100%')
  // — un View à 100% sans contenu ne se peint pas de façon fiable dans ce
  // pipeline react-pdf quand son parent n'a qu'une hauteur flex (non explicite).
  right: {
    position: 'relative',
    flex: 1,
  },
  photo: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    objectFit: 'cover',
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
    height: 78,
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
    fontSize: 7,
    fontWeight: 600,
    letterSpacing: 1,
    color: '#a8c0d8',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 21,
    fontWeight: 800,
    color: colors.white,
    letterSpacing: -0.7,
  },
  metricUnit: {
    fontSize: 10,
    fontWeight: 400,
    color: '#a8c0d8',
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
  const negociationEnvisagee = !!project.negociation_envisagee && !!project.prix_affiche_origine

  return (
    <Page size="A4" style={s.page}>
      <PdfBackground variant="cover" />
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
            <PdfBackground variant="cover" />
          )}
          <View style={s.sep} />
        </View>

      </View>

      {/* Metrics */}
      <View style={s.metrics}>
        <View style={s.metric}>
          <Text style={s.metricLabel}>
            {negociationEnvisagee ? 'Prix négocié envisagé' : "Prix d'achat"}
          </Text>
          <Text style={s.metricValue}>
            {euros(project.prix_achat, false)} <Text style={s.metricUnit}>€</Text>
          </Text>
          {negociationEnvisagee && (
            <Text style={{ fontSize: 7, color: '#7692ae', marginTop: 3, textDecoration: 'line-through' }}>
              {euros(project.prix_affiche_origine)}
            </Text>
          )}
        </View>
        <View style={s.metric}>
          <Text style={s.metricLabel}>Budget total</Text>
          <Text style={s.metricValue}>
            {euros(budgetTotal, false)} <Text style={s.metricUnit}>€</Text>
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