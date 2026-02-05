# PLAN D'ACTION — Implémentation de la gouvernance des rôles

> **Statut** : Plan d'action officiel  
> **Dernière mise à jour** : 5 février 2026  
> **Document de référence** : `docs/GOUVERNANCE_ROLES_REFERENCE.md`

---

## 0. PRÉAMBULE

### 0.1 Objectif de ce plan

Ce plan d'action définit les **étapes concrètes** pour aligner l'implémentation avec le modèle de gouvernance des rôles validé.

### 0.2 Principes du plan

- **Progressif** : étapes ordonnées, validables une par une
- **Sécurisé** : tests de non-régression à chaque étape
- **Traçable** : chaque action référence le document de gouvernance
- **Réversible** : stratégie de rollback définie

### 0.3 État actuel (résumé)

**✅ Implémenté** :
- Champ `isBase` dans Workspace
- Rôle workspace par défaut = `MEMBER`
- Middlewares auth de base

**⚠️ Incomplet** :
- Protection BASE non globale
- Rôle Testeur non modélisé
- Normalisation OWNER→MANAGER non finalisée
- Validation enum rôles workspace absente

---

## 1. PHASE 1 — SÉCURISATION BASE (Priorité HAUTE)

### Mission 1.1 — Implémenter la garde BASE globale

**Objectif** : Protéger la BASE au niveau middleware, pas seulement controller

**Périmètre** :
- Créer middleware `requireNotBase` ou `protectBase`
- Appliquer sur toutes les routes de mutation workspace

**Fichiers impactés** :
- `backend/middleware/workspace.middleware.js` (nouveau middleware)
- `backend/routes/workspace.routes.js` (application)
- Routes métier si nécessaire

**Critères de succès** :
- ✅ Middleware refuse mutation si `isBase=true` et user non admin
- ✅ Tests : admin peut modifier BASE, autres non
- ✅ Message d'erreur clair : `BASE_PROTECTED`

**Dépendances** : Aucune

**Risque** : Moyen (peut bloquer opérations légitimes si mal configuré)

---

### Mission 1.2 — Migrer les données BASE existantes

**Objectif** : S'assurer que le workspace BASE a `isBase=true`

**Périmètre** :
- Script de migration Prisma
- Vérification workspace BASE unique

**Fichiers impactés** :
- Nouvelle migration Prisma
- `backend/prisma/seed-workspaces.js` (mise à jour)

**Actions** :
```sql
UPDATE "Workspace" SET "isBase" = true WHERE name = 'BASE';
```

**Critères de succès** :
- ✅ Workspace BASE a `isBase=true`
- ✅ Un seul workspace avec `isBase=true`
- ✅ Migration idempotente

**Dépendances** : Aucune

**Risque** : Faible

---

### Mission 1.3 — Tests de protection BASE

**Objectif** : Valider que la protection BASE fonctionne

**Périmètre** :
- Tests automatisés ou checklist manuelle

**Scénarios de test** :
1. Admin peut modifier contenus BASE ✅
2. Admin peut modifier membres BASE ✅
3. Admin peut modifier settings BASE ✅
4. MANAGER de BASE ne peut pas modifier BASE ❌
5. MEMBER de BASE ne peut pas modifier BASE ❌
6. VIEWER de BASE ne peut pas lire contenus BASE ❌
7. Testeur peut lister BASE ✅
8. Testeur ne peut pas modifier BASE ❌

**Critères de succès** :
- ✅ Tous les tests passent
- ✅ Aucune régression sur workspaces normaux

**Dépendances** : Missions 1.1 et 1.2

**Risque** : Faible

---

## 2. PHASE 2 — NORMALISATION RÔLES WORKSPACE (Priorité HAUTE)

### Mission 2.1 — Créer enum ou validation rôles workspace

**Objectif** : Limiter les valeurs possibles de `WorkspaceUser.role`

**Options** :
- **Option A** : Enum Prisma (migration breaking)
- **Option B** : Validation Zod dans controllers ✅ **RETENUE**
- **Option C** : Middleware de validation

**Recommandation** : Option B (moins invasif)

**Implémentation concrète** :

