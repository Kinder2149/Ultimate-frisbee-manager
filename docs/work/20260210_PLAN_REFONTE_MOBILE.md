# PLAN DE REFONTE MOBILE — Ultimate Frisbee Manager

**Statut** : WORK  
**Date** : 2026-02-10  
**Auteur** : Architecte front senior  
**Document de référence** : `docs/work/audits/20260210_AUDIT_MOBILE_COMPLET.md`  
**Périmètre** : Vue mobile dédiée uniquement — la vue desktop est intouchable  
**Nature** : Plan structurel et décisionnel — aucun code, aucune implémentation

---

## TABLE DES MATIÈRES

1. [Synthèse de l'état actuel](#1-synthèse-de-létat-actuel)
2. [Vision cible de la vue mobile](#2-vision-cible-de-la-vue-mobile)
3. [Architecture mobile cible](#3-architecture-mobile-cible)
4. [Plan de correction priorisé](#4-plan-de-correction-priorisé)
5. [Clarification : responsive desktop vs vue mobile dédiée](#5-clarification--responsive-desktop-vs-vue-mobile-dédiée)
6. [Décisions structurantes à acter](#6-décisions-structurantes-à-acter)
7. [Anti-patterns et risques à éviter](#7-anti-patterns-et-risques-à-éviter)
8. [Cartographie de l'existant](#8-cartographie-de-lexistant)

---

## 1. SYNTHÈSE DE L'ÉTAT ACTUEL

### 1.1 Ce qui existe

La vue mobile actuelle est une **page unique monolithique** (`/mobile`) chargée via `loadComponent` depuis `app.module.ts`. Elle se compose de :

- **1 route** : `/mobile` (standalone component, pas de module, pas de sous-routes)
- **1 page** : `MobilePageComponent` (507 lignes TS) — gère tout en local : chargement, filtrage, tri, recherche, actions CRUD
- **5 composants mobile actifs** :
  - `MobileHeaderComponent` — header fixe avec menu utilisateur
  - `MobileFilterBarComponent` — barre de filtres par catégorie + tri
  - `HeroContextuelComponent` — carte hero du premier item filtré
  - `ContentFeedComponent` — flux de cartes par type de contenu
  - `ExerciceCardComponent` — **composant DESKTOP** (347 lignes) importé directement dans le feed
- **1 service actif** : `MobileDetectorService` — détection width < 768px + forceDesktop en localStorage
- **1 guard** : `MobileGuard` — redirige vers `/mobile` si mobile détecté

### 1.2 Ce qui dysfonctionne (résumé de l'audit)

| Catégorie | P0 | P1 | P2 | Total |
|-----------|----|----|-----|-------|
| Visuel | 1 | 5 | 6 | 12 |
| UX Mobile | 4 | 6 | 4 | 14 |
| Navigation & Routing | 3 | 3 | 5 | 11 |
| Architecture front | 4 | 6 | 3 | 13 |
| **Total** | **12** | **20** | **18** | **50** |

### 1.3 Les 4 problèmes structurels

1. **Aucune autonomie mobile** : l'édition, la visualisation détaillée, le profil, les paramètres, les tags et l'administration redirigent vers des routes desktop ou affichent un snackbar "en cours de développement".
2. **Composants desktop réutilisés à tort** : `ExerciceCardComponent`, `EntrainementDetailComponent`, `EchauffementViewComponent`, `SituationMatchViewComponent` sont injectés en contexte mobile sans adaptation.
3. **Architecture fragmentée** : des composants, services et modèles mobile ont été créés (`MobileContentCard`, `MobileAppBar`, `ContentSections`, `ContentCategories`, `TerrainModeToggle`, `MobileContentService`, `MobileContentStateService`, `FiltersService`) mais ne sont **pas intégrés**. Le code actif les ignore.
4. **Confusion responsive / mobile dédié** : `mobile-optimizations.scss` (1072 lignes) transforme le desktop en responsive (bulles de nav, bottom-sheets), tandis que `features/mobile/` est une tentative de vue mobile séparée. Les deux coexistent.

---

## 2. VISION CIBLE DE LA VUE MOBILE

### 2.1 Principes directeurs

| Principe | Signification concrète |
|----------|----------------------|
| **Mobile-first** | Chaque composant mobile est conçu pour le mobile, jamais adapté depuis le desktop |
| **Autonomie totale** | Aucune route desktop, aucun dialog desktop, aucun composant desktop n'est utilisé en mobile |
| **Page unique avec feed central** | La vue mobile reste une page unique avec un flux vertical regroupant tous les contenus |
| **Usage terrain** | L'interface doit être utilisable en extérieur (soleil, gants, une main), avec un mode terrain dédié |
| **Cohérence visuelle** | Les couleurs, la typographie et l'identité sont alignées avec le desktop, mais l'implémentation est indépendante |
| **Évolutivité** | L'architecture permet d'ajouter des sous-vues (détail, édition, profil) sans refonte |

### 2.2 Expérience cible (inspiration Netflix)

```
┌─────────────────────────────┐
│  HEADER FIXE                │  Logo + titre + recherche inline + avatar menu
├─────────────────────────────┤
│  FILTER BAR (sticky)        │  Catégories scrollables + indicateur recherche active + tri
├─────────────────────────────┤
│  HERO CONTEXTUEL            │  Item mis en avant (dynamique, pas le 1er du feed)
├─────────────────────────────┤
│                             │
│  FEED SCROLLABLE            │  Cartes mobile dédiées, unifiées pour tous les types
│  (cartes unifiées)          │  Actions contextuelles (swipe ou menu)
│                             │  Lazy loading / scroll infini
│                             │
├─────────────────────────────┤
│  [MODE TERRAIN : FAB]       │  Toggle mode terrain (bottom-right)
└─────────────────────────────┘
```

### 2.3 Fonctionnalités cibles par priorité

**Essentielles (Phase 1)** :
- Consultation du feed (tous types confondus)
- Filtrage par catégorie de contenu
- Recherche inline (pas de `prompt()`)
- Visualisation détaillée d'un item (vue mobile dédiée, pas un dialog desktop)
- Tri par date (récent/ancien)

**Importantes (Phase 2)** :
- Filtrage par tags (objectif, niveau, format, etc.)
- Mode terrain (cartes compactes, actions réduites)
- Duplication d'item
- Indicateur de recherche/filtre actif
- Scroll infini / virtualisation

**Futures (Phase 3)** :
- Édition mobile (formulaire mobile dédié ou redirection contrôlée)
- Profil / paramètres mobile
- Favoris
- Cache hors-ligne

---

## 3. ARCHITECTURE MOBILE CIBLE

### 3.1 Structure de fichiers cible

```
frontend/src/app/
├── features/
│   └── mobile/
│       ├── mobile.routes.ts                    ← Routes mobile avec children
│       ├── models/
│       │   └── mobile-content.model.ts         ← Modèle unifié (1 seul)
│       ├── services/
│       │   ├── mobile-content.service.ts       ← Accès données (adapté de l'orphelin existant)
│       │   ├── mobile-state.service.ts         ← Gestion d'état (adapté de l'orphelin existant)
│       │   └── mobile-filters.service.ts       ← Logique de filtrage (adapté de l'orphelin existant)
│       ├── pages/
│       │   ├── mobile-home/                    ← Page principale (feed)
│       │   │   ├── mobile-home.component.ts
│       │   │   ├── mobile-home.component.html
│       │   │   └── mobile-home.component.scss
│       │   └── mobile-detail/                  ← Vue détail d'un item (NOUVELLE)
│       │       ├── mobile-detail.component.ts
│       │       ├── mobile-detail.component.html
│       │       └── mobile-detail.component.scss
│       └── components/
│           ├── mobile-header/                  ← Header mobile (refactorisé)
│           ├── mobile-search-bar/              ← Recherche inline (NOUVELLE)
│           ├── mobile-filter-bar/              ← Barre de filtres (refactorisée)
│           ├── mobile-feed-card/               ← Carte unifiée pour le feed (NOUVELLE)
│           ├── mobile-hero/                    ← Hero contextuel (refactorisé)
│           ├── mobile-item-actions/            ← Actions contextuelles (NOUVELLE)
│           ├── mobile-detail-view/             ← Vue détail d'un item (NOUVELLE)
│           └── mobile-terrain-toggle/          ← Toggle mode terrain (adapté de l'orphelin)
├── core/
│   ├── services/
│   │   └── mobile-detector.service.ts          ← Conservé, renforcé
│   └── guards/
│       └── mobile.guard.ts                     ← Conservé, renforcé
└── shared/
    └── styles/
        ├── mobile-variables.scss               ← Variables CSS mobile centralisées (NOUVELLE)
        └── mobile-optimizations.scss           ← SÉPARÉ : renommé desktop-responsive.scss
```

### 3.2 Routing mobile cible

```
/mobile                         ← Layout mobile (header + outlet)
  ├── (default)                 ← Mobile home (feed)
  └── detail/:type/:id          ← Vue détail d'un item
```

La route `/mobile` charge un **layout component** qui contient le header fixe et un `<router-outlet>`. Les sous-routes sont des children lazy-loaded.

### 3.3 Modèle de données unifié

Un **seul modèle `ContentItem`** doit être utilisé dans toute la vue mobile. Le modèle orphelin `core/models/mobile-content.model.ts` est plus complet et mieux structuré que `features/mobile/models/content-item.model.ts`. Le modèle cible doit être basé sur `core/models/mobile-content.model.ts` et consolidé dans `features/mobile/models/`.

**Interfaces à conserver du modèle orphelin** :
- `ContentTypeId` (type union)
- `ContentItem` (avec `metadata` et `permissions`)
- `ContentMetadata` (duration, imageUrl, tags, isFavorite, isRecent, description)
- `ContentSection` (pour le layout Netflix-like futur)
- `FiltersState` (pour le filtrage)
- `MobileContentState` (pour la gestion d'état)

**Interfaces à abandonner** :
- `ContentConfig`, `ContentParams` (dépendent d'endpoints API `/mobile/*` qui n'existent pas)
- L'ancien `ContentItem` de `features/mobile/models/content-item.model.ts` (redondant, moins structuré)

### 3.4 Gestion d'état

La page actuelle gère tout son état en local (propriétés de classe + getters). La cible est d'utiliser un **service d'état dédié** basé sur Angular Signals (comme le fait déjà l'orphelin `MobileContentStateService`), mais **sans dépendance à des endpoints API mobile inexistants**.

**Stratégie** : le service d'état mobile consomme les **services desktop existants** (`ExerciceService`, `EntrainementService`, etc.) et expose une interface unifiée `ContentItem[]` aux composants mobile. Cela évite de créer des endpoints backend dédiés tout en découplant les composants mobile de la logique de chargement.

### 3.5 Variables CSS mobile centralisées

Un fichier `mobile-variables.scss` unique doit centraliser :
- Les couleurs par type de contenu (alignées avec `global-theme.scss`)
- Les tailles typographiques mobile
- Les espacements mobile
- Les tailles de touch-target (minimum 44×44px)
- Les breakpoints

Tous les composants mobile importeront ce fichier. Aucune couleur hardcodée.

---

## 4. PLAN DE CORRECTION PRIORISÉ

### Phase 1 — Déblocage fonctionnel (P0)

**Objectif** : rendre la vue mobile fonctionnellement utilisable.

| # | Action | Problèmes résolus | Prérequis |
|---|--------|--------------------|-----------|
| **1.1** | **Créer le routing mobile avec children** : transformer la route `/mobile` en route parent avec `<router-outlet>`, ajouter la sous-route `detail/:type/:id` | A-01, A-19, N-02, N-07 | Aucun |
| **1.2** | **Créer `mobile-variables.scss`** : centraliser les couleurs par type de contenu alignées avec `global-theme.scss`, les tailles typo, les espacements. Tous les composants mobile l'importent. | V-04, A-17 | Aucun |
| **1.3** | **Créer `MobileFeedCardComponent`** : carte mobile unifiée pour tous les types de contenu. Touch-targets ≥ 44×44px. Actions via menu contextuel (mat-menu), pas de boutons inline. Remplace `ExerciceCardComponent` et les `mat-card` inline du feed. | V-12, U-08, U-09, U-10, A-05 | 1.2 |
| **1.4** | **Créer `MobileSearchBarComponent`** : recherche inline dans le header ou sous le header. Remplace `prompt()`. Indicateur de recherche active visible. | U-01, U-14 | 1.2 |
| **1.5** | **Créer `MobileDetailViewComponent`** (page) : vue de détail mobile dédiée pour un item. Remplace les dialogues desktop. Accessible via la route `detail/:type/:id`. Bouton retour vers le feed. | U-16, U-17, N-04, N-05 | 1.1 |
| **1.6** | **Supprimer l'import de `ExerciceCardComponent`** dans `ContentFeedComponent` et remplacer par `MobileFeedCardComponent`. | A-05 | 1.3 |
| **1.7** | **Supprimer toutes les navigations vers des routes desktop** depuis `MobilePageComponent` (`onItemEdit`, `onItemView`). Remplacer par navigation vers `detail/:type/:id`. | N-04, N-05, U-17 | 1.5 |
| **1.8** | **Remplacer `confirm()` natif** par un composant de confirmation mobile dédié (bottom-sheet ou dialog mobile). | U-02 | 1.2 |

**Livrable Phase 1** : la vue mobile est autonome — consultation du feed, recherche inline, visualisation détaillée d'un item, confirmation mobile, aucune redirection desktop.

---

### Phase 2 — UX / lisibilité / performance (P1)

**Objectif** : améliorer l'expérience mobile, la cohérence visuelle et les performances.

| # | Action | Problèmes résolus | Prérequis |
|---|--------|--------------------|-----------|
| **2.1** | **Unifier le modèle `ContentItem`** : consolider `core/models/mobile-content.model.ts` et `features/mobile/models/content-item.model.ts` en un seul modèle dans `features/mobile/models/`. Supprimer le doublon. | A-10, A-18 | Phase 1 |
| **2.2** | **Intégrer les services mobile orphelins** : adapter `MobileContentStateService` (signaux Angular) et `FiltersService` pour gérer l'état centralisé. Le service consomme les services desktop existants et expose des `ContentItem[]`. | A-11, A-13, A-14 | 2.1 |
| **2.3** | **Refactoriser `MobileHeaderComponent`** : intégrer la `MobileSearchBarComponent`, afficher le nom complet de l'app, ajouter la signature visuelle du desktop (gradient + bordure bleue). | V-05, V-14, N-01 | Phase 1 |
| **2.4** | **Refactoriser `MobileFilterBarComponent`** : utiliser les variables CSS centralisées, ajouter un indicateur de scroll horizontal (ombre ou chevron), augmenter la taille des touch-targets. | V-01, V-02, V-03, U-04 | 1.2 |
| **2.5** | **Aligner les couleurs par type de contenu** : une seule source de vérité dans `mobile-variables.scss`, importée depuis `global-theme.scss`. Éliminer toute couleur hardcodée dans les composants TS. | V-01, V-02, V-03, V-04, V-13 | 1.2 |
| **2.6** | **Refactoriser `HeroContextuelComponent`** : découpler du premier item du feed (logique de sélection dédiée), renforcer le gradient visuel, afficher plus de 60 caractères de description. | V-08, V-11, V-07 | 2.2 |
| **2.7** | **Ajouter le filtrage par tags** : intégrer `FiltersService` dans la filter bar, permettre le filtrage par objectif, niveau, format, etc. | U-12 | 2.2, 2.4 |
| **2.8** | **Implémenter le scroll infini / virtualisation** dans le feed. Remplacer le `forkJoin` complet par un chargement paginé. | U-07, A-16 | 2.2 |
| **2.9** | **Intégrer `TerrainModeToggleComponent`** (existant orphelin) : FAB en bas à droite, active le mode terrain (cartes compactes, actions masquées). Les styles `.terrain-mode` de `mobile-optimizations.scss` sont adaptés aux composants mobile dédiés. | U-15 | Phase 1 |
| **2.10** | **Désactiver les 4 entrées de menu non fonctionnelles** (Profil, Tags, Admin, Paramètres) ou les remplacer par des liens vers des vues mobiles à venir avec un état "bientôt disponible" explicite. | N-06 | Phase 1 |
| **2.11** | **Supprimer le code mort** : `MobileAppBarComponent` (shared), les composants shared orphelins (`ContentCategoriesComponent`, `ContentSectionsComponent`, `ContentCardComponent`) si non réintégrés. | A-09, A-12 | 2.2 |
| **2.12** | **Corriger `forceDesktop` sur mobile physique** : ajouter un mécanisme de reset automatique du `forceDesktop` quand l'utilisateur revient sur un device mobile (détection user-agent en complément de la width). | N-11 | Aucun |

**Livrable Phase 2** : vue mobile cohérente visuellement, performante, avec filtrage avancé, mode terrain fonctionnel, état centralisé propre, code mort supprimé.

---

### Phase 3 — Améliorations et dette (P2)

**Objectif** : finitions visuelles, confort utilisateur, dette technique résiduelle.

| # | Action | Problèmes résolus | Prérequis |
|---|--------|--------------------|-----------|
| **3.1** | **Affiner la hiérarchie typographique** : établir une échelle de tailles (titre card, body, meta, date) avec des écarts ≥ 2px entre niveaux. | V-06 | Phase 2 |
| **3.2** | **Enrichir l'affichage des tags** : afficher plus de 2 tags, avec un overflow géré ("+3" ou scroll horizontal). | V-09 | Phase 2 |
| **3.3** | **Ajouter le feedback visuel sur la filter bar sticky** : ombre dynamique au scroll, indicateur de scroll horizontal. | U-05 | Phase 2 |
| **3.4** | **Supprimer le padding-bottom fantôme (80px)** ou l'aligner sur la hauteur réelle du FAB mode terrain. | U-06 | 2.9 |
| **3.5** | **Améliorer le tri** : ajouter des options (nom, durée, nombre de tags) avec retour visuel explicite. | U-13 | 2.2 |
| **3.6** | **Renommer `mobile-optimizations.scss`** en `desktop-responsive.scss` pour clarifier sa responsabilité. Documenter la séparation. | A-03, A-04 | Phase 2 |
| **3.7** | **Améliorer la détection mobile** : compléter la détection par width avec une détection de capacités tactiles (`navigator.maxTouchPoints`, `matchMedia('(pointer: coarse)')`) et/ou user-agent. | N-09 | Aucun |
| **3.8** | **Ajouter le debounce sur le listener resize** dans la page mobile. | A-15 | Phase 2 |
| **3.9** | **Explorer le cache hors-ligne** : évaluer l'intérêt d'un Service Worker ou d'un cache localStorage pour les données du feed en contexte terrain. | U-18 | Phase 2 |
| **3.10** | **Préparer l'édition mobile** : concevoir un formulaire mobile simplifié (ou valider la stratégie de redirection contrôlée vers desktop avec sortie du mode mobile). | — | Phase 2 |
| **3.11** | **Restreindre l'accès desktop à `/mobile`** : ajouter un guard ou une redirection si un utilisateur desktop accède manuellement à `/mobile`. | N-12 | Aucun |
| **3.12** | **Contraindre le rendu rich-text en mobile** : limiter la hauteur, masquer les éléments non adaptés (tableaux, images larges), ou convertir en texte brut dans les cartes. | A-07 | Phase 2 |

**Livrable Phase 3** : vue mobile polie, dette technique résiduelle résorbée, fondations pour des évolutions futures (édition, profil, cache).

---

## 5. CLARIFICATION : RESPONSIVE DESKTOP vs VUE MOBILE DÉDIÉE

### 5.1 Définitions

| Concept | Description | Fichier(s) concerné(s) |
|---------|-------------|----------------------|
| **Responsive desktop** | Le desktop de l'application vu sur un écran étroit (< 768px). La nav se transforme en bulles, les dropdowns deviennent des bottom-sheets. C'est le **même code desktop** avec des media queries. | `mobile-optimizations.scss`, `app.component.css` (media queries) |
| **Vue mobile dédiée** | Une vue **séparée** (`/mobile`) avec ses propres composants, services, modèles et styles. Aucune dépendance vers les composants desktop. | `features/mobile/`, `mobile-variables.scss` |

### 5.2 La confusion actuelle

Aujourd'hui, les deux coexistent de façon conflictuelle :

1. **`mobile-optimizations.scss` (1072 lignes)** agit sur `.app-container:not(.mobile-route)` — c'est du responsive desktop. Il transforme la navigation en bulles, les dropdowns en bottom-sheets, etc. Mais son nom (`mobile-optimizations`) laisse croire qu'il concerne la vue mobile dédiée.

2. **`features/mobile/`** est la vraie vue mobile dédiée, mais elle importe des composants desktop (`ExerciceCardComponent`), ouvre des dialogues desktop, et redirige vers des routes desktop.

3. **`app.component.css`** contient aussi des media queries mobile (L434-460) qui dupliquent partiellement `mobile-optimizations.scss`.

### 5.3 Séparation cible

| Responsabilité | Fichier cible | Action |
|----------------|--------------|--------|
| Responsive desktop (petit écran) | `shared/styles/desktop-responsive.scss` (renommage de `mobile-optimizations.scss`) | **Renommer**. Ne pas modifier le contenu. C'est du desktop, pas du mobile. |
| Media queries dans `app.component.css` | `app.component.css` | **Conserver tel quel** (c'est du desktop). Documenter que ce fichier concerne uniquement le desktop. |
| Variables CSS mobile | `shared/styles/mobile-variables.scss` | **Créer**. Source de vérité unique pour les styles mobile. |
| Styles des composants mobile | `features/mobile/components/*/`.scss | **Chaque composant mobile a son propre SCSS**, important `mobile-variables.scss`. Aucune dépendance vers `desktop-responsive.scss`. |

### 5.4 Règle absolue

> **Un fichier de style ne doit jamais cibler à la fois le responsive desktop et la vue mobile dédiée.**  
> Si un sélecteur commence par `.app-container:not(.mobile-route)`, c'est du responsive desktop.  
> Si un sélecteur est dans un composant de `features/mobile/`, c'est de la vue mobile dédiée.  
> Les deux ne se mélangent jamais.

---

## 6. DÉCISIONS STRUCTURANTES À ACTER

Ces décisions doivent être validées **avant toute ligne de code**.

### D-01 : Routing mobile avec children

**Décision** : la route `/mobile` devient une route parent avec un layout component (header + `<router-outlet>`). Les sous-routes sont :
- `''` → feed (page d'accueil mobile)
- `'detail/:type/:id'` → vue détail

**Justification** : permet le deep-linking, le bouton retour, l'ajout futur de sous-vues (édition, profil) sans refonte.

### D-02 : Aucun composant desktop en mobile

**Décision** : les composants sous `features/exercices/`, `features/entrainements/`, `features/echauffements/`, `features/situations-matchs/` ne sont **jamais** importés dans `features/mobile/`.

**Justification** : les composants desktop ont des dépendances, un layout et une logique incompatibles avec le mobile. L'import crée un couplage fort et des bugs visuels.

### D-03 : Un seul modèle ContentItem

**Décision** : le modèle `ContentItem` de `core/models/mobile-content.model.ts` est la base. Il est consolidé et déplacé dans `features/mobile/models/`. L'ancien modèle de `features/mobile/models/content-item.model.ts` est supprimé.

**Justification** : deux modèles incompatibles créent de la confusion et du code orphelin.

### D-04 : Pas d'endpoints API mobile dédiés (Phase 1-2)

**Décision** : le service d'état mobile consomme les services desktop existants (`ExerciceService`, `EntrainementService`, etc.) et transforme les données en `ContentItem[]`.

**Justification** : le backend n'a pas d'endpoints `/mobile/*`. En créer nécessite du travail backend. La transformation côté front est suffisante pour les Phases 1 et 2. Les endpoints dédiés pourront être ajoutés en Phase 3 si les performances l'exigent.

### D-05 : Variables CSS mobile = source de vérité unique

**Décision** : un fichier `mobile-variables.scss` centralise toutes les constantes visuelles mobile. Les couleurs par type de contenu sont dérivées de `global-theme.scss`. Aucune couleur n'est hardcodée dans un composant TS.

**Justification** : l'audit a identifié 3 valeurs différentes pour la couleur "Situations" et 2 pour "Échauffements". Centraliser élimine les incohérences.

### D-06 : Le responsive desktop reste intact

**Décision** : `mobile-optimizations.scss` est renommé `desktop-responsive.scss` mais **son contenu ne change pas**. Il continue à gérer l'affichage du desktop sur petits écrans. Ce n'est pas la responsabilité de la refonte mobile.

**Justification** : modifier le responsive desktop est hors périmètre et risque de casser la vue desktop.

### D-07 : Pas de visualisation via MatDialog desktop

**Décision** : la visualisation d'un item depuis la vue mobile utilise exclusivement la route `detail/:type/:id` et le composant `MobileDetailViewComponent`. Aucun `MatDialog` contenant un composant desktop n'est ouvert.

**Justification** : les dialogues desktop (`width: 1100px`, `width: 720px`) ne sont pas adaptés au mobile et créent une rupture d'expérience.

### D-08 : La recherche est inline, jamais via prompt()

**Décision** : la recherche utilise un composant `MobileSearchBarComponent` intégré dans le header ou juste en dessous. `prompt()` est interdit.

**Justification** : `prompt()` natif est non stylisable, non accessible, et incompatible avec les standards UX mobile.

### D-09 : Actions sur les cartes via menu contextuel

**Décision** : les actions (voir, dupliquer, supprimer) sur une carte du feed sont accessibles via un bouton `⋮` (three-dot menu) ouvrant un `mat-menu` ou un bottom-sheet. Pas de 4 boutons inline de 32×32px.

**Justification** : 4 boutons inline < 44×44px = surcharge cognitive + risque de clic involontaire (surtout dupliquer/supprimer adjacents).

### D-10 : Mode terrain = fonctionnalité de Phase 2

**Décision** : le mode terrain (cartes compactes, actions masquées, FAB toggle) est intégré en Phase 2, pas en Phase 1. Le composant `TerrainModeToggleComponent` existant est adapté.

**Justification** : le mode terrain améliore l'UX mais n'est pas un déblocage fonctionnel. La Phase 1 se concentre sur l'autonomie de base.

---

## 7. ANTI-PATTERNS ET RISQUES À ÉVITER

### 7.1 Anti-patterns déjà présents (à ne pas reproduire)

| Anti-pattern | Où il est présent | Risque si reproduit |
|-------------|-------------------|---------------------|
| **Importer un composant desktop en mobile** | `ExerciceCardComponent` dans `ContentFeedComponent` | Couplage fort, UX incohérente, régression desktop possible |
| **Ouvrir un MatDialog desktop depuis mobile** | `onItemView()` dans `MobilePageComponent` | Dialog non adapté, scroll cassé, layout desktop affiché |
| **Naviguer vers une route desktop** | `onItemEdit()` → `/exercices/modifier/:id` | Boucle MobileGuard, dead-end fonctionnel |
| **Hardcoder les couleurs dans le TS** | `getCategoryColor()` dans plusieurs composants | Incohérences (3 valeurs pour Situations), maintenance impossible |
| **Utiliser prompt()/confirm() natifs** | `onSearchClick()`, `onItemDelete()` | UX brutale, non stylisable, non accessible |
| **Gérer tout l'état dans le composant page** | `MobilePageComponent` (507 lignes, getters, forkJoin) | Non testable, non réutilisable, ChangeDetection imprévisible |
| **Créer des composants/services sans les intégrer** | `MobileAppBar`, `MobileContentCard`, `MobileContentService`, etc. | Code mort, confusion, deux systèmes parallèles |
| **Nommer un fichier desktop-responsive "mobile-*"** | `mobile-optimizations.scss` | Confusion entre responsive et mobile dédié |

### 7.2 Risques à surveiller pendant l'implémentation

| Risque | Description | Mitigation |
|--------|-------------|------------|
| **Régression desktop** | Modifier `app.module.ts`, `app.component.*`, ou des services partagés peut casser le desktop | Tester le desktop après chaque modification de fichier partagé. Ne jamais modifier un composant desktop. |
| **Duplication de logique métier** | Recréer dans le mobile la logique de chargement/filtrage qui existe déjà dans les services desktop | Le service d'état mobile doit **consommer** les services desktop, pas les dupliquer |
| **Over-engineering de Phase 1** | Vouloir tout faire en Phase 1 (mode terrain, édition, cache) retarde le déblocage fonctionnel | Phase 1 = minimum viable : feed + recherche + détail. Rien de plus. |
| **Couplage via les modèles** | Le modèle `ContentItem` mobile dépend de `Tag` (modèle core). Si `Tag` change, le mobile casse. | Interface mobile stable. Mapper les tags dans le service, pas dans les composants. |
| **Performance du forkJoin** | Charger 4 collections complètes à chaque visite est acceptable pour un petit volume mais ne scalera pas | Phase 1 : conserver le forkJoin. Phase 2 : pagination + cache. |

---

## 8. CARTOGRAPHIE DE L'EXISTANT

### 8.1 Composants — Décision par composant

| Composant | Emplacement | Statut actuel | Décision | Phase |
|-----------|------------|---------------|----------|-------|
| `MobilePageComponent` | `features/mobile/pages/mobile-page/` | Actif, monolithique (507 lignes) | **Refactoriser** → scinder en layout + home page | 1 |
| `MobileHeaderComponent` | `features/mobile/components/mobile-header/` | Actif | **Refactoriser** → intégrer recherche inline, aligner visuellement | 1 + 2 |
| `MobileFilterBarComponent` | `features/mobile/components/mobile-filter-bar/` | Actif | **Refactoriser** → variables CSS centralisées, touch-targets | 2 |
| `HeroContextuelComponent` | `features/mobile/components/hero-contextuel/` | Actif | **Refactoriser** → découpler du premier item, améliorer visuellement | 2 |
| `ContentFeedComponent` | `features/mobile/components/content-feed/` | Actif, importe ExerciceCardComponent | **Refactoriser** → remplacer par `MobileFeedCardComponent` | 1 |
| `MobileAppBarComponent` | `shared/components/mobile-app-bar/` | Code mort (doublon de MobileHeader) | **Supprimer** | 2 |
| `MobileContentCardComponent` | `shared/components/mobile-content-card/` | Code mort (orphelin) | **Évaluer** → base possible pour `MobileFeedCardComponent`, sinon supprimer | 1 |
| `ContentCategoriesComponent` | `shared/components/content-categories/` | Code mort (orphelin) | **Évaluer** → si utile pour FilterBar refactorisée, sinon supprimer | 2 |
| `ContentSectionsComponent` | `shared/components/content-sections/` | Code mort (orphelin) | **Supprimer** → le feed ne fonctionne pas par sections Netflix pour l'instant | 2 |
| `ContentCardComponent` | `shared/components/content-card/` | Code mort (orphelin, générique) | **Supprimer** → trop générique, remplacé par `MobileFeedCardComponent` | 2 |
| `TerrainModeToggleComponent` | `shared/components/terrain-mode-toggle/` | Code mort (orphelin) | **Adapter** → intégrer en Phase 2, déplacer dans `features/mobile/components/` | 2 |
| `ExerciceCardComponent` | `features/exercices/components/` | Desktop, importé à tort dans mobile | **Retirer l'import mobile**. Ne pas modifier le composant lui-même. | 1 |

### 8.2 Services — Décision par service

| Service | Emplacement | Statut actuel | Décision | Phase |
|---------|------------|---------------|----------|-------|
| `MobileDetectorService` | `core/services/` | Actif | **Conserver** + renforcer (détection touch, reset forceDesktop) | 1 (conserver) + 3 (renforcer) |
| `MobileContentService` | `core/services/` | Orphelin (dépend d'endpoints `/mobile/*` inexistants) | **Refactoriser** → adapter pour consommer les services desktop existants, déplacer dans `features/mobile/services/` | 2 |
| `MobileContentStateService` | `core/services/` | Orphelin (dépend de MobileContentService) | **Refactoriser** → adapter pour le nouveau MobileContentService, déplacer dans `features/mobile/services/` | 2 |
| `FiltersService` | `core/services/` | Orphelin (logique de filtrage mobile) | **Refactoriser** → adapter pour le modèle unifié, déplacer dans `features/mobile/services/` | 2 |

### 8.3 Modèles — Décision par modèle

| Modèle | Emplacement | Statut actuel | Décision | Phase |
|--------|------------|---------------|----------|-------|
| `ContentItem` (features) | `features/mobile/models/content-item.model.ts` | Actif (utilisé par la page mobile) | **Supprimer** → remplacer par le modèle unifié | 2 |
| `ContentItem` (core) | `core/models/mobile-content.model.ts` | Orphelin (plus complet) | **Consolider** → base du modèle unifié, déplacer dans `features/mobile/models/` | 2 |

### 8.4 Styles — Décision par fichier

| Fichier | Emplacement | Statut actuel | Décision | Phase |
|---------|------------|---------------|----------|-------|
| `mobile-optimizations.scss` | `shared/styles/` | Actif (responsive desktop, 1072 lignes) | **Renommer** → `desktop-responsive.scss`. Ne pas modifier le contenu. | 3 |
| `global-theme.scss` | `shared/styles/` | Actif (variables CSS partagées) | **Conserver** — source de vérité pour les couleurs de base | — |
| `mobile-variables.scss` | `shared/styles/` | **N'existe pas** | **Créer** — variables CSS dédiées au mobile, dérivées de `global-theme.scss` | 1 |
| Composants SCSS mobile | `features/mobile/components/*/` | Actif (couleurs hardcodées) | **Refactoriser** → importer `mobile-variables.scss`, supprimer les hardcodes | 1 + 2 |

### 8.5 Guards — Décision par guard

| Guard | Emplacement | Statut actuel | Décision | Phase |
|-------|------------|---------------|----------|-------|
| `MobileGuard` | `core/guards/` | Actif (redirige vers `/mobile` si mobile) | **Conserver** — rôle essentiel. Renforcer en Phase 3 (détection touch). | 1 (conserver) + 3 (renforcer) |

---

## SYNTHÈSE FINALE

Ce plan de refonte mobile repose sur **10 décisions structurantes** (D-01 à D-10) qui doivent être actées avant toute implémentation.

**Phase 1 (8 actions)** débloque la vue mobile en la rendant autonome : routing avec children, carte mobile unifiée, recherche inline, vue détail dédiée, suppression des dépendances desktop.

**Phase 2 (12 actions)** améliore l'UX, unifie les modèles et services, intègre le mode terrain, nettoie le code mort.

**Phase 3 (12 actions)** traite la dette résiduelle, explore le cache hors-ligne et prépare l'édition mobile.

La règle fondamentale est la **séparation stricte** : le responsive desktop et la vue mobile dédiée sont deux mondes qui ne se mélangent jamais. Aucun composant desktop n'entre dans le mobile. Aucun style mobile ne cible le desktop.

---

*Document de plan — aucun code, aucune implémentation. À valider avant toute exécution.*
