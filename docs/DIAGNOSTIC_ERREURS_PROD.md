# 🚨 DIAGNOSTIC ERREURS PRODUCTION

**Date** : 25 janvier 2026 - 21h52  
**Statut** : Déploiement validé sur Vercel mais erreurs critiques

---

## ❌ ERREURS DÉTECTÉES

### **1. API retourne 404**
```
GET https://ultimate-frisbee-manager-kinder.vercel.app/api/health
net::ERR_FAILED 404 (Not Found)
```

### **2. CORS bloqué**
```
Access to XMLHttpRequest at 'https://ultimate-frisbee-manager-kinder.vercel.app/api/workspaces/me' 
from origin 'https://ultimate-frisbee-manager.vercel.app' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

---

## 🔍 ANALYSE DU PROBLÈME

### **Domaines détectés**

| Type | URL | Statut |
|------|-----|--------|
| Frontend (preview) | `https://123-4vgq2g31g-kinder2149s-projects.vercel.app` | ✅ Fonctionne |
| Frontend (production) | `https://ultimate-frisbee-manager.vercel.app` | ✅ Fonctionne |
| API configurée | `https://ultimate-frisbee-manager-kinder.vercel.app/api` | ❌ 404 |

### **Problème identifié**

**Le frontend et le backend sont sur des domaines différents !**

- Frontend : `ultimate-frisbee-manager.vercel.app`
- Backend : `ultimate-frisbee-manager-kinder.vercel.app`

**Conséquence** :
1. Requêtes CORS bloquées (cross-origin)
2. Backend introuvable (404)

---

## 🎯 CAUSE RACINE

### **Hypothèse 1 : Deux projets Vercel différents**

Tu as peut-être créé 2 projets Vercel :
1. `ultimate-frisbee-manager` (frontend seul)
2. `ultimate-frisbee-manager-kinder` (backend seul)

**Problème** : Avec `vercel.json`, tout devrait être sur le même domaine.

### **Hypothèse 2 : Configuration environment.prod.ts incorrecte**

```typescript
// frontend/src/environments/environment.prod.ts
apiUrl: 'https://ultimate-frisbee-manager-kinder.vercel.app/api'
```

**Si le projet Vercel s'appelle** `ultimate-frisbee-manager`, l'URL devrait être :
```typescript
apiUrl: 'https://ultimate-frisbee-manager.vercel.app/api'
```

### **Hypothèse 3 : Backend non déployé**

Le backend n'est peut-être pas déployé comme Vercel Function.

**Vérification nécessaire** :
- Logs Vercel du déploiement
- Présence de `backend/server.js` dans le build

---

## ✅ SOLUTIONS

### **Solution 1 : Utiliser le même domaine partout**

**Étape 1 : Identifier le bon domaine**

Sur Vercel Dashboard :
1. Quel est le nom du projet ?
2. Quelle est l'URL de production ?

**Étape 2 : Corriger environment.prod.ts**

Si le projet s'appelle `ultimate-frisbee-manager` :
```typescript
apiUrl: 'https://ultimate-frisbee-manager.vercel.app/api'
```

Si le projet s'appelle `ultimate-frisbee-manager-kinder` :
```typescript
apiUrl: 'https://ultimate-frisbee-manager-kinder.vercel.app/api'
```

**Étape 3 : Vérifier CORS_ORIGINS sur Vercel**

Variables d'environnement Vercel :
```env
CORS_ORIGINS=https://ultimate-frisbee-manager.vercel.app,https://ultimate-frisbee-manager-kinder.vercel.app
```

---

### **Solution 2 : Vérifier que le backend est déployé**

**Sur Vercel Dashboard** :
1. Projet → Deployments → Dernier déploiement
2. Onglet "Functions"
3. Vérifier que `backend/server.js` apparaît

**Si absent** :
- Le backend n'est pas déployé
- Vérifier `vercel.json` (builds)
- Vérifier que `backend/server.js` existe

---

### **Solution 3 : Tester l'API directement**

**Test 1 : API sur le domaine frontend**
```
https://ultimate-frisbee-manager.vercel.app/api/health
```

**Test 2 : API sur le domaine configuré**
```
https://ultimate-frisbee-manager-kinder.vercel.app/api/health
```

**Résultat attendu** : L'un des deux devrait fonctionner.

---

## 🔧 ACTIONS IMMÉDIATES

### **1. Vérifier le nom du projet Vercel**

**Dashboard Vercel** → Nom du projet → Noter l'URL de production

### **2. Vérifier les logs de déploiement**

**Dashboard Vercel** → Deployments → Dernier → Logs

**Chercher** :
- Erreurs de build backend
- Warnings sur `backend/server.js`
- Messages CORS

### **3. Vérifier les variables d'environnement**

**Dashboard Vercel** → Settings → Environment Variables

**Variables critiques** :
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `CLOUDINARY_URL`
- `CORS_ORIGINS`

### **4. Corriger environment.prod.ts si nécessaire**

Si le domaine est différent, mettre à jour :
```typescript
apiUrl: 'https://[BON-DOMAINE].vercel.app/api'
```

---

## 📋 CHECKLIST DE DIAGNOSTIC

- [ ] Identifier le nom du projet Vercel
- [ ] Noter l'URL de production
- [ ] Vérifier que backend/server.js est dans Functions
- [ ] Vérifier les variables d'environnement
- [ ] Tester `/api/health` sur les deux domaines
- [ ] Vérifier les logs de déploiement
- [ ] Corriger environment.prod.ts si nécessaire
- [ ] Corriger CORS_ORIGINS si nécessaire

---

## 🎯 PROCHAINES ÉTAPES

**Attente de ta réponse** :
1. Quel est le nom exact du projet sur Vercel ?
2. Quelle est l'URL de production affichée ?
3. Y a-t-il des erreurs dans les logs de déploiement ?

**Ensuite** :
- Je corrigerai `environment.prod.ts`
- Je corrigerai `CORS_ORIGINS`
- Je redéploierai
