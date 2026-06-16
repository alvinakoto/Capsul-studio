'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

const NAV = [
  {
    href: '/projets',
    label: 'Projets',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
]

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [userName, setUserName] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('users').select('full_name, role').eq('id', user.id).single()
      setUserName(data?.full_name ?? user.email?.split('@')[0] ?? null)
      setUserRole(data?.role ?? null)
    }
    load()
  }, [])

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside
      className="fixed top-0 left-0 h-screen w-[220px] flex flex-col z-40"
      style={{ backgroundColor: '#0E2240' }}
    >
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 border-b border-white/10">
        <button
          onClick={() => router.push('/projets')}
          className="flex items-center gap-3 group"
        >
          <img
            src="/logo-capsul.jpg"
            alt="Capsul"
            className="rounded-md shrink-0"
            style={{ width: 36, height: 36, objectFit: 'cover', objectPosition: 'center' }}
          />
          <div className="text-left">
            <div className="text-white font-bold text-[13px] tracking-wide leading-tight">
              CAPSUL
            </div>
            <div className="font-semibold text-[10px] tracking-widest leading-tight" style={{ color: '#C9943A' }}>
              STUDIO
            </div>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-4 space-y-0.5">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all"
              style={{
                backgroundColor: active ? 'rgba(201,148,58,0.15)' : 'transparent',
                color: active ? '#E6B64C' : 'rgba(247,245,241,0.7)',
                borderLeft: active ? '2px solid #C9943A' : '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'
                  e.currentTarget.style.color = '#F7F5F1'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = 'rgba(247,245,241,0.7)'
                }
              }}
            >
              <span style={{ opacity: active ? 1 : 0.6 }}>{item.icon}</span>
              {item.label}
            </button>
          )
        })}

        {/* CTA nouveau projet */}
        <div className="pt-3">
          <button
            onClick={() => router.push('/projets/nouveau')}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-all"
            style={{ backgroundColor: '#C9943A', color: '#fff' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#B8841F' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#C9943A' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Nouveau projet
          </button>
        </div>
      </nav>

      {/* User footer */}
      <div className="px-3 pb-4 border-t border-white/10 pt-3">
        {userName && (
          <div className="px-3 py-2 mb-1">
            <p className="text-white text-[12px] font-medium truncate">{userName}</p>
            {userRole && (
              <p className="text-[10px] mt-0.5 capitalize truncate" style={{ color: 'rgba(247,245,241,0.45)' }}>
                {userRole}
              </p>
            )}
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] transition-all"
          style={{ color: 'rgba(247,245,241,0.4)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'
            e.currentTarget.style.color = 'rgba(247,245,241,0.8)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = 'rgba(247,245,241,0.4)'
          }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M5 1.5H2a1 1 0 00-1 1v8a1 1 0 001 1h3M9 9.5l3-3-3-3M12 6.5H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
