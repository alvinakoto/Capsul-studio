'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { getProjectById, nomProjetAuto } from '@/lib/supabase/projects'
import WizardShell from '@/components/wizard/WizardShell'
import type { WizardState } from '@/components/wizard/WizardShell'
import { findVille, villeInfosToForm } from '@/lib/data/villes'

function projectToWizardState(p: any): Partial<WizardState> {
  return {
    // Nom laissé vide s'il n'a jamais été personnalisé, pour qu'il continue
    // de suivre l'adresse du bien tant que le chargé ne le renomme pas.
    nom_projet:         p.name && p.name !== nomProjetAuto(p.adresse, p.ville) ? p.name : '',
    adresse:            p.adresse ?? '',
    ville:              p.ville ?? '',
    // Projets antérieurs à la page « La ville » : on repart du dataset Capsul
    ville_infos:        villeInfosToForm(p.ville_infos ?? findVille(p.ville)?.infos),
    surface_m2:         p.surface_m2 ?? '',
    dpe_actuel:         p.dpe_actuel ?? '',
    dpe_apres_travaux:  p.dpe_apres_travaux ?? '',
    type_bien:          p.type_bien ?? '',
    description_bien:   p.description_bien ?? '',

    prix_achat:          p.prix_achat ?? '',
    frais_notaire_pct:   p.frais_notaire_pct ?? 8.0,
    travaux:             p.travaux ?? '',
    travaux_postes:      p.travaux_postes ?? [],
    commentaire_travaux: p.commentaire_travaux ?? '',
    mobilier:            p.mobilier ?? '',
    honoraires_capsul:   p.honoraires_capsul ?? '',
    honoraires_override: p.honoraires_override ?? false,
    autres_frais:        p.autres_frais ?? 0,
    travaux_estime:      p.travaux_estime ?? false,
    frais_notaire_estime: p.frais_notaire_estime ?? false,
    negociation_envisagee: p.negociation_envisagee ?? false,
    prix_affiche_origine: p.prix_affiche_origine ?? '',
    frais_agence:        p.frais_agence ?? '',

    is_comptant:         p.is_comptant ?? false,
    apport:              p.apport ?? '',
    duree_annees:        p.duree_annees ?? 20,
    taux_interet_pct:    p.taux_interet_pct ?? '',
    taux_assurance_pct:  p.taux_assurance_pct ?? 0,
    taux_interet_estime: p.taux_interet_estime ?? false,
    taux_assurance_estime: p.taux_assurance_estime ?? false,

    taxe_fonciere:            p.taxe_fonciere ?? '',
    charges_copro_annuelles:  p.charges_copro_annuelles ?? '',
    assurance_pno:            p.assurance_pno ?? '',
    frais_comptabilite:       p.frais_comptabilite ?? 250,
    electricite_eau:          p.electricite_eau ?? 0,
    internet:                 p.internet ?? 0,
    chauffage:                p.chauffage ?? 0,
    cfe:                      p.cfe ?? 300,
    autres_charges:           p.autres_charges ?? 0,
    charges_copro_estime:     p.charges_copro_estime ?? false,
    taxe_fonciere_estime:     p.taxe_fonciere_estime ?? false,
    assurance_pno_estime:     p.assurance_pno_estime ?? false,
    frais_comptabilite_estime: p.frais_comptabilite_estime ?? false,
    cfe_estime:               p.cfe_estime ?? false,
    autres_charges_estime:    p.autres_charges_estime ?? false,
  }
}

export default function ModifierProjetPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [initialData, setInitialData] = useState<Partial<WizardState> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }

        const project = await getProjectById(id, user.id)
        setInitialData(projectToWizardState(project))
      } catch {
        router.push('/projets')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) return (
    <div className="max-w-[1180px] mx-auto px-4 md:px-10 py-8 space-y-4">
      {[48, 320].map((h) => (
        <div key={h} className="rounded-xl animate-pulse" style={{ height: h, backgroundColor: '#EDE9E1' }} />
      ))}
    </div>
  )

  if (!initialData) return null

  return (
    <div className="max-w-[1180px] mx-auto px-4 md:px-10 py-8">
      <div className="mb-8">
        <button onClick={() => router.push(`/projets/${id}`)} className="cs-crumb mb-4">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
          Retour au projet
        </button>
        <p className="cs-eyebrow">Édition</p>
        <h1 className="cs-h1 mt-1.5">Modifier le projet</h1>
        <p className="text-[13.5px] mt-1" style={{ color: 'var(--cs-mist)' }}>
          Les photos existantes sont conservées.
        </p>
      </div>
      <WizardShell initialData={initialData} editProjectId={id} />
    </div>
  )
}
