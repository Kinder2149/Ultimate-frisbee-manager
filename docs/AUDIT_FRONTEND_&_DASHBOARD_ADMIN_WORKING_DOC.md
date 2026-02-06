# AUDIT_FRONTEND_&_DASHBOARD_ADMIN — WORKING DOC (éphémère)

> Document de travail d’audit (sans code) — basé contractuellement sur :
> - `docs/GOUVERNANCE_ROLES_REFERENCE.md`
> - `docs/PLAN_ACTION_ROLES.md`

---

## 1. Rappel synthétique des règles de gouvernance (contractuel, vulgarisé)

### 1.1 Séparation plateforme vs workspaces
Référence : `GOUVERNANCE_ROLES_REFERENCE.md` §1.2

- La **plateforme** gère l’identité globale et la gouvernance transverse.
- Chaque **workspace** (club) porte les droits métier, **sans pouvoir global implicite**.

### 1.2 Aucun droit implicite sur un workspace
Référence : `GOUVERNANCE_ROLES_REFERENCE.md` §1.2 et §2.1 (Utilisateur plateforme)

- Un utilisateur plateforme **n’a aucun droit** sur un workspace s’il n’a pas **un rôle workspace explicite**.
- Exception unique : **Administrateur plateforme** (gouvernance).

### 1.3 Rôles plateforme
Référence : `GOUVERNANCE_ROLES_REFERENCE.md` §2.1 et matrice §5.2

- **ADMIN plateforme** (`User.role = ADMIN`) :
  - Listing tous workspaces
  - Lecture/écriture sur tous workspaces
  - **Seul autorisé à modifier la BASE**
  - Accès dashboard admin + gestion utilisateurs globale

- **USER plateforme** (`User.role = USER`) :
  - Auth OK
  - **Aucun** droit sur un workspace sans rôle workspace

- **Testeur plateforme** (rôle dérivé) :
  - Source de vérité : `User.isTester` (implémentation indiquée comme ✅ dans doc §2.1)
  - Peut **lister** tous workspaces
  - Ne peut pas lire/écrire sans rôle workspace explicite
  - **Ne peut jamais modifier la BASE** (403 `TESTER_BASE_FORBIDDEN` indiqué dans doc)

### 1.4 Rôles workspace (cible) + mapping legacy
Référence : `GOUVERNANCE_ROLES_REFERENCE.md` §2.2, §4 et matrice §5.1

Rôles cibles :
- `MANAGER` : gouvernance complète du workspace (membres + settings + contenu)
- `MEMBER` : création/modification/suppression contenu (pas membres/settings)
- `VIEWER` : lecture seule (pas export, pas membres, pas settings)

Mapping legacy à accepter temporairement :
- `OWNER` → `MANAGER`
- `USER` → `MEMBER`

### 1.5 Règle BASE (bloquante)
Référence : `GOUVERNANCE_ROLES_REFERENCE.md` §3 + décisions verrouillées §9.4

- La BASE = workspace avec `workspace.isBase === true`.
- **Toute mutation sur la BASE est refusée** si l’utilisateur n’est pas ADMIN plateforme.
- Le Testeur ne peut pas modifier la BASE.
- La BASE doit être **explicitement identifiée** et visible (indicateur UI côté front est prévu dans `PLAN_ACTION_ROLES.md` Mission 5.2).

---

## 2. Cartographie des écrans et onglets (front utilisateur + dashboard admin)

### 2.1 Front utilisateur — routes principales
Référence technique : `frontend/src/app/app.module.ts` (routes)

- Public :
  - `/login` (module auth)
  - `/forgot-password`
  - `/reset-password`
  - `/auth/confirm`

- Auth + sans workspace requis :
  - `/select-workspace`

- Auth + workspace requis (`WorkspaceSelectedGuard`) :
  - `/` (Dashboard)
  - `/exercices` (+ sous-routes `ajouter`, `modifier/:id`, `voir/:id`)
  - `/entrainements` (+ `nouveau`, `modifier/:id`)
  - `/echauffements` (routes non auditées ici en détail, mais écran liste utilise permissions)
  - `/situations-matchs` (routes non auditées ici en détail, mais écran liste utilise permissions)
  - `/parametres` (tags, import/export, profil)
  - `/workspace/admin` (admin du workspace courant)

### 2.2 Mécanismes de permissions identifiés (front)
Références :
- `frontend/src/app/core/services/permissions.service.ts`
- `frontend/src/app/core/guards/role.guard.ts`
- `frontend/src/app/core/guards/workspace-selected.guard.ts`
- `frontend/src/app/features/workspaces/select-workspace/select-workspace.component.ts`

- **Garde plateforme ADMIN (dashboard admin)** :
  - `/admin/**` protégé par `AuthGuard + RoleGuard` avec `data: { role: 'admin' }`.

- **Garde workspace sélectionné + rôle explicite** :
  - `WorkspaceSelectedGuard` bloque si le workspace sélectionné n’existe plus, et bloque aussi si `current.role` est absent (`reason: 'workspace-role-required'`).

