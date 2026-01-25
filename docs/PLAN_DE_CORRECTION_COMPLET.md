# 📋 PLAN DE CORRECTION COMPLET - Ultimate Frisbee Manager

**Date** : 2026-01-25  
**Basé sur** : AUDIT_TECHNIQUE_COMPLET.md  
**Objectif** : Corriger tous les problèmes identifiés et préparer le déploiement Vercel

---

## 🔍 ANALYSE DU FICHIER .ENV ACTUEL

### Variables obsolètes identifiées (à supprimer)

#### ❌ Références à Render
```bash
# En production, les valeurs sont fournies par Render (secrets).
```
**Raison** : Migration vers Vercel en cours, Render n'est plus la cible

#### ❌ Variables de scripts inutilisées
```bash
SUPABASE_PROJECT_REF="rnreaaeiccqkwgwxwxeg"  # ✅ UTILISÉE (auth.middleware.js:99)
ADMIN_TOKEN=""                                # ❌ Scripts uniquement
API="http://localhost:3002/api"              # ❌ Doublon API_BASE_URL
API_BASE_URL="http://localhost:3002/api"     # ❌ Scripts uniquement
BACKEND_BASE_URL="http://localhost:3002"     # ❌ Scripts uniquement
ADMIN_EMAIL="admin@ultimate.com"             # ❌ Scripts uniquement
ADMIN_PASSWORD="CHANGE_ME_LOCALLY_ONLY"      # ❌ Scripts uniquement
FRONTEND_ORIGIN="http://localhost:4200"      # ❌ Scripts uniquement
IMPORT_TEST="false"                          # ❌ Scripts uniquement
UPLOAD_TEST_ENDPOINT="/api/exercices"        # ❌ Scripts uniquement
TEST_IMAGE_URL="https://via.placeholder.com/300" # ❌ Scripts uniquement
UPLOAD_BODY_FIELD="file"                     # ❌ Scripts uniquement
```

**Utilisation réelle** :
- `SUPABASE_PROJECT_REF` : **GARDÉE** (utilisée dans `auth.middleware.js:99` pour JWKS Supabase)
- Toutes les autres : Utilisées uniquement dans scripts de test (`postdeploy-check.js`, `import-ufm.js`)

### Variables à conserver (essentielles)

```bash
# ✅ ESSENTIELLES PRODUCTION
DATABASE_URL
PORT
NODE_ENV
CORS_ORIGINS
CLOUDINARY_URL
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
JWT_SECRET
JWT_EXPIRES_IN
JWT_REFRESH_SECRET
JWT_REFRESH_EXPIRES_IN
RATE_LIMIT_WINDOW_MS
RATE_LIMIT_MAX
RATE_LIMIT_ENABLED
SUPABASE_PROJECT_REF  # ✅ Utilisée pour auth Supabase
```

---

## 📊 FICHIERS AVEC RÉFÉRENCES RENDER À NETTOYER

### Backend

1. **backend/.env** (ligne 8)
   - ❌ `# En production, les valeurs sont fournies par Render (secrets).`
   - ✅ Remplacer par `# En production, les valeurs sont fournies par Vercel (variables d'environnement).`

2. **backend/.env.example** (ligne 8)
   - ❌ Même commentaire obsolète
   - ✅ Même correction

3. **backend/app.js** (ligne 9)
   - ❌ `// Behind Render/Cloudflare: trust proxy...`
   - ✅ Remplacer par `// Behind Vercel/Cloudflare: trust proxy...`

4. **backend/config/index.js** (ligne 8)
   - ❌ `// En production, ne pas override les variables fournies par la plateforme (Render)`
   - ✅ Remplacer par `// En production, ne pas override les variables fournies par Vercel`

5. **backend/scripts/prisma-baseline.js** (ligne 3)
   - ❌ `Script de baseline Prisma pour Render`
   - ✅ Remplacer par `Script de baseline Prisma pour Vercel`

### Frontend

6. **frontend/src/environments/environment.prod.ts** (ligne 10)
   - ❌ `apiUrl: 'https://ultimate-frisbee-manager-api.onrender.com/api'`
   - ✅ Remplacer par `apiUrl: 'https://[PROJET-VERCEL].vercel.app/api'`

