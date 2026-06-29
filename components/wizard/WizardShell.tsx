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

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WizardState {
  // Bloc A
  adresse: string
  ville: string
  surface_m2: number | ''
  dpe_actuel: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | ''
  dpe_apres_travaux: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | ''
  type_bien: 'studio' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'T6+' | 'maison' | ''
  description_bien: string

  // Bloc C
  prix_achat: number | ''
  frais_notaire_pct: number
  travaux: number | ''
  mobilier: number | ''
  honoraires_capsul: number | ''
  honoraires_override: boolean
  plan_3d: number
  autres_frais: number

  // Bloc D
  is_comptant: boolean
  apport: number | ''
  duree_annees: number
  taux_interet_pct: number | ''
  taux_assurance_pct: number

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
}

export type WizardAction =
  | { type: 'SET_FIELD'; field: keyof WizardState; value: WizardState[keyof WizardState] }
  | { type: 'RESET' }

const initialState: WizardState = {
  adresse: '',
  ville: '',
  surface_m2: '',
  dpe_actuel: '',
  dpe_apres_travaux: '',
  type_bien: '',
  description_bien: '',

  prix_achat: '',
  frais_notaire_pct: 8.0,
  travaux: '',
  mobilier: '',
  honoraires_capsul: '',
  honoraires_override: false,
  plan_3d: 0,
  autres_frais: 0,

  is_comptant: false,
  apport: '',
  duree_annees: 20,
  taux_interet_pct: '',
  taux_assurance_pct: 0,

  taxe_fonciere: '',
  charges_copro_annuelles: '',
  assurance_pno: '',
  frais_comptabilite: 250,
  electricite_eau: 0,
  internet: 0,
  chauffage: 0,
  cfe: 300,
  autres_charges: 0,
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

  // Photos existantes (mode édition)
  const [existingCover, setExistingCover] = useState<ExistingPhoto | null>(null)
  const [existingMain, setExistingMain] = useState<ExistingPhoto | null>(null)
  const [existingSecondary, setExistingSecondary] = useState<ExistingPhoto[]>([])

  // Chargement des photos existantes en mode édition
  useEffect(() => {
    if (!editProjectId) return
    getProjectPhotos(editProjectId).then((photos) => {
      setExistingCover(photos.find((p) => p.type === 'cover') ?? null)
      setExistingMain(photos.find((p) => p.type === 'main') ?? null)
      setExistingSecondary(photos.filter((p) => p.type === 'secondary'))
    })
  }, [editProjectId])

  const handleDeleteExisting = async (photo: ExistingPhoto) => {
    await deletePhoto(photo.id, photo.storagePath)
    if (photo.type === 'cover') setExistingCover(null)
    else if (photo.type === 'main') setExistingMain(null)
    else setExistingSecondary((prev) => prev.filter((p) => p.id !== photo.id))
  }

  const [activeBloc, setActiveBloc] = useState('A')
  const [saving, setSaving] = useState(false)
  const [wizardScenario, setWizardScenario] = useState<TypeScenario | null>(null)
  const [wizardLoyer, setWizardLoyer] = useState<number | ''>('')
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
        secondaryPhotos.forEach((p, i) =>
          uploads.push(uploadPhoto(editProjectId, p.file, existingSecondary.length + i, 'secondary', p.legende))
        )
        await Promise.all(uploads)
        router.push(`/projets/${editProjectId}`)
        return
      }

      // ── Mode création : INSERT + upload photos ──────────────────────
      const scenario =
        wizardScenario && wizardLoyer !== ''
          ? { loyerCible: wizardLoyer as number, scenarioType: wizardScenario }
          : undefined
      const newProjectId = await createProject(state, user.id, scenario)

      const uploads: Promise<void>[] = []
      if (coverPhoto) {
        uploads.push(uploadPhoto(newProjectId, coverPhoto.file, 0, 'cover', coverPhoto.legende))
      }
      if (mainPhoto) {
        uploads.push(uploadPhoto(newProjectId, mainPhoto.file, 0, 'main', mainPhoto.legende))
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
    <div className="flex gap-8 items-start">

      {/* Zone principale */}
      <div className="flex-1 min-w-0">
        {/* Step tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ backgroundColor: '#EDE9E1' }}>
          {blocs.map((bloc, i) => {
            const active = activeBloc === bloc.id
            return (
              <button
                key={bloc.id}
                onClick={() => setActiveBloc(bloc.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{
                  backgroundColor: active ? '#fff' : 'transparent',
                  color: active ? '#0E2240' : '#6E6E73',
                  boxShadow: active ? '0 1px 4px rgba(14,34,64,0.10)' : 'none',
                }}
              >
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                  style={{
                    backgroundColor: active ? '#0E2240' : '#DDD9D0',
                    color: active ? '#fff' : '#6E6E73',
                  }}
                >
                  {i + 1}
                </span>
                <span className="hidden sm:inline">{bloc.label}</span>
              </button>
            )
          })}
        </div>

        <Tabs value={activeBloc} onValueChange={setActiveBloc}>
          <TabsContent value="A"><BlocA state={state} setField={setField} /></TabsContent>
          <TabsContent value="B">
            <BlocB
              coverPhoto={coverPhoto}
              mainPhoto={mainPhoto}
              secondaryPhotos={secondaryPhotos}
              onSetCover={handleSetCover}
              onSetMain={handleSetMain}
              onAddSecondary={handleAddSecondary}
              onRemoveSecondary={handleRemoveSecondary}
              onUpdateLegende={handleUpdateLegende}
              existingCover={existingCover}
              existingMain={existingMain}
              existingSecondary={existingSecondary}
              onDeleteExisting={handleDeleteExisting}
            />
          </TabsContent>
          <TabsContent value="C"><BlocC state={state} setField={setField} /></TabsContent>
          <TabsContent value="D"><BlocD state={state} setField={setField} /></TabsContent>
          <TabsContent value="E"><BlocE state={state} setField={setField} /></TabsContent>
          <TabsContent value="F">
            <BlocF
              state={state}
              onScenarioChange={(type, loyer) => {
                setWizardScenario(type)
                setWizardLoyer(loyer)
              }}
            />
          </TabsContent>
        </Tabs>

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-4" style={{ borderTop: '1px solid #EDE9E1' }}>
          <button
            onClick={() => setActiveBloc(blocs[currentIndex - 1].id)}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ border: '1px solid #DDD9D0', color: '#1C1C1E', backgroundColor: 'transparent' }}
            onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#F7F5F1' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L5 7l4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Précédent
          </button>

          {editProjectId ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
              style={{ backgroundColor: '#C9943A', color: '#fff' }}
              onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#B8841F' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#C9943A' }}
            >
              {saving ? 'Enregistrement...' : 'Sauvegarder les modifications'}
            </button>
          ) : currentIndex < blocs.length - 1 ? (
            <button
              onClick={() => setActiveBloc(blocs[currentIndex + 1].id)}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{ backgroundColor: '#0E2240', color: '#fff' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#162F56' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0E2240' }}
            >
              Suivant
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 2l4 5-4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
              style={{ backgroundColor: '#C9943A', color: '#fff' }}
              onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#B8841F' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#C9943A' }}
            >
              {saving ? 'Enregistrement...' : 'Enregistrer le projet'}
            </button>
          )}
        </div>
      </div>

      {/* Récap sticky */}
      <div className="w-64 shrink-0 sticky top-6">
        <RecapSticky state={state} />
      </div>

    </div>
  )
}