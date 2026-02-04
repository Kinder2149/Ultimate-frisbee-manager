# Inventaire des contrôles d’accès Backend — Ultimate Frisbee Manager

## 1. Méthode d’inventaire (factuelle et vérifiable)

### 1.1 Principe
Cet inventaire est construit **uniquement par observation** du backend (Express) :
- lecture du pipeline global `backend/app.js`,
- lecture du montage central des routes `backend/routes/index.js`,
- lecture de chaque fichier `backend/routes/*.routes.js`,
- lecture des middlewares de contrôle d’accès :
  - `backend/middleware/auth.middleware.js`
  - `backend/middleware/workspace.middleware.js`
  - `backend/middleware/rateLimit.middleware.js`

### 1.2 Ce qui est considéré comme “contrôle d’accès” dans ce document
Sont inclus uniquement les mécanismes qui **peuvent autoriser/refuser** (ou limiter) l’accès :
- authentification (`authenticateToken`),
- autorisation plateforme (rôle admin via `requireAdmin`),
- autorisation workspace (membership via `workspaceGuard`, rôle owner via `requireWorkspaceOwner`),
- contrôle de contexte workspace actif (`X-Workspace-Id` via `workspaceGuard`),
- limites d’exposition liées à l’environnement (`ALLOW_PUBLIC_IMPORT`),
- contrôles transverses applicatifs :
  - CORS,
  - rate limiting.

Ne sont **pas** détaillés comme contrôles d’accès (car ils ne portent pas sur l’identité/droits) : validation Zod, transform middleware, upload middleware.

### 1.3 Préambule important : middlewares globaux applicables à toutes les routes
Dans `backend/app.js`, les middlewares suivants s’appliquent à **toutes** les routes (dans cet ordre, avant les routes) :
- `helmet(...)` (sécurité headers) — `backend/app.js:15-33`
- `cors(...)` (contrôle d’origine) — `backend/app.js:92-101`
- `writeMethodsRateLimit` (POST/PUT/PATCH/DELETE) — `backend/app.js:103-105`
- `readMethodsRateLimit` (GET) — `backend/app.js:106-107`
- `express.json()` — `backend/app.js:109-110`

La documentation Swagger est exposée via :
- `app.use('/api/docs', ...)` — `backend/app.js:112-116`

Les routes API applicatives sont montées via :
- `require('./routes')(app)` — `backend/app.js:118-120`

---

## 2. Middlewares de contrôle d’accès (définitions et conditions exactes)

### 2.1 `authenticateToken` (authentification)
- Fichier : `backend/middleware/auth.middleware.js`
- Déclencheur : présence d’un header `Authorization: Bearer <token>`.
- Refus :
  - 401 si token absent (`NO_TOKEN`) — `auth.middleware.js:90-95`
  - 401 si token invalide/expiré (`INVALID_TOKEN`) — `auth.middleware.js:206-213`
  - 403 si profil utilisateur introuvable en DB (`USER_NOT_FOUND`) — `auth.middleware.js:257-265`
  - 401 si utilisateur inactif (`USER_INACTIVE`) — `auth.middleware.js:275-281`
- Particularité (bypass dev) : si `NODE_ENV=development` ET `DEV_BYPASS_AUTH=true` ET aucun token, alors injection d’un `req.user` fictif avec `role: 'ADMIN'` — `auth.middleware.js:72-88`.

### 2.2 `requireAdmin` (autorisation plateforme)
- Fichier : `backend/middleware/auth.middleware.js`
- Condition exacte : `String(req.user.role).toLowerCase() === 'admin'`.
- Refus : 403 `FORBIDDEN` si absent/non admin — `auth.middleware.js:299-307`.

### 2.3 `workspaceGuard` (résolution + contrôle workspace actif)
- Fichier : `backend/middleware/workspace.middleware.js`
- Condition exacte :
  - nécessite un utilisateur déjà résolu (`req.user`), sinon 401 `NO_USER_FOR_WORKSPACE` — `workspace.middleware.js:17-23`
  - nécessite un header `X-Workspace-Id` (ou `x-workspace-id`) non vide, sinon 400 `WORKSPACE_ID_REQUIRED` — `workspace.middleware.js:25-31`
  - nécessite une ligne `WorkspaceUser` liant `userId=req.user.id` et `workspaceId=<header>`, sinon 403 `WORKSPACE_FORBIDDEN` — `workspace.middleware.js:36-52`
