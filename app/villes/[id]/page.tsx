'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { CheckIcon, ChevronLeftIcon, Trash2Icon } from 'lucide-react'
import FormulaireVille from '@/components/villes/FormulaireVille'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { compterProjetsVille, supprimerVille, trouverVille } from '@/lib/supabase/villes'
import { estAdministrateur } from '@/lib/supabase/charge'
import type { Ville } from '@/lib/data/villes'

export default function VillePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [ville, setVille] = useState<Ville | null>(null)
  const [chargement, setChargement] = useState(true)
  const [introuvable, setIntrouvable] = useState(false)
  const [admin, setAdmin] = useState(false)
  // Arrivée depuis « Nouvelle ville » (?ajoutee=1) : message de confirmation. Lu une
  // seule fois au montage ; le rendu serveur affiche de toute façon le squelette.
  const [ajoutee] = useState(() => typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('ajoutee'))

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    trouverVille(id)
      .then((v) => (v ? setVille(v) : setIntrouvable(true)))
      .catch(() => setIntrouvable(true))
      .finally(() => setChargement(false))
    estAdministrateur(supabase).then(setAdmin).catch(() => setAdmin(false))
  }, [id])

  // URL nettoyée pour qu'un rechargement n'affiche pas de nouveau la confirmation
  useEffect(() => {
    if (ajoutee) window.history.replaceState(null, '', `/villes/${id}`)
  }, [ajoutee, id])

  if (chargement) return (
    <div className="max-w-[880px] mx-auto px-4 md:px-10 py-8 space-y-4">
      {[64, 360, 280].map((h, i) => (
        <div key={i} className="rounded-xl animate-pulse" style={{ height: h, backgroundColor: 'var(--cs-stone)' }} />
      ))}
    </div>
  )

  if (introuvable || !ville) return (
    <div className="max-w-[880px] mx-auto px-4 md:px-10 py-16 text-center">
      <p className="cs-h3">Ville introuvable</p>
      <p className="cs-sub mt-1 mb-5">Elle a peut-être été supprimée du catalogue.</p>
      <Link href="/villes" className="cs-btn">Retour aux villes</Link>
    </div>
  )

  const modifiee = new Date(ville.modifieeLe).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="max-w-[880px] mx-auto px-4 md:px-10 pt-8">
      <Link href="/villes" className="cs-crumb mb-4">
        <ChevronLeftIcon size={14} strokeWidth={2} aria-hidden="true" />
        Villes
      </Link>

      <div className="flex items-end justify-between gap-5 flex-wrap">
        <div className="min-w-0">
          <h1 className="cs-h1 [overflow-wrap:anywhere]">{ville.nom}</h1>
          <p className="text-[13.5px] mt-1" style={{ color: 'var(--cs-mist)' }}>
            Modifiée le {modifiee}{ville.modifieePar ? ` par ${ville.modifieePar}` : ''}
          </p>
        </div>
        {admin && <SuppressionVille ville={ville} onSupprimee={() => router.push('/villes')} />}
      </div>

      {ajoutee && (
        <p role="status" className="mt-5 flex items-center gap-2 rounded-xl border px-4 py-3 text-[13px] font-semibold" style={{ backgroundColor: 'var(--cs-pos-wash)', borderColor: '#C7E1D3', color: 'var(--cs-pos)' }}>
          <CheckIcon size={16} strokeWidth={2.4} aria-hidden="true" />
          {ville.nom} est ajoutée au catalogue : elle apparaît maintenant dans le choix de ville des projets.
        </p>
      )}

      <p className="mt-5 mb-7 max-w-[70ch] text-[12.5px] leading-relaxed" style={{ color: 'var(--cs-mist)' }}>
        Les chiffres et l’accroche sont copiés dans chaque nouveau projet, qui peut les ajuster pour son dossier.
        La photo, la carte et les encarts « Où investir » s’appliquent à tous les projets de la ville, dès le prochain téléchargement de leur fiche.
      </p>

      <FormulaireVille ville={ville} variante="page" onEnregistree={setVille} />
    </div>
  )
}

function SuppressionVille({ ville, onSupprimee }: { ville: Ville; onSupprimee: () => void }) {
  const [ouverte, setOuverte] = useState(false)
  const [nbProjets, setNbProjets] = useState<number | null>(null)
  const [suppression, setSuppression] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  const ouvrir = (o: boolean) => {
    setOuverte(o)
    setErreur(null)
    if (o) {
      setNbProjets(null)
      compterProjetsVille(ville.id).then(setNbProjets).catch(() => setNbProjets(null))
    }
  }

  const supprimer = async () => {
    setSuppression(true)
    setErreur(null)
    try {
      await supprimerVille(ville)
      onSupprimee()
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Suppression impossible.')
      setSuppression(false)
    }
  }

  const utilisee = nbProjets !== null && nbProjets > 0

  return (
    <Dialog open={ouverte} onOpenChange={ouvrir}>
      <DialogTrigger asChild>
        <button type="button" className="cs-btn cs-btn-danger h-10 px-4">
          <Trash2Icon size={15} strokeWidth={2} aria-hidden="true" />
          Supprimer
        </button>
      </DialogTrigger>
      <DialogContent titre={`Supprimer ${ville.nom} ?`} className="max-w-[460px]">
        <div className="space-y-3 px-6 py-5 text-[13.5px] leading-relaxed" style={{ color: 'var(--cs-ink)' }}>
          {nbProjets === null ? (
            <p style={{ color: 'var(--cs-mist)' }}>Vérification des projets rattachés…</p>
          ) : utilisee ? (
            <p>
              {nbProjets} projet{nbProjets > 1 ? 's utilisent' : ' utilise'} cette ville : elle ne peut pas être supprimée.
              Corrigez plutôt sa fiche.
            </p>
          ) : (
            <p>
              La ville, sa photo et sa carte seront définitivement retirées du catalogue. Aucun projet ne l’utilise.
            </p>
          )}
          {erreur && <p role="alert" className="font-semibold" style={{ color: 'var(--cs-neg)' }}>{erreur}</p>}
        </div>
        <div className="flex justify-end gap-2 border-t border-[var(--cs-line-soft)] px-6 py-3.5" style={{ backgroundColor: '#FBFAF7' }}>
          <button type="button" className="cs-btn h-10 px-4" onClick={() => ouvrir(false)} disabled={suppression}>
            {utilisee ? 'Fermer' : 'Annuler'}
          </button>
          {!utilisee && (
            <button
              type="button"
              className="cs-btn cs-btn-danger-plein h-10 px-4"
              onClick={supprimer}
              disabled={suppression || nbProjets === null}
            >
              {suppression ? 'Suppression…' : 'Supprimer définitivement'}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
