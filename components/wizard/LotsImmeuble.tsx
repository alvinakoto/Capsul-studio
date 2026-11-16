'use client'

import { PlusIcon, XIcon } from 'lucide-react'
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
import DpeSelect from './DpeSelect'
import {
  LIBELLE_LOT_MAX, MAX_LOTS, TYPES_LOT, compositionLots, libelleLot, nouveauLot, surfaceTotale,
  type ClasseDpe, type ImmeubleSaisie, type LotImmeuble, type TypeLot,
} from '@/lib/data/immeuble'

// Lots d'un immeuble (Bloc A) : identité de chaque appartement. L'exploitation se
// choisit à l'étape Scénarios et se chiffre dans le simulateur.

export default function LotsImmeuble({ immeuble, onChange }: {
  immeuble: ImmeubleSaisie
  onChange: (next: ImmeubleSaisie) => void
}) {
  const { lots } = immeuble
  const modifierLot = (id: string, champs: Partial<LotImmeuble>) =>
    onChange({ ...immeuble, lots: lots.map((l) => (l.id === id ? { ...l, ...champs } : l)) })
  const retirerLot = (id: string) => onChange({ ...immeuble, lots: lots.filter((l) => l.id !== id) })
  const ajouterLot = () => onChange({ ...immeuble, lots: [...lots, nouveauLot()] })

  const surface = surfaceTotale(lots)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lots de l’immeuble</CardTitle>
        <p className="text-[11px] text-muted-foreground mt-1 max-w-[62ch]">
          Un seul achat et un seul crédit pour tout l’immeuble. Chaque lot garde sa typologie et son DPE ;
          son exploitation se choisit à l’étape Scénarios.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <ol className="space-y-3">
          {lots.map((lot, i) => (
            <li
              key={lot.id}
              className="rounded-xl border border-[var(--cs-line)] bg-[var(--cs-ivory)] p-4"
              aria-label={libelleLot(lot, i)}
            >
              <div className="flex items-end gap-3">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Label htmlFor={`lot-${lot.id}-libelle`}>{`Lot ${i + 1}`}</Label>
                  <Input
                    id={`lot-${lot.id}-libelle`}
                    value={lot.libelle}
                    maxLength={LIBELLE_LOT_MAX}
                    placeholder="Libellé facultatif, ex. Rez-de-chaussée"
                    onChange={(e) => modifierLot(lot.id, { libelle: e.target.value })}
                  />
                </div>
                {lots.length > 1 && (
                  <button
                    type="button"
                    onClick={() => retirerLot(lot.id)}
                    aria-label={`Retirer ${libelleLot(lot, i)}`}
                    className="mb-[3px] flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--cs-mist)] transition-colors hover:bg-[var(--cs-neg-wash)] hover:text-[var(--cs-neg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cs-navy)]"
                  >
                    <XIcon size={16} strokeWidth={2} aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* 4 colonnes seulement en grand écran : « Non communiqué » doit tenir dans le sélecteur */}
              <div className="mt-3 grid grid-cols-2 gap-3 xl:grid-cols-4">
                <div className="space-y-1.5">
                  <Label htmlFor={`lot-${lot.id}-type`}>Typologie</Label>
                  <Select value={lot.typeBien} onValueChange={(v) => modifierLot(lot.id, { typeBien: v as TypeLot })}>
                    <SelectTrigger id={`lot-${lot.id}-type`} className="w-full min-w-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPES_LOT.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`lot-${lot.id}-surface`}>Surface (m²)</Label>
                  <Input
                    id={`lot-${lot.id}-surface`}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    placeholder="30"
                    value={lot.surfaceM2 ?? ''}
                    onChange={(e) => modifierLot(lot.id, { surfaceM2: e.target.value === '' ? null : Number(e.target.value) })}
                  />
                </div>
                <DpeSelect
                  id={`lot-${lot.id}-dpe`}
                  label="DPE actuel"
                  pleineLargeur
                  value={lot.dpeActuel ?? ''}
                  onChange={(v) => modifierLot(lot.id, { dpeActuel: (v || null) as ClasseDpe | null })}
                />
                <DpeSelect
                  id={`lot-${lot.id}-dpe-vise`}
                  label="DPE visé"
                  pleineLargeur
                  value={lot.dpeVise ?? ''}
                  onChange={(v) => modifierLot(lot.id, { dpeVise: (v || null) as ClasseDpe | null })}
                />
              </div>
            </li>
          ))}
        </ol>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <p className="text-[12px] text-[var(--cs-mist)]" aria-live="polite">
            {[`${lots.length} lot${lots.length > 1 ? 's' : ''}`, surface ? `${surface.toLocaleString('fr-FR')}\u00a0m² au total` : null, compositionLots(lots)]
              .filter(Boolean).join(' · ')}
          </p>
          {lots.length < MAX_LOTS ? (
            <button type="button" className="cs-btn h-9 px-3 text-[12.5px]" onClick={ajouterLot}>
              <PlusIcon size={14} strokeWidth={2.4} aria-hidden="true" />
              Ajouter un lot
            </button>
          ) : (
            <p className="text-[12px] text-[var(--cs-mist)]">{`${MAX_LOTS} lots maximum`}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
