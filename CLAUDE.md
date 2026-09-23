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
- **3 scénarios** : LMNP meublé, colocation, courte durée (16 nuits/mois conservateur, 22 nuits/mois optimiste — tous les champs sont overridables)
- **LLD nue hors périmètre** (décision direction) : Capsul ne propose pas de location nue/longue durée non meublée à ses clients — uniquement LMNP meublé, colocation, courte durée. Ce n'est pas une dépriorisation technique, c'est un choix de business model. Ne pas l'ajouter au moteur de calcul ni à l'UI sans validation explicite de la direction.
- **Vacance locative par défaut** : 5% pour LMNP meublé et courte durée, 8% pour colocation — pré-rempli dans `ScenarioPanel.tsx` et reseté automatiquement au changement de scénario
- **Vacance locative persistée** : colonne `vacance_pct NUMERIC(5,2)` sur `projects` (nullable, pas de `DEFAULT` — `null` = jamais calculé, distinct de `0` saisi volontairement). Sauvegardée par `updateProjectScenario()` au clic "Calculer" dans `ScenarioPanel`, puis relue par les routes PDF (`fiche/route.ts`, `rapport/route.ts`) avec fallback (5%/8%) uniquement si `null`.
- **Fiscalité hors périmètre** (décision direction, septembre 2026) : aucun calcul ni affichage net d'impôt nulle part — ni TMI, ni régime micro/réel, ni amortissements. Tous les flux sont **avant impôt** : `cashflowMensuel` = revenus nets (après vacance/conciergerie) − charges − mensualité. Le module `fiscalite.ts` et la colonne `tmi_client_pct` ont été supprimés (récupérables dans l'historique git avant le commit S8). Ne pas réintroduire de vocabulaire fiscal dans le simulateur ou les documents sans validation de la direction.
- **CFE (Cotisation Foncière des Entreprises)** : ~300 €/an, spécifique à la courte durée — incluse dans `ParamsCourteDuree.cfe`, champ modifiable dans wizard (BlocE) et ScenarioPanel ; colonne `cfe NUMERIC(10,2) DEFAULT 300` dans la table `projects`
- **Page « La ville »** (page 2 de la fiche) : données = `projects.ville_infos` (JSONB, saisies/modifiées dans BlocA) sinon `infos` du dataset `lib/data/villes.ts` ; à la sélection d'une ville dans le wizard, les champs sont pré-remplis depuis le dataset et restent modifiables par projet. Page omise si aucune info. Photo optionnelle : `public/villes/<slug>.jpg`, sinon composition typographique.
  Depuis S9 (refonte Lucas) : 4 champs supplémentaires — `aireAttraction`, `croissanceDemographiquePct`, `quartiers`, `projetsAVenir` — vivent uniquement sur `Ville` dans `lib/data/villes.ts` (pas sur `VilleInfos`), **jamais copiés dans `ville_infos`, jamais éditables par le chargé** (trop chronophage à ressaisir par projet — décision explicite). Le classement/superlatif type « Top 5 villes où investir » a été volontairement fusionné avec le champ `atout` existant plutôt que dupliqué.
