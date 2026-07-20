# STRATÉGIE DE MIGRATION — Données protégées et invariants métier

**Statut** : REFERENCE  
**Date de création** : 9 février 2026  
**Version** : 1.0  
**Auteur** : Architecture système

---

## 📋 TABLE DES MATIÈRES

1. [Introduction](#introduction)
2. [Données protégées](#données-protégées)
3. [Invariants métier](#invariants-métier)
4. [Processus de migration sécurisé](#processus-de-migration-sécurisé)
5. [Scripts de vérification et réparation](#scripts-de-vérification-et-réparation)
6. [Template de migration](#template-de-migration)
7. [Checklist pré/post migration](#checklist-prépost-migration)
8. [Gestion des erreurs](#gestion-des-erreurs)

---

## 1. INTRODUCTION

### 1.1 Objectif

Ce document définit **de manière contractuelle** :
- Les données critiques à ne **JAMAIS** perdre
- Les invariants métier à **TOUJOURS** respecter
- Le processus de migration sécurisé à suivre
- Les outils de vérification et réparation

### 1.2 Périmètre

**Couvert** :
- Migrations Prisma (schéma DB)
- Seed de données initiales
- Réparation après migration défaillante

**Exclus** :
- Migrations applicatives (code)
- Déploiements infrastructure
- Backups/restore complets

### 1.3 Principe fondamental

> **Toute migration doit préserver les données protégées et respecter les invariants métier.**  
> En cas de violation, la migration doit être annulée (rollback) ou réparée immédiatement.

---

## 2. DONNÉES PROTÉGÉES

### 2.1 Définition

**Données protégées** : Données critiques dont la perte entraîne un dysfonctionnement majeur de l'application.

### 2.2 Liste contractuelle

#### 2.2.1 Utilisateur admin principal

**Table** : `User`

**Critères** :
```yaml
protected_users:
  - email: admin@ultimate.com
    role: ADMIN
    isActive: true
```

**Raison** : Compte administrateur principal permettant la gestion de l'application.

**Impact si perdu** : 🔴 **CRITIQUE** — Lockout total, impossibilité de gérer l'application.

---

#### 2.2.2 Workspace BASE

**Table** : `Workspace`

**Critères** :
```yaml
protected_workspaces:
  - name: BASE
    isBase: true
```

**Raison** : Workspace contenant les données de référence (tags, exercices de base).

**Impact si perdu** : 🔴 **CRITIQUE** — Perte des tags de base, seed échoue.

---

#### 2.2.3 Tags de base

**Table** : `Tag`

**Critères** :
```yaml
protected_tags:
  workspace: BASE
  count_min: 20
  categories:
    - objectif
    - travail_specifique
    - niveau
    - temps
    - format
    - theme_entrainement
```

**Liste complète** :
- **Objectif** : Échauffement, Technique, Tactique, Physique
- **Travail spécifique** : Passes, Réceptions, Défense
- **Niveau** : Débutant (1), Intermédiaire (2), Avancé (3)
- **Temps** : 5-10 min, 10-15 min, 15-30 min
- **Format** : Individuel, Binôme, Équipe
- **Thème entraînement** : Endurance, Vitesse, Coordination, Stratégie, Mental

**Raison** : Tags métier essentiels pour la classification des exercices et entraînements.

**Impact si perdu** : 🔴 **CRITIQUE** — Incohérence données métier, impossibilité de filtrer/trier.

---

#### 2.2.4 Association admin ↔ workspace BASE

**Table** : `WorkspaceUser`

**Critères** :
```yaml
protected_workspace_users:
  - user: admin@ultimate.com
    workspace: BASE
    role: MANAGER
```

**Raison** : L'admin doit pouvoir gérer le workspace BASE (créer/modifier tags, exercices).

**Impact si perdu** : 🟠 **MAJEUR** — Admin sans pouvoir dans BASE, impossibilité de gérer les tags.

---

### 2.3 Ajout de nouvelles données protégées

**Processus** :
1. Identifier la donnée critique
2. Documenter raison + impact si perdu
3. Ajouter critères YAML dans ce document
4. Mettre à jour `verify-invariants.js`
5. Versionner ce document (v1.1, v1.2, etc.)

---

## 3. INVARIANTS MÉTIER

### 3.1 Définition

**Invariant métier** : Règle qui doit **toujours** être vraie, quel que soit l'état de l'application.

### 3.2 Liste contractuelle

#### Invariant ADM-1 : Au moins 1 admin actif

**Règle** :
```sql
SELECT COUNT(*) FROM "User" 
WHERE role = 'ADMIN' AND "isActive" = true;
-- Doit retourner >= 1
```

**Violation** : 🔴 **CRITIQUE** — Lockout total

**Action si violé** : Créer admin via `repair-data.js`

---

#### Invariant WS-1 : Workspace BASE existe

**Règle** :
```sql
SELECT COUNT(*) FROM "Workspace" 
WHERE "isBase" = true;
-- Doit retourner >= 1
```

**Violation** : 🔴 **CRITIQUE** — Seed échoue, perte tags

**Action si violé** : Créer workspace BASE via `repair-data.js`

---

#### Invariant TAG-1 : Tags de base présents

**Règle** :
```sql
SELECT COUNT(*) FROM "Tag" t
JOIN "Workspace" w ON w.id = t."workspaceId"
WHERE w."isBase" = true;
-- Doit retourner >= 20
```

**Violation** : 🔴 **CRITIQUE** — Incohérence métier

**Action si violé** : Recréer tags via `repair-data.js`

---

#### Invariant AUTH-1 : Admin a accès BASE avec MANAGER

**Règle** :
```sql
SELECT COUNT(*) FROM "WorkspaceUser" wu
JOIN "User" u ON u.id = wu."userId"
JOIN "Workspace" w ON w.id = wu."workspaceId"
WHERE u.role = 'ADMIN' 
  AND u."isActive" = true
  AND w."isBase" = true
  AND wu.role = 'MANAGER';
-- Doit retourner >= 1
```

**Violation** : 🟠 **MAJEUR** — Admin sans pouvoir

**Action si violé** : Créer association via `repair-data.js`

---

### 3.3 Ajout de nouveaux invariants

**Processus** :
1. Identifier la règle métier
2. Formaliser en SQL
3. Documenter violation + action
4. Ajouter vérification dans `verify-invariants.js`
5. Versionner ce document

---

## 4. PROCESSUS DE MIGRATION SÉCURISÉ

### 4.1 Étapes obligatoires

```
┌─────────────────────────────────────────────────────────────┐
│                  PROCESSUS DE MIGRATION                      │
└─────────────────────────────────────────────────────────────┘

1. PRÉ-MIGRATION
   ├─ Vérifier invariants actuels (verify-invariants.js)
   ├─ Sauvegarder état données protégées
   └─ Documenter impact migration (template)

2. MIGRATION
   ├─ Exécuter migration Prisma
   └─ Appliquer logique de préservation

3. POST-MIGRATION
   ├─ Vérifier invariants (verify-invariants.js)
   ├─ Si violation → Réparer (repair-data.js)
   └─ Générer rapport

4. VALIDATION
   ├─ Tester application
   └─ Confirmer données protégées intactes
```

### 4.2 Commandes

**Vérification pré-migration** :
```bash
cd backend
node prisma/verify-invariants.js
```

**Migration** :
```bash
npx prisma migrate dev --name <nom_migration>
```

**Vérification post-migration** :
```bash
node prisma/verify-invariants.js
```

**Réparation si nécessaire** :
```bash
node prisma/repair-data.js
```

### 4.3 Logique de préservation

**Principe** : Toute migration modifiant des données doit inclure une logique de préservation.

**Exemple — Migration WorkspaceRole** :

❌ **MAUVAIS** (destructif) :
```sql
UPDATE "WorkspaceUser" 
SET "role" = 'MEMBER' 
WHERE "role" NOT IN ('MANAGER', 'MEMBER', 'VIEWER');
```

✅ **BON** (préservation) :
```sql
-- Préserver les admins → MANAGER
UPDATE "WorkspaceUser" wu
SET "role" = CASE
  WHEN EXISTS (
    SELECT 1 FROM "User" u 
    WHERE u.id = wu."userId" AND u.role = 'ADMIN'
  ) THEN 'MANAGER'
  WHEN wu."role" NOT IN ('MANAGER', 'MEMBER', 'VIEWER') THEN 'MEMBER'
  ELSE wu."role"
END;
```

---

## 5. SCRIPTS DE VÉRIFICATION ET RÉPARATION

### 5.1 verify-invariants.js

**Localisation** : `backend/prisma/verify-invariants.js`

**Objectif** : Vérifier que tous les invariants sont respectés.

**Usage** :
```bash
node prisma/verify-invariants.js
```

**Sortie** :
```
🔍 Vérification des invariants métier...

✅ ADM-1: 1 admin(s) actif(s) trouvé(s)
✅ WS-1: Workspace BASE trouvé (id: xxx, name: BASE)
✅ TAG-1: 21 tags trouvés dans workspace BASE
✅ AUTH-1: Admin admin@ultimate.com a accès BASE avec rôle MANAGER

✅ Tous les invariants sont respectés !
```

**Code retour** :
- `0` : Tous les invariants OK
- `1` : Au moins 1 invariant violé

---

### 5.2 repair-data.js

**Localisation** : `backend/prisma/repair-data.js`

**Objectif** : Réparer les données critiques si invariants violés.

**Usage** :
```bash
node prisma/repair-data.js
```

**Actions** :
1. Réparer utilisateur admin
2. Réparer workspace BASE
3. Réparer association admin ↔ BASE
4. Réparer tags de base
5. Vérifier invariants

**Sortie** :
```
🔧 Démarrage de la réparation des données critiques...

🔧 Réparation utilisateur admin...
✅ Admin réparé: admin@ultimate.com (role: ADMIN)

🔧 Réparation workspace BASE...
✅ Workspace BASE existant: BASE

🔧 Réparation accès admin au workspace BASE...
✅ Admin associé au workspace BASE avec rôle MANAGER

🔧 Réparation tags de base...
✅ Tags réparés: 0 créé(s), 21 mis à jour

✅ Réparation terminée avec succès !

🔍 Vérification des invariants...
✅ Tous les invariants sont respectés !

🎉 Toutes les données critiques sont restaurées !
```

---

### 5.3 seed.js

**Localisation** : `backend/prisma/seed.js`

**Objectif** : Initialiser les données de base (idempotent).

**Usage** :
```bash
npx prisma db seed
```

**Caractéristiques** :
- ✅ **Idempotent** : Peut être exécuté plusieurs fois sans effet de bord
- ✅ **Préserve admin** : Utilise `upsert` pour admin
- ✅ **Préserve workspace BASE** : Utilise `findFirst` ou `create`
- ✅ **Associe admin à BASE** : Crée WorkspaceUser avec rôle MANAGER
- ✅ **Crée tags de base** : 21 tags dans workspace BASE

---

## 6. TEMPLATE DE MIGRATION

### 6.1 Documentation migration

**Fichier** : `backend/prisma/migrations/<timestamp>_<nom>/README.md`

```markdown
# Migration: <timestamp>_<nom>

## Objectif
[Description de la migration]

## Schéma modifié
- Table(s) : [liste]
- Colonne(s) : [liste]
- Contrainte(s) : [liste]

## Impact sur données protégées

### ADM-1 : Au moins 1 admin actif
- ☐ Non impacté
- ☐ Impacté → Logique de préservation : [décrire]

### WS-1 : Workspace BASE existe
- ☐ Non impacté
- ☐ Impacté → Logique de préservation : [décrire]

### TAG-1 : Tags de base présents
- ☐ Non impacté
- ☐ Impacté → Logique de préservation : [décrire]

### AUTH-1 : Admin a accès BASE avec MANAGER
- ☐ Non impacté
- ☐ Impacté → Logique de préservation : [décrire]

## Logique de préservation

[Code SQL ou description de la logique]

## Vérification post-migration

```sql
-- Requête(s) SQL pour vérifier l'intégrité
```

## Rollback

[Procédure de rollback si nécessaire]
```

---

## 7. CHECKLIST PRÉ/POST MIGRATION

### 7.1 Checklist pré-migration

- [ ] Documentation migration créée (README.md)
- [ ] Impact sur données protégées analysé
- [ ] Logique de préservation définie
- [ ] Vérification invariants actuelle : `node prisma/verify-invariants.js`
- [ ] Backup base de données (si production)

### 7.2 Checklist post-migration

- [ ] Migration exécutée : `npx prisma migrate dev`
- [ ] Vérification invariants : `node prisma/verify-invariants.js`
- [ ] Si violation → Réparation : `node prisma/repair-data.js`
- [ ] Rapport généré et archivé
- [ ] Tests application OK
- [ ] Données protégées confirmées intactes

### 7.3 Checklist production

- [ ] Migration testée en développement
- [ ] Migration testée en staging
- [ ] Backup base production créé
- [ ] Fenêtre de maintenance planifiée
- [ ] Procédure de rollback prête
- [ ] Migration exécutée : `npx prisma migrate deploy`
- [ ] Vérification invariants production
- [ ] Monitoring post-migration (24h)

---

## 8. GESTION DES ERREURS

### 8.1 Erreur : Invariant violé après migration

**Symptôme** : `verify-invariants.js` retourne erreur

**Action** :
1. Identifier invariant violé (ADM-1, WS-1, TAG-1, AUTH-1)
2. Exécuter `node prisma/repair-data.js`
3. Vérifier à nouveau : `node prisma/verify-invariants.js`
4. Si toujours violé → Rollback migration

**Rollback** :
```bash
# Revenir à la migration précédente
npx prisma migrate resolve --rolled-back <migration_name>
npx prisma migrate dev
```

---

### 8.2 Erreur : Seed échoue

**Symptôme** : `npx prisma db seed` retourne erreur

**Causes possibles** :
1. Workspace BASE absent → Créer via `repair-data.js`
2. Contrainte unique violée → Vérifier doublons
3. Erreur réseau/DB → Réessayer

**Action** :
```bash
# Réparer données critiques
node prisma/repair-data.js

# Réessayer seed
npx prisma db seed
```

---

### 8.3 Erreur : Admin perdu après migration

**Symptôme** : Impossible de se connecter avec compte admin

**Action immédiate** :
```bash
# Réparer admin
node prisma/repair-data.js
```

**Vérification** :
```sql
SELECT email, role, "isActive" FROM "User" WHERE email = 'admin@ultimate.com';
-- Doit retourner : admin@ultimate.com | ADMIN | true
```

---

### 8.4 Erreur : Tags perdus après migration

**Symptôme** : Filtres tags vides, exercices sans tags

**Action immédiate** :
```bash
# Réparer tags
node prisma/repair-data.js
```

**Vérification** :
```sql
SELECT COUNT(*) FROM "Tag" t
JOIN "Workspace" w ON w.id = t."workspaceId"
WHERE w."isBase" = true;
-- Doit retourner >= 20
```

---

## 9. MAINTENANCE

### 9.1 Revue mensuelle

**Objectifs** :
- Vérifier que tous les invariants sont respectés
- Identifier nouvelles données critiques
- Mettre à jour ce document si nécessaire

**Actions** :
```bash
# Vérifier invariants
node prisma/verify-invariants.js

# Générer rapport
node prisma/verify-invariants.js > reports/invariants_$(date +%Y%m%d).txt
```

### 9.2 Versioning de ce document

**Règle** : Toute modification de ce document doit être versionnée.

**Format** :
```markdown
**Version** : 1.1  
**Date** : 2026-03-15  
**Changements** :
- Ajout invariant XYZ-1
- Modification critères tags protégés
```

---

## 10. RÉFÉRENCES

**Scripts** :
- `backend/prisma/verify-invariants.js` — Vérification invariants
- `backend/prisma/repair-data.js` — Réparation données
- `backend/prisma/seed.js` — Seed initial

**Documentation** :
- `docs/work/audits/20260209_AUDIT_MIGRATIONS_DATA_LOSS.md` — Audit perte données
- `docs/reference/ADMIN_RECOVERY.md` — Récupération admin

**Prisma** :
- https://www.prisma.io/docs/concepts/components/prisma-migrate

---

**FIN DU DOCUMENT DE RÉFÉRENCE**
