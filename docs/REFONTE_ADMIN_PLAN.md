# 🏗️ PLAN DE REFONTE ADMIN - Ultimate Frisbee Manager

**Date de début** : 2026-01-25  
**Objectif** : Refonte complète du système d'administration

---

## 🎯 ARCHITECTURE CIBLE (VALIDÉE)

```
/admin/
├── dashboard        → Vue de pilotage globale
├── content          → Explorateur unifié des données
├── users            → Gestion des utilisateurs
├── workspaces       → Gestion des workspaces
├── stats            → Statistiques et analyses
├── logs             → Historique d'activité (UI prête)
└── settings         → Paramètres système
```

---

## 📊 AUDIT TECHNIQUE - ÉTAT ACTUEL

### Pages Admin Existantes (À SUPPRIMER)

```
frontend/src/app/features/settings/pages/
├── admin-dashboard/          ❌ À supprimer
├── admin-workspaces/         ❌ À supprimer
├── users-admin/              ❌ À supprimer
├── data-explorer/            ❌ À supprimer
└── data-overview/            ❌ À supprimer
```

### Composants Réutilisables (À ÉVALUER)

```
frontend/src/app/features/settings/components/
├── admin-shell/              ⚠️ À adapter pour nouvelle structure
├── content-list/             ✅ Potentiellement réutilisable
├── tag-list/                 ✅ Potentiellement réutilisable
└── user-list/                ⚠️ À évaluer
```

### Routes Backend Disponibles (CONFIRMÉES)

#### Admin API (`/api/admin/`)
- ✅ `GET /overview` - Statistiques + 20 derniers éléments
- ✅ `GET /all-content` - Tout le contenu (exercices, entraînements, échauffements, situations)
- ✅ `GET /all-tags` - Tous les tags
- ✅ `GET /export-ufm` - Export UFM complet
- ✅ `GET /list-exercices` - Liste complète exercices
- ✅ `GET /list-entrainements` - Liste complète entraînements
- ✅ `GET /list-echauffements` - Liste complète échauffements
- ✅ `GET /list-situations-matchs` - Liste complète situations
- ✅ `GET /users` - Liste des utilisateurs
- ✅ `POST /users` - Créer un utilisateur
- ✅ `PATCH /users/:id` - Modifier un utilisateur
- ✅ `POST /bulk-delete` - Suppression en masse
- ✅ `POST /bulk-duplicate` - Duplication en masse

#### Workspaces API (`/api/workspaces/`)
- ✅ `GET /me` - Mes workspaces
- ✅ `GET /:id` - Détails d'un workspace
- ✅ `POST /` - Créer un workspace
- ✅ `PATCH /:id` - Modifier un workspace
- ✅ `DELETE /:id` - Supprimer un workspace
- ✅ `GET /:id/users` - Membres d'un workspace
- ✅ `PUT /:id/users` - Définir les membres
- ✅ `POST /:id/users` - Ajouter un membre
- ✅ `DELETE /:id/users/:userId` - Retirer un membre

---

## 🗺️ PLAN D'EXÉCUTION

### ÉTAPE 1 - Audit technique ✅
- [x] Identifier pages admin actuelles
- [x] Identifier composants réutilisables
- [x] Lister routes backend disponibles
- [x] Créer document de plan

### ÉTAPE 2 - Nettoyage (EN COURS)
- [ ] Créer nouvelle structure `/admin`
- [ ] Supprimer anciennes pages admin
- [ ] Nettoyer routes frontend obsolètes
- [ ] Vérifier absence de régressions

### ÉTAPE 3 - Implémentation écran par écran

#### 3.1 - Dashboard
- [ ] Créer composant `/admin/dashboard`
- [ ] Afficher compteurs globaux (GET /overview)
- [ ] Afficher activité récente fusionnée
- [ ] Bouton export global (GET /export-ufm)
- [ ] Navigation vers vues filtrées

#### 3.2 - Content (Explorateur unifié)
- [ ] Créer composant `/admin/content`
- [ ] Recherche globale
- [ ] Filtres (type, tags, workspace)
- [ ] Pagination et tri
- [ ] Sélection multiple
- [ ] Actions en masse (bulk-delete, bulk-duplicate)
- [ ] Routes : GET /all-content, GET /all-tags

#### 3.3 - Users
- [ ] Créer composant `/admin/users` (liste)
- [ ] Créer composant `/admin/users/:id` (détail)
- [ ] Tableau avec filtres (rôle, actif/inactif)
- [ ] Formulaire création/édition
- [ ] Routes : GET /users, POST /users, PATCH /users/:id

#### 3.4 - Workspaces
- [ ] Créer composant `/admin/workspaces` (liste)
- [ ] Créer composant `/admin/workspaces/:id` (détail)
- [ ] Gestion des membres
- [ ] Routes : GET /workspaces/*, POST, PATCH, DELETE

#### 3.5 - Stats
- [ ] Créer composant `/admin/stats`
- [ ] Graphiques avec données existantes
- [ ] Filtres par période
- [ ] Utiliser Chart.js ou équivalent

#### 3.6 - Logs
- [ ] Créer composant `/admin/logs`
- [ ] Structure UI prête (table vide)
- [ ] Colonnes : date, utilisateur, action, type, objet
- [ ] Commentaire : "Fonctionnalité en attente backend"

#### 3.7 - Settings
- [ ] Créer composant `/admin/settings`
- [ ] Export global
- [ ] Paramètres système
- [ ] Structure claire

### ÉTAPE 4 - Vérification finale
- [ ] Tester navigation complète
- [ ] Vérifier toutes les routes backend
- [ ] Confirmer aucune donnée fictive
- [ ] Vérifier absence dette technique
- [ ] Documentation mise à jour

---

## 🛠️ RÈGLES STRICTES

1. ❌ **Aucune route backend inventée**
2. ❌ **Aucune donnée fictive**
3. ❌ **Aucune modification backend**
4. ✅ **Utiliser exclusivement routes existantes**
5. ✅ **Supprimer totalement ancienne admin**
6. ✅ **Code lisible et structuré**

---

## 📝 NOTES TECHNIQUES

### Composants à créer

```
frontend/src/app/features/admin/
├── admin.module.ts
├── admin-routing.module.ts
├── pages/
│   ├── dashboard/
│   ├── content/
│   ├── users/
│   │   ├── users-list/
│   │   └── user-detail/
│   ├── workspaces/
│   │   ├── workspaces-list/
│   │   └── workspace-detail/
│   ├── stats/
│   ├── logs/
│   └── settings/
├── components/
│   ├── admin-shell/
│   ├── stats-card/
│   ├── activity-feed/
│   └── ...
└── services/
    └── admin.service.ts (déjà existant)
```

### Services existants à utiliser
- `AdminService` - `/api/admin/*`
- `WorkspaceService` - `/api/workspaces/*`
- `AuthService` - Authentification

---

**STATUS** : ÉTAPE 1 TERMINÉE ✅  
**PROCHAINE ÉTAPE** : ÉTAPE 2 - Nettoyage
