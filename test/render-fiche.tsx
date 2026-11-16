/**
 * Rendu local de la fiche commerciale avec des données fictives (cas Créteil T4).
 *
 *   npx tsx test/render-fiche.tsx [dossier-de-sortie] [photo-ville.jpg]
 *
 * Génère jusqu'à 3 PDF :
 *   - fiche-complete.pdf     : ville + travaux, sans photo (composition typographique)
 *   - fiche-avec-photo.pdf   : idem avec la photo passée en 2e argument (si fournie)
 *   - fiche-minimale.pdf     : ni infos ville, ni postes → 3 pages, numérotation contractée
 *   - fiche-immeuble.pdf     : immeuble de 5 lots à Troyes (cas de référence de lib/calculs/test.ts)
 *   - fiche-immeuble-8-lots.pdf : pire cas de la page « Les lots » (8 lots, libellés longs, alternatives)
 */
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'
import { registerFonts } from '../lib/pdf/common/fonts'
import FicheCommerciale from '../lib/pdf/FicheCommerciale'
import { calculerScenario } from '../lib/calculs/index'
import type { VilleInfos } from '../lib/data/villes'
import { getPostesTravaux } from '../lib/data/travaux'
import type { FicheData } from '../lib/pdf/types'
import { immeublePdf } from '../lib/pdf/common/immeuble'

// Reims tel qu'enregistré dans le catalogue `villes` (le script tourne sans base)
const REIMS: {
  infos: VilleInfos; aireAttraction: number; croissanceDemographiquePct: number
  quartiers: string[]; projetsAVenir: string[]
} = {
  infos: {
    surnom: 'La cité des sacres', habitants: 179_992, etudiants: 37_000,
    acces: 'à 45 min de Paris en TGV', atout: '12ème ville de France',
    prixM2Min: 2_200, prixM2Max: 3_600, rendementMoyenPct: 6.0,
  },
  aireAttraction: 356_721,
  croissanceDemographiquePct: 0.1,
  quartiers: ['Clairmarais', 'Croix-Rouge', 'Saint-Remi', 'Centre-ville / Cathédrale', 'Jean-Jaurès / Moissons'],
  projetsAVenir: [
    "Reims Grand Centre : reconversion des friches ferroviaires et pôle d'échanges multimodal bus-tram-train",
    'Reconstruction du nouveau CHU de Reims (secteur Croix-Rouge), 564 M€, achèvement prévu 2031',
    'Deux lignes de bus à haut niveau de service (BHNS) portées par le Grand Reims',
    'ZAC de Bezannes (172 ha) près de la gare Champagne-TGV : logements, activités, commerces',
  ],
}

const outDir = process.argv[2] ?? '.'
const photo = process.argv[3] ?? null

const project: FicheData['project'] = {
  id: 'test',
  name: '12 rue du Général Leclerc, Reims',
  adresse: '12 rue du Général Leclerc',
  ville: 'Reims',
  ville_infos: null,
  city: 'Reims',
  surface_m2: 72,
  type_bien: 'T4',
  dpe_actuel: 'E',
  dpe_apres_travaux: 'C',
  description_bien: 'Appartement traversant au 1er étage d\'un immeuble bourgeois, secteur Barbâtre, à 5 minutes à pied du campus Sciences Po. Trois chambres après travaux, terrasse à l\'entrée.',
  prix_achat: 195000,
  frais_notaire_pct: 8,
  travaux: 35000,
  travaux_postes: ['cloisons', 'chambres', 'electricite', 'plomberie', 'salle_de_bain', 'cuisine', 'sols', 'peinture', 'ameublement'],
  mobilier: 11000,
  honoraires_capsul: 13455,
  honoraires_override: true,
  autres_frais: 0,
  apport: 27000,
  duree_annees: 20,
  taux_interet_pct: 3.6,
  taux_assurance_pct: 0,
  taxe_fonciere: 804,
  charges_copro_annuelles: 1500,
  assurance_pno: 120,
  frais_comptabilite: 250,
  frais_gestion_pct: 7,
  autres_charges: 0,
  electricite_eau: 0,
  internet: 0,
  chauffage: 0,
  cfe: 300,
  scenario_type: 'lmnp_meuble',
  loyer_cible: 1650,
  travaux_estime: true,
  frais_notaire_estime: false,
  charges_copro_estime: false,
  taxe_fonciere_estime: false,
  assurance_pno_estime: true,
  frais_comptabilite_estime: false,
  cfe_estime: true,
  autres_charges_estime: false,
  taux_interet_estime: true,
  taux_assurance_estime: true,
  negociation_envisagee: false,
  prix_affiche_origine: null,
  frais_agence: null,
  concierge_pct: 20,
  nuits_conservateur: 16,
  nuits_optimiste: 22,
  commentaire_travaux: 'Rénovation complète prévue au T2 2027, artisan déjà identifié sur place.',
}

