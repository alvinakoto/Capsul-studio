// ============================================================
// Ligne `projects` (Supabase, snake_case) → données du moteur
// ============================================================
// Point unique de conversion pour l'UI (en-tête projet, cartes du dashboard,
// simulateur) : chaque écran qui affiche un prix projet ou une mensualité passe
// par ici puis par le moteur, au lieu de recalculer à sa façon.

import {
  DonneesProjet, DonneesFinancement, DonneesCharges, LotCalcul, ParamsScenario, ResultatsImmeuble,
} from './types'
import { calculerPrixProjet, calculerFinancement, calculerApportMinimum } from './communs'
import { calculerImmeuble } from './immeuble'
import {
  libelleLot, lireImmeuble,
  type ExploitationSaisie, type ImmeubleSaisie, type ParametresCommuns,
} from '@/lib/data/immeuble'

export function donneesProjet(project: any): DonneesProjet {
  return {
    prixAchat:          project.prix_achat || 0,
    fraisNotairePct:    project.frais_notaire_pct || 0,
    travaux:            project.travaux || 0,
    mobilier:           project.mobilier || 0,
    honorairesCapsul:   project.honoraires_capsul || 0,
    honorairesOverride: project.honoraires_override ?? false,
    autresFrais:        project.autres_frais || 0,
    fraisAgence:        project.frais_agence || undefined,
  }
}

export function donneesFinancement(project: any): DonneesFinancement {
  return {
    apport:             project.apport || 0,
    dureeAnnees:        project.duree_annees || 20,
    tauxInteretPct:     project.taux_interet_pct || 0,
    tauxAssurancePct:   project.taux_assurance_pct || 0,
    isComptantOverride: project.is_comptant ?? false,
  }
}

export function donneesCharges(project: any): DonneesCharges {
  return {
    taxeFonciere:          project.taxe_fonciere || 0,
    chargesCoproAnnuelles: project.charges_copro_annuelles || 0,
    assurancePno:          project.assurance_pno || 0,
    electriciteEau:        project.electricite_eau || 0,
    internet:              project.internet || 0,
    chauffage:             project.chauffage || 0,
    fraisComptabilite:     project.frais_comptabilite || 0,
    autresCharges:         project.autres_charges || 0,
    cfe:                   project.cfe ?? 300,
  }
}

/** Prix projet total et plan de financement d'un projet, tels que les calcule le moteur. */
export function syntheseProjet(project: any) {
  const prix = calculerPrixProjet(donneesProjet(project))
  const financement = calculerFinancement(prix.prixProjetTotal, donneesFinancement(project))
  return { ...prix, ...financement }
}

/**
 * Apport inférieur aux frais que la banque ne finance pas (notaire, honoraires,
 * ameublement…) : renvoie le minimum et le manque, sinon `null`.
 */
export function alerteApport(project: any): { minimum: number; manque: number } | null {
  if (project.apport === null || project.apport === undefined || project.is_comptant) return null
  const minimum = calculerApportMinimum(donneesProjet(project))
  const manque = minimum - (Number(project.apport) || 0)
  return manque > 0 ? { minimum, manque } : null
}

// ─── Immeuble (projects.immeuble) ─────────────────────────────────────────────

const SANS_CHARGES_PROPRES = { electriciteEau: 0, internet: 0, chauffage: 0 }

/**
 * Exploitation saisie → paramètres du moteur, les pourcentages non détaillés
 * suivant les paramètres communs de l'immeuble. `manquant` : champ requis encore
 * vide (état normal pendant la saisie, pas une erreur).
 */
