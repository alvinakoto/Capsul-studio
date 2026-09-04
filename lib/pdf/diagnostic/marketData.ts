import { EcartClass, MarketData } from './types';
import { findVille } from '@/lib/data/villes';
import { fmtInt } from './format';

/**
 * Données de marché par ville pour le PDF diagnostic.
 *
 * Source unique : lib/data/villes.ts (partagée avec le wizard et la fiche
 * commerciale). Une ville n'est « connue » ici que si son entrée porte un bloc
 * `diagnostic` ; sinon on retombe sur les moyennes nationales, comme avant.
 * Le matching reste par sous-chaîne, insensible à la casse (Liquid `contains`).
 */
const FALLBACK = { marcheRdtBrut: 5.8, marcheRdtNet: 4.3 };

function formatPrixRange(min?: number, max?: number): string {
  if (min === undefined || max === undefined) return '—';
  return `${fmtInt(min)} – ${fmtInt(max)} €/m2`;
}

export function getMarketData(villeProjet: string): MarketData {
  const ville = findVille(villeProjet);
  if (!ville?.diagnostic) return { villeConnue: false, ...FALLBACK };

  const { infos, diagnostic } = ville;
  return {
    villeConnue: true,
    villeNom: ville.nom,
    villeEmoji: diagnostic.emoji,
    villeDesc: diagnostic.desc,
    villeTension: diagnostic.tension,
    villeTensionDesc: diagnostic.tensionDesc,
    villePrixRange: formatPrixRange(infos.prixM2Min, infos.prixM2Max),
    villeStrategie: diagnostic.strategie,
    villeStrategieDesc: diagnostic.strategieDesc,
    marcheRdtBrut: infos.rendementMoyenPct ?? FALLBACK.marcheRdtBrut,
    marcheRdtNet: diagnostic.rendementNetPct,
  };
}

/** Classification d'écart, identique au Liquid : seuil de 0.3 point. */
export function classifyEcart(valeur: number, marche: number): {
  classe: EcartClass;
  label: string;
} {
  const ecart = valeur - marche;
  if (ecart > 0.3) return { classe: 'superieur', label: 'Au-dessus' };
  if (ecart < -0.3) return { classe: 'inferieur', label: 'En dessous' };
  return { classe: 'egal', label: 'Dans la moyenne' };
}

export function classifyTaux(tauxInteret: number): {
  classe: EcartClass;
  label: string;
} {
  if (tauxInteret <= 3.8) return { classe: 'superieur', label: 'Bon taux' };
  if (tauxInteret <= 4.5) return { classe: 'egal', label: 'Taux correct' };
  return { classe: 'inferieur', label: 'Taux élevé' };
}
