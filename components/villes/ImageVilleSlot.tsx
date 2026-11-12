'use client'

import { useRef, useState } from 'react'
import { ImagePlusIcon, Loader2Icon } from 'lucide-react'
import { estFichierImage } from '@/lib/utils/convertHeic'
import { preparerImageVille, type ImagePreparee } from '@/lib/supabase/villes'
import { tailleCarteVille } from '@/lib/pdf/common/mesuresVille'
import type { ImageVille } from '@/lib/data/villes'

// Emplacement « photo de bandeau » ou « carte des quartiers » d'une ville.
// Rien n'est envoyé ici : le choix est gardé jusqu'à « Enregistrer » (VilleForm),
// comme les photos d'un projet dans le wizard.

export interface EtatImage {
  existante: (ImageVille & { largeur?: number; hauteur?: number }) | null
  nouvelle: (ImagePreparee & { apercu: string }) | null
  retiree: boolean
}

export function etatImageInitial(existante: EtatImage['existante']): EtatImage {
  return { existante, nouvelle: null, retiree: false }
}

/** Image qui figurera sur la fiche une fois enregistrée (nouvelle, sinon existante non retirée). */
export function imageAffichee(etat: EtatImage): { url: string; largeur?: number; hauteur?: number } | null {
  if (etat.nouvelle) return { url: etat.nouvelle.apercu, largeur: etat.nouvelle.largeur, hauteur: etat.nouvelle.hauteur }
  if (etat.existante && !etat.retiree) return etat.existante
  return null
}

export function imageModifiee(etat: EtatImage): boolean {
  return !!etat.nouvelle || etat.retiree
}

interface Props {
  id: string
  label: string
  hint: string
  type: 'photo' | 'carte'
  etat: EtatImage
  onChange: (etat: EtatImage) => void
  /** Photo : proportions du bandeau sur la fiche, pour montrer le recadrage réel. */
  ratioBandeau?: number
  /** Carte : encart pleine largeur sur la fiche (ville sans « projets à venir »). */
  cartePleineLargeur?: boolean
}

