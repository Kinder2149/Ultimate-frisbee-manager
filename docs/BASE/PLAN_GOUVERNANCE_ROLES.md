# PLAN D’ACTION — Gouvernance des rôles (Plateforme & Workspaces)

## 0. Statut et règles de ce document

- Ce document est un **plan d’action** (pas une implémentation).
- Il est construit en **continuité stricte avec l’existant**.
- Il ne contient :
  - aucun code,
  - aucune logique d’implémentation,
  - aucune permission fine (cela viendra ultérieurement).
- Toute affirmation sur l’existant est basée sur des éléments **observables** dans le projet (documents BASE et code), et doit pouvoir être vérifiée.

---

## 1. Rappel synthétique de la vision validée (sans la réécrire)

Référence unique : `docs/BASE/ROLES_ET_GOUVERNANCE.md`

- La gouvernance repose sur une séparation **plateforme** vs **workspaces (clubs)**.
- Rôles validés (noms français) :
  - **Plateforme** : Administrateur, Testeur
  - **Workspace** : Gestionnaire, Utilisateur
- Points clés explicitement validés :
  - L’Administrateur a l’autorité suprême et une vision globale.
  - Le Testeur voit tous les workspaces, agit uniquement sur ceux où il a des droits explicites, et ne modifie jamais la BASE.
  - Le Gestionnaire administre un workspace (dont les utilisateurs), sans visibilité globale.
  - L’Utilisateur gère ses contenus et son profil, sans gestion d’autres utilisateurs.

---

## 2. Analyse de l’existant (réalité observée)

### 2.1 Sources de vérité des rôles

#### 2.1.1 Rôles plateforme (stockage utilisateur)

- Source de vérité observée : **base de données via Prisma**.
- Enum Prisma : `UserRole { USER, ADMIN }`.
  - Preuve : `backend/prisma/schema.prisma:11-14`.
- Champ utilisateur : `User.role: UserRole`.
  - Preuve : `backend/prisma/schema.prisma:161-175`.

#### 2.1.2 Rôles workspace (lien utilisateur ↔ workspace)

- Source de vérité observée : table de jointure `WorkspaceUser`.
- Champ rôle : `WorkspaceUser.role` est un **String** (pas un enum) avec défaut `"OWNER"`.
  - Preuve : `backend/prisma/schema.prisma:193-198`.
- Valeurs écrites dans le code/scripts (constatées) : `OWNER`, `USER`, `VIEWER`.
  - Exemples :
    - `backend/services/business/workspace.service.js:47-53` (création `role: 'USER'`)
    - `backend/prisma/seed-workspaces.js:95-101` (`role: 'USER'`) et `114-120` (`role: 'OWNER'`)
    - `backend/scripts/sync-supabase-users.js:104-113` (`role: 'VIEWER'`)

### 2.2 Protections d’accès observées (backend)

#### 2.2.1 Authentification

- Middleware principal : `authenticateToken`.
  - Exige `Authorization: Bearer <token>`.
  - Charge le profil utilisateur depuis la DB ; refuse si compte inactif.
  - Preuves : `backend/middleware/auth.middleware.js:66-95`, `257-285`.

#### 2.2.2 Autorisation plateforme (admin)

- Middleware `requireAdmin` : autorise uniquement si `req.user.role` (lowercase) vaut `admin`.
  - Preuve : `backend/middleware/auth.middleware.js:296-308`.

#### 2.2.3 Isolation multi-tenant par workspace

- Middleware `workspaceGuard` :
  - exige le header `X-Workspace-Id`,
  - vérifie que l’utilisateur est membre via `WorkspaceUser`,
  - stocke `req.workspaceId` / `req.workspaceRole`.
  - Preuve : `backend/middleware/workspace.middleware.js:12-59`.

#### 2.2.4 Autorisation workspace “OWNER”

