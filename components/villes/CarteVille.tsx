'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRightIcon } from 'lucide-react'
import { completudeVille, type Ville } from '@/lib/data/villes'

/** Vignette d'une ville du catalogue (écran Villes). */
export default function CarteVille({ ville }: { ville: Ville }) {
  const { faites, total } = completudeVille(ville)
  const complete = faites === total
  const aCompleter = total - faites
  const date = new Date(ville.modifieeLe).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <Link
      href={`/villes/${ville.id}`}
      className="cs-card group flex flex-col overflow-hidden transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:border-[#C8C1B3] hover:shadow-[0_2px_4px_rgba(14,34,64,.05),0_14px_32px_-16px_rgba(14,34,64,.28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cs-navy)]"
    >
      <div className="relative aspect-[16/9] overflow-hidden" style={{ backgroundColor: 'var(--cs-navy)' }}>
        {ville.photo ? (
          <Image
            src={ville.photo.url}
            alt=""
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
          />
        ) : (
          // Même parti pris que la fiche PDF sans photo : composition typographique
          <div className="flex h-full flex-col justify-end px-5 pb-4" aria-hidden="true">
            <span className="mb-2.5 block h-[1.5px] w-6" style={{ backgroundColor: 'var(--cs-gold)' }} />
            <span className="text-[22px] font-black uppercase leading-none tracking-[-0.02em] text-white [overflow-wrap:anywhere]">
              {ville.nom}
            </span>
          </div>
        )}
        <span
          className="cs-pill absolute left-3 top-3"
          style={complete
            ? { backgroundColor: 'var(--cs-pos-wash)', color: 'var(--cs-pos)', boxShadow: '0 1px 2px rgba(14,34,64,.12)' }
            : { backgroundColor: 'var(--cs-gold-wash)', color: 'var(--cs-gold-deep)', boxShadow: '0 1px 2px rgba(14,34,64,.12)' }}
        >
          <i />
          {complete ? 'Fiche complète' : `${aCompleter} rubrique${aCompleter > 1 ? 's' : ''} à compléter`}
        </span>
      </div>

      <div className="px-[18px] pt-4 pb-3.5">
        <p className="text-[14.5px] font-bold leading-snug" style={{ color: 'var(--cs-navy)' }}>{ville.nom}</p>
        <p className={`mt-0.5 truncate text-[12px] ${ville.infos.surnom ? '' : 'italic'}`} style={{ color: 'var(--cs-mist)' }}>
          {ville.infos.surnom ?? 'Accroche à compléter'}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t cs-divider px-[18px] py-[11px] text-[12px]" style={{ backgroundColor: '#FBFAF7', color: 'var(--cs-mist)' }}>
        <span className="truncate">
          Modifiée le {date}{ville.modifieePar ? ` par ${ville.modifieePar}` : ''}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 font-semibold" style={{ color: 'var(--cs-navy)' }}>
          Ouvrir
          <ArrowRightIcon size={13} strokeWidth={2.4} className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
        </span>
      </div>
    </Link>
  )
}
