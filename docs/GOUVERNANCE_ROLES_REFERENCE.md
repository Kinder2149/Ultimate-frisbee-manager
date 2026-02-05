# GOUVERNANCE DES RÔLES — Document de référence unique

> **Statut** : Document de référence officiel  
> **Dernière mise à jour** : 5 février 2026  
> **Remplace** : Tous les documents précédents sur les rôles

---

## 1. INTRODUCTION

### 1.1 Objectif de ce document

Ce document est **l'unique référence contractuelle** pour la gouvernance des rôles, des accès et des responsabilités sur la plateforme **Ultimate Frisbee Manager**.

Il couvre :
- La distinction **plateforme vs workspaces (clubs)**
- Les rôles et leurs responsabilités
- Les règles d'accès normatives
- L'état d'implémentation actuel
- Les écarts entre existant et modèle cible

### 1.2 Principes fondamentaux

**Séparation stricte** :
- La **plateforme** porte l'identité utilisateur globale et la gouvernance transverse
- Les **workspaces** portent les droits métier et l'autonomie des clubs
- Aucun rôle workspace ne confère de pouvoir global

**Aucun droit implicite** :
- Tout pouvoir doit être justifiable par un rôle et un périmètre
- Toute action métier sur un workspace exige un rôle workspace explicite
- Exception unique : l'Administrateur plateforme pour raisons de gouvernance

**Protection BASE** :
- La BASE est un workspace à statut spécial
- Seul l'Administrateur plateforme peut modifier la BASE

---

## 2. MODÈLE DE RÔLES

### 2.1 Rôles plateforme

#### Administrateur plateforme

**Périmètre** : Gouvernance globale de la plateforme

**Responsabilités** :
- Accès total multi-workspaces
- Vision globale de tous les workspaces
- Autorité suprême de gouvernance
- **Seul rôle autorisé à modifier la BASE**

**Implémentation technique** :
- Stocké dans `User.role` (enum Prisma)
- Valeur : `ADMIN`
- Contrôle : middleware `requireAdmin`

**Règles d'accès** :
- Peut lister tous les workspaces
- Peut agir (lecture/écriture) sur tous les workspaces
- Est le seul autorisé à modifier la BASE (`isBase=true`)

---

#### Utilisateur plateforme

**Périmètre** : Identité de base sur la plateforme

**Responsabilités** :
- Peut s'authentifier
- Identité utilisateur globale
- Les capacités effectives dépendent des rôles workspace

**Implémentation technique** :
- Stocké dans `User.role` (enum Prisma)
- Valeur : `USER` (défaut)
- Contrôle : middleware `authenticateToken`

**Règles d'accès** :
- N'a **aucun** droit sur un workspace sans rôle workspace explicite

---

#### Testeur plateforme (rôle dérivé)

**Périmètre** : Visibilité transverse pour tests

**Responsabilités** :
- Peut voir tous les workspaces (visibilité transverse)
- Agit uniquement sur les workspaces avec rôle workspace explicite
- Destiné aux tests et à la visibilité sans administration

**Implémentation technique** : ✅ **COMPLÉTÉ**
- **Rôle dérivé** (non stocké comme rôle plateforme)
- **Source de vérité** : Champ `User.isTester` (Boolean, défaut: false)
- **Migration** : `20260205_add_user_is_tester`
- **Controller** : `workspace.controller.js` lignes 17-37 (getMyWorkspaces)
- **Middleware** : `workspace.middleware.js` lignes 91-98 (workspaceGuard)
- Mapping vers capability set : listing OK, lecture/écriture selon rôle workspace

**Règles d'accès** : ✅ **IMPLÉMENTÉES**
- Peut **lister** tous les workspaces (via getMyWorkspaces)
- Ne peut **pas** lire le contenu sans rôle workspace explicite
- Ne peut **pas** écrire/modifier sans rôle workspace explicite
- Sur la BASE : **listing uniquement**, aucune modification (bloqué par middleware)

**Limites explicites** :
- **Ne peut jamais modifier la BASE** (erreur 403: TESTER_BASE_FORBIDDEN)
- Pas d'autorité globale d'administration
- Doit avoir un rôle workspace (MANAGER/MEMBER/VIEWER) pour accéder au contenu

---

### 2.2 Rôles workspace

#### Gestionnaire de workspace (MANAGER)

**Périmètre** : Gouvernance complète d'un ou plusieurs workspaces attribués

**Responsabilités** :
- Gouvernance complète du workspace
- Gestion des membres du workspace
- Gestion des contenus du workspace
- Accès aux réglages du workspace

**Implémentation technique** :
- Stocké dans `WorkspaceUser.role` (String)
- Valeur cible : `MANAGER`
- Valeur legacy : `OWNER` (mapping de compatibilité)
- Contrôle : middleware `requireWorkspaceOwner`

**Permissions** :
- ✅ Lecture/écriture métier complet
- ✅ Gestion des membres
- ✅ Gestion des contenus
- ✅ Accès aux réglages

**Limites explicites** :
- Aucune visibilité globale plateforme
- Autorité strictement bornée au(x) workspace(s) attribué(s)

---

