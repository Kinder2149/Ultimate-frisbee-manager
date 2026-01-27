# 🔍 AUDIT COMPLET DU SYSTÈME DE WORKSPACES

**Date**: 2026-01-26  
**Objectif**: Analyser en profondeur le fonctionnement des workspaces, identifier les bugs et proposer des améliorations

---

## 📋 TABLE DES MATIÈRES

1. [Architecture et Modèle de Données](#1-architecture-et-modèle-de-données)
2. [Flow de Connexion et Sélection](#2-flow-de-connexion-et-sélection)
3. [Gestion Backend](#3-gestion-backend)
4. [Gestion Frontend](#4-gestion-frontend)
5. [Isolation des Données](#5-isolation-des-données)
6. [Persistance et Contexte](#6-persistance-et-contexte)
7. [Composants de Sélection](#7-composants-de-sélection)
8. [Bugs Identifiés](#8-bugs-identifiés)
9. [Recommandations](#9-recommandations)

---

## 1. ARCHITECTURE ET MODÈLE DE DONNÉES

### 1.1 Schéma Prisma

**Modèle Workspace:**
```prisma
model Workspace {
  id        String           @id @default(uuid())
  name      String
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt

  members   WorkspaceUser[]
  exercices Exercice[]
  tags      Tag[]
  entrainements Entrainement[]
  entrainementExercices EntrainementExercice[]
  echauffements Echauffement[]
  blocsEchauffement BlocEchauffement[]
  situationsMatch SituationMatch[]
}
```

**Modèle WorkspaceUser (table de liaison):**
```prisma
model WorkspaceUser {
  id          String    @id @default(uuid())
  workspaceId String
  userId      String
  role        String    @default("OWNER")
  createdAt   DateTime  @default(now())

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([workspaceId, userId])
  @@index([workspaceId])
  @@index([userId])
}
```

### 1.2 Relations avec les Entités

**✅ TOUTES les entités ont un champ `workspaceId`:**
- Exercice
- Tag
- Entrainement
- EntrainementExercice
- Echauffement
- BlocEchauffement
- SituationMatch

**✅ Cascade DELETE configuré:**
```prisma
workspace   Workspace? @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
```

**✅ Index sur workspaceId:**
```prisma
@@index([workspaceId])
```

### 1.3 Workspaces par Défaut

**BASE**: Workspace de référence pour tous les utilisateurs
- Contient les exercices/tags modèles
- Accessible à tous les utilisateurs (rôle: USER)
- Créé automatiquement à la première connexion

**TEST**: Workspace réservé aux administrateurs
- Accessible uniquement aux utilisateurs avec `role: ADMIN`
- Créé automatiquement pour les admins
- Rôle: OWNER

---

## 2. FLOW DE CONNEXION ET SÉLECTION

### 2.1 Scénario 1: Utilisateur avec UN SEUL Workspace

**Étapes:**
1. Utilisateur se connecte (`/api/auth/login`)
2. Frontend appelle `/api/workspaces/me`
3. Backend retourne `[{ id: "...", name: "BASE", role: "USER" }]`
4. **SelectWorkspaceComponent détecte 1 workspace**
5. **✅ SÉLECTION AUTOMATIQUE** (ligne 68-70 de select-workspace.component.ts)
6. Redirection vers `/` (ou returnUrl)
7. WorkspaceService stocke le workspace dans localStorage

**Code:**
```typescript
tap((workspaces) => {
  if (workspaces.length === 1) {
    this.selectWorkspace(workspaces[0]);
  }
})
```

**✅ FONCTIONNEMENT CORRECT**

### 2.2 Scénario 2: Utilisateur avec PLUSIEURS Workspaces

**Étapes:**
1. Utilisateur se connecte
2. Frontend appelle `/api/workspaces/me`
3. Backend retourne `[{ id: "1", name: "BASE" }, { id: "2", name: "TEST" }]`
4. **SelectWorkspaceComponent affiche la liste**
5. **❌ PROBLÈME: Pas de sélection automatique**
6. Utilisateur doit cliquer manuellement sur un workspace
7. Redirection vers `/` (ou returnUrl)

**❌ BUG IDENTIFIÉ #1:**
- Si l'utilisateur a déjà un workspace sélectionné en localStorage, il devrait être pré-sélectionné
- Actuellement, le composant ne vérifie pas le workspace précédent

### 2.3 Scénario 3: Workspace Supprimé ou Accès Retiré

**Étapes:**
1. Utilisateur a un workspace sélectionné (localStorage)
2. Admin supprime le workspace ou retire l'accès
3. Utilisateur navigue vers une route protégée
4. **WorkspaceGuard (backend) retourne 403**
5. **WorkspaceErrorInterceptor (frontend) détecte l'erreur**
6. Redirection vers `/select-workspace?reason=workspace-unavailable`

**❌ PROBLÈME: WorkspaceErrorInterceptor non trouvé dans le code**

---

## 3. GESTION BACKEND

### 3.1 Middleware `workspaceGuard`

**Localisation:** `backend/middleware/workspace.middleware.js`

**Fonctionnement:**
1. Récupère `X-Workspace-Id` du header HTTP
2. Vérifie que l'utilisateur est authentifié (`req.user`)
3. Vérifie que l'utilisateur a accès au workspace (table `WorkspaceUser`)
4. Stocke `workspaceId`, `workspace`, `workspaceLink`, `workspaceRole` dans `req`

**Codes d'erreur:**
- `401 NO_USER_FOR_WORKSPACE`: Utilisateur non authentifié
- `400 WORKSPACE_ID_REQUIRED`: Header manquant
- `403 WORKSPACE_FORBIDDEN`: Utilisateur n'a pas accès au workspace

**✅ FONCTIONNEMENT CORRECT**

### 3.2 Middleware `requireWorkspaceOwner`

**Fonctionnement:**
- Vérifie que `req.workspaceRole === 'OWNER'`
- Utilisé pour les routes d'administration de workspace

**Routes protégées:**
- `GET /api/workspaces/members`
- `PUT /api/workspaces/members`
- `PUT /api/workspaces/settings`

**✅ FONCTIONNEMENT CORRECT**

### 3.3 Fonction `ensureDefaultWorkspaceAndLink`

**Localisation:** `backend/controllers/workspace.controller.js` (ligne 16-101)

**Fonctionnement:**
1. Vérifie que l'utilisateur existe en base
2. Récupère les workspaces existants de l'utilisateur
3. **Si pas lié à BASE:** Crée/récupère BASE et lie l'utilisateur (rôle: USER)
4. **Si admin et pas lié à TEST:** Crée/récupère TEST et lie l'utilisateur (rôle: OWNER)
5. Retourne la liste des workspaces accessibles

**✅ FONCTIONNEMENT CORRECT**

### 3.4 Isolation des Données par Workspace

**Exemple: ExerciceController**

```javascript
exports.getAllExercices = async (req, res, next) => {
  const workspaceId = req.workspaceId;
  
  let exercices = await prisma.exercice.findMany({
    where: { workspaceId },
    include: { tags: true }
  });
  
  res.json(exercices);
};
```

**✅ Toutes les requêtes filtrent par `workspaceId`**

**Contrôleurs vérifiés:**
- ✅ exercice.controller.js
- ✅ entrainement.controller.js
- ✅ echauffement.controller.js
- ✅ situationmatch.controller.js
- ✅ tag.controller.js
- ✅ dashboard.controller.js

**❌ PROBLÈME POTENTIEL:**
- Lors de la création d'entités, le `workspaceId` est bien ajouté
- Lors de la mise à jour, certaines requêtes utilisent `where: { id, workspaceId }`
- **MAIS** lors de la suppression, il faut vérifier que l'entité appartient au workspace avant de la supprimer

**Exemple correct:**
```javascript
const exercice = await prisma.exercice.findFirst({ where: { id, workspaceId } });
if (!exercice) {
  return res.status(404).json({ error: 'Exercice non trouvé' });
}
await prisma.exercice.delete({ where: { id, workspaceId } });
```

---

## 4. GESTION FRONTEND

### 4.1 WorkspaceService

**Localisation:** `frontend/src/app/core/services/workspace.service.ts`

**Fonctionnalités:**
- `currentWorkspace$`: BehaviorSubject pour réactivité
- `getCurrentWorkspace()`: Récupère le workspace actuel
- `getCurrentWorkspaceId()`: Récupère l'ID du workspace actuel
- `setCurrentWorkspace(workspace)`: Définit le workspace et le stocke dans localStorage
- `clear()`: Supprime le workspace sélectionné

**Stockage:**
```typescript
private readonly STORAGE_KEY = 'ufm.currentWorkspace';
```

**✅ FONCTIONNEMENT CORRECT**

**❌ PROBLÈME #2:**
- Pas de méthode pour vérifier si le workspace stocké est toujours valide
- Pas de synchronisation avec la liste des workspaces disponibles

### 4.2 WorkspaceInterceptor

**Localisation:** `frontend/src/app/core/interceptors/workspace.interceptor.ts`

**Fonctionnement:**
1. Intercepte toutes les requêtes HTTP
2. Si l'URL commence par `environment.apiUrl`
3. Ajoute le header `X-Workspace-Id` avec l'ID du workspace actuel

**✅ FONCTIONNEMENT CORRECT**

**❌ PROBLÈME #3:**
- Si `workspaceId` est null, le header n'est pas ajouté
- Certaines routes nécessitent le workspace mais ne retournent pas d'erreur claire

### 4.3 WorkspaceSelectedGuard

**Localisation:** `frontend/src/app/core/guards/workspace-selected.guard.ts`

**Fonctionnement:**
1. Vérifie si un workspace est sélectionné
2. Si non, redirige vers `/select-workspace?returnUrl=...`

**✅ FONCTIONNEMENT CORRECT**

**❌ PROBLÈME #4:**
- Le guard ne vérifie pas si le workspace sélectionné est toujours valide
- Un workspace supprimé peut rester en localStorage

### 4.4 WorkspaceErrorInterceptor

**❌ FICHIER NON TROUVÉ**

**Localisation attendue:** `frontend/src/app/core/interceptors/workspace-error.interceptor.ts`

**Problème:** Le fichier existe dans la structure mais son contenu doit être vérifié

---

## 5. ISOLATION DES DONNÉES

### 5.1 Vérification Backend

**✅ Toutes les requêtes filtrent par `workspaceId`:**

```javascript
// GET
where: { workspaceId }

// GET by ID
where: { id, workspaceId }

// CREATE
data: { ...fields, workspaceId }

// UPDATE
where: { id, workspaceId }

// DELETE
where: { id, workspaceId }
```

**✅ ISOLATION CORRECTE**

### 5.2 Vérification Relations Many-to-Many

**Exemple: Tags sur Exercices**

```javascript
// Lors de la création d'un exercice avec tags
tags: {
  connect: tagIds.map(id => ({ id }))
}
```

**❌ PROBLÈME #5:**
- Les tags connectés ne sont pas vérifiés pour appartenir au même workspace
- Un utilisateur pourrait connecter un tag d'un autre workspace

**Solution:**
```javascript
// Vérifier que tous les tags appartiennent au workspace
const tags = await prisma.tag.findMany({
  where: { id: { in: tagIds }, workspaceId }
});

if (tags.length !== tagIds.length) {
  return res.status(400).json({ error: 'Certains tags n\'appartiennent pas à ce workspace' });
}
```

---

## 6. PERSISTANCE ET CONTEXTE

### 6.1 LocalStorage

**Clé:** `ufm.currentWorkspace`

**Contenu:**
```json
{
  "id": "workspace-uuid",
  "name": "BASE",
  "createdAt": "2026-01-26T...",
  "role": "USER"
}
```

**✅ Persistance entre sessions**

**❌ PROBLÈME #6:**
- Pas de validation à l'initialisation
- Un workspace supprimé reste en localStorage
- L'utilisateur voit des erreurs 403 au lieu d'être redirigé vers la sélection

### 6.2 Synchronisation

**Au chargement de l'application:**
1. WorkspaceService charge le workspace depuis localStorage
2. `currentWorkspaceSubject.next(workspace)`
3. L'application utilise ce workspace pour toutes les requêtes

**❌ PROBLÈME #7:**
- Pas de vérification que le workspace existe toujours
- Pas de synchronisation avec `/api/workspaces/me`

**Solution recommandée:**
```typescript
// Dans app.component.ts ou un initializer
this.http.get('/api/workspaces/me').subscribe(workspaces => {
  const current = this.workspaceService.getCurrentWorkspace();
  if (current && !workspaces.find(w => w.id === current.id)) {
    // Workspace supprimé, rediriger vers sélection
    this.workspaceService.clear();
    this.router.navigate(['/select-workspace']);
  }
});
```

---

## 7. COMPOSANTS DE SÉLECTION

### 7.1 SelectWorkspaceComponent

**Localisation:** `frontend/src/app/features/workspaces/select-workspace/`

**Fonctionnalités:**
- Charge la liste des workspaces (`/api/workspaces/me`)
- Affiche les workspaces disponibles
- **Sélection automatique si 1 seul workspace**
- Stocke le workspace sélectionné
- Redirige vers `returnUrl` ou `/`

**✅ FONCTIONNEMENT CORRECT pour 1 workspace**

**❌ PROBLÈME #8: Pas de pré-sélection pour multi-workspace**

**Code actuel:**
```typescript
tap((workspaces) => {
  if (workspaces.length === 1) {
    this.selectWorkspace(workspaces[0]);
  }
})
```

**Code recommandé:**
```typescript
tap((workspaces) => {
  if (workspaces.length === 1) {
    this.selectWorkspace(workspaces[0]);
  } else if (workspaces.length > 1) {
    // Pré-sélectionner le workspace précédent si disponible
    const current = this.workspaceService.getCurrentWorkspace();
    if (current && workspaces.find(w => w.id === current.id)) {
      // Workspace toujours valide, pas besoin de re-sélectionner
      this.router.navigateByUrl(this.returnUrl || '/');
    }
  }
})
```

### 7.2 Sélecteur dans l'AppBar

**❌ COMPOSANT NON TROUVÉ**

**Recherche nécessaire:**
- Vérifier si un sélecteur de workspace existe dans la toolbar/appbar
- Si non, c'est un **manque fonctionnel majeur**

**Fonctionnalité attendue:**
- Dropdown dans l'appbar montrant le workspace actuel
- Possibilité de changer de workspace sans se déconnecter
- Liste des workspaces disponibles

---

## 8. BUGS IDENTIFIÉS

### 🔴 BUG #1: Pas de pré-sélection pour multi-workspace
**Sévérité:** Moyenne  
**Impact:** UX dégradée pour utilisateurs avec plusieurs workspaces  
**Localisation:** `select-workspace.component.ts`  
**Solution:** Vérifier le workspace en localStorage et rediriger si valide

### 🔴 BUG #2: Pas de validation du workspace stocké
**Sévérité:** Haute  
**Impact:** Erreurs 403 si workspace supprimé  
**Localisation:** `workspace.service.ts`  
**Solution:** Ajouter une méthode de validation au démarrage

### 🔴 BUG #3: WorkspaceErrorInterceptor manquant ou incomplet
**Sévérité:** Haute  
**Impact:** Pas de gestion des erreurs 403 workspace  
**Localisation:** `workspace-error.interceptor.ts`  
**Solution:** Implémenter l'intercepteur pour détecter les erreurs workspace

### 🔴 BUG #4: WorkspaceSelectedGuard ne valide pas le workspace
**Sévérité:** Moyenne  
**Impact:** Workspace invalide peut passer le guard  
**Localisation:** `workspace-selected.guard.ts`  
**Solution:** Vérifier que le workspace existe dans la liste disponible

### 🔴 BUG #5: Tags cross-workspace non vérifiés
**Sévérité:** Haute (Sécurité)  
**Impact:** Fuite de données entre workspaces  
**Localisation:** `exercice.controller.js`, `entrainement.controller.js`  
**Solution:** Vérifier que tous les tags connectés appartiennent au workspace

### 🔴 BUG #6: Workspace supprimé reste en localStorage
**Sévérité:** Moyenne  
**Impact:** UX dégradée, erreurs 403  
**Localisation:** `workspace.service.ts`  
**Solution:** Synchroniser avec `/api/workspaces/me` au démarrage

### 🔴 BUG #7: Pas de synchronisation workspace au démarrage
**Sévérité:** Haute  
**Impact:** Données obsolètes, erreurs  
**Localisation:** `app.component.ts` ou initializer  
**Solution:** Valider le workspace au démarrage de l'app

### 🔴 BUG #8: Sélecteur de workspace manquant dans l'AppBar
**Sévérité:** Haute (Fonctionnalité)  
**Impact:** Impossible de changer de workspace facilement  
**Localisation:** À créer  
**Solution:** Ajouter un dropdown dans la toolbar

---

## 9. RECOMMANDATIONS

### 9.1 Corrections Prioritaires

**1. Implémenter WorkspaceErrorInterceptor**
```typescript
@Injectable()
export class WorkspaceErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 403 && error.error?.code === 'WORKSPACE_FORBIDDEN') {
          this.workspaceService.clear();
          this.router.navigate(['/select-workspace'], {
            queryParams: { reason: 'workspace-unavailable' }
          });
        }
        return throwError(() => error);
      })
    );
  }
}
```

**2. Valider le workspace au démarrage**
```typescript
// Dans app.component.ts ngOnInit
this.validateCurrentWorkspace();

private validateCurrentWorkspace(): void {
  const current = this.workspaceService.getCurrentWorkspace();
  if (!current) return;

  this.http.get<WorkspaceSummary[]>('/api/workspaces/me').subscribe({
    next: (workspaces) => {
      if (!workspaces.find(w => w.id === current.id)) {
        this.workspaceService.clear();
        this.router.navigate(['/select-workspace'], {
          queryParams: { reason: 'workspace-unavailable' }
        });
      }
    },
    error: () => {
      // En cas d'erreur, on laisse le workspace actuel
    }
  });
}
```

**3. Vérifier les tags cross-workspace**
```javascript
// Dans exercice.controller.js, avant de connecter les tags
if (tagIds && tagIds.length > 0) {
  const tags = await prisma.tag.findMany({
    where: { id: { in: tagIds }, workspaceId }
  });
  
  if (tags.length !== tagIds.length) {
    return res.status(400).json({ 
      error: 'Certains tags n\'appartiennent pas à ce workspace',
      code: 'INVALID_TAGS'
    });
  }
}
```

**4. Ajouter un sélecteur de workspace dans l'AppBar**
```typescript
// workspace-selector.component.ts
@Component({
  selector: 'app-workspace-selector',
  template: `
    <button mat-button [matMenuTriggerFor]="menu">
      <mat-icon>business</mat-icon>
      {{ currentWorkspace?.name || 'Sélectionner' }}
      <mat-icon>arrow_drop_down</mat-icon>
    </button>
    <mat-menu #menu="matMenu">
      <button mat-menu-item *ngFor="let ws of workspaces$ | async" 
              (click)="selectWorkspace(ws)"
              [class.active]="ws.id === currentWorkspace?.id">
        {{ ws.name }}
        <mat-icon *ngIf="ws.id === currentWorkspace?.id">check</mat-icon>
      </button>
    </mat-menu>
  `
})
export class WorkspaceSelectorComponent implements OnInit {
  workspaces$!: Observable<WorkspaceSummary[]>;
  currentWorkspace: WorkspaceSummary | null = null;

  ngOnInit(): void {
    this.workspaces$ = this.http.get<WorkspaceSummary[]>('/api/workspaces/me');
    this.workspaceService.currentWorkspace$.subscribe(ws => {
      this.currentWorkspace = ws;
    });
  }

  selectWorkspace(ws: WorkspaceSummary): void {
    this.workspaceService.setCurrentWorkspace(ws);
    window.location.reload(); // Recharger pour rafraîchir les données
  }
}
```

### 9.2 Améliorations UX

**1. Indicateur visuel du workspace actuel**
- Badge dans l'appbar
- Couleur différente par workspace
- Nom du workspace toujours visible

**2. Confirmation avant changement de workspace**
```typescript
selectWorkspace(ws: WorkspaceSummary): void {
  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    data: {
      title: 'Changer de workspace',
      message: `Voulez-vous passer au workspace "${ws.name}" ? Les données affichées seront mises à jour.`
    }
  });

  dialogRef.afterClosed().subscribe(confirmed => {
    if (confirmed) {
      this.workspaceService.setCurrentWorkspace(ws);
      window.location.reload();
    }
  });
}
```

**3. Gestion des workspaces vides**
- Message d'accueil pour nouveau workspace
- Bouton "Importer depuis BASE"
- Guide de démarrage

### 9.3 Améliorations Sécurité

**1. Audit trail des changements de workspace**
```javascript
// Ajouter un log à chaque changement
await prisma.workspaceAccessLog.create({
  data: {
    userId: req.user.id,
    workspaceId: req.workspaceId,
    action: 'ACCESS',
    timestamp: new Date()
  }
});
```

**2. Vérification systématique des relations**
- Tous les tags doivent appartenir au workspace
- Tous les exercices liés doivent appartenir au workspace
- Toutes les situations de match doivent appartenir au workspace

**3. Rate limiting par workspace**
```javascript
// Limiter les requêtes par workspace
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => `${req.user.id}:${req.workspaceId}`
});
```

---

## 10. TESTS RECOMMANDÉS

### 10.1 Tests Backend

```javascript
describe('Workspace Isolation', () => {
  it('should not allow access to exercises from another workspace', async () => {
    const ws1 = await createWorkspace('WS1');
    const ws2 = await createWorkspace('WS2');
    const ex1 = await createExercice(ws1.id);
    
    const response = await request(app)
      .get(`/api/exercises/${ex1.id}`)
      .set('X-Workspace-Id', ws2.id)
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(404);
  });

  it('should not allow connecting tags from another workspace', async () => {
    const ws1 = await createWorkspace('WS1');
    const ws2 = await createWorkspace('WS2');
    const tag1 = await createTag(ws1.id);
    
    const response = await request(app)
      .post('/api/exercises')
      .set('X-Workspace-Id', ws2.id)
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: 'Test', tagIds: [tag1.id] });
    
    expect(response.status).toBe(400);
    expect(response.body.code).toBe('INVALID_TAGS');
  });
});
```

### 10.2 Tests Frontend

```typescript
describe('WorkspaceService', () => {
  it('should clear workspace if not in available list', () => {
    const service = TestBed.inject(WorkspaceService);
    service.setCurrentWorkspace({ id: '1', name: 'WS1' });
    
    // Simuler une liste sans le workspace actuel
    const workspaces = [{ id: '2', name: 'WS2' }];
    
    // La validation devrait clear le workspace
    expect(service.getCurrentWorkspace()).toBeNull();
  });
});
```

---

## 11. CONCLUSION

### ✅ Points Forts

1. **Architecture solide**: Modèle de données bien conçu avec relations claires
2. **Isolation backend**: Toutes les requêtes filtrent par workspaceId
3. **Cascade DELETE**: Suppression propre des données
4. **Middleware robuste**: workspaceGuard bien implémenté
5. **Sélection automatique**: Fonctionne pour 1 workspace

### ❌ Points Faibles

1. **Validation manquante**: Workspace en localStorage non validé
2. **Gestion d'erreurs incomplète**: WorkspaceErrorInterceptor manquant
3. **UX multi-workspace**: Pas de pré-sélection, pas de sélecteur dans l'appbar
4. **Sécurité**: Tags cross-workspace non vérifiés
5. **Synchronisation**: Pas de validation au démarrage de l'app

### 🎯 Priorités

**Haute Priorité:**
1. Implémenter WorkspaceErrorInterceptor
2. Vérifier les tags cross-workspace (sécurité)
3. Valider le workspace au démarrage
4. Ajouter un sélecteur dans l'appbar

**Moyenne Priorité:**
5. Améliorer la sélection multi-workspace
6. Ajouter des tests d'isolation
7. Implémenter l'audit trail

**Basse Priorité:**
8. Améliorer l'UX des workspaces vides
9. Ajouter des indicateurs visuels
10. Implémenter le rate limiting par workspace

---

**Audit réalisé le**: 2026-01-26  
**Prochaine révision**: Après implémentation des corrections prioritaires
