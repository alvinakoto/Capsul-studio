// ============================================================
// CAPSUL STUDIO — Source unique des données « ville »
// ============================================================
// Alimente :
//   - le select « Ville » du wizard (Bloc A) — liste = VILLES, dans cet ordre ;
//   - la page « La ville » de la fiche commerciale : `infos` pré-remplit les
//     champs du wizard, modifiables ensuite projet par projet (`projects.ville_infos`) ;
//   - le comparatif marché du PDF diagnostic (lib/pdf/diagnostic/marketData.ts)
//     via le bloc `diagnostic` (absent → moyennes nationales, comportement inchangé).
//
// ⚠️ CHIFFRES À VALIDER PAR LA DIRECTION.
// Sources de ce premier jeu : ancienne fiche Canva Capsul (Reims), dataset du
// diagnostic (prix m² et rendements — observations Capsul / MeilleursAgents /
// SeLoger / DVF, avril 2026), populations légales INSEE 2022 (arrondies),
// effectifs étudiants publiés par les universités. À rafraîchir 1 à 2 fois par an.
// Pour ajouter une ville : une entrée ici suffit (select + fiche + diagnostic).

export interface VilleInfos {
  surnom?: string              // « La cité des sacres »
  habitants?: number
  etudiants?: number
  acces?: string               // « à 45 min de Paris en TGV »
  atout?: string               // « 12ème ville de France », « Capitale du Champagne »…
  prixM2Min?: number           // €/m² appartement, bas de fourchette
  prixM2Max?: number           // €/m² appartement, haut de fourchette
  rendementMoyenPct?: number   // rendement brut moyen constaté sur la ville
}

export interface VilleDiagnostic {
  emoji: string
  desc: string
  tension: string
  tensionDesc: string
  strategie: string
  strategieDesc: string
  rendementNetPct: number
}

export interface Ville {
  nom: string
  slug: string                 // photo de la fiche : public/villes/<slug>.jpg (optionnelle)
  match: string[]              // sous-chaînes reconnues, insensible à la casse
  infos: VilleInfos
  diagnostic?: VilleDiagnostic
}

