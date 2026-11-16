'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { LogOutIcon, PlusIcon, UserRoundIcon, XIcon, type LucideIcon } from 'lucide-react'
import { NAV, NOUVEAU_PROJET, estActif, useUtilisateur } from './navigation'

// Barre d'onglets du bas, à la place de la barre latérale sous 1 024 px :
// à portée du pouce, icône + libellé, au-dessus de la barre d'accueil de l'iPhone.
// Hauteur (hors zone sûre) : --cs-nav-bas-h, dans globals.css.

const ONGLET =
  'relative flex min-h-[var(--cs-nav-bas-h)] flex-1 flex-col items-center justify-center gap-1 ' +
  'text-[11px] font-semibold tracking-[0.01em] transition-colors duration-150 ' +
  'focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[var(--cs-gold)] ' +
  'active:bg-white/[0.06]'

/** Même hauteur pour toutes les icônes (dont la pastille « Nouveau ») : libellés alignés. */
function ZoneIcone({ children }: { children: React.ReactNode }) {
  return <span className="flex h-[30px] items-center justify-center">{children}</span>
}

function Onglet({ href, label, Icone, actif }: { href: string; label: string; Icone: LucideIcon; actif: boolean }) {
  return (
    <Link
      href={href}
      aria-current={actif ? 'page' : undefined}
      className={`${ONGLET} ${actif ? 'text-[#E6B64C]' : 'text-[rgba(247,245,241,0.72)]'}`}
    >
      {/* Repère de l'onglet actif, en plus de la couleur */}
      {actif && <span className="absolute top-0 h-[3px] w-8 rounded-b-full bg-[var(--cs-gold)]" aria-hidden="true" />}
      <ZoneIcone><Icone size={22} strokeWidth={actif ? 2.2 : 1.8} aria-hidden="true" /></ZoneIcone>
      {label}
    </Link>
  )
}

export default function BarreNavigationMobile() {
  const pathname = usePathname()
  const { nom, role, deconnecter } = useUtilisateur()
  const nouveauActif = estActif(pathname, NOUVEAU_PROJET)

  return (
    <nav
      aria-label="Navigation principale"
      className="cs-nav-mobile fixed inset-x-0 bottom-0 z-40 border-t border-white/10 lg:hidden"
      style={{
        backgroundColor: 'var(--cs-navy)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      <div className="mx-auto flex max-w-[560px] items-stretch">
        <Onglet {...NAV[0]} actif={estActif(pathname, NAV[0].href)} />

        {/* Action principale de l'app, mise en avant en or comme dans la barre latérale */}
        <Link
          href={NOUVEAU_PROJET}
          aria-current={nouveauActif ? 'page' : undefined}
          className={`${ONGLET} ${nouveauActif ? 'text-[#E6B64C]' : 'text-[rgba(247,245,241,0.72)]'}`}
        >
          <span
            className="flex h-[30px] w-[46px] items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--cs-gold)', color: 'var(--cs-navy)' }}
            aria-hidden="true"
          >
            <PlusIcon size={20} strokeWidth={2.6} />
          </span>
          Nouveau
        </Link>

        {NAV.slice(1).map((item) => (
          <Onglet key={item.href} {...item} actif={estActif(pathname, item.href)} />
        ))}

        <DialogPrimitive.Root>
          <DialogPrimitive.Trigger className={`${ONGLET} text-[rgba(247,245,241,0.72)]`}>
            <ZoneIcone><UserRoundIcon size={22} strokeWidth={1.8} aria-hidden="true" /></ZoneIcone>
            Compte
          </DialogPrimitive.Trigger>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[rgba(14,34,64,0.45)] duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
            <DialogPrimitive.Content
              className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[560px] rounded-t-[18px] bg-white px-5 pt-3 shadow-[0_-12px_40px_-16px_rgba(14,34,64,.45)] duration-250 ease-out data-open:animate-in data-open:slide-in-from-bottom data-closed:animate-out data-closed:slide-out-to-bottom data-closed:duration-200 motion-reduce:animate-none"
              style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[var(--cs-line)]" aria-hidden="true" />
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img src="/logo-capsul.jpg" alt="" className="h-9 w-9 shrink-0 rounded-md object-cover" />
                  <div>
                    <DialogPrimitive.Title className="text-[13px] font-bold leading-tight tracking-wide text-[var(--cs-navy)]">
                      CAPSUL STUDIO
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Description className="cs-hint">Mon compte</DialogPrimitive.Description>
                  </div>
                </div>
                <DialogPrimitive.Close
                  className="-mr-2 flex h-11 w-11 items-center justify-center rounded-lg text-[var(--cs-mist)] transition-colors hover:bg-[var(--cs-ivory)] hover:text-[var(--cs-navy)] focus-visible:outline-2 focus-visible:outline-[var(--cs-navy)]"
                  aria-label="Fermer"
                >
                  <XIcon size={20} strokeWidth={2} aria-hidden="true" />
                </DialogPrimitive.Close>
              </div>

              {nom && (
                <div className="mt-4 rounded-xl border border-[var(--cs-line)] bg-[var(--cs-ivory)] px-4 py-3">
                  <p className="cs-label">Connecté en tant que</p>
                  <p className="mt-1 truncate text-[15px] font-semibold text-[var(--cs-navy)]">{nom}</p>
                  {role && <p className="cs-hint mt-0.5 capitalize">{role}</p>}
                </div>
              )}

              <button type="button" onClick={deconnecter} className="cs-btn cs-btn-lg mt-4 w-full">
                <LogOutIcon size={17} strokeWidth={2} aria-hidden="true" />
                Déconnexion
              </button>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      </div>
    </nav>
  )
}
