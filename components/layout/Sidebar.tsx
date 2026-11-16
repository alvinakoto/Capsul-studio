'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOutIcon, PlusIcon } from 'lucide-react'
import { NAV, NOUVEAU_PROJET, estActif, useUtilisateur } from './navigation'

// Barre latérale, à partir de 1 024 px. En dessous : BarreNavigationMobile.
// Largeur : --cs-sidebar, dans globals.css.

export default function Sidebar() {
  const pathname = usePathname()
  const { nom, role, deconnecter } = useUtilisateur()

  return (
    <aside
      className="fixed top-0 left-0 z-40 hidden h-screen w-[220px] flex-col lg:flex"
      style={{ backgroundColor: 'var(--cs-navy)' }}
    >
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 border-b border-white/10">
        <Link href="/projets" className="flex items-center gap-3">
          <img
            src="/logo-capsul.jpg"
            alt="Capsul"
            className="rounded-md shrink-0"
            style={{ width: 36, height: 36, objectFit: 'cover', objectPosition: 'center' }}
          />
          <div className="text-left">
            <div className="text-white font-bold text-[13px] tracking-wide leading-tight">CAPSUL</div>
            <div className="font-semibold text-[10px] tracking-widest leading-tight" style={{ color: 'var(--cs-gold)' }}>
              STUDIO
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-4 space-y-0.5" aria-label="Navigation principale">
        {NAV.map(({ href, label, Icone }) => {
          const actif = estActif(pathname, href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={actif ? 'page' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors border-l-2 ${
                actif
                  ? 'bg-[rgba(201,148,58,0.15)] text-[#E6B64C] border-[var(--cs-gold)]'
                  : 'text-[rgba(247,245,241,0.7)] border-transparent hover:bg-white/[0.06] hover:text-[var(--cs-ivory)]'
              }`}
            >
              <Icone size={16} strokeWidth={1.8} className={actif ? '' : 'opacity-60'} aria-hidden="true" />
              {label}
            </Link>
          )
        })}

        {/* CTA nouveau projet */}
        <div className="pt-3">
          <Link
            href={NOUVEAU_PROJET}
            aria-current={estActif(pathname, NOUVEAU_PROJET) ? 'page' : undefined}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-[13px] font-semibold text-white transition-colors bg-[var(--cs-gold)] hover:bg-[#B8841F]"
          >
            <PlusIcon size={14} strokeWidth={2.4} aria-hidden="true" />
            Nouveau projet
          </Link>
        </div>
      </nav>

      {/* User footer */}
      <div className="px-3 pb-4 border-t border-white/10 pt-3">
        {nom && (
          <div className="px-3 py-2 mb-1">
            <p className="text-white text-[12px] font-medium truncate">{nom}</p>
            {role && (
              <p className="text-[10px] mt-0.5 capitalize truncate" style={{ color: 'rgba(247,245,241,0.45)' }}>
                {role}
              </p>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={deconnecter}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] transition-colors text-[rgba(247,245,241,0.4)] hover:bg-white/[0.06] hover:text-[rgba(247,245,241,0.8)]"
        >
          <LogOutIcon size={13} strokeWidth={1.8} aria-hidden="true" />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