- Effets : définit `req.workspaceId`, `req.workspaceRole`, etc. — `workspace.middleware.js:54-58`.

### 2.4 `requireWorkspaceOwner` (autorisation workspace “OWNER”)
- Fichier : `backend/middleware/workspace.middleware.js`
- Condition exacte : `String(link.role).toUpperCase() === 'OWNER'`.
- Refus : 403 `WORKSPACE_OWNER_REQUIRED` si ≠ `OWNER` — `workspace.middleware.js:107-116`.

### 2.5 Rate limiting (contrôle transversal)
- Fichier : `backend/middleware/rateLimit.middleware.js`
- `writeMethodsRateLimit` : applique `express-rate-limit` sur méthodes `POST|PUT|PATCH|DELETE` — `rateLimit.middleware.js:37-44`
- `readMethodsRateLimit` : applique `express-rate-limit` sur `GET` (1000 req / 15 min) — `rateLimit.middleware.js:51-58`
- Exclusions déclarées : `skip` si `req.path === '/api/health' || req.path === '/api/health/db'` — `rateLimit.middleware.js:26-30`

### 2.6 CORS (contrôle transversal)
- Fichier : `backend/app.js`
- Contrôle : `isAllowedOrigin(origin)` + rejet si origine non autorisée — `app.js:83-99`.

---

## 3. Tableau exhaustif des endpoints API et contrôles d’accès

> Lecture :
> - **Global** = middlewares de `backend/app.js` applicables à toutes les routes.
> - **Montage** = middlewares appliqués au moment du `app.use('/api/...', ...)` dans `backend/routes/index.js`.
> - **Local** = middlewares appliqués sur l’endpoint (dans le router `*.routes.js`).

### 3.1 Endpoints transverses (Swagger + racine API)

| Endpoint | Méthode | Middlewares appliqués (ordre) | Conditions exactes | Preuves (fichier:lignes) |
|---|---:|---|---|---|
| `/api/docs` | ALL | Global: `helmet` -> `cors` -> `writeMethodsRateLimit/readMethodsRateLimit` -> `express.json` ; Local: `swaggerUi.serve`, `swaggerUi.setup(...)` | CORS + rate limit uniquement (pas d’auth token explicitement sur cette route) | `backend/app.js:15-33,92-110,112-116` |
| `/api` | GET | Global ; Local: handler `app.get('/api', ...)` | CORS + rate limit uniquement (pas d’auth token explicitement sur cette route) | `backend/routes/index.js:60-78` |

### 3.2 Santé

| Endpoint | Méthode | Middlewares appliqués (ordre) | Conditions exactes | Preuves (fichier:lignes) |
|---|---:|---|---|---|
| `/api/health` | GET | Global ; Montage: `app.use('/api/health', healthRoutes)` ; Local: handler | Public (pas d’auth). CORS + rate limit GET s’appliquent. | Montage `backend/routes/index.js:42-43` ; route `backend/routes/health.routes.js:5-67` |
| `/api/health/auth` | GET | Global ; Montage health ; Local: handler | Public (pas d’auth). Retourne un diagnostic sur la présence du header Authorization. | `backend/routes/health.routes.js:68-81` |

### 3.3 Auth (profil local)

| Endpoint | Méthode | Middlewares appliqués (ordre) | Conditions exactes | Preuves (fichier:lignes) |
|---|---:|---|---|---|
| `/api/auth/register` | POST | Global ; Montage: `app.use('/api/auth', authRoutes)` ; Local: `registerLimiter` -> `express.json({limit})` -> controller | Public (pas `authenticateToken` sur cet endpoint). Rate limit spécifique : 3 / 15 min. | Montage `backend/routes/index.js:40-41` ; endpoint `backend/routes/auth.routes.js:14-20,62` |
| `/api/auth/profile` | GET | Global ; Montage auth ; Local: `authenticateToken` -> controller | Token requis (`Authorization: Bearer`). Refus possibles 401/403 selon `authenticateToken`. | `backend/routes/auth.routes.js:87-88` + middleware `backend/middleware/auth.middleware.js:66-285` |
| `/api/auth/profile` | PUT | Global ; Montage auth ; Local: `authenticateToken` -> `createUploader('icon', ...)` -> controller | Token requis. (Upload/transform non considérés comme contrôle d’accès ici.) | `backend/routes/auth.routes.js:129-130` |
| `/api/auth/update-password` | POST | Global ; Montage auth ; Local: `authenticateToken` -> `express.json({limit})` -> controller | Token requis. | `backend/routes/auth.routes.js:163` |
| `/api/auth/logout` | POST | Global ; Montage auth ; Local: `authenticateToken` -> controller | Token requis. | `backend/routes/auth.routes.js:188` |

