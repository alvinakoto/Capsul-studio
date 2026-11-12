'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { PlusIcon, SearchIcon, XIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import CarteVille from '@/components/villes/CarteVille'
import { slugVille, type Ville } from '@/lib/data/villes'
import { listerVilles } from '@/lib/supabase/villes'

export default function VillesPage() {
  const [villes, setVilles] = useState<Ville[]>([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState<string | null>(null)
  const [recherche, setRecherche] = useState('')

  useEffect(() => {
    listerVilles()
      .then(setVilles)
      .catch(() => setErreur('Impossible de charger les villes. Rechargez la page.'))
      .finally(() => setChargement(false))
  }, [])

  // Recherche insensible aux accents et à la casse (« epernay » trouve Épernay)
  const filtrees = useMemo(() => {
    const q = slugVille(recherche)
    return q ? villes.filter((v) => slugVille(v.nom).includes(q)) : villes
  }, [villes, recherche])

  const ajouter = (
    <Link href="/villes/nouvelle" className="cs-btn cs-btn-primary h-10 px-4">
      <PlusIcon size={15} strokeWidth={2.4} aria-hidden="true" />
      Ajouter une ville
    </Link>
  )

  return (
    <div className="max-w-[1180px] mx-auto px-4 md:px-10 py-8">
      <div className="flex items-end justify-between gap-5 flex-wrap">
        <div>
          <h1 className="cs-h1">Villes</h1>
          <p className="text-[13.5px] mt-1 max-w-[62ch]" style={{ color: 'var(--cs-mist)' }}>
            {chargement
              ? 'Catalogue partagé par tous les chargés.'
              : `${villes.length} ville${villes.length > 1 ? 's' : ''} au catalogue, partagé par tous les chargés. Chaque fiche alimente la page « La ville » des dossiers.`}
          </p>
        </div>
        {ajouter}
      </div>

      {!chargement && villes.length > 6 && (
        <div className="relative mt-7 max-w-[420px]">
          <SearchIcon size={16} strokeWidth={2} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--cs-mist)' }} aria-hidden="true" />
          <input
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher une ville…"
            aria-label="Rechercher une ville"
            className="cs-input pl-10 pr-10 text-[13.5px] font-medium [&::-webkit-search-cancel-button]:hidden"
            style={{ color: 'var(--cs-ink)', borderRadius: 11 }}
          />
          {recherche && (
            <button
              onClick={() => setRecherche('')}
              aria-label="Effacer la recherche"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-[var(--cs-ivory)]"
              style={{ color: 'var(--cs-mist)' }}
            >
              <XIcon size={14} strokeWidth={2} aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      {chargement && (
        <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[268px] rounded-[14px]" style={{ backgroundColor: 'var(--cs-stone)' }} />
          ))}
        </div>
      )}

      {erreur && (
        <p role="alert" className="mt-7 rounded-xl border px-4 py-3 text-[13px] font-semibold" style={{ backgroundColor: 'var(--cs-neg-wash)', borderColor: '#EBC3BC', color: 'var(--cs-neg)' }}>
          {erreur}
        </p>
      )}

      {!chargement && !erreur && villes.length === 0 && (
        <div className="mt-8 rounded-[14px] border-2 border-dashed py-20 px-6 text-center" style={{ borderColor: 'var(--cs-line)' }}>
          <p className="cs-h3">Aucune ville au catalogue</p>
          <p className="cs-sub mt-1 mb-6">Ajoutez une première ville pour la proposer dans les projets.</p>
          {ajouter}
        </div>
      )}

      {!chargement && villes.length > 0 && filtrees.length === 0 && (
        <div className="py-16 text-center">
          <p className="cs-h3">Aucune ville ne correspond à « {recherche} »</p>
          <p className="cs-sub mt-1 mb-4">Vérifiez l’orthographe, ou ajoutez-la au catalogue.</p>
          <div className="flex justify-center gap-2">
            <button onClick={() => setRecherche('')} className="cs-btn">Effacer la recherche</button>
            {ajouter}
          </div>
        </div>
      )}

      {!chargement && filtrees.length > 0 && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrees.map((v) => <CarteVille key={v.id} ville={v} />)}
        </div>
      )}
    </div>
  )
}
