# 🔑 Correction de la Service Role Key

## ✅ Bonne Clé Identifiée

**OUI**, c'est bien la clé **service_role** qu'il faut utiliser :

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJucmVhYWVpY2Nxa3dnd3h3eGVnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODMwMDUxNywiZXhwIjoyMDczODc2NTE3fQ.Sui0MwaO4HlAbb8vwPdR5sn2LEcMwPMy4qHF5AQwZuI
```

## ❌ Problème : Format Incorrect

L'erreur "Invalid API key" vient probablement du **format** dans le fichier `.env`.

### ⚠️ Format INCORRECT (avec guillemets)

```env
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### ✅ Format CORRECT (sans guillemets)

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJucmVhYWVpY2Nxa3dnd3h3eGVnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODMwMDUxNywiZXhwIjoyMDczODc2NTE3fQ.Sui0MwaO4HlAbb8vwPdR5sn2LEcMwPMy4qHF5AQwZuI
```

---

## 📝 Fichier `.env` Complet et Corrigé

Remplacez **tout le contenu** de `backend/.env` par :

```env
# ============================================
# Ultimate Frisbee Manager - Backend (.env)
# ============================================

# 🗄 DATABASE
DATABASE_URL=postgresql://postgres.rnreaaeiccqkwgwxwxeg:0%40816N7m661C@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

# 🔧 ENV
PORT=3000
NODE_ENV=development

# 🌐 CORS
CORS_ORIGINS=https://ultimate-frisbee-manager.vercel.app,http://localhost:4200

# ☁️ CLOUDINARY
CLOUDINARY_URL=cloudinary://937631178698815:N4HlT6CFvZbnffM62qudAUc313g@dmiqnc2o6
CLOUDINARY_CLOUD_NAME=dmiqnc2o6
CLOUDINARY_API_KEY=937631178698815
CLOUDINARY_API_SECRET=N4HlT6CFvZbnffM62qudAUc313g

# 🔗 SUPABASE (requis pour authentification)
SUPABASE_PROJECT_REF=rnreaaeiccqkwgwxwxeg
SUPABASE_URL=https://rnreaaeiccqkwgwxwxeg.supabase.co
SUPABASE_JWT_SECRET=nLkaaWDvPUL02zTg6K0qY2iod7ld9RQGE0ayeCBlutUDUuYejFXeqFug1u0BpZM45ixzrfs9Ase214DwQ4keHw==
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJucmVhYWVpY2Nxa3dnd3h3eGVnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODMwMDUxNywiZXhwIjoyMDczODc2NTE3fQ.Sui0MwaO4HlAbb8vwPdR5sn2LEcMwPMy4qHF5AQwZuI

# 🛡 RATE LIMITING
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
RATE_LIMIT_ENABLED=true
```

**⚠️ IMPORTANT :** Aucune variable ne doit avoir de guillemets `"` autour de sa valeur !

---

## 🚀 Après Modification

Une fois le fichier `.env` corrigé (sans guillemets), réexécutez :

```bash
cd backend
node scripts/sync-supabase-users.js
```

Cela devrait fonctionner cette fois ! ✅
