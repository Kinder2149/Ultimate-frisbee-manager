# 🚀 Guide de déploiement Vercel

## Variables d'environnement requises

### Backend (Vercel Functions)

Configurer ces variables dans **Vercel Dashboard** → **Settings** → **Environment Variables** :

#### 🔴 OBLIGATOIRES

```bash
# Base de données PostgreSQL (Supabase)
# ⚠️ IMPORTANT: Utiliser le pooler en mode TRANSACTION (port 6543) pour Vercel
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Référence projet Supabase (pour vérification JWT)
SUPABASE_PROJECT_REF="rnreaaeiccqkwgwxwxeg"

# CORS - Domaine frontend Vercel
CORS_ORIGINS="https://ultimate-frisbee-manager.vercel.app"

# Cloudinary (stockage images)
CLOUDINARY_URL="cloudinary://API_KEY:API_SECRET@CLOUD_NAME"

# Environnement
NODE_ENV="production"
```

#### 🟡 OPTIONNELLES (avec valeurs par défaut)

```bash
# Port (géré automatiquement par Vercel)
PORT=3002

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
RATE_LIMIT_ENABLED=true
```

---

## 📝 Comment obtenir les valeurs

### DATABASE_URL (Supabase)

1. Aller sur **Supabase Dashboard** → Votre projet
2. **Settings** → **Database** → **Connection string** → **Connection pooling**
3. Mode : **Transaction**
4. Port : **6543**
5. Copier l'URL complète avec le mot de passe

**Format attendu :**
```
postgresql://postgres.rnreaaeiccqkwgwxwxeg:[YOUR-PASSWORD]@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

### SUPABASE_PROJECT_REF

Votre référence projet : `rnreaaeiccqkwgwxwxeg`

Visible dans l'URL Supabase : `https://rnreaaeiccqkwgwxwxeg.supabase.co`

### CORS_ORIGINS

Domaine de votre frontend Vercel. Exemples :
- Production : `https://ultimate-frisbee-manager.vercel.app`
- Preview : `https://ultimate-frisbee-manager-git-main-username.vercel.app`
- Plusieurs domaines : `https://domain1.vercel.app,https://domain2.vercel.app`

### CLOUDINARY_URL

1. Aller sur **Cloudinary Dashboard**
2. **Dashboard** → Copier l'**API Environment variable**

**Format :**
```
cloudinary://123456789012345:abcdefghijklmnopqrstuvwxyz@your-cloud-name
```

---

## 🔧 Configuration Vercel

### 1. Créer le projet Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel
```

### 2. Configurer les variables

**Via Dashboard :**
1. Aller sur **Vercel Dashboard** → Votre projet
2. **Settings** → **Environment Variables**
3. Ajouter chaque variable avec :
   - **Name** : Nom de la variable
   - **Value** : Valeur secrète
   - **Environments** : Production, Preview, Development

**Via CLI :**
```bash
vercel env add DATABASE_URL production
vercel env add SUPABASE_PROJECT_REF production
vercel env add CORS_ORIGINS production
vercel env add CLOUDINARY_URL production
```

### 3. Redéployer

```bash
vercel --prod
```

---

## ✅ Vérification post-déploiement

### Test 1 : Health check
```bash
curl https://ultimate-frisbee-manager.vercel.app/api/health
```

**Réponse attendue :**
```json
{
  "status": "ok",
  "timestamp": "2026-01-27T20:30:00.000Z",
  "environment": "production"
}
```

### Test 2 : Authentification
```bash
# 1. Se connecter via frontend
# 2. Ouvrir DevTools → Network
# 3. Vérifier les requêtes /api/auth/profile
```

**Headers attendus :**
```
Authorization: Bearer eyJhbGci...
```

**Réponse 200 OK :**
```json
{
  "user": {
    "id": "...",
    "email": "admin@ultimate.com",
    "role": "ADMIN",
    "isActive": true
  }
}
```

### Test 3 : CORS
```bash
curl -H "Origin: https://ultimate-frisbee-manager.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://ultimate-frisbee-manager.vercel.app/api/workspaces/me
```

**Headers attendus dans la réponse :**
```
Access-Control-Allow-Origin: https://ultimate-frisbee-manager.vercel.app
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
```

---

## 🐛 Dépannage

### Erreur : "Cannot reach database server"

**Cause :** DATABASE_URL incorrecte ou pooler inaccessible

**Solution :**
1. Vérifier que le port est **6543** (transaction mode)
2. Vérifier le mot de passe
3. Tester la connexion depuis Supabase Dashboard

### Erreur : "CORS policy blocked"

**Cause :** CORS_ORIGINS ne contient pas le domaine frontend

**Solution :**
1. Vérifier la variable `CORS_ORIGINS` dans Vercel
2. Ajouter le domaine exact (avec https://)
3. Redéployer

### Erreur : "Token invalide ou expiré"

**Cause :** SUPABASE_PROJECT_REF incorrect

**Solution :**
1. Vérifier `SUPABASE_PROJECT_REF=rnreaaeiccqkwgwxwxeg`
2. Redéployer

### Erreur : "Cloudinary configuration missing"

**Cause :** CLOUDINARY_URL manquante

**Solution :**
1. Ajouter `CLOUDINARY_URL` dans Vercel
2. Format : `cloudinary://key:secret@cloud_name`
3. Redéployer

---

## 📊 Monitoring

### Logs Vercel
```bash
vercel logs ultimate-frisbee-manager --follow
```

### Métriques
- **Dashboard Vercel** → **Analytics**
- Temps de réponse API
- Taux d'erreur
- Utilisation mémoire

---

## 🔄 Mises à jour

### Déploiement automatique
Chaque push sur `main` déclenche un déploiement automatique.

### Déploiement manuel
```bash
vercel --prod
```

### Rollback
```bash
vercel rollback
```

---

## 📚 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
