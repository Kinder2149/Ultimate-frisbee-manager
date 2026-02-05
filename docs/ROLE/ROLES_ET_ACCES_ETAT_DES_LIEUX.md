# Rôles & accès — État des lieux (backend)

## 1. Introduction (périmètre & méthodologie)

### Périmètre

Ce document décrit **strictement** l’état observé dans le code du backend :

- point d’entrée serveur,
- montage réel des routes (préfixes),
- middlewares liés à l’authentification, l’autorisation, les rôles et le contexte workspace,
- comportements observables en cas d’échec (codes HTTP + payloads),
- inventaire des routes exposées et des contrôles réellement appliqués.

### Méthodologie (traçabilité par le code)

- Point d’entrée serveur : `backend/server.js`.
- Création et configuration Express : `backend/app.js`.
- Montage des routes API (préfixes `/api/...`) : `backend/routes/index.js`.
- Middlewares “sécurité / accès” :
  - authentification / admin : `backend/middleware/auth.middleware.js`,
  - workspace : `backend/middleware/workspace.middleware.js`,
  - rate limiting global : `backend/middleware/rateLimit.middleware.js`,
  - gestion des erreurs : `backend/middleware/errorHandler.middleware.js`.
- Définition des rôles en base (Prisma schema) : `backend/prisma/schema.prisma`.

---

## 2. Inventaire des rôles globaux utilisateur (plateforme)

### Enum `UserRole`

Le schéma Prisma définit un enum `UserRole` avec exactement :

- `USER`
- `ADMIN`

Preuves : `backend/prisma/schema.prisma:11-14`.

### Champ `User.role`

Le modèle `User` contient :

- `role UserRole @default(USER)`
- `isActive Boolean @default(true)`

Preuves : `backend/prisma/schema.prisma:161-170`.

### Contrôle d’accès “admin” (`requireAdmin`)

Le middleware `requireAdmin` refuse l’accès si :

- `req.user` est absent, ou
- `String(req.user.role).toLowerCase() !== 'admin'`

Comportement en cas d’échec :

- HTTP `403`
- body : `{ error: 'Accès réservé aux administrateurs', code: 'FORBIDDEN' }`

Preuves : `backend/middleware/auth.middleware.js:296-308`.

---

## 3. Inventaire des rôles liés aux workspaces

### Champ `WorkspaceUser.role`

Le schéma Prisma définit `WorkspaceUser.role` comme :

- `role String @default("OWNER")`

Preuves : `backend/prisma/schema.prisma:193-199`.

### Rôle “workspace” exposé dans la requête

`workspaceGuard` assigne :

- `req.workspaceRole = link.role`

Preuves : `backend/middleware/workspace.middleware.js:54-58`.

### Contrôle “owner” (`requireWorkspaceOwner`)

Le middleware `requireWorkspaceOwner` autorise uniquement si :

- `String(link.role || '').toUpperCase() === 'OWNER'`

Comportement en cas d’échec :

- contexte workspace manquant (`!user || !workspaceId`) : HTTP `400`, code `WORKSPACE_CONTEXT_REQUIRED`
  - Preuves : `backend/middleware/workspace.middleware.js:81-86`
- lien workspace absent (`!link`) : HTTP `403`, code `WORKSPACE_FORBIDDEN`
  - Preuves : `backend/middleware/workspace.middleware.js:100-105`
- rôle différent de `OWNER` : HTTP `403`, code `WORKSPACE_OWNER_REQUIRED`
  - Preuves : `backend/middleware/workspace.middleware.js:107-116`

---

## 4. Inventaire des middlewares de sécurité / accès

## 4.1. Authentification (`authenticateToken`)

### Conditions d’activation

Le middleware est appelé explicitement sur certaines routes (via `app.use(...)` dans `backend/routes/index.js` ou directement dans un router).

Preuves (montage global par préfixe) :

- `/api/workspaces` : `backend/routes/index.js:45-47`
- `/api/exercises` : `backend/routes/index.js:50`
- `/api/tags` : `backend/routes/index.js:51`
- `/api/trainings` : `backend/routes/index.js:52`
- `/api/warmups` : `backend/routes/index.js:53`
- `/api/matches` : `backend/routes/index.js:54`
- `/api/dashboard` : `backend/routes/index.js:55`
- `/api/import` : `backend/routes/index.js:56`

