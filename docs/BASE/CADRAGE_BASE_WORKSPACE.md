# CADRAGE — Concept de “BASE” (Workspace) — État factuel, usages, écarts, décisions

## 1. Rappel du contexte

### 1.1 Ce qu’est la “BASE” dans la vision métier (haut niveau, non technique)

Le référentiel de gouvernance des rôles décrit la **BASE** comme un périmètre à statut spécial :
- « Seul l’Administrateur est autorisé à modifier les éléments de BASE ».
- « Le Testeur ne peut jamais modifier la BASE ».

Preuves (document de référence) :
- `docs/BASE/ROLES_ET_GOUVERNANCE.md:56-61` (Administrateur)
- `docs/BASE/ROLES_ET_GOUVERNANCE.md:78-80` (Testeur)
- `docs/BASE/ROLES_ET_GOUVERNANCE.md:129-133` (Protection de la BASE)

### 1.2 Pourquoi la BASE est critique (gouvernance)

D’après le même référentiel :
- la plateforme distingue **plateforme** vs **workspaces (clubs)**,
- la BASE est explicitement citée comme périmètre critique de gouvernance.

Preuves :
- `docs/BASE/ROLES_ET_GOUVERNANCE.md:24-45` (distinction plateforme/workspaces)
- `docs/BASE/ROLES_ET_GOUVERNANCE.md:129-133` (BASE comme périmètre à statut spécial)

---

## 2. État factuel de l’existant

> Cette section ne contient aucune interprétation : uniquement ce qui est observable dans le code et les documents.

### 2.1 Existe-t-il une notion explicite de BASE ?

#### 2.1.1 BASE en tant que nom de workspace (convention par `Workspace.name`)

Le modèle Prisma `Workspace` contient un champ `name` (String), sans champ “flag” ou “type” pour distinguer BASE.

Preuve :
- `backend/prisma/schema.prisma:177-191` (`model Workspace { name String ... }`)

Plusieurs composants backend utilisent la constante `'BASE'` comme **valeur de nom**.

Preuves :
- `backend/services/business/workspace.service.js:8` (`DEFAULT_WORKSPACE_NAME = 'BASE'`)
- `backend/controllers/workspace.controller.js:4` (`DEFAULT_WORKSPACE_NAME = 'BASE'`)
- `backend/scripts/verify-and-seed-auth.js:30-39` (recherche/création workspace `name: 'BASE'`)
- `backend/scripts/sync-supabase-users.js:71-76` (recherche workspace `name: 'BASE'`)

#### 2.1.2 BASE en tant qu’ID fixe (script de seed)

Le script `backend/prisma/seed-workspaces.js` contient un identifiant fixe `WORKSPACE_BASE_ID` pour la création/upsert de BASE.

Preuve :
- `backend/prisma/seed-workspaces.js:17-19` (déclaration `WORKSPACE_BASE_ID`)
- `backend/prisma/seed-workspaces.js:35-46` (upsert création `name: 'BASE'`)

#### 2.1.3 Absence de flag / enum “BASE” au niveau DB

Le schéma Prisma ne contient pas :
- de champ booléen (ex: `isBase`) sur `Workspace`,
- de type enum de workspace,
- ni de contrainte déclarant l’unicité de `name='BASE'`.

Preuve (par lecture du modèle) :
- `backend/prisma/schema.prisma:177-191`

### 2.2 Existe-t-il un identifiant, un flag, une convention ?

Ce qui est observable :
- **Conventions** :
  - workspace “BASE” identifié par `Workspace.name === 'BASE'`.
    - Preuve : `backend/controllers/workspace.controller.js:382-388`, `437-441`.
  - ID fixe dans `seed-workspaces.js` (idempotence du seed).
    - Preuve : `backend/prisma/seed-workspaces.js:17-19,35-46`.

Ce qui n’est pas observable (dans les fichiers audités) :
- pas de flag DB “BASE”,
- pas de middleware générique “si workspace = BASE alors …” (au niveau routing/middleware).

Preuve (absence de règle explicite de routing) :
- `docs/BASE/INVENTAIRE_CONTROLES_ACCES_BACKEND.md:283-289` (constat « pas de règle d’accès explicite BASE »)

### 2.3 Quels rôles peuvent actuellement agir sur un workspace “spécial” ?

