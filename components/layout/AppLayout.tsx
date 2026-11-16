'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import BarreNavigationMobile from './BarreNavigationMobile'
import SuiviClavier from './SuiviClavier'

const NO_SIDEBAR_PATHS = ['/login', '/inscription', '/mot-de-passe-oublie', '/reinitialiser-mot-de-passe']

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showSidebar = !NO_SIDEBAR_PATHS.includes(pathname)

  if (!showSidebar) return <>{children}</>

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      {/* Décalé de la barre latérale en grand écran, de la barre du bas sinon
          (--cs-sidebar / --cs-nav-bas, globals.css). Les marges latérales
          évitent l'encoche de l'iPhone à l'horizontale. */}
      <main
        className="flex-1 min-w-0 min-h-screen overflow-y-auto"
        style={{
          marginLeft: 'var(--cs-sidebar)',
          paddingBottom: 'var(--cs-nav-bas)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        }}
      >
        {children}
      </main>
      <BarreNavigationMobile />
      <SuiviClavier />
    </div>
  )
}
