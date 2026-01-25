# 📊 AUDIT COMPLET - Tableau de bord administrateur

**Date** : 2026-01-25  
**Objectif** : Analyser l'ensemble du système admin actuel pour préparer une refonte complète

---

## 🗂️ STRUCTURE ACTUELLE

### Pages Admin Frontend

```
/parametres/admin/
├── dashboard          → Tableau de bord principal (admin-dashboard)
├── users              → Gestion des utilisateurs (users-admin)
├── workspaces         → Gestion des bases (admin-workspaces)
├── explorer           → Explorateur de données (data-explorer)
└── overview           → Vue d'ensemble (data-overview)
```

### Routes Backend API

```
/api/admin/
├── GET  /overview                    → Statistiques + données récentes
├── GET  /all-content                 → Tout le contenu (exercices, entraînements, etc.)
├── GET  /all-tags                    → Tous les tags
├── GET  /export-ufm                  → Export UFM complet
├── GET  /list-exercices              → Liste complète exercices
├── GET  /list-entrainements          → Liste complète entraînements
├── GET  /list-echauffements          → Liste complète échauffements
├── GET  /list-situations-matchs      → Liste complète situations
├── GET  /users                       → Liste des utilisateurs
├── POST /users                       → Créer un utilisateur
├── PATCH /users/:id                  → Modifier un utilisateur
├── POST /bulk-delete                 → Suppression en masse
└── POST /bulk-duplicate              → Duplication en masse
```

### Routes Workspaces API

```
/api/workspaces/
├── GET  /me                          → Mes workspaces
├── GET  /:id                         → Détails d'un workspace
├── POST /                            → Créer un workspace
├── PATCH /:id                        → Modifier un workspace
├── DELETE /:id                       → Supprimer un workspace
├── GET  /:id/users                   → Membres d'un workspace
├── PUT  /:id/users                   → Définir les membres
├── POST /:id/users                   → Ajouter un membre
└── DELETE /:id/users/:userId         → Retirer un membre
```

---

## 📄 PAGE 1 : ADMIN DASHBOARD

### Localisation
- **Frontend** : `frontend/src/app/features/settings/pages/admin-dashboard/`
- **Route** : `/parametres/admin`
- **API** : `GET /api/admin/overview`

### Informations affichées

#### 1. Statistiques globales (6 cartes)
```typescript
{
  counts: {
    exercices: number,      // Nombre total d'exercices
    entrainements: number,  // Nombre total d'entraînements
    echauffements: number,  // Nombre total d'échauffements
    situations: number,     // Nombre total de situations
    tags: number,          // Nombre total de tags
    users: number          // Nombre total d'utilisateurs
  }
}
```

**Affichage actuel** :
- 6 grandes cartes colorées cliquables
- Chiffre en gros (36px)
- Icône distinctive par catégorie
- Clic → Navigation vers la section

#### 2. Actions rapides (6 boutons)
- Créer un exercice → `/exercices/nouveau`
- Créer un entraînement → `/entrainements/nouveau`
- Ajouter un utilisateur → `/parametres/admin/users`
- Gérer les tags → `/parametres/tags`
- Explorateur de données → `/parametres/admin/explorer`
- Exporter les données → (TODO)

#### 3. Activité récente (3 sections)
```typescript
{
  recent: {
    exercices: Array<{id, titre, createdAt}>,      // 20 derniers
    entrainements: Array<{id, titre, createdAt}>,  // 20 derniers
    echauffements: Array<{id, titre, createdAt}>,  // 20 derniers
    situations: Array<{id, titre, createdAt}>,     // 20 derniers
    tags: Array<{id, name, category, createdAt}>,  // 20 derniers
    users: Array<{                                 // 20 derniers
      id, email, nom, prenom, role, 
      isActive, iconUrl, createdAt
    }>
  }
}
```

**Affichage actuel** :
- 3 cartes : Exercices, Entraînements, Utilisateurs
- Liste des 5 derniers éléments
- Date de création
- Clic → Détail de l'élément

### Fonctionnalités
- ✅ Refresh manuel (bouton avec animation)
- ✅ Navigation directe depuis les cartes
- ✅ Feedback visuel (snackbar)
- ❌ Pas de refresh automatique
- ❌ Pas de graphiques
- ❌ Pas de filtres par période

