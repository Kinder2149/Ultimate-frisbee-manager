# Modèle cible de rôles — Plateforme & Clubs (workspaces)

## 1. Principes directeurs

### 1.1 Séparation stricte “plateforme” vs “club/workspace”

- **Rôles plateforme** : portent des responsabilités globales, transverses à tous les clubs.
- **Rôles club/workspace** : portent des responsabilités **dans le périmètre d’un club**.

### 1.2 Rôles en français (vocabulaire club de sport)

- Les rôles sont nommés en **français**.
- Les définitions visent la **lisibilité métier** (bénévoles, entraîneurs, dirigeants, membres).

### 1.3 Simplicité immédiate (mono-club)

- Le modèle cible doit être utilisable **dès aujourd’hui** dans un contexte mono-club.
- Il doit éviter une multiplication de rôles “optionnels” sans besoin immédiat.

### 1.4 Scalabilité (multi-club)

- Le modèle cible doit rester valide lorsque plusieurs clubs coexistent.
- Les rôles club/workspace doivent permettre :
  - l’**étanchéité** entre clubs,
  - la **délégation** de gestion à l’échelle d’un club,
  - la **participation** de membres avec des droits limités.

### 1.5 Pas d’implémentation

- Ce document définit un **modèle cible** (décisionnel).
- Il ne décrit **aucune** implémentation (code, DB, middleware, UI).

---

## 2. Rôles globaux (plateforme)

> Objectif : limiter au strict nécessaire ce qui dépasse le périmètre d’un club.

### 2.1 Administrateur plateforme

- **Description** : gouvernance globale de la plateforme.
- **Responsabilités** :
  - administration transversale,
  - accès aux fonctions de supervision globales,
  - capacités de gestion pouvant impacter plusieurs clubs.

### 2.2 Utilisateur plateforme

- **Description** : identité utilisateur au niveau plateforme.
- **Responsabilités** :
  - accéder à la plateforme,
  - appartenir à un ou plusieurs clubs (via des rôles club/workspace).

### 2.3 Testeur plateforme (optionnel, “plus tard”)

- **Description** : rôle global de visibilité/test, sans gouvernance globale.
- **Responsabilités** :
  - accès transverse en lecture (selon règles définies),
  - capacités d’action limitées au(x) club(s) où un rôle club explicite est attribué.

---

## 3. Rôles club/workspace (liés à un club)

> Objectif : avoir un ensemble lisible, stable, adapté à un club de sport.

### 3.1 Gestionnaire de club

- **Description** : responsable du club (dirigeant / administrateur du club).
- **Responsabilités** :
  - gouvernance du club (paramètres),
  - gestion des membres,
  - gestion et structuration des contenus du club.

### 3.2 Membre du club

- **Description** : utilisateur actif du club.
- **Responsabilités** :
  - consultation du contenu,
  - création et maintien du contenu (selon règles définies),
  - utilisation quotidienne.

### 3.3 Lecteur du club

- **Description** : accès “lecture seule” (invité, parent, observateur, membre en onboarding).
- **Responsabilités** :
  - consultation du contenu,
  - aucune action de création/modification/suppression.

---

## 4. Matrice RÔLES × ACTIONS

### 4.1 Actions normalisées

- **Lecture** : consulter le contenu du club.
- **Création** : créer un élément de contenu.
- **Modification** : modifier un élément de contenu.
- **Suppression** : supprimer un élément de contenu.
- **Gestion des membres** : inviter/retirer des membres, attribuer des rôles club.
- **Paramètres** : modifier les paramètres du club.

### 4.2 Matrice (club/workspace)

| Action \ Rôle | Gestionnaire de club | Membre du club | Lecteur du club |
|---|---:|---:|---:|
| Lecture | Oui | Oui | Oui |
| Création | Oui | Oui | Non |
| Modification | Oui | Oui | Non |
| Suppression | Oui | Oui | Non |
| Gestion des membres | Oui | Non | Non |
| Paramètres | Oui | Non | Non |

### 4.3 Matrice (plateforme)

| Action \ Rôle | Administrateur plateforme | Utilisateur plateforme | Testeur plateforme |
|---|---:|---:|---:|
| Lecture globale (multi-clubs) | Oui | Non | Oui |
| Création / modification / suppression globale | Oui | Non | Non |
| Gestion des membres (multi-clubs) | Oui | Non | Non |

---

## 5. Ce qui est utilisé : maintenant vs plus tard

### 5.1 Maintenant (mono-club)

- **Rôles plateforme utilisés** :
  - Administrateur plateforme
  - Utilisateur plateforme
- **Rôles club/workspace utilisés** :
  - Gestionnaire de club
  - Membre du club
  - Lecteur du club

### 5.2 Plus tard (multi-club)

- **Rôles plateforme** :
  - ajout éventuel de “Testeur plateforme” (si besoin de visibilité transverse sans administration)
- **Rôles club/workspace** :
  - le même modèle doit s’appliquer à N clubs, sans changement de vocabulaire

---

## 6. Hypothèses explicites

- Le modèle cible considère que les droits “métier” sont principalement portés par les **rôles club/workspace**, la plateforme gardant un périmètre réduit.
- La gestion des membres et des paramètres de club est portée par un rôle unique et lisible (**Gestionnaire de club**).
- Un rôle de lecture seule (**Lecteur du club**) est explicitement prévu pour couvrir les besoins d’invitation, d’onboarding ou d’accès limité.