#### 2.3.1 Rôles plateforme utilisés pour l’autorisation backend

Le middleware `requireAdmin` autorise uniquement si `req.user.role` vaut `admin` (case-insensitive).

Preuve :
- `backend/middleware/auth.middleware.js:299-308`

#### 2.3.2 Rôles workspace utilisés pour l’autorisation backend

Le middleware `requireWorkspaceOwner` autorise uniquement si `WorkspaceUser.role` vaut `OWNER`.

Preuve :
- `backend/middleware/workspace.middleware.js:107-116`

#### 2.3.3 Actions explicitement restreintes quand `Workspace.name === 'BASE'`

Des restrictions explicites existent dans le contrôleur de workspace (routes admin) :
- **Renommage** : si `existingWorkspace.name` est `BASE`, alors le nouveau nom doit rester `BASE`, sinon 403 `WORKSPACE_BASE_PROTECTED`.
  - Preuve : `backend/controllers/workspace.controller.js:382-388`
- **Suppression** : si `ws.name` est `BASE`, alors 403 `WORKSPACE_BASE_PROTECTED`.
  - Preuve : `backend/controllers/workspace.controller.js:437-442`

Ces restrictions sont dans des handlers “ADMIN” (routes montées avec `requireAdmin`).

Preuve (routes admin workspace protégées par admin) :
- `backend/routes/workspace.routes.js:17-21` (exige `requireAdmin`)

### 2.4 Quelles routes sont indirectement utilisées comme si BASE existait ?

#### 2.4.1 Création de workspace : copie de tags depuis BASE

Lors de la création d’un nouveau workspace (route admin), le code tente de charger le workspace dont `name === 'BASE'` et d’en copier les tags.

Preuve :
- `backend/controllers/workspace.controller.js:286-290` (commentaire “copie automatiquement tous les tags du workspace BASE”)
- `backend/controllers/workspace.controller.js:320-339` (recherche `where: { name: DEFAULT_WORKSPACE_NAME }` puis duplication des tags)

#### 2.4.2 Liaison automatique des utilisateurs à BASE

Deux mécanismes observés :

- Service `ensureDefaultWorkspaceAndLink(userId)` :
  - vérifie si l’utilisateur a un lien vers un workspace dont `name === 'BASE'` ;
  - si non, crée (ou crée le workspace BASE si absent) puis crée un `WorkspaceUser` avec `role: 'USER'`.

Preuves :
- `backend/services/business/workspace.service.js:8,33-59` (détection “BASE” et création du lien)
- Utilisation de ce service dans `GET /api/workspaces/me`.
  - `backend/controllers/workspace.controller.js:17-19`

- Script `seed-workspaces.js` : relie tous les utilisateurs existants à BASE avec `role: 'USER'`.

Preuve :
- `backend/prisma/seed-workspaces.js:85-105`.

#### 2.4.3 Scripts d’administration/synchronisation référant explicitement BASE

- Script `verify-and-seed-auth.js` : vérifie et crée `BASE` si absent.
  - Preuve : `backend/scripts/verify-and-seed-auth.js:28-44`.
- Script `sync-supabase-users.js` : recherche `BASE` et ajoute des utilisateurs au workspace BASE avec `role: 'VIEWER'`.
  - Preuve : `backend/scripts/sync-supabase-users.js:71-81,103-113`.

---

## 3. Typologie des données manipulées (constats à partir du schéma et des usages)

> Objectif : identifier des familles de données “manifestement workspace”, “manifestement transverses”, et les zones grises observables.

### 3.1 Données manifestement “workspace” (scopées par `workspaceId`)

Le schéma Prisma indique que les entités suivantes possèdent un champ `workspaceId` et une relation vers `Workspace` :
- `Exercice.workspaceId` — `backend/prisma/schema.prisma:32-37`
- `Tag.workspaceId` — `backend/prisma/schema.prisma:51-57`
- `Entrainement.workspaceId` — `backend/prisma/schema.prisma:73-80`
- `Echauffement.workspaceId` — `backend/prisma/schema.prisma:113-118`
- `BlocEchauffement.workspaceId` — `backend/prisma/schema.prisma:133-140`
- `SituationMatch.workspaceId` — `backend/prisma/schema.prisma:154-159`
- `EntrainementExercice.workspaceId` — `backend/prisma/schema.prisma:93-101`

