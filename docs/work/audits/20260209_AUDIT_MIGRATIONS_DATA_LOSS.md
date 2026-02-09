# AUDIT — Perte de données critiques après migrations

**Statut** : WORK  
**Date** : 2026-02-09  
**Auteur** : Audit système  
**Contexte** : Problème récurrent — "Après migration, je perds mon rôle admin et les tags de base"

---

## 1. SYMPTÔMES OBSERVÉS

### 1.1 Données perdues après migration

**Éléments critiques perdus** :
1. ❌ **Rôle ADMIN** : Compte principal passe de ADMIN à USER
2. ❌ **Tags de base** : Tags créés par seed.js disparaissent
3. ❌ **Association workspace** : Liens entre utilisateurs et workspace BASE

**Impact** :
- 🔴 **CRITIQUE** : Perte d'accès admin → Impossible de gérer l'application
- 🔴 **CRITIQUE** : Perte des tags → Données métier incohérentes
- 🟠 **MAJEUR** : Nécessité de recréer manuellement les données

### 1.2 Historique des migrations récentes

**Migrations identifiées** :
```
backend/prisma/migrations/
├── 20260129_remove_password_hash/        ← Suppression passwordHash (Supabase)
├── 20260202213000_tag_unique_per_workspace/  ← Contrainte unique tags
├── 20260202_add_workspace_is_base/       ← Ajout champ isBase
├── 20260205_add_user_is_tester/          ← Ajout champ isTester
└── 20260209_add_workspace_role_enum/     ← Enum WorkspaceRole (SUSPECT)
```

**Migration suspecte** : `20260209_add_workspace_role_enum`

---

## 2. ANALYSE TECHNIQUE

### 2.1 Migration 20260209_add_workspace_role_enum

**Fichier** : `backend/prisma/migrations/20260209_add_workspace_role_enum/migration.sql`

```sql
-- CreateEnum
CREATE TYPE "WorkspaceRole" AS ENUM ('MANAGER', 'MEMBER', 'VIEWER');

-- AlterTable
ALTER TABLE "WorkspaceUser" ALTER COLUMN "role" DROP DEFAULT;
UPDATE "WorkspaceUser" SET "role" = UPPER("role") WHERE "role" IS NOT NULL;
UPDATE "WorkspaceUser" SET "role" = 'MEMBER' WHERE "role" NOT IN ('MANAGER', 'MEMBER', 'VIEWER');
ALTER TABLE "WorkspaceUser" ALTER COLUMN "role" TYPE "WorkspaceRole" USING ("role"::text::"WorkspaceRole");
ALTER TABLE "WorkspaceUser" ALTER COLUMN "role" SET DEFAULT 'MEMBER'::"WorkspaceRole";
```

**Problème identifié** :
- Ligne 7 : `UPDATE "WorkspaceUser" SET "role" = 'MEMBER' WHERE "role" NOT IN ('MANAGER', 'MEMBER', 'VIEWER')`
- ❌ **Force tous les rôles invalides à MEMBER**
- ❌ **Pas de préservation des rôles existants**

**Cause probable** :
- Si les données existantes avaient des rôles en minuscules ou différents
- La migration les écrase sans préserver l'intention

### 2.2 Schéma Prisma actuel

**Fichier** : `backend/prisma/schema.prisma`

```prisma
enum UserRole {
  USER
  ADMIN
}

enum WorkspaceRole {
  MANAGER
  MEMBER
  VIEWER
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  role      UserRole @default(USER)  // ← Rôle GLOBAL de l'utilisateur
  // ...
  workspaces WorkspaceUser[]
}

model WorkspaceUser {
  id          String        @id @default(uuid())
  workspaceId String
  userId      String
  role        WorkspaceRole @default(MEMBER)  // ← Rôle DANS le workspace
  // ...
}
```

**Observation critique** :
- ✅ `User.role` : Rôle global (USER | ADMIN)
- ✅ `WorkspaceUser.role` : Rôle dans un workspace (MANAGER | MEMBER | VIEWER)
- ❌ **Aucun lien automatique** entre les deux
- ❌ **Un ADMIN global peut être VIEWER dans un workspace**

### 2.3 Script seed.js actuel

**Fichier** : `backend/prisma/seed.js`

**Création admin** (lignes 30-42) :
```javascript
const adminEmail = 'admin@ultimate.com';
await prisma.user.upsert({
  where: { email: adminEmail },
  update: { nom: 'Admin', role: 'ADMIN', isActive: true },
  create: { 
    id: uuidv4(), 
    email: adminEmail, 
    nom: 'Admin', 
    prenom: 'Ultimate', 
    role: 'ADMIN',  // ← UserRole.ADMIN ✅
    isActive: true 
  },
});
```

