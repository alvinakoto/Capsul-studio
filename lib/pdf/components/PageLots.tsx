import React from 'react'
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { colors, sizes, common, DPE_BG } from '../common/styles'
import { PdfBackground } from '../common/background'
import { euros, pct, pageNum } from '../helpers'
import {
  LIBELLE_EXPLOITATION, LIBELLE_EXPLOITATION_COURT, hypotheseLot,
} from '../common/immeuble'
import { libelleLot, surfaceTotale } from '@/lib/data/immeuble'
import type { TypeScenario } from '@/lib/calculs/types'
import type { ImmeublePdf } from '../types'

// Page « Les lots » d'un immeuble (fiche commerciale et rapport analytique) :
// composition, DPE et exploitation de chaque lot, du brut au net, répartition des
// recettes et autres exploitations étudiées. Charges de l'immeuble et crédit :
// page Scénario.
// Mise en page adaptée au nombre de lignes (lots + autres exploitations) pour
// tenir sur une page : validé par rendu réel jusqu'au pire cas, 8 lots ayant
// chacun une autre exploitation étudiée et un libellé de longueur maximale.
// Au-delà de 9 lignes, lignes resserrées ; au-delà de 10, barre de répartition
// masquée (le tableau suffit) et alternatives sur une ligne. Seuils validés sur
// les 44 combinaisons possibles : 12 lignes non denses débordaient, 10 laissent une marge.

const TEINTE: Record<TypeScenario, string> = {
  lmnp_meuble: colors.navy,
  colocation: colors.goldDeep,
  courte_duree: '#7f9cb8',
}

// Colonnes du tableau (flex), partagées par l'en-tête, les lignes et le total
const COL = { lot: 2, dpe: 1.05, exploitation: 1.25, hypothese: 1.85, brut: 1.05, frais: 1.1, net: 1.05 }
const COL_GAUCHE = COL.lot + COL.dpe + COL.exploitation + COL.hypothese

const s = StyleSheet.create({
  page: { ...common.page, paddingBottom: 32 },
  hero: { position: 'relative', backgroundColor: colors.navy, paddingLeft: sizes.marginAccent, paddingRight: sizes.margin, paddingTop: 26, paddingBottom: 26 },
  heroOver: { fontSize: 6, fontWeight: 700, letterSpacing: 1.8, color: '#b6cbe0', marginBottom: 5, textTransform: 'uppercase' },
  heroTitle: { fontSize: 11, fontWeight: 700, letterSpacing: 1, color: colors.white, marginBottom: 18, textTransform: 'uppercase' },
  kpis: { flexDirection: 'row' },
  kpi: { flex: 1, paddingRight: 16, marginRight: 16, borderRightWidth: 0.5, borderRightColor: '#2a4a6a', borderRightStyle: 'solid' },
  kpiLast: { flex: 1 },
  kpiLabel: { fontSize: 6, fontWeight: 600, letterSpacing: 1.4, color: '#b6cbe0', marginBottom: 6, textTransform: 'uppercase' },
  kpiValue: { fontSize: 22, fontWeight: 900, color: colors.white, letterSpacing: -0.6, lineHeight: 1 },
  kpiGold: { fontSize: 22, fontWeight: 900, color: colors.gold, letterSpacing: -0.6, lineHeight: 1 },
  kpiUnit: { fontSize: 8, fontWeight: 300, color: '#b6cbe0' },
  body: { paddingLeft: sizes.marginAccent, paddingRight: sizes.margin, paddingTop: 20, flex: 1 },

  th: { fontSize: 5.5, fontWeight: 600, letterSpacing: 1.1, color: colors.muted, textTransform: 'uppercase' },
  trHead: { flexDirection: 'row', alignItems: 'flex-end', paddingBottom: 6, borderBottomWidth: 1.2, borderBottomColor: colors.navy, borderBottomStyle: 'solid', marginTop: 10 },
  tr: { flexDirection: 'row', alignItems: 'center', paddingTop: 7.5, paddingBottom: 7.5, borderBottomWidth: 0.5, borderBottomColor: colors.rule, borderBottomStyle: 'solid' },
  trSerre: { paddingTop: 5.5, paddingBottom: 5.5 },
  trTotal: { flexDirection: 'row', alignItems: 'center', paddingTop: 8, paddingBottom: 8, borderTopWidth: 1.2, borderTopColor: colors.navy, borderTopStyle: 'solid' },
  lotNom: { fontSize: 8, fontWeight: 700, color: colors.navy },
  lotSub: { fontSize: 6.5, fontWeight: 300, color: colors.muted, marginTop: 1.5 },
  cell: { fontSize: 7.5, fontWeight: 300, color: colors.ink },
  cellVal: { fontSize: 7.5, fontWeight: 700, color: colors.navy, textAlign: 'right' },
  cellMuted: { fontSize: 7.5, fontWeight: 300, color: colors.muted, textAlign: 'right' },
  pill: { fontSize: 6, fontWeight: 700, color: colors.white, paddingTop: 2, paddingBottom: 2, paddingLeft: 5, paddingRight: 5, borderRadius: 2, alignSelf: 'flex-start' },
  aChoisir: { fontSize: 6.5, fontWeight: 500, color: colors.muted, fontStyle: 'italic' },
  dpe: { fontSize: 6.5, fontWeight: 900, color: colors.white, width: 11, height: 11, textAlign: 'center', paddingTop: 2, borderRadius: 2 },
  dpeNc: { fontSize: 5.5, fontWeight: 500, color: colors.muted },
  dpeFleche: { fontSize: 6, color: colors.muted, marginLeft: 2, marginRight: 2 },
  totalK: { fontSize: 9, fontWeight: 700, color: colors.navy },
  totalV: { fontSize: 9, fontWeight: 900, color: colors.navy, textAlign: 'right' },
  totalMuted: { fontSize: 7.5, fontWeight: 600, color: colors.muted, textAlign: 'right' },
  note: { fontSize: 6.5, fontWeight: 300, color: colors.muted, lineHeight: 1.5, marginTop: 5 },

  barre: { flexDirection: 'row', height: 9, borderRadius: 2, overflow: 'hidden', marginTop: 8 },
  legende: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  legendeItem: { flexDirection: 'row', alignItems: 'center', marginRight: 12, marginTop: 3 },
  legendeDot: { width: 6, height: 6, borderRadius: 1, marginRight: 4 },
  legendeText: { fontSize: 6.5, fontWeight: 400, color: colors.ink },
})

