# Ultimate Frisbee Manager - Documentation Projet

## 📋 Vue d'ensemble du projet

**Ultimate Frisbee Manager** est une application web complète de gestion d'entraînements d'ultimate frisbee, développée avec une architecture moderne full-stack.

### 🎯 Objectif principal
Permettre aux entraîneurs d'ultimate frisbee de créer, organiser et gérer leurs entraînements avec un système complet d'exercices, d'échauffements, de situations de match et de tags de catégorisation.

---

## 🏗️ Architecture technique actuelle

### Backend - API REST
- **Framework** : Node.js + Express
- **Base de données** : SQLite avec Prisma ORM
- **Port local** : 3002
- **Structure** : Controllers, Models, Routes
- **Fonctionnalités** : CORS activé, gestion des uploads, validation Prisma

### Frontend - Application Angular
- **Framework** : Angular 17
- **UI Library** : Angular Material Design
- **Architecture** : Modules avec lazy loading
- **Services** : HttpGenericService avec système de cache
- **Port local** : 4200 (ng serve)

### Base de données - Schema Prisma
- **Type** : SQLite (fichier local `dev.db`)
- **ORM** : Prisma Client
- **Migrations** : Prisma Migrate
- **Seeding** : Script de données initiales

---

## 📊 Modèles de données (Prisma Schema)

### Entités principales
1. **Exercice** - Exercices d'entraînement avec tags
2. **Tag** - Système de catégorisation (objectif, niveau, temps, format, etc.)
3. **Entrainement** - Sessions complètes avec exercices ordonnés
4. **Echauffement** - Séquences d'échauffement avec blocs
5. **SituationMatch** - Situations de jeu et matchs
6. **BlocEchauffement** - Blocs d'exercices d'échauffement
7. **EntrainementExercice** - Table de liaison avec ordre et durée

### Relations importantes
- **Entrainement** ↔ **Exercice** (Many-to-Many via EntrainementExercice)
- **Entrainement** → **Echauffement** (Optional One-to-One)
- **Entrainement** → **SituationMatch** (Optional One-to-One)
- **Tag** ↔ **Exercice/Entrainement/SituationMatch** (Many-to-Many)

---

## 🚀 Fonctionnalités implémentées

### ✅ Gestion des Tags (Système complet)
- **CRUD complet** : Création, lecture, modification, suppression
- **Catégorisation** : objectif, travail_specifique, niveau, temps, format
- **Validation** : Contraintes d'unicité, validation niveau (1-5 étoiles)
- **Interface** : Formulaires réactifs avec Material Design
- **Cache** : Invalidation automatique lors des modifications

### ✅ Gestion des Exercices (Système complet)
- **CRUD complet** avec formulaires réactifs Angular
- **Association tags** : Système de tags multiples par exercice
- **Fonctionnalités** : Recherche, filtrage, duplication
- **Champs** : nom, description, imageUrl, schemaUrl, variables +/-
- **Interface** : Material Design avec modals et validation

### ✅ Gestion des Échauffements (Système complet)
- **CRUD complet** avec système de blocs ordonnés
- **Blocs personnalisables** : titre, répétitions, temps, informations
- **Interface** : Drag & drop pour réorganisation des blocs
- **Validation** : Gestion d'erreurs et feedback utilisateur

### ✅ Gestion des Entraînements (Système enrichi)
- **CRUD complet** avec intégration multi-modules
- **Structure logique** : Échauffement → Exercices → Situation/Match
- **Intégrations optionnelles** :
  - Échauffements (via EchauffementModalComponent)
  - Situations/Matchs (via SituationMatchModalComponent)
- **Gestion ordre** : Exercices ordonnés avec durées spécifiques
- **Calcul automatique** : Durée totale de l'entraînement

### ✅ Gestion des Situations/Matchs (Système complet)
- **Types** : Situation vs Match
- **CRUD complet** avec formulaires réactifs
- **Association tags** : Réutilisation du système de tags existant
- **Interface** : Cohérente avec Material Design
- **Intégration** : Utilisable dans les entraînements

---

## 🧩 Composants réutilisables

### Composants de formulaires
- **TagFormComponent** : Formulaire de gestion des tags
- **ExerciceFormComponent** : Formulaire d'exercices avec validation
- **EchauffementFormComponent** : Formulaire d'échauffements avec blocs
- **EntrainementFormComponent** : Formulaire enrichi d'entraînements
- **SituationMatchFormComponent** : Formulaire de situations/matchs

### Composants modals d'intégration
- **EchauffementModalComponent** : Sélection/création d'échauffements
- **SituationMatchModalComponent** : Sélection/création de situations/matchs

