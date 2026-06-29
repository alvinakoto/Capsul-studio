import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import React from 'react'
import { registerFonts } from '@/lib/pdf/common/fonts'
import FicheCommerciale from '@/lib/pdf/FicheCommerciale'
import { calculerScenario } from '@/lib/calculs/index'
import type { FicheData } from '@/lib/pdf/types'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params

    // ─── Supabase server client ──────────────────────────────────────────────
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

    // ─── Fetch projet ────────────────────────────────────────────────────────
    const { data: project, error: pError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (pError || !project) {
      return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 })
    }

    // ─── Fetch chargé ────────────────────────────────────────────────────────
    const { data: charge } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', project.charge_id)
      .single()

    const chargeNom = charge?.full_name ?? 'Capsul'

    // ─── Fetch photos ────────────────────────────────────────────────────────
    const { data: photos } = await supabase
      .from('project_images')
      .select('*')
      .eq('project_id', projectId)
      .order('ordre', { ascending: true })

    const coverPhotoUrl = photos?.find(p => p.type === 'cover')?.public_url ?? null
    const mainPhoto = photos?.find(p => p.type === 'main')
    const secondaryPhotos = photos
      ?.filter(p => p.type === 'secondary')
      .map(p => ({ url: p.public_url, legende: p.legende })) ?? []

    // ─── Calcul du scénario ──────────────────────────────────────────────────
    let scenarioResult = null
    let projectionConservateur: any[] = []
    let projectionRealiste: any[] = []
    let prixProjetTotal = 0
    let capitalEmprunte = 0
    let mensualiteTotale = 0

    const loyer = project.loyer_cible ?? 0
    const hasData = loyer > 0

    if (hasData) {
      try {
        const projetData = {
          prixAchat: project.prix_achat,
          fraisNotairePct: project.frais_notaire_pct,
          travaux: project.travaux ?? 0,
          mobilier: project.mobilier ?? 0,
          honorairesCapsul: project.honoraires_capsul ?? 0,
          honorairesOverride: project.honoraires_override ?? false,
          plan3d: project.plan_3d ?? 0,
          autresFrais: project.autres_frais ?? 0,
        }
        const financementData = {
          apport: project.apport ?? 0,
          dureeAnnees: project.duree_annees ?? 20,
          tauxInteretPct: project.taux_interet_pct ?? 0,
          tauxAssurancePct: project.taux_assurance_pct ?? 0,
          isComptantOverride: project.is_comptant ?? false,
        }
        const chargesData = {
          taxeFonciere: project.taxe_fonciere ?? 0,
          chargesCoproAnnuelles: project.charges_copro_annuelles ?? 0,
          assurancePno: project.assurance_pno ?? 0,
          electriciteEau: project.electricite_eau ?? 0,
          internet: project.internet ?? 0,
          chauffage: project.chauffage ?? 0,
          fraisComptabilite: project.frais_comptabilite ?? 0,
          autresCharges: project.autres_charges ?? 0,
        }

        const scenarioType = (project.scenario_type ?? 'lmnp_meuble') as
          'lmnp_meuble' | 'colocation' | 'courte_duree'

        const scenarioInput =
          scenarioType === 'lmnp_meuble'
            ? { type: 'lmnp_meuble' as const, params: { loyerMensuel: loyer, vacancePct: 5, fraisGestionPct: project.frais_gestion_pct ?? 7, regimeFiscal: 'lmnp_reel' as const, tmiClientPct: 30 } }
            : scenarioType === 'colocation'
            ? { type: 'colocation' as const, params: { nbChambres: 3, loyerParChambre: loyer, vacancePct: 8, fraisGestionPct: project.frais_gestion_pct ?? 7, tmiClientPct: 30, regimeFiscal: 'lmnp_reel' as const } }
            : {
                type: 'courte_duree' as const,
                params: {
                  prixNuitee:        loyer,
                  nuitsConservateur: 16,
                  nuitsOptimiste:    22,
                  conciergeriePct:   project.concierge_pct ?? 20,
                  electriciteEau:    chargesData.electriciteEau,
                  internet:          chargesData.internet,
                  chauffage:         chargesData.chauffage,
                  cfe:               project.cfe ?? 300,
                  tmiClientPct:      30,
                  regimeFiscal:      'lmnp_reel' as const,
                },
              }

        const r = calculerScenario(projetData, financementData, chargesData, scenarioInput as any)

        scenarioResult      = r.scenario
        projectionConservateur = r.projectionConservateur
        projectionRealiste     = r.projectionRealiste
        prixProjetTotal     = r.prixProjetTotal
        capitalEmprunte     = r.capitalEmprunte
        mensualiteTotale    = r.mensualiteTotale

      } catch (calcErr) {
        console.error('Calcul scénario échoué:', calcErr)
        // On continue sans les résultats du scénario
      }
    }

    // Fallback si calcul impossible
    if (prixProjetTotal === 0) {
      const fraisNotaire = Math.round(project.prix_achat * (project.frais_notaire_pct / 100))
      prixProjetTotal = project.prix_achat
        + (project.travaux ?? 0)
        + (project.mobilier ?? 0)
        + fraisNotaire
        + (project.honoraires_capsul ?? 0)
        + (project.plan_3d ?? 0)
        + (project.autres_frais ?? 0)

      const montantFinancable = project.prix_achat + (project.travaux ?? 0)
      capitalEmprunte = (project.is_comptant)
        ? 0
        : Math.max(0, montantFinancable - (project.apport ?? 0))

      if (!project.is_comptant && project.taux_interet_pct && capitalEmprunte > 0) {
        const t = project.taux_interet_pct / 100 / 12
        const n = (project.duree_annees ?? 20) * 12
        mensualiteTotale = Math.round(capitalEmprunte * t / (1 - Math.pow(1 + t, -n)))
        if (project.taux_assurance_pct) {
          mensualiteTotale += Math.round(capitalEmprunte * project.taux_assurance_pct / 100 / 12)
        }
      }
    }

    // ─── Assemblage des données ──────────────────────────────────────────────
    const ficheData: FicheData = {
      project,
      chargeNom,
      coverPhotoUrl,
      mainPhotoUrl: mainPhoto?.public_url ?? null,
      mainPhotoLegende: mainPhoto?.legende ?? null,
      secondaryPhotos,
      scenarioResult,
      prixProjetTotal,
      capitalEmprunte,
      mensualiteTotale,
      projectionConservateur,
      projectionRealiste,
    }

    // ─── Génération du PDF ───────────────────────────────────────────────────
    registerFonts()
    const buffer = await renderToBuffer(
      React.createElement(FicheCommerciale, { data: ficheData }) as any
    )

    const filename = `${project.name.replace(/[^a-zA-Z0-9]/g, '-')}-fiche.pdf`

    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })

  } catch (err: any) {
    console.error('PDF generation error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}