function Dpe({ actuel, vise }: { actuel: string | null; vise: string | null }) {
  const badge = (c: string | null) => c
    ? <Text style={[s.dpe, { backgroundColor: DPE_BG[c] ?? colors.muted }]}>{c}</Text>
    : <Text style={s.dpeNc}>n.c.</Text>
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {badge(actuel)}
      <Text style={s.dpeFleche}>→</Text>
      {badge(vise)}
    </View>
  )
}

const signe = (n: number) => (n >= 0 ? '+ ' : '− ') + euros(Math.abs(n))

interface Props {
  project: any
  chargeNom: string
  immeuble: ImmeublePdf
  pageNumber: number
  contexte?: 'fiche' | 'rapport'
}

export default function PageLots({ project, chargeNom, immeuble, pageNumber, contexte = 'fiche' }: Props) {
  const { saisie, resultats, flux } = immeuble
  const lots = saisie.lots
  const surface = surfaceTotale(lots)
  const footerLabel = [project.adresse, project.city].filter(Boolean).join(' · ')

  const brutTotal = flux ? flux.lots.reduce((n, l) => n + l.brut, 0) : null
  const netTotal = flux ? flux.recettesNettesLots : null

  // Répartition des recettes nettes par exploitation : utile dès que deux exploitations coexistent
  const parType = flux
    ? (['lmnp_meuble', 'colocation', 'courte_duree'] as TypeScenario[])
        .map((t) => {
          const indices = lots.map((l, i) => (l.exploitation?.type === t ? i : -1)).filter((i) => i >= 0)
          return { t, nb: indices.length, net: indices.reduce((n, i) => n + flux.lots[i].net, 0) }
        })
        .filter((x) => x.nb > 0)
    : []
  const repartition = netTotal && netTotal > 0 && parType.length > 1 ? parType : []

  const alternatives = resultats
    ? lots
        .map((lot, i) => ({ lot, i, alt: resultats.lots[i]?.alternative ?? null }))
        .filter(({ lot, alt }) => alt && lot.comparaison)
    : []

  const lignes = lots.length + alternatives.length
  const serre = lots.length > 6 || lignes > 9
  const dense = lignes > 10

  return (
    <Page size="A4" style={s.page}>
      <View style={common.accentBar} />
      <View style={common.header}>
        <Text style={common.headerLogo}>CAPSUL</Text>
        <View style={common.headerRight}>
          <Text style={common.eyebrow}>Les lots</Text>
          <Text style={common.pageNum}>{pageNum(pageNumber)}</Text>
        </View>
      </View>

      <View style={s.hero}>
        <PdfBackground variant="bande" />
        <Text style={s.heroOver}>{"Composition de l'immeuble"}</Text>
        <Text style={s.heroTitle}>
          {[`${lots.length} lots`, surface ? `${euros(surface, false)} m² habitables` : null].filter(Boolean).join(' · ')}
        </Text>
        <View style={s.kpis}>
          <View style={s.kpi}>
            <Text style={s.kpiLabel}>Recettes brutes</Text>
            <Text style={s.kpiValue}>{brutTotal !== null ? euros(brutTotal, false) : '—'}<Text style={s.kpiUnit}> €/mois</Text></Text>
          </View>
          <View style={s.kpi}>
            <Text style={s.kpiLabel}>Recettes nettes</Text>
            <Text style={s.kpiGold}>{netTotal !== null ? euros(netTotal, false) : '—'}<Text style={s.kpiUnit}> €/mois</Text></Text>
          </View>
          <View style={s.kpiLast}>
            <Text style={s.kpiLabel}>Rentabilité brute</Text>
            <Text style={s.kpiValue}>{resultats ? pct(resultats.scenario.rentabiliteBrutePct, 1) : '—'}</Text>
          </View>
        </View>
      </View>

      <View style={s.body}>
        <Text style={common.secLabel}>Détail par lot</Text>
        <View style={s.trHead}>
          <Text style={[s.th, { flex: COL.lot }]}>Lot</Text>
          <Text style={[s.th, { flex: COL.dpe }]}>DPE</Text>
          <Text style={[s.th, { flex: COL.exploitation }]}>Exploitation</Text>
          <Text style={[s.th, { flex: COL.hypothese }]}>Hypothèse</Text>
          <Text style={[s.th, { flex: COL.brut, textAlign: 'right' }]}>Brut</Text>
          <Text style={[s.th, { flex: COL.frais, textAlign: 'right' }]}>Vacance, frais</Text>
          <Text style={[s.th, { flex: COL.net, textAlign: 'right' }]}>Net</Text>
        </View>

        {lots.map((lot, i) => {
          const m = flux?.lots[i]
          return (
            <View key={lot.id} style={[s.tr, serre ? s.trSerre : {}]} wrap={false}>
              <View style={{ flex: COL.lot }}>
                <Text style={s.lotNom}>{libelleLot(lot, i)}</Text>
                <Text style={s.lotSub}>{[lot.typeBien, lot.surfaceM2 ? `${lot.surfaceM2} m²` : null].filter(Boolean).join(' · ')}</Text>
              </View>
              <View style={{ flex: COL.dpe }}><Dpe actuel={lot.dpeActuel} vise={lot.dpeVise} /></View>
              <View style={{ flex: COL.exploitation }}>
                {lot.exploitation
                  ? <Text style={[s.pill, { backgroundColor: TEINTE[lot.exploitation.type] }]}>{LIBELLE_EXPLOITATION_COURT[lot.exploitation.type]}</Text>
                  : <Text style={s.aChoisir}>À choisir</Text>}
              </View>
              <Text style={[s.cell, { flex: COL.hypothese }]}>{hypotheseLot(lot.exploitation)}</Text>
              <Text style={[s.cellMuted, { flex: COL.brut }]}>{m ? euros(m.brut) : '—'}</Text>
              <Text style={[s.cellMuted, { flex: COL.frais }]}>{m ? `− ${euros(m.brut - m.net)}` : '—'}</Text>
              <Text style={[s.cellVal, { flex: COL.net }]}>{m ? euros(m.net) : '—'}</Text>
            </View>
          )
        })}

        <View style={s.trTotal} wrap={false}>
          <Text style={[s.totalK, { flex: COL_GAUCHE }]}>{`Total des ${lots.length} lots, par mois`}</Text>
          <Text style={[s.totalMuted, { flex: COL.brut }]}>{brutTotal !== null ? euros(brutTotal) : '—'}</Text>
          <Text style={[s.totalMuted, { flex: COL.frais }]}>{brutTotal !== null && netTotal !== null ? `− ${euros(brutTotal - netTotal)}` : '—'}</Text>
          <Text style={[s.totalV, { flex: COL.net }]}>{netTotal !== null ? euros(netTotal) : '—'}</Text>
        </View>
        <Text style={s.note}>
          {resultats
            ? `Vacance locative et gestion (meublé, colocation), conciergerie (courte durée) et charges propres au lot. Les charges de l'immeuble et le crédit figurent ${contexte === 'fiche' ? 'page suivante' : 'en synthèse'}.`
            : 'Exploitation à chiffrer pour certains lots : les montants s\'afficheront une fois tous les loyers renseignés dans le simulateur.'}
        </Text>

        {!dense && repartition.length > 0 && netTotal && (
          <View style={{ marginTop: serre ? 12 : 18 }} wrap={false}>
            <Text style={common.secLabel}>Répartition des recettes nettes</Text>
            <View style={s.barre}>
              {repartition.map((x) => <View key={x.t} style={{ width: `${(x.net / netTotal) * 100}%`, backgroundColor: TEINTE[x.t] }} />)}
            </View>
            <View style={s.legende}>
              {repartition.map((x) => (
                <View key={x.t} style={s.legendeItem}>
                  <View style={[s.legendeDot, { backgroundColor: TEINTE[x.t] }]} />
                  <Text style={s.legendeText}>{`${LIBELLE_EXPLOITATION[x.t]} · ${x.nb} lot${x.nb > 1 ? 's' : ''} · ${pct((x.net / netTotal) * 100, 0)}`}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {alternatives.length > 0 && (
          <View style={{ marginTop: serre ? 12 : 18 }}>
            <Text style={common.secLabel}>Autres exploitations étudiées</Text>
            <View style={[s.trHead, { marginTop: 8 }]}>
              <Text style={[s.th, { flex: COL.lot }]}>Lot</Text>
              <Text style={[s.th, { flex: COL.dpe + COL.exploitation + COL.hypothese - 1.05 }]}>Autre exploitation possible</Text>
              <Text style={[s.th, { flex: COL.brut + 0.05, textAlign: 'right' }]}>Net</Text>
              <Text style={[s.th, { flex: COL.frais + COL.net + 1, textAlign: 'right' }]}>Effet sur le cash-flow</Text>
            </View>
            {alternatives.map(({ lot, i, alt }) => {
              const netAlt = Math.round(alt!.exploitation.resultatAnnuel / 12)
              const effet = alt!.effetCashflowMensuel
              return (
                <View key={lot.id} style={[s.tr, serre ? s.trSerre : {}]} wrap={false}>
                  <View style={{ flex: COL.lot }}>
                    <Text style={s.lotNom}>{libelleLot(lot, i)}</Text>
                    {!dense && (
                      <Text style={s.lotSub}>{`retenu : ${lot.exploitation ? LIBELLE_EXPLOITATION[lot.exploitation.type].toLowerCase() : '—'}`}</Text>
                    )}
                  </View>
                  <Text style={[s.cell, { flex: COL.dpe + COL.exploitation + COL.hypothese - 1.05 }]}>
                    {`${LIBELLE_EXPLOITATION[lot.comparaison!.type]} · ${hypotheseLot(lot.comparaison)}`}
                  </Text>
                  <Text style={[s.cellVal, { flex: COL.brut + 0.05 }]}>{euros(netAlt)}</Text>
                  <Text style={[s.cellVal, { flex: COL.frais + COL.net + 1, color: effet >= 0 ? colors.posGreen : colors.negRed }]}>
                    {`${signe(effet)} / mois`}
                  </Text>
                </View>
              )
            })}
          </View>
        )}
      </View>

      <View style={common.footer}>
        <Text style={common.footerL}>
          {contexte === 'fiche' ? `${footerLabel} · Préparé par ${chargeNom}` : `${footerLabel} · Rapport préparé par ${chargeNom}`}
        </Text>
        <Text style={common.footerR}>{contexte === 'fiche' ? 'Capsul France' : 'capsul-france.com'}</Text>
      </View>
    </Page>
  )
}
