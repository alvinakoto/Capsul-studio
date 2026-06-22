import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { DiagnosticPayload } from '../types';
import { fmtPct } from '../format';
import { getMarketData, classifyEcart, classifyTaux } from '../marketData';
import { ECART_COLORS } from '../styles';
import { interiorBase, PageHeader, PageFooter, SectionHeader } from './PageChrome';

const s = StyleSheet.create({
  banner: { borderRadius: 12, padding: '14 18', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#16314E' },
  bannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bannerIcon: { fontSize: 22 },
  bannerName: { fontSize: 18, fontFamily: 'Montserrat', fontWeight: 700, color: '#FFFFFF' },
  bannerSub: { fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  bannerTag: { backgroundColor: '#e6b64c', color: '#FFFFFF', fontSize: 9.5, fontFamily: 'Montserrat', fontWeight: 700, padding: '5 10', borderRadius: 6, textAlign: 'center' },
  bannerTagSub: { fontSize: 8, fontWeight: 400, opacity: 0.85, marginTop: 2 },

  fallback: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: '12 16', fontSize: 11, color: '#64748B', lineHeight: 1.5 },

  table: { width: '100%' },
  tHeadRow: { flexDirection: 'row', backgroundColor: '#F1F5F9' },
  tHeadCell: { flex: 1, padding: '8 12', fontSize: 9, fontFamily: 'Montserrat', fontWeight: 700, color: '#64748B', letterSpacing: 0.4 },
  tRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  tCell: { flex: 1, padding: '10 12', fontSize: 11, color: '#334155' },
  tCellFirst: { fontFamily: 'Montserrat', fontWeight: 700, color: '#0F172A' },
  tVotre: { fontSize: 14, fontFamily: 'Montserrat', fontWeight: 700, color: '#16314E', textAlign: 'center' },
  tMarche: { fontSize: 12, color: '#64748B', textAlign: 'center' },
  badge: { fontSize: 9.5, fontFamily: 'Montserrat', fontWeight: 700, padding: '3 7', borderRadius: 6, textAlign: 'center' },

  contextGrid: { flexDirection: 'row', gap: 10 },
  contextCard: { flex: 1, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 12 },
  contextIcon: { fontSize: 16, marginBottom: 5 },
  contextLabel: { fontSize: 9, fontFamily: 'Montserrat', fontWeight: 700, letterSpacing: 0.4, color: '#94A3B8', marginBottom: 4 },
  contextValue: { fontSize: 12, fontFamily: 'Montserrat', fontWeight: 700, color: '#0F172A', marginBottom: 4 },
  contextDesc: { fontSize: 9.5, color: '#64748B', lineHeight: 1.4 },

  sourceNote: { backgroundColor: '#F8FAFC', borderRadius: 8, padding: '8 12' },
  sourceText: { fontSize: 8.5, color: '#94A3B8', lineHeight: 1.5 },
});

export function PageMarche({ p }: { p: DiagnosticPayload }) {
  const market = getMarketData(p.villeProjet);
  const ecartBrut = classifyEcart(p.rentabiliteBrute, market.marcheRdtBrut);
  const ecartNet = classifyEcart(p.rentabiliteNette, market.marcheRdtNet);
  const taux = classifyTaux(p.tauxInteret);

  return (
    <Page size="A4" style={interiorBase.page}>
      <PageHeader section="Comparatif marché" p={p} />
      <View style={interiorBase.content}>
        <SectionHeader
          title="Votre projet dans son contexte de marché"
          subtitle="Positionnement de votre simulation par rapport aux tendances locales observées par Capsul"
        />

        {market.villeConnue ? (
          <View style={s.banner}>
            <View style={s.bannerLeft}>
              <Text style={s.bannerIcon}>{market.villeEmoji}</Text>
              <View>
                <Text style={s.bannerName}>{market.villeNom}</Text>
                <Text style={s.bannerSub}>{market.villeDesc}</Text>
              </View>
            </View>
            <View style={s.bannerTag}>
              <Text>Marché suivi par Capsul</Text>
              <Text style={s.bannerTagSub}>données 2026</Text>
            </View>
          </View>
        ) : (
          <View style={s.fallback}>
            <Text>
              Ville de projet : {p.villeProjet}. Capsul opère sur 7 marchés :
              Toulouse, Reims, Amiens, Nancy, Troyes, Épernay et
              Châlons-en-Champagne. La comparaison ci-dessous utilise les
              moyennes nationales comme référence. Pour une analyse précise
              sur votre marché cible, contactez-nous directement.
            </Text>
          </View>
        )}

        <View>
          <SectionHeader
            title={`Votre projet vs marché ${market.villeConnue ? market.villeNom : 'national'}`}
          />
          <View style={[s.table, { marginTop: 12 }]}>
            <View style={s.tHeadRow}>
              <Text style={s.tHeadCell}>INDICATEUR</Text>
              <Text style={[s.tHeadCell, { textAlign: 'center' }]}>VOTRE PROJET</Text>
              <Text style={[s.tHeadCell, { textAlign: 'center' }]}>MOYENNE MARCHÉ</Text>
              <Text style={[s.tHeadCell, { textAlign: 'center' }]}>POSITIONNEMENT</Text>
            </View>
            <View style={s.tRow}>
              <Text style={[s.tCell, s.tCellFirst]}>Rentabilité brute</Text>
              <Text style={[s.tCell, s.tVotre]}>{fmtPct(p.rentabiliteBrute)} %</Text>
              <Text style={[s.tCell, s.tMarche]}>{fmtPct(market.marcheRdtBrut)} %</Text>
              <View style={[s.tCell, { alignItems: 'center' }]}>
                <Text style={[s.badge, { backgroundColor: ECART_COLORS[ecartBrut.classe].bg, color: ECART_COLORS[ecartBrut.classe].text }]}>
                  {ecartBrut.label}
                </Text>
              </View>
            </View>
            <View style={s.tRow}>
              <Text style={[s.tCell, s.tCellFirst]}>Rentabilité nette</Text>
              <Text style={[s.tCell, s.tVotre]}>{fmtPct(p.rentabiliteNette)} %</Text>
              <Text style={[s.tCell, s.tMarche]}>{fmtPct(market.marcheRdtNet)} %</Text>
              <View style={[s.tCell, { alignItems: 'center' }]}>
                <Text style={[s.badge, { backgroundColor: ECART_COLORS[ecartNet.classe].bg, color: ECART_COLORS[ecartNet.classe].text }]}>
                  {ecartNet.label}
                </Text>
              </View>
            </View>
            <View style={[s.tRow, { borderBottomWidth: 0 }]}>
              <Text style={[s.tCell, s.tCellFirst]}>Taux de financement</Text>
              <Text style={[s.tCell, s.tVotre]}>{fmtPct(p.tauxInteret)} %</Text>
              <Text style={[s.tCell, s.tMarche]}>~ 3.5 – 4.0 %</Text>
              <View style={[s.tCell, { alignItems: 'center' }]}>
                <Text style={[s.badge, { backgroundColor: ECART_COLORS[taux.classe].bg, color: ECART_COLORS[taux.classe].text }]}>
                  {taux.label}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {market.villeConnue && (
          <View style={s.contextGrid}>
            <View style={s.contextCard}>
              <Text style={s.contextLabel}>PRIX AU M2 OBSERVÉ</Text>
              <Text style={s.contextValue}>{market.villePrixRange}</Text>
              <Text style={s.contextDesc}>Fourchette constatée sur les biens en bon état</Text>
            </View>
            <View style={s.contextCard}>
              <Text style={s.contextLabel}>TENSION LOCATIVE</Text>
              <Text style={s.contextValue}>{market.villeTension}</Text>
              <Text style={s.contextDesc}>{market.villeTensionDesc}</Text>
            </View>
            <View style={s.contextCard}>
              <Text style={s.contextLabel}>STRATÉGIE RECOMMANDÉE</Text>
              <Text style={[s.contextValue, { fontSize: 10.5 }]}>{market.villeStrategie}</Text>
              <Text style={s.contextDesc}>{market.villeStrategieDesc}</Text>
            </View>
          </View>
        )}

        <View style={s.sourceNote}>
          <Text style={s.sourceText}>
            Sources : données issues des observations terrain de Capsul,
            complétées par MeilleursAgents, SeLoger, Orpi et les statistiques
            DVF — mise à jour avril 2026. Ces chiffres sont indicatifs et
            peuvent varier selon le quartier, l'état du bien et la période de
            transaction. Ils ne constituent pas un conseil d'investissement.
          </Text>
        </View>
      </View>
      <PageFooter p={p} page={7} />
    </Page>
  );
}
