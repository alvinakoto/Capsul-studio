'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { getProjectById } from '@/lib/supabase/projects'
import WizardShell from '@/components/wizard/WizardShell'
import type { WizardState } from '@/components/wizard/WizardShell'
import { Skeleton } from '@/components/ui/skeleton'

function projectToWizardState(p: any): Partial<WizardState> {
  return {
    adresse:            p.adresse ?? '',
    ville:              p.ville ?? '',
    surface_m2:         p.surface_m2 ?? '',
    dpe_actuel:         p.dpe_actuel ?? '',
    dpe_apres_travaux:  p.dpe_apres_travaux ?? '',
    type_bien:          p.type_bien ?? '',
    description_bien:   p.description_bien ?? '',

    prix_achat:          p.prix_achat ?? '',
    frais_notaire_pct:   p.frais_notaire_pct ?? 8.0,
    travaux:             p.travaux ?? '',
    mobilier:            p.mobilier ?? '',
    honoraires_capsul:   p.honoraires_capsul ?? '',
    honoraires_override: p.honoraires_override ?? false,
    plan_3d:             p.plan_3d ?? 0,
    autres_frais:        p.autres_frais ?? 0,

    apport:              p.apport ?? '',
    duree_annees:        p.duree_annees ?? 20,
    taux_interet_pct:    p.taux_interet_pct ?? '',
    taux_assurance_pct:  p.taux_assurance_pct ?? 0,

    taxe_fonciere:            p.taxe_fonciere ?? '',
    charges_copro_annuelles:  p.charges_copro_annuelles ?? '',
    assurance_pno:            p.assurance_pno ?? '',
    frais_comptabilite:       p.frais_comptabilite ?? 250,
    electricite_eau:          p.electricite_eau ?? 0,
    internet:                 p.internet ?? 0,
    chauffage:                p.chauffage ?? 0,
    cfe:                      p.cfe ?? 300,
    autres_charges:           p.autres_charges ?? 0,
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
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-4">
      <Skeleton className="h-12 rounded-xl" />
      <Skeleton className="h-96 rounded-xl" />
    </div>
  )

  if (!initialData) return null

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Modifier le projet</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Les photos existantes sont conservées. Pour les modifier, contactez l'administrateur.
        </p>
      </div>
      <WizardShell initialData={initialData} editProjectId={id} />
    </div>
  )
}