Et sur certaines routes `auth` :

- `GET /api/auth/profile` : `backend/routes/auth.routes.js:87`
- `PUT /api/auth/profile` : `backend/routes/auth.routes.js:129`
- `POST /api/auth/update-password` : `backend/routes/auth.routes.js:163`
- `POST /api/auth/logout` : `backend/routes/auth.routes.js:188`

Et sur toutes les routes `/api/admin/*` via `router.use(...)` :

- `backend/routes/admin.routes.js:11`

### Échecs observables

- Token absent : HTTP `401`, code `NO_TOKEN`
  - Preuves : `backend/middleware/auth.middleware.js:90-95`
- Token invalide/expiré : HTTP `401`, code `INVALID_TOKEN`
  - Preuves : `backend/middleware/auth.middleware.js:206-213`
- “jose” manquant (configuration serveur invalide) : HTTP `500`, code `SERVER_CONFIG_ERROR`
  - Preuves : `backend/middleware/auth.middleware.js:97-103`
- Utilisateur non trouvé en base : HTTP `403`, code `USER_NOT_FOUND`
  - Preuves : `backend/middleware/auth.middleware.js:257-265`
- Utilisateur inactif : HTTP `401`, code `USER_INACTIVE`
  - Preuves : `backend/middleware/auth.middleware.js:275-281`

### Cas “DEV_BYPASS_AUTH”

Le middleware contient une branche de bypass si :

- `NODE_ENV === 'development'`
- et `DEV_BYPASS_AUTH === 'true'`
- et absence de token

Dans ce cas, `req.user` est défini avec : `role: 'ADMIN'`.

Preuves : `backend/middleware/auth.middleware.js:72-88`.

### Cas “fallback DB transitoire” (GET non admin)

En cas d’erreur DB lors de la récupération de l’utilisateur, le middleware peut autoriser une requête **uniquement si** :

- `req.method === 'GET'`
- et `!String(req.path || '').startsWith('/api/admin')`
- et `isTransientDbError(dbError)`

Dans ce cas, `req.user` est construit depuis le token avec :

- `role: (decoded.role && String(decoded.role).toUpperCase()) || 'USER'`

Preuves :

- conditions GET / admin : `backend/middleware/auth.middleware.js:235-239`
- construction `req.user` minimale : `backend/middleware/auth.middleware.js:240-247`

## 4.2. Autorisation “admin” (`requireAdmin`)

Voir section “Inventaire des rôles globaux utilisateur (plateforme)” pour :

- condition `role === 'admin'`
- échec HTTP `403` code `FORBIDDEN`

Preuves : `backend/middleware/auth.middleware.js:296-308`.

## 4.3. Workspace guard (`workspaceGuard`)

### Conditions d’activation

`workspaceGuard` est appliqué :

- au montage de plusieurs préfixes API (global) :
  - `/api/exercises` : `backend/routes/index.js:50`
  - `/api/tags` : `backend/routes/index.js:51`
  - `/api/trainings` : `backend/routes/index.js:52`
  - `/api/warmups` : `backend/routes/index.js:53`
  - `/api/matches` : `backend/routes/index.js:54`
  - `/api/dashboard` : `backend/routes/index.js:55`
  - `/api/import` : `backend/routes/index.js:56`
- au niveau router admin (sur toutes les routes admin) : `backend/routes/admin.routes.js:11`
- au niveau de certaines routes `workspaces` (gestion “owner” du workspace courant) :
  - `GET /api/workspaces/members` : `backend/routes/workspace.routes.js:12`
  - `PUT /api/workspaces/members` : `backend/routes/workspace.routes.js:13`
  - `PUT /api/workspaces/settings` : `backend/routes/workspace.routes.js:14`

### Règles et échecs observables

- Si `req.user` absent : HTTP `401`, code `NO_USER_FOR_WORKSPACE`
  - Preuves : `backend/middleware/workspace.middleware.js:17-23`
- Si `X-Workspace-Id` absent/vide : HTTP `400`, code `WORKSPACE_ID_REQUIRED`
  - Preuves : `backend/middleware/workspace.middleware.js:25-32`
- Si l’utilisateur n’est pas membre du workspace (`!link`) : HTTP `403`, code `WORKSPACE_FORBIDDEN`
  - Preuves : `backend/middleware/workspace.middleware.js:37-52`
