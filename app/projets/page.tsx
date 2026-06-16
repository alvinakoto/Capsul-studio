'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Skeleton } from '@/components/ui/skeleton'
import ProjectCard from '@/components/projects/ProjectCard'
import { getProjects } from '@/lib/supabase/projects'

const PAGE_SIZE = 6

const STATUS_OPTIONS = [
  { value: 'draft',      label: 'Brouillon',  dot: '#6E6E73' },
  { value: 'simulation', label: 'Simulation',  dot: '#C9943A' },
  { value: 'validated',  label: 'Validé',      dot: '#0E2240' },
  { value: 'archived',   label: 'Archivé',     dot: '#9E9E9E' },
]

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

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">

      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-1" style={{ color: '#C9943A' }}>
            Capsul Studio
          </p>
          <h1 className="text-[26px] font-bold tracking-tight" style={{ color: '#0E2240' }}>
            Mes projets
          </h1>
          {!loading && (
            <p className="text-sm mt-1" style={{ color: '#6E6E73' }}>
              {projects.length === 0
                ? 'Aucun projet pour le moment'
                : `${projects.length} projet${projects.length > 1 ? 's' : ''} en portefeuille`}
            </p>
          )}
        </div>
        <button
          onClick={() => router.push('/projets/nouveau')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{ backgroundColor: '#0E2240', color: '#fff' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#162F56' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0E2240' }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Nouveau projet
        </button>
      </div>

      {/* Barre de recherche + filtres */}
      {!loading && projects.length > 0 && (
        <div className="mb-6 space-y-3">

          {/* Recherche */}
          <div className="relative">
            <svg
              width="15" height="15" viewBox="0 0 15 15" fill="none"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: '#6E6E73' }}
            >
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Rechercher par nom, ville, adresse…"
              className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all"
              style={{
                backgroundColor: '#fff',
                border: '1px solid #DDD9D0',
                color: '#1C1C1E',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#0E2240'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14,34,64,0.07)' }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = '#DDD9D0'; e.currentTarget.style.boxShadow = 'none' }}
            />
            {search && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 transition-colors"
                style={{ color: '#9E9E9E' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#1C1C1E' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#9E9E9E' }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>

          {/* Filtres pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] mr-1" style={{ color: '#9E9E9E' }}>
              Statut
            </span>
            {STATUS_OPTIONS.map(opt => {
              const active = filterStatus === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => handleStatus(opt.value)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium transition-all"
                  style={{
                    backgroundColor: active ? '#0E2240' : '#fff',
                    color: active ? '#fff' : '#6E6E73',
                    border: `1px solid ${active ? '#0E2240' : '#DDD9D0'}`,
                  }}
                  onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = '#0E2240'; e.currentTarget.style.color = '#0E2240' } }}
                  onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = '#DDD9D0'; e.currentTarget.style.color = '#6E6E73' } }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: active ? '#fff' : opt.dot }}
                  />
                  {opt.label}
                </button>
              )
            })}

            {typeOptions.length > 0 && (
              <>
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] ml-2 mr-1" style={{ color: '#9E9E9E' }}>
                  Type
                </span>
                {typeOptions.map(type => {
                  const active = filterType === type
                  return (
                    <button
                      key={type}
                      onClick={() => handleType(type)}
                      className="px-3 py-1 rounded-full text-[12px] font-medium transition-all"
                      style={{
                        backgroundColor: active ? '#0E2240' : '#fff',
                        color: active ? '#fff' : '#6E6E73',
                        border: `1px solid ${active ? '#0E2240' : '#DDD9D0'}`,
                      }}
                      onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = '#0E2240'; e.currentTarget.style.color = '#0E2240' } }}
                      onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = '#DDD9D0'; e.currentTarget.style.color = '#6E6E73' } }}
                    >
                      {type}
                    </button>
                  )
                })}
              </>
            )}

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto text-[11px] font-medium flex items-center gap-1 transition-colors"
                style={{ color: '#9E9E9E' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#1C1C1E' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#9E9E9E' }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                Effacer les filtres
              </button>
            )}
          </div>

          {/* Résumé des résultats quand filtré */}
          {hasFilters && (
            <p className="text-[12px]" style={{ color: '#6E6E73' }}>
              {filtered.length === 0
                ? 'Aucun résultat'
                : `${filtered.length} résultat${filtered.length > 1 ? 's' : ''}`}
            </p>
          )}
        </div>
      )}

      {/* Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" style={{ backgroundColor: '#EDE9E1' }} />
          ))}
        </div>
      )}

      {/* Empty state — aucun projet */}
      {!loading && projects.length === 0 && (
        <div
          className="rounded-xl border-2 border-dashed py-20 text-center"
          style={{ borderColor: '#DDD9D0' }}
        >
          <div
            className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: '#EDE9E1' }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="2" y="2" width="8" height="8" rx="2" stroke="#0E2240" strokeWidth="1.6"/>
              <rect x="12" y="2" width="8" height="8" rx="2" stroke="#0E2240" strokeWidth="1.6"/>
              <rect x="2" y="12" width="8" height="8" rx="2" stroke="#0E2240" strokeWidth="1.6"/>
              <rect x="12" y="12" width="8" height="8" rx="2" stroke="#0E2240" strokeWidth="1.6"/>
            </svg>
          </div>
          <p className="font-semibold mb-1" style={{ color: '#1C1C1E' }}>Aucun projet pour l'instant</p>
          <p className="text-sm mb-6" style={{ color: '#6E6E73' }}>Créez votre première analyse pour commencer.</p>
          <button
            onClick={() => router.push('/projets/nouveau')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{ backgroundColor: '#0E2240', color: '#fff' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#162F56' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0E2240' }}
          >
            + Nouveau projet
          </button>
        </div>
      )}

      {/* Empty state — aucun résultat de filtre */}
      {!loading && projects.length > 0 && filtered.length === 0 && (
        <div className="py-16 text-center">
          <div
            className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
            style={{ backgroundColor: '#EDE9E1' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="8" cy="8" r="6" stroke="#6E6E73" strokeWidth="1.5"/>
              <path d="M13 13l3.5 3.5" stroke="#6E6E73" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M6 8h4M8 6v4" stroke="#6E6E73" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="font-medium text-sm mb-1" style={{ color: '#1C1C1E' }}>Aucun projet ne correspond</p>
          <p className="text-sm mb-4" style={{ color: '#6E6E73' }}>Essayez d'autres termes ou effacez les filtres.</p>
          <button
            onClick={clearFilters}
            className="text-sm font-medium transition-colors"
            style={{ color: '#C9943A' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#A67828' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#C9943A' }}
          >
            Effacer les filtres
          </button>
        </div>
      )}

      {/* Grille */}
      {!loading && visible.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {/* Afficher plus */}
          {remaining > 0 && (
            <div className="mt-8 flex items-center gap-4">
              <div className="flex-1 h-px" style={{ backgroundColor: '#EDE9E1' }} />
              <button
                onClick={() => setShowCount(c => c + PAGE_SIZE)}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
                style={{ border: '1px solid #DDD9D0', color: '#1C1C1E', backgroundColor: '#fff' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0E2240'; e.currentTarget.style.backgroundColor = '#F7F5F1' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#DDD9D0'; e.currentTarget.style.backgroundColor = '#fff' }}
              >
                Afficher {Math.min(remaining, PAGE_SIZE)} de plus
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 2v10M2 7l5 5 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div className="flex-1 h-px" style={{ backgroundColor: '#EDE9E1' }} />
            </div>
          )}

          {/* Compteur discret quand tout est affiché */}
          {remaining <= 0 && filtered.length > PAGE_SIZE && (
            <p className="mt-6 text-center text-[12px]" style={{ color: '#9E9E9E' }}>
              {filtered.length} projets affichés
            </p>
          )}
        </>
      )}
    </div>
  )
}
