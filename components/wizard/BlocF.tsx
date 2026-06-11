'use client'

import { useState, useEffect } from 'react'
import { WizardState } from './WizardShell'
import { suggererScenarios, detecterAlertes, TypeScenario, Suggestion, AlerteReglementaire } from '@/lib/engine/suggestions'

interface Props {
  state: WizardState
  onScenarioChange?: (type: TypeScenario, loyerCible: number | '') => void
}

const SCENARIO_LABELS: Record<TypeScenario, string> = {
  lmnp_meuble:  'LMNP Meublé',
  colocation:   'Colocation',
  courte_duree: 'Courte durée',
}

export default function BlocF({ state, onScenarioChange }: Props) {
  const [selectedScenario, setSelectedScenario] = useState<TypeScenario | null>(null)
  const [loyerCible, setLoyerCible] = useState<number | ''>('')

  const suggestions = suggererScenarios(state)
  const alertes = detecterAlertes(state)
  const meilleureSuggestion = suggestions[0]

  // Auto-sélectionne la meilleure suggestion
  useEffect(() => {
    if (meilleureSuggestion && !selectedScenario) {
      setSelectedScenario(meilleureSuggestion.type)
    }
  }, [meilleureSuggestion?.type])

  const handleSelect = (type: TypeScenario) => {
    setSelectedScenario(type)
    onScenarioChange?.(type, loyerCible)
  }

  const handleLoyerChange = (v: number | '') => {
    setLoyerCible(v)
    if (selectedScenario) onScenarioChange?.(selectedScenario, v)
  }

  const hasPrixAchat = Number(state.prix_achat) > 0

  return (
    <div className="space-y-6">

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
        <div className="rounded-xl border bg-card p-6 text-center text-muted-foreground text-sm">
          Renseignez le prix d'achat dans le bloc C pour obtenir des suggestions.
        </div>
      ) : (
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div>
            <h2 className="font-semibold">Scénario recommandé</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Basé sur le type de bien, la surface et la ville
            </p>
          </div>

          <div className="space-y-3">
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

      {/* Loyer cible */}
      {selectedScenario && (
        <div className="rounded-xl border bg-card p-6 space-y-3">
          <h2 className="font-semibold">Loyer cible</h2>
          <p className="text-xs text-muted-foreground">
            {selectedScenario === 'colocation'
              ? 'Loyer par chambre estimé'
              : selectedScenario === 'courte_duree'
              ? 'Prix par nuit estimé'
              : 'Loyer mensuel estimé'}
          </p>
          <div className="relative max-w-xs">
            <input
              type="number"
              min={0}
              value={loyerCible}
              onChange={(e) => handleLoyerChange(e.target.value === '' ? '' : Number(e.target.value))}
              className="flex h-10 w-full rounded-md border border-input bg-background
                         px-3 py-2 text-sm ring-offset-background pr-8
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Ex: 800"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
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
    <div
      onClick={onSelect}
      className={`rounded-lg border p-4 cursor-pointer transition-all ${
        isSelected
          ? 'border-foreground bg-foreground/5'
          : 'hover:border-foreground/40 hover:bg-muted/30'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center ${
            isSelected ? 'border-foreground bg-foreground' : 'border-muted-foreground'
          }`}>
            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-background" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{suggestion.label}</span>
              {isTop && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-foreground text-background font-medium">
                  Recommandé
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{suggestion.raison}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function AlerteCard({ alerte }: { alerte: AlerteReglementaire }) {
  const isError = alerte.niveau === 'error'
  return (
    <div className={`rounded-lg border p-4 ${
      isError
        ? 'border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900'
        : 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900'
    }`}>
      <div className="flex items-start gap-3">
        <span className="text-lg shrink-0">{isError ? '🚫' : '⚠️'}</span>
        <div>
          <p className={`font-medium text-sm ${isError ? 'text-red-700 dark:text-red-400' : 'text-yellow-700 dark:text-yellow-400'}`}>
            {alerte.titre}
          </p>
          <p className="text-xs mt-0.5 text-muted-foreground">{alerte.message}</p>
        </div>
      </div>
    </div>
  )
}