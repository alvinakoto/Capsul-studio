// ============================================================
// CAPSUL STUDIO — Exploitation en courte durée (un lot)
// ============================================================
// Flux exprimés avant impôt (cf. note dans types.ts). Charges de l'immeuble et
// crédit : cf. calculerImmeuble (immeuble.ts).

import { ChargesPropresLot, ParamsCourteDuree, ResultatsLot } from './types'

export function exploitationCourteDuree(params: ParamsCourteDuree, chargesPropres: ChargesPropresLot): ResultatsLot {

  // ── Revenus bruts (2 hypothèses) ─────────────────────────────
  // L'hypothèse conservatrice est la référence ; l'optimiste est donnée à titre indicatif.
  const revenusConservateur = Math.round(params.prixNuitee * params.nuitsConservateur * 12)
  const revenusOptimiste = Math.round(params.prixNuitee * params.nuitsOptimiste * 12)

  // ── Revenus nets après conciergerie ──────────────────────────
  const conciergerieConservateur = Math.round(revenusConservateur * (params.conciergeriePct / 100))
  const conciergerieOptimiste = Math.round(revenusOptimiste * (params.conciergeriePct / 100))
  const revenusNetsConservateur = revenusConservateur - conciergerieConservateur
  const revenusNetsOptimiste = revenusOptimiste - conciergerieOptimiste

  // ── Charges propres au lot ───────────────────────────────────
  // Fluides toujours à charge bailleur en courte durée
  const fluides = chargesPropres.electriciteEau + chargesPropres.internet + chargesPropres.chauffage

  return {
    type: 'courte_duree',
    revenusAnnuelsBruts: revenusConservateur,
    revenusAnnuelsNets: revenusNetsConservateur,
    chargesAnnuelles: fluides,
    resultatAnnuel: revenusNetsConservateur - fluides,
    detail: {
      vacance: 0,
      conciergerie: conciergerieConservateur,
      gestion: 0,
      chargesPropres: fluides,
    },
    optimiste: {
      revenusAnnuelsBruts: revenusOptimiste,
      revenusAnnuelsNets: revenusNetsOptimiste,
      resultatAnnuel: revenusNetsOptimiste - fluides,
    },
  }
}
