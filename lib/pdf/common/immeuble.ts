// ============================================================
// PDF — immeuble détaillé lot par lot (fiche commerciale et rapport)
// ============================================================
// Données et libellés partagés par la page « Les lots », la page Scénario
// consolidée et la synthèse du rapport. Les chiffres viennent du moteur
// (calculerProjetImmeuble, fluxMensuelsImmeuble) : rien n'est recalculé ici.

import { calculerProjetImmeuble, donneesCharges } from '@/lib/calculs/depuisProjet'
import { fluxMensuelsImmeuble, type CleChargeImmeuble } from '@/lib/calculs/immeuble'
import type { TypeScenario } from '@/lib/calculs/types'
import type { ExploitationSaisie, ImmeubleSaisie } from '@/lib/data/immeuble'
import type { ImmeublePdf } from '../types'
import { euros } from '../helpers'

/** Immeuble prêt pour le PDF, ou null pour un bien simple. */
export function immeublePdf(project: any): ImmeublePdf | null {
  const c = calculerProjetImmeuble(project)
  if (!c) return null
  return {
    saisie: c.immeuble,
    resultats: c.resultats,
    flux: c.resultats ? fluxMensuelsImmeuble(c.resultats, donneesCharges(project), c.fluidesGlobaux) : null,
  }
}

export const LIBELLE_EXPLOITATION: Record<TypeScenario, string> = {
  lmnp_meuble: 'LMNP meublé',
  colocation: 'Colocation',
  courte_duree: 'Courte durée',
}

export const LIBELLE_EXPLOITATION_COURT: Record<TypeScenario, string> = {
  lmnp_meuble: 'Meublé',
  colocation: 'Coloc.',
  courte_duree: 'Courte durée',
}

/** « exploitation mixte », ou le libellé commun si tous les lots ont la même exploitation. */
export function titreExploitation(saisie: ImmeubleSaisie): string {
  const types = new Set(saisie.lots.map((l) => l.exploitation?.type).filter(Boolean))
  if (types.size === 1) return LIBELLE_EXPLOITATION[[...types][0] as TypeScenario]
  return 'exploitation mixte'
}

/** Hypothèse de recettes d'un lot, telle que saisie : « 460 € / mois », « 3 ch. × 370 € », « 55 € / nuit · 15 nuits/mois ». */
export function hypotheseLot(e: ExploitationSaisie | null): string {
  if (!e) return '—'
  if (e.type === 'lmnp_meuble') return e.loyerMensuel ? `${euros(e.loyerMensuel)} / mois` : '—'
  if (e.type === 'colocation') return e.nbChambres && e.loyerParChambre ? `${e.nbChambres} ch. × ${euros(e.loyerParChambre)}` : '—'
  return e.prixNuitee ? `${euros(e.prixNuitee)} / nuit · ${e.nuitsConservateur ?? 16} nuits/mois` : '—'
}

/** Libellé d'une charge de l'immeuble, avec la mention « (estimation) » saisie au wizard. */
export function libelleChargeImmeuble(cle: CleChargeImmeuble, project: any): string {
  const estim = (flag: boolean | null | undefined) => (flag ? ' (estimation)' : '')
  switch (cle) {
    case 'taxeFonciere': return `Taxe foncière${estim(project.taxe_fonciere_estime)}`
    case 'chargesCopro': return `Charges de copropriété${estim(project.charges_copro_estime)}`
    case 'assurancePno': return `Assurance PNO${estim(project.assurance_pno_estime)}`
    case 'fraisComptabilite': return `Frais de comptabilité${estim(project.frais_comptabilite_estime)}`
    case 'cfe': return `CFE (exonérée 1ère année)${estim(project.cfe_estime)}`
    case 'chargesPropresGlobales': return 'Électricité, internet, chauffage'
    case 'autresCharges': return `Autres charges${estim(project.autres_charges_estime)}`
  }
}
