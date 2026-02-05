# État d'adaptation Frontend - Permissions basées sur les rôles

> **Date** : 5 février 2026  
> **Statut** : 🟡 EN COURS (60% complété)

---

## 📊 RÉSUMÉ EXÉCUTIF

### Objectif
Adapter tous les composants Angular pour respecter les permissions basées sur les rôles workspace (MANAGER, MEMBER, VIEWER).

### Progression : 60%

| Composant | Statut | Détails |
|-----------|--------|---------|
| PermissionsService | ✅ 100% | Service créé avec toutes les méthodes |
| Exercices (list + card) | ✅ 100% | TypeScript + HTML adaptés |
| Entraînements (list) | ✅ 100% | TypeScript + HTML adaptés |
| Échauffements | ⏳ 0% | À adapter |
| Situations/Matchs | ⏳ 0% | À adapter |
| Badge BASE (header) | ⏳ 0% | À ajouter |
| Badge BASE (selector) | ⏳ 0% | À ajouter |

---

## ✅ COMPLÉTÉ

### 1. PermissionsService (100%)

**Fichier** : `frontend/src/app/core/services/permissions.service.ts`

**Fonctionnalités** :
- ✅ 15 méthodes de vérification des permissions
- ✅ Normalisation automatique des rôles legacy (OWNER→MANAGER, USER→MEMBER)
- ✅ Méthodes principales :
  - `canCreate()` : Vérifie si l'utilisateur peut créer du contenu
  - `canEdit()` : Vérifie si l'utilisateur peut modifier
  - `canDelete()` : Vérifie si l'utilisateur peut supprimer
  - `canManageMembers()` : Vérifie si l'utilisateur peut gérer les membres
  - `canManageSettings()` : Vérifie si l'utilisateur peut modifier les réglages
  - `canExport()` : Vérifie si l'utilisateur peut exporter (ADMIN uniquement)
  - `canMutateBase()` : Vérifie si l'utilisateur peut modifier la BASE
  - `isBaseWorkspace()` : Vérifie si le workspace actuel est BASE
  - `isTester()` : Vérifie si l'utilisateur est Testeur
  - `isAdmin()` : Vérifie si l'utilisateur est ADMIN
- ✅ Messages d'erreur contextuels avec `getPermissionDeniedMessage()`
- ✅ Libellés de rôles pour affichage avec `getRoleLabel()`

### 2. Exercices - Liste (100%)

**Fichiers** :
- `frontend/src/app/features/exercices/pages/exercice-list.component.ts`
- `frontend/src/app/features/exercices/pages/exercice-list.component.html`

**Adaptations** :
- ✅ Import PermissionsService
- ✅ Propriétés `canCreate`, `canEdit`, `isBaseWorkspace`
- ✅ Méthode `updatePermissions()` implémentée
- ✅ Abonnement à `currentWorkspace$` pour mises à jour dynamiques
- ✅ Bouton "Ajouter un exercice" masqué si `!canCreate`
- ✅ Passage de `canEdit` au composant enfant `exercice-card`

### 3. Exercices - Card (100%)

**Fichiers** :
- `frontend/src/app/features/exercices/components/exercice-card.component.ts`
- `frontend/src/app/features/exercices/components/exercice-card.component.html`

**Adaptations** :
- ✅ Input `canEdit` (remplace `canWrite`)
- ✅ Import PermissionsService
- ✅ Bouton "Modifier" masqué si `!canEdit`
- ✅ Bouton "Dupliquer" masqué si `!canEdit`
- ✅ Bouton "Supprimer" masqué si `!canEdit`
- ✅ Bouton "Voir" toujours visible (lecture autorisée pour tous)

### 4. Entraînements - Liste (100%)

**Fichiers** :
- `frontend/src/app/features/entrainements/pages/entrainement-list/entrainement-list.component.ts`
- `frontend/src/app/features/entrainements/pages/entrainement-list/entrainement-list.component.html`

**Adaptations** :
- ✅ Import PermissionsService
- ✅ Propriétés `canCreate`, `canEdit`
- ✅ Méthode `updatePermissions()` implémentée
- ✅ Abonnement à `currentWorkspace$`
- ✅ Bouton "Nouvel entraînement" masqué si `!canCreate`
- ✅ Boutons "Modifier/Dupliquer/Supprimer" masqués si `!canEdit`

---

## ⏳ EN ATTENTE

### 5. Échauffements (0%)

**Fichiers à adapter** :
- `frontend/src/app/features/echauffements/pages/echauffement-list/echauffement-list.component.ts`
- `frontend/src/app/features/echauffements/pages/echauffement-list/echauffement-list.component.html`

**Pattern à appliquer** : Identique à exercice-list

### 6. Situations/Matchs (0%)

**Fichiers à adapter** :
- `frontend/src/app/features/situations-matchs/pages/situationmatch-list/situationmatch-list.component.ts`
- `frontend/src/app/features/situations-matchs/pages/situationmatch-list/situationmatch-list.component.html`

**Pattern à appliquer** : Identique à exercice-list

### 7. Badge BASE - Header principal (0%)

