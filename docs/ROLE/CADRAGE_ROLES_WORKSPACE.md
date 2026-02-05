# CADRAGE — Gouvernance des rôles (niveau workspace)

## 1. Rappel du contexte

### 1.1 Distinction rôle plateforme vs rôle workspace

La gouvernance des rôles du projet distingue deux familles :

- rôles **plateforme** : au-dessus des clubs / workspaces.
- rôles **workspace** : attribués dans le contexte d’un workspace donné via un lien utilisateur ↔ workspace.

Preuves (documents de référence) :

- `docs/BASE/ROLES_ET_GOUVERNANCE.md:24-45` (plateforme vs workspaces)
- `docs/BASE/ROLES_ET_GOUVERNANCE.md:48-120` (rôles plateforme et rôles workspace)

### 1.2 Pourquoi les rôles workspace sont structurants

Les rôles workspace structurent :

- l’**isolation** multi-tenant entre workspaces (accès conditionné à l’appartenance au workspace actif),
- la **délégation** locale (capacité à gérer un workspace sans autorité globale),
- les interactions avec le concept de **BASE** (workspace à statut spécial dans la gouvernance).

Preuves (documents de référence) :

- `docs/BASE/ROLES_ET_GOUVERNANCE.md:41-45` (rôles workspace = gouvernance locale)
- `docs/BASE/ROLES_ET_GOUVERNANCE.md:129-133` (BASE = périmètre à statut spécial)
- `docs/BASE/CADRAGE_BASE_WORKSPACE.md:83-98` (rôles observés côté backend : `requireAdmin`, `requireWorkspaceOwner`)

---

## 2. État factuel de l’existant

### 2.1 Rôles effectivement présents dans `WorkspaceUser.role`

Le champ `WorkspaceUser.role` est défini dans le schéma Prisma comme un `String` avec défaut `"OWNER"`.

Preuve (DB / Prisma) :

- `backend/prisma/schema.prisma:193-198` (`role String @default("OWNER")`)

Valeurs observées comme **écrites** dans le code et scripts (non exhaustif) :

- `OWNER`
- `USER`
- `VIEWER`

Preuves (écritures explicites) :

- `backend/services/business/workspace.service.js:47-53` (création lien BASE avec `role: 'USER'`)
- `backend/services/business/workspace.service.js:72-78` (création lien TEST avec `role: 'OWNER'`)
- `backend/prisma/seed-workspaces.js:95-101` (liaison à BASE avec `role: 'USER'`)
- `backend/prisma/seed-workspaces.js:114-120` (liaison à TEST admin avec `role: 'OWNER'`)
- `backend/scripts/sync-supabase-users.js:103-113` (ajout à BASE avec `role: 'VIEWER'`)
- `backend/controllers/auth.controller.js:119-136` (register : ajout à BASE avec `role: 'VIEWER'`)
- `backend/scripts/verify-and-seed-auth.js:81-90` (admin ajouté à BASE avec `role: 'OWNER'`)
- `backend/scripts/verify-production-auth.js:124-133` (liaison admin ↔ BASE avec `role: 'OWNER'`)
- `backend/prisma/scripts/migrate-workspaces.js:47-69` (migration : chaque user devient `role: 'OWNER'`)

### 2.2 Middlewares existants liés aux rôles workspace

#### 2.2.1 `workspaceGuard`

Le middleware `workspaceGuard` :

- exige un user résolu (`req.user`) ; sinon 401,
- exige le header `X-Workspace-Id` ; sinon 400,
- vérifie l’existence d’un lien `WorkspaceUser` (`workspaceId`, `userId`) ; sinon 403,
- copie le rôle dans `req.workspaceRole = link.role`.

Preuve :

- `backend/middleware/workspace.middleware.js:12-59` (résolution + contrôle membership + `req.workspaceRole = link.role`)

#### 2.2.2 `requireWorkspaceOwner`

Le middleware `requireWorkspaceOwner` :

- détermine `role = String(link.role || '').toUpperCase()`,
- refuse si `role !== 'OWNER'`.

Preuve :

- `backend/middleware/workspace.middleware.js:76-120` (contrôle `OWNER`)

### 2.3 Rôles utilisés dans des scripts

Le rôle `VIEWER` est écrit par :

- script de synchronisation Supabase → PostgreSQL,
- création d’utilisateur (`register`).

Preuves :

- `backend/scripts/sync-supabase-users.js:103-113` (`role: 'VIEWER'`)
- `backend/controllers/auth.controller.js:119-136` (`role: 'VIEWER'`)

### 2.4 Présence / absence de contraintes formelles

Constats observables :

- `WorkspaceUser.role` est un `String` (pas d’enum), donc pas de liste de valeurs imposée au niveau Prisma.
  - Preuve : `backend/prisma/schema.prisma:193-198`
- Le contrôle d’autorisation explicite au niveau middleware ne reconnaît que `OWNER`.
  - Preuve : `backend/middleware/workspace.middleware.js:107-116`

---

## 3. Rôles workspace observés

> Cette section décrit uniquement des usages constatés (où/quand/comment) sans attribuer d’intention.

