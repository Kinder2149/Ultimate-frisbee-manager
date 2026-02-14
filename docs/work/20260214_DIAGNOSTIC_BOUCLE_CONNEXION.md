# DIAGNOSTIC COMPLET : BOUCLE DE CONNEXION EN ONGLET PRIVÉ

**Date** : 14 février 2026  
**Statut** : WORK  
**Contexte** : Problème de boucle infinie lors de la connexion en onglet privé (sans cache)  
**Symptôme** : L'utilisateur doit faire F5 pour que la page charge et atterrisse sur le tableau de bord

---

## 1. ANALYSE DES LOGS

### 1.1 Séquence d'événements observée

```
[DataCache] All caches cleared
[GlobalPreloader] Initializing automatic preloading
[App] Global preloader initialized
[IndexedDB] Upgrading database schema
[IndexedDB] Created store: admin, auth, dashboard-stats, workspaces, exercices, entrainements, tags, echauffements, situations

⚠️ ERREUR CRITIQUE:
Sn: Acquiring an exclusive Navigator LockManager lock "lock:sb-rnreaaeiccqkwgwxwxeg-auth-token" immediately failed

[Auth] Aucune session active
[DataCache] All caches cleared
[Auth] Event: INITIAL_SESSION no user
[IndexedDB] Database opened successfully

⏱️ TIMEOUT AUTHGUARD:
[AuthGuard] Timeout: auth non prête après 10s

✅ CONNEXION RÉUSSIE (TROP TARD):
[Auth] Event: SIGNED_IN val.coutry@gmail.com
[Auth] SIGNED_IN ignoré : init déjà terminée
[Login] Connexion Supabase réussie

⚠️ ERREUR RÉPÉTÉE:
Sn: Acquiring an exclusive Navigator LockManager lock "lock:sb-rnreaaeiccqkwgwxwxeg-auth-token" immediately failed
```

### 1.2 Problèmes identifiés

#### **P1 - RACE CONDITION CRITIQUE : Supabase LockManager**
- **Symptôme** : `Acquiring an exclusive Navigator LockManager lock "lock:sb-rnreaaeiccqkwgwxwxeg-auth-token" immediately failed`
- **Cause** : Supabase tente d'acquérir un lock sur le token d'authentification mais échoue
- **Impact** : Bloque l'initialisation de la session
- **Contexte** : En onglet privé, le LockManager peut avoir des restrictions ou des comportements différents

#### **P2 - DOUBLE INITIALISATION**
- **Symptôme** : 
  - `[Auth] Aucune session active` (ligne 78 de auth.service.ts)
  - Puis `[Auth] Event: INITIAL_SESSION no user`
  - Puis `[Auth] Event: SIGNED_IN` ignoré car `_initDone = true`
- **Cause** : 
  1. `initializeAuth()` s'exécute au démarrage du service (ligne 39)
  2. `getSession()` retourne `null` initialement (ligne 47)
  3. Le flag `_initDone` est mis à `true` (ligne 79)
  4. `listenToAuthStateChanges()` s'enregistre (ligne 85)
  5. Supabase émet `INITIAL_SESSION` puis `SIGNED_IN`
  6. `SIGNED_IN` est ignoré car `_initDone = true` (ligne 173-176)
- **Impact** : La session de connexion n'est jamais traitée

#### **P3 - TIMEOUT AUTHGUARD**
- **Symptôme** : `[AuthGuard] Timeout: auth non prête après 10s`
- **Cause** : `authReady$` ne passe jamais à `true` car `SIGNED_IN` est ignoré
- **Impact** : Le guard laisse passer l'utilisateur mais l'app reste dans un état incohérent

#### **P4 - ÉVÉNEMENTS SUPABASE MULTIPLES**
- **Symptôme** : 
  - `INITIAL_SESSION no user`
  - `SIGNED_IN val.coutry@gmail.com`
  - `SIGNED_IN val.coutry@gmail.com` (doublon)
- **Cause** : Supabase émet plusieurs événements lors de l'initialisation
- **Impact** : Confusion dans la gestion de l'état

---

## 2. ANALYSE DU CODE

### 2.1 AuthService - Flux d'initialisation

