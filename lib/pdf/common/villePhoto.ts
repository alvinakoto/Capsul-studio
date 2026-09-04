import fs from 'fs'
import path from 'path'

const EXTENSIONS = ['jpg', 'jpeg', 'png']

/**
 * Photo de ville pour la page « La ville » : public/villes/<slug>.(jpg|jpeg|png).
 * Lue via le système de fichiers, comme les polices (lib/pdf/common/fonts.ts).
 * Retourne null si aucune photo n'est déposée — la page bascule alors sur une
 * composition typographique.
 */
export function findVillePhotoPath(slug: string | null | undefined): string | null {
  if (!slug) return null
  const dir = path.join(process.cwd(), 'public', 'villes')
  for (const ext of EXTENSIONS) {
    const candidate = path.join(dir, `${slug}.${ext}`)
    if (fs.existsSync(candidate)) return candidate
  }
  return null
}
