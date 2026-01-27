# 🚀 GITHUB CODESPACES - 100% GRATUIT (60h/mois)

## ✅ SOLUTION SANS CARTE BANCAIRE

**GitHub Codespaces** offre **GRATUITEMENT**:
- ✅ **60 heures/mois** (largement suffisant)
- ✅ **Aucune carte bancaire requise**
- ✅ Node.js 20 préinstallé
- ✅ VS Code complet dans le navigateur
- ✅ Terminal Linux complet
- ✅ Accès direct à votre repo GitHub

---

## 📋 ÉTAPE PAR ÉTAPE (5 minutes)

### ÉTAPE 1: Ouvrir GitHub Codespaces

1. Aller sur votre repo GitHub:
   ```
   https://github.com/Kinder2149/Ultimate-frisbee-manager
   ```

2. Cliquer sur le bouton vert **"Code"**

3. Onglet **"Codespaces"**

4. Cliquer **"Create codespace on main"**

5. Attendre 1-2 minutes → VS Code s'ouvre dans le navigateur ✅

---

### ÉTAPE 2: Configurer la Base de Données

Vous avez 2 options:

#### Option A: Utiliser Supabase (Recommandé - Gratuit)

1. Aller sur: https://supabase.com/
2. Se connecter avec GitHub
3. Créer un nouveau projet
4. Attendre 2 minutes que la DB soit prête
5. Copier la **Connection String**:
   - Settings → Database → Connection String
   - Mode: **Session** (pas Transaction)
   - Format: `postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres`

#### Option B: Utiliser Railway PostgreSQL (Gratuit)

1. Aller sur: https://railway.app/
2. Se connecter avec GitHub
3. New → Database → PostgreSQL
4. Copier **Postgres Connection URL**

---

### ÉTAPE 3: Créer le Fichier .env

Dans le terminal Codespaces:

```bash
cd backend
cp .env.example .env
```

Puis éditer `.env` avec vos valeurs:

```bash
# Ouvrir l'éditeur
code .env
```

Remplacer par vos vraies valeurs:

```env
# Base de données (copié depuis Supabase ou Railway)
DATABASE_URL="postgresql://postgres:password@host:5432/database"

# JWT Secrets (générer des textes aléatoires)
JWT_SECRET="mon-secret-jwt-aleatoire-minimum-32-caracteres-abc123"
JWT_REFRESH_SECRET="mon-secret-refresh-aleatoire-minimum-32-caracteres-xyz789"

# Port
PORT=3000
NODE_ENV=development

# CORS (autoriser Codespaces)
CORS_ORIGINS="*"
```

**Sauvegarder** (Ctrl+S ou Cmd+S)

---

### ÉTAPE 4: Exécuter la Migration Prisma

Dans le terminal Codespaces:

```bash
# Installer les dépendances
npm install

# Exécuter la migration
npx prisma migrate dev --name add_updated_at_fields

# Générer le client Prisma
npx prisma generate

# Démarrer le serveur
npm run dev
```

**Résultat attendu**:
```
✔ Migration applied successfully
✔ Generated Prisma Client
🚀 Server running on port 3000
```

---

### ÉTAPE 5: Tester l'API

Codespaces ouvre automatiquement un port forwarding.

Dans le terminal, vous verrez:
```
Your application running on port 3000 is available.
```

Cliquer sur le lien ou tester:
```bash
curl http://localhost:3000/api/sync/health
```

Devrait retourner:
```json
{"status":"ok","timestamp":"2026-01-27T..."}
```

---

## 🎯 AVANTAGES CODESPACES

✅ **100% Gratuit** (60h/mois)  
✅ **Aucune carte bancaire**  
✅ **Node.js préinstallé**  
✅ **Accès direct à votre code GitHub**  
✅ **VS Code complet**  
✅ **Terminal Linux**  
✅ **Ports automatiquement exposés**  

---

## 📊 CONSOMMATION

Pour votre projet:
- Migration Prisma: **5 minutes** (0.08h)
- Développement: **~10h/mois**
- **Total: ~10h/60h disponibles** = Largement dans le gratuit ✅

---

## 🔧 COMMANDES UTILES

### Voir l'état de la migration
```bash
npx prisma migrate status
```

### Ouvrir Prisma Studio (interface graphique DB)
```bash
npx prisma studio
```
Codespaces ouvrira automatiquement le port 5555

### Arrêter le serveur
```
Ctrl+C
```

### Redémarrer le serveur
```bash
npm run dev
```

---

## 🆘 SI PROBLÈME

### Erreur: "Cannot connect to database"
**Solution**: Vérifier `DATABASE_URL` dans `.env`
- Format correct: `postgresql://user:password@host:port/database`
- Pas d'espaces avant/après
- Password correctement encodé

### Erreur: "Migration failed"
**Solution**: 
```bash
# Réinitialiser
npx prisma migrate reset
# Réessayer
npx prisma migrate dev --name add_updated_at_fields
```

### Erreur: "Port 3000 already in use"
**Solution**:
```bash
# Tuer le processus
pkill -f node
# Redémarrer
npm run dev
```

---

## ✅ CHECKLIST

- [ ] Codespace créé et ouvert
- [ ] Fichier `.env` créé avec vos valeurs
- [ ] `DATABASE_URL` configuré (Supabase ou Railway)
- [ ] `JWT_SECRET` et `JWT_REFRESH_SECRET` configurés
- [ ] `npm install` exécuté
- [ ] Migration Prisma réussie
- [ ] Client Prisma généré
- [ ] Serveur démarre sans erreur
- [ ] `/api/sync/health` retourne OK

---

## 🎉 APRÈS LA MIGRATION

Une fois la migration réussie dans Codespaces:

### Option 1: Continuer dans Codespaces
- Développer directement dans le navigateur
- Adapter les 4 services restants
- Tester en temps réel

### Option 2: Pousser sur Railway
- La migration est déjà appliquée à votre DB
- Déployer le backend sur Railway
- Railway utilisera la même DB

### Option 3: Développer localement
- Cloner le repo
- La DB est déjà migrée
- Utiliser le même `.env`

---

## 💡 ASTUCE: GARDER CODESPACE ACTIF

Codespaces s'arrête après 30 min d'inactivité.

Pour le garder actif:
```bash
# Lancer une commande qui tourne
npm run dev
```

Ou configurer le timeout:
- Settings → Codespaces → Default idle timeout: 4 hours

---

**Prêt à essayer Codespaces ? C'est la solution la plus simple sans carte bancaire !** 🚀
