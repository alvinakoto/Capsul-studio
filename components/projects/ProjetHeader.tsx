'use client'

import { useRouter } from 'next/navigation'

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  draft:      { label: 'Brouillon',  bg: '#F0EDE7', color: '#6E6E73', dot: '#6E6E73' },
  simulation: { label: 'Simulation', bg: 'rgba(201,148,58,0.12)', color: '#A67828', dot: '#C9943A' },
  validated:  { label: 'Validé',     bg: 'rgba(14,34,64,0.08)', color: '#0E2240', dot: '#0E2240' },
  archived:   { label: 'Archivé',    bg: '#F0EDE7', color: '#9E9E9E', dot: '#9E9E9E' },
}

function euros(n: number) {
  return (n ?? 0).toLocaleString('fr-FR') + ' €'
}

export default function ProjetHeader({ project }: { project: any }) {
  const router = useRouter()
  const status = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.draft

  const prixProjet =
    project.prix_achat +
    (project.travaux || 0) +
    (project.mobilier || 0) +
    Math.round(project.prix_achat * (project.frais_notaire_pct / 100)) +
    (project.honoraires_capsul || 0) +
    (project.plan_3d || 0) +
    (project.autres_frais || 0)

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid #DDD9D0', backgroundColor: '#fff' }}
    >
      {/* Gold top strip */}
      <div className="h-1" style={{ backgroundColor: '#C9943A' }} />

      <div className="p-6">
        {/* Breadcrumb */}
        <button
          onClick={() => router.push('/projets')}
          className="flex items-center gap-1.5 text-[11px] font-medium mb-4 transition-colors"
          style={{ color: '#6E6E73' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#0E2240' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#6E6E73' }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Projets
        </button>

        {/* Title row */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <h1 className="text-xl font-bold" style={{ color: '#0E2240' }}>
                {project.name}
              </h1>
              <span
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold"
                style={{ backgroundColor: status.bg, color: status.color }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: status.dot }} />
                {status.label}
              </span>
            </div>
            <p className="text-sm" style={{ color: '#6E6E73' }}>
              {[project.type_bien, project.surface_m2 ? `${project.surface_m2} m²` : null, project.city]
                .filter(Boolean).join(' · ')}
            </p>
          </div>
          <button
            onClick={() => router.push(`/projets/${project.id}/modifier`)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-medium shrink-0 transition-all"
            style={{ border: '1px solid #DDD9D0', color: '#1C1C1E', backgroundColor: 'transparent' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F7F5F1' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M9 2l2 2-7 7H2V9l7-7z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Modifier
          </button>
        </div>

        {/* Metrics grid */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5"
          style={{ borderTop: '1px solid #EDE9E1' }}
        >
          <Metric label="Prix achat" value={euros(project.prix_achat)} />
          <Metric label="Travaux" value={euros(project.travaux || 0)} />
          <Metric label="Prix projet total" value={euros(prixProjet)} bold gold />
          <Metric label="Apport" value={project.apport !== null ? euros(project.apport) : '—'} />
        </div>
      </div>
    </div>
  )
}

function Metric({
  label, value, bold = false, gold = false,
}: {
  label: string; value: string; bold?: boolean; gold?: boolean
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: '#6E6E73' }}>
        {label}
      </p>
      <p
        className="text-sm tabular-nums"
        style={{
          color: gold ? '#C9943A' : '#0E2240',
          fontWeight: bold ? 700 : 600,
        }}
      >
        {value}
      </p>
    </div>
  )
}