- **Permissions UI** :
  - `PermissionsService` normalise `OWNER→MANAGER` et `USER→MEMBER`.
  - Expose `canCreate/canEdit/canDelete/canManageMembers/canManageSettings/canWrite/canMutateBase`.
  - Combine BASE via `canMutateBase` et `canWrite`.

- **Indicateur BASE** :
  - Visible dans `app.component.html` via `permissionsService.isBaseWorkspace()` (badge "BASE").

### 2.3 Dashboard administrateur — onglets
Référence : `frontend/src/app/features/admin/components/admin-shell/admin-shell.component.ts`

- `/admin/dashboard`
- `/admin/content` (explorateur de contenus global)
- `/admin/users` + `/admin/users/:id`
- `/admin/workspaces` + `/admin/workspaces/:id`
- `/admin/stats`
- `/admin/logs`
- `/admin/settings`

---

## 3. Checklist d’audit détaillée (✅ / ⚠️ / ❌)

> Important : cette checklist évalue l’état observable dans le code front et sa cohérence contractuelle.

### 3.1 Écran : Sélection workspace (`/select-workspace`)
Références :
- Gouvernance : §1.2, §2.1 (User), §2.1 (Testeur), matrice §5.2
- Front : `SelectWorkspaceComponent`

- Accès sans rôle workspace explicite :
  - **Conforme ✅** : `selectWorkspace` bloque si `!ws.role`.
- Gestion écran vide :
  - **Conforme ✅** : message "Aucun espace de travail disponible. Contactez un administrateur.".
- Cas Testeur (listing global) :
  - **À vérifier ⚠️** : le front ne contient pas de logique dédiée Testeur ; dépend de la réponse backend `/workspaces/me` (doc indique listing global via `getMyWorkspaces`).

### 3.2 Guard : WorkspaceSelectedGuard (accès au contenu)
Références :
- Gouvernance : §1.2, §2.1 (User/Testeur)
- Front : `workspace-selected.guard.ts`

- Blocage si aucun rôle workspace explicite :
  - **Conforme ✅** : `if (!current?.role) { ... redirect /select-workspace reason=workspace-role-required }`.
- Comportement en cas d’erreur réseau :
  - **À corriger ⚠️** : en `catchError`, le guard retourne `true` (laisse passer). Cela peut permettre un accès UI à des routes alors que le backend refusera ensuite (risque UX + surface d’attaque indirecte).

### 3.3 Menus & actions “Créer” (header global)
Références :
- Gouvernance : matrice §5.1 + règle BASE §3
- Front : `app.component.html`

- Masquage des liens “Ajouter/Nouveau” pour VIEWER :
  - **Conforme ✅** : liens affichés seulement si rôle != `VIEWER`.
- Cas BASE :
  - **Bloquant ❌** : les conditions des menus ne tiennent pas compte de `isBase` / `canWrite`.
    - Exemple : un `MEMBER` dans BASE (ou tout rôle non-admin) verrait potentiellement les entrées “Ajouter …” car le test n’est que “!= VIEWER”.
    - Contrat : `GOUVERNANCE_ROLES_REFERENCE.md` §3.2/§3.3 : aucune mutation BASE pour non-admin.

### 3.4 Écrans listes contenus (Exercices/Entraînements/Échauffements/Situations)
Références :
- Gouvernance : matrice §5.1 + BASE §3
- Front : `*list.component.ts` + `.html`

- Masquage bouton créer :
  - **Conforme ✅** (hors BASE) : `*ngIf="canCreate"` et `canCreate = permissionsService.canCreate()`.
- Masquage actions edit/delete/duplicate :
  - **Conforme ✅** (hors BASE) : conditionnées par `canEdit`.
- Cas BASE :
  - **Bloquant ❌** : `canCreate/canEdit` ne prennent pas en compte `canWrite()`.
    - Les composants utilisent `permissionsService.canEdit()` (rôle) mais pas `permissionsService.canWrite()` (rôle + BASE).
    - Contrat : BASE doit refuser toutes mutations non-admin (§3).

### 3.5 Route : Administration workspace courant (`/workspace/admin`)
Références :
- Gouvernance : §2.2 (MANAGER), §4 (normalisation), §3 (BASE)
- Front : `workspace-admin.component.ts/html`

- Accès réservé MANAGER (ou legacy OWNER) :
  - **À corriger ⚠️** : route pas gardée par un `RoleGuard` workspace. Le composant affiche "Accès non autorisé" si non manager, mais la route reste atteignable.
  - Contrat : VIEWER ne doit pas avoir de routes atteignables indirectement (périmètre audit rôle VIEWER).

- Normalisation des rôles :
  - **Bloquant ❌** : UI et formulaires utilisent encore `OWNER/USER` comme rôles sélectionnables et présentés.
    - Contrat : valeurs cibles `MANAGER/MEMBER/VIEWER` (§4.1, décisions §9.5).

- Cas BASE :
  - **Partiellement conforme ⚠️** : `canMutate = isManager && (!isBase || isAdmin)` => bloque mutation sur BASE non-admin.
  - Mais les libellés et rôles affichés restent legacy.

