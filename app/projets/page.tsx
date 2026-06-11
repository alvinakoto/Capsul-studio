'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Skeleton } from '@/components/ui/skeleton'
import ProjectCard from '@/components/projects/ProjectCard'
import { getProjects } from '@/lib/supabase/projects'

export default function ProjetsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
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

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Mes projets</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {loading ? '...' : `${projects.length} projet${projects.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => router.push('/projets/nouveau')}
          className="px-4 py-2 text-sm rounded-lg bg-foreground text-background
                     hover:opacity-90 transition font-medium"
        >
          + Nouveau projet
        </button>
      </div>

      {/* Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && projects.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-medium mb-2">Aucun projet pour l'instant</p>
          <p className="text-sm mb-6">Créez votre premier projet pour commencer.</p>
          <button
            onClick={() => router.push('/projets/nouveau')}
            className="px-4 py-2 text-sm rounded-lg bg-foreground text-background hover:opacity-90 transition"
          >
            + Nouveau projet
          </button>
        </div>
      )}

      {/* Grille de projets */}
      {!loading && projects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

    </div>
  )
}