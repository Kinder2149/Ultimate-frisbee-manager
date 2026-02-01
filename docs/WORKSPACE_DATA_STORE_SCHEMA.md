# WORKSPACE DATA STORE - SCHÉMA DE RESPONSABILITÉS

**Date de création** : 1er février 2026  
**Fichier** : `frontend/src/app/core/services/workspace-data.store.ts`  
**Statut** : ✅ Créé - Non connecté à l'existant

---

## 🎯 RESPONSABILITÉS EXACTES

### ✅ Ce que le Store FAIT

#### 1. **Synchroniser l'état frontend avec le backend**
- Maintenir une copie locale des données provenant de PostgreSQL
- Exposer ces données via des BehaviorSubjects observables
- **Source** : Backend via API REST (source de vérité absolue)

#### 2. **Partager l'état entre composants**
- Un seul BehaviorSubject par type de donnée
- Tous les composants s'abonnent au même flux
- Évite les appels API redondants

#### 3. **Calculer les stats dashboard localement**
- Compteurs : `exercicesCount`, `entrainementsCount`, etc.
- Activité récente : éléments créés dans les 7 derniers jours
- Détails tags par catégorie
- **Avantage** : Pas de latence réseau, mise à jour instantanée

#### 4. **Fournir un point d'accès unique**
- Getters synchrones : `getExercices()`, `getEntrainements()`, etc.
- Observables asynchrones : `exercices$`, `entrainements$`, etc.
- État de chargement : `loading$`, `error$`

#### 5. **Gérer l'état de chargement global**
- `loading$` : true pendant le chargement initial
- `error$` : message d'erreur ou null
- Réinitialisation via `clear()`

---

### ❌ Ce que le Store NE FAIT PAS

#### 1. **Créer/modifier/supprimer des données**
- ❌ Pas d'appel `POST /exercises`, `PUT /exercises/{id}`, `DELETE /exercises/{id}`
- ✅ Rôle des services métier : `ExerciceService`, `EntrainementService`, etc.

#### 2. **Appeler directement le backend**
- ❌ Pas de `HttpClient` dans le Store
- ✅ Rôle des services métier + `DataCacheService`

#### 3. **Remplacer le backend comme source de vérité**
- ❌ Le Store est un cache frontend synchronisé
- ✅ PostgreSQL (backend) = source de vérité absolue

#### 4. **Fonctionner hors ligne sans backend**
- ❌ Le Store dépend toujours du backend pour les données
- ✅ Mode hors ligne géré par `DataCacheService` (IndexedDB)

#### 5. **Valider les données métier**
- ❌ Pas de validation de règles métier (ex: durée min/max, champs requis)
- ✅ Rôle du backend

#### 6. **Gérer le préchargement**
- ❌ Pas d'appel à `GET /workspaces/{id}/preload`
- ✅ Rôle du `WorkspacePreloaderService`

---

## 📊 ARCHITECTURE

### Flux de données