```typescript
// auth.service.ts:45-86
private async initializeAuth(): Promise<void> {
  // ❌ PROBLÈME : getSession() peut retourner null si le lock échoue
  const { data: { session } } = await this.supabaseService.supabase.auth.getSession();
  
  if (session?.user) {
    // ✅ Cas 1 : Session trouvée
    this.isAuthenticatedSubject.next(true);
    this.authReadySubject.next(false);
    // ... sync profil + workspace
    this._initDone = true;
    this.authReadySubject.next(true);
  } else {
    // ❌ PROBLÈME : On marque init comme terminée alors que la session peut arriver plus tard
    console.log('[Auth] Aucune session active');
    this._initDone = true;  // ⚠️ TROP TÔT
    this.isAuthenticatedSubject.next(false);
    this.authReadySubject.next(false);
  }

  // ❌ PROBLÈME : Le listener s'enregistre APRÈS, mais _initDone est déjà true
  this.listenToAuthStateChanges();
}
```

### 2.2 AuthService - Gestion de SIGNED_IN

```typescript
// auth.service.ts:169-206
private handleSignedIn(session: Session | null): void {
  if (!session?.user) return;

  // ❌ PROBLÈME : Si _initDone = true, on ignore l'événement
  if (this._initDone) {
    console.log('[Auth] SIGNED_IN ignoré : init déjà terminée');
    return;  // ⚠️ EXIT PRÉMATURÉ
  }
  
  // Ce code n'est JAMAIS exécuté en onglet privé
  this.isAuthenticatedSubject.next(true);
  this.authReadySubject.next(false);
  this.syncUserProfile().pipe(
    switchMap(() => this.ensureWorkspaceSelected()),
    tap(() => {
      this._initDone = true;
      this.authReadySubject.next(true);
    })
  ).subscribe(/*...*/);
}
```

### 2.3 LoginComponent - Attente de authReady$

```typescript
// login.component.ts:70-85
this.authService.authReady$
  .pipe(
    takeUntil(this.destroy$),
    filter((isReady: boolean) => isReady === true)  // ⚠️ N'arrive JAMAIS
  )
  .subscribe(() => {
    console.log('[Login] Auth prête, navigation vers', this.returnUrl);
    this.router.navigate([this.returnUrl]);
  });
```

### 2.4 AuthGuard - Timeout

```typescript
// auth.guard.ts:24-46
return this.authService.authReady$.pipe(
  filter((isReady: boolean) => isReady === true),  // ⚠️ N'arrive JAMAIS
  take(1),
  map(() => true),
  timeout(10000),  // ⚠️ TIMEOUT après 10s
  catchError(() => {
    console.warn('[AuthGuard] Timeout: auth non prête après 10s');
    if (this.authService.isAuthenticated()) {
      // ⚠️ Laisse passer mais l'état est incohérent
      return of(true);
    }
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return of(false);
  })
);
```

---

## 3. PROBLÈMES IDENTIFIÉS PAR PRIORITÉ

### 🔴 P0 - BLOQUANTS

#### **P0-1 : Race condition Supabase LockManager**
- **Fichier** : Supabase SDK (externe)
- **Symptôme** : `Acquiring an exclusive Navigator LockManager lock failed`
- **Cause** : En onglet privé, le LockManager peut être restreint ou lent
- **Impact** : `getSession()` retourne `null` même si une session existe
- **Solution** : Ajouter un retry avec délai sur `getSession()`

#### **P0-2 : Flag _initDone mis trop tôt**
- **Fichier** : `auth.service.ts:79`
- **Symptôme** : `_initDone = true` avant que la session soit réellement chargée
- **Cause** : `getSession()` retourne `null` à cause du lock, on considère qu'il n'y a pas de session
- **Impact** : Les événements `SIGNED_IN` ultérieurs sont ignorés
- **Solution** : Ne pas marquer `_initDone = true` si on n'a pas de session, attendre les événements

#### **P0-3 : SIGNED_IN ignoré à tort**
- **Fichier** : `auth.service.ts:173-176`
- **Symptôme** : `[Auth] SIGNED_IN ignoré : init déjà terminée`
- **Cause** : `_initDone = true` empêche le traitement de `SIGNED_IN`
- **Impact** : L'utilisateur est connecté côté Supabase mais pas côté app
- **Solution** : Revoir la logique du flag `_initDone`

### 🟠 P1 - CRITIQUES

