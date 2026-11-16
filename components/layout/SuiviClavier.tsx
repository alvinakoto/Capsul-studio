'use client'

import { useEffect } from 'react'

// Clavier virtuel du téléphone. Safari (iPhone) et Chrome (Android) ne
// redimensionnent pas la page quand il s'ouvre : une barre fixée en bas passe
// derrière lui. On publie donc sur <html> :
//   - data-clavier quand il est ouvert : la barre d'onglets se masque et
//     --cs-nav-bas tombe à 0 (globals.css) ;
//   - --cs-clavier : sa hauteur, que les barres fixes ajoutent à leur `bottom`.
// Rien ne bouge avec un clavier physique (tablette) : la zone visible ne rétrécit pas.

const SEUIL_CLAVIER_PX = 150

function estChampSaisie(el: Element | null): boolean {
  if (!el) return false
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) return true
  if (el instanceof HTMLInputElement) return !['checkbox', 'radio', 'button', 'submit', 'reset', 'file', 'range', 'color'].includes(el.type)
  return el instanceof HTMLElement && el.isContentEditable
}

export default function SuiviClavier() {
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const racine = document.documentElement
    let largeur = window.innerWidth
    let hauteurRef = vv.height * vv.scale

    let image = 0
    const mettreAJour = () => {
      cancelAnimationFrame(image)
      // Une image plus tard : en passant d'un champ à l'autre, le focus est brièvement sur <body>
      image = requestAnimationFrame(() => {
        const hauteur = vv.height * vv.scale // indépendant du zoom au pincement
        if (window.innerWidth !== largeur) { largeur = window.innerWidth; hauteurRef = hauteur } // rotation
        hauteurRef = Math.max(hauteurRef, hauteur)
        const ouvert = estChampSaisie(document.activeElement) && hauteur < hauteurRef - SEUIL_CLAVIER_PX
        const decalage = ouvert ? Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)) : 0
        racine.toggleAttribute('data-clavier', ouvert)
        racine.style.setProperty('--cs-clavier', `${decalage}px`)
      })
    }

    vv.addEventListener('resize', mettreAJour)
    vv.addEventListener('scroll', mettreAJour)
    document.addEventListener('focusin', mettreAJour)
    document.addEventListener('focusout', mettreAJour)
    return () => {
      cancelAnimationFrame(image)
      vv.removeEventListener('resize', mettreAJour)
      vv.removeEventListener('scroll', mettreAJour)
      document.removeEventListener('focusin', mettreAJour)
      document.removeEventListener('focusout', mettreAJour)
      racine.removeAttribute('data-clavier')
      racine.style.removeProperty('--cs-clavier')
    }
  }, [])

  return null
}
