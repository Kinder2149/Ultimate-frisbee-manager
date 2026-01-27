# 🐳 SETUP AVEC DOCKER (Sans Installation Node.js)

## ✅ SOLUTION POUR PROBLÈME DROITS ADMINISTRATEUR

Puisque vous ne pouvez pas installer Node.js avec les droits admin, utilisez Docker !

---

## 📋 ÉTAPE 1: Installer Docker Desktop

### Téléchargement
1. Aller sur: https://www.docker.com/products/docker-desktop/
2. Télécharger **Docker Desktop for Windows**
3. Lancer l'installateur
4. Si demande de droits admin → Demander à votre admin IT OU utiliser version portable

### Alternative Sans Admin: Docker Portable
Si vous n'avez pas les droits admin:
1. Utiliser **Podman Desktop** (alternative sans admin): https://podman-desktop.io/
2. OU demander à votre service IT d'installer Docker Desktop

---

## 📋 ÉTAPE 2: Vérifier Docker

```powershell
# Vérifier que Docker fonctionne
docker --version
# Doit afficher: Docker version 24.x.x

docker ps
# Doit afficher la liste des conteneurs (vide au début)
```

---

## 📋 ÉTAPE 3: Exécuter la Migration avec Docker

### Option A: Docker Compose (Recommandé)

```powershell
# Se placer à la racine du projet
cd C:\Users\v.coutry\AppData\Local\Programs\PROJETS\Ultimate-frisbee-manager

# Construire et démarrer
docker-compose up --build
```

**Ce que ça fait**:
- ✅ Construit l'image Docker avec Node.js 20
- ✅ Installe toutes les dépendances npm
- ✅ Exécute la migration Prisma automatiquement
- ✅ Génère le client Prisma
- ✅ Démarre le serveur backend sur port 3000

### Option B: Commandes Docker Manuelles

```powershell
# Se placer dans backend
cd backend

# Construire l'image
docker build -t ufm-backend .

# Exécuter la migration
docker run --rm -v ${PWD}:/app -w /app ufm-backend npx prisma migrate dev --name add_updated_at_fields

# Générer le client Prisma
docker run --rm -v ${PWD}:/app -w /app ufm-backend npx prisma generate

# Démarrer le serveur
docker run -p 3000:3000 -v ${PWD}:/app -w /app ufm-backend npm run dev
```

---

## 📋 ÉTAPE 4: Tester

```powershell
# Dans un nouveau terminal
curl http://localhost:3000/api/sync/health
# Doit retourner: {"status":"ok","timestamp":"..."}
```

---

## 🎯 AVANTAGES DOCKER

✅ **Pas besoin de droits admin** (selon config IT)  
✅ **Environnement isolé** (ne pollue pas votre système)  
✅ **Reproductible** (même config partout)  
✅ **Facile à nettoyer** (juste supprimer le conteneur)  

---

## 🔧 COMMANDES UTILES

### Voir les logs
```powershell
docker-compose logs -f backend
```

### Arrêter
```powershell
docker-compose down
```

### Redémarrer
```powershell
docker-compose restart
```

### Entrer dans le conteneur
```powershell
docker-compose exec backend sh
# Puis vous pouvez exécuter des commandes npm/npx directement
```

### Nettoyer tout
```powershell
docker-compose down -v
docker system prune -a
```

---

## 🆘 SI DOCKER NE FONCTIONNE PAS

### Alternative 1: Utiliser WSL2 (Windows Subsystem for Linux)

```powershell
# Installer WSL2
wsl --install

# Redémarrer Windows

# Ouvrir Ubuntu (depuis le menu Démarrer)
# Dans Ubuntu:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Naviguer vers votre projet
cd /mnt/c/Users/v.coutry/AppData/Local/Programs/PROJETS/Ultimate-frisbee-manager/backend

# Exécuter la migration
npx prisma migrate dev --name add_updated_at_fields
npx prisma generate
npm run dev
```

### Alternative 2: Utiliser un Service Cloud

**Render.com** (Gratuit):
1. Créer compte sur https://render.com
2. New → Web Service
3. Connecter votre repo GitHub
4. Render détectera automatiquement Node.js
5. Ajouter commande de build: `npx prisma migrate deploy && npx prisma generate`
6. Déployer

**Railway.app** (Gratuit):
1. Créer compte sur https://railway.app
2. New Project → Deploy from GitHub
3. Sélectionner votre repo
4. Railway exécutera automatiquement les migrations
5. Obtenir l'URL de votre API

---

## 📊 RÉCAPITULATIF

| Solution | Droits Admin | Complexité | Temps |
|----------|--------------|------------|-------|
| Docker Desktop | Peut-être requis | Faible | 10 min |
| Podman Desktop | Non requis | Faible | 10 min |
| WSL2 | Non requis | Moyenne | 15 min |
| Cloud (Render/Railway) | Non requis | Faible | 5 min |

---

## ✅ RECOMMANDATION

**Pour développement local**: Docker Desktop ou Podman Desktop  
**Pour tester rapidement**: Railway.app (gratuit, 5 min setup)  
**Si rien ne marche**: WSL2 (toujours disponible sur Windows 10/11)

---

**Quelle solution préférez-vous essayer ?**