- En cas d’exception : HTTP `500`, code `WORKSPACE_ERROR`
  - Preuves : `backend/middleware/workspace.middleware.js:60-66`

### Données attachées à la requête

En cas de succès, le middleware assigne :

- `req.workspaceId = wsId`
- `req.workspace = link.workspace`
- `req.workspaceLink = link`
- `req.workspaceRole = link.role`

Preuves : `backend/middleware/workspace.middleware.js:54-58`.

## 4.4. “Owner guard” (`requireWorkspaceOwner`)

Voir section “Inventaire des rôles liés aux workspaces”.

## 4.5. Rate limiting global (middlewares `writeMethodsRateLimit`, `readMethodsRateLimit`)

### Montage

Le backend applique 2 middlewares globalement :

- `app.use(writeMethodsRateLimit)`
- `app.use(readMethodsRateLimit)`

Preuves : `backend/app.js:103-108`.

### Conditions d’activation

Les deux fonctions quittent immédiatement si `!config.rateLimit.enabled`.

Preuves : `backend/middleware/rateLimit.middleware.js:38-39` et `:52-53`.

### Règles de déclenchement

- `writeMethodsRateLimit` s’applique uniquement si méthode ∈ `{POST, PUT, PATCH, DELETE}`.
  - Preuves : `backend/middleware/rateLimit.middleware.js:39-44`
- `readMethodsRateLimit` s’applique uniquement si méthode `GET`.
  - Preuves : `backend/middleware/rateLimit.middleware.js:53-58`
- `readLimiter` a une exclusion `skip` pour :
  - `path === '/api/health'` ou `path === '/api/health/db'`
  - Preuves : `backend/middleware/rateLimit.middleware.js:26-30`

### Réponses en cas de dépassement

Les payloads de message configurés sont :

- écriture : `{ error: "Trop de requêtes d'écriture, réessayez plus tard", code: "TOO_MANY_REQUESTS_WRITE" }`
  - Preuves : `backend/middleware/rateLimit.middleware.js:10-14`
- lecture : `{ error: "Trop de requêtes de lecture, réessayez dans quelques minutes", code: "TOO_MANY_REQUESTS_READ" }`
  - Preuves : `backend/middleware/rateLimit.middleware.js:22-25`

## 4.6. Gestion centralisée des erreurs (`errorHandler`)

### Montage

Le middleware est enregistré en dernier dans `app.js`.

Preuves : `backend/app.js:121-122`.

### Format de réponse

- `statusCode` : `err.statusCode || 500`
- `code` : `err.code || 'INTERNAL_SERVER_ERROR'`
- `details` : `err.details || undefined`
- `stack` : exposé uniquement si `NODE_ENV === 'development'`

Preuves : `backend/middleware/errorHandler.middleware.js:9-27`.

---

## 5. Tableau récapitulatif : route → contrôle d’accès

> Note : toutes les routes passent par les middlewares globaux d’`app.js` (CSP/helmet, CORS, rate limiting, `express.json()`, etc.). Preuves : `backend/app.js:15-110`.

### 5.1. Routes exposées au niveau `app`

| Méthode | Chemin | Middlewares / contrôles d’accès observés | Preuves |
|---|---|---|---|
| GET | `/api/docs` | Swagger UI (`swaggerUi.serve`, `swaggerUi.setup(...)`) | `backend/app.js:112-116` |
| GET | `/api` | handler inline (aucun contrôle d’accès explicite) | `backend/routes/index.js:60-78` |

### 5.2. Auth (`/api/auth/*`)

| Méthode | Chemin | Middlewares / contrôles d’accès observés | Échec (si applicable) | Preuves |
|---|---|---|---|---|
| POST | `/api/auth/register` | `registerLimiter`, `express.json({limit:'1mb'})` | rate-limit : réponse express-rate-limit (message défini) | `backend/routes/index.js:40-41`, `backend/routes/auth.routes.js:13-20,62` |
| GET | `/api/auth/profile` | `authenticateToken` | `401 NO_TOKEN`, `401 INVALID_TOKEN`, `403 USER_NOT_FOUND`, `401 USER_INACTIVE` | `backend/routes/auth.routes.js:87`, `backend/middleware/auth.middleware.js:90-95,206-213,257-265,275-281` |
| PUT | `/api/auth/profile` | `authenticateToken`, `createUploader('icon','avatars')` | idem `authenticateToken` | `backend/routes/auth.routes.js:129`, `backend/middleware/upload.middleware.js:52-56` |
| POST | `/api/auth/update-password` | `authenticateToken`, `express.json({limit:'1mb'})` | idem `authenticateToken` | `backend/routes/auth.routes.js:163` |
| POST | `/api/auth/logout` | `authenticateToken` | idem `authenticateToken` | `backend/routes/auth.routes.js:188` |

