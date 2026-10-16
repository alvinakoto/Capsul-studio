'use client'

import { useReducer, useState, useEffect, type ReactElement } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import BlocA from './BlocA'
import BlocB, { type StagedPhoto, type PhotoType } from './BlocB'
import BlocC from './BlocC'
import BlocD from './BlocD'
import BlocE from './BlocE'
import BlocF from './BlocF'
import type { TypeScenario } from '@/lib/engine/suggestions'
import RecapSticky from './RecapSticky'
import { createProject, updateProject } from '@/lib/supabase/projects'
import { uploadPhoto, getProjectPhotos, deletePhoto, type ExistingPhoto } from '@/lib/supabase/storage'
import { villeInfosToForm, type VilleInfosForm } from '@/lib/data/villes'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WizardState {
  // Bloc A
  nom_projet: string                   // vide → le nom du projet suit l'adresse du bien
  adresse: string
  ville: string
  ville_infos: VilleInfosForm          // page « La ville » de la fiche — pré-rempli depuis lib/data/villes.ts
  surface_m2: number | ''
  dpe_actuel: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | ''
  dpe_apres_travaux: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | ''
  type_bien: 'studio' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'T6+' | 'maison' | 'immeuble' | ''
  description_bien: string

  // Bloc C
  prix_achat: number | ''
  frais_notaire_pct: number
  travaux: number | ''
  travaux_postes: string[]             // identifiants du catalogue lib/data/travaux.ts
  commentaire_travaux: string          // optionnel — bas de la page Travaux de la fiche
  mobilier: number | ''
  honoraires_capsul: number | ''
  honoraires_override: boolean
  autres_frais: number
  travaux_estime: boolean
  frais_notaire_estime: boolean
  negociation_envisagee: boolean
  prix_affiche_origine: number | ''
  frais_agence: number | ''            // optionnel — permet de baser les honoraires Capsul sur le prix net vendeur

  // Bloc D
  is_comptant: boolean
  apport: number | ''
  duree_annees: number
  taux_interet_pct: number | ''
  taux_assurance_pct: number
  taux_interet_estime: boolean
  taux_assurance_estime: boolean

  // Bloc E
  taxe_fonciere: number | ''
  charges_copro_annuelles: number | ''
  assurance_pno: number | ''
  frais_comptabilite: number | ''
  electricite_eau: number
  internet: number
  chauffage: number
  cfe: number
  autres_charges: number
  charges_copro_estime: boolean
  taxe_fonciere_estime: boolean
  assurance_pno_estime: boolean
  frais_comptabilite_estime: boolean
  cfe_estime: boolean
  autres_charges_estime: boolean
}

export type WizardAction =
  | { type: 'SET_FIELD'; field: keyof WizardState; value: WizardState[keyof WizardState] }
  | { type: 'RESET' }

const initialState: WizardState = {
  nom_projet: '',
  adresse: '',
  ville: '',
  ville_infos: villeInfosToForm(),
  surface_m2: '',
  dpe_actuel: '',
  dpe_apres_travaux: '',
  type_bien: '',
  description_bien: '',

  prix_achat: '',
  frais_notaire_pct: 8.0,
  travaux: '',
  travaux_postes: [],
  commentaire_travaux: '',
  mobilier: '',
  honoraires_capsul: '',
  honoraires_override: false,
  autres_frais: 0,
  travaux_estime: true,
  frais_notaire_estime: true,
  negociation_envisagee: true,
  prix_affiche_origine: '',
  frais_agence: '',

  is_comptant: false,
  apport: '',
  duree_annees: 20,
  taux_interet_pct: '',
  taux_assurance_pct: 0,
  taux_interet_estime: true,
  taux_assurance_estime: true,

  taxe_fonciere: '',
  charges_copro_annuelles: '',
  assurance_pno: 200,
  frais_comptabilite: 430,
  electricite_eau: 0,
  internet: 0,
  chauffage: 0,
  cfe: 300,
  autres_charges: 0,
  charges_copro_estime: false,
  taxe_fonciere_estime: false,
  assurance_pno_estime: true,
  frais_comptabilite_estime: false,
  cfe_estime: true,
  autres_charges_estime: false,
}

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

// ─── Blocs ────────────────────────────────────────────────────────────────────

const BLOCS = [
  { id: 'A', label: 'Bien' },
  { id: 'B', label: 'Photos' },
  { id: 'C', label: 'Finances' },
  { id: 'D', label: 'Financement' },
  { id: 'E', label: 'Charges' },
  { id: 'F', label: 'Scénarios' },
]

// ─── Composant ────────────────────────────────────────────────────────────────