### 3.4 Workspaces

Montage global :
- `app.use('/api/workspaces', authenticateToken, workspaceRoutes)` — `backend/routes/index.js:45-47`

| Endpoint | Méthode | Middlewares appliqués (ordre) | Conditions exactes | Preuves (fichier:lignes) |
|---|---:|---|---|---|
| `/api/workspaces/me` | GET | Global ; Montage: `authenticateToken` ; Local: controller | Token requis. Pas de `workspaceGuard` requis sur cette route. | Montage `backend/routes/index.js:45-47` ; `backend/routes/workspace.routes.js:8` |
| `/api/workspaces/:id/preload` | GET | Global ; Montage: `authenticateToken` ; Local: controller | Token requis. Contrôle d’accès au workspace effectué dans le contrôleur (membership via `WorkspaceUser`) plutôt que via `workspaceGuard` (constat d’architecture). | `backend/routes/workspace.routes.js:9` (contrôle dans controller non listé ici) |
| `/api/workspaces/members` | GET | Global ; Montage: `authenticateToken` ; Local: `workspaceGuard` -> `requireWorkspaceOwner` -> controller | Token requis + header `X-Workspace-Id` requis + membership requis + rôle `OWNER` requis. | `backend/routes/workspace.routes.js:11-13` ; `backend/middleware/workspace.middleware.js:12-59,76-120` |
| `/api/workspaces/members` | PUT | Global ; Montage: `authenticateToken` ; Local: `workspaceGuard` -> `requireWorkspaceOwner` -> controller | Idem ci-dessus. | `backend/routes/workspace.routes.js:13` |
| `/api/workspaces/settings` | PUT | Global ; Montage: `authenticateToken` ; Local: `workspaceGuard` -> `requireWorkspaceOwner` -> controller | Idem ci-dessus. | `backend/routes/workspace.routes.js:14` |
| `/api/workspaces/` | GET | Global ; Montage: `authenticateToken` ; Local: `requireAdmin` -> controller | Token requis + rôle plateforme admin requis. | `backend/routes/workspace.routes.js:17` ; `backend/middleware/auth.middleware.js:299-307` |
| `/api/workspaces/` | POST | Global ; Montage: `authenticateToken` ; Local: `requireAdmin` -> controller | Token requis + admin requis. | `backend/routes/workspace.routes.js:18` |
| `/api/workspaces/:id` | PUT | Global ; Montage: `authenticateToken` ; Local: `requireAdmin` -> controller | Token requis + admin requis. | `backend/routes/workspace.routes.js:19` |
| `/api/workspaces/:id` | DELETE | Global ; Montage: `authenticateToken` ; Local: `requireAdmin` -> controller | Token requis + admin requis. | `backend/routes/workspace.routes.js:20` |
| `/api/workspaces/:id/duplicate` | POST | Global ; Montage: `authenticateToken` ; Local: `requireAdmin` -> controller | Token requis + admin requis. | `backend/routes/workspace.routes.js:21` |
| `/api/workspaces/:id/users` | GET | Global ; Montage: `authenticateToken` ; Local: `requireAdmin` -> controller | Token requis + admin requis. | `backend/routes/workspace.routes.js:23` |
| `/api/workspaces/:id/users` | PUT | Global ; Montage: `authenticateToken` ; Local: `requireAdmin` -> controller | Token requis + admin requis. | `backend/routes/workspace.routes.js:24` |

### 3.5 Exercices

Montage global :
- `app.use('/api/exercises', authenticateToken, workspaceGuard, exerciceRoutes)` — `backend/routes/index.js:50-50`

