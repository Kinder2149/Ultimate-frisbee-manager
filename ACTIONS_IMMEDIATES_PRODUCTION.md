# 🚨 Actions Immédiates - Correction Production

**Date**: 2026-01-26  
**Problème**: Erreurs 500/503 en production  
**Priorité**: CRITIQUE

---

## 📍 Situation Actuelle

Votre application est déployée sur Vercel mais ne fonctionne pas:
- ❌ `/api/auth/login` → 500 (Internal Server Error)
- ❌ `/api/health` → 503 (Service Unavailable)
- ❌ `/api/workspaces/me` → 401 (Unauthorized)
- ❌ `/api/auth/profile` → 401 (Unauthorized)

**Cause probable**: Base de données inaccessible en production.

---

## ✅ ACTIONS À EFFECTUER MAINTENANT

### 1️⃣ Vérifier les Variables d'Environnement Vercel (5 min)

**Aller sur**: https://vercel.com/dashboard → Votre projet → **Settings** → **Environment Variables**

**Vérifier que ces 5 variables existent et sont correctes:**

#### a) DATABASE_URL ⚠️ CRITIQUE

**Format attendu:**
```
postgresql://postgres.rnreaaeiccqkwgwxwxeg:[PASSWORD]@aws-1-eu-west-3.pooler.supabase.com:6543/postgres
```

**Points clés:**
- ✅ Doit contenir `aws-1-eu-west-3.pooler.supabase.com`
- ✅ Port **6543** (Transaction mode)
- ❌ NE PAS utiliser `db.rnreaaeiccqkwgwxwxeg.supabase.co`

**Où trouver la bonne URL:**
1. https://supabase.com/dashboard/project/rnreaaeiccqkwgwxwxeg
2. **Settings** → **Database** → **Connection Pooling**
3. Onglet **"Transaction mode"**
4. Copier l'URL complète

#### b) JWT_SECRET ⚠️ CRITIQUE

**Générer un nouveau secret (32+ caractères):**
```powershell
# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

#### c) JWT_REFRESH_SECRET ⚠️ CRITIQUE

**Générer un AUTRE secret (différent de JWT_SECRET):**
```powershell
# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

#### d) CLOUDINARY_URL ⚠️ CRITIQUE

**Format:**
```
cloudinary://937631178698815:N4HlT6CFvZbnffM62qudAUc313g@dmiqnc2o6
```

**Où trouver:**
- https://cloudinary.com/console → **Account Details** → Copier "API Environment variable"

#### e) CORS_ORIGINS ⚠️ IMPORTANT

**Format:**
```
https://ultimate-frisbee-manager.vercel.app
```

**Trouver votre URL:**
- Vercel Dashboard → **Deployments** → Cliquer sur le dernier déploiement → Copier l'URL

---

### 2️⃣ Corriger DATABASE_URL (PRIORITÉ #1)

**Si votre DATABASE_URL actuelle contient `db.rnreaaeiccqkwgwxwxeg.supabase.co`:**

1. Aller sur Supabase: https://supabase.com/dashboard/project/rnreaaeiccqkwgwxwxeg
2. **Settings** → **Database** → **Connection Pooling**
3. Cliquer sur l'onglet **"Transaction mode"**
4. Copier l'URL complète (elle doit contenir `aws-1-eu-west-3.pooler.supabase.com:6543`)
5. Remplacer `[YOUR-PASSWORD]` par votre mot de passe Supabase
6. Dans Vercel: **Settings** → **Environment Variables** → Éditer `DATABASE_URL`
7. Coller la nouvelle URL
8. **Environnement**: Production
9. Sauvegarder

---

### 3️⃣ Ajouter les Secrets JWT (si manquants)

**Si JWT_SECRET ou JWT_REFRESH_SECRET n'existent pas:**

1. Générer deux secrets différents (voir commandes PowerShell ci-dessus)
2. Dans Vercel: **Settings** → **Environment Variables** → **Add New**
3. Ajouter `JWT_SECRET` avec le premier secret
4. Ajouter `JWT_REFRESH_SECRET` avec le second secret
5. **Environnement**: Production
6. Sauvegarder

---

### 4️⃣ Vérifier CLOUDINARY_URL