**Création workspace BASE** (lignes 44-61) :
```javascript
const existingBaseWorkspace = await prisma.workspace.findFirst({ 
  where: { isBase: true } 
});
if (existingBaseWorkspace) {
  seedWorkspaceId = existingBaseWorkspace.id;
} else {
  const createdBaseWorkspace = await prisma.workspace.create({
    data: {
      id: uuidv4(),
      name: 'Base',
      isBase: true,
    },
  });
  seedWorkspaceId = createdBaseWorkspace.id;
}
```

**Association admin au workspace BASE** :
❌ **ABSENT** : Le script ne crée PAS de WorkspaceUser pour l'admin
❌ **PROBLÈME** : L'admin n'a aucun accès au workspace BASE

**Création tags** (lignes 64-113) :
```javascript
const tagsToCreate = [
  { label: 'Échauffement', category: TAG_CATEGORIES.OBJECTIF, color: '#4285F4' },
  // ... 20+ tags
];

for (const tagData of tagsToCreate) {
  const tag = await prisma.tag.upsert({
    where: { 
      workspaceId_label_category: { 
        workspaceId: seedWorkspaceId,  // ← Tags liés au workspace BASE
        label: tagData.label, 
        category: tagData.category 
      } 
    },
    update: { color: tagData.color, level: tagData.level },
    create: { ...tagData, id: uuidv4(), workspaceId: seedWorkspaceId },
  });
}
```

**Problème identifié** :
- ✅ Tags créés avec `workspaceId: seedWorkspaceId`
- ❌ **Si workspace BASE supprimé** → Tags supprimés (CASCADE)
- ❌ **Si seedWorkspaceId incorrect** → Tags orphelins ou non créés

### 2.4 Script seed-auth.js (OBSOLÈTE)

**Fichier** : `backend/prisma/seed-auth.js`

```javascript
const hashedPassword = await bcrypt.hash('Ultim@t+', 12);

const admin = await prisma.user.create({
  data: {
    email: 'admin@ultimate.com',
    passwordHash: hashedPassword,  // ❌ CHAMP SUPPRIMÉ
    nom: 'Admin',
    prenom: 'Ultimate',
    role: 'ADMIN',
    isActive: true,
    iconUrl: null
  }
});
```

**Problème** :
- ❌ **Script obsolète** : Utilise `passwordHash` (supprimé dans migration 20260129)
- ❌ **Ne fonctionne plus** depuis passage à Supabase Auth
- ❌ **Doit être supprimé ou mis à jour**

---

## 3. CAUSES RACINES IDENTIFIÉES

### 3.1 Cause 1 : Incohérence seed.js

**Problème** :
- `seed.js` crée un utilisateur ADMIN global
- Mais ne l'associe PAS au workspace BASE
- Résultat : Admin sans accès aux données

**Preuve** :
```javascript
// seed.js ligne 126-147 (section exercices)
await prisma.workspace.create({
  data: {
    workspaceId: baseWorkspace.id,
    userId: user.id,
    role: 'VIEWER'  // ❌ VIEWER au lieu de MANAGER
  }
});
```

**Impact** :
- Admin créé mais pas lié au workspace
- Ou lié avec rôle VIEWER (insuffisant)

### 3.2 Cause 2 : Migration destructrice sans préservation

**Problème** :
- Migration `20260209_add_workspace_role_enum` force les rôles à MEMBER
- Aucune logique de préservation des rôles existants
- Pas de mapping intelligent (ex: admin → MANAGER)

**Preuve** :
```sql
UPDATE "WorkspaceUser" SET "role" = 'MEMBER' 
WHERE "role" NOT IN ('MANAGER', 'MEMBER', 'VIEWER');
```

**Impact** :
- Tous les rôles non standard → MEMBER
- Perte d'information sur les permissions

### 3.3 Cause 3 : Absence de données protégées

**Problème** :
- Aucune liste formelle de "données à ne jamais perdre"
- Pas de vérification post-migration
- Pas de rollback automatique si invariants violés

**Données critiques non protégées** :
1. Utilisateur admin principal
2. Tags de base (20+ tags métier)
3. Workspace BASE
4. Associations admin ↔ workspace

### 3.4 Cause 4 : Seed non idempotent

**Problème** :
- `seed.js` utilise `upsert` mais logique incomplète
- Ne gère pas les associations existantes
- Peut créer des doublons ou laisser des orphelins

**Exemple** :
```javascript
// Crée workspace BASE si absent
// Mais ne vérifie PAS si admin déjà associé
// Résultat : admin peut ne jamais être lié
```

---

