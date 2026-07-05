import React from 'react'
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { colors, sizes, common } from '../common/styles'
import { FicheData } from '../types'
import { euros, pct } from '../helpers'

const SCENARIO_LABELS: Record<string, string> = {
  lmnp_meuble:  'LMNP Meublé — Régime Réel',
  colocation:   'Colocation — Régime Réel',
  courte_duree: 'Courte Durée — Location Saisonnière',
}

const s = StyleSheet.create({
  page: {
    ...common.page,
    paddingBottom: 32,
  },

  // ─── Hero navy ────────────────────────────────────────────────────────────
  hero: {
    backgroundColor: colors.navy,
    paddingLeft: sizes.marginAccent,
    paddingRight: sizes.margin,
    paddingTop: 26,
    paddingBottom: 26,
  },
  heroOver: {
    fontSize: 6,
    fontWeight: 500,
    letterSpacing: 1.8,
    color: '#5a7a9a',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1,
    color: colors.white,
    marginBottom: 22,
    textTransform: 'uppercase',
  },
  heroKpis: {
    flexDirection: 'row',
  },
  heroKpi: {
    flex: 1,
    paddingRight: 20,
    marginRight: 20,
    borderRightWidth: 0.5,
    borderRightColor: '#2a4a6a',
    borderRightStyle: 'solid',
  },
  heroKpiLast: {
    flex: 1,
  },
  heroKpiLabel: {
    fontSize: 6,
    fontWeight: 400,
    letterSpacing: 1.4,
    color: '#5a7a9a',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  heroKpiValue: {
    fontSize: 24,
    fontWeight: 900,
    color: colors.white,
    letterSpacing: -0.8,
    lineHeight: 1,
  },
  heroKpiValueGold: {
    fontSize: 24,
    fontWeight: 900,
    color: colors.gold,
    letterSpacing: -0.8,
    lineHeight: 1,
  },
  heroKpiUnit: {
    fontSize: 9,
    fontWeight: 300,
    color: '#5a7a9a',
  },

  // ─── Corps ────────────────────────────────────────────────────────────────
  body: {
    paddingLeft: sizes.marginAccent,
    paddingRight: sizes.margin,
    paddingTop: 22,
    flex: 1,
    flexDirection: 'row',
    gap: 36,
  },
  col: {
    flex: 1,
  },

  // ─── Tableau ──────────────────────────────────────────────────────────────
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 7,
    paddingBottom: 7,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.rule,
    borderBottomStyle: 'solid',
  },
  tableRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: 1.2,
    borderTopColor: colors.navy,
    borderTopStyle: 'solid',
  },
  tableTd: {
    fontSize: 7.5,
    fontWeight: 300,
    color: '#5a5854',
  },
  tableTdVal: {
    fontSize: 7.5,
    fontWeight: 700,
    color: colors.navy,
  },
  tableTdTotalK: {
    fontSize: 8.5,
    fontWeight: 700,
    color: colors.navy,
  },
  tableTdTotalV: {
    fontSize: 8.5,
    fontWeight: 900,
    color: colors.navy,
  },

  // ─── Cashflow block ───────────────────────────────────────────────────────
  cashBlock: {
    marginTop: 16,
    paddingLeft: 14,
    paddingRight: 14,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: colors.paper,
    borderLeftWidth: 2.5,
    borderLeftColor: colors.gold,
    borderLeftStyle: 'solid',
  },
  cashLabel: {
    fontSize: 5.5,
    fontWeight: 500,
    letterSpacing: 1.5,
    color: colors.muted,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  cashValuePos: {
    fontSize: 20,
    fontWeight: 900,
    color: '#246b3e',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  cashValueNeg: {
    fontSize: 20,
    fontWeight: 900,
    color: colors.negRed,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  cashNote: {
    fontSize: 6.5,
    fontWeight: 300,
    color: colors.muted,
    lineHeight: 1.6,
  },
})

interface Props {
  data: FicheData
}

export default function PageScenario({ data }: Props) {
  const { project, scenarioResult } = data
  const sc = scenarioResult
  const footerLabel = [project.adresse, project.city].filter(Boolean).join(' · ')
  const scenarioLabel = SCENARIO_LABELS[project.scenario_type ?? 'lmnp_meuble'] ?? 'LMNP Meublé — Régime Réel'
  const tmi = data.tmiClientPct

  const loyer = project.loyer_cible ?? 0
  const vacancePct = data.vacancePct
  const scenarioType = project.scenario_type ?? 'lmnp_meuble'
  const loyerLabel =
    scenarioType === 'colocation' ? 'Loyer / chambre' :
    scenarioType === 'courte_duree' ? 'Prix par nuit' :
    'Loyer mensuel brut'
  const revenusNetsMensuel = loyer * (1 - vacancePct / 100)
  const fraisGestionPct = project.frais_gestion_pct ?? 7
  const fraisGestionMois = scenarioType !== 'courte_duree'
    ? Math.round(revenusNetsMensuel * (fraisGestionPct / 100))
    : 0
  const autresChargesMois = Math.round((project.autres_charges ?? 0) / 12)
  const cfeMois = Math.round((project.cfe ?? 300) / 12)
  const fluidesMois = (scenarioType === 'colocation' || scenarioType === 'courte_duree')
    ? Math.round(((project.electricite_eau ?? 0) + (project.internet ?? 0) + (project.chauffage ?? 0)) / 12)
    : 0
  const nuitsConservateur = project.nuits_conservateur ?? 16
  const nuitsOptimiste = project.nuits_optimiste ?? 22
  const revenusMensuelsBrutsCD = Math.round(loyer * nuitsConservateur)
  const conciergeriePct = project.concierge_pct ?? 20
  const conciergerieMois = scenarioType === 'courte_duree'
    ? Math.round(revenusMensuelsBrutsCD * (conciergeriePct / 100))
    : 0
  const cashflowOptimiste = scenarioType === 'courte_duree' && sc ? sc.cashflowOptimiste : null
  const chargesMois = sc ? Math.round(sc.chargesAnnuelles / 12) : null
  const mensualite = Math.round(data.mensualiteTotale)
  const impot = sc ? sc.impotMensuelEstime : null
  const cashflow = sc ? sc.cashflowMensuelApresIR : null
  const rentaBrute = sc ? sc.rentabiliteBrutePct : null
  const rentaNette = sc ? sc.rentabiliteNettePct : null

  const travaux = project.travaux ?? 0
  const mobilier = project.mobilier ?? 0
  const fraisNotaire = Math.round(project.prix_achat * (project.frais_notaire_pct / 100))
  const negociationEnvisagee = !!project.negociation_envisagee && !!project.prix_affiche_origine
  const hasEstimations = !!(
    project.travaux_estime || project.frais_notaire_estime ||
    project.charges_copro_estime || project.taxe_fonciere_estime
  )
  const honoraires = project.honoraires_capsul ?? 0
  const budgetTotal = project.prix_achat + travaux + mobilier + fraisNotaire + honoraires + (project.plan_3d ?? 0) + (project.autres_frais ?? 0)

  return (
    <Page size="A4" style={s.page}>
      <View style={common.accentBar} />

      {/* Header */}
      <View style={common.header}>
        <Text style={common.headerLogo}>CAPSUL</Text>
        <View style={common.headerRight}>
          <Text style={common.eyebrow}>Scénario d'investissement</Text>
          <Text style={common.pageNum}>03</Text>
        </View>
      </View>

      {/* Hero */}
      <View style={s.hero}>
        <Text style={s.heroOver}>Scénario retenu · TMI {tmi} %</Text>
        <Text style={s.heroTitle}>{scenarioLabel}</Text>
        <View style={s.heroKpis}>
          <View style={s.heroKpi}>
            <Text style={s.heroKpiLabel}>Cash-flow après IR</Text>
            <Text style={cashflow !== null && cashflow >= 0 ? s.heroKpiValueGold : s.heroKpiValue}>
              {cashflow !== null ? (cashflow >= 0 ? '+' : '') + euros(Math.round(cashflow), false) : '—'}
              <Text style={s.heroKpiUnit}> €/mois</Text>
            </Text>
          </View>
          <View style={s.heroKpi}>
            <Text style={s.heroKpiLabel}>Rentabilité brute</Text>
            <Text style={s.heroKpiValue}>{rentaBrute !== null ? pct(rentaBrute, 1) : '—'}</Text>
          </View>
          <View style={s.heroKpi}>
            <Text style={s.heroKpiLabel}>Rentabilité nette</Text>
            <Text style={s.heroKpiValue}>{rentaNette !== null ? pct(rentaNette, 1) : '—'}</Text>
          </View>
          <View style={s.heroKpiLast}>
            <Text style={s.heroKpiLabel}>Impôt mensuel</Text>
            <Text style={s.heroKpiValue}>
              {impot !== null ? euros(Math.round(impot), false) : '—'}
              <Text style={s.heroKpiUnit}> €</Text>
            </Text>
          </View>
        </View>
      </View>

      {/* Corps */}
      <View style={s.body}>

        {/* Flux mensuels */}
        <View style={s.col}>
          <Text style={common.secLabel}>Flux mensuels</Text>
          <View style={{ marginTop: 12 }}>
            {([
              [loyerLabel, euros(loyer)],
              scenarioType === 'courte_duree'
                ? [`Revenus mensuels bruts (${nuitsConservateur} nuits/mois)`, euros(revenusMensuelsBrutsCD)]
                : null,
              scenarioType !== 'courte_duree'
                ? [`Vacance locative (${vacancePct} %)`, `− ${euros(Math.round(loyer * vacancePct / 100))}`]
                : null,
              scenarioType === 'courte_duree'
                ? [`Conciergerie (${conciergeriePct} %)`, `− ${euros(conciergerieMois)}`]
                : null,
              fraisGestionMois > 0
                ? [`Frais de gestion locative (${fraisGestionPct} %)`, `− ${euros(fraisGestionMois)}`]
                : null,
              [`Charges de copropriété${project.charges_copro_estime ? '*' : ''}`, `− ${euros(Math.round((project.charges_copro_annuelles ?? 0) / 12))}`],
              [`Taxe foncière${project.taxe_fonciere_estime ? '*' : ''}`, `− ${euros(Math.round((project.taxe_fonciere ?? 0) / 12))}`],
              ['Assurance PNO', `− ${euros(Math.round((project.assurance_pno ?? 0) / 12))}`],
              ['Frais de comptabilité', `− ${euros(Math.round((project.frais_comptabilite ?? 0) / 12))}`],
              ['CFE (exonérée 1ère année)', `− ${euros(cfeMois)}`],
              fluidesMois > 0
                ? ['Charges locatives (élec/eau/internet/chauffage)', `− ${euros(fluidesMois)}`]
                : null,
              autresChargesMois > 0
                ? ['Autres charges', `− ${euros(autresChargesMois)}`]
                : null,
              ['Mensualité crédit', `− ${euros(mensualite)}`],
              ['Impôt estimé', `− ${impot !== null ? euros(Math.round(impot)) : euros(0)}`],
            ].filter(Boolean) as [string, string][]).map(([k, v], i) => (
              <View key={i} style={s.tableRow}>
                <Text style={s.tableTd}>{k}</Text>
                <Text style={s.tableTdVal}>{v}</Text>
              </View>
            ))}
            <View style={s.tableRowTotal}>
              <Text style={s.tableTdTotalK}>Cash-flow net après IR</Text>
              <Text style={s.tableTdTotalV}>
                {cashflow !== null ? (cashflow >= 0 ? '+ ' : '− ') + euros(Math.abs(Math.round(cashflow))) : '—'}
              </Text>
            </View>
          </View>

          <View style={s.cashBlock}>
            <Text style={s.cashLabel}>Bilan mensuel net</Text>
            {cashflow !== null ? (
              <>
                <Text style={cashflow >= 0 ? s.cashValuePos : s.cashValueNeg}>
                  {cashflow >= 0 ? 'Autofinancé' : `Effort de ${euros(Math.abs(Math.round(cashflow)))}/mois`}
                </Text>
                <Text style={s.cashNote}>
                  {cashflow >= 0
                    ? 'Le bien génère un excédent de trésorerie grâce à l\'optimisation fiscale LMNP réel.'
                    : 'L\'effort mensuel reste limité et compensé par la constitution patrimoniale.'}
                </Text>
                {cashflowOptimiste !== null && (
                  <Text style={[s.cashNote, { marginTop: 4 }]}>
                    {`Scénario optimiste (${nuitsOptimiste} nuits/mois) : cash-flow de ${cashflowOptimiste >= 0 ? '+' : '− '}${euros(Math.abs(Math.round(cashflowOptimiste)))}/mois`}
                  </Text>
                )}
              </>
            ) : (
              <Text style={s.cashNote}>Renseignez un scénario pour calculer le cash-flow.</Text>
            )}
          </View>
        </View>

        {/* Structure & financement */}
        <View style={s.col}>
          <Text style={common.secLabel}>Structure du projet</Text>
          <View style={{ marginTop: 12 }}>
            {negociationEnvisagee && (
              <View style={s.tableRow}>
                <Text style={s.tableTd}>Prix affiché (FAI)</Text>
                <Text style={[s.tableTdVal, { color: colors.muted, textDecoration: 'line-through' }]}>
                  {euros(project.prix_affiche_origine)}
                </Text>
              </View>
            )}
            <View style={s.tableRow}>
              <Text style={s.tableTd}>
                {negociationEnvisagee ? 'Prix négocié envisagé' : "Prix d'achat FAI"}
              </Text>
              <Text style={s.tableTdVal}>{euros(project.prix_achat)}</Text>
            </View>
            {[
              [`Travaux de rénovation${project.travaux_estime ? '*' : ''}`, euros(travaux)],
              ['Mobilier & équipement', euros(mobilier)],
              [`Frais de notaire (${project.frais_notaire_pct} %)${project.frais_notaire_estime ? '*' : ''}`, euros(fraisNotaire)],
              ['Honoraires Capsul', euros(Math.round(honoraires))],
            ].map(([k, v], i) => (
              <View key={i} style={s.tableRow}>
                <Text style={s.tableTd}>{k}</Text>
                <Text style={s.tableTdVal}>{v}</Text>
              </View>
            ))}
            <View style={s.tableRowTotal}>
              <Text style={s.tableTdTotalK}>Investissement total</Text>
              <Text style={s.tableTdTotalV}>{euros(Math.round(budgetTotal))}</Text>
            </View>
            {negociationEnvisagee && (
              <Text style={{ fontSize: 6, color: colors.gold, fontWeight: 600, marginTop: 4 }}>
                Négociation envisagée
              </Text>
            )}
            {hasEstimations && (
              <Text style={{ fontSize: 6, color: colors.muted, fontStyle: 'italic', marginTop: 4 }}>
                * Estimation
              </Text>
            )}
          </View>

          <View style={{ height: 16 }} />

          <Text style={common.secLabel}>Plan de financement</Text>
          <View style={{ marginTop: 12 }}>
            {[
              ['Apport personnel', euros(project.apport ?? 0)],
              ['Capital emprunté', euros(Math.round(data.capitalEmprunte))],
              ["Taux d'intérêt", `${(project.taux_interet_pct ?? 0).toString().replace('.', ',')} %`],
              ['Durée', `${project.duree_annees ?? 20} ans`],
            ].map(([k, v], i) => (
              <View key={i} style={s.tableRow}>
                <Text style={s.tableTd}>{k}</Text>
                <Text style={s.tableTdVal}>{v}</Text>
              </View>
            ))}
            <View style={s.tableRowTotal}>
              <Text style={s.tableTdTotalK}>Mensualité totale</Text>
              <Text style={s.tableTdTotalV}>{euros(mensualite)}</Text>
            </View>
          </View>
        </View>

      </View>

      {/* Footer */}
      <View style={common.footer}>
        <Text style={common.footerL}>{footerLabel} · Préparé par {data.chargeNom}</Text>
        <Text style={common.footerR}>Capsul France</Text>
      </View>
    </Page>
  )
}