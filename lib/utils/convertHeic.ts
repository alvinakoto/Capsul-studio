export function isHeicFile(file: File): boolean {
  return (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    /\.(heic|heif)$/i.test(file.name)
  )
}

export async function ensureJpeg(file: File): Promise<File> {
  if (!isHeicFile(file)) return file

  const heic2any = (await import('heic2any')).default
  const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 })
  const output = Array.isArray(blob) ? blob[0] : blob
  const baseName = file.name.replace(/\.(heic|heif)$/i, '') || 'photo'
  return new File([output], `${baseName}.jpg`, { type: 'image/jpeg' })
}
