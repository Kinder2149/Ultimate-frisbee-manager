# Rôles et gouvernance — Plateforme & Workspaces (clubs)

## 1. Introduction

Ce document est le **référentiel unique** de gouvernance des rôles de la plateforme Frisbee Manager.

Son objectif est de définir, de manière **claire, stable et durable** :
- le **périmètre** de chaque rôle,
- ses **responsabilités**,
- ses **limites explicites**,
- et les **principes généraux** qui structurent la séparation entre la plateforme et les workspaces (clubs).

Ce document sert de base pour toute décision future :
- technique,
- produit,
- sécurité,
- UX,
- gouvernance multi-clubs.

> Règle de lecture : ce document décrit une **gouvernance** (qui fait quoi, où, et jusqu’où), sans détailler de permissions fines ni de logique d’implémentation.

---

## 2. Cadre général : plateforme vs workspaces

La plateforme repose sur une logique de **clubs**, appelés **workspaces**.

Il existe une distinction conceptuelle stricte entre :
- la **plateforme** : l’espace global, transversal à tous les clubs ;
- les **workspaces** : des espaces “club”, isolés les uns des autres.

### 2.1 Deux familles de rôles

Les rôles sont organisés en **deux catégories** :

- **Rôles plateforme** :
  - couvrent la gouvernance globale,
  - peuvent impliquer une vision transverse (multi-workspaces),
  - s’appliquent au niveau “au-dessus” des clubs.

- **Rôles workspace** :
  - s’appliquent uniquement dans un ou plusieurs workspaces attribués,
  - n’accordent **aucune** autorité globale,
  - structurent la vie et l’autonomie d’un club.

---

## 3. Rôles plateforme

### 3.1 Administrateur (rôle plateforme)

#### Périmètre
- Rôle **plateforme**.
- Autorité globale : concerne l’ensemble de la plateforme et l’ensemble des workspaces.

#### Responsabilités
- **Accès total**.
- **Vision globale** de tous les workspaces.
- **Autorité suprême** de gouvernance.
- **Seul rôle autorisé à modifier les éléments de BASE**.

#### Limites explicites
- Aucune limite fonctionnelle décrite dans ce référentiel (par définition : accès total).

---

### 3.2 Testeur (rôle plateforme)

#### Périmètre
- Rôle **plateforme**.
- Rôle destiné à permettre de la visibilité et des tests transverses, sans autorité sur la BASE.

#### Responsabilités
- Peut **voir tous les workspaces**.
- Peut agir **uniquement** sur les workspaces pour lesquels il dispose de **droits explicites**.
- Sert à donner accès à des proches/tiers sur des workspaces de test.

#### Limites explicites
- **Ne peut jamais modifier la BASE**.
- Ne dispose pas d’une autorité globale “d’administration” : sa capacité d’action dépend de droits explicites sur des workspaces.

---

## 4. Rôles workspace (liés à un club)

### 4.1 Gestionnaire (rôle workspace)

#### Périmètre
- Rôle **lié à un workspace** (un ou plusieurs workspaces attribués).
- N’accorde aucune visibilité globale à l’échelle plateforme.

#### Responsabilités
- Peut **gérer entièrement** un ou plusieurs workspaces qui lui sont attribués.
- Peut **gérer les utilisateurs** de son workspace.
- Peut déléguer, organiser et structurer son workspace.

#### Limites explicites
- **Aucune visibilité globale plateforme**.
- Son autorité est strictement bornée au(x) workspace(s) dont il a la gestion.

---

### 4.2 Utilisateur (rôle workspace)

#### Périmètre
- Rôle **lié à un workspace**.
- Centré sur l’usage et la production de contenu au sein d’un club.

#### Responsabilités
- Peut créer et gérer ses **propres contenus** :
  - exercices,
  - entraînements,
  - échauffements,
  - situations.
- Peut gérer son **profil**.

#### Limites explicites
- **Ne peut pas gérer d’autres utilisateurs**.
- Ne dispose d’aucune visibilité globale plateforme.

---

## 5. Principes généraux de gouvernance

### 5.1 Séparation des responsabilités
- Les rôles plateforme et les rôles workspace répondent à des enjeux distincts.
- La plateforme gouverne le global ; les workspaces gouvernent le local.

### 5.2 Protection de la BASE
- La BASE est un **périmètre à statut spécial**.
- Seul l’**Administrateur** est autorisé à modifier la BASE.
- Le **Testeur** ne peut jamais modifier la BASE.

### 5.3 Autonomie des clubs (workspaces)
- Un workspace est un espace de gouvernance local.
- Le **Gestionnaire** permet l’autonomie d’un club sans dépendre d’une administration plateforme.