| Endpoint | Méthode | Middlewares appliqués (ordre) | Conditions exactes | Preuves (fichier:lignes) |
|---|---:|---|---|---|
| `/api/exercises/` | GET | Global ; Montage: `authenticateToken` -> `workspaceGuard` ; Local: controller | Token requis + `X-Workspace-Id` requis + membership workspace requis. | Montage `backend/routes/index.js:50` ; route `backend/routes/exercice.routes.js:51` ; workspaceGuard `backend/middleware/workspace.middleware.js:12-59` |
| `/api/exercises/:id` | GET | Global ; Montage: `authenticateToken` -> `workspaceGuard` ; Local: controller | Idem. | `backend/routes/exercice.routes.js:85` |
| `/api/exercises/` | POST | Global ; Montage: `authenticateToken` -> `workspaceGuard` ; Local: upload/transform/validate -> controller | Idem (contrôle d’accès par montage). | `backend/routes/exercice.routes.js:139-144` |
| `/api/exercises/:id` | PUT | Global ; Montage: `authenticateToken` -> `workspaceGuard` ; Local: upload/transform/validate -> controller | Idem. | `backend/routes/exercice.routes.js:200` |
| `/api/exercises/:id/duplicate` | POST | Global ; Montage: `authenticateToken` -> `workspaceGuard` ; Local: controller | Idem. | `backend/routes/exercice.routes.js:233` |
| `/api/exercises/:id` | DELETE | Global ; Montage: `authenticateToken` -> `workspaceGuard` ; Local: controller | Idem. | `backend/routes/exercice.routes.js:262` |

### 3.6 Tags

Montage global :
- `app.use('/api/tags', authenticateToken, workspaceGuard, tagRoutes)` — `backend/routes/index.js:51-51`

| Endpoint | Méthode | Middlewares appliqués (ordre) | Conditions exactes | Preuves (fichier:lignes) |
|---|---:|---|---|---|
| `/api/tags/grouped` | GET | Global ; Montage: `authenticateToken` -> `workspaceGuard` ; Local: controller | Token requis + `X-Workspace-Id` requis + membership requis. | Montage `backend/routes/index.js:51` ; route `backend/routes/tag.routes.js:11` |
| `/api/tags/` | GET | Global ; Montage: `authenticateToken` -> `workspaceGuard` ; Local: controller | Idem. | `backend/routes/tag.routes.js:14` |
| `/api/tags/:id` | GET | Global ; Montage: `authenticateToken` -> `workspaceGuard` ; Local: controller | Idem. | `backend/routes/tag.routes.js:17` |
| `/api/tags/` | POST | Global ; Montage: `authenticateToken` -> `workspaceGuard` ; Local: `validate(...)` -> controller | Idem. | `backend/routes/tag.routes.js:20` |
| `/api/tags/:id` | PUT | Global ; Montage: `authenticateToken` -> `workspaceGuard` ; Local: `validate(...)` -> controller | Idem. | `backend/routes/tag.routes.js:23` |
| `/api/tags/:id` | DELETE | Global ; Montage: `authenticateToken` -> `workspaceGuard` ; Local: controller | Idem. | `backend/routes/tag.routes.js:26` |

### 3.7 Entraînements

Montage global :
- `app.use('/api/trainings', authenticateToken, workspaceGuard, entrainementRoutes)` — `backend/routes/index.js:52-52`

| Endpoint | Méthode | Middlewares appliqués (ordre) | Conditions exactes | Preuves (fichier:lignes) |
|---|---:|---|---|---|
| `/api/trainings/` | GET | Global ; Montage: `authenticateToken` -> `workspaceGuard` ; Local: controller | Token requis + `X-Workspace-Id` requis + membership requis. | Montage `backend/routes/index.js:52` ; route `backend/routes/entrainement.routes.js:14` |
| `/api/trainings/:id` | GET | Global ; Montage: `authenticateToken` -> `workspaceGuard` ; Local: controller | Idem. | `backend/routes/entrainement.routes.js:15` |
| `/api/trainings/` | POST | Global ; Montage: `authenticateToken` -> `workspaceGuard` ; Local: upload/transform/validate -> controller | Idem. | `backend/routes/entrainement.routes.js:17-22` |
| `/api/trainings/:id` | PUT | Global ; Montage: `authenticateToken` -> `workspaceGuard` ; Local: upload/transform/validate -> controller | Idem. | `backend/routes/entrainement.routes.js:24-29` |
| `/api/trainings/:id/duplicate` | POST | Global ; Montage: `authenticateToken` -> `workspaceGuard` ; Local: controller | Idem. | `backend/routes/entrainement.routes.js:30` |
| `/api/trainings/:id` | DELETE | Global ; Montage: `authenticateToken` -> `workspaceGuard` ; Local: controller | Idem. | `backend/routes/entrainement.routes.js:31` |

### 3.8 Échauffements

