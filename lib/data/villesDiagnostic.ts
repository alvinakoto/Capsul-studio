// ============================================================
// CAPSUL STUDIO — Textes du PDF diagnostic par ville
// ============================================================
// Comparatif marché du PDF diagnostic (pipeline Make, lib/pdf/diagnostic/).
// Ces textes restent dans le code : rédigés par Capsul pour ses marchés, ils ne
// sont pas modifiables depuis l'app. Les chiffres (prix au m², rendement brut)
// viennent du catalogue `villes` en base, retrouvé par `slug`.
// Une ville sans entrée ici retombe sur les moyennes nationales.

export interface VilleDiagnostic {
  emoji: string
  desc: string
  tension: string
  tensionDesc: string
  strategie: string
  strategieDesc: string
  rendementNetPct: number
}

export interface EntreeDiagnostic {
  slug: string                 // = villes.slug
  match: string[]              // sous-chaînes reconnues dans la ville saisie côté Make, insensible à la casse
  diagnostic: VilleDiagnostic
}

const DIAGNOSTICS: EntreeDiagnostic[] = [
  {
    slug: 'reims',
    match: ['reims'],
    diagnostic: {
      emoji: '👑',
      desc: 'Cité des Sacres, proche de Paris en TGV (45 min)',
      tension: 'Forte',
      tensionDesc:
        "Ville universitaire (40 000+ étudiants : URCA, Sciences Po, NEOMA). Zone B1 Pinel. TGV Paris en 45 min : forte attractivité pour les actifs franciliens.",
      strategie: 'Studio & T2, proche Sciences Po et gare TGV',
      strategieDesc:
        "Petites surfaces meublées proches des établissements d'enseignement supérieur ou de la gare TGV pour capter étudiants et navetteurs Paris.",
      rendementNetPct: 4.5,
    },
  },
  {
    slug: 'toulouse',
    match: ['toulouse'],
    diagnostic: {
      emoji: '🌹',
      desc: 'La Ville Rose, 4ème ville de France',
      tension: 'Forte',
      tensionDesc:
        "Pôle universitaire majeur (100 000+ étudiants), aéronautique et tech. Demande locative soutenue toute l'année, faible vacance.",
      strategie: 'Studio & T2, rendement optimisé',
      strategieDesc:
        'Petites surfaces meublées (LMNP) proches du métro ou des campus pour maximiser la demande locative.',
      rendementNetPct: 4.2,
    },
  },
  {
    slug: 'amiens',
    match: ['amiens'],
    diagnostic: {
      emoji: '⛪',
      desc: 'Capitale picarde, cathédrale UNESCO, marché en progression',
      tension: 'Modérée',
      tensionDesc:
        "Ville en renouveau économique. Prix d'achat bas = rendements élevés. Idéal pour stratégie cash-flow positif.",
      strategie: 'Colocation & T3, cash-flow positif',
      strategieDesc:
        'T3 ou T4 en colocation, stratégie favorite Capsul sur cette ville pour atteindre le cash-flow positif.',
      rendementNetPct: 5.8,
    },
  },
  {
    slug: 'nancy',
    match: ['nancy'],
    diagnostic: {
      emoji: '🌟',
      desc: "Capitale de l'Art Nouveau, Place Stanislas UNESCO",
      tension: 'Modérée à forte',
      tensionDesc:
        'Forte population étudiante (60 000+). Quartiers Haussonville et Rives de Meurthe très prisés.',
      strategie: 'Studio meublé & colocation LMNP',
      strategieDesc:
        'Forte demande en meublé. Régime LMNP au réel recommandé pour optimiser la fiscalité.',
      rendementNetPct: 5.3,
    },
  },
  {
    slug: 'troyes',
    match: ['troyes'],
    diagnostic: {
      emoji: '🏰',
      desc: "Cité des Ducs, l'un des meilleurs rendements de France",
      tension: 'Modérée',
      tensionDesc:
        "Prix d'achat parmi les plus accessibles de France. Rendements attractifs, idéal pour les primo-investisseurs.",
      strategie: 'T2/T3 meublé, fort rendement brut',
      strategieDesc:
        'Marché adapté aux budgets 80 000–130 000 €. Les T2/T3 rénovés offrent les meilleurs ratios prix/loyer.',
      rendementNetPct: 6.5,
    },
  },
  {
    slug: 'epernay',
    match: ['épernay', 'epernay'],
    diagnostic: {
      emoji: '🍾',
      desc: 'Capitale du Champagne, Avenue UNESCO',
      tension: 'Modérée à forte',
      tensionDesc:
        "Bassin d'emploi solide (Moët & Chandon, Mercier). TGV Paris en 1h30. Programme Action Cœur de Ville en cours, marché porté par l'industrie viticole.",
      strategie: 'T2/T3, équilibre rendement et stabilité',
      strategieDesc:
        'Centre-ville et Berges de Marne très demandés. Bon choix pour primo-investisseur recherchant cash-flow stable et appréciation patrimoniale.',
      rendementNetPct: 5.5,
    },
  },
  {
    slug: 'chalons-en-champagne',
    match: ['châlons', 'chalons'],
    diagnostic: {
      emoji: '🌳',
      desc: 'Préfecture de la Marne, rendements parmi les plus élevés',
      tension: 'Faible à modérée',
      tensionDesc:
        "Marché peu concurrentiel à l'achat. Prix très accessibles, idéal pour un premier investissement à fort rendement.",
      strategie: 'T2/T3, priorité cash-flow et rendement',
      strategieDesc:
        "Budget d'entrée très accessible (50 000–100 000 €). Focus sur les biens bien situés en centre-ville ou proche gare.",
      rendementNetPct: 7.2,
    },
  },
]

/** Textes du diagnostic pour la ville saisie côté Make (sous-chaîne, insensible à la casse). */
export function trouverDiagnostic(villeProjet: string | null | undefined): EntreeDiagnostic | null {
  const v = (villeProjet ?? '').trim().toLowerCase()
  if (!v) return null
  return DIAGNOSTICS.find((e) => e.match.some((m) => v.includes(m))) ?? null
}