const r = calculerScenario(
  { prixAchat: 195000, fraisNotairePct: 8, travaux: 35000, mobilier: 11000, honorairesCapsul: 13455, honorairesOverride: true, autresFrais: 0 },
  { apport: 27000, dureeAnnees: 20, tauxInteretPct: 3.6, tauxAssurancePct: 0 },
  { taxeFonciere: 804, chargesCoproAnnuelles: 1500, assurancePno: 120, electriciteEau: 0, internet: 0, chauffage: 0, fraisComptabilite: 250, autresCharges: 0, cfe: 300 },
  { type: 'lmnp_meuble', params: { loyerMensuel: 1650, vacancePct: 5, fraisGestionPct: 7 } },
)

const base: FicheData = {
  project,
  chargeNom: 'Alvin Akoto',
  chargeEmail: 'a.akoto@capsul-france.com',
  chargeTelephone: '06 12 34 56 78',
  coverPhotoUrl: null,
  mainPhotoUrl: null,
  mainPhotoLegende: null,
  localisationPhotoUrl: null,
  secondaryPhotos: [],
  scenarioResult: r.scenario,
  prixProjetTotal: r.prixProjetTotal,
  capitalEmprunte: r.capitalEmprunte,
  mensualiteTotale: r.mensualiteTotale,
  vacancePct: 5,
  projectionConservateur: r.projectionConservateur,
  projectionRealiste: r.projectionRealiste,
  villeNom: 'Reims',
  villeInfos: REIMS.infos,
  villePhotoSrc: null,
  villeCarte: null,
  villeAireAttraction: REIMS.aireAttraction,
  villeCroissanceDemographiquePct: REIMS.croissanceDemographiquePct,
  villeQuartiers: REIMS.quartiers,
  villeProjetsAVenir: REIMS.projetsAVenir,
  travauxPostes: getPostesTravaux(project.travaux_postes),
  comparaison: null,
  immeuble: null,
}

// ─── Immeuble : cas de référence (5 lots) et pire cas (8 lots) ─────────────────
const lot = (libelle: string, typeBien: string, surfaceM2: number, dpeActuel: string | null, dpeVise: string | null,
  exploitation: object, chargesPropres: object | null = null, comparaison: object | null = null) =>
  ({ id: libelle, libelle, typeBien, surfaceM2, dpeActuel, dpeVise, exploitation, comparaison, chargesPropres })