- **Page « Travaux »** (a remplacé la projection patrimoniale, plus la dernière page depuis l'ajout de Conclusion) : `projects.travaux_postes` = ids du catalogue `lib/data/travaux.ts`, sélectionnés par chips dans BlocC ; icône + libellé par poste, budget travaux et DPE actuel → visé en KPI. Page omise si aucun poste. Commentaire libre optionnel (`projects.commentaire_travaux`, saisi dans `ScenarioPanel`) affiché en bas de page si renseigné. La projection patrimoniale reste uniquement dans le rapport analytique.
- **Photo de localisation** (page « Le bien ») : capture de carte (Google Maps, Plans…) avec repère sur l'emplacement du bien, uploadée dans le wizard (Bloc Photos) comme les autres photos — type `localisation` dans `project_images`. Optionnelle, page inchangée si absente.
- **Page « Conclusion »** (toujours présente, ferme le dossier) : refaite en S9 en page simple fond navy plein ("Merci de votre confiance" + lien vers capsul-france.com) — l'ancienne version avec 4 cartes de réalisations (`lib/data/realisations.ts`, photos `public/realisations/<slug>.jpg`) alourdissait le PDF de ~1,2 Mo (photos) pour un bénéfice limité ; dataset et composant photo laissés en place mais plus utilisés, à supprimer si la version simplifiée est validée durablement. Footer de cette page = seule page du dossier à afficher les **mentions légales** de Capsul France (SIRET, adresse, téléphone, site, email) — à mettre à jour à la main si ces infos changent (`MENTIONS_LEGALES` dans `PageConclusion.tsx`).
- **Projections** (`communs.ts::calculerProjection`) : mode conservateur (`revalorisation = 0`) et réaliste (`revalorisation = 2` par défaut), patrimoine net calculé sur 20 ans à partir du tableau d'amortissement + cash-flow cumulé + plus-value latente en mode réaliste
- **Cas de référence pour tous les tests** : Créteil T4, 270 055€ projet total
- **Logique "recommandé vs choisi"** : la suggestion auto du scénario s'affiche en badge bleu clair ; le choix final du chargé en badge étoile pleine
- **Champs retirés du moteur** : `valeurBienApresTravaux` (la projection patrimoniale utilise systématiquement `prixAchat + travaux` — Capsul ne s'engage plus sur une valeur de revente estimée) et `plan_3d` / « Honoraires décoration Capsul » (déjà compris dans le montant de l'ameublement, jugé redondant par les chargés). Retirés end-to-end (moteur, wizard, simulateur, PDF, Supabase). Les colonnes SQL `valeur_bien_apres_travaux` et `plan_3d` restent en base mais ne sont plus jamais lues ni écrites (suppression de colonne = opération destructive, laissée à la main d'Alvin).
- **Toggles "estimation" activés par défaut** (négociation envisagée, budget travaux estimé, frais de notaire estimé dans le wizard) : les chargés travaillent presque toujours avec des montants encore à affiner à ce stade. Les projets déjà créés avant ce changement ne sont pas affectés (valeur figée à la création).
- **Nom de projet** : éditable par le chargé (clic sur le titre dans la fiche projet, ou champ optionnel dans le wizard Bloc A) — vide = suit automatiquement l'adresse du bien (`nomProjetAuto()`, `lib/supabase/projects.ts`). Le nom du fichier PDF téléchargé (`lib/pdf/common/filename.ts`) suit le même principe : `<adresse>, <ville> - <type de bien>.pdf`, avec repli ASCII (RFC 5987) dans l'en-tête `Content-Disposition` pour les villes accentuées.
- **Description du bien** : limitée à 400 caractères (`MAX_DESCRIPTION`, `BlocA.tsx`) — calé empiriquement pour garantir que la description + la grille de 6 photos supplémentaires tiennent toujours sur la page « Le bien ». Le nombre de caractères seul n'est pas un indicateur fiable : un texte avec des sauts de paragraphe (usage réel) prend bien plus de hauteur qu'un bloc continu pour la même longueur — seuil de débordement réel mesuré à ~540-560 caractères avec 1-2 paragraphes, d'où la marge prise à 400.
- **Page « Le bien »** : la carte de localisation (adresse + capture de carte) est en **colonne droite**, sous les Caractéristiques — pas à côté de la description. Les 6 photos supplémentaires max (imposé à l'upload, `BlocB.tsx`) s'affichent en colonne gauche, sous la description, en **grille 2 rangées de 3**. Cette disposition découple la grille photo de la longueur de la description (cf. bug résolu ci-dessous).

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
- Ajout de contenu à la page « La ville » (aire d'attraction, croissance démo, quartiers, projets à venir, S9) → la fiche est passée de 6 à 7 pages sans erreur ni warning (react-pdf ajoute silencieusement une page de débordement, sans header/footer, quand le contenu dépasse la hauteur A4 — aucun composant du PDF n'utilise `fixed`). Corrigé en resserrant les espacements (tuiles → ligne compacte, listes plus denses) jusqu'à revalider 1 page par ville sur les 8. **Leçon : toute page PDF doit être revalidée avec `npx tsx test/render-fiche.tsx` + comptage de pages après un ajout de contenu — un débordement ne lève aucune erreur, il faut le détecter manuellement (page count avant/après).**
- Débordement PDF en production sur la page « Le bien » (remonté via un vrai dossier généré, pas un test) : description + carte de localisation + 4-6 photos secondaires ne tenaient plus sur une page. Cause : agrandissement de police fait dans une session précédente (lisibilité), jamais testé avec une combinaison réaliste texte + carte + photos — le seul test de rendu existant (`render-fiche.tsx`) n'a jamais de photos. Corrigé en déplaçant la carte de localisation en colonne droite (sous-utilisée, beaucoup de marge sous les Caractéristiques) pour libérer toute la colonne gauche à la grille photo (2×3, taille normale) ; `MAX_DESCRIPTION` réduit de 600 à 400 caractères. **Leçon : les tests de rendu PDF doivent inclure des photos, pas seulement du texte — un cas sans photo ne peut pas détecter ce type de débordement.**
- « Vide en bas de page » (retour Quentin, S9) sur `PageScenario.tsx` : l'ancrage `justifyContent: 'space-between'` (pousser le bloc de clôture tout en bas de la colonne) a été essayé puis **rejeté par Alvin** (pas esthétique — déplace le vide au milieu de la colonne plutôt que de le combler). Solution retenue : rééquilibrage des colonnes (Flux mensuels + Plan de financement à gauche, Structure du projet + Bilan mensuel à droite, au lieu de Flux+Bilan / Structure+Financement) et gonflement modéré de la police/des espacements. Même traitement (typographie + espacements, pas d'ancrage) appliqué au rapport analytique (3 pages). Sur la page Ville, un `space-between` similaire collait le contenu au footer — remplacé par un écart fixe de 28pt entre les deux sections. **Leçon : le remplissage dynamique à 100% de l'espace restant (`space-between`) évite bien le débordement mais colle souvent le contenu à un bord de page — préférer un espacement fixe et généreux, quitte à ne pas combler 100% du vide.**
- Choix du scénario recommandé (bloc F du wizard) sans effet sur le simulateur après création du projet : `scenario_type` n'était sauvegardé à la création que si le champ "Loyer cible" (bloc F) était aussi rempli — or ce champ, jugé inutile par les chargés, était rarement rempli, donc le choix de scénario ne partait jamais en base et `ScenarioPanel` retombait sur le défaut `lmnp_meuble`. Corrigé en retirant le champ (le loyer se saisit désormais une seule fois, dans le simulateur après création) et en sauvegardant `scenario_type` dès qu'un scénario est sélectionné ou auto-suggéré, indépendamment du loyer.
- Libellés peu lisibles sur les bandeaux navy des PDF (« Scénario retenu », « Rénovation clé en main », « Investir à », légendes de KPI) : couleur trop sombre (`#5a7a9a`/`#8ba4bf`). Remontée vers `#b6cbe0` (déjà utilisé ailleurs dans le PDF) + police plus grasse, sans dépasser la prééminence des chiffres eux-mêmes (26pt+, gras, blanc/or).

## Schéma Supabase — points clés

- Table `projects` : `charge_id` (FK), `status` (`'draft'` → `'simulation'` après premier calcul), `city` NOT NULL, `type_bien` avec CHECK incluant studio/maison
- Colonnes scénario dans `projects` : `cfe NUMERIC(10,2) DEFAULT 300`, `loyer_cible NUMERIC(10,2)`, `scenario_type TEXT` (`'lmnp_meuble'` | `'colocation'` | `'courte_duree'`), `vacance_pct NUMERIC(5,2)` (nullable sans `DEFAULT`, pour distinguer "non renseigné" de "0 volontaire"). La colonne `tmi_client_pct` a été supprimée en S8.
- Colonnes fiche dans `projects` (S8) : `ville_infos JSONB` (nullable — `null` = utiliser le dataset `lib/data/villes.ts`), `travaux_postes TEXT[] NOT NULL DEFAULT '{}'`
- `projects.commentaire_travaux TEXT` (nullable, S9) : commentaire libre optionnel du chargé, affiché en bas de la page Travaux
- Colonnes orphelines (plus lues ni écrites par l'app depuis S9, non supprimées côté SQL) : `valeur_bien_apres_travaux`, `plan_3d` — retirés du moteur/wizard/PDF, suppression de colonne laissée à la main d'Alvin (opération destructive)
- Pas de dossier de migrations dans le repo : les changements de schéma sont exécutés à la main (dashboard Supabase ou MCP `apply_migration`) et documentés ici
- Photos : 5-10 par projet, upload/suppression drag-and-drop (pas de réordonnancement ni légendes en v1), stockées dans le bucket public Supabase Storage `project-images` + table `project_images` (colonnes `type` : cover/main/secondary/localisation, `ordre`, `legende`, `public_url`)
- Photos secondaires apparaissent uniquement dans la fiche commerciale PDF, pas dans le rapport analytique (qui est un document séparé)

## Authentification (S9)

- **Confirmation d'email obligatoire** : "Confirm email" activé dans Supabase (Authentication → Providers → Email). Avant ça, `signUp()` connectait directement sans vérifier que l'adresse existe — un chargé avec un email mal saisi ne pouvait jamais se connecter sans le savoir.
- **Envoi des emails d'auth via SMTP custom Resend** (`smtp.resend.com`, domaine `capsul-france.com` vérifié par DNS chez Ionos) — remplace le mailer intégré de Supabase, limité à 2 emails/heure sur ce projet. **Piège** : le username SMTP Resend est littéralement le mot `resend`, pas une adresse email — sinon erreur `535 "Invalid username"`.
- **Office 365 écarté comme SMTP** : le compte visé a l'authentification multifacteur (Microsoft Authenticator) activée via Conditional Access / Security Defaults, ce qui **bloque l'option "mot de passe d'application"** dans les paramètres de sécurité du compte (cette option n'existe qu'avec la MFA "par utilisateur" legacy). Sans mot de passe d'application, impossible d'utiliser le SMTP basique de M365. Resend contourne le problème (clé API, pas de MFA à gérer).
- **Flux mot de passe oublié** : `app/mot-de-passe-oublie/page.tsx` (demande) → email Supabase → `app/reinitialiser-mot-de-passe/page.tsx` (nouveau mot de passe). Cette 2ème page écoute l'événement `PASSWORD_RECOVERY` de `onAuthStateChange()` plutôt que de vérifier la session une seule fois au montage — les jetons de récupération arrivent dans le **fragment d'URL** (`#access_token=...`), jamais transmis au serveur, et leur traitement par le client Supabase est asynchrone par rapport au montage du composant.
- **Corollaire important** : `/mot-de-passe-oublie` et `/reinitialiser-mot-de-passe` sont dans les chemins publics de `proxy.ts` (middleware serveur) — obligatoire, puisque le serveur ne voit jamais les jetons dans le fragment d'URL et ne peut donc jamais authentifier la requête initiale sur ces pages.
- `lib/supabase/authErrors.ts::translateAuthError()` : traduit en français les messages d'erreur de Supabase Auth (toujours en anglais, non paramétrables côté dashboard) — délai de sécurité avant nouvelle tentative (avec le nombre de secondes extrait par regex), compte déjà existant, email non confirmé, longueur de mot de passe, etc. Message brut affiché entre parenthèses en repli si non reconnu, plutôt que masqué. Branché dans `/login`, `/inscription`, `/mot-de-passe-oublie`, `/reinitialiser-mot-de-passe`.
- `components/ui/password-input.tsx` : champ mot de passe avec bouton afficher/masquer, générique (accepte `className`/`style` pour s'adapter aux conventions propres à chaque page).
- **Templates email personnalisés** (Authentication → Emails → Templates, dashboard uniquement — pas versionné dans le repo) : "Confirm signup" et "Reset Password" repris en français avec le habillage navy/or de l'app. Utilisent `{{ .ConfirmationURL }}` — ne jamais renommer cette variable.
- **Comportement normal, pas un bug** : Supabase n'envoie jamais de nouveau mail de confirmation pour un compte **déjà confirmé** (`user_repeated_signup` dans les logs, statut 200 mais aucun envoi) — protection anti-énumération. Si un test ne reçoit plus d'email après une première confirmation réussie, c'est attendu ; il faut supprimer le compte de test pour recommencer à zéro.

## Stack PDF (`lib/pdf/`)

- Fiche commerciale (composants dans `lib/pdf/components/`) : `PageCouverture.tsx` → `PageVille.tsx` → `PageBien.tsx` → `PageScenario.tsx` → `PageTravaux.tsx` → `PageConclusion.tsx`. Ville et Travaux sont conditionnelles, Conclusion toujours présente (dernière page, footer sombre "dossier confidentiel") ; `FicheCommerciale.tsx` construit la liste réelle des pages et passe `pageNumber` à chacune (numérotation d'en-tête dynamique — ne jamais coder un numéro de page en dur)
- Rapport analytique (`lib/pdf/rapport/`) : Synthèse, Amortissement du crédit, Projection patrimoniale. PDF diagnostic (`lib/pdf/diagnostic/`) : document séparé pour le pipeline Make, déjà sans fiscalité
- Helpers de formatage centralisés dans `lib/pdf/helpers.ts` : `euros()`, `pct()`, `nombre()`, `pageNum()`, `orDash()` — tous strippent U+00A0/U+202F
- `lib/pdf/common/LucideIcon.tsx` rend une icône de `lib/data/icons.ts` en primitives react-pdf ; `lib/pdf/common/villePhoto.ts` résout `public/villes/<slug>.(jpg|jpeg|png)` via le système de fichiers (même mécanisme que les polices)
- Rendu local sans base ni auth : `npx tsx test/render-fiche.tsx <dossier> [photo-ville.jpg]` génère 3 variantes de la fiche (complète, avec photo, minimale) ; `npx tsx test/render-test.tsx` pour le diagnostic. Ces scripts ne testent **aucune photo secondaire ni carte de localisation** — insuffisant pour détecter un débordement lié aux photos (cf. bug résolu, page « Le bien ») ; pour ça, construire un script `_diag-*.tsx` ad hoc avec de fausses images (PNG en base64) et le nettoyer après usage.
- Police Montserrat enregistrée via `lib/pdf/common/fonts.ts::registerFonts()`
- Styles communs dans `lib/pdf/common/styles.ts` (`colors`, `sizes`, `common`)
- `lib/pdf/common/filename.ts` : nom de fichier PDF lisible (`nomFichierProjet()`) + en-tête `Content-Disposition` compatible accents (`contentDisposition()`, RFC 5987)
- `components/ui/textarea.tsx` : textarea qui grandit avec son contenu (description du bien, commentaire travaux) plutôt qu'un scroll interne caché dans une boîte à hauteur fixe

## Leçons d'infrastructure

- Utiliser `npx tsx` directement pour éviter les conflits de version Next.js dans le lockfile
- La syntaxe heredoc shell ne doit jamais déborder dans des fichiers TypeScript
- Supabase RLS : éviter les requêtes auto-référentielles sur la table `users` ; utiliser `auth.jwt() ->> 'role'` à la place
- "Invite user" Supabase échoue sur le plan gratuit (limite SMTP) → utiliser "Create new user" + Auto Confirm
- Diagnostic SMTP Supabase : l'erreur `535 "Authentication credentials invalid"` dans les logs auth = identifiants SMTP custom refusés (mot de passe/clé expiré ou faux) ; `535 "Invalid username"` = le champ "Username" attendu est une valeur fixe imposée par le fournisseur (ex: littéralement `resend` pour Resend), pas une adresse email. Toujours vérifier `mcp__supabase__query_logs` sur `source = 'auth_logs'` en cas de souci d'envoi d'email — le message affiché à l'utilisateur est volontairement générique, la vraie cause n'est que dans les logs serveur.
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
- **S9 ✅** Retours dirigeants #2 (Quentin + Lucas, septembre 2026) — commentaire travaux optionnel, photo de localisation, refonte page « La ville » (aire d'attraction, croissance démo, quartiers à cibler, projets à venir), page Conclusion simplifiée (fond navy plein + mentions légales), page Couverture revue (KPI mensualité retiré, tailles/alignement adaptatifs), lisibilité page « Le bien » (description, adresse, estimations, grille photo 2×3 rééquilibrée), nom de projet éditable, nommage des PDF téléchargés, champs "estimation" activés par défaut, `valeurBienApresTravaux` et « Honoraires décoration Capsul » retirés du moteur, "vide en bas de page" traité sur Scénario/Ville/rapport analytique par rééquilibrage + typographie (pas d'ancrage dynamique, rejeté), bug de sauvegarde du scénario recommandé corrigé, description bien limitée à 400 caractères, textarea auto-expansible, débordement PDF en production corrigé (page Le bien). Reste en attente : validation direction des chiffres villes et sourcing des quartiers Paris (voir « Reste à faire »).

## Reste à faire / en cours

- **Photos villes** : déposer 8 photos libres de droits dans `public/villes/` (`reims.jpg`, `paris.jpg`, `toulouse.jpg`, `amiens.jpg`, `nancy.jpg`, `troyes.jpg`, `epernay.jpg`, `chalons-en-champagne.jpg`) — la page fonctionne sans en attendant
- **Chiffres villes** : faire valider par la direction le jeu de données de `lib/data/villes.ts` (habitants, étudiants, accès, atout, prix m², rendement)
- **Retour Lucas — page « La ville »** : implémenté (S9). Reste : validation direction des chiffres `aireAttraction`/`croissanceDemographiquePct` d'Épernay et Châlons (proxy commune/EPCI, taux exact de l'aire non publié par l'INSEE), et sourcing des quartiers de Paris (vide pour l'instant, non sourcé de façon fiable)
- **Page Conclusion** : dataset `lib/data/realisations.ts` et photos associées ne sont plus utilisés depuis la simplification S9 — à supprimer si la version simplifiée (fond navy + mentions légales) est validée durablement par la direction
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