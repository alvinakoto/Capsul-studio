# Capsul Studio — Contexte projet

## Qui & quoi

Alvin est Chargé de Gestion et Développement chez Capsul France, société de conseil en investissement locatif clé-en-main basée à Reims (Reims, Paris, Toulouse, Amiens, Nancy, Troyes, Épernay, Châlons-en-Champagne). 200+ projets réalisés, ~30M€ investis, ~7% de rendement moyen. Clientèle principale : salariés et entrepreneurs 28-40 ans.

Capsul Studio est l'app web interne qui remplace le workflow Excel + Canva pour l'analyse d'investissement (gain visé : 2-3h → quelques minutes par fiche).

## Stack

- Next.js 16 + TypeScript + Tailwind + shadcn/ui
- Supabase (projet : `atgedsxwrbatrntupuwe.supabase.co`), Alvin en rôle admin
- Déploiement Vercel
- PDF généré côté serveur avec `@react-pdf/renderer`

## Architecture du moteur de calcul (`lib/calculs/`)

- `types.ts` — toutes les interfaces (`DonneesProjet`, `DonneesFinancement`, `DonneesCharges`, `ParamsLMNP`, `ParamsColocation`, `ParamsCourteDuree`, `ResultatsScenario`, `ResultatsComplets`, etc.)
- `communs.ts` — frais de notaire, honoraires Capsul, mensualité crédit, tableau d'amortissement, **et la projection patrimoniale** (`calculerProjection`, modes conservateur/réaliste)
- `lmnp.ts`, `colocation.ts`, `courteDuree.ts` — un module par scénario (signature `calculer*(charges, params, prixProjetTotal, mensualiteTotale)`)
- `index.ts` — `calculerScenario()`, point d'entrée qui orchestre tout et retourne `ResultatsComplets`
- `test.ts` — cas de référence Créteil, à lancer avec `npx tsx lib/calculs/test.ts`

### Données de référence (`lib/data/`)

- `villes.ts` — **source unique** des villes Capsul : alimente le select « Ville » du wizard (`NOMS_VILLES`), la page « La ville » de la fiche (`infos` : surnom, habitants, étudiants, accès, atout, prix m² min/max, rendement moyen) et le comparatif marché du PDF diagnostic (bloc `diagnostic` optionnel — `marketData.ts` n'est plus qu'un adaptateur). Pour ajouter une ville : une entrée ici suffit. Chiffres du premier jeu à valider par la direction.
- `travaux.ts` — catalogue des 13 postes de travaux (`id`, `label`, `icon`), ordre = ordre d'affichage sur la fiche
- `icons.ts` — tracés vectoriels lucide (ISC) partagés entre l'UI (`components/ui/IconNode.tsx`) et le PDF (`lib/pdf/common/LucideIcon.tsx`) → même glyphe à l'écran et dans les documents

### Règles métier

