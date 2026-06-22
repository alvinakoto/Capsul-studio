import React from 'react';
import { Page, View, Text, Link, StyleSheet } from '@react-pdf/renderer';
import { DiagnosticPayload } from '../types';
import { VERDICT_COLORS } from '../styles';
import {
  C, interiorBase, dS,
  PageHeader, PageFooter, SecLabel,
} from './PageChrome';

const LEVIER_BORDER = [C.gold, C.navy, C.green];
const LEVIER_BG    = ['#fef9ec', C.paper, '#f0fdf4'];
const LEVIER_TEXT  = [C.gold, C.navy, C.green];

const INTRO_TEXT: Record<string, string> = {
  positif:
    "Votre projet est déjà bien structuré. Ces optimisations peuvent encore renforcer sa performance et préparer les prochaines étapes de votre stratégie patrimoniale.",
  neutre:
    "Votre projet est à l'équilibre — c'est une bonne base. Ces leviers peuvent le faire basculer en cash-flow positif ou consolider sa rentabilité sur le long terme.",
  negatif_modere:
    "Quelques ajustements ciblés peuvent significativement améliorer la performance de votre projet. Ces recommandations sont classées par impact potentiel.",
  negatif_fort:
    "Votre projet demande un effort d'épargne important. Ces 3 recommandations peuvent réduire cet effort et améliorer structurellement la rentabilité de votre investissement.",
};

const s = StyleSheet.create({
  intro: {
    paddingTop: 10, paddingBottom: 10, paddingLeft: 14, paddingRight: 14,
    borderLeftWidth: 3,
    fontSize: 8.5,
    fontWeight: 300,
    lineHeight: 1.55,
  },

  card: {
    borderRadius: 3,
    borderWidth: 1,
    borderColor: C.rule,
    overflow: 'hidden',
  },
  cardTop: {
    paddingTop: 10, paddingBottom: 10, paddingLeft: 14, paddingRight: 14,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderBottom: `1pt solid ${C.rule}`,
  },
  badge: {
    width: 24, height: 24, borderRadius: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeNum: { fontSize: 11, fontWeight: 700, color: C.white },
  cardTitle: { fontSize: 10, fontWeight: 700, color: C.navy },
  cardBody: {
    paddingTop: 10, paddingBottom: 10, paddingLeft: 14, paddingRight: 14,
    backgroundColor: C.paper,
  },
  cardDesc: { fontSize: 8, color: C.muted, fontWeight: 300, lineHeight: 1.55 },

  cta: {
    backgroundColor: C.navy,
    borderRadius: 3,
    paddingTop: 14, paddingBottom: 14, paddingLeft: 18, paddingRight: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16,
  },
  ctaLeft: { flex: 1 },
  ctaTitle: { fontSize: 11, fontWeight: 700, color: C.white, marginBottom: 4 },
  ctaSub: { fontSize: 8, color: 'rgba(255,255,255,0.60)', fontWeight: 300, lineHeight: 1.5 },
  ctaBtn: {
    backgroundColor: C.gold,
    borderRadius: 3,
    paddingTop: 9, paddingBottom: 9, paddingLeft: 14, paddingRight: 14,
  },
  ctaBtnText: { fontSize: 9, fontWeight: 700, color: C.white, textAlign: 'center' },
  ctaBtnSub: { fontSize: 7, color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginTop: 2 },
});

export function PageLeviers({ p }: { p: DiagnosticPayload }) {
  const vc = VERDICT_COLORS[p.verdictNiveau] ?? VERDICT_COLORS.neutre;
  const introText = INTRO_TEXT[p.verdictNiveau] ?? INTRO_TEXT.neutre;

  const leviers = [
    { titre: p.levier1Titre, desc: p.levier1Description },
    { titre: p.levier2Titre, desc: p.levier2Description },
    { titre: p.levier3Titre, desc: p.levier3Description },
  ];

  return (
    <Page size="A4" style={interiorBase.page}>
      <PageHeader section="Leviers d'optimisation" page={6} />
      <View style={interiorBase.content}>

        <SecLabel>3 leviers personnalisés pour votre projet</SecLabel>

        <View style={[s.intro, { backgroundColor: vc.bg, borderLeftColor: vc.border, color: vc.text }]}>
          <Text>{introText}</Text>
        </View>

        {leviers.map((lev, i) => (
          <View key={i} style={s.card}>
            <View style={[s.cardTop, { backgroundColor: LEVIER_BG[i] }]}>
              <View style={[s.badge, { backgroundColor: LEVIER_BORDER[i] }]}>
                <Text style={s.badgeNum}>{i + 1}</Text>
              </View>
              <Text style={[s.cardTitle, { color: LEVIER_TEXT[i] }]}>{lev.titre}</Text>
            </View>
            <View style={s.cardBody}>
              <Text style={s.cardDesc}>{lev.desc}</Text>
            </View>
          </View>
        ))}

        <View style={s.cta}>
          <View style={s.ctaLeft}>
            <Text style={s.ctaTitle}>Vous souhaitez explorer ces leviers avec un expert ?</Text>
            <Text style={s.ctaSub}>
              Capsul vous accompagne de la recherche du bien jusqu'à la mise en location.
              Un échange de 30 min suffit pour analyser votre situation et définir la
              meilleure stratégie.
            </Text>
          </View>
          <Link src="https://bit.ly/4qluPzF" style={s.ctaBtn}>
            <Text style={s.ctaBtnText}>Reserver un entretien &gt;</Text>
            <Text style={s.ctaBtnSub}>capsul-france.com</Text>
          </Link>
        </View>

      </View>
      <PageFooter p={p} />
    </Page>
  );
}
