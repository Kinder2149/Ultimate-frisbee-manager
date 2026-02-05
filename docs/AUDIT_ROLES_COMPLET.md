# AUDIT COMPLET — Gouvernance des rôles

> **Date** : 5 février 2026  
> **Statut** : Audit pré-production  
> **Objectif** : Valider la conformité avec PLAN_ACTION_ROLES.md et identifier les blocages

---

## 📊 RÉSUMÉ EXÉCUTIF

### État global : ⚠️ PARTIELLEMENT CONFORME

**Progression réelle** : 64% (vs 45% annoncé dans ETAT_AVANCEMENT_ROLES.md)

| Phase | Statut réel | Blocages critiques |
|-------|-------------|-------------------|
| Phase 1 - Sécurisation BASE | 🟢 90% | ⚠️ Protection controller incomplète |
| Phase 2 - Normalisation workspace | 🔴 40% | ❌ Rôles legacy dans scripts |
| Phase 3 - Rôle Testeur | 🔴 30% | ❌ Logique partielle non documentée |
| Phase 4 - Permissions VIEWER | 🟢 100% | ✅ Aucun |
| Phase 5 - Frontend | 🔴 10% | ❌ Pas d'adaptation UI |

---

## 🔴 PROBLÈMES CRITIQUES BLOQUANTS

### 1. INCOHÉRENCE RÔLES LEGACY (Phase 2)

**Impact** : ÉLEVÉ — Risque de perte de permissions en production

#### Scripts utilisant encore OWNER/USER

**❌ `backend/prisma/seed-workspaces.js` (ligne 105)**
```javascript
role: 'MEMBER', // Rôle USER par défaut dans BASE
```
**Commentaire dit "USER" mais code utilise "MEMBER"** → Confusion

**❌ `backend/scripts/verify-production-auth.js` (ligne 137)**
```javascript
role: 'OWNER'
```
**Utilise OWNER au lieu de MANAGER**

**❌ `backend/scripts/sync-supabase-users.js` (ligne 95)**
```javascript
role: 'USER',
```
**Utilise USER au lieu de MEMBER**

**❌ `backend/controllers/workspace.controller.js` (ligne 633)**
```javascript
role: u.role ? String(u.role).toUpperCase() : 'USER',
```
**Défaut USER au lieu de MEMBER**

**❌ `backend/controllers/admin.controller.js` (ligne 184)**
```javascript
role: (role || 'USER').toUpperCase(),
```
**Défaut USER au lieu de MEMBER**

#### Normalisation partielle

**✅ `backend/controllers/workspace.controller.js` (lignes 547-548)**
```javascript
if (u.role === 'OWNER') u.role = 'MANAGER';
if (u.role === 'USER') u.role = 'MEMBER';
```
**Normalisation présente MAIS seulement dans adminSetWorkspaceUsers**

**Problème** : Normalisation non appliquée partout

---

### 2. PROTECTION BASE INCOMPLÈTE (Phase 1)

**Impact** : CRITIQUE — BASE modifiable par non-admin

#### Middleware baseMutationGuard ✅

**✅ `backend/middleware/workspace.middleware.js` (lignes 10-32)**
- Middleware existe et fonctionne
- Appliqué globalement dans routes/index.js
- Bloque POST/PUT/PATCH/DELETE si isBase=true et user non ADMIN

#### Protection controller INCOMPLÈTE ⚠️

**⚠️ `backend/controllers/workspace.controller.js`**

**Renommage BASE** (ligne 404-410) :
```javascript
if (String(existingWorkspace.name || '').trim().toUpperCase() === DEFAULT_WORKSPACE_NAME) {
  if (nextName.toUpperCase() !== DEFAULT_WORKSPACE_NAME) {
    return res.status(403).json({
      error: 'Le workspace BASE ne peut pas être renommé',
      code: 'WORKSPACE_BASE_PROTECTED',
    });
  }
}
```
**Problème** : Vérifie `name === 'BASE'` au lieu de `isBase === true`

**Suppression BASE** (ligne 459) :
```javascript
if (String(ws.name || '').trim().toUpperCase() === DEFAULT_WORKSPACE_NAME) {
```
**Problème** : Vérifie `name === 'BASE'` au lieu de `isBase === true`

**Risque** : Si BASE est renommé, la protection est contournée

---

### 3. RÔLE TESTEUR PARTIELLEMENT IMPLÉMENTÉ (Phase 3)

**Impact** : MOYEN — Fonctionnalité non documentée

#### Implémentation existante

**✅ `backend/middleware/workspace.middleware.js` (lignes 91-98)**
```javascript
const isTester = Boolean(req.user && req.user.isTester === true);
const isBase = Boolean(req.workspace && req.workspace.isBase === true);
if (isTester && isBase) {
  return res.status(403).json({
    error: 'Accès interdit: le workspace BASE est visible en listing uniquement pour les testeurs',
    code: 'TESTER_BASE_FORBIDDEN',
  });
}
```