### 3.6 Paramètres (`/parametres/*`)
Références :
- Gouvernance : matrice §5.2 (export = admin), séparation plateforme/workspace §1.2
- Front : `settings.module.ts`, `app.component.html`

- Visibilité menu Import/Export :
  - **Conforme ✅** : le menu dans `app.component.html` n’affiche "Import/Export" que pour admin.
- Protection de route Import/Export :
  - **Bloquant ❌** : `settings.module.ts` protège les routes uniquement par `AuthGuard` (pas de `RoleGuard`).
  - Contrat : export est admin-only (matrice §5.2) et doit être inatteignable pour non-admin.

### 3.7 Dashboard Admin (`/admin/**`)
Références :
- Gouvernance : §2.1 Admin, matrice §5.2
- Front : `admin-routing.module.ts`, `role.guard.ts`

- Accès :
  - **Conforme ✅** : `RoleGuard` vérifie `user.role` vs `data.role`.
- Message d’accès refusé :
  - **À corriger ⚠️** : message est figé "Seuls les administrateurs…" même si `expectedRole` change, et ne différencie pas “non connecté” vs “non autorisé” vs “pas de rôle workspace”.

### 3.8 Dashboard Admin — onglets et actions sensibles (audit)
Références :
- Gouvernance : `GOUVERNANCE_ROLES_REFERENCE.md` §1.2, §2.1 (ADMIN), §3 (BASE), matrice §5.2
- Plan : `PLAN_ACTION_ROLES.md` Mission 5.1 (UI alignée sur permissions)
- Front : `frontend/src/app/features/admin/pages/*`

#### 3.8.1 Onglet `/admin/dashboard`
- Export :
  - **Bloquant ❌** : le bouton “Exporter les données” fait `window.open('/api/admin/export-ufm', '_blank')`.
    - Backend : `GET /api/admin/export-ufm?type=...&id=...` (paramètres requis).
    - Résultat attendu : appel sans query => **400** (contradiction UX).
    - Contrat : matrice §5.2 (export admin-only) OK sur le rôle, mais l’action doit être fonctionnelle et explicite.
- Navigation activité récente :
  - **À corriger ⚠️** : `getActivityRoute()` renvoie `/exercices/${id}` et `/entrainements/${id}`.
    - Routes front réelles : `/exercices/voir/:id` ou `/exercices/modifier/:id` (selon mode) ; pas de route `/exercices/:id`.
    - Risque : clic mène à une route inexistante (fallback), donc audit UX (pas un risque sécurité direct).

#### 3.8.2 Onglet `/admin/content`
- Actions bulk delete/duplicate :
  - **Conforme ✅** côté rôle : routes admin derrière `RoleGuard`.
  - **À corriger ⚠️** : confirmations reposent sur `confirm()` (ok fonctionnel, mais pas un vrai écran de confirmation contextualisé).

#### 3.8.3 Onglet `/admin/users` + `/admin/users/:id`
- Edition user (rôle plateforme + actif) :
  - **Conforme ✅** sur la séparation : modification du rôle plateforme (`ADMIN/USER`) cohérent avec §2.1.
- Détail user :
  - **Bloquant ❌** : la section “Workspaces associés” est chargée via `GET workspaces/me` (workspaces du **current user**, pas de l’utilisateur consulté).
    - Le dashboard admin affiche donc une info **fausse** (risque de gouvernance/erreur humaine).
  - **À corriger ⚠️** : l’affichage du rôle workspace compare à `'ADMIN'` (mélange rôle plateforme et rôle workspace).

#### 3.8.4 Onglet `/admin/workspaces` + `/admin/workspaces/:id`
- Liste workspaces :
  - **Conforme ✅** sur l’accès : route admin.
  - **À corriger ⚠️** : duplication BASE détecte la BASE via `name === 'BASE'` au lieu de `isBase`.

- Détail workspace :
  - **À corriger ⚠️** : protection BASE dans l’UI basée sur `name === 'BASE'` (cf. Écart 5).

- Gestion des membres (dialog) :
  - **Bloquant ❌** : rôles workspace proposés = `USER` / `OWNER`.
    - Contrat : rôles officiels = `MANAGER/MEMBER/VIEWER` (§4.1 + décisions §9.5).

#### 3.8.5 Onglet `/admin/stats`
- **Conforme ✅** : lecture seule, pas d’action sensible, consomme `/api/admin/overview`.

#### 3.8.6 Onglet `/admin/logs`
- **Conforme ✅** : placeholder (pas d’action).

#### 3.8.7 Onglet `/admin/settings`
- Export :
  - **Bloquant ❌** : même problème que `/admin/dashboard` (appel sans query vers `/api/admin/export-ufm`).

### 3.9 Routes formulaires (front user) — accès indirect VIEWER / BASE
Références :
- Gouvernance : `GOUVERNANCE_ROLES_REFERENCE.md` §3 (BASE), matrice §5.1 (VIEWER)
- Plan : `PLAN_ACTION_ROLES.md` Mission 5.1