### 5.3. Health (`/api/health/*`) (public)

| Méthode | Chemin | Middlewares / contrôles d’accès observés | Preuves |
|---|---|---|---|
| GET | `/api/health` | handler inline (aucun contrôle d’accès explicite) | `backend/routes/index.js:42-43`, `backend/routes/health.routes.js:7-66` |
| GET | `/api/health/auth` | handler inline (aucun contrôle d’accès explicite) | `backend/routes/health.routes.js:70-81` |

### 5.4. Workspaces (`/api/workspaces/*`)

Montage du préfixe : `app.use('/api/workspaces', authenticateToken, workspaceRoutes)`.

Preuves : `backend/routes/index.js:45-47`.

| Méthode | Chemin | Middlewares / contrôles d’accès observés | Preuves |
|---|---|---|---|
| GET | `/api/workspaces/me` | `authenticateToken` | `backend/routes/workspace.routes.js:8` |
| GET | `/api/workspaces/:id/preload` | `authenticateToken` | `backend/routes/workspace.routes.js:9` |
| GET | `/api/workspaces/members` | `authenticateToken`, `workspaceGuard`, `requireWorkspaceOwner` | `backend/routes/workspace.routes.js:12` |
| PUT | `/api/workspaces/members` | `authenticateToken`, `workspaceGuard`, `requireWorkspaceOwner` | `backend/routes/workspace.routes.js:13` |
| PUT | `/api/workspaces/settings` | `authenticateToken`, `workspaceGuard`, `requireWorkspaceOwner` | `backend/routes/workspace.routes.js:14` |
| GET | `/api/workspaces/` | `authenticateToken`, `requireAdmin` | `backend/routes/workspace.routes.js:17`, `backend/middleware/auth.middleware.js:296-308` |
| POST | `/api/workspaces/` | `authenticateToken`, `requireAdmin` | `backend/routes/workspace.routes.js:18` |
| PUT | `/api/workspaces/:id` | `authenticateToken`, `requireAdmin` | `backend/routes/workspace.routes.js:19` |
| DELETE | `/api/workspaces/:id` | `authenticateToken`, `requireAdmin` | `backend/routes/workspace.routes.js:20` |
| POST | `/api/workspaces/:id/duplicate` | `authenticateToken`, `requireAdmin` | `backend/routes/workspace.routes.js:21` |
| GET | `/api/workspaces/:id/users` | `authenticateToken`, `requireAdmin` | `backend/routes/workspace.routes.js:23` |
| PUT | `/api/workspaces/:id/users` | `authenticateToken`, `requireAdmin` | `backend/routes/workspace.routes.js:24` |

### 5.5. Exercises (`/api/exercises/*`)

Montage du préfixe : `app.use('/api/exercises', authenticateToken, workspaceGuard, exerciceRoutes)`.

Preuves : `backend/routes/index.js:50`.

| Méthode | Chemin | Middlewares / contrôles d’accès observés | Preuves |
|---|---|---|---|
| GET | `/api/exercises/` | `authenticateToken`, `workspaceGuard` | `backend/routes/exercice.routes.js:51` |
| GET | `/api/exercises/:id` | `authenticateToken`, `workspaceGuard` | `backend/routes/exercice.routes.js:85` |
| POST | `/api/exercises/` | `authenticateToken`, `workspaceGuard`, `createUploader('image','exercices')`, `transformFormData`, `validate(createExerciceSchema)` | `backend/routes/exercice.routes.js:139-144` |
| PUT | `/api/exercises/:id` | `authenticateToken`, `workspaceGuard`, `createUploader('image','exercices')`, `transformFormData`, `validate(updateExerciceSchema)` | `backend/routes/exercice.routes.js:200` |
| POST | `/api/exercises/:id/duplicate` | `authenticateToken`, `workspaceGuard` | `backend/routes/exercice.routes.js:233` |
| DELETE | `/api/exercises/:id` | `authenticateToken`, `workspaceGuard` | `backend/routes/exercice.routes.js:262` |

