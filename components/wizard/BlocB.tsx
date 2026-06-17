'use client'

import { useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ensureJpeg, isHeicFile } from '@/lib/utils/convertHeic'

export type PhotoType = 'cover' | 'main' | 'secondary'

export interface StagedPhoto {
  file: File
  preview: string
  type: PhotoType
  legende: string
}

interface Props {
  coverPhoto: StagedPhoto | null
  mainPhoto: StagedPhoto | null
  secondaryPhotos: StagedPhoto[]
  onSetCover: (file: File | null) => void
  onSetMain: (file: File | null) => void
  onAddSecondary: (files: File[]) => void
  onRemoveSecondary: (index: number) => void
  onUpdateLegende: (target: 'main', legende: string) => void
}

const MAX_SECONDARY = 6

export default function BlocB({
  coverPhoto, mainPhoto, secondaryPhotos,
  onSetCover, onSetMain, onAddSecondary, onRemoveSecondary, onUpdateLegende,
}: Props) {
  return (
    <div className="space-y-6">

      {/* Photo de couverture */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Photo de couverture</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Image d'ambiance affichée en page 1 du dossier client.
          </p>
        </CardHeader>
        <CardContent>
          <SinglePhotoSlot
            photo={coverPhoto}
            onSet={onSetCover}
            placeholder="Glissez la photo de couverture ici"
          />
        </CardContent>
      </Card>

      {/* Photo principale intérieure */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Photo principale intérieure</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Grande photo affichée en haut de la page 2 du dossier.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <SinglePhotoSlot
            photo={mainPhoto}
            onSet={onSetMain}
            placeholder="Glissez la photo principale ici"
          />
          {mainPhoto && (
            <div className="space-y-1.5">
              <Label htmlFor="legende-main">Légende (optionnelle)</Label>
              <Input
                id="legende-main"
                placeholder="Ex : Salon principal · Exposition Sud-Est"
                value={mainPhoto.legende}
                onChange={(e) => onUpdateLegende('main', e.target.value)}
                maxLength={80}
              />
              <p className="text-[11px] text-muted-foreground">
                Apparaît en bas à gauche de la photo dans le dossier.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photos supplémentaires */}
      <Card>
        <CardHeader>
          <div className="flex items-baseline justify-between">
            <CardTitle className="text-base">Photos supplémentaires</CardTitle>
            <span className="text-xs text-muted-foreground tabular-nums">
              {secondaryPhotos.length} / {MAX_SECONDARY}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Vignettes affichées dans la grille du dossier.
          </p>
        </CardHeader>
        <CardContent>
          <MultiPhotoSlot
            photos={secondaryPhotos}
            max={MAX_SECONDARY}
            onAdd={onAddSecondary}
            onRemove={onRemoveSecondary}
          />
        </CardContent>
      </Card>

    </div>
  )
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

function SinglePhotoSlot({
  photo, onSet, placeholder,
}: {
  photo: StagedPhoto | null
  onSet: (file: File | null) => void
  placeholder: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [converting, setConverting] = useState(false)
  const [convertError, setConvertError] = useState<string | null>(null)

  const handleFile = async (file: File | undefined | null) => {
    if (!file) return
    const isImage = file.type.startsWith('image/') || isHeicFile(file) ||
      /\.(jpg|jpeg|png|gif|webp|heic|heif)$/i.test(file.name)
    if (!isImage) return
    setConverting(true)
    setConvertError(null)
    try {
      const jpeg = await ensureJpeg(file)
      onSet(jpeg)
    } catch {
      setConvertError('Impossible de lire cette photo. Essayez de l\'exporter en JPG depuis Photos.')
    } finally {
      setConverting(false)
    }
  }

  if (photo) {
    return (
      <div className="relative group rounded-xl overflow-hidden border aspect-[16/9] max-w-xl">
        <img src={photo.preview} alt="" className="w-full h-full object-cover" />
        <button
          type="button"
          onClick={() => onSet(null)}
          className="absolute top-2 right-2 bg-black/70 text-white
                     rounded-full w-7 h-7 text-xs flex items-center justify-center
                     hover:bg-black/90 transition"
          aria-label="Supprimer"
        >
          ✕
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-2 right-2 bg-black/70 text-white text-xs
                     px-2.5 py-1 rounded-md hover:bg-black/90 transition"
        >
          Remplacer
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.heic,.heif"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    )
  }

  if (converting) {
    return (
      <div className="border-2 border-dashed rounded-xl p-8 text-center max-w-xl aspect-[16/9] flex flex-col items-center justify-center gap-2 bg-muted/20">
        <div className="w-5 h-5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Conversion en cours…</p>
      </div>
    )
  }

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        handleFile(e.dataTransfer.files?.[0])
      }}
      onClick={() => inputRef.current?.click()}
      className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                 hover:border-foreground hover:bg-muted/40 transition-colors
                 max-w-xl aspect-[16/9] flex flex-col items-center justify-center"
    >
      <p className="text-sm font-medium">{placeholder}</p>
      <p className="text-xs text-muted-foreground mt-1">
        JPG, PNG, WEBP, HEIC — ou cliquez pour parcourir
      </p>
      {convertError && (
        <p className="text-xs text-red-500 mt-2 max-w-xs">{convertError}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  )
}

function MultiPhotoSlot({
  photos, max, onAdd, onRemove,
}: {
  photos: StagedPhoto[]
  max: number
  onAdd: (files: File[]) => void
  onRemove: (index: number) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [converting, setConverting] = useState(false)
  const [convertError, setConvertError] = useState<string | null>(null)
  const remaining = max - photos.length

  const handleFiles = async (files: FileList | null) => {
    if (!files) return
    const candidates = Array.from(files).filter(
      (f) => f.type.startsWith('image/') || isHeicFile(f) ||
        /\.(jpg|jpeg|png|gif|webp|heic|heif)$/i.test(f.name)
    )
    if (candidates.length === 0) return
    setConverting(true)
    setConvertError(null)
    try {
      const converted = await Promise.all(candidates.map(ensureJpeg))
      onAdd(converted)
    } catch {
      setConvertError('Une ou plusieurs photos n\'ont pas pu être converties.')
    } finally {
      setConverting(false)
    }
  }

  return (
    <div className="space-y-4">

      {remaining > 0 && (
        converting ? (
          <div className="border-2 border-dashed rounded-xl py-6 text-center flex flex-col items-center gap-2 bg-muted/20">
            <div className="w-5 h-5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Conversion HEIC en cours…</p>
          </div>
        ) : (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              handleFiles(e.dataTransfer.files)
            }}
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed rounded-xl py-6 text-center cursor-pointer
                       hover:border-foreground hover:bg-muted/40 transition-colors"
          >
            <p className="text-sm font-medium">
              Glissez vos photos ici ou cliquez pour sélectionner
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {remaining} emplacement{remaining > 1 ? 's' : ''} restant{remaining > 1 ? 's' : ''} · JPG, PNG, HEIC acceptés
            </p>
            {convertError && (
              <p className="text-xs text-red-500 mt-2">{convertError}</p>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*,.heic,.heif"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>
        )
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((p, i) => (
            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border">
              <img src={p.preview} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute top-1.5 right-1.5 bg-black/60 text-white
                           rounded-full w-6 h-6 text-xs flex items-center justify-center
                           opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Supprimer"
              >
                ✕
              </button>
              <span className="absolute bottom-1.5 left-1.5 bg-black/50 text-white
                               text-[10px] rounded px-1.5 py-0.5">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}