export function resoudreExploitation(
  e: ExploitationSaisie,
  communs: ParametresCommuns,
): { scenario: ParamsScenario } | { manquant: string } {
  if (e.type === 'lmnp_meuble') {
    if (!e.loyerMensuel) return { manquant: 'loyer mensuel à renseigner' }
    return { scenario: { type: 'lmnp_meuble', params: {
      loyerMensuel: e.loyerMensuel,
      vacancePct: e.vacancePct ?? communs.vacanceMeublePct,
      fraisGestionPct: e.fraisGestionPct ?? communs.fraisGestionPct,
    } } }
  }
  if (e.type === 'colocation') {
    if (!e.nbChambres) return { manquant: 'nombre de chambres à renseigner' }
    if (!e.loyerParChambre) return { manquant: 'loyer par chambre à renseigner' }
    return { scenario: { type: 'colocation', params: {
      nbChambres: e.nbChambres,
      loyerParChambre: e.loyerParChambre,
      vacancePct: e.vacancePct ?? communs.vacanceColocationPct,
      fraisGestionPct: e.fraisGestionPct ?? communs.fraisGestionPct,
    } } }
  }
  if (!e.prixNuitee) return { manquant: 'prix par nuit à renseigner' }
  return { scenario: { type: 'courte_duree', params: {
    prixNuitee: e.prixNuitee,
    nuitsConservateur: e.nuitsConservateur ?? 16,
    nuitsOptimiste: e.nuitsOptimiste ?? 22,
    conciergeriePct: e.conciergeriePct ?? communs.conciergeriePct,
  } } }
}

/**
 * Lots d'un immeuble prêts pour calculerImmeuble, ou la liste de ce qui manque
 * (« Lot 3 : loyer mensuel à renseigner »). Une comparaison incomplète est
 * ignorée sans bloquer le calcul. null pour un bien simple.
 */
export function donneesImmeuble(project: any):
  | { immeuble: ImmeubleSaisie; lots: LotCalcul[]; fluidesGlobaux: number; manquants: string[] }
  | null {
  const immeuble = lireImmeuble(project.immeuble)
  if (!immeuble) return null

  const manquants: string[] = []
  const lots: LotCalcul[] = []
  immeuble.lots.forEach((lot, i) => {
    const nom = libelleLot(lot, i)
    if (!lot.exploitation) { manquants.push(`${nom} : exploitation à choisir`); return }
    const retenue = resoudreExploitation(lot.exploitation, immeuble.parametres)
    if ('manquant' in retenue) { manquants.push(`${nom} : ${retenue.manquant}`); return }
    const comparaison = lot.comparaison ? resoudreExploitation(lot.comparaison, immeuble.parametres) : null
    lots.push({
      scenario: retenue.scenario,
      chargesPropres: immeuble.chargesPropres === 'par_lot' ? (lot.chargesPropres ?? SANS_CHARGES_PROPRES) : SANS_CHARGES_PROPRES,
      comparaison: comparaison && 'scenario' in comparaison ? comparaison.scenario : null,
    })
  })

  // Charges propres saisies en global : un seul montant pour l'immeuble (Bloc E)
  const fluidesGlobaux = immeuble.chargesPropres === 'global'
    ? (Number(project.electricite_eau) || 0) + (Number(project.internet) || 0) + (Number(project.chauffage) || 0)
    : 0

  return { immeuble, lots, fluidesGlobaux, manquants }
}

/**
 * Calcul complet d'un immeuble, ou ce qui manque pour le faire. null pour un bien
 * simple. `fluidesGlobaux` : charges propres saisies en global (0 si par lot).
 */
export function calculerProjetImmeuble(project: any):
  | { immeuble: ImmeubleSaisie; fluidesGlobaux: number; resultats: ResultatsImmeuble; manquants: [] }
  | { immeuble: ImmeubleSaisie; fluidesGlobaux: number; resultats: null; manquants: string[] }
  | null {
  const d = donneesImmeuble(project)
  if (!d) return null
  if (d.manquants.length > 0) return { immeuble: d.immeuble, fluidesGlobaux: d.fluidesGlobaux, resultats: null, manquants: d.manquants }
  const resultats = calculerImmeuble(
    donneesProjet(project), donneesFinancement(project), donneesCharges(project), d.lots, d.fluidesGlobaux,
  )
  return { immeuble: d.immeuble, fluidesGlobaux: d.fluidesGlobaux, resultats, manquants: [] }
}
