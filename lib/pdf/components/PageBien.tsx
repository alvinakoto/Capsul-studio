import React from 'react'
import { Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import { colors, sizes, common, DPE_BG } from '../common/styles'
import { FicheData } from '../types'
import { euros, pageNum } from '../helpers'

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
    fontSize: 9,
    fontWeight: 400,
    color: '#3f3d3a',
    lineHeight: 1.7,
    marginBottom: 18,
  },

  // ─── Grille photos ────────────────────────────────────────────────────────
  // 2 rangées de 3 (max 6 photos, imposé à l'upload). La localisation est
  // passée en colonne droite pour laisser à cette grille toute la largeur et
  // la hauteur de la colonne gauche (cf. incident débordement, sept. 2026 :
  // les deux rangées + la carte ne tenaient plus ensemble dans la colonne).
  thumbGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  thumb: {
    flexGrow: 0,
    flexShrink: 0,
    width: '31.5%',
    aspectRatio: 1.33,
    borderRadius: 3,
    backgroundColor: '#c4c0b8',
    objectFit: 'cover',
  },

  // ─── Localisation (colonne droite) ───────────────────────────────────────
  locaAdresse: {
    fontSize: 8,
    fontWeight: 700,
    color: colors.navy,
    marginTop: 2,
    marginBottom: 6,
    lineHeight: 1.3,
  },
  locaPhoto: {
    width: '100%',
    height: 140,
    borderRadius: 4,
    objectFit: 'cover',
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

interface Props {
  data: FicheData
  pageNumber: number
}

export default function PageBien({ data, pageNumber }: Props) {
  const { project, mainPhotoUrl, mainPhotoLegende, localisationPhotoUrl, secondaryPhotos } = data

  const specs = [
    { k: 'Type', v: project.type_bien ?? '—' },
    { k: 'Surface', v: project.surface_m2 ? `${project.surface_m2} m²` : '—' },
    { k: 'Ville', v: project.city },
    { k: 'DPE actuel', v: project.dpe_actuel ?? null, isDpe: true },
    { k: 'DPE visé', v: project.dpe_apres_travaux ?? null, isDpe: true },
    { k: 'Travaux prévus', v: project.travaux ? euros(project.travaux) : '—' },
    { k: 'Ameublement', v: project.mobilier ? euros(project.mobilier) : '—' },
    { k: 'Charges copro', v: project.charges_copro_annuelles ? `${euros(project.charges_copro_annuelles)}/an` : '—' },
    { k: 'Taxe foncière', v: project.taxe_fonciere ? `${euros(project.taxe_fonciere)}/an` : '—' },
  ]

  const footerLabel = [project.adresse, project.city].filter(Boolean).join(' · ')
  const adresseComplete = [project.adresse, project.city].filter(Boolean).join(', ')

  return (
    <Page size="A4" style={s.page}>
      <View style={common.accentBar} />

      {/* Header */}
      <View style={common.header}>
        <Text style={common.headerLogo}>CAPSUL</Text>
        <View style={common.headerRight}>
          <Text style={common.eyebrow}>Le bien</Text>
          <Text style={common.pageNum}>{pageNum(pageNumber)}</Text>
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
                {secondaryPhotos.slice(0, 6).map((p, i) => (
                  <Image key={i} src={p.url} style={s.thumb} />
                ))}
              </View>
            </>
          )}
        </View>

        {/* Colonne droite — specs + localisation */}
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

          {localisationPhotoUrl && (
            <View style={{ marginTop: 16 }}>
              <Text style={common.secLabel}>Localisation</Text>
              {adresseComplete ? <Text style={s.locaAdresse}>{adresseComplete}</Text> : null}
              <Image src={localisationPhotoUrl} style={s.locaPhoto} />
            </View>
          )}
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