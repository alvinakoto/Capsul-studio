// ============================================================
// CAPSUL STUDIO — Exploitation en colocation (un lot)
// ============================================================
// Flux exprimés avant impôt (cf. note dans types.ts). Charges de l'immeuble et
// crédit : cf. calculerImmeuble (immeuble.ts).

import { ChargesPropresLot, ParamsColocation, ResultatsLot } from './types'

export function exploitationColocation(params: ParamsColocation, chargesPropres: ChargesPropresLot): ResultatsLot {

  // ── Revenus ──────────────────────────────────────────────────
  const loyerMensuelTotal = params.nbChambres * params.loyerParChambre
  const revenusAnnuelsBruts = loyerMensuelTotal * 12
  const revenusAnnuelsNets = Math.round(
    revenusAnnuelsBruts * (1 - params.vacancePct / 100)
  )

  // ── Charges propres au lot ───────────────────────────────────
  // En colocation : fluides souvent à charge bailleur
  const gestion = Math.round(
    revenusAnnuelsNets * ((params.fraisGestionPct ?? 0) / 100)
  )
  const fluides = chargesPropres.electriciteEau + chargesPropres.internet + chargesPropres.chauffage
  const chargesAnnuelles = gestion + fluides

  return {
    type: 'colocation',
    revenusAnnuelsBruts,
    revenusAnnuelsNets,
    chargesAnnuelles,
    resultatAnnuel: revenusAnnuelsNets - chargesAnnuelles,
    detail: {
      vacance: revenusAnnuelsBruts - revenusAnnuelsNets,
      conciergerie: 0,
      gestion,
      chargesPropres: fluides,
    },
  }
}
