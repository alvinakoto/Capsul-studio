'use client'

import { WizardState } from './WizardShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { NOMS_VILLES, findVille, villeInfosToForm, type VilleInfosForm } from '@/lib/data/villes'
import { nomProjetAuto } from '@/lib/supabase/projects'

const TYPES_BIEN = ['studio', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6+', 'maison', 'immeuble']
const DPE_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

const DPE_COLORS: Record<string, string> = {
  A: 'text-green-600', B: 'text-green-500', C: 'text-lime-500',
  D: 'text-yellow-500', E: 'text-orange-400', F: 'text-orange-600', G: 'text-red-600',
}

// Calé pour garantir que la description + les 6 photos supplémentaires
// tiennent toujours sur une seule page du PDF (page « Le bien »). Testé
// empiriquement : au-delà de ~550 caractères avec 1-2 sauts de paragraphe
// (usage réel), le texte déborde sur la page suivante — marge de sécurité
// prise en dessous de ce seuil.
const MAX_DESCRIPTION = 400

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
              {d === 'F' || d === 'G' ? ' (passoire thermique)' : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

// ─── Champs « Infos ville » ───────────────────────────────────────────────────

function TextField({
  id, label, value, onChange, placeholder, className,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ''}`}>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function NumField({
  id, label, value, onChange, suffix, step = 1, placeholder,
}: {
  id: string
  label: string
  value: number | ''
  onChange: (v: number | '') => void
  suffix?: string
  step?: number
  placeholder?: string
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
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          className={suffix ? 'pr-12' : ''}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

function VilleInfosCard({
  ville, infos, onChange,
}: {
  ville: string
  infos: VilleInfosForm
  onChange: (next: VilleInfosForm) => void
}) {
  const dataset = findVille(ville)
  const set = <K extends keyof VilleInfosForm>(key: K, value: VilleInfosForm[K]) =>
    onChange({ ...infos, [key]: value })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">Infos ville</CardTitle>
            <p className="text-[11px] text-muted-foreground mt-1">
              Page 2 de la fiche commerciale, modifiable pour ce projet.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={dataset
                ? { backgroundColor: 'rgba(201,148,58,0.12)', color: '#A67828' }
                : { backgroundColor: '#F0EDE7', color: '#6E6E73' }}
            >
              {dataset ? 'Données Capsul' : 'Aucune donnée à compléter'}
            </span>
            {dataset && (
              <button
                type="button"
                onClick={() => onChange(villeInfosToForm(dataset.infos))}
                className="text-[11px] font-medium transition-colors"
                style={{ color: '#6E6E73' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#0E2240' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#6E6E73' }}
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          id="ville_surnom" label="Accroche" className="sm:col-span-2"
          value={infos.surnom} placeholder="La cité des sacres"
          onChange={(v) => set('surnom', v)}
        />
        <NumField id="ville_habitants" label="Habitants" value={infos.habitants} placeholder="180 000"
          onChange={(v) => set('habitants', v)} />
        <NumField id="ville_etudiants" label="Étudiants" value={infos.etudiants} placeholder="37 000"
          onChange={(v) => set('etudiants', v)} />
        <TextField id="ville_acces" label="Accès" value={infos.acces} placeholder="à 45 min de Paris en TGV"
          onChange={(v) => set('acces', v)} />
        <TextField id="ville_atout" label="Atout" value={infos.atout} placeholder="12ème ville de France"
          onChange={(v) => set('atout', v)} />
        <NumField id="ville_prix_min" label="Prix au m² (bas de fourchette)" value={infos.prixM2Min} suffix="€/m²" step={50}
          onChange={(v) => set('prixM2Min', v)} />
        <NumField id="ville_prix_max" label="Prix au m² (haut de fourchette)" value={infos.prixM2Max} suffix="€/m²" step={50}
          onChange={(v) => set('prixM2Max', v)} />
        <NumField id="ville_rendement" label="Rentabilité moyenne de la ville" value={infos.rendementMoyenPct} suffix="%" step={0.1}
          onChange={(v) => set('rendementMoyenPct', v)} />
      </CardContent>
    </Card>
  )
}

// ─── Bloc A ───────────────────────────────────────────────────────────────────

export default function BlocA({ state, setField }: Props) {
  const descLen = state.description_bien?.length || 0

  const handleVilleChange = (v: string) => {
    setField('ville', v)
    // Changer de ville = nouvelles données : on repart du dataset Capsul (vide si inconnue)
    setField('ville_infos', villeInfosToForm(findVille(v)?.infos))
  }

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
              onValueChange={handleVilleChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une ville" />
              </SelectTrigger>
              <SelectContent>
                {NOMS_VILLES.map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="nom_projet">Nom du projet</Label>
            <Input
              id="nom_projet"
              placeholder={nomProjetAuto(state.adresse, state.ville)}
              value={state.nom_projet}
              onChange={(e) => setField('nom_projet', e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground">
              Optionnel : laissé vide, le projet prend l'adresse du bien. Modifiable à tout moment.
            </p>
          </div>

        </CardContent>
      </Card>

      {/* Infos ville (page 2 de la fiche) */}
      {state.ville && (
        <VilleInfosCard
          ville={state.ville}
          infos={state.ville_infos}
          onChange={(next) => setField('ville_infos', next)}
        />
      )}

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
            <Textarea
              id="description"
              minRows={5}
              maxLength={MAX_DESCRIPTION}
              placeholder="Appartement traversant situé au cœur du centre-ville, à 5 minutes à pied de…"
              value={state.description_bien}
              onChange={(e) => setField('description_bien', e.target.value)}
            />
            <div className="flex justify-between items-center">
              <p className="text-[11px] text-muted-foreground">
                Apparaîtra en page « Le bien » de la fiche commerciale.
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
