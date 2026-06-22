import React from 'react'
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { colors, sizes, common } from '../common/styles'
import { euros, pct, orDash } from '../helpers'
import type { RapportData } from '../types'

const SCENARIO_LABELS: Record<string, string> = {
  lmnp_meuble:  'LMNP Meublé',
  colocation:   'Colocation',
  courte_duree: 'Courte durée',
}

const s = StyleSheet.create({
  page:      { ...common.page, paddingBottom: 40 },
  body:      { paddingHorizontal: sizes.marginAccent, paddingTop: 16, flexDirection: 'row', gap: 20, flex: 1 },
  col:       { flex: 1 },
  divider:   { width: 0.5, backgroundColor: colors.rule },

  titleBar: {
    paddingHorizontal: sizes.marginAccent,
    paddingVertical: 10,
    borderBottom: `0.5pt solid ${colors.rule}`,
    backgroundColor: colors.paper,
  },
  projectName: { fontSize: 13, fontWeight: 700, color: colors.navy, letterSpacing: -0.3 },
  projectSub:  { fontSize: 7, color: colors.muted, marginTop: 2, fontWeight: 300 },

  secLabel: {
    fontSize: 5.5,
    fontWeight: 700,
    letterSpacing: 1.5,
    color: colors.navy,
    textTransform: 'uppercase',
    paddingBottom: 5,
    borderBottom: `1pt solid ${colors.navy}`,
    marginBottom: 6,
    marginTop: 14,
  },
  secLabelFirst: { marginTop: 0 },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
    borderBottom: `0.5pt solid ${colors.rule}`,
  },
  rowBold: { backgroundColor: colors.paper },
  rowLabel:      { fontSize: 7, color: colors.ink, fontWeight: 300, flex: 1 },
  rowLabelBold:  { fontSize: 7, color: colors.ink, fontWeight: 600 },
  rowLabelMuted: { fontSize: 7, color: colors.muted, fontWeight: 300, fontStyle: 'italic' },
  rowValue:      { fontSize: 7, fontWeight: 600, color: colors.ink, textAlign: 'right' },
  rowValueGreen: { fontSize: 7, fontWeight: 700, color: colors.posGreen, textAlign: 'right' },
  rowValueRed:   { fontSize: 7, fontWeight: 700, color: colors.negRed,   textAlign: 'right' },
  rowValueMuted: { fontSize: 7, fontWeight: 300, color: colors.muted,    textAlign: 'right', fontStyle: 'italic' },

  fiscalNote: {
    fontSize: 6,
    color: colors.posGreen,
    fontWeight: 600,
    marginTop: 4,
    fontStyle: 'italic',
  },
})

interface RowProps {
  label: string
  value: string
  bold?: boolean
  muted?: boolean
  color?: 'green' | 'red'
}

function Row({ label, value, bold, muted, color }: RowProps) {
  const valueStyle =
    color === 'green' ? s.rowValueGreen :
    color === 'red'   ? s.rowValueRed   :
    muted             ? s.rowValueMuted  : s.rowValue

  const labelStyle = bold ? s.rowLabelBold : muted ? s.rowLabelMuted : s.rowLabel

  return (
    <View style={[s.row, bold ? s.rowBold : {}]}>
      <Text style={labelStyle}>{label}</Text>
      <Text style={valueStyle}>{value}</Text>
    </View>
  )
}

