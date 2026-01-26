# 🏗️ ARCHITECTURE RÉELLE DU PROJET

**Date** : 26 janvier 2026  
**Version** : 1.0  
**Statut** : ✅ Production sur Vercel + Supabase

---

## 🎯 STACK TECHNIQUE COMPLÈTE

### Infrastructure
- ✅ **Hébergement** : 100% Vercel (Frontend + Backend)
- ✅ **Base de données** : Supabase PostgreSQL
- ✅ **Stockage fichiers** : Cloudinary
- ✅ **Authentification** : Supabase Auth + JWT custom backend

---

## 🌐 ARCHITECTURE VERCEL

### Frontend (Static Build)
```json
// vercel.json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "frontend/dist/ultimate-frisbee-manager"
      }
    }
  ]
}
```

**Caractéristiques** :
- Build Angular 17 en mode production
- Déploiement static sur Vercel CDN
- Routing SPA géré (fallback vers index.html)
- URL : `https://ultimate-frisbee-manager.vercel.app`

### Backend (Vercel Serverless Functions)
```json
// vercel.json
{
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node",
      "config": {
        "maxDuration": 30,
        "memory": 1024
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/server.js"
    }
  ]
}
```

**Caractéristiques** :
- Express.js converti en Vercel Serverless Functions
- Timeout max : 30 secondes
- Mémoire : 1024 MB
- Cold start géré automatiquement
- URL API : `https://ultimate-frisbee-manager.vercel.app/api`

---

## 🗄️ BASE DE DONNÉES SUPABASE

### Configuration Prisma
```prisma
// backend/prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Connection String
```bash
# Session mode (dev local) : port 5432
DATABASE_URL="postgresql://user:password@aws-*.pooler.supabase.com:5432/postgres"

# Transaction mode (production Vercel) : port 6543
DATABASE_URL="postgresql://user:password@aws-*.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

**Caractéristiques** :
- PostgreSQL 15+ hébergé par Supabase
- Connection pooling via PgBouncer (port 6543)
- Migrations gérées via Prisma
- Backups automatiques Supabase

---

## 🔐 AUTHENTIFICATION HYBRIDE

### Architecture Auth

Le projet utilise une **approche hybride** :

#### 1. Supabase Auth (Frontend)
```typescript
// frontend/src/app/core/services/supabase.service.ts
this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

// frontend/src/app/core/services/auth.service.ts
signUp(email, password) {
  return this.supabaseService.supabase.auth.signUp({ email, password });
}

login(credentials) {
  return this.supabaseService.supabase.auth.signInWithPassword(credentials);
}
```

**Utilisé pour** :
- Inscription utilisateur
- Connexion initiale
- Réinitialisation de mot de passe
- Gestion de session Supabase

#### 2. JWT Custom (Backend)
```javascript
// backend/middleware/auth.middleware.js
const token = req.headers.authorization?.split(' ')[1];
const decoded = jwt.verify(token, config.jwt.secret);
```

**Utilisé pour** :
- Protection des routes API
- Tokens access (7 jours) + refresh (30 jours)
- Stockage localStorage côté frontend
- Synchronisation avec profil backend

### Flux d'Authentification

```
1. User → Login via Supabase Auth
2. Supabase → Retourne session + user
3. Frontend → Écoute onAuthStateChange
4. Frontend → Sync profil avec backend API
5. Backend → Retourne JWT custom (optionnel)
6. Frontend → Stocke token local pour API calls
```

**Pourquoi cette approche ?**
- Supabase Auth : Gestion email/password, reset password
- JWT custom : Contrôle total sur les permissions et rôles backend
- Flexibilité : Peut évoluer vers Auth0, Clerk, etc.

---

## ☁️ CLOUDINARY (Stockage Fichiers)

### Configuration
```javascript
// backend/services/cloudinary.js
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Ou via URL unique
cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL
});
```

**Utilisé pour** :
- Upload d'images d'exercices
- Optimisation automatique (resize, compression)
- CDN global pour performance
- Gestion des transformations

---

## 📦 MONOREPO STRUCTURE

```
ultimate-frisbee-manager/
├── frontend/           # Angular 17 + Material Design
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/           # Services globaux (auth, supabase)
│   │   │   ├── features/       # Modules par feature
│   │   │   └── shared/         # Composants réutilisables
│   │   └── environments/
│   │       ├── environment.ts       # Dev
│   │       └── environment.prod.ts  # Production
│   └── package.json
│
├── backend/            # Express.js → Vercel Functions
│   ├── controllers/    # Logique métier
│   ├── routes/         # Endpoints API
│   ├── middleware/     # Auth, validation, errors
│   ├── services/       # Prisma, Cloudinary
│   ├── prisma/         # Schema + migrations
│   ├── config/         # Configuration centralisée
│   └── server.js       # Point d'entrée
│
├── shared/             # Types TypeScript partagés
│   ├── src/
│   │   └── enums/
│   ├── constants/
│   └── formats/
│
├── vercel.json         # Configuration Vercel
└── package.json        # Workspace root
```

---

## 🔧 VARIABLES D'ENVIRONNEMENT

### Backend (Vercel)

**Variables requises dans Vercel Dashboard** :

```bash
# Base de données
DATABASE_URL=postgresql://...@aws-*.pooler.supabase.com:6543/postgres?pgbouncer=true

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Cloudinary
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
# OU
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
CORS_ORIGINS=https://ultimate-frisbee-manager.vercel.app

# Environment
NODE_ENV=production
PORT=3002
```

### Frontend (Build-time)

