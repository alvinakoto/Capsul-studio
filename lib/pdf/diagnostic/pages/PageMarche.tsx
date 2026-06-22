import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { DiagnosticPayload } from '../types';
import { fmtPct } from '../format';
import { getMarketData, classifyEcart, classifyTaux } from '../marketData';
import { ECART_COLORS } from '../styles';
import {
  C, interiorBase, dS,
  PageHeader, PageFooter, SecLabel,
} from './PageChrome';

const s = StyleSheet.create({
  // Banner ville
  banner: {
    backgroundColor: C.navy,
    borderRadius: 3,
    paddingTop: 12, paddingBottom: 12, paddingLeft: 16, paddingRight: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  bannerDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: C.gold,
    marginRight: 10,
  },
  bannerLeft: { flexDirection: 'row', alignItems: 'center' },
  bannerName: { fontSize: 14, fontWeight: 700, color: C.white },
  bannerSub: { fontSize: 8, color: 'rgba(255,255,255,0.60)', fontWeight: 300, marginTop: 2 },
  bannerTag: {
    backgroundColor: C.gold,
    borderRadius: 3,
    paddingTop: 4, paddingBottom: 4, paddingLeft: 10, paddingRight: 10,
  },
  bannerTagText: { fontSize: 7.5, fontWeight: 700, color: C.white },
  bannerTagSub: { fontSize: 6.5, color: 'rgba(255,255,255,0.80)', marginTop: 1 },

  fallback: {
    backgroundColor: C.paper,
    borderLeftWidth: 2,
    borderLeftColor: C.muted,
    paddingTop: 10, paddingBottom: 10, paddingLeft: 14, paddingRight: 14,
    fontSize: 8,
    color: C.muted,
    fontWeight: 300,
    lineHeight: 1.5,
  },

  // Badge positionnement
  badge: {
    fontSize: 7.5, fontWeight: 700,
    paddingTop: 3, paddingBottom: 3, paddingLeft: 7, paddingRight: 7,
    borderRadius: 3,
    textAlign: 'center',
  },

  // Col fixe "Indicateur"
  tdInd: {
    width: 130,
    paddingTop: 7, paddingBottom: 7, paddingLeft: 8,
    fontSize: 8, fontWeight: 600, color: C.navy,
  },
  thInd: {
    width: 130,
    paddingTop: 7, paddingBottom: 7, paddingLeft: 8,
    fontSize: 6, fontWeight: 700, color: C.goldLight, letterSpacing: 0.4,
  },
  tdCenter: { textAlign: 'center', fontSize: 9, fontWeight: 700, color: C.navy },
  tdMuted: { textAlign: 'center', fontSize: 8, color: C.muted, fontWeight: 300 },

  // Contexte marché
  contextGrid: { flexDirection: 'row', gap: 10 },
  contextCard: {
    flex: 1, backgroundColor: C.paper,
    paddingTop: 10, paddingBottom: 10, paddingLeft: 12, paddingRight: 12,
    borderBottom: `0.5pt solid ${C.rule}`,
  },
  contextLabel: { fontSize: 6, color: C.muted, fontWeight: 300, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 4 },
  contextValue: { fontSize: 11, fontWeight: 700, color: C.navy, marginBottom: 3 },
  contextDesc: { fontSize: 7.5, color: C.muted, fontWeight: 300, lineHeight: 1.4 },
});

