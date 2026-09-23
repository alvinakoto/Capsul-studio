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
    fontWeight: 700,
    letterSpacing: 1.8,
    color: '#b6cbe0',
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
    fontSize: 10,
    fontWeight: 500,
    color: '#cddcea',
    letterSpacing: 0.6,
    lineHeight: 1.5,
    marginBottom: 34,
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
  // Bandeau ~1/4 de la hauteur A4 (842pt) — chiffres clés mis en avant, centrés verticalement.
  metrics: {
    height: sizes.pageH / 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#2a4a6a',
    borderTopStyle: 'solid',
    backgroundColor: '#0e2338',
  },
  metric: {
    flex: 1,
    height: '100%',
    paddingLeft: 26,
    paddingRight: 14,
    justifyContent: 'center',
    borderRightWidth: 0.5,
    borderRightColor: '#2a4a6a',
    borderRightStyle: 'solid',
  },
  metricLast: {
    flex: 1,
    height: '100%',
    paddingLeft: 26,
    paddingRight: 14,
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: 8.5,
    fontWeight: 600,
    letterSpacing: 1.1,
    color: '#b6cbe0',
    height: 12,
    marginBottom: 14,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontWeight: 800,
    color: colors.white,
    letterSpacing: -1,
    lineHeight: 1.05,
  },
  metricUnit: {
    fontWeight: 400,
    color: '#b6cbe0',
  },
  // Emplacement réservé dans les trois colonnes pour que les libellés et les
  // valeurs restent alignés même quand une seule affiche le prix barré.
  metricNote: {
    height: 14,
    marginTop: 6,
  },
  metricNoteText: {
    fontSize: 9.5,
    color: '#7692ae',
    textDecoration: 'line-through',
  },
})

/**
 * Taille de police adaptée à la longueur de la valeur : sans ça, un montant à
 * 7 chiffres passe à la ligne et le symbole « € » se retrouve décroché en dessous.
 */
function tailleValeur(valeur: string): { value: number; unit: number } {
  const n = valeur.length
  if (n >= 11) return { value: 24, unit: 11 }
  if (n >= 9)  return { value: 28, unit: 12 }
  return { value: 32, unit: 13 }
}

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

  const metrics: { label: string; value: string; unit?: string; note?: string }[] = [
    {
      label: negociationEnvisagee ? 'Prix négocié envisagé' : "Prix d'achat",
      value: euros(project.prix_achat, false),
      unit: '€',
      note: negociationEnvisagee ? euros(project.prix_affiche_origine) : undefined,
    },
    { label: 'Budget total', value: euros(budgetTotal, false), unit: '€' },
    { label: 'Rentabilité brute', value: pct(data.scenarioResult?.rentabiliteBrutePct, 1) },
  ]

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
        {metrics.map((m, i) => {
          const taille = tailleValeur(m.value + (m.unit ?? ''))
          const isLast = i === metrics.length - 1
          return (
            <View
              key={m.label}
              style={[
                isLast ? s.metricLast : s.metric,
                i === 0 ? { paddingLeft: sizes.margin } : {},
              ]}
            >
              <Text style={s.metricLabel}>{m.label}</Text>
              <Text style={[s.metricValue, { fontSize: taille.value }]}>
                {m.value}
                {m.unit ? <Text style={[s.metricUnit, { fontSize: taille.unit }]}> {m.unit}</Text> : null}
              </Text>
              <View style={s.metricNote}>
                {m.note ? <Text style={s.metricNoteText}>{m.note}</Text> : null}
              </View>
            </View>
          )
        })}
      </View>
    </Page>
  )
}