export default function PageSynthese({ data }: { data: RapportData }) {
  const {
    project, chargeNom, scenarioType, loyer,
    prixProjetTotal, fraisNotaireEuros, honorairesCapsul,
    capitalEmprunte, mensualiteCredit, assuranceMensuelle, mensualiteTotale,
    coutTotalInterets, scenarioResult, detailFiscal,
  } = data

  const scenarioLabel = SCENARIO_LABELS[scenarioType] ?? scenarioType
  const footerLabel = [project.adresse, project.city].filter(Boolean).join(' · ')
  const autresFrais = (project.plan_3d ?? 0) + (project.autres_frais ?? 0)

  return (
    <Page size="A4" style={s.page}>
      <View style={common.accentBar} />

      <View style={common.header}>
        <Text style={common.headerLogo}>CAPSUL</Text>
        <View style={common.headerRight}>
          <Text style={common.eyebrow}>Rapport analytique</Text>
          <Text style={common.pageNum}>01</Text>
        </View>
      </View>

      <View style={s.titleBar}>
        <Text style={s.projectName}>{project.name}</Text>
        <Text style={s.projectSub}>
          {[project.type_bien, project.surface_m2 ? `${project.surface_m2} m²` : null, project.city]
            .filter(Boolean).join(' · ')}
        </Text>
      </View>

      <View style={s.body}>

        {/* Colonne gauche — Prix projet + Financement */}
        <View style={s.col}>
          <Text style={[s.secLabel, s.secLabelFirst]}>Composition du projet</Text>
          <Row label="Prix d'achat" value={euros(project.prix_achat)} />
          <Row label={`Frais de notaire (${project.frais_notaire_pct} %)`} value={euros(fraisNotaireEuros)} />
          {(project.travaux ?? 0) > 0 && <Row label="Travaux" value={euros(project.travaux)} />}
          {(project.mobilier ?? 0) > 0 && <Row label="Mobilier" value={euros(project.mobilier)} />}
          {honorairesCapsul > 0 && <Row label="Honoraires Capsul" value={euros(honorairesCapsul)} />}
          {autresFrais > 0 && <Row label="Autres frais" value={euros(autresFrais)} />}
          <Row label="Prix projet total" value={euros(prixProjetTotal)} bold />

          <Text style={s.secLabel}>Plan de financement</Text>
          <Row label="Apport personnel" value={euros(project.apport ?? 0)} />
          <Row label="Capital emprunté" value={euros(capitalEmprunte)} />
          <Row label="Durée du crédit" value={`${project.duree_annees ?? 20} ans`} />
          <Row label="Taux d'intérêt" value={pct(project.taux_interet_pct ?? 0)} />
          {(project.taux_assurance_pct ?? 0) > 0 &&
            <Row label="Taux assurance" value={pct(project.taux_assurance_pct)} />}
          <Row label="Mensualité crédit" value={euros(mensualiteCredit)} />
          {assuranceMensuelle > 0 && <Row label="Assurance mensuelle" value={euros(assuranceMensuelle)} />}
          <Row label="Mensualité totale" value={euros(mensualiteTotale)} bold />
          <Row label="Coût total des intérêts" value={euros(coutTotalInterets)} muted />
        </View>

        <View style={s.divider} />

        {/* Colonne droite — Scénario + Fiscal */}
        <View style={s.col}>
          <Text style={[s.secLabel, s.secLabelFirst]}>Scénario retenu — {scenarioLabel}</Text>

          {scenarioResult ? (
            <>
              {loyer > 0 && (
                <Row
                  label={scenarioType === 'colocation' ? 'Loyer / chambre' : scenarioType === 'courte_duree' ? 'Prix par nuit' : 'Loyer mensuel brut'}
                  value={euros(loyer)}
                />
              )}
              <Row label="Revenus annuels bruts" value={euros(scenarioResult.revenusAnnuelsBruts)} />
              <Row label="Revenus nets perçus" value={euros(scenarioResult.revenusAnnuelsNets)} />
              <Row label="Charges annuelles" value={euros(scenarioResult.chargesAnnuelles)} />
              <Row label="Mensualité totale" value={euros(mensualiteTotale)} />
              <Row label="Impôt mensuel estimé" value={euros(scenarioResult.impotMensuelEstime)} />
              <Row
                label="Cash-flow après IR"
                value={euros(scenarioResult.cashflowMensuelApresIR) + ' /mois'}
                bold
                color={scenarioResult.cashflowMensuelApresIR >= 0 ? 'green' : 'red'}
              />
              <Row label="Rentabilité brute" value={`${scenarioResult.rentabiliteBrutePct} %`} />
              <Row label="Rentabilité nette" value={`${scenarioResult.rentabiliteNettePct} %`} />
            </>
          ) : (
            <Text style={{ fontSize: 7, color: colors.muted, fontStyle: 'italic' }}>
              Aucun scénario calculé — relancez une simulation depuis la page projet.
            </Text>
          )}

          {detailFiscal && (
            <>
              <Text style={s.secLabel}>Détail fiscal — LMNP réel</Text>
              <Row label="Revenus locatifs nets" value={euros(detailFiscal.revenusNets) + ' /an'} />
              <Row label="Charges déductibles" value={euros(detailFiscal.chargesDeductibles) + ' /an'} />
              <Row label="Intérêts crédit (A1)" value={euros(detailFiscal.interetsAnnee1) + ' /an'} />
              <Row label={`Amort. bien (2% × 85%)`} value={euros(detailFiscal.amortBien) + ' /an'} />
              {detailFiscal.amortMobilier > 0 &&
                <Row label="Amort. mobilier (10%)" value={euros(detailFiscal.amortMobilier) + ' /an'} />}
              {detailFiscal.amortTravaux > 0 &&
                <Row label="Amort. travaux (5%)" value={euros(detailFiscal.amortTravaux) + ' /an'} />}
              <Row label="Total amortissements" value={euros(detailFiscal.amortTotal) + ' /an'} />
              <Row
                label="Résultat fiscal"
                value={euros(detailFiscal.resultatFiscal) + ' /an'}
                bold
                color={detailFiscal.resultatFiscal <= 0 ? 'green' : 'red'}
              />
              {detailFiscal.resultatFiscal <= 0 && (
                <Text style={s.fiscalNote}>Déficit BIC reportable → 0 € d'impôt</Text>
              )}
            </>
          )}
        </View>
      </View>

      <View style={common.footer}>
        <Text style={common.footerL}>{footerLabel} · Rapport préparé par {chargeNom}</Text>
        <Text style={common.footerR}>capsul-france.com</Text>
      </View>
    </Page>
  )
}