### 3.2 Données manifestement “plateforme / transverses” (dans le schéma)

- `User` ne contient pas de `workspaceId` ; la relation aux workspaces passe par la table de jointure `WorkspaceUser`.

Preuves :
- `backend/prisma/schema.prisma:161-175` (model User)
- `backend/prisma/schema.prisma:193-206` (model WorkspaceUser)

### 3.3 Zones grises observables (copie/duplication/import)

#### 3.3.1 Copie de tags depuis BASE lors de création de workspace

Le code de création d’un workspace clone les tags de BASE vers le nouveau workspace.

Preuve :
- `backend/controllers/workspace.controller.js:320-339`

Cette copie introduit une “zone grise” observable : les tags existent par workspace, mais BASE sert de source de duplication.

#### 3.3.2 Duplication d’un workspace

La duplication (route admin) copie selon options : tags, exercices, entrainements, échauffements, situations, membres.

Preuve :
- `backend/controllers/workspace.controller.js:36-41` (options `copy*`)
- `backend/controllers/workspace.controller.js:91-225` (duplication des ensembles)

#### 3.3.3 Import

Le router `/api/import` inclut une variable d’environnement `ALLOW_PUBLIC_IMPORT` qui modifie l’exposition de certaines routes d’import dans le router.

Preuves :
- `backend/routes/index.js:56` (montage `/api/import` derrière `authenticateToken` + `workspaceGuard`)
- `backend/routes/import.routes.js:6-23` (définition conditionnelle de routes d’import “avant/après requireAdmin”)

---

## 4. Contrôles d’accès observés vs besoins implicites (BASE)

> Cette section compare uniquement ce qui est observable :
> - contrôles d’accès “généraux” (auth/admin/workspace/owner),
> - contrôles “spécifiques BASE” (renommage/suppression, copie de tags),
> - absence de distinction explicite BASE dans les middlewares.

### 4.1 Ce que les contrôles actuels permettent (observé)

1. Accès aux ressources “métier” (exercices/tags/entrainements/…) :
- nécessite `authenticateToken` + `workspaceGuard` (donc workspace actif + membership).

Preuve :
- `docs/BASE/INVENTAIRE_CONTROLES_ACCES_BACKEND.md:48-73` (définition des middlewares)
- `docs/BASE/INVENTAIRE_CONTROLES_ACCES_BACKEND.md:137-215` (montage `workspaceGuard` sur routes métier)

2. Gestion des membres du workspace courant :
- nécessite `workspaceGuard` + `requireWorkspaceOwner` (donc rôle local `OWNER`).

Preuve :
- `docs/BASE/INVENTAIRE_CONTROLES_ACCES_BACKEND.md:126-128` (routes `/api/workspaces/members`, `/api/workspaces/settings`)

3. Gestion admin des workspaces (create/update/delete/duplicate, gestion users) :
- nécessite `requireAdmin`.

Preuve :
- `docs/BASE/INVENTAIRE_CONTROLES_ACCES_BACKEND.md:129-135`

### 4.2 Ce que les contrôles actuels empêchent (observé)

1. Renommage de BASE (changement de nom depuis BASE vers autre chose) :
- interdit par le contrôleur via 403 `WORKSPACE_BASE_PROTECTED`.

Preuve :
- `backend/controllers/workspace.controller.js:382-388`

2. Suppression de BASE :
- interdit par le contrôleur via 403 `WORKSPACE_BASE_PROTECTED`.

Preuve :
- `backend/controllers/workspace.controller.js:437-442`

### 4.3 Ce que les contrôles actuels ne distinguent pas (observé)

1. Absence de contrôle générique “si workspace = BASE alors règles spécifiques” au niveau des middlewares.

Preuve (constat Mission 1) :
- `docs/BASE/INVENTAIRE_CONTROLES_ACCES_BACKEND.md:283-289`

2. Le middleware `workspaceGuard` traite tous les workspaces de la même manière :
- nécessite `X-Workspace-Id`,
- vérifie membership,
- ne fait aucune distinction basée sur `Workspace.name`.

Preuve :
- `backend/middleware/workspace.middleware.js:25-59`

3. Les routes métier montées derrière `workspaceGuard` ne distinguent pas BASE vs autres workspaces au niveau du montage.

Preuve :
- `backend/routes/index.js:50-56`

