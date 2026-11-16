// Cas de référence du moteur. Lancer avec : npx tsx lib/calculs/test.ts
//   1. Créteil T4 : 270 055 € de projet total (bien simple)
//   2. Immeuble de 5 lots à Troyes : 404 342 € de projet total, exploitation mixte

import { calculerScenario, calculerImmeuble, mensualiserSansEcart } from './index'
import { fluxMensuelsImmeuble } from './immeuble'
import { calculerProjetImmeuble } from './depuisProjet'

let echecs = 0
const verifier = (libelle: string, obtenu: unknown, attendu: unknown) => {
  if (obtenu !== attendu) { console.error(`❌ ${libelle} = ${obtenu}, attendu ${attendu}`); echecs++ }
}

// ─── 1. Créteil T4 (LMNP meublé) ─────────────────────────────────────────────
{
  const projet = { prixAchat: 195000, fraisNotairePct: 8.0, travaux: 35000, mobilier: 11000, honorairesCapsul: 13455, honorairesOverride: true, autresFrais: 0 }
  const financement = { apport: 27000, dureeAnnees: 20, tauxInteretPct: 3.6, tauxAssurancePct: 0 }
  const charges = { taxeFonciere: 804, chargesCoproAnnuelles: 1500, assurancePno: 120, electriciteEau: 0, internet: 0, chauffage: 0, fraisComptabilite: 250, autresCharges: 0, cfe: 300 }

  const r = calculerScenario(projet, financement, charges, {
    type: 'lmnp_meuble',
    params: { loyerMensuel: 1650, vacancePct: 5 },
  })

  console.log('=== RÉSULTATS MOTEUR — Créteil T4 (LMNP meublé, avant impôt) ===')
  console.log('Prix projet        :', r.prixProjetTotal)
  console.log('Capital emprunté   :', r.capitalEmprunte)
  console.log('Mensualité totale  :', r.mensualiteTotale)
  console.log('Revenus nets/an    :', r.scenario.revenusAnnuelsNets)
  console.log('Charges/an         :', r.scenario.chargesAnnuelles)
  console.log('Renta brute / nette:', r.scenario.rentabiliteBrutePct, '/', r.scenario.rentabiliteNettePct)
  console.log('Cash-flow mensuel  :', r.scenario.cashflowMensuel)
  console.log('Patrimoine A20 (réaliste) :', r.projectionRealiste[19]?.patrimoineNet)

  verifier('Créteil prixProjetTotal', r.prixProjetTotal, 270055)
  verifier('Créteil cash-flow', r.scenario.cashflowMensuel, -102)
}

