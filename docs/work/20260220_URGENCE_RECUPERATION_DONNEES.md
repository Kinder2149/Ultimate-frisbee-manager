# URGENCE — RÉCUPÉRATION DONNÉES PRODUCTION

**Date** : 2026-02-20 15h26  
**Statut** : CRITIQUE  
**Incident** : Perte de données production suite réapplication migrations

---

## 🚨 INCIDENT

**Heure** : 14h04 UTC (15h04 heure française)  
**Cause** : Réapplication automatique de toutes les migrations Prisma lors d'un déploiement Vercel  
**Impact** : 
- Perte de tous les workspaces créés après les migrations initiales
- Perte des rôles admin utilisateurs
- Perte de toutes les données créées sur le site entre les migrations

---

## 🔍 CAUSE RACINE

### Déclencheur
Déploiement Vercel automatique à 14h04 UTC qui a exécuté :
```bash
npx prisma migrate deploy
```

### Mécanisme
1. Vercel build exécute `postinstall: prisma generate` (package.json ligne 10)
2. Le déploiement déclenche les migrations via script `migrate-vercel.js`
3. `prisma migrate deploy` réapplique TOUTES les migrations (11 migrations)
4. La base de données est réinitialisée à l'état des migrations

### Migrations réappliquées
```
20250125000000_add_user_role_enum
20250125000001_normalize_user_roles
20251123000000_baseline
20251123182335_v1_1
20260129_remove_password_hash
20260202213000_tag_unique_per_workspace
20260202_add_workspace_is_base
20260205_add_user_is_tester
20260209210844_fix_user_role_enum
20260209_add_workspace_role_enum
20260220113451_add_duree_joueurs_fields
```

---

## 💾 ÉTAT ACTUEL

### Données conservées
✅ Users de base (créés par migrations/seed)  
✅ Structure base de données intacte  
✅ Authentification Supabase Auth (users visibles dans Auth)

### Données perdues
❌ Workspaces créés sur le site  
❌ Rôles admin utilisateurs  
❌ Exercices/Entraînements créés sur le site  
❌ Tags personnalisés  
❌ Toutes données créées entre migrations

---

## 🛡️ SOLUTION MISE EN PLACE

### 1. Script de migration sécurisé créé

**Fichier** : `backend/scripts/safe-migrate-vercel.js`

**Protections** :
- Vérification existence table `_prisma_migrations`
- Comptage migrations existantes
- Détection données sans migrations (DANGER)
- Blocage automatique si risque perte données
- Logs détaillés pour audit

**Logique** :
```javascript
if (totalData > 0 && migrationCount === 0) {
  console.error('🚨 ERREUR CRITIQUE: Des données existent mais aucune migration enregistrée!');
  console.error('🚨 MIGRATION ANNULÉE pour protection des données.');
  process.exit(1);
}
```

### 2. Modification package.json

**Avant** :
```json
"db:migrate:vercel": "node scripts/migrate-vercel.js"
```

**Après** :
```json
"db:migrate:vercel": "node scripts/safe-migrate-vercel.js"
```

---

## 🔧 RÉCUPÉRATION IMMÉDIATE

### Étape 1 : Restaurer rôles admin manuellement

**Connectez-vous à Supabase SQL Editor** et exécutez :

```sql
-- Identifier votre user
SELECT id, email, role FROM "User" WHERE email = 'votre-email@example.com';

-- Restaurer le rôle ADMIN
UPDATE "User" 
SET role = 'ADMIN' 
WHERE email = 'votre-email@example.com';

-- Vérifier
SELECT id, email, role FROM "User" WHERE email = 'votre-email@example.com';
```

### Étape 2 : Recréer workspaces de base

```sql
-- Créer un workspace de base
INSERT INTO "Workspace" (id, name, "isBase", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Mon Workspace',
  false,
  NOW(),
  NOW()
)
RETURNING id, name;

-- Associer l'admin au workspace (remplacer les UUIDs)
INSERT INTO "WorkspaceUser" (id, "workspaceId", "userId", role, "createdAt")
VALUES (
  gen_random_uuid(),
  'UUID_WORKSPACE_CI_DESSUS',
  'UUID_VOTRE_USER',
  'MANAGER',
  NOW()
);
```

