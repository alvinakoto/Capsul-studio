import { createBrowserClient } from '@supabase/ssr'

export type PhotoType = 'cover' | 'main' | 'secondary'

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