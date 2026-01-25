# 🚀 GUIDE DE DÉPLOIEMENT EN PRODUCTION

**Date** : 25 janvier 2026  
**Contexte** : Déploiement de la nouvelle interface admin après refonte complète

---

## 📋 ÉTAT ACTUEL

### ✅ Ce qui est prêt
- ✅ **Nouvelle admin complète** : 7 pages fonctionnelles
- ✅ **Compilation réussie** : Aucune erreur TypeScript
- ✅ **Tests locaux** : `http://localhost:4200/admin` fonctionne
- ✅ **Configuration Vercel** : `vercel.json` présent
- ✅ **Monorepo** : Structure frontend/backend/shared

### ⚠️ Points d'attention
- ⚠️ **Ancienne admin** : Routes `/parametres/admin/*` toujours présentes dans `settings.module.ts`
- ⚠️ **Coexistence** : Deux interfaces admin en parallèle (ancienne + nouvelle)
- ⚠️ **Variables d'environnement** : À vérifier sur Vercel

---

## 🎯 PLAN DE DÉPLOIEMENT

### **OPTION 1 : Déploiement progressif (RECOMMANDÉ)**

Garder les deux interfaces admin en parallèle temporairement.

#### Avantages
- ✅ Pas de rupture de service
- ✅ Possibilité de rollback immédiat
- ✅ Test en production avec utilisateurs réels
- ✅ Migration progressive

#### Étapes
1. **Déployer l'état actuel** (ancienne + nouvelle admin)
2. **Tester la nouvelle admin** en production sur `/admin`
3. **Valider avec utilisateurs** pendant quelques jours
4. **Supprimer l'ancienne admin** une fois validée
5. **Rediriger** `/parametres/admin/*` vers `/admin/*`

---

### **OPTION 2 : Déploiement complet (RADICAL)**

Supprimer l'ancienne admin avant de déployer.

#### Avantages
- ✅ Code propre, pas de duplication
- ✅ Une seule interface admin
- ✅ Pas de confusion pour les utilisateurs

#### Inconvénients
- ❌ Pas de rollback facile
- ❌ Risque si bugs en production
- ❌ Nécessite tests exhaustifs avant

#### Étapes
1. **Supprimer l'ancienne admin** (fichiers + routes)
2. **Tester localement** de manière exhaustive
3. **Déployer** la nouvelle version
4. **Monitorer** les erreurs en production

---

## 📦 CHECKLIST PRÉ-DÉPLOIEMENT

### **1. Code & Compilation**
- [x] ✅ Compilation frontend réussie
- [x] ✅ Aucune erreur TypeScript
- [ ] ⏳ Build de production testé (`npm run build`)
- [ ] ⏳ Taille des bundles vérifiée

### **2. Backend**
- [ ] ⏳ Routes `/api/admin/*` testées
- [ ] ⏳ Routes `/api/workspaces/*` testées
- [ ] ⏳ Authentification admin vérifiée
- [ ] ⏳ Base de données accessible

### **3. Configuration Vercel**
- [ ] ⏳ Variables d'environnement définies
- [ ] ⏳ `vercel.json` à jour
- [ ] ⏳ Routes API configurées
- [ ] ⏳ Build command correcte

### **4. Tests**
- [ ] ⏳ Navigation entre pages admin
- [ ] ⏳ Filtres et recherche
- [ ] ⏳ Édition utilisateur
- [ ] ⏳ Gestion membres workspace
- [ ] ⏳ Export de données

---

## 🔧 ÉTAPES DE DÉPLOIEMENT

### **Étape 1 : Build de production local**

```bash
# À la racine du projet
npm run build
```

**Vérifications** :
- ✅ Compilation réussie
- ✅ Dossier `frontend/dist/ultimate-frisbee-manager` créé
- ✅ Pas d'erreurs dans la console

---

### **Étape 2 : Vérifier les variables d'environnement**

#### **Variables nécessaires sur Vercel**

**Backend** :
```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
CLOUDINARY_URL=cloudinary://...
CORS_ORIGINS=https://votre-domaine.vercel.app
NODE_ENV=production
```

**Frontend** (dans `environment.prod.ts`) :
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://votre-domaine.vercel.app/api',
  // ... autres configs
};
```

#### **Comment vérifier sur Vercel**
1. Aller sur [vercel.com](https://vercel.com)
2. Sélectionner le projet
3. Settings → Environment Variables
4. Vérifier que toutes les variables sont définies

---

### **Étape 3 : Déployer sur Vercel**

#### **Option A : Via Git (RECOMMANDÉ)**

```bash
# Commit les changements
git add .
git commit -m "feat: nouvelle interface admin complète"
git push origin main
```

Vercel détectera automatiquement le push et déploiera.

#### **Option B : Via CLI Vercel**

```bash
# Installer Vercel CLI si nécessaire
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel --prod
```

---

### **Étape 4 : Vérifications post-déploiement**

#### **Tests à effectuer**

1. **Accès à l'admin**
   - [ ] `https://votre-domaine.vercel.app/admin` accessible
   - [ ] Redirection si non authentifié
   - [ ] Login fonctionne

2. **Navigation**
   - [ ] Dashboard s'affiche
   - [ ] Users List s'affiche
   - [ ] Workspaces List s'affiche
   - [ ] Navigation entre pages fonctionne

3. **Fonctionnalités**
   - [ ] Recherche utilisateurs fonctionne
   - [ ] Filtres fonctionnent
   - [ ] Édition utilisateur fonctionne
   - [ ] Voir détail workspace fonctionne

