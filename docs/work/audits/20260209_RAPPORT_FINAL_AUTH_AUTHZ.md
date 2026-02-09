# RAPPORT FINAL — Correction Auth/Authz

- **Statut** : WORK (à promouvoir en REFERENCE après validation manuelle)
- **Date** : 2026-02-09
- **Référence audit** : `docs/work/audits/20260209_AUDIT_AUTH_LIFECYCLE.md`

---

## 1. FICHIERS IMPACTÉS PAR LES PHASES AUTH/AUTHZ

### Backend (5 fichiers)

| Fichier | Phase(s) | Action |
|---------|----------|--------|
| `backend/controllers/admin.controller.js` | P0.1, P0.2, P4.2 | Modifié |
| `backend/controllers/auth.controller.js` | P0.3, P4.2 | Modifié |
| `backend/services/business/admin-safety.service.js` | P4.1 | **Créé** |
| `backend/scripts/check-admin-count.js` | P0.4 | **Créé** |
| `docs/reference/ADMIN_RECOVERY.md` | P4.3 | **Créé** |

### Frontend (7 fichiers)

| Fichier | Phase(s) | Action |
|---------|----------|--------|
| `frontend/src/app/core/services/auth.service.ts` | P1.1, P1.2 | Modifié |
| `frontend/src/app/core/guards/auth.guard.ts` | P1.3 | Modifié |
| `frontend/src/app/core/guards/role.guard.ts` | P1.4 | Modifié |
| `frontend/src/app/core/errors/http-error.interceptor.ts` | P2.1, P2.2 | Modifié |
| `frontend/src/app/core/services/sync.service.ts` | P2.3 | Modifié |
| `frontend/src/app/features/admin/admin-routing.module.ts` | P3.1 | Modifié |
| `frontend/src/app/core/guards/workspace-selected.guard.ts` | P3.2 | Modifié |

**Total : 12 fichiers** (7 modifiés, 3 créés backend, 1 créé docs, 1 doc existant non modifié).

---

## 2. VÉRIFICATION DES INVARIANTS CRITIQUES

### ADM-1 — Le système doit toujours avoir ≥ 1 ADMIN actif

| Point de contrôle | État vérifié dans le code | Résultat |
|-------------------|--------------------------|----------|
| `createUser()` — `admin.controller.js:191-196` | Validation enum `['USER', 'ADMIN']`, défaut `'USER'` | ✅ OK |
| `createUser()` — `admin.controller.js:198-206` | `passwordHash` supprimé, plus de `bcrypt` | ✅ OK |
| `updateUser()` — `admin.controller.js:459-466` | Appel `ensureMinOneAdmin(id, data)` avant `prisma.user.update()` | ✅ OK |
| `updateProfile()` — `auth.controller.js:214-221` | Appel `ensureMinOneAdmin(authUser.id, data)` avant `prisma.user.update()` | ✅ OK |
| `ensureMinOneAdmin()` — `admin-safety.service.js:14-54` | Logique correcte : vérifie si user est admin actif, si mutation retirerait ce statut, compte les admins restants, bloque si ≤ 1 | ✅ OK |
| `check-admin-count.js` | Script lecture seule, `process.exitCode = 1` si 0 admin actif | ✅ OK |
| `ADMIN_RECOVERY.md` | Procédure SQL + script + recommandations documentées | ✅ OK |

**Verdict ADM-1 : ✅ GARANTI** — Aucun chemin applicatif ne peut retirer le dernier admin actif. La récupération en cas de corruption DB directe est documentée.

### RACE-1 — Double exécution initializeAuth() + SIGNED_IN

| Point de contrôle | État vérifié dans le code | Résultat |
|-------------------|--------------------------|----------|
| `auth.service.ts:45-86` | `getSession()` exécuté AVANT `listenToAuthStateChanges()` (ligne 85) | ✅ OK |
| `auth.service.ts:28` | Flag `_initDone` ajouté | ✅ OK |
| `auth.service.ts:63-65` | `_initDone = true` dans le `tap()` de succès | ✅ OK |
| `auth.service.ts:72-73` | `_initDone = true` dans le `error` handler | ✅ OK |
| `auth.service.ts:79` | `_initDone = true` si aucune session | ✅ OK |
| `auth.service.ts:172-176` | `handleSignedIn()` vérifie `authReadySubject.value === true` → ignore si déjà prêt | ✅ OK |

