# 🔐 Audit du système de rôles et administration

**Date** : 2026-01-25  
**Objectif** : Vérifier le fonctionnement complet du système de rôles, notamment ADMIN, et valider le tableau de bord d'administration

---

## 📋 RÉSUMÉ EXÉCUTIF

### ✅ Points positifs
- Système de rôles bien structuré (USER/ADMIN)
- Middleware backend `requireAdmin` fonctionnel
- Guard frontend `RoleGuard` protège les routes admin
- Interface admin complète et moderne
- Routes API admin correctement protégées

### ⚠️ Problèmes identifiés

#### 🔴 CRITIQUE
1. **Incohérence casse des rôles** : Backend compare `role.toLowerCase() !== 'admin'` mais Prisma stocke en UPPERCASE
2. **Pas d'enum Prisma** : Le champ `role` est un `String` libre, risque d'incohérence

#### 🟡 MOYEN
3. **Normalisation rôle manquante** : Lors de la création/mise à jour, le rôle n'est pas toujours normalisé
4. **Routes admin dashboard** : Certains boutons pointent vers des routes inexistantes

---

## 🔍 ANALYSE DÉTAILLÉE

### 1. Modèle de données (Prisma)

**Fichier** : `backend/prisma/schema.prisma`

```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  nom          String
  prenom       String?
  role         String   @default("USER")  // ⚠️ Pas d'enum
  isActive     Boolean  @default(true)
  iconUrl      String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  workspaces WorkspaceUser[]
}
```

