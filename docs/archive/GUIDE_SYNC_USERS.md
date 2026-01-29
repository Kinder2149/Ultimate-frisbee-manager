# 🔄 Guide de Synchronisation des Utilisateurs Supabase → PostgreSQL

## 🎯 Problème

Vous avez **3 utilisateurs dans Supabase Auth** mais seulement **2 utilisateurs dans votre application PostgreSQL**.

**Pourquoi ?** Quand un utilisateur s'inscrit via Supabase, il est créé dans Supabase Auth, mais le profil backend dans PostgreSQL n'est créé que si la route `/api/auth/register` est appelée avec succès. Si cette étape échoue, l'utilisateur existe dans Supabase mais pas dans votre base.

---

## ✅ Solution : Script de Synchronisation

Un script `backend/scripts/sync-supabase-users.js` existe pour synchroniser automatiquement les utilisateurs.

### Ce que fait le script :

1. ✅ Récupère tous les utilisateurs de Supabase Auth
2. ✅ Récupère tous les utilisateurs de PostgreSQL
3. ✅ Identifie les utilisateurs manquants
4. ✅ Crée les utilisateurs manquants dans PostgreSQL
5. ✅ Les ajoute au workspace BASE avec le rôle VIEWER

---

## 📋 Étapes d'Exécution

### 1. Installer la Dépendance Manquante

```bash
cd backend
npm install @supabase/supabase-js
```

### 2. Récupérer la Clé Service Role Supabase

1. Aller sur [Supabase Dashboard](https://app.supabase.com)
2. Sélectionner votre projet : `rnreaaeiccqkwgwxwxeg`
3. **Settings → API**
4. Copier **service_role** (⚠️ **PAS** l'anon key, c'est la clé secrète admin)

### 3. Ajouter les Variables d'Environnement

Créer ou modifier `backend/.env` :

```env
# Supabase Configuration
SUPABASE_PROJECT_REF="rnreaaeiccqkwgwxwxeg"
SUPABASE_URL="https://rnreaaeiccqkwgwxwxeg.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="votre_service_role_key_ici"
SUPABASE_JWT_SECRET="nLkaaWDvPUL02zTg6K0qY2iod7ld9RQGE0ayeCBlutUDUuYejFXeqFug1u0BpZM45ixzrfs9Ase214DwQ4keHw=="

# Database (déjà configuré normalement)
DATABASE_URL="votre_database_url"
```

### 4. Exécuter le Script

```bash
cd backend
node scripts/sync-supabase-users.js
```

### 5. Vérifier le Résultat

Le script affichera :

```
🔄 Synchronisation des utilisateurs Supabase → PostgreSQL

📥 Récupération des utilisateurs Supabase Auth...
✅ 3 utilisateurs trouvés dans Supabase Auth

📥 Récupération des utilisateurs PostgreSQL...
✅ 2 utilisateurs trouvés dans PostgreSQL

⚠️  1 utilisateur(s) manquant(s) dans PostgreSQL:
   - vindu@gmail.com (ID: xxx-xxx-xxx)

🔍 Recherche du workspace BASE...
✅ Workspace BASE trouvé (ID: xxx)

➕ Création des utilisateurs manquants...
   ✅ Utilisateur créé: vindu@gmail.com (xxx-xxx-xxx)
      → Ajouté au workspace BASE avec le rôle VIEWER

✅ Synchronisation terminée !

📊 Résumé final:
   - Supabase Auth: 3 utilisateurs
   - PostgreSQL: 3 utilisateurs
   - Créés: 1 utilisateurs

👥 Liste des utilisateurs PostgreSQL:
   - admin@ultimate.com (ADMIN)
   - youdry@gmail.com (USER)
   - vindu@gmail.com (USER)
```

---

## 🔐 Sécurité

**⚠️ IMPORTANT :** La clé `SUPABASE_SERVICE_ROLE_KEY` est une **clé secrète admin** qui donne accès complet à votre projet Supabase.

**Bonnes pratiques :**
- ✅ Ne jamais la committer dans Git
- ✅ Ne jamais l'exposer côté frontend
- ✅ L'utiliser uniquement dans des scripts backend/admin
- ✅ La stocker dans les variables d'environnement sécurisées

Le fichier `.env` est déjà dans `.gitignore`, donc il ne sera pas committé.

---

## 🚀 Pour la Production (Vercel)

Si vous voulez synchroniser les utilisateurs en production :

### Option 1 : Via Vercel CLI (Recommandé)

```bash
# Installer Vercel CLI si pas déjà fait
npm install -g vercel

# Se connecter
vercel login

# Ajouter la variable d'environnement
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Télécharger les variables d'environnement
vercel env pull .env.production

# Exécuter le script en production
vercel exec -- node backend/scripts/sync-supabase-users.js
```

### Option 2 : Créer un Endpoint Admin

Créer une route `/api/admin/sync-users` qui exécute le script (protégée par authentification admin).

---

## 🔄 Prévention Future

Pour éviter cette désynchronisation à l'avenir, assurez-vous que :

1. ✅ La route `/api/auth/register` est bien appelée après l'inscription Supabase
2. ✅ Le frontend gère correctement les erreurs de création de profil
3. ✅ Les logs backend sont surveillés pour détecter les échecs

Le code actuel dans `auth.service.ts` appelle déjà `/api/auth/register` après l'inscription Supabase, donc les nouveaux utilisateurs devraient être synchronisés automatiquement.

---

## ❓ Troubleshooting

### Erreur : "SUPABASE_SERVICE_ROLE_KEY manquant"

→ Vérifiez que la variable est bien dans `.env` et que vous êtes dans le dossier `backend`

### Erreur : "Cannot find module '@supabase/supabase-js'"

→ Exécutez `npm install @supabase/supabase-js` dans le dossier `backend`

### Erreur : "Workspace BASE non trouvé"

→ Exécutez d'abord le seed pour créer le workspace BASE :
```bash
npx prisma db seed
```

### Les utilisateurs sont créés mais n'apparaissent pas dans l'interface

→ Rafraîchissez la page admin ou videz le cache navigateur (Ctrl+Shift+R)

---

## 📝 Résumé

1. Installer `@supabase/supabase-js`
2. Récupérer la clé `SUPABASE_SERVICE_ROLE_KEY` depuis Supabase Dashboard
3. L'ajouter dans `backend/.env`
4. Exécuter `node scripts/sync-supabase-users.js`
5. Vérifier que tous les utilisateurs sont synchronisés

**C'est tout !** 🎉
