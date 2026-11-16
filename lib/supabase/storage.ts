import { createBrowserClient } from '@supabase/ssr'

export type PhotoType = 'cover' | 'main' | 'secondary' | 'localisation'

export interface ExistingPhoto {
  id: string
  publicUrl: string
  storagePath: string
  type: PhotoType
  legende: string | null
  ordre: number
}

function getClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function uploadPhoto(
  projectId: string,
  file: File,
  index: number,
  type: PhotoType = 'secondary',
  legende: string = ''
): Promise<void> {
  const supabase = getClient()
  const ext = file.name.split('.').pop() ?? 'jpg'
  const storagePath = `${projectId}/${type}-${index + 1}-${Date.now()}.${ext}`

  // 1. Upload du fichier dans le bucket
  const { error: uploadError } = await supabase.storage
    .from('project-images')
    .upload(storagePath, file, { upsert: false })

  if (uploadError) throw uploadError

  // 2. Récupération de l'URL publique
  const { data: { publicUrl } } = supabase.storage
    .from('project-images')
    .getPublicUrl(storagePath)

  // 3. Insertion dans la table project_images
  const { error: dbError } = await supabase
    .from('project_images')
    .insert({
      project_id: projectId,
      storage_path: storagePath,
      public_url: publicUrl,
      ordre: index + 1,
      type,
      legende: legende || null,
    })

  if (dbError) throw dbError
}

export async function getProjectPhotos(projectId: string): Promise<ExistingPhoto[]> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('project_images')
    .select('id, public_url, storage_path, type, legende, ordre')
    .eq('project_id', projectId)
    .order('ordre')
  if (error) throw error
  return (data ?? []).map((r) => ({
    id: r.id,
    publicUrl: r.public_url,
    storagePath: r.storage_path,
    type: r.type as PhotoType,
    legende: r.legende,
    ordre: r.ordre,
  }))
}

export async function deletePhoto(photoId: string, storagePath: string): Promise<void> {
  const supabase = getClient()
  await supabase.storage.from('project-images').remove([storagePath])
  const { error } = await supabase.from('project_images').delete().eq('id', photoId)
  if (error) throw error
}
/**
 * Copie les photos d'un projet vers un autre (duplication) : fichiers recopiés
 * côté stockage sous `<cibleId>/`, puis lignes project_images recréées avec le
 * même type, la même légende et le même ordre. Chaque photo est indépendante :
 * une copie ratée n'empêche pas les autres. Renvoie le nombre de photos non copiées.
 */
export async function copierPhotosProjet(sourceId: string, cibleId: string): Promise<number> {
  const supabase = getClient()
  const photos = await getProjectPhotos(sourceId)
  const resultats = await Promise.allSettled(photos.map(async (photo) => {
    const nomFichier = photo.storagePath.split('/').pop() ?? `${photo.type}-${photo.ordre}.jpg`
    const cheminCible = `${cibleId}/${nomFichier}`
    const { error: copyError } = await supabase.storage
      .from('project-images')
      .copy(photo.storagePath, cheminCible)
    if (copyError) throw copyError

    const { data: { publicUrl } } = supabase.storage
      .from('project-images')
      .getPublicUrl(cheminCible)

    const { error: dbError } = await supabase
      .from('project_images')
      .insert({
        project_id: cibleId,
        storage_path: cheminCible,
        public_url: publicUrl,
        ordre: photo.ordre,
        type: photo.type,
        legende: photo.legende,
      })
    if (dbError) {
      // Pas de fichier sans ligne : il ne serait jamais affiché ni supprimé avec le projet
      await supabase.storage.from('project-images').remove([cheminCible])
      throw dbError
    }
  }))
  const echecs = resultats.filter((r) => r.status === 'rejected')
  echecs.forEach((r) => console.error('Photo non copiée à la duplication :', (r as PromiseRejectedResult).reason))
  return echecs.length
}
