'use client'

import { useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  stagedPhotos: File[]
  previews: string[]
  onAddPhotos: (files: File[]) => void
  onRemovePhoto: (index: number) => void
}

export default function BlocB({ stagedPhotos, previews, onAddPhotos, onRemovePhoto }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const MAX = 10
  const remaining = MAX - stagedPhotos.length

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const images = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (images.length > 0) onAddPhotos(images)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">

          {/* Zone drag-and-drop */}
          {remaining > 0 && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer
                         hover:border-foreground hover:bg-muted/40 transition-colors"
            >
              <p className="text-sm font-medium">
                Glissez vos photos ici ou cliquez pour sélectionner
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG, WEBP — max {MAX} photos ({remaining} restante{remaining > 1 ? 's' : ''})
              </p>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>
          )}

          {remaining === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              Maximum atteint ({MAX}/{MAX} photos)
            </p>
          )}

          {/* Grille de previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {previews.map((src, i) => (
                <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border">
                  <img
                    src={src}
                    alt={`Photo ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => onRemovePhoto(i)}
                    className="absolute top-1.5 right-1.5 bg-black/60 text-white
                               rounded-full w-6 h-6 text-xs flex items-center justify-center
                               opacity-0 group-hover:opacity-100 transition-opacity"
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

        </CardContent>
      </Card>
    </div>
  )
}