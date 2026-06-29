'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { updateProjectStatus, deleteProject, duplicateProject } from '@/lib/supabase/projects'

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  draft:      { label: 'Brouillon',  bg: '#F0EDE7',               color: '#6E6E73', dot: '#6E6E73' },
  simulation: { label: 'Simulation', bg: 'rgba(201,148,58,0.12)', color: '#A67828', dot: '#C9943A' },
  validated:  { label: 'Validé',     bg: 'rgba(14,34,64,0.08)',   color: '#0E2240', dot: '#0E2240' },
  archived:   { label: 'Archivé',    bg: '#F0EDE7',               color: '#9E9E9E', dot: '#9E9E9E' },
}

const STATUS_OPTIONS = [
  { value: 'draft',      label: 'Brouillon' },
  { value: 'simulation', label: 'Simulation' },
  { value: 'validated',  label: 'Validé' },
  { value: 'archived',   label: 'Archivé' },
] as const

function euros(n: number) {
  return (n ?? 0).toLocaleString('fr-FR') + ' €'
}

export default function ProjetHeader({ project }: { project: any }) {
  const router = useRouter()
  const [status, setStatus]           = useState<string>(project.status ?? 'draft')
  const [statusOpen, setStatusOpen]   = useState(false)
  const [statusSaving, setStatusSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting]       = useState(false)
  const [duplicating, setDuplicating] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft

  // Ferme le dropdown si clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setStatusOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleStatusChange = async (newStatus: typeof STATUS_OPTIONS[number]['value']) => {
    if (newStatus === status) { setStatusOpen(false); return }
    setStatusSaving(true)
    setStatusOpen(false)
    try {
      await updateProjectStatus(project.id, newStatus)
      setStatus(newStatus)
    } catch (err) {
      console.error(err)
    } finally {
      setStatusSaving(false)
    }
  }

  const handleDuplicate = async () => {
    setDuplicating(true)
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const newId = await duplicateProject(project.id, user.id)
      router.push(`/projets/${newId}/modifier`)
    } catch (err) {
      console.error(err)
    } finally {
      setDuplicating(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteProject(project.id)
      router.push('/projets')
    } catch (err) {
      console.error(err)
      setDeleting(false)
      setDeleteConfirm(false)
    }
  }

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
            <div className="flex items-center gap-3 mb-1.5 flex-wrap">
              <h1 className="text-xl font-bold" style={{ color: '#0E2240' }}>
                {project.name}
              </h1>

              {/* Status dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setStatusOpen(o => !o)}
                  disabled={statusSaving}
                  className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all"
                  style={{ backgroundColor: cfg.bg, color: cfg.color }}
                  title="Changer le statut"
                >
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cfg.dot }} />
                  {statusSaving ? 'Mise à jour…' : cfg.label}
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="ml-0.5 opacity-60">
                    <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {statusOpen && (
                  <div
                    className="absolute top-full left-0 mt-1.5 rounded-xl overflow-hidden z-20"
                    style={{
                      backgroundColor: '#fff',
                      border: '1px solid #DDD9D0',
                      boxShadow: '0 8px 24px rgba(14,34,64,0.12)',
                      minWidth: 140,
                    }}
                  >
                    {STATUS_OPTIONS.map(opt => {
                      const c = STATUS_CONFIG[opt.value]
                      const isActive = status === opt.value
                      return (
                        <button
                          key={opt.value}
                          onClick={() => handleStatusChange(opt.value)}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-left transition-colors"
                          style={{
                            backgroundColor: isActive ? '#F7F5F1' : 'transparent',
                            color: isActive ? '#0E2240' : '#6E6E73',
                          }}
                          onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#F7F5F1' }}
                          onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent' }}
                        >
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.dot }} />
                          {opt.label}
                          {isActive && (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="ml-auto">
                              <path d="M2 6l3 3 5-5" stroke="#0E2240" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm" style={{ color: '#6E6E73' }}>
              {[project.type_bien, project.surface_m2 ? `${project.surface_m2} m²` : null, project.city]
                .filter(Boolean).join(' · ')}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => router.push(`/projets/${project.id}/modifier`)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-all"
              style={{ border: '1px solid #DDD9D0', color: '#1C1C1E', backgroundColor: 'transparent' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F7F5F1' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M9 2l2 2-7 7H2V9l7-7z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Modifier
            </button>

            <button
              onClick={handleDuplicate}
              disabled={duplicating}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-all disabled:opacity-50"
              style={{ border: '1px solid #DDD9D0', color: '#1C1C1E', backgroundColor: 'transparent' }}
              onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#F7F5F1' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <rect x="4" y="4" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M2.5 9V2.5H9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {duplicating ? 'Duplication…' : 'Dupliquer'}
            </button>

            {/* Supprimer */}
            {!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-all"
                style={{ border: '1px solid #DDD9D0', color: '#9E9E9E', backgroundColor: 'transparent' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#FCA5A5'
                  e.currentTarget.style.color = '#DC2626'
                  e.currentTarget.style.backgroundColor = '#FEF2F2'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#DDD9D0'
                  e.currentTarget.style.color = '#9E9E9E'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M2 3.5h9M5 3.5V2.5h3v1M10 3.5l-.7 7H3.7L3 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Supprimer
              </button>
            ) : (
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5' }}
              >
                <span className="text-[12px] font-medium" style={{ color: '#DC2626' }}>
                  Confirmer ?
                </span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-[12px] font-semibold transition-colors disabled:opacity-50"
                  style={{ color: '#DC2626' }}
                >
                  {deleting ? 'Suppression…' : 'Oui'}
                </button>
                <span style={{ color: '#FCA5A5' }}>·</span>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="text-[12px] font-medium transition-colors"
                  style={{ color: '#9E9E9E' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#1C1C1E' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#9E9E9E' }}
                >
                  Annuler
                </button>
              </div>
            )}
          </div>
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
        style={{ color: gold ? '#C9943A' : '#0E2240', fontWeight: bold ? 700 : 600 }}
      >
        {value}
      </p>
    </div>
  )
}
