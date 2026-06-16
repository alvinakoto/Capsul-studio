'use client'

import WizardShell from '@/components/wizard/WizardShell'
import { useRouter } from 'next/navigation'

export default function NouveauProjetPage() {
  const router = useRouter()
  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/projets')}
          className="flex items-center gap-1.5 text-[11px] font-medium mb-4 transition-colors"
          style={{ color: '#6E6E73' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#0E2240' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#6E6E73' }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Projets
        </button>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-1" style={{ color: '#C9943A' }}>
          Nouvelle analyse
        </p>
        <h1 className="text-[26px] font-bold tracking-tight" style={{ color: '#0E2240' }}>
          Nouveau projet
        </h1>
        <p className="text-sm mt-1" style={{ color: '#6E6E73' }}>
          Renseignez les informations du bien pour générer votre analyse.
        </p>
      </div>
      <WizardShell />
    </div>
  )
}
