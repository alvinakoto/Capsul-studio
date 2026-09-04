/**
 * Rendu local de la fiche commerciale avec des données fictives (cas Créteil T4).
 *
 *   npx tsx test/render-fiche.tsx [dossier-de-sortie] [photo-ville.jpg]
 *
 * Génère jusqu'à 3 PDF :
 *   - fiche-complete.pdf     : ville + travaux, sans photo (composition typographique)
 *   - fiche-avec-photo.pdf   : idem avec la photo passée en 2e argument (si fournie)
 *   - fiche-minimale.pdf     : ni infos ville, ni postes → 3 pages, numérotation contractée
 */
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'
import { registerFonts } from '../lib/pdf/common/fonts'
import FicheCommerciale from '../lib/pdf/FicheCommerciale'
import { calculerScenario } from '../lib/calculs/index'
import { findVille } from '../lib/data/villes'
import { getPostesTravaux } from '../lib/data/travaux'
import type { FicheData } from '../lib/pdf/types'

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
  plan_3d: 0,
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
  negociation_envisagee: false,
  prix_affiche_origine: null,
  concierge_pct: 20,
  nuits_conservateur: 16,
  nuits_optimiste: 22,
}

const r = calculerScenario(
  { prixAchat: 195000, fraisNotairePct: 8, travaux: 35000, mobilier: 11000, honorairesCapsul: 13455, honorairesOverride: true, plan3d: 0, autresFrais: 0 },
  { apport: 27000, dureeAnnees: 20, tauxInteretPct: 3.6, tauxAssurancePct: 0 },
  { taxeFonciere: 804, chargesCoproAnnuelles: 1500, assurancePno: 120, electriciteEau: 0, internet: 0, chauffage: 0, fraisComptabilite: 250, autresCharges: 0, cfe: 300 },
  { type: 'lmnp_meuble', params: { loyerMensuel: 1650, vacancePct: 5, fraisGestionPct: 7 } },
)

const base: FicheData = {
  project,
  chargeNom: 'Alvin Akoto',
  coverPhotoUrl: null,
  mainPhotoUrl: null,
  mainPhotoLegende: null,
  secondaryPhotos: [],
  scenarioResult: r.scenario,
  prixProjetTotal: r.prixProjetTotal,
  capitalEmprunte: r.capitalEmprunte,
  mensualiteTotale: r.mensualiteTotale,
  vacancePct: 5,
  projectionConservateur: r.projectionConservateur,
  projectionRealiste: r.projectionRealiste,
  villeNom: 'Reims',
  villeInfos: findVille('Reims')?.infos ?? null,
  villePhotoPath: null,
  travauxPostes: getPostesTravaux(project.travaux_postes),
}

const variants: Array<{ file: string; data: FicheData }> = [
  { file: 'fiche-complete.pdf', data: base },
  ...(photo ? [{ file: 'fiche-avec-photo.pdf', data: { ...base, villePhotoPath: photo } }] : []),
  { file: 'fiche-minimale.pdf', data: { ...base, villeInfos: null, travauxPostes: [] } },
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
