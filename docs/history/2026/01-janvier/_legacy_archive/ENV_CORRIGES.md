# 📝 Fichiers .env Corrigés

## ⚠️ Instructions

Copiez le contenu ci-dessous dans vos fichiers respectifs.

---

## 📄 Fichier `backend/.env`

**Chemin :** `d:\Coding\AppWindows\Ultimate-frisbee-manager\backend\.env`

```env
# ============================================
# Ultimate Frisbee Manager - Backend (.env)
# ============================================
# Configuration pour le développement local
# ============================================

# 🗄 DATABASE
DATABASE_URL="postgresql://postgres.rnreaaeiccqkwgwxwxeg:0%40816N7m661C@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# 🔧 ENV
PORT=3000
NODE_ENV=development

# 🌐 CORS
CORS_ORIGINS="https://ultimate-frisbee-manager.vercel.app,http://localhost:4200"

# ☁️ CLOUDINARY
CLOUDINARY_URL="cloudinary://937631178698815:N4HlT6CFvZbnffM62qudAUc313g@dmiqnc2o6"
CLOUDINARY_CLOUD_NAME="dmiqnc2o6"
CLOUDINARY_API_KEY="937631178698815"
CLOUDINARY_API_SECRET="N4HlT6CFvZbnffM62qudAUc313g"

# 🔗 SUPABASE (requis pour authentification)
SUPABASE_PROJECT_REF="rnreaaeiccqkwgwxwxeg"
SUPABASE_URL="https://rnreaaeiccqkwgwxwxeg.supabase.co"
SUPABASE_JWT_SECRET="nLkaaWDvPUL02zTg6K0qY2iod7ld9RQGE0ayeCBlutUDUuYejFXeqFug1u0BpZM45ixzrfs9Ase214DwQ4keHw=="
SUPABASE_SERVICE_ROLE_KEY="VOTRE_SERVICE_ROLE_KEY_ICI"

# 🛡 RATE LIMITING
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
RATE_LIMIT_ENABLED=true
```

**⚠️ ACTION REQUISE :** Remplacez `VOTRE_SERVICE_ROLE_KEY_ICI` par votre clé service_role depuis Supabase Dashboard → Settings → API

---

## 📄 Fichier `backend/.env.CLEAN`

**Chemin :** `d:\Coding\AppWindows\Ultimate-frisbee-manager\backend\.env.CLEAN`

```env
# ============================================
# Ultimate Frisbee Manager - Backend (.env.CLEAN)
# ============================================
# Fichier de configuration nettoyé (sans JWT local)
# ============================================

# 🗄 DATABASE
DATABASE_URL="postgresql://postgres.rnreaaeiccqkwgwxwxeg:0%40816N7m661C@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# 🔧 ENV
PORT=3000
NODE_ENV=development

# 🌐 CORS
CORS_ORIGINS="https://ultimate-frisbee-manager.vercel.app,http://localhost:4200"

# ☁️ CLOUDINARY
CLOUDINARY_URL="cloudinary://937631178698815:N4HlT6CFvZbnffM62qudAUc313g@dmiqnc2o6"
CLOUDINARY_CLOUD_NAME="dmiqnc2o6"
CLOUDINARY_API_KEY="937631178698815"
CLOUDINARY_API_SECRET="N4HlT6CFvZbnffM62qudAUc313g"

# 🔗 SUPABASE (requis pour authentification)
SUPABASE_PROJECT_REF="rnreaaeiccqkwgwxwxeg"
SUPABASE_URL="https://rnreaaeiccqkwgwxwxeg.supabase.co"
SUPABASE_JWT_SECRET="nLkaaWDvPUL02zTg6K0qY2iod7ld9RQGE0ayeCBlutUDUuYejFXeqFug1u0BpZM45ixzrfs9Ase214DwQ4keHw=="

# 🛡 RATE LIMITING
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
RATE_LIMIT_ENABLED=true
```

---

## 🔑 Récupérer la Service Role Key

1. Aller sur https://app.supabase.com
2. Projet : `rnreaaeiccqkwgwxwxeg`
3. **Settings → API**
4. Section **Project API keys**
5. Copier **service_role** (⚠️ clé secrète, PAS anon/public)

---

## 🚀 Après Modification

Une fois les fichiers modifiés avec la bonne `SUPABASE_SERVICE_ROLE_KEY`, exécutez :

```bash
cd backend
node scripts/sync-supabase-users.js
```

Cela synchronisera les 3 utilisateurs de Supabase Auth vers PostgreSQL.
