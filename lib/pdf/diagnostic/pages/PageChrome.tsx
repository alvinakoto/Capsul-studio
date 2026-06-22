import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { DiagnosticPayload } from '../types';

export const interiorBase = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    color: '#1E293B',
    fontFamily: 'Montserrat',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoText: { fontSize: 13, fontFamily: 'Montserrat', fontWeight: 700, color: '#16314E' },
  headerSection: {
    fontSize: 10,
    fontFamily: 'Montserrat', fontWeight: 700,
    letterSpacing: 0.8,
    color: '#94A3B8',
  },
  headerRight: { fontSize: 10, color: '#94A3B8' },
  content: {
    flexGrow: 1,
    paddingHorizontal: 40,
    paddingTop: 24,
    paddingBottom: 16,
    flexDirection: 'column',
    gap: 18,
  },
  footer: {
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: { fontSize: 9, color: '#CBD5E1' },
  footerRight: { fontSize: 10, color: '#94A3B8', fontFamily: 'Montserrat', fontWeight: 700 },
  sectionHeader: { marginBottom: 2 },
  sectionTitle: { fontSize: 17, fontFamily: 'Montserrat', fontWeight: 700, color: '#0F172A' },
  sectionSubtitle: { fontSize: 11, color: '#64748B', marginTop: 3 },
});

export function PageHeader({ section, p }: { section: string; p: DiagnosticPayload }) {
  return (
    <View style={interiorBase.header}>
      <View style={interiorBase.headerLeft}>
        <Text style={interiorBase.logoText}>Capsul</Text>
        <Text style={interiorBase.headerSection}>{section.toUpperCase()}</Text>
      </View>
      <Text style={interiorBase.headerRight}>
        {p.prenom}  ·  {p.dateRapport}
      </Text>
    </View>
  );
}

export function PageFooter({ p, page }: { p: DiagnosticPayload; page: number }) {
  return (
    <View style={interiorBase.footer}>
      <Text style={interiorBase.footerLeft}>
        Capsul — Rapport confidentiel — {p.prenom} — {p.dateRapport}
      </Text>
      <Text style={interiorBase.footerRight}>{page} / 8</Text>
    </View>
  );
}

export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={interiorBase.sectionHeader}>
      <Text style={interiorBase.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={interiorBase.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}
