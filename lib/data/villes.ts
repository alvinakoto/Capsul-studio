// ============================================================
// CAPSUL STUDIO — Villes : types et règles partagées
// ============================================================
// Les données vivent en base : table `villes`, catalogue partagé par tous les
// chargés (lecture/écriture : lib/supabase/villes.ts). Ce fichier ne garde que
// les types, les limites de saisie et les conversions formulaire ↔ données,
// partagés par l'écran Villes, le wizard, la fiche PDF et le diagnostic.
//
// Les textes du PDF diagnostic (pipeline Make) restent dans le code :
// lib/data/villesDiagnostic.ts.
//
// ⚠️ Chiffres du premier jeu (8 villes reprises de l'ancien fichier) à valider
// par la direction. Ils se corrigent désormais depuis l'écran Villes.

/** Infos de base de la page « La ville », modifiables projet par projet (`projects.ville_infos`). */
export interface VilleInfos {
  surnom?: string              // « La cité des sacres »
  habitants?: number
  etudiants?: number
  acces?: string               // « à 45 min de Paris en TGV »
  atout?: string               // « 12ème ville de France », « Capitale du Champagne »…
  prixM2Min?: number           // €/m² appartement, bas de fourchette
  prixM2Max?: number           // €/m² appartement, haut de fourchette
  rendementMoyenPct?: number   // rendement brut moyen constaté sur la ville
}

export interface ImageVille {
  path: string                 // chemin dans le bucket Storage `villes`
  url: string                  // URL publique (bucket public)
}

/** Ville du catalogue, telle que l'app la manipule (cf. ligneVersVille). */
export interface Ville {
  id: string
  nom: string
  slug: string                 // figé à la création
  infos: VilleInfos
  // Champs du catalogue uniquement : jamais copiés dans projects.ville_infos,
  // jamais modifiables projet par projet (décision S9 : trop long à ressaisir
  // à chaque projet). Modifiables une fois pour toutes depuis l'écran Villes.
  aireAttraction: number | null              // population de l'aire d'attraction (INSEE)
  croissanceDemographiquePct: number | null  // variation annuelle moyenne, ex. 0.8 → « +0,8 %/an »
  quartiers: string[]                        // quartiers où investir, nom seul
  projetsAVenir: string[]                    // projets d'aménagement, une ligne chacun
  zoneTouristique: boolean                   // favorise la courte durée dans la suggestion de scénario
  photo: ImageVille | null                   // bandeau de la page « La ville »
  carte: (ImageVille & { largeur: number; hauteur: number }) | null  // carte des quartiers
  modifieeLe: string
  modifieePar: string | null
}

// ─── Limites de saisie ──────────────────────────────────────────────────────
// Calées sur les textes les plus longs du premier jeu, puis validées par un
// rendu réel de la page « La ville » avec tous les champs au maximum : au-delà,
// react-pdf ajoute une page sans prévenir. Les deux listes ont en plus un budget
// de caractères au total (= la ville la plus fournie du premier jeu : Nancy pour
// les quartiers, Amiens pour les projets) : c'est leur longueur cumulée, pas
// celle d'une ligne, qui fait déborder la page.
export const LIMITES_VILLE = {
  nom: 30,
  surnom: 40,
  acces: 40,
  atout: 40,
  quartiers: 5,
  quartier: 50,
  quartiersTotal: 130,
  projets: 4,
  projet: 160,
  projetsTotal: 380,
} as const

/** Caractères cumulés d'une liste (lignes renseignées). */
export function longueurListe(lignes: string[]): number {
  return lignesRenseignees(lignes).reduce((n, l) => n + l.length, 0)
}

