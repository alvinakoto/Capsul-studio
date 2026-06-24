export interface PhotoInfo {
  url: string
  legende: string | null
}

export interface LigneAmortissement {
  annee: number
  capitalRembourse: number
  interets: number
  capitalRestant: number
}

export interface DetailFiscalLMNP {
  amortBien: number
  amortMobilier: number
  amortTravaux: number
  amortTotal: number
  chargesDeductibles: number
  interetsAnnee1: number
  revenusNets: number
  resultatFiscal: number
  impotAnnuel: number
}

export interface RapportData {
  project: any
  chargeNom: string
  scenarioType: string
  loyer: number
  isComptant: boolean
  prixProjetTotal: number
  fraisNotaireEuros: number
  honorairesCapsul: number
  capitalEmprunte: number
  mensualiteCredit: number
  assuranceMensuelle: number
  mensualiteTotale: number
  coutTotalInterets: number
  scenarioResult: any | null
  tableauAmortissement: LigneAmortissement[]
  detailFiscal: DetailFiscalLMNP | null
  projectionConservateur: any[]
  projectionRealiste: any[]
}

export interface FicheData {
  project: {
    id: string
    name: string
    adresse: string | null
    ville: string | null
    city: string
    surface_m2: number | null
    type_bien: string | null
    dpe_actuel: string | null
    dpe_apres_travaux: string | null
    description_bien: string | null
    prix_achat: number
    frais_notaire_pct: number
    travaux: number | null
    mobilier: number | null
    honoraires_capsul: number | null
    plan_3d: number | null
    autres_frais: number | null
    apport: number | null
    duree_annees: number | null
    taux_interet_pct: number | null
    taux_assurance_pct: number | null
    taxe_fonciere: number | null
    charges_copro_annuelles: number | null
    assurance_pno: number | null
    frais_comptabilite: number | null
    scenario_type: string | null
    loyer_cible: number | null
  }
  chargeNom: string
  coverPhotoUrl: string | null
  mainPhotoUrl: string | null
  mainPhotoLegende: string | null
  secondaryPhotos: PhotoInfo[]
  scenarioResult: any | null
  prixProjetTotal: number
  capitalEmprunte: number
  mensualiteTotale: number
  projectionConservateur: any[]
  projectionRealiste: any[]
}