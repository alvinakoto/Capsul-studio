'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { translateAuthError } from '@/lib/supabase/authErrors'
import { PasswordInput } from '@/components/ui/password-input'
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

      // Insérer dans la table users avec rôle chargé (indépendant de la confirmation email)
      if (data.user) {
        await supabase.from('users').upsert({
          id: data.user.id,
          email,
          full_name: fullName,
          role: 'charge',
        })
      }

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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0E2240' }}>
        <div className="w-full max-w-md mx-4">
          <div
            className="rounded-2xl p-10 text-center"
            style={{ backgroundColor: '#fff', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}
          >
            <div
              className="mx-auto mb-5 rounded-full flex items-center justify-center"
              style={{ width: 56, height: 56, backgroundColor: 'rgba(201,148,58,0.12)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 6l9 7 9-7M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z"
                  stroke="#C9943A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-[17px] font-bold mb-2" style={{ color: '#0E2240' }}>
              Vérifiez votre boîte mail
            </h1>
            <p className="text-sm mb-1" style={{ color: '#6E6E73' }}>
              Un email de confirmation a été envoyé à
            </p>
            <p className="text-sm font-semibold mb-6" style={{ color: '#1C1C1E' }}>
              {email}
            </p>
            <p className="text-[12px] mb-6" style={{ color: '#6E6E73' }}>
              Cliquez sur le lien reçu pour activer votre compte, puis connectez-vous.
            </p>

            {error && (
              <div
                className="text-sm px-4 py-3 rounded-lg mb-4 text-left"
                style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}
              >
                {error}
              </div>
            )}

            <button
              onClick={handleResend}
              disabled={loading}
              className="text-sm font-semibold transition-colors disabled:opacity-50"
              style={{ color: '#0E2240' }}
            >
              {loading ? 'Envoi…' : 'Renvoyer l\'email de confirmation'}
            </button>

            <p className="text-[12px] mt-4" style={{ color: '#9E9E9E' }}>
              Adresse incorrecte ?{' '}
              <button
                onClick={() => { setAwaitingConfirm(false); setError('') }}
                className="font-semibold underline"
              >
                Corriger et recommencer
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0E2240' }}>
      <div className="w-full max-w-md mx-4">
        <div
          className="rounded-2xl p-10"
          style={{ backgroundColor: '#fff', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}
        >
          {/* Logo */}
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
                Créer votre compte
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Nom complet */}
            <div>
              <label className="block text-[12px] font-semibold mb-1.5" style={{ color: '#1C1C1E' }}>
                Nom complet
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Prénom Nom"
                className="w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
                style={{ border: '1px solid #DDD9D0', color: '#1C1C1E' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#0E2240'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14,34,64,0.07)' }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = '#DDD9D0'; e.currentTarget.style.boxShadow = 'none' }}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[12px] font-semibold mb-1.5" style={{ color: '#1C1C1E' }}>
                Email professionnel
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={`prenom@${ALLOWED_DOMAIN}`}
                className="w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
                style={{ border: '1px solid #DDD9D0', color: '#1C1C1E' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#0E2240'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14,34,64,0.07)' }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = '#DDD9D0'; e.currentTarget.style.boxShadow = 'none' }}
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-[12px] font-semibold mb-1.5" style={{ color: '#1C1C1E' }}>
                Mot de passe
              </label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8 caractères minimum"
                className="w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
                style={{ border: '1px solid #DDD9D0', color: '#1C1C1E' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#0E2240'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14,34,64,0.07)' }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = '#DDD9D0'; e.currentTarget.style.boxShadow = 'none' }}
              />
            </div>

            {/* Confirmation */}
            <div>
              <label className="block text-[12px] font-semibold mb-1.5" style={{ color: '#1C1C1E' }}>
                Confirmer le mot de passe
              </label>
              <PasswordInput
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
                style={{ border: '1px solid #DDD9D0', color: '#1C1C1E' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#0E2240'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14,34,64,0.07)' }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = '#DDD9D0'; e.currentTarget.style.boxShadow = 'none' }}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            {/* Erreur */}
            {error && (
              <div
                className="text-sm px-4 py-3 rounded-lg"
                style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}
              >
                {error}
              </div>
            )}

            {/* Bouton */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full rounded-lg px-4 py-3 text-sm font-semibold transition-all disabled:opacity-50 mt-2"
              style={{ backgroundColor: '#0E2240', color: '#fff' }}
              onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#162F56' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0E2240' }}
            >
              {loading ? 'Création du compte…' : 'Créer mon compte'}
            </button>
          </div>

          {/* Lien connexion */}
          <div className="mt-6 pt-5" style={{ borderTop: '1px solid #EDE9E1' }}>
            <p className="text-center text-sm" style={{ color: '#6E6E73' }}>
              Déjà un compte ?{' '}
              <a
                href="/login"
                className="font-semibold transition-colors"
                style={{ color: '#0E2240' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#C9943A' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#0E2240' }}
              >
                Se connecter
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
