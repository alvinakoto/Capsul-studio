import { createBrowserClient } from '@supabase/ssr'
import { WizardState } from '@/components/wizard/WizardShell'

function getClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

function genererNomProjet(state: WizardState): string {
  if (state.adresse && state.ville) return `${state.adresse}, ${state.ville}`
  if (state.ville) return state.ville
  if (state.adresse) return state.adresse
  return 'Nouveau projet'
}

export async function getProjects(userId: string) {
  const supabase = getClient()

  const { data, error } = await supabase
    .from('projects')
    .select(`
      id, name, city, adresse, type_bien, surface_m2,
      prix_achat, apport, taux_interet_pct, taux_assurance_pct,
      duree_annees, travaux, status, created_at
    `)
    .eq('charge_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createProject(state: WizardState, userId: string): Promise<string> {
  const supabase = getClient()

  const { data, error } = await supabase
    .from('projects')
    .insert({
      // Champs obligatoires
      charge_id: userId,
      name: genererNomProjet(state),
      city: state.ville || '',
      prix_achat: state.prix_achat || 0,
      status: 'draft',

      // Infos bien
      adresse: state.adresse || null,
      ville: state.ville || null,
      surface_m2: state.surface_m2 || null,
      dpe: state.dpe || null,
      type_bien: state.type_bien || null,

      // Finances
      frais_notaire_pct: state.frais_notaire_pct,
      travaux: state.travaux || 0,
      mobilier: state.mobilier || 0,
      honoraires_capsul: state.honoraires_capsul || null,
      honoraires_override: state.honoraires_override,
      plan_3d: state.plan_3d,
      autres_frais: state.autres_frais,

      // Financement
      apport: state.apport === '' ? null : state.apport,
      duree_annees: state.duree_annees,
      taux_interet_pct: state.taux_interet_pct || null,
      taux_assurance_pct: state.taux_assurance_pct,

      // Charges
      taxe_fonciere: state.taxe_fonciere || null,
      charges_copro_annuelles: state.charges_copro_annuelles || null,
      assurance_pno: state.assurance_pno || null,
      frais_comptabilite: state.frais_comptabilite || null,
      electricite_eau: state.electricite_eau,
      internet: state.internet,
      chauffage: state.chauffage,
      autres_charges: state.autres_charges,
    })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}