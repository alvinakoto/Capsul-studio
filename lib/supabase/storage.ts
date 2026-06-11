import { createBrowserClient } from '@supabase/ssr'

function getClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function uploadPhoto(
  projectId: string,
  file: File,
  index: number
): Promise<void> {
  const supabase = getClient()
  const ext = file.name.split('.').pop() ?? 'jpg'
  const storagePath = `${projectId}/${index + 1}-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('project-images')
    .upload(storagePath, file, { upsert: false })

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from('project-images')
    .getPublicUrl(storagePath)

  const { error: dbError } = await supabase
    .from('project_images')
    .insert({
      project_id: projectId,
      storage_path: storagePath,
      public_url: publicUrl,
      ordre: index + 1,
    })

  if (dbError) throw dbError
}