# 🚂 RAILWAY.APP - GUIDE COMPLET (100% GRATUIT)

## ✅ GRATUIT - Pas de Carte Bancaire Requise

Railway.app offre **GRATUITEMENT**:
- 500h d'exécution/mois
- 5$ de crédit mensuel
- Base de données PostgreSQL (512 MB)
- Pas besoin de carte bancaire pour commencer

---

## 📋 ÉTAPE PAR ÉTAPE

### ÉTAPE 1: Créer un Compte (1 min)

1. Aller sur: **https://railway.app/**
2. Cliquer **"Start a New Project"**
3. Cliquer **"Login with GitHub"**
4. Autoriser Railway à accéder à GitHub
5. ✅ Compte créé !

---

### ÉTAPE 2: Créer la Base de Données PostgreSQL (2 min)

1. Cliquer **"+ New"**
2. Sélectionner **"Database"**
3. Choisir **"Add PostgreSQL"**
4. Railway crée automatiquement la base de données
5. Copier l'URL de connexion:
   - Cliquer sur la base PostgreSQL
   - Onglet **"Connect"**
   - Copier **"Postgres Connection URL"**
   - Format: `postgresql://postgres:password@host:port/railway`

---

### ÉTAPE 3: Déployer le Backend (2 min)

1. Retour au dashboard Railway
2. Cliquer **"+ New"**
3. Sélectionner **"GitHub Repo"**
4. Choisir **"Ultimate-frisbee-manager"**
5. Railway détecte automatiquement Node.js ✅

---

### ÉTAPE 4: Configurer les Variables d'Environnement

Dans Railway, aller dans votre service backend → **"Variables"** → Ajouter:

#### Variables OBLIGATOIRES:

```bash
# Base de données (copier depuis l'étape 2)
DATABASE_URL=postgresql://postgres:password@host:port/railway

# JWT Secret (générer un secret aléatoire)
JWT_SECRET=votre-secret-jwt-minimum-32-caracteres-aleatoires

# JWT Refresh Secret
JWT_REFRESH_SECRET=votre-secret-refresh-minimum-32-caracteres-aleatoires

# Port (Railway l'utilise automatiquement)
PORT=3000

# Node Environment
NODE_ENV=production
```

#### Variables OPTIONNELLES (si vous utilisez Cloudinary):

```bash
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

#### Variables OPTIONNELLES (si vous utilisez Supabase Auth):

```bash
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_KEY=votre_anon_key
```

---

### ÉTAPE 5: Configurer le Build (Important!)

Dans Railway, aller dans **"Settings"** → **"Build"**:

#### Build Command:
```bash
npm install && npx prisma generate
```

#### Start Command:
```bash
npx prisma migrate deploy && npm start
```

**Explication**:
- `npx prisma migrate deploy` → Applique la migration `add_updated_at_fields`
- `npm start` → Démarre le serveur

---

### ÉTAPE 6: Déployer et Vérifier

1. Railway démarre automatiquement le déploiement
2. Voir les logs en temps réel (onglet **"Deployments"**)
3. Attendre que le statut passe à **"Success"** (2-3 min)
4. Copier l'URL publique:
   - Onglet **"Settings"** → **"Domains"**
   - Railway génère: `https://votre-app.up.railway.app`

#### Tester l'API:
```bash
# Health check
https://votre-app.up.railway.app/api/sync/health

# Devrait retourner:
{"status":"ok","timestamp":"2026-01-27T..."}
```

---

## 🎯 INFORMATIONS MANQUANTES - SOLUTIONS

### Si vous n'avez PAS de Supabase:

**Option A: Utiliser uniquement Railway PostgreSQL**
- ✅ Base de données déjà créée à l'étape 2
- ✅ Pas besoin de Supabase
- ⚠️ Désactiver l'authentification Supabase dans le code

**Option B: Créer un compte Supabase (gratuit)**
1. Aller sur: https://supabase.com/
2. Créer un compte gratuit
3. Créer un nouveau projet
4. Copier:
   - **Project URL**: `https://xxx.supabase.co`
   - **Anon Key**: Dans Settings → API

### Si vous n'avez PAS de Cloudinary:

**Option A: Désactiver les uploads d'images**
- Ne pas ajouter les variables Cloudinary
- Les exercices fonctionneront sans images

**Option B: Créer un compte Cloudinary (gratuit)**
1. Aller sur: https://cloudinary.com/
2. Créer un compte gratuit
3. Dashboard → Copier:
   - Cloud Name
   - API Key
   - API Secret

### Générer des Secrets JWT:

**Méthode 1: En ligne**
- Aller sur: https://www.uuidgenerator.net/
- Cliquer "Generate UUID"
- Copier le résultat (ex: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

**Méthode 2: PowerShell**
```powershell
# Générer un secret aléatoire
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

---

## 📊 RÉCAPITULATIF DES COÛTS

| Service | Coût | Limites Gratuites |
|---------|------|-------------------|
| **Railway.app** | **GRATUIT** | 500h/mois + 5$/mois crédit |
| **PostgreSQL Railway** | **GRATUIT** | 512 MB |
| **Supabase** | **GRATUIT** | 500 MB DB + 50k users |
| **Cloudinary** | **GRATUIT** | 25 crédits/mois |

**Total: 0€ / mois** ✅

---

## 🆘 PROBLÈMES FRÉQUENTS

### Problème: "Build failed"
**Solution**: Vérifier que `DATABASE_URL` est bien configuré

### Problème: "Migration failed"
**Solution**: 
1. Vérifier que la base de données est accessible
2. Vérifier le format de `DATABASE_URL`
3. Dans Railway logs, chercher l'erreur exacte

### Problème: "Port already in use"
**Solution**: Railway gère automatiquement le port, ne pas le changer

### Problème: "Cannot find module 'prisma'"
**Solution**: Vérifier la Build Command: `npm install && npx prisma generate`

---

## ✅ CHECKLIST FINALE

Avant de continuer, vérifier:

- [ ] Compte Railway créé (gratuit)
- [ ] Base de données PostgreSQL créée
- [ ] `DATABASE_URL` copié et configuré
- [ ] `JWT_SECRET` généré et configuré
- [ ] `JWT_REFRESH_SECRET` généré et configuré
- [ ] Build Command configuré
- [ ] Start Command configuré
- [ ] Déploiement réussi (status "Success")
- [ ] URL publique accessible
- [ ] Endpoint `/api/sync/health` fonctionne

---

## 🎉 PROCHAINES ÉTAPES

Une fois Railway configuré:

1. **Modifier le frontend** pour pointer vers Railway:
   ```typescript
   // frontend/src/environments/environment.ts
   export const environment = {
     production: false,
     apiUrl: 'https://votre-app.up.railway.app/api'
   };
   ```

2. **Continuer le développement** dans Gitpod ou localement

3. **Adapter les 4 services restants** (template déjà créé)

4. **Déployer le frontend** sur Vercel (gratuit, 2 min)

---

**Dites-moi exactement où vous êtes bloqué et je vous aide !**