7. **frontend/ENV_USAGE.md** (ligne 18, 35, 45, 75, 84, 101, 194)
   - ❌ Multiples références à `onrender.com`
   - ✅ Remplacer par URLs Vercel

8. **frontend/FRONTEND_ENV_STRATEGY.md** (lignes similaires)
   - ❌ Références Render
   - ✅ Mettre à jour documentation

### Fichiers à supprimer

9. **render.yaml** (si existe)
   - ❌ Configuration Render obsolète
   - ✅ Supprimer (remplacé par vercel.json)

---

## 🎯 PLAN DE CORRECTION DÉTAILLÉ

### PHASE 1 : NETTOYAGE ET PRÉPARATION (30 min)

#### 1.1 Nettoyer fichier .env et .env.example

**Fichier** : `backend/.env`

**Actions** :
1. Supprimer commentaire ligne 8 : `# En production, les valeurs sont fournies par Render (secrets).`
2. Remplacer par : `# En production, les valeurs sont fournies par Vercel (variables d'environnement).`
3. Supprimer toutes les variables de scripts (lignes 38-52) :
   ```bash
   # ❌ SUPPRIMER TOUT CE BLOC
   # 🌱 SEED & SCRIPTS (LOCAL/CI)
   SEED_DESTRUCTIVE=false
   API="http://localhost:3002/api"
   API_BASE_URL="http://localhost:3002/api"
   BACKEND_BASE_URL="http://localhost:3002"
   ADMIN_TOKEN=""
   ADMIN_EMAIL="admin@ultimate.com"
   ADMIN_PASSWORD="CHANGE_ME_LOCALLY_ONLY"
   FRONTEND_ORIGIN="http://localhost:4200"
   IMPORT_TEST="false"
   UPLOAD_TEST_ENDPOINT="/api/exercices"
   TEST_IMAGE_URL="https://via.placeholder.com/300"
   UPLOAD_BODY_FIELD="file"
   ```
4. Garder uniquement `SUPABASE_PROJECT_REF` (utilisée dans auth.middleware.js)

**Fichier** : `backend/.env.example`
- Appliquer les mêmes modifications

**Résultat attendu** : Fichiers .env allégés, uniquement variables essentielles

---

#### 1.2 Nettoyer références Render dans le code

**Fichier** : `backend/app.js:9`
```javascript
// ❌ AVANT
// Behind Render/Cloudflare: trust proxy to let Express use X-Forwarded-* correctly

// ✅ APRÈS
// Behind Vercel/Cloudflare: trust proxy to let Express use X-Forwarded-* correctly
```

**Fichier** : `backend/config/index.js:8`
```javascript
// ❌ AVANT
// En production, ne pas override les variables fournies par la plateforme (Render)

// ✅ APRÈS
// En production, ne pas override les variables fournies par Vercel
```

**Fichier** : `backend/scripts/prisma-baseline.js:3`
```javascript
// ❌ AVANT
/*
  Script de baseline Prisma pour Render

// ✅ APRÈS
/*
  Script de baseline Prisma pour Vercel
```

---

#### 1.3 Supprimer fichier render.yaml (si existe)

**Action** :
```bash
# Vérifier existence
ls render.yaml

# Si existe, supprimer
rm render.yaml
```

**Raison** : Configuration Render obsolète, remplacée par `vercel.json`

---

#### 1.4 Nettoyer dossier archive

**Action** :
```bash
# Supprimer ancien module trainings archivé
rm -rf archive/old_trainings_module/
```

**Raison** : Code archivé depuis novembre 2025, non utilisé

---

### PHASE 2 : CORRECTIONS BLOQUANTES (45 min)

#### 2.1 BLOQUANT-01 : Compiler package shared

**Commande** :
```bash
npm run build -w shared
```

**Vérification** :
```bash
ls shared/dist/
# Doit contenir : tag-categories.js, tag-categories.d.ts, tag-mapping.js, tag-mapping.d.ts
```

**Impact** : Débloque build frontend et backend

---

#### 2.2 BLOQUANT-02 : Mettre à jour environment.prod.ts

**Fichier** : `frontend/src/environments/environment.prod.ts`