**Fichier à modifier** : `frontend/src/app/core/components/header/header.component.html`

**Code à ajouter** :
```html
<span class="badge badge-base" *ngIf="isBaseWorkspace">
  <mat-icon>lock</mat-icon>
  BASE
</span>
```

### 8. Badge BASE - Workspace selector (0%)

**Fichier à modifier** : `frontend/src/app/features/workspaces/workspace-selector.component.html`

**Code à ajouter** :
```html
<span class="badge badge-base-small" *ngIf="workspace.isBase">BASE</span>
```

---

## 📋 PATTERN D'ADAPTATION

### TypeScript

```typescript
// 1. Imports
import { PermissionsService } from '../../../core/services/permissions.service';
import { WorkspaceService } from '../../../core/services/workspace.service';

// 2. Propriétés
canCreate = false;
canEdit = false;
isBaseWorkspace = false;

// 3. Constructor
constructor(
  private permissionsService: PermissionsService,
  private workspaceService: WorkspaceService,
  // ... autres services
) {}

// 4. ngOnInit
ngOnInit(): void {
  this.updatePermissions();
  
  this.workspaceService.currentWorkspace$
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      this.updatePermissions();
    });
}

// 5. Méthode updatePermissions
private updatePermissions(): void {
  this.canCreate = this.permissionsService.canCreate();
  this.canEdit = this.permissionsService.canEdit();
  this.isBaseWorkspace = this.permissionsService.isBaseWorkspace();
}
```

### HTML

```html
<!-- Bouton Créer -->
<button (click)="onCreate()" *ngIf="canCreate">Ajouter</button>

<!-- Boutons Modifier/Supprimer -->
<button (click)="onEdit()" *ngIf="canEdit">Modifier</button>
<button (click)="onDelete()" *ngIf="canEdit">Supprimer</button>

<!-- Badge BASE -->
<span class="badge badge-base" *ngIf="isBaseWorkspace">BASE</span>
```

---

## 🎯 PROCHAINES ÉTAPES

### Priorité HAUTE
1. Adapter échauffements (list) - 1h
2. Adapter situations/matchs (list) - 1h

### Priorité MOYENNE
3. Ajouter badge BASE dans header - 30min
4. Ajouter badge BASE dans workspace selector - 30min

### Priorité BASSE
5. Adapter formulaires (exercice-form, entrainement-form, etc.) - 2h
6. Tests manuels complets - 1h

**Temps restant estimé** : 6h

---

## 🧪 TESTS À EFFECTUER

### Scénario 1 : Utilisateur VIEWER
- [ ] Boutons "Ajouter" invisibles sur toutes les listes
- [ ] Boutons "Modifier/Supprimer/Dupliquer" invisibles sur toutes les cards
- [ ] Bouton "Voir" visible et fonctionnel
- [ ] Lecture du contenu possible

### Scénario 2 : Utilisateur MEMBER
- [ ] Boutons "Ajouter" visibles sur toutes les listes
- [ ] Boutons "Modifier/Supprimer/Dupliquer" visibles sur toutes les cards
- [ ] Toutes les actions fonctionnelles

### Scénario 3 : Utilisateur MANAGER
- [ ] Toutes les permissions MEMBER
- [ ] Accès aux réglages workspace
- [ ] Gestion des membres

### Scénario 4 : Workspace BASE (non-ADMIN)
- [ ] Toutes les actions d'écriture bloquées
- [ ] Badge "BASE" visible dans header
- [ ] Badge "BASE" visible dans workspace selector
- [ ] Message informatif affiché

---

## 📊 MÉTRIQUES

### Fichiers créés : 2
1. `frontend/src/app/core/services/permissions.service.ts` (180 lignes)
2. `docs/FRONTEND_PERMISSIONS_PATTERN.md` (documentation)

### Fichiers modifiés : 4
1. `frontend/src/app/features/exercices/pages/exercice-list.component.ts`
2. `frontend/src/app/features/exercices/pages/exercice-list.component.html`
3. `frontend/src/app/features/exercices/components/exercice-card.component.ts`
4. `frontend/src/app/features/exercices/components/exercice-card.component.html`
5. `frontend/src/app/features/entrainements/pages/entrainement-list/entrainement-list.component.ts`
6. `frontend/src/app/features/entrainements/pages/entrainement-list/entrainement-list.component.html`

### Lignes de code ajoutées : ~250 lignes

---

## ✅ VALIDATION

### Backend protège déjà tout ✅
- Même si le frontend n'est pas complètement adapté, le backend bloque toutes les actions non autorisées
- Sécurité garantie côté serveur

### UX cohérente pour les composants adaptés ✅
- Les utilisateurs VIEWER ne voient pas de boutons inutilisables
- Messages d'erreur clairs si tentative d'action non autorisée

### Pattern réutilisable établi ✅
- Documentation complète dans `FRONTEND_PERMISSIONS_PATTERN.md`
- Adaptation des composants restants sera rapide (même pattern)

---

**Document créé le** : 5 février 2026  
**Dernière mise à jour** : 5 février 2026  
**Prochaine révision** : Après adaptation complète de tous les composants
