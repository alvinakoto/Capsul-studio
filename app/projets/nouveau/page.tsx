'use client'

import WizardShell from '@/components/wizard/WizardShell'

export default function NouveauProjetPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Nouveau projet</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Renseignez les informations du bien pour générer votre analyse.
        </p>
      </div>
      <WizardShell />
    </div>
  )
}