// ─── 2. Immeuble de 5 lots à Troyes ──────────────────────────────────────────
// Studio en courte durée, 3 lots en meublé, T3 en colocation (avec une
// alternative en meublé). Charges propres saisies lot par lot.
{
  const projet = { prixAchat: 265000, fraisNotairePct: 8, travaux: 70000, mobilier: 22000, honorairesOverride: false, autresFrais: 0 }
  const financement = { apport: 40000, dureeAnnees: 20, tauxInteretPct: 3.6, tauxAssurancePct: 0.3 }
  const charges = { taxeFonciere: 2100, chargesCoproAnnuelles: 0, assurancePno: 650, electriciteEau: 0, internet: 0, chauffage: 0, fraisComptabilite: 600, autresCharges: 0, cfe: 300 }
  const sansCharges = { electriciteEau: 0, internet: 0, chauffage: 0 }

  const r = calculerImmeuble(projet, financement, charges, [
    // Rez-de-chaussée, studio 21 m²
    { scenario: { type: 'courte_duree', params: { prixNuitee: 55, nuitsConservateur: 15, nuitsOptimiste: 21, conciergeriePct: 20 } },
      chargesPropres: { electriciteEau: 1100, internet: 360, chauffage: 0 } },
    // 1er gauche, studio 24 m²
    { scenario: { type: 'lmnp_meuble', params: { loyerMensuel: 460, vacancePct: 5, fraisGestionPct: 7 } }, chargesPropres: sansCharges },
    // 1er droite, T2 36 m²
    { scenario: { type: 'lmnp_meuble', params: { loyerMensuel: 560, vacancePct: 5, fraisGestionPct: 7 } }, chargesPropres: sansCharges },
    // 2e étage, T2 38 m²
    { scenario: { type: 'lmnp_meuble', params: { loyerMensuel: 580, vacancePct: 5, fraisGestionPct: 7 } }, chargesPropres: sansCharges },
    // Combles, T3 49 m² : colocation retenue, meublé envisagé
    { scenario: { type: 'colocation', params: { nbChambres: 3, loyerParChambre: 370, vacancePct: 8, fraisGestionPct: 7 } },
      chargesPropres: { electriciteEau: 1200, internet: 360, chauffage: 0 },
      comparaison: { type: 'lmnp_meuble', params: { loyerMensuel: 690, vacancePct: 5, fraisGestionPct: 7 } } },
  ])

  const s = r.scenario as typeof r.scenario & { cashflowOptimiste?: number }
  console.log('\n=== RÉSULTATS MOTEUR — Immeuble 5 lots, Troyes (exploitation mixte) ===')
  console.log('Prix projet        :', r.prixProjetTotal)
  console.log('Mensualité totale  :', r.mensualiteTotale)
  console.log('Résultat des lots/an :', r.lots.map((l) => l.resultatAnnuel).join(' · '))
  console.log('Charges immeuble/an:', r.chargesImmeubleAnnuelles)
  console.log('Revenus bruts / nets/an :', s.revenusAnnuelsBruts, '/', s.revenusAnnuelsNets)
  console.log('Renta brute / nette:', s.rentabiliteBrutePct, '/', s.rentabiliteNettePct)
  console.log('Cash-flow mensuel  :', s.cashflowMensuel, `(hypothèse haute courte durée : ${s.cashflowOptimiste})`)
  console.log('Combles en meublé  :', r.lots[4].alternative?.effetCashflowMensuel, '€/mois sur l’immeuble')

  verifier('Immeuble prixProjetTotal', r.prixProjetTotal, 404342)
  verifier('Immeuble mensualité', r.mensualiteTotale, 2223)
  verifier('Immeuble résultat du lot 5 (colocation)', r.lots[4].resultatAnnuel, 9836)
  verifier('Immeuble revenus nets', s.revenusAnnuelsNets, 38414)
  verifier('Immeuble charges (communes + lots)', s.chargesAnnuelles, 8805)
  verifier('Immeuble rentabilité brute', s.rentabiliteBrutePct, 10.5)
  verifier('Immeuble rentabilité nette', s.rentabiliteNettePct, 7.3)
  verifier('Immeuble cash-flow', s.cashflowMensuel, 244)
  verifier('Immeuble cash-flow optimiste', s.cashflowOptimiste, 508)
  verifier('Immeuble effet de l’alternative', r.lots[4].alternative?.effetCashflowMensuel, -209)

  // Colonne mensuelle du tableau des lots : s'additionne exactement au total
  const mensuels = mensualiserSansEcart(r.lots.map((l) => l.resultatAnnuel))
  verifier('Immeuble colonne des lots (somme)', mensuels.reduce((n, m) => n + m, 0), 2772)

  // Flux affichés : tombent juste sur le cash-flow du moteur, colonne des lots comprise
  const flux = fluxMensuelsImmeuble(r, charges, 0)
  verifier('Flux : recettes − charges − mensualité = cash-flow',
    flux.recettesNettesLots - flux.charges.reduce((n, c) => n + c.montant, 0) - flux.mensualite, s.cashflowMensuel)
  verifier('Flux : colonne nette des lots = recettes', flux.lots.reduce((n, l) => n + l.net, 0), flux.recettesNettesLots)
  console.log('Flux mensuels       :', flux.recettesNettesLots, '−', flux.charges.map((c) => `${c.cle} ${c.montant}`).join(', '), '−', flux.mensualite, '=', flux.cashflow)

  // Un bien simple est un immeuble d'un seul lot : même résultat par les deux chemins
  const unLot = calculerImmeuble(projet, financement, charges, [
    { scenario: { type: 'lmnp_meuble', params: { loyerMensuel: 2400, vacancePct: 5, fraisGestionPct: 7 } }, chargesPropres: sansCharges },
  ])
  const simple = calculerScenario(projet, financement, charges, { type: 'lmnp_meuble', params: { loyerMensuel: 2400, vacancePct: 5, fraisGestionPct: 7 } })
  verifier('Bien simple = immeuble d’un lot', JSON.stringify(unLot.scenario), JSON.stringify(simple.scenario))
}

