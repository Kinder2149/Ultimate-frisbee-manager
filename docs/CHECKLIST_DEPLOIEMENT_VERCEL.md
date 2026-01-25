# ✅ Checklist Déploiement Vercel - Ultimate Frisbee Manager

**Date** : 2026-01-25  
**Version** : 2.0.0  
**Infrastructure** : Vercel Functions (Backend) + Vercel Static (Frontend)

---

## 📋 AVANT LE DÉPLOIEMENT

### 1. Vérifications locales

- [x] Package shared compilé (`npm run build -w shared`)
- [x] Build production réussi (`npm run build`)
- [x] Aucune erreur bloquante dans le build
- [x] Fichier `.env.example` à jour
- [x] Documentation mise à jour (Render → Vercel)
- [ ] Tests backend passants (`cd backend && npm test`)
- [ ] Tests frontend passants (`cd frontend && npm test`)

### 2. Code nettoyé

- [x] Console.log supprimés (production)
- [x] Middleware debug désactivé
- [x] Routes API migrées vers anglais
- [x] Routes françaises supprimées du backend
- [x] Références Render supprimées
- [x] `environment.prod.ts` mis à jour avec URL Vercel

### 3. Fichiers critiques

- [x] `shared/dist/` contient fichiers compilés
- [x] `vercel.json` configuré correctement
- [x] `backend/.env.example` à jour
- [x] `frontend/src/environments/environment.prod.ts` à jour

---

## 🔧 CONFIGURATION VERCEL

### 1. Variables d'environnement Backend

**Localisation** : Vercel Dashboard → Projet → Settings → Environment Variables

#### Production (obligatoires)

```bash
DATABASE_URL=postgresql://postgres:PASSWORD@db.rnreaaeiccqkwgwxwxeg.supabase.co:5432/postgres
JWT_SECRET=<générer: openssl rand -base64 32>
JWT_REFRESH_SECRET=<générer: openssl rand -base64 32>
CLOUDINARY_URL=cloudinary://937631178698815:N4HlT6CFvZbnffM62qudAUc313g@dmiqnc2o6
CORS_ORIGINS=https://ultimate-frisbee-manager-kinder.vercel.app
NODE_ENV=production
SUPABASE_PROJECT_REF=rnreaaeiccqkwgwxwxeg
```

**Checklist variables** :
- [ ] `DATABASE_URL` définie
- [ ] `JWT_SECRET` défini (32+ caractères)
- [ ] `JWT_REFRESH_SECRET` défini (32+ caractères, différent de JWT_SECRET)
- [ ] `CLOUDINARY_URL` définie
- [ ] `CORS_ORIGINS` défini avec URL frontend exacte
- [ ] `NODE_ENV=production` défini
- [ ] `SUPABASE_PROJECT_REF` défini

#### Preview (optionnel)

Même configuration avec :
- `NODE_ENV=development`
- `CORS_ORIGINS` incluant `*.vercel.app`

### 2. Build Settings

**Framework Preset** : Other

**Build Command** :
```bash
npm run build
```

**Output Directory** :
```
frontend/dist/ultimate-frisbee-manager
```

**Install Command** :
```bash
npm install
```

**Node Version** : 20.x

**Checklist Build Settings** :
- [ ] Framework Preset = Other
- [ ] Build Command = `npm run build`
- [ ] Output Directory = `frontend/dist/ultimate-frisbee-manager`
- [ ] Install Command = `npm install`
- [ ] Node Version = 20.x

### 3. Domaine et DNS

- [ ] Domaine Vercel attribué (ex: `ultimate-frisbee-manager-kinder.vercel.app`)
- [ ] Domaine personnalisé configuré (optionnel)
- [ ] Certificat SSL actif (automatique Vercel)

---

## 🚀 DÉPLOIEMENT

### 1. Premier déploiement

```bash
# Option 1 : Via Git (recommandé)
git add .
git commit -m "feat: migration Vercel complète"
git push origin function

# Option 2 : Via CLI Vercel
vercel --prod
```

**Checklist déploiement** :
- [ ] Code pushé sur branche `function`
- [ ] Vercel détecte automatiquement le push
- [ ] Build démarre dans Vercel Dashboard
- [ ] Logs de build consultables

