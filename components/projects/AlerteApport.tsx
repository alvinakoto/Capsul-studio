import { euros } from '@/lib/utils/format'

/**
 * Avertit le chargé quand l'apport ne couvre pas les frais que la banque ne
 * finance pas (notaire, honoraires Capsul, ameublement, autres frais).
 * Simple avertissement : l'enregistrement n'est jamais bloqué.
 */
export default function AlerteApport({ alerte, sombre = false, className = '' }: {
  alerte: { minimum: number; manque: number } | null
  /** Variante pour fond navy (récap du wizard) */
  sombre?: boolean
  className?: string
}) {
  if (!alerte) return null

  return (
    <div
      role="status"
      className={`flex items-start gap-2.5 rounded-[10px] px-3.5 py-3 text-[12.5px] leading-relaxed ${className}`}
      style={sombre
        ? { backgroundColor: 'rgba(201,148,58,.14)', border: '1px solid rgba(201,148,58,.35)', color: '#F3DDB5' }
        : { backgroundColor: '#FBF3E2', border: '1px solid #EBD7AE', color: '#8A5A12' }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5" aria-hidden="true">
        <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>
      </svg>
      <p>
        <b className="font-semibold">Apport insuffisant : il manque {euros(alerte.manque)}.</b>{' '}
        La banque ne finance que le prix d’achat et les travaux. L’apport doit couvrir au moins
        les frais de notaire, les honoraires et l’ameublement, soit {euros(alerte.minimum)}.
      </p>
    </div>
  )
}
