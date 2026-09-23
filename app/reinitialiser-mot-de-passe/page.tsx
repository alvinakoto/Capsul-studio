'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { translateAuthError } from '@/lib/supabase/authErrors'
import { PasswordInput } from '@/components/ui/password-input'

export default function ReinitialiserMotDePassePage() {
  const [status, setStatus] = useState<'checking' | 'ready' | 'invalid'>('checking')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Le lien reçu par email établit une session de récupération côté client
  // (tokens dans le fragment d'URL, jamais vus par le serveur) — on écoute
  // l'événement dédié plutôt que de vérifier une seule fois au montage.
  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setStatus('ready')
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setStatus('ready')
    })

    const timeout = setTimeout(() => {
      setStatus((s) => (s === 'checking' ? 'invalid' : s))
    }, 3000)

    return () => {
      listener.subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const handleSubmit = async () => {
    setError('')
    if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return }
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError(translateAuthError(updateError.message))
        return
      }
      router.push('/projets')
      router.refresh()
    } catch (err: any) {
      setError(translateAuthError(err?.message))
    } finally {
      setLoading(false)
    }
  }

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-[#16314E] flex items-center justify-center">
        <p className="text-white text-sm">Vérification du lien…</p>
      </div>
    )
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-screen bg-[#16314E] flex items-center justify-center">
        <div className="bg-white rounded-2xl p-10 w-full max-w-md shadow-2xl text-center">
          <h1 className="text-[17px] font-bold mb-2" style={{ color: '#0E2240' }}>
            Lien invalide ou expiré
          </h1>
          <p className="text-sm mb-6" style={{ color: '#6E6E73' }}>
            Ce lien de réinitialisation n'est plus valide. Demandez-en un nouveau.
          </p>
          <a
            href="/mot-de-passe-oublie"
            className="inline-block w-full rounded-lg px-4 py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: '#0E2240' }}
          >
            Demander un nouveau lien
          </a>
        </div>
      </div>
    )
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
              Nouveau mot de passe
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nouveau mot de passe
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8 caractères minimum"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#16314E]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le mot de passe
            </label>
            <PasswordInput
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#16314E]"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#16314E] text-white rounded-lg px-4 py-3 text-sm font-semibold hover:bg-[#1B3A6B] transition-colors disabled:opacity-50"
          >
            {loading ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
          </button>
        </div>

      </div>
    </div>
  )
}
