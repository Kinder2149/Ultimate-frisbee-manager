# PHASE 2 — PLAN D'EXÉCUTION DÉTAILLÉ
## REFONTE UX & LISIBILITÉ (P1)

**Date de création** : 10 février 2026  
**Statut** : EN ATTENTE DE VALIDATION  
**Prérequis** : Phase 1 validée et compilée avec succès

---

## 1. OBJECTIF PHASE 2

Améliorer l'expérience utilisateur mobile en :
- Unifiant la cohérence visuelle (couleurs, typographie)
- Centralisant l'état et les données via services dédiés
- Intégrant les composants orphelins fonctionnels
- Supprimant le code mort
- Améliorant les performances (scroll infini, filtrage avancé)
- Enrichissant les fonctionnalités UX (mode terrain, filtres tags)

**Contraintes strictes** :
- ❌ Aucune modification backend
- ❌ Aucune régression de la Phase 1
- ❌ Aucune anticipation de la Phase 3
- ✅ Compilation réussie à chaque étape
- ✅ Vue desktop intacte

---

## 2. ARCHITECTURE CIBLE PHASE 2

```
features/mobile/
├── services/
│   ├── mobile-data.service.ts          [NOUVEAU] Agrégation des 4 services core
│   ├── mobile-state.service.ts         [NOUVEAU] État centralisé (Signals)
│   └── mobile-filters.service.ts       [NOUVEAU] Logique de filtrage avancé
├── models/
│   └── content-item.model.ts           [CONSOLIDÉ] Modèle unique unifié
├── components/
│   ├── mobile-header/                  [REFACTORÉ] Recherche inline + gradient
│   ├── mobile-filter-bar/              [REFACTORÉ] Tags + touch-targets + scroll
│   ├── mobile-terrain-toggle/          [NOUVEAU] FAB mode terrain
│   └── [autres composants Phase 1]
└── pages/
    ├── mobile-home/                    [REFACTORÉ] Utilise les nouveaux services
    └── mobile-detail/                  [REFACTORÉ] Utilise MobileDataService
```

---

## 3. PLAN D'ACTIONS STRUCTURÉ

### BLOC A — CONSOLIDATION MODÈLE & SERVICES (Étapes 1-4)

#### Étape 1 : Consolider le modèle ContentItem
**Objectif** : Un seul modèle `ContentItem` unifié dans `features/mobile/models/`

**Fichiers concernés** :
- `features/mobile/models/content-item.model.ts` (existant Phase 1)
- `core/models/mobile-content.model.ts` (doublon à supprimer)

**Actions** :
1. Vérifier si `core/models/mobile-content.model.ts` existe
2. Si oui, comparer avec le modèle Phase 1
3. Fusionner les propriétés manquantes (si pertinentes)
4. Mettre à jour tous les imports vers le modèle Phase 1
5. Supprimer `core/models/mobile-content.model.ts`

**Validation** :
- `grep -r "core/models/mobile-content" frontend/src/` → aucun résultat
- Compilation réussie

---

#### Étape 2 : Créer MobileDataService
**Objectif** : Service d'agrégation des données unifié

**Fichier** : `features/mobile/services/mobile-data.service.ts`

**Responsabilités** :
- Injecter les 4 services core (Exercice, Entrainement, Echauffement, SituationMatch)
- Exposer `getAllContent(): Observable<ContentItem[]>`
- Exposer `getContentById(type, id): Observable<ContentItem>`
- Transformer les modèles core → `ContentItem`
- Gérer le cache (déléguer aux services core)

**Inspiration** : Orphelin `MobileContentService` (sans endpoints `/mobile/*`)

**Validation** :
- Service injectable
- Méthodes retournent des `ContentItem[]`
- Compilation réussie

---

#### Étape 3 : Créer MobileStateService
**Objectif** : Gestion d'état centralisée via Signals

**Fichier** : `features/mobile/services/mobile-state.service.ts`

**État géré** :
```typescript
{
  items: Signal<ContentItem[]>
  filteredItems: Signal<ContentItem[]>
  loading: Signal<boolean>
  error: Signal<string | null>
  activeCategory: WritableSignal<CategoryType>
  searchQuery: WritableSignal<string>
  sortOrder: WritableSignal<SortOrder>
  selectedTags: WritableSignal<Tag[]>
  terrainMode: WritableSignal<boolean>
}
```