### 2. Surveillance du build

**Vérifier dans Vercel Dashboard** :
- [ ] Build en cours visible
- [ ] Aucune erreur dans les logs
- [ ] Package shared compilé correctement
- [ ] Frontend buildé sans erreur
- [ ] Backend serverless déployé

**Logs à surveiller** :
```bash
# Via CLI
vercel logs --follow

# Ou dans Dashboard : Deployments → [Dernier déploiement] → Logs
```

### 3. Vérification post-déploiement

**URL déployée** : `https://[projet].vercel.app`

- [ ] URL frontend accessible
- [ ] Page d'accueil charge correctement
- [ ] Aucune erreur 404 sur assets
- [ ] Aucune erreur console navigateur

---

## 🧪 TESTS POST-DÉPLOIEMENT

### 1. Backend API

**Health Check** :
```bash
curl https://[projet].vercel.app/api/health
```

**Réponse attendue** :
```json
{
  "status": "ok",
  "timestamp": "2026-01-25T...",
  "uptime": 123,
  "environment": "production"
}
```

**Checklist Backend** :
- [ ] `/api/health` répond 200
- [ ] `/api` liste les routes disponibles
- [ ] Connexion DB fonctionne
- [ ] Cloudinary ping OK

### 2. Frontend

**Pages à tester** :
- [ ] `/` - Page d'accueil
- [ ] `/login` - Page de connexion
- [ ] `/dashboard` - Dashboard (après login)
- [ ] `/exercises` - Liste exercices
- [ ] `/trainings` - Liste entraînements
- [ ] `/warmups` - Liste échauffements
- [ ] `/matches` - Liste situations match

**Fonctionnalités critiques** :
- [ ] Login fonctionne (admin@ultimate.com)
- [ ] Création exercice fonctionne
- [ ] Upload image fonctionne
- [ ] CRUD complet exercices
- [ ] CRUD complet entraînements
- [ ] Workspaces fonctionnent
- [ ] Logout fonctionne

### 3. Routes API (nouvelles routes anglaises)

**Tester avec token JWT** :
```bash
# Login
curl -X POST https://[projet].vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ultimate.com","password":"Ultim@t+"}'

# Utiliser le token reçu
TOKEN="<access_token>"

# Tester routes anglaises
curl https://[projet].vercel.app/api/exercises \
  -H "Authorization: Bearer $TOKEN"

curl https://[projet].vercel.app/api/trainings \
  -H "Authorization: Bearer $TOKEN"

curl https://[projet].vercel.app/api/warmups \
  -H "Authorization: Bearer $TOKEN"

curl https://[projet].vercel.app/api/matches \
  -H "Authorization: Bearer $TOKEN"
```

**Checklist routes API** :
- [ ] `/api/exercises` fonctionne
- [ ] `/api/trainings` fonctionne
- [ ] `/api/warmups` fonctionne
- [ ] `/api/matches` fonctionne
- [ ] `/api/tags` fonctionne
- [ ] `/api/workspaces` fonctionne
- [ ] Routes françaises retournent 404 (supprimées)

---

## 🔍 VÉRIFICATIONS SÉCURITÉ

### 1. CORS

**Tester depuis navigateur** :
- [ ] Requêtes frontend → backend fonctionnent
- [ ] Aucune erreur CORS dans console
- [ ] `CORS_ORIGINS` contient URL frontend exacte

**Si erreur CORS** :
1. Vérifier `CORS_ORIGINS` dans Vercel
2. Ajouter URL frontend exacte
3. Redéployer

### 2. Authentification

- [ ] Routes protégées retournent 401 sans token
- [ ] Token JWT valide donne accès
- [ ] Refresh token fonctionne
- [ ] Logout invalide le token

### 3. Rate Limiting

- [ ] Rate limiting actif sur `/api/auth/login`
- [ ] Limite : 5 tentatives / 15 min
- [ ] Message d'erreur clair si dépassé

---

## 📊 MONITORING

### 1. Logs Vercel

**Accès** : Dashboard → Deployments → [Déploiement] → Logs

**Ou via CLI** :
```bash
vercel logs --follow
vercel logs backend/server.js
```

