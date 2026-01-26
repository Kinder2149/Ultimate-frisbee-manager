# Flux d'authentification et de persistance de session

## Vue d'ensemble

Le système d'authentification garantit une navigation fluide avec persistance automatique de la session. L'utilisateur reste connecté tant que son token est valide et est automatiquement redirigé vers la page de connexion uniquement s'il n'est pas authentifié.

## Principes clés

1. **Persistance automatique** : La session est restaurée automatiquement au rechargement de la page
2. **Workspace BASE par défaut** : Tous les utilisateurs ont accès au workspace BASE
3. **Sélection automatique** : Le workspace est sélectionné automatiquement après connexion
4. **Pas d'écrans inutiles** : Les écrans de chargement ne s'affichent que lors du réveil du backend
5. **Redirection intelligente** : L'utilisateur est redirigé vers la page demandée après connexion

## Architecture

### Frontend (Angular)

#### 1. AuthService
- **Localisation** : `frontend/src/app/core/services/auth.service.ts`
- **Rôle** : Gère l'authentification et la persistance de session
- **Stockage** : localStorage (`ufm_access_token`, `ufm_refresh_token`)
- **Observables** : 
  - `isAuthenticated$` : État d'authentification
  - `currentUser$` : Utilisateur connecté

#### 2. AuthGuard
- **Localisation** : `frontend/src/app/core/guards/auth.guard.ts`
- **Rôle** : Protège les routes nécessitant une authentification
- **Comportement** : Redirige vers `/login` si non authentifié

#### 3. WorkspaceSelectedGuard
- **Localisation** : `frontend/src/app/core/guards/workspace-selected.guard.ts`
- **Rôle** : Vérifie qu'un workspace est sélectionné
- **Comportement** : Redirige vers `/select-workspace` si aucun workspace

### Backend (Node.js + Prisma)

#### 1. Workspace BASE
- **Création automatique** : Créé lors du seed initial
- **Attribution** : Tous les utilisateurs sont automatiquement liés à BASE
- **Fonction** : `ensureDefaultWorkspaceAndLink()` dans `workspace.controller.js`

#### 2. Middleware d'authentification
- **Localisation** : `backend/middleware/auth.middleware.js`
- **Fonction** : `authenticateToken`
- **Rôle** : Vérifie le token JWT sur toutes les routes protégées

## Flux de connexion

### Scénario 1 : Première connexion

```
1. User arrive sur /login
   ↓
2. User saisit email/password
   ↓
3. LoginComponent.onSubmit()
   - Appelle authService.loginWithBackend()
   ↓
4. AuthService.loginWithBackend()
   - POST /api/auth/login
   - Stocke le token dans localStorage
   - Émet isAuthenticated$ = true
   - Appelle ensureWorkspaceSelected()
   ↓
5. AuthService.ensureWorkspaceSelected()
   - GET /api/workspaces/me
   - Sélectionne BASE (ou premier workspace)
   - WorkspaceService.setCurrentWorkspace()
   ↓
6. LoginComponent reçoit isAuthenticated$ = true
   - Navigate vers returnUrl (ou /)
   ↓
7. AuthGuard laisse passer
   ↓
8. WorkspaceSelectedGuard vérifie le workspace
   - Workspace présent → laisse passer
   ↓
9. DashboardComponent s'affiche
   - Charge les workspaces disponibles
   - Masque le bouton "Changer d'espace" si un seul workspace
   - Affiche le rôle de l'utilisateur
```

### Scénario 2 : Rechargement de page (session persistante)

```
1. User recharge la page (F5)
   ↓
2. AppComponent.ngOnInit()
   - AuthService.initFromLocalToken()
   ↓
3. AuthService.initFromLocalToken()
   - Lit le token depuis localStorage
   - Si token présent :
     - Émet isAuthenticated$ = true
     - Appelle syncUserProfile()
   ↓
4. AuthService.syncUserProfile()
   - GET /api/auth/profile
   - Si succès :
     - Émet currentUser$
     - Appelle ensureWorkspaceSelected()
   - Si échec (401) :
     - Supprime le token
     - Émet isAuthenticated$ = false
     - Redirige vers /login
   ↓
5. AuthService.ensureWorkspaceSelected()
   - Vérifie si workspace déjà sélectionné
   - Si non : charge et sélectionne BASE
   ↓
6. WorkspaceService lit localStorage
   - Émet currentWorkspace$
   ↓
7. DashboardComponent reçoit les notifications
   - Affiche les données du workspace
```

