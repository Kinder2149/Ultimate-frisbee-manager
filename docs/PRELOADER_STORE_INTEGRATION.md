# PRELOADER → STORE INTEGRATION - DOCUMENTATION

**Date d'intégration** : 1er février 2026  
**Statut** : ✅ **CONNECTÉ** - Preloader alimente le Store

---

## 🎯 OBJECTIF

Connecter le `WorkspacePreloaderService` existant au `WorkspaceDataStore` pour garantir :
- 1 seul chargement initial des données workspace
- Alimentation automatique du Store après préchargement
- Gestion d'erreur centralisée
- Logging clair pour debugging

---

## 📋 ANALYSE DES APPELS BULK EXISTANTS

### Endpoint principal identifié

**URL** : `GET /workspaces/{workspaceId}/preload`

**Méthode** : `WorkspacePreloaderService.preloadFromBulkEndpoint(workspaceId: string)`

**Données retournées** :
```typescript
interface WorkspaceData {
  exercices: Exercice[];
  entrainements: any[];
  echauffements: any[];
  situations: any[];
  tags: Tag[];
  stats: {
    totalExercices: number;
    totalEntrainements: number;
    totalEchauffements: number;
    totalSituations: number;
    totalTags: number;
  };
}
```

### Flux de préchargement existant

```
1. SelectWorkspaceComponent.selectWorkspace(ws)
   ↓
2. Vérification cache completeness
   ↓
3. Si < 80% : PreloadDialogComponent affiché
   ↓
4. WorkspacePreloaderService.smartPreload(ws.id)
   ↓
5. WorkspacePreloaderService.preloadFromBulkEndpoint(ws.id)
   ↓
6. GET /workspaces/{id}/preload (backend)
   ↓
7. Sauvegarde dans DataCacheService (Memory + IndexedDB)
   ↓
8. Navigation vers dashboard
```

---

## 🔧 MODIFICATIONS APPORTÉES

### 1. Injection du WorkspaceDataStore

**Fichier** : `workspace-preloader.service.ts`

**Avant** :
```typescript
constructor(
  private http: HttpClient,
  private indexedDb: IndexedDbService,
  private cache: DataCacheService
) {}
```

**Après** :
```typescript
constructor(
  private http: HttpClient,
  private indexedDb: IndexedDbService,
  private cache: DataCacheService,
  private workspaceDataStore: WorkspaceDataStore  // 🆕 AJOUTÉ
) {}
```

---

### 2. Alimentation du Store après chargement bulk

**Méthode modifiée** : `preloadFromBulkEndpoint(workspaceId: string)`

**Ajouts** :

#### A. Marquage du Store en chargement (début)
```typescript
// ✅ Marquer le Store comme en chargement
this.workspaceDataStore.setLoading(true);
this.workspaceDataStore.setError(null);
```

#### B. Logging des données reçues
```typescript
tap(data => {
  console.log('[WorkspacePreloader] Bulk data received from backend:', {
    exercices: data.exercices?.length || 0,
    entrainements: data.entrainements?.length || 0,
    echauffements: data.echauffements?.length || 0,
    situations: data.situations?.length || 0,
    tags: data.tags?.length || 0
  });
  // ...
})
```

#### C. Alimentation du Store (après mise en cache)
```typescript
tap(() => {
  console.log('[WorkspacePreloader] All data cached successfully');
  
  // 🆕 NOUVEAU : Alimenter le WorkspaceDataStore
  console.log('[WorkspacePreloader] Feeding WorkspaceDataStore...');
  this.workspaceDataStore.loadWorkspaceData({
    exercices: data.exercices || [],
    entrainements: data.entrainements || [],
    echauffements: data.echauffements || [],
    situations: data.situations || [],
    tags: data.tags || []
  });
  console.log('[WorkspacePreloader] WorkspaceDataStore updated successfully');
})
```

