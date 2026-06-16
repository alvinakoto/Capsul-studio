import React from 'react'
import { Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import { colors, sizes, common } from '../common/styles'
import { FicheData } from '../types'
import { euros } from '../helpers'

const s = StyleSheet.create({
  page: {
    ...common.page,
    paddingBottom: 32,
  },

  // ─── Photo principale ─────────────────────────────────────────────────────
  photo: {
    width: '100%',
    height: 240,
    objectFit: 'cover',
  },
  photoFallback: {
    width: '100%',
    height: 240,
    backgroundColor: '#c4c0b8',
  },
  photoCaption: {
    position: 'absolute',
    bottom: 12,
    left: sizes.marginAccent,
    fontSize: 6,
    fontWeight: 500,
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.75)',
    textTransform: 'uppercase',
  },

  // ─── Corps ────────────────────────────────────────────────────────────────
  body: {
    paddingLeft: sizes.marginAccent,
    paddingRight: sizes.margin,
    paddingTop: 22,
    flex: 1,
    flexDirection: 'row',
    gap: 28,
  },
  colLeft: {
    flex: 1,
  },
  colRight: {
    width: 148,
  },

  // ─── Description ──────────────────────────────────────────────────────────
  descText: {
    fontSize: 7.5,
    fontWeight: 300,
    color: '#5a5854',
    lineHeight: 1.75,
    marginBottom: 18,
  },

  // ─── Grille photos ────────────────────────────────────────────────────────
  thumbGrid: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  thumbGridRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  thumb: {
    flex: 1,
    aspectRatio: 1.33,
    borderRadius: 2,
    backgroundColor: '#c4c0b8',
  },

  // ─── Specs ────────────────────────────────────────────────────────────────
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.rule,
    borderBottomStyle: 'solid',
  },
  specKey: {
    fontSize: 7,
    fontWeight: 400,
    color: colors.muted,
  },
  specVal: {
    fontSize: 7.5,
    fontWeight: 700,
    color: colors.navy,
  },
  dpeBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 2,
    fontSize: 8,
    fontWeight: 900,
    color: colors.white,
  },
})

const DPE_BG: Record<string, string> = {
  A: '#16a34a', B: '#22c55e', C: '#84cc16',
  D: '#eab308', E: '#f97316', F: '#ea580c', G: '#dc2626',
}

interface Props {
  data: FicheData
}

export default function PageBien({ data }: Props) {
  const { project, mainPhotoUrl, mainPhotoLegende, secondaryPhotos } = data

  const specs = [
    { k: 'Type', v: project.type_bien ?? '—' },
    { k: 'Surface', v: project.surface_m2 ? `${project.surface_m2} m²` : '—' },
    { k: 'Ville', v: project.city },
    { k: 'DPE actuel', v: project.dpe_actuel ?? null, isDpe: true },
    { k: 'DPE visé', v: project.dpe_apres_travaux ?? null, isDpe: true },
    { k: 'Travaux prévus', v: project.travaux ? euros(project.travaux) : '—' },
    { k: 'Mobilier', v: project.mobilier ? euros(project.mobilier) : '—' },
    { k: 'Charges copro', v: project.charges_copro_annuelles ? `${euros(project.charges_copro_annuelles)}/an` : '—' },
    { k: 'Taxe foncière', v: project.taxe_fonciere ? `${euros(project.taxe_fonciere)}/an` : '—' },
  ]

  const footerLabel = [project.adresse, project.city].filter(Boolean).join(' · ')

  // 6 photos max, réparties en 2 rangées de 3
  const photosRow1 = secondaryPhotos.slice(0, 3)
  const photosRow2 = secondaryPhotos.slice(3, 6)

  return (
    <Page size="A4" style={s.page}>
      <View style={common.accentBar} />

      {/* Header */}
      <View style={common.header}>
        <Text style={common.headerLogo}>CAPSUL</Text>
        <View style={common.headerRight}>
          <Text style={common.eyebrow}>Le bien</Text>
          <Text style={common.pageNum}>02</Text>
        </View>
      </View>

      {/* Photo principale */}
      <View style={{ position: 'relative' }}>
        {mainPhotoUrl ? (
          <Image src={mainPhotoUrl} style={s.photo} />
        ) : (
          <View style={s.photoFallback} />
        )}
        {(mainPhotoLegende || mainPhotoUrl) && (
          <Text style={s.photoCaption}>
            {mainPhotoLegende || 'Vue intérieure'}
          </Text>
        )}
      </View>

      {/* Corps */}
      <View style={s.body}>

        {/* Colonne gauche */}
        <View style={s.colLeft}>
          <Text style={common.secLabel}>Description</Text>
          <Text style={s.descText}>
            {project.description_bien?.trim() ||
              `Bien situé ${project.city ? `à ${project.city}` : ''}, à proximité des commodités et des transports. Idéalement positionné pour un investissement locatif rentable dans le cadre d'une stratégie patrimoniale à long terme.`}
          </Text>

          {secondaryPhotos.length > 0 && (
            <>
              <Text style={common.secLabel}>Photos supplémentaires</Text>
              <View style={s.thumbGrid}>
                {photosRow1.map((p, i) => (
                  <Image key={`r1-${i}`} src={p.url} style={s.thumb} />
                ))}
              </View>
              {photosRow2.length > 0 && (
                <View style={s.thumbGridRow}>
                  {photosRow2.map((p, i) => (
                    <Image key={`r2-${i}`} src={p.url} style={s.thumb} />
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        {/* Colonne droite — specs */}
        <View style={s.colRight}>
          <Text style={common.secLabel}>Caractéristiques</Text>
          <View style={{ marginTop: 10 }}>
            {specs.map((spec, i) => (
              <View key={i} style={s.specItem}>
                <Text style={s.specKey}>{spec.k}</Text>
                {spec.isDpe && spec.v ? (
                  <Text style={[s.dpeBadge, { backgroundColor: DPE_BG[spec.v] ?? colors.muted }]}>
                    {spec.v}
                  </Text>
                ) : (
                  <Text style={s.specVal}>{spec.v || '—'}</Text>
                )}
              </View>
            ))}
          </View>
        </View>

      </View>

      {/* Footer */}
      <View style={common.footer}>
        <Text style={common.footerL}>{footerLabel} · Préparé par {data.chargeNom}</Text>
        <Text style={common.footerR}>Capsul France</Text>
      </View>
    </Page>
  )
}