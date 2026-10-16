'use client'

import { useState, useEffect } from 'react'
import { WizardState } from './WizardShell'
import { suggererScenarios, detecterAlertes, TypeScenario, Suggestion, AlerteReglementaire } from '@/lib/engine/suggestions'

interface Props {
  state: WizardState
  onScenarioChange?: (type: TypeScenario) => void
}

const SCENARIO_LABELS: Record<TypeScenario, string> = {
  lmnp_meuble:  'LMNP Meublé',
  colocation:   'Colocation',
  courte_duree: 'Courte durée',
}

export default function BlocF({ state, onScenarioChange }: Props) {
  const [selectedScenario, setSelectedScenario] = useState<TypeScenario | null>(null)

  const suggestions = suggererScenarios(state)
  const alertes = detecterAlertes(state)
  const meilleureSuggestion = suggestions[0]

  // Auto-sélectionne la meilleure suggestion (et la propage tout de suite :
  // si le chargé ne touche à rien, c'est elle qui doit être enregistrée)
  useEffect(() => {
    if (meilleureSuggestion && !selectedScenario) {
      setSelectedScenario(meilleureSuggestion.type)
      onScenarioChange?.(meilleureSuggestion.type)
    }
  }, [meilleureSuggestion?.type])

  const handleSelect = (type: TypeScenario) => {
    setSelectedScenario(type)
    onScenarioChange?.(type)
  }

  const hasPrixAchat = Number(state.prix_achat) > 0

  return (
    <div className="space-y-4">

      {/* Alertes réglementaires */}
      {alertes.length > 0 && (
        <div className="space-y-3">
          {alertes.map((alerte, i) => (
            <AlerteCard key={i} alerte={alerte} />
          ))}
        </div>
      )}

      {/* Suggestions */}
      {!hasPrixAchat ? (
        <div className="cs-card p-6 text-center text-[13px]" style={{ color: 'var(--cs-mist)', boxShadow: 'none', borderStyle: 'dashed' }}>
          Renseignez le prix d’achat à l’étape Finances pour obtenir des suggestions.
        </div>
      ) : (
        <div className="cs-card p-[22px]">
          <h2 className="text-[15px] font-bold" style={{ color: 'var(--cs-navy)' }}>Scénario recommandé</h2>
          <p className="cs-sub mt-0.5">
            Basé sur le type de bien, la surface et la ville. Le scénario choisi s’ouvre par défaut dans le simulateur.
          </p>

          <div className="mt-4 grid gap-2.5" role="radiogroup" aria-label="Scénario">
            {suggestions.map((s, i) => (
              <SuggestionCard
                key={s.type}
                suggestion={s}
                isTop={i === 0}
                isSelected={selectedScenario === s.type}
                onSelect={() => handleSelect(s.type)}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

function SuggestionCard({ suggestion, isTop, isSelected, onSelect }: {
  suggestion: Suggestion
  isTop: boolean
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={onSelect}
      className={`w-full text-left rounded-[11px] px-4 py-3.5 transition-[border-color,background-color] ${isSelected ? '' : 'hover:border-[#CFC9BD] hover:bg-[var(--cs-ivory)]'}`}
      style={{
        border: `1px solid ${isSelected ? 'var(--cs-navy)' : 'var(--cs-line)'}`,
        backgroundColor: isSelected ? '#F3F5F8' : '#fff',
        boxShadow: isSelected ? '0 0 0 1px var(--cs-navy)' : 'none',
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="w-[18px] h-[18px] rounded-full shrink-0 mt-px flex items-center justify-center"
          style={{ border: `2px solid ${isSelected ? 'var(--cs-navy)' : '#C7C1B4'}`, backgroundColor: isSelected ? 'var(--cs-navy)' : '#fff' }}
          aria-hidden="true"
        >
          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13.5px] font-semibold" style={{ color: 'var(--cs-navy)' }}>{suggestion.label}</span>
            {isTop && (
              <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#E8F0F8', color: '#2C5A86' }}>
                Recommandé
              </span>
            )}
            {isSelected && (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--cs-navy)', color: '#fff' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--cs-gold)" aria-hidden="true"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1Z"/></svg>
                Choisi
              </span>
            )}
          </div>
          <p className="cs-sub mt-0.5">{suggestion.raison}</p>
        </div>
      </div>
    </button>
  )
}

function AlerteCard({ alerte }: { alerte: AlerteReglementaire }) {
  const isError = alerte.niveau === 'error'
  const c = isError
    ? { bg: 'var(--cs-neg-wash)', border: '#EBC3BC', ink: 'var(--cs-neg)' }
    : { bg: '#FBF3E2', border: '#EBD7AE', ink: '#8A5A12' }
  return (
    <div className="rounded-[11px] px-4 py-3.5 flex items-start gap-3" style={{ backgroundColor: c.bg, border: `1px solid ${c.border}` }} role={isError ? 'alert' : 'status'}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-px" aria-hidden="true">
        {isError
          ? <><circle cx="12" cy="12" r="9"/><path d="m5.7 5.7 12.6 12.6"/></>
          : <><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></>}
      </svg>
      <div>
        <p className="text-[13px] font-semibold" style={{ color: c.ink }}>{alerte.titre}</p>
        <p className="cs-sub mt-0.5">{alerte.message}</p>
      </div>
    </div>
  )
}
