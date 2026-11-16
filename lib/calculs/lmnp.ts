// ============================================================
// CAPSUL STUDIO — Exploitation LMNP meublé (un lot)
// ============================================================
// Flux exprimés avant impôt (cf. note dans types.ts). Charges de l'immeuble et
// crédit : cf. calculerImmeuble (immeuble.ts).

import { ParamsLMNP, ResultatsLot } from './types'

export function exploitationLMNP(params: ParamsLMNP): ResultatsLot {

  // ── Revenus ─────────────────────────────────────────────────
  const revenusAnnuelsBruts = params.loyerMensuel * 12
  const revenusAnnuelsNets = Math.round(
    revenusAnnuelsBruts * (1 - params.vacancePct / 100)
  )

  // ── Charges propres au lot ───────────────────────────────────
  // En LMNP meublé : fluides généralement à charge locataire, seule la gestion
  // locative est à la charge du propriétaire au niveau du lot.
  const gestion = Math.round(
    revenusAnnuelsNets * ((params.fraisGestionPct ?? 0) / 100)
  )

  return {
    type: 'lmnp_meuble',
    revenusAnnuelsBruts,
    revenusAnnuelsNets,
    chargesAnnuelles: gestion,
    resultatAnnuel: revenusAnnuelsNets - gestion,
    detail: {
      vacance: revenusAnnuelsBruts - revenusAnnuelsNets,
      conciergerie: 0,
      gestion,
      chargesPropres: 0,
    },
  }
}
