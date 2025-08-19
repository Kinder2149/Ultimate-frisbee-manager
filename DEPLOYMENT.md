# Guide de Déploiement - Ultimate Frisbee Manager

## 🚀 Déploiement en Production

### Prérequis
- Compte GitHub avec repository du projet
- Compte Render (gratuit)
- Compte Vercel (gratuit)

---

## 📋 Étape 1 : Préparation Backend

### 1.1 Configuration locale
```bash
cd backend
cp .env.development .env
# Modifier .env avec vos paramètres locaux si nécessaire
```

### 1.2 Test de compatibilité PostgreSQL
```bash
# Installer les dépendances PostgreSQL
npm install

# Vérifier la configuration
npm run deploy:prepare
```

---

## 🗄️ Étape 2 : Déploiement Backend sur Render

### 2.1 Création du service Web
1. Aller sur [render.com](https://render.com)
2. Créer un compte et connecter GitHub
3. **New** → **Web Service**
4. Connecter le repository GitHub
5. Configurer :
   - **Name** : `ultimate-frisbee-manager-api`
   - **Environment** : `Node`
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Branch** : `main`

### 2.2 Création de la base PostgreSQL
1. **New** → **PostgreSQL**
2. **Name** : `ultimate-frisbee-manager-db`
3. **Plan** : Free
4. Copier l'**Internal Database URL**

### 2.3 Variables d'environnement Render
Dans les settings du Web Service :
```
DATABASE_URL=<Internal Database URL de PostgreSQL>
NODE_ENV=production
CORS_ORIGINS=https://ultimate-frisbee-manager.vercel.app
```

### 2.4 Premier déploiement
1. **Deploy Latest Commit**
2. Vérifier les logs pour erreurs
3. Tester l'API : `https://ultimate-frisbee-manager-api.onrender.com`

---

## 🌐 Étape 3 : Déploiement Frontend sur Vercel

### 3.1 Configuration Angular
Le fichier `environment.prod.ts` est déjà configuré :
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://ultimate-frisbee-manager-api.onrender.com/api'
};
```

### 3.2 Déploiement Vercel
1. Aller sur [vercel.com](https://vercel.com)
2. **New Project**
3. Importer le repository GitHub
4. Configurer :
   - **Framework Preset** : Angular
   - **Build Command** : `ng build --configuration production`
   - **Output Directory** : `dist/ultimate-frisbee-manager`
   - **Install Command** : `npm install`

### 3.3 Configuration du projet
```
Project Name: ultimate-frisbee-manager
Root Directory: frontend
```

---

## 🔗 Étape 4 : Configuration CORS

### 4.1 Mise à jour CORS Backend
Une fois l'URL Vercel obtenue, mettre à jour dans Render :
```
CORS_ORIGINS=https://[votre-url].vercel.app
```

### 4.2 Test de communication
1. Ouvrir l'application Vercel
2. Vérifier que les données se chargent
3. Tester CRUD complet

---

## 🔄 Étape 5 : Déploiement Continu

### 5.1 Configuration automatique
- **Backend** : Render redéploie automatiquement sur push `main`
- **Frontend** : Vercel redéploie automatiquement sur push `main`

### 5.2 Workflow recommandé
```bash
# Développement sur branche dev
git checkout -b dev
# ... modifications ...
git commit -m "feat: nouvelle fonctionnalité"

# Test local
npm run dev  # backend
ng serve     # frontend

# Merge en production
git checkout main
git merge dev
git push origin main  # Déploiement automatique
```

---

## 🛠️ Scripts de Maintenance

### Migration des données (si nécessaire)
```bash
# Migrer SQLite vers PostgreSQL
npm run migrate:postgresql
```

### Vérification déploiement
```bash
# Vérifier configuration
npm run deploy:prepare
```

### Prisma en production
```bash
# Appliquer migrations
npm run prisma:migrate:deploy

# Générer client
npm run prisma:generate
```

---

## 🚨 Dépannage

### Erreurs courantes

#### Backend ne démarre pas
- Vérifier `DATABASE_URL` dans variables Render
- Consulter logs Render
- Vérifier compatibilité PostgreSQL

#### CORS errors
- Vérifier `CORS_ORIGINS` dans Render
- S'assurer que l'URL Vercel est correcte
- Redémarrer le service Render

#### Build Angular échoue
- Vérifier budget CSS dans `angular.json`
- Tester build local : `ng build --configuration production`

### URLs de production
- **Frontend** : `https://ultimate-frisbee-manager.vercel.app`
- **Backend** : `https://ultimate-frisbee-manager-api.onrender.com`
- **API** : `https://ultimate-frisbee-manager-api.onrender.com/api`

---

## 📊 Monitoring

### Logs Render
- Dashboard Render → Service → Logs
- Surveiller erreurs et performance

### Métriques Vercel
- Dashboard Vercel → Analytics
- Temps de chargement et erreurs

### Base de données
- Render PostgreSQL Dashboard
- Connexions et requêtes

---

## 🔐 Sécurité

### Variables d'environnement
- Jamais de commit des `.env`
- Utiliser variables Render/Vercel
- Rotation régulière des secrets

### CORS
- Limiter aux domaines autorisés
- Pas de wildcard `*` en production

### HTTPS
- Activé automatiquement sur Render/Vercel
- Redirection HTTP → HTTPS

---

## 📝 Checklist Déploiement

- [ ] Repository GitHub configuré
- [ ] Backend déployé sur Render
- [ ] PostgreSQL créé et configuré
- [ ] Variables d'environnement définies
- [ ] Frontend déployé sur Vercel
- [ ] CORS configuré correctement
- [ ] Communication front ↔ back testée
- [ ] CRUD complet fonctionnel
- [ ] Déploiement automatique activé
- [ ] Documentation mise à jour
