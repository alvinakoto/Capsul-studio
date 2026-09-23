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
  // Champs dataset uniquement : jamais copiés dans projects.ville_infos, jamais
  // éditables par le chargé dans le wizard (retour Lucas, S9 — trop chronophage
  // à ressaisir par projet). Source : recherche INSEE + presse/urbanisme, sept. 2026.
  aireAttraction?: number              // population aire d'attraction des villes (INSEE, zonage 2020)
  croissanceDemographiquePct?: number  // taux de variation annuel moyen, ex: 0.8 → "+0,8 %/an"
  quartiers?: string[]                 // 3-5 quartiers où investir, nom seul
  projetsAVenir?: string[]             // projets d'infrastructure/aménagement à venir, une ligne chacun
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
    aireAttraction: 356_721,
    croissanceDemographiquePct: 0.1,
    quartiers: ['Clairmarais', 'Croix-Rouge', 'Saint-Remi', 'Centre-ville / Cathédrale', 'Jean-Jaurès / Moissons'],
    projetsAVenir: [
      "Reims Grand Centre : reconversion des friches ferroviaires et pôle d'échanges multimodal bus-tram-train",
      'Reconstruction du nouveau CHU de Reims (secteur Croix-Rouge), 564 M€, achèvement prévu 2031',
      'Deux lignes de bus à haut niveau de service (BHNS) portées par le Grand Reims',
      'ZAC de Bezannes (172 ha) près de la gare Champagne-TGV : logements, activités, commerces',
    ],
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
    aireAttraction: 13_320_752,
    croissanceDemographiquePct: 0.3,
    // Quartiers non sourcés de façon fiable à ce stade — à compléter avant affichage
    // (piste : secteurs proches des nouvelles gares du Grand Paris Express).
    projetsAVenir: [
      "Grand Paris Express : nouvelles lignes de métro automatique (15, 16, 17, 18) et prolongements, mises en service échelonnées d'ici la fin de la décennie",
    ],
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
    aireAttraction: 1_529_112,
    croissanceDemographiquePct: 1.3,
    quartiers: ['Saint-Cyprien', 'Compans-Caffarelli', 'Montaudran', 'Les Chalets'],
    projetsAVenir: [
      'Ligne C du métro (Toulouse Aerospace Express) : 27 km, 21 stations, mise en service fin 2028',
      "Grand Matabiau (projet TESO) : réaménagement du cœur ferroviaire et quartier d'affaires, chantier en cours d'ici 2030",
      "Reconversion de la caserne Vion à Saint-Cyprien, d'ici 2030",
    ],
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
    aireAttraction: 354_368,
    croissanceDemographiquePct: 0.0,
    quartiers: ['Saint-Leu', 'Henriville', 'Gare La Vallée', 'Centre-ville / secteur Gare', 'Saint-Maurice'],
    projetsAVenir: [
      "ZAC Gare La Vallée (« Les 3 Mondes ») : ~500 logements et 14 500 m² de bureaux, travaux sur ~10 ans",
      'Réseau BHNS Nemo (bus à haut niveau de service, 100 % électrique)',
      "Écoquartier Intercampus (~1 900 logements) et transformation de la Citadelle en pôle universitaire (Renzo Piano)",
      "Nouvelle cité administrative de l'État dans le quartier Gare La Vallée, inaugurée le 31 janvier 2025",
    ],
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
    nom: 'Nancy',
    slug: 'nancy',
    match: ['nancy'],
    infos: {
      surnom: "Capitale de l'Art nouveau",
      habitants: 104_260,
      etudiants: 50_000,
      acces: 'à 1h30 de Paris en TGV',
      atout: 'Place Stanislas (UNESCO)',
      prixM2Min: 1_800,
      prixM2Max: 2_600,
      rendementMoyenPct: 7.0,
    },
    aireAttraction: 507_812,
    // Taux de croissance : reconstitution sur populations légales INSEE de l'aire
    // (511 257 hab. en 2017 → 507 812 en 2023) ; l'EPCI Grand Nancy affiche 0,0 %/an sur la même période.
    croissanceDemographiquePct: -0.1,
    quartiers: ['Rives de Meurthe', 'Quartier Gare / Nancy Grand Cœur', 'Hypercentre (Ville-Vieille / Stanislas)', 'Artem / campus', 'Nancy-Thermal / Haussonville'],
    projetsAVenir: [
      "Nancy Grand Cœur : écoquartier et pôle d'échanges autour de la gare",
      'Complexe Nancy Thermal (thermalisme et bien-être)',
      "Extension de l'écoquartier des Rives de Meurthe le long de la ligne T1",
    ],
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
    aireAttraction: 221_893,
    croissanceDemographiquePct: 0.4,
    quartiers: ['Bouchon de Champagne (centre historique)', 'Quartier de la Gare', 'Chartreux', 'Sénardes', 'Les Marots'],
    projetsAVenir: [
      'Pôle multimodal de la Gare de Troyes',
      "Projet Troyes 2030 (aménagement urbain d'ensemble)",
      'Réhabilitation des digues de la Seine',
    ],
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
    nom: 'Épernay',
    slug: 'epernay',
    match: ['épernay', 'epernay'],
    infos: {
      surnom: 'Capitale du Champagne',
      habitants: 22_300,
      acces: 'à 1h30 de Paris en TGV',
      atout: 'Avenue de Champagne (UNESCO)',
      prixM2Min: 1_400,
      prixM2Max: 2_100,
      rendementMoyenPct: 7.2,
    },
    aireAttraction: 55_524, // à vérifier directement sur le comparateur INSEE (obtenu via source secondaire citant l'INSEE)
    // Taux de croissance à l'échelle exacte de l'aire d'attraction non publié par l'INSEE ;
    // proxy commune d'Épernay (51230), période 2017-2023.
    croissanceDemographiquePct: -0.4,
    quartiers: ['Quartier de la Gare / Centre Est', 'Centre-ville / hypercentre', 'Mont Bernon', 'Vignes Blanches – Beausoleil Est'],
    projetsAVenir: [
      "ÉcoQuartier Berges de Marne (18 ha, ~300-500 logements), premières opérations en 2027, programme jusqu'à ~2040",
      "Pôle d'échanges multimodal de la gare (~7 M€), travaux démarrés sept. 2024, livraison ~2027",
      'Action Cœur de Ville « Épernay, centre-ville du futur » (OPAH-RU), phase 2 2023-2026',
    ],
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
    aireAttraction: 85_434, // à vérifier directement sur le comparateur INSEE (obtenu via source secondaire citant l'INSEE)
    // Taux de croissance à l'échelle exacte de l'aire d'attraction non publié par l'INSEE ;
    // proxy EPCI/bassin de vie de Châlons-en-Champagne, période 2017-2023.
    croissanceDemographiquePct: -0.5,
    quartiers: ['Centre-ville', 'Quartier de la Gare (rive gauche)', 'Rive gauche (Orléans, La Bidée, Mont-Saint-Michel)'],
    projetsAVenir: [
      'Rénovation urbaine de la rive gauche (ANRU, ~65 M€) : Orléans et La Bidée réhabilités, Mont-Saint-Michel à suivre',
      'Nouveau quartier Chanzy (administration unifiée ville/agglo), agents à partir de 2026, gros travaux 2027',
      'Rénovation du quartier Schmit (~38 M€), travaux à partir de fin 2025',
      "Pôle multimodal de la gare et projet de quartier d'affaires (~10 000 m²)",
    ],
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