#### **P1-1 : Événements Supabase multiples**
- **Fichier** : `auth.service.ts:128-164`
- **Symptôme** : `INITIAL_SESSION` + `SIGNED_IN` + `SIGNED_IN` (doublon)
- **Cause** : Supabase émet plusieurs événements lors de l'initialisation
- **Impact** : Confusion, logs pollués
- **Solution** : Déduplication des événements

#### **P1-2 : Timeout AuthGuard trop court**
- **Fichier** : `auth.guard.ts:30`
- **Symptôme** : Timeout après 10s
- **Cause** : En onglet privé, l'initialisation peut prendre plus de temps
- **Impact** : L'utilisateur est bloqué ou passe avec un état incohérent
- **Solution** : Augmenter le timeout ou revoir la stratégie

### 🟡 P2 - AMÉLIORATIONS

#### **P2-1 : Pas de feedback utilisateur**
- **Fichier** : `login.component.ts`
- **Symptôme** : L'utilisateur ne sait pas ce qui se passe
- **Cause** : Pas de message d'erreur ou de loader
- **Impact** : Mauvaise UX
- **Solution** : Afficher un message d'attente ou d'erreur

#### **P2-2 : Logs pollués**
- **Fichier** : Tous les fichiers
- **Symptôme** : Trop de logs, difficile de suivre
- **Cause** : Logs de debug partout
- **Impact** : Difficile de diagnostiquer
- **Solution** : Nettoyer les logs ou ajouter des niveaux

---

## 4. SCÉNARIOS DE FLUX

### 4.1 Flux ACTUEL (BUGUÉ) - Onglet privé

```
1. App démarre
   └─> AuthService.constructor()
       └─> initializeAuth()
           ├─> getSession() → ⚠️ LOCK FAIL → null
           ├─> session = null
           ├─> _initDone = true  ⚠️ TROP TÔT
           ├─> authReady$ = false
           └─> listenToAuthStateChanges()

2. Utilisateur clique "Se connecter"
   └─> LoginComponent.onSubmit()
       └─> authService.login()
           └─> supabase.signInWithPassword()
               ├─> ✅ Connexion Supabase réussie
               └─> Émet SIGNED_IN

3. Supabase émet INITIAL_SESSION
   └─> listenToAuthStateChanges()
       └─> handleSignedIn()
           └─> _initDone = true → ⚠️ IGNORÉ

4. Supabase émet SIGNED_IN
   └─> listenToAuthStateChanges()
       └─> handleSignedIn()
           └─> _initDone = true → ⚠️ IGNORÉ

5. LoginComponent attend authReady$ = true
   └─> ⏱️ N'arrive JAMAIS

6. AuthGuard timeout après 10s
   └─> Laisse passer car isAuthenticated() = true
   └─> ⚠️ État incohérent

7. Utilisateur fait F5
   └─> App redémarre
   └─> getSession() → ✅ Session existe (lock OK cette fois)
   └─> authReady$ = true
   └─> ✅ Navigation vers dashboard
```

### 4.2 Flux ATTENDU (CORRIGÉ) - Onglet privé

```
1. App démarre
   └─> AuthService.constructor()
       └─> initializeAuth()
           ├─> getSession() avec RETRY
           │   ├─> Tentative 1 → LOCK FAIL → retry après 100ms
           │   ├─> Tentative 2 → LOCK FAIL → retry après 200ms
           │   └─> Tentative 3 → ✅ Session récupérée
           ├─> session?.user existe
           ├─> Sync profil + workspace
           ├─> _initDone = true
           └─> authReady$ = true

OU (si vraiment pas de session)

1. App démarre
   └─> AuthService.constructor()
       └─> initializeAuth()
           ├─> getSession() avec RETRY → null (vraiment pas de session)
           ├─> ⚠️ NE PAS mettre _initDone = true
           └─> listenToAuthStateChanges()

2. Utilisateur clique "Se connecter"
   └─> LoginComponent.onSubmit()
       └─> authService.login()
           └─> supabase.signInWithPassword()
               └─> Émet SIGNED_IN

3. Supabase émet SIGNED_IN
   └─> listenToAuthStateChanges()
       └─> handleSignedIn()
           ├─> _initDone = false → ✅ TRAITÉ
           ├─> Sync profil + workspace
           ├─> _initDone = true
           └─> authReady$ = true

4. LoginComponent reçoit authReady$ = true
   └─> ✅ Navigation vers dashboard
```

