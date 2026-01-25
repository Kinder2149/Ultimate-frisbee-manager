# 🔐 Variables d'environnement Vercel

**Date** : 2026-01-25  
**Projet** : Ultimate Frisbee Manager  
**Infrastructure** : Vercel Functions (Backend) + Vercel Static (Frontend)

---

## 📋 Configuration requise

### Localisation

**Vercel Dashboard** → Votre projet → **Settings** → **Environment Variables**

---

## 🔴 VARIABLES OBLIGATOIRES (Production)

### Base de données

```bash
# ⚠️ IMPORTANT: Utiliser l'URL Pooler (Transaction mode) pour Vercel
DATABASE_URL=postgresql://postgres.rnreaaeiccqkwgwxwxeg:[PASSWORD]@aws-1-eu-west-3.pooler.supabase.com:6543/postgres
```

**Description** : Connexion PostgreSQL Supabase via Connection Pooler (Transaction mode)  
**Environnement** : Production, Preview (optionnel)

**⚠️ Note critique** :
- **NE PAS utiliser** `db.rnreaaeiccqkwgwxwxeg.supabase.co` (URL directe)
- **TOUJOURS utiliser** `aws-1-eu-west-3.pooler.supabase.com` (URL pooler)
- **Port 6543** pour production (Transaction mode)
- **Port 5432** pour dev local (Session mode)

**Récupérer l'URL** : Dashboard Supabase → Settings → Database → Connection Pooling → Transaction mode

---

### Authentification JWT

```bash
JWT_SECRET=<générer avec: openssl rand -base64 32>
JWT_REFRESH_SECRET=<générer avec: openssl rand -base64 32>
```

**Description** : Secrets pour tokens JWT (access + refresh)  
**Environnement** : Production, Preview  
**⚠️ IMPORTANT** : Utiliser des secrets différents de ceux du développement local

**Générer des secrets forts** :
```bash
# Sur Linux/Mac
openssl rand -base64 32

# Sur Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

---

### Cloudinary (Upload images)

```bash
CLOUDINARY_URL=cloudinary://937631178698815:N4HlT6CFvZbnffM62qudAUc313g@dmiqnc2o6
```

**Description** : Configuration complète Cloudinary (API key + secret + cloud name)  
**Environnement** : Production, Preview  
**Format** : `cloudinary://API_KEY:API_SECRET@CLOUD_NAME`

---

### CORS

```bash
CORS_ORIGINS=https://ultimate-frisbee-manager-kinder.vercel.app
```

**Description** : Origines autorisées pour CORS  
**Environnement** : Production  
**⚠️ IMPORTANT** : Mettre à jour avec l'URL exacte du frontend après déploiement

**Pour Preview** :
```bash
CORS_ORIGINS=https://ultimate-frisbee-manager-kinder.vercel.app,https://*.vercel.app
```

---

### Supabase (Authentification alternative)

```bash
SUPABASE_PROJECT_REF=rnreaaeiccqkwgwxwxeg
```

**Description** : Référence projet Supabase pour authentification JWKS  
**Environnement** : Production, Preview  
**Utilisation** : Validation tokens Supabase (fallback auth)

---

### Environnement

```bash
NODE_ENV=production
```

**Description** : Environnement d'exécution  
**Environnement** : Production  
**⚠️ NOTE** : Déjà défini dans `vercel.json`, mais peut être surchargé ici

---

## 🟡 VARIABLES OPTIONNELLES

### Rate Limiting

```bash
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
RATE_LIMIT_ENABLED=true
```

**Description** : Configuration du rate limiting  
**Valeurs par défaut** : Définies dans `backend/config/index.js`  
**Environnement** : Production (optionnel)

### JWT Expiration

```bash
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
```

**Description** : Durée de validité des tokens  
**Valeurs par défaut** : 7j (access), 30j (refresh)  
**Environnement** : Production (optionnel)

---

## 📝 Checklist de configuration

### Avant le premier déploiement

- [ ] Générer `JWT_SECRET` (32+ caractères)
- [ ] Générer `JWT_REFRESH_SECRET` (32+ caractères, différent de JWT_SECRET)
- [ ] Copier `DATABASE_URL` depuis Supabase
- [ ] Copier `CLOUDINARY_URL` depuis Cloudinary Dashboard
- [ ] Définir `CORS_ORIGINS` avec URL frontend prévue
- [ ] Définir `SUPABASE_PROJECT_REF`
- [ ] Vérifier `NODE_ENV=production`

### Après le premier déploiement

- [ ] Vérifier URL frontend Vercel générée
- [ ] Mettre à jour `CORS_ORIGINS` si URL différente
- [ ] Tester health check : `curl https://[projet].vercel.app/api/health`
- [ ] Tester login frontend
- [ ] Vérifier logs Vercel : `vercel logs --follow`

---

## 🔧 Configuration via CLI (alternative)

```bash
# Se connecter à Vercel
vercel login

# Lier le projet
vercel link

# Ajouter variables une par une
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production
vercel env add JWT_REFRESH_SECRET production
vercel env add CLOUDINARY_URL production
vercel env add CORS_ORIGINS production
vercel env add SUPABASE_PROJECT_REF production

# Lister variables configurées
vercel env ls
```

---

## 🚨 Sécurité

### ✅ Bonnes pratiques

- Utiliser des secrets forts (32+ caractères)
- Secrets production ≠ secrets développement
- Rotation des secrets JWT tous les 3-6 mois
- Ne JAMAIS commiter les secrets dans Git
- Utiliser variables d'environnement Vercel uniquement

### ❌ À ne JAMAIS faire

- Hardcoder secrets dans le code
- Partager secrets via Slack/Discord/Email
- Utiliser mêmes secrets dev/prod
- Commiter fichier `.env` avec secrets réels

---

## 🆘 Dépannage

### Erreur : "JWT_SECRET manquant"

**Cause** : Variable `JWT_SECRET` non définie dans Vercel  
**Solution** : Ajouter la variable dans Vercel Dashboard → Environment Variables

### Erreur : "Can't reach database server"

**Cause** : `DATABASE_URL` incorrecte ou DB inaccessible  
**Solution** : 
1. Vérifier URL dans Supabase Dashboard
2. Vérifier que DB est active
3. Tester connexion : `psql $DATABASE_URL`

### Erreur CORS

**Cause** : `CORS_ORIGINS` ne contient pas l'URL frontend  
**Solution** : Ajouter URL frontend exacte dans `CORS_ORIGINS`

### Erreur Cloudinary

**Cause** : `CLOUDINARY_URL` incorrecte  
**Solution** : Copier URL complète depuis Cloudinary Dashboard → Account Details

---

## 📚 Ressources

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Database Connection](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Cloudinary Configuration](https://cloudinary.com/documentation/node_integration#configuration)

---

**Dernière mise à jour** : 2026-01-25
