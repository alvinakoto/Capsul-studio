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

const VILLES = ['Toulouse', 'Amiens', 'Nancy', 'Troyes', 'Châlons-en-Champagne', 'Reims']
const TYPES_BIEN = ['studio', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6+', 'maison']
const DPE_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

const DPE_COLORS: Record<string, string> = {
  A: 'text-green-600', B: 'text-green-500', C: 'text-lime-500',
  D: 'text-yellow-500', E: 'text-orange-400', F: 'text-orange-600', G: 'text-red-600',
}

interface Props {
  state: WizardState
  setField: <K extends keyof WizardState>(field: K, value: WizardState[K]) => void
}

export default function BlocA({ state, setField }: Props) {
  return (
    <div className="space-y-6">
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Caractéristiques</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">

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

          <div className="space-y-1.5">
            <Label>DPE</Label>
            <Select
              value={state.dpe}
              onValueChange={(v) => setField('dpe', v as WizardState['dpe'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Classe énergie" />
              </SelectTrigger>
              <SelectContent>
                {DPE_OPTIONS.map((d) => (
                  <SelectItem key={d} value={d}>
                    <span className={`font-bold ${DPE_COLORS[d]}`}>{d}</span>
                    {d === 'F' || d === 'G' ? ' — passoire thermique' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}