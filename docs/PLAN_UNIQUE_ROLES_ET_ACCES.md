# PLAN UNIQUE — Rôles & Accès (Plateforme et Workspaces)

## 1. RÉFÉRENTIEL

### 1.1 Périmètre

Ce document constitue **l’unique référence contractuelle** pour la gouvernance des rôles, des accès et des responsabilités sur la plateforme **Frisbee Manager**.

Il couvre :

* la distinction **plateforme vs workspaces**,
* les rôles et leurs responsabilités,
* les règles d’accès observées et attendues,
* les écarts entre l’existant et le modèle cible,
* le plan de modification préparatoire à toute implémentation.

Aucun autre document ne fait autorité après celui-ci.

### 1.2 Sources documentaires analysées

Les constats et décisions ci-dessous s’appuient exclusivement sur les documents existants suivants :

* `docs/BASE/INVENTAIRE_CONTROLES_ACCES_BACKEND.md`
* `docs/BASE/ROLES_ET_GOUVERNANCE.md`
* `docs/BASE/PLAN_GOUVERNANCE_ROLES.md`
* `docs/BASE/ROLES_MODELE_CIBLE.md`

Toute affirmation est reliée à l’une de ces sources. Toute information absente est explicitement signalée.

### 1.3 Principes non négociables

* Séparation **stricte** entre gouvernance plateforme et gouvernance workspace.
* Aucun droit implicite : tout pouvoir doit être justifiable par un rôle et un périmètre.
* La **BASE** est un workspace à statut spécial.
* Le présent document est **préparatoire** : aucune implémentation, aucun code.

---

## 2. MODÈLE CIBLE CONSOLIDÉ

### 2.1 Frontière plateforme vs workspace

* La **plateforme** porte l’identité utilisateur globale et la gouvernance transverse.
* Les **workspaces** portent les droits métier et l’autonomie des clubs.

Aucun rôle workspace ne confère de pouvoir global.

### 2.2 Rôles plateforme

#### Administrateur plateforme

* Gouvernance globale.
* Accès total multi-workspaces.
* **Seul rôle autorisé à modifier la BASE**.

#### Utilisateur plateforme

* Identité de base.
* Aucun pouvoir global.
* Les capacités effectives dépendent exclusivement des rôles workspace.

#### Testeur plateforme

* Rôle de visibilité transverse.
* Peut voir tous les workspaces.
* N’agit que sur les workspaces où un rôle workspace explicite est attribué.
* **Ne peut jamais modifier la BASE**.

> Statut : rôle défini dans la gouvernance, **rôle dérivé (non stocké comme rôle plateforme)**.

### 2.3 Rôles workspace

#### Gestionnaire de workspace

* Gouvernance complète du club.
* Gestion des membres.
* Gestion des contenus.

#### Membre du workspace

* Usage et production de contenu.
* Pas de gestion des membres.

#### Lecteur du workspace

* Accès lecture seule.
* Aucun droit de création ou de modification.

### 2.4 Responsabilités synthétiques

* Les droits métier sont portés **exclusivement** par les rôles workspace.
* Les rôles plateforme ne doivent jamais contourner les règles workspace, sauf Administrateur pour des raisons de gouvernance.

---

## 3. ÉCARTS ENTRE EXISTANT ET CIBLE

### 3.1 Éléments existants alignés

* Authentification centralisée (`authenticateToken`).
* Rôle plateforme `ADMIN` contrôlé (`requireAdmin`).
* Isolation par workspace actif (`workspaceGuard`).
* Rôle workspace `OWNER` contrôlé (`requireWorkspaceOwner`).

### 3.2 Éléments incomplets

* Rôle plateforme **Testeur** non modélisé techniquement.
* Protection de la **BASE** définie conceptuellement mais non formalisée comme règle globale.

### 3.3 Éléments incohérents

* Valeur workspace `VIEWER` utilisée sans gouvernance formelle.
* Contrôles de rôle workspace limités au seul cas `OWNER`.

### 3.4 Éléments à faire disparaître

* Toute valeur de rôle workspace non officiellement gouvernée.
* Toute règle d’accès implicite non documentée.

---

## 4. PLAN DE MODIFICATION COMPLET (PRÉPARATOIRE)

### Action 1 — Consolider la liste officielle des rôles

* **Objectif** : figer la liste des rôles plateforme et workspace.
* **Portée** : gouvernance uniquement.
* **Impact** : backend / data / documentation.
* **Dépendances** : aucune.
* **Risque** : faible.

### Action 2 — Décider du statut du rôle Testeur

* **Objectif** : trancher son existence comme rôle plateforme stocké ou dérivé.
* **Portée** : gouvernance plateforme.
* **Impact** : backend / data.
* **Dépendances** : Action 1.
* **Risque** : moyen.

### Action 3 — Gouverner explicitement le rôle Lecteur (`VIEWER`)

* **Objectif** : aligner l’existant avec le modèle cible ou définir une transition.
* **Portée** : workspaces.
* **Impact** : data / règles d’accès.
* **Dépendances** : Action 1.
* **Risque** : moyen.

