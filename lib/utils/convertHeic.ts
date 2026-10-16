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

// Taille maximale d'une photo stockée : assez pour une page A4 du PDF et un écran
// Retina, sans les 5 à 8 Mo des originaux d'appareil photo (octobre 2026 : les
// vignettes du dashboard mettaient jusqu'à 20 s à charger).
const MAX_DIMENSION = 2400
const JPEG_QUALITY = 0.85
// En dessous, un PNG (capture de carte, plan…) est gardé tel quel
const PNG_MAX_BYTES = 1024 * 1024

function canvasToJpeg(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const ratio = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.naturalWidth * ratio)
      canvas.height = Math.round(img.naturalHeight * ratio)
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('No 2d context')); return }
      // Fond blanc : les zones transparentes d'un PNG deviendraient noires en JPEG
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const baseName = file.name.replace(/\.[^.]+$/i, '') || 'photo'
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' }))
          else reject(new Error('toBlob failed'))
        },
        'image/jpeg',
        JPEG_QUALITY
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

  // PNG léger : passe directement (react-pdf le gère sans problème). Un PNG lourd
  // (capture plein écran, export) est réduit et converti comme les autres.
  if (file.type === 'image/png' && !isHeicFile(file) && file.size <= PNG_MAX_BYTES) return file

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
      const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.97 })
      const output = Array.isArray(blob) ? blob[0] : blob
      const baseName = file.name.replace(/\.[^.]+$/i, '') || 'photo'
      const jpeg = new File([output], `${baseName}.jpg`, { type: 'image/jpeg' })
      // Le JPEG issu de heic2any est en pleine résolution : on le réduit à son tour
      try { return await canvasToJpeg(jpeg) } catch { return jpeg }
    }
    throw new Error('Format non supporté')
  }
}
