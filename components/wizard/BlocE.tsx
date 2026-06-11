'use client'

import { WizardState } from './WizardShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  state: WizardState
  setField: <K extends keyof WizardState>(field: K, value: WizardState[K]) => void
}

function ChargeInput({
  id, label, value, onChange, hint,
}: {
  id: string
  label: string
  value: number | ''
  onChange: (v: number | '') => void
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
          className="pr-16"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          €/an
        </span>
      </div>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

export default function BlocE({ state, setField }: Props) {
  const totalCharges =
    (Number(state.taxe_fonciere) || 0) +
    (Number(state.charges_copro_annuelles) || 0) +
    (Number(state.assurance_pno) || 0) +
    (Number(state.frais_comptabilite) || 0) +
    (state.electricite_eau || 0) +
    (state.internet || 0) +
    (state.chauffage || 0) +
    (state.autres_charges || 0)

  return (
    <div className="space-y-6">

      {/* Charges obligatoires */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Charges courantes</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ChargeInput
            id="taxe_fonciere"
            label="Taxe foncière"
            value={state.taxe_fonciere}
            onChange={(v) => setField('taxe_fonciere', v)}
          />
          <ChargeInput
            id="charges_copro"
            label="Charges de copropriété"
            value={state.charges_copro_annuelles}
            onChange={(v) => setField('charges_copro_annuelles', v)}
          />
          <ChargeInput
            id="assurance_pno"
            label="Assurance PNO"
            value={state.assurance_pno}
            onChange={(v) => setField('assurance_pno', v)}
          />
          <ChargeInput
            id="frais_comptabilite"
            label="Frais de comptabilité"
            value={state.frais_comptabilite}
            onChange={(v) => setField('frais_comptabilite', v)}
            hint="Recommandé en LMNP réel"
          />
        </CardContent>
      </Card>

      {/* Charges locataire (courte durée / coloc) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Charges locataire
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ChargeInput
            id="electricite_eau"
            label="Électricité & eau"
            value={state.electricite_eau}
            onChange={(v) => setField('electricite_eau', Number(v) || 0)}
            hint="Courte durée / coloc charges incluses"
          />
          <ChargeInput
            id="internet"
            label="Internet"
            value={state.internet}
            onChange={(v) => setField('internet', Number(v) || 0)}
          />
          <ChargeInput
            id="chauffage"
            label="Chauffage"
            value={state.chauffage}
            onChange={(v) => setField('chauffage', Number(v) || 0)}
          />
          <ChargeInput
            id="autres_charges"
            label="Autres charges"
            value={state.autres_charges}
            onChange={(v) => setField('autres_charges', Number(v) || 0)}
          />
        </CardContent>
      </Card>

      {/* Total */}
      {totalCharges > 0 && (
        <div className="flex justify-between items-center px-1 text-sm">
          <span className="text-muted-foreground">Total charges annuelles</span>
          <span className="font-semibold tabular-nums">
            {totalCharges.toLocaleString('fr-FR')} €/an
            <span className="text-muted-foreground font-normal ml-1.5">
              ({Math.round(totalCharges / 12).toLocaleString('fr-FR')} €/mois)
            </span>
          </span>
        </div>
      )}

    </div>
  )
}