- **Honoraires Capsul** = `MAX(prixAchat × 8,28% TTC, 8 280€) + travaux × 5%` (taux passé de 6,9% à 8,28% récemment — les fiches historiques reflètent l'ancien taux ; champ overridable via `honorairesOverride`)
- **Capital emprunté** = `prixProjetTotal − apport` dans le moteur (`calculerFinancement`) — clamped à 0 ; si ≤ 0 → `isComptant = true`, tout le crédit à 0. Note : la RecapSticky affiche `prixAchat + travaux − apport` (montant finançable banque) ; la détection UI "comptant" dans `BlocD` utilise aussi cette base.
- **4 scénarios** : LLD nue, LMNP meublé, colocation, courte durée (16 nuits/mois conservateur, 22 nuits/mois optimiste — tous les champs sont overridables)
- **Vacance locative par défaut** : 5% pour LMNP meublé et courte durée, 8% pour colocation — pré-rempli dans `ScenarioPanel.tsx` et reseté automatiquement au changement de scénario
- **Vacance locative persistée** : colonne `vacance_pct NUMERIC(5,2)` sur `projects` (nullable, pas de `DEFAULT` — `null` = jamais calculé, distinct de `0` saisi volontairement). Sauvegardée par `updateProjectScenario()` au clic "Calculer" dans `ScenarioPanel`, puis relue par les routes PDF (`fiche/route.ts`, `rapport/route.ts`) avec fallback (5%/8%) uniquement si `null`.
- **Fiscalité hors périmètre** (décision direction, septembre 2026) : aucun calcul ni affichage net d'impôt nulle part — ni TMI, ni régime micro/réel, ni amortissements. Tous les flux sont **avant impôt** : `cashflowMensuel` = revenus nets (après vacance/conciergerie) − charges − mensualité. Le module `fiscalite.ts` et la colonne `tmi_client_pct` ont été supprimés (récupérables dans l'historique git avant le commit S8). Ne pas réintroduire de vocabulaire fiscal dans le simulateur ou les documents sans validation de la direction.
- **CFE (Cotisation Foncière des Entreprises)** : ~300 €/an, spécifique à la courte durée — incluse dans `ParamsCourteDuree.cfe`, champ modifiable dans wizard (BlocE) et ScenarioPanel ; colonne `cfe NUMERIC(10,2) DEFAULT 300` dans la table `projects`
- **Page « La ville »** (page 2 de la fiche) : données = `projects.ville_infos` (JSONB, saisies/modifiées dans BlocA) sinon `infos` du dataset `lib/data/villes.ts` ; à la sélection d'une ville dans le wizard, les champs sont pré-remplis depuis le dataset et restent modifiables par projet. Page omise si aucune info. Photo optionnelle : `public/villes/<slug>.jpg`, sinon composition typographique.
- **Page « Travaux »** (a remplacé la projection patrimoniale, plus la dernière page depuis l'ajout de Conclusion) : `projects.travaux_postes` = ids du catalogue `lib/data/travaux.ts`, sélectionnés par chips dans BlocC ; icône + libellé par poste, budget travaux et DPE actuel → visé en KPI. Page omise si aucun poste. Commentaire libre optionnel (`projects.commentaire_travaux`, saisi dans `ScenarioPanel`) affiché en bas de page si renseigné. La projection patrimoniale reste uniquement dans le rapport analytique.
- **Photo de localisation** (page « Le bien ») : capture de carte (Google Maps, Plans…) avec repère sur l'emplacement du bien, uploadée dans le wizard (Bloc Photos) comme les autres photos — type `localisation` dans `project_images`. Optionnelle, page inchangée si absente.
- **Page « Conclusion »** (toujours présente, ferme le dossier) : met en avant 4 réalisations Capsul sélectionnées à la main dans `lib/data/realisations.ts` (ville, typologie, budget, rentabilité brute + photo `public/realisations/<slug>.jpg`), avec un lien vers capsul-france.com. Dataset choisi manuellement — pas de fetch live du site Capsul depuis la génération PDF (dépendance externe fragile), à rafraîchir à la main comme `villes.ts`.
- **Projections** (`communs.ts::calculerProjection`) : mode conservateur (`revalorisation = 0`) et réaliste (`revalorisation = 2` par défaut), patrimoine net calculé sur 20 ans à partir du tableau d'amortissement + cash-flow cumulé + plus-value latente en mode réaliste
- **Cas de référence pour tous les tests** : Créteil T4, 270 055€ projet total
- **Logique "recommandé vs choisi"** : la suggestion auto du scénario s'affiche en badge bleu clair ; le choix final du chargé en badge étoile pleine

### Bugs connus déjà résolus (historique, pour référence)

- Désalignement de noms de champs `courte_duree` entre `ScenarioPanel.tsx`/`route.ts` (PDF) et `types.ts` → corrigé : `prixNuitee`, `nuitsConservateur`, `nuitsOptimiste`, `conciergeriePct`, `electriciteEau`, `internet`, `chauffage`
- Séparateurs de milliers cassés dans le PDF (`toLocaleString('fr-FR')` insère un espace fine insécable U+202F que Montserrat ne rend pas dans react-pdf) → corrigé via un helper centralisé `lib/pdf/helpers.ts` (`euros()`, `pct()`, `eurosShort()`) qui strip U+00A0/U+202F. **Règle à respecter pour tout nouveau code PDF : ne jamais appeler `.toLocaleString('fr-FR')` en dur dans un composant `Page*.tsx`, toujours passer par les helpers.**
- Affichage limité à 3/6 photos secondaires dans `PageBien.tsx` (`slice(0,3)` en dur) → corrigé en 2 rangées de 3
- Graphique de projection PDF (`PageProjection.tsx`) rogné sur l'étiquette A20 (positionnée à `x=CW` avec `textAnchor="middle"`) → corrigé avec marge droite `PAD_R` + `textAnchor="end"` sur la dernière étiquette
- Vacance coloc hardcodée à 5% dans `ScenarioPanel.tsx` et route PDF → corrigé : reset automatique à 8% au switch de scénario, route PDF utilise `vacancePct: 8` pour colocation
- CFE absente du scénario courte durée → ajoutée end-to-end : `ParamsCourteDuree.cfe` dans `types.ts`, `courteDuree.ts`, wizard `BlocE`, `ScenarioPanel`, `lib/supabase/projects.ts`, route PDF (`cfe: project.cfe ?? 300`), colonne SQL `cfe NUMERIC(10,2) DEFAULT 300`
- Bug (C) résolu : `loyer_cible` et `scenario_type` sauvegardés en base via `updateProjectScenario()` au clic "Calculer" dans `ScenarioPanel` (status passe à `'simulation'`) ; bouton "Télécharger la fiche" affiché dans la section résultats ; route PDF colocation corrigée (`loyerParChambre: loyer` direct, sans division par 3) ; colonnes `loyer_cible NUMERIC(10,2)` et `scenario_type TEXT` ajoutées à la table `projects`
- Logo page login : le caractère `⊕` remplacé par l'image `/logo-capsul.jpg` (40×40, arrondie) + texte "CAPSUL STUDIO" — cohérent avec la page inscription
- Photos HEIC (iPhone) silencieusement rejetées à l'upload → corrigé via `lib/utils/convertHeic.ts` (`ensureJpeg()`) branché dans `BlocB.tsx` : détection par MIME **et** extension (les iPhone envoient souvent `type = ""`), conversion `heic2any` → JPEG 92% avant upload Supabase, spinner "Conversion HEIC en cours…" pendant le traitement, `accept="image/*,.heic,.heif"` sur tous les inputs photo
- Zéros insécables dans `ScenarioPanel` : inputs `type="number"` avec `onChange={() => setX(Number(e.target.value))}` remettaient `0` dès que le champ était vidé (backspace bloqué) → tous les champs numériques (`vacance`, `nbChambres`, `nuitsCons`, `nuitsOpti`) passés en `number | ''` avec même pattern que `EuroField` ; `handleCalculer` utilise `Number(x) || fallback` pour les valeurs vides
- Champ "Vacance locative" masqué pour le scénario courte durée (redondant avec nuits/mois conservateur et optimiste)
- Achat comptant (`capitalEmprunte ≤ 0`) produisait NaN/Infinity → résolu end-to-end : `calculerFinancement` détecte `isComptant` et court-circuite tout le crédit à 0 ; `calculerAmortissement` retourne `[]` si capital ≤ 0 ; `calculerProjection` utilise `valeurBien + cashflowCumul` (bien possédé à 100% dès J1) ; `ResultatsComplets.isComptant: boolean` propagé jusqu'à `ScenarioPanel` (badge "Achat comptant — aucun crédit") et `BlocD` (champs taux/durée grisés + bannière) ; PDF diagnostic pages 3 et 5 affichent encadrés dédiés ; rapport analytique `PageAmortissement` message adapté
- Vacance locative et TMI client appliqués de façon incohérente entre le simulateur et les PDF générés → deux causes distinctes corrigées : (1) `vacancePct`/`tmiClientPct` choisis dans `ScenarioPanel` n'étaient jamais persistés en base — seuls `loyer_cible`, `scenario_type`, `frais_gestion_pct`, `concierge_pct` l'étaient — donc les routes `fiche/route.ts` et `rapport/route.ts` recalculaient toujours le scénario avec des valeurs hardcodées (vacance 5%/8%, TMI 30% via `TMI_DEFAULT`), ignorant le choix réel du chargé ; corrigé en ajoutant les colonnes `vacance_pct`/`tmi_client_pct` et en les relisant partout (cf. règle métier ci-dessus). (2) Bug distinct et plus sournois : `lib/pdf/components/PageScenario.tsx` (page 3 de la fiche commerciale) avait sa **propre copie hardcodée** (`const vacancePct = 5`, `const tmi = 30 // TODO: store tmi in project`) totalement déconnectée des données réellement calculées par le moteur — donc même après avoir corrigé (1), la ligne d'affichage "Vacance locative (5 %)" restait figée à 5% pendant que l'impôt/cashflow affichés sur la même page reflétaient déjà la vraie valeur. **Leçon** : quand un composant d'affichage PDF a besoin d'une donnée déjà calculée par le moteur, toujours la faire transiter par le type de données (`FicheData`/`RapportData`) plutôt que de la recoder en dur localement — sinon la duplication diverge silencieusement au premier changement de règle métier.

## Schéma Supabase — points clés

- Table `projects` : `charge_id` (FK), `status` (`'draft'` → `'simulation'` après premier calcul), `city` NOT NULL, `type_bien` avec CHECK incluant studio/maison
- Colonnes scénario dans `projects` : `cfe NUMERIC(10,2) DEFAULT 300`, `loyer_cible NUMERIC(10,2)`, `scenario_type TEXT` (`'lmnp_meuble'` | `'colocation'` | `'courte_duree'`), `vacance_pct NUMERIC(5,2)` (nullable sans `DEFAULT`, pour distinguer "non renseigné" de "0 volontaire"). La colonne `tmi_client_pct` a été supprimée en S8.
- Colonnes fiche dans `projects` (S8) : `ville_infos JSONB` (nullable — `null` = utiliser le dataset `lib/data/villes.ts`), `travaux_postes TEXT[] NOT NULL DEFAULT '{}'`
- `projects.commentaire_travaux TEXT` (nullable, S9) : commentaire libre optionnel du chargé, affiché en bas de la page Travaux
- Pas de dossier de migrations dans le repo : les changements de schéma sont exécutés à la main (dashboard Supabase ou MCP `apply_migration`) et documentés ici
- Photos : 5-10 par projet, upload/suppression drag-and-drop (pas de réordonnancement ni légendes en v1), stockées dans le bucket public Supabase Storage `project-images` + table `project_images` (colonnes `type` : cover/main/secondary/localisation, `ordre`, `legende`, `public_url`)
- Photos secondaires apparaissent uniquement dans la fiche commerciale PDF, pas dans le rapport analytique (qui est un document séparé)

## Stack PDF (`lib/pdf/`)

- Fiche commerciale (composants dans `lib/pdf/components/`) : `PageCouverture.tsx` → `PageVille.tsx` → `PageBien.tsx` → `PageScenario.tsx` → `PageTravaux.tsx` → `PageConclusion.tsx`. Ville et Travaux sont conditionnelles, Conclusion toujours présente (dernière page, footer sombre "dossier confidentiel") ; `FicheCommerciale.tsx` construit la liste réelle des pages et passe `pageNumber` à chacune (numérotation d'en-tête dynamique — ne jamais coder un numéro de page en dur)
- Rapport analytique (`lib/pdf/rapport/`) : Synthèse, Amortissement du crédit, Projection patrimoniale. PDF diagnostic (`lib/pdf/diagnostic/`) : document séparé pour le pipeline Make, déjà sans fiscalité
- Helpers de formatage centralisés dans `lib/pdf/helpers.ts` : `euros()`, `pct()`, `nombre()`, `pageNum()`, `orDash()` — tous strippent U+00A0/U+202F
- `lib/pdf/common/LucideIcon.tsx` rend une icône de `lib/data/icons.ts` en primitives react-pdf ; `lib/pdf/common/villePhoto.ts` résout `public/villes/<slug>.(jpg|jpeg|png)` via le système de fichiers (même mécanisme que les polices)
- Rendu local sans base ni auth : `npx tsx test/render-fiche.tsx <dossier> [photo-ville.jpg]` génère 3 variantes de la fiche (complète, avec photo, minimale) ; `npx tsx test/render-test.tsx` pour le diagnostic
- Police Montserrat enregistrée via `lib/pdf/common/fonts.ts::registerFonts()`
- Styles communs dans `lib/pdf/common/styles.ts` (`colors`, `sizes`, `common`)

## Leçons d'infrastructure

- Utiliser `npx tsx` directement pour éviter les conflits de version Next.js dans le lockfile
- La syntaxe heredoc shell ne doit jamais déborder dans des fichiers TypeScript
- Supabase RLS : éviter les requêtes auto-référentielles sur la table `users` ; utiliser `auth.jwt() ->> 'role'` à la place
- "Invite user" Supabase échoue sur le plan gratuit (limite SMTP) → utiliser "Create new user" + Auto Confirm
- Next.js 16 : le fichier middleware doit s'exporter comme `proxy.ts` avec `export function proxy()` ; éviter la notation par points dans les chemins de dossiers `lib/`

## Outils & intégrations externes (hors périmètre Capsul Studio mais pertinents pour le contexte business)

- CRM : HubSpot (un seul pipeline en plan gratuit — renommer le pipeline par défaut plutôt que d'en créer un nouveau)
- Site : Framer (DNS via Ionos)
- Automatisation lead gen : Make.com — webhook → PDFMonkey (template `5A684B4F-8D9A-4D45-8A55-F371EADA2C7E`) → création contact HubSpot → email HTML avec CTA
- Scheduling : Microsoft Bookings (préféré à Calendly, écosystème M365)
- Partenaires : broker VANETYS, cabinet comptable QLOWER, deux CGP

## Design system UI (établi en S-UI)

### Palette Capsul (définie dans `app/globals.css` via `@theme inline`)
- `--color-capsul-navy: #0E2240` — sidebar, titres, CTAs primaires
- `--color-capsul-gold: #C9943A` — accents, mensualité, badge simulation, bouton save
- `--color-capsul-ivory: #F7F5F1` — fond de page
- `--color-capsul-stone: #EDE9E1` — fond de cartes secondaires, séparateurs
- `--color-capsul-mist: #6E6E73` — texte muted, labels
- Police : **Montserrat** (importé via `next/font/google`, poids 400–800) — cohérent avec le PDF

### Layout global
- `components/layout/AppLayout.tsx` — wrapper client qui lit `usePathname()` et affiche la sidebar uniquement hors `/login`
- `components/layout/Sidebar.tsx` — sidebar fixe 220px, navy, avec : logo Capsul (image `public/logo-capsul.jpg` 36×36 + texte CAPSUL/STUDIO), nav "Projets", CTA "Nouveau projet" en or, footer user + déconnexion
- Toutes les pages authentifiées ont `margin-left: 220px` via `AppLayout`

### Conventions de style UI
- Inline styles pour les couleurs Capsul (plus fiable que classes Tailwind pour les custom tokens dans ce projet)
- Hover handlers `onMouseEnter`/`onMouseLeave` pour les états interactifs (pas de `:hover` Tailwind sur les éléments inline-styled)
- Badge status : pill avec dot coloré (pas de `<Badge>` shadcn) — `bg`/`color`/`dot` définis dans `STATUS_CONFIG`
- Barre or `h-0.5` ou `h-1` en top de carte pour le statut "simulation"
- Labels : `text-[10px] font-semibold uppercase tracking-[0.1em]` en `capsul-mist`
- Valeurs financières clés : navy bold ; mensualité/total : or bold
- Fil d'Ariane `← Projets` présent sur toutes les pages de détail/édition

### Wizard (WizardShell)
- Stepper pills custom (plus les `<Tabs>` shadcn visibles) : pills numérotées sur fond `#EDE9E1`, active = fond blanc + border navy
- CTA "Suivant" = navy, "Enregistrer" = or

## État d'avancement des sprints

- **S1 ✅** Auth/login, middleware de routes, affichage utilisateur
- **S2 ✅** Moteur de calcul TypeScript, validé sur le cas Créteil T4
- **S3 ✅** Wizard d'intake 6 blocs (A→F), `useReducer`, `RecapSticky`, upload photo
- **S4 ✅** Dashboard `/projets` — liste projets avec cards et mensualité
- **S5/S6 ✅** Génération PDF fiche commerciale (4 pages) + page détail projet + simulateur scénario — bugs de champs, vacance coloc, CFE, et flux téléchargement PDF résolus
- **S-UI ✅** Refonte UI/UX globale — sidebar navigation, design system Capsul (navy/or/ivory), Montserrat, redesign dashboard/cards/header/wizard
- **S7 ✅** Rapport analytique PDF séparé (`lib/pdf/rapport/` : synthèse, amortissement, projection) — document distinct de la fiche commerciale, orienté chargé/investisseur
- **S8 ✅** Retours dirigeants (septembre 2026) — fiscalité retirée end-to-end (moteur, simulateur, fiche, rapport, base), page « La ville » avec source unique `lib/data/villes.ts`, page « Travaux » à la place de la projection, « Régime Réel » retiré des intitulés, numérotation dynamique de la fiche
- **S9 ⏳ (partiel)** Retours dirigeants #2 (Quentin + Lucas, septembre 2026) — fait : commentaire travaux optionnel, photo de localisation (page Le bien), chiffres clés agrandis (page Couverture), nouvelle page Conclusion avec réalisations (`lib/data/realisations.ts`) ; en attente : refonte page « La ville » demandée par Lucas (carte quartiers + projets locaux à venir — asset visuel à sourcer, données à collecter pour les 7 autres villes), et le "vide en bas de page" sur Scénario et autres pages (discussion direction en cours)

## Reste à faire / en cours

- **Photos villes** : déposer 8 photos libres de droits dans `public/villes/` (`reims.jpg`, `paris.jpg`, `toulouse.jpg`, `amiens.jpg`, `nancy.jpg`, `troyes.jpg`, `epernay.jpg`, `chalons-en-champagne.jpg`) — la page fonctionne sans en attendant
- **Chiffres villes** : faire valider par la direction le jeu de données de `lib/data/villes.ts` (habitants, étudiants, accès, atout, prix m², rendement)
- **Retour Lucas — page « La ville »** : ajouter aire d'attraction, croissance démographique, classement/superlatif et une liste de projets locaux à venir (nouveaux champs `VilleInfos`) ; carte N&B des quartiers en attente d'un asset visuel par ville (source à définir — pas généré par Claude)
- **"Vide en bas de page"** (retour Quentin) sur `PageScenario.tsx` et la plupart des autres pages — pas de contenu à ajouter défini pour l'instant ; piste envisagée : agrandir/espacer la police plutôt qu'ajouter des blocs, à trancher au cas par cas avec la direction
- **Bug 4 (dépriorisé)** : scénario LLD nue absent du moteur et de l'UI — à implémenter quand besoin métier confirmé
- LinkedIn comme canal d'acquisition à activer (dépendance actuelle forte aux Google Ads)
- Programme de parrainage et partenariats CSE/RH en axes secondaires (prospection CSE dépriorisée, jugée trop chronophage)

## Conventions de travail avec Claude

- Alvin code lui-même, Claude est partenaire d'implémentation direct (pas génération de prompts pour d'autres outils)
- Avancer sprint par sprint avec portes de validation
- Qualité avant vitesse
- Les changements de règles métier (ex : taux d'honoraires) sont historisés avec contexte et capacité d'override

## Routine de mise à jour de ce fichier

À la fin d'un sprint, après un changement de règle métier significatif (ex : taux d'honoraires, formule de calcul, structure de table Supabase), ou après la résolution d'un bug non trivial, propose une mise à jour de ce CLAUDE.md avant de clôturer la session :

1. Résume les changements pertinents (nouvelles règles métier, sprints terminés, bugs résolus, nouvelles leçons d'infrastructure)
2. Propose le diff précis à appliquer sur ce fichier
3. Attends ma validation explicite avant de l'appliquer — ne jamais modifier ce fichier silencieusement
4. Si rien de notable n'a changé dans la session, ne propose rien