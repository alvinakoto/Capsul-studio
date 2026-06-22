import React from 'react';
import { Page, View, Text, Link, StyleSheet } from '@react-pdf/renderer';
import { DiagnosticPayload } from '../types';
import { interiorBase, PageHeader, PageFooter, SectionHeader } from './PageChrome';

// Note : pas d'emoji/dingbats sur cette page — ils ne s'affichent pas de
// façon fiable avec les polices texte utilisées en génération PDF
// (Helvetica comme Montserrat n'embarquent pas de glyphes emoji couleur).
// La hiérarchie visuelle repose sur la couleur et la typographie à la place.

const s = StyleSheet.create({
  introGrid: { flexDirection: 'row', gap: 16 },
  pitch: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14, flexDirection: 'column', gap: 7 },
  pitchTag: { backgroundColor: '#DBEAFE', color: '#1D4ED8', fontSize: 8.5, fontFamily: 'Montserrat', fontWeight: 700, padding: '3 7', borderRadius: 4, alignSelf: 'flex-start' },
  pitchTitle: { fontSize: 14.5, fontFamily: 'Montserrat', fontWeight: 700, color: '#0F172A', lineHeight: 1.3 },
  pitchBody: { fontSize: 10.5, color: '#475569', lineHeight: 1.55 },
  marketsLabel: { fontSize: 9, color: '#94A3B8', fontFamily: 'Montserrat', fontWeight: 700, letterSpacing: 0.4, marginBottom: 7 },
  citiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cityTag: { backgroundColor: '#EFF6FF', color: '#1D4ED8', borderWidth: 1, borderColor: '#BFDBFE', borderRadius: 14, padding: '3 9', fontSize: 9.5, fontFamily: 'Montserrat', fontWeight: 700 },

  ctaCard: { flex: 1, backgroundColor: '#16314E', borderRadius: 12, padding: 14, flexDirection: 'column', justifyContent: 'space-between' },
  ctaTitle: { fontSize: 14, fontFamily: 'Montserrat', fontWeight: 700, color: '#FFFFFF', marginBottom: 8, lineHeight: 1.3 },
  ctaSub: { fontSize: 10, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, marginBottom: 14 },
  ctaButton: { backgroundColor: '#e6b64c', color: '#FFFFFF', borderRadius: 8, padding: '10 14', fontSize: 11, fontFamily: 'Montserrat', fontWeight: 700, textAlign: 'center', marginBottom: 8 },
  ctaLink: { fontSize: 9, color: 'rgba(255,255,255,0.55)', textAlign: 'center' },

  stepsGrid: { flexDirection: 'row', gap: 10 },
  stepItem: { flex: 1, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 10 },
  stepNumber: { width: 22, height: 22, backgroundColor: '#16314E', color: '#FFFFFF', borderRadius: 11, fontSize: 10.5, fontFamily: 'Montserrat', fontWeight: 700, textAlign: 'center', marginBottom: 8, paddingTop: 4 },
  stepTitle: { fontSize: 10.5, fontFamily: 'Montserrat', fontWeight: 700, color: '#0F172A', marginBottom: 4 },
  stepDesc: { fontSize: 9, color: '#64748B', lineHeight: 1.4 },

  statsBar: { flexDirection: 'row', gap: 10 },
  statItem: { flex: 1, textAlign: 'center', padding: 10, backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  statValue: { fontSize: 17, fontFamily: 'Montserrat', fontWeight: 700, color: '#16314E', marginBottom: 3 },
  statLabel: { fontSize: 8.5, color: '#94A3B8', fontFamily: 'Montserrat', fontWeight: 700, textAlign: 'center' },

  contactFinal: { backgroundColor: '#16314E', borderRadius: 12, padding: '10 18', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  contactLeft: { flex: 1 },
  contactTitle: { fontSize: 13, fontFamily: 'Montserrat', fontWeight: 700, color: '#FFFFFF', marginBottom: 8 },
  contactItems: { flexDirection: 'column', gap: 5 },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  contactItemLabel: { fontSize: 8, color: 'rgba(255,255,255,0.5)', fontFamily: 'Montserrat', fontWeight: 700 },
  contactItemText: { fontSize: 9.5, color: 'rgba(255,255,255,0.85)' },
  contactRight: { alignItems: 'center' },
  contactCta: { backgroundColor: '#e6b64c', color: '#FFFFFF', borderRadius: 8, padding: '8 14', fontSize: 10.5, fontFamily: 'Montserrat', fontWeight: 700, textAlign: 'center', marginBottom: 5 },
  contactUrl: { fontSize: 8.5, color: 'rgba(255,255,255,0.5)', textAlign: 'center' },
});

const CITIES = ['Toulouse', 'Reims', 'Amiens', 'Nancy', 'Troyes', 'Épernay', 'Châlons', 'Paris'];

const STEPS = [
  { title: 'Échange initial', desc: '30 min gratuits pour définir votre stratégie, votre budget et vos objectifs patrimoniaux.' },
  { title: 'Recherche du bien', desc: 'Notre équipe terrain identifie les meilleures opportunités selon vos critères de rendement.' },
  { title: 'Rénovation & déco', desc: "On pilote les travaux et l'ameublement de A à Z pour maximiser l'attractivité locative." },
  { title: 'Mise en location', desc: 'On sélectionne votre locataire et gérons toutes les démarches administratives.' },
];

const STATS = [
  { value: '2020', label: 'Année de création' },
  { value: '30M+', label: "d'Euros investis" },
  { value: '7%', label: 'Rentabilité moyenne' },
  { value: '100%', label: 'Clé en main' },
];

export function PageApropos({ p }: { p: DiagnosticPayload }) {
  return (
    <Page size="A4" style={interiorBase.page}>
      <PageHeader section="À propos de Capsul" p={p} />
      <View style={[interiorBase.content, { gap: 10, paddingTop: 18, paddingBottom: 8 }]}>
        <SectionHeader
          title={`${p.prenom}, et si on construisait votre patrimoine ensemble ?`}
          subtitle="Ce rapport, c'est ce que Capsul fait pour chacun de ses clients — avant même de commencer."
        />

        <View style={s.introGrid}>
          <View style={s.pitch}>
            <Text style={s.pitchTag}>QUI SOMMES-NOUS ?</Text>
            <Text style={s.pitchTitle}>L'investissement locatif clé en main, sans les galères.</Text>
            <Text style={s.pitchBody}>
              Capsul accompagne les investisseurs actifs qui veulent se
              constituer un patrimoine immobilier sans y passer leurs
              week-ends. Depuis 2020, nous prenons en charge l'intégralité du
              projet : recherche du bien, financement, travaux, décoration et
              mise en location.{'\n\n'}
              Vous validez les étapes clés. On gère tout le reste.
            </Text>
            <View>
              <Text style={s.marketsLabel}>NOS MARCHÉS</Text>
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
                Un échange de 30 min suffit pour analyser votre situation,
                répondre à vos questions et définir la stratégie adaptée à
                votre profil.{'\n\n'}
                Gratuit. Sans engagement. Sans pression.
              </Text>
            </View>
            <View>
              <Link src="https://bit.ly/4qluPzF" style={s.ctaButton}>
                <Text>Réserver mon échange gratuit &gt;</Text>
              </Link>
              <Text style={s.ctaLink}>capsul-france.com</Text>
            </View>
          </View>
        </View>

        <View>
          <SectionHeader title="Comment ça se passe ?" />
          <View style={[s.stepsGrid, { marginTop: 10 }]}>
            {STEPS.map((step, i) => (
              <View key={i} style={s.stepItem}>
                <Text style={s.stepNumber}>{i + 1}</Text>
                <Text style={s.stepTitle}>{step.title}</Text>
                <Text style={s.stepDesc}>{step.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.statsBar}>
          {STATS.map((stat) => (
            <View key={stat.label} style={s.statItem}>
              <Text style={s.statValue}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={s.contactFinal}>
          <View style={s.contactLeft}>
            <Text style={s.contactTitle}>Restons en contact</Text>
            <View style={s.contactItems}>
              <View style={s.contactItem}>
                <Text style={s.contactItemLabel}>WEB</Text>
                <Text style={s.contactItemText}>capsul-france.com</Text>
              </View>
              <View style={s.contactItem}>
                <Text style={s.contactItemLabel}>EMAIL</Text>
                <Text style={s.contactItemText}>contact.capsulfrance@gmail.com</Text>
              </View>
              <View style={s.contactItem}>
                <Text style={s.contactItemLabel}>LINKEDIN</Text>
                <Text style={s.contactItemText}>Capsul France</Text>
              </View>
            </View>
          </View>
          <View style={s.contactRight}>
            <Link src="https://bit.ly/4qluPzF" style={s.contactCta}>
              <Text>Prendre RDV &gt;</Text>
            </Link>
            <Text style={s.contactUrl}>capsul-france.com</Text>
          </View>
        </View>
      </View>
      <PageFooter p={p} page={8} />
    </Page>
  );
}