/** Identifiant stable d'une ville (chemins Storage, textes du diagnostic) : « Châlons-en-Champagne » → « chalons-en-champagne ». */
export function slugVille(nom: string): string {
  return nom
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Vrai si au moins une information est renseignée (page « La ville » à générer). */
export function hasVilleInfos(infos: VilleInfos | null | undefined): boolean {
  if (!infos) return false
  return Object.values(infos).some((val) => val !== undefined && val !== null && val !== '')
}

// ─── Forme « formulaire » des infos de base (wizard, écran Villes) ────────────
// Mêmes clés que VilleInfos, avec '' pour « non renseigné » (inputs contrôlés).

export interface VilleInfosForm {
  surnom: string
  habitants: number | ''
  etudiants: number | ''
  acces: string
  atout: string
  prixM2Min: number | ''
  prixM2Max: number | ''
  rendementMoyenPct: number | ''
}

export function villeInfosToForm(infos?: VilleInfos | null): VilleInfosForm {
  return {
    surnom:            infos?.surnom ?? '',
    habitants:         infos?.habitants ?? '',
    etudiants:         infos?.etudiants ?? '',
    acces:             infos?.acces ?? '',
    atout:             infos?.atout ?? '',
    prixM2Min:         infos?.prixM2Min ?? '',
    prixM2Max:         infos?.prixM2Max ?? '',
    rendementMoyenPct: infos?.rendementMoyenPct ?? '',
  }
}

/** Formulaire → objet persistable (clés vides retirées) ; `null` si rien n'est renseigné. */
export function formToVilleInfos(form: VilleInfosForm): VilleInfos | null {
  const infos: VilleInfos = {}
  const txt = (v: string) => (v.trim() ? v.trim() : undefined)
  const num = (v: number | '') => (v === '' ? undefined : v)
  if (txt(form.surnom)) infos.surnom = txt(form.surnom)
  if (num(form.habitants) !== undefined) infos.habitants = num(form.habitants)
  if (num(form.etudiants) !== undefined) infos.etudiants = num(form.etudiants)
  if (txt(form.acces)) infos.acces = txt(form.acces)
  if (txt(form.atout)) infos.atout = txt(form.atout)
  if (num(form.prixM2Min) !== undefined) infos.prixM2Min = num(form.prixM2Min)
  if (num(form.prixM2Max) !== undefined) infos.prixM2Max = num(form.prixM2Max)
  if (num(form.rendementMoyenPct) !== undefined) infos.rendementMoyenPct = num(form.rendementMoyenPct)
  return hasVilleInfos(infos) ? infos : null
}

// ─── Formulaire complet d'une ville du catalogue (écran Villes) ──────────────

export interface VilleForm {
  nom: string
  infos: VilleInfosForm
  aireAttraction: number | ''
  croissanceDemographiquePct: number | ''
  quartiers: string[]
  projetsAVenir: string[]
  zoneTouristique: boolean
}

export function villeVersForm(ville?: Ville | null): VilleForm {
  return {
    nom: ville?.nom ?? '',
    infos: villeInfosToForm(ville?.infos),
    aireAttraction: ville?.aireAttraction ?? '',
    croissanceDemographiquePct: ville?.croissanceDemographiquePct ?? '',
    quartiers: ville?.quartiers ?? [],
    projetsAVenir: ville?.projetsAVenir ?? [],
    zoneTouristique: ville?.zoneTouristique ?? false,
  }
}

/** Lignes d'une liste (quartiers, projets) nettoyées : espaces retirés, lignes vides ignorées. */
export function lignesRenseignees(lignes: string[]): string[] {
  return lignes.map((l) => l.trim()).filter(Boolean)
}

export type ChampVille =
  | 'nom' | keyof VilleInfosForm
  | 'aireAttraction' | 'croissanceDemographiquePct' | 'quartiers' | 'projetsAVenir'

/** Problèmes bloquants du formulaire, champ par champ (en français), dans l'ordre d'affichage. */
export function erreursVilleForm(form: VilleForm): Partial<Record<ChampVille, string>> {
  const erreurs: Partial<Record<ChampVille, string>> = {}
  const { infos } = form

  const nom = form.nom.trim()
  if (!nom) erreurs.nom = 'Indiquez le nom de la ville.'
  else if (nom.length > LIMITES_VILLE.nom) erreurs.nom = `${LIMITES_VILLE.nom} caractères maximum.`
  else if (!slugVille(nom)) erreurs.nom = 'Le nom doit contenir au moins une lettre.'

  const textes: [ChampVille, string, number][] = [
    ['surnom', infos.surnom, LIMITES_VILLE.surnom],
    ['acces', infos.acces, LIMITES_VILLE.acces],
    ['atout', infos.atout, LIMITES_VILLE.atout],
  ]
  for (const [champ, valeur, max] of textes) {
    if (valeur.trim().length > max) erreurs[champ] = `${max} caractères maximum.`
  }

  const positifs: [ChampVille, number | ''][] = [
    ['habitants', infos.habitants],
    ['etudiants', infos.etudiants],
    ['aireAttraction', form.aireAttraction],
    ['prixM2Min', infos.prixM2Min],
    ['prixM2Max', infos.prixM2Max],
    ['rendementMoyenPct', infos.rendementMoyenPct],
  ]
  for (const [champ, valeur] of positifs) {
    if (valeur !== '' && valeur < 0) erreurs[champ] = 'La valeur ne peut pas être négative.'
  }
  if (form.croissanceDemographiquePct !== '' && Math.abs(form.croissanceDemographiquePct) > 10) {
    erreurs.croissanceDemographiquePct = 'Entre -10 % et +10 % par an.'
  }
  if (!erreurs.prixM2Max && infos.prixM2Min !== '' && infos.prixM2Max !== '' && infos.prixM2Min > infos.prixM2Max) {
    erreurs.prixM2Max = 'Le prix haut doit être supérieur au prix bas.'
  }
  if (!erreurs.rendementMoyenPct && infos.rendementMoyenPct !== '' && infos.rendementMoyenPct > 30) {
    erreurs.rendementMoyenPct = '30 % maximum.'
  }

  const quartiers = lignesRenseignees(form.quartiers)
  if (quartiers.length > LIMITES_VILLE.quartiers) erreurs.quartiers = `${LIMITES_VILLE.quartiers} quartiers maximum.`
  else if (quartiers.some((q) => q.length > LIMITES_VILLE.quartier)) {
    erreurs.quartiers = `${LIMITES_VILLE.quartier} caractères maximum par quartier.`
  } else if (longueurListe(quartiers) > LIMITES_VILLE.quartiersTotal) {
    erreurs.quartiers = `${LIMITES_VILLE.quartiersTotal} caractères maximum pour l’ensemble des quartiers.`
  }
  const projets = lignesRenseignees(form.projetsAVenir)
  if (projets.length > LIMITES_VILLE.projets) erreurs.projetsAVenir = `${LIMITES_VILLE.projets} projets maximum.`
  else if (projets.some((p) => p.length > LIMITES_VILLE.projet)) {
    erreurs.projetsAVenir = `${LIMITES_VILLE.projet} caractères maximum par projet.`
  } else if (longueurListe(projets) > LIMITES_VILLE.projetsTotal) {
    erreurs.projetsAVenir = `${LIMITES_VILLE.projetsTotal} caractères maximum pour l’ensemble des projets.`
  }
  return erreurs
}

/** Premier problème bloquant du formulaire ; `null` si tout est bon. */
export function erreurVilleForm(form: VilleForm): string | null {
  return Object.values(erreursVilleForm(form))[0] ?? null
}

/** Part des rubriques de la page « La ville » renseignées, pour l'indicateur de l'écran Villes. */
export function completudeVille(ville: Ville): { faites: number; total: number } {
  const i = ville.infos
  const rubriques = [
    !!ville.photo,
    !!ville.carte || ville.quartiers.length > 0,
    !!i.surnom,
    i.habitants !== undefined || i.etudiants !== undefined,
    !!i.acces || !!i.atout,
    i.prixM2Min !== undefined || i.prixM2Max !== undefined,
    i.rendementMoyenPct !== undefined,
    ville.projetsAVenir.length > 0,
  ]
  return { faites: rubriques.filter(Boolean).length, total: rubriques.length }
}
