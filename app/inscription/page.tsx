'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { translateAuthError } from '@/lib/supabase/authErrors'
import { PasswordInput } from '@/components/ui/password-input'
import AuthLayout, { AUTH_INPUT } from '@/components/layout/AuthLayout'
import { useRouter } from 'next/navigation'

const ALLOWED_DOMAIN = 'capsul-france.com'

export default function InscriptionPage() {
  const [fullName, setFullName]   = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [awaitingConfirm, setAwaitingConfirm] = useState(false)
  const router = useRouter()

  const validate = (): string | null => {
    if (!fullName.trim()) return 'Veuillez saisir votre nom complet.'
    if (!email.endsWith(`@${ALLOWED_DOMAIN}`))
      return `Seuls les emails @${ALLOWED_DOMAIN} sont autorisés.`
    if (password.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères.'
    if (password !== confirm) return 'Les mots de passe ne correspondent pas.'
    return null
  }

  const handleSubmit = async () => {
    setError('')
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/login?confirmed=1`,
        },
      })

      if (signUpError) {
        setError(translateAuthError(signUpError.message))
        return
      }

      // La ligne public.users (avec full_name) est créée automatiquement par le
      // trigger on_auth_user_created — on ne peut pas le faire ici côté client :
      // tant que l'email n'est pas confirmé, signUp() ne renvoie aucune session,
      // donc la RLS (id = auth.uid()) rejetterait silencieusement l'insertion.

      // Confirmation email requise : pas de session tant que le lien n'est pas cliqué
      if (!data.session) {
        setAwaitingConfirm(true)
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

  const handleResend = async () => {
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: `${window.location.origin}/login?confirmed=1` },
      })
      if (resendError) setError(translateAuthError(resendError.message))
    } finally {
      setLoading(false)
    }
  }

  if (awaitingConfirm) {
    return (
      <AuthLayout>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: 'var(--cs-gold-wash)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--cs-gold-ink)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
        </div>
        <h1 className="cs-h1">Vérifiez votre boîte mail</h1>
        <p className="text-[13.5px] mt-2" style={{ color: 'var(--cs-mist)' }}>
          Un email de confirmation a été envoyé à <b style={{ color: 'var(--cs-ink)' }}>{email}</b>.
          Cliquez sur le lien reçu pour activer votre compte, puis connectez-vous.
        </p>

        {error && (
          <div className="text-[13px] px-4 py-3 rounded-[10px] mt-5" style={{ color: 'var(--cs-neg)', backgroundColor: 'var(--cs-neg-wash)' }} role="alert">
            {error}
          </div>
        )}

        <button onClick={handleResend} disabled={loading} className="cs-btn cs-btn-lg w-full mt-6">
          {loading ? 'Envoi…' : "Renvoyer l'email de confirmation"}
        </button>

        <p className="text-[12.5px] mt-4 text-center" style={{ color: 'var(--cs-mist)' }}>
          Adresse incorrecte ?{' '}
          <button onClick={() => { setAwaitingConfirm(false); setError('') }} className="cs-link">
            Corriger et recommencer
          </button>
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <p className="cs-eyebrow">Espace chargés de projets</p>
      <h1 className="cs-h1 mt-1.5 mb-7">Créer votre compte</h1>

      <form className="grid gap-[18px]" onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>
        <AuthField id="fullName" label="Nom complet">
          <input id="fullName" type="text" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)}
            placeholder="Prénom Nom" className={AUTH_INPUT} style={{ color: 'var(--cs-ink)' }} />
        </AuthField>

        <AuthField id="email" label="Email professionnel">
          <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder={`prenom@${ALLOWED_DOMAIN}`} className={AUTH_INPUT} style={{ color: 'var(--cs-ink)' }} />
        </AuthField>

        <AuthField id="password" label="Mot de passe">
          <PasswordInput id="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="8 caractères minimum" className={AUTH_INPUT} style={{ color: 'var(--cs-ink)' }} />
        </AuthField>

        <AuthField id="confirm" label="Confirmer le mot de passe">
          <PasswordInput id="confirm" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••" className={AUTH_INPUT} style={{ color: 'var(--cs-ink)' }} />
        </AuthField>

        {error && (
          <div className="text-[13px] px-4 py-3 rounded-[10px]" style={{ color: 'var(--cs-neg)', backgroundColor: 'var(--cs-neg-wash)' }} role="alert">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="cs-btn cs-btn-primary cs-btn-lg w-full">
          {loading ? 'Création du compte…' : 'Créer mon compte'}
        </button>
      </form>

      <p className="mt-6 text-center text-[13px]" style={{ color: 'var(--cs-mist)' }}>
        Déjà un compte ? <a href="/login" className="cs-link">Se connecter</a>
      </p>
    </AuthLayout>
  )
}

function AuthField({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="cs-field-label text-[12.5px]">{label}</label>
      {children}
    </div>
  )
}
