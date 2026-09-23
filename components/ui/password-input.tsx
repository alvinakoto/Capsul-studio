'use client'

import { useState, forwardRef } from 'react'

/**
 * Input mot de passe avec bouton afficher/masquer. Générique (pas de style
 * imposé) pour s'insérer dans les pages login/inscription qui ont chacune
 * leurs propres conventions de style (Tailwind vs inline styles + focus).
 */
export const PasswordInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function PasswordInput({ className, style, ...props }, ref) {
    const [visible, setVisible] = useState(false)

    return (
      <div style={{ position: 'relative' }}>
        <input
          {...props}
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={className}
          style={{ ...style, paddingRight: 40 }}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
          aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            padding: 2,
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            color: '#9E9E9E',
          }}
        >
          {visible ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 3l18 18M10.58 10.58a2 2 0 002.83 2.83M9.88 4.24A9.77 9.77 0 0112 4c5 0 9 4 10 8-.31 1.16-.85 2.28-1.6 3.29M6.1 6.1C4.13 7.36 2.66 9.28 2 12c1 4 5 8 10 8 1.55 0 3.02-.34 4.32-.94"
                stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          )}
        </button>
      </div>
    )
  }
)
