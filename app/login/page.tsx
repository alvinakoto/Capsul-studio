'use client'

import { Suspense, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { translateAuthError } from '@/lib/supabase/authErrors'
import { PasswordInput } from '@/components/ui/password-input'
import AuthLayout, { AUTH_INPUT } from '@/components/layout/AuthLayout'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [needsConfirm, setNeedsConfirm] = useState(false)
  const [resendDone, setResendDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const justConfirmed = searchParams.get('confirmed') === '1'

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    setNeedsConfirm(false)
    setResendDone(false)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      if (error.code === 'email_not_confirmed' || error.message.toLowerCase().includes('email not confirmed')) {
        setError('Ce compte n\'a pas encore été confirmé. Vérifiez votre boîte mail, ou renvoyez l\'email ci-dessous.')
        setNeedsConfirm(true)
      } else {
        setError(translateAuthError(error.message))
      }
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  const handleResend = async () => {
    setLoading(true)
    const supabase = createClient()
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/login?confirmed=1` },
    })
    if (resendError) {
      setError(translateAuthError(resendError.message))
    } else {
      setResendDone(true)
    }
    setLoading(false)
  }

  return (
    <AuthLayout>
      <p className="cs-eyebrow">Espace chargés de projets</p>
      <h1 className="cs-h1 mt-1.5 mb-7">Connexion</h1>

      {justConfirmed && (
        <div className="text-[13px] font-medium px-4 py-3 rounded-[10px] mb-5" style={{ color: 'var(--cs-pos)', backgroundColor: 'var(--cs-pos-wash)' }}>
          Email confirmé, vous pouvez vous connecter.
        </div>
      )}

      <form className="grid gap-[18px]" onSubmit={(e) => { e.preventDefault(); handleLogin() }}>
        <div className="grid gap-1.5">
          <label htmlFor="email" className="cs-field-label text-[12.5px]">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ton@capsul-france.com"
            className={AUTH_INPUT}
            style={{ color: 'var(--cs-ink)' }}
          />
        </div>

        <div className="grid gap-1.5">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="password" className="cs-field-label text-[12.5px]">Mot de passe</label>
            <a href="/mot-de-passe-oublie" className="cs-link text-[12.5px]">Mot de passe oublié ?</a>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={AUTH_INPUT}
            style={{ color: 'var(--cs-ink)' }}
          />
        </div>

        {error && (
          <div className="text-[13px] px-4 py-3 rounded-[10px]" style={{ color: 'var(--cs-neg)', backgroundColor: 'var(--cs-neg-wash)' }} role="alert">
            {error}
            {needsConfirm && (
              <div className="mt-2">
                {resendDone ? (
                  <span style={{ color: 'var(--cs-pos)' }}>Email renvoyé.</span>
                ) : (
                  <button type="button" onClick={handleResend} disabled={loading} className="font-semibold underline disabled:opacity-50">
                    Renvoyer l’email de confirmation
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <button type="submit" disabled={loading} className="cs-btn cs-btn-primary cs-btn-lg w-full">
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>

      <p className="mt-6 text-center text-[13px]" style={{ color: 'var(--cs-mist)' }}>
        Première connexion ? <a href="/inscription" className="cs-link">Créer un compte</a>
      </p>
    </AuthLayout>
  )
}
