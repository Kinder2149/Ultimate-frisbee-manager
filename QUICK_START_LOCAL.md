# 🚀 Démarrage Rapide - Tests Locaux

**Guide ultra-rapide pour tester en local avec Supabase et Cloudinary**

---

## ⚡ Configuration Express (5 minutes)

### 1. Créer `.env` Backend

```bash
cd backend
cp .env.example .env
```

### 2. Éditer `backend/.env`

**Remplacer ces 3 lignes UNIQUEMENT** :

```bash
# 🗄 DATABASE (Supabase)
DATABASE_URL="postgresql://postgres:[VOTRE_MOT_DE_PASSE]@db.rnreaaeiccqkwgwxwxeg.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

# ☁️ CLOUDINARY
CLOUDINARY_URL="cloudinary://[VOTRE_API_KEY]:[VOTRE_API_SECRET]@[VOTRE_CLOUD_NAME]"

# 🔐 JWT (Générer des secrets aléatoires)
JWT_SECRET="dev-local-secret-minimum-32-caracteres-ici"
JWT_REFRESH_SECRET="dev-local-refresh-secret-minimum-32-caracteres"
```

**Où trouver les credentials ?**

#### Supabase
1. https://supabase.com/dashboard
2. Votre projet → Settings → Database
3. Connection string → "Connection pooling"
4. Copier et remplacer `[YOUR-PASSWORD]`

#### Cloudinary
1. https://cloudinary.com/console
2. Dashboard → API Environment variable
3. Copier la ligne complète `cloudinary://...`

---

## 🏃 Démarrage (3 commandes)

```bash
# 1. Installer dépendances
npm install

# 2. Build shared + initialiser DB
npm -w shared run build
cd backend
npm run db:migrate
npm run db:seed

# 3. Démarrer backend + frontend
# Terminal 1 (backend)
cd backend
npm run dev

# Terminal 2 (frontend)
cd frontend
npm start
```

---

## ✅ Tests Rapides

### Backend (Terminal 3)

```bash
# Health check
curl http://localhost:3002/api/health

# Login
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ultimate.com","password":"Ultim@t+"}'
```

### Frontend (Navigateur)

1. Ouvrir http://localhost:4200
2. Login : `admin@ultimate.com` / `Ultim@t+`
3. Tester création exercice
4. Tester upload image

---

## 📋 Checklist Validation

- [ ] Backend démarre sans erreur
- [ ] Frontend démarre sans erreur
- [ ] Login fonctionne
- [ ] Liste exercices s'affiche
- [ ] Création exercice fonctionne
- [ ] Upload image Cloudinary fonctionne

**✅ Tous les tests OK ?** → Prêt pour production !

---

**Guide complet** : `docs/LOCAL_TESTING_GUIDE.md`