```typescript
// ❌ AVANT
export const environment = {
  production: true,
  // TODO: Remplacer par l'URL Vercel après déploiement backend
  apiUrl: 'https://ultimate-frisbee-manager-api.onrender.com/api',
  supabaseUrl: 'https://rnreaaeiccqkwgwxwxeg.supabase.co',
  supabaseKey: 'sb_publishable_5C5PlWrOG7Krvpo6YEQZMg_rEEuKzVw'
};

// ✅ APRÈS
export const environment = {
  production: true,
  // URL Vercel Functions backend
  apiUrl: 'https://ultimate-frisbee-manager-kinder.vercel.app/api',
  supabaseUrl: 'https://rnreaaeiccqkwgwxwxeg.supabase.co',
  supabaseKey: 'sb_publishable_5C5PlWrOG7Krvpo6YEQZMg_rEEuKzVw'
};
```

**Note** : Ajuster l'URL Vercel selon le nom de projet réel après premier déploiement

---

#### 2.3 BLOQUANT-03 : Documenter variables Vercel requises

**Créer** : `docs/VERCEL_ENV_VARIABLES.md`

```markdown
# Variables d'environnement Vercel

## Backend (Vercel Functions)

À configurer dans : **Vercel Dashboard > Project Settings > Environment Variables**

### Production

```bash
DATABASE_URL=postgresql://postgres:PASSWORD@db.rnreaaeiccqkwgwxwxeg.supabase.co:5432/postgres
JWT_SECRET=<générer avec: openssl rand -base64 32>
JWT_REFRESH_SECRET=<générer avec: openssl rand -base64 32>
CLOUDINARY_URL=cloudinary://937631178698815:N4HlT6CFvZbnffM62qudAUc313g@dmiqnc2o6
CORS_ORIGINS=https://ultimate-frisbee-manager-kinder.vercel.app
NODE_ENV=production
SUPABASE_PROJECT_REF=rnreaaeiccqkwgwxwxeg
```

### Preview (optionnel)

Même configuration avec `NODE_ENV=development`
```

**Action utilisateur** : Configurer ces variables dans le dashboard Vercel avant déploiement

---

### PHASE 3 : CORRECTIONS QUALITÉ (60 min)

#### 3.1 Nettoyer console.log production

**Fichier** : `frontend/src/app/core/services/exercice.service.ts`

```typescript
// ❌ AVANT (ligne 36)
tap(list => console.log('Exercices reçus (liste):', list.map(e => ({ id: (e as any).id, nom: (e as any).nom, imageUrl: (e as any).imageUrl, legacy: { image: (e as any).image, picture: (e as any).picture } })))),

// ✅ APRÈS
// Supprimer complètement le tap avec console.log
map(list => list.map(ex => this.normalizeExercice(ex)))
```

```typescript
// ❌ AVANT (ligne 43)
tap(ex => console.log('Exercice reçu du backend:', ex)),

// ✅ APRÈS
// Supprimer complètement
map(ex => this.normalizeExercice(ex))
```

---

#### 3.2 Désactiver middleware debug

**Fichier** : `backend/routes/exercice.routes.js`

```javascript
// ❌ AVANT (lignes 20-32)
const logBody = (req, res, next) => {
  console.log('--- Contenu de req.body avant validation ---');
  console.dir(req.body, { depth: null });
  console.log('------------------------------------------');
  next();
};

router.post('/', 
  createUploader('image', 'exercices'), 
  transformFormData, 
  logBody, // ❌ Debug actif
  validate(createExerciceSchema),
  exerciceController.createExercice
);

// ✅ APRÈS
// Supprimer complètement logBody et son utilisation
router.post('/', 
  createUploader('image', 'exercices'), 
  transformFormData, 
  validate(createExerciceSchema),
  exerciceController.createExercice
);
```

**Même correction** pour `router.put('/:id', ...)` ligne 37

---

#### 3.3 Corriger spread operator dans routes

**Fichier** : `backend/routes/entrainement.routes.js`

**Vérifier d'abord** : `backend/middleware/upload.middleware.js`

Si `createUploader()` retourne un tableau :
```javascript
// ✅ CORRECT
router.post('/', 
  ...createUploader('image', 'entrainements'),  // Spread OK
  transformFormData, 
  validate(createEntrainementSchema), 
  entrainementController.createEntrainement
);
```

