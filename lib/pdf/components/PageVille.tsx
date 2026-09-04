import React from 'react'
import { Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import { colors, sizes, common } from '../common/styles'
import { LucideIcon } from '../common/LucideIcon'
import { PdfBackground } from '../common/background'
import type { IconName } from '../../data/icons'
import { FicheData } from '../types'
import { nombre, pct, pageNum } from '../helpers'

const HERO_H = 290

const s = StyleSheet.create({
  page: {
    ...common.page,
    paddingBottom: 32,
  },

  // ─── Bandeau ville ────────────────────────────────────────────────────────
  hero: {
    position: 'relative',
    height: HERO_H,
    backgroundColor: colors.navy,
  },
  heroPhoto: {
    width: '100%',
    height: HERO_H,
    objectFit: 'cover',
  },
  heroCaption: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingLeft: sizes.marginAccent,
    paddingRight: sizes.margin,
    paddingTop: 18,
    paddingBottom: 18,
    backgroundColor: 'rgba(22, 49, 78, 0.86)',
  },
  heroTypo: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingLeft: sizes.marginAccent,
    paddingRight: sizes.margin,
    paddingBottom: 34,
  },
  heroWatermark: {
    position: 'absolute',
    right: sizes.margin - 6,
    top: 22,
    fontSize: 118,
    fontWeight: 900,
    letterSpacing: -4,
    color: colors.white,
    opacity: 0.035,
  },
  overline: {
    width: 24,
    height: 1.5,
    backgroundColor: colors.gold,
    marginBottom: 12,
    opacity: 0.8,
  },
  heroEyebrow: {
    fontSize: 6,
    fontWeight: 500,
    letterSpacing: 1.8,
    color: '#8ba4bf',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  heroName: {
    fontSize: 30,
    fontWeight: 900,
    letterSpacing: -0.8,
    lineHeight: 1,
    color: colors.white,
  },
  heroNameLarge: {
    fontSize: 40,
  },
  heroSurnom: {
    fontSize: 9,
    fontWeight: 500,
    letterSpacing: 0.6,
    color: colors.gold,
    marginTop: 8,
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
    flex: 1.4,
  },
  colRight: {
    flex: 1,
  },

  // ─── Tuiles chiffres clés ─────────────────────────────────────────────────
  tiles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  tile: {
    width: '47%',
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: colors.paper,
    borderRadius: 6,
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 14,
    paddingRight: 12,
    minHeight: 78,
    justifyContent: 'center',
  },
  tileIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  tileValueBig: {
    fontSize: 18,
    fontWeight: 900,
    color: colors.navy,
    letterSpacing: -0.5,
    lineHeight: 1,
  },
  tileValueText: {
    fontSize: 8.5,
    fontWeight: 700,
    color: colors.navy,
    lineHeight: 1.3,
  },
  tileLabel: {
    fontSize: 5.5,
    fontWeight: 500,
    letterSpacing: 1.2,
    color: colors.muted,
    textTransform: 'uppercase',
    marginTop: 5,
  },

  // ─── Marché ───────────────────────────────────────────────────────────────
  marketLabel: {
    fontSize: 5.5,
    fontWeight: 500,
    letterSpacing: 1.5,
    color: colors.muted,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  marketPrice: {
    fontSize: 17,
    fontWeight: 900,
    color: colors.navy,
    letterSpacing: -0.5,
    lineHeight: 1,
  },
  marketPriceUnit: {
    fontSize: 8,
    fontWeight: 400,
    color: colors.muted,
  },
  marketNote: {
    fontSize: 6.5,
    fontWeight: 300,
    color: colors.muted,
    lineHeight: 1.6,
    marginTop: 6,
  },
  rendementBlock: {
    marginTop: 16,
    paddingLeft: 14,
    paddingRight: 14,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: colors.paper,
    borderLeftWidth: 2.5,
    borderLeftColor: colors.gold,
    borderLeftStyle: 'solid',
  },
  rendementValue: {
    fontSize: 22,
    fontWeight: 900,
    color: colors.navy,
    letterSpacing: -0.5,
    lineHeight: 1,
    marginBottom: 5,
  },
  source: {
    fontSize: 5.5,
    fontWeight: 300,
    fontStyle: 'italic',
    color: '#aaa8a2',
    lineHeight: 1.6,
    marginTop: 14,
  },
})

interface Props {
  data: FicheData
  pageNumber: number
}

interface Tile {
  icon: IconName
  value: string
  label: string
  big: boolean
}

export default function PageVille({ data, pageNumber }: Props) {
  const { project, villeNom, villeInfos, villePhotoPath, chargeNom } = data
  const infos = villeInfos ?? {}
  const footerLabel = [project.adresse, project.city].filter(Boolean).join(' · ')

  const tiles: Tile[] = [
    infos.habitants !== undefined
      ? { icon: 'users', value: nombre(infos.habitants), label: 'habitants', big: true }
      : null,
    infos.etudiants !== undefined
      ? { icon: 'graduationCap', value: nombre(infos.etudiants), label: 'étudiants', big: true }
      : null,
    infos.acces
      ? { icon: 'trainFront', value: infos.acces, label: 'accès', big: false }
      : null,
    infos.atout
      ? { icon: 'building2', value: infos.atout, label: 'atout', big: false }
      : null,
  ].filter((t): t is Tile => t !== null)

  const hasPrix = infos.prixM2Min !== undefined || infos.prixM2Max !== undefined
  const prixLabel =
    infos.prixM2Min !== undefined && infos.prixM2Max !== undefined
      ? `${nombre(infos.prixM2Min)} – ${nombre(infos.prixM2Max)}`
      : nombre(infos.prixM2Min ?? infos.prixM2Max)
  const hasRendement = infos.rendementMoyenPct !== undefined
  const hasMarket = hasPrix || hasRendement

  const caption = (
    <>
      <View style={s.overline} />
      <Text style={s.heroEyebrow}>Investir à</Text>
      <Text style={[s.heroName, villePhotoPath ? {} : s.heroNameLarge]}>{villeNom.toUpperCase()}</Text>
      {infos.surnom ? <Text style={s.heroSurnom}>{infos.surnom}</Text> : null}
    </>
  )

  return (
    <Page size="A4" style={s.page}>
      <View style={common.accentBar} />

      {/* Header */}
      <View style={common.header}>
        <Text style={common.headerLogo}>CAPSUL</Text>
        <View style={common.headerRight}>
          <Text style={common.eyebrow}>La ville</Text>
          <Text style={common.pageNum}>{pageNum(pageNumber)}</Text>
        </View>
      </View>

      {/* Bandeau : photo + légende, ou composition typographique */}
      <View style={s.hero}>
        {villePhotoPath ? (
          <>
            <Image src={villePhotoPath} style={s.heroPhoto} />
            <View style={s.heroCaption}>{caption}</View>
          </>
        ) : (
          <>
            <PdfBackground variant="bande" />
            {villeNom.length <= 9 && (
              <Text style={s.heroWatermark}>{villeNom.toUpperCase()}</Text>
            )}
            <View style={s.heroTypo}>{caption}</View>
          </>
        )}
      </View>

      {/* Corps */}
      <View style={s.body}>

        {/* Chiffres clés */}
        <View style={hasMarket ? s.colLeft : { flex: 1 }}>
          {tiles.length > 0 && (
            <>
              <Text style={common.secLabel}>Chiffres clés</Text>
              <View style={s.tiles}>
                {tiles.map((t) => (
                  <View key={t.label} style={s.tile}>
                    <View style={s.tileIcon}>
                      <LucideIcon name={t.icon} size={15} color={colors.goldDeep} />
                    </View>
                    <Text style={t.big ? s.tileValueBig : s.tileValueText}>{t.value}</Text>
                    <Text style={s.tileLabel}>{t.label}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        {/* Marché immobilier */}
        {hasMarket && (
          <View style={s.colRight}>
            <Text style={common.secLabel}>Le marché immobilier</Text>

            {hasPrix && (
              <View style={{ marginTop: 4 }}>
                <Text style={s.marketLabel}>Prix moyen au m² · appartement</Text>
                <Text style={s.marketPrice}>
                  {prixLabel}
                  <Text style={s.marketPriceUnit}> €/m²</Text>
                </Text>
                <Text style={s.marketNote}>Fourchette constatée, quel que soit le nombre de pièces.</Text>
              </View>
            )}

            {hasRendement && (
              <View style={s.rendementBlock}>
                <Text style={s.marketLabel}>Rentabilité moyenne de la ville</Text>
                <Text style={s.rendementValue}>{pct(infos.rendementMoyenPct, 1)}</Text>
                <Text style={s.marketNote}>Rendement brut moyen observé sur le marché local.</Text>
              </View>
            )}

            <Text style={s.source}>
              {"Sources : observations Capsul, DVF, MeilleursAgents — données indicatives, susceptibles de varier selon le quartier et l'état du bien."}
            </Text>
          </View>
        )}

      </View>

      {/* Footer */}
      <View style={common.footer}>
        <Text style={common.footerL}>{footerLabel} · Préparé par {chargeNom}</Text>
        <Text style={common.footerR}>Capsul France</Text>
      </View>
    </Page>
  )
}
