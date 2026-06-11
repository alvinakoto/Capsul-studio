'use client'

import { WizardState } from './WizardShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const VILLES = ['Reims', 'Paris', 'Toulouse', 'Amiens', 'Nancy', 'Troyes', 'Épernay', 'Châlons-en-Champagne']
const TYPES_BIEN = ['studio', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6+', 'maison']
const DPE_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

const DPE_COLORS: Record<string, string> = {
  A: 'text-green-600', B: 'text-green-500', C: 'text-lime-500',
  D: 'text-yellow-500', E: 'text-orange-400', F: 'text-orange-600', G: 'text-red-600',
}

const MAX_DESCRIPTION = 600

interface Props {
  state: WizardState
  setField: <K extends keyof WizardState>(field: K, value: WizardState[K]) => void
}

function DpeSelect({
  label, value, onChange, hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select
        value={value || 'none'}
        onValueChange={(v) => onChange(v === 'none' ? '' : v)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <span className="text-muted-foreground">Non communiqué</span>
          </SelectItem>
          {DPE_OPTIONS.map((d) => (
            <SelectItem key={d} value={d}>
              <span className={`font-bold ${DPE_COLORS[d]}`}>{d}</span>
              {d === 'F' || d === 'G' ? ' — passoire thermique' : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

export default function BlocA({ state, setField }: Props) {
  const descLen = state.description_bien?.length || 0

  return (
    <div className="space-y-6">

      {/* Localisation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Localisation</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="adresse">Adresse du bien</Label>
            <Input
              id="adresse"
              placeholder="12 rue de la Paix"
              value={state.adresse}
              onChange={(e) => setField('adresse', e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Ville</Label>
            <Select
              value={state.ville}
              onValueChange={(v) => setField('ville', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une ville" />
              </SelectTrigger>
              <SelectContent>
                {VILLES.map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

        </CardContent>
      </Card>

      {/* Caractéristiques */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Caractéristiques</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          <div className="space-y-1.5">
            <Label htmlFor="surface">Surface (m²)</Label>
            <Input
              id="surface"
              type="number"
              min={0}
              placeholder="45"
              value={state.surface_m2}
              onChange={(e) =>
                setField('surface_m2', e.target.value === '' ? '' : Number(e.target.value))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label>Type de bien</Label>
            <Select
              value={state.type_bien}
              onValueChange={(v) => setField('type_bien', v as WizardState['type_bien'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {TYPES_BIEN.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DpeSelect
            label="DPE actuel"
            value={state.dpe_actuel}
            onChange={(v) => setField('dpe_actuel', v as WizardState['dpe_actuel'])}
            hint="Classe énergétique du diagnostic en cours"
          />

          <DpeSelect
            label="DPE visé (après travaux)"
            value={state.dpe_apres_travaux}
            onChange={(v) => setField('dpe_apres_travaux', v as WizardState['dpe_apres_travaux'])}
            hint="Classe ciblée après rénovation"
          />

        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Description du bien</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            <Label htmlFor="description">
              Présentation textuelle pour la fiche commerciale
            </Label>
            <textarea
              id="description"
              rows={5}
              maxLength={MAX_DESCRIPTION}
              placeholder="Appartement traversant situé au cœur du centre-ville, à 5 minutes à pied de…"
              value={state.description_bien}
              onChange={(e) => setField('description_bien', e.target.value)}
              className="flex w-full rounded-md border border-input bg-background
                         px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                         resize-none"
            />
            <div className="flex justify-between items-center">
              <p className="text-[11px] text-muted-foreground">
                Apparaîtra en page 2 du dossier client.
              </p>
              <p className={`text-[11px] tabular-nums ${
                descLen > MAX_DESCRIPTION * 0.9 ? 'text-orange-500' : 'text-muted-foreground'
              }`}>
                {descLen} / {MAX_DESCRIPTION}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}