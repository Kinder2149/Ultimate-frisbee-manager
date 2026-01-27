# ✅ Checklist de vérification Vercel - Production

**Date**: 2026-01-26  
**Problème**: Erreurs 500/503 en production après déploiement

---

## 🔴 PROBLÈMES IDENTIFIÉS

### Erreurs constatées
- ❌ **500** sur `/api/auth/login` - Erreur serveur lors de la connexion
- ❌ **503** sur `/api/health` - Service indisponible (DB inaccessible)
- ❌ **401** sur `/api/workspaces/me` et `/api/auth/profile` - Non autorisé

### Cause racine probable
**La base de données n'est pas accessible en production**, ce qui provoque l'échec en cascade de toutes les requêtes.

---

## 📋 VARIABLES D'ENVIRONNEMENT À VÉRIFIER

### 1. DATABASE_URL ⚠️ CRITIQUE

**Vérifier dans Vercel Dashboard → Settings → Environment Variables**

```bash
# ✅ FORMAT CORRECT (Transaction mode - Port 6543)
DATABASE_URL=postgresql://postgres.rnreaaeiccqkwgwxwxeg:[PASSWORD]@aws-1-eu-west-3.pooler.supabase.com:6543/postgres

# ❌ FORMAT INCORRECT (URL directe - NE PAS UTILISER)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.rnreaaeiccqkwgwxwxeg.supabase.co:5432/postgres
```

**Points de vérification:**
- [ ] L'URL utilise `aws-1-eu-west-3.pooler.supabase.com` (pas `db.rnreaaeiccqkwgwxwxeg.supabase.co`)
- [ ] Le port est **6543** (Transaction mode pour production)
- [ ] Le mot de passe est correctement encodé (caractères spéciaux: `@` → `%40`)
- [ ] La variable est définie pour l'environnement **Production**

**Où trouver la bonne URL:**
1. Aller sur https://supabase.com/dashboard/project/rnreaaeiccqkwgwxwxeg
2. **Settings** → **Database**
3. **Connection Pooling** → Onglet **"Transaction mode"**
4. Copier l'URL complète
5. Remplacer `[YOUR-PASSWORD]` par votre mot de passe

---

### 2. JWT_SECRET ⚠️ CRITIQUE

```bash
JWT_SECRET=<secret-de-32-caracteres-minimum>
```

**Points de vérification:**
- [ ] La variable existe dans Vercel
- [ ] Le secret fait au moins 32 caractères
- [ ] Le secret est différent de celui du développement local
- [ ] La variable est définie pour l'environnement **Production**

**Générer un nouveau secret (si nécessaire):**
```powershell
# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

---

### 3. JWT_REFRESH_SECRET ⚠️ CRITIQUE

```bash
JWT_REFRESH_SECRET=<secret-different-de-JWT_SECRET>
```

**Points de vérification:**
- [ ] La variable existe dans Vercel
- [ ] Le secret fait au moins 32 caractères
- [ ] Le secret est **différent** de `JWT_SECRET`
- [ ] La variable est définie pour l'environnement **Production**

---

### 4. CLOUDINARY_URL ⚠️ CRITIQUE

```bash
CLOUDINARY_URL=cloudinary://937631178698815:N4HlT6CFvZbnffM62qudAUc313g@dmiqnc2o6
```

**Points de vérification:**
- [ ] La variable existe dans Vercel
- [ ] Le format est `cloudinary://API_KEY:API_SECRET@CLOUD_NAME`
- [ ] Les credentials sont corrects (testés en local)
- [ ] La variable est définie pour l'environnement **Production**

**Où trouver l'URL:**
1. Aller sur https://cloudinary.com/console
2. **Account Details** → Copier "API Environment variable"

---

### 5. CORS_ORIGINS ⚠️ IMPORTANT

```bash
# Production
CORS_ORIGINS=https://ultimate-frisbee-manager.vercel.app

# Ou avec votre domaine personnalisé
CORS_ORIGINS=https://ultimate-frisbee-manager-kinder.vercel.app
```

**Points de vérification:**
- [ ] La variable existe dans Vercel
- [ ] L'URL correspond exactement à l'URL de votre frontend Vercel
- [ ] Pas d'espace avant/après l'URL
- [ ] La variable est définie pour l'environnement **Production**

**Trouver l'URL exacte:**
- Vercel Dashboard → Votre projet → **Deployments** → Cliquer sur le dernier déploiement → Copier l'URL

---

### 6. NODE_ENV (Optionnel)

```bash
NODE_ENV=production
```

**Note:** Déjà défini dans `vercel.json`, mais peut être surchargé dans les variables d'environnement.

---

### 7. SUPABASE_PROJECT_REF (Optionnel)

```bash
SUPABASE_PROJECT_REF=rnreaaeiccqkwgwxwxeg
```

---

## 🔧 PROCÉDURE DE CORRECTION

### Étape 1: Vérifier les variables existantes

1. Aller sur **Vercel Dashboard**
2. Sélectionner votre projet
3. **Settings** → **Environment Variables**
4. Vérifier que TOUTES les variables critiques sont présentes