### 3.1 `OWNER`

Usages observés :

- valeur par défaut au niveau schéma.
  - Preuve : `backend/prisma/schema.prisma:193-198`
- utilisé comme rôle requis pour des actions de gestion du workspace courant (via `requireWorkspaceOwner`).
  - Preuves :
    - `backend/middleware/workspace.middleware.js:107-116`
    - `backend/routes/workspace.routes.js:11-14` (routes `members`, `settings` protégées par `requireWorkspaceOwner`)
- écrit par plusieurs scripts (seed / vérification prod / migration / liaison admin).
  - Preuves :
    - `backend/prisma/seed-workspaces.js:114-120`
    - `backend/scripts/verify-and-seed-auth.js:81-90`
    - `backend/scripts/verify-production-auth.js:124-133`
    - `backend/prisma/scripts/migrate-workspaces.js:61-68`

### 3.2 `USER`

Usages observés :

- écrit lors de la liaison automatique à BASE.
  - Preuves :
    - `backend/services/business/workspace.service.js:47-53`
    - `backend/prisma/seed-workspaces.js:95-101`

### 3.3 `VIEWER`

Usages observés :

- écrit lors de certaines créations/synchronisations d’utilisateurs, en lien avec le workspace BASE.
  - Preuves :
    - `backend/scripts/sync-supabase-users.js:103-113`
    - `backend/controllers/auth.controller.js:119-136`

### 3.4 Autres valeurs

- aucune autre valeur de rôle workspace n’a été observée dans les éléments consultés pour ce cadrage.

---

## 4. Usages implicites détectés

> Cette section formalise des comportements observables produits par l’existant, même lorsqu’ils ne sont pas décrits comme “règle” explicite.

### 4.1 Qui gère les membres ?

Constat :

- la gestion des membres du workspace courant (lecture/écriture) est conditionnée par `requireWorkspaceOwner`.

Preuves :

- `backend/routes/workspace.routes.js:11-14` (routes OWNER)
- `backend/middleware/workspace.middleware.js:76-120` (contrôle `OWNER`)
- `backend/controllers/workspace.controller.js:541-625` (handlers `ownerGetWorkspaceMembers`, `ownerSetWorkspaceMembers`)

### 4.2 Qui accède aux contenus ?

Constat (backend) :

- les routes métier (`/api/exercises`, `/api/tags`, `/api/trainings`, `/api/warmups`, `/api/matches`, `/api/dashboard`, `/api/import`) exigent `authenticateToken` + `workspaceGuard`.
- `workspaceGuard` ne distingue pas `OWNER` vs autres rôles : l’accès dépend de l’existence du lien `WorkspaceUser`.

Preuves :

- `backend/routes/index.js:50-56` (montage `workspaceGuard` sur routes métier)
- `backend/middleware/workspace.middleware.js:36-58` (membership requis, puis `req.workspaceRole = link.role`)

### 4.3 Qui peut créer / modifier / supprimer ?

Constat observable au niveau montage des routes :

- pour les routes métier, les mutations (POST/PUT/DELETE) sont derrière `workspaceGuard`, sans contrôle de rôle workspace additionnel dans le montage central.

Preuves :

- `backend/routes/index.js:50-56` (même montage pour GET et POST/PUT/DELETE des routers métier)
- rappel : le seul middleware de rôle workspace observé est `requireWorkspaceOwner` et il est appliqué uniquement aux routes `workspaces/members` et `workspaces/settings`.
  - Preuve : `backend/routes/workspace.routes.js:11-14`

### 4.4 Ce qui est permis aujourd’hui sans règle explicite

Constats observables :

- un rôle workspace ≠ `OWNER` est “non owner” de facto vis-à-vis de `requireWorkspaceOwner`, sans qu’une liste officielle des rôles soit déclarée dans le schéma.
  - Preuves :
    - `backend/prisma/schema.prisma:193-198` (`role` en String)
    - `backend/middleware/workspace.middleware.js:107-116` (seuil `OWNER` uniquement)
- la valeur `VIEWER` est écrite par certains flux mais aucun middleware observé ne la traite explicitement.
  - Preuves :
    - `backend/scripts/sync-supabase-users.js:103-113`
    - `backend/controllers/auth.controller.js:119-136`
    - `backend/middleware/workspace.middleware.js:107-116` (unique contrôle explicite `OWNER`)

---

## 5. Écarts avec la vision cible (comparaison sans mapping)

La vision cible attend, côté **workspace**, les rôles :

- Gestionnaire
- Utilisateur
- (Testeur en lecture workspace)

Preuve (document de référence) :

- `docs/BASE/ROLES_ET_GOUVERNANCE.md:84-120` (Gestionnaire / Utilisateur)
- `docs/BASE/ROLES_ET_GOUVERNANCE.md:67-81` (Testeur : visibilité multi-workspaces + droits explicites)

Écarts observables entre “rôles attendus” et “rôles techniques présents” :

