'use client'

import { useRef, useState } from 'react'
import { ExternalLinkIcon, PlusIcon } from 'lucide-react'
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
import { Dialog, DialogContent } from '@/components/ui/dialog'
import FormulaireVille from '@/components/villes/FormulaireVille'
import { hasVilleInfos, villeInfosToForm, type Ville, type VilleInfosForm } from '@/lib/data/villes'
import { trouverVille } from '@/lib/supabase/villes'
import { nomProjetAuto } from '@/lib/supabase/projects'
import DpeSelect from './DpeSelect'
import LotsImmeuble from './LotsImmeuble'
import { nouvelImmeuble } from '@/lib/data/immeuble'

const TYPES_BIEN = ['studio', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6+', 'maison', 'immeuble']
// Calé pour garantir que la description + les 6 photos supplémentaires
// tiennent toujours sur une seule page du PDF (page « Le bien »). Testé
// empiriquement : au-delà de ~550 caractères avec 1-2 sauts de paragraphe
// (usage réel), le texte déborde sur la page suivante — marge de sécurité
// prise en dessous de ce seuil.
const MAX_DESCRIPTION = 400

interface Props {
  state: WizardState
  setField: <K extends keyof WizardState>(field: K, value: WizardState[K]) => void
  villes: Ville[] | null               // catalogue, null pendant le chargement
  erreurVilles: boolean
  onVilleMaj: (ville: Ville) => void   // ville ajoutée ou relue : mise à jour de la liste du wizard
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
  ville, infos, onChange, onVilleMaj,
}: {
  ville: Ville | null
  infos: VilleInfosForm
  onChange: (next: VilleInfosForm) => void
  onVilleMaj: (ville: Ville) => void
}) {
  const [relecture, setRelecture] = useState(false)
  const catalogueRenseigne = !!ville && hasVilleInfos(ville.infos)
  const set = <K extends keyof VilleInfosForm>(key: K, value: VilleInfosForm[K]) =>
    onChange({ ...infos, [key]: value })

  // Relit la fiche ville : elle a pu être complétée entre-temps (autre onglet, autre chargé)
  const reinitialiser = async () => {
    if (!ville) return
    setRelecture(true)
    try {
      const aJour = await trouverVille(ville.id)
      if (aJour) {
        onVilleMaj(aJour)
        onChange(villeInfosToForm(aJour.infos))
      }
    } finally {
      setRelecture(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 max-w-[52ch]">
            <CardTitle>Infos ville</CardTitle>
            <p className="text-[11px] text-muted-foreground mt-1">
              Page « La ville » de la fiche, ajustable pour ce projet. La photo, la carte et les quartiers
              viennent de la fiche de la ville, commune à tous les projets.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={catalogueRenseigne
                ? { backgroundColor: 'rgba(201,148,58,0.12)', color: 'var(--cs-gold-ink)' }
                : { backgroundColor: '#F0EDE7', color: '#6E6E73' }}
            >
              {catalogueRenseigne ? 'Données du catalogue' : 'Fiche ville à compléter'}
            </span>
            {catalogueRenseigne && (
              <button
                type="button"
                onClick={reinitialiser}
                disabled={relecture}
                className="text-[11px] font-medium text-[var(--cs-mist)] transition-colors hover:text-[var(--cs-navy)] disabled:opacity-60"
              >
                {relecture ? 'Relecture…' : 'Réinitialiser'}
              </button>
            )}
            {ville && (
              <a
                href={`/villes/${ville.id}`}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--cs-navy)] transition-colors hover:text-[var(--cs-gold-ink)]"
              >
                Fiche de la ville
                <ExternalLinkIcon size={12} strokeWidth={2.2} aria-hidden="true" />
                <span className="sr-only">(nouvel onglet)</span>
              </a>
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

export default function BlocA({ state, setField, villes, erreurVilles, onVilleMaj }: Props) {
  const descLen = state.description_bien?.length || 0
  const [ajoutVille, setAjoutVille] = useState(false)
  const boutonAjoutRef = useRef<HTMLButtonElement>(null)
  const villeChoisie = villes?.find((v) => v.id === state.ville_id) ?? null

  const selectionnerVille = (ville: Ville) => {
    setField('ville_id', ville.id)
    setField('ville', ville.nom)
    // Changer de ville = nouvelles données : on repart de la fiche de la ville (vide si à compléter)
    setField('ville_infos', villeInfosToForm(ville.infos))
  }

  // Immeuble détaillé lot par lot : surface et DPE se saisissent pour chaque lot
  const avecLots = state.type_bien === 'immeuble' && !!state.immeuble
  const handleTypeChange = (v: string) => {
    setField('type_bien', v as WizardState['type_bien'])
    if (v === 'immeuble' && !state.immeuble) setField('immeuble', nouvelImmeuble())
  }

  const handleVilleChange = (id: string) => {
    const ville = villes?.find((v) => v.id === id)
    if (ville) selectionnerVille(ville)
  }

  return (
    <div className="space-y-6">

      {/* Localisation */}
      <Card>
        <CardHeader>
          <CardTitle>Localisation</CardTitle>
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
            <Label htmlFor="ville">Ville</Label>
            <Select
              value={state.ville_id}
              onValueChange={handleVilleChange}
              disabled={villes === null}
            >
              <SelectTrigger id="ville">
                <SelectValue placeholder={villes === null ? 'Chargement des villes…' : 'Sélectionner une ville'}>
                  {state.ville_id ? state.ville : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {(villes ?? []).map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Hors du select : ouvrir une fenêtre depuis une option de Radix Select
                laisse la page bloquée (pointer-events: none sur <body>) */}
            <button
              ref={boutonAjoutRef}
              type="button"
              onClick={() => setAjoutVille(true)}
              className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[var(--cs-navy)] transition-colors hover:text-[var(--cs-gold-ink)]"
            >
              <PlusIcon size={13} strokeWidth={2.4} aria-hidden="true" />
              Ville absente de la liste ? Ajouter une ville
            </button>
            {erreurVilles && (
              <p className="text-[11px] font-medium" style={{ color: 'var(--cs-neg)' }}>
                Impossible de charger les villes. Rechargez la page.
              </p>
            )}
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

      {/* Infos ville (page « La ville » de la fiche) */}
      {state.ville_id && (
        <VilleInfosCard
          ville={villeChoisie}
          infos={state.ville_infos}
          onChange={(next) => setField('ville_infos', next)}
          onVilleMaj={onVilleMaj}
        />
      )}

      {/* Ajout d'une ville au catalogue sans quitter le wizard */}
      <Dialog open={ajoutVille} onOpenChange={setAjoutVille}>
        <DialogContent
          titre="Ajouter une ville au catalogue"
          description="Elle sera proposée à tous les chargés. Seul le nom est obligatoire : la fiche peut être complétée plus tard depuis l’écran Villes."
          className="max-w-[760px]"
          // Un clic à côté ne doit pas faire perdre une fiche en cours de saisie
          onInteractOutside={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => { e.preventDefault(); boutonAjoutRef.current?.focus() }}
        >
          <FormulaireVille
            ville={null}
            variante="fenetre"
            onCreee={onVilleMaj}
            onEnregistree={(ville) => {
              onVilleMaj(ville)
              selectionnerVille(ville)
              setAjoutVille(false)
            }}
            onAnnuler={() => setAjoutVille(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Caractéristiques */}
      <Card>
        <CardHeader>
          <CardTitle>Caractéristiques</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          {!avecLots && (
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
          )}

          <div className="space-y-1.5">
            <Label htmlFor="type_bien">Type de bien</Label>
            <Select value={state.type_bien} onValueChange={handleTypeChange}>
              <SelectTrigger id="type_bien">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {TYPES_BIEN.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!avecLots && (
            <>
              <DpeSelect
                id="dpe_actuel"
                label="DPE actuel"
                value={state.dpe_actuel}
                onChange={(v) => setField('dpe_actuel', v as WizardState['dpe_actuel'])}
                hint="Classe énergétique du diagnostic en cours"
              />

              <DpeSelect
                id="dpe_vise"
                label="DPE visé (après travaux)"
                value={state.dpe_apres_travaux}
                onChange={(v) => setField('dpe_apres_travaux', v as WizardState['dpe_apres_travaux'])}
                hint="Classe ciblée après rénovation"
              />
            </>
          )}

          {/* Immeuble saisi avant le détail par lot : simulé comme un seul bien tant que le chargé ne détaille pas */}
          {state.type_bien === 'immeuble' && !state.immeuble && (
            <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3" style={{ backgroundColor: 'var(--cs-ivory)' }}>
              <p className="text-[12.5px] max-w-[52ch]" style={{ color: 'var(--cs-ink)' }}>
                Cet immeuble est simulé comme un seul bien. Détaillez ses lots pour donner à chaque appartement
                sa typologie, son DPE et sa propre exploitation.
              </p>
              <button type="button" className="cs-btn cs-btn-primary h-9 px-3 text-[12.5px]" onClick={() => setField('immeuble', nouvelImmeuble())}>
                Détailler les lots
              </button>
            </div>
          )}

        </CardContent>
      </Card>

      {avecLots && state.immeuble && (
        <LotsImmeuble immeuble={state.immeuble} onChange={(next) => setField('immeuble', next)} />
      )}

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Description du bien</CardTitle>
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
