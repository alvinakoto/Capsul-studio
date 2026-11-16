'use client'

import { Dialog as DialogPrimitive } from 'radix-ui'
import { ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, XIcon } from 'lucide-react'
import RecapSticky, { syntheseRecap } from './RecapSticky'
import { alerteApportDepuisSaisie } from './calculsSaisie'
import type { WizardState } from './WizardShell'
import { euros } from '@/lib/utils/format'

// Barre du bas du wizard sous 1 280 px (le récap n'a plus de colonne à côté du
// formulaire) : étape précédente, prix projet total (un appui ouvre le récap
// complet) et action principale, à portée du pouce. Se pose au-dessus de la
// barre d'onglets, ou du clavier pendant la saisie.
// En modification, l'action principale est « Enregistrer » et la barre n'a pas de
// bouton précédent : un retour sans « suivant » à côté laissait croire qu'on ne
// pouvait pas avancer. Les étapes voisines sont proposées en fin d'étape.

export interface ActionWizard {
  label: string
  /** Libellé long, à partir de 640 px (« Suivant : Photos ») */
  labelLong?: string
  onClick: () => void
  variante: 'suivant' | 'enregistrer'
  disabled?: boolean
}

export default function BarreWizardMobile({ state, onPrecedent, avecPrecedent = true, action }: {
  state: WizardState
  onPrecedent: (() => void) | null
  avecPrecedent?: boolean
  action: ActionWizard
}) {
  const { prixAchat, prixProjet, mensualiteTotale, comptant } = syntheseRecap(state)
  const alerte = alerteApportDepuisSaisie(state)

  return (
    <div
      className="fixed right-0 z-30 border-t bg-white xl:hidden"
      style={{
        left: 'var(--cs-sidebar)',
        bottom: 'calc(var(--cs-nav-bas) + var(--cs-clavier, 0px))',
        borderColor: 'var(--cs-line)',
        boxShadow: '0 -8px 24px -18px rgba(14,34,64,.35)',
      }}
    >
      <div className="mx-auto flex max-w-[880px] items-center gap-2 px-3 py-2 md:px-10">
        {avecPrecedent && (
          <button
            type="button"
            onClick={onPrecedent ?? undefined}
            disabled={!onPrecedent}
            className="cs-btn cs-btn-icon h-11 w-11 shrink-0"
            aria-label="Étape précédente"
          >
            <ChevronLeftIcon size={20} strokeWidth={2.2} aria-hidden="true" />
          </button>
        )}

        <DialogPrimitive.Root>
          <DialogPrimitive.Trigger
            className="flex min-h-11 min-w-0 flex-1 items-center gap-1.5 rounded-[9px] px-2 py-1 text-left transition-colors active:bg-[var(--cs-ivory)] focus-visible:outline-2 focus-visible:outline-[var(--cs-navy)]"
            aria-label="Voir le récapitulatif du projet"
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[10.5px] font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--cs-mist)' }}>
                Prix projet total
              </span>
              {prixAchat > 0 ? (
                <span className="block truncate tabular-nums">
                  <span className="text-[17px] font-extrabold" style={{ color: 'var(--cs-gold-ink)' }}>{euros(prixProjet)}</span>
                  {/* Sous 400 px, place comptée : pastille seule pour l'alerte, pas de mensualité
                      (les deux sont détaillées dans le récap) */}
                  {alerte ? (
                    <>
                      <span className="ml-1.5 inline-block h-2 w-2 rounded-full align-middle min-[400px]:hidden" style={{ backgroundColor: 'var(--cs-neg)' }} aria-hidden="true" />
                      <span className="sr-only min-[400px]:not-sr-only min-[400px]:ml-1.5 text-[11px] font-semibold" style={{ color: 'var(--cs-neg)' }}>apport insuffisant</span>
                    </>
                  ) : mensualiteTotale && !comptant ? (
                    <span className="hidden min-[400px]:inline ml-1.5 text-[11px] font-medium" style={{ color: 'var(--cs-mist)' }}>{`${euros(mensualiteTotale)}/mois`}</span>
                  ) : null}
                </span>
              ) : (
                <span className="block truncate text-[12.5px] font-medium" style={{ color: 'var(--cs-mist)' }}>Après l’étape Finances</span>
              )}
            </span>
            <ChevronUpIcon size={16} strokeWidth={2.2} className="shrink-0 text-[var(--cs-mist)]" aria-hidden="true" />
          </DialogPrimitive.Trigger>

          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[rgba(14,34,64,0.45)] duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
            <DialogPrimitive.Content
              className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[88dvh] max-w-[560px] overflow-y-auto rounded-t-[18px] duration-250 ease-out data-open:animate-in data-open:slide-in-from-bottom data-closed:animate-out data-closed:slide-out-to-bottom data-closed:duration-200 motion-reduce:animate-none"
              style={{ backgroundColor: 'var(--cs-navy)', paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              <DialogPrimitive.Title className="sr-only">Récapitulatif du projet</DialogPrimitive.Title>
              <DialogPrimitive.Description className="sr-only">Prix projet total, financement et mensualité estimés à partir de la saisie.</DialogPrimitive.Description>
              <div className="relative">
                <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-white/25" aria-hidden="true" />
                <DialogPrimitive.Close
                  className="absolute right-2 top-1.5 flex h-11 w-11 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-[var(--cs-gold)]"
                  aria-label="Fermer"
                >
                  <XIcon size={20} strokeWidth={2} aria-hidden="true" />
                </DialogPrimitive.Close>
              </div>
              <RecapSticky state={state} className="!shadow-none !rounded-none !pt-3" />
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>

        <button
          type="button"
          onClick={action.onClick}
          disabled={action.disabled}
          className={`cs-btn h-11 shrink-0 px-4 ${action.variante === 'enregistrer' ? 'cs-btn-gold' : 'cs-btn-primary'}`}
        >
          <span className={action.labelLong ? 'sm:hidden' : undefined}>{action.label}</span>
          {action.labelLong && <span className="hidden sm:inline">{action.labelLong}</span>}
          {action.variante === 'suivant' && <ChevronRightIcon size={17} strokeWidth={2.2} aria-hidden="true" />}
        </button>
      </div>
    </div>
  )
}