#### D. Marquage du Store comme chargé (succès)
```typescript
tap(() => {
  // ✅ Émettre la progression finale APRÈS que le cache soit complet
  this.progressSubject.next({
    current: 6,
    total: 6,
    percentage: 100,
    currentTask: 'Préchargement terminé',
    completed: true
  });
  
  // ✅ Marquer le Store comme chargé
  this.workspaceDataStore.setLoading(false);
})
```

#### E. Gestion d'erreur centralisée
```typescript
catchError(error => {
  console.error('[WorkspacePreloader] Error with bulk endpoint:', error);
  
  // 🆕 NOUVEAU : Gestion d'erreur centralisée dans le Store
  const errorMessage = error?.error?.message || error?.message || 'Erreur lors du préchargement';
  this.workspaceDataStore.setError(errorMessage);
  this.workspaceDataStore.setLoading(false);
  
  // Fallback vers le préchargement individuel
  console.log('[WorkspacePreloader] Falling back to individual loading');
  throw error;
})
```

---

## 📊 MAPPING DES DONNÉES

### Données injectées dans le Store

| Donnée backend | Type | Méthode Store | BehaviorSubject mis à jour |
|----------------|------|---------------|----------------------------|
| `data.exercices` | `Exercice[]` | `loadWorkspaceData()` | `exercices$` |
| `data.entrainements` | `any[]` | `loadWorkspaceData()` | `entrainements$` |
| `data.echauffements` | `any[]` | `loadWorkspaceData()` | `echauffements$` |
| `data.situations` | `any[]` | `loadWorkspaceData()` | `situations$` |
| `data.tags` | `Tag[]` | `loadWorkspaceData()` | `tags$` |

### Données calculées automatiquement

| Donnée | Calcul | BehaviorSubject |
|--------|--------|-----------------|
| `exercicesCount` | `exercices.length` | `stats$` |
| `entrainementsCount` | `entrainements.length` | `stats$` |
| `echauffementsCount` | `echauffements.length` | `stats$` |
| `situationsCount` | `situations.length` | `stats$` |
| `tagsCount` | `tags.length` | `stats$` |
| `recentActivity` | Items créés < 7 jours | `stats$` |

**Note** : Les stats backend (`data.stats`) ne sont PAS injectées dans le Store. Le Store calcule ses propres stats localement.

---

## 🔄 FLUX DE DONNÉES MIS À JOUR