#### 3.9.1 Exercices (`/exercices/ajouter`, `/exercices/modifier/:id`)
- **Bloquant ❌** : `ExerciceFormComponent` ne vérifie pas `PermissionsService.canWrite()`.
  - Un `VIEWER` ou un non-admin sur BASE peut accéder à l’écran (route atteignable) et tenter un submit.
  - Backend devrait bloquer (voir §Cohérence backend), mais contrat exige une UI cohérente (Mission 5.1).

#### 3.9.2 Entraînements (`/entrainements/nouveau`, `/entrainements/modifier/:id`)
- **Bloquant ❌** : `EntrainementFormComponent` ne vérifie pas `PermissionsService.canWrite()`.
  - Boutons “Créer un nouvel exercice” dans la modale => risque d’actions visibles qui échouent selon rôle.

#### 3.9.3 Échauffements (`/echauffements/ajouter`, `/echauffements/modifier/:id`) et Situations (`/situations-matchs/ajouter`, `/situations-matchs/modifier/:id`)
- **Bloquant ❌** : pages formulaire ne vérifient pas `canWrite()` (même pattern).

### 3.10 Audit par rôle — parcours et invariants (plateforme + workspace + BASE)
Références :
- `GOUVERNANCE_ROLES_REFERENCE.md` §1.2, §2.1, §2.2, §3, §4 + matrices §5.1/§5.2
- `PLAN_ACTION_ROLES.md` Mission 5.1 (UI alignée), Phase 1 (BASE), Phase 2 (normalisation)

#### 3.10.1 Rôle plateforme `ADMIN`
- **Admin dashboard (`/admin/**`)** :
  - **Conforme ✅** (front) : route protégée par `RoleGuard`.
  - **Bloquant ❌** (backend/architecture) : `/api/admin/*` requiert un header `X-Workspace-Id` (`workspaceGuard`) ⇒ admin “plateforme” dépend d’un workspace courant (cf. Écart 7).

- **Accès contenus workspace** :
  - **Conforme ✅** (backend) : `requireWorkspaceWrite` + `baseMutationGuard` laissent écrire sur BASE uniquement si `user.role === 'ADMIN'`.
  - **À corriger ⚠️** (front) : UI des listes et formulaires n’emploie pas systématiquement `canWrite()` (BASE), mais l’admin n’est pas censé être bloqué.

#### 3.10.2 Rôle plateforme `USER`
- **Sans rôle workspace explicite** :
  - **Conforme ✅** : `WorkspaceSelectedGuard` et `SelectWorkspaceComponent` exigent un rôle workspace.

- **Avec rôle workspace explicite** (MANAGER/MEMBER/VIEWER) :
  - Voir sections 3.10.4–3.10.6.

#### 3.10.3 Rôle plateforme “Testeur” (`User.isTester === true`)
- **Listing workspaces** :
  - **À vérifier ⚠️** (front) : pas de logique dédiée, dépend de `/api/workspaces/me`.

- **Accès au workspace BASE** :
  - **Conforme ✅** (backend) : `workspaceGuard` refuse si `isTester && isBase` avec code `TESTER_BASE_FORBIDDEN`.
  - **Risque UX ⚠️** : si le front liste BASE au testeur mais permet de la sélectionner, l’erreur arrivera tard (au 1er appel API protégé par `workspaceGuard`).

#### 3.10.4 Rôle workspace `MANAGER`
- **Mutations contenu (hors BASE)** :
  - **Conforme ✅** (backend) : `requireWorkspaceWrite` autorise.
  - **À corriger ⚠️** (front) : certaines actions utilisent `canCreate/canEdit` (rôle) au lieu de `canWrite` (rôle+BASE).

- **Gestion membres/settings workspace courant (`/workspace/admin`)** :
  - **À corriger ⚠️** : route atteignable et composant fait un check UI, mais pas de guard route workspace dédié.
  - **Bloquant ❌** : rôles affichés/édités en legacy (`OWNER/USER`).

#### 3.10.5 Rôle workspace `MEMBER`
- **Mutations contenu (hors BASE)** :
  - **Conforme ✅** (backend) : `requireWorkspaceWrite` autorise.
- **Gestion membres/settings** :
  - **Conforme ✅** (backend) : `requireWorkspaceManager` refuse.

#### 3.10.6 Rôle workspace `VIEWER`
- **Lecture seule** :
  - **Conforme ✅** (backend) : `requireWorkspaceWrite` refuse toute mutation avec code `WORKSPACE_WRITE_REQUIRED`.

- **Accès indirect aux formulaires** :
  - **Bloquant ❌** (front) : routes formulaires (create/edit) atteignables, et composants n’empêchent pas le submit (cf. 3.9).
  - Contrat : Mission 5.1 (pas de boutons/écrans d’écriture incohérents).

#### 3.10.7 Cas particulier BASE (`workspace.isBase === true`)
- **Toute mutation (POST/PUT/PATCH/DELETE)** :
  - **Conforme ✅** (backend) : `baseMutationGuard` renvoie `403 BASE_MUTATION_FORBIDDEN` pour non-admin.
- **Front** :
  - **Bloquant ❌** : création/édition/suppression visibles ou atteignables dans plusieurs écrans (menus, listes, formulaires) car `canWrite()` n’est pas utilisé partout (cf. Écart 1 + 3.9).