### Action 4 — Formaliser la règle BASE

* **Objectif** : rendre la protection BASE vérifiable.
* **Portée** : toutes opérations ciblant un workspace.
* **Impact** : backend / tests.
* **Dépendances** : Actions 1 et 2.
* **Risque** : élevé.

### Action 5 — Clarifier la relation rôles plateforme / workspace

* **Objectif** : éliminer toute ambiguïté de surpouvoir.
* **Portée** : gouvernance globale.
* **Impact** : documentation / règles futures.
* **Dépendances** : Action 2.
* **Risque** : moyen.

---

## 5. ORDRE D’EXÉCUTION RECOMMANDÉ

### Étapes obligatoires

1. Validation du modèle cible consolidé.
2. Décision sur le rôle Testeur.
3. Décision sur la liste finale des rôles workspace.
4. Définition normative de la règle BASE.

### Étapes optionnelles

* Préparation d’un rôle lecture seule élargi selon les besoins produit.

### Points de validation intermédiaires

* Validation écrite après chaque décision de gouvernance.
* Aucun passage à l’implémentation sans validation complète.

---

## 6. POINTS À VALIDER AVANT IMPLÉMENTATION

### Décisions encore ouvertes

* Aucune.

### Hypothèses à confirmer

* Volonté de conserver une liste de rôles workspace fermée.

### Risques à arbitrer

* Impact des changements de rôles sur les données existantes.
* Risque de régression sur les parcours admin et import.

---

## 7. DÉCISIONS VERROUILLÉES

### 7.1 Modèle cible consolidé (validation)

* **Décision 1.A** : OK.

### 7.2 Rôle plateforme Testeur (statut technique et capacités)

* **Décision 2.A** : Testeur = **rôle dérivé** (non stocké).
* **Décision 2.B** :
  * Visibilité (liste workspaces) = **Oui**.
  * Lecture (contenu d’un workspace sans rôle workspace) = **Non**.
  * Écriture (sans rôle workspace) = **Non**.
* **Décision 2.C** : BASE jamais modifier = **Oui**.

### 7.3 Rôle workspace Lecteur (`VIEWER`)

* **Décision 3.A** : `VIEWER` = rôle **officiel** (Lecteur workspace).
* **Décision 3.B** :
  * Export = **Non**.
  * Membres = **Non**.
  * Réglages = **Non**.

### 7.4 Règle BASE

* **Décision 4.A** : Workspace BASE identifié par `workspace.isBase === true`.
* **Décision 4.B** : Admin plateforme = **seul modificateur** de la BASE = **Oui**.
* **Décision 4.C** : Testeur peut voir la BASE = **Oui (listing uniquement)**.

---

## 8. RÈGLES D’ACCÈS NORMATIVES

### 8.1 Principes normatifs (découlant des décisions)

* **Séparation stricte** : un rôle plateforme ne confère pas de droits métier dans un workspace.
* **Aucun droit implicite** : toute action métier sur un workspace exige un rôle workspace explicite.
* **Exception unique** : l’Administrateur plateforme peut agir pour des raisons de gouvernance, y compris sur la BASE.
* **BASE** : `isBase=true` est une contrainte globale appliquée à toute opération ciblant un workspace.

### 8.2 Règles normatives par rôle plateforme

#### Administrateur plateforme

* Peut **lister** tous les workspaces.
* Peut **agir** (lecture/écriture) sur des workspaces, y compris sans rôle workspace explicite, selon les besoins de gouvernance.
* Est **le seul** autorisé à **modifier** la BASE (`isBase=true`).

#### Utilisateur plateforme

* Peut s’authentifier.
* N’a **aucun** droit sur un workspace sans rôle workspace explicite.

#### Testeur plateforme (rôle dérivé)

* Peut **lister** tous les workspaces (visibilité transverse).
* Ne peut **pas** lire le contenu d’un workspace sans rôle workspace explicite.
* Ne peut **pas** écrire/modifier sans rôle workspace explicite.
* Sur la BASE : **listing uniquement**, aucune lecture métier et aucune modification.

### 8.3 Règles normatives par rôle workspace

#### Gestionnaire de workspace

* Accès lecture/écriture métier complet sur le workspace.
* Gestion des membres du workspace.
* Gestion des contenus du workspace.

#### Membre du workspace

* Accès lecture/écriture métier **dans le périmètre membre**.
* Pas de gestion des membres.

#### Lecteur du workspace (`VIEWER`)

* Accès **lecture seule** sur le contenu du workspace.
* Interdit : création/modification/suppression.
* Interdit : export.
* Interdit : accès liste membres.
* Interdit : accès réglages.

### 8.4 Règle BASE (normative)

* Tout workspace avec `isBase=true` est traité comme **BASE**.
* Toute opération de **modification** ciblant la BASE est **refusée** sauf si l’utilisateur est **Administrateur plateforme**.
* Un Testeur plateforme ne doit jamais obtenir des droits de modification sur la BASE, y compris via un rôle dérivé.

