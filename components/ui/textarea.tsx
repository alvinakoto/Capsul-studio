'use client'

import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps extends React.ComponentProps<"textarea"> {
  minRows?: number
}

/**
 * Textarea qui grandit avec son contenu (jusqu'à ce que le texte tienne
 * entier) plutôt que de le faire défiler dans une boîte de hauteur fixe.
 */
function Textarea({ className, minRows = 3, value, onInput, ...props }: TextareaProps) {
  const ref = React.useRef<HTMLTextAreaElement>(null)

  const resize = React.useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [])

  React.useEffect(() => {
    resize()
  }, [value, resize])

  return (
    <textarea
      ref={ref}
      rows={minRows}
      data-slot="textarea"
      value={value}
      onInput={(e) => {
        resize()
        onInput?.(e)
      }}
      className={cn(
        "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
        "ring-offset-background placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "resize-none overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