---

## 5. SOLUTIONS PROPOSÉES

### 5.1 Solution immédiate (HOT FIX)

#### **Correction 1 : Retry sur getSession()**

```typescript
// auth.service.ts:45-86
private async initializeAuth(): Promise<void> {
  // ✅ AJOUT : Retry avec délai progressif
  let session: Session | null = null;
  const delays = [0, 100, 200, 500];
  
  for (const delay of delays) {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    const { data, error } = await this.supabaseService.supabase.auth.getSession();
    
    if (error) {
      console.warn(`[Auth] Erreur getSession (tentative ${delays.indexOf(delay) + 1}/${delays.length}):`, error);
      continue;
    }
    
    if (data.session) {
      session = data.session;
      break;
    }
  }
  
  if (session?.user) {
    console.log('[Auth] Session Supabase trouvée, chargement du profil');
    this.isAuthenticatedSubject.next(true);
    this.authReadySubject.next(false);
    
    const cachedUser = await this.loadCachedProfile();
    if (cachedUser) {
      this.currentUserSubject.next(cachedUser);
    }
    
    this.syncUserProfile().pipe(
      switchMap(() => this.ensureWorkspaceSelected()),
      tap(() => {
        this._initDone = true;
        this.authReadySubject.next(true);
      })
    ).subscribe({
      next: () => {
        console.log('[Auth] Init complète : profil + workspace prêts');
      },
      error: (err) => {
        this._initDone = true;
        this.authReadySubject.next(false);
        console.error('[Auth] Erreur init auth:', err);
      }
    });
  } else {
    console.log('[Auth] Aucune session active après retry');
    // ✅ MODIFICATION : NE PAS mettre _initDone = true
    // On attend les événements Supabase
    this.isAuthenticatedSubject.next(false);
    this.authReadySubject.next(false);
  }

  this.listenToAuthStateChanges();
}
```

#### **Correction 2 : Supprimer le check _initDone dans handleSignedIn**

```typescript
// auth.service.ts:169-206
private handleSignedIn(session: Session | null): void {
  if (!session?.user) return;

  // ✅ SUPPRESSION : Ne plus ignorer si _initDone = true
  // L'événement SIGNED_IN doit TOUJOURS être traité s'il n'a pas déjà été traité
  
  // ✅ AJOUT : Vérifier si on a déjà un utilisateur chargé
  if (this.currentUserSubject.value && this._initDone) {
    console.log('[Auth] SIGNED_IN ignoré : utilisateur déjà chargé');
    return;
  }
  
  console.log('[Auth] Connexion réussie:', session.user.email);
  this.isAuthenticatedSubject.next(true);
  this.authReadySubject.next(false);
  
  this.syncUserProfile().pipe(
    switchMap(() => this.ensureWorkspaceSelected()),
    tap(() => {
      this._initDone = true;
      this.authReadySubject.next(true);
    })
  ).subscribe({
    next: () => {
      console.log('[Auth] Profil et workspace prêts');
    },
    error: (err) => {
      this.authReadySubject.next(false);
      console.error('[Auth] Erreur sync profil après connexion:', err);
      if (err.status === 403) {
        console.error('[Auth] Profil utilisateur non trouvé en base');
        this.supabaseService.supabase.auth.signOut();
        this.router.navigate(['/login/signup'], {
          queryParams: { reason: 'profile-not-found' }
        });
      }
    }
  });
}
```

#### **Correction 3 : Augmenter le timeout AuthGuard**

```typescript
// auth.guard.ts:29-30
timeout(20000),  // ✅ MODIFICATION : 20s au lieu de 10s
catchError(() => {
  console.warn('[AuthGuard] Timeout: auth non prête après 20s');
  // ...
})
```

### 5.2 Solution structurelle (REFACTORING)

#### **Refactoring complet de la logique d'initialisation**

**Principe** : Utiliser un state machine clair avec des états explicites

