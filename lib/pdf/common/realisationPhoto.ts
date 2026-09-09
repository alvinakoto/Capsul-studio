import fs from 'fs'
import path from 'path'

/**
 * Photo de réalisation pour la page « Conclusion » : public/realisations/<slug>.jpg.
 * Même logique que villePhoto.ts — lue via le système de fichiers, null si absente
 * (la card bascule alors sur un fond de substitution plutôt que de planter le rendu).
 */
export function findRealisationPhotoPath(slug: string): string | null {
  const candidate = path.join(process.cwd(), 'public', 'realisations', `${slug}.jpg`)
  return fs.existsSync(candidate) ? candidate : null
}
