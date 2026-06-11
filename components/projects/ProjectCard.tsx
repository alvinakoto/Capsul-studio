'use client'

import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

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

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  draft:       { label: 'Brouillon',  variant: 'secondary' },
  simulation:  { label: 'Simulation', variant: 'default' },
  validated:   { label: 'Validé',     variant: 'default' },
  archived:    { label: 'Archivé',    variant: 'outline' },
}

function calculerMensualite(capital: number, tauxPct: number, duree: number): number {
  const t = tauxPct / 100 / 12
  const n = duree * 12
  if (t === 0) return Math.round(capital / n)
  return Math.round(capital * t / (1 - Math.pow(1 + t, -n)))
}

function euros(n: number) {
  return n.toLocaleString('fr-FR') + ' €'
}

export default function ProjectCard({ project }: { project: Project }) {
  const router = useRouter()
  const status = STATUS_LABELS[project.status] ?? { label: project.status, variant: 'outline' }

  // Capital = prixAchat + travaux - apport
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
      className="rounded-xl border bg-card p-5 hover:shadow-md hover:border-foreground/20
                 transition-all cursor-pointer group"
    >
      {/* En-tête */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <p className="font-semibold truncate">{project.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{project.city}</p>
        </div>
        <Badge variant={status.variant as any} className="shrink-0 text-xs">
          {status.label}
        </Badge>
      </div>

      {/* Caractéristiques */}
      <div className="flex gap-3 text-xs text-muted-foreground mb-4">
        {project.type_bien && <span>{project.type_bien}</span>}
        {project.surface_m2 && <span>{project.surface_m2} m²</span>}
      </div>

      {/* Chiffres clés */}
      <div className="grid grid-cols-2 gap-3 py-3 border-t border-b mb-3">
        <div>
          <p className="text-[11px] text-muted-foreground mb-0.5">Prix achat</p>
          <p className="font-semibold text-sm tabular-nums">{euros(project.prix_achat)}</p>
        </div>
        {mensualite && (
          <div>
            <p className="text-[11px] text-muted-foreground mb-0.5">Mensualité</p>
            <p className="font-semibold text-sm tabular-nums">{euros(mensualite)}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground">{date}</p>
        <span className="text-xs text-muted-foreground group-hover:text-foreground transition">
          Voir →
        </span>
      </div>
    </div>
  )
}