- Middleware `requireWorkspaceOwner` : autorise uniquement si `WorkspaceUser.role === 'OWNER'` (case-insensitive via `toUpperCase()`).
  - Preuve : `backend/middleware/workspace.middleware.js:107-116`.

### 2.3 Routes sensibles et conditions observées (backend)

#### 2.3.1 Montage global des protections

- Routes publiques :
  - `/api/auth/*` partiellement publique (`register`) et partiellement protégée (`profile`, `logout`, etc.).
    - Preuve : `backend/routes/auth.routes.js:62-63` (public), `87-88` (protégé).
  - `/api/health` est publique.
    - Preuve : `backend/routes/index.js:42-43`.

- Routes workspace (toutes derrière token) :
  - `/api/workspaces/*` est monté derrière `authenticateToken`.
    - Preuve : `backend/routes/index.js:45-47`.

- Routes métier (toutes derrière token + workspace) :
  - `/api/exercises`, `/api/tags`, `/api/trainings`, `/api/warmups`, `/api/matches`, `/api/dashboard`, `/api/import`.
    - Preuve : `backend/routes/index.js:50-57`.

- Routes admin :
  - `/api/admin/*` derrière `authenticateToken + requireAdmin + workspaceGuard`.
    - Preuve : `backend/routes/admin.routes.js:11`.

#### 2.3.2 Administration du workspace courant (OWNER)

- Endpoints `OWNER` (workspace courant) :
  - `GET /api/workspaces/members`
  - `PUT /api/workspaces/members`
  - `PUT /api/workspaces/settings`
  - Preuves : `backend/routes/workspace.routes.js:11-14`.

#### 2.3.3 Administration globale des workspaces (ADMIN)

- Endpoints admin workspace : liste/création/mise à jour/suppression/duplication + gestion users par workspace id.
  - Preuves : `backend/routes/workspace.routes.js:16-24`.

### 2.4 Frontend : protections et transport du contexte

#### 2.4.1 Protection de navigation

- `AuthGuard` : bloque si non authentifié → redirige `/login`.
  - Preuve : `frontend/src/app/core/guards/auth.guard.ts:24-35`.
- `WorkspaceSelectedGuard` : exige un workspace sélectionné (localStorage) et vérifie qu’il est encore accessible via `GET /workspaces/me`.
  - Preuve : `frontend/src/app/core/guards/workspace-selected.guard.ts:24-58`.

#### 2.4.2 Accès UI “admin plateforme”

- Route `/admin` : protégée par `AuthGuard + WorkspaceSelectedGuard + MobileGuard` au niveau app.
  - Preuve : `frontend/src/app/app.module.ts:92-101`.
- Module admin : `RoleGuard` attend `data.role = 'admin'`.
  - Preuve : `frontend/src/app/features/admin/admin-routing.module.ts:11-13`.

#### 2.4.3 Transport du workspace actif (header)

- `WorkspaceInterceptor` ajoute `X-Workspace-Id` aux requêtes backend si un workspace est sélectionné.
  - Preuve : `frontend/src/app/core/interceptors/workspace.interceptor.ts:21-35`.

#### 2.4.4 Admin du workspace courant (UI)

- Route `/workspace/admin` : protégée par `AuthGuard + WorkspaceSelectedGuard` (pas par un guard de rôle workspace).
  - Preuve : `frontend/src/app/app.module.ts:58-64`.
- L’écran affiche un bloc conditionnel `workspace?.role === 'OWNER'`.
  - Preuve : `frontend/src/app/features/workspaces/workspace-admin/workspace-admin.component.html:50-66`.

### 2.5 Documents BASE et audits pertinents (références)

