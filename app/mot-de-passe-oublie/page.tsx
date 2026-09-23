'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { translateAuthError } from '@/lib/supabase/authErrors'

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
      <div className="min-h-screen bg-[#16314E] flex items-center justify-center">
        <div className="bg-white rounded-2xl p-10 w-full max-w-md shadow-2xl text-center">
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
          <p className="text-sm mb-6" style={{ color: '#6E6E73' }}>
            Si un compte existe avec l'adresse <span className="font-semibold" style={{ color: '#1C1C1E' }}>{email}</span>,
            {' '}un lien de réinitialisation vient d'être envoyé.
          </p>
          <a href="/login" className="text-sm font-semibold" style={{ color: '#0E2240' }}>
            Retour à la connexion
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
              Mot de passe oublié
            </div>
          </div>
        </div>

        <p className="text-sm mb-5" style={{ color: '#6E6E73' }}>
          Indiquez votre adresse email, on vous envoie un lien pour réinitialiser votre mot de passe.
        </p>

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
            {loading ? 'Envoi…' : 'Envoyer le lien'}
          </button>
        </div>

        <div className="mt-6 pt-5 border-t border-gray-100">
          <p className="text-center text-sm text-gray-500">
            <a href="/login" className="font-semibold text-[#16314E] hover:text-[#e6b64c] transition-colors">
              ← Retour à la connexion
            </a>
          </p>
        </div>

      </div>
    </div>
  )
}
