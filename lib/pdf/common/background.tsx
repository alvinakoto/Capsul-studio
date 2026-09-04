import React from 'react'
import { Image, StyleSheet } from '@react-pdf/renderer'
import path from 'path'

// Fond papier navy texturé (asset fourni par la direction, "Fond capsul.pdf").
// Deux recadrages pré-rendus (voir scripts d'export) pour éviter d'embarquer
// le PDF source (2,5 Mo) dans chaque document généré :
//   - cover : pleine page A4, avec le logo fusée en bas à droite
//   - bande : recadrage du haut de page, sans le logo — pour les bandeaux
//             navy de hauteur variable (hero Scénario/Travaux/Ville)
const FOND_COVER_PATH = path.join(process.cwd(), 'public', 'fond-navy-cover.jpg')
const FOND_BANDE_PATH = path.join(process.cwd(), 'public', 'fond-navy-bande.jpg')

const s = StyleSheet.create({
  bg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    objectFit: 'cover',
  },
})

interface Props {
  variant?: 'cover' | 'bande'
}

/**
 * À poser en tout premier enfant d'un conteneur `position: 'relative'`
 * (Page ou View) — le reste du contenu se rend par-dessus, dans l'ordre du JSX.
 * Réservé aux grands aplats navy (couvertures, bandeaux hero) : pas les
 * petits accents (en-têtes de tableau, badges, barres fines), où le grain
 * de la texture ne se verrait pas et alourdirait le PDF pour rien.
 */
export function PdfBackground({ variant = 'cover' }: Props) {
  return <Image src={variant === 'cover' ? FOND_COVER_PATH : FOND_BANDE_PATH} style={s.bg} />
}