**Verdict RACE-1 : ✅ CORRIGÉ** — Le listener est enregistré après `getSession()`. Si `initializeAuth()` a déjà traité la session, `handleSignedIn()` est ignoré.

### RACE-2 — AuthGuard avec take(1) pendant l'init → écran blanc

| Point de contrôle | État vérifié dans le code | Résultat |
|-------------------|--------------------------|----------|
| `auth.guard.ts:24-27` | `filter(isReady => isReady === true)` + `take(1)` → attend que `authReady$` soit `true` | ✅ OK |
| `auth.guard.ts:30` | `timeout(10000)` → fallback après 10s | ✅ OK |
| `auth.guard.ts:34-38` | Si timeout + session existe → laisse passer (évite blocage total) | ✅ OK |
| `auth.guard.ts:40-44` | Si timeout + pas de session → redirige `/login` avec `returnUrl` | ✅ OK |

**Verdict RACE-2 : ✅ CORRIGÉ** — Plus de `take(1)` immédiat. Le guard attend la fin de l'init avec un timeout de sécurité.

### RACE-3 — RoleGuard évalue currentUser$ avant chargement

| Point de contrôle | État vérifié dans le code | Résultat |
|-------------------|--------------------------|----------|
| `role.guard.ts:19-21` | `authReady$.pipe(filter(true), take(1))` avant `currentUser$` | ✅ OK |
| `role.guard.ts:22-37` | `switchMap` vers `currentUser$.pipe(take(1))` seulement après `authReady$` | ✅ OK |

**Verdict RACE-3 : ✅ CORRIGÉ** — `currentUser$` n'est lu qu'après `authReady$ === true`.

### NOTIF-1 — Erreurs 401 multiples → N notifications + N logouts

| Point de contrôle | État vérifié dans le code | Résultat |
|-------------------|--------------------------|----------|
| `auth.service.ts:266-268` | Getter `isLoggingOut` exposé publiquement | ✅ OK |
| `auth.service.ts:273-277` | `logout()` vérifie `_isLoggingOut`, retourne `of(void 0)` si déjà en cours | ✅ OK |
| `auth.service.ts:278` | `_isLoggingOut = true` positionné avant l'appel Supabase | ✅ OK |
| `auth.service.ts:290-292` | `_isLoggingOut = false` en cas d'erreur (catchError) | ✅ OK |
| `auth.service.ts:218` | `_isLoggingOut = false` dans `handleSignedOut()` (reset après nettoyage) | ✅ OK |
| `http-error.interceptor.ts:38` | Vérifie `authService.isLoggingOut` avant tout traitement | ✅ OK |
| `http-error.interceptor.ts:38` | Vérifie `_authErrorHandled` (déduplication) | ✅ OK |
| `http-error.interceptor.ts:42-44` | `_authErrorHandled = true` + reset après 3s | ✅ OK |
| `http-error.interceptor.ts:39` | Si dédupliqué → `throwError()` sans notification ni logout | ✅ OK |

**Verdict NOTIF-1 : ✅ CORRIGÉ** — Un seul logout + une seule notification par vague d'erreurs 401.

### NOTIF-2 — SyncService poll sans vérifier auth state → 401 en boucle

| Point de contrôle | État vérifié dans le code | Résultat |
|-------------------|--------------------------|----------|
| `sync.service.ts:23` | `isAuthReady = false` par défaut | ✅ OK |
| `sync.service.ts:60-77` | `bindToAuthLifecycle()` s'abonne à `authReady$` via injection différée | ✅ OK |
| `sync.service.ts:66-71` | Met à jour `isAuthReady`, arrête le polling + reset versions si `false` | ✅ OK |
| `sync.service.ts:206` | `filter(() => this.isAuthReady)` dans le pipeline de polling | ✅ OK |

