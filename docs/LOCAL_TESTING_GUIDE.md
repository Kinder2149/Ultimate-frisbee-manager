# 🧪 Guide de Tests Locaux - Avant Production

**Objectif** : Tester l'application en local avec les services en ligne (Supabase, Cloudinary) pour valider avant déploiement Vercel.

---

## 📋 Prérequis

### Services en Ligne Requis
- ✅ **Supabase** : Base de données PostgreSQL
- ✅ **Cloudinary** : Stockage images
- ⚠️ **Backend local** : Port 3002
- ⚠️ **Frontend local** : Port 4200

---

## 🔧 Configuration Backend Local

### 1. Créer le fichier `.env`

```bash
# Depuis la racine du projet
cd backend
cp .env.example .env
```

### 2. Configurer les Variables d'Environnement

Éditer `backend/.env` avec vos vraies valeurs :

```bash
# 🗄 DATABASE (Supabase)
DATABASE_URL="postgresql://postgres:[VOTRE_PASSWORD]@db.rnreaaeiccqkwgwxwxeg.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

# 🔧 ENV
PORT=3002
NODE_ENV=development

# 🌐 CORS
CORS_ORIGINS="http://localhost:4200"

# ☁️ CLOUDINARY
CLOUDINARY_URL="cloudinary://[API_KEY]:[API_SECRET]@[CLOUD_NAME]"

# 🔐 AUTH (JWT)
JWT_SECRET="dev-secret-minimum-32-caracteres-pour-securite"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="dev-refresh-secret-minimum-32-caracteres"
JWT_REFRESH_EXPIRES_IN="30d"

# 🔗 SUPABASE
SUPABASE_PROJECT_REF="rnreaaeiccqkwgwxwxeg"

# 🛡 RATE LIMITING
RATE_LIMIT_ENABLED=false
```

### 3. Obtenir les Credentials

#### Supabase (DATABASE_URL)
1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Settings → Database → Connection string
4. Copier "Connection pooling" (avec pgBouncer)
5. Remplacer `[YOUR-PASSWORD]` par votre mot de passe

#### Cloudinary (CLOUDINARY_URL)
1. Aller sur https://cloudinary.com/console
2. Dashboard → Account Details
3. Copier "API Environment variable"
4. Format : `cloudinary://123456789012345:abcdefghijklmnopqrstuvwxyz@your-cloud-name`

---

## 🚀 Démarrage Backend

### 1. Installer les Dépendances

```bash
# Depuis la racine
npm install

# Build shared package
npm -w shared run build
```

### 2. Initialiser la Base de Données

```bash
cd backend

# Générer client Prisma
npm run db:generate

# Appliquer migrations
npm run db:migrate

# Seed données de test
npm run db:seed
```

**Résultat attendu** :
```
✅ Migrations appliquées
✅ Tags créés (objectifs, niveaux, etc.)
✅ Utilisateur admin créé
✅ Workspace par défaut créé
✅ Contenu minimal créé (1 exercice, 1 échauffement, 1 entraînement)
```

### 3. Démarrer le Serveur

```bash
npm run dev
```

**Résultat attendu** :
```
🚀 Server running on http://localhost:3002
✅ Database connected
✅ Cloudinary configured
```

---

## ✅ Tests Backend

### Test 1 : Health Check

```bash
# Dans un nouveau terminal
curl http://localhost:3002/api/health
```

**Résultat attendu** :
```json
{
  "status": "ok",
  "timestamp": "2026-01-24T12:00:00.000Z"
}
```

### Test 2 : Login Admin

```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ultimate.com",
    "password": "Ultim@t+"
  }'
```

**Résultat attendu** :
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "admin@ultimate.com",
    "nom": "Admin",
    "prenom": "Ultimate",
    "role": "ADMIN"
  }
}
```

**→ Copier le `accessToken` pour les tests suivants**

### Test 3 : Liste Exercices

```bash
# Remplacer [TOKEN] par votre accessToken
curl http://localhost:3002/api/exercises \
  -H "Authorization: Bearer [TOKEN]"
```

**Résultat attendu** :
```json
[
  {
    "id": "...",
    "nom": "Passes courtes en triangle",
    "description": "...",
    "tags": [...]
  }
]
```

### Test 4 : Upload Image (Cloudinary)

```bash
# Créer un fichier test
echo "test" > test.jpg

# Upload
curl -X POST http://localhost:3002/api/exercises \
  -H "Authorization: Bearer [TOKEN]" \
  -F "nom=Test Upload" \
  -F "description=Test" \
  -F "image=@test.jpg"
```

**Résultat attendu** :
```json
{
  "id": "...",
  "nom": "Test Upload",
  "imageUrl": "https://res.cloudinary.com/..."
}
```

---

## 🎨 Configuration Frontend Local

### 1. Vérifier `environment.ts`

```typescript
// frontend/src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3002/api', // ← Backend local
  supabaseUrl: 'https://rnreaaeiccqkwgwxwxeg.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // Clé publique
};
```

### 2. Démarrer le Frontend

```bash
# Depuis la racine
npm start

