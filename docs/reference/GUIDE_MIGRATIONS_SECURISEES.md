# GUIDE MIGRATIONS SÉCURISÉES — PRISMA & SUPABASE

**Statut** : REFERENCE  
**Version** : 1.0  
**Date** : 2026-02-20  
**Auteur** : Cascade AI

---

## 🎯 OBJECTIF

Ce document est la **référence unique** pour gérer les migrations Prisma en production sans jamais perdre de données. Il explique comment prendre en compte les données créées directement sur le site et éviter les réinitialisations catastrophiques.

---

## 🚨 PROBLÈME RÉSOLU

### Incident du 2026-02-20

**Ce qui s'est passé** :
- Déploiement Vercel automatique à 14h04 UTC
- Exécution de `prisma migrate deploy`
- Réapplication de TOUTES les migrations (11 migrations)
- **Perte totale des données créées sur le site** (workspaces, rôles admin, exercices, etc.)

**Cause racine** :
- Aucune protection contre les réinitialisations
- Script de migration non sécurisé
- Pas de vérification de l'état de la base avant migration

**Solution mise en place** :
- Script de migration sécurisé avec vérifications
- Blocage automatique si risque de perte de données
- Synchronisation automatique Supabase Auth → PostgreSQL

---

## 📋 RÈGLES ABSOLUES

### ❌ INTERDIT

**NE JAMAIS exécuter directement** :
```bash
❌ prisma migrate reset          # Détruit TOUTES les données
❌ prisma migrate deploy          # Peut réappliquer toutes les migrations
❌ prisma db push --force-reset   # Détruit et recrée les tables
❌ prisma migrate dev --create-only # Sans vérification
```

### ✅ AUTORISÉ

**TOUJOURS utiliser les scripts sécurisés** :
```bash
✅ npm run db:migrate:vercel      # Script sécurisé pour production
✅ npm run db:sync-users          # Synchroniser utilisateurs Supabase Auth
✅ npm run db:migrate             # Développement local uniquement
✅ npm run db:studio              # Visualiser la base (lecture seule)
```

---

## 🔄 PROCÉDURE MIGRATIONS SÉCURISÉES

### ÉTAPE 1 : Modifier le schéma Prisma

**Fichier** : `backend/prisma/schema.prisma`

**Exemple** : Ajouter un champ `duree_minutes` au modèle `Exercice`

```prisma
model Exercice {
  id              String   @id @default(uuid())
  nom             String
  description     String
  duree_minutes   Int?     // ← NOUVEAU CHAMP (nullable pour compatibilité)
  // ... autres champs
}
```

**⚠️ RÈGLES** :
- Nouveaux champs TOUJOURS `nullable` (`?`) pour compatibilité
- Pas de suppression de colonnes existantes (créer migration séparée)
- Pas de changement de type (créer migration séparée)

---

### ÉTAPE 2 : Créer la migration en LOCAL

```bash
cd backend
npm run db:migrate
```

**Prisma va** :
1. Détecter les changements dans `schema.prisma`
2. Générer le fichier SQL de migration
3. Demander un nom de migration (ex: `add_duree_minutes`)
4. Appliquer la migration sur votre base LOCAL

**Résultat** :
```
backend/prisma/migrations/
  └── 20260220113451_add_duree_minutes/
      └── migration.sql
```

---

### ÉTAPE 3 : Vérifier la migration générée

**Ouvrir** : `backend/prisma/migrations/YYYYMMDDHHMMSS_nom/migration.sql`

**Vérifier** :
- ✅ Commandes `ALTER TABLE ... ADD COLUMN` uniquement
- ✅ Colonnes `nullable` (pas de `NOT NULL` sans `DEFAULT`)
- ❌ Pas de `DROP TABLE` ou `DROP COLUMN`
- ❌ Pas de `TRUNCATE` ou `DELETE`

**Exemple migration sûre** :
```sql
-- AlterTable
ALTER TABLE "Exercice" ADD COLUMN "duree_minutes" INTEGER;
```

**Exemple migration DANGEREUSE** :
```sql
-- DropTable
DROP TABLE "Exercice";  -- ❌ DANGER : Perte de données
```

---

### ÉTAPE 4 : Tester en LOCAL

```bash
# Démarrer backend local
npm start

# Vérifier que l'application fonctionne
# Tester les routes affectées
# Vérifier la console : 0 erreur
```

**Vérifications** :
- ✅ Backend démarre sans erreur
- ✅ Routes API fonctionnent
- ✅ Aucune erreur Prisma dans la console
- ✅ Données existantes intactes

---

### ÉTAPE 5 : Synchroniser utilisateurs Supabase Auth

**Avant chaque déploiement**, synchroniser les utilisateurs :

```bash
cd backend
npm run db:sync-users
```

**Ce script** :
1. Récupère tous les utilisateurs de Supabase Auth
2. Vérifie quels utilisateurs existent dans PostgreSQL
3. Crée les utilisateurs manquants
4. Les ajoute au workspace BASE