1. **Créer `backend/validators/workspace.validator.js`** ✅ FAIT
   ```javascript
   const workspaceRoleSchema = z.enum(['MANAGER', 'MEMBER', 'VIEWER']);
   const workspaceUserSchema = z.object({
     userId: z.string().uuid(),
     role: workspaceRoleSchema
   });
   const setWorkspaceMembersSchema = z.object({
     users: z.array(workspaceUserSchema).min(1)
   });
   ```

2. **Appliquer dans `workspace.controller.js`** :
   - `adminSetWorkspaceUsers` (ligne ~520) : valider `req.body.users`
   - `ownerSetWorkspaceMembers` (ligne ~610) : valider `req.body.users`
   - `adminCreateWorkspace` (ligne ~290) : valider `ownerUserId` optionnel
   - `adminDuplicateWorkspace` (ligne ~220) : valider membres copiés

3. **Points d'application précis** :
   ```javascript
   // Dans adminSetWorkspaceUsers
   const { users } = req.body;
   const validation = setWorkspaceMembersSchema.safeParse({ users });
   if (!validation.success) {
     return res.status(400).json({ 
       error: 'Données invalides', 
       details: validation.error.errors 
     });
   }
   ```

**Valeurs autorisées** :
- `MANAGER` ✅
- `MEMBER` ✅
- `VIEWER` ✅
- ~~`OWNER`~~ (rejeté, utiliser normalisation middleware)
- ~~`USER`~~ (rejeté, utiliser normalisation middleware)

**Critères de succès** :
- ✅ Nouvelles créations utilisent MANAGER/MEMBER/VIEWER uniquement
- ✅ Valeurs legacy normalisées par middleware avant validation
- ✅ Erreur 400 claire si valeur invalide
- ✅ Messages d'erreur explicites

**Dépendances** : Aucune

**Risque** : Faible (validation après normalisation)

---

### Mission 2.2 — Normaliser middleware requireWorkspaceOwner

**Objectif** : Accepter `MANAGER` en plus de `OWNER`

**Périmètre** :
- Modifier `requireWorkspaceOwner` pour accepter les deux valeurs

**Fichiers impactés** :
- `backend/middleware/workspace.middleware.js`

**Implémentation** :
```javascript
// Avant
if (role !== 'OWNER') { ... }

// Après
if (role !== 'OWNER' && role !== 'MANAGER') { ... }
```

**Critères de succès** :
- ✅ OWNER continue de fonctionner (compatibilité)
- ✅ MANAGER fonctionne également
- ✅ Aucune régression

**Dépendances** : Mission 2.1

**Risque** : Faible

---

### Mission 2.3 — Migration progressive des rôles legacy

**Objectif** : Convertir OWNER→MANAGER et USER→MEMBER

**Stratégie** :
- **Phase A** : Accepter les deux (fait en 2.2)
- **Phase B** : Script de migration données
- **Phase C** : Dépréciation OWNER/USER
- **Phase D** : Suppression support legacy

**Script de migration** :
```sql
UPDATE "WorkspaceUser" 
SET role = 'MANAGER' 
WHERE role = 'OWNER';

UPDATE "WorkspaceUser" 
SET role = 'MEMBER' 
WHERE role = 'USER';
```

**Fichiers impactés** :
- Nouvelle migration Prisma
- Scripts de seed à mettre à jour

**Critères de succès** :
- ✅ Toutes les données migrées
- ✅ Aucune perte de permissions
- ✅ Rollback possible

**Dépendances** : Mission 2.2

**Risque** : Moyen (impact sur toutes les données)

---

### Mission 2.4 — Mettre à jour les scripts

**Objectif** : Utiliser les nouvelles valeurs dans tous les scripts

**Fichiers impactés** :
- `backend/prisma/seed-workspaces.js`
- `backend/scripts/verify-and-seed-auth.js`
- `backend/scripts/sync-supabase-users.js`
- `backend/controllers/auth.controller.js` (register)

**Changements** :
- `role: 'OWNER'` → `role: 'MANAGER'`
- `role: 'USER'` → `role: 'MEMBER'`
- `role: 'VIEWER'` → `role: 'VIEWER'` (OK)

