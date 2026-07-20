# Rôles & Accès — Spécification officielle

**Statut:** REFERENCE  
**Version:** 1.0  
**Date:** 2026-02-09  

---

## 1. Périmètre

Ce document spécifie, de manière contractuelle et non ambiguë :

- Les **rôles plateforme**
- Les **rôles workspace**
- Les **responsabilités** et **limites** associées
- Les **règles d’utilisation** (accès, gestion, restrictions)

Ce document est la **source de vérité** unique pour le sujet « Rôles & Accès ».

---

## 2. Définitions

- **Plateforme** : le système global (authentification, espace d’administration, gouvernance).
- **Workspace** : espace de travail (données et actions métiers isolées).
- **Rôle plateforme** : rôle global porté par l’utilisateur.
- **Rôle workspace** : rôle local porté par l’utilisateur **dans un workspace donné**.

---

## 3. Principes (invariants)

1. **Séparation stricte**
   - Un rôle workspace ne confère aucun pouvoir plateforme.
   - Les droits métier sont déterminés par le rôle workspace.

2. **Aucun droit implicite**
   - Une action doit être justifiée par un rôle explicite (plateforme ou workspace).

3. **Casse uniforme**
   - Tous les rôles sont en **UPPERCASE**.

---

## 4. Rôles plateforme

### 4.1 `ADMIN`

**Signification** : administrateur global de la plateforme.

**Responsabilités** :
- Accès à l’espace `/admin`.
- Gestion des utilisateurs (création, modification, désactivation).
- Gestion des workspaces (création, modification, suppression).
- Export global.

**Limites** :
- Aucune limite fonctionnelle dans le périmètre plateforme.

---

### 4.2 `USER`

**Signification** : utilisateur standard de la plateforme.

**Responsabilités** :
- Accès standard à l’application.
- L’accès effectif aux données et actions dépend des rôles workspace.

**Limites** :
- Pas d’accès à `/admin`.
- Aucun droit automatique sur un workspace sans rôle workspace.

---

## 5. Rôles workspace

### 5.1 `MANAGER`

**Signification** : responsable de gestion du workspace.

**Responsabilités** :
- Toutes les permissions de `MEMBER`.
- Gestion des membres du workspace (ajout/retrait, modification des rôles workspace).
- Gestion des paramètres du workspace.

**Limites** :
- N’accorde aucun droit plateforme.

---

### 5.2 `MEMBER`

**Signification** : contributeur (écriture) dans un workspace.

**Responsabilités** :
- Lecture du contenu.
- Création/modification/suppression de contenu métier dans le workspace.

**Limites** :
- Ne gère pas les membres.
- Ne gère pas les paramètres.

---

### 5.3 `VIEWER`

**Signification** : lecture seule.

**Responsabilités** :
- Lecture du contenu du workspace.

**Limites** :
- Aucune action d’écriture.
- Ne gère ni les membres ni les paramètres.

---

## 6. Règles d’accès et d’utilisation

### 6.1 Accès à un workspace

Un utilisateur ne peut accéder à un workspace que s’il possède un lien d’appartenance à ce workspace.

### 6.2 Matrice des permissions (workspace)

| Action | VIEWER | MEMBER | MANAGER |
|--------|--------|--------|---------|
| Lire contenu | Oui | Oui | Oui |
| Créer contenu | Non | Oui | Oui |
| Modifier contenu | Non | Oui | Oui |
| Supprimer contenu | Non | Oui | Oui |
| Gérer membres | Non | Non | Oui |
| Gérer paramètres | Non | Non | Oui |

### 6.3 Restriction spécifique : workspace BASE

**Règle** : sur le workspace **BASE**, toute écriture (création/modification/suppression) est interdite aux non-`ADMIN`.

- Si utilisateur plateforme `ADMIN` : écriture autorisée.
- Sinon : écriture interdite, quel que soit le rôle workspace.

---

## 7. Gestion des rôles (qui peut modifier quoi)

### 7.1 Rôle plateforme

- Seul un utilisateur plateforme `ADMIN` peut modifier le rôle plateforme d’un autre utilisateur.

### 7.2 Rôle workspace

- La modification des membres et de leurs rôles workspace est réservée :
  - à `ADMIN` (via l’administration des workspaces)
  - et/ou au `MANAGER` du workspace concerné (si la fonctionnalité est exposée dans l’application)

---

## 8. Modèle de données (contrat minimal)

### 8.1 Rôle plateforme (donnée utilisateur)

- Champ `User.role`
- Valeurs autorisées : `ADMIN`, `USER`

### 8.2 Rôle workspace (donnée d’appartenance)

- Champ `WorkspaceUser.role`
- Valeurs autorisées : `MANAGER`, `MEMBER`, `VIEWER`

---

## 9. Exclusions explicites (interdits)

Ce document exclut explicitement et définitivement :

- Toute référence à `OWNER`
- Toute référence à un rôle workspace nommé `USER`
- Toute logique d’accès implicite non formalisée dans les sections 6 et 7

---

## 10. Changelog

### v1.0 — 2026-02-09
- Publication de la spécification officielle « Rôles & Accès » (sans legacy, prête production)