**Verdict NOTIF-2 : ✅ CORRIGÉ** — Le polling ne s'exécute que si l'auth est prête.

### DUP-1 — Double AuthGuard sur routes admin

| Point de contrôle | État vérifié dans le code | Résultat |
|-------------------|--------------------------|----------|
| `app.module.ts:93-95` | Route `/admin` : `canActivate: [AuthGuard, WorkspaceSelectedGuard, MobileGuard]` | ✅ Présent (parent) |
| `admin-routing.module.ts:10` | `canActivate: [RoleGuard]` (AuthGuard supprimé) | ✅ OK |

**Verdict DUP-1 : ✅ CORRIGÉ** — AuthGuard n'est plus dupliqué. Chaîne : AuthGuard (parent) → RoleGuard (enfant).

### DUP-2 — WorkspaceSelectedGuard fait un HTTP redondant

| Point de contrôle | État vérifié dans le code | Résultat |
|-------------------|--------------------------|----------|
| `workspace-selected.guard.ts:21-23` | `filter(isReady => isReady === true)` + `take(1)` | ✅ OK |
| `workspace-selected.guard.ts:24-53` | Vérification en mémoire uniquement (`getCurrentWorkspace()`) | ✅ OK |
| Aucun import `HttpClient`, `DataCacheService`, `environment` | Supprimés | ✅ OK |

**Verdict DUP-2 : ✅ CORRIGÉ** — Plus d'appel HTTP. Vérification workspace en mémoire après `authReady$`.

---

## 3. VÉRIFICATION FONCTIONNELLE DES COMPOSANTS

### Guards

| Guard | Comportement vérifié | État |
|-------|---------------------|------|
| **AuthGuard** | Attend `authReady$ === true` avec `filter` + `take(1)` + `timeout(10s)`. Fallback : session → passe, pas de session → `/login`. | ✅ Correct |
| **RoleGuard** | Attend `authReady$` puis lit `currentUser$`. Compare `user.role` avec `route.data.role`. Redirige `/` si non-admin. | ✅ Correct |
| **WorkspaceSelectedGuard** | Attend `authReady$`. Vérifie workspace en mémoire (id + role). Redirige `/select-workspace` si absent. | ✅ Correct |

### Logout

| Aspect | Comportement vérifié | État |
|--------|---------------------|------|
| **Idempotence** | `_isLoggingOut` empêche les appels multiples | ✅ Correct |
| **Reset** | `_isLoggingOut = false` dans `handleSignedOut()` et `catchError` | ✅ Correct |
| **Nettoyage** | `currentUser`, `isAuthenticated`, `authReady` → reset. Cache, workspace, IndexedDB → clear. Navigation → `/login`. | ✅ Correct |
| **Interceptor** | Vérifie `isLoggingOut` + `_authErrorHandled` avant de déclencher un logout | ✅ Correct |

### SyncService

| Aspect | Comportement vérifié | État |
|--------|---------------------|------|
| **Binding auth** | `bindToAuthLifecycle()` via `Injector` (évite dépendance circulaire) | ✅ Correct |
| **Filtre polling** | `filter(() => this.isAuthReady)` dans le pipeline | ✅ Correct |
| **Arrêt sur logout** | `stopPeriodicSync()` + `resetVersions()` quand `isReady = false` | ✅ Correct |
| **Cleanup** | `ngOnDestroy` unsubscribe `authReadySubscription` | ✅ Correct |

### Script check-admin-count.js

| Aspect | Comportement vérifié | État |
|--------|---------------------|------|
| **Lecture seule** | Uniquement `findMany` et `count`, aucun `update`/`create`/`delete` | ✅ Correct |
| **Exit code** | `process.exitCode = 1` si 0 admin actif | ✅ Correct |
| **Disconnect** | `prisma.$disconnect()` dans `finally` | ✅ Correct |
| **Dotenv** | Charge `.env` relatif au script | ✅ Correct |

---

## 4. POINTS NON TRAITÉS — CLASSIFICATION DE CRITICITÉ

### 4.1 Sécurité / Intégrité du système