### 5.4 Sécurité et maîtrise des pouvoirs
- Les rôles plateforme impliquent un risque systémique plus élevé (impact multi-clubs).
- Les rôles workspace limitent l’impact à un périmètre club.
- Les limites explicites (ex: BASE non modifiable par Testeur) sont des garde-fous de gouvernance.

### 5.5 Évolutivité multi-clubs
- La gouvernance doit supporter une croissance du nombre de workspaces sans perdre :
  - la clarté des responsabilités,
  - l’étanchéité entre clubs,
  - la lisibilité des pouvoirs.

---

## 6. Comment utiliser ce document dans le projet

Ce document doit être utilisé comme :
- **source unique** lors de la conception de nouvelles fonctionnalités,
- **référence** lors des arbitrages sécurité et UX,
- **base commune** entre produit et technique pour éviter les ambiguïtés.

Règles d’usage :
- Toute discussion sur les rôles doit commencer par vérifier si le besoin relève :
  - de la **plateforme** (global),
  - ou d’un **workspace** (local).
- Toute évolution de gouvernance doit être reflétée ici en priorité, avant toute décision de détail.

---

## 7. Correspondance avec les rôles techniques observés (état factuel)

Cette section ne modifie pas la vision (sections 2 à 5). Elle consolide la terminologie en exposant :

- les **rôles validés** dans ce référentiel (français),
- les **rôles techniques observés** dans le code et les scripts,
- la correspondance actuellement utilisée (constat), sans détailler de permissions fines.

### 7.1 Rôles validés (référentiel)

- **Plateforme** : Administrateur, Testeur
- **Workspace** : Gestionnaire, Utilisateur

### 7.2 Rôles techniques observés (code)

- **Plateforme (User.role)** : `ADMIN`, `USER`
- **Workspace (WorkspaceUser.role)** : `OWNER`, `USER`, `VIEWER`

Preuves (code) :

- `backend/prisma/schema.prisma:11-14` (enum `UserRole { USER, ADMIN }`)
- `backend/prisma/schema.prisma:161-170` (`User.role UserRole @default(USER)`)
- `backend/prisma/schema.prisma:193-198` (`WorkspaceUser.role String @default("OWNER")`)

### 7.3 Correspondance observée (terminologie)

- Administrateur ↔ `ADMIN` (plateforme)
- Utilisateur ↔ `USER` (plateforme)
- Gestionnaire ↔ `OWNER` (workspace)
- Utilisateur ↔ `USER` (workspace)
- Testeur ↔ **aucun rôle plateforme dédié observé dans le modèle actuel** ; rôle `VIEWER` observé au niveau workspace (voir section 8)

Preuves (éléments factuels consolidés) :

- `docs/BASE/PLAN_GOUVERNANCE_ROLES.md:35-53` (sources de vérité + valeurs observées)
- `docs/BASE/PLAN_GOUVERNANCE_ROLES.md:228-239` (Mission 3 : correspondance documentaire attendue)

---

## 8. État réel du code (contrôles et cas observés)

> Cette section documente l’existant observable. Elle ne propose pas de solution et ne détaille pas de permissions fines.

### 8.1 Stockage des rôles (sources de vérité)

- **Rôles plateforme** : stockés dans `User.role` (enum Prisma `UserRole`).
  - Preuves :
    - `backend/prisma/schema.prisma:11-14`
    - `backend/prisma/schema.prisma:161-170`
- **Rôles workspace** : stockés dans la table de jointure `WorkspaceUser` via `WorkspaceUser.role` (type `String`).
  - Preuve : `backend/prisma/schema.prisma:193-198`

### 8.2 Contrôles effectivement appliqués (backend)

- **Authentification** : middleware `authenticateToken`.
  - Preuve (audit) : `docs/BASE/INVENTAIRE_CONTROLES_ACCES_BACKEND.md:46-55`
- **Autorisation plateforme (admin)** : middleware `requireAdmin` basé sur `req.user.role`.
  - Preuve (audit) : `docs/BASE/INVENTAIRE_CONTROLES_ACCES_BACKEND.md:56-60`
- **Isolation par workspace actif** : middleware `workspaceGuard` exige `X-Workspace-Id` et une ligne `WorkspaceUser` (membership), puis expose `req.workspaceRole`.
  - Preuves :
    - `backend/middleware/workspace.middleware.js:12-59`
    - `docs/BASE/INVENTAIRE_CONTROLES_ACCES_BACKEND.md:61-68`
- **Autorisation workspace “OWNER”** : middleware `requireWorkspaceOwner` refuse si `WorkspaceUser.role` ≠ `OWNER`.
  - Preuves :
    - `backend/middleware/workspace.middleware.js:76-120`
    - `docs/BASE/INVENTAIRE_CONTROLES_ACCES_BACKEND.md:69-73`

### 8.3 Rôles workspace effectivement écrits par le code et les scripts

Valeurs observées comme écrites :