---

## 📄 PAGE 2 : USERS ADMIN

### Localisation
- **Frontend** : `frontend/src/app/features/settings/pages/users-admin/`
- **Route** : `/parametres/admin/users`
- **API** : `GET /api/admin/users`, `POST /api/admin/users`, `PATCH /api/admin/users/:id`

### Informations affichées

#### 1. En-tête avec statistiques
- Nombre total d'utilisateurs
- Badge avec le compte

#### 2. Formulaire de création
```typescript
{
  email: string,          // Email (requis, unique)
  password: string,       // Mot de passe (requis, min 6)
  prenom: string,         // Prénom (optionnel)
  nom: string,            // Nom (optionnel)
  role: UserRole,         // USER ou ADMIN
  isActive: boolean       // Compte actif ou non
}
```

**Champs** :
- Email (validation email)
- Mot de passe (min 6 caractères)
- Prénom
- Nom
- Rôle (select : USER / ADMIN)
- Statut actif (toggle)

**Actions** :
- Créer l'utilisateur (avec confirmation)
- Réinitialiser le formulaire

#### 3. Tableau des utilisateurs
```typescript
{
  users: Array<{
    id: string,
    email: string,
    nom: string,
    prenom: string,
    role: 'USER' | 'ADMIN',
    isActive: boolean,
    iconUrl: string | null,
    createdAt: string
  }>
}
```

**Colonnes** :
- Avatar (photo ou icône par défaut)
- Nom complet (prenom + nom)
- Email
- Rôle (chip coloré : ADMIN orange, USER bleu)
- Statut actif (toggle vert/rouge)
- Actions :
  - Gérer les bases (workspaces)
  - Enregistrer les modifications

**Fonctionnalités** :
- ✅ Modification inline du rôle
- ✅ Toggle actif/inactif
- ✅ Confirmation avant modification
- ✅ Feedback visuel
- ❌ Pas de recherche
- ❌ Pas de filtres
- ❌ Pas de pagination
- ❌ Pas de tri
- ❌ Pas de suppression

---

## 📄 PAGE 3 : ADMIN WORKSPACES

### Localisation
- **Frontend** : `frontend/src/app/features/settings/pages/admin-workspaces/`
- **Route** : `/parametres/admin/workspaces`
- **API** : `GET /api/workspaces`, `POST /api/workspaces`, etc.

### Informations affichées

#### 1. Liste des workspaces (bases)
```typescript
{
  workspaces: Array<{
    id: string,
    name: string,
    description: string,
    createdAt: string,
    updatedAt: string,
    _count: {
      exercices: number,
      entrainements: number,
      echauffements: number,
      situationsMatchs: number
    }
  }>
}
```

**Affichage** :
- Nom du workspace
- Description
- Nombre de contenus
- Date de création
- Actions (modifier, supprimer, gérer membres)

#### 2. Gestion des membres d'un workspace
```typescript
{
  workspaceId: string,
  name: string,
  users: Array<{
    userId: string,
    email: string,
    nom: string,
    prenom: string,
    role: 'ADMIN' | 'USER',  // Rôle dans ce workspace
    linkId: string
  }>
}
```

**Fonctionnalités** :
- Ajouter un membre (par email)
- Définir le rôle dans le workspace
- Retirer un membre
- Modifier le rôle d'un membre

---

## 📄 PAGE 4 : DATA EXPLORER

### Localisation
- **Frontend** : `frontend/src/app/features/settings/pages/data-explorer/`
- **Route** : `/parametres/admin/explorer`
- **API** : `GET /api/admin/all-content`, `GET /api/admin/all-tags`

### Informations affichées

#### 1. Tout le contenu
```typescript
{
  exercices: Array<{
    id, nom, createdAt,
    tags: Array<{label, category, color}>
  }>,
  entrainements: Array<{
    id, titre, createdAt
  }>,
  echauffements: Array<{
    id, nom, createdAt
  }>,
  situations: Array<{
    id, nom, type, createdAt,
    tags: Array<{label, category, color}>
  }>
}
```

