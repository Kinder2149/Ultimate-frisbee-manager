# 🔄 Guide de Migration Prisma - Production

> **Date** : 5 février 2026  
> **Migrations à appliquer** : 2 migrations critiques  
> **Niveau de risque** : ⚠️ FAIBLE (ajout de colonnes uniquement)

---

## 📋 MIGRATIONS À APPLIQUER

### 1. Migration `20260202_add_workspace_is_base`
**Fichier** : `prisma/migrations/20260202_add_workspace_is_base/migration.sql`

```sql
ALTER TABLE "Workspace" ADD COLUMN "isBase" BOOLEAN NOT NULL DEFAULT false;
```

**Impact** :
- ✅ Ajoute une colonne `isBase` à la table `Workspace`
- ✅ Valeur par défaut : `false` (aucun impact sur les données existantes)
- ✅ NON DESTRUCTIF : Aucune donnée supprimée ou modifiée

### 2. Migration `20260205_add_user_is_tester`
**Fichier** : `prisma/migrations/20260205_add_user_is_tester/migration.sql`

```sql
ALTER TABLE "User" ADD COLUMN "isTester" BOOLEAN NOT NULL DEFAULT false;
```

**Impact** :
- ✅ Ajoute une colonne `isTester` à la table `User`
- ✅ Valeur par défaut : `false` (aucun impact sur les données existantes)
- ✅ NON DESTRUCTIF : Aucune donnée supprimée ou modifiée

---

## 🚀 MÉTHODE 1 : Via ligne de commande (RECOMMANDÉ)

### Prérequis
- Accès à la base de données de production (DATABASE_URL)
- Node.js et npm installés
- Prisma CLI installé (`npm install -g prisma`)

### Étapes

#### 1. Récupérer l'URL de la base de données

**Option A : Depuis Vercel Dashboard**
1. Aller sur https://vercel.com/dashboard
2. Sélectionner votre projet
3. Aller dans **Settings** → **Environment Variables**
4. Copier la valeur de `DATABASE_URL`

**Option B : Via Vercel CLI**
```bash
cd backend
vercel env pull .env.production
```

#### 2. Définir la variable d'environnement

**Windows (PowerShell)** :
```powershell
$env:DATABASE_URL="votre_url_de_production"
```

**Windows (CMD)** :
```cmd
set DATABASE_URL=votre_url_de_production
```

**Linux/Mac** :
```bash
export DATABASE_URL="votre_url_de_production"
```

#### 3. Vérifier les migrations en attente

```bash
cd backend
npx prisma migrate status
```

**Résultat attendu** :
```
Following migrations have not yet been applied:
20260202_add_workspace_is_base
20260205_add_user_is_tester
```

#### 4. Appliquer les migrations

```bash
npx prisma migrate deploy
```

**Résultat attendu** :
```
✔ Applied migration 20260202_add_workspace_is_base
✔ Applied migration 20260205_add_user_is_tester
```

#### 5. Vérifier que tout est OK

```bash
npx prisma migrate status
```

**Résultat attendu** :
```
Database schema is up to date!
```

---

## 🚀 MÉTHODE 2 : Via script automatisé (PLUS SÛR)

### Windows

```cmd
cd backend
set DATABASE_URL=votre_url_de_production
scripts\deploy-migrations.cmd
```

### Linux/Mac

```bash
cd backend
export DATABASE_URL="votre_url_de_production"
chmod +x scripts/deploy-migrations.sh
./scripts/deploy-migrations.sh
```

Le script va :
1. ✅ Vérifier que vous êtes dans le bon répertoire
2. ✅ Vérifier que DATABASE_URL est définie
3. ✅ Afficher les migrations en attente
4. ⚠️ Demander confirmation avant d'appliquer
5. ✅ Appliquer les migrations
6. ✅ Vérifier l'état final

---

## 🚀 MÉTHODE 3 : Via Vercel CLI (AUTOMATIQUE)

Si votre projet est configuré avec Vercel :