### Services Angular
- **HttpGenericService** : Service HTTP générique avec cache
- **TagService, ExerciceService, EchauffementService** : Services métier
- **EntrainementService, SituationMatchService** : Services avec relations

---

## 🔧 Configuration actuelle

### Variables d'environnement (Backend)
```javascript
PORT=3002 (par défaut)
DATABASE_URL="file:./dev.db" (SQLite local)
```

### Environnements Angular
```typescript
// environment.ts (développement)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3002/api'
};

// environment.prod.ts (MANQUANT - À CRÉER)
```

### Scripts disponibles
**Backend** :
- `npm start` : Démarrage production
- `npm run dev` : Développement avec nodemon
- `npm run prisma:migrate` : Migrations base de données

**Frontend** :
- `ng serve` : Développement local
- `ng build` : Build de production
- `ng build --configuration production` : Build optimisé

---

## 🚨 Points d'attention identifiés

### Configuration serveur
- **Écoute réseau** : Serveur écoute actuellement sur localhost uniquement
- **CORS** : Configuration basique, à adapter pour production
- **Variables d'env** : Gestion à améliorer pour déploiement

### Base de données
- **SQLite local** : À migrer vers PostgreSQL pour production
- **Migrations** : Système Prisma en place, compatible production
- **Seeding** : Script de données initiales disponible

### Frontend
- **Environment prod** : Fichier `environment.prod.ts` manquant
- **Build config** : Configuration Angular prête pour production
- **Base href** : À configurer selon plateforme de déploiement

---

## 📁 Structure des dossiers

```
Ultimate-frisbee-manager/
├── backend/
│   ├── controllers/          # Logique métier API
│   ├── models/              # Modèles Prisma (legacy)
│   ├── routes/              # Routes Express
│   ├── prisma/              # Schema, migrations, seed
│   ├── uploads/             # Fichiers uploadés
│   ├── server.js            # Point d'entrée serveur
│   └── package.json         # Dépendances backend
├── frontend/
│   ├── src/app/             # Application Angular
│   ├── src/environments/    # Configurations environnement
│   ├── cypress/             # Tests E2E
│   └── package.json         # Dépendances frontend
├── shared/
│   └── constants/           # Constantes partagées
├── docs/                    # Documentation technique
└── documentation/           # Documentation utilisateur
```

---

## 🎯 État du développement

### ✅ Fonctionnalités complètes et testées
- Système de tags avec catégorisation
- Gestion complète des exercices
- Système d'échauffements avec blocs
- Entraînements avec intégrations multi-modules
- Situations et matchs
- Interface utilisateur cohérente et moderne

### 🔧 Corrections récentes appliquées
- Cohérence système de tags (casse minuscules/majuscules)
- Correction erreurs de suppression avec logique optimiste
- Alignement URLs services avec routes backend
- Ajout champ `imageUrl` dans modèles Prisma
- Correction erreurs 404 dans modals avec `ignoreRouteParams`

### 🚨 Problèmes résolus
- Conflits de routing entre modules
- Navigation menus déroulants
- Suppression modules inutiles (QuickAdd, Database)
- Intégration cross-modules via composants modals

---

## 📋 Prêt pour déploiement

### Points forts
- **Architecture solide** : Séparation claire backend/frontend
- **Code organisé** : Structure modulaire et réutilisable
- **Fonctionnalités complètes** : CRUD complet sur toutes entités
- **Interface moderne** : Material Design responsive
- **Base de données structurée** : Schema Prisma avec relations

### Adaptations nécessaires pour production
- Migration SQLite → PostgreSQL
- Configuration CORS pour domaines de production
- Création `environment.prod.ts` avec URLs de production
- Configuration serveur pour écoute sur `0.0.0.0`
- Variables d'environnement pour secrets (DATABASE_URL, etc.)

---

## 🔍 Informations techniques pour déploiement

### Backend (Compatible Render)
- **Framework** : Express.js (compatible)
- **Build command** : `npm install`
- **Start command** : `npm start`
- **Port** : Lecture variable `process.env.PORT`
- **Database** : Prisma compatible PostgreSQL

### Frontend (Compatible Vercel/GitHub Pages)
- **Framework** : Angular 17
- **Build command** : `ng build --configuration production`
- **Output directory** : `dist/`
- **SPA** : Configuration routing Angular

### Dépendances production
- **Backend** : Express, Prisma, CORS, dotenv
- **Frontend** : Angular, Material, RxJS
- **Base de données** : PostgreSQL (Render) ou SQLite (local)
