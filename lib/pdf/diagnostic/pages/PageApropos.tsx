import React from 'react';
import { Page, View, Text, Link, StyleSheet } from '@react-pdf/renderer';
import { DiagnosticPayload } from '../types';
import {
  C, interiorBase, dS,
  PageHeader, PageFooter, SecLabel,
} from './PageChrome';

const CITIES = ['Toulouse', 'Reims', 'Amiens', 'Nancy', 'Troyes', 'Epernay', 'Chalons', 'Paris'];

const STEPS = [
  { n: '1', title: 'Échange initial', desc: '30 min gratuits pour définir votre stratégie, votre budget et vos objectifs patrimoniaux.' },
  { n: '2', title: 'Recherche du bien', desc: 'Notre équipe terrain identifie les meilleures opportunités selon vos critères de rendement.' },
  { n: '3', title: 'Rénovation & déco', desc: "On pilote les travaux et l'ameublement de A à Z pour maximiser l'attractivité locative." },
  { n: '4', title: 'Mise en location', desc: 'On sélectionne votre locataire et gérons toutes les démarches administratives.' },
];

const STATS = [
  { value: '2020', label: 'Année de création' },
  { value: '30M+', label: "d'Euros investis" },
  { value: '7 %', label: 'Rendement moyen' },
  { value: '100 %', label: 'Clé en main' },
];