**Critères de succès** :
- ✅ Tous les scripts utilisent nouvelles valeurs
- ✅ Seeds fonctionnent correctement
- ✅ Nouveaux utilisateurs ont VIEWER dans BASE

**Dépendances** : Mission 2.3

**Risque** : Faible

---

## 3. PHASE 3 — IMPLÉMENTATION RÔLE TESTEUR (Priorité MOYENNE)

### Mission 3.1 — Définir la source de vérité Testeur

**Objectif** : Décider comment identifier un Testeur

**Options** :
- **Option A** : Nouveau champ `User.isTester` (Boolean)
- **Option B** : Table dédiée `TesterUser`
- **Option C** : Liste en configuration (env var)
- **Option D** : Rôle plateforme `TESTER` dans enum

**Recommandation** : Option A (simple, évolutif)

**Implémentation** :
```prisma
model User {
  isTester Boolean @default(false)
}
```

**Critères de succès** :
- ✅ Champ ajouté au modèle
- ✅ Migration créée
- ✅ Valeur par défaut = false

**Dépendances** : Aucune

**Risque** : Faible

---

### Mission 3.2 — Implémenter capability set Testeur

**Objectif** : Créer middleware/helper pour capacités Testeur

**Périmètre** :
- Fonction `isUserTester(user)`
- Middleware `requireTester` (optionnel)
- Logique de listing workspaces

**Fichiers impactés** :
- `backend/middleware/auth.middleware.js` ou nouveau fichier
- `backend/controllers/workspace.controller.js` (listing)

**Règles** :
- Testeur peut lister tous les workspaces
- Testeur ne peut pas lire contenu sans rôle workspace
- Testeur ne peut jamais modifier BASE

**Critères de succès** :
- ✅ Testeur voit tous workspaces dans `/api/workspaces/me`
- ✅ Testeur bloqué si accès contenu sans rôle workspace
- ✅ Testeur bloqué sur modification BASE

**Dépendances** : Mission 3.1