const lots5 = [
  lot('Rez-de-chaussée', 'studio', 21, 'F', 'C', { type: 'courte_duree', prixNuitee: 55, nuitsConservateur: 15, nuitsOptimiste: 21 }, { electriciteEau: 1100, internet: 360, chauffage: 0 }),
  lot('1er gauche', 'studio', 24, 'E', 'C', { type: 'lmnp_meuble', loyerMensuel: 460 }),
  lot('1er droite', 'T2', 36, 'E', 'C', { type: 'lmnp_meuble', loyerMensuel: 560 }),
  lot('2e étage', 'T2', 38, null, 'C', { type: 'lmnp_meuble', loyerMensuel: 580 }),
  lot('Combles', 'T3', 49, 'G', 'D', { type: 'colocation', nbChambres: 3, loyerParChambre: 370 }, { electriciteEau: 1200, internet: 360, chauffage: 0 },
    { type: 'lmnp_meuble', loyerMensuel: 690 }),
]
// Pire cas : 8 lots, libellés de longueur maximale (22), chacun avec une autre exploitation étudiée
const alt = { type: 'courte_duree', prixNuitee: 58, nuitsConservateur: 16 }
const lots8 = [
  lot('Rez-de-chaussée gauche', 'studio', 21, 'F', 'C', { type: 'courte_duree', prixNuitee: 55, nuitsConservateur: 15, nuitsOptimiste: 21 }, { electriciteEau: 1100, internet: 360, chauffage: 0 }, { type: 'lmnp_meuble', loyerMensuel: 470 }),
  lot('Rez-de-chaussée droite', 'studio', 24, 'E', 'C', { type: 'lmnp_meuble', loyerMensuel: 460 }, null, alt),
  lot('Premier étage gauche', 'T2', 36, 'E', 'C', { type: 'lmnp_meuble', loyerMensuel: 560 }, null, alt),
  lot('Premier étage droite', 'T2', 38, null, 'C', { type: 'lmnp_meuble', loyerMensuel: 580 }, null, { type: 'colocation', nbChambres: 2, loyerParChambre: 330 }),
  lot('Combles aménagés rue', 'T4', 72, 'G', 'D', { type: 'colocation', nbChambres: 4, loyerParChambre: 390 }, { electriciteEau: 1500, internet: 360, chauffage: 900 }, { type: 'lmnp_meuble', loyerMensuel: 980 }),
  lot('Troisième étage cour', 'studio', 19, 'F', 'D', { type: 'lmnp_meuble', loyerMensuel: 450 }, null, alt),
  lot('Troisième étage rue W', 'T1', 27, 'E', 'C', { type: 'lmnp_meuble', loyerMensuel: 520 }, null, { type: 'colocation', nbChambres: 1, loyerParChambre: 540 }),
  lot('Local commercial reconv', 'T2', 41, 'D', 'C', { type: 'lmnp_meuble', loyerMensuel: 640 }, null, alt),
].map((l) => ({ ...l, libelle: l.libelle.slice(0, 22) }))
const parametres = { vacanceMeublePct: 5, vacanceColocationPct: 8, fraisGestionPct: 7, conciergeriePct: 20 }
function ficheImmeuble(lots: object[]): FicheData {
  const p = {
    ...project, name: '14 rue de la Cité, Troyes', adresse: '14 rue de la Cité', ville: 'Troyes', city: 'Troyes', type_bien: 'immeuble',
    prix_achat: 265000, travaux: 70000, mobilier: 22000, honoraires_capsul: null, honoraires_override: false, apport: 40000, taux_assurance_pct: 0.3,
    taxe_fonciere: 2100, charges_copro_annuelles: 0, assurance_pno: 650, frais_comptabilite: 600, cfe: 300, dpe_actuel: null, dpe_apres_travaux: null,
    immeuble: { lots, parametres, chargesPropres: 'par_lot' },
  }
  const im = immeublePdf(p)!
  p.surface_m2 = (lots as { surfaceM2: number }[]).reduce((n, l) => n + l.surfaceM2, 0)
  return {
    ...base, project: p, immeuble: im, villeNom: 'Troyes', villeInfos: null,
    scenarioResult: im.resultats?.scenario ?? null,
    prixProjetTotal: im.resultats?.prixProjetTotal ?? 0,
    capitalEmprunte: im.resultats?.capitalEmprunte ?? 0,
    mensualiteTotale: im.resultats?.mensualiteTotale ?? 0,
    projectionConservateur: im.resultats?.projectionConservateur ?? [],
    projectionRealiste: im.resultats?.projectionRealiste ?? [],
  }
}

const variants: Array<{ file: string; data: FicheData }> = [
  { file: 'fiche-complete.pdf', data: base },
  ...(photo ? [{ file: 'fiche-avec-photo.pdf', data: { ...base, villePhotoSrc: photo } }] : []),
  { file: 'fiche-minimale.pdf', data: { ...base, villeInfos: null, travauxPostes: [] } },
  // Sous-titre de couverture long : ville composée, typologie, surface et DPE (coupures)
  { file: 'fiche-sous-titre-long.pdf', data: { ...base, project: { ...project, city: 'Châlons-en-Champagne', ville: 'Châlons-en-Champagne', type_bien: 'T4', surface_m2: 72, dpe_actuel: 'D' } } },
  { file: 'fiche-immeuble.pdf', data: ficheImmeuble(lots5) },
  { file: 'fiche-immeuble-8-lots.pdf', data: ficheImmeuble(lots8) },
]

async function main() {
  registerFonts()
  mkdirSync(outDir, { recursive: true })
  for (const v of variants) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buf = await renderToBuffer(React.createElement(FicheCommerciale, { data: v.data }) as any)
    const target = path.join(outDir, v.file)
    writeFileSync(target, buf)
    console.log(`PDF généré : ${buf.byteLength} octets -> ${target}`)
  }
}

main().catch((e) => {
  console.error('ERREUR:', e?.message ?? e)
  process.exit(1)
})