**Problèmes** :
- ❌ `role` est un `String` libre (pas d'enum Prisma)
- ❌ Valeur par défaut `"USER"` en UPPERCASE
- ⚠️ Risque d'incohérence : "user", "USER", "User", "admin", "ADMIN", "Admin"

**Recommandation** :
```prisma
enum UserRole {
  USER
  ADMIN
}

model User {
  role UserRole @default(USER)
}
```

---

### 2. Middleware Backend (auth.middleware.js)

**Fichier** : `backend/middleware/auth.middleware.js`

#### Fonction `requireAdmin` (lignes 241-250)

```javascript
const requireAdmin = (req, res, next) => {
  const role = req.user?.role ? String(req.user.role).toLowerCase() : undefined;
  if (!req.user || role !== 'admin') {
    return res.status(403).json({
      error: 'Accès réservé aux administrateurs',
      code: 'FORBIDDEN'
    });
  }
  next();
};
```

**Analyse** :
- ✅ Conversion en lowercase pour comparaison
- ✅ Gestion des cas `null`/`undefined`
- ⚠️ **PROBLÈME** : Si la DB stocke "USER"/"ADMIN" en uppercase, la comparaison `role !== 'admin'` fonctionne grâce au `.toLowerCase()`
- ✅ Code erreur clair (`FORBIDDEN`)

**Bypass développement** (lignes 73-82, 207-216) :
```javascript
const isDev = String(process.env.NODE_ENV || '').toLowerCase() === 'development';
if (isDev && !token) {
  req.user = {
    id: 'dev-user',
    email: 'dev@local',
    role: 'ADMIN',  // ⚠️ En UPPERCASE
    isActive: true,
  };
  return next();
}
```

**Problème** :
- ⚠️ En dev, le rôle est `'ADMIN'` (uppercase)
- ✅ Mais `requireAdmin` fait `.toLowerCase()` donc ça fonctionne

---

### 3. Contrôleur Admin (admin.controller.js)

**Fichier** : `backend/controllers/admin.controller.js`

#### Création utilisateur (lignes 151-196)

```javascript
exports.createUser = async (req, res) => {
  const { email, password, nom, prenom, role = 'user', isActive = true } = req.body || {};
  
  // ...validation...
  
  const created = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash: hashed,
      nom: nom?.trim() || '',
      prenom: prenom?.trim() || null,
      role: (role || 'USER').toUpperCase(),  // ✅ Normalisation en UPPERCASE
      isActive: !!isActive,
      iconUrl: null
    }
  });
```

**Analyse** :
- ✅ Normalisation du rôle en UPPERCASE
- ✅ Valeur par défaut `'user'` → `'USER'`
- ✅ Cohérent avec le schéma Prisma

#### Mise à jour utilisateur (lignes 412-437)

```javascript
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { role, isActive } = req.body || {};

  const data = {};
  if (typeof role === 'string') data.role = role;  // ⚠️ Pas de normalisation
  if (typeof isActive === 'boolean') data.isActive = isActive;

  const updated = await prisma.user.update({ where: { id }, data });
```

**Problème** :
- ❌ **Pas de normalisation du rôle** lors de la mise à jour
- ⚠️ Si le frontend envoie `"admin"` (lowercase), il sera stocké tel quel
- ⚠️ Incohérence potentielle dans la DB

**Correction nécessaire** :
```javascript
if (typeof role === 'string') data.role = role.toUpperCase();
```

---

### 4. Routes Admin Backend

**Fichier** : `backend/routes/admin.routes.js`

```javascript
router.use(authenticateToken, requireAdmin, workspaceGuard);

router.get('/overview', getOverview);
router.get('/users', getUsers);
router.patch('/users/:id', updateUser);
router.post('/users', createUser);
router.post('/bulk-delete', bulkDelete);
router.post('/bulk-duplicate', bulkDuplicate);
```

**Analyse** :
- ✅ Toutes les routes protégées par `authenticateToken` + `requireAdmin`
- ✅ `workspaceGuard` appliqué (contexte workspace)
- ✅ CRUD utilisateurs complet
- ✅ Actions en masse (delete, duplicate)

---

### 5. Guard Frontend (RoleGuard)

**Fichier** : `frontend/src/app/core/guards/role.guard.ts`

```typescript
canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
  const expectedRole = (route.data?.['role'] as string | undefined)?.toLowerCase();

  return this.authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (!user) {
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
      }
      const userRole = user.role?.toLowerCase();
      if (expectedRole && userRole !== expectedRole) {
        this.notificationService.showError(`Accès non autorisé. Seuls les administrateurs peuvent accéder à cette page.`);
        this.router.navigate(['/']);
        return false;
      }
      return true;
    })
  );
}
```

**Analyse** :
- ✅ Conversion en lowercase pour comparaison
- ✅ Redirection vers login si non authentifié
- ✅ Message d'erreur clair
- ✅ Redirection vers home si accès refusé

---

### 6. Routes Frontend Admin

**Fichier** : `frontend/src/app/features/settings/settings.module.ts`

```typescript
{
  path: 'admin',
  component: AdminShellComponent,
  canActivate: [RoleGuard],
  data: { role: 'admin' },  // ✅ Rôle requis
  children: [
    { path: '', component: AdminDashboardComponent },
    { path: 'workspaces', component: AdminWorkspacesPageComponent },
    { path: 'explorer', component: DataExplorerPageComponent },
    { path: 'users', component: UsersAdminComponent }
  ]
}
```

**Analyse** :
- ✅ Protection par `RoleGuard`
- ✅ `data: { role: 'admin' }` requis
- ✅ Routes enfants bien définies

**Routes disponibles** :
- `/parametres/admin` → Dashboard
- `/parametres/admin/workspaces` → Gestion workspaces
- `/parametres/admin/explorer` → Explorateur de données
- `/parametres/admin/users` → Gestion utilisateurs

---

### 7. Composant Admin Dashboard

**Fichier** : `frontend/src/app/features/settings/pages/admin-dashboard/admin-dashboard.component.ts`

#### Méthode `goToExplorer` (lignes 291-295)

```typescript
goToExplorer(type: 'exercices' | 'entrainements' | 'echauffements' | 'situations' | 'tags'): void {
  this.router.navigate(['/parametres/admin/explorer'], {
    queryParams: { type }
  });
}
```

**Analyse** :
- ✅ Navigation vers l'explorateur avec filtre de type
- ✅ Route existe : `/parametres/admin/explorer`

#### Template (admin-dashboard.component.html)

**Boutons "Voir tout"** (lignes 33, 46, 59, 72, 85) :
```html
<button mat-button color="primary" (click)="goToExplorer('exercices')">Voir tout</button>
<button mat-button color="primary" (click)="goToExplorer('entrainements')">Voir tout</button>
<button mat-button color="primary" (click)="goToExplorer('echauffements')">Voir tout</button>
<button mat-button color="primary" (click)="goToExplorer('situations')">Voir tout</button>
<button mat-button color="primary" (click)="goToExplorer('tags')">Voir tout</button>
```

**Analyse** :
- ✅ Tous les boutons appellent `goToExplorer(type)`
- ✅ Route cible existe

**Bouton "Explorer toutes les données"** (ligne 102) :
```html
<a mat-raised-button color="primary" class="data-explorer-button" routerLink="/parametres/admin/explorer">
```

**Analyse** :
- ✅ Lien direct vers l'explorateur
- ✅ Route existe

---

### 8. Composant Users Admin

**Fichier** : `frontend/src/app/features/settings/pages/users-admin/users-admin.component.ts`

#### Création utilisateur (lignes 127-170)

```typescript
createUser(): void {
  // ...validation...
  
  this.admin.createUser({
    email: this.newUser.email.trim().toLowerCase(),
    password: this.newUser.password,
    nom: this.newUser.nom?.trim(),
    prenom: this.newUser.prenom?.trim(),
    role: this.newUser.role,  // ⚠️ Pas de normalisation
    isActive: this.newUser.isActive
  }).subscribe({...});
}
```

**Problème** :
- ⚠️ Le rôle est envoyé tel quel (lowercase depuis le select)
- ⚠️ Le backend normalise en uppercase dans `createUser`, donc OK
- ✅ Mais pour cohérence, devrait normaliser côté frontend aussi

#### Mise à jour utilisateur (lignes 93-125)

```typescript
saveUser(user: UserRow): void {
  this.admin.updateUser(user.id, { 
    role: user.role,  // ⚠️ Pas de normalisation
    isActive: user.isActive 
  }).subscribe({...});
}
```

**Problème** :
- ❌ **Pas de normalisation du rôle**
- ❌ Le backend `updateUser` ne normalise pas non plus
- ❌ **RISQUE** : Si l'utilisateur change le rôle, il sera stocké en lowercase

**Template** (users-admin.component.html, lignes 59-62, 130-133) :
```html
<mat-select [(ngModel)]="newUser.role">
  <mat-option value="user">Utilisateur</mat-option>
  <mat-option value="admin">Administrateur</mat-option>
</mat-select>

<mat-select [(ngModel)]="u.role" [disabled]="u._saving">
  <mat-option value="user">Utilisateur</mat-option>
  <mat-option value="admin">Administrateur</mat-option>
</mat-select>
```

**Problème** :
- ❌ Les valeurs sont en **lowercase** (`"user"`, `"admin"`)
- ❌ Incohérent avec la DB qui stocke en UPPERCASE
- ❌ Lors de la mise à jour, le rôle sera stocké en lowercase

---

## 🐛 PROBLÈMES IDENTIFIÉS

### 🔴 CRITIQUE-01 : Incohérence casse des rôles

**Localisation** :
- `backend/controllers/admin.controller.js:418` (updateUser)
- `frontend/.../users-admin.component.html:60,131` (select values)
- `frontend/.../users-admin.component.ts:111,156` (pas de normalisation)

**Problème** :
1. La DB stocke les rôles en **UPPERCASE** (`"USER"`, `"ADMIN"`)
2. Le frontend envoie les rôles en **lowercase** (`"user"`, `"admin"`)
3. `createUser` backend normalise en uppercase ✅
4. `updateUser` backend **NE normalise PAS** ❌
5. Résultat : Incohérence dans la DB

**Impact** :
- ⚠️ Un utilisateur mis à jour aura `role: "admin"` (lowercase)
- ⚠️ Le middleware `requireAdmin` fonctionne quand même (fait `.toLowerCase()`)
- ⚠️ Mais incohérence dans la DB et affichage

**Correction** :
```javascript
// backend/controllers/admin.controller.js
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { role, isActive } = req.body || {};

  const data = {};
  if (typeof role === 'string') data.role = role.toUpperCase(); // ✅ Normaliser
  if (typeof isActive === 'boolean') data.isActive = isActive;

  const updated = await prisma.user.update({ where: { id }, data });
  // ...
};
```

---

### 🔴 CRITIQUE-02 : Pas d'enum Prisma pour les rôles

**Localisation** : `backend/prisma/schema.prisma:156`

**Problème** :
- Le champ `role` est un `String` libre
- Risque de valeurs invalides : `"superadmin"`, `"guest"`, etc.
- Pas de validation au niveau DB

**Correction** :
```prisma
enum UserRole {
  USER
  ADMIN
}

model User {
  // ...
  role UserRole @default(USER)
  // ...
}
```

**Migration nécessaire** :
```bash
npx prisma migrate dev --name add-user-role-enum
```

---

### 🟡 MOYEN-01 : Normalisation frontend manquante

**Localisation** :
- `frontend/.../users-admin.component.ts:111,156`
- `frontend/.../admin-dashboard.component.ts:220,252`

**Problème** :
- Le frontend envoie les rôles en lowercase
- Dépend du backend pour normaliser
- Incohérent si le backend oublie de normaliser

**Correction** :
```typescript
// users-admin.component.ts
saveUser(user: UserRow): void {
  this.admin.updateUser(user.id, { 
    role: user.role?.toUpperCase(),  // ✅ Normaliser
    isActive: user.isActive 
  }).subscribe({...});
}

createUser(): void {
  this.admin.createUser({
    // ...
    role: this.newUser.role?.toUpperCase(),  // ✅ Normaliser
    // ...
  }).subscribe({...});
}
```

---

### 🟡 MOYEN-02 : Valeurs select en lowercase

**Localisation** : `frontend/.../users-admin.component.html:60,131`

**Problème** :
- Les `<mat-option value="user">` sont en lowercase
- Incohérent avec la DB (UPPERCASE)
- Nécessite normalisation à chaque envoi

**Correction** :
```html
<mat-select [(ngModel)]="newUser.role">
  <mat-option value="USER">Utilisateur</mat-option>
  <mat-option value="ADMIN">Administrateur</mat-option>
</mat-select>
```

**OU** (meilleur) :
```typescript
// Créer un enum TypeScript
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

// Dans le template
<mat-option [value]="UserRole.USER">Utilisateur</mat-option>
<mat-option [value]="UserRole.ADMIN">Administrateur</mat-option>
```

---

## ✅ POINTS FORTS

### Backend
1. ✅ Middleware `requireAdmin` robuste avec gestion lowercase
2. ✅ Routes admin bien protégées (auth + role + workspace)
3. ✅ CRUD utilisateurs complet
4. ✅ Actions en masse (bulk delete/duplicate)
5. ✅ Bypass dev mode pour faciliter le développement

### Frontend
1. ✅ `RoleGuard` protège correctement les routes admin
2. ✅ Interface admin moderne et complète
3. ✅ Gestion utilisateurs avec workspaces
4. ✅ Dashboard avec statistiques et aperçu
5. ✅ Explorateur de données avec filtres

---

## 📝 PLAN DE CORRECTION

### Phase 1 : Corrections critiques (30 min)

1. **Ajouter enum Prisma UserRole**
   - Modifier `schema.prisma`
   - Créer migration
   - Appliquer migration

2. **Normaliser rôle dans updateUser backend**
   - Modifier `admin.controller.js:418`
   - Ajouter `.toUpperCase()`

3. **Normaliser rôles frontend**
   - Modifier `users-admin.component.ts`
   - Modifier `admin-dashboard.component.ts`
   - Ajouter `.toUpperCase()` avant envoi

### Phase 2 : Améliorations (20 min)

4. **Créer enum TypeScript UserRole**
   - Créer `shared/enums/user-role.enum.ts`
   - Utiliser dans les composants

5. **Mettre à jour valeurs select**
   - Utiliser `UserRole.USER` et `UserRole.ADMIN`
   - Cohérence avec la DB

### Phase 3 : Tests (15 min)

6. **Tester création utilisateur**
   - Vérifier rôle en UPPERCASE dans DB
   
7. **Tester mise à jour utilisateur**
   - Vérifier rôle en UPPERCASE dans DB

8. **Tester accès routes admin**
   - Avec utilisateur USER → refusé
   - Avec utilisateur ADMIN → autorisé

---

## 🎯 RECOMMANDATIONS

### Court terme
1. ✅ Appliquer les corrections critiques (Phase 1)
2. ✅ Tester le flux complet admin
3. ✅ Documenter le système de rôles

### Moyen terme
1. Ajouter plus de rôles si nécessaire (OWNER, EDITOR, VIEWER)
2. Implémenter permissions granulaires par workspace
3. Ajouter logs d'audit pour actions admin

### Long terme
1. Système de permissions basé sur les capacités (RBAC)
2. Interface de gestion des permissions
3. Historique des modifications utilisateurs

---

**Dernière mise à jour** : 2026-01-25  
**Statut** : ⚠️ Corrections nécessaires
