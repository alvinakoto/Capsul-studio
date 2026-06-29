'use client'

import { useState } from 'react'
import { WizardState } from './WizardShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  state: WizardState
  setField: <K extends keyof WizardState>(field: K, value: WizardState[K]) => void
}

function FieldInput({
  id, label, value, onChange, suffix, step = 1, hint,
}: {
  id: string
  label: string
  value: number | ''
  onChange: (v: number | '') => void
  suffix?: string
  step?: number
  hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type="number"
          min={0}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          className={suffix ? 'pr-8' : ''}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

const DUREES = [10, 15, 20, 25]

function calculerPrixProjetTotal(state: WizardState): number {
  const prixAchat = Number(state.prix_achat) || 0
  const travaux = Number(state.travaux) || 0
  const mobilier = Number(state.mobilier) || 0
  const fraisNotaire = Math.round(prixAchat * state.frais_notaire_pct / 100)
  const honoraires = state.honoraires_override && state.honoraires_capsul
    ? Number(state.honoraires_capsul) || 0
    : Math.max(Math.round(prixAchat * 0.0828), prixAchat > 0 ? 8280 : 0) + Math.round(travaux * 0.05)
  return prixAchat + fraisNotaire + travaux + mobilier + honoraires + state.plan_3d + state.autres_frais
}

export default function BlocD({ state, setField }: Props) {
  const [apportMode, setApportMode] = useState<'eur' | 'pct'>('eur')

  const prixProjetTotal = calculerPrixProjetTotal(state)
  const apportEuros = Number(state.apport) || 0
  const apportPct = prixProjetTotal > 0 ? Math.round((apportEuros / prixProjetTotal) * 1000) / 10 : 0

  return (
    <div className="space-y-6">

      {/* Toggle mode financement */}
      <div>
        <Label className="mb-2 block text-sm font-medium">Mode de financement</Label>
        <div
          className="flex rounded-lg overflow-hidden"
          style={{ border: '1px solid #DDD9D0' }}
        >
          <button
            type="button"
            onClick={() => setField('is_comptant', false)}
            className="flex-1 py-3 text-sm font-semibold transition-colors"
            style={{
              backgroundColor: !state.is_comptant ? '#0E2240' : '#F7F5F1',
              color: !state.is_comptant ? '#fff' : '#6E6E73',
            }}
          >
            Financement bancaire
          </button>
          <button
            type="button"
            onClick={() => setField('is_comptant', true)}
            className="flex-1 py-3 text-sm font-semibold transition-colors"
            style={{
              backgroundColor: state.is_comptant ? '#0E2240' : '#F7F5F1',
              color: state.is_comptant ? '#fff' : '#6E6E73',
              borderLeft: '1px solid #DDD9D0',
            }}
          >
            Achat comptant
          </button>
        </div>
      </div>

      {/* Apport — toujours visible */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {state.is_comptant ? 'Apport' : 'Apport & durée'}
          </CardTitle>
        </CardHeader>
        <CardContent className={`grid grid-cols-1 gap-4 ${!state.is_comptant ? 'sm:grid-cols-2' : ''}`}>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="apport">Apport personnel</Label>
              <div className="flex rounded-md overflow-hidden border text-xs" style={{ borderColor: '#DDD9D0' }}>
                <button
                  type="button"
                  onClick={() => setApportMode('eur')}
                  className="px-2 py-1 transition"
                  style={{
                    backgroundColor: apportMode === 'eur' ? '#0E2240' : '#F7F5F1',
                    color: apportMode === 'eur' ? '#fff' : '#6E6E73',
                  }}
                >€</button>
                <button
                  type="button"
                  onClick={() => prixProjetTotal > 0 && setApportMode('pct')}
                  className="px-2 py-1 transition"
                  style={{
                    backgroundColor: apportMode === 'pct' ? '#0E2240' : '#F7F5F1',
                    color: apportMode === 'pct' ? '#fff' : prixProjetTotal > 0 ? '#6E6E73' : '#C0BDB7',
                    borderLeft: '1px solid #DDD9D0',
                    cursor: prixProjetTotal > 0 ? 'pointer' : 'not-allowed',
                  }}
                >%</button>
              </div>
            </div>
            <div className="relative">
              <Input
                id="apport"
                type="number"
                min={0}
                step={apportMode === 'eur' ? 1000 : 1}
                value={apportMode === 'eur' ? state.apport : apportPct}
                onChange={(e) => {
                  const v = e.target.value === '' ? '' : Number(e.target.value)
                  if (apportMode === 'eur') {
                    setField('apport', v)
                  } else if (prixProjetTotal > 0) {
                    setField('apport', Math.round((Number(v) / 100) * prixProjetTotal))
                  }
                }}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {apportMode === 'eur' ? '€' : '%'}
              </span>
            </div>
            {apportMode === 'eur' && prixProjetTotal > 0 && apportEuros > 0 && (
              <p className="text-[11px] text-muted-foreground">
                soit {apportPct.toFixed(1)} % du projet
              </p>
            )}
            {apportMode === 'pct' && (
              <p className="text-[11px] text-muted-foreground">
                soit {apportEuros.toLocaleString('fr-FR')} €
              </p>
            )}
            {state.is_comptant && (
              <p className="text-[11px] text-muted-foreground">Optionnel — pour information uniquement</p>
            )}
          </div>

          {!state.is_comptant && (
            <div className="space-y-1.5">
              <Label>Durée du crédit</Label>
              <div className="flex gap-2">
                {DUREES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setField('duree_annees', d)}
                    className="flex-1 py-2 rounded-md text-sm border transition"
                    style={
                      state.duree_annees === d
                        ? { backgroundColor: '#0E2240', color: '#fff', borderColor: '#0E2240', fontWeight: 600 }
                        : { backgroundColor: '#fff', color: '#0E2240', borderColor: '#DDD9D0' }
                    }
                  >
                    {d} ans
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Encadré comptant ou carte taux */}
      {state.is_comptant ? (
        <div
          className="rounded-xl px-5 py-4 text-sm"
          style={{ backgroundColor: '#EDE9E1', border: '1px solid #DDD9D0' }}
        >
          <p className="font-semibold" style={{ color: '#0E2240' }}>
            Achat comptant sélectionné
          </p>
          <p className="mt-1" style={{ color: '#6E6E73' }}>
            Aucun recours au crédit — les champs taux, durée et assurance
            ne s'appliquent pas. Le moteur de calcul et les PDF
            s'adapteront automatiquement.
          </p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Taux</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldInput
              id="taux_interet"
              label="Taux d'intérêt"
              value={state.taux_interet_pct}
              onChange={(v) => setField('taux_interet_pct', v)}
              suffix="%"
              step={0.01}
              hint="Taux nominal annuel hors assurance"
            />
            <FieldInput
              id="taux_assurance"
              label="Taux assurance"
              value={state.taux_assurance_pct}
              onChange={(v) => setField('taux_assurance_pct', Number(v) || 0)}
              suffix="%"
              step={0.01}
              hint="Optionnel — inclus dans la mensualité si renseigné"
            />
          </CardContent>
        </Card>
      )}

    </div>
  )
}
