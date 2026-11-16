'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronDownIcon } from 'lucide-react'
import { eurosSigne, pct } from '@/lib/utils/format'

// Briques communes aux simulateurs (bien simple : ScenarioPanel, immeuble :
// ImmeublePanel) : enregistrement automatique, champs et indicateurs.

// ─── Enregistrement automatique ───────────────────────────────────────────────

export type StatutEnregistrement = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

const DELAI_ENREGISTREMENT_MS = 800

/**
 * Enregistre `payload` 0,8 s après sa dernière modification. L'état à l'ouverture
 * correspond à la base : rien n'est réécrit tant que rien ne change. Deux
 * enregistrements ne partent jamais en parallèle (file d'attente), et ce qui reste
 * en attente part à la fermeture du composant. `payload` null : rien à enregistrer.
 */
export function useEnregistrementAuto<T>(payload: T | null, enregistrer: (p: T) => Promise<void>) {
  const payloadKey = payload ? JSON.stringify(payload) : null
  const lastSavedKey = useRef<string | null>(payloadKey)
  const payloadRef = useRef<T | null>(payload)
  const enregistrerRef = useRef(enregistrer)
  useEffect(() => { payloadRef.current = payload }, [payload])
  useEffect(() => { enregistrerRef.current = enregistrer }, [enregistrer])
  const file = useRef<Promise<boolean>>(Promise.resolve(true))
  const [statut, setStatut] = useState<StatutEnregistrement>('idle')
  // Statut à retrouver quand la saisie revient à ce qui est déjà en base :
  // « Enregistré » si un enregistrement a abouti, rien sinon
  const statutAuRepos = useRef<'idle' | 'saved'>('idle')
  // Relance la comparaison saisie / base après une écriture (voir plus bas)
  const [relance, setRelance] = useState(0)

  const enregistrerMaintenant = useCallback((): Promise<boolean> => {
    file.current = file.current.then(async () => {
      const p = payloadRef.current
      const key = p ? JSON.stringify(p) : null
      if (!p || key === lastSavedKey.current) return true
      setStatut('saving')
      try {
        await enregistrerRef.current(p)
        lastSavedKey.current = key
        statutAuRepos.current = 'saved'
        if (JSON.stringify(payloadRef.current) === key) {
          setStatut('saved')
        } else {
          // Modifié pendant l'écriture, peut-être pour revenir à l'état d'avant :
          // l'effet ne se relancerait pas tout seul (la saisie n'a pas changé depuis),
          // et la base garderait une valeur que l'écran ne montre plus
          setStatut('pending')
          setRelance((n) => n + 1)
        }
        return true
      } catch (err) {
        console.error('Enregistrement de la simulation échoué :', err)
        setStatut('error')
        return false
      }
    })
    return file.current
  }, [])

  useEffect(() => {
    if (!payloadKey) return
    if (payloadKey === lastSavedKey.current) {
      // Revenu à ce qui est en base avant la fin du délai : rien à écrire, et le
      // statut ne doit pas rester bloqué sur « Enregistrement… »
      const auRepos = statutAuRepos.current
      setStatut((s) => (s === 'pending' || s === 'error' ? auRepos : s))
      return
    }
    setStatut('pending')
    const t = setTimeout(enregistrerMaintenant, DELAI_ENREGISTREMENT_MS)
    return () => clearTimeout(t)
  }, [payloadKey, relance, enregistrerMaintenant])

  // Fermeture d'onglet pendant le délai : le navigateur demande confirmation.
  useEffect(() => {
    if (statut !== 'pending' && statut !== 'saving') return
    const avertir = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener('beforeunload', avertir)
    return () => window.removeEventListener('beforeunload', avertir)
  }, [statut])

  // Navigation interne (lien vers une autre page de l'app) : on enregistre ce qui reste en attente.
  useEffect(() => () => { void enregistrerMaintenant() }, [enregistrerMaintenant])

  /** Enregistre ce qui est en attente avant d'ouvrir un PDF, qui est généré depuis la base. */
  const telecharger = useCallback(async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const url = e.currentTarget.href
    // Ouverte tout de suite, dans le geste de l'utilisateur, sinon le bloqueur de pop-up s'en mêle.
    const fenetre = window.open('', '_blank')
    const ok = await enregistrerMaintenant()
    if (!ok) { fenetre?.close(); return }
    if (fenetre) { fenetre.opener = null; fenetre.location.href = url }
    else window.location.href = url
  }, [enregistrerMaintenant])

  return { statut, enregistrerMaintenant, telecharger }
}