### 5.6. Tags (`/api/tags/*`)

Montage du préfixe : `app.use('/api/tags', authenticateToken, workspaceGuard, tagRoutes)`.

Preuves : `backend/routes/index.js:51`.

| Méthode | Chemin | Middlewares / contrôles d’accès observés | Preuves |
|---|---|---|---|
| GET | `/api/tags/grouped` | `authenticateToken`, `workspaceGuard` | `backend/routes/tag.routes.js:10-12` |
| GET | `/api/tags/` | `authenticateToken`, `workspaceGuard` | `backend/routes/tag.routes.js:13-15` |
| GET | `/api/tags/:id` | `authenticateToken`, `workspaceGuard` | `backend/routes/tag.routes.js:16-18` |
| POST | `/api/tags/` | `authenticateToken`, `workspaceGuard`, `validate(createTagSchema)` | `backend/routes/tag.routes.js:19-21` |
| PUT | `/api/tags/:id` | `authenticateToken`, `workspaceGuard`, `validate(updateTagSchema)` | `backend/routes/tag.routes.js:22-24` |
| DELETE | `/api/tags/:id` | `authenticateToken`, `workspaceGuard` | `backend/routes/tag.routes.js:25-26` |

### 5.7. Trainings (`/api/trainings/*`)

Montage du préfixe : `app.use('/api/trainings', authenticateToken, workspaceGuard, entrainementRoutes)`.

Preuves : `backend/routes/index.js:52`.

| Méthode | Chemin | Middlewares / contrôles d’accès observés | Preuves |
|---|---|---|---|
| GET | `/api/trainings/` | `authenticateToken`, `workspaceGuard` | `backend/routes/entrainement.routes.js:14` |
| GET | `/api/trainings/:id` | `authenticateToken`, `workspaceGuard` | `backend/routes/entrainement.routes.js:15` |
| POST | `/api/trainings/` | `authenticateToken`, `workspaceGuard`, `...createUploader('image','entrainements')`, `transformFormData`, `validate(createEntrainementSchema)` | `backend/routes/entrainement.routes.js:17-22` |
| PUT | `/api/trainings/:id` | `authenticateToken`, `workspaceGuard`, `...createUploader('image','entrainements')`, `transformFormData`, `validate(updateEntrainementSchema)` | `backend/routes/entrainement.routes.js:24-29` |
| POST | `/api/trainings/:id/duplicate` | `authenticateToken`, `workspaceGuard` | `backend/routes/entrainement.routes.js:30` |
| DELETE | `/api/trainings/:id` | `authenticateToken`, `workspaceGuard` | `backend/routes/entrainement.routes.js:31` |

### 5.8. Warmups (`/api/warmups/*`)

Montage du préfixe : `app.use('/api/warmups', authenticateToken, workspaceGuard, echauffementRoutes)`.

Preuves : `backend/routes/index.js:53`.

| Méthode | Chemin | Middlewares / contrôles d’accès observés | Preuves |
|---|---|---|---|
| GET | `/api/warmups/` | `authenticateToken`, `workspaceGuard` | `backend/routes/echauffement.routes.js:10` |
| GET | `/api/warmups/:id` | `authenticateToken`, `workspaceGuard` | `backend/routes/echauffement.routes.js:11` |
| POST | `/api/warmups/` | `authenticateToken`, `workspaceGuard`, `createUploader('image','echauffements')`, `transformFormData`, `validate(createEchauffementSchema)` | `backend/routes/echauffement.routes.js:13-18` |
| PUT | `/api/warmups/:id` | `authenticateToken`, `workspaceGuard`, `createUploader('image','echauffements')`, `transformFormData`, `validate(updateEchauffementSchema)` | `backend/routes/echauffement.routes.js:20-25` |
| DELETE | `/api/warmups/:id` | `authenticateToken`, `workspaceGuard` | `backend/routes/echauffement.routes.js:26` |
| POST | `/api/warmups/:id/duplicate` | `authenticateToken`, `workspaceGuard` | `backend/routes/echauffement.routes.js:27` |

