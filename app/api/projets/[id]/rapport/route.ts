import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import React from 'react'
import { registerFonts } from '@/lib/pdf/common/fonts'
import RapportAnalytique from '@/lib/pdf/rapport/RapportAnalytique'
import { calculerScenario } from '@/lib/calculs/index'
import { calculerAmortissement } from '@/lib/calculs/communs'
import type { RapportData, LigneAmortissement } from '@/lib/pdf/types'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cs) => cs.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          ),
        },
      }
    )

    const { data: project, error: pError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (pError || !project) {
      return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 })
    }

    const { data: charge } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', project.charge_id)
      .single()

    const chargeNom = charge?.full_name ?? 'Capsul'

    // ─── Calcul scénario ─────────────────────────────────────────────────────
    const loyer = project.loyer_cible ?? 0
    const scenarioType = (project.scenario_type ?? 'lmnp_meuble') as
      'lmnp_meuble' | 'colocation' | 'courte_duree'

    const projetData = {
      prixAchat:          project.prix_achat,
      fraisNotairePct:    project.frais_notaire_pct,
      travaux:            project.travaux ?? 0,
      mobilier:           project.mobilier ?? 0,
      valeurBienApresTravaux: project.valeur_bien_apres_travaux ?? undefined,
      honorairesCapsul:   project.honoraires_capsul ?? 0,
      honorairesOverride: project.honoraires_override ?? false,
      plan3d:             project.plan_3d ?? 0,
      autresFrais:        project.autres_frais ?? 0,
    }
    const financementData = {
      apport:               project.apport ?? 0,
      dureeAnnees:          project.duree_annees ?? 20,
      tauxInteretPct:       project.taux_interet_pct ?? 0,
      tauxAssurancePct:     project.taux_assurance_pct ?? 0,
      isComptantOverride:   project.is_comptant ?? false,
    }
    const chargesData = {
      taxeFonciere:          project.taxe_fonciere ?? 0,
      chargesCoproAnnuelles: project.charges_copro_annuelles ?? 0,
      assurancePno:          project.assurance_pno ?? 0,
      electriciteEau:        project.electricite_eau ?? 0,
      internet:              project.internet ?? 0,
      chauffage:             project.chauffage ?? 0,
      fraisComptabilite:     project.frais_comptabilite ?? 0,
      autresCharges:         project.autres_charges ?? 0,
      cfe:                   project.cfe ?? 300,
    }

    const vacancePct = project.vacance_pct ?? (scenarioType === 'colocation' ? 8 : 5)

    const scenarioInput =
      scenarioType === 'lmnp_meuble'
        ? { type: 'lmnp_meuble' as const, params: { loyerMensuel: loyer, vacancePct, fraisGestionPct: project.frais_gestion_pct ?? 7 } }
        : scenarioType === 'colocation'
        ? { type: 'colocation' as const, params: { nbChambres: project.nb_chambres ?? 3, loyerParChambre: loyer, vacancePct, fraisGestionPct: project.frais_gestion_pct ?? 7 } }
        : { type: 'courte_duree' as const, params: {
            prixNuitee: loyer, nuitsConservateur: project.nuits_conservateur ?? 16, nuitsOptimiste: project.nuits_optimiste ?? 22,
            conciergeriePct: project.concierge_pct ?? 20, electriciteEau: chargesData.electriciteEau,
            internet: chargesData.internet, chauffage: chargesData.chauffage,
          } }

    let r: any = null
    if (loyer > 0) {
      try { r = calculerScenario(projetData, financementData, chargesData, scenarioInput as any) }
      catch { /* continue without scenario */ }
    }

    const prixProjetTotal    = r?.prixProjetTotal    ?? project.prix_achat
    const fraisNotaireEuros  = r?.fraisNotaireEuros  ?? Math.round(project.prix_achat * (project.frais_notaire_pct / 100))
    const honorairesCapsul   = r?.honorairesCapsul   ?? (project.honoraires_capsul ?? 0)
    const capitalEmprunte    = r?.capitalEmprunte    ?? 0
    const mensualiteCredit   = r?.mensualiteCredit   ?? 0
    const assuranceMensuelle = r?.assuranceMensuelle ?? 0
    const mensualiteTotale   = r?.mensualiteTotale   ?? 0
    const isComptant         = project.is_comptant ?? r?.isComptant ?? (capitalEmprunte === 0 && (project.apport ?? 0) > 0)
    const scenarioResult     = r?.scenario           ?? null
    const projectionConservateur = r?.projectionConservateur ?? []
    const projectionRealiste     = r?.projectionRealiste     ?? []

    // ─── Tableau d'amortissement ─────────────────────────────────────────────
    const tableauBrut = capitalEmprunte > 0 && project.taux_interet_pct
      ? calculerAmortissement(capitalEmprunte, project.taux_interet_pct, project.duree_annees ?? 20)
      : []

    const tableauAmortissement: LigneAmortissement[] = tableauBrut.map(l => ({
      annee:            l.annee,
      capitalRembourse: l.capitalRembourse,
      interets:         l.interets,
      capitalRestant:   l.capitalRestant,
    }))

    const coutTotalInterets = tableauAmortissement.reduce((s, l) => s + l.interets, 0)

    // ─── Assemblage ──────────────────────────────────────────────────────────
    const rapportData: RapportData = {
      project, chargeNom, scenarioType, loyer, isComptant,
      prixProjetTotal, fraisNotaireEuros, honorairesCapsul,
      capitalEmprunte, mensualiteCredit, assuranceMensuelle, mensualiteTotale,
      coutTotalInterets, scenarioResult, tableauAmortissement,
      projectionConservateur, projectionRealiste,
    }

    registerFonts()
    const buffer = await renderToBuffer(
      React.createElement(RapportAnalytique, { data: rapportData }) as any
    )

    const filename = `${project.name.replace(/[^a-zA-Z0-9]/g, '-')}-rapport.pdf`
    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })

  } catch (err: any) {
    console.error('Rapport generation error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
