'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { updateProjectStatus, deleteProject, duplicateProject, updateProjectName, nomProjetAuto } from '@/lib/supabase/projects'
import { syntheseProjet } from '@/lib/calculs/depuisProjet'
import { euros } from '@/lib/utils/format'
import { STATUS_ORDER, statusConfig, type StatutProjet } from './status'

export default function ProjetHeader({ project }: { project: any }) {
  const router = useRouter()
  const [status, setStatus]           = useState<string>(project.status ?? 'draft')
  const [statusOpen, setStatusOpen]   = useState(false)
  const [statusSaving, setStatusSaving] = useState(false)
  const [menuOpen, setMenuOpen]       = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting]       = useState(false)
  const [duplicating, setDuplicating] = useState(false)
  const [nom, setNom]                 = useState<string>(project.name ?? '')
  const [renaming, setRenaming]       = useState(false)
  const [nomDraft, setNomDraft]       = useState<string>(project.name ?? '')
  const statusRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const cfg = statusConfig(status)

  // Ferme les menus si clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusOpen(false)
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) { setMenuOpen(false); setDeleteConfirm(false) }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleStatusChange = async (newStatus: StatutProjet) => {
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

  const commitRename = async () => {
    setRenaming(false)
    if (nomDraft.trim() === nom) return
    const precedent = nom
    try {
      const name = await updateProjectName(project.id, nomDraft, {
        adresse: project.adresse,
        ville: project.ville ?? project.city,
      })
      setNom(name)
      setNomDraft(name)
    } catch (err) {
      console.error(err)
      setNomDraft(precedent)
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

  const { prixProjetTotal, isComptant } = syntheseProjet(project)

  const meta = [project.type_bien, project.surface_m2 ? `${project.surface_m2} m²` : null, project.city].filter(Boolean)

  const sousTitreApport = project.apport === null || project.apport === undefined
    ? 'Non renseigné'
    : isComptant
      ? 'Achat comptant'
      : project.taux_interet_pct
        ? `Crédit ${project.duree_annees || 20} ans à ${Number(project.taux_interet_pct).toLocaleString('fr-FR')} %`
        : `Crédit sur ${project.duree_annees || 20} ans`

  return (
    <header>
      <button onClick={() => router.push('/projets')} className="cs-crumb mb-4">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
        Projets
      </button>

      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div className="min-w-0">
          <p className="cs-eyebrow">Projet</p>

          {renaming ? (
            <input
              autoFocus
              value={nomDraft}
              onChange={(e) => setNomDraft(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename()
                if (e.key === 'Escape') { setNomDraft(nom); setRenaming(false) }
              }}
              placeholder={nomProjetAuto(project.adresse, project.ville ?? project.city)}
              aria-label="Nom du projet"
              className="cs-h1 mt-1.5 mb-2 rounded-lg px-2 -ml-2 outline-none w-full max-w-xl"
              style={{ border: '1px solid var(--cs-gold)', backgroundColor: '#fff' }}
            />
          ) : (
            <button
              onClick={() => { setNomDraft(nom); setRenaming(true) }}
              title="Renommer le projet"
              className="group flex items-center gap-2 rounded-lg px-2 -ml-2 mt-1.5 mb-2 text-left transition-colors hover:bg-white"
            >
              <h1 className="cs-h1">{nom}</h1>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--cs-navy)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover:opacity-50 shrink-0" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            </button>
          )}

          <div className="flex items-center gap-2.5 flex-wrap text-[13px]" style={{ color: 'var(--cs-mist)' }}>
            {/* Statut */}
            <div className="relative" ref={statusRef}>
              <button
                onClick={() => setStatusOpen(o => !o)}
                disabled={statusSaving}
                className="cs-pill cursor-pointer"
                style={{ backgroundColor: cfg.bg, color: cfg.color }}
                aria-haspopup="listbox"
                aria-expanded={statusOpen}
                title="Changer le statut"
              >
                <i style={{ backgroundColor: cfg.dot }} />
                {statusSaving ? 'Mise à jour…' : cfg.label}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
              </button>

              {statusOpen && (
                <div className="cs-card absolute top-full left-0 mt-1.5 overflow-hidden z-20 py-1" style={{ minWidth: 160 }} role="listbox">
                  {STATUS_ORDER.map(value => {
                    const c = statusConfig(value)
                    const isActive = status === value
                    return (
                      <button
                        key={value}
                        role="option"
                        aria-selected={isActive}
                        onClick={() => handleStatusChange(value)}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12.5px] font-medium text-left transition-colors hover:bg-[var(--cs-ivory)]"
                        style={{ color: isActive ? 'var(--cs-navy)' : 'var(--cs-mist)' }}
                      >
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.dot }} />
                        {c.label}
                        {isActive && (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--cs-navy)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-auto" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {meta.map((m, i) => (
              <span key={i} className="flex items-center gap-2.5">
                {i > 0 && <span className="w-[3px] h-[3px] rounded-full" style={{ backgroundColor: '#B9B4AA' }} />}
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => router.push(`/projets/${project.id}/modifier`)} className="cs-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            Modifier le projet
          </button>
          <button onClick={handleDuplicate} disabled={duplicating} className="cs-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M4 16V5a1 1 0 0 1 1-1h11"/></svg>
            {duplicating ? 'Duplication…' : 'Dupliquer'}
          </button>

          {/* Menu « plus d'actions » : Supprimer, loin des actions courantes */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => { setMenuOpen(o => !o); setDeleteConfirm(false) }}
              className="cs-btn cs-btn-icon"
              aria-label="Plus d'actions"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>
            </button>
            {menuOpen && (
              <div className="cs-card absolute top-full right-0 mt-1.5 z-20 p-1.5" style={{ minWidth: 220 }} role="menu">
                {!deleteConfirm ? (
                  <button
                    role="menuitem"
                    onClick={() => setDeleteConfirm(true)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-left transition-colors hover:bg-[var(--cs-neg-wash)]"
                    style={{ color: 'var(--cs-neg)' }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="m19 6-1 14H6L5 6"/></svg>
                    Supprimer le projet
                  </button>
                ) : (
                  <div className="px-3 py-2.5">
                    <p className="text-[13px] font-semibold" style={{ color: 'var(--cs-ink)' }}>Supprimer ce projet ?</p>
                    <p className="cs-hint mt-0.5 mb-3">Les photos sont supprimées avec lui. Impossible d’annuler.</p>
                    <div className="flex gap-2">
                      <button onClick={handleDelete} disabled={deleting} className="cs-btn flex-1 h-8" style={{ backgroundColor: 'var(--cs-neg)', borderColor: 'var(--cs-neg)', color: '#fff' }}>
                        {deleting ? 'Suppression…' : 'Supprimer'}
                      </button>
                      <button onClick={() => setDeleteConfirm(false)} className="cs-btn flex-1 h-8">Annuler</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chiffres clés du projet */}
      <div className="cs-card mt-6 grid grid-cols-2 lg:grid-cols-4 overflow-hidden" style={{ boxShadow: 'none' }}>
        <Figure label="Prix d'achat" value={euros(project.prix_achat)} sub={project.negociation_envisagee ? 'Prix négocié envisagé' : 'FAI'} />
        <Figure
          label="Travaux"
          value={euros(project.travaux || 0)}
          sub={project.mobilier ? `+ ${euros(project.mobilier)} d'ameublement` : 'Hors ameublement'}
          className="border-l cs-divider"
        />
        <Figure label="Prix projet total" value={euros(prixProjetTotal)} sub="Frais et honoraires inclus" gold className="border-t lg:border-t-0 lg:border-l cs-divider" />
        <Figure
          label="Apport"
          value={project.apport !== null && project.apport !== undefined ? euros(project.apport) : '—'}
          sub={sousTitreApport}
          className="border-l border-t lg:border-t-0 cs-divider"
        />
      </div>
    </header>
  )
}

function Figure({ label, value, sub, gold = false, className = '' }: {
  label: string; value: string; sub?: string; gold?: boolean; className?: string
}) {
  return (
    <div className={`px-5 py-4 ${className}`}>
      <p className="cs-label">{label}</p>
      <p className="mt-1 text-[18px] font-bold tabular-nums" style={{ color: gold ? 'var(--cs-gold-ink)' : 'var(--cs-navy)' }}>
        {value}
      </p>
      {sub && <p className="text-[12px]" style={{ color: 'var(--cs-mist)' }}>{sub}</p>}
    </div>
  )
}
