# 🚀 GUIDE DE DÉPLOIEMENT - SYSTÈME DE CACHE

## ⚠️ PRÉREQUIS

### 1. Vérifier Node.js
```powershell
# Ouvrir un nouveau terminal PowerShell
node --version  # Doit afficher v18+ ou v20+
npm --version   # Doit afficher 9+ ou 10+
```

**Si Node.js n'est pas reconnu**:
1. Télécharger Node.js LTS depuis https://nodejs.org/
2. Installer avec l'option "Add to PATH"
3. **REDÉMARRER PowerShell** après installation
4. Vérifier à nouveau avec `node --version`

---

## 📋 ÉTAPES DE DÉPLOIEMENT

### ÉTAPE 1: Migration Base de Données (Backend)

```powershell
# Se placer dans le dossier backend
cd backend

# Installer les dépendances si nécessaire
npm install

# Exécuter la migration Prisma
npx prisma migrate dev --name add_updated_at_fields

# Générer le client Prisma
npx prisma generate

# Vérifier que la migration a fonctionné
npx prisma studio
# Ouvrir un modèle (Exercice, Tag, etc.) et vérifier la présence du champ "updatedAt"
```

**Résultat attendu**:
```
✔ Migration applied successfully
✔ Generated Prisma Client
```

---

### ÉTAPE 2: Tester l'Endpoint Sync (Backend)

```powershell
# Démarrer le serveur backend
npm run dev

# Dans un autre terminal, tester l'endpoint
curl http://localhost:3000/api/sync/health
# Doit retourner: {"status":"ok","timestamp":"..."}
```

**Si le serveur démarre avec succès**, vous devriez voir:
```
🚀 Server running on port 3000
✅ Database connected
```

---

### ÉTAPE 3: Compiler le Frontend

```powershell
# Ouvrir un nouveau terminal
cd frontend

# Installer les dépendances
npm install

# Compiler en mode développement
ng serve

# OU compiler pour production
ng build --configuration production
```

**Résultat attendu**:
```
✔ Browser application bundle generation complete.
✔ Compiled successfully.
```

---

### ÉTAPE 4: Tests Fonctionnels

#### Test 1: Cache IndexedDB
1. Ouvrir l'application dans Chrome: `http://localhost:4200`
2. Se connecter
3. Ouvrir DevTools (F12) → Application → IndexedDB
4. Vérifier la présence de la base `ultimate-frisbee-cache`
5. Vérifier les stores: `auth`, `exercices`, `tags`, etc.

#### Test 2: Cache Profil
1. Se connecter
2. Ouvrir DevTools → Console
3. Chercher le log: `[Auth] Profile cached in IndexedDB`
4. Rafraîchir la page (F5)
5. Vérifier le log: `[Auth] Profile loaded from cache`

#### Test 3: Cache Exercices
1. Aller sur la page Exercices
2. Observer le temps de chargement (devrait être rapide)
3. Ouvrir DevTools → Network
4. Rafraîchir la page
5. Vérifier qu'il n'y a PAS de requête vers `/api/exercises` (données depuis cache)

#### Test 4: Synchronisation Multi-Onglets
1. Ouvrir l'application dans 2 onglets
2. Dans l'onglet 1: Créer un exercice
3. Dans l'onglet 2: Vérifier que l'exercice apparaît automatiquement (max 30s)

#### Test 5: Changement Workspace
1. Changer de workspace dans le sélecteur
2. Vérifier que la page se recharge rapidement (< 500ms)
3. Vérifier dans DevTools → Console: `[Workspace] Performing mini-reload`

---

## 🔍 VÉRIFICATIONS CRITIQUES

### Backend
- [ ] Migration Prisma exécutée avec succès
- [ ] Champ `updatedAt` présent sur tous les modèles
- [ ] Endpoint `/api/sync/versions` accessible
- [ ] Endpoint `/api/sync/health` retourne `{"status":"ok"}`
- [ ] Serveur démarre sans erreur