- Vision gouvernance : `docs/BASE/ROLES_ET_GOUVERNANCE.md`.
- États d’authentification et transitions : `docs/BASE/AUTH_STATE_SPECIFICATION.md`.
- Contrat des erreurs backend (incluant 401/403 workspace) : `docs/BASE/BACKEND_ERRORS_SPECIFICATION.md`.
- Sécurité (auth JWT, isolation workspace, CORS, rate limiting) : `docs/BASE/SECURITY.md`.
- Audit “cache & workspace” (flux `GET /workspaces/me`, preload, etc.) : `docs/ARCHITECTURE_DATA_CACHE_AUDIT.md`.

---

## 3. Tableau des écarts — Vision cible vs réalité du code

> Remarque : le but est d’identifier des écarts **constatables**, pas de proposer des solutions ici.

| Axe | Vision validée (ROLES_ET_GOUVERNANCE) | Réalité observée (code / docs) | Écart factuel | Impacts potentiels (à vérifier) |
|---|---|---|---|---|
| Rôle plateforme “Administrateur” | Existe, accès total, vision globale, seul à modifier BASE | `User.role` inclut `ADMIN` ; `requireAdmin` protège `/api/admin/*` et certaines routes workspace/import | Alignement partiel (ADMIN existe). La règle “seul à modifier BASE” n’est pas explicitement modélisée comme “BASE” dans le contrôle d’accès observé | Risque de confusion BASE vs autres workspaces si non explicitée au niveau gouvernance/contrôle |
| Rôle plateforme “Testeur” | Existe ; voit tous les workspaces ; agit seulement sur ceux où droits explicites ; ne modifie jamais BASE | Aucun rôle plateforme distinct constaté dans `UserRole` (seulement `USER`, `ADMIN`) | **Testeur non représenté** comme rôle plateforme dans la DB/middlewares observés | Risque de manque de capacité d’attribution/contrôle “testeur” ; risque d’usage détourné de `USER`/`ADMIN` |
| Rôle workspace “Gestionnaire” | Admin d’un workspace (utilisateurs, délégation) ; pas de vision globale | Contrôle explicite : `requireWorkspaceOwner` autorise seulement `OWNER` pour gérer `/workspaces/members` et `/workspaces/settings` | Le rôle effectif est nommé `OWNER` (anglais) ; pas de correspondance explicite “Gestionnaire” | Risque de divergence terminologique (UX/doc) et de confusion lors des décisions |
| Rôle workspace “Utilisateur” | Crée/gère ses contenus ; pas de gestion d’autres utilisateurs | Workspace membership existe ; rôle `USER` utilisé comme défaut ; la gestion des membres est bloquée si non `OWNER` | Alignement partiel : “Utilisateur workspace” existe mais pas formalisé en tant que permission fine (non attendu à ce stade) | À confirmer : absence d’actions de gestion membres pour `USER` |
| Contrôle BASE | BASE = périmètre spécial | Workspace `BASE` existe et est créé/seedé ; mais la protection “seul admin modifie BASE” n’apparaît pas comme règle générale de contrôle d’accès observée | Règle de gouvernance BASE non traduite en règle d’accès observable (constat d’absence, pas une critique) | Risque : BASE modifiable par toute personne ayant un rôle local adapté si des endpoints permettent des mutations sur ce workspace |
| Nomenclature des rôles | Noms français validés (Administrateur, Testeur, Gestionnaire, Utilisateur) | Noms code : `ADMIN/USER` (plateforme), `OWNER/USER/VIEWER` (workspace) | Nomenclature non alignée | Risque d’ambiguïtés, mauvaise communication, incohérence doc/produit |
| Rôles workspace possibles | Gestionnaire / Utilisateur | Valeurs constatées incluent `VIEWER` via script | Valeur supplémentaire non cadrée par la vision validée | Risque de “rôle fantôme” et d’incohérence de contrôles |

---

## 4. Identification des risques (sécurité, incohérences, dette technique)

### 4.1 Risques sécurité

1. **Rôle workspace non typé (String)**
   - Constat : `WorkspaceUser.role` est un String.
   - Risque : multiplication de valeurs “non gouvernées” (ex: `VIEWER`) et comportements implicites.