export function PageMarche({ p }: { p: DiagnosticPayload }) {
  const market = getMarketData(p.villeProjet);
  const ecartBrut = classifyEcart(p.rentabiliteBrute, market.marcheRdtBrut);
  const ecartNet  = classifyEcart(p.rentabiliteNette, market.marcheRdtNet);
  const taux      = classifyTaux(p.tauxInteret);

  return (
    <Page size="A4" style={interiorBase.page}>
      <PageHeader section="Comparatif marché" page={7} />
      <View style={interiorBase.content}>

        <SecLabel>Votre projet dans son contexte de marché</SecLabel>

        {market.villeConnue ? (
          <View style={s.banner}>
            <View style={s.bannerLeft}>
              <View style={s.bannerDot} />
              <View>
                <Text style={s.bannerName}>{market.villeNom}</Text>
                <Text style={s.bannerSub}>{market.villeDesc}</Text>
              </View>
            </View>
            <View style={s.bannerTag}>
              <Text style={s.bannerTagText}>Marché suivi par Capsul</Text>
              <Text style={s.bannerTagSub}>données 2026</Text>
            </View>
          </View>
        ) : (
          <View style={s.fallback}>
            <Text>
              Ville de projet : {p.villeProjet}. Capsul opère sur 7 marchés : Toulouse, Reims,
              Amiens, Nancy, Troyes, Épernay et Châlons-en-Champagne. La comparaison ci-dessous
              utilise les moyennes nationales comme référence. Pour une analyse précise sur votre
              marché cible, contactez-nous directement.
            </Text>
          </View>
        )}

        <SecLabel>{`Votre projet vs marché ${market.villeConnue ? (market.villeNom ?? '') : 'national'}`}</SecLabel>

        <View>
          <View style={dS.tHead}>
            <Text style={s.thInd}>Indicateur</Text>
            <Text style={[dS.tHeadCell, { textAlign: 'center' }]}>Votre projet</Text>
            <Text style={[dS.tHeadCell, { textAlign: 'center' }]}>Moyenne marché</Text>
            <Text style={[dS.tHeadCell, { textAlign: 'center' }]}>Positionnement</Text>
          </View>

          {([
            {
              label: 'Rentabilité brute',
              votre: `${fmtPct(p.rentabiliteBrute)} %`,
              marche: `${fmtPct(market.marcheRdtBrut)} %`,
              ecart: ecartBrut,
            },
            {
              label: 'Rentabilité nette',
              votre: `${fmtPct(p.rentabiliteNette)} %`,
              marche: `${fmtPct(market.marcheRdtNet)} %`,
              ecart: ecartNet,
            },
            {
              label: 'Taux de financement',
              votre: `${fmtPct(p.tauxInteret)} %`,
              marche: '~ 3.5 – 4.0 %',
              ecart: taux,
            },
          ] as const).map((row, i) => (
            <View key={row.label} style={[dS.tRow, i % 2 === 1 ? dS.tRowAlt : {}]}>
              <Text style={s.tdInd}>{row.label}</Text>
              <Text style={[dS.tCell, s.tdCenter]}>{row.votre}</Text>
              <Text style={[dS.tCell, s.tdMuted]}>{row.marche}</Text>
              <View style={[dS.tCell, { alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={[
                  s.badge,
                  {
                    backgroundColor: ECART_COLORS[row.ecart.classe].bg,
                    color: ECART_COLORS[row.ecart.classe].text,
                  },
                ]}>
                  {row.ecart.label}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {market.villeConnue && (
          <>
            <SecLabel>Contexte local</SecLabel>
            <View style={s.contextGrid}>
              <View style={s.contextCard}>
                <Text style={s.contextLabel}>Prix au m2 observé</Text>
                <Text style={s.contextValue}>{market.villePrixRange}</Text>
                <Text style={s.contextDesc}>Fourchette constatée sur les biens en bon état</Text>
              </View>
              <View style={s.contextCard}>
                <Text style={s.contextLabel}>Tension locative</Text>
                <Text style={s.contextValue}>{market.villeTension}</Text>
                <Text style={s.contextDesc}>{market.villeTensionDesc}</Text>
              </View>
              <View style={s.contextCard}>
                <Text style={s.contextLabel}>Stratégie recommandée</Text>
                <Text style={[s.contextValue, { fontSize: 9 }]}>{market.villeStrategie}</Text>
                <Text style={s.contextDesc}>{market.villeStrategieDesc}</Text>
              </View>
            </View>
          </>
        )}

        <View style={dS.noteBox}>
          <Text style={dS.noteText}>
            Sources : données issues des observations terrain de Capsul, complétées par
            MeilleursAgents, SeLoger, Orpi et les statistiques DVF — mise à jour avril 2026.
            Ces chiffres sont indicatifs et peuvent varier selon le quartier, l'état du bien
            et la période de transaction. Ils ne constituent pas un conseil d'investissement.
          </Text>
        </View>

      </View>
      <PageFooter p={p} />
    </Page>
  );
}