```
┌─────────────────────────────────────────────────────────────┐
│ 1. SelectWorkspaceComponent.selectWorkspace(ws)             │
│    └─> Vérification cache completeness                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. WorkspacePreloaderService.smartPreload(ws.id)            │
│    └─> WorkspacePreloaderService.preloadFromBulkEndpoint()  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. WorkspaceDataStore.setLoading(true)                      │
│    WorkspaceDataStore.setError(null)                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. GET /workspaces/{id}/preload (Backend PostgreSQL)        │
│    └─> Retourne WorkspaceData                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Logging des données reçues                               │
│    console.log('[WorkspacePreloader] Bulk data received')   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Sauvegarde dans DataCacheService                         │
│    ├─> Memory Cache (Map)                                   │
│    └─> IndexedDB (persistance)                              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. 🆕 Alimentation du WorkspaceDataStore                    │
│    └─> workspaceDataStore.loadWorkspaceData(data)           │
│        ├─> exercices$ émet                                   │
│        ├─> entrainements$ émet                               │
│        ├─> echauffements$ émet                               │
│        ├─> situations$ émet                                  │
│        ├─> tags$ émet                                        │
│        └─> stats$ recalculé et émet                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. WorkspaceDataStore.setLoading(false)                     │
│    Progression 100% émise                                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 9. Navigation vers dashboard                                 │
│    └─> Composants peuvent s'abonner au Store (futur)        │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ GARANTIES RESPECTÉES

### 1. Un seul chargement initial

- ✅ `preloadFromBulkEndpoint()` appelle le backend **une seule fois**
- ✅ Données sauvegardées dans DataCacheService (Memory + IndexedDB)
- ✅ Données injectées dans WorkspaceDataStore
- ✅ Pas de duplication d'appels

### 2. Gestion d'erreur centralisée

**En cas d'erreur backend** :
```typescript
catchError(error => {
  // ✅ Erreur loggée
  console.error('[WorkspacePreloader] Error with bulk endpoint:', error);
  
  // ✅ Store notifié de l'erreur
  this.workspaceDataStore.setError(errorMessage);
  this.workspaceDataStore.setLoading(false);
  
  // ✅ Fallback vers préchargement individuel
  throw error;
})
```

**États du Store** :
- `loading$` : `true` pendant le chargement, `false` après succès/erreur
- `error$` : `null` si succès, message d'erreur sinon

### 3. Logging clair

**Logs ajoutés** :
```
[WorkspacePreloader] Using bulk endpoint for workspace: {id}
[WorkspacePreloader] Bulk data received from backend: { exercices: 12, ... }
[WorkspacePreloader] All data cached successfully
[WorkspacePreloader] Feeding WorkspaceDataStore...
[WorkspacePreloader] WorkspaceDataStore updated successfully
```

**En cas d'erreur** :
```
[WorkspacePreloader] Error with bulk endpoint: {error}
[WorkspacePreloader] Falling back to individual loading
```

---

## 🚫 CONTRAINTES RESPECTÉES

### ❌ Pas de refactor global

- ✅ Seul `WorkspacePreloaderService` modifié
- ✅ `SelectWorkspaceComponent` inchangé
- ✅ `DataCacheService` inchangé
- ✅ Aucun composant modifié

### ❌ Pas de changement d'API backend

- ✅ Endpoint `/workspaces/{id}/preload` inchangé
- ✅ Format `WorkspaceData` inchangé
- ✅ Aucune modification backend requise

### ✅ Logging clair

- ✅ 5 nouveaux logs ajoutés
- ✅ Logs structurés avec préfixe `[WorkspacePreloader]`
- ✅ Logs détaillés des données reçues

---

## 📝 COMPOSANTS NON MODIFIÉS

Comme demandé, **aucun composant ne consomme encore le Store** :

- ❌ `DashboardComponent` : N'utilise PAS encore `workspaceDataStore.stats$`
- ❌ `ExerciceListComponent` : N'utilise PAS encore `workspaceDataStore.exercices$`
- ❌ `EntrainementListComponent` : N'utilise PAS encore `workspaceDataStore.entrainements$`
- ❌ `EchauffementListComponent` : N'utilise PAS encore `workspaceDataStore.echauffements$`
- ❌ `SituationMatchListComponent` : N'utilise PAS encore `workspaceDataStore.situations$`

**Le Store est alimenté mais dormant**, prêt pour les prochaines étapes d'intégration.

---

## 🧪 TESTS DE VALIDATION

### Test 1 : Préchargement initial

**Scénario** :
1. Utilisateur sélectionne un workspace
2. Cache < 80%
3. Dialog de préchargement affiché
4. Préchargement bulk lancé

**Résultat attendu** :
- ✅ `GET /workspaces/{id}/preload` appelé une seule fois
- ✅ Logs affichés dans la console
- ✅ `workspaceDataStore.loading$` émet `true` puis `false`
- ✅ `workspaceDataStore.exercices$` émet les données
- ✅ `workspaceDataStore.stats$` émet les stats calculées

### Test 2 : Gestion d'erreur

**Scénario** :
1. Backend retourne une erreur 500
2. Préchargement bulk échoue

**Résultat attendu** :
- ✅ `workspaceDataStore.error$` émet le message d'erreur
- ✅ `workspaceDataStore.loading$` émet `false`
- ✅ Fallback vers préchargement individuel
- ✅ Log d'erreur affiché

### Test 3 : Données vides

**Scénario** :
1. Backend retourne des tableaux vides
2. Workspace sans données

**Résultat attendu** :
- ✅ `workspaceDataStore.exercices$` émet `[]`
- ✅ `workspaceDataStore.stats$` émet `{ exercicesCount: 0, ... }`
- ✅ Pas d'erreur

---

## 📊 DIAGRAMME DE FLUX DÉTAILLÉ

```
┌──────────────────────────────────────────────────────────────────┐
│                    BACKEND (PostgreSQL)                           │
│                  Source de vérité ABSOLUE                         │
└──────────────────────────────────────────────────────────────────┘
                            ↓ GET /workspaces/{id}/preload
