'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Skeleton } from '@/components/ui/skeleton'
import ProjectCard from '@/components/projects/ProjectCard'
import { STATUS_ORDER, statusConfig } from '@/components/projects/status'
import { getProjects } from '@/lib/supabase/projects'

const PAGE_SIZE = 6

export default function ProjetsPage() {
  const [projects, setProjects]     = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string | null>(null)
  const [showCount, setShowCount]   = useState(PAGE_SIZE)
  const router = useRouter()

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }
        const data = await getProjects(user.id)
        setProjects(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  // Types bien présents dans les données
  const typeOptions = useMemo(() => {
    const set = new Set<string>()
    projects.forEach(p => { if (p.type_bien) set.add(p.type_bien) })
    return Array.from(set).sort()
  }, [projects])

  // Filtrage client-side
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return projects.filter(p => {
      const matchSearch = !q ||
        p.name?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        (p.adresse || '').toLowerCase().includes(q)
      const matchStatus = !filterStatus || p.status === filterStatus
      const matchType   = !filterType   || p.type_bien === filterType
      return matchSearch && matchStatus && matchType
    })
  }, [projects, search, filterStatus, filterType])

  const visible   = filtered.slice(0, showCount)
  const remaining = filtered.length - showCount
  const hasFilters = search || filterStatus || filterType

  const clearFilters = () => {
    setSearch('')
    setFilterStatus(null)
    setFilterType(null)
    setShowCount(PAGE_SIZE)
  }

  // Reset pagination quand les filtres changent
  const handleSearch = (v: string) => { setSearch(v); setShowCount(PAGE_SIZE) }
  const handleStatus = (v: string) => { setFilterStatus(prev => prev === v ? null : v); setShowCount(PAGE_SIZE) }
  const handleType   = (v: string) => { setFilterType(prev => prev === v ? null : v); setShowCount(PAGE_SIZE) }

  // Nombre de projets par statut (affiché dans les filtres)
  const countByStatus = useMemo(() => {
    const m: Record<string, number> = {}
    projects.forEach(p => { m[p.status] = (m[p.status] ?? 0) + 1 })
    return m
  }, [projects])

  const NouveauProjet = (
    <Link href="/projets/nouveau" className="cs-btn cs-btn-primary h-10 px-4">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
      Nouveau projet
    </Link>
  )

  return (
    <div className="max-w-[1180px] mx-auto px-4 md:px-10 py-8">
      {/* En-tête */}
      <div className="flex items-end justify-between gap-5 flex-wrap">
        <div>
          <p className="cs-eyebrow">Capsul Studio</p>
          <h1 className="cs-h1 mt-1.5">Mes projets</h1>
          {!loading && (
            <p className="text-[13.5px] mt-1" style={{ color: 'var(--cs-mist)' }}>
              {projects.length === 0
                ? 'Aucun projet pour le moment'
                : `${projects.length} projet${projects.length > 1 ? 's' : ''} en portefeuille`}
            </p>
          )}
        </div>
        {NouveauProjet}
      </div>

      {/* Recherche + filtres */}
      {!loading && projects.length > 0 && (
        <div className="mt-7 space-y-3">
          <div className="flex gap-3 flex-wrap items-center">
            <div className="relative flex-[1_1_280px]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--cs-mist)' }} aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Rechercher par nom, ville, adresse…"
                aria-label="Rechercher un projet"
                className="cs-input pl-10 pr-10 font-medium text-[13.5px]"
                style={{ color: 'var(--cs-ink)', borderRadius: 11 }}
              />
              {search && (
                <button
                  onClick={() => handleSearch('')}
                  aria-label="Effacer la recherche"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--cs-ivory)]"
                  style={{ color: 'var(--cs-mist)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-0.5 p-1 rounded-[11px] bg-white" style={{ border: '1px solid var(--cs-line)' }} role="group" aria-label="Filtrer par statut">
              <FilterButton active={!filterStatus} onClick={() => { setFilterStatus(null); setShowCount(PAGE_SIZE) }} label="Tous" count={projects.length} />
              {STATUS_ORDER.filter(s => countByStatus[s]).map(s => (
                <FilterButton key={s} active={filterStatus === s} onClick={() => handleStatus(s)} label={statusConfig(s).label} count={countByStatus[s]} />
              ))}
            </div>
          </div>

          {(typeOptions.length > 1 || hasFilters) && (
            <div className="flex flex-wrap items-center gap-1.5">
              {typeOptions.length > 1 && (
                <>
                  <span className="cs-label mr-1">Type</span>
                  {typeOptions.map(type => {
                    const active = filterType === type
                    return (
                      <button
                        key={type}
                        onClick={() => handleType(type)}
                        aria-pressed={active}
                        className="rounded-full px-3 py-[5px] text-[12px] font-semibold transition-colors"
                        style={{
                          border: `1px solid ${active ? 'var(--cs-navy)' : 'var(--cs-line)'}`,
                          backgroundColor: active ? '#EEF1F5' : '#fff',
                          color: active ? 'var(--cs-navy)' : 'var(--cs-mist)',
                        }}
                      >
                        {type}
                      </button>
                    )
                  })}
                </>
              )}
              {hasFilters && (
                <span className="ml-auto flex items-center gap-3 text-[12px]" style={{ color: 'var(--cs-mist)' }}>
                  {filtered.length === 0 ? 'Aucun résultat' : `${filtered.length} résultat${filtered.length > 1 ? 's' : ''}`}
                  <button onClick={clearFilters} className="cs-link text-[12px]">Effacer les filtres</button>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Squelettes */}
      {loading && (
        <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[300px] rounded-[14px]" style={{ backgroundColor: 'var(--cs-stone)' }} />
          ))}
        </div>
      )}

      {/* Aucun projet */}
      {!loading && projects.length === 0 && (
        <div className="mt-8 rounded-[14px] border-2 border-dashed py-20 px-6 text-center" style={{ borderColor: 'var(--cs-line)' }}>
          <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--cs-stone)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--cs-navy)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z"/></svg>
          </div>
          <p className="cs-h3">Aucun projet pour l’instant</p>
          <p className="cs-sub mt-1 mb-6">Créez votre première analyse pour commencer.</p>
          {NouveauProjet}
        </div>
      )}

      {/* Aucun résultat de filtre */}
      {!loading && projects.length > 0 && filtered.length === 0 && (
        <div className="py-16 text-center">
          <p className="cs-h3">Aucun projet ne correspond</p>
          <p className="cs-sub mt-1 mb-4">Essayez d’autres termes ou effacez les filtres.</p>
          <button onClick={clearFilters} className="cs-btn">Effacer les filtres</button>
        </div>
      )}

      {/* Grille */}
      {!loading && visible.length > 0 && (
        <>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {remaining > 0 && (
            <div className="mt-8 flex items-center gap-4">
              <div className="flex-1 h-px" style={{ backgroundColor: 'var(--cs-line)' }} />
              <button onClick={() => setShowCount(c => c + PAGE_SIZE)} className="cs-btn">
                Afficher {Math.min(remaining, PAGE_SIZE)} de plus
              </button>
              <div className="flex-1 h-px" style={{ backgroundColor: 'var(--cs-line)' }} />
            </div>
          )}

          {remaining <= 0 && filtered.length > PAGE_SIZE && (
            <p className="mt-6 text-center text-[12px]" style={{ color: 'var(--cs-mist)' }}>
              {filtered.length} projets affichés
            </p>
          )}
        </>
      )}
    </div>
  )
}

function FilterButton({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-lg px-[11px] py-1.5 text-[12.5px] font-semibold transition-colors ${active ? '' : 'hover:text-[var(--cs-navy)]'}`}
      style={{ backgroundColor: active ? 'var(--cs-navy)' : 'transparent', color: active ? '#fff' : 'var(--cs-mist)' }}
    >
      {label}
      <span className="text-[11px] font-bold opacity-60 tabular-nums">{count}</span>
    </button>
  )
}