**Problème** : 
- Logique existe mais champ `User.isTester` n'existe PAS dans schema.prisma
- Aucune migration créée
- Aucune documentation
- Non mentionné dans ETAT_AVANCEMENT_ROLES.md

**État réel** : Phase 3 à 30% (vs 0% annoncé)

---

### 4. FRONTEND NON ADAPTÉ (Phase 5)

**Impact** : ÉLEVÉ — UX incohérente avec permissions backend

#### Aucune gestion des rôles workspace

**❌ Pas de vérification du rôle dans les composants**
- Aucun `canEdit()`, `canCreate()`, `canDelete()` dans les composants métier
- Boutons de création/modification visibles pour VIEWER
- Aucun message d'erreur préventif

**❌ `frontend/src/app/core/services/workspace.service.ts`**
```typescript
export interface WorkspaceSummary {
  id: string;
  name: string;
  createdAt?: string;
  isBase?: boolean;
  role?: string;  // ✅ Présent mais non utilisé
}
```

**Seule utilisation trouvée** : `workspace-admin.component.ts` (ligne 90)
```typescript
const isManager = wsRole === 'MANAGER' || wsRole === 'OWNER';
```
**Problème** : Accepte encore OWNER (legacy)

---

## 🟡 PROBLÈMES MOYENS

### 5. COMMENTAIRES OBSOLÈTES

**`backend/routes/workspace.routes.js` (ligne 11)**
```javascript
// Routes OWNER pour la gestion de SON workspace courant
```
**Devrait dire** : "Routes MANAGER"

**`backend/controllers/workspace.controller.js` (ligne 655)**
```javascript
/**
 * OWNER – mettre à jour les réglages de SON workspace courant
```
**Devrait dire** : "MANAGER"

**`backend/scripts/verify-and-seed-auth.js` (ligne 96)**
```javascript
console.log(`  ✅ Admin ajouté au workspace BASE avec rôle OWNER`);
```
**Code utilise MANAGER mais log dit OWNER**

---

### 6. VALIDATION ENUM ABSENTE

**Impact** : MOYEN — Risque de valeurs invalides

**❌ Aucune validation Zod pour WorkspaceUser.role**
- Pas de schéma de validation
- Pas de middleware de validation
- Accepte n'importe quelle string

**Recommandation** : Créer validation dans validators/workspace.validator.js

---

## ✅ POINTS CONFORMES

### Phase 4 : Permissions VIEWER

**✅ Middleware `requireWorkspaceWrite`** (lignes 121-130)
- Bloque VIEWER correctement
- Autorise MANAGER et MEMBER
- Normalise les rôles legacy

**✅ Routes protégées**
- Toutes les routes POST/PUT/DELETE utilisent requireWorkspaceWrite
- Routes membres/settings utilisent requireWorkspaceManager
- Routes export protégées par requireAdmin

### Schema Prisma

**✅ `backend/prisma/schema.prisma`**
```prisma
model Workspace {
  isBase Boolean @default(false)  // ✅ Ligne 180
}

model WorkspaceUser {
  role String @default("MEMBER")  // ✅ Ligne 198
}
```

### Middleware baseMutationGuard

**✅ Protection BASE au niveau middleware**
- Appliqué globalement sur toutes les routes métier
- Vérifie `req.workspace.isBase === true`
- Bloque mutations si non ADMIN

---

## 📋 PLAN DE CORRECTION URGENT

### Priorité 1 : CRITIQUE (avant production)

#### 1.1 Corriger protection BASE dans controllers

**Fichier** : `backend/controllers/workspace.controller.js`

**Ligne 404** : Remplacer
```javascript
if (String(existingWorkspace.name || '').trim().toUpperCase() === DEFAULT_WORKSPACE_NAME) {
```
Par
```javascript
const wsData = await prisma.workspace.findUnique({ where: { id }, select: { isBase: true } });
if (wsData?.isBase === true) {
```

**Ligne 459** : Remplacer
```javascript
if (String(ws.name || '').trim().toUpperCase() === DEFAULT_WORKSPACE_NAME) {
```
Par
```javascript
if (ws.isBase === true) {
```

#### 1.2 Normaliser tous les scripts

**Fichiers à corriger** :
1. `backend/scripts/verify-production-auth.js` ligne 137 : `'OWNER'` → `'MANAGER'`
2. `backend/scripts/sync-supabase-users.js` ligne 95 : `'USER'` → `'MEMBER'`
3. `backend/controllers/workspace.controller.js` ligne 633 : `'USER'` → `'MEMBER'`
4. `backend/controllers/admin.controller.js` ligne 184 : `'USER'` → `'MEMBER'`
5. `backend/prisma/seed-workspaces.js` ligne 105 : Corriger commentaire

