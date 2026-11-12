'use client'

import * as React from 'react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { XIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

// Fenêtre modale à la charte : focus piégé, Échap et clic extérieur ferment
// (comportements Radix), titre et description reliés pour les lecteurs d'écran.

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogClose = DialogPrimitive.Close

function DialogContent({
  titre,
  description,
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  titre: string
  description?: React.ReactNode
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className="fixed inset-0 z-50 bg-[rgba(14,34,64,0.45)] duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
      />
      <DialogPrimitive.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-48px)] w-[calc(100vw-32px)] max-w-[560px] -translate-x-1/2 -translate-y-1/2 flex-col',
          'overflow-hidden rounded-[16px] border border-[var(--cs-line)] bg-white shadow-[0_2px_6px_rgba(14,34,64,.06),0_28px_64px_-24px_rgba(14,34,64,.45)]',
          'duration-200 ease-out data-open:animate-in data-open:fade-in-0 data-open:zoom-in-[0.97] data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-[0.97] motion-reduce:animate-none',
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--cs-line-soft)] px-6 pt-5 pb-4">
          <div className="min-w-0">
            <DialogPrimitive.Title className="cs-h2">{titre}</DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="cs-sub mt-1">{description}</DialogPrimitive.Description>
            ) : (
              <DialogPrimitive.Description className="sr-only">{titre}</DialogPrimitive.Description>
            )}
          </div>
          <DialogPrimitive.Close
            className="-mr-2 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--cs-mist)] transition-colors hover:bg-[var(--cs-ivory)] hover:text-[var(--cs-navy)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cs-navy)]"
            aria-label="Fermer"
          >
            <XIcon size={18} strokeWidth={2} aria-hidden="true" />
          </DialogPrimitive.Close>
        </div>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export { Dialog, DialogTrigger, DialogClose, DialogContent }