### 5.9. Matches (`/api/matches/*`)

Montage du préfixe : `app.use('/api/matches', authenticateToken, workspaceGuard, situationMatchRoutes)`.

Preuves : `backend/routes/index.js:54`.

| Méthode | Chemin | Middlewares / contrôles d’accès observés | Preuves |
|---|---|---|---|
| GET | `/api/matches/` | `authenticateToken`, `workspaceGuard` | `backend/routes/situationmatch.routes.js:14` |
| GET | `/api/matches/:id` | `authenticateToken`, `workspaceGuard` | `backend/routes/situationmatch.routes.js:15` |
| POST | `/api/matches/` | `authenticateToken`, `workspaceGuard`, `createUploader('image','situations-matchs')`, `transformFormData`, `validate(createSituationMatchSchema)` | `backend/routes/situationmatch.routes.js:17-22` |
| PUT | `/api/matches/:id` | `authenticateToken`, `workspaceGuard`, `createUploader('image','situations-matchs')`, `transformFormData`, `validate(updateSituationMatchSchema)` | `backend/routes/situationmatch.routes.js:24-29` |
| POST | `/api/matches/:id/duplicate` | `authenticateToken`, `workspaceGuard` | `backend/routes/situationmatch.routes.js:30` |
| DELETE | `/api/matches/:id` | `authenticateToken`, `workspaceGuard` | `backend/routes/situationmatch.routes.js:31` |

### 5.10. Dashboard (`/api/dashboard/*`)

Montage du préfixe : `app.use('/api/dashboard', authenticateToken, workspaceGuard, dashboardRoutes)`.

Preuves : `backend/routes/index.js:55`.

| Méthode | Chemin | Middlewares / contrôles d’accès observés | Preuves |
|---|---|---|---|
| GET | `/api/dashboard/stats` | `authenticateToken`, `workspaceGuard` | `backend/routes/dashboard.routes.js:8-9` |

### 5.11. Import (`/api/import/*`)

Montage du préfixe : `app.use('/api/import', authenticateToken, workspaceGuard, importRoutes)`.

Preuves : `backend/routes/index.js:56`.

Contrôle conditionnel via `ALLOW_PUBLIC_IMPORT` :

- `allowPublicImport = (process.env.ALLOW_PUBLIC_IMPORT || 'false').toLowerCase() === 'true'`
- si `allowPublicImport` : deux routes sont enregistrées **avant** `router.use(requireAdmin)`
- sinon : ces routes sont enregistrées **après** `router.use(requireAdmin)`

Preuves : `backend/routes/import.routes.js:6-23`.

| Méthode | Chemin | Middlewares / contrôles d’accès observés | Preuves |
|---|---|---|---|
| POST | `/api/import/exercices` | toujours : `authenticateToken`, `workspaceGuard` ; puis `express.json({limit:'5mb'})` ; et `requireAdmin` selon `ALLOW_PUBLIC_IMPORT` | `backend/routes/import.routes.js:6-23` |
| POST | `/api/import/markdown` | toujours : `authenticateToken`, `workspaceGuard` ; puis `express.json({limit:'10mb'})` ; et `requireAdmin` selon `ALLOW_PUBLIC_IMPORT` | `backend/routes/import.routes.js:6-23` |
| POST | `/api/import/entrainements` | `authenticateToken`, `workspaceGuard`, `requireAdmin`, `express.json({limit:'10mb'})` | `backend/routes/import.routes.js:16-18,26-27` |
| POST | `/api/import/echauffements` | `authenticateToken`, `workspaceGuard`, `requireAdmin`, `express.json({limit:'10mb'})` | `backend/routes/import.routes.js:16-18,29-30` |
| POST | `/api/import/situations-matchs` | `authenticateToken`, `workspaceGuard`, `requireAdmin`, `express.json({limit:'10mb'})` | `backend/routes/import.routes.js:16-18,31-32` |

### 5.12. Admin (`/api/admin/*`)

Montage du préfixe : `app.use('/api/admin', adminRoutes)`.

Preuves : `backend/routes/index.js:58`.

Protection au niveau router : `router.use(authenticateToken, requireAdmin, workspaceGuard)`.

Preuves : `backend/routes/admin.routes.js:11`.

