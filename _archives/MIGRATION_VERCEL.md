# Guide de Migration Prisma sur Vercel

## Problème actuel
La base de données PostgreSQL contient encore l'ancienne colonne `passwordHash` qui n'existe plus dans le schéma Prisma. Cela provoque une erreur lors de l'inscription des utilisateurs.

## Prérequis

### Variables d'environnement Vercel requises

Assurez-vous que ces variables sont définies dans votre projet Vercel :

1. **DATABASE_URL** (pour les requêtes normales via pgBouncer)
   ```
   postgresql://user:password@aws-xxx.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
   ```

2. **DIRECT_URL** (pour les migrations, connexion directe)
   ```
   postgresql://user:password@aws-xxx.pooler.supabase.com:5432/postgres
   ```

3. **SUPABASE_JWT_SECRET** (pour l'authentification)
4. **CLOUDINARY_URL** (pour les uploads d'images)
5. **CORS_ORIGINS** (ex: `https://ultimate-frisbee-manager.vercel.app`)

## Solution 1 : Migration via script local (RECOMMANDÉ)

### Étape 1 : Vérifier les variables locales

Créez un fichier `.env.migration` avec vos credentials de production :

```bash
DATABASE_URL="postgresql://user:password@aws-xxx.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://user:password@aws-xxx.pooler.supabase.com:5432/postgres"
```

### Étape 2 : Lancer la migration

```bash
cd backend
npm run db:migrate:vercel
```

Ce script va :
- ✅ Vérifier les variables d'environnement
- ✅ Générer le client Prisma
- ✅ Appliquer toutes les migrations manquantes
- ✅ Supprimer la colonne `passwordHash`

## Solution 2 : Migration via Vercel CLI

Si vous avez Vercel CLI installé :

```bash
# Se connecter à Vercel
vercel login

# Lier le projet
vercel link

# Exécuter la migration en production
vercel env pull .env.production
cd backend
npx prisma migrate deploy
```

## Solution 3 : Migration manuelle SQL

Si les solutions automatiques échouent, connectez-vous directement à PostgreSQL :

```sql
-- Vérifier si la colonne existe
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'User' AND column_name = 'passwordHash';

-- Supprimer la colonne si elle existe
ALTER TABLE "User" DROP COLUMN IF EXISTS "passwordHash";
```

## Vérification post-migration

### 1. Vérifier l'état des migrations

```bash
cd backend
npx prisma migrate status
```

Vous devriez voir :
```
✓ All migrations have been applied
```

### 2. Tester l'inscription

Essayez de créer un nouvel utilisateur via l'interface. Vous devriez voir dans les logs :
- ✅ `[register] Nouvel utilisateur créé:` (si migration appliquée)
- ⚠️ `[register] Ancienne structure détectée` (si migration non appliquée, fallback actif)

## Migrations à appliquer

Les migrations suivantes seront appliquées dans l'ordre :

1. ✅ `20250125000000_add_user_role_enum` - Ajout de l'enum UserRole
2. ✅ `20250125000001_normalize_user_roles` - Normalisation des rôles
3. ✅ `20251123182335_v1_1` - Version 1.1
4. ✅ `20251127_baseline` - Baseline
5. ⚠️ **`20260129_remove_password_hash`** - **CRITIQUE : Supprime passwordHash**
6. ✅ `20260202213000_tag_unique_per_workspace` - Tags uniques par workspace

## Troubleshooting

### Erreur : "Migration failed to apply"

**Cause** : Connexion via pgBouncer au lieu de connexion directe

**Solution** : Vérifiez que `DIRECT_URL` utilise le port **5432** (pas 6543)

### Erreur : "Timeout"

**Cause** : Connexion lente ou base de données surchargée

**Solution** : 
1. Réessayez après quelques minutes
2. Vérifiez que Supabase n'est pas en maintenance
3. Augmentez le timeout : `npx prisma migrate deploy --timeout 60000`

### Erreur : "P2011 Null constraint violation"

**Cause** : La migration n'a pas été appliquée

**Solution** : Le fallback dans `auth.controller.js` est actif. Appliquez la migration dès que possible.

## Après la migration

Une fois la migration appliquée avec succès :

1. ✅ Testez l'inscription d'un nouvel utilisateur
2. ✅ Vérifiez les logs Vercel
3. ✅ Supprimez le code de fallback dans `backend/controllers/auth.controller.js` (lignes 100-187)

## Support

En cas de problème persistant :
1. Vérifiez les logs Vercel : `vercel logs`
2. Vérifiez l'état de Supabase : https://status.supabase.com
3. Consultez la documentation Prisma : https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel
