# PLAN DE MODIFICATION MOBILE — Ultimate Frisbee Manager

**Statut** : WORK  
**Date** : 2026-02-10  
**Audit de référence** : `docs/work/audits/20260210_AUDIT_MOBILE_COMPLET.md`  
**Périmètre** : Vue mobile dédiée uniquement — vue desktop intouchable  
**Nature** : Plan structurel — aucun code, aucune implémentation

---

## TABLE DES MATIÈRES

1. [Vision mobile cible](#1-vision-mobile-cible)
2. [Architecture mobile cible](#2-architecture-mobile-cible)
3. [Phase 0 — Décisions structurantes](#3-phase-0--décisions-structurantes)
4. [Phase 1 — Déblocage fonctionnel (P0)](#4-phase-1--déblocage-fonctionnel-p0)
5. [Phase 2 — Refonte UX & lisibilité (P1)](#5-phase-2--refonte-ux--lisibilité-p1)
6. [Phase 3 — Nettoyage, dette, améliorations (P2)](#6-phase-3--nettoyage-dette-améliorations-p2)
7. [Hors périmètre mobile](#7-hors-périmètre-mobile)

---

## 1. VISION MOBILE CIBLE

### 1.1 Définition

La vue mobile est une **vue dédiée, autonome et indépendante du desktop**. Elle n'est pas une adaptation responsive. Elle a ses propres composants, son propre routing, ses propres styles, sa propre logique d'état.

Elle est pensée pour un **usage terrain** : un coach ou un joueur qui consulte rapidement ses exercices, ses entraînements ou ses échauffements depuis un téléphone, en extérieur, entre deux séances.

### 1.2 Principes non négociables

| # | Principe | Conséquence concrète |
|---|----------|---------------------|
| 1 | Mobile ≠ desktop responsive | Deux mondes séparés. Aucun fichier de style ne cible les deux à la fois. |
| 2 | Pas de composant desktop en mobile | Aucun import depuis `features/exercices/`, `features/entrainements/`, etc. |
| 3 | Pas de redirection mobile → desktop | Aucun `router.navigate` vers une route protégée par `MobileGuard`. |
| 4 | Pas de dialog desktop en mobile | Aucun `MatDialog` contenant un composant desktop. |
| 5 | Lisibilité > exhaustivité | La vue mobile n'a pas besoin de tout faire. Elle doit faire peu, mais bien. |

### 1.3 Structure UX cible

```
┌──────────────────────────────────┐
│  HEADER FIXE                     │  Logo + titre app + recherche inline + avatar/menu
├──────────────────────────────────┤
│  FILTER BAR (sticky)             │  Catégories content scrollables + tri + indicateur filtre actif
├──────────────────────────────────┤
│                                  │
│  FEED CENTRAL SCROLLABLE         │  Cartes mobile unifiées (tous types confondus)
│                                  │  Actions via menu contextuel (⋮)
│                                  │  Lazy loading ou scroll infini (Phase 2)
│                                  │
├──────────────────────────────────┤
│  [BOTTOM NAV ou FAB terrain]     │  Navigation rapide / toggle mode terrain (Phase 2+)
└──────────────────────────────────┘
```

### 1.4 Requalification du hero contextuel

Le hero contextuel actuel affiche systématiquement le **premier item filtré**, qui est aussi le premier du feed. Cela crée une redondance (constat V-08 de l'audit).

**Décision à acter en Phase 0** :  
Le hero est soit **supprimé**, soit **requalifié** comme zone dynamique avec une logique de sélection distincte du feed (ex : dernier item consulté, entraînement du jour, contenu épinglé). Il ne peut pas rester un doublon du premier item.

---

## 2. ARCHITECTURE MOBILE CIBLE

### 2.1 Routing

```
/mobile                           ← Layout mobile (header fixe + <router-outlet>)
  ├── (default: '')               ← Page d'accueil mobile (feed)
  └── detail/:type/:id            ← Vue détail d'un item (exercice, entraînement, etc.)
```

La route `/mobile` charge un **layout component** contenant le header fixe et un `<router-outlet>`. Les sous-routes sont des children. Cette structure permet d'ajouter des pages futures (édition, profil) sans refonte.

### 2.2 Structure de fichiers

```
features/mobile/
├── mobile.routes.ts                      ← Routing mobile (children)
├── mobile-layout.component.ts/html/scss  ← Layout (header + outlet)
├── models/
│   └── mobile-content.model.ts           ← Modèle ContentItem UNIFIÉ (1 seul)
├── services/
│   ├── mobile-data.service.ts            ← Chargement des données (consomme les services desktop existants)
│   ├── mobile-state.service.ts           ← Gestion d'état centralisée (Angular Signals)
│   └── mobile-filters.service.ts         ← Logique de filtrage
├── pages/
│   ├── mobile-home/                      ← Page feed (accueil)
│   └── mobile-detail/                    ← Page détail d'un item
└── components/
    ├── mobile-header/                    ← Header fixe (refactorisé)
    ├── mobile-search-bar/                ← Recherche inline (NOUVEAU)
    ├── mobile-filter-bar/                ← Barre de filtres (refactorisée)
    ├── mobile-feed-card/                 ← Carte unifiée pour le feed (NOUVEAU)
    ├── mobile-item-actions/              ← Actions contextuelles via menu (NOUVEAU)
    ├── mobile-confirm-dialog/            ← Confirmation mobile (remplace confirm()) (NOUVEAU)
    ├── mobile-detail-view/               ← Rendu du détail d'un item (NOUVEAU)
    └── mobile-terrain-toggle/            ← Toggle mode terrain (adapté d'orphelin existant)
```

### 2.3 Styles

| Fichier | Rôle | Cible |
|---------|------|-------|
| `shared/styles/mobile-variables.scss` | Variables CSS mobile centralisées (couleurs, tailles, espacements, touch-targets). Dérivées de `global-theme.scss`. | **CRÉER** |
| `features/mobile/components/*/*.scss` | Styles propres à chaque composant mobile. Importent `mobile-variables.scss`. | Refactoriser / Créer |
| `shared/styles/mobile-optimizations.scss` | **Desktop responsive** (1072 lignes). N'est PAS de la vue mobile. | **Renommer** → `desktop-responsive.scss` |

**Règle** : aucune couleur hardcodée dans un fichier TS ou SCSS mobile. Toutes les couleurs passent par `mobile-variables.scss`.

### 2.4 Modèle de données

Un **seul** modèle `ContentItem` pour toute la vue mobile, basé sur le modèle orphelin `core/models/mobile-content.model.ts` (plus complet que `features/mobile/models/content-item.model.ts`).

**Interfaces conservées** :
- `ContentTypeId` : `'exercices' | 'entrainements' | 'echauffements' | 'situations'`
- `ContentItem` : `{ id, type, title, metadata, permissions }`
- `ContentMetadata` : `{ duration, imageUrl, tags, isFavorite, isRecent, description, createdAt }`
- `ItemPermissions` : `{ canView, canEdit, canDelete }`
- `MobileContentState` : état global de la vue mobile
- `FiltersState` : état des filtres

**Interfaces supprimées** :
- `ContentConfig`, `ContentParams` : dépendent d'endpoints API `/mobile/*` qui n'existent pas côté backend
- L'ancien `ContentItem` de `features/mobile/models/content-item.model.ts` (redondant, moins structuré)

### 2.5 Accès aux données

Le service d'état mobile **consomme les services desktop existants** (`ExerciceService`, `EntrainementService`, `EchauffementService`, `SituationMatchService`) et transforme les résultats en `ContentItem[]`.

Pas d'endpoint API mobile dédié. La transformation se fait côté front dans `mobile-data.service.ts`.

---

## 3. PHASE 0 — DÉCISIONS STRUCTURANTES

**Objectif** : acter les choix architecturaux et produit AVANT toute ligne de code.

Chaque décision doit être validée explicitement. Aucune implémentation ne commence tant que la Phase 0 n'est pas close.

### Décisions à acter

| ID | Décision | Justification (référence audit) |
|----|----------|--------------------------------|
| **D-01** | **Le routing mobile utilise des children** : `/mobile` = layout parent, `''` = home/feed, `detail/:type/:id` = détail. | Résout A-01, A-19, N-07. Permet deep-linking, bouton retour, évolutivité. |
| **D-02** | **Aucun composant desktop n'est importé en mobile.** Les composants sous `features/exercices/`, `features/entrainements/`, `features/echauffements/`, `features/situations-matchs/` ne sont jamais référencés depuis `features/mobile/`. | Résout A-05, U-08, N-05. Élimine le couplage desktop/mobile. |
| **D-03** | **Un seul modèle `ContentItem`**, basé sur `core/models/mobile-content.model.ts`, consolidé dans `features/mobile/models/`. L'ancien modèle est supprimé. | Résout A-10, A-18. Élimine la confusion entre deux interfaces incompatibles. |
| **D-04** | **Pas d'endpoints API mobile dédiés en Phase 1-2.** Le service mobile consomme les services desktop existants et transforme les données. | Évite du travail backend, suffisant pour le volume actuel. |
| **D-05** | **`mobile-variables.scss` = source de vérité unique** pour les constantes visuelles mobile. Les couleurs par type de contenu sont dérivées de `global-theme.scss`. Zéro hardcode. | Résout V-01, V-02, V-03, V-04, A-17. |
| **D-06** | **Le responsive desktop reste intact.** `mobile-optimizations.scss` est renommé mais son contenu ne change pas. | Protège la vue desktop. Hors périmètre de la refonte mobile. |
| **D-07** | **Pas de dialog desktop en mobile.** La visualisation d'un item utilise la route `detail/:type/:id`. | Résout U-16, N-04, N-05. |
| **D-08** | **`prompt()` et `confirm()` sont interdits.** Recherche = composant inline. Confirmation = bottom-sheet ou dialog mobile dédié. | Résout U-01, U-02. |
| **D-09** | **Actions sur les cartes via menu contextuel (⋮)**, pas de boutons inline < 44px. | Résout V-12, U-10. |
| **D-10** | **Le hero contextuel est requalifié ou supprimé.** S'il est conservé, sa logique de sélection doit être distincte du premier item du feed. Cette décision est actée avant Phase 1. | Résout V-08. |

### Risques Phase 0

- **Risque : bloquer indéfiniment** sur les décisions. Mitigation : chaque décision est binaire (oui/non). La Phase 0 ne produit que ce tableau validé.
- **Risque : sous-estimer l'impact de D-02** (supprimer l'import de composants desktop). Mitigation : le remplacement est prévu en Phase 1 (création de `MobileFeedCardComponent`).

---

## 4. PHASE 1 — DÉBLOCAGE FONCTIONNEL (P0)

### Objectif

Rendre la vue mobile **fonctionnellement autonome** : l'utilisateur peut consulter le feed, rechercher, voir le détail d'un item, sans aucune redirection vers le desktop.

### 4.1 Éléments à corriger

| Action | Problèmes audit résolus | Description |
|--------|------------------------|-------------|
| Transformer la route `/mobile` en route parent avec children | A-01, A-19, N-02, N-07 | Créer `mobile.routes.ts` avec layout parent + children (`''`, `detail/:type/:id`). Modifier `app.module.ts` pour charger les routes mobile en lazy-loading. |
| Remplacer les navigations vers routes desktop | N-04, U-17 | Dans `MobilePageComponent` : remplacer `onItemEdit()` (→ `/exercices/modifier/:id`) et `onItemView()` (→ dialogues desktop) par une navigation vers `detail/:type/:id`. |
| Remplacer `prompt()` par une recherche inline | U-01, U-14 | `onSearchClick()` utilise actuellement `prompt()`. Remplacer par `MobileSearchBarComponent` intégré dans le header. |
| Remplacer `confirm()` par une confirmation mobile | U-02 | `onItemDelete()` utilise `confirm()`. Remplacer par `MobileConfirmDialogComponent` (bottom-sheet ou dialog mobile). |

### 4.2 Éléments à supprimer

| Élément | Emplacement | Raison |
|---------|------------|--------|
| Import de `ExerciceCardComponent` dans `ContentFeedComponent` | `features/mobile/components/content-feed/` | A-05 : composant desktop 347 lignes importé en mobile. Remplacé par `MobileFeedCardComponent`. |
| Appels `MatDialog.open()` avec composants desktop | `MobilePageComponent.onItemView()` | N-05 : `EntrainementDetailComponent`, `EchauffementViewComponent`, `SituationMatchViewComponent` ouverts en dialog desktop. |
| Les 4 `router.navigate()` vers routes desktop | `MobilePageComponent.onItemEdit()` | N-04 : créent une boucle MobileGuard → `/mobile`. |

### 4.3 Éléments à implémenter

| Composant / Fichier | Description |
|---------------------|-------------|
| **`mobile.routes.ts`** | Fichier de routing mobile avec `MobileLayoutComponent` comme parent et children (`''` → home, `detail/:type/:id` → détail). |
| **`MobileLayoutComponent`** | Layout shell : header fixe + `<router-outlet>`. Extrait du monolithe `MobilePageComponent`. |
| **`MobileHomeComponent`** | Page d'accueil mobile (feed). Reprend la logique de `MobilePageComponent` sans les parties layout/header. |
| **`MobileFeedCardComponent`** | Carte mobile unifiée pour tous les types de contenu. Touch-targets ≥ 44×44px. Actions via bouton ⋮ (menu contextuel). Bordure ou badge coloré par type. Remplace `ExerciceCardComponent` + `mat-card` inline. |
| **`MobileSearchBarComponent`** | Champ de recherche inline (dans ou sous le header). Indicateur de recherche active. Bouton d'effacement. |
| **`MobileDetailComponent`** (page) | Page de détail d'un item. Affiche titre, description, tags, métadonnées, image. Bouton retour vers le feed. Accessible via `detail/:type/:id`. |
| **`MobileConfirmDialogComponent`** | Bottom-sheet ou dialog mobile pour les confirmations (suppression, etc.). Remplace `confirm()` natif. |
| **`mobile-variables.scss`** | Variables CSS centralisées : couleurs par type de contenu (alignées sur `global-theme.scss`), tailles typo, espacements, touch-target minimum 44×44px. |

### 4.4 Risques Phase 1

| Risque | Description | Mitigation |
|--------|-------------|------------|
| Régression desktop | Modifier `app.module.ts` (routing) peut impacter le desktop. | Tester toutes les routes desktop après modification du routing. La route `/mobile` est déjà isolée via `loadComponent`, le changement vers `loadChildren` est local. |
| Over-engineering | Vouloir intégrer mode terrain, filtrage avancé, scroll infini dès Phase 1. | Phase 1 = minimum vital. Le feed charge tout via `forkJoin` (comme aujourd'hui). La pagination est en Phase 2. |
| Perte du feed actuel pendant la transition | Remplacer les cartes sans avoir validé le nouveau composant. | Implémenter `MobileFeedCardComponent` d'abord, tester, puis remplacer. |

### 4.5 Livrable Phase 1

La vue mobile est autonome :
- Feed consultable avec cartes mobiles dédiées
- Recherche inline fonctionnelle
- Vue détail d'un item (page mobile, pas un dialog desktop)
- Confirmation mobile (pas de `confirm()` natif)
- Routing avec children (deep-linking possible)
- Zéro dépendance vers des composants ou routes desktop

---

## 5. PHASE 2 — REFONTE UX & LISIBILITÉ (P1)

### Objectif

Améliorer l'expérience utilisateur : cohérence visuelle, filtrage avancé, performance, intégration des briques orphelines, nettoyage du code mort.

### 5.1 Éléments à corriger

| Action | Problèmes audit résolus | Description |
|--------|------------------------|-------------|
| Aligner toutes les couleurs sur `mobile-variables.scss` | V-01, V-02, V-03, V-04, V-13 | Remplacer toutes les couleurs hardcodées dans les composants TS et SCSS mobile par des variables CSS. Exercice = une seule valeur. Échauffement = une seule valeur. Situation = une seule valeur. |
| Refactoriser `MobileHeaderComponent` | V-05, V-14, N-01 | Intégrer la recherche inline, afficher le nom complet "Ultimate Frisbee Manager" (pas "UFM"), appliquer le gradient desktop (`#2c3e50` → `#34495e` + bordure bleue). |
| Refactoriser `MobileFilterBarComponent` | U-04, U-12 | Touch-targets ≥ 44px. Indicateur de scroll horizontal (ombre ou chevron). Intégrer le filtrage par tags (objectif, niveau, format) en plus des catégories de contenu. |
| Refactoriser le hero contextuel (si conservé) | V-08, V-11, V-07 | Logique de sélection distincte du feed. Gradient visuel renforcé. Description > 60 caractères. Si la décision D-10 a acté la suppression, supprimer le composant. |
| Corriger `OnPush` + `ChangeDetectorRef` | A-13, A-14 | La nouvelle `MobileHomeComponent` doit utiliser correctement `markForCheck()` ou gérer l'état via Signals (pas de getters recalculés dans le template). |
| Corriger `forceDesktop` sur mobile physique | N-11 | Ajouter un mécanisme de reset automatique du flag `forceDesktop` quand l'utilisateur revient sur un device réellement mobile. |

### 5.2 Éléments à supprimer

| Élément | Emplacement | Raison |
|---------|------------|--------|
| `MobileAppBarComponent` | `shared/components/mobile-app-bar/` | A-09 : code mort, doublon fonctionnel de `MobileHeaderComponent`. |
| `ContentSectionsComponent` | `shared/components/content-sections/` | A-12 : orphelin, non intégré, design Netflix par sections non retenu en Phase 1-2. |
| `ContentCardComponent` | `shared/components/content-card/` | A-12 : orphelin, trop générique, remplacé par `MobileFeedCardComponent`. |
| Ancien modèle `ContentItem` | `features/mobile/models/content-item.model.ts` | A-10 : remplacé par le modèle unifié. |
| `MobilePageComponent` (monolithe original) | `features/mobile/pages/mobile-page/` | Remplacé par `MobileLayoutComponent` + `MobileHomeComponent` en Phase 1. Supprimé ici après vérification que rien ne le référence. |

### 5.3 Éléments à implémenter

| Composant / Service | Description |
|---------------------|-------------|
| **Modèle `ContentItem` unifié** | Consolider `core/models/mobile-content.model.ts` dans `features/mobile/models/`. Supprimer le doublon. Mettre à jour tous les imports. |
| **`MobileDataService`** | Service dans `features/mobile/services/`. Consomme `ExerciceService`, `EntrainementService`, `EchauffementService`, `SituationMatchService`. Expose des `ContentItem[]` unifiés. Adapté de l'orphelin `MobileContentService` (sans dépendance aux endpoints `/mobile/*`). |
| **`MobileStateService`** | Gestion d'état centralisée via Angular Signals. Adapté de l'orphelin `MobileContentStateService`. Gère `activeCategory`, `searchTerm`, `filters`, `items`, `loading`, `error`. |
| **`MobileFiltersService`** | Logique de filtrage. Adapté de l'orphelin `FiltersService`. Filtrage par catégorie + tags + recherche + favoris + récents. |
| **Filtrage avancé dans la filter bar** | Ajouter un accès aux filtres par tags (objectif, niveau, format, temps) en complément des catégories de contenu. |
| **Scroll infini / virtualisation** | Remplacer le `forkJoin` complet par un chargement paginé. Implémenter le scroll infini dans le feed. |
| **`MobileTerrainToggleComponent`** | Adapté de l'orphelin `TerrainModeToggleComponent`. FAB en bas à droite. Active le mode terrain : cartes compactes, actions masquées, focus sur la consultation rapide. |
| **Désactivation propre des menus non fonctionnels** | Les 4 entrées de menu (Profil, Tags, Admin, Paramètres) qui affichent un snackbar "en cours de développement" sont soit masquées, soit affichées avec un état "bientôt disponible" explicite (pas un snackbar éphémère). |

### 5.4 Évaluation des orphelins

| Orphelin | Emplacement | Évaluation | Décision |
|----------|------------|------------|----------|
| `MobileContentCardComponent` | `shared/components/mobile-content-card/` | Conception correcte (image, favori, meta, description compacte) mais utilise l'ancien modèle `ContentItem` de `core/models/`. | **Évaluer** comme base pour `MobileFeedCardComponent` (Phase 1). Si `MobileFeedCardComponent` a été créé from scratch en Phase 1, **supprimer** l'orphelin ici. |
| `ContentCategoriesComponent` | `shared/components/content-categories/` | Chips horizontales avec catégories. Utile conceptuellement mais dépend du modèle `Category` de `core/models/mobile-content.model.ts`. | **Évaluer** comme inspiration pour la refonte de `MobileFilterBarComponent`. Supprimer après refonte. |
| `MobileContentService` | `core/services/` | Bien structuré mais dépend d'endpoints `/mobile/*` inexistants. | **Refactoriser** → base du `MobileDataService` sans les endpoints fictifs. Déplacer dans `features/mobile/services/`. |
| `MobileContentStateService` | `core/services/` | Gestion d'état par Signals, bien conçu. Dépend de `MobileContentService`. | **Refactoriser** → base du `MobileStateService`. Déplacer dans `features/mobile/services/`. |
| `FiltersService` | `core/services/` | Logique de filtrage propre. Dépend du modèle `ContentItem` de `core/models/`. | **Refactoriser** → base du `MobileFiltersService`. Déplacer dans `features/mobile/services/`. |
| `TerrainModeToggleComponent` | `shared/components/terrain-mode-toggle/` | Fonctionnel mais utilise `document.body.classList` (manipulation DOM directe). | **Adapter** → déplacer dans `features/mobile/components/`, remplacer la manipulation DOM par une approche Angular (classe conditionnelle dans le template). |

### 5.5 Risques Phase 2

| Risque | Description | Mitigation |
|--------|-------------|------------|
| Incohérence modèle pendant la migration | L'ancien et le nouveau `ContentItem` coexistent pendant la transition. | Migrer le modèle en premier, mettre à jour tous les imports en une passe. |
| Régression du feed Phase 1 | La refonte des filtres et du state service peut casser le feed existant. | Conserver le fonctionnement Phase 1 comme fallback testable. |
| Complexité du scroll infini | L'implémentation peut introduire des bugs de position, de duplication ou de performance. | Implémenter d'abord la pagination côté service, puis le scroll infini côté UI. |
| Suppression trop agressive de code mort | Supprimer un orphelin qui est en réalité référencé quelque part. | Vérifier chaque import avec `grep` avant suppression. |

### 5.6 Livrable Phase 2

La vue mobile est cohérente visuellement, performante et riche fonctionnellement :
- Couleurs alignées partout (une valeur par type de contenu)
- Filtrage avancé (catégories + tags)
- État centralisé propre (Signals)
- Mode terrain fonctionnel
- Scroll infini
- Code mort supprimé
- Orphelins intégrés ou nettoyés

---

## 6. PHASE 3 — NETTOYAGE, DETTE, AMÉLIORATIONS (P2)

### Objectif

Traiter la dette résiduelle, les finitions visuelles, et poser les fondations pour les évolutions futures.

### 6.1 Éléments à corriger

| Action | Problèmes audit résolus | Description |
|--------|------------------------|-------------|
| Affiner la hiérarchie typographique | V-06 | Établir une échelle de tailles avec ≥ 2px d'écart entre niveaux (titre card, body, meta, date). Documenter dans `mobile-variables.scss`. |
| Enrichir l'affichage des tags | V-09 | Afficher plus de 2 tags. Overflow géré : "+N" ou scroll horizontal. |
| Ajouter le feedback visuel sur la filter bar sticky | U-05 | Ombre dynamique au scroll. Indicateur de scroll horizontal. |
| Corriger le padding-bottom fantôme (80px) | U-06 | Aligner sur la hauteur réelle du FAB mode terrain, ou supprimer si pas de bottom-bar. |
| Améliorer le tri | U-13 | Ajouter des options (nom, durée). Retour visuel explicite sur l'option active. |
| Contraindre le rendu rich-text en mobile | A-07 | Limiter la hauteur du rich-text dans les cartes. Masquer les éléments non adaptés (tableaux larges, images non contraintes). |
| Ajouter le debounce sur le listener resize | A-15 | `fromEvent(window, 'resize').pipe(debounceTime(300))` pour éviter le spam de snackbars. |

### 6.2 Éléments à supprimer

| Élément | Emplacement | Raison |
|---------|------------|--------|
| Orphelins résiduels non intégrés en Phase 2 | `shared/components/`, `core/services/` | Si des orphelins n'ont pas été intégrés en Phase 2, ils sont supprimés ici pour nettoyer la codebase. |

### 6.3 Éléments à implémenter

| Action | Description |
|--------|-------------|
| **Renommer `mobile-optimizations.scss`** → `desktop-responsive.scss` | Clarifier la responsabilité du fichier. Documenter dans un commentaire en en-tête. Ne pas modifier le contenu. |
| **Améliorer la détection mobile** | Compléter `MobileDetectorService` : ajouter `navigator.maxTouchPoints`, `matchMedia('(pointer: coarse)')` en complément de `window.innerWidth`. |
| **Restreindre l'accès desktop à `/mobile`** | Ajouter un guard ou une redirection si un utilisateur desktop (width > 768 + pas de touch) accède manuellement à `/mobile`. |
| **Explorer le cache hors-ligne** | Évaluer l'intérêt d'un Service Worker ou d'un cache localStorage pour les données du feed en contexte terrain (connexion intermittente). Pas d'implémentation obligatoire — évaluation uniquement. |
| **Préparer l'édition mobile** | Concevoir l'approche pour l'édition (formulaire mobile simplifié ou redirection contrôlée vers desktop avec sortie explicite du mode mobile). Produire un document de conception, pas d'implémentation. |
| **Documenter la séparation responsive / mobile** | Ajouter un fichier `docs/reference/SEPARATION_RESPONSIVE_MOBILE.md` qui documente la règle : quels fichiers concernent le responsive desktop, lesquels la vue mobile dédiée, et pourquoi ils ne se mélangent jamais. |

### 6.4 Risques Phase 3

| Risque | Description | Mitigation |
|--------|-------------|------------|
| Renommage de `mobile-optimizations.scss` | Tous les imports de ce fichier doivent être mis à jour. | `grep` exhaustif des imports avant renommage. |
| Amélioration de la détection mobile | Faux positifs possibles (tablettes, écrans tactiles desktop). | La détection tactile est un **complément**, pas un remplacement de la détection par width. |
| Cache hors-ligne | Complexité d'invalidation du cache, risque de données obsolètes. | Phase d'évaluation uniquement. Pas d'implémentation sans document de conception validé. |

### 6.5 Livrable Phase 3

La vue mobile est polie et documentée :
- Typographie affinée
- Tags complets
- Filter bar avec feedback visuel
- Rich-text contraint
- Détection mobile renforcée
- Documentation de la séparation responsive/mobile
- Évaluation produite pour cache hors-ligne et édition mobile
- Dette technique résiduelle résorbée

---

## 7. HORS PÉRIMÈTRE MOBILE

Les éléments suivants sont **volontairement exclus** du périmètre de cette refonte. Ils ne sont pas oubliés — ils sont explicitement reportés ou jugés non pertinents pour la vue mobile.

### 7.1 Fonctionnalités hors périmètre

| Fonctionnalité | Raison de l'exclusion |
|----------------|----------------------|
| **Édition mobile complète** (formulaires de création/modification) | Complexité élevée (rich-text, tags, images). La vue mobile est d'abord une vue de consultation. L'édition est un sujet à part, traité en Phase 3 comme conception uniquement. |
| **Administration mobile** | Le module admin est un outil de gestion avancée. Pas de valeur ajoutée en contexte terrain. |
| **Gestion des tags avancée** | Le module tags-advanced est une fonctionnalité de configuration. Pas adapté au mobile terrain. |
| **Profil utilisateur mobile** | Fonctionnalité secondaire. Le profil se gère sur desktop. Le menu mobile peut proposer un lien vers desktop pour le profil. |
| **Paramètres mobile** | Même raisonnement que le profil. |
| **Gestion des workspaces** | Fonctionnalité de structure organisationnelle. Se fait sur desktop. |
| **Favoris (système complet)** | L'affichage de l'état favori est inclus. Le système de toggle favori (backend + persistance) est un développement à part, incluant un endpoint API. Hors périmètre front. |
| **Notifications / push** | Fonctionnalité non existante dans l'app. Hors périmètre. |
| **PWA / installation mobile** | Sujet d'infrastructure (manifest, service worker). Peut être traité indépendamment de la refonte UI. |

### 7.2 Modifications techniques hors périmètre

| Élément | Raison de l'exclusion |
|---------|----------------------|
| **Vue desktop** | Intouchable. Aucune modification directe ou indirecte. |
| **Composants desktop** | On ne les modifie pas. On cesse de les importer en mobile. |
| **`mobile-optimizations.scss` (contenu)** | Ce fichier concerne le desktop responsive. Son contenu ne change pas. Seul le nom est clarifié en Phase 3. |
| **Backend / API** | Pas d'endpoint mobile dédié en Phase 1-2. Le frontend mobile consomme les API existantes. |
| **Tests E2E mobile** | Importants mais hors périmètre de ce plan structurel. À traiter dans un plan de test dédié. |

### 7.3 Principes d'exclusion

> **La vue mobile n'a pas besoin de tout faire.**  
> Elle doit permettre de **consulter rapidement** ses contenus sur le terrain.  
> Toute fonctionnalité de **gestion, configuration ou administration** reste sur desktop.  
> L'édition mobile est un sujet à part qui sera traité après validation de la consultation.

---

## ANNEXE — TRAÇABILITÉ AUDIT → PLAN

Chaque problème de l'audit est rattaché à une phase du plan.

### Problèmes P0 → Phase 1

| ID audit | Phase | Action du plan |
|----------|-------|---------------|
| V-12 | 1 | `MobileFeedCardComponent` avec menu ⋮ (plus de 4 boutons inline) |
| U-01 | 1 | `MobileSearchBarComponent` (remplace `prompt()`) |
| U-08 | 1 | `MobileFeedCardComponent` (remplace `ExerciceCardComponent`) |
| U-10 | 1 | Touch-targets ≥ 44×44px dans `MobileFeedCardComponent` |
| U-16 | 1 | `MobileDetailComponent` page (remplace dialogues desktop) |
| U-17 | 1 | Navigation vers `detail/:type/:id` (remplace routes desktop) |
| N-02 | 1 | Routing avec children + layout mobile |
| N-04 | 1 | Suppression des `router.navigate` vers routes desktop |
| N-05 | 1 | Suppression des `MatDialog.open()` avec composants desktop |
| A-01 | 1 | `mobile.routes.ts` avec layout parent + children |
| A-03 | 3 | Renommage `mobile-optimizations.scss` → `desktop-responsive.scss` |
| A-05 | 1 | Suppression import `ExerciceCardComponent` dans feed mobile |
| A-10 | 2 | Unification du modèle `ContentItem` |
| A-17 | 1 | Création de `mobile-variables.scss` |
| A-19 | 1 | Routing mobile avec children |

### Problèmes P1 → Phase 2

| ID audit | Phase | Action du plan |
|----------|-------|---------------|
| V-01 à V-04 | 2 | Alignement des couleurs via `mobile-variables.scss` |
| V-08 | 2 | Requalification/suppression du hero (décision D-10) |
| V-10 | 2 | Affichage des images dans `MobileFeedCardComponent` |
| V-13 | 2 | Badge/icône de type dans `MobileFeedCardComponent` |
| U-02 | 1 | `MobileConfirmDialogComponent` |
| U-03 | 3 | Contrainte du rich-text en mobile |
| U-04 | 2 | Refonte `MobileFilterBarComponent` |
| U-07 | 2 | Scroll infini / virtualisation |
| U-09 | 1 | `MobileFeedCardComponent` unifié (plus de deux systèmes) |
| U-11 | 2 | Évaluation de `MobileContentCardComponent` |
| U-12 | 2 | Filtrage par tags dans la filter bar |
| U-14 | 1 | Indicateur de recherche active dans `MobileSearchBarComponent` |
| U-15 | 2 | Intégration `MobileTerrainToggleComponent` |
| N-06 | 2 | Désactivation propre des menus non fonctionnels |
| N-07 | 1 | Deep-linking via routing children |
| N-11 | 2 | Reset automatique de `forceDesktop` |
| A-02 | 1 | `MobileLayoutComponent` indépendant |
| A-04 | 3 | Renommage pour clarification |
| A-06 | 1 | Suppression des dialogues desktop en mobile |
| A-09 | 2 | Suppression `MobileAppBarComponent` |
| A-11 | 2 | Intégration des services orphelins |
| A-12 | 2 | Évaluation/suppression des composants shared orphelins |
| A-13, A-14 | 2 | Correction `OnPush` + état par Signals |
| A-16 | 2 | Pagination (via `MobileDataService`) |
| A-18 | 2 | Suppression du modèle doublon |

### Problèmes P2 → Phase 3

| ID audit | Phase | Action du plan |
|----------|-------|---------------|
| V-05 | 2 | Titre complet dans header refactorisé |
| V-06 | 3 | Hiérarchie typographique |
| V-07 | 2 | Description hero > 60 caractères |
| V-09 | 3 | Tags enrichis |
| V-11 | 2 | Gradient hero renforcé |
| V-14 | 2 | Signature visuelle du header |
| V-15 | 3 | Footer mobile |
| U-05 | 3 | Feedback visuel sticky |
| U-06 | 3 | Padding-bottom corrigé |
| U-13 | 3 | Options de tri enrichies |
| U-18 | 3 | Évaluation cache hors-ligne |
| N-03 | — | Conservé (mécanisme d'échappement vers desktop) |
| N-08 | — | Bas priorité, conservé |
| N-09 | 3 | Détection tactile |
| N-10 | 1 | Bouton retour dans `MobileDetailComponent` |
| N-12 | 3 | Guard desktop → `/mobile` |
| A-07 | 3 | Rich-text contraint |
| A-08 | 1 | Touch-targets dans `MobileFeedCardComponent` |
| A-15 | 3 | Debounce resize |

---

*Document de plan — aucun code, aucune implémentation. Phase 0 à valider avant toute exécution.*