### Étape 3 : Vérifier l'état

```sql
-- Vérifier vos workspaces
SELECT w.id, w.name, wu.role 
FROM "Workspace" w
JOIN "WorkspaceUser" wu ON w.id = wu."workspaceId"
JOIN "User" u ON wu."userId" = u.id
WHERE u.email = 'votre-email@example.com';
```

---

## 📋 PROCÉDURE POUR ÉVITER RÉPÉTITION

### 1. Toujours utiliser le script sécurisé

**NE JAMAIS exécuter directement** :
```bash
❌ prisma migrate deploy
❌ prisma migrate reset
❌ prisma db push --force-reset
```

**TOUJOURS utiliser** :
```bash
✅ npm run db:migrate:vercel  # Utilise le script sécurisé
```

### 2. Vérifier avant chaque déploiement

**Checklist pré-déploiement** :
- [ ] Vérifier que `package.json` utilise `safe-migrate-vercel.js`
- [ ] Vérifier qu'aucune migration destructive n'est présente
- [ ] Tester en local avant de pusher
- [ ] Vérifier les logs Vercel après déploiement

### 3. Sauvegardes régulières

**Plan Supabase gratuit** :
- Pas de backups automatiques
- Pas de PITR (Point-in-Time Recovery)

**Recommandation URGENTE** :
1. Passer à Supabase Pro (25$/mois) pour backups automatiques
2. OU exporter régulièrement les données manuellement :
   ```bash
   npm run export:run
   ```

### 4. Monitoring déploiements

**Configurer alertes Vercel** :
- Notification email sur chaque déploiement
- Vérifier logs immédiatement après déploiement
- Tester application après chaque déploiement

---

## 🎯 ACTIONS IMMÉDIATES REQUISES

### PRIORITÉ 1 : Restaurer accès admin
1. Exécuter requête SQL restauration rôle admin (ci-dessus)
2. Vérifier connexion application
3. Vérifier permissions

### PRIORITÉ 2 : Recréer workspaces essentiels
1. Identifier workspaces perdus (depuis mémoire/notes)
2. Recréer via SQL ou interface
3. Associer users aux workspaces

### PRIORITÉ 3 : Committer solution
```bash
git add backend/scripts/safe-migrate-vercel.js
git add backend/package.json
git commit -m "fix(migrations): ajout script sécurisé pour éviter perte données"
git push origin feature/mobile-view
```

### PRIORITÉ 4 : Déployer solution
```bash
# Merger dans develop
git checkout develop
git merge feature/mobile-view
git push origin develop

# Vérifier déploiement Vercel Preview
# Si OK, merger dans main
git checkout main
git merge develop
git push origin main
```

---

## 📊 LEÇONS APPRISES

### Problème identifié
- `prisma migrate deploy` réapplique TOUTES les migrations si état incohérent
- Aucune protection contre perte données dans script original
- Déploiements Vercel automatiques sans vérification

### Solutions implémentées
- Script de migration sécurisé avec vérifications
- Blocage automatique si risque détecté
- Logs détaillés pour audit

### Améliorations futures
1. Passer à Supabase Pro pour backups
2. Mettre en place exports automatiques réguliers
3. Tester migrations en staging avant production
4. Documenter procédure de récupération

---

## 🔗 RÉFÉRENCES

**Fichiers modifiés** :
- `backend/scripts/safe-migrate-vercel.js` (nouveau)
- `backend/package.json` (ligne 18)

**Documentation Prisma** :
- https://www.prisma.io/docs/concepts/components/prisma-migrate
- https://www.prisma.io/docs/guides/migrate/production-troubleshooting

**Support Supabase** :
- https://supabase.com/docs/guides/platform/backups

---

**Document créé le** : 2026-02-20 15h26  
**Auteur** : Cascade AI  
**Statut** : WORK (à archiver après résolution)