- `USER` (workspace) :
  - `backend/services/business/workspace.service.js:47-53` (liaison automatique à BASE)
  - `backend/prisma/seed-workspaces.js:95-101` (liaison utilisateurs à BASE)
- `OWNER` (workspace) :
  - `backend/services/business/workspace.service.js:72-78` (liaison admin à TEST)
  - `backend/prisma/seed-workspaces.js:114-120` (liaison admin à TEST)
  - `backend/scripts/verify-and-seed-auth.js:81-90` (admin lié à BASE)
  - `backend/scripts/verify-production-auth.js:124-133` (lien admin ↔ BASE)
  - `backend/prisma/scripts/migrate-workspaces.js:61-68` (migration : rôle `OWNER`)
- `VIEWER` (workspace) :
  - `backend/scripts/sync-supabase-users.js:103-113` (ajout à BASE)
  - `backend/controllers/auth.controller.js:119-136` (register : ajout à BASE)

### 8.4 Cas particuliers observés

#### 8.4.1 BASE (workspace à statut spécial)

- BASE est utilisée comme convention (`Workspace.name === 'BASE'`) et comme source de duplication (ex : tags) dans les composants audités.
  - Preuves (audit BASE) : `docs/BASE/CADRAGE_BASE_WORKSPACE.md:34-48,114-121`
- Le contrôle d’accès “BASE” n’apparaît pas comme une règle globale au niveau middleware : les contrôles observés sont `requireAdmin`, `workspaceGuard`, `requireWorkspaceOwner`.
  - Preuve (audit) : `docs/BASE/INVENTAIRE_CONTROLES_ACCES_BACKEND.md:283-289`

#### 8.4.2 Gestion des membres du workspace courant

- Les endpoints de gestion des membres du workspace courant sont explicitement derrière `requireWorkspaceOwner`.
  - Preuves :
    - `backend/routes/workspace.routes.js:11-14`
    - `backend/controllers/workspace.controller.js:541-625`

---

## 9. Écarts et zones non alignées (constats)

### 9.1 Testeur non modélisé comme rôle plateforme

- La vision définit un rôle plateforme **Testeur** (section 3.2), mais le modèle Prisma observé ne contient que `USER` et `ADMIN`.

Preuves :

- `docs/BASE/PLAN_GOUVERNANCE_ROLES.md:158-166` (écart factuel “Testeur non représenté”)
- `backend/prisma/schema.prisma:11-14` (enum `UserRole`)

### 9.2 Rôle workspace `VIEWER` observé mais non gouverné

- La valeur `VIEWER` est écrite dans `WorkspaceUser.role` par certains scripts/flux.
- Le seul contrôle de rôle workspace explicitement observé côté middleware reconnaît `OWNER`.

Preuves :

- `backend/scripts/sync-supabase-users.js:103-113` (`VIEWER`)
- `backend/controllers/auth.controller.js:119-136` (`VIEWER`)
- `backend/middleware/workspace.middleware.js:107-116` (contrôle explicite `OWNER`)

### 9.3 Protection de BASE non formalisée comme règle d’accès globale

- La vision impose des limites explicites sur BASE (sections 3.1, 3.2 et 5.2), mais l’audit de l’existant ne met pas en évidence de règle d’accès globale “si workspace = BASE alors …” au niveau middleware/routing.

Preuve (audit) :

- `docs/BASE/INVENTAIRE_CONTROLES_ACCES_BACKEND.md:283-289`

---

## 10. Décisions actées vs décisions à prendre

### 10.1 Décisions actées (dans ce référentiel)

Les éléments suivants sont actés par les sections 2 à 5 du présent document :

- séparation conceptuelle stricte : plateforme vs workspaces (section 2),
- rôles validés : Administrateur, Testeur (plateforme) ; Gestionnaire, Utilisateur (workspace) (sections 3 et 4),
- BASE : périmètre à statut spécial ; limites explicites pour Administrateur/Testeur (section 5.2).

### 10.2 Décisions à prendre (sans réponse implicite)

Les points suivants sont explicitement non décidés dans le code observé et doivent faire l’objet de décisions de gouvernance (sans présumer du “comment”) :

- Le rôle **Testeur** doit-il être modélisé comme un rôle plateforme stocké (source de vérité), ou comme une capacité dérivée ?
- La liste des rôles workspace doit-elle être **fermée** (liste officielle), et si oui, que faire des valeurs déjà observées (ex: `VIEWER`) ?
- La protection “BASE” doit-elle exister comme règle d’accès **globale et vérifiable** (au-delà de cas isolés) ?
- Quelle est la relation normative entre rôle plateforme et rôle workspace lorsque les deux s’appliquent (ex : admin dans un workspace) ?

---

**Historique**
- Version initiale : définition des rôles et principes de gouvernance (Administrateur, Testeur, Gestionnaire, Utilisateur).