Montage global :
- `app.use('/api/warmups', authenticateToken, workspaceGuard, echauffementRoutes)` — `backend/routes/index.js:53-53`

| Endpoint | Méthode | Middlewares appliqués (ordre) | Conditions exactes | Preuves (fichier:lignes) |
|---|---:|---|---|---|
| `/api/warmups/` | GET | Global ; Montage: `authenticateToken` -> `workspaceGuard` ; Local: controller | Token requis + `X-Workspace-Id` requis + membership requis. | Montage `backend/routes/index.js:53` ; route `backend/routes/echauffement.routes.js:10` |
| `/api/warmups/:id` | GET | Global ; Montage: `authenticateToken` -> `workspaceGuard` ; Local: controller | Idem. | `backend/routes/echauffement.routes.js:11` |
| `/api/warmups/` | POST | Global ; Montage: `authenticateToken` -> `workspaceGuard` ; Local: upload/transform/validate -> controller | Idem. | `backend/routes/echauffement.routes.js:13-18` |
| `/api/warmups/:id` | PUT | Global ; Montage: `authenticateToken` -> `workspaceGuard` ; Local: upload/transform/validate -> controller | Idem. | `backend/routes/echauffement.routes.js:20-25` |
| `/api/warmups/:id` | DELETE | Global ; Montage: `authenticateToken` -> `workspaceGuard` ; Local: controller | Idem. | `backend/routes/echauffement.routes.js:26` |
| `/api/warmups/:id/duplicate` | POST | Global ; Montage: `authenticateToken` -> `workspaceGuard` ; Local: controller | Idem. | `backend/routes/echauffement.routes.js:27` |

### 3.9 Situations / matchs

Montage global :
- `app.use('/api/matches', authenticateToken, workspaceGuard, situationMatchRoutes)` — `backend/routes/index.js:54-54`

| Endpoint | Méthode | Middlewares appliqués (ordre) | Conditions exactes | Preuves (fichier:lignes) |
|---|---:|---|---|---|
| `/api/matches/` | GET | Global ; Montage: `authenticateToken` -> `workspaceGuard` ; Local: controller | Token requis + `X-Workspace-Id` requis + membership requis. | Montage `backend/routes/index.js:54` ; route `backend/routes/situationmatch.routes.js:14` |
| `/api/matches/:id` | GET | Global ; Montage: `authenticateToken` -> `workspaceGuard` ; Local: controller | Idem. | `backend/routes/situationmatch.routes.js:15` |
| `/api/matches/` | POST | Global ; Montage: `authenticateToken` -> `workspaceGuard` ; Local: upload/transform/validate -> controller | Idem. | `backend/routes/situationmatch.routes.js:17-22` |
| `/api/matches/:id` | PUT | Global ; Montage: `authenticateToken` -> `workspaceGuard` ; Local: upload/transform/validate -> controller | Idem. | `backend/routes/situationmatch.routes.js:24-29` |
| `/api/matches/:id/duplicate` | POST | Global ; Montage: `authenticateToken` -> `workspaceGuard` ; Local: controller | Idem. | `backend/routes/situationmatch.routes.js:30` |
| `/api/matches/:id` | DELETE | Global ; Montage: `authenticateToken` -> `workspaceGuard` ; Local: controller | Idem. | `backend/routes/situationmatch.routes.js:31` |

### 3.10 Dashboard

Montage global :
- `app.use('/api/dashboard', authenticateToken, workspaceGuard, dashboardRoutes)` — `backend/routes/index.js:55-55`

| Endpoint | Méthode | Middlewares appliqués (ordre) | Conditions exactes | Preuves (fichier:lignes) |
|---|---:|---|---|---|
| `/api/dashboard/stats` | GET | Global ; Montage: `authenticateToken` -> `workspaceGuard` ; Local: controller | Token requis + `X-Workspace-Id` requis + membership requis. | Montage `backend/routes/index.js:55` ; route `backend/routes/dashboard.routes.js:8-9` |

### 3.11 Import

Montage global :
- `app.use('/api/import', authenticateToken, workspaceGuard, importRoutes)` — `backend/routes/index.js:56-56`

| Endpoint | Méthode | Middlewares appliqués (ordre) | Conditions exactes | Preuves (fichier:lignes) |
|---|---:|---|---|---|
| `/api/import/exercices` | POST | Global ; Montage: `authenticateToken` -> `workspaceGuard` ; Local: **si** `ALLOW_PUBLIC_IMPORT=true` alors `express.json` -> controller ; puis `router.use(requireAdmin)` s’applique aux routes suivantes | Dans tous les cas : token requis + workspace actif requis (montage). Ensuite :
- si `ALLOW_PUBLIC_IMPORT=true`, ce endpoint est défini **avant** `requireAdmin`.
- si `ALLOW_PUBLIC_IMPORT=false`, ce endpoint est défini **après** `requireAdmin`.
| Montage `backend/routes/index.js:56` ; `backend/routes/import.routes.js:6-23` |
| `/api/import/markdown` | POST | Global ; Montage: `authenticateToken` -> `workspaceGuard` ; Local: même logique `ALLOW_PUBLIC_IMPORT` que ci-dessus | Idem. | `backend/routes/import.routes.js:9-23` |
| `/api/import/entrainements` | POST | Global ; Montage: `authenticateToken` -> `workspaceGuard` ; Local: `requireAdmin` (via `router.use`) -> `express.json` -> controller | Token requis + workspace actif requis + admin requis. | `backend/routes/import.routes.js:16-18,25-32` |
| `/api/import/echauffements` | POST | Global ; Montage: `authenticateToken` -> `workspaceGuard` ; Local: `requireAdmin` -> `express.json` -> controller | Token requis + workspace actif requis + admin requis. | `backend/routes/import.routes.js:16-18,28-32` |
| `/api/import/situations-matchs` | POST | Global ; Montage: `authenticateToken` -> `workspaceGuard` ; Local: `requireAdmin` -> `express.json` -> controller | Token requis + workspace actif requis + admin requis. | `backend/routes/import.routes.js:16-18,31-32` |

### 3.12 Admin (plateforme)

Montage global :
- `app.use('/api/admin', adminRoutes)` — `backend/routes/index.js:58-58`

Middleware appliqué à **toutes** les routes admin (dans le router) :
- `router.use(authenticateToken, requireAdmin, workspaceGuard)` — `backend/routes/admin.routes.js:11`

| Endpoint | Méthode | Middlewares appliqués (ordre) | Conditions exactes | Preuves (fichier:lignes) |
|---|---:|---|---|---|
| `/api/admin/overview` | GET | Global ; Montage: (router admin) `authenticateToken` -> `requireAdmin` -> `workspaceGuard` ; Local: controller | Token requis + admin requis + `X-Workspace-Id` requis + membership requis. | Montage `backend/routes/index.js:58` ; `backend/routes/admin.routes.js:11,14` |
| `/api/admin/all-content` | GET | Idem | Idem | `backend/routes/admin.routes.js:15` |
| `/api/admin/all-tags` | GET | Idem | Idem | `backend/routes/admin.routes.js:16` |
| `/api/admin/export-ufm` | GET | Idem | Idem | `backend/routes/admin.routes.js:19` |
| `/api/admin/list-exercices` | GET | Idem | Idem | `backend/routes/admin.routes.js:22` |
| `/api/admin/list-entrainements` | GET | Idem | Idem | `backend/routes/admin.routes.js:23` |
| `/api/admin/list-echauffements` | GET | Idem | Idem | `backend/routes/admin.routes.js:24` |
| `/api/admin/list-situations-matchs` | GET | Idem | Idem | `backend/routes/admin.routes.js:25` |
| `/api/admin/users` | GET | Idem | Idem | `backend/routes/admin.routes.js:28` |
| `/api/admin/users/:id` | PATCH | Idem | Idem | `backend/routes/admin.routes.js:29` |
| `/api/admin/users` | POST | Idem | Idem | `backend/routes/admin.routes.js:30` |
| `/api/admin/bulk-delete` | POST | Idem | Idem | `backend/routes/admin.routes.js:33` |
| `/api/admin/bulk-duplicate` | POST | Idem | Idem | `backend/routes/admin.routes.js:34` |

### 3.13 Sync

> Important : ce router existe, mais son montage n’apparaît pas dans `backend/routes/index.js` (voir section 4).

Routes définies dans `backend/routes/sync.routes.js` :

| Endpoint | Méthode | Middlewares appliqués (ordre) | Conditions exactes | Preuves (fichier:lignes) |
|---|---:|---|---|---|
| `/api/sync/versions` | GET | `authenticateToken` -> `workspaceGuard` -> handler | Token requis + `X-Workspace-Id` requis + membership requis. | `backend/routes/sync.routes.js:12` |
| `/api/sync/health` | GET | handler | Public (pas d’auth). | `backend/routes/sync.routes.js:63-68` |