#### Membre du workspace (MEMBER)

**Périmètre** : Usage et production de contenu dans un workspace

**Responsabilités** :
- Créer et gérer ses propres contenus (exercices, entraînements, etc.)
- Consulter le contenu du workspace
- Utilisation quotidienne du workspace

**Implémentation technique** :
- Stocké dans `WorkspaceUser.role` (String)
- Valeur cible : `MEMBER`
- Valeur legacy : `USER` (mapping de compatibilité)
- Valeur par défaut actuelle dans schema.prisma

**Permissions** :
- ✅ Lecture/écriture métier dans le périmètre membre
- ❌ Gestion des membres
- ❌ Accès aux réglages

**Limites explicites** :
- Ne peut pas gérer d'autres utilisateurs
- Pas de visibilité globale plateforme

---

#### Lecteur du workspace (VIEWER)

**Périmètre** : Accès lecture seule à un workspace

**Responsabilités** :
- Consulter le contenu du workspace
- Accès invité, observateur, onboarding

**Implémentation technique** :
- Stocké dans `WorkspaceUser.role` (String)
- Valeur : `VIEWER`
- Statut : **rôle officiel** (décision actée)

**Permissions** :
- ✅ Lecture seule du contenu
- ❌ Création/modification/suppression
- ❌ Export
- ❌ Accès liste membres
- ❌ Accès réglages

---

## 3. RÈGLE BASE (normative)

### 3.1 Identification de la BASE

**Critère technique** :
- Workspace avec `isBase === true` (champ booléen dans schema Prisma)

**Implémentation** :
- ✅ Champ `isBase Boolean @default(false)` ajouté au modèle Workspace
- Convention historique : `Workspace.name === 'BASE'` (maintenue pour compatibilité)

### 3.2 Règles d'accès BASE

**Modification** :
- Toute opération de **modification** ciblant la BASE est **refusée**
- **Exception unique** : Administrateur plateforme

**Lecture** :
- Testeur plateforme : **listing uniquement**
- Autres utilisateurs : selon rôle workspace dans BASE

**Opérations interdites pour non-admin** :
- Modification des contenus BASE
- Modification des tags BASE
- Modification des membres BASE
- Modification des paramètres BASE
- Suppression de la BASE
- Renommage de la BASE

### 3.3 Contrainte globale

`isBase=true` est une **contrainte globale** appliquée à toute opération ciblant un workspace :
- Toute route qui cible un workspace doit appliquer une garde BASE
- Interdire les mutations si `isBase=true` et utilisateur non admin plateforme

---

## 4. NORMALISATION DES RÔLES WORKSPACE

### 4.1 Liste officielle des rôles workspace

**Valeurs autorisées (cible)** :
- `MANAGER` (Gestionnaire)
- `MEMBER` (Membre)
- `VIEWER` (Lecteur)

### 4.2 Mapping de compatibilité (legacy → cible)

Pour interpréter les données existantes sans migration immédiate :

| Valeur legacy | Valeur cible | Sémantique |
|---------------|--------------|------------|
| `OWNER` | `MANAGER` | Gestionnaire de workspace |
| `USER` | `MEMBER` | Membre du workspace |
| `VIEWER` | `VIEWER` | Lecteur du workspace |

### 4.3 État d'implémentation

**Schema Prisma actuel** :
```prisma
model WorkspaceUser {
  role String @default("MEMBER")  // ✅ Changé de "OWNER" à "MEMBER"
}
```

**Middleware actuel** :
- `requireWorkspaceOwner` : contrôle basé sur `OWNER` (legacy)
- À normaliser vers `MANAGER`

---

## 5. MATRICE DES PERMISSIONS

### 5.1 Permissions workspace par rôle

| Action | MANAGER | MEMBER | VIEWER |
|--------|---------|--------|--------|
| Lecture contenu | ✅ | ✅ | ✅ |
| Création contenu | ✅ | ✅ | ❌ |
| Modification contenu | ✅ | ✅ | ❌ |
| Suppression contenu | ✅ | ✅ | ❌ |
| Export | ✅ | ✅ | ❌ |
| Gestion membres | ✅ | ❌ | ❌ |
| Accès réglages | ✅ | ❌ | ❌ |

### 5.2 Permissions plateforme par rôle

| Action | Admin | User | Testeur |
|--------|-------|------|---------|
| Listing workspaces | ✅ | ❌ | ✅ |
| Lecture workspace sans rôle | ✅ | ❌ | ❌ |
| Modification workspace | ✅ | ❌ | ❌ |
| Modification BASE | ✅ | ❌ | ❌ |
| Gestion utilisateurs globale | ✅ | ❌ | ❌ |

---

## 6. ÉTAT D'IMPLÉMENTATION

### 6.1 Éléments implémentés ✅

**Backend** :
- ✅ Authentification centralisée (`authenticateToken`)
- ✅ Rôle plateforme `ADMIN` contrôlé (`requireAdmin`)
- ✅ Isolation par workspace actif (`workspaceGuard`)
- ✅ Rôle workspace `OWNER` contrôlé (`requireWorkspaceOwner`)
- ✅ Champ `isBase` ajouté au modèle Workspace
- ✅ Rôle workspace par défaut = `MEMBER`