---

## 5. Risques identifiés (factuels, sans solution)

### 5.1 Risque : BASE utilisée comme source de duplication de tags

- Constat : création de workspace tente de cloner les tags de BASE.

Preuve :
- `backend/controllers/workspace.controller.js:320-339`

- Risque factuel associé : la qualité / intégrité des tags du “template” BASE conditionne ce qui est propagé.
(Le risque est formulé sans dire comment y remédier.)

### 5.2 Risque : absence de règle d’accès explicite “BASE” dans les middlewares

- Constat : Mission 1 indique qu’aucun middleware/route ne vérifie explicitement “workspace = BASE” pour autoriser/interdire.

Preuve :
- `docs/BASE/INVENTAIRE_CONTROLES_ACCES_BACKEND.md:283-289`

- Constat complémentaire : seuls certains comportements “BASE” sont codés dans le contrôleur workspace (renommage/suppression).

Preuve :
- `backend/controllers/workspace.controller.js:382-388,437-442`

### 5.3 Risque : multiplicité des mécanismes de création/garantie d’existence de BASE

- Constat : BASE peut être créée/assurée par :
  - `workspace.service.ensureDefaultWorkspaceAndLink` (création si absent),
  - script `verify-and-seed-auth.js`,
  - script `seed-workspaces.js`.

Preuves :
- `backend/services/business/workspace.service.js:36-45`
- `backend/scripts/verify-and-seed-auth.js:28-44`
- `backend/prisma/seed-workspaces.js:35-46`

### 5.4 Risque : rôles workspace comme chaînes libres et présence de `VIEWER`

- Constat : `WorkspaceUser.role` est un String — `backend/prisma/schema.prisma:193-198`.
- Constat : `requireWorkspaceOwner` ne reconnaît explicitement que `OWNER`.
  - Preuve : `backend/middleware/workspace.middleware.js:107-116`.
- Constat : script `sync-supabase-users.js` écrit `role: 'VIEWER'` dans BASE.
  - Preuve : `backend/scripts/sync-supabase-users.js:103-113`.

### 5.5 Risque : dépendance au header `X-Workspace-Id` pour toutes les routes métier

- Constat : `workspaceGuard` exige `X-Workspace-Id` et renvoie 400 si absent.

Preuve :
- `backend/middleware/workspace.middleware.js:25-31`

---

## 6. Points de décision à trancher (liste claire, sans réponse)

> Les questions suivantes sont formulées pour permettre une décision humaine avant toute implémentation.

1. **Nature de BASE**
- BASE est-elle un workspace “comme les autres” (même modèle, mêmes règles), ou un workspace à statut distinct ?

2. **Unicité de BASE**
- La BASE est-elle unique (une seule BASE pour toute la plateforme), ou potentiellement multiple (ex: par environnement, par tenant, par organisation) ?

3. **Identifiant de BASE**
- La BASE doit-elle être identifiée par :
  - un nom (`Workspace.name === 'BASE'`),
  - un ID fixe,
  - un attribut dédié,
  - ou une autre convention ?

4. **Périmètre “modifiable” de BASE**
- Qu’entend-on exactement par “modifier BASE” :
  - tags de BASE,
  - contenus (exercices/entrainements/...) de BASE,
  - membres de BASE,
  - paramètres (nom, settings) de BASE,
  - opérations de duplication / import / export liées à BASE ?

5. **Lecture de BASE**
- Qui peut lire la BASE (liste des tags, contenus, etc.) ?
- La lecture de BASE est-elle destinée à tous les utilisateurs (comme un “template”), ou restreinte ?

6. **Rôle des “templates”**
- BASE doit-elle être la source officielle de clonage (ex: tags), ou seulement un workspace parmi d’autres pouvant servir de référence ?

7. **Relation entre rôles plateforme et BASE**
- La contrainte “Administrateur seul à modifier BASE” doit-elle s’appliquer :
  - même si un utilisateur est `OWNER` de BASE au niveau `WorkspaceUser.role`,
  - ou le rôle local peut-il suffire ?

8. **Import / duplication et BASE**
- Lorsque des opérations d’import/duplication touchent des données, comment BASE doit-elle être traitée :
  - source,
  - cible,
  - interdite,
  - ou contrôlée spécifiquement ?

---

**Fin du document**