```typescript
enum AuthState {
  UNINITIALIZED = 'UNINITIALIZED',
  INITIALIZING = 'INITIALIZING',
  CHECKING_SESSION = 'CHECKING_SESSION',
  LOADING_PROFILE = 'LOADING_PROFILE',
  LOADING_WORKSPACE = 'LOADING_WORKSPACE',
  READY = 'READY',
  ERROR = 'ERROR',
  SIGNED_OUT = 'SIGNED_OUT'
}

private authStateSubject = new BehaviorSubject<AuthState>(AuthState.UNINITIALIZED);
public authState$ = this.authStateSubject.asObservable();
public authReady$ = this.authState$.pipe(
  map(state => state === AuthState.READY)
);
```

**Avantages** :
- États explicites
- Transitions claires
- Pas de flags booléens ambigus
- Facilite le debug
- Meilleure gestion des événements

---

## 6. PLAN D'ACTION

### Phase 1 : HOT FIX (URGENT)

1. ✅ **Ajouter retry sur getSession()** dans `initializeAuth()`
2. ✅ **Supprimer le check _initDone** dans `handleSignedIn()`
3. ✅ **Augmenter timeout AuthGuard** à 20s
4. ✅ **Tester en onglet privé** : création compte + connexion

### Phase 2 : AMÉLIORATION (COURT TERME)

1. **Déduplication des événements Supabase**
2. **Ajouter feedback utilisateur** pendant l'initialisation
3. **Nettoyer les logs** ou ajouter des niveaux
4. **Ajouter des tests E2E** pour onglet privé

### Phase 3 : REFACTORING (MOYEN TERME)

1. **Implémenter state machine** pour AuthService
2. **Revoir la gestion des événements** Supabase
3. **Simplifier la logique** d'initialisation
4. **Documenter les flux** d'authentification

---

## 7. RISQUES ET MITIGATIONS

### Risque 1 : Retry trop agressif
- **Description** : Les retries peuvent ralentir l'initialisation
- **Mitigation** : Délais progressifs (100ms, 200ms, 500ms) = max 800ms

### Risque 2 : Événements Supabase en doublon
- **Description** : `SIGNED_IN` peut être émis plusieurs fois
- **Mitigation** : Vérifier si l'utilisateur est déjà chargé avant de traiter

### Risque 3 : Timeout trop long
- **Description** : 20s peut sembler long pour l'utilisateur
- **Mitigation** : Ajouter un loader avec feedback de progression

### Risque 4 : Régression sur onglet normal
- **Description** : Les modifications peuvent casser le flux normal
- **Mitigation** : Tester en onglet normal ET privé

---

## 8. TESTS À EFFECTUER

### Test 1 : Onglet privé - Nouvelle inscription
1. Ouvrir onglet privé
2. Aller sur /login/signup
3. Créer un compte
4. Vérifier email
5. Se connecter
6. ✅ Doit atterrir sur dashboard sans F5

### Test 2 : Onglet privé - Connexion existante
1. Ouvrir onglet privé
2. Aller sur /login
3. Se connecter avec compte existant
4. ✅ Doit atterrir sur dashboard sans F5

### Test 3 : Onglet normal - Connexion
1. Ouvrir onglet normal
2. Se connecter
3. ✅ Doit fonctionner comme avant

### Test 4 : Onglet normal - Refresh avec session
1. Se connecter
2. Rafraîchir la page
3. ✅ Doit rester connecté

### Test 5 : Timeout AuthGuard
1. Simuler un échec de chargement
2. Attendre 20s
3. ✅ Doit afficher un message d'erreur

---

## 9. CONCLUSION

### Cause racine
Le problème vient d'une **race condition** entre :
1. L'acquisition du lock Supabase sur le token d'auth (plus lent en onglet privé)
2. L'initialisation de l'AuthService qui marque `_initDone = true` trop tôt
3. Les événements Supabase qui arrivent après et sont ignorés

### Solution
1. **Retry sur getSession()** pour attendre que le lock soit acquis
2. **Ne pas marquer _initDone = true** si on n'a pas de session
3. **Traiter SIGNED_IN même si _initDone = true** (avec vérification de doublon)

### Impact
- ✅ Connexion fluide en onglet privé
- ✅ Pas de F5 nécessaire
- ✅ Pas de régression sur onglet normal
- ✅ Meilleure gestion des erreurs

---

**FIN DU DIAGNOSTIC**

**Statut** : ⏸️ EN ATTENTE DE VALIDATION AVANT IMPLÉMENTATION