---

## 4. Synthèse cohérence front ↔ backend (par grandes actions)

Références :
- Gouvernance : matrices §5.1 (workspace) et §5.2 (plateforme)
- BASE : §3 (mutations interdites pour non-admin)
- Plan : Mission 5.1 (UI cohérente), Phase 1/2

> Lecture : “Front (UI)” = masquage/disabled, “Front (routes)” = garde/guard ou blocage dans le composant, “Backend” = middleware/route.

| Action | Attendu (contrat) | Front (UI) | Front (routes/form) | Backend (constaté) | Écart |
|---|---|---|---|---|---|
| **Lister contenu** | VIEWER/MEMBER/MANAGER OK | ✅ (globalement) | ✅ (workspace requis) | ✅ `workspaceGuard` | — |
| **Créer contenu** | MEMBER/MANAGER (hors BASE) ; ADMIN partout ; VIEWER jamais | ✅ hors BASE via `canCreate` | ❌ formulaires atteignables + pas de `canWrite()` | ✅ `requireWorkspaceWrite` + ✅ `baseMutationGuard` | **Bloquant** (UI/route incohérentes) |
| **Éditer contenu** | idem création | ✅ hors BASE via `canEdit` | ❌ formulaires atteignables + pas de `canWrite()` | ✅ `requireWorkspaceWrite` + ✅ `baseMutationGuard` | **Bloquant** |
| **Supprimer contenu** | MEMBER/MANAGER (hors BASE) ; ADMIN partout | ✅ hors BASE (boutons conditionnés) | ⚠️ dépend des écrans (pas audité partout) | ✅ `requireWorkspaceWrite` + ✅ `baseMutationGuard` | ⚠️ (risque d’incohérence UI) |
| **Dupliquer contenu** | MEMBER/MANAGER (hors BASE) ; ADMIN partout | ✅ hors BASE (boutons conditionnés) | ⚠️ | ✅ `requireWorkspaceWrite` + ✅ `baseMutationGuard` | ⚠️ |
| **Gérer membres workspace** | MANAGER uniquement ; BASE : admin plateforme uniquement pour mutation | ⚠️ (UI partielle) | ⚠️ `/workspace/admin` atteignable | ✅ `requireWorkspaceManager` + ✅ `baseMutationGuard` | **Bloquant** (rôles legacy + route atteignable) |
| **Gérer settings workspace** | MANAGER uniquement ; BASE admin-only | ⚠️ | ⚠️ `/workspace/admin` atteignable | ✅ `requireWorkspaceManager` + ✅ `baseMutationGuard` | **Bloquant** (rôles legacy + route atteignable) |
| **Export** | Admin-only (plateforme) | ✅ menu admin-only | ❌ bouton export appelle endpoint sans params | ✅ `requireAdmin` (mais + `workspaceGuard`) | **Bloquant** (export cassé + dépendance workspace) |

## 4. Liste des écarts identifiés (rattachés aux documents)

### Écart 1 — Mutations possibles/visibles sur BASE pour non-admin
Références :
- `GOUVERNANCE_ROLES_REFERENCE.md` §3.2/§3.3, §9.4
- `PLAN_ACTION_ROLES.md` Phase 1 + Mission 5.2

- **Description** : les écrans de contenus utilisent `canEdit/canCreate` (rôle) sans intégrer la contrainte BASE. Le menu global masque "Ajouter" seulement pour VIEWER et ignore BASE.
- **Rôles impactés** : MANAGER/MEMBER sur BASE, Testeur avec rôle workspace sur BASE (si applicable), plus tout non-admin.
- **Gravité** : critique
- **Risque production** :
  - UX trompeuse (actions visibles qui échouent backend)
  - Risque d’incohérence si une route backend de mutation BASE est oubliée (doc indique protections backend encore partielles dans l’historique, même si décision est normative)
- **Correctif recommandé (fonctionnel)** :
  - Sur BASE, masquer/désactiver toute action de mutation pour non-admin, partout, en utilisant une règle unique : “si BASE et non-admin => aucune écriture”.

### Écart 2 — Route Import/Export non protégée par rôle admin
Références :
- `GOUVERNANCE_ROLES_REFERENCE.md` matrice §5.2 (export admin-only)

- **Description** : `/parametres/import-export` est accessible à tout utilisateur authentifié (pas de `RoleGuard`).
- **Rôles impactés** : USER plateforme, Testeur, tous rôles workspace.
- **Gravité** : critique
- **Risque production** : exposition d’actions sensibles ou d’UI ambiguë.
- **Correctif recommandé (fonctionnel)** :
  - Bloquer l’accès route à non-admin (écran “accès refusé” explicite), et aligner l’UI sur la matrice.

### Écart 3 — Administration du workspace courant basée sur rôles legacy (OWNER/USER)
Références :
- `GOUVERNANCE_ROLES_REFERENCE.md` §4.1, §9.5 + mapping §4.2
- `PLAN_ACTION_ROLES.md` Phase 2 (normalisation)

