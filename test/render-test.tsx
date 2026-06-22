import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { writeFileSync } from 'fs';
import { DiagnosticDocument } from '../lib/pdf/diagnostic/DiagnosticDocument';
import { normalizePayload } from '../lib/pdf/diagnostic/calculations';

const raw = {
  prenom: 'Sophie',
  villeProjet: 'Reims',
  dateRapport: '22 juin 2026',
  rentabiliteBrute: 6.2,
  rentabiliteNette: 4.1,
  cashFlowMensuel: -45,
  cashFlowAnnuel: -540,
  verdictNiveau: 'neutre' as const,
  verdictTitre: 'Projet à l\'équilibre',
  verdictMessage:
    'Votre projet est viable sur le long terme. Un effort d\'épargne modéré de 45 €/mois est compensé par la constitution progressive d\'un patrimoine immobilier.',
  mensualiteTotale: 945,
  coutTotalAcquisition: 225000,
  capitalEmprunte: 195000,
  fraisNotaire: 17500,
  coutTotalCredit: 88000,
  prixBien: 190000,
  apport: 25000,
  dureeAnnees: 20,
  tauxInteret: 3.7,
  tauxMensuel: 0.003083,
  mensualiteCredit: 855,
  interetsMois: 601,
  capitalMois: 254,
  assuranceMensuelle: 90,
  loyerMensuel: 900,
  loyerAnnuelNet: 10260,
  taxeFonciere: 1400,
  chargesCoproMensuelles: 85,
  assurancePnoAnnuelle: 240,
  recettesMensuelles: 900,
  depensesMensuelles: 945,
  levier1Titre: 'Passer en régime LMNP réel',
  levier1Description:
    'En optant pour le régime LMNP réel, vous pouvez déduire l\'amortissement du bien (2 % par an sur 85 % de la valeur), les intérêts d\'emprunt et toutes les charges — ce qui peut annuler fiscalement vos revenus locatifs pendant 10 à 15 ans.',
  levier2Titre: 'Renégocier votre taux d\'assurance',
  levier2Description:
    'L\'assurance emprunteur représente 90 €/mois dans votre plan. En faisant jouer la concurrence via un courtier spécialisé (Cardif, Generali, etc.), vous pouvez souvent gagner 20 à 30 € par mois, soit 240 à 360 € de cash-flow supplémentaire par an.',
  levier3Titre: 'Optimiser la mise en location',
  levier3Description:
    'Reims est un marché dynamique à faible vacance locative. En meublant le bien pour cibler les étudiants ou jeunes actifs, vous pouvez viser un loyer 8 à 12 % supérieur à la location nue — ce qui ferait basculer votre cash-flow en positif.',
};

async function main() {
  const payload = normalizePayload(raw);
  const buf = await renderToBuffer(React.createElement(DiagnosticDocument, { payload }));
  const path = 'test-diagnostic-render.pdf';
  writeFileSync(path, buf);
  console.log(`PDF genere : ${buf.byteLength} octets -> ${path}`);
}

main().catch((e) => {
  console.error('ERREUR:', e.message ?? e);
  process.exit(1);
});