---

## 9. CHECKLIST DE MODIFICATIONS (BACKEND / FRONTEND / DATA)

### 9.1 Backend

* Modèle workspace : ajouter/valider le champ `isBase` (booléen) et le propager dans les DTO/serializers.
* Définir une règle globale : toute route qui cible un workspace doit appliquer une garde BASE (interdire les mutations si `isBase=true` et utilisateur non admin plateforme).
* Implémenter le rôle **Testeur dérivé** :
  * source de vérité (ex: liste de comptes testeurs, flag, table dédiée) à décider côté technique,
  * mapping vers un “capability set” conforme : **listing OK, lecture non, écriture non** sans rôle workspace.
* Normaliser les rôles workspace :
  * officialiser `VIEWER` dans les enums/validations,
  * compléter les gardes d’accès : pas uniquement `OWNER`.
* Ajouter/adapter les tests :
  * Testeur : peut lister tous les workspaces, ne peut pas lire sans rôle workspace.
  * BASE : mutation refusée pour tout non-admin, y compris Testeur.
  * VIEWER : accès lecture OK, toute mutation/export/membres/réglages refusée.

### 9.2 Frontend

* UI Workspaces :
  * afficher la liste transverse pour un Testeur (y compris la BASE),
  * empêcher l’accès aux écrans de contenu d’un workspace si aucun rôle workspace explicite.
* UI Permissions :
  * masquer/désactiver toutes actions d’écriture pour `VIEWER`,
  * masquer/désactiver export, pages membres, pages réglages pour `VIEWER`.
* Gestion BASE :
  * indiquer visuellement le statut “BASE” (`isBase=true`) si nécessaire,
  * empêcher toute action de modification si non-admin.

### 9.3 Data

* Migration : ajouter `isBase` et positionner `isBase=true` sur le workspace BASE existant.
* Vérification des données :
  * recenser les assignations de rôles existantes,
  * décider et appliquer une stratégie de migration/alignement pour les valeurs non gouvernées.
* Référentiel rôles : s’assurer que `VIEWER` est accepté partout où un rôle workspace est stocké/validé.

---

## 10. NORMALISATION DES RÔLES WORKSPACE

### 10.1 Portée et traçabilité

Cette section est l’unique référence contractuelle pour la mission **Normalisation des rôles workspace**.

Références internes :

* Sections **2.3**, **3.3**, **7.3**, **8.3**.

Contraintes :

* Ne pas modifier la logique plateforme.
* Ne pas introduire de nouveaux rôles.
* Ne pas renommer `VIEWER`.
* Ne pas toucher aux données sans plan explicite.

### 10.2 Valeurs de rôle workspace existantes (constat)

Valeurs constatées dans le codebase et/ou les scripts :

* `OWNER`
* `USER` (utilisée comme valeur de rôle workspace)
* `VIEWER`

### 10.3 Rôles non gouvernés et valeurs orphelines (écarts)

* `OWNER` : valeur historique non alignée avec la liste cible **MANAGER/MEMBER/VIEWER**.
* `USER` (workspace) : valeur orpheline/ambiguë au regard de la séparation rôles plateforme vs rôles workspace.
* Contrôles d’accès : logique existante centrée sur `OWNER` uniquement.

### 10.4 Liste cible (normalisation)

Les seules valeurs autorisées pour les rôles workspace (cible) sont :

* `MANAGER`
* `MEMBER`
* `VIEWER`

### 10.5 Mapping de compatibilité (legacy → cible)

Sans migration data implicite, un mapping de compatibilité est requis pour interpréter les données existantes :

* `OWNER` → `MANAGER`
* `USER` (workspace) → `MEMBER`
* `VIEWER` → `VIEWER`

### 10.6 Mapping rôle → permissions (normatif)

#### `MANAGER`

* Lecture/écriture métier complet.
* Gestion des membres.
* Gestion des contenus.
* Accès aux réglages.

#### `MEMBER`

* Lecture/écriture métier dans le périmètre membre.
* Interdit : gestion des membres.

#### `VIEWER`

* Lecture seule.
* Interdit : création/modification/suppression.
* Interdit : export.
* Interdit : accès membres.
* Interdit : accès réglages.

### 10.7 Fichiers impactés (pré-implémentation)

Les fichiers suivants sont identifiés comme points d’écriture/validation/contrôle et sont impactés par la normalisation :

* `backend/prisma/schema.prisma`
* `backend/middleware/workspace.middleware.js`
* `backend/routes/workspace.routes.js`
* `backend/controllers/workspace.controller.js`
* `backend/services/business/workspace.service.js`
* `backend/prisma/seed-workspaces.js`
* `backend/scripts/verify-and-seed-auth.js`
* `backend/prisma/scripts/migrate-workspaces.js`
* `backend/controllers/auth.controller.js`
* `backend/scripts/sync-supabase-users.js`

**Ce document est la seule base de travail autorisée pour la suite du projet Frisbee Manager concernant les rôles et les accès.**