#### 1.3 Mettre à jour commentaires

**Fichiers à corriger** :
1. `backend/routes/workspace.routes.js` ligne 11 : OWNER → MANAGER
2. `backend/controllers/workspace.controller.js` ligne 655 : OWNER → MANAGER
3. `backend/scripts/verify-and-seed-auth.js` ligne 96 : OWNER → MANAGER

### Priorité 2 : HAUTE (post-production)

#### 2.1 Finaliser rôle Testeur

**Actions** :
1. Ajouter migration Prisma pour champ `User.isTester Boolean @default(false)`
2. Documenter dans GOUVERNANCE_ROLES_REFERENCE.md
3. Créer tests

#### 2.2 Adapter frontend

**Actions** :
1. Créer service de permissions : `PermissionsService`
2. Ajouter méthodes : `canCreate()`, `canEdit()`, `canDelete()`, `canExport()`
3. Adapter tous les composants métier
4. Masquer/désactiver boutons selon rôle

#### 2.3 Ajouter validation enum

**Actions** :
1. Créer `validators/workspace.validator.js`
2. Ajouter schéma Zod pour rôles workspace
3. Appliquer dans controllers

---

## 🎯 CHECKLIST PRÉ-PRODUCTION

### Backend

- [ ] ✅ Middleware baseMutationGuard appliqué globalement
- [ ] ✅ Middleware requireWorkspaceWrite fonctionne
- [ ] ✅ Schema Prisma avec isBase et role=MEMBER
- [ ] ⚠️ Protection BASE dans controllers (à corriger)
- [ ] ❌ Scripts normalisés (OWNER/USER → MANAGER/MEMBER)
- [ ] ❌ Commentaires mis à jour
- [ ] ❌ Validation enum rôles workspace
- [ ] ⚠️ Rôle Testeur (logique existe, migration manquante)

### Frontend

- [ ] ❌ Service de permissions créé
- [ ] ❌ Composants adaptés aux rôles
- [ ] ❌ Boutons masqués selon permissions
- [ ] ❌ Messages d'erreur préventifs
- [ ] ❌ Badge BASE visible
- [ ] ❌ Indicateur de rôle utilisateur

### Tests

- [ ] ❌ Tests protection BASE
- [ ] ❌ Tests permissions VIEWER
- [ ] ❌ Tests normalisation rôles
- [ ] ❌ Tests rôle Testeur
- [ ] ❌ Tests non-régression

---

## 📊 MÉTRIQUES FINALES

### Code à modifier

**Fichiers critiques** : 5 fichiers
- workspace.controller.js (2 corrections)
- verify-production-auth.js (1 correction)
- sync-supabase-users.js (1 correction)
- admin.controller.js (1 correction)

**Fichiers commentaires** : 3 fichiers
- workspace.routes.js
- workspace.controller.js
- verify-and-seed-auth.js

**Fichiers frontend** : 15+ fichiers (estimation)

### Effort restant

| Tâche | Effort | Priorité |
|-------|--------|----------|
| Corrections critiques backend | 2h | 🔴 CRITIQUE |
| Normalisation scripts | 1h | 🔴 CRITIQUE |
| Mise à jour commentaires | 30min | 🟡 HAUTE |
| Finalisation Testeur | 4h | 🟡 HAUTE |
| Adaptation frontend | 8h | 🟡 HAUTE |
| Tests complets | 6h | 🟢 MOYENNE |

**Total estimé** : 21h30

---

## ⚠️ RECOMMANDATIONS

### Avant mise en production

1. **OBLIGATOIRE** : Corriger protection BASE (Priorité 1.1)
2. **OBLIGATOIRE** : Normaliser tous les scripts (Priorité 1.2)
3. **RECOMMANDÉ** : Mettre à jour commentaires (Priorité 1.3)
4. **RECOMMANDÉ** : Tests manuels des 7 scénarios VIEWER

### Post-production

1. Finaliser rôle Testeur avec migration
2. Adapter frontend (Phase 5)
3. Ajouter validation enum
4. Tests automatisés complets

---

## 🎓 CONCLUSION

Le projet est **partiellement prêt pour la production** avec des **corrections critiques obligatoires**.

**Points forts** :
- ✅ Architecture middleware solide
- ✅ Protection BASE au niveau middleware
- ✅ Permissions VIEWER fonctionnelles
- ✅ Schema Prisma conforme

**Points faibles** :
- ❌ Incohérences rôles legacy dans scripts
- ❌ Protection BASE incomplète dans controllers
- ❌ Frontend non adapté
- ❌ Rôle Testeur partiellement implémenté

**Verdict** : **Corrections critiques requises avant production** (2-3h de travail)

---

**Document généré le** : 5 février 2026  
**Prochaine révision** : Après corrections critiques
