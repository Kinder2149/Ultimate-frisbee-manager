# 🔍 Diagnostic Production - Problème d'Authentification

**Date:** 28 janvier 2026  
**Statut:** En cours de résolution

---

## 🚨 Problème Principal Identifié

**Erreur:** `"alg" (Algorithm) Header Parameter value not allowed`  
**Code HTTP:** 401 Unauthorized sur toutes les requêtes `/api/*`

### Cause Racine
Le backend attend des tokens JWT Supabase signés avec l'algorithme **RS256** (clé publique/privée), mais il manquait la variable d'environnement `SUPABASE_PROJECT_REF` nécessaire pour récupérer les clés publiques JWKS.

**✅ RÉSOLU** : Variable `SUPABASE_PROJECT_REF=rnreaaeiccqkwgwxwxeg` ajoutée sur Vercel

---

## 📋 Points de Vérification Restants

### 1. ✅ Configuration Vercel (COMPLÉTÉ)
- [x] `SUPABASE_PROJECT_REF` défini
- [x] `DATABASE_URL` défini (PostgreSQL Supabase)
- [x] `CLOUDINARY_*` définis
- [x] `CORS_ORIGINS` défini
- [x] `NODE_ENV=production` défini

### 2. ⏳ Base de Données (À VÉRIFIER)

#### 2.1 Utilisateur Admin
**Requis:**
- Email: `admin@ultimate.com`
- ID: **UUID Supabase de cet utilisateur** (pas un UUID aléatoire)
- Role: `ADMIN`
- isActive: `true`

**⚠️ CRITIQUE:** L'ID de l'utilisateur en base PostgreSQL **DOIT** correspondre à l'UUID Supabase de cet utilisateur.

**Comment vérifier:**
1. Aller sur [Supabase Dashboard - Auth Users](https://supabase.com/dashboard/project/rnreaaeiccqkwgwxwxeg/auth/users)
2. Trouver l'utilisateur `admin@ultimate.com`
3. Copier son UUID (colonne "ID")
4. Vérifier dans PostgreSQL:
```sql
SELECT id, email, role, "isActive" FROM "User" WHERE email = 'admin@ultimate.com';
```
5. Si l'ID ne correspond pas ou si l'utilisateur n'existe pas, utiliser le script de vérification

#### 2.2 Workspace BASE
**Requis:**
- ID: `bb0acaee-5698-4160-bee5-d85bff72dbda`
- Name: `BASE`

**Vérification:**
```sql
SELECT * FROM "Workspace" WHERE name = 'BASE';
```

#### 2.3 Liaison Utilisateur <-> Workspace
**Requis:**
- workspaceId: `bb0acaee-5698-4160-bee5-d85bff72dbda`
- userId: UUID de l'admin (voir 2.1)
- role: `OWNER` ou `USER`

**Vérification:**
```sql
SELECT * FROM "WorkspaceUser" 
WHERE "workspaceId" = 'bb0acaee-5698-4160-bee5-d85bff72dbda'
AND "userId" = '<UUID_ADMIN>';
```

---

## 🔧 Script de Correction Automatique

Un script a été créé pour vérifier et corriger automatiquement la configuration :

**Fichier:** `backend/scripts/verify-production-auth.js`

**Usage:**
```bash
# En local (avec accès à la base de production)
cd backend
node scripts/verify-production-auth.js
```

**⚠️ Avant d'exécuter:**
1. Récupérer l'UUID Supabase de l'admin (voir section 2.1)
2. Modifier le script ligne 16 : `const SUPABASE_ADMIN_ID = 'votre-uuid-supabase';`
3. Exécuter le script

---

## 🔄 Flux d'Authentification Attendu

```
1. Frontend → Connexion Supabase (email/password)
   ↓
2. Supabase → Génère token JWT RS256
   ↓
3. Frontend → Stocke token + envoie dans header Authorization: Bearer <token>
   ↓
4. Backend → Vérifie token via JWKS Supabase
   URL: https://rnreaaeiccqkwgwxwxeg.supabase.co/auth/v1/keys
   ↓
5. Backend → Extrait l'ID utilisateur du token (decoded.sub)
   ↓
6. Backend → Charge utilisateur depuis PostgreSQL par ID
   ↓
7. Backend → Retourne profil utilisateur
   ↓
8. Frontend → Charge workspaces via /api/workspaces/me
   ↓
9. Frontend → Sélectionne workspace BASE
   ↓
10. ✅ Utilisateur authentifié et prêt
```

**Actuellement bloqué à l'étape 6** si l'utilisateur n'existe pas en base ou si son ID ne correspond pas à l'ID Supabase.

---

## 🧪 Tests à Effectuer Après Correction

### Test 1: Connexion
1. Aller sur https://ultimate-frisbee-manager.vercel.app
2. Se connecter avec `admin@ultimate.com` / `Ultim@t+`
3. **Attendu:** Redirection vers le dashboard sans erreur 401

### Test 2: Profil
1. Ouvrir la console navigateur (F12)
2. Vérifier les logs:
   - `[Auth] Connexion réussie: admin@ultimate.com`
   - `[Auth] Profil synchronisé: admin@ultimate.com`
   - Pas d'erreur 401 sur `/api/auth/profile`

### Test 3: Workspaces
1. Vérifier les logs:
   - `[Auth] Sélection auto workspace: BASE`
   - Pas d'erreur 401 sur `/api/workspaces/me`

### Test 4: Menu Paramètres
1. Cliquer sur le menu "Paramètres"
2. **Attendu:** Toutes les options admin visibles

---

## 📝 Logs de Diagnostic

### Logs Frontend (Console Navigateur)
```
[Auth] Event: SIGNED_IN admin@ultimate.com
[Auth] Connexion réussie: admin@ultimate.com
[Auth] Session Supabase trouvée, chargement du profil
[WorkspaceGuard] No workspace selected
/api/auth/profile:1 Failed to load resource: 401
[Auth] Retry 1/2 pour syncUserProfile
[Auth] Retry 2/2 pour syncUserProfile
[Auth] Erreur sync profil: St
```

### Logs Backend (Vercel Functions)
```
[Auth] Token verification failed: "alg" (Algorithm) Header Parameter value not allowed
```

**Analyse:** Le token Supabase est bien envoyé mais rejeté par le backend.

---

## 🎯 Actions Prioritaires

1. **IMMÉDIAT** ✅ Ajouter `SUPABASE_PROJECT_REF` sur Vercel → **FAIT**
2. **IMMÉDIAT** 🔄 Récupérer l'UUID Supabase de l'admin
3. **IMMÉDIAT** 🔄 Exécuter le script de vérification
4. **IMPORTANT** 🔄 Tester la connexion après correction
5. **NETTOYAGE** ⏳ Supprimer les variables JWT inutilisées du `.env`

---

## 📞 Support

Si le problème persiste après ces corrections, vérifier :
- Les logs Vercel Functions pour plus de détails
- La configuration Supabase Auth (algorithmes autorisés)
- La connectivité entre Vercel et Supabase PostgreSQL
