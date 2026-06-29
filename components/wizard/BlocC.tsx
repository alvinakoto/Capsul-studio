'use client'

import { useState } from 'react'
import { WizardState } from './WizardShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

interface Props {
  state: WizardState
  setField: <K extends keyof WizardState>(field: K, value: WizardState[K]) => void
}

function calculerHonorairesAuto(prixAchat: number, travaux: number): number {
  const base = Math.max(Math.round(prixAchat * 0.0828), 8280)
  const surTravaux = travaux > 0 ? Math.round(travaux * 0.05) : 0
  return base + surTravaux
}

function EuroInput({
  id, label, value, onChange, readOnly = false, hint,
}: {
  id: string
  label: string
  value: number | ''
  onChange: (v: number | '') => void
  readOnly?: boolean
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
          value={value}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          readOnly={readOnly}
          className={readOnly ? 'bg-muted text-muted-foreground pr-8' : 'pr-8'}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          €
        </span>
      </div>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

export default function BlocC({ state, setField }: Props) {
  const [fraisNotaireMode, setFraisNotaireMode] = useState<'pct' | 'eur'>('pct')

  const prixAchat = Number(state.prix_achat) || 0
  const travaux = Number(state.travaux) || 0
  const honorairesAuto = prixAchat > 0 ? calculerHonorairesAuto(prixAchat, travaux) : 0
  const fraisNotaireEuros = prixAchat > 0
    ? Math.round(prixAchat * state.frais_notaire_pct / 100)
    : 0

  // Quand prixAchat ou travaux changent, recalculer les honoraires si pas d'override
  const handlePrixAchatChange = (v: number | '') => {
    setField('prix_achat', v)
    if (!state.honoraires_override && v !== '') {
      setField('honoraires_capsul', calculerHonorairesAuto(Number(v), travaux))
    }
  }

  const handleTravauxChange = (v: number | '') => {
    setField('travaux', v)
    if (!state.honoraires_override && prixAchat > 0) {
      setField('honoraires_capsul', calculerHonorairesAuto(prixAchat, Number(v) || 0))
    }
  }

  const handleOverrideToggle = (checked: boolean) => {
    setField('honoraires_override', checked)
    if (!checked && prixAchat > 0) {
      setField('honoraires_capsul', calculerHonorairesAuto(prixAchat, travaux))
    }
  }

  return (
    <div className="space-y-6">

      {/* Acquisition */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Acquisition</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <EuroInput
            id="prix_achat"
            label="Prix d'achat FAI"
            value={state.prix_achat}
            onChange={handlePrixAchatChange}
          />
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="frais_notaire">Frais de notaire</Label>
              <div className="flex rounded-md overflow-hidden border text-xs" style={{ borderColor: '#DDD9D0' }}>
                <button
                  type="button"
                  onClick={() => setFraisNotaireMode('pct')}
                  className="px-2 py-1 transition"
                  style={{
                    backgroundColor: fraisNotaireMode === 'pct' ? '#0E2240' : '#F7F5F1',
                    color: fraisNotaireMode === 'pct' ? '#fff' : '#6E6E73',
                  }}
                >%</button>
                <button
                  type="button"
                  onClick={() => prixAchat > 0 && setFraisNotaireMode('eur')}
                  className="px-2 py-1 transition"
                  style={{
                    backgroundColor: fraisNotaireMode === 'eur' ? '#0E2240' : '#F7F5F1',
                    color: fraisNotaireMode === 'eur' ? '#fff' : prixAchat > 0 ? '#6E6E73' : '#C0BDB7',
                    borderLeft: '1px solid #DDD9D0',
                    cursor: prixAchat > 0 ? 'pointer' : 'not-allowed',
                  }}
                >€</button>
              </div>
            </div>
            <div className="relative">
              <Input
                id="frais_notaire"
                type="number"
                min={0}
                step={fraisNotaireMode === 'pct' ? 0.1 : 100}
                value={fraisNotaireMode === 'pct' ? state.frais_notaire_pct : fraisNotaireEuros}
                onChange={(e) => {
                  const v = Number(e.target.value)
                  if (fraisNotaireMode === 'pct') {
                    setField('frais_notaire_pct', v)
                  } else if (prixAchat > 0) {
                    setField('frais_notaire_pct', (v / prixAchat) * 100)
                  }
                }}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {fraisNotaireMode === 'pct' ? '%' : '€'}
              </span>
            </div>
            {fraisNotaireMode === 'pct' && prixAchat > 0 && (
              <p className="text-[11px] text-muted-foreground">
                soit {fraisNotaireEuros.toLocaleString('fr-FR')} €
              </p>
            )}
            {fraisNotaireMode === 'eur' && (
              <p className="text-[11px] text-muted-foreground">
                soit {state.frais_notaire_pct.toFixed(2)} %
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Travaux & mobilier */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Travaux & mobilier</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <EuroInput
            id="travaux"
            label="Budget travaux"
            value={state.travaux}
            onChange={handleTravauxChange}
          />
          <EuroInput
            id="mobilier"
            label="Mobilier"
            value={state.mobilier}
            onChange={(v) => setField('mobilier', v)}
            hint="Pour LMNP meublé"
          />
        </CardContent>
      </Card>

      {/* Honoraires Capsul */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Honoraires Capsul</CardTitle>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Saisie manuelle</span>
              <Switch
                checked={state.honoraires_override}
                onCheckedChange={handleOverrideToggle}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <EuroInput
            id="honoraires"
            label="Honoraires"
            value={
              state.honoraires_override
                ? state.honoraires_capsul
                : honorairesAuto || ''
            }
            onChange={(v) => setField('honoraires_capsul', v)}
            readOnly={!state.honoraires_override}
            hint={
              !state.honoraires_override
                ? 'MAX(prix × 8,28%, 8 280€) + travaux × 5%'
                : 'Montant saisi manuellement'
            }
          />
          <EuroInput
            id="plan3d"
            label="Plan 3D"
            value={state.plan_3d}
            onChange={(v) => setField('plan_3d', Number(v) || 0)}
          />
          <EuroInput
            id="autres_frais"
            label="Autres frais"
            value={state.autres_frais}
            onChange={(v) => setField('autres_frais', Number(v) || 0)}
          />
        </CardContent>
      </Card>

    </div>
  )
}