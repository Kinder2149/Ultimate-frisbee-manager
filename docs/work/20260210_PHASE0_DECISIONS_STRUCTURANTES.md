# PHASE 0 — DÉCISIONS STRUCTURANTES

**Statut** : WORK  
**Date** : 2026-02-10  
**Document parent** : `docs/work/20260210_PLAN_MODIFICATION_MOBILE.md`  
**Nature** : Décisions architecturales et produit à acter avant toute implémentation

---

## D-01 — Le routing mobile utilise des children

### Décision

La route `/mobile` devient une route parent qui charge un layout component. Les pages mobiles (feed, détail) sont des sous-routes children de ce layout.

### Impact architectural

Le fichier `app.module.ts` passe de `loadComponent` (un seul composant standalone) à `loadChildren` (un fichier de routes mobile dédié). Un nouveau fichier `mobile.routes.ts` est créé dans `features/mobile/`. Un nouveau composant `MobileLayoutComponent` est créé : il contient le header fixe et un `<router-outlet>`.

### Autorise

- La création de sous-routes mobile (`''` pour le feed, `detail/:type/:id` pour le détail)
- Le deep-linking vers un item spécifique
- Le bouton retour natif du navigateur entre détail et feed
- L'ajout futur de pages mobile (édition, profil) sans modifier le layout
- La séparation du header (layout) et du contenu (page)

### Interdit

- Conserver la route `/mobile` comme route terminale unique sans children
- Charger `MobilePageComponent` directement via `loadComponent` dans `app.module.ts`
- Gérer le header et le contenu dans un seul composant monolithique

---

## D-02 — Aucun composant desktop n'est importé en mobile

### Décision

Les composants situés sous `features/exercices/`, `features/entrainements/`, `features/echauffements/` et `features/situations-matchs/` ne sont jamais importés, référencés ni instanciés depuis `features/mobile/`.

### Impact architectural

L'import de `ExerciceCardComponent` dans `ContentFeedComponent` doit être retiré. Les appels `MatDialog.open()` qui instancient `EntrainementDetailComponent`, `EchauffementViewComponent` ou `SituationMatchViewComponent` depuis la page mobile doivent être supprimés. Chaque besoin d'affichage en mobile est couvert par un composant mobile dédié.

### Autorise

- La création de composants mobile dédiés (`MobileFeedCardComponent`, `MobileDetailViewComponent`) avec leur propre template, style et logique
- L'évolution indépendante des composants desktop sans risque de régression mobile
- L'évolution indépendante des composants mobile sans risque de régression desktop

### Interdit

- Importer un composant de `features/exercices/` (ou tout autre feature desktop) dans `features/mobile/`
- Ouvrir un `MatDialog` contenant un composant desktop depuis un contexte mobile
- Réutiliser un template desktop "en le cachant avec du CSS" pour le mobile

---

## D-03 — Un seul modèle ContentItem

### Décision

Le modèle `ContentItem` utilisé dans toute la vue mobile est basé sur `core/models/mobile-content.model.ts`. Il est consolidé dans `features/mobile/models/`. L'ancien modèle `features/mobile/models/content-item.model.ts` est supprimé.

### Impact architectural

Tous les composants, services et pages mobile référencent un unique fichier de modèle. Les interfaces `ContentTypeId`, `ContentItem`, `ContentMetadata`, `ItemPermissions`, `MobileContentState` et `FiltersState` constituent le contrat de données mobile. Les interfaces `ContentConfig` et `ContentParams` (qui dépendent d'endpoints API inexistants) sont exclues du modèle consolidé.

### Autorise

- Un contrat de données unique et cohérent pour toute la vue mobile
- La suppression du fichier `features/mobile/models/content-item.model.ts`
- L'utilisation des interfaces `ContentMetadata` (avec `duration`, `imageUrl`, `tags`, `isFavorite`, `isRecent`, `description`, `createdAt`) et `ItemPermissions` (avec `canView`, `canEdit`, `canDelete`)

### Interdit

- La coexistence de deux interfaces `ContentItem` dans la codebase mobile
- L'utilisation d'interfaces qui dépendent d'endpoints API backend inexistants (`ContentConfig`, `ContentParams`)
- La création d'un troisième modèle alternatif

---

## D-04 — Pas d'endpoints API mobile dédiés en Phase 1-2

### Décision

Le service de données mobile consomme les services desktop existants (`ExerciceService`, `EntrainementService`, `EchauffementService`, `SituationMatchService`) et transforme les résultats en `ContentItem[]`. Aucun endpoint backend `/mobile/*` n'est créé.

### Impact architectural

Un service `MobileDataService` est créé dans `features/mobile/services/`. Il injecte les services desktop existants, appelle leurs méthodes de chargement, et mappe les résultats vers le modèle `ContentItem` unifié. La transformation est purement front-end.

### Autorise

- La réutilisation des services desktop existants (injection, pas import de composants)
- La transformation des données côté front dans un service dédié
- L'indépendance vis-à-vis du backend pour les Phases 1 et 2

### Interdit

- La création d'endpoints API `/mobile/*` côté backend dans le cadre de cette refonte
- L'appel direct à `HttpClient` depuis les composants ou pages mobile pour des endpoints mobile
- La duplication de la logique d'appel API déjà présente dans les services desktop

---

## D-05 — `mobile-variables.scss` est la source de vérité unique pour les styles mobile

### Décision

Un fichier `shared/styles/mobile-variables.scss` centralise toutes les constantes visuelles de la vue mobile : couleurs par type de contenu, tailles typographiques, espacements, taille minimale de touch-target. Les couleurs sont dérivées de `global-theme.scss`.

### Impact architectural

Tous les fichiers SCSS de `features/mobile/` importent `mobile-variables.scss`. Aucune couleur, aucune taille, aucun espacement n'est hardcodé dans un fichier TS ou SCSS mobile. Les incohérences identifiées dans l'audit (3 valeurs pour "Situations", 2 pour "Échauffements", divergence "Exercices") sont éliminées par cette centralisation.

### Autorise

- La définition d'une palette de couleurs unique par type de contenu
- L'import de `mobile-variables.scss` dans chaque composant mobile
- La dérivation des couleurs depuis `global-theme.scss` pour garantir la cohérence avec le desktop

### Interdit

- Hardcoder une couleur dans un fichier `.ts` (ex : `getCategoryColor()` retournant `'#e74c3c'`)
- Hardcoder une couleur dans un fichier `.scss` mobile sans passer par une variable
- Définir des variables de couleur dans un composant SCSS individuel au lieu de `mobile-variables.scss`

---

## D-06 — Le responsive desktop reste intact

### Décision

Le fichier `shared/styles/mobile-optimizations.scss` (1072 lignes) concerne le responsive desktop. Son contenu ne change pas. Il sera renommé en `desktop-responsive.scss` en Phase 3 pour clarifier sa responsabilité, mais aucune ligne de son contenu n'est modifiée.

### Impact architectural

La vue mobile dédiée (`features/mobile/`) et le responsive desktop (`mobile-optimizations.scss`) sont deux systèmes distincts. Aucun composant mobile ne dépend de `mobile-optimizations.scss`. Aucune règle de `mobile-optimizations.scss` ne cible les composants de `features/mobile/`.

### Autorise

- Le renommage du fichier en Phase 3 (changement de nom uniquement, pas de contenu)
- La coexistence temporaire des deux systèmes (responsive desktop + vue mobile dédiée) pendant la refonte
- La conservation de toutes les media queries et règles existantes qui concernent le desktop

### Interdit

- Modifier le contenu de `mobile-optimizations.scss`
- Supprimer des règles de `mobile-optimizations.scss`
- Importer `mobile-optimizations.scss` dans un composant de `features/mobile/`
- Ajouter des règles ciblant `features/mobile/` dans `mobile-optimizations.scss`

---

## D-07 — Pas de dialog desktop en mobile

### Décision

La visualisation détaillée d'un item depuis la vue mobile utilise exclusivement la route `detail/:type/:id` et un composant page mobile dédié (`MobileDetailComponent`). Aucun `MatDialog` contenant un composant desktop n'est ouvert depuis le contexte mobile.

### Impact architectural

Les appels `this.dialog.open(EntrainementDetailComponent, ...)`, `this.dialog.open(EchauffementViewComponent, ...)` et `this.dialog.open(SituationMatchViewComponent, ...)` présents dans `MobilePageComponent` sont supprimés. La navigation vers le détail passe par `router.navigate(['/mobile/detail', type, id])`.

### Autorise

- La création d'une page `MobileDetailComponent` avec son propre template mobile
- La navigation via le router Angular (deep-linking, bouton retour)
- Un affichage plein écran mobile adapté au contenu

### Interdit

- Appeler `MatDialog.open()` avec un composant desktop depuis `features/mobile/`
- Afficher un dialog dimensionné pour desktop (`width: 1100px`, `width: 720px`) en contexte mobile
- Contourner l'interdiction en ouvrant un dialog contenant un wrapper autour d'un composant desktop

---

## D-08 — `prompt()` et `confirm()` natifs sont interdits

### Décision

Les fonctions JavaScript natives `prompt()` et `confirm()` ne sont jamais utilisées dans la vue mobile. La recherche utilise un composant inline (`MobileSearchBarComponent`). La confirmation utilise un composant mobile dédié (`MobileConfirmDialogComponent`).

### Impact architectural

L'appel `prompt('Rechercher dans les contenus :')` dans `MobilePageComponent.onSearchClick()` est supprimé et remplacé par l'émission d'un événement vers `MobileSearchBarComponent`. L'appel `confirm(...)` dans `MobilePageComponent.onItemDelete()` est supprimé et remplacé par l'ouverture de `MobileConfirmDialogComponent`.

### Autorise

- La création de `MobileSearchBarComponent` : champ de recherche inline, stylisable, avec indicateur de recherche active et bouton d'effacement
- La création de `MobileConfirmDialogComponent` : bottom-sheet ou dialog mobile avec boutons d'action clairs et touch-targets ≥ 44×44px
- Le contrôle total du style et du comportement de ces interactions

### Interdit

- Appeler `window.prompt()` ou `prompt()` depuis `features/mobile/`
- Appeler `window.confirm()` ou `confirm()` depuis `features/mobile/`
- Utiliser `window.alert()` ou `alert()` depuis `features/mobile/`

---

## D-09 — Actions sur les cartes via menu contextuel

### Décision

Les actions disponibles sur une carte du feed (voir, dupliquer, supprimer) sont accessibles via un bouton menu contextuel (⋮) ouvrant un `mat-menu` ou un bottom-sheet. Les boutons d'action ne sont pas affichés inline sur la carte.

### Impact architectural

Le composant `MobileFeedCardComponent` intègre un unique bouton d'action (⋮) de taille ≥ 44×44px. Ce bouton ouvre un menu listant les actions disponibles selon les permissions de l'item (`canView`, `canEdit`, `canDelete`). Le tap sur la carte elle-même navigue vers le détail.

### Autorise

- Un seul point d'entrée pour les actions (bouton ⋮)
- L'affichage conditionnel des actions selon `ItemPermissions`
- Des touch-targets conformes (≥ 44×44px) pour chaque action dans le menu
- La séparation visuelle entre navigation (tap carte → détail) et actions (tap ⋮ → menu)

### Interdit

- Afficher 3 ou 4 boutons d'action inline sur la carte (comme actuellement avec les boutons 32×32px)
- Placer des actions destructives (supprimer) et constructives (dupliquer) côte à côte sans séparation
- Afficher des boutons d'action < 44×44px

---

## D-10 — Le hero contextuel est requalifié ou supprimé

### Décision

Le hero contextuel ne peut pas rester un doublon du premier item du feed. Il est soit **supprimé** (le feed commence directement après la filter bar), soit **requalifié** avec une logique de sélection distincte (dernier item consulté, entraînement du jour, contenu épinglé). Cette décision doit être actée avant le début de la Phase 1.

### Impact architectural

- **Si supprimé** : `HeroContextuelComponent` est retiré du template de la page d'accueil mobile. Le composant peut être conservé dans le code pour une réintégration future, ou supprimé en Phase 2.
- **Si requalifié** : la logique de sélection du hero est déplacée dans `MobileStateService` (ou équivalent) avec un critère distinct du tri du feed. Le composant est refactorisé pour recevoir un item sélectionné par cette logique.

### Autorise

- La suppression complète du hero (option la plus simple)
- La requalification avec une logique de sélection explicite et distincte du feed
- Le report de la requalification à la Phase 2 si la suppression est actée en Phase 0

### Interdit

- Conserver le hero tel quel (premier item du feed = hero = doublon)
- Reporter la décision au-delà du début de Phase 1
- Implémenter le hero sans logique de sélection définie

---

## RÉCAPITULATIF

| ID | Décision (résumé) | Statut |
|----|-------------------|--------|
| D-01 | Routing mobile avec children | **À VALIDER** |
| D-02 | Aucun composant desktop en mobile | **À VALIDER** |
| D-03 | Un seul modèle ContentItem | **À VALIDER** |
| D-04 | Pas d'endpoints API mobile dédiés (Phase 1-2) | **À VALIDER** |
| D-05 | `mobile-variables.scss` = source de vérité styles | **À VALIDER** |
| D-06 | Responsive desktop intact | **À VALIDER** |
| D-07 | Pas de dialog desktop en mobile | **À VALIDER** |
| D-08 | `prompt()` et `confirm()` interdits | **À VALIDER** |
| D-09 | Actions via menu contextuel (⋮) | **À VALIDER** |
| D-10 | Hero requalifié ou supprimé | **À VALIDER** |

---

*En attente de validation explicite de chaque décision avant passage à la Phase 1.*