| Méthode | Chemin | Middlewares / contrôles d’accès observés | Preuves |
|---|---|---|---|
| GET | `/api/admin/overview` | `authenticateToken` + `requireAdmin` + `workspaceGuard` | `backend/routes/admin.routes.js:11,14` |
| GET | `/api/admin/all-content` | idem | `backend/routes/admin.routes.js:11,15` |
| GET | `/api/admin/all-tags` | idem | `backend/routes/admin.routes.js:11,16` |
| GET | `/api/admin/export-ufm` | idem | `backend/routes/admin.routes.js:11,19` |
| GET | `/api/admin/list-exercices` | idem | `backend/routes/admin.routes.js:11,22` |
| GET | `/api/admin/list-entrainements` | idem | `backend/routes/admin.routes.js:11,23` |
| GET | `/api/admin/list-echauffements` | idem | `backend/routes/admin.routes.js:11,24` |
| GET | `/api/admin/list-situations-matchs` | idem | `backend/routes/admin.routes.js:11,25` |
| GET | `/api/admin/users` | idem | `backend/routes/admin.routes.js:11,28` |
| PATCH | `/api/admin/users/:id` | idem | `backend/routes/admin.routes.js:11,29` |
| POST | `/api/admin/users` | idem | `backend/routes/admin.routes.js:11,30` |
| POST | `/api/admin/bulk-delete` | idem | `backend/routes/admin.routes.js:11,33` |
| POST | `/api/admin/bulk-duplicate` | idem | `backend/routes/admin.routes.js:11,34` |

---

## 6. Cas particuliers observés

### 6.1. Route “/api/sync” référencée mais non montée

Le fichier de montage des routes importe `syncRoutes` :

- `const syncRoutes = require('./sync.routes');`

Preuves : `backend/routes/index.js:32-33`.

Cependant, aucun `app.use('/api/sync', syncRoutes)` n’est présent dans la fonction exportée.

Preuves : `backend/routes/index.js:39-79`.

### 6.2. Routes définies dans `sync.routes.js`

Le router `backend/routes/sync.routes.js` définit :

- `GET /versions` avec middlewares `authenticateToken`, `workspaceGuard`
  - Preuves : `backend/routes/sync.routes.js:12`
- `GET /health` sans middleware d’auth explicite
  - Preuves : `backend/routes/sync.routes.js:63-68`

### 6.3. Bypass auth en développement (`DEV_BYPASS_AUTH`)

Voir section `authenticateToken`.

### 6.4. “Admin global” combiné au contexte workspace

Les routes `/api/admin/*` requièrent :

- un utilisateur authentifié (`authenticateToken`),
- un rôle admin (`requireAdmin`),
- un `X-Workspace-Id` valide appartenant à l’utilisateur (`workspaceGuard`).

Preuves : `backend/routes/admin.routes.js:11` + règles `workspaceGuard` (`backend/middleware/workspace.middleware.js:25-52`).

---

## 7. Conclusion (strictement descriptive)

- Le code backend observé implémente un rôle global `User.role` basé sur l’enum Prisma `UserRole` (`USER`, `ADMIN`). Preuves : `backend/prisma/schema.prisma:11-14,161-170`.
- Le code backend observe un rôle workspace `WorkspaceUser.role` de type `String` (défaut `"OWNER"`) et applique un contrôle strict `OWNER` via `requireWorkspaceOwner`. Preuves : `backend/prisma/schema.prisma:193-199` + `backend/middleware/workspace.middleware.js:107-116`.
- Les contrôles d’accès sont principalement réalisés via les middlewares `authenticateToken`, `requireAdmin`, `workspaceGuard`, `requireWorkspaceOwner`, et leur montage dépend des préfixes `/api/...` et des `router.use(...)` dans certains routers. Preuves : `backend/routes/index.js:45-58`, `backend/routes/admin.routes.js:11`, `backend/routes/workspace.routes.js:12-24`.
- Deux mécanismes conditionnels sont observables :
  - bypass dev `DEV_BYPASS_AUTH` dans `authenticateToken`. Preuves : `backend/middleware/auth.middleware.js:72-88`.
  - exposition conditionnelle des endpoints import selon `ALLOW_PUBLIC_IMPORT`. Preuves : `backend/routes/import.routes.js:6-23`.
