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

**Historique**
- Version initiale : définition des rôles et principes de gouvernance (Administrateur, Testeur, Gestionnaire, Utilisateur).