Si `createUploader()` retourne une fonction :
```javascript
// ✅ CORRIGER
router.post('/', 
  createUploader('image', 'entrainements'),  // Pas de spread
  transformFormData, 
  validate(createEntrainementSchema), 
  entrainementController.createEntrainement
);
```

**Action** : Vérifier signature de `createUploader()` et corriger si nécessaire

---

### PHASE 4 : MIGRATION ROUTES API (90 min)

#### 4.1 Migrer services frontend vers routes anglaises

**Fichiers à modifier** :

1. **frontend/src/app/core/services/exercice.service.ts:13**
```typescript
// ❌ AVANT
private endpoint = 'exercices';

// ✅ APRÈS
private endpoint = 'exercises';
```

2. **frontend/src/app/core/services/entrainement.service.ts:12**
```typescript
// ❌ AVANT
private endpoint = 'entrainements';

// ✅ APRÈS
private endpoint = 'trainings';
```

3. **frontend/src/app/core/services/echauffement.service.ts:12**
```typescript
// ❌ AVANT
private endpoint = 'echauffements';

// ✅ APRÈS
private endpoint = 'warmups';
```

4. **frontend/src/app/core/services/situationmatch.service.ts:12**
```typescript
// ❌ AVANT
private endpoint = 'situations-matchs';

// ✅ APRÈS
private endpoint = 'matches';
```

**Test après modification** :
```bash
cd frontend
npm start
# Vérifier que l'application fonctionne avec les nouveaux endpoints
```

---

#### 4.2 Supprimer routes françaises backend

**Fichier** : `backend/routes/index.js`

```javascript
// ❌ AVANT (lignes 55-59)
// Alias français pour rétrocompatibilité frontend
app.use('/api/exercices', authenticateToken, workspaceGuard, exerciceRoutes);
app.use('/api/entrainements', authenticateToken, workspaceGuard, entrainementRoutes);
app.use('/api/echauffements', authenticateToken, workspaceGuard, echauffementRoutes);
app.use('/api/situations-matchs', authenticateToken, workspaceGuard, situationMatchRoutes);

// ✅ APRÈS
// Supprimer complètement ces 4 lignes
```

**Mettre à jour** : Route d'accueil API (ligne 64-79)
```javascript
app.get('/api', (req, res) => {
  res.json({ 
    message: 'API Ultimate Frisbee Manager',
    version: '2.0.0',
    routes: {
      exercises: '/api/exercises',
      trainings: '/api/trainings',
      warmups: '/api/warmups',
      matches: '/api/matches',
      tags: '/api/tags',
      dashboard: '/api/dashboard',
      admin: '/api/admin',
      import: '/api/import',
      workspaces: '/api/workspaces'  // ✅ Ajouter
    }
  });
});
```

---

### PHASE 5 : NETTOYAGE DOCUMENTATION (30 min)

#### 5.1 Mettre à jour documentation frontend

**Fichier** : `frontend/ENV_USAGE.md`

Remplacer toutes les occurrences :
- ❌ `https://ultimate-frisbee-manager-api.onrender.com/api`
- ✅ `https://ultimate-frisbee-manager-kinder.vercel.app/api`

**Fichier** : `frontend/FRONTEND_ENV_STRATEGY.md`

Même remplacement

---

#### 5.2 Mettre à jour DEPLOIEMENT_VERCEL.md

**Fichier** : `docs/DEPLOIEMENT_VERCEL.md`

Vérifier que toutes les références Render sont supprimées et remplacées par Vercel

---

### PHASE 6 : TESTS ET VALIDATION (45 min)

#### 6.1 Tests locaux

**Backend** :
```bash
cd backend
npm run build:backend  # Compile shared
npm run dev            # Démarre serveur
```

**Vérifications** :
- ✅ Serveur démarre sans erreur
- ✅ Connexion DB OK
- ✅ Cloudinary ping OK
- ✅ Routes `/api/exercises`, `/api/trainings`, etc. répondent

**Frontend** :
```bash
cd frontend
npm start
```

**Vérifications** :
- ✅ Application démarre
- ✅ Login fonctionne
- ✅ CRUD exercices/entraînements fonctionnel
- ✅ Aucune erreur 404 sur routes API

---

#### 6.2 Build production

**Backend** :
```bash
npm run build:backend
```

**Frontend** :
```bash
npm run build:frontend
```