## 4. INVARIANTS MÉTIER VIOLÉS

### 4.1 Invariant ADM-1 : Au moins 1 admin actif

**Règle** : Il doit toujours exister au moins 1 utilisateur avec `role = ADMIN` et `isActive = true`

**Violation** :
- Migration peut transformer dernier admin en USER
- Aucune protection dans les migrations

**Conséquence** :
- 🔴 **LOCKOUT TOTAL** : Impossible de gérer l'application

### 4.2 Invariant WS-1 : Workspace BASE existe toujours

**Règle** : Le workspace avec `isBase = true` ne doit jamais être supprimé

**Violation** :
- Aucune contrainte DB empêchant suppression
- Seed peut échouer si BASE absent

**Conséquence** :
- 🔴 **Perte des tags de base**
- 🔴 **Seed échoue**

### 4.3 Invariant TAG-1 : Tags de base préservés

**Règle** : Les tags créés par seed (20+ tags) doivent être préservés

**Violation** :
- Tags liés à workspace BASE via CASCADE
- Si BASE supprimé → Tags supprimés

**Conséquence** :
- 🔴 **Perte de données métier**
- 🟠 **Incohérence exercices/entraînements**

### 4.4 Invariant AUTH-1 : Admin a accès à BASE

**Règle** : L'utilisateur admin doit avoir accès au workspace BASE avec rôle MANAGER

**Violation** :
- Seed ne crée pas l'association
- Ou crée avec rôle VIEWER

**Conséquence** :
- 🟠 **Admin sans pouvoir dans BASE**
- 🟠 **Impossibilité de gérer les tags**

---

## 5. STRATÉGIE DE MIGRATION SÉCURISÉE

### 5.1 Principe 1 : Données protégées explicites

**Définition** : Liste contractuelle des données à ne JAMAIS perdre

**Données protégées** :
```yaml
protected_data:
  users:
    - email: admin@ultimate.com
      role: ADMIN
      isActive: true
  
  workspaces:
    - name: BASE
      isBase: true
  
  tags:
    - workspace: BASE
      count_min: 20
      categories: [objectif, travail_specifique, niveau, temps, format, theme_entrainement]
  
  workspace_users:
    - user: admin@ultimate.com
      workspace: BASE
      role: MANAGER
```

### 5.2 Principe 2 : Vérification pré-migration

**Étapes** :
1. Lister les données protégées actuelles
2. Sauvegarder leur état
3. Exécuter migration
4. Vérifier invariants
5. Rollback si violation

**Script de vérification** :
```javascript
async function verifyInvariants() {
  // ADM-1 : Au moins 1 admin actif
  const adminCount = await prisma.user.count({
    where: { role: 'ADMIN', isActive: true }
  });
  if (adminCount === 0) throw new Error('INVARIANT ADM-1 VIOLATED');
  
  // WS-1 : Workspace BASE existe
  const baseWorkspace = await prisma.workspace.findFirst({
    where: { isBase: true }
  });
  if (!baseWorkspace) throw new Error('INVARIANT WS-1 VIOLATED');
  
  // TAG-1 : Tags de base présents
  const tagCount = await prisma.tag.count({
    where: { workspaceId: baseWorkspace.id }
  });
  if (tagCount < 20) throw new Error('INVARIANT TAG-1 VIOLATED');
  
  // AUTH-1 : Admin a accès BASE
  const adminWorkspace = await prisma.workspaceUser.findFirst({
    where: {
      workspace: { isBase: true },
      user: { role: 'ADMIN' },
      role: 'MANAGER'
    }
  });
  if (!adminWorkspace) throw new Error('INVARIANT AUTH-1 VIOLATED');
}
```

### 5.3 Principe 3 : Migration avec préservation

**Règle** : Toute migration modifiant des données doit préserver les invariants

**Exemple migration WorkspaceRole** :
```sql
-- ❌ MAUVAIS : Force tous à MEMBER
UPDATE "WorkspaceUser" SET "role" = 'MEMBER' 
WHERE "role" NOT IN ('MANAGER', 'MEMBER', 'VIEWER');

-- ✅ BON : Préserve les admins
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

### 5.4 Principe 4 : Seed idempotent et complet

**Règle** : Le seed doit pouvoir s'exécuter plusieurs fois sans effet de bord

**Corrections requises dans seed.js** :
```javascript
// 1. Créer admin
const admin = await prisma.user.upsert({
  where: { email: 'admin@ultimate.com' },
  update: { role: 'ADMIN', isActive: true },
  create: { 
    id: uuidv4(), 
    email: 'admin@ultimate.com', 
    nom: 'Admin', 
    prenom: 'Ultimate', 
    role: 'ADMIN', 
    isActive: true 
  },
});

