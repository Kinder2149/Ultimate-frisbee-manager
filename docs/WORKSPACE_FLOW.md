# Flux de gestion des Workspaces

## Vue d'ensemble

Le système de workspaces permet à chaque utilisateur de travailler dans des espaces isolés. Chaque workspace contient ses propres exercices, entraînements, échauffements, situations de match et tags.

## Architecture

### Frontend (Angular)

#### 1. WorkspaceService
- **Localisation** : `frontend/src/app/core/services/workspace.service.ts`
- **Rôle** : Gère le workspace actif
- **Persistance** : localStorage (`ufm.currentWorkspace`)
- **Observable** : `currentWorkspace$` pour notifier les changements

#### 2. WorkspaceInterceptor
- **Localisation** : `frontend/src/app/core/interceptors/workspace.interceptor.ts`
- **Rôle** : Ajoute automatiquement le header `X-Workspace-Id` à toutes les requêtes API
- **Ordre** : Exécuté après `AuthInterceptor`

#### 3. DataCacheService
- **Localisation** : `frontend/src/app/core/services/data-cache.service.ts`
- **Rôle** : Cache les données par workspace
- **Clé de cache** : `{workspaceId}_{key}`
- **Auto-nettoyage** : Vide le cache automatiquement lors du changement de workspace

#### 4. WorkspaceSwitcherComponent
- **Localisation** : `frontend/src/app/shared/components/workspace-switcher/workspace-switcher.component.ts`
- **Rôle** : Permet de changer de workspace depuis le header
- **Comportement** : Recharge complètement la page (`window.location.href = '/'`) pour garantir un état propre

### Backend (Node.js + Prisma)

#### 1. Middleware workspace.middleware.js
- **Localisation** : `backend/middleware/workspace.middleware.js`
- **Fonction** : `workspaceGuard`
- **Rôle** : 
  - Lit le header `X-Workspace-Id`
  - Vérifie que l'utilisateur a accès au workspace
  - Stocke `req.workspaceId` pour les contrôleurs

#### 2. Contrôleurs
- **Tous les contrôleurs** utilisent `req.workspaceId` pour filtrer les données
- **Exemples** :
  - `exercice.controller.js` : `where: { workspaceId }`
  - `entrainement.controller.js` : `where: { workspaceId }`
  - `tag.controller.js` : `where: { workspaceId }`

## Flux de changement de workspace

### Scénario 1 : Changement via WorkspaceSwitcher (header)

```
1. User clique sur un workspace dans le menu
   ↓
2. WorkspaceSwitcherComponent.selectWorkspace()
   ↓
3. WorkspaceService.setCurrentWorkspace(ws)
   - Stocke dans localStorage
   - Émet via currentWorkspace$
   ↓
4. window.location.href = '/'
   - Recharge complètement la page
   ↓
5. Au chargement de la page :
   - WorkspaceService lit localStorage
   - Émet le workspace via currentWorkspace$
   ↓
6. DashboardComponent (et autres) reçoivent la notification
   - Invalident leur cache
   - Rechargent leurs données
   ↓
7. Toutes les requêtes HTTP incluent X-Workspace-Id
   - WorkspaceInterceptor ajoute le header
   ↓
8. Backend filtre les données par workspaceId
```

### Scénario 2 : Changement via bouton "Changer d'espace" (dashboard)

```
1. User clique sur "Changer d'espace"
   ↓
2. DashboardComponent.navigateToWorkspaceSelection()
   - Vide le cache : dataCache.clearAll()
   - Navigate vers /select-workspace
   ↓
3. SelectWorkspaceComponent charge les workspaces disponibles
   - GET /api/workspaces/me
   ↓
4. User sélectionne un workspace
   ↓
5. SelectWorkspaceComponent.selectWorkspace(ws)
   - WorkspaceService.setCurrentWorkspace(ws)
   - Navigate vers /
   ↓
6. Suite identique au scénario 1 (étapes 5-8)
```

## Ordre de chargement des données

### Au démarrage de l'application

```
1. AuthService vérifie l'authentification
   - Lit le token depuis localStorage
   ↓
2. WorkspaceService lit le workspace depuis localStorage
   - Émet via currentWorkspace$
   ↓
3. WorkspaceSelectedGuard vérifie qu'un workspace est sélectionné
   - Si non : redirige vers /select-workspace
   - Si oui : laisse passer
   ↓
4. Composants s'abonnent à currentWorkspace$
   - DashboardComponent
   - ExerciceListComponent
   - etc.
   ↓
5. Composants chargent leurs données
   - Toutes les requêtes incluent X-Workspace-Id
   - Backend filtre par workspaceId
```

