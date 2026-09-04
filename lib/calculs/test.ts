// Cas de référence : Créteil T4 — 270 055 € de projet total.
// Lancer avec : npx tsx lib/calculs/test.ts

import { calculerScenario } from './index'

const projet = { prixAchat: 195000, fraisNotairePct: 8.0, travaux: 35000, mobilier: 11000, honorairesCapsul: 13455, honorairesOverride: true, plan3d: 0, autresFrais: 0 }
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

const attendu = 270055
if (r.prixProjetTotal !== attendu) {
  console.error(`❌ prixProjetTotal = ${r.prixProjetTotal}, attendu ${attendu}`)
  process.exit(1)
}
console.log('✅ Cas Créteil OK')
