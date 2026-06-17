'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Email ou mot de passe incorrect')
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#16314E] flex items-center justify-center">
      <div className="bg-white rounded-2xl p-10 w-full max-w-md shadow-2xl">

        <div className="flex items-center gap-3 mb-8">
          <img
            src="/logo-capsul.jpg"
            alt="Capsul"
            className="rounded-lg shrink-0"
            style={{ width: 40, height: 40, objectFit: 'cover' }}
          />
          <div>
            <div className="font-bold text-[14px] tracking-wide" style={{ color: '#0E2240' }}>
              CAPSUL STUDIO
            </div>
            <div className="text-[11px]" style={{ color: '#6E6E73' }}>
              Espace chargés de projets
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@capsul-france.com"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#16314E]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#16314E]"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-[#16314E] text-white rounded-lg px-4 py-3 text-sm font-semibold hover:bg-[#1B3A6B] transition-colors disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </div>

        <div className="mt-6 pt-5 border-t border-gray-100">
          <p className="text-center text-sm text-gray-500">
            Première connexion ?{' '}
            <a
              href="/inscription"
              className="font-semibold text-[#16314E] hover:text-[#e6b64c] transition-colors"
            >
              Créer un compte
            </a>
          </p>
        </div>

      </div>
    </div>
  )
}