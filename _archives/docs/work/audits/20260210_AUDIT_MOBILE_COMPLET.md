# AUDIT COMPLET - VUE MOBILE
**Statut** : WORK  
**Date** : 2026-02-10  
**Périmètre** : Vue mobile uniquement (vue desktop intouchable)  
**Objectif** : Diagnostic structuré pour préparer une refonte ciblée  
**Format** : Constat + qualification de gravité (P0 / P1 / P2) — aucun correctif proposé

---

## TABLE DES MATIÈRES

1. [Synthèse exécutive](#1-synthèse-exécutive)
2. [Audit visuel](#2-audit-visuel)
3. [Audit UX mobile](#3-audit-ux-mobile)
4. [Audit navigation & routing](#4-audit-navigation--routing)
5. [Audit architectural (front)](#5-audit-architectural-front)
6. [Registre consolidé des problèmes](#6-registre-consolidé-des-problèmes)

---

## LÉGENDE DE GRAVITÉ

| Niveau | Signification |
|--------|--------------|
| **P0** | Bloquant ou critique — rupture fonctionnelle, UX inutilisable, risque technique majeur |
| **P1** | Important — dégradation significative de l'expérience, incohérence architecturale forte |
| **P2** | Mineur — irritant, dette cosmétique ou technique à traiter dans un second temps |

---

## 1. SYNTHÈSE EXÉCUTIVE

La vue mobile actuelle est une **page unique monolithique** (`/mobile`) qui agrège tous les contenus (exercices, entraînements, échauffements, situations/matchs) dans un flux vertical (feed). Elle coexiste avec une vue desktop complète et validée.

### Constats majeurs

- **Architecture hybride non aboutie** : la séparation mobile/desktop repose sur un `MobileGuard` qui redirige vers une seule route `/mobile`, mais de nombreuses actions (édition, visualisation) **redirigent vers des routes desktop** ou ouvrent des **dialogues desktop** non adaptés au mobile.
- **Vue mobile = 1 page** : il n'existe qu'une seule page mobile (`MobilePageComponent`) sans aucune sous-route. La navigation mobile est un cul-de-sac fonctionnel.
- **Composants partagés desktop réutilisés à tort** : `ExerciceCardComponent` (composant desktop complet avec 347 lignes de logique) est directement intégré dans le feed mobile.
- **Fonctionnalités critiques non implémentées** : profil, paramètres, tags, administration affichent un simple snackbar "en cours de développement".
- **UX mobile non native** : `prompt()` natif pour la recherche, `confirm()` pour la suppression, dialogues Material modaux dimensionnés pour desktop.

---

## 2. AUDIT VISUEL

### 2.1 Incohérences de couleurs

| # | Constat | Gravité |
|---|---------|---------|
| V-01 | **Couleur "Situations" incohérente entre desktop et mobile** : desktop utilise `#27ae60` (vert) pour le bouton nav Situations et `#9b59b6` (violet) pour le border-top du dropdown. Mobile `content-feed` utilise `#9b59b6` pour les situations (`getCategoryColor`), tandis que `mobile-filter-bar` utilise `#4CAF50` (vert Material). Trois valeurs différentes pour une même entité. | **P1** |
| V-02 | **Couleur "Échauffements" fluctuante** : desktop nav utilise `#f39c12`, `global-theme.scss` déclare `--echauffement-color: #FF9800`, `mobile-filter-bar` utilise `#FF9800`, `content-feed` utilise `#f39c12`. Deux valeurs distinctes coexistent (`#f39c12` vs `#FF9800`). | **P1** |
| V-03 | **Couleur "Exercices" divergente** : desktop nav = `#e74c3c` (rouge), `global-theme.scss` = `--exercice-color: #3498db` (bleu). La variable CSS officielle dit bleu, la nav et les cartes mobile disent rouge. Conflit sémantique. | **P1** |
| V-04 | **Aucune variable CSS centralisée utilisée dans les composants mobile** : les couleurs sont hardcodées en valeurs littérales dans chaque composant (`hero-contextuel.component.ts`, `content-feed.component.ts`, `mobile-filter-bar.component.ts`). Les variables `--exercice-color`, `--echauffement-color`, `--situation-color` de `global-theme.scss` sont ignorées. | **P1** |

### 2.2 Tailles de texte

| # | Constat | Gravité |
|---|---------|---------|
| V-05 | **Titre de l'app "UFM" trop générique et petit (20px)** : le header mobile affiche "UFM" au lieu du nom complet de l'app. Sur desktop, le titre est "Ultimate Frisbee Manager" en 28px. Perte d'identité visuelle. | **P2** |
| V-06 | **Hiérarchie typographique incohérente dans le feed** : `hero-card__title` = 16px, `entity-card mat-card-title` = 15px, tags = 10px, `created-at` = 11px. L'écart entre le titre et le corps est trop faible (1px) pour créer une hiérarchie visuelle claire. | **P2** |
| V-07 | **Taille de la description hero tronquée à 60 caractères** : `truncateText(item.description, 60)` — trop court pour donner du contexte, notamment pour les exercices avec descriptions riches. | **P2** |

### 2.3 Densité d'information

| # | Constat | Gravité |
|---|---------|---------|
| V-08 | **Hero contextuel + feed = redondance** : le "hero" affiche toujours le premier item filtré, qui est aussi le premier item du feed en dessous. L'utilisateur voit le même contenu deux fois. | **P1** |
| V-09 | **Tags limités à 2 partout** : dans le hero (`item.tags.slice(0, 2)`) et dans les cartes feed. Un exercice avec 5 tags perd l'information essentielle. Sur desktop, tous les tags sont visibles. | **P2** |
| V-10 | **Aucune image affichée dans le feed mobile** : les exercices et situations ont des `imageUrl` mais le template des entity-cards dans le feed ne les utilise pas (contrairement à `ExerciceCardComponent` desktop qui les affiche). | **P1** |

### 2.4 Hiérarchie visuelle

| # | Constat | Gravité |
|---|---------|---------|
| V-11 | **Le hero contextuel n'a pas de hiérarchie visuelle forte** : fond en dégradé avec couleur + transparence à 0.05 (`rgba(0,0,0,0.05)`), rendant le gradient quasi invisible. Le hero ne se distingue pas suffisamment du reste du contenu. | **P2** |
| V-12 | **4 boutons d'action (voir/modifier/dupliquer/supprimer) toujours visibles sur chaque carte** : surcharge cognitive, boutons de 32x32px avec icônes de 18px, trop petits pour un usage tactile fiable. | **P0** |
| V-13 | **Pas de différenciation visuelle forte entre types de contenu dans le feed** : seule distinction = bordure gauche colorée de 6px. Pas de badge visible, pas d'icône de type, pas d'avatar de contenu. | **P1** |

### 2.5 Respect de la charte desktop

| # | Constat | Gravité |
|---|---------|---------|
| V-14 | **Le header mobile (fond `var(--bg-dark)`) ne reprend pas le gradient du desktop** (`linear-gradient(135deg, #2c3e50, #34495e)` + `border-bottom: 3px solid #3498db`). Le mobile est un aplat sombre sans la signature visuelle bleue. | **P2** |
| V-15 | **Le footer desktop est masqué en vue mobile** (via `.mobile-route .main-content { padding: 0 }` et masquage du header desktop `*ngIf="!isMobileRoute"`), mais le footer reste potentiellement visible sans adaptation. | **P2** |

---

## 3. AUDIT UX MOBILE

### 3.1 Lisibilité

| # | Constat | Gravité |
|---|---------|---------|
| U-01 | **Recherche via `prompt()` natif du navigateur** : `onSearchClick()` utilise `const query = prompt('Rechercher dans les contenus :')`. Expérience brutale, non stylisable, incompatible avec les normes UX mobile modernes. Pas de recherche incrémentale, pas de suggestions, pas d'historique. | **P0** |
| U-02 | **Suppression via `confirm()` natif du navigateur** : `onItemDelete()` utilise `confirm()`. Même problème que la recherche — UX non native, pas de possibilité de personnaliser l'affordance. | **P1** |
| U-03 | **Descriptions HTML brutes affichées via `app-rich-text-view`** dans les cartes échauffements et situations du feed mobile. Un rich-text-view desktop affiché dans une carte mobile de 13px peut produire des résultats visuels imprévisibles (tableaux, images, listes imbriquées non contraintes). | **P1** |

### 3.2 Surcharge ou sous-utilisation de l'espace

| # | Constat | Gravité |
|---|---------|---------|
| U-04 | **Barre de filtres horizontale (5 bulles + bouton tri) dans un espace de 48px de haut** : sur un écran de 360px de large, les 5 catégories + le bouton sort ne tiennent pas sans scroll horizontal. Le scroll horizontal est masqué (`scrollbar-width: none`), donc l'utilisateur ne sait pas qu'il peut scroller. | **P1** |
| U-05 | **Filter bar en `position: sticky` à top: 56px** mais aucun indicateur visuel de scroll ou d'ombre dynamique. Pas de feedback quand la barre accroche. | **P2** |
| U-06 | **Padding bottom de 80px dans le content-feed** (`padding-bottom: 80px`) — espace réservé probablement pour une bottom-bar qui n'existe pas. Espace perdu inutilement. | **P2** |
| U-07 | **Aucun lazy loading / virtualisation du feed** : tous les items (exercices + entraînements + échauffements + situations) sont chargés en une seule requête `forkJoin` et rendus d'un coup dans le DOM. Pas de pagination, pas de scroll infini. Performance dégradée à mesure que la base grossit. | **P1** |

### 3.3 Qualité des cartes

| # | Constat | Gravité |
|---|---------|---------|
| U-08 | **Composant `ExerciceCardComponent` desktop réutilisé tel quel dans le feed mobile** : ce composant de 347 lignes inclut une logique d'expansion, des catégories de tags (objectif, travail spécifique, niveau, temps, format), un mode entraînement, une gestion de durée éditable, un affichage d'image avec clic — tout cela inadapté au format carte mobile compact. | **P0** |
| U-09 | **Incohérence de design entre types** : les exercices utilisent `ExerciceCardComponent` (composant standalone complet), tandis que les entraînements, échauffements et situations utilisent des `mat-card` inline dans le template de `content-feed.component.html`. Deux systèmes de rendu coexistent dans le même flux. | **P1** |
| U-10 | **Les boutons d'action des cartes entity (32x32px) sont en dessous de la taille minimum tactile recommandée (44x44px)**. Risque élevé de clic involontaire, surtout entre "dupliquer" et "supprimer" qui sont adjacents. | **P0** |
| U-11 | **Le composant `mobile-content-card` (shared) existe mais n'est pas utilisé** : un composant `MobileContentCardComponent` a été créé dans `shared/components/mobile-content-card/` avec une interface optimisée mobile (image, favori, meta, description compacte), mais il n'est référencé nulle part dans la vue mobile actuelle. Code mort. | **P1** |

### 3.4 Pertinence des filtres

| # | Constat | Gravité |
|---|---------|---------|
| U-12 | **Filtrage par catégorie uniquement (5 types + tri date)** : aucun filtre par tag, niveau, durée, objectif. Le système de tags avancé de l'app (avec catégories objectif, travail_specifique, niveau, temps, format) est totalement absent de la vue mobile. | **P1** |
| U-13 | **Le tri est limité à "récent" / "ancien"** : pas de tri par nom, par nombre de tags, par durée. Le bouton sort fait un toggle binaire sans retour visuel explicite (juste une icône flèche et un label de 11px). | **P2** |
| U-14 | **La recherche textuelle n'est pas persistante** : effectuée via `prompt()`, elle filtre le tableau en mémoire mais disparaît visuellement — aucun indicateur ne montre qu'un filtre de recherche est actif. Pas de bouton "effacer la recherche". | **P1** |

### 3.5 Usage réel en situation terrain

| # | Constat | Gravité |
|---|---------|---------|
| U-15 | **Aucun mode terrain implémenté dans la vue mobile** : le fichier `mobile-optimizations.scss` contient des styles `.terrain-mode` (cartes ultra-compactes, actions masquées) mais ce mode n'est jamais activé dans le code. Le composant `terrain-mode-toggle` existe dans shared mais n'est pas intégré. | **P1** |
| U-16 | **Les dialogues d'ouverture d'items utilisent des dimensions desktop** : `onItemView` ouvre des dialogues Material avec `width: '1100px'` (entraînements) ou `width: '720px'` (échauffements, situations) et `maxWidth: '95vw'` ou `'90vw'`. Sur un écran de 375px, le dialog occupe 90-95% de la largeur mais sa structure interne est desktop. | **P0** |
| U-17 | **L'édition redirige vers les routes desktop** : `onItemEdit()` navigue vers `/exercices/modifier/:id`, `/entrainements/modifier/:id`, etc. — toutes protégées par `MobileGuard`, qui **redirige à nouveau vers `/mobile`**. L'édition est **inaccessible** depuis la vue mobile. | **P0** |
| U-18 | **Pas de mode hors-ligne / cache** : en situation terrain (stade, gymnase), la connexion peut être intermittente. Aucune stratégie de cache côté mobile n'est implémentée. Les données sont rechargées intégralement à chaque visite via `forkJoin`. | **P2** |

---

## 4. AUDIT NAVIGATION & ROUTING

### 4.1 Analyse de l'appbar mobile

| # | Constat | Gravité |
|---|---------|---------|
| N-01 | **Deux composants d'appbar mobile coexistent** : `MobileHeaderComponent` (dans `features/mobile/components/mobile-header/`) et `MobileAppBarComponent` (dans `shared/components/mobile-app-bar/`). Le premier est utilisé, le second est du code mort. Confusion architecturale. | **P1** |
| N-02 | **L'appbar mobile n'a que 2 actions : recherche + menu utilisateur** : pas de navigation vers les différentes sections (exercices, entraînements, etc.). L'utilisateur est piégé dans un flux unique sans possibilité de navigation directe. | **P0** |
| N-03 | **Le menu utilisateur (`mat-menu`) contient "Version desktop" comme option de navigation** : il force `mobileDetector.forceDesktop()` + navigation vers `/`. C'est un mécanisme d'échappement, pas une navigation structurée. | **P2** |

### 4.2 Redirections vers vues desktop

| # | Constat | Gravité |
|---|---------|---------|
| N-04 | **`onItemEdit()` redirige vers des routes desktop protégées par `MobileGuard`** : les routes `/exercices/modifier/:id`, `/entrainements/modifier/:id`, etc. ont toutes `MobileGuard` qui redirige vers `/mobile`. **Boucle de redirection : mobile → route desktop → MobileGuard → /mobile**. L'édition est un dead-end fonctionnel. | **P0** |
| N-05 | **`onItemView()` ouvre des composants desktop en dialog** : `EntrainementDetailComponent`, `EchauffementViewComponent`, `SituationMatchViewComponent` sont des composants desktop complets injectés dans un `MatDialog`. Aucune adaptation mobile de ces composants. | **P0** |
| N-06 | **Profil, Tags, Administration, Paramètres = snackbar "en cours de développement"** : 4 actions du menu utilisateur sont des impasses fonctionnelles. L'utilisateur mobile n'a accès à aucune de ces fonctionnalités. | **P1** |

### 4.3 Incohérences de parcours

| # | Constat | Gravité |
|---|---------|---------|
| N-07 | **Une seule route mobile (`/mobile`)** : aucune sous-route pour les différents contextes. Impossible de deep-linker vers un exercice, un entraînement ou une section spécifique en mobile. Aucun état dans l'URL. | **P1** |
| N-08 | **Le `returnUrl` est passé en query param mais jamais réellement exploité** : `MobileGuard` passe `returnUrl` lors de la redirection, et `MobileHeaderComponent` l'utilise pour "Version desktop", mais il n'y a aucune possibilité de retour contextuel dans la vue mobile elle-même. | **P2** |
| N-09 | **La détection mobile repose uniquement sur `window.innerWidth < 768`** : pas de détection de user-agent, pas de détection de capacités tactiles. Un desktop avec fenêtre réduite sera redirigé vers la vue mobile. Un iPad en paysage (1024px) sera en vue desktop. | **P2** |

### 4.4 Rupture de logique mobile

| # | Constat | Gravité |
|---|---------|---------|
| N-10 | **Pas de bouton retour** : l'appbar mobile n'a pas de bouton back. Comme il n'y a qu'une seule route, ce n'est pas critique aujourd'hui, mais c'est un blocage pour toute extension future. | **P2** |
| N-11 | **`forceDesktop` persiste en localStorage** (`ufm.forceDesktop`): si un utilisateur force le mode desktop sur mobile, il n'y a **aucun mécanisme automatique pour revenir en mode mobile**. Il faut que la `snackBar` de suggestion apparaisse, ce qui ne se produit que si `window.innerWidth >= 768` après un resize. Sur un vrai mobile, l'utilisateur est bloqué en vue desktop. | **P1** |
| N-12 | **Le `MobileGuard` est appliqué sur toutes les routes desktop** mais pas sur la route `/mobile` elle-même : un utilisateur desktop peut accéder à `/mobile` manuellement sans restriction. | **P2** |

---

## 5. AUDIT ARCHITECTURAL (FRONT)

### 5.1 Séparation réelle mobile / desktop

| # | Constat | Gravité |
|---|---------|---------|
| A-01 | **La séparation mobile/desktop repose sur un seul guard (`MobileGuard`) et une seule route (`/mobile`)** : il n'y a pas de module mobile dédié, pas de routing mobile, pas de layout mobile indépendant. Le composant `MobilePageComponent` est un standalone isolé. | **P0** |
| A-02 | **Le template `app.component.html` masque le header desktop via `*ngIf="!isMobileRoute"`** mais le `main-content`, le `footer` et le `router-outlet` restent les mêmes. Le layout mobile hérite de la structure desktop (container, padding, etc.). | **P1** |
| A-03 | **Le fichier `mobile-optimizations.scss` (1072 lignes) applique des styles desktop-responsive ET mobile** : il préfixe tout avec `.app-container:not(.mobile-route)` pour cibler le mode "desktop vu sur petit écran" (nav en bulles, bottom-sheets). Ce n'est PAS la vue mobile dédiée — c'est le desktop responsive. Confusion entre responsive et mobile-first. | **P0** |
| A-04 | **`app.component.css` (461 lignes) contient aussi des media queries mobile (L434-460)** qui transforment les dropdowns desktop en bottom-sheets. Duplication de responsabilité avec `mobile-optimizations.scss`. | **P1** |

### 5.2 Composants partagés à tort

| # | Constat | Gravité |
|---|---------|---------|
| A-05 | **`ExerciceCardComponent` (desktop, 347 lignes TS + 110 lignes HTML)** est importé directement dans `ContentFeedComponent` du module mobile. Ce composant a des dépendances vers `ExerciceDialogService`, `TagService`, `ApiUrlService`, `PermissionsService`, `Router` — tout l'écosystème desktop. | **P0** |
| A-06 | **`EntrainementDetailComponent`, `EchauffementViewComponent`, `SituationMatchViewComponent`** sont ouverts en dialog depuis la vue mobile. Ce sont des composants desktop complets avec leur propre logique de layout. | **P1** |
| A-07 | **`RichTextViewComponent`** est utilisé dans les cartes feed mobile pour les descriptions. Ce composant rend du HTML arbitraire (via Quill) sans contrainte de taille mobile. | **P2** |
| A-08 | **`DuplicateButtonComponent`** est utilisé dans les cartes feed mobile. Composant partagé légitime, mais ses dimensions ne sont pas adaptées au contexte tactile mobile. | **P2** |

### 5.3 Code mort et composants orphelins

| # | Constat | Gravité |
|---|---------|---------|
| A-09 | **`MobileAppBarComponent` (`shared/components/mobile-app-bar/`)** : composant standalone créé mais jamais utilisé. Doublon fonctionnel avec `MobileHeaderComponent`. | **P1** |
| A-10 | **`MobileContentCardComponent` (`shared/components/mobile-content-card/`)** : composant standalone créé avec une interface mobile optimisée (image, favori, meta, description compacte) mais jamais intégré. Utilise un modèle `ContentItem` différent (de `core/models/mobile-content.model`) de celui utilisé par la vue mobile (`features/mobile/models/content-item.model`). **Deux modèles `ContentItem` coexistent.** | **P0** |
| A-11 | **Services mobile orphelins** : `mobile-content.service.ts`, `mobile-content-state.service.ts`, `filters.service.ts` existent dans `core/services/` mais ne sont pas utilisés par la page mobile actuelle qui gère tout en local dans `MobilePageComponent`. | **P1** |
| A-12 | **Composants shared inutilisés en mobile** : `content-categories`, `content-sections`, `terrain-mode-toggle` — créés pour le mobile mais non intégrés. | **P1** |

### 5.4 Risques techniques actuels

| # | Constat | Gravité |
|---|---------|---------|
| A-13 | **`MobilePageComponent` utilise `ChangeDetectionStrategy.OnPush`** mais modifie des propriétés locales (`loading`, `error`, `searchQuery`, `activeCategory`, `sortOrder`) sans `ChangeDetectorRef.markForCheck()`. Certaines mises à jour peuvent ne pas être détectées (notamment après `searchQuery` via `prompt()`). | **P1** |
| A-14 | **Getter computés utilisés dans le template sans memoization** : `filteredItems`, `heroItem`, `categoryCount` sont des getters recalculés à chaque cycle de détection. Avec `OnPush` et l'absence de `markForCheck`, le comportement est imprévisible. | **P1** |
| A-15 | **`fromEvent(window, 'resize')` dans `MobilePageComponent` sans `debounceTime`** : le listener de resize envoie des snackbars à chaque événement de resize si la condition est remplie. Risque de spam de snackbars. | **P2** |
| A-16 | **`forkJoin` charge les 4 collections complètes** (exercices, entraînements, échauffements, situations) à chaque `ngOnInit`. Pas de cache, pas de pagination, pas de stratégie de chargement incrémental. | **P1** |

### 5.5 Dette UX / technique induite

| # | Constat | Gravité |
|---|---------|---------|
| A-17 | **3 systèmes de styles mobile coexistent** : (1) `mobile-optimizations.scss` pour le desktop responsive, (2) les SCSS des composants `features/mobile/`, (3) les media queries dans `app.component.css`. Aucune source de vérité unique pour le mobile. | **P0** |
| A-18 | **2 modèles `ContentItem` incompatibles** : `features/mobile/models/content-item.model.ts` et `core/models/mobile-content.model.ts`. Le premier est utilisé, le second est orphelin mais référencé par des composants shared. | **P1** |
| A-19 | **Pas de module ni de routing mobile** : `MobilePageComponent` est un standalone monolithique chargé directement par le router root. Aucune infrastructure pour ajouter des sous-routes (détail exercice, édition, profil, etc.). | **P0** |

---

## 6. REGISTRE CONSOLIDÉ DES PROBLÈMES

### P0 — Bloquants / Critiques (9 problèmes)

| ID | Domaine | Description courte |
|----|---------|-------------------|
| V-12 | Visuel | Boutons d'action 32x32px toujours visibles — surcharge cognitive |
| U-01 | UX | Recherche via `prompt()` natif — UX inacceptable |
| U-08 | UX | `ExerciceCardComponent` desktop réutilisé tel quel en mobile |
| U-10 | UX | Taille des boutons d'action (32x32) < minimum tactile (44x44) |
| U-16 | UX | Dialogues de visualisation dimensionnés pour desktop |
| U-17 | UX | Édition redirige vers routes desktop → boucle `MobileGuard` → dead-end |
| N-02 | Nav | Appbar sans navigation — utilisateur piégé dans un flux unique |
| N-04 | Nav | Boucle de redirection : édition → route desktop → MobileGuard → /mobile |
| N-05 | Nav | Visualisation ouvre des composants desktop en dialog |
| A-01 | Archi | Pas de module ni routing mobile — 1 seul guard + 1 route |
| A-03 | Archi | `mobile-optimizations.scss` = desktop responsive, pas du mobile-first |
| A-05 | Archi | Composant desktop 347 lignes importé dans le feed mobile |
| A-10 | Archi | 2 modèles `ContentItem` incompatibles coexistent |
| A-17 | Archi | 3 systèmes de styles mobile coexistent sans source de vérité |
| A-19 | Archi | Pas d'infrastructure routing mobile pour des sous-routes |

### P1 — Importants (20 problèmes)

| ID | Domaine | Description courte |
|----|---------|-------------------|
| V-01 | Visuel | Couleur "Situations" incohérente (3 valeurs différentes) |
| V-02 | Visuel | Couleur "Échauffements" fluctuante (`#f39c12` vs `#FF9800`) |
| V-03 | Visuel | Couleur "Exercices" divergente (rouge nav vs bleu variable CSS) |
| V-04 | Visuel | Variables CSS centralisées ignorées — couleurs hardcodées |
| V-08 | Visuel | Hero + feed = redondance du premier item |
| V-10 | Visuel | Aucune image affichée dans le feed mobile |
| V-13 | Visuel | Pas de différenciation visuelle forte entre types de contenu |
| U-02 | UX | Suppression via `confirm()` natif |
| U-03 | UX | Rich-text desktop rendu tel quel dans cartes mobile |
| U-04 | UX | 5 bulles de filtre + sort dans 48px — scroll caché |
| U-07 | UX | Pas de lazy loading / virtualisation du feed |
| U-09 | UX | Deux systèmes de cartes coexistent dans le feed |
| U-11 | UX | `MobileContentCardComponent` créé mais non utilisé |
| U-12 | UX | Filtrage par catégorie uniquement — tags avancés absents |
| U-14 | UX | Recherche non persistante, pas d'indicateur de filtre actif |
| U-15 | UX | Mode terrain codé en CSS mais jamais activé |
| N-06 | Nav | 4 actions menu = impasses fonctionnelles (snackbar) |
| N-07 | Nav | 1 seule route mobile — pas de deep-linking |
| N-11 | Nav | `forceDesktop` persistant sans retour auto en mobile |
| A-02 | Archi | Layout mobile hérite de la structure desktop |
| A-04 | Archi | Duplication media queries entre app.component.css et mobile-optimizations |
| A-06 | Archi | Composants desktop de visualisation ouverts en dialog mobile |
| A-09 | Archi | `MobileAppBarComponent` = code mort (doublon) |
| A-11 | Archi | Services mobile orphelins non intégrés |
| A-12 | Archi | Composants shared mobile créés mais non intégrés |
| A-13 | Archi | `OnPush` sans `markForCheck` — mises à jour imprévisibles |
| A-14 | Archi | Getters computés dans template sans memoization |
| A-16 | Archi | `forkJoin` charge tout sans cache ni pagination |
| A-18 | Archi | 2 modèles ContentItem incompatibles |

### P2 — Mineurs (13 problèmes)

| ID | Domaine | Description courte |
|----|---------|-------------------|
| V-05 | Visuel | Titre "UFM" au lieu du nom complet — perte d'identité |
| V-06 | Visuel | Hiérarchie typographique faible (1px d'écart titre/corps) |
| V-07 | Visuel | Description hero tronquée à 60 caractères |
| V-09 | Visuel | Tags limités à 2 — perte d'information |
| V-11 | Visuel | Hero gradient quasi invisible (0.05 opacité) |
| V-14 | Visuel | Header mobile sans signature visuelle du desktop |
| V-15 | Visuel | Footer potentiellement visible sans adaptation |
| U-05 | UX | Sticky filter bar sans feedback visuel |
| U-06 | UX | Padding bottom 80px pour bottom-bar inexistante |
| U-13 | UX | Tri limité à récent/ancien sans retour visuel explicite |
| U-18 | UX | Pas de stratégie cache/hors-ligne pour usage terrain |
| N-03 | Nav | "Version desktop" comme option de navigation |
| N-08 | Nav | `returnUrl` jamais exploité en mobile |
| N-09 | Nav | Détection mobile = width seulement, pas de user-agent |
| N-10 | Nav | Pas de bouton retour dans l'appbar |
| N-12 | Nav | Route `/mobile` accessible sans restriction depuis desktop |
| A-07 | Archi | `RichTextViewComponent` sans contrainte de taille mobile |
| A-08 | Archi | `DuplicateButtonComponent` non adapté au contexte tactile |
| A-15 | Archi | Listener resize sans debounce — risque spam snackbar |

---

## CONCLUSION

La vue mobile actuelle présente **9 problèmes P0, 20 P1 et 13 P2** répartis sur les 4 axes d'audit.

**Les constats structurants sont :**

1. **La vue mobile n'est pas une vue mobile** — c'est une page unique monolithique qui réutilise des composants desktop, ouvre des dialogues desktop, et redirige vers des routes desktop pour toute action au-delà de la consultation du feed.

2. **L'architecture mobile est fragmentée** — des composants, services et modèles mobile ont été créés (MobileContentCard, MobileAppBar, mobile-content.service, etc.) mais ne sont pas intégrés. Le code effectivement actif ignore ces briques et réutilise l'écosystème desktop.

3. **La confusion entre "desktop responsive" et "vue mobile dédiée"** est le problème architectural central : `mobile-optimizations.scss` (1072 lignes) transforme le desktop en version responsive, tandis que `features/mobile/` est une tentative de vue mobile dédiée. Les deux approches coexistent sans cohérence.

4. **L'utilisateur mobile est fonctionnellement bloqué** : il ne peut ni éditer, ni accéder au profil, aux paramètres, aux tags ou à l'administration. La vue mobile est en lecture seule de fait.

Ce diagnostic constitue la base contractuelle pour un plan de refonte mobile.

---

*Document généré le 2026-02-10 — Audit de code source uniquement (pas de tests utilisateur ni d'inspection visuelle runtime)*