### Étape 2: Corriger DATABASE_URL

**Si la variable utilise l'URL directe Supabase:**

1. Aller sur Supabase Dashboard
2. Settings → Database → Connection Pooling → **Transaction mode**
3. Copier l'URL avec le pooler (port 6543)
4. Dans Vercel: Éditer `DATABASE_URL`
5. Coller la nouvelle URL
6. Sauvegarder

### Étape 3: Vérifier les secrets JWT

**Si les variables n'existent pas:**

1. Générer deux secrets différents (voir commande PowerShell ci-dessus)
2. Ajouter `JWT_SECRET` dans Vercel
3. Ajouter `JWT_REFRESH_SECRET` dans Vercel
4. Environnement: **Production**

### Étape 4: Vérifier Cloudinary

1. Vérifier que `CLOUDINARY_URL` existe
2. Tester la connexion en local avec cette URL
3. Si erreur: régénérer les credentials sur Cloudinary

### Étape 5: Corriger CORS_ORIGINS

1. Noter l'URL exacte de votre déploiement Vercel
2. Mettre à jour `CORS_ORIGINS` avec cette URL
3. Format: `https://votre-projet.vercel.app` (sans slash final)

### Étape 6: Redéployer

**Après avoir modifié les variables d'environnement:**

```bash
# Option 1: Via l'interface Vercel
Deployments → Redeploy (bouton "...")

# Option 2: Via CLI
vercel --prod
```

---

## 🧪 TESTS APRÈS CORRECTION

### 1. Test Health Check

```bash
curl https://ultimate-frisbee-manager.vercel.app/api/health
```

**Réponse attendue:**
```json
{
  "status": "ok",
  "db": true,
  "timestamp": "2026-01-26T...",
  "uptime": 123.45
}
```

**Si `"db": false` ou `"status": "degraded"`:**
→ Problème de connexion DATABASE_URL

### 2. Test Login

1. Ouvrir le frontend: https://ultimate-frisbee-manager.vercel.app
2. Essayer de se connecter avec un compte existant
3. Vérifier la console du navigateur (F12)

**Erreurs possibles:**
- **CORS error**: Vérifier `CORS_ORIGINS`
- **500 error**: Vérifier `DATABASE_URL` et `JWT_SECRET`
- **401 error**: Token invalide, vérifier `JWT_SECRET`

### 3. Vérifier les logs Vercel

```bash
# Via CLI
vercel logs --follow

# Ou via Dashboard
Deployments → Cliquer sur le déploiement → Functions → Voir les logs
```

**Logs à surveiller:**
```
✅ [Startup] DB target => host: aws-1-eu-west-3.pooler.supabase.com port: 6543
✅ Connexion à la base de données établie.
✅ Cloudinary connecté (api.ping).
```

**Logs d'erreur:**
```
❌ Impossible de se connecter à la base de données au démarrage.
❌ JWT_SECRET manquant.
❌ Configuration Cloudinary manquante ou incomplète.
```

---

## 🆘 DÉPANNAGE AVANCÉ

### Problème: DATABASE_URL correcte mais toujours 503

**Causes possibles:**
1. Base de données Supabase en pause
2. Limite de connexions atteinte
3. Firewall Supabase

**Solutions:**
1. Vérifier statut: https://status.supabase.com/
2. Dashboard Supabase → Vérifier que le projet n'est pas "Paused"
3. Tester connexion depuis un autre environnement

### Problème: CORS errors persistantes

**Solution:**
1. Vérifier l'URL exacte du frontend (avec/sans www, http/https)
2. Ajouter plusieurs origines si nécessaire:
   ```bash
   CORS_ORIGINS=https://ultimate-frisbee-manager.vercel.app,https://ultimate-frisbee-manager-kinder.vercel.app
   ```

### Problème: JWT errors après login

**Solution:**
1. Vérifier que `JWT_SECRET` est identique entre tous les déploiements
2. Vider le localStorage du navigateur
3. Régénérer un nouveau `JWT_SECRET` et redéployer

---

## 📝 CHECKLIST FINALE

Avant de considérer le problème résolu:

- [ ] `DATABASE_URL` utilise le pooler Supabase (port 6543)
- [ ] `JWT_SECRET` existe et fait 32+ caractères
- [ ] `JWT_REFRESH_SECRET` existe et est différent de `JWT_SECRET`
- [ ] `CLOUDINARY_URL` existe et est valide
- [ ] `CORS_ORIGINS` contient l'URL exacte du frontend
- [ ] Toutes les variables sont définies pour l'environnement **Production**
- [ ] Redéploiement effectué après modifications
- [ ] `/api/health` retourne `"status": "ok"` et `"db": true`
- [ ] Login frontend fonctionne sans erreur
- [ ] Logs Vercel ne montrent pas d'erreurs de connexion DB

---

## 📚 RESSOURCES

- [Documentation Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Troubleshooting DB local](./docs/TROUBLESHOOTING_DB.md)
- [Variables Vercel détaillées](./docs/VERCEL_ENV_VARIABLES.md)

---

**Dernière mise à jour**: 2026-01-26  
**Statut**: En cours de résolution