**Hardcodé dans `environment.prod.ts`** :
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://ultimate-frisbee-manager.vercel.app/api',
  supabaseUrl: 'https://rnreaaeiccqkwgwxwxeg.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // Anon key (public)
};
```

**Note** : Les clés Supabase sont publiques (anon key), pas de secret côté frontend.

---

## 🚀 DÉPLOIEMENT

### Process Automatique (Git Push)

```bash
# 1. Push sur GitHub
git push origin master

# 2. Vercel détecte le push
# 3. Build du frontend
npm run build  # Angular production build

# 4. Build du backend
npm run postinstall  # prisma generate

# 5. Déploiement
# - Frontend → Vercel CDN
# - Backend → Vercel Serverless Functions

# 6. Migrations DB (si nécessaire)
# Exécuter manuellement : npx prisma migrate deploy
```

### Scripts Package.json

```json
{
  "scripts": {
    "build": "npm -w shared run build && npm -w frontend run build",
    "build:backend": "npm -w shared run build",
    "build:frontend": "npm -w shared run build && npm -w frontend run build"
  }
}
```

**Ordre d'exécution** :
1. Build `shared` (types TypeScript)
2. Build `frontend` (Angular)
3. Backend : `prisma generate` automatique

---

## 🔄 FLUX DE DONNÉES

### Création d'un Exercice

```
1. User → Remplit formulaire Angular
2. Frontend → POST /api/exercices (avec JWT)
3. Vercel Function → Valide JWT
4. Backend → Valide données (Zod)
5. Backend → Upload image Cloudinary (si présente)
6. Backend → INSERT Prisma → Supabase PostgreSQL
7. Backend → Retourne exercice créé
8. Frontend → Affiche toast succès
9. Frontend → Redirige vers liste/détail
```

### Authentification

```
1. User → Entre email/password
2. Frontend → Supabase.auth.signInWithPassword()
3. Supabase → Vérifie credentials
4. Supabase → Retourne session + user
5. Frontend → onAuthStateChange détecte SIGNED_IN
6. Frontend → GET /api/auth/profile (sync backend)
7. Backend → Vérifie user existe en DB
8. Backend → Retourne profil complet
9. Frontend → Stocke user + isAuthenticated
10. Frontend → Redirige vers dashboard
```

---

## 📊 PERFORMANCE

### Frontend
- **Bundle size** : ~7.4 MB (initial)
- **Lazy loading** : Modules chargés à la demande
- **CDN** : Vercel Edge Network
- **Cache** : Static assets cachés

### Backend (Serverless)
- **Cold start** : ~1-2 secondes (première requête)
- **Warm** : ~100-300ms
- **Timeout** : 30 secondes max
- **Concurrency** : Illimitée (Vercel scale auto)

### Base de Données
- **Connection pooling** : PgBouncer (port 6543)
- **Max connections** : Selon plan Supabase
- **Latency** : ~50-100ms (depuis Vercel)

---

## 🔒 SÉCURITÉ

### Niveau Infrastructure
- ✅ HTTPS automatique (Vercel)
- ✅ DDoS protection (Vercel)
- ✅ SSL/TLS pour DB (Supabase)
- ✅ Secrets dans Vercel Environment Variables

### Niveau Application
- ✅ JWT avec expiration (7j access, 30j refresh)
- ✅ Bcrypt pour passwords (salt rounds: 10)
- ✅ Rate limiting (5 tentatives login / 15min)
- ✅ CORS configuré (origine spécifique)
- ✅ Helmet.js (headers sécurité)
- ✅ Validation Zod (toutes les entrées)

### Niveau Base de Données
- ✅ Row Level Security (RLS) Supabase
- ✅ Prisma (protection SQL injection)
- ✅ Backups automatiques
- ✅ Encryption at rest

---

## 🎯 POINTS CLÉS

### ✅ Ce qui fonctionne
1. **Déploiement 100% Vercel** (frontend + backend)
2. **Base de données Supabase** avec Prisma
3. **Auth hybride** Supabase + JWT custom
4. **Upload images** via Cloudinary
5. **Monorepo** avec package shared
6. **CI/CD automatique** sur git push

### ⚠️ Points d'attention
1. **Cold start backend** : 1-2s sur première requête
2. **Connection pooling** : Utiliser port 6543 en production
3. **Migrations DB** : À exécuter manuellement si nécessaire
4. **Package shared** : Doit être build avant frontend/backend

### 🔴 Corrections nécessaires
1. **Variables Vercel** : Vérifier que toutes sont définies
2. **CORS_ORIGINS** : Doit pointer vers l'URL Vercel exacte
3. **Tests** : Couverture à améliorer (actuellement partielle)

---

## 📝 COMMANDES UTILES

### Développement Local
```bash
# Frontend
cd frontend && npm start
# → http://localhost:4200

# Backend
cd backend && npm run dev
# → http://localhost:3002

# Base de données
npx prisma studio
# → http://localhost:5555
```

### Production
```bash
# Vérifier les variables Vercel
vercel env ls

# Logs en temps réel
vercel logs

# Migrations DB
npx prisma migrate deploy

# Seed DB
npm run db:seed
```

---

## 🔗 URLS PRODUCTION

- **Frontend** : https://ultimate-frisbee-manager.vercel.app
- **API** : https://ultimate-frisbee-manager.vercel.app/api
- **Supabase Dashboard** : https://supabase.com/dashboard/project/rnreaaeiccqkwgwxwxeg
- **Vercel Dashboard** : https://vercel.com/dashboard
- **Cloudinary Console** : https://console.cloudinary.com

---

**Dernière mise à jour** : 26 janvier 2026  
**Architecture validée** : ✅ Production fonctionnelle