┌──────────────────────────────────────────────────────────────────┐
│              WorkspacePreloaderService                            │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ preloadFromBulkEndpoint(workspaceId)                       │  │
│  │  1. setLoading(true) + setError(null)                     │  │
│  │  2. GET /workspaces/{id}/preload                          │  │
│  │  3. Log données reçues                                    │  │
│  │  4. Sauvegarder dans DataCacheService                     │  │
│  │  5. 🆕 Alimenter WorkspaceDataStore                       │  │
│  │  6. setLoading(false)                                     │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                            ↓ loadWorkspaceData(data)
┌──────────────────────────────────────────────────────────────────┐
│              WorkspaceDataStore (CACHE FRONTEND)                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ loadWorkspaceData(data)                                    │  │
│  │  1. exercicesSubject.next(data.exercices)                 │  │
│  │  2. entrainementsSubject.next(data.entrainements)         │  │
│  │  3. echauffementsSubject.next(data.echauffements)         │  │
│  │  4. situationsSubject.next(data.situations)               │  │
│  │  5. tagsSubject.next(data.tags)                           │  │
│  │  6. recalculateStats() → statsSubject.next(...)          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  BehaviorSubjects prêts à émettre :                               │
│  • exercices$ ✅                                                  │
│  • entrainements$ ✅                                              │
│  • echauffements$ ✅                                              │
│  • situations$ ✅                                                 │
│  • tags$ ✅                                                       │
│  • stats$ ✅ (calculé localement)                                 │
│  • loading$ ✅                                                    │
│  • error$ ✅                                                      │
└──────────────────────────────────────────────────────────────────┘
                            ↓ subscribe (futur)
        ┌───────────────────┼───────────────────┐
        ↓                   ↓                   ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Dashboard   │  │ Exercice     │  │ Entrainement │
│  (NON        │  │ List         │  │ List         │
│  CONNECTÉ)   │  │ (NON         │  │ (NON         │
│              │  │ CONNECTÉ)    │  │ CONNECTÉ)    │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## 🎯 PROCHAINES ÉTAPES (NON IMPLÉMENTÉES)

1. **ÉTAPE 3** : Migrer Dashboard vers le Store
   - Remplacer `dashboardService.getStats()` par `workspaceDataStore.stats$`
   
2. **ÉTAPE 4** : Migrer listes vers le Store
   - Remplacer `exerciceService.getExercices()` par `workspaceDataStore.exercices$`
   - Idem pour entrainements, échauffements, situations

3. **ÉTAPE 5** : Ajuster TTL du cache
   - Passer de 5min à 30min pour données métier

4. **ÉTAPE 6** : Améliorer UX des indicateurs
   - Badge discret pendant refresh

5. **ÉTAPE 7** : Tests d'intégration
   - Validation complète du flux

---

## ✅ VALIDATION FINALE

**Critères de validation** :
- [x] WorkspacePreloader injecte WorkspaceDataStore
- [x] Méthode `preloadFromBulkEndpoint()` alimente le Store
- [x] Un seul appel backend par préchargement
- [x] Gestion d'erreur centralisée dans le Store
- [x] Logging clair et structuré
- [x] Aucun composant ne consomme encore le Store
- [x] Aucun changement d'API backend
- [x] Aucun refactor global

**Statut** : ✅ **ÉTAPE 2 COMPLÉTÉE** - Preloader connecté au Store
