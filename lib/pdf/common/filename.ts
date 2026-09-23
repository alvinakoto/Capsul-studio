/**
 * Nom des PDF téléchargés — lisible par le client, pas un slug technique.
 * Ex : « 9, rue Warnier, Reims - T2.pdf »
 */

interface ProjetNommable {
  name?: string | null
  adresse?: string | null
  city?: string | null
  ville?: string | null
  type_bien?: string | null
}

/** Construit le nom de fichier (sans extension) à partir de l'adresse et du type de bien. */
export function nomFichierProjet(project: ProjetNommable, suffixe?: string): string {
  const lieu = [project.adresse, project.city || project.ville]
    .map((v) => v?.trim())
    .filter(Boolean)
    .join(', ')

  const base = lieu || project.name?.trim() || 'Projet Capsul'
  const parts = [base]
  if (project.type_bien?.trim()) parts.push(project.type_bien.trim())
  if (suffixe) parts.push(suffixe)

  // `/` et `\` casseraient le nom de fichier ; les deux-points gênent sur macOS.
  return parts.join(' - ').replace(/[/\\:]/g, ' ').replace(/\s+/g, ' ').trim()
}

/**
 * En-tête Content-Disposition avec repli ASCII + version UTF-8 (RFC 5987),
 * indispensable pour les villes accentuées (Châlons-en-Champagne, Épernay…).
 */
export function contentDisposition(nom: string): string {
  const fichier = `${nom}.pdf`
  const ascii = fichier
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // retire les diacritiques
    .replace(/[^\x20-\x7E]/g, '')      // puis tout ce qui reste hors ASCII imprimable
    .replace(/["\\]/g, '')
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(fichier)}`
}
