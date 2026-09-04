'use client'

import { useState } from 'react'
import { WizardState } from './WizardShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { IconNode } from '@/components/ui/IconNode'
import { POSTES_TRAVAUX } from '@/lib/data/travaux'

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
  id, label, value, onChange, readOnly = false, hint, estimate,
}: {
  id: string
  label: string
  value: number | ''
  onChange: (v: number | '') => void
  readOnly?: boolean
  hint?: string
  estimate?: { checked: boolean; onChange: (v: boolean) => void }
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {estimate && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground">Estimation</span>
            <Switch checked={estimate.checked} onCheckedChange={estimate.onChange} />
          </div>
        )}
      </div>
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

function PostesTravaux({
  selected, onChange, travauxRenseignes,
}: {
  selected: string[]
  onChange: (next: string[]) => void
  travauxRenseignes: boolean
}) {
  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter((p) => p !== id) : [...selected, id])

  return (
    <div className="sm:col-span-2 space-y-2 pt-2">
      <div className="flex items-center justify-between">
        <Label>Postes de travaux</Label>
        {selected.length > 0 && (
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {selected.length} sélectionné{selected.length > 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {POSTES_TRAVAUX.map((poste) => {
          const active = selected.includes(poste.id)
          return (
            <button
              key={poste.id}
              type="button"
              onClick={() => toggle(poste.id)}
              aria-pressed={active}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium text-left transition-all"
              style={{
                backgroundColor: active ? '#0E2240' : '#fff',
                color: active ? '#fff' : '#1C1C1E',
                border: `1px solid ${active ? '#0E2240' : '#DDD9D0'}`,
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = '#F7F5F1' }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = '#fff' }}
            >
              <span className="shrink-0" style={{ color: active ? '#C9943A' : '#6E6E73' }}>
                <IconNode name={poste.icon} size={16} />
              </span>
              <span className="truncate">{poste.label}</span>
            </button>
          )
        })}
      </div>
      {travauxRenseignes && selected.length === 0 ? (
        <p className="text-[11px]" style={{ color: '#A67828' }}>
          Aucun poste sélectionné : la page « Travaux » de la fiche commerciale ne sera pas générée.
        </p>
      ) : (
        <p className="text-[11px] text-muted-foreground">
          Illustre la page « Travaux » de la fiche commerciale (icône + libellé par poste).
        </p>
      )}
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
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Acquisition</CardTitle>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Négociation envisagée</span>
              <Switch
                checked={state.negociation_envisagee}
                onCheckedChange={(checked) => setField('negociation_envisagee', checked)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {state.negociation_envisagee && (
            <EuroInput
              id="prix_affiche_origine"
              label="Prix affiché (FAI)"
              value={state.prix_affiche_origine}
              onChange={(v) => setField('prix_affiche_origine', v)}
              hint="Prix d'origine annoncé par l'agence"
            />
          )}
          <EuroInput
            id="prix_achat"
            label={state.negociation_envisagee ? "Prix négocié envisagé" : "Prix d'achat FAI"}
            value={state.prix_achat}
            onChange={handlePrixAchatChange}
          />
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="frais_notaire">Frais de notaire</Label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground">Estimation</span>
                  <Switch
                    checked={state.frais_notaire_estime}
                    onCheckedChange={(checked) => setField('frais_notaire_estime', checked)}
                  />
                </div>
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

      {/* Travaux & ameublement */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Travaux & ameublement</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <EuroInput
            id="travaux"
            label="Budget travaux"
            value={state.travaux}
            onChange={handleTravauxChange}
            estimate={{
              checked: state.travaux_estime,
              onChange: (v) => setField('travaux_estime', v),
            }}
          />
          <EuroInput
            id="mobilier"
            label="Ameublement"
            value={state.mobilier}
            onChange={(v) => setField('mobilier', v)}
            hint="Pour LMNP meublé"
          />
          <EuroInput
            id="valeur_bien_apres_travaux"
            label="Valeur du bien après travaux"
            value={state.valeur_bien_apres_travaux}
            onChange={(v) => setField('valeur_bien_apres_travaux', v)}
            hint={`Optionnel — par défaut prix d'achat + travaux (${(prixAchat + (Number(state.travaux) || 0)).toLocaleString('fr-FR')} €)`}
          />
          <PostesTravaux
            selected={state.travaux_postes}
            onChange={(next) => setField('travaux_postes', next)}
            travauxRenseignes={travaux > 0}
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
            label="Honoraires décoration Capsul"
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