1. Vérifier que la variable existe dans Vercel
2. Vérifier le format: `cloudinary://API_KEY:API_SECRET@CLOUD_NAME`
3. Si manquante ou incorrecte: copier depuis https://cloudinary.com/console

---

### 5️⃣ Corriger CORS_ORIGINS

1. Noter l'URL exacte de votre déploiement Vercel (ex: `https://ultimate-frisbee-manager-abc123.vercel.app`)
2. Dans Vercel: Éditer `CORS_ORIGINS`
3. Mettre l'URL exacte (sans slash final)
4. Sauvegarder

---

### 6️⃣ Redéployer (OBLIGATOIRE)

**Après avoir modifié les variables d'environnement:**

**Option 1: Via l'interface Vercel**
1. Aller sur **Deployments**
2. Cliquer sur les 3 points `...` du dernier déploiement
3. Cliquer sur **Redeploy**
4. Confirmer

**Option 2: Via CLI**
```bash
vercel --prod
```

⚠️ **IMPORTANT**: Les modifications de variables d'environnement ne sont appliquées qu'après un redéploiement!

---

### 7️⃣ Tester (2 min)

**Test 1: Health Check**
```bash
curl https://votre-projet.vercel.app/api/health
```

**Réponse attendue:**
```json
{
  "status": "ok",
  "db": true,
  "timestamp": "2026-01-26T..."
}
```

**Si `"db": false`** → Problème DATABASE_URL, recommencer l'étape 2

**Test 2: Login Frontend**
1. Ouvrir votre application: https://votre-projet.vercel.app
2. Essayer de se connecter
3. Ouvrir la console (F12) pour voir les erreurs éventuelles

**Si erreur CORS** → Vérifier CORS_ORIGINS (étape 5)  
**Si erreur 500** → Vérifier JWT_SECRET (étape 3)

---

## 🔧 Outils de Diagnostic

**Test local de la configuration:**
```powershell
# Depuis la racine du projet
.\test-vercel-config.ps1 https://votre-projet.vercel.app
```

**Voir les logs Vercel en temps réel:**
```bash
vercel logs --follow
```

**Ou via l'interface:**
- Vercel Dashboard → **Deployments** → Cliquer sur le déploiement → **Functions** → Voir les logs

---

## 📚 Documentation Complète

- **Guide détaillé**: `VERCEL_PRODUCTION_CHECKLIST.md`
- **Troubleshooting DB**: `docs/TROUBLESHOOTING_DB.md`
- **Variables Vercel**: `docs/VERCEL_ENV_VARIABLES.md`

---

## 🆘 Si Ça Ne Fonctionne Toujours Pas

### Vérifier le statut Supabase
- https://status.supabase.com/
- Dashboard Supabase → Vérifier que le projet n'est pas "Paused"

### Vérifier les logs Vercel
```bash
vercel logs
```

**Logs à chercher:**
- `❌ Impossible de se connecter à la base de données`
- `❌ JWT_SECRET manquant`
- `❌ Configuration Cloudinary manquante`

### Tester la connexion DB depuis votre machine
```powershell
Test-NetConnection -ComputerName aws-1-eu-west-3.pooler.supabase.com -Port 6543
```

**Résultat attendu:**
```
TcpTestSucceeded : True ✅
```

---

## ✅ Checklist Finale

Avant de considérer le problème résolu:

- [ ] `DATABASE_URL` utilise `aws-1-eu-west-3.pooler.supabase.com:6543`
- [ ] `JWT_SECRET` existe (32+ caractères)
- [ ] `JWT_REFRESH_SECRET` existe (différent de JWT_SECRET)
- [ ] `CLOUDINARY_URL` existe et est valide
- [ ] `CORS_ORIGINS` contient l'URL exacte du frontend
- [ ] Toutes les variables sont pour l'environnement **Production**
- [ ] Redéploiement effectué
- [ ] `/api/health` retourne `"status": "ok"` et `"db": true`
- [ ] Login frontend fonctionne
- [ ] Pas d'erreurs dans les logs Vercel

---

## ⏱️ Temps Estimé

- Vérification variables: **5 min**
- Corrections: **10 min**
- Redéploiement: **3 min**
- Tests: **2 min**

**Total: ~20 minutes**

---

**Dernière mise à jour**: 2026-01-26  
**Priorité**: 🔴 CRITIQUE - À faire immédiatement