**Contrôles BASE partiels** :
- ✅ Interdiction renommage BASE (controller)
- ✅ Interdiction suppression BASE (controller)

### 6.2 Éléments incomplets ⚠️

**Rôle Testeur** :
- ⚠️ Non modélisé techniquement (rôle dérivé à implémenter)
- Source de vérité à définir

**Protection BASE** :
- ⚠️ Pas de garde globale au niveau middleware
- ⚠️ Contrôles uniquement dans certains controllers

**Normalisation workspace** :
- ⚠️ Middleware `requireWorkspaceOwner` utilise encore `OWNER`
- ⚠️ Pas de validation enum sur `WorkspaceUser.role`

### 6.3 Valeurs de rôles observées dans le code

**Rôles plateforme** (`User.role`) :
- `USER` (défaut)
- `ADMIN`

**Rôles workspace** (`WorkspaceUser.role`) :
- `OWNER` (legacy, écrit par anciens scripts)
- `USER` (legacy, liaison BASE)
- `VIEWER` (écrit par sync Supabase et register)
- `MEMBER` (défaut actuel schema)

---

## 7. FICHIERS IMPACTÉS

### 7.1 Backend - Modèle de données

- ✅ `backend/prisma/schema.prisma` (isBase ajouté, role défaut MEMBER)

### 7.2 Backend - Middlewares

- ⚠️ `backend/middleware/auth.middleware.js` (requireAdmin OK)
- ⚠️ `backend/middleware/workspace.middleware.js` (workspaceGuard OK, requireWorkspaceOwner à normaliser)

### 7.3 Backend - Routes

- ⚠️ `backend/routes/workspace.routes.js` (protection BASE partielle)
- `backend/routes/index.js` (montage OK)

### 7.4 Backend - Controllers

- ⚠️ `backend/controllers/workspace.controller.js` (contrôles BASE partiels)
- `backend/controllers/auth.controller.js` (écrit VIEWER dans BASE)

### 7.5 Backend - Services

- ⚠️ `backend/services/business/workspace.service.js` (utilise isBase)

### 7.6 Backend - Scripts

- ⚠️ `backend/prisma/seed-workspaces.js` (à mettre à jour avec isBase et MEMBER)
- ⚠️ `backend/scripts/verify-and-seed-auth.js` (à mettre à jour)
- ⚠️ `backend/scripts/sync-supabase-users.js` (écrit VIEWER)

---

## 8. SOURCES DOCUMENTAIRES

Ce document consolide les informations de :

- `docs/ROLE/ROLES_ET_GOUVERNANCE.md` (référentiel vision)
- `docs/ROLE/ROLES_MODELE_CIBLE.md` (modèle cible)
- `docs/ROLE/INVENTAIRE_CONTROLES_ACCES_BACKEND.md` (audit backend)
- `docs/ROLE/ROLES_ET_ACCES_ETAT_DES_LIEUX.md` (état des lieux)
- `docs/ROLE/CADRAGE_ROLES_WORKSPACE.md` (cadrage workspace)
- `docs/ROLE/CADRAGE_BASE_WORKSPACE.md` (cadrage BASE)
- `docs/PLAN_UNIQUE_ROLES_ET_ACCES.md` (décisions actées)

---

## 9. DÉCISIONS VERROUILLÉES

### 9.1 Modèle cible consolidé
✅ **Validé**

### 9.2 Rôle plateforme Testeur
✅ **Décision actée** : Testeur = rôle dérivé (non stocké)
- Visibilité (liste workspaces) = Oui
- Lecture (contenu sans rôle workspace) = Non
- Écriture (sans rôle workspace) = Non
- BASE jamais modifier = Oui

### 9.3 Rôle workspace Lecteur (VIEWER)
✅ **Décision actée** : VIEWER = rôle officiel
- Export = Non
- Membres = Non
- Réglages = Non

### 9.4 Règle BASE
✅ **Décision actée** :
- Workspace BASE identifié par `workspace.isBase === true`
- Admin plateforme = seul modificateur de la BASE
- Testeur peut voir la BASE (listing uniquement)

### 9.5 Normalisation rôles workspace
✅ **Décision actée** :
- Liste officielle : MANAGER / MEMBER / VIEWER
- Mapping compatibilité : OWNER→MANAGER, USER→MEMBER
- Défaut : MEMBER

---

## 10. GLOSSAIRE

**Plateforme** : Espace global, transversal à tous les clubs

**Workspace** : Espace club, isolé des autres clubs

**BASE** : Workspace à statut spécial, source de templates, protégé en modification

**Rôle plateforme** : Rôle global (ADMIN, USER, Testeur dérivé)

**Rôle workspace** : Rôle local à un workspace (MANAGER, MEMBER, VIEWER)

**Rôle dérivé** : Rôle calculé/déduit, non stocké directement

**Mapping de compatibilité** : Correspondance entre valeurs legacy et valeurs cibles

---

**Ce document est la seule base de travail autorisée pour la gouvernance des rôles dans Ultimate Frisbee Manager.**