# Ou depuis frontend/
cd frontend
npm start
```

**Résultat attendu** :
```
✅ Application running at http://localhost:4200
✅ Compiled successfully
```

---

## ✅ Tests Frontend (Interface)

### Test 1 : Page de Login

1. Ouvrir http://localhost:4200
2. Vérifier redirection vers `/login`
3. Se connecter :
   - Email : `admin@ultimate.com`
   - Password : `Ultim@t+`

**Résultat attendu** :
- ✅ Redirection vers `/dashboard`
- ✅ Nom affiché en haut à droite
- ✅ Pas d'erreur console

### Test 2 : Dashboard

1. Vérifier affichage des statistiques
2. Vérifier chargement des données

**Résultat attendu** :
- ✅ Nombre d'exercices affiché
- ✅ Nombre d'entraînements affiché
- ✅ Graphiques chargés

### Test 3 : Liste Exercices

1. Aller sur `/exercices`
2. Vérifier affichage de la liste

**Résultat attendu** :
- ✅ Au moins 1 exercice affiché ("Passes courtes en triangle")
- ✅ Tags affichés
- ✅ Filtres fonctionnels

### Test 4 : Créer un Exercice

1. Cliquer "Ajouter un exercice"
2. Remplir le formulaire :
   - Nom : "Test Local"
   - Description : "Test avant production"
   - Tags : Sélectionner quelques tags
3. Sauvegarder

**Résultat attendu** :
- ✅ Exercice créé
- ✅ Redirection vers liste
- ✅ Nouvel exercice visible

### Test 5 : Upload Image (Cloudinary)

1. Modifier un exercice
2. Uploader une image
3. Sauvegarder

**Résultat attendu** :
- ✅ Image uploadée sur Cloudinary
- ✅ URL Cloudinary dans `imageUrl`
- ✅ Image affichée dans la liste

### Test 6 : Créer un Entraînement

1. Aller sur `/entrainements`
2. Créer un entraînement
3. Ajouter des exercices

**Résultat attendu** :
- ✅ Entraînement créé
- ✅ Exercices liés
- ✅ Ordre préservé

---

## 🔍 Vérifications Base de Données

### Via Supabase Dashboard

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Table Editor

**Vérifier** :
- ✅ Table `User` : Admin créé
- ✅ Table `Workspace` : Workspace par défaut
- ✅ Table `Tag` : Tags système créés
- ✅ Table `Exercice` : Exercices créés
- ✅ Table `Entrainement` : Entraînements créés

### Via Prisma Studio (Optionnel)

```bash
cd backend
npm run db:studio
```

Ouvre http://localhost:5555

---

## 📊 Checklist Complète de Tests

### Backend (API)
- [ ] Health check fonctionne
- [ ] Login admin fonctionne
- [ ] Token JWT généré
- [ ] Liste exercices fonctionne
- [ ] Création exercice fonctionne
- [ ] Upload image Cloudinary fonctionne
- [ ] Pas d'erreurs dans logs backend

### Frontend (Interface)
- [ ] Login fonctionne
- [ ] Dashboard affiche données
- [ ] Liste exercices fonctionne
- [ ] Filtres fonctionnent
- [ ] Création exercice fonctionne
- [ ] Upload image fonctionne
- [ ] Navigation fonctionne
- [ ] Pas d'erreurs console navigateur

### Base de Données (Supabase)
- [ ] Connexion établie
- [ ] Migrations appliquées
- [ ] Seeds exécutés
- [ ] Données visibles dans Supabase Dashboard
- [ ] Pas de timeout

### Images (Cloudinary)
- [ ] Upload fonctionne
- [ ] Images visibles sur Cloudinary Dashboard
- [ ] URLs générées correctement
- [ ] Images affichées dans l'app

---

## 🐛 Dépannage

### Erreur "Cannot reach database server"

**Cause** : `DATABASE_URL` incorrect ou Supabase inaccessible

**Solution** :
1. Vérifier `DATABASE_URL` dans `.env`
2. Tester connexion : `psql $DATABASE_URL`
3. Vérifier que Supabase est actif

### Erreur CORS

**Cause** : `CORS_ORIGINS` ne contient pas `http://localhost:4200`

**Solution** :
```bash
# backend/.env
CORS_ORIGINS="http://localhost:4200"
```

### Erreur "JWT_SECRET not defined"

**Cause** : `.env` non chargé

**Solution** :
1. Vérifier que `backend/.env` existe
2. Redémarrer le serveur backend

### Erreur Cloudinary

**Cause** : `CLOUDINARY_URL` incorrect

**Solution** :
1. Vérifier format : `cloudinary://key:secret@cloud_name`
2. Copier depuis Cloudinary Dashboard
3. Redémarrer backend

### Frontend ne charge pas les données

**Cause** : Backend non démarré ou URL incorrecte

**Solution** :
1. Vérifier backend sur http://localhost:3002/api/health
2. Vérifier `environment.ts` : `apiUrl: 'http://localhost:3002/api'`
3. Vérifier console navigateur (F12)

---

## ✅ Validation Finale

### Tous les Tests Passent ?

Si **tous les tests ci-dessus fonctionnent** :

✅ **Le projet est prêt pour la production !**

**Prochaine étape** : Déployer sur Vercel

Suivre `VERCEL_DEPLOYMENT_CHECKLIST.md`

---

## 📝 Notes Importantes

### Différences Local vs Production

| Aspect | Local | Production |
|--------|-------|------------|
| Backend | `localhost:3002` | `https://[projet].vercel.app` |
| Frontend | `localhost:4200` | `https://[projet].vercel.app` |
| NODE_ENV | `development` | `production` |
| Bypass Auth | Actif | Désactivé |
| Logs | Verbeux | Réduits |

### Données de Test

**Admin par défaut** :
- Email : `admin@ultimate.com`
- Password : `Ultim@t+`

**Contenu minimal** :
- 1 exercice : "Passes courtes en triangle"
- 1 échauffement : "Échauffement express"
- 1 entraînement : "Séance démo export"

---

**Dernière mise à jour** : 2026-01-24  
**Prêt pour tests** : ✅ OUI