**Résultat attendu** :
```
✅ 12 utilisateurs trouvés dans Supabase Auth
✅ 13 utilisateurs trouvés dans PostgreSQL
✅ Synchronisation terminée !
```

---

### ÉTAPE 6 : Committer la migration

```bash
git add backend/prisma/schema.prisma
git add backend/prisma/migrations/
git commit -m "feat(db): ajout champ duree_minutes au modèle Exercice"
```

**⚠️ IMPORTANT** : Committer la migration AVANT de pusher

---

### ÉTAPE 7 : Déployer en STAGING (develop)

```bash
# Pusher sur develop
git checkout develop
git merge feature/votre-branche
git push origin develop
```

**Vercel Preview** va automatiquement :
1. Builder l'application
2. Exécuter `npm run db:migrate:vercel` (script sécurisé)
3. Déployer sur une URL de preview

**Vérifier** :
1. Aller sur l'URL Vercel Preview
2. Tester l'application
3. Vérifier les logs Vercel : pas d'erreur migration
4. Vérifier Supabase : données intactes

---

### ÉTAPE 8 : Déployer en PRODUCTION (main)

**Seulement si staging OK** :

```bash
git checkout main
git merge develop
git push origin main
```

**Vercel Production** va :
1. Builder l'application
2. Exécuter `npm run db:migrate:vercel` (script sécurisé)
3. Déployer sur `https://ultimate-frisbee-manager.vercel.app`

**Vérifier immédiatement** :
1. Tester l'application en production
2. Vérifier logs Vercel
3. Vérifier Supabase : données intactes
4. Tester connexion utilisateurs

---

## 🛡️ SCRIPT DE MIGRATION SÉCURISÉ

### Fichier : `backend/scripts/safe-migrate-vercel.js`

**Protections intégrées** :

#### 1. Vérification table `_prisma_migrations`
```javascript
const migrationsTableExists = await client.query(`
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = '_prisma_migrations'
  );
`);
```

#### 2. Comptage migrations existantes
```javascript
const migrationsCount = await client.query(`
  SELECT COUNT(*) as count FROM "_prisma_migrations";
`);
```

#### 3. Détection données sans migrations (DANGER)
```javascript
if (totalData > 0 && migrationCount === 0) {
  console.error('🚨 ERREUR CRITIQUE: Des données existent mais aucune migration enregistrée!');
  console.error('🚨 MIGRATION ANNULÉE pour protection des données.');
  process.exit(1);
}
```

#### 4. Logs détaillés
```javascript
console.log(`📊 Migrations existantes: ${migrationCount}`);
console.log(`📊 Données User: ${userCount}`);
console.log(`📊 Données Workspace: ${workspaceCount}`);
```

---

## 🔄 SYNCHRONISATION SUPABASE AUTH

### Problème : Utilisateurs Auth non visibles dans l'app

**Cause** :
- Supabase Auth gère l'authentification (JWT, sessions)
- PostgreSQL stocke les profils utilisateurs (nom, rôle, workspaces)
- Les utilisateurs créés via Supabase Auth ne sont PAS automatiquement dans PostgreSQL

**Solution** : Script de synchronisation

### Script : `backend/scripts/sync-supabase-users.js`

**Fonctionnement** :
1. Récupère tous les utilisateurs de Supabase Auth via API Admin
2. Compare avec les utilisateurs PostgreSQL
3. Crée les utilisateurs manquants dans PostgreSQL
4. Les ajoute au workspace BASE avec rôle VIEWER

**Utilisation** :
```bash
cd backend
npm run db:sync-users
```

**Quand l'exécuter** :
- ✅ Après chaque migration qui réinitialise la base
- ✅ Avant chaque déploiement en production
- ✅ Régulièrement (1x par semaine) pour synchroniser nouveaux utilisateurs
- ✅ Quand un utilisateur signale qu'il ne voit pas son compte

---

## 📊 GESTION DONNÉES CRÉÉES SUR LE SITE

### Principe : Migration unique de référence

**Concept** :
- Prisma gère l'état de la base via `_prisma_migrations`
- Chaque migration est appliquée UNE SEULE FOIS
- Les données créées sur le site sont PERSISTÉES

**Comment ça marche** :

#### 1. État initial (baseline)
```
_prisma_migrations:
  - 20251123000000_baseline
  - 20251123182335_v1_1
  - ...
```

#### 2. Données créées sur le site
```
User:
  - admin@ultimate.com (via site)
  - user1@ultimate.com (via site)

Workspace:
  - Mon Workspace (via site)
  - Workspace Test (via site)
```

#### 3. Nouvelle migration
```
Fichier: 20260220113451_add_duree_minutes/migration.sql
Contenu: ALTER TABLE "Exercice" ADD COLUMN "duree_minutes" INTEGER;
```

#### 4. Déploiement
```
Script sécurisé vérifie:
  ✅ Table _prisma_migrations existe
  ✅ 11 migrations déjà appliquées
  ✅ Données User/Workspace présentes
  
Action:
  → Applique UNIQUEMENT la nouvelle migration
  → Données existantes INTACTES
```

