import { calculerScenario } from './index'
import { calculerAmortissementsAnnuels, calculerInteretsAnnee1 } from './fiscalite'

const projet = { prixAchat: 195000, fraisNotairePct: 8.0, travaux: 35000, mobilier: 11000, honorairesCapsul: 13455, honorairesOverride: true, plan3d: 0, autresFrais: 0 }
const financement = { apport: 27000, dureeAnnees: 20, tauxInteretPct: 3.6, tauxAssurancePct: 0 }
const charges = { taxeFonciere: 804, chargesCoproAnnuelles: 1500, assurancePno: 120, electriciteEau: 0, internet: 0, chauffage: 0, fraisComptabilite: 250, autresCharges: 0 }

// Diagnostic fiscal manuel
const capitalEmprunte = 270055 - 27000
const interets = calculerInteretsAnnee1(capitalEmprunte, 3.6)
const amortissements = calculerAmortissementsAnnuels(195000, 11000, 35000)
const chargesAnnuelles = 804 + 1500 + 120 + 250
const revenusNets = Math.round(1650 * 12 * 0.95)

console.log('=== DIAGNOSTIC FISCAL LMNP ===')
console.log('Revenus nets annuels    :', revenusNets)
console.log('Charges annuelles       :', chargesAnnuelles)
console.log('Intérêts année 1        :', interets)
console.log('Amortissements          :', amortissements)
console.log('Total déductible        :', chargesAnnuelles + interets + amortissements)
console.log('Résultat fiscal         :', revenusNets - chargesAnnuelles - interets - amortissements)
console.log('')

const r = calculerScenario(projet, financement, charges, {
  type: 'lmnp_meuble',
  params: { loyerMensuel: 1650, vacancePct: 5, regimeFiscal: 'lmnp_reel', tmiClientPct: 30 }
})
console.log('=== RÉSULTATS MOTEUR ===')
console.log('Prix projet   :', r.prixProjetTotal)
console.log('Capital       :', r.capitalEmprunte)
console.log('Mensualité    :', r.mensualiteTotale)
console.log('Impôt/mois    :', r.scenario.impotMensuelEstime)
console.log('CF après IR   :', r.scenario.cashflowMensuelApresIR)
