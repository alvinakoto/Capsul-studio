'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { getProjectById } from '@/lib/supabase/projects'
import ProjetHeader from '@/components/projects/ProjetHeader'
import ScenarioPanel from '@/components/projects/ScenarioPanel'

export default function ProjetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }

        const data = await getProjectById(id, user.id)
        setProject(data)
      } catch (err) {
        console.error(err)
        router.push('/projets')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  if (!id || id === 'page' || id === 'nouveau') {
    router.push('/projets')
    return
  }

  if (loading) return (
    <div className="max-w-5xl mx-auto px-8 py-10 space-y-4">
      {[80, 320].map((h) => (
        <div
          key={h}
          className="rounded-xl animate-pulse"
          style={{ height: h, backgroundColor: '#EDE9E1' }}
        />
      ))}
    </div>
  )

  if (!project) return null

  return (
    <div className="max-w-5xl mx-auto px-8 py-10 space-y-6">
      <ProjetHeader project={project} />
      <ScenarioPanel project={project} />
    </div>
  )
}
