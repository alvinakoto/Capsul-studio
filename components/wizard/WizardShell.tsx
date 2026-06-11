'use client'

import { useReducer, useState, type ReactElement } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import BlocA from './BlocA'
import BlocB from './BlocB'
import BlocC from './BlocC'
import BlocD from './BlocD'
import BlocE from './BlocE'
import BlocF from './BlocF'
import RecapSticky from './RecapSticky'
import { createProject } from '@/lib/supabase/projects'
import { uploadPhoto } from '@/lib/supabase/storage'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WizardState {
  // Bloc A
  adresse: string
  ville: string
  surface_m2: number | ''
  dpe: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | ''
  type_bien: 'studio' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'T6+' | 'maison' | ''

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
  autres_charges: number
}

export type WizardAction =
  | { type: 'SET_FIELD'; field: keyof WizardState; value: WizardState[keyof WizardState] }
  | { type: 'RESET' }

const initialState: WizardState = {
  adresse: '',
  ville: '',
  surface_m2: '',
  dpe: '',
  type_bien: '',

  prix_achat: '',
  frais_notaire_pct: 8.0,
  travaux: '',
  mobilier: '',
  honoraires_capsul: '',
  honoraires_override: false,
  plan_3d: 0,
  autres_frais: 0,

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

export default function WizardShell({ projectId }: { projectId?: string }): ReactElement {
  const [state, dispatch] = useReducer(wizardReducer, initialState)
  const [stagedPhotos, setStagedPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [activeBloc, setActiveBloc] = useState('A')
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const setField = <K extends keyof WizardState>(field: K, value: WizardState[K]) => {
    dispatch({ type: 'SET_FIELD', field, value })
  }

  const handleAddPhotos = (files: File[]) => {
    const remaining = 10 - stagedPhotos.length
    const toAdd = files.slice(0, remaining)
    setStagedPhotos((prev) => [...prev, ...toAdd])
    const newPreviews = toAdd.map((f) => URL.createObjectURL(f))
    setPreviews((prev) => [...prev, ...newPreviews])
  }

  const handleRemovePhoto = (index: number) => {
    URL.revokeObjectURL(previews[index])
    setStagedPhotos((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = async (photos: File[]) => {
    try {
      setSaving(true)

      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non connecté')

      // 1. Créer le projet en base
      const newProjectId = await createProject(state, user.id)

      // 2. Uploader les photos
      if (photos.length > 0) {
        await Promise.all(
          photos.map((file, i) => uploadPhoto(newProjectId, file, i))
        )
      }

      // 3. Rediriger vers le détail projet
      router.push(`/projets/${newProjectId}`)

    } catch (err) {
      console.error('Erreur lors de la sauvegarde :', err)
      alert('Une erreur est survenue. Vérifie la console.')
    } finally {
      setSaving(false)
    }
  }

  const currentIndex = BLOCS.findIndex((b) => b.id === activeBloc)

  return (
    <div className="flex gap-8 items-start">

      {/* Zone principale */}
      <div className="flex-1 min-w-0">
        <Tabs value={activeBloc} onValueChange={setActiveBloc}>
          <TabsList className="w-full justify-start mb-6 h-10">
            {BLOCS.map((bloc) => (
              <TabsTrigger key={bloc.id} value={bloc.id} className="gap-1.5 text-sm">
                <span className="font-mono text-xs opacity-50">{bloc.id}</span>
                {bloc.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="A"><BlocA state={state} setField={setField} /></TabsContent>
          <TabsContent value="B">
            <BlocB
              stagedPhotos={stagedPhotos}
              previews={previews}
              onAddPhotos={handleAddPhotos}
              onRemovePhoto={handleRemovePhoto}
            />
          </TabsContent>
          <TabsContent value="C"><BlocC state={state} setField={setField} /></TabsContent>
          <TabsContent value="D"><BlocD state={state} setField={setField} /></TabsContent>
          <TabsContent value="E"><BlocE state={state} setField={setField} /></TabsContent>
          <TabsContent value="F">
  <BlocF
    state={state}
    onScenarioChange={(type, loyer) => {
      setField('scenario_type' as any, type)
      setField('loyer_cible' as any, loyer)
    }}
  />
</TabsContent>
        </Tabs>

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-4 border-t">
          <button
            onClick={() => setActiveBloc(BLOCS[currentIndex - 1].id)}
            disabled={currentIndex === 0}
            className="px-4 py-2 text-sm rounded-lg border hover:bg-muted transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Précédent
          </button>

          {currentIndex < BLOCS.length - 1 ? (
            <button
              onClick={() => setActiveBloc(BLOCS[currentIndex + 1].id)}
              className="px-4 py-2 text-sm rounded-lg bg-foreground text-background hover:opacity-90 transition"
            >
              Suivant →
            </button>
          ) : (
            <button
              onClick={() => handleSave(stagedPhotos)}
              disabled={saving}
              className="px-5 py-2 text-sm rounded-lg bg-foreground text-background font-medium hover:opacity-90 transition disabled:opacity-50"
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