**Méthodes** :
- `loadAllContent()`
- `setCategory(category: CategoryType)`
- `setSearchQuery(query: string)`
- `setSortOrder(order: SortOrder)`
- `toggleTerrainMode()`
- `addTagFilter(tag: Tag)`
- `removeTagFilter(tag: Tag)`

**Inspiration** : Orphelin `MobileContentStateService`

**Validation** :
- Signals exposés en lecture seule
- WritableSignals pour les actions utilisateur
- Compilation réussie

---

#### Étape 4 : Créer MobileFiltersService
**Objectif** : Logique de filtrage avancé

**Fichier** : `features/mobile/services/mobile-filters.service.ts`

**Méthodes** :
```typescript
filterByCategory(items: ContentItem[], category: CategoryType): ContentItem[]
filterBySearch(items: ContentItem[], query: string): ContentItem[]
filterByTags(items: ContentItem[], tags: Tag[]): ContentItem[]
sortItems(items: ContentItem[], order: SortOrder): ContentItem[]
applyAllFilters(items: ContentItem[], filters: FilterState): ContentItem[]
```

**Inspiration** : Orphelin `FiltersService`

**Validation** :
- Méthodes pures (pas d'état interne)
- Tests unitaires possibles
- Compilation réussie

---

### BLOC B — REFACTORING COMPOSANTS (Étapes 5-8)

#### Étape 5 : Refactoriser MobileHeaderComponent
**Objectif** : Recherche inline + gradient desktop + nom complet

**Fichiers** :
- `features/mobile/components/mobile-header/mobile-header.component.ts`
- `features/mobile/components/mobile-header/mobile-header.component.html`
- `features/mobile/components/mobile-header/mobile-header.component.scss`

**Modifications** :
1. **Nom complet** : "Ultimate Frisbee Manager" (pas "UFM")
2. **Gradient** : `linear-gradient(135deg, #2c3e50 0%, #34495e 100%)` + bordure bleue `#3498db`
3. **Recherche inline** : Intégrer un bouton search qui toggle `MobileSearchBarComponent`
4. **Output** : `@Output() searchToggle = new EventEmitter<void>()`

**Problèmes résolus** : V-05, V-14, N-01

**Validation** :
- Header affiche "Ultimate Frisbee Manager"
- Gradient appliqué
- Bouton search présent
- Compilation réussie

---

#### Étape 6 : Refactoriser MobileFilterBarComponent
**Objectif** : Touch-targets ≥ 44px + filtrage tags + indicateur scroll

**Fichiers** :
- `features/mobile/components/mobile-filter-bar/mobile-filter-bar.component.ts`
- `features/mobile/components/mobile-filter-bar/mobile-filter-bar.component.html`
- `features/mobile/components/mobile-filter-bar/mobile-filter-bar.component.scss`

**Modifications** :
1. **Touch-targets** : Tous les boutons ≥ 44px (variable `$mobile-touch-target`)
2. **Filtrage tags** : Ajouter un bouton "Filtres" qui ouvre un bottom-sheet avec sélection de tags
3. **Indicateur scroll** : Ombre gauche/droite si le scroll horizontal est actif
4. **Inputs** : `@Input() selectedTags: Tag[] = []`
5. **Outputs** : `@Output() tagFilterChange = new EventEmitter<Tag[]>()`

**Problèmes résolus** : U-04, U-12

**Validation** :
- Boutons ≥ 44px
- Bouton "Filtres" présent
- Ombres de scroll visibles
- Compilation réussie

---

#### Étape 7 : Créer MobileTerrainToggleComponent
**Objectif** : FAB mode terrain (cartes compactes, focus consultation)

**Fichiers** :
- `features/mobile/components/mobile-terrain-toggle/mobile-terrain-toggle.component.ts`
- `features/mobile/components/mobile-terrain-toggle/mobile-terrain-toggle.component.html`
- `features/mobile/components/mobile-terrain-toggle/mobile-terrain-toggle.component.scss`

**Fonctionnalités** :
- FAB fixe en bas à droite
- Icône : `sports` (ballon) ou `visibility` (œil)
- Toggle du mode terrain
- Émet `@Output() terrainModeChange = new EventEmitter<boolean>()`

**Inspiration** : Orphelin `TerrainModeToggleComponent` (sans `document.body.classList`)

**Approche Angular** :
- Le composant émet l'événement
- Le parent (`MobileLayoutComponent`) applique une classe CSS conditionnelle sur le container

**Validation** :
- FAB visible en bas à droite
- Toggle fonctionnel
- Pas de manipulation DOM directe
- Compilation réussie

---

#### Étape 8 : Refactoriser MobileHomeComponent (intégration services)
**Objectif** : Utiliser `MobileStateService` au lieu de la logique locale

**Fichier** : `features/mobile/pages/mobile-home/mobile-home.component.ts`

**Modifications** :
1. Injecter `MobileStateService`
2. Remplacer les propriétés locales par des Signals du service
3. Supprimer `loadAllData()`, `applyFilters()`, `calculateCategoryCount()`
4. Déléguer au service : `onCategoryChange()` → `stateService.setCategory()`
5. Template : utiliser les Signals directement (`stateService.filteredItems()`)

**Problèmes résolus** : A-13, A-14 (OnPush + ChangeDetectorRef)

**Validation** :
- Aucune logique métier dans le composant
- Signals utilisés dans le template
- Compilation réussie
- Feed fonctionne comme en Phase 1

---

### BLOC C — ALIGNEMENT VISUEL (Étapes 9-10)

#### Étape 9 : Aligner toutes les couleurs sur mobile-variables.scss
**Objectif** : Une seule valeur par type de contenu, partout

**Fichiers concernés** :
- Tous les `.ts` et `.scss` dans `features/mobile/`

**Actions** :
1. `grep` des couleurs hardcodées : `#e74c3c`, `#3498db`, `#f39c12`, `#9b59b6`
2. Remplacer par les variables SCSS ou CSS custom properties
3. Vérifier que `mobile-variables.scss` est importé partout

**Problèmes résolus** : V-01, V-02, V-03, V-04, V-13

**Validation** :
- `grep -r "#e74c3c\|#3498db\|#f39c12\|#9b59b6" features/mobile/` → aucun résultat (sauf dans `mobile-variables.scss`)
- Compilation réussie
- Couleurs cohérentes visuellement

---

#### Étape 10 : Corriger OnPush + ChangeDetectorRef
**Objectif** : Pas de getters recalculés dans les templates

**Fichiers** :
- `features/mobile/pages/mobile-home/mobile-home.component.ts`
- `features/mobile/pages/mobile-detail/mobile-detail.component.ts`

**Actions** :
1. Identifier les getters utilisés dans les templates (`get filteredItems()`, `get categoryCount()`)
2. Remplacer par des Signals ou des propriétés calculées une seule fois
3. Supprimer les appels manuels à `markForCheck()` si les Signals sont utilisés

**Problèmes résolus** : A-13, A-14

**Validation** :
- Aucun getter dans les templates
- Signals ou propriétés calculées
- Compilation réussie

---

### BLOC D — NETTOYAGE CODE MORT (Étapes 11-15)

#### Étape 11 : Supprimer MobileAppBarComponent
**Objectif** : Code mort, doublon de `MobileHeaderComponent`

**Fichiers** :
- `shared/components/mobile-app-bar/` (dossier complet)

**Actions** :
1. Vérifier qu'aucun import ne référence ce composant : `grep -r "MobileAppBarComponent" frontend/src/`
2. Supprimer le dossier

**Problèmes résolus** : A-09

**Validation** :
- Dossier supprimé
- Aucune référence dans le code
- Compilation réussie

---

#### Étape 12 : Supprimer ContentSectionsComponent
**Objectif** : Orphelin non intégré, design par sections non retenu

**Fichiers** :
- `shared/components/content-sections/` (dossier complet)

**Actions** :
1. Vérifier qu'aucun import ne référence ce composant
2. Supprimer le dossier

**Problèmes résolus** : A-12

**Validation** :
- Dossier supprimé
- Compilation réussie

---

#### Étape 13 : Supprimer ContentCardComponent
**Objectif** : Orphelin générique, remplacé par `MobileFeedCardComponent`

**Fichiers** :
- `shared/components/content-card/` (dossier complet)

**Actions** :
1. Vérifier qu'aucun import ne référence ce composant
2. Supprimer le dossier

**Problèmes résolus** : A-12

**Validation** :
- Dossier supprimé
- Compilation réussie

---

#### Étape 14 : Supprimer MobilePageComponent (monolithe original)
**Objectif** : Remplacé par `MobileLayoutComponent` + `MobileHomeComponent` en Phase 1

**Fichiers** :
- `features/mobile/pages/mobile-page/` (dossier complet)

**Actions** :
1. Vérifier qu'aucun import ne référence ce composant (le routing a été modifié en Phase 1)
2. Supprimer le dossier

**Validation** :
- Dossier supprimé
- Compilation réussie
- Routing mobile fonctionne

---

#### Étape 15 : Évaluer et supprimer les orphelins restants
**Objectif** : Nettoyer les composants/services orphelins non intégrés

**Orphelins à évaluer** :
- `MobileContentCardComponent` (`shared/components/mobile-content-card/`)
- `ContentCategoriesComponent` (`shared/components/content-categories/`)
- `MobileContentService` (`core/services/mobile-content.service.ts`)
- `MobileContentStateService` (`core/services/mobile-content-state.service.ts`)
- `FiltersService` (`core/services/filters.service.ts`)

**Actions** :
1. Pour chaque orphelin :
   - Si intégré dans les étapes 2-4 → supprimer l'original
   - Si non intégré et non référencé → supprimer
   - Si référencé ailleurs → documenter et conserver (Phase 3)
2. `grep` exhaustif avant chaque suppression

**Validation** :
- Orphelins supprimés ou documentés
- Compilation réussie

---

### BLOC E — AMÉLIORATIONS UX (Étapes 16-18)

#### Étape 16 : Implémenter le scroll infini
**Objectif** : Chargement paginé au lieu de `forkJoin` complet

**Fichiers** :
- `features/mobile/services/mobile-data.service.ts`
- `features/mobile/services/mobile-state.service.ts`
- `features/mobile/pages/mobile-home/mobile-home.component.ts`

**Approche** :
1. **Service** : `getContentPage(page: number, pageSize: number): Observable<ContentItem[]>`
2. **State** : Ajouter `currentPage`, `hasMore`, `loadNextPage()`
3. **Composant** : Directive `IntersectionObserver` sur un élément sentinelle en bas du feed

**Validation** :
- Chargement initial : 20 items
- Scroll en bas → chargement automatique de 20 items suivants
- Pas de duplication
- Compilation réussie

---

#### Étape 17 : Désactiver proprement les menus non fonctionnels
**Objectif** : Masquer ou afficher "bientôt disponible" au lieu de snackbar éphémère

**Fichiers** :
- `features/mobile/components/mobile-header/mobile-header.component.html`
- `features/mobile/components/mobile-header/mobile-header.component.ts`

**Actions** :
1. Identifier les 4 entrées de menu : Profil, Tags, Admin, Paramètres
2. Option A : Masquer avec `*ngIf="false"`
3. Option B : Afficher avec badge "Bientôt" et désactiver le clic

**Validation** :
- Aucun snackbar "en cours de développement"
- État visuel clair
- Compilation réussie

---

#### Étape 18 : Corriger forceDesktop sur mobile physique
**Objectif** : Reset automatique du flag si l'utilisateur revient sur mobile

**Fichier** : `core/services/mobile-detector.service.ts`

**Modifications** :
1. Ajouter une méthode `resetForceDesktopIfMobile()`
2. Vérifier `window.innerWidth < 768` + `navigator.maxTouchPoints > 0`
3. Si vrai → supprimer le flag localStorage
4. Appeler cette méthode dans `ngOnInit` du `MobileLayoutComponent`

**Problèmes résolus** : N-11

**Validation** :
- Sur mobile physique, le flag `forceDesktop` est automatiquement supprimé
- Compilation réussie

---

## 4. DÉPENDANCES ENTRE ÉTAPES

```
Étape 1 (Modèle)
  ↓
Étape 2 (MobileDataService) ← dépend du modèle
  ↓
Étape 3 (MobileStateService) ← dépend de MobileDataService
  ↓
Étape 4 (MobileFiltersService) ← dépend du modèle
  ↓
Étape 8 (Refactor MobileHome) ← dépend des services 2-4
  ↓
Étapes 5-7, 9-10 (Composants) ← peuvent être parallèles
  ↓
Étapes 11-15 (Nettoyage) ← après intégration des services
  ↓
Étapes 16-18 (UX avancée) ← après stabilisation
```

---

## 5. RISQUES & MITIGATIONS

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Incohérence modèle pendant migration | Compilation échoue | Migrer le modèle en premier (Étape 1) |
| Régression feed Phase 1 | Fonctionnalité cassée | Tester après chaque étape du Bloc B |
| Suppression trop agressive | Code référencé supprimé | `grep` exhaustif avant chaque suppression |
| Complexité scroll infini | Bugs de position/duplication | Implémenter pagination d'abord, puis UI |
| OnPush + Signals mal utilisés | Détection de changement cassée | Utiliser Signals partout, pas de getters |

---

## 6. CRITÈRES DE VALIDATION GLOBALE PHASE 2

### Fonctionnels
- ✅ Feed mobile affiche les contenus avec les nouveaux services
- ✅ Filtrage par catégorie fonctionne
- ✅ Recherche inline fonctionne
- ✅ Scroll infini charge les pages suivantes
- ✅ Mode terrain toggle fonctionne
- ✅ Navigation vers détail fonctionne
- ✅ Actions CRUD (dupliquer, supprimer) fonctionnent

### Techniques
- ✅ Compilation réussie (exit code 0)
- ✅ Aucune erreur TypeScript
- ✅ Aucune erreur lint bloquante
- ✅ Aucun import de composant desktop dans mobile
- ✅ Aucune couleur hardcodée (sauf dans `mobile-variables.scss`)
- ✅ Aucun getter recalculé dans les templates
- ✅ Services injectables et testables

### Visuels
- ✅ Couleurs cohérentes (une valeur par type)
- ✅ Header avec gradient desktop + nom complet
- ✅ Touch-targets ≥ 44px
- ✅ Indicateurs de scroll visibles
- ✅ FAB mode terrain visible

### Nettoyage
- ✅ `MobileAppBarComponent` supprimé
- ✅ `ContentSectionsComponent` supprimé
- ✅ `ContentCardComponent` supprimé
- ✅ `MobilePageComponent` supprimé
- ✅ Orphelins intégrés ou supprimés
- ✅ Aucune référence à du code supprimé

---

## 7. LIVRABLES PHASE 2

### Code
- 3 nouveaux services (`MobileDataService`, `MobileStateService`, `MobileFiltersService`)
- 1 nouveau composant (`MobileTerrainToggleComponent`)
- 3 composants refactorés (`MobileHeaderComponent`, `MobileFilterBarComponent`, `MobileHomeComponent`)
- 1 modèle consolidé (`ContentItem`)
- 4+ composants/services orphelins supprimés

### Documentation
- Ce plan d'exécution
- Commentaires dans les services (responsabilités, méthodes publiques)

### Tests
- Compilation réussie
- Validation manuelle du feed, filtres, recherche, scroll infini, mode terrain

---

## 8. CHECK-LIST FINALE AVANT VALIDATION

- [ ] Étape 1 : Modèle consolidé
- [ ] Étape 2 : MobileDataService créé
- [ ] Étape 3 : MobileStateService créé
- [ ] Étape 4 : MobileFiltersService créé
- [ ] Étape 5 : MobileHeaderComponent refactoré
- [ ] Étape 6 : MobileFilterBarComponent refactoré
- [ ] Étape 7 : MobileTerrainToggleComponent créé
- [ ] Étape 8 : MobileHomeComponent refactoré
- [ ] Étape 9 : Couleurs alignées
- [ ] Étape 10 : OnPush corrigé
- [ ] Étape 11 : MobileAppBarComponent supprimé
- [ ] Étape 12 : ContentSectionsComponent supprimé
- [ ] Étape 13 : ContentCardComponent supprimé
- [ ] Étape 14 : MobilePageComponent supprimé
- [ ] Étape 15 : Orphelins évalués/supprimés
- [ ] Étape 16 : Scroll infini implémenté
- [ ] Étape 17 : Menus non fonctionnels désactivés
- [ ] Étape 18 : forceDesktop corrigé
- [ ] Compilation réussie (exit code 0)
- [ ] Aucune régression Phase 1
- [ ] Vue desktop intacte

---

## 9. NOTES D'IMPLÉMENTATION

### Ordre d'exécution recommandé
1. **Bloc A** (Étapes 1-4) : Fondations (modèle + services)
2. **Étape 8** : Refactor MobileHome (intégration services)
3. **Bloc B** (Étapes 5-7, 9-10) : Composants visuels
4. **Bloc D** (Étapes 11-15) : Nettoyage
5. **Bloc E** (Étapes 16-18) : UX avancée

### Compilation intermédiaire
- Compiler après chaque étape du Bloc A
- Compiler après l'Étape 8
- Compiler après le Bloc D
- Compilation finale après le Bloc E

### Rollback
- Si une étape échoue, revenir à l'étape précédente validée
- Conserver les commits Git par étape pour faciliter le rollback

---

**FIN DU PLAN PHASE 2**

**Statut** : ⏸️ EN ATTENTE DE VALIDATION UTILISATEUR

Une fois validé, l'exécution commencera par l'Étape 1.
