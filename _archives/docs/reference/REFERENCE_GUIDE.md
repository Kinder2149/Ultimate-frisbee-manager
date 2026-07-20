# 📘 Guide de Référence - Ultimate Frisbee Manager

**Document de référence officiel du projet**  
**Version** : 1.0.0  
**Date** : 2026-01-24  
**Statut** : Document vivant

---

## 🎯 Objectif de ce document

Ce guide définit les **règles obligatoires**, l'**architecture**, les **conventions** et les **standards** pour le développement de l'application Ultimate Frisbee Manager. C'est le document de référence unique pour tous les contributeurs.

---

## 📋 Table des matières

1. [Vue d'ensemble du projet](#1-vue-densemble-du-projet)
2. [Architecture technique](#2-architecture-technique)
3. [Conventions de code](#3-conventions-de-code)
4. [Structure des dossiers](#4-structure-des-dossiers)
5. [Règles de développement](#5-règles-de-développement)
6. [Workflow Git](#6-workflow-git)
7. [Déploiement](#7-déploiement)
8. [Liens vers documentation](#8-liens-vers-documentation)

---

## 1. Vue d'ensemble du projet

### 1.1 Description

Application web de gestion d'entraînements d'ultimate frisbee permettant aux coachs de :
- Créer et gérer des exercices
- Composer des entraînements
- Organiser des échauffements
- Planifier des situations de match
- Gérer des workspaces multi-utilisateurs

### 1.2 Stack technique

**Frontend**
- Framework : Angular 17
- UI : Angular Material
- Éditeur : ngx-quill (Quill 2.0)
- Authentification : Supabase Auth + JWT
- Styles : SCSS

**Backend**
- Runtime : Node.js 20.x
- Framework : Express.js
- ORM : Prisma
- Base de données : PostgreSQL (Supabase)
- Upload images : Cloudinary
- Authentification : JWT + bcrypt

**Infrastructure**
- Frontend : Vercel (Angular)
- Backend : Vercel Functions (serverless)
- Database : Supabase PostgreSQL
- Storage : Cloudinary

### 1.3 Architecture monorepo

```
ultimate-frisbee-manager/
├── frontend/          # Application Angular
├── backend/           # API Express.js
├── shared/            # Code partagé (types, constantes)
└── docs/              # Documentation unique
```

---

## 2. Architecture technique

### 2.1 Monorepo npm workspaces

Le projet utilise **npm workspaces** pour gérer les dépendances partagées :

```json
{
  "workspaces": ["frontend", "backend", "shared"]
}
```

**Règle** : Toujours installer les dépendances à la racine avec `npm install -w <workspace>`

### 2.2 Package shared

Le package `shared` contient le code partagé entre frontend et backend :

```
shared/
├── constants/         # Constantes (tag-categories, etc.)
├── formats/           # Formats d'export/import
└── types/             # Types TypeScript partagés
```

**Règles** :
- ✅ Utiliser l'alias `@ufm/shared` dans les imports
- ✅ Ne commiter que les sources (.ts), pas les fichiers compilés (.js)
- ✅ Builder le package avant frontend/backend : `npm run build -w shared`

### 2.3 Backend - Structure API

**Architecture en couches** :

```
backend/
├── routes/            # Définition des endpoints
├── controllers/       # Logique métier
├── services/          # Services réutilisables
├── middleware/        # Middleware Express
├── validators/        # Validation des données
├── prisma/           # Schéma et migrations DB
└── config/           # Configuration centralisée
```

**Règles** :
- ✅ Un controller par entité (exercice, entrainement, etc.)
- ✅ Validation avec express-validator dans les validators
- ✅ Middleware d'authentification sur toutes les routes protégées
- ✅ Gestion d'erreurs centralisée via errorHandler.middleware.js

### 2.4 Frontend - Structure Angular

**Architecture modulaire** :

```
frontend/src/app/
├── core/              # Services singleton, guards, interceptors
│   ├── guards/        # Auth, role, workspace guards
│   ├── interceptors/  # HTTP interceptors
│   ├── services/      # Services métier
│   └── models/        # Modèles de données
├── shared/            # Composants, directives, pipes réutilisables
│   ├── components/    # Composants partagés
│   └── services/      # Services utilitaires
└── features/          # Modules fonctionnels
    ├── exercices/
    ├── entrainements/
    ├── echauffements/
    ├── situations-matchs/
    ├── dashboard/
    └── settings/
```

**Règles** :
- ✅ `core/` : Services singleton, guards, interceptors (providedIn: 'root')
- ✅ `shared/` : Composants réutilisables, importés dans SharedModule
- ✅ `features/` : Modules lazy-loaded par fonctionnalité
- ✅ Un composant = un dossier avec .ts, .html, .scss

---

## 3. Conventions de code

### 3.1 Naming conventions

**Backend (JavaScript)** :
- Fichiers : `kebab-case.js` (ex: `exercice.controller.js`)
- Variables/fonctions : `camelCase`
- Constantes : `UPPER_SNAKE_CASE`
- Classes : `PascalCase`

**Frontend (TypeScript)** :
- Fichiers : `kebab-case.component.ts`
- Classes/Interfaces : `PascalCase`
- Variables/méthodes : `camelCase`
- Constantes : `UPPER_SNAKE_CASE`

**Routes API** :
- ✅ **Convention ANGLAISE uniquement** : `/api/exercises`, `/api/trainings`
- ❌ Pas de routes françaises : `/api/exercices` (à supprimer)

### 3.2 Standards de code

**TypeScript/JavaScript** :
- Indentation : 2 espaces
- Quotes : Simple quotes `'`
- Point-virgule : Obligatoire
- Trailing comma : Oui

**SCSS** :
- Variables : `$primary-color`
- Mixins : `@mixin button-style`
- BEM naming : `.block__element--modifier`

### 3.3 Commentaires

**Règles** :
- ✅ Documenter les fonctions publiques avec JSDoc
- ✅ Commenter la logique complexe
- ❌ Pas de code commenté (supprimer ou archiver)
- ❌ Pas de console.log en production

**Exemple JSDoc** :
```javascript
/**
 * Récupère tous les exercices d'un workspace
 * @param {string} workspaceId - ID du workspace
 * @param {Object} filters - Filtres optionnels
 * @returns {Promise<Array>} Liste des exercices
 */
async function getExercices(workspaceId, filters) {
  // ...
}
```

---

## 4. Structure des dossiers

### 4.1 Règles générales

- ✅ Pas de fichiers à la racine (sauf config : package.json, .gitignore, etc.)
- ✅ Documentation uniquement dans `/docs`
- ✅ Pas de dossiers vides
- ✅ Pas de fichiers temporaires (.bak, .temp, tmp_*)

### 4.2 Organisation backend

```
backend/
├── routes/            # Routes Express
├── controllers/       # Logique métier
├── services/          # Services (cloudinary, cache, etc.)
├── middleware/        # Middleware Express
├── validators/        # Validation express-validator
├── prisma/           # Schéma, migrations, seeds
├── config/           # Configuration centralisée
├── __tests__/        # Tests Jest
└── scripts/          # Scripts utilitaires
```

### 4.3 Organisation frontend

```
frontend/src/
├── app/
│   ├── core/          # Singleton services, guards, interceptors
│   ├── shared/        # Composants réutilisables
│   └── features/      # Modules fonctionnels
├── environments/      # Configuration par environnement
├── styles.scss        # Styles globaux (SCSS uniquement)
└── index.html         # Point d'entrée
```

---

## 5. Règles de développement

### 5.1 Authentification et sécurité

**Backend** :
- ✅ Toutes les routes protégées avec `authenticateToken` middleware
- ✅ Workspace isolation avec `workspaceGuard` middleware
- ✅ Validation des entrées avec express-validator
- ✅ Rate limiting sur les routes sensibles
- ✅ Variables sensibles dans `.env` (jamais hardcodées)

**Frontend** :
- ✅ AuthGuard sur toutes les routes protégées
- ✅ AuthInterceptor pour ajouter le token JWT
- ✅ Gestion centralisée des erreurs HTTP
- ✅ Redirection automatique vers /login si 401

### 5.2 Gestion des erreurs

**Backend** :
```javascript
// Utiliser le middleware errorHandler
throw new Error('Message d\'erreur clair');
```

**Frontend** :
```typescript
// Un seul service d'erreurs (à définir)
this.errorService.handleError(error);
```

**Règle** : UN SEUL service de gestion d'erreurs par couche (backend/frontend)

### 5.3 Base de données

**Prisma** :
- ✅ Toujours créer une migration : `npm run db:migrate`
- ✅ Générer le client après modification : `npm run db:generate`
- ✅ Tester les migrations en local avant déploiement
- ✅ Seeds idempotents (peuvent être exécutés plusieurs fois)

**Conventions** :
- Tables : `PascalCase` (ex: `Exercice`, `Entrainement`)
- Relations : Toujours définir `onDelete` et `onUpdate`
- Indexes : Sur les champs fréquemment filtrés

### 5.4 Tests

**Backend (Jest)** :
- Tests dans `backend/__tests__/`
- Nommage : `<entity>.test.js`
- Commande : `npm test`

**Frontend (Jasmine/Karma)** :
- Tests à côté des composants : `*.spec.ts`
- Commande : `npm test`

**Règle** : Tests obligatoires pour :
- Routes API critiques (auth, CRUD)
- Services métier
- Guards et interceptors

---

## 6. Workflow Git

### 6.1 Branches

**Structure** :
- `master` : Production stable
- `function` : Développement migration Vercel
- `feature/<nom>` : Nouvelles fonctionnalités
- `fix/<nom>` : Corrections de bugs

### 6.2 Commits

**Convention** :
```
<type>(<scope>): <message>

[description optionnelle]
```

**Types** :
- `feat` : Nouvelle fonctionnalité
- `fix` : Correction de bug
- `refactor` : Refactoring
- `docs` : Documentation
- `test` : Tests
- `chore` : Maintenance

**Exemples** :
```
feat(exercices): add pagination to exercise list
fix(auth): resolve token refresh issue
refactor(frontend): consolidate error handlers
docs(api): update routes documentation
```

### 6.3 Pull Requests

**Règles** :
- ✅ Description claire du changement
- ✅ Tests passants
- ✅ Pas de console.log
- ✅ Code review obligatoire

---

## 7. Déploiement

### 7.1 Environnements

| Environnement | Frontend | Backend | Database |
|---------------|----------|---------|----------|
| Production | Vercel | Vercel Functions | Supabase |
| Développement | Local (ng serve) | Local (nodemon) | Supabase |

### 7.2 Variables d'environnement

**Backend** :
```env
# Database
DATABASE_URL=postgresql://...

# Auth
JWT_SECRET=...
JWT_REFRESH_SECRET=...

# Cloudinary
CLOUDINARY_URL=cloudinary://...

# CORS
CORS_ORIGINS=https://app.vercel.app
```

**Frontend** :
```typescript
// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.vercel.app',
  supabase: {
    url: '...',
    key: '...'
  }
};
```

### 7.3 Checklist pré-déploiement

- [ ] Tests passants
- [ ] Migrations DB appliquées
- [ ] Variables d'environnement configurées
- [ ] Pas de console.log
- [ ] Build frontend réussi
- [ ] Documentation à jour

---

## 8. Liens vers documentation

### 8.1 Documentation technique

- **Audit pré-migration** : [`docs/AUDIT_COMPLET_PRE_MIGRATION.md`](./AUDIT_COMPLET_PRE_MIGRATION.md)
- **Plan de correction** : [`docs/PLAN_DE_CORRECTION.md`](./PLAN_DE_CORRECTION.md) *(à créer)*
- **Documentation API** : *À créer*
- **Guide de déploiement** : *À créer*

### 8.2 Ressources externes

- [Angular Documentation](https://angular.io/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)

---

## 📝 Notes importantes

### Points d'attention

1. **Routes API** : Migration vers convention anglaise en cours
2. **Error handlers** : Consolidation des 3 services en 1 en cours
3. **Package shared** : Ne pas commiter les fichiers compilés
4. **Tests** : Couverture à améliorer avant production

### Décisions architecturales

- ✅ Monorepo npm workspaces
- ✅ Backend serverless (Vercel Functions)
- ✅ Database Supabase PostgreSQL
- ✅ Convention API anglaise
- ✅ Un seul fichier de styles : `styles.scss`

---

## 🔄 Historique du document

| Date | Version | Changements | Auteur |
|------|---------|-------------|--------|
| 2026-01-24 | 1.0.0 | Création du document de référence | Cascade |

---

**Document vivant - Mis à jour régulièrement**