### Scénario 3 : Token expiré

```
1. User tente d'accéder à une route protégée
   ↓
2. AuthInterceptor ajoute le token
   ↓
3. Backend répond 401 (token expiré)
   ↓
4. HttpErrorInterceptor détecte l'erreur
   ↓
5. AuthService.clearLocalToken()
   - Supprime le token
   - Émet isAuthenticated$ = false
   ↓
6. AuthGuard détecte isAuthenticated$ = false
   - Redirige vers /login
```

### Scénario 4 : Déconnexion

```
1. User clique sur "Déconnexion"
   ↓
2. AppComponent.onLogout()
   - Appelle authService.logout()
   ↓
3. AuthService.logout()
   - Supprime le token localStorage
   - Nettoie le workspace
   - Appelle Supabase signOut
   - Émet isAuthenticated$ = false
   - Redirige vers /login
```

## Gestion des workspaces

### Attribution automatique du workspace BASE

Tous les utilisateurs sont automatiquement liés au workspace BASE lors de leur première connexion ou lors du seed.

**Backend** : `workspace.controller.js`
```javascript
async function ensureDefaultWorkspaceAndLink(userId) {
  // Vérifie si l'utilisateur est lié à BASE
  // Si non, crée le lien automatiquement
  // Retourne tous les workspaces accessibles
}
```

### Sélection automatique du workspace

**Priorités de sélection** :
1. Workspace précédemment sélectionné (localStorage)
2. Workspace BASE si disponible
3. Premier workspace disponible

**Frontend** : `select-workspace.component.ts`
```typescript
// Si un seul workspace → sélection automatique
if (workspaces.length === 1) {
  this.selectWorkspace(workspaces[0]);
}

// Si plusieurs workspaces → sélectionner BASE
const baseWorkspace = workspaces.find(w => w.name === 'BASE');
if (baseWorkspace) {
  this.selectWorkspace(baseWorkspace);
}
```

### Affichage conditionnel du bouton "Changer d'espace"

Le bouton n'apparaît que si l'utilisateur a accès à plusieurs workspaces.

**Dashboard** : `dashboard.component.ts`
```typescript
hasMultipleWorkspaces(): boolean {
  return this.availableWorkspaces.length > 1;
}
```

**Template** :
```html
<div class="workspace-actions" *ngIf="hasMultipleWorkspaces()">
  <button (click)="navigateToWorkspaceSelection()">
    Changer d'espace
  </button>
</div>
```

## Écrans de chargement

### Startup Loader

**Affichage** : Uniquement lors du réveil du backend (cold start)

**Condition** :
```typescript
this.showStartupLoader$ = this.backendStatus.getState().pipe(
  map(state => state.status === 'waking'),
  distinctUntilChanged()
);
```

**Comportement** :
- ❌ **Avant** : S'affichait au chargement initial même si le backend était disponible
- ✅ **Après** : S'affiche uniquement lors du réveil du backend (cold start Render)

### Pas d'écran de chargement pour la connexion

La connexion est instantanée avec feedback visuel :
- Spinner sur le bouton de connexion
- Message de succès (SnackBar)
- Redirection automatique

## Logs de débogage

Les logs permettent de tracer le flux complet :

### Frontend
- `[Auth] Token found in localStorage, restoring session`
- `[Auth] Session restored successfully for: {email}`
- `[Auth] Login successful, storing token`
- `[Auth] Workspaces loaded: {count}`
- `[Auth] Auto-selecting workspace: {name}`
- `[Login] User already authenticated, redirecting to: {url}`
- `[Login] Login successful, redirecting to: {url}`
- `[SelectWorkspace] Only one workspace, auto-selecting: {name}`
- `[SelectWorkspace] Multiple workspaces, auto-selecting BASE`
- `[Dashboard] Workspace changed: {id}`