// ─── 3. Le même immeuble saisi dans le projet (colonne projects.immeuble) ─────
// Vérifie la conversion (depuisProjet.ts) : pourcentages communs, détail par
// lot ou montant global des charges propres, champs manquants.
{
  const ligne = {
    prix_achat: 265000, frais_notaire_pct: 8, travaux: 70000, mobilier: 22000, honoraires_override: false, autres_frais: 0,
    apport: 40000, duree_annees: 20, taux_interet_pct: 3.6, taux_assurance_pct: 0.3,
    taxe_fonciere: 2100, charges_copro_annuelles: 0, assurance_pno: 650, frais_comptabilite: 600, autres_charges: 0, cfe: 300,
    electricite_eau: 2300, internet: 720, chauffage: 0,
  }
  const lot = (typeBien: string, exploitation: object, chargesPropres: object | null = null, comparaison: object | null = null) => ({
    id: typeBien + JSON.stringify(exploitation), libelle: '', typeBien, surfaceM2: 30, dpeActuel: null, dpeVise: null,
    exploitation, comparaison, chargesPropres,
  })
  const lots = [
    lot('studio', { type: 'courte_duree', prixNuitee: 55, nuitsConservateur: 15, nuitsOptimiste: 21 }, { electriciteEau: 1100, internet: 360, chauffage: 0 }),
    lot('studio', { type: 'lmnp_meuble', loyerMensuel: 460 }),
    lot('T2', { type: 'lmnp_meuble', loyerMensuel: 560 }),
    lot('T2', { type: 'lmnp_meuble', loyerMensuel: 580 }),
    lot('T3', { type: 'colocation', nbChambres: 3, loyerParChambre: 370 }, { electriciteEau: 1200, internet: 360, chauffage: 0 },
      { type: 'lmnp_meuble', loyerMensuel: 690 }),
  ]
  const parametres = { vacanceMeublePct: 5, vacanceColocationPct: 8, fraisGestionPct: 7, conciergeriePct: 20 }

  const parLot = calculerProjetImmeuble({ ...ligne, immeuble: { lots, parametres, chargesPropres: 'par_lot' } })
  verifier('Saisie par lot : cash-flow', parLot?.resultats?.scenario.cashflowMensuel, 244)
  verifier('Saisie par lot : effet de l’alternative', parLot?.resultats?.lots[4].alternative?.effetCashflowMensuel, -209)

  // Même montant total (2 300 + 720 = 1 460 + 1 560) saisi en global : même cash-flow,
  // mais porté par l'immeuble et non plus par les lots
  const global = calculerProjetImmeuble({ ...ligne, immeuble: { lots, parametres, chargesPropres: 'global' } })
  verifier('Saisie globale : cash-flow', global?.resultats?.scenario.cashflowMensuel, 244)
  verifier('Saisie globale : charges communes', global?.resultats?.chargesImmeubleAnnuelles, 3650 + 3020)
  verifier('Saisie globale : résultat du lot 5 sans fluides', global?.resultats?.lots[4].resultatAnnuel, 9836 + 1560)

  const incomplet = calculerProjetImmeuble({ ...ligne, immeuble: {
    lots: [lots[0], lot('T2', { type: 'lmnp_meuble' }), lot('T3', { type: 'colocation', nbChambres: 3 })], parametres, chargesPropres: 'global',
  } })
  verifier('Saisie incomplète : ce qui manque',
    incomplet?.manquants.join(' | '), 'Lot 2 : loyer mensuel à renseigner | Lot 3 : loyer par chambre à renseigner')

  verifier('Bien simple : pas de calcul immeuble', calculerProjetImmeuble({ ...ligne, immeuble: null }), null)
}

if (echecs > 0) process.exit(1)
console.log('\n✅ Cas Créteil et immeuble OK')