- la terminologie technique observée côté workspace utilise `OWNER/USER/VIEWER`.
  - Preuves :
    - `backend/prisma/schema.prisma:193-198` (défaut `OWNER`)
    - `backend/prisma/seed-workspaces.js:95-101` (`USER`)
    - `backend/scripts/sync-supabase-users.js:103-113` (`VIEWER`)
- le contrôle d’autorisation workspace explicite observé est basé sur `OWNER` uniquement.
  - Preuve : `backend/middleware/workspace.middleware.js:107-116`

---

## 6. Risques identifiés (sur la base de l’observable)

### 6.1 Rôles comme chaînes libres

- `WorkspaceUser.role` est un `String` et des valeurs multiples sont écrites par différents scripts/flux.

Preuves :

- `backend/prisma/schema.prisma:193-198` (`String @default("OWNER")`)
- `backend/scripts/sync-supabase-users.js:103-113` (`VIEWER`)
- `backend/prisma/seed-workspaces.js:95-101` (`USER`)

### 6.2 Ambiguïtés possibles entre `OWNER` (observé) et “Gestionnaire” (vision)

- La vision parle d’un rôle workspace “Gestionnaire” ; le code utilise et contrôle explicitement `OWNER`.

Preuves :

- `docs/BASE/ROLES_ET_GOUVERNANCE.md:84-99` (Gestionnaire)
- `backend/middleware/workspace.middleware.js:107-116` (contrôle `OWNER`)

### 6.3 Interactions avec BASE

- Le workspace `BASE` est une convention (par `Workspace.name === 'BASE'`) et la gouvernance impose des contraintes spécifiques, mais les contrôles de rôle workspace observés ne distinguent pas BASE vs autres workspaces.

Preuves :

- `backend/services/business/workspace.service.js:8,33-59` (convention `DEFAULT_WORKSPACE_NAME = 'BASE'` + création lien)
- `backend/middleware/workspace.middleware.js:12-59` (`workspaceGuard` sans traitement spécifique BASE)
- `docs/BASE/ROLES_ET_GOUVERNANCE.md:129-133` (BASE : contraintes de gouvernance)

### 6.4 Effets sur import / duplication / administration

- Les routes métier et import s’appuient sur `workspaceGuard` (membership) sans contrôle additionnel de rôle workspace dans le montage central.

Preuves :

- `backend/routes/index.js:50-56`

---

## 7. Points de décision à trancher (questions métier, sans réponse)

### 7.1 Liste et typage

- Quelle est la **liste officielle** des rôles workspace attendus, et doit-elle être limitée à cette liste ?
- Le rôle workspace doit-il être contraint formellement (ex: enum / liste contrôlée), ou rester une chaîne libre ?

Constats de départ (preuves) :

- `backend/prisma/schema.prisma:193-198` (`role` en String)

### 7.2 Hiérarchie et sémantique

- Existe-t-il une **hiérarchie** entre les rôles workspace (ex: un rôle “gère les membres”, un rôle “utilise seulement”) ?
- Le terme “Gestionnaire” (vision) et le terme `OWNER` (observé) doivent-ils coexister, et si oui sous quelle forme (gouvernance / UI / technique) ?

Constats de départ (preuves) :

- `docs/BASE/ROLES_ET_GOUVERNANCE.md:84-120`
- `backend/middleware/workspace.middleware.js:107-116`

### 7.3 Permissions attachées (sans tableau final)

- Quelles opérations relèvent d’un rôle workspace élevé (ex: gestion membres, settings) vs d’un rôle workspace standard ?
- Les mutations de contenu (exercices, tags, entraînements, etc.) doivent-elles être conditionnées par un rôle workspace spécifique ?

Constats de départ (preuves) :

- `backend/routes/workspace.routes.js:11-14` (gestion membres/settings = `requireWorkspaceOwner`)
- `backend/routes/index.js:50-56` (routes métier = `workspaceGuard`)

### 7.4 Relation avec rôle plateforme

- Comment articuler rôle plateforme (ex: Administrateur, Testeur) et rôle workspace, notamment lorsque les scripts créent des rôles workspace (`OWNER/USER/VIEWER`) dans `BASE` ou `TEST` ?

Constats de départ (preuves) :

- `backend/services/business/workspace.service.js:25-84` (cas admin → workspace TEST `OWNER`)
- `backend/prisma/seed-workspaces.js:107-125` (cas admin → workspace TEST `OWNER`)

### 7.5 Cas BASE

- La règle « seul Administrateur modifie BASE » (vision) doit-elle s’appliquer même si un utilisateur possède un rôle workspace élevé dans BASE ?
- Quel est le statut attendu d’un rôle de lecture (`VIEWER` observé) dans BASE : cas normal, cas technique temporaire, ou cas à exclure ?

Constats de départ (preuves) :

- `docs/BASE/ROLES_ET_GOUVERNANCE.md:56-61` (Administrateur)
- `docs/BASE/ROLES_ET_GOUVERNANCE.md:78-80` (Testeur)
- `backend/controllers/auth.controller.js:119-136` (`VIEWER` dans BASE à l’inscription)
- `backend/scripts/sync-supabase-users.js:103-113` (`VIEWER` dans BASE)

---

**Fin du document**
