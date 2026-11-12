import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { ensureJpeg } from '@/lib/utils/convertHeic'
import {
  erreurVilleForm, lignesRenseignees, slugVille,
  type Ville, type VilleForm, type VilleInfos,
} from '@/lib/data/villes'

// ============================================================
// Catalogue de villes (table `villes`, bucket Storage `villes`)
// ============================================================
// Point unique de lecture/écriture du catalogue et de conversion d'une ligne
// (snake_case) vers le type `Ville` de l'app. RLS : tous les chargés lisent,
// ajoutent et modifient ; seul l'admin supprime, et jamais une ville utilisée
// par un projet (clé étrangère projects.ville_id, ON DELETE RESTRICT).

const BUCKET = 'villes'

export interface LigneVille {
  id: string
  nom: string
  slug: string
  surnom: string | null
  habitants: number | null
  etudiants: number | null
  acces: string | null
  atout: string | null
  prix_m2_min: number | null
  prix_m2_max: number | null
  rendement_moyen_pct: number | string | null
  aire_attraction: number | null
  croissance_demographique_pct: number | string | null
  quartiers: string[] | null
  projets_a_venir: string[] | null
  zone_touristique: boolean
  photo_path: string | null
  carte_path: string | null
  carte_largeur: number | null
  carte_hauteur: number | null
  updated_at: string
  updated_by_nom: string | null
}

function getClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/** URL publique d'un fichier du bucket `villes` (bucket public : pas de requête réseau). */
export function urlImageVille(path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`
}

const nombre = (v: number | string | null): number | undefined =>
  v === null || v === '' ? undefined : Number(v)

/** Ligne `villes` → `Ville`. Les colonnes vides deviennent `undefined` dans `infos` (jamais `null`). */
export function ligneVersVille(l: LigneVille): Ville {
  const infos: VilleInfos = {}
  if (l.surnom) infos.surnom = l.surnom
  if (nombre(l.habitants) !== undefined) infos.habitants = nombre(l.habitants)
  if (nombre(l.etudiants) !== undefined) infos.etudiants = nombre(l.etudiants)
  if (l.acces) infos.acces = l.acces
  if (l.atout) infos.atout = l.atout
  if (nombre(l.prix_m2_min) !== undefined) infos.prixM2Min = nombre(l.prix_m2_min)
  if (nombre(l.prix_m2_max) !== undefined) infos.prixM2Max = nombre(l.prix_m2_max)
  if (nombre(l.rendement_moyen_pct) !== undefined) infos.rendementMoyenPct = nombre(l.rendement_moyen_pct)

  return {
    id: l.id,
    nom: l.nom,
    slug: l.slug,
    infos,
    aireAttraction: nombre(l.aire_attraction) ?? null,
    croissanceDemographiquePct: nombre(l.croissance_demographique_pct) ?? null,
    quartiers: l.quartiers ?? [],
    projetsAVenir: l.projets_a_venir ?? [],
    zoneTouristique: l.zone_touristique,
    photo: l.photo_path ? { path: l.photo_path, url: urlImageVille(l.photo_path) } : null,
    carte: l.carte_path && l.carte_largeur && l.carte_hauteur
      ? { path: l.carte_path, url: urlImageVille(l.carte_path), largeur: l.carte_largeur, hauteur: l.carte_hauteur }
      : null,
    modifieeLe: l.updated_at,
    modifieePar: l.updated_by_nom,
  }
}

/** Formulaire → colonnes modifiables (le slug n'est fixé qu'à la création). */
function formVersColonnes(form: VilleForm) {
  const txt = (v: string) => v.trim() || null
  const num = (v: number | '') => (v === '' ? null : v)
  const { infos } = form
  return {
    nom: form.nom.trim(),
    surnom: txt(infos.surnom),
    habitants: num(infos.habitants),
    etudiants: num(infos.etudiants),
    acces: txt(infos.acces),
    atout: txt(infos.atout),
    prix_m2_min: num(infos.prixM2Min),
    prix_m2_max: num(infos.prixM2Max),
    rendement_moyen_pct: num(infos.rendementMoyenPct),
    aire_attraction: num(form.aireAttraction),
    croissance_demographique_pct: num(form.croissanceDemographiquePct),
    quartiers: lignesRenseignees(form.quartiers),
    projets_a_venir: lignesRenseignees(form.projetsAVenir),
    zone_touristique: form.zoneTouristique,
  }
}

const parNom = (a: Ville, b: Ville) => a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' })

// ─── Lecture ──────────────────────────────────────────────────────────────────

/** Une ville par son id, avec le client fourni (route serveur ou navigateur). */
export async function chargerVille(supabase: SupabaseClient, id: string): Promise<Ville | null> {
  const { data, error } = await supabase.from('villes').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data ? ligneVersVille(data as LigneVille) : null
}

/** Tout le catalogue, trié par nom (ordre alphabétique français : É avec E). */
export async function listerVilles(): Promise<Ville[]> {
  const { data, error } = await getClient().from('villes').select('*')
  if (error) throw error
  return (data as LigneVille[]).map(ligneVersVille).sort(parNom)
}

export async function trouverVille(id: string): Promise<Ville | null> {
  return chargerVille(getClient(), id)
}

// ─── Écriture ─────────────────────────────────────────────────────────────────

function erreurEcriture(error: { code?: string; message: string }): Error {
  if (error.code === '23505') return new Error('Cette ville existe déjà dans le catalogue.')
  return new Error(error.message)
}

export async function creerVille(form: VilleForm): Promise<Ville> {
  const probleme = erreurVilleForm(form)
  if (probleme) throw new Error(probleme)
  const { data, error } = await getClient()
    .from('villes')
    .insert({ ...formVersColonnes(form), slug: slugVille(form.nom) })
    .select('*')
    .single()
  if (error) throw erreurEcriture(error)
  return ligneVersVille(data as LigneVille)
}

export async function modifierVille(id: string, form: VilleForm): Promise<Ville> {
  const probleme = erreurVilleForm(form)
  if (probleme) throw new Error(probleme)
  const { data, error } = await getClient()
    .from('villes')
    .update(formVersColonnes(form))
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw erreurEcriture(error)
  return ligneVersVille(data as LigneVille)
}

/** Projets rattachés à la ville (tous pour un admin, les siens pour un chargé, à cause de la RLS). */
export async function compterProjetsVille(id: string): Promise<number> {
  const { count, error } = await getClient()
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('ville_id', id)
  if (error) throw error
  return count ?? 0
}

/** Admin uniquement (RLS). Refusée si un projet utilise la ville. */
export async function supprimerVille(ville: Ville): Promise<void> {
  const supabase = getClient()
  const { data, error } = await supabase.from('villes').delete().eq('id', ville.id).select('id')
  if (error) {
    if (error.code === '23503') {
      throw new Error('Des projets utilisent cette ville : elle ne peut pas être supprimée.')
    }
    throw new Error(error.message)
  }
  // RLS : pour un chargé, la suppression ne lève pas d'erreur mais ne touche aucune ligne
  if (!data || data.length === 0) throw new Error('Seul un administrateur peut supprimer une ville.')

  const fichiers = [ville.photo?.path, ville.carte?.path].filter((p): p is string => !!p)
  if (fichiers.length > 0) {
    const { error: storageError } = await supabase.storage.from(BUCKET).remove(fichiers)
    if (storageError) console.error('Images de la ville non supprimées du stockage', storageError)
  }
}

// ─── Photo de bandeau et carte des quartiers ──────────────────────────────────

export type TypeImageVille = 'photo' | 'carte'

/** Image prête à l'envoi : convertie et réduite comme les photos de projet, dimensions en pixels. */
export interface ImagePreparee {
  file: File
  largeur: number
  hauteur: number
}

/** Conversion (HEIC, PNG lourd, orientation…) et mesure, une seule fois à la sélection du fichier. */
export async function preparerImageVille(file: File): Promise<ImagePreparee> {
  const prepare = await ensureJpeg(file)
  const bitmap = await createImageBitmap(prepare)
  const image = { file: prepare, largeur: bitmap.width, hauteur: bitmap.height }
  bitmap.close()
  return image
}

/**
 * Envoie une photo ou une carte déjà préparée, l'associe à la ville puis supprime
 * l'ancien fichier. Les dimensions de la carte sont enregistrées pour plafonner
 * sa hauteur dans le PDF sans la rogner.
 */
export async function envoyerImageVille(ville: Ville, type: TypeImageVille, image: ImagePreparee): Promise<Ville> {
  const supabase = getClient()
  const ext = image.file.type === 'image/png' ? 'png' : 'jpg'
  const path = `${ville.slug}/${type}-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, image.file, { contentType: image.file.type, upsert: false })
  if (uploadError) throw new Error(uploadError.message)

  const colonnes = type === 'photo'
    ? { photo_path: path }
    : { carte_path: path, carte_largeur: image.largeur, carte_hauteur: image.hauteur }

  const { data, error } = await supabase.from('villes').update(colonnes).eq('id', ville.id).select('*').single()
  if (error) {
    await supabase.storage.from(BUCKET).remove([path])
    throw new Error(error.message)
  }

  const ancien = type === 'photo' ? ville.photo?.path : ville.carte?.path
  if (ancien) await supabase.storage.from(BUCKET).remove([ancien])
  return ligneVersVille(data as LigneVille)
}

export async function retirerImageVille(ville: Ville, type: TypeImageVille): Promise<Ville> {
  const supabase = getClient()
  const colonnes = type === 'photo'
    ? { photo_path: null }
    : { carte_path: null, carte_largeur: null, carte_hauteur: null }
  const { data, error } = await supabase.from('villes').update(colonnes).eq('id', ville.id).select('*').single()
  if (error) throw new Error(error.message)

  const ancien = type === 'photo' ? ville.photo?.path : ville.carte?.path
  if (ancien) await supabase.storage.from(BUCKET).remove([ancien])
  return ligneVersVille(data as LigneVille)
}