// 2. Créer workspace BASE
const baseWorkspace = await prisma.workspace.upsert({
  where: { name: 'BASE' },  // ❌ PROBLÈME : name n'est pas unique
  update: { isBase: true },
  create: { 
    id: uuidv4(), 
    name: 'BASE', 
    isBase: true 
  },
});

// 3. Associer admin au workspace BASE avec rôle MANAGER
await prisma.workspaceUser.upsert({
  where: { 
    workspaceId_userId: { 
      workspaceId: baseWorkspace.id, 
      userId: admin.id 
    } 
  },
  update: { role: 'MANAGER' },
  create: {
    id: uuidv4(),
    workspaceId: baseWorkspace.id,
    userId: admin.id,
    role: 'MANAGER'
  },
});

// 4. Créer tags
// (code existant OK)
```

### 5.5 Principe 5 : Documentation contractuelle

**Règle** : Chaque migration doit documenter son impact sur les données protégées

**Template migration** :
```markdown
# Migration: 20260209_add_workspace_role_enum

## Objectif
Ajouter enum WorkspaceRole pour typer les rôles workspace

## Impact sur données protégées
- ✅ ADM-1 : Non impacté (User.role distinct)
- ⚠️ AUTH-1 : Risque si rôles non standard
- ✅ WS-1 : Non impacté
- ✅ TAG-1 : Non impacté

## Préservation
- Mapping admin → MANAGER
- Mapping existants → Préservés
- Invalides → MEMBER (par défaut)

## Vérification post-migration
```sql
SELECT COUNT(*) FROM "WorkspaceUser" wu
JOIN "User" u ON u.id = wu."userId"
WHERE u.role = 'ADMIN' AND wu.role != 'MANAGER';
-- Doit retourner 0
```
```

---

## 6. CORRECTIONS IMMÉDIATES REQUISES

### 6.1 Correction 1 : Réparer seed.js

**Fichier** : `backend/prisma/seed.js`

**Modifications** :
1. Ajouter création WorkspaceUser pour admin
2. Utiliser contrainte unique correcte pour workspace
3. Vérifier invariants après seed

### 6.2 Correction 2 : Supprimer seed-auth.js obsolète

**Fichier** : `backend/prisma/seed-auth.js`

**Action** : Supprimer ou archiver (utilise passwordHash supprimé)

### 6.3 Correction 3 : Créer script de vérification

**Fichier** : `backend/prisma/verify-invariants.js`

**Contenu** : Script de vérification des 4 invariants

### 6.4 Correction 4 : Créer script de réparation

**Fichier** : `backend/prisma/repair-data.js`

**Objectif** : Réparer les données perdues après migration

**Actions** :
1. Recréer admin si absent
2. Recréer workspace BASE si absent
3. Associer admin à BASE avec MANAGER
4. Recréer tags de base si absents

---

## 7. DOCUMENT DE RÉFÉRENCE À CRÉER

**Fichier** : `docs/reference/database/MIGRATION_STRATEGY.md`

**Contenu** :
1. Liste des données protégées (contractuel)
2. Invariants métier à respecter
3. Processus de migration sécurisé
4. Scripts de vérification/réparation
5. Template de documentation migration
6. Checklist pré/post migration

---

## 8. TESTS DE VALIDATION

### 8.1 Test 1 : Migration avec admin existant

**Étapes** :
1. Créer admin via seed
2. Exécuter migration
3. Vérifier admin toujours ADMIN
4. Vérifier admin a accès BASE avec MANAGER

**Résultat attendu** : ✅ Aucune perte de données

### 8.2 Test 2 : Seed idempotent

**Étapes** :
1. Exécuter seed
2. Compter admin, workspace, tags
3. Exécuter seed à nouveau
4. Vérifier même nombre (pas de doublons)

**Résultat attendu** : ✅ Idempotent

### 8.3 Test 3 : Réparation après perte

**Étapes** :
1. Simuler perte admin (UPDATE role = 'USER')
2. Exécuter script réparation
3. Vérifier admin restauré
4. Vérifier accès BASE restauré

**Résultat attendu** : ✅ Données restaurées

---

## 9. PROCHAINES ÉTAPES

1. ✅ Créer document MIGRATION_STRATEGY.md
2. ✅ Corriger seed.js (ajouter WorkspaceUser admin)
3. ✅ Créer verify-invariants.js
4. ✅ Créer repair-data.js
5. ✅ Supprimer seed-auth.js obsolète
6. ✅ Tester seed idempotent
7. ✅ Archiver cet audit dans docs/history/2026/

---

**FIN DE L'AUDIT**
