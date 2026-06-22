import React from 'react';
import { Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import path from 'path';
import { DiagnosticPayload } from '../types';
import { fmtPct, fmtInt } from '../format';
import { COLORS } from '../styles';

const LOGO_PATH = path.join(process.cwd(), 'public', 'logo-capsul-pdf.jpg');

// ⚠️ INTÉGRATION : remplace 'Helvetica' / 'Helvetica-Bold' par 'Montserrat'
// une fois la police enregistrée (cf. registration déjà faite pour le PDF
// commercial dans le repo — réutilise-la, ne duplique pas le Font.register).

const s = StyleSheet.create({
  page: {
    backgroundColor: COLORS.bleuFonce,
    color: COLORS.blanc,
    padding: 0,
    fontFamily: 'Montserrat',
  },
  logoImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  decoCircle2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    bottom: 100,
    right: 30,
  },
  decoLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: COLORS.accent,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '36 48 0 48',
  },
  logoText: {
    fontSize: 18,
    fontFamily: 'Montserrat', fontWeight: 700,
    color: COLORS.blanc,
  },
  headerRight: { fontSize: 15, color: COLORS.blanc60 },
  hero: {
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '48 48 32 48',
  },
  tag: {
    fontSize: 11,
    fontFamily: 'Montserrat', fontWeight: 700,
    letterSpacing: 0.8,
    color: COLORS.accent,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 14,
    marginBottom: 22,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 40,
    fontFamily: 'Montserrat', fontWeight: 700,
    lineHeight: 1.15,
    marginBottom: 14,
  },
  titleAccent: { color: COLORS.accent },
  subtitle: {
    fontSize: 14,
    color: COLORS.blanc60,
    lineHeight: 1.6,
    marginBottom: 36,
    maxWidth: 380,
  },
  prospectBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: '16 20',
    backgroundColor: COLORS.blanc10,
    borderWidth: 1,
    borderColor: COLORS.blanc15Border,
    borderRadius: 12,
    marginBottom: 20,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontFamily: 'Montserrat', fontWeight: 700, color: COLORS.blanc },
  prospectName: { fontSize: 16, fontFamily: 'Montserrat', fontWeight: 700 },
  prospectMeta: { fontSize: 11, color: COLORS.blanc60, marginTop: 2 },
  metricsRow: { flexDirection: 'row', gap: 10 },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.blanc10,
    borderWidth: 1,
    borderColor: COLORS.blanc15Border,
    borderRadius: 10,
    padding: '14 16',
  },
  metricLabel: {
    fontSize: 9,
    color: COLORS.blanc60,
    fontFamily: 'Montserrat', fontWeight: 700,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  metricValue: { fontSize: 22, fontFamily: 'Montserrat', fontWeight: 700 },
  footer: {
    padding: '18 48',
    borderTopWidth: 1,
    borderTopColor: COLORS.blanc15Border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerDisclaimer: { fontSize: 9, color: COLORS.blanc60, lineHeight: 1.5, maxWidth: 380 },
  footerPage: {
    fontSize: 10,
    color: COLORS.blanc60,
    backgroundColor: COLORS.blanc10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
});

export function PageCouverture({ p }: { p: DiagnosticPayload }) {
  const cfPositif = p.cashFlowMensuel >= 0;
  return (
    <Page size="A4" style={s.page} wrap={false}>
      <View style={s.decoLine} />

      <View style={s.header}>
        <Text style={s.logoText}>Capsul</Text>
        <Image src={LOGO_PATH} style={s.logoImg} />
      </View>

      <View style={s.hero}>
        <Text style={s.tag}>RAPPORT PERSONNALISÉ</Text>
        <Text style={s.title}>
          Analyse de votre{'\n'}
          projet <Text style={s.titleAccent}>locatif</Text>
        </Text>
        <Text style={s.subtitle}>
          Simulation complète, rentabilité et recommandations sur-mesure pour
          votre investissement immobilier.
        </Text>

        <View style={s.prospectBlock}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{(p.prenom || '?').slice(0, 1).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={s.prospectName}>
              {p.prenom}
              {p.villeProjet && p.villeProjet !== 'Non renseignée' ? `  ·  ${p.villeProjet}` : ''}
            </Text>
            <Text style={s.prospectMeta}>Rapport généré le {p.dateRapport}</Text>
          </View>
        </View>

        <View style={s.metricsRow}>
          <View style={s.metricCard}>
            <Text style={s.metricLabel}>RENTABILITÉ BRUTE</Text>
            <Text style={s.metricValue}>{fmtPct(p.rentabiliteBrute)} %</Text>
          </View>
          <View style={s.metricCard}>
            <Text style={s.metricLabel}>RENTABILITÉ NETTE</Text>
            <Text style={s.metricValue}>{fmtPct(p.rentabiliteNette)} %</Text>
          </View>
          <View style={s.metricCard}>
            <Text style={s.metricLabel}>CASH-FLOW MENSUEL</Text>
            <Text style={[s.metricValue, { color: cfPositif ? COLORS.vert : COLORS.rouge }]}>
              {fmtInt(p.cashFlowMensuel)} €
            </Text>
          </View>
        </View>
      </View>

      <View style={s.footer}>
        <Text style={s.footerDisclaimer}>
          Ce rapport est strictement personnel et confidentiel. Il ne constitue
          pas un conseil financier ou juridique.
        </Text>
        <Text style={s.footerPage}>1 / 8</Text>
      </View>
    </Page>
  );
}
