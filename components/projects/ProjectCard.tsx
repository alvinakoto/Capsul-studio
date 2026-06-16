'use client'

import { useRouter } from 'next/navigation'

type Project = {
  id: string
  name: string
  city: string
  adresse: string | null
  type_bien: string | null
  surface_m2: number | null
  prix_achat: number
  apport: number | null
  taux_interet_pct: number | null
  taux_assurance_pct: number | null
  duree_annees: number | null
  travaux: number | null
  status: string
  created_at: string
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  draft:      { label: 'Brouillon',  bg: '#F0EDE7', color: '#6E6E73', dot: '#6E6E73' },
  simulation: { label: 'Simulation', bg: 'rgba(201,148,58,0.12)', color: '#A67828', dot: '#C9943A' },
  validated:  { label: 'Validé',     bg: 'rgba(14,34,64,0.08)', color: '#0E2240', dot: '#0E2240' },
  archived:   { label: 'Archivé',    bg: '#F0EDE7', color: '#9E9E9E', dot: '#9E9E9E' },
}

function calculerMensualite(capital: number, tauxPct: number, duree: number): number {
  const t = tauxPct / 100 / 12
  const n = duree * 12
  if (t === 0) return Math.round(capital / n)
  return Math.round(capital * t / (1 - Math.pow(1 + t, -n)))
}

function euros(n: number) {
  return n.toLocaleString('fr-FR') + ' €'
}

export default function ProjectCard({ project }: { project: Project }) {
  const router = useRouter()
  const status = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.draft

  const montantFinancable = project.prix_achat + (project.travaux || 0)
  const capital = project.apport !== null
    ? Math.max(0, montantFinancable - project.apport)
    : null

  const mensualite =
    capital !== null && project.taux_interet_pct && project.duree_annees
      ? calculerMensualite(capital, project.taux_interet_pct, project.duree_annees)
        + (project.taux_assurance_pct
          ? Math.round(capital * project.taux_assurance_pct / 100 / 12)
          : 0)
      : null

  const date = new Date(project.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric'
  })

  return (
    <div
      onClick={() => router.push(`/projets/${project.id}`)}
      className="rounded-xl cursor-pointer group flex flex-col"
      style={{
        backgroundColor: '#fff',
        border: '1px solid #DDD9D0',
        transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(14,34,64,0.10)'
        e.currentTarget.style.borderColor = '#0E2240'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.borderColor = '#DDD9D0'
      }}
    >
      {/* Gold accent bar for simulation */}
      {project.status === 'simulation' && (
        <div className="h-0.5 rounded-t-xl" style={{ backgroundColor: '#C9943A' }} />
      )}

      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0 flex-1">
            <p className="font-bold text-[15px] truncate" style={{ color: '#0E2240' }}>
              {project.name}
            </p>
            <p className="text-xs mt-0.5 truncate" style={{ color: '#6E6E73' }}>
              {[project.city, project.type_bien, project.surface_m2 ? `${project.surface_m2} m²` : null]
                .filter(Boolean).join(' · ')}
            </p>
          </div>

          {/* Status badge */}
          <span
            className="shrink-0 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold"
            style={{ backgroundColor: status.bg, color: status.color }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: status.dot }}
            />
            {status.label}
          </span>
        </div>

        {/* Financial metrics */}
        <div
          className="grid gap-3 py-3 my-1 rounded-lg px-3"
          style={{ backgroundColor: '#F7F5F1', gridTemplateColumns: mensualite ? '1fr 1fr' : '1fr' }}
        >
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-0.5" style={{ color: '#6E6E73' }}>
              Prix achat
            </p>
            <p className="font-bold text-sm tabular-nums" style={{ color: '#0E2240' }}>
              {euros(project.prix_achat)}
            </p>
          </div>
          {mensualite && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-0.5" style={{ color: '#6E6E73' }}>
                Mensualité
              </p>
              <p className="font-bold text-sm tabular-nums" style={{ color: '#C9943A' }}>
                {euros(mensualite)}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3">
          <p className="text-[11px]" style={{ color: '#9E9E9E' }}>{date}</p>
          <span
            className="text-[11px] font-medium flex items-center gap-1 transition-all"
            style={{ color: '#6E6E73' }}
          >
            Voir
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="group-hover:translate-x-0.5 transition-transform">
              <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
      </div>
    </div>
  )
}
