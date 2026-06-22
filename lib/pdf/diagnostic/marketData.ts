import { EcartClass, MarketData } from './types';

/**
 * Données de marché par ville — portées 1:1 depuis le template Liquid.
 * Source originale : observations Capsul + MeilleursAgents/SeLoger/DVF.
 * À mettre à jour 1-2 fois par an, comme avant. Pour ajouter une ville,
 * ajoute une entrée ici (le matching se fait par sous-chaîne, insensible
 * à la casse, comme dans le Liquid `contains`).
 */
const VILLES: Array<{ match: string[]; data: Omit<MarketData, 'villeConnue'> }> = [
  {
    match: ['toulouse'],
    data: {
      villeNom: 'Toulouse',
      villeEmoji: '🌹',
      villeDesc: 'La Ville Rose — 4ème ville de France',
      villeTension: 'Forte',
      villeTensionDesc:
        "Pôle universitaire majeur (100 000+ étudiants), aéronautique et tech. Demande locative soutenue toute l'année, faible vacance.",
      villePrixRange: '3 000 – 4 200 €/m2',
      villeStrategie: 'Studio & T2 — rendement optimisé',
      villeStrategieDesc:
        'Petites surfaces meublées (LMNP) proches du métro ou des campus pour maximiser la demande locative.',
      marcheRdtBrut: 5.8,
      marcheRdtNet: 4.2,
    },
  },
  {
    match: ['reims'],
    data: {
      villeNom: 'Reims',
      villeEmoji: '👑',
      villeDesc: 'Cité des Sacres — proche de Paris en TGV (45 min)',
      villeTension: 'Forte',
      villeTensionDesc:
        "Ville universitaire (40 000+ étudiants : URCA, Sciences Po, NEOMA). Zone B1 Pinel. TGV Paris en 45 min : forte attractivité pour les actifs franciliens.",
      villePrixRange: '2 200 – 3 600 €/m2',
      villeStrategie: 'Studio & T2 — proche Sciences Po et gare TGV',
      villeStrategieDesc:
        "Petites surfaces meublées proches des établissements d'enseignement supérieur ou de la gare TGV pour capter étudiants et navetteurs Paris.",
      marcheRdtBrut: 6.0,
      marcheRdtNet: 4.5,
    },
  },
  {
    match: ['amiens'],
    data: {
      villeNom: 'Amiens',
      villeEmoji: '⛪',
      villeDesc: 'Capitale picarde — cathédrale UNESCO, marché en progression',
      villeTension: 'Modérée',
      villeTensionDesc:
        "Ville en renouveau économique. Prix d'achat bas = rendements élevés. Idéal pour stratégie cash-flow positif.",
      villePrixRange: '1 700 – 2 300 €/m2',
      villeStrategie: 'Colocation & T3 — cash-flow positif',
      villeStrategieDesc:
        'T3 ou T4 en colocation — stratégie favorite Capsul sur cette ville pour atteindre le cash-flow positif.',
      marcheRdtBrut: 7.5,
      marcheRdtNet: 5.8,
    },
  },
  {
    match: ['nancy'],
    data: {
      villeNom: 'Nancy',
      villeEmoji: '🌟',
      villeDesc: "Capitale de l'Art Nouveau — Place Stanislas UNESCO",
      villeTension: 'Modérée à forte',
      villeTensionDesc:
        'Forte population étudiante (60 000+). Quartiers Haussonville et Rives de Meurthe très prisés.',
      villePrixRange: '1 800 – 2 600 €/m2',
      villeStrategie: 'Studio meublé & colocation LMNP',
      villeStrategieDesc:
        'Forte demande en meublé. Régime LMNP au réel recommandé pour optimiser la fiscalité.',
      marcheRdtBrut: 7.0,
      marcheRdtNet: 5.3,
    },
  },
  {
    match: ['troyes'],
    data: {
      villeNom: 'Troyes',
      villeEmoji: '🏰',
      villeDesc: "Cité des Ducs — l'un des meilleurs rendements de France",
      villeTension: 'Modérée',
      villeTensionDesc:
        "Prix d'achat parmi les plus accessibles de France. Rendements attractifs, idéal pour les primo-investisseurs.",
      villePrixRange: '1 400 – 1 900 €/m2',
      villeStrategie: 'T2/T3 meublé — fort rendement brut',
      villeStrategieDesc:
        'Marché adapté aux budgets 80 000–130 000 €. Les T2/T3 rénovés offrent les meilleurs ratios prix/loyer.',
      marcheRdtBrut: 8.2,
      marcheRdtNet: 6.5,
    },
  },
  {
    match: ['épernay', 'epernay'],
    data: {
      villeNom: 'Épernay',
      villeEmoji: '🍾',
      villeDesc: 'Capitale du Champagne — Avenue UNESCO',
      villeTension: 'Modérée à forte',
      villeTensionDesc:
        "Bassin d'emploi solide (Moët & Chandon, Mercier). TGV Paris en 1h30. Programme Action Cœur de Ville en cours, marché porté par l'industrie viticole.",
      villePrixRange: '1 400 – 2 100 €/m2',
      villeStrategie: 'T2/T3 — équilibre rendement et stabilité',
      villeStrategieDesc:
        'Centre-ville et Berges de Marne très demandés. Bon choix pour primo-investisseur recherchant cash-flow stable et appréciation patrimoniale.',
      marcheRdtBrut: 7.2,
      marcheRdtNet: 5.5,
    },
  },
  {
    match: ['châlons', 'chalons'],
    data: {
      villeNom: 'Châlons-en-Champagne',
      villeEmoji: '🌳',
      villeDesc: 'Préfecture de la Marne — rendements parmi les plus élevés',
      villeTension: 'Faible à modérée',
      villeTensionDesc:
        "Marché peu concurrentiel à l'achat. Prix très accessibles, idéal pour un premier investissement à fort rendement.",
      villePrixRange: '900 – 1 500 €/m2',
      villeStrategie: 'T2/T3 — priorité cash-flow et rendement',
      villeStrategieDesc:
        'Budget d\'entrée très accessible (50 000–100 000 €). Focus sur les biens bien situés en centre-ville ou proche gare.',
      marcheRdtBrut: 9.0,
      marcheRdtNet: 7.2,
    },
  },
];

const FALLBACK = { marcheRdtBrut: 5.8, marcheRdtNet: 4.3 };

export function getMarketData(villeProjet: string): MarketData {
  const v = (villeProjet || '').toLowerCase();
  for (const entry of VILLES) {
    if (entry.match.some((m) => v.includes(m))) {
      return { villeConnue: true, ...entry.data };
    }
  }
  return { villeConnue: false, ...FALLBACK };
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