**Vérifications** :
- ✅ Build réussit sans erreur
- ✅ Dossier `frontend/dist/ultimate-frisbee-manager/` créé
- ✅ Dossier `shared/dist/` contient fichiers compilés

---

### PHASE 7 : PRÉPARATION DÉPLOIEMENT VERCEL (30 min)

#### 7.1 Vérifier vercel.json

**Fichier** : `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "frontend/dist/ultimate-frisbee-manager"
      }
    },
    {
      "src": "backend/server.js",
      "use": "@vercel/node",
      "config": {
        "maxDuration": 30,
        "memory": 1024
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/server.js",
      "headers": {
        "cache-control": "s-maxage=0"
      }
    },
    {
      "src": "/(.*\\.[^/]+)$",
      "dest": "/$1"
    },
    {
      "src": "/.*",
      "dest": "/index.html"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "backend/server.js": {
      "maxDuration": 30,
      "memory": 1024
    }
  }
}
```

**Vérification** : ✅ Configuration correcte

---

#### 7.2 Créer checklist déploiement

**Fichier** : `docs/CHECKLIST_DEPLOIEMENT_VERCEL.md`

```markdown
# Checklist Déploiement Vercel

## Avant déploiement

- [ ] Package shared compilé (`npm run build -w shared`)
- [ ] Tests locaux passants (backend + frontend)
- [ ] Build production réussi (`npm run build`)
- [ ] Fichier .env nettoyé (pas de variables obsolètes)
- [ ] environment.prod.ts mis à jour avec URL Vercel
- [ ] Console.log supprimés
- [ ] Routes API migrées vers anglais
- [ ] Documentation à jour

## Configuration Vercel

### 1. Variables d'environnement

Dans **Vercel Dashboard > Project Settings > Environment Variables**, ajouter :

**Production** :
- [ ] DATABASE_URL
- [ ] JWT_SECRET
- [ ] JWT_REFRESH_SECRET
- [ ] CLOUDINARY_URL
- [ ] CORS_ORIGINS
- [ ] NODE_ENV=production
- [ ] SUPABASE_PROJECT_REF

### 2. Build Settings

- [ ] Framework Preset: Other
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `frontend/dist/ultimate-frisbee-manager`
- [ ] Install Command: `npm install`

### 3. Déploiement

- [ ] Push sur branche `function`
- [ ] Vercel déploie automatiquement
- [ ] Vérifier logs de build
- [ ] Tester URL preview

## Après déploiement

- [ ] Health check: `curl https://[projet].vercel.app/api/health`
- [ ] Login fonctionne
- [ ] CRUD exercices fonctionne
- [ ] Upload images fonctionne
- [ ] Workspaces fonctionnent
- [ ] Pas d'erreurs dans console navigateur
- [ ] Pas d'erreurs dans logs Vercel

## En cas d'erreur