#### 2. Tous les tags
```typescript
{
  tags: Array<{
    id: string,
    label: string,
    category: string,
    color: string,
    createdAt: string
  }>
}
```

**Fonctionnalités** :
- Filtrer par type (exercices, entraînements, etc.)
- Recherche par nom
- Tri par date
- Actions en masse :
  - Suppression multiple
  - Duplication multiple

---

## 📄 PAGE 5 : DATA OVERVIEW

### Localisation
- **Frontend** : `frontend/src/app/features/settings/pages/data-overview/`
- **Route** : `/parametres/admin/overview`
- **API** : `GET /api/admin/overview`

### Informations affichées
- Vue d'ensemble similaire au dashboard
- Tableaux détaillés par type de contenu
- Statistiques avancées

---

## 🔧 FONCTIONNALITÉS BACKEND DISPONIBLES

### 1. Gestion des utilisateurs
```javascript
// GET /api/admin/users
// Retourne tous les utilisateurs avec :
{ id, email, nom, prenom, role, isActive, iconUrl, createdAt }

// POST /api/admin/users
// Crée un utilisateur avec :
{ email, password, nom, prenom, role, isActive }

// PATCH /api/admin/users/:id
// Modifie un utilisateur :
{ role, isActive }
```

### 2. Statistiques et aperçu
```javascript
// GET /api/admin/overview
// Retourne :
{
  counts: { exercices, entrainements, echauffements, situations, tags, users },
  recent: { exercices[], entrainements[], echauffements[], situations[], tags[], users[] }
}
```

### 3. Listes complètes
```javascript
// GET /api/admin/list-exercices
// Retourne : Array<{id, titre}>

// GET /api/admin/list-entrainements
// Retourne : Array<{id, titre}>

// GET /api/admin/list-echauffements
// Retourne : Array<{id, titre}>

// GET /api/admin/list-situations-matchs
// Retourne : Array<{id, titre}>
```

### 4. Export
```javascript
// GET /api/admin/export-ufm
// Exporte tout le contenu au format UFM
```

### 5. Actions en masse
```javascript
// POST /api/admin/bulk-delete
// Supprime plusieurs éléments :
{ type: 'exercice' | 'entrainement' | ..., ids: string[] }

// POST /api/admin/bulk-duplicate
// Duplique plusieurs éléments :
{ type: 'exercice' | 'entrainement' | ..., ids: string[] }
```

### 6. Gestion des workspaces
```javascript
// GET /api/workspaces/me
// Mes workspaces

// GET /api/workspaces/:id/users
// Membres d'un workspace

// PUT /api/workspaces/:id/users
// Définir les membres :
{ users: Array<{userId, role}> }

// POST /api/workspaces/:id/users
// Ajouter un membre :
{ email, role }

// DELETE /api/workspaces/:id/users/:userId
// Retirer un membre
```

---

## 📊 DONNÉES DISPONIBLES MAIS NON AFFICHÉES

### 1. Statistiques avancées (possibles)
- ❌ Nombre d'exercices par catégorie
- ❌ Nombre d'entraînements par durée
- ❌ Tags les plus utilisés
- ❌ Utilisateurs les plus actifs
- ❌ Contenu créé par période (jour/semaine/mois)
- ❌ Taux d'activité des utilisateurs
- ❌ Workspaces les plus actifs

### 2. Informations utilisateurs
- ✅ Email, nom, prénom
- ✅ Rôle global (USER/ADMIN)
- ✅ Statut actif
- ✅ Date de création
- ✅ Photo de profil (iconUrl)
- ❌ Dernière connexion
- ❌ Nombre de contenus créés
- ❌ Workspaces auxquels il appartient (visible dans dialog)

### 3. Informations workspaces
- ✅ Nom, description
- ✅ Nombre de contenus
- ✅ Liste des membres
- ❌ Activité récente
- ❌ Statistiques détaillées
- ❌ Propriétaire du workspace

### 4. Informations contenus
- ✅ ID, titre/nom
- ✅ Date de création
- ✅ Tags associés
- ❌ Auteur/créateur
- ❌ Dernière modification
- ❌ Nombre de vues
- ❌ Nombre d'utilisations dans entraînements