```
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (PostgreSQL)                      │
│                  Source de vérité ABSOLUE                    │
└─────────────────────────────────────────────────────────────┘
                            ↓ GET /exercises, /trainings, etc.
┌─────────────────────────────────────────────────────────────┐
│                    Services Métier (HTTP)                    │
│  • ExerciceService                                           │
│  • EntrainementService                                       │
│  • EchauffementService                                       │
│  • SituationMatchService                                     │
│  • TagService                                                │
└─────────────────────────────────────────────────────────────┘
                            ↓ Données backend
┌─────────────────────────────────────────────────────────────┐
│                  DataCacheService                            │
│  • Memory Cache (Map)                                        │
│  • IndexedDB (persistance)                                   │
│  • Stale-While-Revalidate                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓ Données cachées
┌─────────────────────────────────────────────────────────────┐
│              WorkspaceDataStore (CACHE FRONTEND)             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ BehaviorSubjects (État observable)                    │  │
│  │  • exercices$: BehaviorSubject<Exercice[]>           │  │
│  │  • entrainements$: BehaviorSubject<Entrainement[]>   │  │
│  │  • echauffements$: BehaviorSubject<Echauffement[]>   │  │
│  │  • situations$: BehaviorSubject<SituationMatch[]>    │  │
│  │  • tags$: BehaviorSubject<Tag[]>                     │  │
│  │  • stats$: BehaviorSubject<DashboardStats> (calculé) │  │
│  │  • loading$: BehaviorSubject<boolean>                │  │
│  │  • error$: BehaviorSubject<string | null>            │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  Méthodes publiques :                                        │
│  • setExercices(data: Exercice[]): void                     │
│  • setEntrainements(data: Entrainement[]): void             │
│  • loadWorkspaceData(data: WorkspaceData): void             │
│  • getExercices(): Exercice[] (getter synchrone)            │
│  • clear(): void                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓ subscribe
        ┌───────────────────┼───────────────────┐
        ↓                   ↓                   ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Dashboard   │  │ Exercice     │  │ Entrainement │
│  Component   │  │ List         │  │ List         │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## 🔧 INTERFACE PUBLIQUE

### BehaviorSubjects (Observables)

| Observable | Type | Description |
|------------|------|-------------|
| `exercices$` | `Observable<Exercice[]>` | Liste des exercices synchronisée avec backend |
| `entrainements$` | `Observable<Entrainement[]>` | Liste des entrainements synchronisée avec backend |
| `echauffements$` | `Observable<Echauffement[]>` | Liste des échauffements synchronisée avec backend |
| `situations$` | `Observable<SituationMatch[]>` | Liste des situations/matchs synchronisée avec backend |
| `tags$` | `Observable<Tag[]>` | Liste des tags synchronisée avec backend |
| `stats$` | `Observable<DashboardStats>` | Stats calculées localement (pas d'appel backend) |
| `loading$` | `Observable<boolean>` | État de chargement global |
| `error$` | `Observable<string \| null>` | Erreur globale ou null |

### Méthodes de mise à jour (Setters)

| Méthode | Paramètres | Description |
|---------|------------|-------------|
| `setExercices()` | `exercices: Exercice[]` | Met à jour la liste des exercices + recalcule stats |
| `setEntrainements()` | `entrainements: Entrainement[]` | Met à jour la liste des entrainements + recalcule stats |
| `setEchauffements()` | `echauffements: Echauffement[]` | Met à jour la liste des échauffements + recalcule stats |
| `setSituations()` | `situations: SituationMatch[]` | Met à jour la liste des situations + recalcule stats |
| `setTags()` | `tags: Tag[]` | Met à jour la liste des tags + recalcule stats |
| `setLoading()` | `loading: boolean` | Met à jour l'état de chargement |
| `setError()` | `error: string \| null` | Met à jour l'erreur globale |
| `loadWorkspaceData()` | `data: WorkspaceData` | Charge toutes les données en une fois (utilisé par Preloader) |

### Méthodes de lecture (Getters synchrones)

| Méthode | Retour | Description |
|---------|--------|-------------|
| `getExercices()` | `Exercice[]` | Valeur actuelle des exercices (synchrone) |
| `getEntrainements()` | `Entrainement[]` | Valeur actuelle des entrainements (synchrone) |
| `getEchauffements()` | `Echauffement[]` | Valeur actuelle des échauffements (synchrone) |
| `getSituations()` | `SituationMatch[]` | Valeur actuelle des situations (synchrone) |
| `getTags()` | `Tag[]` | Valeur actuelle des tags (synchrone) |
| `getStats()` | `DashboardStats` | Valeur actuelle des stats (synchrone) |
| `isLoading()` | `boolean` | État de chargement actuel (synchrone) |
| `getError()` | `string \| null` | Erreur actuelle (synchrone) |

### Méthodes utilitaires

| Méthode | Description |
|---------|-------------|
| `clear()` | Réinitialise toutes les données (changement workspace / déconnexion) |

---

## 📐 INTERFACE DashboardStats

```typescript
export interface DashboardStats {
  exercicesCount: number;          // Nombre total d'exercices
  entrainementsCount: number;      // Nombre total d'entrainements
  echauffementsCount: number;      // Nombre total d'échauffements
  situationsCount: number;         // Nombre total de situations/matchs
  tagsCount: number;               // Nombre total de tags
  recentActivity: number;          // Éléments créés dans les 7 derniers jours
  tagsDetails?: {                  // Nombre de tags par catégorie
    [category: string]: number;
  };
}
```

**Calcul** :
- `exercicesCount = exercices.length`
- `recentActivity = items.filter(i => i.createdAt > Date.now() - 7days).length`
- `tagsDetails = { "Technique": 5, "Physique": 3, ... }`

**Avantage** :
- Pas d'appel à `GET /dashboard/stats`
- Mise à jour instantanée après mutation
- Pas de latence réseau

**Limite** :
- Précision dépend de la fraîcheur du cache (TTL 30min)
- Si cache expiré, stats peuvent être légèrement obsolètes jusqu'au prochain refresh backend

---

## 🔄 SCÉNARIOS D'UTILISATION

### Scénario 1 : Préchargement initial

```typescript
// 1. WorkspacePreloaderService appelle le backend
const data = await this.http.get('/workspaces/{id}/preload').toPromise();

