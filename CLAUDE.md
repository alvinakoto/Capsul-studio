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
- `fiscalite.ts` — calculs micro-BIC et LMNP réel
- `lmnp.ts`, `colocation.ts`, `courteDuree.ts` — un module par scénario
- `index.ts` — `calculerScenario()`, point d'entrée qui orchestre tout et retourne `ResultatsComplets`

⚠️ Il existe un fichier `projections.ts` à la racine de `lib/calculs/` qui est **vide et mort** — la vraie logique de projection est dans `communs.ts::calculerProjection()`. Ne pas réimplémenter dans `projections.ts` sans vérifier qu'il est bien importé nulle part ailleurs ; à terme il faudrait soit le supprimer, soit y déplacer `calculerProjection` pour que le nom de fichier soit cohérent.

### Règles métier

- **Honoraires Capsul** = `MAX(prixAchat × 8,28% TTC, 8 280€) + travaux × 5%` (taux passé de 6,9% à 8,28% récemment — les fiches historiques reflètent l'ancien taux ; champ overridable via `honorairesOverride`)
- **Capital emprunté** = `prixAchat + travaux − apport` (notaire et honoraires exclus, hors financement bancaire)
- **4 scénarios** : LLD nue, LMNP meublé, colocation, courte durée (16 nuits/mois conservateur, 22 nuits/mois optimiste — tous les champs sont overridables)
- **Vacance locative par défaut** : 5% pour LMNP meublé et courte durée, 8% pour colocation — pré-rempli dans `ScenarioPanel.tsx` et reseté automatiquement au changement de scénario
- **CFE (Cotisation Foncière des Entreprises)** : ~300 €/an, spécifique à la courte durée — incluse dans `ParamsCourteDuree.cfe`, champ modifiable dans wizard (BlocE) et ScenarioPanel ; colonne `cfe NUMERIC(10,2) DEFAULT 300` dans la table `projects`
- **LMNP amortissements (simplifié)** : bien 2%/an sur 85% du prix, mobilier 10%/an, travaux 5%/an
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

## Schéma Supabase — points clés

- Table `projects` : `charge_id` (FK), `status` (`'draft'` → `'simulation'` après premier calcul), `city` NOT NULL, `type_bien` avec CHECK incluant studio/maison
- Colonnes scénario dans `projects` : `cfe NUMERIC(10,2) DEFAULT 300`, `loyer_cible NUMERIC(10,2)`, `scenario_type TEXT` (`'lmnp_meuble'` | `'colocation'` | `'courte_duree'`)
- Photos : 5-10 par projet, upload/suppression drag-and-drop (pas de réordonnancement ni légendes en v1), stockées dans le bucket public Supabase Storage `project-images` + table `project_images` (avec colonnes `type` : cover/main/secondary, `ordre`, `legende`, `public_url`)
- Photos secondaires apparaissent uniquement dans la fiche commerciale PDF, pas dans le rapport analytique (qui est un document séparé)

## Stack PDF (`lib/pdf/`)

- 4 pages dans la fiche commerciale : `PageCouverture.tsx`, `PageBien.tsx` (composants dans `lib/pdf/components/`), `PageScenario.tsx`, `PageProjection.tsx`
- Helpers de formatage centralisés dans `lib/pdf/helpers.ts` : `euros()`, `pct()`, `eurosShort()`, `orDash()` — tous strippent U+00A0/U+202F
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
- **S7 (à venir)** Sprint dédié au rapport analytique PDF séparé

## Reste à faire / en cours

- **S7** : rapport analytique PDF séparé (document distinct de la fiche commerciale, orienté chargé/investisseur — tableaux d'amortissement, fiscalité détaillée, projection chiffrée)
- **Bug 1 (dépriorisé)** : frais de notaire non inclus dans la base amortissable LMNP — impact fiscal mineur, à traiter en S7 ou ultérieurement
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