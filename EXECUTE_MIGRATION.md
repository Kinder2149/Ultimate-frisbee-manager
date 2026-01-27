# 🚀 EXÉCUTER LA MIGRATION PRISMA

## ✅ Configuration Prête

J'ai créé le fichier `.env.codespaces` avec toutes vos vraies valeurs.

---

## 📋 COMMANDES À EXÉCUTER DANS CODESPACES

### ÉTAPE 1: Copier le fichier .env

```bash
# Dans le terminal Codespaces
cd backend

# Copier le fichier de configuration
cp .env.codespaces .env

# Vérifier que le fichier est bien créé
cat .env | head -5
```

### ÉTAPE 2: Exécuter la Migration

```bash
# Exécuter la migration Prisma
npx prisma migrate dev --name add_updated_at_fields
```

**Résultat attendu**:
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "postgres"

Applying migration `add_updated_at_fields`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20260127_add_updated_at_fields/
      └─ migration.sql

✔ Generated Prisma Client (v5.22.0)
```

### ÉTAPE 3: Démarrer le Serveur

```bash
# Démarrer le serveur backend
npm run dev
```

**Résultat attendu**:
```
[Startup] Server listening on http://0.0.0.0:3000
✅ Database connected
🚀 Server ready
```

### ÉTAPE 4: Tester l'Endpoint Sync

Dans un nouveau terminal Codespaces (ou dans votre navigateur):

```bash
# Tester le health check
curl http://localhost:3000/api/sync/health
```

**Devrait retourner**:
```json
{"status":"ok","timestamp":"2026-01-27T..."}
```

---

## 🎯 SI LA MIGRATION RÉUSSIT

Une fois la migration appliquée avec succès:

### ✅ Vérifier les Changements

```bash
# Ouvrir Prisma Studio pour voir la DB
npx prisma studio
```

Codespaces ouvrira automatiquement le port 5555. Vous pourrez voir:
- Les tables `Exercice`, `Tag`, `Entrainement`, etc.
- Le nouveau champ `updatedAt` sur chaque modèle

### ✅ Tester l'Endpoint Versions

```bash
# Tester l'endpoint de synchronisation (nécessite authentification)
curl http://localhost:3000/api/sync/versions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Workspace-Id: YOUR_WORKSPACE_ID"
```

---

## 🆘 SI PROBLÈME

### Erreur: "Can't reach database server"

**Cause**: Le port est incorrect pour le mode Transaction.

**Solution**: Vérifier que `DATABASE_URL` utilise bien le port **6543** (Transaction mode):
```
postgresql://...@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Erreur: "Migration already applied"

**Cause**: La migration existe déjà dans votre DB.

**Solution**: C'est normal ! Cela signifie que la migration a déjà été appliquée en production via Vercel.

Vérifier avec:
```bash
npx prisma migrate status
```

Si la migration est déjà appliquée, vous pouvez passer directement à l'étape suivante.

### Erreur: "Authentication failed"

**Cause**: Mot de passe incorrect ou caractères spéciaux mal encodés.

**Solution**: Le `%40` dans votre URL représente le caractère `@`. C'est correct !

---

## 📊 APRÈS LA MIGRATION

Une fois la migration réussie, voici ce qui a été fait:

### ✅ Changements Base de Données

1. **Champ `updatedAt` ajouté** sur 5 tables:
   - `Exercice`
   - `Tag`
   - `Entrainement`
   - `Echauffement`
   - `SituationMatch`

2. **Triggers PostgreSQL créés** pour mise à jour automatique

3. **Index créés** pour optimiser les requêtes de synchronisation

### ✅ Backend Prêt

- Endpoint `/api/sync/versions` fonctionnel
- Endpoint `/api/sync/health` fonctionnel
- Prisma Client généré avec les nouveaux champs

### ✅ Prochaines Étapes

1. **Adapter les 4 services restants** (1h):
   - `entrainement.service.ts`
   - `tag.service.ts`
   - `echauffement.service.ts`
   - `situationmatch.service.ts`

2. **Créer PreloadService** (30min)

3. **Tests complets** (1h)

4. **Déployer sur Vercel** (déjà configuré!)

---

## 🎉 CHECKLIST

- [ ] Fichier `.env` copié depuis `.env.codespaces`
- [ ] Migration Prisma exécutée avec succès
- [ ] Serveur démarre sans erreur
- [ ] `/api/sync/health` retourne OK
- [ ] Prisma Studio montre le champ `updatedAt`

---

**Exécutez ces commandes dans Codespaces et dites-moi le résultat !** 🚀