4. **API Backend**
   - [ ] `GET /api/admin/overview` retourne des données
   - [ ] `GET /api/admin/users` retourne des données
   - [ ] `GET /api/workspaces/me` retourne des données

5. **Erreurs**
   - [ ] Pas d'erreurs dans la console navigateur
   - [ ] Pas d'erreurs 500 dans les logs Vercel
   - [ ] Pas d'erreurs de CORS

---

## 🐛 PROBLÈMES COURANTS

### **Erreur : Cannot GET /admin**
**Cause** : Routing Angular non configuré  
**Solution** : Vérifier que `vercel.json` contient :
```json
{
  "routes": [
    { "src": "/.*", "dest": "/index.html" }
  ]
}
```

### **Erreur : CORS**
**Cause** : `CORS_ORIGINS` mal configuré  
**Solution** : Ajouter le domaine Vercel dans les variables d'env :
```env
CORS_ORIGINS=https://votre-domaine.vercel.app
```

### **Erreur : 401 Unauthorized**
**Cause** : JWT_SECRET manquant ou différent  
**Solution** : Vérifier que `JWT_SECRET` et `JWT_REFRESH_SECRET` sont définis sur Vercel

### **Erreur : Database connection failed**
**Cause** : `DATABASE_URL` incorrect  
**Solution** : Vérifier la connexion PostgreSQL sur Vercel

---

## 🔄 ROLLBACK EN CAS DE PROBLÈME

### **Via Vercel Dashboard**
1. Aller sur [vercel.com](https://vercel.com)
2. Sélectionner le projet
3. Deployments
4. Trouver le dernier déploiement stable
5. Cliquer sur "..." → "Promote to Production"

### **Via Git**
```bash
# Revenir au commit précédent
git revert HEAD
git push origin main
```

---

## 📊 MONITORING POST-DÉPLOIEMENT

### **Logs Vercel**
- Aller sur Vercel Dashboard → Deployments → Logs
- Surveiller les erreurs 500
- Vérifier les temps de réponse

### **Console navigateur**
- Ouvrir DevTools (F12)
- Onglet Console : vérifier pas d'erreurs
- Onglet Network : vérifier les requêtes API

### **Métriques à surveiller**
- ✅ Temps de chargement des pages
- ✅ Taux d'erreur API
- ✅ Nombre d'utilisateurs actifs
- ✅ Feedback utilisateurs

---

## 🗑️ NETTOYAGE POST-VALIDATION

### **Après validation de la nouvelle admin**

Si la nouvelle admin fonctionne parfaitement en production pendant quelques jours :

#### **1. Supprimer l'ancienne admin**

**Fichiers à supprimer** :
```
frontend/src/app/features/settings/pages/
├── admin-dashboard/
├── admin-workspaces-page/
├── data-explorer-page/
└── users-admin/ (si doublon avec nouvelle)
```

**Routes à supprimer** dans `settings.module.ts` :
```typescript
// Supprimer ces routes
{ path: 'admin', component: AdminShellComponent, ... }
{ path: 'admin/overview', ... }
{ path: 'admin/workspaces', ... }
{ path: 'admin/explorer', ... }
{ path: 'admin/users', ... }
```

#### **2. Ajouter des redirections**

Dans `app-routing.module.ts` :
```typescript
// Rediriger l'ancienne admin vers la nouvelle
{
  path: 'parametres/admin',
  redirectTo: '/admin',
  pathMatch: 'full'
},
{
  path: 'parametres/admin/**',
  redirectTo: '/admin'
}
```

#### **3. Commit et déployer**
```bash
git add .
git commit -m "chore: suppression ancienne interface admin"
git push origin main
```

---

## 📝 COMMANDES UTILES

### **Build local**
```bash
npm run build
```

### **Test du build local**
```bash
cd frontend/dist/ultimate-frisbee-manager
npx http-server -p 8080
```

### **Déploiement Vercel**
```bash
vercel --prod
```

### **Logs Vercel en temps réel**
```bash
vercel logs --follow
```

---

## ✅ RÉSUMÉ POUR TOI

### **Ce qu'il te manque pour déployer**

1. **Tester le build de production** :
   ```bash
   npm run build
   ```

2. **Vérifier les variables d'environnement sur Vercel** :
   - DATABASE_URL
   - JWT_SECRET
   - JWT_REFRESH_SECRET
   - CLOUDINARY_URL
   - CORS_ORIGINS

3. **Décider de l'approche** :
   - Option 1 (recommandé) : Garder ancienne + nouvelle admin temporairement
   - Option 2 : Supprimer ancienne admin avant déploiement

4. **Déployer** :
   ```bash
   git add .
   git commit -m "feat: nouvelle interface admin"
   git push origin main
   ```

5. **Tester en production** :
   - Accéder à `/admin`
   - Vérifier toutes les fonctionnalités
   - Surveiller les logs

6. **Valider et nettoyer** (après quelques jours) :
   - Supprimer l'ancienne admin
   - Ajouter redirections
   - Redéployer

---

## 🎯 PROCHAINES ÉTAPES IMMÉDIATES

1. **Teste le build** : `npm run build`
2. **Vérifie Vercel** : Variables d'environnement
3. **Décide** : Garder ou supprimer ancienne admin
4. **Déploie** : `git push`
5. **Teste** : Accède à `/admin` en production

**Bonne chance pour le déploiement ! 🚀**
