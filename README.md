# 🥏 Ultimate Frisbee Manager

Application web complète pour la gestion d'exercices, d'entraînements et de séances d'ultimate frisbee.

**Statut:** ✅ En production sur Vercel  
**URL:** https://ultimate-frisbee-manager.vercel.app

---

## 📋 Table des Matières

- [Architecture](#architecture)
- [Technologies](#technologies)
- [Démarrage Rapide](#démarrage-rapide)
- [Structure du Projet](#structure-du-projet)
- [Scripts Utiles](#scripts-utiles)
- [Documentation](#documentation)
- [Déploiement](#déploiement)

---

## 🏗️ Architecture

### Frontend
- **Framework:** Angular 17
- **UI:** Angular Material
- **Authentification:** Supabase Auth
- **État:** Services + RxJS
- **Déploiement:** Vercel

### Backend
- **Runtime:** Node.js 20
- **Framework:** Express.js
- **ORM:** Prisma
- **Base de données:** PostgreSQL (Supabase)
- **Stockage images:** Cloudinary
- **Authentification:** Supabase Auth (JWT RS256)
- **Déploiement:** Vercel Functions

---

## 🛠️ Technologies

### Frontend
```
- Angular 17
- Angular Material
- RxJS
- TypeScript
- Supabase JS Client
```

### Backend
```
- Express.js
- Prisma ORM
- PostgreSQL
- Supabase Auth
- Cloudinary
- Jose (JWT verification)
- Bcrypt
```

---

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 20+
- npm ou yarn
- Compte Supabase
- Compte Cloudinary

### Installation

```bash
# Cloner le projet
git clone <repository-url>
cd Ultimate-frisbee-manager

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp backend/.env.example backend/.env
# Éditer backend/.env avec vos valeurs

# Générer le client Prisma
cd backend
npx prisma generate

# Lancer les migrations
npx prisma migrate deploy

# Seed la base de données
npm run db:seed
```

### Développement Local

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Backend sur http://localhost:3002

# Terminal 2 - Frontend
cd frontend
npm start
# Frontend sur http://localhost:4200
```

---

## 📁 Structure du Projet

```
Ultimate-frisbee-manager/
├── frontend/                 # Application Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/        # Services, guards, interceptors
│   │   │   ├── features/    # Modules fonctionnels
│   │   │   └── shared/      # Composants partagés
│   │   └── environments/    # Configuration environnements
│   └── package.json
│
├── backend/                  # API Express
│   ├── controllers/         # Logique métier
│   ├── middleware/          # Authentification, validation
│   ├── routes/              # Définition des routes
│   ├── services/            # Services (Prisma, Cloudinary)
│   ├── prisma/              # Schéma et migrations
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed*.js         # Scripts de seed
│   ├── scripts/             # Scripts utilitaires
│   └── package.json
│
├── shared/                   # Code partagé (types, utils)
├── docs/                     # Documentation
│   ├── diagnostics-archive/ # Diagnostics temporaires
│   └── *.md                 # Guides techniques
│
├── vercel.json              # Configuration Vercel
└── package.json             # Workspace root
```

---

## 📝 Scripts Utiles

### Backend

```bash
# Développement
npm run dev                    # Démarrer en mode dev avec nodemon

# Base de données
npm run db:generate            # Générer le client Prisma
npm run db:migrate             # Créer une migration
npm run db:deploy              # Appliquer les migrations
npm run db:seed                # Seed la base de données
npm run db:studio              # Ouvrir Prisma Studio

# Production
npm start                      # Démarrer le serveur

# Scripts maintenance
node scripts/verify-production-auth.js    # Vérifier config auth
node scripts/fix-admin-uuid.js            # Corriger UUID admin
node scripts/postdeploy-check.js          # Vérifier déploiement
```

### Frontend

```bash
npm start                      # Démarrer en mode dev
npm run build                  # Build production
npm run build:prod             # Build production optimisé
npm test                       # Lancer les tests
```

---

## 📚 Documentation

### Guides Principaux

- **[DATABASE_GUIDE.md](docs/DATABASE_GUIDE.md)** - Configuration PostgreSQL/Supabase
- **[SUPABASE_CONFIGURATION.md](docs/SUPABASE_CONFIGURATION.md)** - Configuration Supabase Auth
- **[VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md)** - Guide de déploiement Vercel
- **[ENV_CONFIGURATION.md](docs/ENV_CONFIGURATION.md)** - Variables d'environnement
- **[WORKSPACE_FLOW.md](docs/WORKSPACE_FLOW.md)** - Système de workspaces

### Diagnostics Archivés

Les fichiers de diagnostic temporaires sont dans `docs/diagnostics-archive/`

---

## 🚀 Déploiement

### Production (Vercel)

Le projet est configuré pour un déploiement automatique sur Vercel.

**Variables d'environnement requises:**

```env
# Database
DATABASE_URL=postgresql://...

# Supabase Auth
SUPABASE_PROJECT_REF=your_project_ref

# Cloudinary
CLOUDINARY_URL=cloudinary://...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# CORS
CORS_ORIGINS=https://your-domain.vercel.app

# Environment
NODE_ENV=production
```

**Déploiement:**

```bash
# Via Git (automatique)
git push origin master

# Via CLI Vercel
vercel --prod
```

---

## 🔐 Authentification

L'application utilise **Supabase Auth** pour l'authentification:

- Tokens JWT RS256
- Vérification via JWKS
- Session persistante
- Refresh automatique des tokens

**Compte admin par défaut:**
- Email: `admin@ultimate.com`
- Password: `Ultim@t+`

⚠️ **Important:** Changer le mot de passe admin en production

---

## 🗄️ Base de Données

### Modèles Principaux

- **User** - Utilisateurs de l'application
- **Workspace** - Espaces de travail (BASE, TEST)
- **Exercice** - Exercices d'ultimate
- **Entrainement** - Séances d'entraînement
- **Echauffement** - Échauffements
- **SituationMatch** - Situations de match
- **Tag** - Tags pour catégoriser

### Workspaces

- **BASE** - Workspace par défaut pour tous les utilisateurs
- **TEST** - Workspace réservé aux administrateurs

---

## 🧪 Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

---

## 📦 Scripts de Maintenance

### Vérification Production

```bash
# Vérifier la configuration auth
node backend/scripts/verify-production-auth.js

# Vérifier le déploiement
node backend/scripts/postdeploy-check.js
```

### Import/Export

```bash
# Exporter les données
node backend/scripts/export-ufm.mjs --baseUrl=<API_URL> --token=<TOKEN>

# Importer des données
node backend/scripts/import-ufm.js
```

---

## 🤝 Contribution

Ce projet est un projet personnel pour la gestion d'entraînements d'ultimate frisbee.

---

## 📄 Licence

Propriétaire - Tous droits réservés

---

## 🆘 Support

En cas de problème:

1. Vérifier les logs Vercel Functions
2. Consulter `docs/diagnostics-archive/` pour les guides de dépannage
3. Vérifier la configuration des variables d'environnement
4. Exécuter les scripts de vérification

---

**Dernière mise à jour:** Janvier 2026  
**Version:** 1.0.0 (Production)