```bash
cd backend

# 1. Se connecter à Vercel
vercel login

# 2. Lier le projet (si pas déjà fait)
vercel link

# 3. Récupérer les variables d'environnement
vercel env pull .env.production

# 4. Appliquer les migrations
npx dotenv -e .env.production -- npx prisma migrate deploy
```

---

## ⚠️ PRÉCAUTIONS DE SÉCURITÉ

### Avant d'appliquer les migrations

1. **✅ BACKUP RECOMMANDÉ** : Faire un backup de la base de données
   ```bash
   # Exemple avec PostgreSQL
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **✅ Vérifier l'état actuel**
   ```bash
   npx prisma migrate status
   ```

3. **✅ Tester en local d'abord** (optionnel mais recommandé)
   ```bash
   # Utiliser une base de données de test
   export DATABASE_URL="postgresql://localhost:5432/test_db"
   npx prisma migrate deploy
   ```

### Pendant l'application

- ⏱️ Les migrations sont **rapides** (< 1 seconde chacune)
- 🔒 Les migrations sont **atomiques** (tout ou rien)
- ✅ Les migrations sont **idempotentes** (peuvent être rejouées)

### Après l'application

1. **✅ Vérifier l'état des migrations**
   ```bash
   npx prisma migrate status
   ```

2. **✅ Tester l'application**
   - Vérifier que l'application démarre correctement
   - Vérifier que les workspaces s'affichent
   - Vérifier que le badge BASE apparaît

3. **✅ Marquer le workspace BASE** (si nécessaire)
   ```bash
   node scripts/verify-production-auth.js
   ```

---

## 🔍 VÉRIFICATION POST-MIGRATION

### Vérifier que les colonnes ont été ajoutées

**Via Prisma Studio** :
```bash
npx prisma studio
```

**Via SQL direct** :
```sql
-- Vérifier la colonne isBase
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'Workspace' AND column_name = 'isBase';

-- Vérifier la colonne isTester
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'User' AND column_name = 'isTester';
```

**Résultat attendu** :
```
column_name | data_type | column_default
------------+-----------+----------------
isBase      | boolean   | false
isTester    | boolean   | false
```

### Vérifier les données existantes

```sql
-- Tous les workspaces doivent avoir isBase = false par défaut
SELECT id, name, "isBase" FROM "Workspace";

-- Tous les users doivent avoir isTester = false par défaut
SELECT id, email, "isTester" FROM "User";
```

---

## 🚨 EN CAS DE PROBLÈME

### Erreur : "Migration already applied"
**Cause** : La migration a déjà été appliquée  
**Solution** : C'est normal, rien à faire

### Erreur : "Column already exists"
**Cause** : La colonne existe déjà en base  
**Solution** : Marquer la migration comme appliquée
```bash
npx prisma migrate resolve --applied 20260202_add_workspace_is_base
npx prisma migrate resolve --applied 20260205_add_user_is_tester
```

### Erreur : "Connection refused"
**Cause** : DATABASE_URL incorrecte ou base inaccessible  
**Solution** : Vérifier DATABASE_URL et les credentials

### Erreur : "Permission denied"
**Cause** : L'utilisateur DB n'a pas les droits ALTER TABLE  
**Solution** : Utiliser un utilisateur avec les droits appropriés

---

## 📞 SUPPORT

Si vous rencontrez un problème :

1. **Vérifier les logs** : `npx prisma migrate status --verbose`
2. **Consulter la documentation** : https://www.prisma.io/docs/guides/migrate
3. **Rollback** (si nécessaire) : Restaurer le backup

---

## ✅ CHECKLIST FINALE

Après avoir appliqué les migrations :

- [ ] `npx prisma migrate status` affiche "Database schema is up to date!"
- [ ] Les colonnes `isBase` et `isTester` existent en base
- [ ] Toutes les valeurs par défaut sont `false`
- [ ] L'application démarre sans erreur
- [ ] Le script `verify-production-auth.js` s'exécute correctement
- [ ] Le badge BASE s'affiche dans le header (si workspace BASE existe)

---

**✅ Une fois ces étapes complétées, votre système sera 100% opérationnel avec la gouvernance des rôles !**
