# AUDIT — Cycle de vie Authentification & Autorisation

- **Statut** : WORK
- **Date** : 2026-02-09
- **Périmètre** : Backend (API/Prisma/Middleware) + Frontend (Guards/Services/Interceptors)
- **Objectif** : Stabilisation et correction du système auth/authz pour production

---

## TABLE DES MATIÈRES

1. [PART 1 — Flux d'authentification réel](#part-1--flux-dauthentification-réel)
2. [PART 2 — Audit des guards frontend & redirections](#part-2--audit-des-guards-frontend--redirections)
3. [PART 3 — Analyse des boucles de notifications](#part-3--analyse-des-boucles-de-notifications)
4. [PART 4 — Rupture rôle ADMIN (CRITIQUE)](#part-4--rupture-rôle-admin-critique)
5. [PART 5 — Modèle cible & plan de correction](#part-5--modèle-cible--plan-de-correction)

---

# PART 1 — Flux d'authentification réel

## 1.1 Flux reconstruit étape par étape

### A. Démarrage de l'application (cold start / refresh navigateur)

```
ÉTAPE 1 — AppComponent instancié
  ├── AuthService instancié via constructeur
  │   └── APPEL initializeAuth() [ASYNC — NON BLOQUANT]
  │       ├── ÉTAPE 1a — listenToAuthStateChanges()           [SYNC]
  │       │   └── Enregistre callback onAuthStateChange
  │       │       ⚠️ PROBLÈME: callback enregistré AVANT getSession()
  │       │       ⚠️ Le callback SIGNED_IN peut se déclencher en parallèle de l'étape 2
  │       │
  │       └── ÉTAPE 1b — getSession()                         [ASYNC — AWAIT]
  │           ├── SI session trouvée:
  │           │   ├── isAuthenticatedSubject.next(true)        [SYNC]
  │           │   ├── authReadySubject.next(false)             [SYNC]
  │           │   ├── loadCachedProfile()                      [ASYNC]
  │           │   │   └── Affecte currentUserSubject si cache existe
  │           │   └── syncUserProfile()                        [ASYNC — HTTP]
  │           │       └── WAIT réponse GET /api/auth/profile
  │           │           └── switchMap → ensureWorkspaceSelected()  [ASYNC — HTTP]
  │           │               └── WAIT réponse GET /api/workspaces/me
  │           │                   └── tap → authReadySubject.next(true)
  │           │
  │           └── SI pas de session:
  │               ├── isAuthenticatedSubject.next(false)
  │               └── authReadySubject.next(false)
  │
  ├── AppComponent.ngOnInit()
  │   └── globalPreloader.initialize()
  │       ⚠️ Le preloader démarre SANS attendre authReady$
  │
  └── Routing Angular déclenché
      └── Guards évalués (AuthGuard prend authReady$ avec take(1))
          ⚠️ RACE CONDITION: authReady$ est encore false pendant initializeAuth()
```

### B. Login utilisateur (clic sur "Se connecter")

```
ÉTAPE 1 — LoginComponent.onSubmit()
  └── authService.login(credentials)                         [ASYNC]
      └── supabase.auth.signInWithPassword(credentials)      [ASYNC — RÉSEAU]
          └── Retourne { data, error }
              ├── SI erreur → errorMessage affiché            [SYNC — FIN]
              └── SI succès → return void
                  ⚠️ Le login() NE FAIT PAS la suite
                  ⚠️ C'est l'événement SIGNED_IN qui prend le relais

ÉTAPE 2 — Événement Supabase SIGNED_IN déclenché
  └── listenToAuthStateChanges() callback
      └── ngZone.run(() => handleSignedIn(session))
          ├── isAuthenticatedSubject.next(true)               [SYNC]
          ├── authReadySubject.next(false)                    [SYNC]
          └── syncUserProfile()                               [ASYNC — HTTP]
              └── GET /api/auth/profile
                  ⚠️ PROBLÈME: Requête envoyée AVANT que le token soit
                  ⚠️ forcément disponible via getSession() (retry 150ms max)
                  │
                  ├── SI 403 (USER_NOT_FOUND) →
                  │   └── createProfileFromSupabase()          [ASYNC — HTTP]
                  │       └── POST /api/auth/register
                  │
                  └── SI succès →
                      └── switchMap → ensureWorkspaceSelected() [ASYNC — HTTP]
                          └── GET /api/workspaces/me
                              └── Sélection auto workspace BASE
                                  └── tap → authReadySubject.next(true)

ÉTAPE 3 — LoginComponent réagit à authReady$ === true
  └── Subscription dans ngOnInit (filter isReady === true)
      └── setTimeout(500ms) → router.navigate([returnUrl])    [ASYNC]

ÉTAPE 4 — Navigation vers dashboard
  └── Guards évalués
      └── AuthGuard: authReady$.pipe(take(1)) → true ✓
      └── WorkspaceSelectedGuard: authReady$.pipe(take(1)) → true ✓
          └── Validation workspace via HTTP ou cache
```

### C. Flux backend (pour chaque requête protégée)

```
Requête HTTP entrante
  └── authenticateToken middleware                             [ASYNC]
      ├── Extraire token du header Authorization
      ├── Décoder header JWT → détecter algorithme (HS256/RS256)
      ├── Vérifier token via jose                              [ASYNC — RÉSEAU pour RS256]
      │   ⚠️ RS256 nécessite appel JWKS endpoint Supabase
      │   ⚠️ Latence réseau potentielle
      ├── Chercher user en cache mémoire (TTL 15min)
      ├── SI pas en cache → fetchUserWithRetry()               [ASYNC — DB]
      │   └── 3 tentatives (0ms, 200ms, 600ms)
      ├── SI user non trouvé → 403 USER_NOT_FOUND
      ├── SI user inactif → 401 USER_INACTIVE
      └── req.user = user → next()

  └── workspaceGuard middleware (si route workspace-protégée)  [ASYNC]
      ├── Lire header X-Workspace-Id
      ├── Vérifier appartenance via prisma.workspaceUser       [ASYNC — DB]
      ├── SI pas d'accès → 403 WORKSPACE_FORBIDDEN
      ├── req.workspaceId, req.workspace, req.workspaceRole
      └── baseMutationGuard                                    [SYNC]
          └── SI workspace BASE + méthode mutante + user != ADMIN → 403
```

## 1.2 Problèmes de synchronisation identifiés

### RACE CONDITION #1 — Double exécution initializeAuth + SIGNED_IN

**Fichier** : `frontend/src/app/core/services/auth.service.ts`

Au démarrage, `initializeAuth()` appelle `listenToAuthStateChanges()` **puis** `getSession()`.
Supabase peut émettre un événement `SIGNED_IN` dès que le listener est enregistré, **avant** que `getSession()` ne retourne.

**Conséquence** : `handleSignedIn()` et le bloc `if (session?.user)` de `initializeAuth()` exécutent **tous les deux** la même séquence `syncUserProfile() → ensureWorkspaceSelected()`, provoquant :
- Deux appels HTTP `GET /api/auth/profile` simultanés
- Deux appels HTTP `GET /api/workspaces/me` simultanés
- Deux `authReadySubject.next(true)` (ou un true suivi d'un false en cas d'erreur sur le second)

### RACE CONDITION #2 — AuthGuard avec take(1) trop tôt

**Fichier** : `frontend/src/app/core/guards/auth.guard.ts:24`

```typescript
return this.authService.authReady$.pipe(
  take(1),
  map(isReady => { ... })
);
```

`take(1)` capture la **valeur courante** du BehaviorSubject. Au démarrage, `authReady$` est `false`. Si le guard est évalué **pendant** que `initializeAuth()` est en cours (session existe mais profil pas encore chargé), `take(1)` retourne `false`.

Le guard vérifie ensuite `isAuthenticated()` qui peut être `true` → retourne `false` **sans rediriger**. L'utilisateur reste bloqué sur un écran blanc.

### RACE CONDITION #3 — Token pas encore disponible après SIGNED_IN

**Fichier** : `frontend/src/app/core/services/auth.service.ts:285-338`

`getAccessToken()` a un retry de 150ms max. Mais `syncUserProfile()` est appelé immédiatement dans `handleSignedIn()`. L'intercepteur `AuthInterceptor` appelle `getAccessToken()` pour chaque requête. Si le token n'est pas encore dans le store Supabase au moment du premier `GET /api/auth/profile`, la requête part **sans token** → 401 côté backend.

### EXÉCUTION DUPLIQUÉE #1 — Interceptors multiples sur la même erreur

**Fichiers** : `core/interceptors/` (5 interceptors enregistrés)

L'ordre d'enregistrement dans `CoreModule` :
1. `AuthInterceptor` — ajoute le token
2. `WorkspaceInterceptor` — ajoute X-Workspace-Id
3. `BackendStatusInterceptor` — détecte 0/502/503/504
4. `WorkspaceErrorInterceptor` — détecte codes workspace
5. `HttpErrorInterceptor` — gestion centralisée erreurs auth

**Problème** : Pour une erreur 401 avec code `NO_TOKEN` :
- `BackendStatusInterceptor` la laisse passer (pas 0/502/503/504)
- `WorkspaceErrorInterceptor` la laisse passer (pas un code workspace)
- `HttpErrorInterceptor` : déclenche `logout()` + navigation `/login`

Mais `logout()` déclenche `SIGNED_OUT` → `handleSignedOut()` → `router.navigate(['/login'])`.
Et `HttpErrorInterceptor` fait aussi `router.navigate(['/login'])`.
→ **Double navigation** vers `/login`.

---

# PART 2 — Audit des guards frontend & redirections

## 2.1 Inventaire des guards

| Guard | Fichier | Type | Dépendances |
|-------|---------|------|-------------|
| `AuthGuard` | `core/guards/auth.guard.ts` | Observable<boolean> | `authReady$`, `isAuthenticated()` |
| `RoleGuard` | `core/guards/role.guard.ts` | Observable<boolean> | `currentUser$` |
| `WorkspaceSelectedGuard` | `core/guards/workspace-selected.guard.ts` | Observable<boolean> | `authReady$`, `WorkspaceService`, HTTP |
| `WriteGuard` | `core/guards/write.guard.ts` | boolean (sync) | `PermissionsService` |
| `MobileGuard` | `core/guards/mobile.guard.ts` | Observable<boolean> | `MobileDetectorService` |

## 2.2 Ordre d'exécution sur les routes

### Route dashboard (`/`)
```
canActivate: [AuthGuard, WorkspaceSelectedGuard, MobileGuard]
```

### Route admin (`/admin`)
```
canActivate (app.module): [AuthGuard, WorkspaceSelectedGuard, MobileGuard]
canActivate (admin-routing): [AuthGuard, RoleGuard]  ← data: { role: 'admin' }
```

### Route select-workspace (`/select-workspace`)
```
canActivate: [AuthGuard]
```

## 2.3 Problèmes détectés

### BUG #1 — AuthGuard bloque silencieusement pendant le chargement

**Fichier** : `core/guards/auth.guard.ts:33-37`

```typescript
const isAuthenticating = this.authService.isAuthenticated();
if (isAuthenticating) {
  // Session Supabase existe mais données pas encore prêtes
  // Bloquer la navigation sans rediriger
  return false;
}
```

Quand `isAuthenticated` est `true` mais `authReady` est `false`, le guard retourne `false` **sans rediriger et sans attendre**. L'utilisateur voit un écran blanc. Il n'y a **aucun mécanisme de retry** — le guard ne sera pas réévalué quand `authReady$` passera à `true`.

**Conséquence** : L'utilisateur doit **cliquer à nouveau** ou **rafraîchir la page** pour que le guard soit réévalué.

### BUG #2 — RoleGuard évalue currentUser$ sans attendre authReady$

**Fichier** : `core/guards/role.guard.ts:18-20`

```typescript
return this.authService.currentUser$.pipe(
  take(1),
  map(user => { ... })
);
```

Le `RoleGuard` prend `currentUser$` avec `take(1)`. Si le profil n'est pas encore chargé (pendant `syncUserProfile()`), `currentUser$` est `null` → l'utilisateur est redirigé vers `/login` alors qu'il est en cours d'authentification.

**Prérequis manquant** : `RoleGuard` devrait attendre `authReady$ === true` avant de vérifier le rôle.

### BUG #3 — WorkspaceSelectedGuard fait un appel HTTP redondant

**Fichier** : `core/guards/workspace-selected.guard.ts:52-56`

```typescript
return this.cache.get<WorkspaceSummary[]>(
  'workspaces-list', 'workspaces',
  () => this.http.get<WorkspaceSummary[]>(`${environment.apiUrl}/workspaces/me`),
  { ttl: 60 * 60 * 1000 }
);
```

Le guard fait un appel HTTP pour valider le workspace **à chaque navigation**. Si le cache est vide (premier chargement, après logout), cela provoque un appel réseau supplémentaire.

Or, `ensureWorkspaceSelected()` dans `AuthService` a **déjà** fait cet appel pendant l'initialisation. Le guard duplique le travail.

### BUG #4 — Double guard AuthGuard sur les routes admin

**Fichiers** :
- `app.module.ts:93-96` : `canActivate: [AuthGuard, WorkspaceSelectedGuard, MobileGuard]`
- `admin-routing.module.ts:11` : `canActivate: [AuthGuard, RoleGuard]`

`AuthGuard` est évalué **deux fois** pour les routes admin. La première évaluation (app.module) et la seconde (admin-routing) sont indépendantes et chacune fait `authReady$.pipe(take(1))`.

### BUG #5 — Boucle de login potentielle

**Scénario** :
1. Utilisateur sur `/` → `AuthGuard` retourne `false` (auth en cours) → écran blanc
2. Utilisateur clique "rafraîchir" ou navigue → `AuthGuard` réévalué
3. Si entre-temps `initializeAuth()` a échoué → `authReady$` est `false`, `isAuthenticated` est `false`
4. → Redirection vers `/login`
5. Sur `/login`, `authReady$` listener dans `ngOnInit` ne fire jamais (car `authReady$` est resté `false`)
6. L'utilisateur doit se reconnecter manuellement

**Ce n'est pas une boucle infinie**, mais c'est un **échec silencieux** qui nécessite une action manuelle.

## 2.4 Ordre d'exécution corrigé (cible)

```
Guard                     Prérequis obligatoire
─────────────────────────────────────────────────
AuthGuard                 authReady$ === true (ATTENDRE, ne pas take(1))
RoleGuard                 authReady$ === true + currentUser$.role chargé
WorkspaceSelectedGuard    authReady$ === true + workspace validé
WriteGuard                WorkspaceSelectedGuard passé + rôle workspace chargé
MobileGuard               Aucun (détection device pure)
```

---

# PART 3 — Analyse des boucles de notifications

## 3.1 Architecture actuelle des notifications

Le `NotificationService` (`core/services/notification.service.ts`) est un wrapper simple autour de `MatSnackBar`. Il n'a **aucun système de push/subscription**. Les notifications sont déclenchées de manière impérative par les composants et interceptors.

Le système de "synchronisation" est dans `SyncService` (`core/services/sync.service.ts`) qui utilise :
- **BroadcastChannel** pour la communication multi-onglets
- **Polling HTTP** adaptatif (`GET /api/sync/versions`) pour détecter les changements serveur

## 3.2 Sources de notifications multiples identifiées

### SOURCE #1 — Interceptors en cascade sur erreur auth

Quand une erreur 401 se produit :
1. `HttpErrorInterceptor` affiche un message via `errorService.showError()`
2. `HttpErrorInterceptor` appelle `authService.logout()` → `SIGNED_OUT`
3. `handleSignedOut()` fait `router.navigate(['/login'])`
4. `HttpErrorInterceptor` fait aussi `router.navigate(['/login'])`

Si plusieurs requêtes HTTP sont en vol simultanément et reçoivent chacune un 401 :
- Chaque erreur passe par **tous** les interceptors
- Chaque erreur déclenche un `showError()` → **N snackbars affichées**
- Chaque erreur déclenche un `logout()` → **N tentatives de déconnexion**

### SOURCE #2 — Double exécution initializeAuth + SIGNED_IN (voir RACE CONDITION #1)

Les deux chaînes `syncUserProfile() → ensureWorkspaceSelected()` peuvent échouer à des moments différents, produisant :
- Deux appels `showError()` si le profil n'est pas trouvé
- Deux redirections potentielles

### SOURCE #3 — SyncService polling sans contrôle d'état auth

**Fichier** : `core/services/sync.service.ts:165-200`

Le `startPeriodicSync()` est appelé par le preloader. Il utilise `interval(1000)` avec filtrage. Mais :
- Il n'y a **aucune vérification** que l'utilisateur est authentifié
- Il vérifie uniquement `workspaceService.getCurrentWorkspaceId()` (qui peut exister en localStorage même après logout)
- Si le token a expiré, chaque poll produit un 401 → chaque 401 passe par les interceptors → notifications en boucle

### SOURCE #4 — BroadcastChannel sans déduplication

Les messages BroadcastChannel ne sont pas dédupliqués. Si deux onglets font la même action, le message est reçu dans les deux sens.

## 3.3 Règles de notification proposées

| Règle | Description |
|-------|-------------|
| **N-1** | Les notifications d'erreur auth (401/403) ne doivent être affichées qu'**une seule fois**, même si N requêtes échouent simultanément |
| **N-2** | Le `SyncService` doit arrêter le polling quand `authReady$ === false` |
| **N-3** | Le `SyncService` doit redémarrer le polling quand `authReady$` repasse à `true` |
| **N-4** | Le `logout()` doit être idempotent : un flag `isLoggingOut` doit empêcher les appels multiples |
| **N-5** | Les interceptors d'erreur doivent vérifier si un logout est déjà en cours avant de déclencher un nouveau logout |

---

# PART 4 — Rupture rôle ADMIN (CRITIQUE)

## 4.1 Analyse des migrations affectant les rôles

### Chronologie des migrations

| Date | Migration | Effet |
|------|-----------|-------|
| 2025-01-25 | `add_user_role_enum` | Crée `UserRole` enum (USER, ADMIN). Convertit la colonne `role` de String vers Enum. **Toute valeur invalide est remplacée par USER** |
| 2025-01-25 | `normalize_user_roles` | Force UPPERCASE sur toutes les valeurs role existantes |
| 2025-11-23 | `baseline` | Baseline complète (inclut `passwordHash`) |
| 2026-01-29 | `remove_password_hash` | Supprime la colonne `passwordHash` |
| 2026-02-09 | `add_workspace_role_enum` | Crée `WorkspaceRole` enum. Convertit rôles workspace |

### Mécanisme de rupture identifié

La migration `add_user_role_enum` (ligne 17) :
```sql
UPDATE "User" SET role = 'USER' WHERE role NOT IN ('USER', 'ADMIN');
```

**Ce SQL est exécuté APRÈS le UPPER()** (ligne 14). Donc si un utilisateur avait :
- `role = 'admin'` → converti en `'ADMIN'` → conservé ✓
- `role = 'Admin'` → converti en `'ADMIN'` → conservé ✓
- `role = 'ADMIN'` → reste `'ADMIN'` → conservé ✓
- `role = NULL` → ignoré par UPPER (WHERE role IS NOT NULL) → **pas converti** → `NOT IN ('USER', 'ADMIN')` est **UNKNOWN pour NULL** → **pas mis à jour non plus** → reste NULL → **la colonne est ensuite castée en Enum** → **ERREUR ou valeur par défaut USER**

**Scénario de rupture possible** :
Si le rôle ADMIN était stocké avec une valeur `null` temporairement (par un bug ou une manipulation directe en base), la migration aurait pu le convertir en `USER` silencieusement.

## 4.2 Autres vecteurs de rupture du rôle ADMIN

### VECTEUR #1 — admin.controller.js createUser() utilise un champ inexistant

**Fichier** : `backend/controllers/admin.controller.js:195-204`

```javascript
const hashed = await bcrypt.hash(password, 10);
const created = await prisma.user.create({
  data: {
    email: normalizedEmail,
    passwordHash: hashed,  // ← CE CHAMP N'EXISTE PLUS DANS LE SCHEMA
    nom: nom?.trim() || '',
    role: (role || 'MEMBER').toUpperCase(),  // ← 'MEMBER' n'est pas une valeur UserRole valide
    ...
  }
});
```

**Deux bugs critiques** :
1. `passwordHash` a été supprimé par la migration `20260129_remove_password_hash`. Cet appel **plantera systématiquement** avec une erreur Prisma.
2. Le rôle par défaut est `'MEMBER'` au lieu de `'USER'`. `MEMBER` est un `WorkspaceRole`, pas un `UserRole`. L'enum `UserRole` n'accepte que `USER` ou `ADMIN`.

**Conséquence** : La route `POST /api/admin/users` est **cassée**. Un admin ne peut pas créer de nouveaux utilisateurs via cette route.

### VECTEUR #2 — admin.controller.js updateUser() sans protection ADMIN

**Fichier** : `backend/controllers/admin.controller.js:441-473`

```javascript
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { role, isActive } = req.body || {};
  const data = {};
  if (typeof role === 'string') data.role = role.toUpperCase();
  if (typeof isActive === 'boolean') data.isActive = isActive;
  const updated = await prisma.user.update({ where: { id }, data });
```

**Aucune vérification** empêchant de :
1. Retirer le rôle ADMIN au **dernier** administrateur
2. Désactiver (`isActive: false`) le **dernier** administrateur
3. Un admin de se retirer son propre rôle ADMIN

### VECTEUR #3 — register() crée toujours des USER

**Fichier** : `backend/controllers/auth.controller.js:116`

```javascript
role: 'USER',
```

Tout nouvel utilisateur via inscription est `USER`. C'est normal. Mais si le premier utilisateur du système est créé via `/register` (après Supabase), il est `USER`. Il n'y a **aucun mécanisme de bootstrap** pour créer le premier ADMIN.

### VECTEUR #4 — Pas de contrainte DB empêchant zéro ADMIN

Le schéma Prisma ne contient **aucune** contrainte garantissant qu'au moins un utilisateur ADMIN actif existe. C'est un invariant qui ne peut être garanti que par l'application.

## 4.3 Invariants NON-NÉGOCIABLES

| ID | Invariant | Niveau |
|----|-----------|--------|
| **ADM-1** | Le système DOIT toujours avoir au moins 1 utilisateur avec `role = ADMIN` et `isActive = true` | DB + Application |
| **ADM-2** | Aucune opération ne peut retirer le rôle ADMIN au dernier admin actif | Application |
| **ADM-3** | Aucune opération ne peut désactiver le dernier admin actif | Application |
| **ADM-4** | Les migrations SQL doivent vérifier le nombre d'admins AVANT et APRÈS exécution | Migration |
| **ADM-5** | Un admin ne peut pas se retirer son propre rôle ADMIN s'il est le dernier | Application |

---

# PART 5 — Modèle cible & plan de correction

## 5.1 Modèle cible du cycle de vie auth

### Initialisation (démarrage app)

```
1. [SYNC]  Instancier SupabaseService, créer client
2. [ASYNC] getSession() → vérifier session existante
   ├── WAIT résultat
   ├── SI pas de session → authReady$ = false, isAuthenticated$ = false → FIN
   └── SI session:
       3. [SYNC]  isAuthenticated$ = true, authReady$ = false
       4. [ASYNC] syncUserProfile() → GET /api/auth/profile
          ├── WAIT réponse
          ├── SI 403 → createProfileFromSupabase() → WAIT
          └── SI succès → currentUser$ = user
              5. [ASYNC] ensureWorkspaceSelected() → GET /api/workspaces/me (si nécessaire)
                 ├── WAIT réponse
                 └── Sélection auto workspace
                     6. [SYNC] authReady$ = true
7. [SYNC]  SEULEMENT APRÈS authReady$ = true:
           └── Enregistrer listener onAuthStateChange
           └── Démarrer SyncService polling
           └── Démarrer GlobalPreloader
```

**Différence clé** : `listenToAuthStateChanges()` est enregistré **APRÈS** l'initialisation, pas avant.

### Login

```
1. [ASYNC] supabase.signInWithPassword(credentials)
   ├── WAIT réponse
   ├── SI erreur → afficher message → FIN
   └── SI succès → SIGNED_IN déclenché
       2. [SYNC]  isAuthenticated$ = true, authReady$ = false
       3. [ASYNC] syncUserProfile() → GET /api/auth/profile
          ├── WAIT réponse
          └── SI succès → currentUser$ = user
              4. [ASYNC] ensureWorkspaceSelected()
                 └── WAIT réponse
                     5. [SYNC] authReady$ = true
       6. [ASYNC] LoginComponent réagit → navigation vers returnUrl
```

### Logout

```
1. [SYNC]  isLoggingOut = true (flag idempotence)
2. [ASYNC] supabase.signOut()
   └── SIGNED_OUT déclenché
       3. [SYNC]  currentUser$ = null
       4. [SYNC]  isAuthenticated$ = false
       5. [SYNC]  authReady$ = false
       6. [SYNC]  SyncService.stopPeriodicSync()
       7. [ASYNC] clearCachedProfile()
       8. [ASYNC] workspaceService.clear()
       9. [ASYNC] indexedDb.clearAll()
      10. [SYNC]  router.navigate(['/login'])
      11. [SYNC]  isLoggingOut = false
```

### Guards (modèle cible)

```
AuthGuard:
  1. Attendre authReady$ avec filter(v => v === true), take(1)
     └── timeout(10000) → rediriger vers /login si jamais prêt
  2. SI authReady$ = true → return true
  3. SI timeout → router.navigate(['/login']), return false

RoleGuard:
  PRÉREQUIS: AuthGuard passé (authReady$ = true garanti)
  1. Lire currentUser$ avec take(1) → user garanti non-null
  2. Vérifier user.role vs route.data.role
  3. SI mismatch → notification + redirection /

WorkspaceSelectedGuard:
  PRÉREQUIS: AuthGuard passé
  1. Vérifier workspace sélectionné en mémoire
  2. SI pas de workspace → /select-workspace
  3. SI workspace existe → vérifier validité (cache ou HTTP)

WriteGuard:
  PRÉREQUIS: WorkspaceSelectedGuard passé
  1. Vérifier PermissionsService.canWrite() → synchrone
```

## 5.2 Plan de correction ordonné

### Phase 0 — Corrections critiques immédiates (sécurité)

| # | Action | Fichier(s) | Réversible | Risque |
|---|--------|-----------|------------|--------|
| **0.1** | Corriger `admin.controller.js` `createUser()` : retirer `passwordHash`, changer `MEMBER` → `USER` | `backend/controllers/admin.controller.js` | Oui | Faible |
| **0.2** | Ajouter protection "dernier admin" dans `updateUser()` : compter les admins actifs avant modification | `backend/controllers/admin.controller.js` | Oui | Faible |
| **0.3** | Ajouter protection "dernier admin" dans `updateProfile()` si admin modifie son propre rôle | `backend/controllers/auth.controller.js` | Oui | Faible |
| **0.4** | Créer script de vérification : compter les admins actifs en base, alerter si < 1 | `backend/scripts/check-admin-count.js` | N/A | Nul |

### Phase 1 — Corriger les race conditions auth (stabilité)

| # | Action | Fichier(s) | Réversible | Risque |
|---|--------|-----------|------------|--------|
| **1.1** | Déplacer `listenToAuthStateChanges()` APRÈS la résolution de `getSession()` dans `initializeAuth()`. Ajouter un flag `_initDone` pour que `handleSignedIn` ne réexécute pas si init a déjà fait le travail | `frontend/src/app/core/services/auth.service.ts` | Oui | Moyen |
| **1.2** | Ajouter flag `isLoggingOut` dans `AuthService` pour rendre `logout()` idempotent | `frontend/src/app/core/services/auth.service.ts` | Oui | Faible |
| **1.3** | Modifier `AuthGuard` : remplacer `take(1)` par `filter(v => v === true), take(1), timeout(10000)` pour **attendre** que authReady$ devienne true au lieu de capturer la valeur courante | `frontend/src/app/core/guards/auth.guard.ts` | Oui | Moyen |
| **1.4** | Modifier `RoleGuard` : ajouter `authReady$.pipe(filter(v => v), take(1))` avant de lire `currentUser$` | `frontend/src/app/core/guards/role.guard.ts` | Oui | Faible |

### Phase 2 — Corriger les notifications et interceptors (UX)

| # | Action | Fichier(s) | Réversible | Risque |
|---|--------|-----------|------------|--------|
| **2.1** | Dans `HttpErrorInterceptor` : vérifier `isLoggingOut` avant de déclencher `logout()`. Si déjà en cours, ne pas refaire | `frontend/src/app/core/errors/http-error.interceptor.ts` | Oui | Faible |
| **2.2** | Dans `HttpErrorInterceptor` : ajouter un debounce/flag pour ne pas afficher N erreurs 401 simultanées | `frontend/src/app/core/errors/http-error.interceptor.ts` | Oui | Faible |
| **2.3** | Lier `SyncService` au lifecycle auth : `startPeriodicSync()` uniquement quand `authReady$ = true`, `stopPeriodicSync()` quand `authReady$ = false` | `frontend/src/app/core/services/sync.service.ts` | Oui | Faible |

### Phase 3 — Supprimer les guards dupliqués (nettoyage)

| # | Action | Fichier(s) | Réversible | Risque |
|---|--------|-----------|------------|--------|
| **3.1** | Retirer `AuthGuard` du `canActivate` de `admin-routing.module.ts` (déjà présent au niveau parent dans `app.module.ts`) | `frontend/src/app/features/admin/admin-routing.module.ts` | Oui | Faible |
| **3.2** | Supprimer l'appel HTTP de validation workspace dans `WorkspaceSelectedGuard` si `authReady$` garantit déjà qu'un workspace est sélectionné. Conserver uniquement la vérification en mémoire + cache | `frontend/src/app/core/guards/workspace-selected.guard.ts` | Oui | Moyen |

### Phase 4 — Hardening ADMIN (protection structurelle)

| # | Action | Fichier(s) | Réversible | Risque |
|---|--------|-----------|------------|--------|
| **4.1** | Créer un service backend `admin-safety.service.js` avec une fonction `ensureMinOneAdmin()` qui vérifie le count avant toute mutation de rôle/statut | `backend/services/business/admin-safety.service.js` | Oui | Faible |
| **4.2** | Intégrer `ensureMinOneAdmin()` dans `updateUser()` et `updateProfile()` | `backend/controllers/admin.controller.js`, `backend/controllers/auth.controller.js` | Oui | Faible |
| **4.3** | Ajouter une vérification pré-migration dans un script `pre-migrate-check.js` qui compte les admins et refuse la migration si count < 1 | `backend/scripts/pre-migrate-check.js` | N/A | Nul |
| **4.4** | Documenter la procédure de récupération d'admin (script SQL direct sur Supabase) | `docs/reference/ADMIN_RECOVERY.md` | N/A | Nul |

## 5.3 Stratégie de récupération ADMIN

Si le système se retrouve sans admin actif :

```sql
-- 1. Identifier les utilisateurs existants
SELECT id, email, role, "isActive" FROM "User" ORDER BY "createdAt" ASC;

-- 2. Restaurer le rôle ADMIN au premier utilisateur (ou au compte principal)
UPDATE "User" SET role = 'ADMIN', "isActive" = true 
WHERE email = '<email_admin_principal>';

-- 3. Vérifier
SELECT count(*) FROM "User" WHERE role = 'ADMIN' AND "isActive" = true;
-- Doit retourner >= 1
```

## 5.4 Mécanisme de protection DB (cible)

```sql
-- Trigger PostgreSQL empêchant la suppression du dernier admin
CREATE OR REPLACE FUNCTION check_min_admin_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.role = 'ADMIN' AND (NEW.role != 'ADMIN' OR NEW."isActive" = false)) THEN
    IF (SELECT count(*) FROM "User" WHERE role = 'ADMIN' AND "isActive" = true AND id != OLD.id) < 1 THEN
      RAISE EXCEPTION 'Cannot remove the last active ADMIN user';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_min_admin
  BEFORE UPDATE ON "User"
  FOR EACH ROW
  EXECUTE FUNCTION check_min_admin_count();
```

**Note** : Ce trigger est une proposition. Il doit être validé et testé avant déploiement. Il peut être implémenté comme migration Prisma.

---

## ANNEXE A — Fichiers audités

| Fichier | Rôle |
|---------|------|
| `backend/middleware/auth.middleware.js` | Vérification token Supabase, cache user |
| `backend/middleware/workspace.middleware.js` | Résolution workspace, guards mutation |
| `backend/controllers/auth.controller.js` | Profil, register, logout |
| `backend/controllers/admin.controller.js` | CRUD users, overview, bulk ops |
| `backend/routes/index.js` | Montage des routes + middlewares |
| `backend/routes/auth.routes.js` | Routes auth publiques/protégées |
| `backend/routes/admin.routes.js` | Routes admin protégées |
| `backend/routes/workspace.routes.js` | Routes workspace user/admin |
| `backend/prisma/schema.prisma` | Schéma DB (User, Workspace, WorkspaceUser) |
| `backend/config/index.js` | Config centralisée |
| `backend/server.js` | Point d'entrée serveur |
| `frontend/src/app/core/services/auth.service.ts` | Service auth principal |
| `frontend/src/app/core/services/supabase.service.ts` | Client Supabase |
| `frontend/src/app/core/services/workspace.service.ts` | Gestion workspace courant |
| `frontend/src/app/core/services/permissions.service.ts` | Vérification permissions |
| `frontend/src/app/core/services/notification.service.ts` | Notifications snackbar |
| `frontend/src/app/core/services/sync.service.ts` | Synchronisation multi-onglets + polling |
| `frontend/src/app/core/guards/auth.guard.ts` | Guard authentification |
| `frontend/src/app/core/guards/role.guard.ts` | Guard rôle admin |
| `frontend/src/app/core/guards/workspace-selected.guard.ts` | Guard workspace sélectionné |
| `frontend/src/app/core/guards/write.guard.ts` | Guard écriture |
| `frontend/src/app/core/guards/mobile.guard.ts` | Guard mobile |
| `frontend/src/app/core/interceptors/auth.interceptor.ts` | Injection token HTTP |
| `frontend/src/app/core/interceptors/workspace.interceptor.ts` | Injection X-Workspace-Id |
| `frontend/src/app/core/interceptors/workspace-error.interceptor.ts` | Gestion erreurs workspace |
| `frontend/src/app/core/interceptors/backend-status.interceptor.ts` | Détection backend down |
| `frontend/src/app/core/errors/http-error.interceptor.ts` | Gestion centralisée erreurs HTTP |
| `frontend/src/app/app.module.ts` | Routes principales + guards |
| `frontend/src/app/app.component.ts` | Composant racine |
| `frontend/src/app/features/auth/login/login.component.ts` | Composant login |
| `frontend/src/app/features/admin/admin-routing.module.ts` | Routes admin |
| `frontend/src/app/core/core.module.ts` | Enregistrement interceptors |

## ANNEXE B — Résumé des bugs critiques

| ID | Sévérité | Description | Impact |
|----|----------|-------------|--------|
| **CRIT-1** | 🔴 CRITIQUE | `createUser()` utilise `passwordHash` (champ supprimé) | Route admin cassée |
| **CRIT-2** | 🔴 CRITIQUE | `createUser()` utilise `MEMBER` comme UserRole (invalide) | Route admin cassée |
| **CRIT-3** | 🔴 CRITIQUE | Aucune protection contre la suppression du dernier ADMIN | Risque de lockout |
| **RACE-1** | 🟠 MAJEUR | Double exécution initializeAuth + SIGNED_IN | Requêtes dupliquées, état incohérent |
| **RACE-2** | 🟠 MAJEUR | AuthGuard take(1) retourne false pendant init | Écran blanc, clic multiple requis |
| **RACE-3** | 🟡 MOYEN | RoleGuard évalue currentUser$ avant chargement | Redirection erronée vers /login |
| **RACE-4** | 🟡 MOYEN | Token pas disponible immédiatement après SIGNED_IN | 401 transitoire possible |
| **DUP-1** | 🟡 MOYEN | Double AuthGuard sur routes admin | Guards exécutés 2 fois |
| **DUP-2** | 🟡 MOYEN | WorkspaceSelectedGuard fait un HTTP redondant | Latence inutile |
| **NOTIF-1** | 🟡 MOYEN | Erreurs 401 multiples → N notifications + N logouts | UX dégradée, boucles |
| **NOTIF-2** | 🟡 MOYEN | SyncService poll sans vérifier auth state | 401 en boucle si token expiré |
| **LEGACY-1** | 🟢 MINEUR | `server.js:29` référence `config.jwt.refreshSecret` (inexistant) | Warning au démarrage |
