const EXT_TO_MIME: Record<string, string> = {
  jpg:  'image/jpeg',
  jpeg: 'image/jpeg',
  png:  'image/png',
  webp: 'image/webp',
  gif:  'image/gif',
  heic: 'image/heic',
  heif: 'image/heif',
}

function normalizeFile(file: File): File {
  if (file.type) return file
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  const mime = EXT_TO_MIME[ext]
  if (!mime) return file
  return new File([file], file.name, { type: mime })
}

export function isHeicFile(file: File): boolean {
  return (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    /\.(heic|heif)$/i.test(file.name)
  )
}

function canvasToJpeg(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('No 2d context')); return }
      ctx.drawImage(img, 0, 0)
      const baseName = file.name.replace(/\.[^.]+$/i, '') || 'photo'
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' }))
          else reject(new Error('toBlob failed'))
        },
        'image/jpeg',
        0.92
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Browser cannot render image'))
    }
    img.src = url
  })
}

export async function ensureJpeg(file: File): Promise<File> {
  file = normalizeFile(file)

  // PNG uniquement passe directement — react-pdf le gère sans problème
  if (file.type === 'image/png' && !isHeicFile(file)) return file

  // Tout le reste (JPEG, WEBP, HEIC…) passe par canvas pour normaliser :
  // orientation EXIF, progressif → baseline, CMYK → RGB.
  // Les JPEGs "directs" de certains appareils/apps sont progressifs ou CMYK
  // et ne s'affichent pas dans react-pdf sans cette étape.
  try {
    return await canvasToJpeg(file)
  } catch {
    // Fallback heic2any pour les navigateurs sans support HEIC natif (Chrome Windows/Linux)
    if (isHeicFile(file)) {
      const heic2any = (await import('heic2any')).default
      const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 })
      const output = Array.isArray(blob) ? blob[0] : blob
      const baseName = file.name.replace(/\.[^.]+$/i, '') || 'photo'
      return new File([output], `${baseName}.jpg`, { type: 'image/jpeg' })
    }
    throw new Error('Format non supporté')
  }
}