---

## 🎯 PROBLÈMES IDENTIFIÉS

### UX/UI
1. ❌ **Navigation confuse** : Trop de pages admin séparées
2. ❌ **Informations dispersées** : Dashboard, Explorer, Overview font doublon
3. ❌ **Pas de recherche globale** : Difficile de trouver un élément
4. ❌ **Pas de filtres** : Impossible de filtrer les utilisateurs ou contenus
5. ❌ **Pas de pagination** : Problème si beaucoup de données
6. ❌ **Pas de tri** : Tableaux non triables
7. ❌ **Actions limitées** : Pas de suppression, pas d'export individuel

### Fonctionnalités manquantes
1. ❌ **Logs d'activité** : Qui a fait quoi et quand
2. ❌ **Statistiques avancées** : Graphiques, tendances
3. ❌ **Gestion des permissions** : Rôles personnalisés par workspace
4. ❌ **Notifications** : Alertes pour les admins
5. ❌ **Backup/Restore** : Sauvegarde et restauration
6. ❌ **Import en masse** : Importer des utilisateurs/contenus
7. ❌ **Rapports** : Génération de rapports PDF/Excel

### Performance
1. ❌ **Pas de cache** : Rechargement complet à chaque fois
2. ❌ **Pas de lazy loading** : Tout chargé d'un coup
3. ❌ **Pas d'optimisation** : Requêtes multiples au lieu de joins

---

## 💡 RECOMMANDATIONS POUR REFONTE

### Structure proposée

```
/admin/
├── dashboard              → Vue d'ensemble + stats + activité récente
├── users/
│   ├── list              → Liste des utilisateurs (recherche, filtres, tri)
│   ├── :id               → Détail d'un utilisateur
│   └── create            → Créer un utilisateur
├── workspaces/
│   ├── list              → Liste des workspaces
│   ├── :id               → Détail d'un workspace + membres
│   └── create            → Créer un workspace
├── content/
│   ├── exercices         → Gestion des exercices
│   ├── entrainements     → Gestion des entraînements
│   ├── echauffements     → Gestion des échauffements
│   └── situations        → Gestion des situations
├── tags/                 → Gestion des tags
├── logs/                 → Logs d'activité
├── stats/                → Statistiques avancées
└── settings/             → Paramètres système
```

### Fonctionnalités prioritaires

#### 1. Dashboard unifié
- Statistiques globales (cartes)
- Graphiques (évolution dans le temps)
- Activité récente (tous types)
- Alertes et notifications
- Actions rapides

#### 2. Gestion utilisateurs améliorée
- Recherche par nom/email
- Filtres (rôle, statut, workspace)
- Tri par colonne
- Pagination
- Actions en masse (activer/désactiver, changer rôle)
- Export CSV
- Détail utilisateur :
  - Informations complètes
  - Workspaces
  - Contenus créés
  - Historique d'activité

#### 3. Gestion workspaces améliorée
- Recherche et filtres
- Statistiques par workspace
- Gestion des membres simplifiée
- Rôles personnalisés
- Permissions granulaires

#### 4. Explorateur de contenu unifié
- Vue unique pour tous les types
- Recherche globale
- Filtres multiples (type, tags, auteur, date)
- Tri avancé
- Actions en masse
- Prévisualisation rapide

#### 5. Statistiques et rapports
- Graphiques interactifs (Chart.js)
- Filtres par période
- Export PDF/Excel
- Tableaux de bord personnalisables

#### 6. Logs et audit
- Historique complet des actions
- Filtres (utilisateur, action, date)
- Export pour analyse

---

## 📋 DONNÉES À EXTRAIRE/CONSERVER

### Essentielles
- ✅ Statistiques globales (counts)
- ✅ Liste des utilisateurs
- ✅ Liste des workspaces
- ✅ Activité récente (20 derniers éléments)
- ✅ Membres des workspaces

### À ajouter
- ❌ Logs d'activité
- ❌ Statistiques par période
- ❌ Contenus par auteur
- ❌ Taux d'utilisation
- ❌ Tendances

---

**Prêt pour discussion et décisions sur la nouvelle architecture** 🎯
