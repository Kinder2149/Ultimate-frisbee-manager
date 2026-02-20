# ARCHITECTURE MOBILE — Ultimate Frisbee Manager

**Statut** : REFERENCE  
**Version** : 1.0  
**Date** : 2026-02-10  
**Auteur** : Équipe technique Ultimate Frisbee Manager

---

## 1. VISION

La vue mobile est une **vue dédiée, autonome et indépendante du desktop**. Elle n'est pas une adaptation responsive. Elle a ses propres composants, son propre routing, ses propres styles, sa propre logique d'état.

**Objectif** : Permettre aux coaches et joueurs de consulter rapidement leurs contenus (exercices, entraînements, échauffements, situations) depuis un téléphone, en extérieur, entre deux séances.

---

## 2. PRINCIPES ARCHITECTURAUX

| # | Principe | Conséquence |
|---|----------|-------------|
| 1 | Mobile ≠ desktop responsive | Deux mondes séparés. Aucun fichier de style ne cible les deux à la fois. |
| 2 | Pas de composant desktop en mobile | Aucun import depuis `features/exercices/`, `features/entrainements/`, etc. |
| 3 | Pas de redirection mobile → desktop | Aucun `router.navigate` vers une route protégée par `MobileGuard`. |
| 4 | Lisibilité > exhaustivité | La vue mobile n'a pas besoin de tout faire. Elle fait peu, mais bien. |

---

## 3. ROUTING

```
/mobile                           ← Layout mobile (header fixe + <router-outlet>)
  ├── (default: '')               ← Page d'accueil mobile (feed)
  └── detail/:type/:id            ← Vue détail d'un item
```

**Implémentation** :
- Fichier : `features/mobile/mobile.routes.ts`
- Layout parent : `MobileLayoutComponent`
- Children : `MobileHomeComponent` (feed), `MobileDetailComponent` (détail)
- Lazy loading : Oui (loadComponent)

---

## 4. STRUCTURE DE FICHIERS

```
features/mobile/
├── mobile.routes.ts                      ← Routing mobile
├── mobile-layout.component.ts/html/scss  ← Layout (header + outlet)
├── models/
│   └── content-item.model.ts             ← Modèle ContentItem UNIFIÉ
├── services/
│   ├── mobile-data.service.ts            ← Agrégation des données
│   ├── mobile-state.service.ts           ← Gestion d'état (Signals)
│   └── mobile-filters.service.ts         ← Logique de filtrage
├── pages/
│   ├── mobile-home/                      ← Page feed
│   └── mobile-detail/                    ← Page détail
└── components/
    ├── mobile-header/                    ← Header fixe
    ├── mobile-filter-bar/                ← Barre de filtres
    ├── mobile-feed-card/                 ← Carte unifiée
    ├── mobile-confirm-dialog/            ← Confirmation mobile
    ├── mobile-terrain-toggle/            ← Toggle mode terrain
    ├── content-feed/                     ← Feed scrollable
    └── hero-contextuel/                  ← Hero contextuel (optionnel)
```

---

## 5. MODÈLE DE DONNÉES

**Modèle unique** : `ContentItem` (défini dans `features/mobile/models/content-item.model.ts`)

```typescript
export interface ContentItem {
  id: string;
  type: 'exercice' | 'entrainement' | 'echauffement' | 'situation';
  title: string;
  description?: string;
  createdAt: Date;
  tags?: Tag[];
  imageUrl?: string;
  duree?: number;
  nombreBlocs?: number;
  originalData: Exercice | Entrainement | Echauffement | SituationMatch;
}
```

**Types associés** :
```typescript
export type CategoryType = 'all' | 'exercice' | 'entrainement' | 'echauffement' | 'situation';
export type SortOrder = 'recent' | 'old';
```

**Transformation** : Les services core (ExerciceService, EntrainementService, etc.) retournent des modèles spécifiques. Le `MobileDataService` les transforme en `ContentItem[]` unifiés.

---

## 6. SERVICES

### MobileDataService
**Responsabilité** : Agrégation des données depuis les 4 services core.

**Méthodes principales** :
- `getAllContent(options?: CacheOptions): Observable<ContentItem[]>`
- `getContentById(type, id, options?): Observable<ContentItem>`

**Transformation** : Consomme les services core existants (ExerciceService, EntrainementService, EchauffementService, SituationMatchService) et transforme les résultats en `ContentItem[]`.

**Implémentation** :
- Utilise `forkJoin` pour charger les 4 types de contenu en parallèle
- Méthodes de mapping privées : `mapExercice()`, `mapEntrainement()`, `mapEchauffement()`, `mapSituation()`
- Pas d'endpoints API mobile dédiés : consomme les API existantes