- **Description** : `/workspace/admin` propose et affiche `OWNER/USER` au lieu de `MANAGER/MEMBER/VIEWER`.
- **Rôles impactés** : MANAGER/MEMBER/VIEWER (tous)
- **Gravité** : critique
- **Risque production** : confusion gouvernance, erreurs humaines (assignation de droits), non conformité au modèle verrouillé.
- **Correctif recommandé (fonctionnel)** :
  - Normaliser les libellés UI sur le modèle cible et afficher le mapping legacy uniquement si nécessaire (ex: “OWNER (équiv. MANAGER)”).

### Écart 4 — WorkspaceSelectedGuard laisse passer en cas d’erreur réseau
Références :
- `GOUVERNANCE_ROLES_REFERENCE.md` §1.2 (aucun droit implicite)

- **Description** : en cas d’erreur API `/workspaces/me`, le guard autorise l’accès.
- **Rôles impactés** : tous
- **Gravité** : moyenne
- **Risque production** : navigation vers des écrans qui échoueront ensuite (403/404) ; surface d’accès indirecte.
- **Correctif recommandé (fonctionnel)** :
  - En cas d’erreur, afficher un écran d’indisponibilité et empêcher l’accès aux routes d’écriture au minimum.

### Écart 5 — Détection BASE incohérente (name vs isBase)
Références :
- `GOUVERNANCE_ROLES_REFERENCE.md` §3.1 (critère technique = `isBase === true`)

- **Description** : `WorkspaceDetailComponent` admin utilise `workspace.name === 'BASE'` au lieu de `isBase`.
- **Rôles impactés** : ADMIN (dashboard)
- **Gravité** : moyenne
- **Risque production** : contournement si BASE renommée/si plusieurs workspaces, incohérence avec backend.
- **Correctif recommandé (fonctionnel)** :
  - Toujours se baser sur `isBase` comme source de vérité.

### Écart 6 — Export admin non fonctionnel (contrat OK, exécution KO)
Références :
- `GOUVERNANCE_ROLES_REFERENCE.md` matrice §5.2 (export admin-only)
- `PLAN_ACTION_ROLES.md` Mission 5.1 (UI cohérente)

- **Description** : le frontend admin ouvre `/api/admin/export-ufm` sans paramètres, dans un nouvel onglet.
  - Backend : `exportUfm` exige `type` et `id` ⇒ renvoie **400**.
- **Rôles impactés** : ADMIN
- **Gravité** : critique (fonctionnalité annoncée mais inopérante)
- **Correctif recommandé (fonctionnel)** :
  - Soit fournir une vraie UI de sélection (type/id), soit proposer un export global distinct si c’est le besoin.

### Écart 7 — Toutes les routes `/api/admin/*` exigent un contexte workspace (header `X-Workspace-Id`)
Références :
- `GOUVERNANCE_ROLES_REFERENCE.md` §1.2 (séparation plateforme vs workspaces)
- `GOUVERNANCE_ROLES_REFERENCE.md` §2.1 (ADMIN multi-workspaces)

- **Description** : `backend/routes/admin.routes.js` applique `workspaceGuard` sur toutes les routes admin.
  - Conséquence : sans header `X-Workspace-Id`, l’admin reçoit `400 WORKSPACE_ID_REQUIRED`.
  - Cela inclut `GET /api/admin/export-ufm` et `GET /api/admin/overview`.
- **Rôles impactés** : ADMIN
- **Gravité** : critique
- **Risque production** :
  - L’administration “plateforme” devient dépendante d’un workspace courant, ce qui contredit la visibilité globale attendue pour l’ADMIN (§2.1).
- **Correctif recommandé (fonctionnel)** :
  - Ne pas exiger de workspace pour les routes admin “plateforme” (overview global, users, logs, export global), ou définir explicitement quel workspace est la référence.

### Écart 8 — Détail utilisateur admin affiche des workspaces incorrects
Références :
- `GOUVERNANCE_ROLES_REFERENCE.md` §1.2 (gouvernance platform vs workspace)

- **Description** : `/admin/users/:id` charge `GET /workspaces/me` (workspaces du user courant), pas ceux de l’utilisateur cible.
- **Rôles impactés** : ADMIN
- **Gravité** : critique (erreur de gouvernance)

### Écart 9 — Rôles workspace legacy exposés dans l’admin plateforme
Références :
- `GOUVERNANCE_ROLES_REFERENCE.md` §4.1, §9.5 (valeurs officielles workspace)
- `PLAN_ACTION_ROLES.md` Phase 2 (normalisation)

- **Description** : `WorkspaceMembersDialogComponent` et `/workspace/admin` exposent `OWNER/USER`.
- **Rôles impactés** : ADMIN + MANAGER
- **Gravité** : critique

---

## 5. Plan complet de correction (basé sur les écarts)

Références contractuelles :
- `GOUVERNANCE_ROLES_REFERENCE.md` (BASE §3, rôles §2/§4, matrices §5.1/§5.2)
- `PLAN_ACTION_ROLES.md` (Phase 1 BASE, Phase 2 normalisation, Mission 5.1 UI cohérente, Mission 5.2 badge/UX BASE)