2. **Contrôle “BASE” non explicitement vérifiable comme règle d’accès**
   - Constat : la vision impose un statut spécial de BASE ; les contrôles observés sont basés sur `requireAdmin` et `requireWorkspaceOwner`, pas sur “workspace = BASE”.
   - Risque : dérive de gouvernance si la BASE peut être modifiée via des parcours non strictement admin (à vérifier par inventaire des endpoints de mutation et de leurs conditions).

3. **Bypass développement**
   - Constat : `DEV_BYPASS_AUTH=true` en dev crée un utilisateur fictif `ADMIN`.
   - Risque : contamination de pratiques, tests non représentatifs si utilisé sans discipline.

### 4.2 Risques d’incohérences fonctionnelles / UX

1. **Divergence terminologique (français vs code)**
   - Risque : erreurs d’interprétation dans les specs, UI, support.

2. **Testeur non modélisé**
   - Risque : impossibilité de matérialiser la gouvernance “Testeur” sans bricolage (ex: surchargement de `USER` ou création de rôles workspace ad hoc).

3. **Rôle workspace “VIEWER” apparaît via script**
   - Risque : droits non intentionnels, UI incohérente, impossible à expliquer si non gouverné.

### 4.3 Dette technique / dispersion des règles

1. **Contrôles d’accès distribués**
   - Constat : protections réparties entre montage de routes (`routes/index.js`) et middlewares spécifiques.

2. **Écarts entre docs historiques et réalité**
   - Constat : certains documents contiennent des exemples de code/intentions ; la gouvernance cible impose de vérifier ce qui est réellement appliqué.

---

## 5. Plan de missions structuré (numéroté, objectifs, dépendances, prérequis)

> Chaque mission est formulée pour être exécutable par une IA/humain, dans l’ordre, sans présumer du “comment coder”.

### Mission 1 — Inventaire exhaustif des points de contrôle d’accès (réel)

- Objectif : produire une liste exhaustive et vérifiable de :
  - tous les endpoints backend,
  - leurs protections (token, admin, workspaceGuard, owner),
  - et les règles associées.
- Prérequis : accès au repo.
- Dépendances : aucune.
- Livrables : tableau “Endpoint → Conditions exactes” + sources (fichiers/lignes).

### Mission 2 — Cartographie des opérations “sensibles BASE”

- Objectif : identifier toutes les opérations qui modifient des données sur un workspace et déterminer si elles peuvent cibler `BASE`.
- Prérequis : Mission 1.
- Dépendances : Mission 1.
- Livrables : liste “mutations possibles” + analyse “peut toucher BASE ?” (oui/non/inconnu), avec preuve.

### Mission 3 — Clarification documentaire : correspondance des rôles validés ↔ rôles techniques existants

- Objectif : établir une table de correspondance **documentaire** (pas d’implémentation) :
  - Administrateur ↔ `ADMIN` (plateforme)
  - Utilisateur ↔ `USER` (plateforme)
  - Gestionnaire ↔ `OWNER` (workspace)
  - Utilisateur (workspace) ↔ `USER` (workspace)
  - Et gérer explicitement le cas “Testeur” (absent du modèle actuel).
- Prérequis : Mission 1.
- Dépendances : Mission 1.
- Livrables : table “rôle métier ↔ rôle technique”, + liste des écarts confirmés.

### Mission 4 — Audit des données réelles (DB) sur les valeurs de rôles workspace

- Objectif : confirmer en base (via requêtes/exports contrôlés) :
  - quelles valeurs existent dans `WorkspaceUser.role` (ex: OWNER/USER/VIEWER),
  - quelles proportions, et où.
- Prérequis : accès environnement (dev/staging) + procédure safe.
- Dépendances : Mission 3.
- Livrables : rapport “valeurs réellement présentes” + risques associés.

