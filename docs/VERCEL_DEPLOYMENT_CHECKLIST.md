# ✅ Checklist Déploiement Vercel

## Avant le Déploiement

### 1. Configuration Vercel (vercel.json)
- [x] `NODE_ENV=production` défini dans `env`
- [x] `maxDuration: 30` pour Functions
- [x] `memory: 1024` pour Functions
- [x] Routes API configurées (`/api/*` → backend)
- [x] Routes frontend configurées (SPA fallback)

### 2. Variables d'Environnement Backend
Via dashboard Vercel ou CLI :

```bash
# Database
vercel env add DATABASE_URL production

# JWT Secrets
vercel env add JWT_SECRET production
vercel env add JWT_REFRESH_SECRET production

# Cloudinary
vercel env add CLOUDINARY_URL production

# CORS
vercel env add CORS_ORIGINS production
# Valeur: https://[votre-frontend].vercel.app

# Supabase
vercel env add SUPABASE_PROJECT_REF production
# Valeur: rnreaaeiccqkwgwxwxeg

# Rate Limiting (optionnel)
vercel env add RATE_LIMIT_ENABLED production
vercel env add RATE_LIMIT_MAX production
vercel env add RATE_LIMIT_WINDOW_MS production
```

### 3. Frontend - Mise à Jour environment.prod.ts
⚠️ **CRITIQUE** : Après déploiement backend

```typescript
// frontend/src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://[VOTRE-PROJET].vercel.app/api', // ← À METTRE À JOUR
  supabaseUrl: 'https://rnreaaeiccqkwgwxwxeg.supabase.co',
  supabaseKey: 'sb_publishable_5C5PlWrOG7Krvpo6YEQZMg_rEEuKzVw'
};
```

### 4. Build Shared Package
```bash
# S'assurer que shared est buildé
npm -w shared run build
```

---

## Déploiement

### Étape 1 : Déployer Backend
```bash
# Depuis la racine du projet
vercel --prod

# Ou via Git (recommandé)
git push origin main
# → Déploiement automatique via Vercel
```

### Étape 2 : Vérifier Backend
```bash
# Tester health endpoint
curl https://[VOTRE-PROJET].vercel.app/api/health

# Réponse attendue:
# {"status":"ok","timestamp":"..."}
```

### Étape 3 : Mettre à Jour Frontend
```typescript
// Modifier environment.prod.ts avec l'URL backend
apiUrl: 'https://[VOTRE-PROJET].vercel.app/api'
```

### Étape 4 : Commit et Déployer Frontend
```bash
git add frontend/src/environments/environment.prod.ts
git commit -m "feat: update production API URL"
git push origin main
```

---

## Vérifications Post-Déploiement

### Backend
- [ ] `/api/health` retourne 200 OK
- [ ] `/api/auth/login` fonctionne
- [ ] Connexion database OK (pas d'erreur Prisma)
- [ ] Logs Vercel sans erreurs critiques
- [ ] NODE_ENV=production (vérifier logs)

### Frontend
- [ ] Application charge correctement
- [ ] Login fonctionne
- [ ] API calls fonctionnent (pas d'erreur CORS)
- [ ] Images Cloudinary chargent
- [ ] Pas d'erreurs console navigateur

### Database
- [ ] Migrations appliquées (`npx prisma migrate deploy`)
- [ ] Connexion stable (pas de timeout)
- [ ] Données intactes

---

## Sécurité - PROB-018

### ✅ Vérifications NODE_ENV
Le fichier `vercel.json` définit explicitement :
```json
{
  "env": {
    "NODE_ENV": "production"
  }
}
```

### ⚠️ Bypass Dev Désactivé
Le middleware `auth.middleware.js` contient des bypass en développement :
```javascript
const isDev = String(process.env.NODE_ENV || '').toLowerCase() === 'development';
if (isDev && !token) {
  // Bypass auth en dev
}
```

**Vérification** : Avec `NODE_ENV=production`, ces bypass sont **automatiquement désactivés**.

### 🔒 Checklist Sécurité
- [x] `NODE_ENV=production` dans vercel.json
- [x] Bypass dev désactivés en production
- [x] JWT secrets forts (min 32 caractères)
- [x] CORS limité au domaine frontend
- [x] Rate limiting activé
- [ ] Secrets Vercel configurés (à faire au déploiement)

---

## Dépannage

### Erreur "Cannot reach database"
→ Vérifier `DATABASE_URL` dans Vercel env vars

### Erreur CORS
→ Vérifier `CORS_ORIGINS` inclut l'URL frontend exacte

### Erreur "JWT_SECRET not defined"
→ Configurer secrets dans Vercel dashboard

### Build Failed
→ Vérifier que `shared` est buildé avant backend/frontend

### Timeout 10s dépassé
→ Déjà résolu : `maxDuration: 30` dans vercel.json

---

## Rollback

Si problème critique :
```bash
# Via dashboard Vercel
# Deployments → Previous deployment → Promote to Production

# Ou via CLI
vercel rollback [deployment-url]
```

---

**Dernière mise à jour** : 2026-01-24  
**Status PROB-018** : ✅ RÉSOLU - NODE_ENV=production vérifié dans vercel.json