// 2. Preloader alimente le Store
this.workspaceDataStore.loadWorkspaceData({
  exercices: data.exercices,
  entrainements: data.entrainements,
  echauffements: data.echauffements,
  situations: data.situations,
  tags: data.tags
});

// 3. Composants reçoivent les données automatiquement
this.workspaceDataStore.exercices$.subscribe(exercices => {
  this.exercices = exercices; // Affichage immédiat
});
```

### Scénario 2 : Mutation (création d'exercice)

```typescript
// 1. Composant appelle le service métier
this.exerciceService.createExercice(formData).subscribe(newExercice => {
  
  // 2. Service métier invalide le cache
  this.cache.invalidate('exercices-list', 'exercices');
  
  // 3. Service métier notifie le Store (à implémenter plus tard)
  // this.exerciceService.exercicesUpdated$.next();
  
  // 4. Store rafraîchit depuis le cache/backend
  // this.workspaceDataStore.refreshExercices();
  
  // 5. Tous les composants abonnés reçoivent la mise à jour
});
```

### Scénario 3 : Affichage dashboard

```typescript
// Dashboard s'abonne aux stats calculées localement
this.workspaceDataStore.stats$.subscribe(stats => {
  this.exercicesCount = stats.exercicesCount;
  this.entrainementsCount = stats.entrainementsCount;
  this.echauffementsCount = stats.echauffementsCount;
  this.situationsCount = stats.situationsCount;
  this.tagsCount = stats.tagsCount;
  this.recentActivity = stats.recentActivity;
});

// Pas d'appel à GET /dashboard/stats
// Mise à jour instantanée après création/suppression
```

### Scénario 4 : Changement de workspace

```typescript
// 1. Utilisateur change de workspace
this.workspaceService.setCurrentWorkspace(newWorkspace);

// 2. Store est réinitialisé
this.workspaceDataStore.clear();

// 3. Nouveau préchargement
this.workspacePreloader.smartPreload(newWorkspace.id);

// 4. Store reçoit les nouvelles données
// 5. Composants affichent les nouvelles données automatiquement
```

---

## ⚠️ CONTRAINTES RESPECTÉES

### ✅ Aucune suppression de service existant
- `ExerciceService`, `EntrainementService`, etc. : **Conservés**
- `DataCacheService` : **Conservé**
- `WorkspacePreloaderService` : **Conservé**
- Le Store s'ajoute à l'architecture, ne remplace rien

### ✅ Aucun branchement réel
- Le Store est créé mais **non connecté**
- Aucun service existant ne l'utilise encore
- Aucun composant ne s'abonne encore
- Prêt pour intégration progressive

### ✅ Pas de logique métier complexe
- Pas de validation de données
- Pas de règles métier
- Pas de transformation complexe
- Juste synchronisation et calcul simple de stats

### ✅ Store passif, sans side-effects
- Pas d'appel HTTP automatique
- Pas d'abonnement automatique
- Pas d'initialisation au constructeur
- Attend d'être alimenté explicitement

---

## 📅 PROCHAINES ÉTAPES (Non implémentées)

1. **Connecter WorkspacePreloader au Store** (ÉTAPE 2)
   - Modifier `WorkspacePreloaderService.preloadFromBulkEndpoint()`
   - Appeler `workspaceDataStore.loadWorkspaceData(data)`

2. **Migrer Dashboard vers le Store** (ÉTAPE 3)
   - Remplacer `dashboardService.getStats()` par `workspaceDataStore.stats$`

3. **Migrer listes vers le Store** (ÉTAPE 4)
   - Remplacer `exerciceService.getExercices()` par `workspaceDataStore.exercices$`
   - Idem pour entrainements, échauffements, situations

4. **Écouter les mutations** (ÉTAPE 5)
   - Services métier notifient le Store après create/update/delete
   - Store rafraîchit automatiquement

---

## ✅ VALIDATION

**Critères de validation du Store** :
- [x] BehaviorSubjects définis pour chaque type de donnée
- [x] Méthodes setters pour mise à jour
- [x] Méthodes getters synchrones pour lecture
- [x] Calcul automatique des stats dashboard
- [x] Gestion de l'état de chargement et erreur
- [x] Méthode `clear()` pour réinitialisation
- [x] Documentation complète des responsabilités
- [x] Aucun appel HTTP dans le Store
- [x] Aucun side-effect automatique
- [x] Store passif, attend d'être alimenté

**Statut** : ✅ Store créé et validé - Prêt pour intégration progressive
