'use client'

import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

const STATUS_LABELS: Record<string, { label: string; variant: string }> = {
  draft:      { label: 'Brouillon',  variant: 'secondary' },
  simulation: { label: 'Simulation', variant: 'default' },
  validated:  { label: 'Validé',     variant: 'default' },
  archived:   { label: 'Archivé',    variant: 'outline' },
}

function euros(n: number) {
  return n?.toLocaleString('fr-FR') + ' €'
}

export default function ProjetHeader({ project }: { project: any }) {
  const router = useRouter()
  const status = STATUS_LABELS[project.status] ?? { label: project.status, variant: 'outline' }

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-semibold">{project.name}</h1>
            <Badge variant={status.variant as any}>{status.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {[project.type_bien, project.surface_m2 ? `${project.surface_m2} m²` : null, project.city]
              .filter(Boolean).join(' · ')}
          </p>
        </div>
        <button
          onClick={() => router.push(`/projets/${project.id}/modifier`)}
          className="px-3 py-1.5 text-xs rounded-lg border hover:bg-muted transition shrink-0"
        >
          Modifier
        </button>
      </div>

      {/* Métriques clés */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t">
        <Metric label="Prix achat" value={euros(project.prix_achat)} />
        <Metric label="Travaux" value={euros(project.travaux || 0)} />
        <Metric
          label="Prix projet"
          value={euros(
            project.prix_achat +
            (project.travaux || 0) +
            (project.mobilier || 0) +
            Math.round(project.prix_achat * (project.frais_notaire_pct / 100)) +
            (project.honoraires_capsul || 0) +
            (project.plan_3d || 0) +
            (project.autres_frais || 0)
          )}
          bold
        />
        <Metric
          label="Apport"
          value={project.apport !== null ? euros(project.apport) : '—'}
        />
      </div>
    </div>
  )
}

function Metric({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground mb-0.5 uppercase tracking-wide">{label}</p>
      <p className={`text-sm tabular-nums ${bold ? 'font-bold' : 'font-medium'}`}>{value}</p>
    </div>
  )
}