export const VILLES: Ville[] = [
  {
    nom: 'Reims',
    slug: 'reims',
    match: ['reims'],
    infos: {
      surnom: 'La cité des sacres',
      habitants: 179_992,
      etudiants: 37_000,
      acces: 'à 45 min de Paris en TGV',
      atout: '12ème ville de France',
      prixM2Min: 2_200,
      prixM2Max: 3_600,
      rendementMoyenPct: 6.0,
    },
    diagnostic: {
      emoji: '👑',
      desc: 'Cité des Sacres — proche de Paris en TGV (45 min)',
      tension: 'Forte',
      tensionDesc:
        "Ville universitaire (40 000+ étudiants : URCA, Sciences Po, NEOMA). Zone B1 Pinel. TGV Paris en 45 min : forte attractivité pour les actifs franciliens.",
      strategie: 'Studio & T2 — proche Sciences Po et gare TGV',
      strategieDesc:
        "Petites surfaces meublées proches des établissements d'enseignement supérieur ou de la gare TGV pour capter étudiants et navetteurs Paris.",
      rendementNetPct: 4.5,
    },
  },
  {
    nom: 'Paris',
    slug: 'paris',
    match: ['paris'],
    infos: {
      surnom: 'La Ville Lumière',
      habitants: 2_102_650,
      etudiants: 350_000,
      atout: '1ère ville de France',
      prixM2Min: 8_500,
      prixM2Max: 11_500,
      rendementMoyenPct: 3.5,
    },
  },
  {
    nom: 'Toulouse',
    slug: 'toulouse',
    match: ['toulouse'],
    infos: {
      surnom: 'La Ville Rose',
      habitants: 511_684,
      etudiants: 130_000,
      acces: 'à 1h10 de Paris en avion',
      atout: '4ème ville de France',
      prixM2Min: 3_000,
      prixM2Max: 4_200,
      rendementMoyenPct: 5.8,
    },
    diagnostic: {
      emoji: '🌹',
      desc: 'La Ville Rose — 4ème ville de France',
      tension: 'Forte',
      tensionDesc:
        "Pôle universitaire majeur (100 000+ étudiants), aéronautique et tech. Demande locative soutenue toute l'année, faible vacance.",
      strategie: 'Studio & T2 — rendement optimisé',
      strategieDesc:
        'Petites surfaces meublées (LMNP) proches du métro ou des campus pour maximiser la demande locative.',
      rendementNetPct: 4.2,
    },
  },
  {
    nom: 'Amiens',
    slug: 'amiens',
    match: ['amiens'],
    infos: {
      surnom: 'Capitale picarde',
      habitants: 134_706,
      etudiants: 30_000,
      acces: 'à 1h05 de Paris en train',
      atout: 'Cathédrale classée UNESCO',
      prixM2Min: 1_700,
      prixM2Max: 2_300,
      rendementMoyenPct: 7.5,
    },
    diagnostic: {
      emoji: '⛪',
      desc: 'Capitale picarde — cathédrale UNESCO, marché en progression',
      tension: 'Modérée',
      tensionDesc:
        "Ville en renouveau économique. Prix d'achat bas = rendements élevés. Idéal pour stratégie cash-flow positif.",
      strategie: 'Colocation & T3 — cash-flow positif',
      strategieDesc:
        'T3 ou T4 en colocation — stratégie favorite Capsul sur cette ville pour atteindre le cash-flow positif.',
      rendementNetPct: 5.8,
    },
  },
  {
    nom: 'Nancy',
    slug: 'nancy',
    match: ['nancy'],
    infos: {
      surnom: "Capitale de l'Art nouveau",
      habitants: 104_260,
      etudiants: 50_000,
      acces: 'à 1h30 de Paris en TGV',
      atout: 'Place Stanislas — UNESCO',
      prixM2Min: 1_800,
      prixM2Max: 2_600,
      rendementMoyenPct: 7.0,
    },
    diagnostic: {
      emoji: '🌟',
      desc: "Capitale de l'Art Nouveau — Place Stanislas UNESCO",
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
    nom: 'Troyes',
    slug: 'troyes',
    match: ['troyes'],
    infos: {
      surnom: 'La cité des Ducs',
      habitants: 61_652,
      etudiants: 12_000,
      acces: 'à 1h30 de Paris en train',
      atout: "Préfecture de l'Aube",
      prixM2Min: 1_400,
      prixM2Max: 1_900,
      rendementMoyenPct: 8.2,
    },
    diagnostic: {
      emoji: '🏰',
      desc: "Cité des Ducs — l'un des meilleurs rendements de France",
      tension: 'Modérée',
      tensionDesc:
        "Prix d'achat parmi les plus accessibles de France. Rendements attractifs, idéal pour les primo-investisseurs.",
      strategie: 'T2/T3 meublé — fort rendement brut',
      strategieDesc:
        'Marché adapté aux budgets 80 000–130 000 €. Les T2/T3 rénovés offrent les meilleurs ratios prix/loyer.',
      rendementNetPct: 6.5,
    },
  },
  {
    nom: 'Épernay',
    slug: 'epernay',
    match: ['épernay', 'epernay'],
    infos: {
      surnom: 'Capitale du Champagne',
      habitants: 22_300,
      acces: 'à 1h30 de Paris en TGV',
      atout: 'Avenue de Champagne — UNESCO',
      prixM2Min: 1_400,
      prixM2Max: 2_100,
      rendementMoyenPct: 7.2,
    },
    diagnostic: {
      emoji: '🍾',
      desc: 'Capitale du Champagne — Avenue UNESCO',
      tension: 'Modérée à forte',
      tensionDesc:
        "Bassin d'emploi solide (Moët & Chandon, Mercier). TGV Paris en 1h30. Programme Action Cœur de Ville en cours, marché porté par l'industrie viticole.",
      strategie: 'T2/T3 — équilibre rendement et stabilité',
      strategieDesc:
        'Centre-ville et Berges de Marne très demandés. Bon choix pour primo-investisseur recherchant cash-flow stable et appréciation patrimoniale.',
      rendementNetPct: 5.5,
    },
  },
  {
    nom: 'Châlons-en-Champagne',
    slug: 'chalons-en-champagne',
    match: ['châlons', 'chalons'],
    infos: {
      surnom: 'Au cœur de la Champagne',
      habitants: 44_246,
      acces: 'à 1h30 de Paris en train',
      atout: 'Préfecture de la Marne',
      prixM2Min: 900,
      prixM2Max: 1_500,
      rendementMoyenPct: 9.0,
    },
    diagnostic: {
      emoji: '🌳',
      desc: 'Préfecture de la Marne — rendements parmi les plus élevés',
      tension: 'Faible à modérée',
      tensionDesc:
        "Marché peu concurrentiel à l'achat. Prix très accessibles, idéal pour un premier investissement à fort rendement.",
      strategie: 'T2/T3 — priorité cash-flow et rendement',
      strategieDesc:
        "Budget d'entrée très accessible (50 000–100 000 €). Focus sur les biens bien situés en centre-ville ou proche gare.",
      rendementNetPct: 7.2,
    },
  },
]

/** Noms affichés dans le select du wizard, dans l'ordre de VILLES. */
export const NOMS_VILLES: string[] = VILLES.map((v) => v.nom)

/** Retrouve une ville par son nom (ou toute chaîne la contenant), insensible à la casse. */
export function findVille(nom: string | null | undefined): Ville | null {
  const v = (nom ?? '').trim().toLowerCase()
  if (!v) return null
  return VILLES.find((e) => e.match.some((m) => v.includes(m))) ?? null
}

/** Vrai si au moins une information est renseignée (page « La ville » à générer). */
export function hasVilleInfos(infos: VilleInfos | null | undefined): boolean {
  if (!infos) return false
  return Object.values(infos).some((val) => val !== undefined && val !== null && val !== '')
}

// ─── Forme « formulaire » (wizard) ───────────────────────────────────────────
// Mêmes clés que VilleInfos, avec '' pour « non renseigné » (inputs contrôlés).

export interface VilleInfosForm {
  surnom: string
  habitants: number | ''
  etudiants: number | ''
  acces: string
  atout: string
  prixM2Min: number | ''
  prixM2Max: number | ''
  rendementMoyenPct: number | ''
}

export function villeInfosToForm(infos?: VilleInfos | null): VilleInfosForm {
  return {
    surnom:            infos?.surnom ?? '',
    habitants:         infos?.habitants ?? '',
    etudiants:         infos?.etudiants ?? '',
    acces:             infos?.acces ?? '',
    atout:             infos?.atout ?? '',
    prixM2Min:         infos?.prixM2Min ?? '',
    prixM2Max:         infos?.prixM2Max ?? '',
    rendementMoyenPct: infos?.rendementMoyenPct ?? '',
  }
}

/** Formulaire → objet persistable (clés vides retirées) ; `null` si rien n'est renseigné. */
export function formToVilleInfos(form: VilleInfosForm): VilleInfos | null {
  const infos: VilleInfos = {}
  const txt = (v: string) => (v.trim() ? v.trim() : undefined)
  const num = (v: number | '') => (v === '' ? undefined : v)
  if (txt(form.surnom)) infos.surnom = txt(form.surnom)
  if (num(form.habitants) !== undefined) infos.habitants = num(form.habitants)
  if (num(form.etudiants) !== undefined) infos.etudiants = num(form.etudiants)
  if (txt(form.acces)) infos.acces = txt(form.acces)
  if (txt(form.atout)) infos.atout = txt(form.atout)
  if (num(form.prixM2Min) !== undefined) infos.prixM2Min = num(form.prixM2Min)
  if (num(form.prixM2Max) !== undefined) infos.prixM2Max = num(form.prixM2Max)
  if (num(form.rendementMoyenPct) !== undefined) infos.rendementMoyenPct = num(form.rendementMoyenPct)
  return hasVilleInfos(infos) ? infos : null
}
