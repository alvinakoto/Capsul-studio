'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { LayoutGridIcon, MapPinIcon, type LucideIcon } from 'lucide-react'

// Navigation principale, partagée par la barre latérale (grand écran) et la
// barre d'onglets du bas (téléphone, tablette) : mêmes entrées, même état actif.

export const NAV: { href: string; label: string; Icone: LucideIcon }[] = [
  { href: '/projets', label: 'Projets', Icone: LayoutGridIcon },
  { href: '/villes', label: 'Villes', Icone: MapPinIcon },
]

export const NOUVEAU_PROJET = '/projets/nouveau'

/** « Projets » n'est pas actif sur la création d'un projet, qui a sa propre entrée. */
export function estActif(pathname: string, href: string): boolean {
  if (pathname === NOUVEAU_PROJET) return href === NOUVEAU_PROJET
  return pathname === href || pathname.startsWith(href + '/')
}

function supabaseNavigateur() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Valeurs brutes de users.role (sans accent en base)
const LIBELLES_ROLE: Record<string, string> = { charge: 'Chargé', admin: 'Admin' }

/** Nom et rôle du chargé connecté, et déconnexion. */
export function useUtilisateur() {
  const router = useRouter()
  const [nom, setNom] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const charger = async () => {
      const supabase = supabaseNavigateur()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('users').select('full_name, role').eq('id', user.id).single()
      setNom(data?.full_name ?? user.email?.split('@')[0] ?? null)
      setRole(data?.role ? (LIBELLES_ROLE[data.role] ?? data.role) : null)
    }
    charger()
  }, [])

  const deconnecter = async () => {
    await supabaseNavigateur().auth.signOut()
    router.push('/login')
  }

  return { nom, role, deconnecter }
}
