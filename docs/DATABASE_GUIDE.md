# 🗄️ Guide Base de Données - Ultimate Frisbee Manager

## Vue d'ensemble

Base de données PostgreSQL hébergée sur Supabase, gérée via Prisma ORM.

---

## 📊 Schéma Prisma

**Localisation** : `backend/prisma/schema.prisma`

**Modèles principaux** :
- `User` : Utilisateurs et authentification
- `Workspace` : Espaces de travail multi-tenant
- `Tag` : Tags catégorisés (objectifs, niveaux, etc.)
- `Exercice` : Exercices d'ultimate frisbee
- `Echauffement` : Échauffements avec blocs
- `Entrainement` : Séances d'entraînement complètes
- `SituationMatch` : Situations de match
- `EntrainementExercice` : Relation many-to-many

---

## 🔄 Migrations

### Structure des Migrations

```
backend/prisma/
├── migrations/              # Migrations actives (appliquées)
│   ├── 20240101_init/
│   ├── 20240115_add_workspaces/
│   └── migration_lock.toml
├── migrations_archive/      # Anciennes migrations (référence)
├── migrations_archived/     # Anciennes migrations (référence)
└── squashed_baseline.sql    # Baseline SQL pour reset complet
```

### Migrations Archivées

**PROB-036 : Deux dossiers d'archives**
- `migrations_archive/` : Migrations pré-workspaces
- `migrations_archived/` : Migrations intermédiaires

**Raison** : Historique de refactoring du schéma  
**Action** : Conserver pour référence, ne pas supprimer

### Baseline SQL

**PROB-037 : `squashed_baseline.sql`**

**Rôle** : Snapshot complet du schéma pour reset rapide  
**Utilisation** :
```bash
# Reset complet de la DB (DESTRUCTIF)
psql $DATABASE_URL < backend/prisma/squashed_baseline.sql
npx prisma db seed
```

**Quand l'utiliser** :
- Reset environnement de développement
- Création nouvelle instance DB
- Tests d'intégration

---

## 🌱 Seeds

### PROB-038 : Ordre d'Exécution des Seeds

**Configuration** : `backend/package.json`
```json
"prisma": {
  "seed": "node prisma/seed.js && node prisma/seed-minimal-content.js"
}
```

### Scripts de Seed

#### 1. `seed.js` (Principal)
**Rôle** : Seed complet avec données de démonstration  
**Contenu** :
- Tags système (catégories, niveaux, durées)
- Utilisateur admin par défaut
- Workspace par défaut

**Exécution** :
```bash
npm run db:seed
```

#### 2. `seed-tags.js`
**Rôle** : Seed uniquement les tags  
**Utilisation** : Mise à jour tags sans toucher aux données

#### 3. `seed-auth.js`
**Rôle** : Seed utilisateur admin uniquement  
**Utilisation** : Reset compte admin

#### 4. `seed-minimal-content.js`
**Rôle** : Contenu minimal pour tests (1 exercice, 1 échauffement, 1 entraînement)  
**Utilisation** : Tests d'export/import

### Ordre Recommandé

```bash
# 1. Reset complet
npm run db:reset

# 2. Seed automatique (seed.js + seed-minimal-content.js)
# Exécuté automatiquement par db:reset

# 3. Seed destructif (supprime tout avant)
npm run db:seed:destructive
```

---

## 🔧 Commandes Prisma

### Développement

```bash
# Générer client Prisma
npm run db:generate

# Créer migration
npm run db:migrate

# Appliquer migrations (production)
npm run db:deploy

# Studio (interface graphique)
npm run db:studio

# Reset complet (DESTRUCTIF)
npm run db:reset
```

### Production (Vercel)

```bash
# Dans vercel.json ou script de déploiement
npx prisma migrate deploy
npx prisma generate
```

---

## 🔐 Connexion Database

### Format URL

```bash
# Supabase (avec pgBouncer)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

# Direct (sans pgBouncer)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"
```

### Singleton Prisma

**Localisation** : `backend/services/prisma.js`

**Pourquoi** : Éviter multiples connexions en serverless (Vercel Functions)

```javascript
// Singleton pour réutiliser la connexion
const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
```

---

## 🛠️ Scripts Utiles

### Reset Admin

```bash
node backend/prisma/reset-admin.js
```

**Utilisation** : Reset mot de passe admin en cas d'oubli

### Audit & Fix

```bash
# Audit IDs SituationMatch
node backend/prisma/scripts/audit-fix-situationmatch-ids.js
```

---

## 📋 Checklist Migration Production

### Avant Déploiement
- [ ] Tester migrations en local
- [ ] Backup base de données
- [ ] Vérifier `DATABASE_URL` dans Vercel
- [ ] Tester connexion depuis Vercel

### Déploiement
- [ ] `npx prisma migrate deploy`
- [ ] `npx prisma generate`
- [ ] Vérifier logs Vercel
- [ ] Tester endpoints API

### Après Déploiement
- [ ] Vérifier données intactes
- [ ] Tester authentification
- [ ] Vérifier workspaces

---

## 🆘 Dépannage

### Erreur "Can't reach database server"
→ Vérifier `DATABASE_URL` et connexion réseau

### Erreur "Migration failed"
→ Vérifier état migrations : `npx prisma migrate status`

### Erreur "Too many connections"
→ Utiliser `pgbouncer=true` dans URL

### Erreur "Prisma Client not generated"
→ Exécuter `npx prisma generate`

---

**Dernière mise à jour** : 2026-01-24
