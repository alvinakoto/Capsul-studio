'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { translateAuthError } from '@/lib/supabase/authErrors'
import AuthLayout, { AUTH_INPUT } from '@/components/layout/AuthLayout'

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async () => {
    setError('')
    if (!email.trim()) { setError('Veuillez saisir votre adresse email.'); return }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`,
      })
      if (resetError) {
        setError(translateAuthError(resetError.message))
        return
      }
      setSent(true)
    } catch (err: any) {
      setError(translateAuthError(err?.message))
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <AuthLayout>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: 'var(--cs-gold-wash)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--cs-gold-ink)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
        </div>
        <h1 className="cs-h1">Vérifiez votre boîte mail</h1>
        <p className="text-[13.5px] mt-2" style={{ color: 'var(--cs-mist)' }}>
          Si un compte existe avec l’adresse <b style={{ color: 'var(--cs-ink)' }}>{email}</b>, un lien de réinitialisation vient d’être envoyé.
        </p>
        <a href="/login" className="cs-btn cs-btn-lg w-full mt-6">Retour à la connexion</a>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <p className="cs-eyebrow">Espace chargés de projets</p>
      <h1 className="cs-h1 mt-1.5">Mot de passe oublié</h1>
      <p className="text-[13.5px] mt-2 mb-7" style={{ color: 'var(--cs-mist)' }}>
        Indiquez votre adresse email, on vous envoie un lien pour réinitialiser votre mot de passe.
      </p>

      <form className="grid gap-[18px]" onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>
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

        {error && (
          <div className="text-[13px] px-4 py-3 rounded-[10px]" style={{ color: 'var(--cs-neg)', backgroundColor: 'var(--cs-neg-wash)' }} role="alert">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="cs-btn cs-btn-primary cs-btn-lg w-full">
          {loading ? 'Envoi…' : 'Envoyer le lien'}
        </button>
      </form>

      <p className="mt-6 text-center text-[13px]">
        <a href="/login" className="cs-link">Retour à la connexion</a>
      </p>
    </AuthLayout>
  )
}