const s = StyleSheet.create({
  introGrid: { flexDirection: 'row', gap: 12 },

  pitch: {
    flex: 3, backgroundColor: C.paper, borderRadius: 3,
    paddingTop: 12, paddingBottom: 12, paddingLeft: 14, paddingRight: 14,
    flexDirection: 'column', gap: 7,
  },
  pitchTag: {
    fontSize: 6, fontWeight: 700, letterSpacing: 1, color: C.navy,
    backgroundColor: C.rule,
    paddingTop: 3, paddingBottom: 3, paddingLeft: 7, paddingRight: 7,
    borderRadius: 2, alignSelf: 'flex-start', textTransform: 'uppercase',
  },
  pitchTitle: { fontSize: 12, fontWeight: 700, color: C.navy, lineHeight: 1.3 },
  pitchBody: { fontSize: 8, color: C.muted, fontWeight: 300, lineHeight: 1.55 },
  marketsLabel: {
    fontSize: 6, color: C.muted, fontWeight: 300,
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5,
  },
  citiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  cityTag: {
    backgroundColor: C.navy, color: C.white,
    borderRadius: 2, paddingTop: 3, paddingBottom: 3, paddingLeft: 8, paddingRight: 8,
    fontSize: 7.5, fontWeight: 700,
  },

  ctaCard: {
    flex: 2, backgroundColor: C.navy, borderRadius: 3,
    paddingTop: 14, paddingBottom: 14, paddingLeft: 14, paddingRight: 14,
    flexDirection: 'column', justifyContent: 'space-between',
  },
  ctaTitle: { fontSize: 12, fontWeight: 700, color: C.white, marginBottom: 6, lineHeight: 1.3 },
  ctaSub: { fontSize: 8, color: 'rgba(255,255,255,0.60)', fontWeight: 300, lineHeight: 1.5, marginBottom: 12 },
  ctaBtn: {
    backgroundColor: C.gold, borderRadius: 3,
    paddingTop: 8, paddingBottom: 8, paddingLeft: 12, paddingRight: 12,
    marginBottom: 5,
  },
  ctaBtnText: { fontSize: 9, fontWeight: 700, color: C.white, textAlign: 'center' },
  ctaLink: { fontSize: 7, color: 'rgba(255,255,255,0.50)', textAlign: 'center' },

  stepsGrid: { flexDirection: 'row', gap: 8 },
  stepItem: {
    flex: 1, backgroundColor: C.paper, borderRadius: 3,
    paddingTop: 10, paddingBottom: 10, paddingLeft: 10, paddingRight: 10,
    borderBottom: `0.5pt solid ${C.rule}`,
  },
  stepNum: {
    width: 20, height: 20, backgroundColor: C.navy, borderRadius: 2,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 7, paddingTop: 4,
  },
  stepNumText: { fontSize: 9, fontWeight: 700, color: C.white, textAlign: 'center' },
  stepTitle: { fontSize: 8.5, fontWeight: 700, color: C.navy, marginBottom: 3 },
  stepDesc: { fontSize: 7, color: C.muted, fontWeight: 300, lineHeight: 1.4 },

  statsBar: { flexDirection: 'row', gap: 0 },
  statItem: {
    flex: 1, textAlign: 'center',
    paddingTop: 9, paddingBottom: 9,
    backgroundColor: C.navy,
    alignItems: 'center',
    borderRight: `0.5pt solid #253e5e`,
  },
  statItemLast: {
    flex: 1, textAlign: 'center',
    paddingTop: 9, paddingBottom: 9,
    backgroundColor: C.navy,
    alignItems: 'center',
  },
  statValue: { fontSize: 16, fontWeight: 700, color: C.gold, marginBottom: 2 },
  statLabel: { fontSize: 6.5, color: 'rgba(255,255,255,0.60)', fontWeight: 300, textAlign: 'center' },

  contact: {
    backgroundColor: C.paper,
    borderRadius: 3,
    paddingTop: 10, paddingBottom: 10, paddingLeft: 14, paddingRight: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  contactTitle: { fontSize: 9, fontWeight: 700, color: C.navy, marginBottom: 6 },
  contactItems: { flexDirection: 'row', gap: 18 },
  contactItem: { flexDirection: 'column', gap: 1 },
  contactLabel: { fontSize: 5.5, color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 },
  contactText: { fontSize: 8, color: C.ink, fontWeight: 300 },
  contactCta: {
    backgroundColor: C.navy, borderRadius: 3,
    paddingTop: 7, paddingBottom: 7, paddingLeft: 12, paddingRight: 12,
  },
  contactCtaText: { fontSize: 8.5, fontWeight: 700, color: C.white, textAlign: 'center' },
});

export function PageApropos({ p }: { p: DiagnosticPayload }) {
  return (
    <Page size="A4" style={interiorBase.page}>
      <PageHeader section="A propos de Capsul" page={8} />
      <View style={[interiorBase.content, { gap: 10, paddingTop: 12, paddingBottom: 38 }]}>

        <SecLabel>{`${p.prenom}, construisons votre patrimoine ensemble`}</SecLabel>

        <View style={s.introGrid}>
          <View style={s.pitch}>
            <Text style={s.pitchTag}>Qui sommes-nous ?</Text>
            <Text style={s.pitchTitle}>L'investissement locatif clé en main, sans les galères.</Text>
            <Text style={s.pitchBody}>
              Capsul accompagne les investisseurs actifs qui veulent se constituer un patrimoine
              immobilier sans y passer leurs week-ends. Depuis 2020, nous prenons en charge
              l'intégralité du projet : recherche du bien, financement, travaux, décoration et
              mise en location.{'\n\n'}Vous validez les étapes clés. On gère tout le reste.
            </Text>
            <View>
              <Text style={s.marketsLabel}>Nos marchés</Text>
              <View style={s.citiesRow}>
                {CITIES.map((c) => (
                  <Text key={c} style={s.cityTag}>{c}</Text>
                ))}
              </View>
            </View>
          </View>

          <View style={s.ctaCard}>
            <View>
              <Text style={s.ctaTitle}>Prêt(e) à passer à l'action ?</Text>
              <Text style={s.ctaSub}>
                Un échange de 30 min suffit pour analyser votre situation, répondre à vos
                questions et définir la stratégie adaptée à votre profil.{'\n\n'}
                Gratuit. Sans engagement. Sans pression.
              </Text>
            </View>
            <View>
              <Link src="https://calendly.com/lucasulmann/15min?utm_source=Site+Web&utm_medium=Simulateur&utm_campaign=Simulateur+web&utm_id=Site+Web" style={s.ctaBtn}>
                <Text style={s.ctaBtnText}>Reserver mon echange gratuit &gt;</Text>
              </Link>
              <Text style={s.ctaLink}>capsul-france.com</Text>
            </View>
          </View>
        </View>

        <SecLabel>Comment ça se passe ?</SecLabel>

        <View style={s.stepsGrid}>
          {STEPS.map((step) => (
            <View key={step.n} style={s.stepItem}>
              <View style={s.stepNum}>
                <Text style={s.stepNumText}>{step.n}</Text>
              </View>
              <Text style={s.stepTitle}>{step.title}</Text>
              <Text style={s.stepDesc}>{step.desc}</Text>
            </View>
          ))}
        </View>

        <View style={s.statsBar}>
          {STATS.map((stat, i) => (
            <View key={stat.label} style={i === STATS.length - 1 ? s.statItemLast : s.statItem}>
              <Text style={s.statValue}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={s.contact}>
          <View>
            <Text style={s.contactTitle}>Restons en contact</Text>
            <View style={s.contactItems}>
              <View style={s.contactItem}>
                <Text style={s.contactLabel}>Web</Text>
                <Text style={s.contactText}>capsul-france.com</Text>
              </View>
              <View style={s.contactItem}>
                <Text style={s.contactLabel}>Email</Text>
                <Text style={s.contactText}>contact.capsulfrance@gmail.com</Text>
              </View>
              <View style={s.contactItem}>
                <Text style={s.contactLabel}>LinkedIn</Text>
                <Text style={s.contactText}>Capsul France</Text>
              </View>
            </View>
          </View>
          <Link src="https://calendly.com/lucasulmann/15min?utm_source=Site+Web&utm_medium=Simulateur&utm_campaign=Simulateur+web&utm_id=Site+Web" style={s.contactCta}>
            <Text style={s.contactCtaText}>Prendre rendez-vous &gt;</Text>
          </Link>
        </View>

      </View>
      <PageFooter p={p} />
    </Page>
  );
}
