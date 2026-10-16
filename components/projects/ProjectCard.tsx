'use client'

import Link from 'next/link'
import { syntheseProjet } from '@/lib/calculs/depuisProjet'
import { euros } from '@/lib/utils/format'
import { statusConfig } from './status'

interface Project {
  id: string
  name: string
  city: string
  adresse?: string | null
  type_bien: string
  surface_m2: number | null
  prix_achat: number
  apport: number | null
  taux_interet_pct: number | null
  status: string
  created_at: string
  cover_url?: string | null
  [champ: string]: any
}

export default function ProjectCard({ project }: { project: Project }) {
  const status = statusConfig(project.status)

  // Même calcul que le simulateur : prix projet total − apport, via le moteur
  const { mensualiteTotale, isComptant } = syntheseProjet(project)
  const mensualite =
    project.apport === null || project.apport === undefined ? { texte: 'Apport à saisir', vide: true } :
    isComptant                                            ? { texte: 'Comptant', vide: false } :
    !project.taux_interet_pct                             ? { texte: 'Taux à saisir', vide: true } :
                                                            { texte: euros(mensualiteTotale), vide: false }

  const date = new Date(project.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric'
  })

  return (
    <Link
      href={`/projets/${project.id}`}
      className="cs-card group flex flex-col overflow-hidden transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:border-[#C8C1B3] hover:shadow-[0_2px_4px_rgba(14,34,64,.05),0_14px_32px_-16px_rgba(14,34,64,.28)]"
    >
      {/* Photo de couverture */}
      <div className="relative aspect-[16/9] overflow-hidden" style={{ backgroundColor: 'var(--cs-stone)' }}>
        {project.cover_url ? (
          <img
            src={project.cover_url}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#B9B2A4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z"/></svg>
          </div>
        )}
        <span
          className="cs-pill absolute top-3 left-3"
          style={{ backgroundColor: status.bg, color: status.color, boxShadow: '0 1px 2px rgba(14,34,64,.12)' }}
        >
          <i style={{ backgroundColor: status.dot }} />
          {status.label}
        </span>
      </div>

      <div className="px-[18px] pt-4 pb-3.5">
        <p className="text-[14.5px] font-bold leading-snug line-clamp-2" style={{ color: 'var(--cs-navy)' }}>
          {project.name}
        </p>
        <p className="text-[12px] mt-0.5 truncate" style={{ color: 'var(--cs-mist)' }}>
          {[project.city, project.type_bien, project.surface_m2 ? `${project.surface_m2} m²` : null]
            .filter(Boolean).join(' · ')}
        </p>
      </div>

      <div className="mx-[18px] grid grid-cols-2 border-t cs-divider tabular-nums">
        <div className="py-3">
          <p className="cs-label">Prix d’achat</p>
          <p className="mt-0.5 text-[15px] font-bold" style={{ color: 'var(--cs-navy)' }}>{euros(project.prix_achat)}</p>
        </div>
        <div className="py-3 pl-3.5 border-l cs-divider">
          <p className="cs-label">Mensualité</p>
          <p
            className={`mt-0.5 ${mensualite.vide ? 'text-[13px] font-semibold' : 'text-[15px] font-bold'}`}
            style={{ color: mensualite.vide ? '#A9A49A' : 'var(--cs-gold-ink)' }}
          >
            {mensualite.texte}
          </p>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between px-[18px] py-[11px] border-t cs-divider text-[12px]" style={{ backgroundColor: '#FBFAF7', color: 'var(--cs-mist)' }}>
        <span>{date}</span>
        <span className="inline-flex items-center gap-1 font-semibold" style={{ color: 'var(--cs-navy)' }}>
          Ouvrir
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </span>
      </div>
    </Link>
  )
}
