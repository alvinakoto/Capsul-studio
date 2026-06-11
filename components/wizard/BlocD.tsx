'use client'

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

export default function BlocD({ state, setField }: Props) {
  return (
    <div className="space-y-6">

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Apport & durée</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldInput
            id="apport"
            label="Apport personnel"
            value={state.apport}
            onChange={(v) => setField('apport', v)}
            suffix="€"
          />

          <div className="space-y-1.5">
            <Label>Durée du crédit</Label>
            <div className="flex gap-2">
              {DUREES.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setField('duree_annees', d)}
                  className={`flex-1 py-2 rounded-md text-sm border transition ${
                    state.duree_annees === d
                      ? 'bg-foreground text-background border-foreground font-medium'
                      : 'hover:bg-muted'
                  }`}
                >
                  {d} ans
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

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

    </div>
  )
}