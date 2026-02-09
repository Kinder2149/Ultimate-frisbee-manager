# Spécification des rôles - Ultimate Frisbee Manager

**Date:** 9 février 2026  
**Version:** 2.0 (après nettoyage legacy)

---

## Rôles plateforme

### ADMIN
- **Nom technique:** `ADMIN` (uppercase)
- **Label UI:** Administrateur
- **Signification:** Accès complet à la plateforme
- **Permissions:**
  - Accès à l'espace `/admin`
  - Gestion des utilisateurs (création, modification, désactivation)
  - Gestion des workspaces (création, modification, suppression)
  - Export global de données
  - Écriture sur le workspace BASE
  - Toutes les permissions USER

### USER
- **Nom technique:** `USER` (uppercase)
- **Label UI:** Utilisateur
- **Signification:** Accès standard à l'application
- **Permissions:**
  - Accès aux workspaces dont il est membre
  - Permissions selon son rôle workspace
  - Pas d'accès à l'espace `/admin`

---

## Rôles workspace

### MANAGER
- **Nom technique:** `MANAGER` (uppercase)
- **Label UI:** Gestionnaire
- **Signification:** Responsable du workspace
- **Permissions:**
  - Toutes les permissions MEMBER
  - Gérer les membres du workspace (ajout, suppression, modification rôles)
  - Gérer les paramètres du workspace (nom, configuration)
  - **Exception:** Sur le workspace BASE, seuls les ADMIN plateforme peuvent écrire

### MEMBER
- **Nom technique:** `MEMBER` (uppercase)
- **Label UI:** Membre
- **Signification:** Contributeur actif du workspace
- **Permissions:**
  - Lire tout le contenu du workspace
  - Créer du contenu (exercices, entraînements, échauffements, situations de match)
  - Modifier du contenu existant
  - Supprimer du contenu
  - **Exception:** Sur le workspace BASE, seuls les ADMIN plateforme peuvent écrire

### VIEWER
- **Nom technique:** `VIEWER` (uppercase)
- **Label UI:** Lecteur
- **Signification:** Accès en lecture seule
- **Permissions:**
  - Lire tout le contenu du workspace
  - Aucune permission d'écriture

---

## Matrice des permissions

| Action | VIEWER | MEMBER | MANAGER | ADMIN (plateforme) |
|--------|--------|--------|---------|-------------------|
| Lire contenu workspace | ✅ | ✅ | ✅ | ✅ |
| Créer contenu | ❌ | ✅ | ✅ | ✅ |
| Modifier contenu | ❌ | ✅ | ✅ | ✅ |
| Supprimer contenu | ❌ | ✅ | ✅ | ✅ |
| Gérer membres workspace | ❌ | ❌ | ✅ | ✅ |
| Gérer paramètres workspace | ❌ | ❌ | ✅ | ✅ |
| Écrire sur BASE | ❌ | ❌ | ❌ | ✅ |
| Export global | ❌ | ❌ | ❌ | ✅ |
| Accès `/admin` | ❌ | ❌ | ❌ | ✅ |

---

## Règles spéciales

### Workspace BASE
Le workspace BASE est un workspace spécial qui contient les données de référence partagées.

**Règle:** Seuls les utilisateurs avec le rôle plateforme `ADMIN` peuvent créer, modifier ou supprimer du contenu dans le workspace BASE, quel que soit leur rôle workspace.

**Implémentation:**
- Backend: `baseMutationGuard` middleware
- Frontend: `canMutateBase()` dans `PermissionsService`

### Testeurs
Les utilisateurs marqués comme `isTester: true` ont des restrictions supplémentaires:
- Ils ne peuvent pas accéder au workspace BASE (même en lecture)
- Le workspace BASE n'apparaît pas dans leur liste de workspaces

---

## Rôles obsolètes (ne plus utiliser)

### ~~OWNER~~ → MANAGER
- **Ancien nom:** `OWNER`
- **Nouveau nom:** `MANAGER`
- **Migration:** Effectuée le 9 février 2026
- **Statut:** Supprimé du code

### ~~USER (workspace)~~ → MEMBER
- **Ancien nom:** `USER` (dans le contexte workspace)
- **Nouveau nom:** `MEMBER`
- **Migration:** Effectuée le 9 février 2026
- **Statut:** Supprimé du code

**Note:** Le rôle plateforme `USER` reste valide et ne doit pas être confondu avec l'ancien rôle workspace `USER`.

---

## Implémentation technique

### Base de données
```prisma
enum UserRole {
  USER
  ADMIN
}

enum WorkspaceRole {
  MANAGER
  MEMBER
  VIEWER
}

model User {
  role UserRole @default(USER)
}

model WorkspaceUser {
  role WorkspaceRole @default(MEMBER)
}
```

### Backend
- **Validation:** `backend/validators/workspace.validator.js`
- **Middleware plateforme:** `backend/middleware/auth.middleware.js` → `requireAdmin`
- **Middleware workspace:** `backend/middleware/workspace.middleware.js` → `requireWorkspaceManager`, `requireWorkspaceWrite`

### Frontend
- **Type:** `frontend/src/app/core/services/permissions.service.ts` → `WorkspaceRole`
- **Service:** `PermissionsService` pour vérifications de permissions
- **Guard:** `RoleGuard` pour protection des routes

---

## Où gérer les rôles dans l'application

### Rôle plateforme (ADMIN/USER)
**Chemin:** Admin → Utilisateurs → Éditer un utilisateur → Champ "Rôle"  
**Accès:** Réservé aux ADMIN plateforme

### Rôles workspace (MANAGER/MEMBER/VIEWER)
**Chemin:** Admin → Workspaces → Ouvrir un workspace → "Gérer les membres"  
**Accès:** Réservé aux ADMIN plateforme

**Alternative (pour MANAGER):**  
**Chemin:** Paramètres → Workspace → Gérer les membres  
**Accès:** MANAGER du workspace courant

---

## Exemples d'usage

### Scénario 1: Utilisateur standard dans un workspace
- Rôle plateforme: `USER`
- Rôle workspace: `MEMBER`
- **Peut:** Créer/modifier/supprimer du contenu dans son workspace
- **Ne peut pas:** Accéder à `/admin`, gérer les membres, écrire sur BASE

### Scénario 2: Gestionnaire de workspace
- Rôle plateforme: `USER`
- Rôle workspace: `MANAGER`
- **Peut:** Tout ce que MEMBER peut + gérer membres et paramètres du workspace
- **Ne peut pas:** Accéder à `/admin`, écrire sur BASE

### Scénario 3: Administrateur plateforme
- Rôle plateforme: `ADMIN`
- Rôle workspace: (n'importe quel rôle)
- **Peut:** Tout, y compris accès `/admin`, gestion globale, écriture sur BASE
- **Ne peut pas:** Rien (accès complet)

### Scénario 4: Lecteur
- Rôle plateforme: `USER`
- Rôle workspace: `VIEWER`
- **Peut:** Lire le contenu du workspace
- **Ne peut pas:** Créer/modifier/supprimer du contenu, gérer membres

---

## Historique des modifications

### Version 2.0 (9 février 2026)
- ✅ Ajout enum `WorkspaceRole` en base de données
- ✅ Suppression rôles legacy `OWNER` et `USER` (workspace)
- ✅ Suppression fonction `normalizeWorkspaceRole`
- ✅ Uniformisation vérification ADMIN en uppercase
- ✅ Nettoyage types frontend

### Version 1.0 (Janvier 2026)
- Création initiale avec rôles `OWNER`, `USER`, `VIEWER`
- Normalisation legacy active
