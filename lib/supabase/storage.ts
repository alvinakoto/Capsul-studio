import { createBrowserClient } from '@supabase/ssr'

export type PhotoType = 'cover' | 'main' | 'secondary'

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