**Risque** : Moyen (nouvelle logique d'autorisation)

---

### Mission 3.3 — Tests rôle Testeur

**Objectif** : Valider le comportement Testeur

**Scénarios de test** :
1. Testeur liste tous les workspaces ✅
2. Testeur avec VIEWER dans WS1 peut lire WS1 ✅
3. Testeur sans rôle dans WS2 ne peut pas lire WS2 ❌
4. Testeur ne peut jamais modifier BASE ❌
5. Admin reste supérieur au Testeur ✅

**Critères de succès** :
- ✅ Tous les tests passent
- ✅ Documentation à jour

**Dépendances** : Mission 3.2

**Risque** : Faible

---

## 4. PHASE 4 — IMPLÉMENTATION PERMISSIONS VIEWER (Priorité MOYENNE)

### Mission 4.1 — Middleware requireWorkspaceRole

**Objectif** : Créer middleware générique pour contrôle de rôle workspace

**Périmètre** :
- Nouveau middleware `requireWorkspaceRole(minRole)`
- Hiérarchie : MANAGER > MEMBER > VIEWER

**Fichiers impactés** :
- `backend/middleware/workspace.middleware.js`

**Implémentation** :
```javascript
function requireWorkspaceRole(minRole) {
  return (req, res, next) => {
    const userRole = req.workspaceRole;
    if (!hasMinimumRole(userRole, minRole)) {
      return res.status(403).json({ 
        error: 'Permissions insuffisantes',
        code: 'INSUFFICIENT_WORKSPACE_ROLE' 
      });
    }
    next();
  };
}
```

**Critères de succès** :
- ✅ Middleware fonctionne pour tous les rôles
- ✅ Hiérarchie respectée
- ✅ Messages d'erreur clairs

**Dépendances** : Mission 2.2

**Risque** : Faible

---

### Mission 4.2 — Appliquer restrictions VIEWER

**Objectif** : Bloquer les actions interdites pour VIEWER

**Périmètre** :
- Routes de création/modification/suppression
- Routes d'export
- Routes membres
- Routes settings

**Fichiers impactés** :
- `backend/routes/exercice.routes.js`
- `backend/routes/entrainement.routes.js`
- `backend/routes/echauffement.routes.js`
- `backend/routes/situationmatch.routes.js`
- `backend/routes/tag.routes.js`
- `backend/routes/workspace.routes.js`

**Application** :
```javascript
// Lecture : tous les rôles
router.get('/', workspaceGuard, controller.list);

// Écriture : MEMBER minimum
router.post('/', workspaceGuard, requireWorkspaceRole('MEMBER'), controller.create);
```

**Critères de succès** :
- ✅ VIEWER peut lire
- ✅ VIEWER bloqué en écriture (403)
- ✅ VIEWER bloqué export
- ✅ VIEWER bloqué membres/settings

**Dépendances** : Mission 4.1

**Risque** : Moyen (impact sur toutes les routes)

---

### Mission 4.3 — Tests permissions VIEWER

**Objectif** : Valider les restrictions VIEWER

**Scénarios de test** :
1. VIEWER peut lire exercices ✅
2. VIEWER ne peut pas créer exercice ❌
3. VIEWER ne peut pas modifier exercice ❌
4. VIEWER ne peut pas supprimer exercice ❌
5. VIEWER ne peut pas exporter ❌
6. VIEWER ne peut pas voir membres ❌
7. VIEWER ne peut pas modifier settings ❌

**Critères de succès** :
- ✅ Tous les tests passent
- ✅ MEMBER et MANAGER non impactés

**Dépendances** : Mission 4.2

**Risque** : Faible

---

## 5. PHASE 5 — FRONTEND (Priorité BASSE)

### Mission 5.1 — Adapter l'UI aux rôles

**Objectif** : Masquer/désactiver actions selon rôle

**Périmètre** :
- Boutons création/modification/suppression
- Menu export
- Page membres
- Page settings

**Fichiers impactés** :
- Composants Angular (tous les modules métier)
- Services Angular (AuthService, WorkspaceService)

**Implémentation** :
```typescript
canEdit(): boolean {
  return this.workspaceRole === 'MANAGER' || 
         this.workspaceRole === 'MEMBER';
}

canManageMembers(): boolean {
  return this.workspaceRole === 'MANAGER';
}
```

**Critères de succès** :
- ✅ UI cohérente avec permissions backend
- ✅ Messages clairs pour utilisateur
- ✅ Pas de boutons inutilisables visibles

**Dépendances** : Phases 2, 3, 4 terminées

**Risque** : Faible

---

### Mission 5.2 — Indicateur visuel BASE

**Objectif** : Afficher badge "BASE" sur workspace BASE

**Périmètre** :
- Liste des workspaces
- Sélecteur de workspace
- Header si workspace actif = BASE

**Fichiers impactés** :
- Composants workspace Angular

**Critères de succès** :
- ✅ Badge visible sur BASE
- ✅ Tooltip explicatif
- ✅ Style distinct

**Dépendances** : Mission 1.2

**Risque** : Faible

---

## 6. ORDRE D'EXÉCUTION RECOMMANDÉ

### Sprint 1 — Sécurisation BASE (1-2 jours)
1. Mission 1.1 — Garde BASE globale
2. Mission 1.2 — Migration données BASE
3. Mission 1.3 — Tests BASE

### Sprint 2 — Normalisation workspace (2-3 jours)
4. Mission 2.1 — Validation rôles
5. Mission 2.2 — Normaliser middleware
6. Mission 2.3 — Migration données
7. Mission 2.4 — Mettre à jour scripts

### Sprint 3 — Rôle Testeur (2-3 jours)
8. Mission 3.1 — Source de vérité
9. Mission 3.2 — Capability set
10. Mission 3.3 — Tests Testeur

### Sprint 4 — Permissions VIEWER (2-3 jours)
11. Mission 4.1 — Middleware générique
12. Mission 4.2 — Appliquer restrictions
13. Mission 4.3 — Tests VIEWER

### Sprint 5 — Frontend (3-5 jours)
14. Mission 5.1 — Adapter UI
15. Mission 5.2 — Indicateur BASE

**Durée totale estimée** : 10-16 jours

---

## 7. STRATÉGIE DE TESTS

### 7.1 Tests unitaires

**Middlewares** :
- `authenticateToken`
- `requireAdmin`
- `workspaceGuard`
- `requireWorkspaceOwner` / `requireWorkspaceRole`
- `protectBase`

**Services** :
- Workspace service (création, duplication)
- Auth service

### 7.2 Tests d'intégration

**Scénarios critiques** :
- Parcours admin complet
- Parcours MANAGER workspace
- Parcours MEMBER workspace
- Parcours VIEWER workspace
- Parcours Testeur
- Protection BASE

### 7.3 Tests de non-régression

**Checklist manuelle** :
- [ ] Admin peut tout faire
- [ ] MANAGER peut gérer son workspace
- [ ] MEMBER peut créer du contenu
- [ ] VIEWER ne peut que lire
- [ ] Testeur voit tout, agit selon rôle workspace
- [ ] BASE protégée sauf admin
- [ ] Workspaces normaux non impactés

---

## 8. POINTS DE VALIDATION

### Validation après chaque phase

**Phase 1** :
- [ ] BASE protégée au niveau middleware
- [ ] Tests BASE passent
- [ ] Aucune régression workspaces normaux

**Phase 2** :
- [ ] Rôles workspace normalisés
- [ ] Migration données réussie
- [ ] Scripts à jour

**Phase 3** :
- [ ] Testeur identifiable
- [ ] Capacités Testeur fonctionnelles
- [ ] Tests Testeur passent

**Phase 4** :
- [ ] VIEWER restreint correctement
- [ ] MEMBER et MANAGER non impactés
- [ ] Tests VIEWER passent

**Phase 5** :
- [ ] UI cohérente avec backend
- [ ] UX claire pour tous les rôles

---

## 9. RISQUES ET MITIGATIONS

### Risque 1 — Perte de permissions utilisateurs

**Probabilité** : Moyenne  
**Impact** : Élevé

**Mitigation** :
- Backup base avant migration
- Tests exhaustifs en dev/staging
- Rollback plan documenté
- Migration progressive (accepter legacy temporairement)

---

### Risque 2 — Régression sur workspaces normaux

**Probabilité** : Moyenne  
**Impact** : Élevé

**Mitigation** :
- Tests de non-régression systématiques
- Validation manuelle après chaque phase
- Monitoring erreurs 403/401 en production

---

### Risque 3 — Complexité accrue du code

**Probabilité** : Élevée  
**Impact** : Moyen

**Mitigation** :
- Documentation inline
- Helpers réutilisables
- Centralisation logique d'autorisation

---

### Risque 4 — Impact performance

**Probabilité** : Faible  
**Impact** : Moyen

**Mitigation** :
- Pas de requêtes DB supplémentaires dans middlewares
- Cache des rôles utilisateur
- Monitoring performance

---

## 10. ROLLBACK PLAN

### En cas de problème critique

**Phase 1 (BASE)** :
- Désactiver middleware `protectBase`
- Revenir aux contrôles controller uniquement

**Phase 2 (Normalisation)** :
- Rollback migration données
- Restaurer backup
- Revenir à acceptation OWNER/USER

**Phase 3 (Testeur)** :
- Désactiver flag `isTester`
- Revenir à comportement USER standard

**Phase 4 (VIEWER)** :
- Retirer middleware `requireWorkspaceRole`
- Revenir à workspaceGuard seul

---

## 11. DOCUMENTATION À METTRE À JOUR

### Après chaque phase

- [ ] README.md (section Rôles)
- [ ] API documentation (Swagger)
- [ ] Guide développeur
- [ ] Guide utilisateur
- [ ] Changelog

---

## 12. CHECKLIST FINALE

### Avant mise en production

- [ ] Toutes les phases terminées
- [ ] Tous les tests passent
- [ ] Documentation à jour
- [ ] Backup base de données
- [ ] Rollback plan validé
- [ ] Monitoring en place
- [ ] Communication utilisateurs
- [ ] Formation équipe si nécessaire

---

**Ce plan est la feuille de route officielle pour l'implémentation de la gouvernance des rôles.**