// ─── Composants ───────────────────────────────────────────────────────────────

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="cs-cible relative shrink-0 w-[38px] h-[22px] rounded-full transition-colors"
      style={{ backgroundColor: checked ? 'var(--cs-navy)' : '#D8D3C9' }}
    >
      <span
        className="absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white transition-transform"
        style={{ transform: checked ? 'translateX(16px)' : 'none', boxShadow: '0 1px 2px rgba(0,0,0,.2)' }}
      />
    </button>
  )
}

export function NumField({ id, label, value, onChange, unit, hint, placeholder, min = 0, max, full = false, large = false }: {
  id: string
  label: string
  value: number | ''
  onChange: (v: number | '') => void
  unit?: string
  hint?: string
  placeholder?: string
  min?: number
  max?: number
  full?: boolean
  large?: boolean
}) {
  return (
    <div className={`grid gap-1.5 min-w-0 ${full ? 'sm:col-span-2' : ''}`}>
      <label htmlFor={id} className="cs-field-label">{label}</label>
      <div className="relative">
        <input
          id={id} type="number" inputMode="decimal" min={min} max={max} value={value} placeholder={placeholder}
          aria-describedby={hint ? `${id}-aide` : undefined}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          className={`cs-input ${large ? 'cs-input-lg' : ''} ${unit ? 'pr-9' : ''}`}
        />
        {unit && <span className="cs-input-unit">{unit}</span>}
      </div>
      {hint && <p id={`${id}-aide`} className="cs-hint">{hint}</p>}
    </div>
  )
}

export function IndicateurEnregistrement({ statut, onReessayer }: { statut: StatutEnregistrement; onReessayer: () => void }) {
  if (statut === 'error') {
    return (
      <button type="button" onClick={onReessayer} className="text-[12px] font-semibold underline underline-offset-2" style={{ color: 'var(--cs-neg)' }} role="alert">
        Échec de l’enregistrement, réessayer
      </button>
    )
  }
  if (statut === 'pending' || statut === 'saving') {
    return <span className="text-[12px] font-semibold" style={{ color: 'var(--cs-mist)' }} aria-live="polite">Enregistrement…</span>
  }
  if (statut === 'saved') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: 'var(--cs-pos)' }} aria-live="polite">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
        Enregistré
      </span>
    )
  }
  return null
}

export function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 px-[22px] py-4 border-t first:border-t-0 cs-divider">
      <span className="cs-label">{label}</span>
      <span className="text-[20px] font-bold tabular-nums" style={{ color: 'var(--cs-navy)' }}>{value}</span>
    </div>
  )
}

// ─── Résultat flottant (téléphone, tablette) ──────────────────────────────────

/**
 * Sous 1 280 px, le résultat s'affiche sous les champs : en modifiant un loyer
 * devant le client, on ne le voit plus. Ce bandeau garde cash-flow et
 * rentabilité à l'écran tant que la carte de résultat est plus bas dans la page,
 * au-dessus de la barre d'onglets ou du clavier. Un appui y fait défiler.
 */