---

## 4. Zones ambiguës ou implicites (constats, sans solutions)

### 4.1 Router `/api/sync` : défini mais non monté dans le montage central
- Constat : `backend/routes/index.js` importe `syncRoutes` (`index.js:32-33`) et l’annonce dans la réponse `/api` (`index.js:74-75`), mais **aucun `app.use('/api/sync', ...)`** n’apparaît dans `backend/routes/index.js:39-79`.
- Conséquence factuelle : l’API “sync” est **déclarée** comme existante (fichier et “advertising” `/api`), mais son exposition effective dépend du montage (non observé ici).

### 4.2 Rate limit : exclusion `/api/health/db` référencée mais route non observée
- Constat : le rate limit GET exclut `/api/health/db` — `backend/middleware/rateLimit.middleware.js:26-30`.
- Constat : `backend/routes/health.routes.js` définit `/api/health` et `/api/health/auth`, mais pas `/api/health/db` — `health.routes.js:5-81`.

### 4.3 Contrôle d’accès workspace “préload” implémenté dans le contrôleur (pas via `workspaceGuard`)
- Constat : `/api/workspaces/:id/preload` est monté uniquement derrière `authenticateToken` (pas `workspaceGuard`) — `backend/routes/workspace.routes.js:9`.
- Cela introduit une convention implicite : la vérification d’appartenance workspace est réalisée dans le contrôleur (non listée ici comme middleware), ce qui rend le contrôle moins “visible” au niveau routing.

### 4.4 Contrôle “BASE” : pas de règle d’accès explicite identifiée au niveau des routes
- Constat : aucun middleware ni route dans les fichiers audités ne vérifie explicitement “workspace = BASE” pour autoriser/interdire.
- Le seul contrôle lié au contexte workspace observé est basé sur :
  - membership (`workspaceGuard`),
  - rôle owner (`requireWorkspaceOwner`),
  - rôle plateforme admin (`requireAdmin`).

### 4.5 Valeurs de rôles workspace : dépendance à une convention de chaînes
- Constat : `requireWorkspaceOwner` n’autorise que `OWNER` — `workspace.middleware.js:107-116`.
- Constat : le schéma DB `WorkspaceUser.role` est un `String` — `backend/prisma/schema.prisma:193-198` (preuve fournie dans l’audit Phase 1).
- Cela implique un comportement implicite : toute autre valeur (ex: `USER`, `VIEWER`) est “non owner” de facto.

---

## 5. Conclusion (strictement contrôlé vs dépendant d’implicite)

### 5.1 Ce qui est strictement contrôlé (observé)
- **Authentification** sur la majorité des routes via `authenticateToken` (montage central) — `backend/routes/index.js:45-56`.
- **Rôle plateforme admin** via `requireAdmin` sur :
  - toutes les routes `/api/admin/*` — `backend/routes/admin.routes.js:11`
  - certaines routes `/api/workspaces/*` — `backend/routes/workspace.routes.js:16-24`
  - la majorité des routes `/api/import/*` via `router.use(requireAdmin)` — `backend/routes/import.routes.js:16-18`
- **Workspace actif** via `workspaceGuard` sur toutes les routes métier `/api/exercises|tags|trainings|warmups|matches|dashboard|import` — `backend/routes/index.js:50-56`.
- **Rôle workspace owner** via `requireWorkspaceOwner` sur les opérations de gestion du workspace courant (`/api/workspaces/members`, `/api/workspaces/settings`) — `backend/routes/workspace.routes.js:11-14`.

### 5.2 Ce qui dépend de conventions implicites (observé)
- Exposition effective de `/api/sync/*` (router existant mais montage non observé dans le montage central).
- Existence supposée d’un endpoint `/api/health/db` côté rate limiting (référencé dans le `skip`, non observé dans `health.routes.js`).
- Contrôle d’accès “préload” (`/api/workspaces/:id/preload`) réalisé dans le contrôleur plutôt que via middleware standard.
- Contrôle “BASE” : aucune règle explicite au niveau routing/middleware, uniquement un contrôle indirect via workspace membership/role admin/owner.
- Rôles workspace : dépendance au fait que `WorkspaceUser.role` soit une chaîne libre, avec un contrôle explicite uniquement sur `OWNER`.
