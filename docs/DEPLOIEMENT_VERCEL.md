# Guide de déploiement Vercel

## 📋 Prérequis

- Compte Vercel (gratuit)
- Base de données PostgreSQL (Supabase recommandé)
- Variables d'environnement configurées

## 🚀 Déploiement initial

### 1. Préparer le projet

```bash
# S'assurer que le package shared est buildé
npm run build:backend

# Vérifier que les tests passent (optionnel)
cd backend && npm test
```

### 2. Configurer Vercel

#### Via CLI (recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel
```

#### Via Dashboard Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. Importer le repository GitHub
3. Configurer les variables d'environnement (voir section suivante)
4. Déployer

### 3. Variables d'environnement Vercel

Configurer dans **Settings > Environment Variables** :

#### Backend (obligatoires)

```bash
# Base de données
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT (générer avec: openssl rand -base64 32)
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Cloudinary
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# CORS (domaine Vercel)
CORS_ORIGINS=https://your-app.vercel.app

# Environnement (déjà défini dans vercel.json)
NODE_ENV=production
```

#### Frontend (optionnel)

Les variables frontend sont hardcodées dans `environment.prod.ts`. Pour les rendre dynamiques :

```bash
VITE_API_URL=https://your-app.vercel.app/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🔧 Configuration technique

### Architecture Vercel

```
Frontend (Angular)  →  Static Build (@vercel/static-build)
Backend (Express)   →  Serverless Functions (@vercel/node)
```

### Fichier vercel.json

Le fichier `vercel.json` est déjà configuré :

- **Frontend** : Build Angular → `frontend/dist/ultimate-frisbee-manager`
- **Backend** : Serverless Function → `backend/server.js`
- **Routes** : `/api/*` → Backend, reste → Frontend
- **Timeout** : 10 secondes max par fonction
- **NODE_ENV** : `production` automatique

### Limitations Vercel Functions

⚠️ **Important** :

- **Timeout** : 10 secondes max (Hobby plan)
- **Taille** : 50 MB max par fonction
- **Cold start** : ~1-2 secondes
- **Pas de WebSockets** : Utiliser Vercel Edge Functions si nécessaire

### Import par batch

Le controller d'import est paginé (batch de 50) pour éviter les timeouts :

```bash
# Import avec pagination
POST /api/import/exercices?offset=0&batchSize=50
POST /api/import/exercices?offset=50&batchSize=50
# etc.
```

## 📊 Monitoring

### Logs Vercel

```bash
# Voir les logs en temps réel
vercel logs --follow

# Logs d'une fonction spécifique
vercel logs backend/server.js
```

### Health check

```bash
# Vérifier que l'API fonctionne
curl https://your-app.vercel.app/api/health

# Réponse attendue
{
  "status": "ok",
  "timestamp": "2024-01-24T10:00:00.000Z",
  "uptime": 123,
  "environment": "production"
}
```

## 🔄 Déploiement continu

### Branches

- **main** → Production automatique
- **function** → Preview deployment
- **dev** → Preview deployment

### Workflow Git

```bash
# Développement local
git checkout function
# ... faire des modifications ...
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin function

# Vercel crée automatiquement un preview deployment
# URL: https://your-app-git-function-username.vercel.app

# Merger en main pour déployer en production
git checkout main
git merge function
git push origin main
```

## 🐛 Dépannage

### Erreur : "Function timeout"

**Cause** : Requête trop longue (>10s)

**Solution** :
- Utiliser la pagination pour les imports
- Optimiser les requêtes Prisma
- Ajouter des index sur la base de données

### Erreur : "DATABASE_URL not found"

**Cause** : Variable d'environnement manquante

**Solution** :
1. Aller dans Settings > Environment Variables
2. Ajouter `DATABASE_URL`
3. Redéployer

### Erreur : "Module not found: @ufm/shared"

**Cause** : Package shared non buildé

**Solution** :
```bash
# Build shared avant déploiement
npm run build:backend
git add shared/dist
git commit -m "build: compile shared package"
git push
```

### Erreur CORS

**Cause** : Domaine frontend non autorisé

**Solution** :
1. Mettre à jour `CORS_ORIGINS` dans Vercel
2. Valeur : `https://your-app.vercel.app`
3. Redéployer

## 📝 Checklist de déploiement

- [ ] Variables d'environnement configurées
- [ ] Base de données PostgreSQL créée (Supabase)
- [ ] Package shared buildé
- [ ] Tests backend passent
- [ ] Frontend build sans erreur
- [ ] CORS_ORIGINS configuré
- [ ] JWT secrets générés (32+ caractères)
- [ ] Cloudinary configuré
- [ ] Health check OK après déploiement
- [ ] Route /api/debug désactivée en production ✅

## 🔐 Sécurité

### Secrets à ne JAMAIS commiter

- ❌ `.env` (backend)
- ❌ `JWT_SECRET`
- ❌ `JWT_REFRESH_SECRET`
- ❌ `DATABASE_URL`
- ❌ `CLOUDINARY_URL`

### Bonnes pratiques

- ✅ Utiliser des secrets forts (32+ caractères)
- ✅ Rotation des secrets tous les 3-6 mois
- ✅ HTTPS uniquement (Vercel par défaut)
- ✅ CORS strict (domaine exact)
- ✅ Rate limiting sur /api/auth

## 📚 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Vercel Functions](https://vercel.com/docs/functions)
- [Prisma + Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Angular + Vercel](https://vercel.com/guides/deploying-angular-with-vercel)

## 🆘 Support

En cas de problème :

1. Consulter les logs Vercel : `vercel logs --follow`
2. Vérifier les variables d'environnement
3. Tester en local : `npm run dev:backend`
4. Consulter `docs/AUDIT_COMPLET_PRE_MIGRATION.md`
