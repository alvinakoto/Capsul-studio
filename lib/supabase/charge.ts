import type { SupabaseClient } from '@supabase/supabase-js'

export interface ChargeContact {
  nom: string
  email: string | null
  telephone: string | null
}

/**
 * Coordonnées du chargé du dossier (page Conclusion de la fiche).
 * `phone` est une colonne récente de public.users : si elle n'existe pas encore
 * en base, on retombe sur nom + email plutôt que de faire échouer le PDF.
 */
export async function fetchChargeContact(
  supabase: SupabaseClient,
  chargeId: string,
): Promise<ChargeContact> {
  let { data, error } = await supabase
    .from('users')
    .select('full_name, email, phone')
    .eq('id', chargeId)
    .single()

  if (error) {
    ;({ data } = await supabase
      .from('users')
      .select('full_name, email')
      .eq('id', chargeId)
      .single())
  }

  const row = data as { full_name?: string | null; email?: string | null; phone?: string | null } | null
  return {
    nom: row?.full_name ?? 'Capsul',
    email: row?.email ?? null,
    telephone: row?.phone ?? null,
  }
}
