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

export async function createProject(
  state: WizardState,
  userId: string,
  scenario?: { loyerCible: number; scenarioType: string }
): Promise<string> {
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
      ...(scenario && {
        loyer_cible: scenario.loyerCible,
        scenario_type: scenario.scenarioType,
      }),

      // Infos bien
      adresse: state.adresse || null,
      ville: state.ville || null,
      surface_m2: state.surface_m2 || null,
      type_bien: state.type_bien || null,
      description_bien: state.description_bien || null,

      // DPE (utilise les colonnes natives dpe_actuel et dpe_apres_travaux)
      dpe_actuel: state.dpe_actuel || null,
      dpe_apres_travaux: state.dpe_apres_travaux || null,
      // Maintien de la colonne "dpe" pour compat (= dpe_actuel)
      dpe: state.dpe_actuel || null,

      // Finances
      frais_notaire_pct: state.frais_notaire_pct,
      travaux: state.travaux || 0,
      mobilier: state.mobilier || 0,
      honoraires_capsul: state.honoraires_capsul || null,
      honoraires_override: state.honoraires_override,
      plan_3d: state.plan_3d,
      autres_frais: state.autres_frais,

      // Financement
      is_comptant: state.is_comptant,
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
      cfe: state.cfe,
      autres_charges: state.autres_charges,
    })
    .select('id')
    .single()

  if (error) throw error
  return data.id
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

export async function updateProject(
  projectId: string,
  state: WizardState,
  userId: string
): Promise<void> {
  const supabase = getClient()

  const { error } = await supabase
    .from('projects')
    .update({
      name: genererNomProjet(state),
      city: state.ville || '',

      adresse: state.adresse || null,
      ville: state.ville || null,
      surface_m2: state.surface_m2 || null,
      type_bien: state.type_bien || null,
      description_bien: state.description_bien || null,

      dpe_actuel: state.dpe_actuel || null,
      dpe_apres_travaux: state.dpe_apres_travaux || null,
      dpe: state.dpe_actuel || null,

      frais_notaire_pct: state.frais_notaire_pct,
      travaux: state.travaux || 0,
      mobilier: state.mobilier || 0,
      honoraires_capsul: state.honoraires_capsul || null,
      honoraires_override: state.honoraires_override,
      plan_3d: state.plan_3d,
      autres_frais: state.autres_frais,

      is_comptant: state.is_comptant,
      apport: state.apport === '' ? null : state.apport,
      duree_annees: state.duree_annees,
      taux_interet_pct: state.taux_interet_pct || null,
      taux_assurance_pct: state.taux_assurance_pct,

      taxe_fonciere: state.taxe_fonciere || null,
      charges_copro_annuelles: state.charges_copro_annuelles || null,
      assurance_pno: state.assurance_pno || null,
      frais_comptabilite: state.frais_comptabilite || null,
      electricite_eau: state.electricite_eau,
      internet: state.internet,
      chauffage: state.chauffage,
      cfe: state.cfe,
      autres_charges: state.autres_charges,
    })
    .eq('id', projectId)
    .eq('charge_id', userId)

  if (error) throw error
}

export async function updateProjectScenario(
  projectId: string,
  loyerCible: number,
  scenarioType: 'lmnp_meuble' | 'colocation' | 'courte_duree',
  extras?: { fraisGestionPct?: number; conciergePct?: number }
): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase
    .from('projects')
    .update({
      loyer_cible: loyerCible,
      scenario_type: scenarioType,
      status: 'simulation',
      ...(extras?.fraisGestionPct !== undefined && { frais_gestion_pct: extras.fraisGestionPct }),
      ...(extras?.conciergePct !== undefined && { concierge_pct: extras.conciergePct }),
    })
    .eq('id', projectId)
  if (error) throw error
}

export async function updateProjectStatus(
  projectId: string,
  status: 'draft' | 'simulation' | 'validated' | 'archived'
): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase
    .from('projects')
    .update({ status })
    .eq('id', projectId)
  if (error) throw error
}

export async function duplicateProject(projectId: string, userId: string): Promise<string> {
  const supabase = getClient()
  const project = await getProjectById(projectId, userId)

  const { data, error } = await supabase
    .from('projects')
    .insert({
      charge_id: userId,
      name: `Copie — ${project.name}`,
      status: 'draft',
      city: project.city,

      adresse: project.adresse,
      ville: project.ville,
      surface_m2: project.surface_m2,
      type_bien: project.type_bien,
      description_bien: project.description_bien,
      dpe_actuel: project.dpe_actuel,
      dpe_apres_travaux: project.dpe_apres_travaux,
      dpe: project.dpe_actuel,

      prix_achat: project.prix_achat,
      frais_notaire_pct: project.frais_notaire_pct,
      travaux: project.travaux,
      mobilier: project.mobilier,
      honoraires_capsul: project.honoraires_capsul,
      honoraires_override: project.honoraires_override,
      plan_3d: project.plan_3d,
      autres_frais: project.autres_frais,

      is_comptant: project.is_comptant,
      apport: project.apport,
      duree_annees: project.duree_annees,
      taux_interet_pct: project.taux_interet_pct,
      taux_assurance_pct: project.taux_assurance_pct,

      taxe_fonciere: project.taxe_fonciere,
      charges_copro_annuelles: project.charges_copro_annuelles,
      assurance_pno: project.assurance_pno,
      frais_comptabilite: project.frais_comptabilite,
      electricite_eau: project.electricite_eau,
      internet: project.internet,
      chauffage: project.chauffage,
      cfe: project.cfe,
      autres_charges: project.autres_charges,
      frais_gestion_pct: project.frais_gestion_pct,
      concierge_pct: project.concierge_pct,
    })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

export async function deleteProject(projectId: string): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
  if (error) throw error
}

export async function getProjectById(projectId: string, userId: string) {
  const supabase = getClient()

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('charge_id', userId)
    .single()

  if (error) throw error
  return data
}