'use client'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const DPE_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

const DPE_COLORS: Record<string, string> = {
  A: 'text-green-600', B: 'text-green-500', C: 'text-lime-500',
  D: 'text-yellow-500', E: 'text-orange-400', F: 'text-orange-600', G: 'text-red-600',
}

/** Classe DPE avec « Non communiqué » (valeur ''), pour un bien simple comme pour un lot. */
export default function DpeSelect({
  id, label, value, onChange, hint, pleineLargeur = false,
}: {
  id?: string
  pleineLargeur?: boolean          // sélecteur à la largeur de sa colonne (lots d'un immeuble)
  label: string
  value: string
  onChange: (v: string) => void
  hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={value || 'none'}
        onValueChange={(v) => onChange(v === 'none' ? '' : v)}
      >
        <SelectTrigger id={id} className={pleineLargeur ? 'w-full min-w-0' : undefined}>
          <SelectValue placeholder="Sélectionner" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <span className="text-muted-foreground">Non communiqué</span>
          </SelectItem>
          {DPE_OPTIONS.map((d) => (
            <SelectItem key={d} value={d}>
              <span className={`font-bold ${DPE_COLORS[d]}`}>{d}</span>
              {d === 'F' || d === 'G' ? ' (passoire thermique)' : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}
