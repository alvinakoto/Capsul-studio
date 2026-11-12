'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeftIcon } from 'lucide-react'
import FormulaireVille from '@/components/villes/FormulaireVille'

export default function NouvelleVillePage() {
  const router = useRouter()

  return (
    <div className="max-w-[880px] mx-auto px-4 md:px-10 pt-8">
      <Link href="/villes" className="cs-crumb mb-4">
        <ChevronLeftIcon size={14} strokeWidth={2} aria-hidden="true" />
        Villes
      </Link>
      <h1 className="cs-h1">Nouvelle ville</h1>
      <p className="text-[13.5px] mt-1 mb-7 max-w-[62ch]" style={{ color: 'var(--cs-mist)' }}>
        Seul le nom est obligatoire. La fiche peut être complétée plus tard, par vous ou par un autre chargé.
      </p>
      <FormulaireVille
        ville={null}
        variante="page"
        onEnregistree={(v) => router.replace(`/villes/${v.id}?ajoutee=1`)}
      />
    </div>
  )
}