### Frontend
- [ ] Compilation sans erreur TypeScript
- [ ] IndexedDB créé avec 7 stores
- [ ] Cache profil fonctionne (logs dans console)
- [ ] Cache exercices fonctionne (pas de requête API au F5)
- [ ] Synchronisation multi-onglets fonctionne
- [ ] Changement workspace rapide

---

## 🐛 RÉSOLUTION PROBLÈMES

### Problème: "npx not recognized"
**Solution**: 
1. Installer Node.js depuis https://nodejs.org/
2. Redémarrer PowerShell
3. Vérifier: `node --version`

### Problème: Migration Prisma échoue
**Solution**:
```powershell
# Vérifier la connexion DB
npx prisma db pull

# Réinitialiser si nécessaire
npx prisma migrate reset
npx prisma migrate dev --name add_updated_at_fields
```

### Problème: IndexedDB ne se crée pas
**Solution**:
1. Vérifier la console navigateur pour erreurs
2. Vider le cache navigateur: DevTools → Application → Clear storage
3. Rafraîchir la page

### Problème: Cache ne fonctionne pas
**Solution**:
1. Ouvrir DevTools → Console
2. Chercher les logs `[DataCache]` ou `[IndexedDB]`
3. Vérifier les erreurs
4. Vérifier que le workspace est sélectionné

---

## 📦 DÉPLOIEMENT PRODUCTION

### Option A: Vercel (Frontend) + Railway (Backend)

#### Frontend sur Vercel
```powershell
cd frontend

# Installer Vercel CLI
npm install -g vercel

# Déployer
vercel --prod
```

#### Backend sur Railway
1. Aller sur https://railway.app/
2. New Project → Deploy from GitHub
3. Sélectionner le repo
4. Configurer les variables d'environnement:
   - `DATABASE_URL`
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `JWT_SECRET`
5. Railway détectera automatiquement Node.js
6. Exécuter la migration: `npx prisma migrate deploy`

---

### Option B: Docker (Tout-en-un)

**Créer `docker-compose.yml`** (à la racine):
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: ${DATABASE_URL}
      SUPABASE_URL: ${SUPABASE_URL}
      SUPABASE_KEY: ${SUPABASE_KEY}
    command: sh -c "npx prisma migrate deploy && npm start"
  
  frontend:
    build: ./frontend
    ports:
      - "4200:80"
    depends_on:
      - backend
```

**Déployer**:
```powershell
docker-compose up -d
```

---

## ✅ CHECKLIST FINALE AVANT PRODUCTION

### Code
- [ ] Tous les services de données adaptés (5/5)
- [ ] PreloadService créé et intégré
- [ ] AppComponent modifié pour init
- [ ] Tests unitaires passent
- [ ] Pas d'erreurs TypeScript

### Base de Données
- [ ] Migration Prisma appliquée en production
- [ ] Backup DB effectué avant migration
- [ ] Triggers `updatedAt` fonctionnent

### Performance
- [ ] Temps de chargement < 500ms
- [ ] Hit rate cache > 70%
- [ ] Changement workspace < 200ms

### Sécurité
- [ ] Variables d'environnement configurées
- [ ] CORS configuré correctement
- [ ] Rate limiting activé
- [ ] Logs sensibles supprimés

### Monitoring
- [ ] Logs backend configurés
- [ ] Sentry ou équivalent configuré
- [ ] Alertes configurées

---

## 📊 MÉTRIQUES À SURVEILLER

### Après Déploiement (Première Semaine)
- Temps de chargement moyen
- Hit rate cache IndexedDB
- Nombre de requêtes API (doit diminuer de 80%)
- Erreurs JavaScript (DevTools)
- Erreurs backend (logs serveur)
- Feedback utilisateurs

---

## 🆘 SUPPORT

En cas de problème:
1. Vérifier les logs backend: `npm run dev` (console)
2. Vérifier les logs frontend: DevTools → Console
3. Vérifier IndexedDB: DevTools → Application → IndexedDB
4. Vérifier Network: DevTools → Network

**Rollback si nécessaire**:
```powershell
# Backend
cd backend
npx prisma migrate resolve --rolled-back add_updated_at_fields

# Frontend
git revert HEAD
ng build --configuration production
```

---

**Prêt pour le déploiement ! 🚀**