export default function ImageVilleSlot({
  id, label, hint, type, etat, onChange, ratioBandeau, cartePleineLargeur = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preparation, setPreparation] = useState(false)
  const [survol, setSurvol] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  // Libère l'aperçu local d'un choix abandonné (pas d'effet de nettoyage : en
  // développement, le double montage de React révoquerait l'aperçu affiché)
  const oublierChoix = () => { if (etat.nouvelle) URL.revokeObjectURL(etat.nouvelle.apercu) }

  const choisir = async (file: File | undefined | null) => {
    if (!file) return
    if (!estFichierImage(file)) {
      setErreur('Ce fichier n\'est pas une image. Formats acceptés : JPG, PNG, WEBP ou HEIC.')
      return
    }
    setErreur(null)
    setPreparation(true)
    try {
      const image = await preparerImageVille(file)
      if (image.file.size > 5 * 1024 * 1024) {
        setErreur('Image trop lourde, même après réduction (5 Mo maximum). Essayez une version plus légère.')
        return
      }
      oublierChoix()
      onChange({ ...etat, nouvelle: { ...image, apercu: URL.createObjectURL(image.file) }, retiree: false })
    } catch {
      setErreur('Impossible de lire cette image. Essayez de l\'exporter en JPG.')
    } finally {
      setPreparation(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const affichee = imageAffichee(etat)
  const carteReduite = type === 'carte' && affichee?.largeur && affichee?.hauteur
    ? tailleCarteVille({ largeur: affichee.largeur, hauteur: affichee.hauteur }, cartePleineLargeur).reduite
    : false

  const fichier = (
    <input
      ref={inputRef}
      id={`${id}-fichier`}
      type="file"
      accept="image/*,.heic,.heif"
      className="sr-only"
      tabIndex={-1}
      aria-hidden="true"
      onChange={(e) => choisir(e.target.files?.[0])}
    />
  )

  return (
    <div className="space-y-2">
      <div>
        <p className="cs-field-label" id={`${id}-label`}>{label}</p>
        <p className="cs-hint mt-0.5" id={`${id}-hint`}>{hint}</p>
      </div>

      {affichee && !preparation ? (
        <div className="space-y-2.5">
          <div
            className="relative overflow-hidden rounded-xl border border-[var(--cs-line)]"
            style={type === 'photo'
              ? { aspectRatio: ratioBandeau ?? 2, backgroundColor: 'var(--cs-stone)' }
              : { backgroundColor: 'var(--cs-ivory)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- aperçu local (blob:) ou image publique Storage */}
            <img
              src={affichee.url}
              alt={type === 'photo' ? `Aperçu du bandeau : ${label}` : `Aperçu : ${label}`}
              className={type === 'photo'
                ? 'h-full w-full object-cover'
                : 'mx-auto block max-h-[260px] w-auto max-w-full object-contain p-3'}
            />
            {etat.nouvelle && (
              <span
                className="cs-pill absolute left-2.5 top-2.5"
                style={{ backgroundColor: 'var(--cs-gold-wash)', color: 'var(--cs-gold-deep)', boxShadow: '0 1px 2px rgba(14,34,64,.12)' }}
              >
                <i />
                À enregistrer
              </span>
            )}
          </div>

          {carteReduite && (
            <p className="cs-hint" style={{ color: 'var(--cs-gold-ink)' }}>
              Cette carte est plus haute que la place disponible sur la fiche : elle y sera affichée en plus petit, sans être coupée.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button type="button" className="cs-btn h-9 px-3 text-[12.5px]" onClick={() => inputRef.current?.click()}>
              {etat.nouvelle ? 'Choisir une autre image' : 'Remplacer'}
            </button>
            {etat.nouvelle ? (
              <button
                type="button"
                className="cs-btn h-9 px-3 text-[12.5px]"
                onClick={() => { oublierChoix(); onChange({ ...etat, nouvelle: null }) }}
              >
                Annuler ce choix
              </button>
            ) : (
              <button
                type="button"
                className="cs-btn cs-btn-danger h-9 px-3 text-[12.5px]"
                onClick={() => onChange({ ...etat, retiree: true })}
              >
                Retirer
              </button>
            )}
          </div>
          {fichier}
        </div>
      ) : (
        <div>
          <button
            type="button"
            aria-labelledby={`${id}-label`}
            aria-describedby={`${id}-hint`}
            disabled={preparation}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setSurvol(true) }}
            onDragLeave={() => setSurvol(false)}
            onDrop={(e) => { e.preventDefault(); setSurvol(false); choisir(e.dataTransfer.files?.[0]) }}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed px-6 py-7 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cs-navy)] disabled:cursor-progress"
            style={{
              minHeight: type === 'photo' ? 150 : 170,
              borderColor: survol ? 'var(--cs-navy)' : '#D3CDC1',
              backgroundColor: survol ? 'var(--cs-ivory)' : '#fff',
            }}
          >
            {preparation ? (
              <>
                <Loader2Icon size={20} className="animate-spin text-[var(--cs-mist)] motion-reduce:animate-none" aria-hidden="true" />
                <span className="text-[13px] font-semibold text-[var(--cs-navy)]">Préparation de l’image…</span>
              </>
            ) : (
              <>
                <span className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--cs-stone)' }}>
                  <ImagePlusIcon size={18} strokeWidth={1.8} className="text-[var(--cs-navy)]" aria-hidden="true" />
                </span>
                <span className="text-[13px] font-semibold text-[var(--cs-navy)]">
                  Déposez une image ou <span className="underline decoration-[var(--cs-gold)] underline-offset-[3px]">parcourez vos fichiers</span>
                </span>
                <span className="cs-hint">JPG, PNG, WEBP ou HEIC</span>
              </>
            )}
          </button>
          {etat.retiree && etat.existante && (
            <p className="cs-hint mt-2">
              L’image actuelle sera retirée à l’enregistrement.{' '}
              <button type="button" className="cs-link text-[11.5px]" onClick={() => onChange({ ...etat, retiree: false })}>
                La garder
              </button>
            </p>
          )}
          {fichier}
        </div>
      )}

      {erreur && <p className="text-[11.5px] font-medium" style={{ color: 'var(--cs-neg)' }} role="alert">{erreur}</p>}
    </div>
  )
}
