import React from 'react';
import { Page, View, Text, Link, StyleSheet } from '@react-pdf/renderer';
import { DiagnosticPayload } from '../types';
import { VERDICT_COLORS } from '../styles';
import { interiorBase, PageHeader, PageFooter, SectionHeader } from './PageChrome';

const s = StyleSheet.create({
  intro: { padding: '12 16', borderRadius: 10, fontSize: 11.5, lineHeight: 1.55, color: '#334155', borderLeftWidth: 3 },

  list: { flexDirection: 'column', gap: 12 },
  card: { borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: '14 16', flexDirection: 'row', gap: 14, backgroundColor: '#FFFFFF' },
  badge: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 13, fontFamily: 'Montserrat', fontWeight: 700 },
  cardContent: { flex: 1 },
  tag: { fontSize: 8.5, fontFamily: 'Montserrat', fontWeight: 700, letterSpacing: 0.4, paddingVertical: 2, paddingHorizontal: 7, borderRadius: 4, marginBottom: 6, alignSelf: 'flex-start' },
  cardTitle: { fontSize: 13, fontFamily: 'Montserrat', fontWeight: 700, color: '#0F172A', marginBottom: 5 },
  cardDesc: { fontSize: 10.5, color: '#475569', lineHeight: 1.55 },

  cta: { backgroundColor: '#16314E', borderRadius: 12, padding: '16 20', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  ctaTitle: { fontSize: 13, fontFamily: 'Montserrat', fontWeight: 700, color: '#FFFFFF', marginBottom: 4 },
  ctaSub: { fontSize: 10, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 },
  ctaButton: { backgroundColor: '#e6b64c', color: '#FFFFFF', fontSize: 11, fontFamily: 'Montserrat', fontWeight: 700, padding: '9 16', borderRadius: 8, textAlign: 'center' },
  ctaButtonSub: { fontWeight: 400, fontSize: 8.5 },
});

const LEVIER_COLORS = [
  { border: '#F59E0B', bg: '#FEF3C7', text: '#D97706' },
  { border: '#2563EB', bg: '#DBEAFE', text: '#1D4ED8' },
  { border: '#10B981', bg: '#D1FAE5', text: '#059669' },
];

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
      <PageHeader section="Leviers d'optimisation" p={p} />
      <View style={interiorBase.content}>
        <SectionHeader
          title="3 leviers personnalisés pour votre projet"
          subtitle="Recommandations générées sur la base de vos paramètres de simulation"
        />

        <View style={[s.intro, { backgroundColor: vc.bg, borderLeftColor: vc.border }]}>
          <Text>{introText}</Text>
        </View>

        <View style={s.list}>
          {leviers.map((lev, i) => (
            <View key={i} style={[s.card, { borderLeftWidth: 4, borderLeftColor: LEVIER_COLORS[i].border }]}>
              <View style={[s.badge, { backgroundColor: LEVIER_COLORS[i].bg }]}>
                <Text style={[s.badgeText, { color: LEVIER_COLORS[i].text }]}>{i + 1}</Text>
              </View>
              <View style={s.cardContent}>
                <Text style={[s.tag, { backgroundColor: LEVIER_COLORS[i].bg, color: LEVIER_COLORS[i].text }]}>
                  LEVIER {i + 1}
                </Text>
                <Text style={s.cardTitle}>{lev.titre}</Text>
                <Text style={s.cardDesc}>{lev.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={s.cta}>
          <View style={{ flex: 1 }}>
            <Text style={s.ctaTitle}>Vous souhaitez explorer ces leviers avec un expert ?</Text>
            <Text style={s.ctaSub}>
              Capsul vous accompagne de la recherche du bien, en passant par
              les travaux, jusqu'à la mise en location. Un échange de 30 min
              suffit pour analyser votre situation et définir la meilleure
              stratégie.
            </Text>
          </View>
          <Link src="https://bit.ly/4qluPzF" style={s.ctaButton}>
            <Text>Réserver un échange &gt;{'\n'}</Text>
            <Text style={s.ctaButtonSub}>capsul-france.com</Text>
          </Link>
        </View>
      </View>
      <PageFooter p={p} page={6} />
    </Page>
  );
}