### Lors d'un changement de workspace

```
1. WorkspaceService.setCurrentWorkspace(ws)
   - Stocke dans localStorage
   - Émet via currentWorkspace$
   ↓
2. DataCacheService reçoit la notification
   - Vide tout le cache
   ↓
3. window.location.href = '/' (rechargement complet)
   ↓
4. Nouveau cycle de chargement (voir "Au démarrage")
```

## Vérifications de sécurité

### Frontend
- ✅ WorkspaceInterceptor ajoute X-Workspace-Id à toutes les requêtes
- ✅ WorkspaceSelectedGuard empêche l'accès sans workspace
- ✅ DataCacheService isole les données par workspace

### Backend
- ✅ workspaceGuard vérifie l'accès au workspace
- ✅ Tous les contrôleurs filtrent par workspaceId
- ✅ Impossible d'accéder aux données d'un autre workspace

## Tests à effectuer

### Test 1 : Changement de workspace via header
1. Se connecter
2. Sélectionner workspace A
3. Créer un exercice dans workspace A
4. Changer pour workspace B via le menu header
5. Vérifier que l'exercice de A n'apparaît pas
6. Créer un exercice dans workspace B
7. Revenir à workspace A
8. Vérifier que seul l'exercice de A apparaît

### Test 2 : Changement via bouton dashboard
1. Se connecter
2. Sélectionner workspace A
3. Cliquer sur "Changer d'espace" dans le dashboard
4. Sélectionner workspace B
5. Vérifier que les données de B s'affichent

### Test 3 : Persistance après rechargement
1. Se connecter
2. Sélectionner workspace A
3. Recharger la page (F5)
4. Vérifier que workspace A est toujours actif
5. Vérifier que les données de A s'affichent

### Test 4 : Isolation des données
1. Se connecter avec user1
2. Créer workspace A et workspace B
3. Créer des exercices différents dans A et B
4. Se déconnecter
5. Se connecter avec user2 (sans accès à A ni B)
6. Vérifier qu'aucune donnée de A ou B n'est visible

## Logs de débogage

Les logs suivants permettent de tracer le flux :

### Frontend
- `[WorkspaceService] Current workspace:` - Workspace actif
- `[WorkspaceSwitcher] Changing workspace to:` - Changement de workspace
- `[Dashboard] Workspace changed:` - Dashboard notifié du changement
- `[Dashboard] Loading stats for workspace:` - Chargement des stats
- `[DataCache] Cache cleared` - Cache vidé
- `[DataCache] Cache HIT/MISS for {key}` - Utilisation du cache

### Backend
- `[WorkspaceGuard] Erreur lors de la résolution du workspace` - Erreur de résolution
- Logs des contrôleurs avec workspaceId

## Corrections apportées (26/01/2025)

### Problème identifié
Le dashboard ne rechargeait pas les données lors du changement de workspace car il utilisait `take(1)` qui ne s'exécute qu'une seule fois.

### Solutions implémentées

1. **DashboardComponent** (`dashboard.component.ts`)
   - ❌ Avant : `take(1)` - charge une seule fois
   - ✅ Après : Écoute continue de `currentWorkspace$` et recharge à chaque changement
   - Ajout de logs pour tracer les changements

2. **WorkspaceSwitcherComponent** (`workspace-switcher.component.ts`)
   - ❌ Avant : `router.navigate(['/'])` - navigation Angular
   - ✅ Après : `window.location.href = '/'` - rechargement complet de la page
   - Garantit un état propre et évite les problèmes de cache

3. **DataCacheService** (`data-cache.service.ts`)
   - Ajout de la méthode `clear(key)` (alias de `invalidate`)
   - Amélioration des logs pour inclure le workspaceId

## Recommandations

1. **Toujours utiliser WorkspaceService** pour gérer le workspace actif
2. **Ne jamais stocker le workspaceId en dur** dans les composants
3. **S'abonner à currentWorkspace$** pour réagir aux changements
4. **Invalider le cache** lors des changements de workspace
5. **Utiliser workspaceGuard** sur toutes les routes backend nécessitant un workspace
6. **Filtrer par workspaceId** dans tous les contrôleurs backend