### 5.1 Principes d’implémentation (invariants)
- **Invariance 1 (contrat)** : *Aucune mutation sur BASE* si non-`ADMIN` plateforme.
- **Invariance 2 (contrat)** : un `VIEWER` ne doit pas pouvoir *atteindre* des écrans d’écriture (pas seulement masquer les boutons).
- **Invariance 3 (contrat)** : les rôles workspace exposés/éditables sont **`MANAGER` / `MEMBER` / `VIEWER`** (mapping legacy uniquement en rétrocompat interne si nécessaire).
- **Invariance 4 (cohérence)** : le front doit utiliser une règle unique de capacité d’écriture : `canWrite()` (rôle + BASE).

### 5.2 Chantier A — Verrouillage UI/Routes : BASE + VIEWER (priorité P0)
Objectif : supprimer tout “accès indirect” aux écritures et aligner l’UI avec les matrices.

- **Actions**
  - **A1** : Dans toutes les listes contenus, remplacer l’usage de `canCreate/canEdit` par `canWrite()` quand il s’agit d’autoriser une mutation.
    - Cibles (front) :
      - `frontend/src/app/features/exercices/pages/exercice-list.component.*`
      - `frontend/src/app/features/entrainements/pages/entrainement-list/*`
      - `frontend/src/app/features/echauffements/pages/echauffement-list/*`
      - `frontend/src/app/features/situations-matchs/pages/situationmatch-list/*`
      - `frontend/src/app/app.component.html` (menu “Ajouter …” doit dépendre de `canWrite()` et pas de “!= VIEWER”).
  - **A2** : Protéger les routes formulaires (create/edit) contre `VIEWER` + contre BASE non-admin.
    - Option acceptable contractuellement :
      - un guard route “WriteGuard” basé sur `PermissionsService.canWrite()`
      - ou un blocage dans `ngOnInit` du composant avec redirection + message.
    - Cibles (front) :
      - `ExerciceFormComponent`
      - `EntrainementFormComponent`
      - `EchauffementFormComponent` (page)
      - `SituationMatchFormComponent` (page)
      - modules de routing correspondants (ex. `exercices.module.ts`, `entrainements.module.ts`, etc.)
  - **A3** : Uniformiser les messages “refus” (VIEWER vs BASE vs pas de rôle workspace).

- **Critères d’acceptation**
  - Un `VIEWER` ne peut pas accéder à `/.../ajouter` ou `/.../modifier/:id` (redirection + message explicite).
  - Sur BASE, un `MEMBER`/`MANAGER` voit **0** action de mutation et ne peut pas atteindre les routes d’écriture.
  - Les actions d’écriture affichées correspondent à `PermissionsService.canWrite()`.

- **Tests recommandés**
  - E2E : user VIEWER tente d’ouvrir une URL de formulaire en direct (doit être bloqué).
  - E2E : user MEMBER sur BASE tente `/exercices/ajouter` et une suppression depuis liste (UI bloquée + backend 403 si contournement).

### 5.3 Chantier B — Export (admin-only) : fonctionnalité + cohérence (priorité P0)
Objectif : rendre l’export admin **fonctionnel** et aligné sur la matrice §5.2.

- **Actions**
  - **B1** : Corriger l’appel front vers `/api/admin/export-ufm`.
    - Le backend actuel exige `type` + `id` :
      - soit adapter l’UI pour exporter une entité sélectionnée (type+id)
      - soit créer un endpoint backend d’export global (si besoin métier), distinct et documenté.
    - Cibles (front) :
      - `frontend/src/app/features/admin/pages/dashboard/dashboard.component.*`
      - `frontend/src/app/features/admin/pages/settings/settings.component.ts`
  - **B2** : Revoir la route `/parametres/import-export` pour la protéger correctement côté front (RoleGuard admin) et côté UX (message clair).
    - Cibles (front) : `settings.module.ts`.

- **Critères d’acceptation**
  - Le bouton export admin déclenche un téléchargement **sans 400**.
  - Un non-admin ne peut ni voir ni atteindre l’UI import/export.

- **Tests recommandés**
  - E2E : export admin fonctionne.
  - E2E : USER non-admin tentant `/parametres/import-export` reçoit un refus.

### 5.4 Chantier C — Admin plateforme : supprimer la dépendance systématique à `X-Workspace-Id` (priorité P0)
Objectif : garantir la gouvernance “plateforme” de l’ADMIN sans nécessiter un workspace courant, conformément à §2.1.

- **Constat** : `backend/routes/admin.routes.js` applique `workspaceGuard` sur tout `/api/admin/*`.

- **Actions**
  - **C1** : Scinder les routes admin en deux catégories :
    - **Admin plateforme** : ne requiert pas `workspaceGuard` (users, overview global, logs, export global, workspaces list)
    - **Admin contextuel** : requiert un workspace (si réellement nécessaire)
  - **C2** : Si certaines routes admin doivent rester contextuelles, le front admin doit explicitement fixer/afficher le workspace de référence.

