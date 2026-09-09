// ============================================================
// CAPSUL STUDIO — Réalisations mises en avant (page Conclusion)
// ============================================================
// Sélection à la main parmi les projets publiés sur
// capsul-france.com/projets-investissement-locatif — pas de fetch live sur
// ce site depuis la génération PDF (dépendance externe fragile, cf. leçon
// PageScenario.tsx sur les données dupliquées à la main). Photos fournies par
// Alvin, déposées dans public/realisations/<slug>.jpg.
// À rafraîchir manuellement de temps en temps, comme lib/data/villes.ts.

export interface Realisation {
  slug: string          // photo : public/realisations/<slug>.jpg
  client: string
  ville: string
  typologie: string
  budgetTotal: number
  rentabiliteBrutePct: number
}

export const REALISATIONS: Realisation[] = [
  {
    slug: 'amaury-reims',
    client: 'Amaury',
    ville: 'Reims',
    typologie: 'Immeuble',
    budgetTotal: 524_000,
    rentabiliteBrutePct: 6.6,
  },
  {
    slug: 'mael-toulouse',
    client: 'Maël',
    ville: 'Toulouse',
    typologie: 'Location meublée',
    budgetTotal: 190_000,
    rentabiliteBrutePct: 8,
  },
  {
    slug: 'patricia-nancy',
    client: 'Patricia',
    ville: 'Nancy',
    typologie: 'Colocation',
    budgetTotal: 213_123,
    rentabiliteBrutePct: 9,
  },
  {
    slug: 'lucas-troyes',
    client: 'Lucas',
    ville: 'Troyes',
    typologie: 'Location courte durée',
    budgetTotal: 120_000,
    rentabiliteBrutePct: 12,
  },
]