### Mission 5 — Définition de la stratégie de gouvernance “Testeur” (décision avant implémentation)

- Objectif : cadrer ce qui est attendu de “Testeur” dans le système existant, en répondant à des questions fermées (voir section 6).
- Prérequis : Mission 3 et/ou Mission 4.
- Dépendances : Missions 3-4.
- Livrables : décision validée (documentée) sur :
  - existence du rôle plateforme “Testeur” dans le modèle,
  - articulation avec les droits workspace explicites.

### Mission 6 — Durcissement de la gouvernance BASE (décision avant implémentation)

- Objectif : traduire la règle “seul Administrateur modifie BASE” en exigences vérifiables :
  - quelles opérations sont interdites,
  - quels rôles sont autorisés,
  - et sur quels périmètres.
- Prérequis : Mission 2.
- Dépendances : Mission 2.
- Livrables : liste d’exigences “BASE” (contrat), sans détail d’implémentation.

### Mission 7 — Plan de tests de non-régression (gouvernance)

- Objectif : produire une checklist de tests orientée gouvernance :
  - accès routes,
  - sélection workspace,
  - accès admin,
  - gestion membres workspace,
  - cas BASE.
- Prérequis : Missions 1, 6.
- Dépendances : Missions 1 et 6.
- Livrables : plan de tests (manuel + automatisable) + critères de validation.

### Mission 8 — Plan de migration contrôlée (si évolution du modèle de rôles)

- Objectif : préparer un plan de migration sans casser l’existant si :
  - ajout d’un rôle plateforme “Testeur”,
  - normalisation des rôles workspace,
  - ou alignement de nomenclature.
- Prérequis : Missions 4, 5, 6.
- Dépendances : Missions 4-6.
- Livrables : séquence de migration “zéro downtime” conceptuelle (étapes, rollback, validations), sans code.

---

## 6. Points à valider avant toute implémentation

### 6.1 Validations gouvernance (obligatoires)

1. **Testeur**
   - Le rôle Testeur doit-il exister comme rôle plateforme “dur” (stocké) ?
   - Ou doit-il être une capacité dérivée (ex: visibilité globale + actions conditionnées par un rôle workspace) ?
   - Quel est le périmètre exact “voit tous les workspaces” : liste seulement, ou données internes ?

2. **BASE**
   - Qu’entend-on exactement par “modifier BASE” :
     - tags de BASE,
     - contenus de BASE,
     - membres de BASE,
     - paramètres de BASE,
     - duplication/export/import liés à BASE ?
   - Confirmer le statut de BASE : workspace “modèle” vs “workspace réel de production”.

3. **Correspondance des noms**
   - Les noms français doivent-ils être strictement des libellés (UX/docs) ou des noms “source de vérité” ?

4. **Rôles workspace**
   - Les rôles workspace sont-ils limités à 2 (Gestionnaire/Utilisateur) dans la vision cible ?
   - Si oui, que fait-on des valeurs existantes (ex: `VIEWER`) constatées via scripts/données ?

### 6.2 Validations sécurité / exploitation

1. Confirmer le comportement attendu lorsque `X-Workspace-Id` est absent (400) vs workspace inaccessible (403).
2. Confirmer la politique de “bypass dev” et les conditions de son usage.
3. Confirmer les attentes d’observabilité (logs/alerting) autour des refus d’accès (403) et des erreurs d’auth (401).

---

## 7. Conclusion

Ce plan fournit :
- une analyse factuelle de l’existant (rôles, contrôles d’accès, liens user/workspace),
- un tableau d’écarts entre la vision validée et la réalité observée,
- une liste de risques explicités,
- un plan de missions numérotées, dépendantes et sécurisées,
- et les validations indispensables avant toute implémentation.

Ce document doit être utilisé comme **checklist d’exécution** et **cadre de décision** : aucune implémentation ne doit démarrer tant que les points de validation (section 6) ne sont pas tranchés.