| ID | Point | Risque réel | Action |
|----|-------|-------------|--------|
| **DB-TRIGGER** | Trigger PostgreSQL `ensure_min_admin` non implémenté | **Faible** — La protection applicative couvre tous les chemins API. Le risque ne subsiste que pour les modifications SQL directes (DBA, migration manuelle). | **Optionnel** — Proposé dans `ADMIN_RECOVERY.md`. À implémenter uniquement si des accès SQL directs sont fréquents. |
| **SUPABASE-POLICIES** | Aucune RLS policy Supabase modifiée | **Nul** — L'auth passe par le backend qui vérifie les rôles. Les policies Supabase ne sont pas dans le périmètre. | **Ignoré** — Hors périmètre du plan. |
| **PRISMA-SCHEMA** | Aucune modification du schéma Prisma | **Nul** — Le schéma est cohérent avec les corrections (enum `UserRole` = `USER`/`ADMIN` existe déjà). | **Ignoré** — Aucune modification nécessaire. |

### 4.2 Stabilité / UX

| ID | Point | Risque réel | Action |
|----|-------|-------------|--------|
| **LEGACY-1** | `server.js:29` référence `config.jwt.refreshSecret` (inexistant) | **Nul** — Produit un warning console au démarrage (`JWT refresh: DISABLED`). Aucun impact fonctionnel : l'auth est gérée par Supabase, pas par JWT custom. | **Optionnel** — Nettoyage cosmétique. Peut être traité lors d'une maintenance générale. |
| **RACE-4** | Token pas disponible immédiatement après `SIGNED_IN` → 401 transitoire | **Faible** — Mitigé par : (1) `getAccessToken()` avec retry 150ms, (2) `syncUserProfile()` avec retry 2×1s, (3) déduplication 401 dans l'interceptor. Le risque résiduel est un délai de ~150ms sur mobile lent. | **Ignoré** — Mitigations existantes suffisantes. |

### 4.3 Compliance / Bonnes pratiques

| ID | Point | Risque réel | Action |
|----|-------|-------------|--------|
| **TESTS** | Aucun test automatisé ajouté | **Moyen** — Les corrections ne sont validées que manuellement. Une régression future est possible si un développeur modifie les guards ou le service auth sans comprendre les invariants. | **Recommandé à terme** — Hors périmètre du plan actuel (interdit explicitement). À planifier dans un sprint dédié. |
| **RBAC-AVANCÉ** | Pas de RBAC avancé (permissions granulaires) | **Nul** — Le système actuel (ADMIN/USER + MANAGER/MEMBER/VIEWER) couvre les besoins. | **Ignoré** — Pas de besoin identifié. |

---

## 5. RISQUE RÉSIDUEL GLOBAL

| Catégorie | Niveau | Justification |
|-----------|--------|---------------|
| **Sécurité ADMIN** | 🟢 Faible | Tous les chemins applicatifs sont protégés. Seul risque : modification SQL directe (documenté). |
| **Race conditions** | 🟢 Faible | Init séquentielle, guards attendent `authReady$`, déduplication logout. |
| **Notifications** | 🟢 Faible | Déduplication 401, logout idempotent, SyncService lié à auth. |
| **Guards** | 🟢 Faible | Plus de duplication, plus de blocage silencieux. |
| **Régression future** | 🟠 Moyen | Absence de tests automatisés. Mitigé par la documentation et les logs. |

---

## 6. PLAN DE CLÔTURE

### 6.1 Confirmation de validabilité

Le système **peut être validé manuellement**. Toutes les corrections du plan ont été implémentées et vérifiées dans le code source. Les invariants critiques sont respectés.

### 6.2 Checklist de tests finaux

