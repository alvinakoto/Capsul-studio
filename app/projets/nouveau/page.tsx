'use client'

import WizardShell from '@/components/wizard/WizardShell'
import { useRouter } from 'next/navigation'

export default function NouveauProjetPage() {
  const router = useRouter()
  return (
    <div className="max-w-[1180px] mx-auto px-4 md:px-10 py-8">
      <div className="mb-8">
        <button onClick={() => router.push('/projets')} className="cs-crumb mb-4">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
          Projets
        </button>
        <p className="cs-eyebrow">Nouvelle analyse</p>
        <h1 className="cs-h1 mt-1.5">Nouveau projet</h1>
        <p className="text-[13.5px] mt-1" style={{ color: 'var(--cs-mist)' }}>
          Renseignez les informations du bien. Les montants marqués « Estimation » apparaissent comme tels sur la fiche client.
        </p>
      </div>
      <WizardShell />
    </div>
  )
}