**À surveiller** :
- [ ] Aucune erreur 500
- [ ] Aucun timeout (< 30s)
- [ ] Connexions DB stables
- [ ] Uploads Cloudinary OK

### 2. Performance

**Métriques à vérifier** :
- [ ] Temps de réponse API < 2s
- [ ] Cold start < 3s
- [ ] Taille bundle frontend acceptable (< 2 MB)
- [ ] Lighthouse score > 80

### 3. Erreurs courantes

**Si erreur "Function timeout"** :
- Vérifier requêtes DB (optimisation)
- Ajouter indexes si nécessaire
- Paginer les résultats

**Si erreur "DATABASE_URL not found"** :
- Vérifier variable dans Vercel
- Redéployer après ajout

**Si erreur CORS** :
- Mettre à jour `CORS_ORIGINS`
- Inclure URL exacte du frontend

---

## 🔄 MISE À JOUR CORS_ORIGINS

**IMPORTANT** : Après le premier déploiement, vérifier l'URL exacte du frontend.

**Si URL différente de prévue** :
1. Noter l'URL réelle : `https://[projet-reel].vercel.app`
2. Mettre à jour `CORS_ORIGINS` dans Vercel
3. Redéployer backend

**Commande** :
```bash
vercel env add CORS_ORIGINS production
# Entrer : https://[projet-reel].vercel.app
```

---

## 📝 POST-DÉPLOIEMENT

### 1. Documentation

- [ ] Mettre à jour `README.md` avec URL production
- [ ] Mettre à jour `environment.prod.ts` si URL différente
- [ ] Documenter variables Vercel dans `VERCEL_ENV_VARIABLES.md`
- [ ] Créer seed utilisateur admin si nécessaire

### 2. Communication

- [ ] Informer équipe du déploiement
- [ ] Partager URL production
- [ ] Partager credentials admin (sécurisé)
- [ ] Documenter procédure de déploiement

### 3. Sauvegarde

- [ ] Backup base de données avant migration
- [ ] Exporter données critiques
- [ ] Tester restauration backup

---

## 🆘 ROLLBACK

**Si problème critique en production** :

### Option 1 : Rollback Vercel

1. Dashboard → Deployments
2. Sélectionner déploiement précédent stable
3. Cliquer "Promote to Production"

### Option 2 : Revert Git

```bash
git revert HEAD
git push origin function
```

### Option 3 : Redéployer branche stable

```bash
git checkout master
git push origin master --force
```

---

## ✅ VALIDATION FINALE

**Avant de considérer le déploiement réussi** :

### Backend
- [ ] Health check OK
- [ ] Toutes les routes API répondent
- [ ] Connexion DB stable
- [ ] Cloudinary fonctionne
- [ ] Logs sans erreur

### Frontend
- [ ] Application accessible
- [ ] Login fonctionne
- [ ] CRUD complet fonctionne
- [ ] Upload images OK
- [ ] Aucune erreur console

### Sécurité
- [ ] CORS configuré correctement
- [ ] Authentification fonctionne
- [ ] Rate limiting actif
- [ ] Variables sensibles sécurisées

### Performance
- [ ] Temps de réponse < 2s
- [ ] Pas de timeout
- [ ] Bundle size acceptable

---

## 📚 RESSOURCES

- [Documentation Vercel](https://vercel.com/docs)
- [Vercel Functions](https://vercel.com/docs/functions)
- [Variables d'environnement](./VERCEL_ENV_VARIABLES.md)
- [Guide de référence](./BASE/REFERENCE_GUIDE.md)
- [Audit complet](./AUDIT_TECHNIQUE_COMPLET.md)
- [Plan de correction](./PLAN_DE_CORRECTION_COMPLET.md)

---

## 🎯 PROCHAINES ÉTAPES

Après déploiement réussi :

1. **Monitoring** : Surveiller logs pendant 24-48h
2. **Optimisation** : Analyser performance et optimiser si nécessaire
3. **Tests utilisateurs** : Faire tester par utilisateurs réels
4. **Documentation** : Compléter documentation utilisateur
5. **CI/CD** : Mettre en place pipeline automatisé

---

**Dernière mise à jour** : 2026-01-25  
**Statut** : Prêt pour déploiement ✅