| # | Test | Procédure | Résultat attendu |
|---|------|-----------|------------------|
| 1 | **Login 1 clic** | Ouvrir `/login`, saisir identifiants, cliquer "Connexion" | Dashboard accessible immédiatement, pas de rechargement |
| 2 | **Refresh page** | Sur le dashboard, F5 | Page rechargée, utilisateur reste connecté, pas de flash `/login` |
| 3 | **Multi-onglets** | 2 onglets dashboard, logout d'un | L'autre redirige vers `/login` (via `SIGNED_OUT` BroadcastChannel) |
| 4 | **Expiration token** | Attendre expiration ou forcer 401 | 1 seule notification, 1 seul logout, redirection `/login` |
| 5 | **Accès admin (ADMIN)** | Naviguer vers `/admin` avec compte ADMIN | Accès immédiat sans blocage |
| 6 | **Accès admin (USER)** | Naviguer vers `/admin` avec compte USER | Message "Accès non autorisé", redirection `/` |
| 7 | **Retrait rôle dernier admin** | `/admin/users` → changer rôle du dernier admin en USER | Erreur 409 `LAST_ADMIN_PROTECTION` |
| 8 | **Désactivation dernier admin** | `/admin/users` → désactiver le dernier admin | Erreur 409 `LAST_ADMIN_PROTECTION` |
| 9 | **Auto-retrait admin** | En tant que dernier admin, modifier son propre rôle via profil | Erreur 409 bloquante |
| 10 | **Script vérification** | `cd backend && node scripts/check-admin-count.js` | Affiche 🟢 ou 🟠 selon le nombre d'admins |
| 11 | **Workspace guard** | Supprimer le workspace du localStorage, naviguer vers `/` | Redirection vers `/select-workspace` |
| 12 | **Console logs** | Vérifier la console navigateur pendant login/logout | Séquence `[Auth] Session trouvée` → `[Auth] Init complète`, pas de doublons |

### 6.3 Points à traiter ultérieurement

| Point | Priorité | Quand |
|-------|----------|-------|
| **Tests automatisés** (guards, interceptor, ensureMinOneAdmin) | Moyenne | Sprint dédié qualité |
| **Trigger DB `ensure_min_admin`** | Basse | Si accès SQL directs fréquents |
| **Nettoyage LEGACY-1** (`config.jwt.refreshSecret`) | Basse | Prochaine maintenance générale |
| **Monitoring admin count** | Basse | Intégrer `check-admin-count.js` dans CI/CD |

---

## 7. SYNTHÈSE FINALE

### Ce qui a été fait

- **16 actions** exécutées sur **5 phases** (P0 → P4)
- **12 fichiers** impactés (9 modifiés, 3 créés)
- **8 invariants** vérifiés et confirmés dans le code
- **1 service centralisé** (`ensureMinOneAdmin`) factorise la logique de protection
- **1 script de diagnostic** (`check-admin-count.js`) pour vérification opérationnelle
- **1 document de référence** (`ADMIN_RECOVERY.md`) pour la procédure de récupération

### Ce qui est garanti

1. Le système ne peut plus perdre son dernier ADMIN actif via l'API
2. L'authentification ne boucle plus (init séquentielle, déduplication SIGNED_IN)
3. Les guards attendent la fin de l'init avant d'évaluer (plus d'écran blanc)
4. Le logout est idempotent (plus de cascades)
5. Les notifications 401 sont dédupliquées (1 seule par vague)
6. Le SyncService ne poll que si l'auth est prête (plus de 401 en boucle)
7. Les guards ne sont plus dupliqués sur les routes admin
8. Le WorkspaceSelectedGuard ne fait plus d'appel HTTP redondant

### Ce qui n'a PAS été modifié (et pourquoi)

- **Schéma Prisma** — Aucune modification nécessaire (interdit par le plan)
- **Configuration Supabase** — Hors périmètre (interdit par le plan)
- **Tests automatisés** — Non ajoutés (interdit par le plan)
- **Trigger DB** — Proposé en commentaire uniquement (interdit sans validation explicite)
- **RBAC avancé** — Pas de besoin identifié (interdit par le plan)
- **server.js** — Warning cosmétique LEGACY-1 non corrigé (hors périmètre)

### Statut final

**🟢 Le plan de correction Auth/Authz est intégralement exécuté et vérifié.**

Le système est prêt pour validation manuelle via la checklist ci-dessus. Après validation, ce document peut être promu en `docs/reference/` et l'audit archivé en `docs/history/`.