1. Vérifier logs Vercel: `vercel logs --follow`
2. Vérifier variables d'environnement
3. Vérifier CORS_ORIGINS
4. Vérifier DATABASE_URL
```

---

## 📊 RÉCAPITULATIF DES MODIFICATIONS

### Fichiers à modifier

| Fichier | Action | Priorité |
|---------|--------|----------|
| `backend/.env` | Nettoyer variables obsolètes + commentaire Render | 🔴 Critique |
| `backend/.env.example` | Nettoyer variables obsolètes + commentaire Render | 🔴 Critique |
| `backend/app.js:9` | Render → Vercel | 🟡 Amélioration |
| `backend/config/index.js:8` | Render → Vercel | 🟡 Amélioration |
| `backend/scripts/prisma-baseline.js:3` | Render → Vercel | 🟡 Amélioration |
| `backend/routes/exercice.routes.js` | Supprimer logBody | 🟠 Important |
| `backend/routes/entrainement.routes.js` | Vérifier spread operator | 🟠 Important |
| `backend/routes/index.js:55-59` | Supprimer routes françaises | 🟠 Important |
| `frontend/src/environments/environment.prod.ts:10` | Render → Vercel URL | 🔴 Critique |
| `frontend/src/app/core/services/exercice.service.ts` | Supprimer console.log + endpoint anglais | 🟠 Important |
| `frontend/src/app/core/services/entrainement.service.ts` | Endpoint anglais | 🟠 Important |
| `frontend/src/app/core/services/echauffement.service.ts` | Endpoint anglais | 🟠 Important |
| `frontend/src/app/core/services/situationmatch.service.ts` | Endpoint anglais | 🟠 Important |
| `frontend/ENV_USAGE.md` | Render → Vercel | 🟡 Amélioration |
| `frontend/FRONTEND_ENV_STRATEGY.md` | Render → Vercel | 🟡 Amélioration |

### Fichiers à créer

| Fichier | Contenu | Priorité |
|---------|---------|----------|
| `docs/VERCEL_ENV_VARIABLES.md` | Variables requises Vercel | 🔴 Critique |
| `docs/CHECKLIST_DEPLOIEMENT_VERCEL.md` | Checklist déploiement | 🟠 Important |

### Fichiers à supprimer

| Fichier | Raison | Priorité |
|---------|--------|----------|
| `render.yaml` (si existe) | Configuration obsolète | 🟡 Amélioration |
| `archive/old_trainings_module/` | Code archivé non utilisé | 🟡 Amélioration |

### Commandes à exécuter

| Commande | Objectif | Priorité |
|----------|----------|----------|
| `npm run build -w shared` | Compiler package shared | 🔴 Critique |
| `npm run build` | Build production | 🔴 Critique |
| `npm test` (backend) | Vérifier tests | 🟠 Important |

---

## ⏱️ ESTIMATION TEMPS TOTAL

- **Phase 1** : Nettoyage et préparation → 30 min
- **Phase 2** : Corrections bloquantes → 45 min
- **Phase 3** : Corrections qualité → 60 min
- **Phase 4** : Migration routes API → 90 min
- **Phase 5** : Nettoyage documentation → 30 min
- **Phase 6** : Tests et validation → 45 min
- **Phase 7** : Préparation déploiement → 30 min

**TOTAL** : ~5h30

---

## 🎯 ORDRE D'EXÉCUTION RECOMMANDÉ

### Jour 1 : Corrections critiques (2h)

1. ✅ Nettoyer .env et .env.example
2. ✅ Compiler package shared
3. ✅ Mettre à jour environment.prod.ts
4. ✅ Créer VERCEL_ENV_VARIABLES.md
5. ✅ Nettoyer références Render dans code

### Jour 2 : Migration API et qualité (3h)

6. ✅ Migrer services frontend vers routes anglaises
7. ✅ Tester localement
8. ✅ Supprimer routes françaises backend
9. ✅ Nettoyer console.log
10. ✅ Désactiver middleware debug
11. ✅ Corriger spread operator

### Jour 3 : Documentation et déploiement (30min + déploiement)

12. ✅ Mettre à jour documentation
13. ✅ Créer checklist déploiement
14. ✅ Build production
15. ✅ Configurer Vercel
16. ✅ Déployer

---

## 🚨 POINTS D'ATTENTION

### Variables .env à NE PAS supprimer

- ✅ **SUPABASE_PROJECT_REF** : Utilisée dans `auth.middleware.js:99` pour JWKS Supabase

### Variables .env à supprimer

- ❌ Toutes les variables de scripts (ADMIN_TOKEN, API, API_BASE_URL, etc.)
- ❌ Sauf si vous utilisez régulièrement les scripts de test

### Après migration routes API

- ⚠️ Tester TOUTES les fonctionnalités frontend
- ⚠️ Vérifier qu'aucune route 404
- ⚠️ Ne supprimer routes françaises backend qu'APRÈS validation frontend

### URL Vercel

- ⚠️ L'URL exacte sera connue après premier déploiement
- ⚠️ Peut nécessiter un ajustement de `environment.prod.ts` après déploiement
- ⚠️ Mettre à jour `CORS_ORIGINS` avec l'URL finale

---

## ✅ VALIDATION FINALE

Avant de considérer les corrections terminées :

- [ ] Tous les fichiers modifiés
- [ ] Package shared compilé
- [ ] Tests locaux passants
- [ ] Build production réussi
- [ ] Documentation à jour
- [ ] Checklist déploiement créée
- [ ] Variables Vercel documentées
- [ ] Aucune référence Render restante
- [ ] Routes API migrées vers anglais
- [ ] Console.log supprimés

---

**Fin du plan de correction complet**  
**Prêt pour exécution** ✅