- **Critères d’acceptation**
  - `/api/admin/overview` et `/api/admin/users` fonctionnent sans `X-Workspace-Id` (si destinés à être globaux).
  - Les routes qui exigent `X-Workspace-Id` l’annoncent explicitement et le front admin les appelle correctement.

### 5.5 Chantier D — Normalisation des rôles workspace (priorité P0)
Objectif : bannir `OWNER/USER` de l’UI et des formulaires, conserver seulement le mapping interne.

- **Actions**
  - **D1** : Dans `/workspace/admin` et le dialog admin members, remplacer les valeurs affichées et postées par `MANAGER/MEMBER/VIEWER`.
    - Cibles (front) :
      - `frontend/src/app/features/workspaces/workspace-admin/workspace-admin.component.*`
      - `frontend/src/app/features/admin/pages/workspaces/workspace-members-dialog/workspace-members-dialog.component.ts`
  - **D2** : Vérifier que le backend normalise bien les rôles reçus et stockés (et refuser les valeurs inattendues si nécessaire).
    - Cibles (backend) : `backend/middleware/workspace.middleware.js` + contrôleurs workspace.

- **Critères d’acceptation**
  - Aucune UI ne montre `OWNER/USER`.
  - La persistance respecte la matrice `MANAGER/MEMBER/VIEWER`.

### 5.6 Chantier E — Admin Users : corriger la source “workspaces associés” (priorité P1)
Objectif : empêcher une erreur de gouvernance dans le dashboard admin.

- **Actions**
  - **E1** : remplacer `GET /workspaces/me` par un endpoint admin “workspaces d’un utilisateur” (ou utiliser un endpoint existant).
    - Cibles (front) : `frontend/src/app/features/admin/pages/users/user-detail/user-detail.component.ts`
    - Cibles (backend) : route admin dédiée si absente.

- **Critères d’acceptation**
  - Le détail user admin affiche réellement les workspaces du user consulté.

### 5.7 Chantier F — Nettoyage UX : routes cassées et messages (priorité P2)
- **Actions**
  - **F1** : Corriger les liens “activité récente” du dashboard admin vers des routes existantes (ex: `/exercices/voir/:id`).
  - **F2** : Harmoniser les messages d’erreur (RoleGuard / guards workspace / BASE) selon Mission 5.1.

### 5.8 Ordre d’exécution recommandé (sécurité d’abord)
1) Chantier A (BASE/VIEWER : canWrite + guards)
2) Chantier D (rôles workspace officiels)
3) Chantier B (export + import/export route)
4) Chantier C (admin platform sans `X-Workspace-Id`)
5) Chantier E (workspaces user detail)
6) Chantier F (UX)

---

## 6. Points de vigilance UX & sécurité (liés aux règles)

### 5.1 Éviter “masquer sans interdire”
Références :
- `GOUVERNANCE_ROLES_REFERENCE.md` §1.2 (aucun droit implicite)

- L’UI masque certaines actions (ex: VIEWER) mais des routes restent atteignables (`/workspace/admin`, `import-export`).
- Risque : confusion, et dépendance totale au backend pour refuser — ce qui est nécessaire mais pas suffisant pour une UX claire.

### 5.2 Messages d’erreur et refus d’accès
Références :
- `PLAN_ACTION_ROLES.md` Mission 5.1 (messages clairs, pas de boutons inutilisables)

- Les messages “accès non autorisé” devraient distinguer :
  - Non connecté
  - Auth OK mais pas ADMIN
  - Auth OK mais pas de rôle workspace
  - Cas BASE protégé

### 5.3 Séparation “admin plateforme” vs “admin workspace”
Références :
- `GOUVERNANCE_ROLES_REFERENCE.md` §1.2, §2.1 (Admin), §2.2 (Manager)

- L’app contient :
  - Dashboard admin (`/admin`) pour gouvernance plateforme
  - Admin du workspace courant (`/workspace/admin`) pour gouvernance locale
- La séparation est annoncée dans le texte UI, mais le système de rôles affiché (OWNER/USER) est incohérent avec le contrat.

---

## 7. Verdict final (production)

### Verdict
❌ **Non prêt pour production**

### Justification (contractuelle)
Références :
- BASE : `GOUVERNANCE_ROLES_REFERENCE.md` §3 + décisions §9.4
- Export/admin-only : matrice §5.2
- Normalisation rôles : §4 + décisions §9.5

Motifs bloquants :
- Actions de mutation **visibles/possibles** sur BASE pour non-admin (contradiction directe §3).
- Route Import/Export accessible aux non-admin (contradiction matrice §5.2).
- Écran d’admin workspace courant utilisant encore les rôles legacy comme vérité UI (contradiction §4/§9.5).
- Export admin non fonctionnel (contradiction UX : fonctionnalité annoncée mais 400 côté backend).
- Routes `/api/admin/*` dépendantes d’un workspace courant via `X-Workspace-Id` (cohérence gouvernance ADMIN plateforme).
- Formulaires create/edit atteignables par VIEWER/non-admin BASE (UI et routing incohérents avec matrices §5.1 et Mission 5.1).
- Détail utilisateur admin : workspaces affichés incorrects (risque gouvernance / erreur humaine).

---
