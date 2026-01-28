# 🔍 Analyse Complète du Problème d'Authentification

## 🎯 Problème Identifié

**Erreur :** `"alg" (Algorithm) Header Parameter value not allowed`  
**Statut :** Persiste malgré correction UUID

---

## 📊 Analyse Systématique

### 1. ✅ Frontend - Récupération du Token

**Code analysé :**
- `auth.service.ts:267-270` → `getAccessToken()` récupère `session.access_token`
- `auth.interceptor.ts:25-32` → Ajoute le token dans `Authorization: Bearer ${token}`

**Verdict :** ✅ Le frontend récupère bien le token de session Supabase (RS256)

### 2. ⚠️ Frontend - Configuration Supabase

**Fichiers analysés :**
- `environment.prod.ts:13` → `supabaseKey` = clé anon (HS256)
- `supabase.service.ts:15` → Utilise `supabaseKey` pour créer le client

**Problème potentiel :** La clé anon (HS256) est utilisée pour initialiser le client Supabase, MAIS le token envoyé devrait être celui de la session (RS256).

### 3. 🔴 PROBLÈME CRITIQUE IDENTIFIÉ

**Le token Supabase `supabaseKey` dans environment.ts est un JWT HS256 :**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Décodé :
```json
{
  "alg": "HS256",  ← PROBLÈME !
  "typ": "JWT"
}
```

**Ce token est la clé ANON de Supabase, pas un token utilisateur.**

### 4. 🔍 Vérification du Flux

**Flux attendu :**
1. Frontend → `supabase.auth.signInWithPassword()` → Connexion
2. Supabase → Génère un token RS256 pour l'utilisateur
3. Frontend → `getSession().access_token` → Récupère le token RS256
4. Frontend → Envoie le token RS256 au backend
5. Backend → Vérifie le token RS256 via JWKS

**Flux actuel (hypothèse) :**
1. Frontend → Connexion OK ✅
2. Supabase → Token RS256 généré ✅
3. Frontend → `getSession().access_token` → ???
4. Frontend → Envoie ??? au backend
5. Backend → Reçoit un token HS256 ❌

---

## 🧪 Tests à Effectuer

### Test 1 : Vérifier le Token Envoyé

**Dans la console navigateur (F12) :**

```javascript
// Récupérer le token
const { data } = await supabase.auth.getSession();
console.log('Token:', data.session?.access_token);

// Décoder le header
const parts = data.session?.access_token.split('.');
const header = JSON.parse(atob(parts[0]));
console.log('Header:', header);
// Devrait afficher: { alg: "RS256", ... }
```

### Test 2 : Vérifier le Token Reçu par le Backend

**Logs Vercel avec le code ajouté :**
```
[Auth] Token header: { alg: "HS256", typ: "JWT", kid: undefined }
```

Si `alg: "HS256"` → Le frontend envoie la mauvaise clé

---

## 🔧 Solutions Possibles

### Solution 1 : Vérifier que getSession() fonctionne

**Problème possible :** `getSession()` retourne `null` et le frontend envoie un token par défaut.

**Correction :**
```typescript
async getAccessToken(): Promise<string | null> {
  const { data, error } = await this.supabaseService.supabase.auth.getSession();
  
  if (error) {
    console.error('[Auth] Erreur getSession:', error);
    return null;
  }
  
  if (!data.session) {
    console.warn('[Auth] Pas de session active');
    return null;
  }
  
  console.log('[Auth] Token récupéré, alg:', 
    JSON.parse(atob(data.session.access_token.split('.')[0])).alg
  );
  
  return data.session.access_token;
}
```

### Solution 2 : Forcer le Refresh du Token

**Problème possible :** Le token est expiré ou invalide.

**Correction :**
```typescript
async getAccessToken(): Promise<string | null> {
  // Forcer le refresh
  const { data: refreshData } = await this.supabaseService.supabase.auth.refreshSession();
  
  if (refreshData.session) {
    return refreshData.session.access_token;
  }
  
  // Fallback sur getSession
  const { data } = await this.supabaseService.supabase.auth.getSession();
  return data.session?.access_token || null;
}
```

### Solution 3 : Vérifier la Configuration Supabase

**Aller sur Supabase Dashboard :**
1. Authentication → Settings
2. JWT Settings
3. Vérifier que JWT expiry est configuré
4. Vérifier que l'algorithme est RS256

---

## 🎯 Plan d'Action Immédiat

### Étape 1 : Ajouter des Logs Frontend

Modifier `auth.service.ts` pour logger le token avant envoi :

```typescript
async getAccessToken(): Promise<string | null> {
  const { data, error } = await this.supabaseService.supabase.auth.getSession();
  
  if (error) {
    console.error('[Frontend Auth] Erreur getSession:', error);
    return null;
  }
  
  if (!data.session) {
    console.warn('[Frontend Auth] Pas de session');
    return null;
  }
  
  const token = data.session.access_token;
  
  // LOG DIAGNOSTIC
  try {
    const header = JSON.parse(atob(token.split('.')[0]));
    console.log('[Frontend Auth] Token header:', header);
  } catch (e) {
    console.error('[Frontend Auth] Erreur décodage token:', e);
  }
  
  return token;
}
```

### Étape 2 : Rebuild et Redéployer

```bash
git add .
git commit -m "debug: ajout logs frontend token"
git push origin master
```

### Étape 3 : Tester et Analyser

1. Vider le cache navigateur
2. Se connecter
3. Ouvrir F12 → Console
4. Chercher `[Frontend Auth] Token header:`
5. Vérifier si `alg: "RS256"` ou `alg: "HS256"`

### Étape 4 : Corriger Selon le Résultat

**Si RS256 dans le frontend mais HS256 dans le backend :**
→ Problème d'intercepteur ou de transmission

**Si HS256 dans le frontend :**
→ Problème de récupération du token de session

**Si RS256 partout :**
→ Problème de vérification JWKS côté backend

---

## 🚨 Hypothèse Principale

**Le problème est probablement que `getSession()` retourne `null` et qu'un fallback envoie la clé anon.**

**Vérification :**
- Logs frontend montreront si `data.session` est null
- Si null → L'utilisateur n'est pas vraiment connecté à Supabase
- Si non-null mais HS256 → Problème de configuration Supabase

---

## 📝 Checklist de Vérification

- [ ] Logs frontend ajoutés
- [ ] Rebuild et redéploiement effectué
- [ ] Test de connexion effectué
- [ ] Logs frontend analysés
- [ ] Logs backend analysés
- [ ] Algorithme du token identifié
- [ ] Solution implémentée
- [ ] Test final réussi
