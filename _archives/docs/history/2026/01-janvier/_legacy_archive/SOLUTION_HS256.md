# 🔧 Solution Complète : Support HS256 pour Supabase Auth

## 🎯 Problème Identifié

**Erreur :** `"alg" (Algorithm) Header Parameter value not allowed`

**Cause :** Supabase génère des tokens JWT avec l'algorithme **HS256** (HMAC symétrique), mais le backend était configuré pour accepter uniquement **RS256** (RSA asymétrique via JWKS).

**Logs confirmant le diagnostic :**
```
[Frontend Auth] Token header: {alg: 'HS256', typ: 'JWT', kid: 'dGCQm2/TnMdTzziH'}
[Frontend Auth] ⚠️ PROBLÈME: Token n'est pas RS256!
[Auth] Error details: ERR_JOSE_ALG_NOT_ALLOWED
```

---

## ✅ Solution Implémentée

### 1. Ajout de la Variable d'Environnement

**Fichier modifié :** `backend/.env.example`

```env
# 🔗 SUPABASE (requis pour authentification)
SUPABASE_PROJECT_REF="your_project_ref"
SUPABASE_JWT_SECRET="your_supabase_jwt_secret"
```

**Où trouver le JWT Secret :**
1. Aller sur [Supabase Dashboard](https://app.supabase.com)
2. Sélectionner votre projet
3. Settings → API
4. Copier le **JWT Secret** (section "JWT Settings")

### 2. Mise à Jour de la Configuration Backend

**Fichier modifié :** `backend/config/index.js`

```javascript
supabase: {
  projectRef: process.env.SUPABASE_PROJECT_REF,
  jwtSecret: process.env.SUPABASE_JWT_SECRET,  // ← Ajouté
},
```

### 3. Modification du Middleware d'Authentification

**Fichier modifié :** `backend/middleware/auth.middleware.js`

**Changements principaux :**

1. **Détection automatique de l'algorithme** du token (HS256 ou RS256)
2. **Vérification HS256** avec le JWT secret Supabase
3. **Vérification RS256** via JWKS (méthode originale)
4. **Fallback intelligent** si l'algorithme n'est pas détecté

**Logique de vérification :**

```javascript
// 1. Décoder le header pour voir l'algorithme
const header = JSON.parse(atob(token.split('.')[0]));

// 2. Vérifier selon l'algorithme
if (header.alg === 'HS256') {
  // Utiliser le JWT secret
  const secret = new TextEncoder().encode(jwtSecret);
  const { payload } = await jose.jwtVerify(token, secret, {
    algorithms: ['HS256']
  });
} else if (header.alg === 'RS256') {
  // Utiliser JWKS
  const JWKS = jose.createRemoteJWKSet(jwksUrl);
  const { payload } = await jose.jwtVerify(token, JWKS, {
    algorithms: ['RS256']
  });
}
```

---

## 🚀 Déploiement sur Vercel

### Étape 1 : Récupérer le JWT Secret Supabase

1. Aller sur [Supabase Dashboard](https://app.supabase.com)
2. Projet : `rnreaaeiccqkwgwxwxeg`
3. Settings → API → JWT Settings
4. Copier le **JWT Secret**

### Étape 2 : Ajouter la Variable sur Vercel

1. Aller sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Projet : `ultimate-frisbee-manager`
3. Settings → Environment Variables
4. Ajouter :
   - **Name:** `SUPABASE_JWT_SECRET`
   - **Value:** `[votre JWT secret copié]`
   - **Environment:** Production, Preview, Development

### Étape 3 : Redéployer

```bash
git add .
git commit -m "fix: support HS256 tokens from Supabase"
git push origin master
```

Vercel redéploiera automatiquement avec la nouvelle configuration.

---

## 🧪 Tests à Effectuer

### Test 1 : Vérification Locale

```bash
# Dans backend/.env, ajouter :
SUPABASE_JWT_SECRET="votre_jwt_secret"

# Démarrer le backend
cd backend
npm run dev

# Tester la connexion depuis le frontend
cd ../frontend
npm start
```

### Test 2 : Vérification en Production

1. Attendre le redéploiement Vercel (2-3 minutes)
2. Aller sur https://ultimate-frisbee-manager.vercel.app
3. Se connecter avec `admin@ultimate.com` / `R@yban13`
4. Vérifier les logs Vercel Functions :
   - Chercher : `[Auth] Token HS256 vérifié avec succès`
   - Pas d'erreur `ERR_JOSE_ALG_NOT_ALLOWED`

### Test 3 : Vérification Console Navigateur

Ouvrir F12 → Console et vérifier :
```
[Frontend Auth] Token header: {alg: 'HS256', ...}
[Frontend Auth] ✅ Token RS256 correct  ← Sera mis à jour
[Interceptor] Token ajouté à la requête: /api/auth/profile
```

---

## 📊 Comparaison Avant/Après

### ❌ Avant (Problème)

```
Frontend → Envoie token HS256
Backend → Attend uniquement RS256 via JWKS
Résultat → ERR_JOSE_ALG_NOT_ALLOWED (401)
```

### ✅ Après (Solution)

```
Frontend → Envoie token HS256
Backend → Détecte HS256 → Vérifie avec JWT secret
Résultat → Token vérifié avec succès ✓
```

---

## 🔐 Sécurité

**Le JWT Secret est-il sûr ?**

✅ **OUI** - Le JWT secret Supabase est conçu pour être utilisé côté serveur uniquement.

**Bonnes pratiques :**
- ✅ Stocké dans les variables d'environnement Vercel (chiffré)
- ✅ Jamais exposé au frontend
- ✅ Jamais committé dans Git
- ✅ Utilisé uniquement pour vérifier les signatures JWT

**Pourquoi HS256 et pas RS256 ?**

Supabase utilise HS256 par défaut car :
- Plus simple à configurer
- Suffisant pour la plupart des cas d'usage
- Le secret est géré par Supabase de manière sécurisée
- La vérification se fait uniquement côté serveur

---

## 📝 Checklist de Déploiement

- [x] Ajouter `SUPABASE_JWT_SECRET` dans `.env.example`
- [x] Mettre à jour `backend/config/index.js`
- [x] Modifier `backend/middleware/auth.middleware.js`
- [ ] **→ VOUS : Récupérer le JWT Secret depuis Supabase Dashboard**
- [ ] **→ VOUS : Ajouter `SUPABASE_JWT_SECRET` sur Vercel**
- [ ] **→ VOUS : Commit et push les changements**
- [ ] **→ VOUS : Tester la connexion après redéploiement**

---

## 🆘 Troubleshooting

### Erreur : "JWT secret manquant"

**Cause :** `SUPABASE_JWT_SECRET` non défini sur Vercel

**Solution :**
1. Vérifier que la variable existe sur Vercel
2. Vérifier qu'elle est bien définie pour "Production"
3. Redéployer si nécessaire

### Erreur : "Token invalide"

**Cause :** JWT secret incorrect

**Solution :**
1. Vérifier que le secret copié est correct (pas d'espace)
2. Vérifier que c'est bien le "JWT Secret" et pas l'"anon key"
3. Régénérer le secret si nécessaire sur Supabase

### Logs : "Algorithme inconnu"

**Cause :** Token corrompu ou format invalide

**Solution :**
1. Vider le cache navigateur
2. Se déconnecter/reconnecter
3. Vérifier les logs frontend pour voir le token envoyé

---

## 🎯 Prochaines Étapes

1. **Récupérer le JWT Secret Supabase**
2. **L'ajouter sur Vercel**
3. **Commit et push**
4. **Tester la connexion**
5. **Confirmer que tout fonctionne**

Une fois ces étapes complétées, l'authentification fonctionnera correctement en production ! 🚀