### Backend
- Logs des requêtes d'authentification
- Logs de création de liens workspace-user

## Tests à effectuer

### Test 1 : Première connexion
1. Ouvrir l'application en navigation privée
2. Vérifier la redirection vers `/login`
3. Se connecter avec `admin@ultimate.com`
4. Vérifier :
   - Redirection automatique vers `/`
   - Workspace BASE sélectionné automatiquement
   - Dashboard affiché avec les données
   - Bouton "Changer d'espace" masqué (un seul workspace)
   - Rôle affiché (Propriétaire/Utilisateur)

### Test 2 : Persistance de session
1. Se connecter
2. Recharger la page (F5)
3. Vérifier :
   - Pas de redirection vers `/login`
   - Session restaurée automatiquement
   - Workspace toujours sélectionné
   - Données affichées correctement

### Test 3 : Plusieurs workspaces
1. Se connecter en tant qu'admin
2. Créer un second workspace
3. Recharger la page
4. Vérifier :
   - Workspace BASE sélectionné par défaut
   - Bouton "Changer d'espace" visible
   - Possibilité de changer de workspace

### Test 4 : Token expiré
1. Se connecter
2. Supprimer manuellement le token du localStorage
3. Tenter d'accéder à une route protégée
4. Vérifier :
   - Redirection automatique vers `/login`
   - Message d'erreur approprié

### Test 5 : Déconnexion
1. Se connecter
2. Cliquer sur "Déconnexion"
3. Vérifier :
   - Redirection vers `/login`
   - Token supprimé du localStorage
   - Workspace supprimé du localStorage
   - Impossible d'accéder aux routes protégées

## Corrections apportées (26/01/2025)

### Problèmes identifiés
1. Écrans de chargement inutiles au démarrage
2. Pas de sélection automatique du workspace BASE
3. Bouton "Changer d'espace" toujours visible
4. Persistance de session incomplète

### Solutions implémentées

#### 1. AuthService (`auth.service.ts`)
- ✅ Restauration automatique de la session au démarrage
- ✅ Sélection automatique du workspace après connexion
- ✅ Logs détaillés pour tracer le flux
- ✅ Gestion des erreurs avec nettoyage automatique

#### 2. SelectWorkspaceComponent (`select-workspace.component.ts`)
- ✅ Sélection automatique si un seul workspace
- ✅ Sélection automatique de BASE si plusieurs workspaces
- ✅ Redirection automatique si workspace déjà valide

#### 3. DashboardComponent (`dashboard.component.ts`)
- ✅ Chargement de la liste des workspaces
- ✅ Méthode `hasMultipleWorkspaces()` pour affichage conditionnel
- ✅ Bouton "Changer d'espace" masqué si un seul workspace
- ✅ Affichage du rôle de l'utilisateur

#### 4. AppComponent (`app.component.ts`)
- ✅ Startup loader affiché uniquement lors du réveil du backend
- ✅ Pas d'écran de chargement au démarrage initial

#### 5. LoginComponent (`login.component.ts`)
- ✅ Redirection immédiate si déjà authentifié
- ✅ Logs pour tracer le flux de connexion
- ✅ Timeout pour garantir la redirection

## Recommandations

1. **Toujours vérifier l'état d'authentification** avant d'afficher du contenu protégé
2. **Ne jamais stocker de données sensibles** dans localStorage (seulement le token)
3. **Utiliser les observables** pour réagir aux changements d'état
4. **Logger les étapes importantes** pour faciliter le débogage
5. **Gérer les erreurs proprement** avec nettoyage automatique
6. **Tester la persistance** après chaque modification du flux d'auth

## Sécurité

- ✅ Token JWT stocké dans localStorage (accessible uniquement au domaine)
- ✅ Token envoyé automatiquement via AuthInterceptor
- ✅ Vérification backend sur toutes les routes protégées
- ✅ Nettoyage automatique en cas d'erreur 401
- ✅ Déconnexion automatique si token invalide
- ✅ Pas de données sensibles en clair dans le code
