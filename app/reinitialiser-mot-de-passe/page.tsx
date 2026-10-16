'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { translateAuthError } from '@/lib/supabase/authErrors'
import { PasswordInput } from '@/components/ui/password-input'
import AuthLayout, { AUTH_INPUT } from '@/components/layout/AuthLayout'

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
      <AuthLayout>
        <p className="text-[13.5px]" style={{ color: 'var(--cs-mist)' }} aria-live="polite">Vérification du lien…</p>
      </AuthLayout>
    )
  }

  if (status === 'invalid') {
    return (
      <AuthLayout>
        <h1 className="cs-h1">Lien invalide ou expiré</h1>
        <p className="text-[13.5px] mt-2" style={{ color: 'var(--cs-mist)' }}>
          Ce lien de réinitialisation n’est plus valide. Demandez-en un nouveau.
        </p>
        <a href="/mot-de-passe-oublie" className="cs-btn cs-btn-primary cs-btn-lg w-full mt-6">
          Demander un nouveau lien
        </a>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <p className="cs-eyebrow">Espace chargés de projets</p>
      <h1 className="cs-h1 mt-1.5 mb-7">Nouveau mot de passe</h1>

      <form className="grid gap-[18px]" onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>
        <div className="grid gap-1.5">
          <label htmlFor="password" className="cs-field-label text-[12.5px]">Nouveau mot de passe</label>
          <PasswordInput id="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="8 caractères minimum" className={AUTH_INPUT} style={{ color: 'var(--cs-ink)' }} />
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="confirm" className="cs-field-label text-[12.5px]">Confirmer le mot de passe</label>
          <PasswordInput id="confirm" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••" className={AUTH_INPUT} style={{ color: 'var(--cs-ink)' }} />
        </div>

        {error && (
          <div className="text-[13px] px-4 py-3 rounded-[10px]" style={{ color: 'var(--cs-neg)', backgroundColor: 'var(--cs-neg-wash)' }} role="alert">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="cs-btn cs-btn-primary cs-btn-lg w-full">
          {loading ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
        </button>
      </form>
    </AuthLayout>
  )
}
