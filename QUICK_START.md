# ⚡ QUICK START - DÉMARRAGE RAPIDE

## 🚨 PROBLÈME ACTUEL
Node.js n'est pas accessible dans votre PowerShell.

## ✅ SOLUTION IMMÉDIATE

### 1. Installer Node.js (5 minutes)
1. Télécharger: https://nodejs.org/en/download/
2. Choisir: **Windows Installer (.msi)** - Version LTS (20.x)
3. Installer avec les options par défaut
4. ✅ **COCHER**: "Automatically install the necessary tools"
5. ✅ **COCHER**: "Add to PATH"
6. Cliquer "Install"
7. **REDÉMARRER PowerShell** (important!)

### 2. Vérifier l'Installation
```powershell
# Ouvrir un NOUVEAU PowerShell
node --version
# Doit afficher: v20.x.x

npm --version
# Doit afficher: 10.x.x
```

### 3. Exécuter la Migration (2 minutes)
```powershell
# Se placer dans le projet
cd C:\Users\v.coutry\AppData\Local\Programs\PROJETS\Ultimate-frisbee-manager\backend

# Exécuter la migration
npx prisma migrate dev --name add_updated_at_fields

# Générer le client
npx prisma generate

# Démarrer le serveur
npm run dev
```

### 4. Tester le Frontend (2 minutes)
```powershell
# Nouveau terminal
cd C:\Users\v.coutry\AppData\Local\Programs\PROJETS\Ultimate-frisbee-manager\frontend

# Démarrer
ng serve
```

### 5. Ouvrir l'Application
- Backend: http://localhost:3000
- Frontend: http://localhost:4200

---

## 📋 CHECKLIST RAPIDE

- [ ] Node.js installé et accessible (`node --version`)
- [ ] Migration Prisma exécutée (champ `updatedAt` ajouté)
- [ ] Backend démarre sans erreur
- [ ] Frontend compile sans erreur
- [ ] IndexedDB créé dans le navigateur (F12 → Application)
- [ ] Cache fonctionne (logs dans console)

---

## 🎯 PROCHAINES ÉTAPES

Une fois Node.js installé et la migration exécutée:

1. **Adapter les 4 services restants** (1h)
   - Utiliser le template: `SERVICE_ADAPTATION_TEMPLATE.md`
   - Services: entrainement, tag, echauffement, situationmatch

2. **Créer PreloadService** (30min)
   - Préchargement données critiques

3. **Tests complets** (1h)
   - Vérifier cache, sync, performance

4. **Déploiement production** (30min)
   - Suivre `DEPLOYMENT_GUIDE.md`

---

## 🆘 SI PROBLÈME

**Node.js toujours pas reconnu après installation**:
```powershell
# Vérifier le PATH
$env:Path -split ';' | Select-String node

# Si vide, ajouter manuellement:
$env:Path += ";C:\Program Files\nodejs\"
```

**Migration Prisma échoue**:
- Vérifier que PostgreSQL est accessible
- Vérifier le fichier `.env` dans `/backend`
- Vérifier `DATABASE_URL`

**Frontend ne compile pas**:
```powershell
cd frontend
npm install
ng serve
```

---

**Temps total estimé: 10 minutes (installation) + 1h (adaptation services) + 1h (tests) = 2h10**
