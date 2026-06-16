'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const ALLOWED_DOMAIN = 'capsul-france.com'

export default function InscriptionPage() {
  const [fullName, setFullName]   = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
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
        options: { data: { full_name: fullName } },
      })

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('Un compte existe déjà avec cet email.')
        } else if (signUpError.message.includes('sending') || signUpError.message.includes('email')) {
          setError('Erreur d\'envoi d\'email. Demandez à l\'admin de désactiver "Confirm email" dans Supabase → Authentication → Providers → Email.')
        } else {
          setError(signUpError.message)
        }
        return
      }

      // Insérer dans la table users avec rôle chargé
      if (data.user) {
        await supabase.from('users').upsert({
          id: data.user.id,
          email,
          full_name: fullName,
          role: 'charge',
        })
      }

      router.push('/projets')
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
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
              <input
                type="password"
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
              <input
                type="password"
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