export default function WizardShell({
  projectId,
  initialData,
  editProjectId,
}: {
  projectId?: string
  initialData?: Partial<WizardState>
  editProjectId?: string
}): ReactElement {
  const [state, dispatch] = useReducer(
    wizardReducer,
    initialData ? { ...initialState, ...initialData } : initialState
  )

  // Photos staged (nouvelles)
  const [coverPhoto, setCoverPhoto] = useState<StagedPhoto | null>(null)
  const [mainPhoto, setMainPhoto] = useState<StagedPhoto | null>(null)
  const [secondaryPhotos, setSecondaryPhotos] = useState<StagedPhoto[]>([])
  const [localisationPhoto, setLocalisationPhoto] = useState<StagedPhoto | null>(null)

  // Photos existantes (mode édition)
  const [existingCover, setExistingCover] = useState<ExistingPhoto | null>(null)
  const [existingMain, setExistingMain] = useState<ExistingPhoto | null>(null)
  const [existingSecondary, setExistingSecondary] = useState<ExistingPhoto[]>([])
  const [existingLocalisation, setExistingLocalisation] = useState<ExistingPhoto | null>(null)

  // Chargement des photos existantes en mode édition
  useEffect(() => {
    if (!editProjectId) return
    getProjectPhotos(editProjectId).then((photos) => {
      setExistingCover(photos.find((p) => p.type === 'cover') ?? null)
      setExistingMain(photos.find((p) => p.type === 'main') ?? null)
      setExistingSecondary(photos.filter((p) => p.type === 'secondary'))
      setExistingLocalisation(photos.find((p) => p.type === 'localisation') ?? null)
    })
  }, [editProjectId])

  const handleDeleteExisting = async (photo: ExistingPhoto) => {
    await deletePhoto(photo.id, photo.storagePath)
    if (photo.type === 'cover') setExistingCover(null)
    else if (photo.type === 'main') setExistingMain(null)
    else if (photo.type === 'localisation') setExistingLocalisation(null)
    else setExistingSecondary((prev) => prev.filter((p) => p.id !== photo.id))
  }

  const [activeBloc, setActiveBloc] = useState('A')
  const [saving, setSaving] = useState(false)
  const [wizardScenario, setWizardScenario] = useState<TypeScenario | null>(null)
  const router = useRouter()

  const setField = <K extends keyof WizardState>(field: K, value: WizardState[K]) => {
    dispatch({ type: 'SET_FIELD', field, value })
  }

  // ─── Handlers photos ────────────────────────────────────────────────────────

  const handleSetCover = (file: File | null) => {
    if (coverPhoto) URL.revokeObjectURL(coverPhoto.preview)
    if (file) {
      setCoverPhoto({
        file,
        preview: URL.createObjectURL(file),
        type: 'cover',
        legende: '',
      })
    } else {
      setCoverPhoto(null)
    }
  }

  const handleSetMain = (file: File | null) => {
    if (mainPhoto) URL.revokeObjectURL(mainPhoto.preview)
    if (file) {
      setMainPhoto({
        file,
        preview: URL.createObjectURL(file),
        type: 'main',
        legende: '',
      })
    } else {
      setMainPhoto(null)
    }
  }

  const handleAddSecondary = (files: File[]) => {
    const remaining = 6 - secondaryPhotos.length
    const toAdd = files.slice(0, remaining).map<StagedPhoto>((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
      type: 'secondary' as PhotoType,
      legende: '',
    }))
    setSecondaryPhotos((prev) => [...prev, ...toAdd])
  }

  const handleRemoveSecondary = (index: number) => {
    setSecondaryPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleUpdateLegende = (target: 'main', legende: string) => {
    if (target === 'main' && mainPhoto) {
      setMainPhoto({ ...mainPhoto, legende })
    }
  }

  const handleSetLocalisation = (file: File | null) => {
    if (localisationPhoto) URL.revokeObjectURL(localisationPhoto.preview)
    if (file) {
      setLocalisationPhoto({
        file,
        preview: URL.createObjectURL(file),
        type: 'localisation',
        legende: '',
      })
    } else {
      setLocalisationPhoto(null)
    }
  }

  // ─── Sauvegarde ────────────────────────────────────────────────────────────

  const handleSave = async () => {
    try {
      setSaving(true)

      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non connecté')

      if (editProjectId) {
        // ── Mode édition : UPDATE + upload des nouvelles photos ─────────
        await updateProject(editProjectId, state, user.id)
        const uploads: Promise<void>[] = []
        if (coverPhoto)
          uploads.push(uploadPhoto(editProjectId, coverPhoto.file, 0, 'cover', coverPhoto.legende))
        if (mainPhoto)
          uploads.push(uploadPhoto(editProjectId, mainPhoto.file, 0, 'main', mainPhoto.legende))
        if (localisationPhoto)
          uploads.push(uploadPhoto(editProjectId, localisationPhoto.file, 0, 'localisation', ''))
        secondaryPhotos.forEach((p, i) =>
          uploads.push(uploadPhoto(editProjectId, p.file, existingSecondary.length + i, 'secondary', p.legende))
        )
        await Promise.all(uploads)
        router.push(`/projets/${editProjectId}`)
        return
      }

      // ── Mode création : INSERT + upload photos ──────────────────────
      // Le loyer cible se saisit désormais uniquement dans le simulateur
      // (ScenarioPanel) après création du projet ; seul le type de scénario
      // choisi ici est transmis.
      const newProjectId = await createProject(
        state, user.id,
        wizardScenario ? { scenarioType: wizardScenario } : undefined
      )

      const uploads: Promise<void>[] = []
      if (coverPhoto) {
        uploads.push(uploadPhoto(newProjectId, coverPhoto.file, 0, 'cover', coverPhoto.legende))
      }
      if (mainPhoto) {
        uploads.push(uploadPhoto(newProjectId, mainPhoto.file, 0, 'main', mainPhoto.legende))
      }
      if (localisationPhoto) {
        uploads.push(uploadPhoto(newProjectId, localisationPhoto.file, 0, 'localisation', ''))
      }
      secondaryPhotos.forEach((p, i) => {
        uploads.push(uploadPhoto(newProjectId, p.file, i, 'secondary', p.legende))
      })
      await Promise.all(uploads)

      router.push(`/projets/${newProjectId}`)

    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde :', err)
      const msg = err?.message ?? err?.error_description ?? JSON.stringify(err)
      alert(`Erreur : ${msg}`)
    } finally {
      setSaving(false)
    }
  }

  const blocs = BLOCS
  const currentIndex = blocs.findIndex((b) => b.id === activeBloc)

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-6 items-start">
      {/* Zone principale */}
      <div className="min-w-0">
        {/* Étapes */}
        <nav className="grid grid-cols-3 md:grid-cols-6 gap-x-1.5 gap-y-3.5 mb-7" aria-label="Étapes">
          {blocs.map((bloc, i) => {
            const active = activeBloc === bloc.id
            return (
              <button
                key={bloc.id}
                onClick={() => setActiveBloc(bloc.id)}
                aria-current={active ? 'step' : undefined}
                className="grid gap-1 pb-2.5 text-left transition-colors hover:text-[var(--cs-navy)]"
                style={{
                  borderBottom: `2px solid ${active ? 'var(--cs-navy)' : 'var(--cs-line)'}`,
                  color: active ? 'var(--cs-navy)' : 'var(--cs-mist)',
                }}
              >
                <span className="text-[11px] font-bold tracking-[0.08em]" style={{ color: active ? 'var(--cs-gold-ink)' : undefined }}>
                  ÉTAPE {i + 1}
                </span>
                <span className="text-[13px] font-semibold">{bloc.label}</span>
              </button>
            )
          })}
        </nav>

        <Tabs value={activeBloc} onValueChange={setActiveBloc}>
          <TabsContent value="A"><BlocA state={state} setField={setField} /></TabsContent>
          <TabsContent value="B">
            <BlocB
              coverPhoto={coverPhoto}
              mainPhoto={mainPhoto}
              secondaryPhotos={secondaryPhotos}
              localisationPhoto={localisationPhoto}
              onSetCover={handleSetCover}
              onSetMain={handleSetMain}
              onAddSecondary={handleAddSecondary}
              onRemoveSecondary={handleRemoveSecondary}
              onUpdateLegende={handleUpdateLegende}
              onSetLocalisation={handleSetLocalisation}
              existingCover={existingCover}
              existingMain={existingMain}
              existingSecondary={existingSecondary}
              existingLocalisation={existingLocalisation}
              onDeleteExisting={handleDeleteExisting}
            />
          </TabsContent>
          <TabsContent value="C"><BlocC state={state} setField={setField} /></TabsContent>
          <TabsContent value="D"><BlocD state={state} setField={setField} /></TabsContent>
          <TabsContent value="E"><BlocE state={state} setField={setField} /></TabsContent>
          <TabsContent value="F">
            <BlocF
              state={state}
              onScenarioChange={setWizardScenario}
            />
          </TabsContent>
        </Tabs>

        {/* Navigation */}
        <div className="cs-card flex items-center justify-between gap-3 mt-5 px-4 py-3.5">
          <button
            onClick={() => setActiveBloc(blocs[currentIndex - 1].id)}
            disabled={currentIndex === 0}
            className="cs-btn"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
            Précédent
          </button>
          <span className="hidden sm:inline text-[12.5px]" style={{ color: 'var(--cs-mist)' }}>
            Étape <b style={{ color: 'var(--cs-navy)' }}>{currentIndex + 1}</b> sur {blocs.length}
          </span>
          {editProjectId ? (
            <button onClick={handleSave} disabled={saving} className="cs-btn cs-btn-gold">
              {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
            </button>
          ) : currentIndex < blocs.length - 1 ? (
            <button onClick={() => setActiveBloc(blocs[currentIndex + 1].id)} className="cs-btn cs-btn-primary">
              Suivant : {blocs[currentIndex + 1].label}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          ) : (
            <button onClick={handleSave} disabled={saving} className="cs-btn cs-btn-gold">
              {saving ? 'Enregistrement…' : 'Enregistrer le projet'}
            </button>
          )}
        </div>
      </div>

      {/* Récap sticky */}
      <div className="xl:sticky xl:top-6">
        <RecapSticky state={state} />
      </div>

    </div>
  )
}