# AUDIT — Cycle d'authentification UX incohérent

**Statut** : WORK  
**Date** : 2026-02-09  
**Auteur** : Audit système  
**Contexte** : Problème remonté utilisateur — "Je reviens sur l'écran de login alors que le chargement est lancé"

---

## 1. SYMPTÔMES OBSERVÉS

### 1.1 Comportement utilisateur

**Séquence problématique** :
1. Utilisateur arrive sur l'application (session Supabase active)
2. **Écran de login s'affiche** (formulaire visible et interactif)
3. Loader apparaît brièvement
4. **Retour au formulaire de login** (alors que l'authentification est en cours)
5. Tableau de bord apparaît
6. **Éléments du dashboard continuent de charger** après affichage

**Impact UX** :
- ❌ Confusion : "Dois-je me reconnecter ?"
- ❌ Incohérence : Formulaire visible alors que l'auth est en cours
- ❌ Chargements multiples : Impression de lenteur

### 1.2 Logs console observés

```
[Auth] Session Supabase trouvée, chargement du profil
[Auth] Event: SIGNED_IN user@example.com
[Auth] SIGNED_IN ignoré : auth déjà prête
[Auth] Profil synchronisé: user@example.com
[Auth] Workspace déjà sélectionné: BASE
[Auth] Init complète : profil + workspace prêts
[Login] Auth prête, navigation vers /
```

**Observation** : Double traitement (initializeAuth + SIGNED_IN)

---

## 2. ANALYSE TECHNIQUE

### 2.1 Race condition : initializeAuth vs SIGNED_IN

**Fichier** : `frontend/src/app/core/services/auth.service.ts`

**Problème RACE-1** :

```typescript
// Ligne 45-86 : initializeAuth()
private async initializeAuth(): Promise<void> {
  const { data: { session } } = await this.supabaseService.supabase.auth.getSession();
  
  if (session?.user) {
    // ✅ Détecte la session
    this.isAuthenticatedSubject.next(true);
    this.authReadySubject.next(false);
    
    // ✅ Lance syncUserProfile + ensureWorkspaceSelected
    this.syncUserProfile().pipe(
      switchMap(() => this.ensureWorkspaceSelected()),
      tap(() => {
        this._initDone = true;
        this.authReadySubject.next(true); // ← Passe à true
      })
    ).subscribe();
  }

  // ❌ PROBLÈME : Enregistre le listener APRÈS
  this.listenToAuthStateChanges();
}

// Ligne 169-203 : handleSignedIn()
private handleSignedIn(session: Session | null): void {
  // ✅ Protection ajoutée mais insuffisante
  if (this.authReadySubject.value === true) {
    console.log('[Auth] SIGNED_IN ignoré : auth déjà prête');
    return;
  }
  
  // ❌ Si authReady$ n'est pas encore true, relance tout
  this.syncUserProfile().pipe(
    switchMap(() => this.ensureWorkspaceSelected()),
    tap(() => this.authReadySubject.next(true))
  ).subscribe();
}
```

**Timing problématique** :
1. `initializeAuth()` détecte session → lance sync (200ms)
2. `listenToAuthStateChanges()` enregistré → reçoit `SIGNED_IN` (50ms)
3. `handleSignedIn()` vérifie `authReady$.value` → **encore false**
4. ❌ Relance `syncUserProfile()` + `ensureWorkspaceSelected()` (doublon)

**Solution** : Utiliser `_initDone` au lieu de `authReady$.value`

### 2.2 AuthGuard bloque mais l'UI reste visible

**Fichier** : `frontend/src/app/core/guards/auth.guard.ts`

**Problème RACE-2** :

```typescript
canActivate(): Observable<boolean> {
  return this.authService.authReady$.pipe(
    filter((isReady: boolean) => isReady === true), // ← Attend authReady$
    take(1),
    map(() => true),
    timeout(10000)
  );
}
```

**Fichier** : `frontend/src/app/features/auth/login/login.component.ts`

```typescript
ngOnInit(): void {
  this.authService.authReady$
    .pipe(
      filter((isReady: boolean) => isReady === true)
    )
    .subscribe(() => {
      this.router.navigate([this.returnUrl]); // ← Navigation après authReady$
    });
}
```

**Séquence problématique** :
1. App démarre → route `/` protégée par AuthGuard
2. AuthGuard attend `authReady$ === true` (bloque navigation)
3. Redirection vers `/login` (returnUrl = `/`)
4. **LoginComponent s'affiche** (formulaire visible)
5. `initializeAuth()` en cours → `isAuthenticated$ = true` mais `authReady$ = false`
6. **Utilisateur voit le formulaire** alors que l'auth est en cours
7. Finalement `authReady$ = true` → navigation vers `/`

**Impact** :
- ❌ Formulaire visible pendant 200-500ms alors qu'il ne devrait pas l'être
- ❌ Utilisateur peut cliquer sur "Se connecter" pendant ce temps

**Solution** : LoginComponent doit masquer le formulaire si `isAuthenticated$ === true`

### 2.3 Chargements multiples dans le dashboard

**Observation** : Après redirection vers `/`, certains composants chargent encore des données

**Cause probable** :
- `GlobalPreloaderService` charge les données en parallèle
- Certaines requêtes sont plus lentes (tags, exercices, etc.)
- L'utilisateur voit le dashboard avant que tout soit chargé

**Impact UX** :
- ✅ Acceptable si feedback visuel clair (skeleton loaders)
- ❌ Problématique si impression de "double chargement"

---

## 3. CORRECTIONS REQUISES

### 3.1 Correction RACE-1 : Éviter double exécution

**Fichier** : `auth.service.ts`

```typescript
private handleSignedIn(session: Session | null): void {
  if (!session?.user) return;

  // ✅ CORRECTION : Vérifier _initDone au lieu de authReady$.value
  if (this._initDone) {
    console.log('[Auth] SIGNED_IN ignoré : init déjà terminée');
    return;
  }
  
  console.log('[Auth] Connexion réussie:', session.user.email);
  this.isAuthenticatedSubject.next(true);
  this.authReadySubject.next(false);
  
  this.syncUserProfile().pipe(
    switchMap(() => this.ensureWorkspaceSelected()),
    tap(() => {
      this._initDone = true; // ← Marquer comme terminé
      this.authReadySubject.next(true);
    })
  ).subscribe();
}
```

### 3.2 Correction RACE-2 : Masquer formulaire si déjà authentifié

**Fichier** : `login.component.ts`

```typescript
ngOnInit(): void {
  this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

  // ✅ CORRECTION : Masquer le formulaire si déjà authentifié
  this.authService.isAuthenticated$
    .pipe(takeUntil(this.destroy$))
    .subscribe((isAuth) => {
      if (isAuth) {
        this.isLoading = true;
        this.loadingMessage = 'Chargement de votre profil...';
      }
    });

  this.authService.authReady$
    .pipe(
      takeUntil(this.destroy$),
      filter((isReady: boolean) => isReady === true)
    )
    .subscribe(() => {
      console.log('[Login] Auth prête, navigation vers', this.returnUrl);
      this.loadingSteps.ready = true;
      this.loadingMessage = 'Redirection...';
      
      setTimeout(() => {
        this.isLoading = false;
        this.router.navigate([this.returnUrl]);
      }, 500);
    });
}
```

**Fichier** : `login.component.html`

```html
<!-- ✅ CORRECTION : Afficher loader si isAuthenticated$ === true -->
<div *ngIf="isLoading || (authService.isAuthenticated$ | async)" class="loading-container">
  <app-auth-loader [message]="loadingMessage" [size]="40"></app-auth-loader>
  <!-- ... étapes de chargement ... -->
</div>

<div *ngIf="!isLoading && !(authService.isAuthenticated$ | async)">
  <!-- Formulaire de connexion -->
</div>
```

### 3.3 Amélioration : Feedback visuel cohérent

**Recommandation** : Ajouter un état de chargement global dans `app.component.ts`

```typescript
showGlobalLoader$ = combineLatest([
  this.authService.isAuthenticated$,
  this.authService.authReady$
]).pipe(
  map(([isAuth, isReady]) => isAuth && !isReady)
);
```

---

## 4. TESTS DE VALIDATION

### 4.1 Scénario 1 : Démarrage avec session active

**Étapes** :
1. Ouvrir l'application (session Supabase active)
2. Observer l'écran affiché

**Résultat attendu** :
- ✅ Loader affiché immédiatement
- ✅ Pas de formulaire de login visible
- ✅ Redirection vers `/` après chargement
- ✅ Logs : 1 seul appel à `syncUserProfile()`

### 4.2 Scénario 2 : Connexion manuelle

**Étapes** :
1. Ouvrir l'application (pas de session)
2. Remplir formulaire de connexion
3. Cliquer sur "Se connecter"

**Résultat attendu** :
- ✅ Loader affiché après clic
- ✅ Étapes de chargement visibles
- ✅ Redirection vers `/` après `authReady$ === true`
- ✅ Logs : 1 seul appel à `syncUserProfile()`

### 4.3 Scénario 3 : Timeout AuthGuard

**Étapes** :
1. Simuler une erreur réseau (backend down)
2. Ouvrir l'application (session active)

**Résultat attendu** :
- ✅ Timeout après 10s
- ✅ Redirection vers `/login` avec message d'erreur
- ✅ Pas de boucle infinie

---

## 5. MÉTRIQUES DE SUCCÈS

| Métrique | Avant | Cible |
|----------|-------|-------|
| Appels `syncUserProfile()` au démarrage | 2 | 1 |
| Temps avant redirection (session active) | 500-800ms | 200-400ms |
| Formulaire visible pendant init | ✅ Oui | ❌ Non |
| Logs "SIGNED_IN ignoré" | Parfois | Toujours (si init done) |

---

## 6. FICHIERS IMPACTÉS

| Fichier | Modification |
|---------|--------------|
| `frontend/src/app/core/services/auth.service.ts` | Correction `handleSignedIn()` |
| `frontend/src/app/features/auth/login/login.component.ts` | Ajout subscription `isAuthenticated$` |
| `frontend/src/app/features/auth/login/login.component.html` | Condition affichage formulaire |

---

## 7. PROCHAINES ÉTAPES

1. ✅ Implémenter corrections RACE-1 et RACE-2
2. ✅ Tester les 3 scénarios de validation
3. ✅ Mettre à jour `docs/reference/security/AUTH_STATE_SPECIFICATION.md`
4. ✅ Archiver cet audit dans `docs/history/2026/`

---

**FIN DE L'AUDIT**