---

### MobileStateService
**Responsabilité** : Gestion d'état centralisée via Angular Signals.

**État géré** :
- `items: Signal<ContentItem[]>` (tous les items)
- `filteredItems: Signal<ContentItem[]>` (items filtrés, computed)
- `loading: Signal<boolean>`
- `error: Signal<string | null>`
- `activeCategory: Signal<CategoryType>`
- `searchQuery: Signal<string>`
- `sortOrder: Signal<SortOrder>`
- `selectedTags: Signal<Tag[]>`
- `terrainMode: Signal<boolean>`

**Méthodes principales** :
- `loadAllContent(forceRefresh?): void`
- `setCategory(category: CategoryType): void`
- `setSearchQuery(query: string): void`
- `setSortOrder(order: SortOrder): void`
- `addTagFilter(tag: Tag): void`
- `removeTagFilter(tagId: string): void`
- `setTerrainMode(enabled: boolean): void`
- `removeItem(id: string): void`
- `reloadItem(type, id): void`

**Computed Signals** :
- `filteredItems` : Applique les filtres via `MobileFiltersService`
- `categoryCount` : Calcule le nombre d'items par catégorie

---

### MobileFiltersService
**Responsabilité** : Logique de filtrage (méthodes pures, pas d'état interne).

**Méthodes principales** :
- `filterByCategory(items: ContentItem[], category: CategoryType): ContentItem[]`
- `filterBySearch(items: ContentItem[], query: string): ContentItem[]`
- `filterByTags(items: ContentItem[], tags: Tag[]): ContentItem[]`
- `sortItems(items: ContentItem[], order: SortOrder): ContentItem[]`
- `applyAllFilters(items: ContentItem[], filters: FilterState): ContentItem[]`
- `extractUniqueTags(items: ContentItem[]): Tag[]`

**Logique de filtrage** :
- Catégorie : filtre par `item.type` (ou 'all' pour tous)
- Recherche : filtre sur `title` et `description` (case-insensitive)
- Tags : filtre les items contenant au moins un des tags sélectionnés
- Tri : par `createdAt` (récent ou ancien)

---

## 7. STYLES

**Source de vérité** : `shared/styles/mobile-variables.scss`

**Variables principales** :
```scss
// Couleurs par type de contenu
$mobile-exercice-color: #3498db;
$mobile-entrainement-color: #2ecc71;
$mobile-echauffement-color: #FF9800;
$mobile-situation-color: #4CAF50;

// Touch targets (WCAG / Apple HIG)
$mobile-touch-target: 44px;

// Espacements
$mobile-spacing-xs: 4px;
$mobile-spacing-sm: 8px;
$mobile-spacing-md: 12px;
$mobile-spacing-lg: 16px;
$mobile-spacing-xl: 24px;

// Typographie
$mobile-font-size-title: 1.1rem;
$mobile-font-size-body: 0.95rem;
$mobile-font-size-meta: 0.85rem;
$mobile-font-size-small: 0.75rem;

// Header
$mobile-header-height: 56px;
$mobile-header-bg: #2c3e50;
```

**Map des couleurs par type** :
```scss
$mobile-type-colors: (
  'exercice': $mobile-exercice-color,
  'entrainement': $mobile-entrainement-color,
  'echauffement': $mobile-echauffement-color,
  'situation': $mobile-situation-color,
);
```

**Règle** : Aucune couleur hardcodée dans les composants mobile. Toutes les couleurs passent par `mobile-variables.scss`.

---

## 8. SÉPARATION MOBILE / DESKTOP

**Fichier de confusion historique** : `shared/styles/mobile-optimizations.scss` (1072 lignes)

**Clarification** : Ce fichier concerne le **desktop responsive** (nav en bulles, bottom-sheets sur petits écrans desktop). Il ne concerne PAS la vue mobile dédiée.

**Vue mobile dédiée** : Tout ce qui est dans `features/mobile/`.

**Règle** : Aucun composant desktop n'est importé en mobile. Aucun composant mobile n'est importé en desktop.

**Vérification** :
```bash
# Aucun import desktop dans mobile
grep -r "features/exercices\|features/entrainements\|features/echauffements\|features/situations" features/mobile/

# Résultat attendu : aucune correspondance
```

---

## 9. NAVIGATION & ACTIONS

### Navigation
- **Feed → Détail** : `router.navigate(['/mobile/detail', item.type, item.id])`
- **Détail → Feed** : `router.navigate(['/mobile'])`
- **Bouton retour** : Présent dans `MobileDetailComponent`

### Actions CRUD
- **Voir** : Navigation vers `/mobile/detail/:type/:id`
- **Éditer** : Désactivé en mobile (snackbar "Édition non disponible en mobile")
- **Dupliquer** : Appel au service core correspondant
  - Exercice : `exerciceService.duplicateExercice(id)`
  - Entraînement : `entrainementService.duplicateEntrainement(id)`
  - Échauffement : `echauffementService.duplicateEchauffement(id)`
  - Situation : `situationMatchService.duplicateSituationMatch(id)`
- **Supprimer** : Confirmation via `MobileConfirmDialogComponent`, puis appel au service core
  - Exercice : `exerciceService.deleteExercice(id)`
  - Entraînement : `entrainementService.deleteEntrainement(id)`
  - Échauffement : `echauffementService.deleteEchauffement(id)`
  - Situation : `situationMatchService.deleteSituationMatch(id)`

### Recherche
- **Implémentation** : Recherche inline dans le header
- **Debounce** : 300ms
- **Champ** : `MobileHeaderComponent.searchQuery`
- **Propagation** : Événement `searchChange` → `MobileHomeComponent` → `MobileStateService.setSearchQuery()`

### Filtrage
- **Catégories** : All, Exercice, Entraînement, Échauffement, Situation
- **Tags** : Filtrage par tags disponible (non implémenté en UI Phase 1-2)
- **Tri** : Récent / Ancien

### Mode terrain
- **Toggle** : `MobileTerrainToggleComponent` (FAB en bas à droite)
- **État** : `MobileStateService.terrainMode`
- **Effet** : Classe CSS conditionnelle (cartes compactes, actions simplifiées)

---

## 10. ÉVOLUTIONS FUTURES

**Hors périmètre actuel** :
- Édition mobile complète
- Administration mobile
- Gestion des tags avancée
- Profil utilisateur mobile
- PWA / installation mobile
- Mode hors-ligne / cache
- Notifications push
- Scroll infini / virtualisation
- Filtrage avancé par tags (UI)

**Principe** : La vue mobile est d'abord une vue de **consultation**. Toute fonctionnalité de gestion, configuration ou administration reste sur desktop.

---

## ANNEXE — COMPOSANTS PRINCIPAUX

### MobileLayoutComponent
- **Rôle** : Layout shell (header + router-outlet)
- **Responsabilités** : Gestion du resize listener, détection desktop, menu utilisateur
- **Template** : Header fixe + `<router-outlet>`

### MobileHomeComponent
- **Rôle** : Page d'accueil mobile (feed)
- **Responsabilités** : Affichage du feed, gestion des actions CRUD, filtrage
- **Services** : `MobileStateService`, `MobileDataService`, `MobileFiltersService`
- **Change Detection** : OnPush

### MobileDetailComponent
- **Rôle** : Page de détail d'un item
- **Responsabilités** : Affichage des détails, actions (dupliquer, supprimer), bouton retour
- **Routing** : `/mobile/detail/:type/:id`
- **Change Detection** : OnPush

### MobileHeaderComponent
- **Rôle** : Header fixe mobile
- **Responsabilités** : Recherche inline, menu utilisateur, navigation desktop
- **Titre** : "Ultimate Frisbee Manager"
- **Gradient** : `linear-gradient(135deg, #3498db 0%, #2980b9 100%)`

### MobileFeedCardComponent
- **Rôle** : Carte unifiée pour tous les types de contenu
- **Responsabilités** : Affichage compact, menu contextuel (⋮), touch-targets ≥ 44px
- **Inputs** : `item: ContentItem`, `duplicating: boolean`
- **Outputs** : `cardClick`, `viewClick`, `duplicateClick`, `deleteClick`

### MobileFilterBarComponent
- **Rôle** : Barre de filtres (catégories + tri)
- **Responsabilités** : Sélection catégorie, tri, indicateur de scroll
- **Position** : Sticky (top: 56px)
- **Touch-targets** : ≥ 44px

### MobileConfirmDialogComponent
- **Rôle** : Dialog de confirmation mobile
- **Responsabilités** : Remplace `confirm()` natif
- **Position** : Bottom sheet (bottom: 0)
- **Inputs** : `title`, `message`, `confirmLabel`, `cancelLabel`, `confirmColor`

### MobileTerrainToggleComponent
- **Rôle** : FAB mode terrain
- **Responsabilités** : Toggle du mode terrain
- **Position** : Fixe (bottom-right)
- **Output** : `terrainModeChange`

---

**FIN DU DOCUMENT**