---

## 🚨 RÉCUPÉRATION EN CAS DE PERTE

### Si les données ont été perdues

#### 1. Vérifier l'état Supabase

**SQL Editor** :
```sql
-- Vérifier migrations
SELECT * FROM "_prisma_migrations" ORDER BY "finished_at" DESC LIMIT 10;

-- Vérifier utilisateurs
SELECT COUNT(*) FROM "User";

-- Vérifier workspaces
SELECT COUNT(*) FROM "Workspace";
```

#### 2. Restaurer rôles admin

```sql
-- Trouver votre user
SELECT id, email, role FROM "User" WHERE email = 'votre-email@example.com';

-- Restaurer ADMIN
UPDATE "User" SET role = 'ADMIN' WHERE email = 'votre-email@example.com';
```

#### 3. Synchroniser utilisateurs Supabase Auth

```bash
cd backend
npm run db:sync-users
```

#### 4. Recréer workspaces essentiels

```sql
-- Créer workspace
INSERT INTO "Workspace" (id, name, "isBase", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Mon Workspace', false, NOW(), NOW())
RETURNING id, name;

-- Associer au user (remplacer UUIDs)
INSERT INTO "WorkspaceUser" (id, "workspaceId", "userId", role, "createdAt")
VALUES (gen_random_uuid(), 'UUID_WORKSPACE', 'UUID_USER', 'MANAGER', NOW());
```

---

## 📋 CHECKLIST PRÉ-DÉPLOIEMENT

### Avant chaque déploiement en production

- [ ] Migration testée en local
- [ ] Migration vérifiée (pas de DROP/TRUNCATE)
- [ ] Utilisateurs Supabase Auth synchronisés (`npm run db:sync-users`)
- [ ] Tests automatisés passent (si disponibles)
- [ ] Déployé et testé en staging (develop)
- [ ] Logs Vercel staging vérifiés (pas d'erreur)
- [ ] Backup manuel exporté (si données critiques)
- [ ] Script `safe-migrate-vercel.js` utilisé dans `package.json`

---

## 🎯 BONNES PRATIQUES

### 1. Migrations incrémentales

**Faire** :
```prisma
// Migration 1 : Ajouter colonne nullable
duree_minutes Int?

// Migration 2 (plus tard) : Remplir les données
// Migration 3 (plus tard) : Rendre NOT NULL si nécessaire
```

**Ne pas faire** :
```prisma
// Migration 1 : Ajouter colonne NOT NULL directement
duree_minutes Int  // ❌ Erreur si données existantes
```

### 2. Nommage migrations

**Format** : `YYYYMMDDHHMMSS_description_courte`

**Exemples** :
- ✅ `20260220113451_add_duree_minutes`
- ✅ `20260220120000_add_workspace_role_enum`
- ❌ `migration1`
- ❌ `update_schema`

### 3. Documentation migrations

**Toujours documenter** :
```sql
-- Migration: Ajout champ durée en minutes pour les exercices
-- Date: 2026-02-20
-- Auteur: Cascade AI
-- Impact: Aucun (colonne nullable)

ALTER TABLE "Exercice" ADD COLUMN "duree_minutes" INTEGER;
```

### 4. Tests avant production

**Toujours tester** :
1. En local (développement)
2. En staging (develop → Vercel Preview)
3. En production (main → Vercel Production)

### 5. Monitoring post-déploiement

**Après chaque déploiement** :
- Vérifier logs Vercel (5 premières minutes)
- Tester connexion utilisateur
- Vérifier routes principales
- Vérifier Supabase : données intactes

---

## 🔗 RÉFÉRENCES

### Fichiers clés

- `backend/scripts/safe-migrate-vercel.js` - Script migration sécurisé
- `backend/scripts/sync-supabase-users.js` - Script synchronisation Auth
- `backend/package.json` - Scripts npm disponibles
- `backend/prisma/schema.prisma` - Schéma base de données

### Documentation externe

- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Production Troubleshooting](https://www.prisma.io/docs/guides/migrate/production-troubleshooting)
- [Supabase Auth Admin API](https://supabase.com/docs/reference/javascript/auth-admin-listusers)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

## 📞 SUPPORT

### En cas de problème

1. **Vérifier logs Vercel** : Dashboard → Deployments → Logs
2. **Vérifier Supabase** : Dashboard → Table Editor
3. **Exécuter diagnostic** : `npm run db:sync-users`
4. **Consulter ce guide** : Section "Récupération en cas de perte"

### Contacts

- **Documentation** : `docs/reference/GUIDE_MIGRATIONS_SECURISEES.md`
- **Incident 2026-02-20** : `docs/work/20260220_URGENCE_RECUPERATION_DONNEES.md`

---

**Document créé le** : 2026-02-20  
**Dernière mise à jour** : 2026-02-20  
**Version** : 1.0  
**Statut** : REFERENCE (ne pas modifier sans créer nouvelle version)
