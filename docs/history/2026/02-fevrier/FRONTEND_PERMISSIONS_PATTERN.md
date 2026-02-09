# Pattern d'adaptation Frontend pour les Permissions

> Guide technique pour adapter les composants Angular aux permissions basées sur les rôles

---

## 📋 Pattern TypeScript

### 1. Imports nécessaires

```typescript
import { PermissionsService } from '../../../core/services/permissions.service';
import { WorkspaceService } from '../../../core/services/workspace.service';
```

### 2. Propriétés du composant

```typescript
export class MonComposant implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Permissions
  canCreate = false;
  canEdit = false;
  canDelete = false;
  isBaseWorkspace = false;
  
  constructor(
    private permissionsService: PermissionsService,
    private workspaceService: WorkspaceService,
    // ... autres services
  ) {}
}
```

### 3. Initialisation dans ngOnInit

```typescript
ngOnInit(): void {
  // Initialiser les permissions
  this.updatePermissions();

  // S'abonner aux changements de workspace
  this.workspaceService.currentWorkspace$
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      this.updatePermissions();
    });

  // ... reste de l'initialisation
}
```

### 4. Méthode updatePermissions

```typescript
private updatePermissions(): void {
  this.canCreate = this.permissionsService.canCreate();
  this.canEdit = this.permissionsService.canEdit();
  this.canDelete = this.permissionsService.canDelete();
  this.isBaseWorkspace = this.permissionsService.isBaseWorkspace();
}
```

### 5. Cleanup dans ngOnDestroy

```typescript
ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}
```

---

## 📋 Pattern HTML

### Bouton Créer/Ajouter

```html
<button mat-flat-button color="primary" (click)="onCreate()" *ngIf="canCreate">
  <mat-icon>add</mat-icon>
  Ajouter
</button>
```

### Boutons Modifier/Supprimer

```html
<button mat-icon-button (click)="onEdit()" *ngIf="canEdit">
  <mat-icon>edit</mat-icon>
</button>

<button mat-icon-button (click)="onDelete()" *ngIf="canDelete">
  <mat-icon>delete</mat-icon>
</button>
```

### Badge BASE

```html
<span class="badge badge-base" *ngIf="isBaseWorkspace">
  <mat-icon>lock</mat-icon>
  BASE
</span>
```

### Message d'information pour VIEWER

```html
<div class="info-message" *ngIf="!canCreate">
  <mat-icon>info</mat-icon>
  <p>Vous avez un accès en lecture seule à ce workspace.</p>
</div>
```

---

## 📋 Composants à adapter

### ✅ Complétés

1. **exercice-list.component.ts/html**
   - ✅ PermissionsService injecté
   - ✅ Propriétés canCreate, canEdit
   - ✅ updatePermissions() implémentée
   - ✅ Bouton "Ajouter" masqué si !canCreate
   - ✅ Passage de canEdit aux enfants

2. **exercice-card.component.ts/html**
   - ✅ Input canEdit au lieu de canWrite
   - ✅ Boutons modifier/supprimer/dupliquer masqués si !canEdit

### ⏳ À adapter (même pattern)

3. **entrainement-list.component.ts/html**
   - Ajouter PermissionsService
   - Masquer bouton "Créer entraînement" si !canCreate
   - Passer canEdit aux cards

4. **entrainement-card.component.ts/html**
   - Input canEdit
   - Masquer boutons actions si !canEdit

5. **echauffement-list.component.ts/html**
   - Même pattern que entrainement-list

6. **echauffement-card.component.ts/html**
   - Même pattern que entrainement-card

7. **situationmatch-list.component.ts/html**
   - Même pattern que entrainement-list

8. **situationmatch-card.component.ts/html**
   - Même pattern que entrainement-card

---

## 📋 Badge BASE à ajouter

### Header principal (app-header.component)

```html
<div class="workspace-info" *ngIf="currentWorkspace">
  <span class="workspace-name">{{ currentWorkspace.name }}</span>
  <span class="badge badge-base" *ngIf="currentWorkspace.isBase">
    <mat-icon>lock</mat-icon>
    BASE
  </span>
</div>
```

### Workspace selector

```html
<mat-option *ngFor="let ws of workspaces" [value]="ws.id">
  <span>{{ ws.name }}</span>
  <span class="badge badge-base-small" *ngIf="ws.isBase">BASE</span>
</mat-option>
```

---

## 🎨 Styles CSS pour badge BASE

```scss
.badge-base {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background-color: #FFA726;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  
  mat-icon {
    font-size: 16px;
    width: 16px;
    height: 16px;
  }
}

.badge-base-small {
  padding: 2px 6px;
  background-color: #FFA726;
  color: white;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
  margin-left: 8px;
}
```

---

## ⚡ Checklist d'adaptation

Pour chaque composant :

- [ ] Importer PermissionsService et WorkspaceService
- [ ] Ajouter propriétés canCreate, canEdit, canDelete, isBaseWorkspace
- [ ] Injecter PermissionsService dans constructor
- [ ] Appeler updatePermissions() dans ngOnInit
- [ ] S'abonner à currentWorkspace$ pour mises à jour
- [ ] Implémenter updatePermissions()
- [ ] Nettoyer dans ngOnDestroy
- [ ] Adapter template HTML avec *ngIf
- [ ] Tester avec rôles MANAGER, MEMBER, VIEWER

---

## 🧪 Tests manuels

### Scénario 1 : VIEWER
- ❌ Bouton "Ajouter" invisible
- ❌ Boutons "Modifier/Supprimer" invisibles
- ✅ Bouton "Voir" visible
- ✅ Lecture du contenu possible

### Scénario 2 : MEMBER
- ✅ Bouton "Ajouter" visible
- ✅ Boutons "Modifier/Supprimer" visibles
- ✅ Toutes les actions possibles

### Scénario 3 : MANAGER
- ✅ Toutes les permissions MEMBER
- ✅ Accès aux réglages workspace
- ✅ Gestion des membres

### Scénario 4 : BASE workspace (non-ADMIN)
- ❌ Toutes les actions d'écriture bloquées
- 🔒 Badge "BASE" visible
- ℹ️ Message informatif affiché

---

**Document créé le** : 5 février 2026  
**Dernière mise à jour** : 5 février 2026