export function ResultatFlottant({ cible, libelle, cashflow, rentabiliteBrute, statut }: {
  cible: React.RefObject<HTMLElement | null>
  libelle: string
  cashflow: number | null
  rentabiliteBrute: number | null
  statut: StatutEnregistrement
}) {
  const [resultatPlusBas, setResultatPlusBas] = useState(false)
  const aUnResultat = cashflow !== null

  // Position recalculée au défilement et à chaque changement de hauteur de la page
  // (lot déplié…). Pas d'IntersectionObserver : un saut de défilement fait passer
  // la carte d'au-dessus à en dessous de l'écran sans le croiser, et il ne signale rien.
  // Relancé quand le résultat apparaît : la carte observée n'existe qu'à partir de là.
  useEffect(() => {
    const el = cible.current
    if (!el) return
    let image = 0
    const mesurer = () => {
      cancelAnimationFrame(image)
      image = requestAnimationFrame(() => {
        // Visible seulement quand le résultat est sous l'écran (saisie en cours), pas une fois dépassé
        setResultatPlusBas(el.getBoundingClientRect().top > window.innerHeight - 96)
      })
    }
    mesurer()
    document.addEventListener('scroll', mesurer, { capture: true, passive: true })
    window.addEventListener('resize', mesurer)
    const tailles = new ResizeObserver(mesurer)
    tailles.observe(document.body)
    return () => {
      cancelAnimationFrame(image)
      document.removeEventListener('scroll', mesurer, { capture: true })
      window.removeEventListener('resize', mesurer)
      tailles.disconnect()
    }
  }, [cible, aUnResultat])

  const visible = resultatPlusBas && aUnResultat
  const positif = (cashflow ?? 0) >= 0
  const allerAuResultat = () => {
    const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    cible.current?.scrollIntoView({ behavior: reduit ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <div
      inert={!visible}
      className={`fixed right-0 z-30 border-t transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none xl:hidden ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'
      }`}
      style={{
        left: 'var(--cs-sidebar)',
        bottom: 'calc(var(--cs-nav-bas) + var(--cs-clavier, 0px))',
        backgroundColor: 'rgba(255,255,255,0.97)',
        borderColor: 'var(--cs-line)',
        boxShadow: '0 -8px 24px -18px rgba(14,34,64,.35)',
      }}
    >
      <button
        type="button"
        onClick={allerAuResultat}
        className="mx-auto flex min-h-[56px] w-full max-w-[880px] items-center gap-3 px-4 py-2 text-left md:px-10 active:bg-[var(--cs-ivory)]"
        aria-label={cashflow !== null ? `Voir le résultat, ${libelle} : cash-flow de ${eurosSigne(cashflow)} par mois` : 'Voir le résultat'}
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[10.5px] font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--cs-mist)' }}>
            Cash-flow
          </span>
          <span className="flex items-baseline gap-1.5 tabular-nums">
            <span className="text-[20px] font-extrabold leading-tight" style={{ color: positif ? 'var(--cs-pos)' : 'var(--cs-neg)' }}>
              {cashflow !== null ? eurosSigne(cashflow).replace('+ ', '+') : '—'}
            </span>
            <span className="text-[12px] font-semibold" style={{ color: 'var(--cs-mist)' }}>/ mois</span>
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block text-[10.5px] font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--cs-mist)' }}>Renta. brute</span>
          <span className="block text-[16px] font-bold tabular-nums" style={{ color: 'var(--cs-navy)' }}>
            {rentabiliteBrute !== null ? pct(rentabiliteBrute) : '—'}
          </span>
        </span>
        <PastilleStatut statut={statut} />
        {/* Le résultat détaillé est plus bas : un appui y descend */}
        <ChevronDownIcon size={18} strokeWidth={2.2} className="shrink-0 text-[var(--cs-mist)]" aria-hidden="true" />
      </button>
    </div>
  )
}

/** Statut d'enregistrement en version courte (le bouton « réessayer » reste sur la carte de résultat). */
function PastilleStatut({ statut }: { statut: StatutEnregistrement }) {
  const enCours = statut === 'pending' || statut === 'saving'
  const couleur = statut === 'error' ? 'var(--cs-neg)' : enCours ? 'var(--cs-mist)' : 'var(--cs-pos)'
  const texte = statut === 'error' ? 'Échec' : enCours ? 'En cours' : statut === 'saved' ? 'Enregistré' : null
  return (
    <span className="flex w-[62px] shrink-0 flex-col items-center gap-0.5 text-[10.5px] font-semibold" style={{ color: couleur }}>
      {texte && (
        <>
          <span className={`h-2 w-2 rounded-full ${enCours ? 'animate-pulse motion-reduce:animate-none' : ''}`} style={{ backgroundColor: couleur }} aria-hidden="true" />
          {texte}
        </>
      )}
    </span>
  )
}

/** Boutons de téléchargement des PDF, qui enregistrent d'abord ce qui est en attente. */
export function BoutonsDocuments({ projectId, onTelecharger }: {
  projectId: string
  onTelecharger: (e: React.MouseEvent<HTMLAnchorElement>) => void
}) {
  return (
    <div className="flex gap-2.5 flex-wrap px-[22px] py-4 border-t cs-divider rounded-b-[14px]" style={{ backgroundColor: '#FBFAF7' }}>
      <a href={`/api/projets/${projectId}/fiche`} onClick={onTelecharger} target="_blank" rel="noopener noreferrer" className="cs-btn cs-btn-primary flex-[1_1_180px]">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/></svg>
        Fiche commerciale
      </a>
      <a href={`/api/projets/${projectId}/rapport`} onClick={onTelecharger} target="_blank" rel="noopener noreferrer" className="cs-btn flex-[1_1_180px]">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/></svg>
        Rapport analytique
      </a>
    </div>
  )
}
