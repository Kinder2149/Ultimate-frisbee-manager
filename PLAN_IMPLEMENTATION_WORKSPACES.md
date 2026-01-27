# 🎯 PLAN D'IMPLÉMENTATION COMPLET - SYSTÈME DE WORKSPACES

**Date**: 2026-01-26  
**Objectif**: Corriger tous les bugs identifiés dans l'audit des workspaces  
**Durée estimée**: 4-6 heures de développement

---

## 📊 VUE D'ENSEMBLE

### Bugs à Corriger (par priorité)

| ID | Sévérité | Description | Phase |
|----|----------|-------------|-------|
| #5 | 🔴 Haute (Sécurité) | Tags cross-workspace non vérifiés | 1 |
| #7 | 🔴 Haute | Pas de synchronisation au démarrage | 2 |
| #8 | 🔴 Haute (Fonctionnalité) | Sélecteur workspace manquant dans AppBar | 3 |
| #3 | 🟡 Moyenne | WorkspaceErrorInterceptor trop agressif | 2 |
| #4 | 🟡 Moyenne | WorkspaceSelectedGuard ne valide pas | 2 |
| #1 | 🟡 Moyenne | Pas de pré-sélection multi-workspace | 3 |
| #2 | 🟡 Moyenne | Pas de validation workspace stocké | 2 |
| #6 | 🟡 Moyenne | Workspace supprimé reste en localStorage | 2 |

### Phases d'Implémentation

```
PHASE 1: SÉCURITÉ (Backend)
└── Vérification tags cross-workspace
└── Tests d'isolation

PHASE 2: VALIDATION (Frontend + Backend)
└── Améliorer intercepteurs et guards
└── Validation au démarrage
└── Gestion erreurs workspace

PHASE 3: UX (Frontend)
└── Sélecteur dans AppBar
└── Pré-sélection multi-workspace
└── Amélioration composant sélection

PHASE 4: TESTS
└── Tests backend
└── Tests frontend
└── Tests E2E

PHASE 5: DOCUMENTATION & DÉPLOIEMENT
└── Documentation utilisateur
└── Guide migration
└── Déploiement production
```

---

## 🔴 PHASE 1: SÉCURITÉ (PRIORITÉ CRITIQUE)

**Durée estimée**: 1-2 heures  
**Objectif**: Corriger la faille de sécurité permettant l'accès à des tags d'autres workspaces

### 1.1 Créer une fonction utilitaire de validation

**Fichier**: `backend/utils/workspace-validation.js` (nouveau)

```javascript
const { prisma } = require('../services/prisma');

/**
 * Vérifie que tous les tags appartiennent au workspace spécifié
 * @param {string[]} tagIds - IDs des tags à vérifier
 * @param {string} workspaceId - ID du workspace
 * @returns {Promise<{valid: boolean, invalidIds: string[]}>}
 */
async function validateTagsInWorkspace(tagIds, workspaceId) {
  if (!tagIds || tagIds.length === 0) {
    return { valid: true, invalidIds: [] };
  }

  const tags = await prisma.tag.findMany({
    where: {
      id: { in: tagIds },
      workspaceId
    },
    select: { id: true }
  });

  const foundIds = tags.map(t => t.id);
  const invalidIds = tagIds.filter(id => !foundIds.includes(id));

  return {
    valid: invalidIds.length === 0,
    invalidIds
  };
}

/**
 * Vérifie qu'un exercice appartient au workspace
 */
async function validateExerciceInWorkspace(exerciceId, workspaceId) {
  const exercice = await prisma.exercice.findFirst({
    where: { id: exerciceId, workspaceId }
  });
  return !!exercice;
}

/**
 * Vérifie qu'une situation de match appartient au workspace
 */
async function validateSituationMatchInWorkspace(situationId, workspaceId) {
  const situation = await prisma.situationMatch.findFirst({
    where: { id: situationId, workspaceId }
  });
  return !!situation;
}

/**
 * Vérifie qu'un échauffement appartient au workspace
 */
async function validateEchauffementInWorkspace(echauffementId, workspaceId) {
  const echauffement = await prisma.echauffement.findFirst({
    where: { id: echauffementId, workspaceId }
  });
  return !!echauffement;
}

module.exports = {
  validateTagsInWorkspace,
  validateExerciceInWorkspace,
  validateSituationMatchInWorkspace,
  validateEchauffementInWorkspace
};
```

### 1.2 Modifier `exercice.controller.js`

**Localisation**: `backend/controllers/exercice.controller.js`

**Modifications à apporter:**

#### Dans `createExercice`:
```javascript
const { validateTagsInWorkspace } = require('../utils/workspace-validation');

exports.createExercice = async (req, res, next) => {
  try {
    const workspaceId = req.workspaceId;
    const { tagIds, ...otherFields } = req.body;

    // AJOUT: Valider que tous les tags appartiennent au workspace
    if (tagIds && tagIds.length > 0) {
      const validation = await validateTagsInWorkspace(tagIds, workspaceId);
      if (!validation.valid) {
        return res.status(400).json({
          error: 'Certains tags n\'appartiennent pas à ce workspace',
          code: 'INVALID_TAGS',
          invalidIds: validation.invalidIds
        });
      }
    }

    // Suite du code existant...
  }
};
```

#### Dans `updateExercice`:
```javascript
exports.updateExercice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspaceId = req.workspaceId;
    const { tagIds, ...otherFields } = req.body;

    // Vérifier que l'exercice existe
    const existingExercice = await prisma.exercice.findFirst({ 
      where: { id, workspaceId } 
    });

    if (!existingExercice) {
      return res.status(404).json({ error: 'Exercice non trouvé' });
    }

    // AJOUT: Valider que tous les tags appartiennent au workspace
    if (tagIds && tagIds.length > 0) {
      const validation = await validateTagsInWorkspace(tagIds, workspaceId);
      if (!validation.valid) {
        return res.status(400).json({
          error: 'Certains tags n\'appartiennent pas à ce workspace',
          code: 'INVALID_TAGS',
          invalidIds: validation.invalidIds
        });
      }
    }

    // Suite du code existant...
  }
};
```

### 1.3 Modifier `entrainement.controller.js`

**Localisation**: `backend/controllers/entrainement.controller.js`

**Modifications similaires pour:**
- `createEntrainement`: Valider `tagIds`, `echauffementId`, `situationMatchId`, `exerciceIds`
- `updateEntrainement`: Valider les mêmes champs

```javascript
const {
  validateTagsInWorkspace,
  validateExerciceInWorkspace,
  validateSituationMatchInWorkspace,
  validateEchauffementInWorkspace
} = require('../utils/workspace-validation');

exports.createEntrainement = async (req, res, next) => {
  try {
    const workspaceId = req.workspaceId;
    const { tagIds, echauffementId, situationMatchId, exercices } = req.body;

    // Valider les tags
    if (tagIds && tagIds.length > 0) {
      const validation = await validateTagsInWorkspace(tagIds, workspaceId);
      if (!validation.valid) {
        return res.status(400).json({
          error: 'Certains tags n\'appartiennent pas à ce workspace',
          code: 'INVALID_TAGS'
        });
      }
    }

    // Valider l'échauffement
    if (echauffementId) {
      const valid = await validateEchauffementInWorkspace(echauffementId, workspaceId);
      if (!valid) {
        return res.status(400).json({
          error: 'L\'échauffement n\'appartient pas à ce workspace',
          code: 'INVALID_ECHAUFFEMENT'
        });
      }
    }

    // Valider la situation de match
    if (situationMatchId) {
      const valid = await validateSituationMatchInWorkspace(situationMatchId, workspaceId);
      if (!valid) {
        return res.status(400).json({
          error: 'La situation de match n\'appartient pas à ce workspace',
          code: 'INVALID_SITUATION'
        });
      }
    }

    // Valider les exercices
    if (exercices && exercices.length > 0) {
      for (const ex of exercices) {
        if (ex.exerciceId) {
          const valid = await validateExerciceInWorkspace(ex.exerciceId, workspaceId);
          if (!valid) {
            return res.status(400).json({
              error: `L'exercice ${ex.exerciceId} n'appartient pas à ce workspace`,
              code: 'INVALID_EXERCICE'
            });
          }
        }
      }
    }

    // Suite du code existant...
  }
};
```

### 1.4 Modifier `situationmatch.controller.js`

**Modifications similaires pour:**
- `createSituationMatch`: Valider `tagIds`
- `updateSituationMatch`: Valider `tagIds`

### 1.5 Tests de validation

**Fichier**: `backend/__tests__/workspace-isolation.test.js` (nouveau)

```javascript
const request = require('supertest');
const app = require('../app');
const { prisma } = require('../services/prisma');

describe('Workspace Isolation - Tags', () => {
  let workspace1, workspace2, user, token;
  let tag1, tag2;

  beforeAll(async () => {
    // Créer workspaces et utilisateur de test
    workspace1 = await prisma.workspace.create({ data: { name: 'WS1' } });
    workspace2 = await prisma.workspace.create({ data: { name: 'WS2' } });
    
    user = await prisma.user.create({
      data: {
        email: 'test@test.com',
        passwordHash: 'hash',
        nom: 'Test',
        role: 'USER'
      }
    });

    // Lier l'utilisateur aux deux workspaces
    await prisma.workspaceUser.createMany({
      data: [
        { workspaceId: workspace1.id, userId: user.id, role: 'OWNER' },
        { workspaceId: workspace2.id, userId: user.id, role: 'OWNER' }
      ]
    });

    // Créer des tags dans chaque workspace
    tag1 = await prisma.tag.create({
      data: {
        label: 'Tag1',
        category: 'test',
        workspaceId: workspace1.id
      }
    });

    tag2 = await prisma.tag.create({
      data: {
        label: 'Tag2',
        category: 'test',
        workspaceId: workspace2.id
      }
    });

    // Obtenir un token
    token = 'test-token'; // À adapter selon votre système d'auth
  });

  afterAll(async () => {
    // Nettoyer
    await prisma.workspaceUser.deleteMany({});
    await prisma.tag.deleteMany({});
    await prisma.workspace.deleteMany({});
    await prisma.user.deleteMany({});
  });

  test('Ne doit pas permettre de créer un exercice avec un tag d\'un autre workspace', async () => {
    const response = await request(app)
      .post('/api/exercises')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Workspace-Id', workspace1.id)
      .send({
        nom: 'Test Exercise',
        description: 'Test',
        tagIds: [tag2.id] // Tag du workspace2
      });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('INVALID_TAGS');
  });

  test('Doit permettre de créer un exercice avec un tag du même workspace', async () => {
    const response = await request(app)
      .post('/api/exercises')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Workspace-Id', workspace1.id)
      .send({
        nom: 'Test Exercise',
        description: 'Test',
        tagIds: [tag1.id] // Tag du workspace1
      });

    expect(response.status).toBe(201);
  });
});
```

**✅ Checklist Phase 1:**
- [ ] Créer `workspace-validation.js`
- [ ] Modifier `exercice.controller.js` (create + update)
- [ ] Modifier `entrainement.controller.js` (create + update)
- [ ] Modifier `situationmatch.controller.js` (create + update)
- [ ] Créer tests d'isolation
- [ ] Tester manuellement en local
- [ ] Commit: `fix(security): prevent cross-workspace tag access`

---

## 🟡 PHASE 2: VALIDATION ET GESTION D'ERREURS

**Durée estimée**: 2 heures  
**Objectif**: Améliorer la validation et la gestion des erreurs workspace

### 2.1 Améliorer `WorkspaceErrorInterceptor`

**Fichier**: `frontend/src/app/core/interceptors/workspace-error.interceptor.ts`

**Problème actuel**: Redirige sur TOUS les 403/404, pas seulement ceux liés au workspace

**Solution**: Vérifier le code d'erreur spécifique

```typescript
import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WorkspaceService } from '../services/workspace.service';

@Injectable()
export class WorkspaceErrorInterceptor implements HttpInterceptor {
  constructor(
    private workspaceService: WorkspaceService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Ne traiter que les requêtes vers notre API backend
    if (!req.url.startsWith(environment.apiUrl)) {
      return next.handle(req);
    }

    return next.handle(req).pipe(
      catchError((err: any) => {
        if (err instanceof HttpErrorResponse) {
          const status = err.status;
          const errorCode = err.error?.code;

          // MODIFICATION: Vérifier le code d'erreur spécifique au workspace
          const isWorkspaceError = 
            errorCode === 'WORKSPACE_FORBIDDEN' ||
            errorCode === 'WORKSPACE_ID_REQUIRED' ||
            errorCode === 'WORKSPACE_NOT_FOUND' ||
            errorCode === 'NO_USER_FOR_WORKSPACE';

          if (isWorkspaceError && (status === 403 || status === 400 || status === 404)) {
            const currentUrl = this.router.url || '/';

            // Si on est déjà sur la page de sélection, ne pas boucler
            if (!currentUrl.startsWith('/select-workspace')) {
              console.warn('[WorkspaceErrorInterceptor] Workspace error detected:', errorCode);
              
              // Nettoyer le workspace courant côté front
              this.workspaceService.clear();

              // Redirection vers la sélection de workspace avec retour prévu
              this.router.navigate(['/select-workspace'], {
                queryParams: {
                  returnUrl: currentUrl,
                  reason: 'workspace-unavailable'
                }
              });
            }
          }
        }

        return throwError(() => err);
      })
    );
  }
}
```

### 2.2 Améliorer `WorkspaceSelectedGuard`

**Fichier**: `frontend/src/app/core/guards/workspace-selected.guard.ts`

**Problème actuel**: Ne valide pas si le workspace est toujours valide

**Solution**: Ajouter une validation asynchrone

```typescript
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { WorkspaceService, WorkspaceSummary } from '../services/workspace.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WorkspaceSelectedGuard implements CanActivate {
  private validationCache: { [key: string]: boolean } = {};
  private cacheTimeout = 60000; // 1 minute

  constructor(
    private workspaceService: WorkspaceService,
    private router: Router,
    private http: HttpClient
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    const workspaceId = this.workspaceService.getCurrentWorkspaceId();

    if (!workspaceId) {
      // Aucun workspace sélectionné
      this.router.navigate(['/select-workspace'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }

    // Vérifier le cache
    if (this.validationCache[workspaceId]) {
      return true;
    }

    // Valider que le workspace existe toujours
    return this.http.get<WorkspaceSummary[]>(`${environment.apiUrl}/workspaces/me`).pipe(
      map(workspaces => {
        const exists = workspaces.some(w => w.id === workspaceId);
        
        if (exists) {
          // Mettre en cache
          this.validationCache[workspaceId] = true;
          setTimeout(() => {
            delete this.validationCache[workspaceId];
          }, this.cacheTimeout);
          return true;
        } else {
          // Workspace n'existe plus
          console.warn('[WorkspaceSelectedGuard] Workspace no longer available:', workspaceId);
          this.workspaceService.clear();
          this.router.navigate(['/select-workspace'], {
            queryParams: { 
              returnUrl: state.url,
              reason: 'workspace-unavailable'
            }
          });
          return false;
        }
      }),
      catchError(error => {
        console.error('[WorkspaceSelectedGuard] Error validating workspace:', error);
        // En cas d'erreur réseau, laisser passer (l'intercepteur gérera)
        return of(true);
      })
    );
  }
}
```

### 2.3 Ajouter validation au démarrage de l'app

**Fichier**: `frontend/src/app/app.component.ts`

**Ajouter dans `ngOnInit`:**

```typescript
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { WorkspaceService, WorkspaceSummary } from './core/services/workspace.service';
import { AuthService } from './core/services/auth.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private router: Router,
    private workspaceService: WorkspaceService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Valider le workspace au démarrage si l'utilisateur est authentifié
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this.validateCurrentWorkspace();
      }
    });
  }

  private validateCurrentWorkspace(): void {
    const current = this.workspaceService.getCurrentWorkspace();
    
    // Si pas de workspace sélectionné, ne rien faire
    if (!current) {
      return;
    }

    // Vérifier que le workspace existe toujours
    this.http.get<WorkspaceSummary[]>(`${environment.apiUrl}/workspaces/me`).subscribe({
      next: (workspaces) => {
        const exists = workspaces.some(w => w.id === current.id);
        
        if (!exists) {
          console.warn('[AppComponent] Current workspace no longer available, clearing');
          this.workspaceService.clear();
          
          // Ne rediriger que si on n'est pas déjà sur une page publique
          const currentUrl = this.router.url;
          if (!currentUrl.startsWith('/login') && 
              !currentUrl.startsWith('/select-workspace')) {
            this.router.navigate(['/select-workspace'], {
              queryParams: { reason: 'workspace-unavailable' }
            });
          }
        }
      },
      error: (error) => {
        console.error('[AppComponent] Error validating workspace:', error);
        // Ne pas bloquer l'app en cas d'erreur réseau
      }
    });
  }
}
```

**✅ Checklist Phase 2:**
- [ ] Modifier `workspace-error.interceptor.ts`
- [ ] Modifier `workspace-selected.guard.ts`
- [ ] Modifier `app.component.ts`
- [ ] Tester la validation au démarrage
- [ ] Tester la gestion d'erreurs workspace
- [ ] Commit: `fix(workspace): improve validation and error handling`

---

## 🎨 PHASE 3: AMÉLIORATION UX

**Durée estimée**: 2-3 heures  
**Objectif**: Améliorer l'expérience utilisateur pour la gestion des workspaces

### 3.1 Créer `WorkspaceSelectorComponent` pour l'AppBar

**Fichier**: `frontend/src/app/shared/components/workspace-selector/workspace-selector.component.ts` (nouveau)

```typescript
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { WorkspaceService, WorkspaceSummary } from '../../../core/services/workspace.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-workspace-selector',
  templateUrl: './workspace-selector.component.html',
  styleUrls: ['./workspace-selector.component.scss']
})
export class WorkspaceSelectorComponent implements OnInit {
  workspaces$!: Observable<WorkspaceSummary[]>;
  currentWorkspace: WorkspaceSummary | null = null;

  constructor(
    private http: HttpClient,
    private workspaceService: WorkspaceService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Charger les workspaces disponibles
    this.workspaces$ = this.http.get<WorkspaceSummary[]>(
      `${environment.apiUrl}/workspaces/me`
    );

    // S'abonner au workspace actuel
    this.workspaceService.currentWorkspace$.subscribe(ws => {
      this.currentWorkspace = ws;
    });
  }

  selectWorkspace(workspace: WorkspaceSummary): void {
    // Si c'est déjà le workspace actuel, ne rien faire
    if (this.currentWorkspace?.id === workspace.id) {
      return;
    }

    // Confirmation avant changement
    const dialogRef = this.dialog.open(WorkspaceChangeConfirmDialogComponent, {
      data: {
        from: this.currentWorkspace?.name,
        to: workspace.name
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.workspaceService.setCurrentWorkspace(workspace);
        // Recharger la page pour rafraîchir toutes les données
        window.location.reload();
      }
    });
  }

  getWorkspaceIcon(workspace: WorkspaceSummary): string {
    // Icônes différentes selon le nom du workspace
    if (workspace.name === 'BASE') return 'library_books';
    if (workspace.name === 'TEST') return 'science';
    return 'business';
  }
}
```

**Fichier**: `frontend/src/app/shared/components/workspace-selector/workspace-selector.component.html` (nouveau)

```html
<button mat-button [matMenuTriggerFor]="workspaceMenu" class="workspace-selector-button">
  <mat-icon>{{ getWorkspaceIcon(currentWorkspace!) }}</mat-icon>
  <span class="workspace-name">{{ currentWorkspace?.name || 'Sélectionner' }}</span>
  <mat-icon class="dropdown-icon">arrow_drop_down</mat-icon>
</button>

<mat-menu #workspaceMenu="matMenu" class="workspace-menu">
  <div class="workspace-menu-header">
    <mat-icon>business</mat-icon>
    <span>Mes espaces de travail</span>
  </div>
  
  <mat-divider></mat-divider>
  
  <button 
    mat-menu-item 
    *ngFor="let workspace of workspaces$ | async"
    (click)="selectWorkspace(workspace)"
    [class.active]="workspace.id === currentWorkspace?.id">
    <mat-icon>{{ getWorkspaceIcon(workspace) }}</mat-icon>
    <span>{{ workspace.name }}</span>
    <mat-icon *ngIf="workspace.id === currentWorkspace?.id" class="check-icon">check</mat-icon>
  </button>
</mat-menu>
```

**Fichier**: `frontend/src/app/shared/components/workspace-selector/workspace-selector.component.scss` (nouveau)

```scss
.workspace-selector-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  
  .workspace-name {
    font-weight: 500;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .dropdown-icon {
    margin-left: 4px;
  }
}

::ng-deep .workspace-menu {
  .workspace-menu-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.6);
  }
  
  .mat-menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    
    &.active {
      background-color: rgba(0, 0, 0, 0.04);
      font-weight: 500;
    }
    
    .check-icon {
      margin-left: auto;
      color: var(--primary-color);
    }
  }
}
```

**Fichier**: `frontend/src/app/shared/components/workspace-selector/workspace-change-confirm-dialog.component.ts` (nouveau)

```typescript
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface DialogData {
  from: string | undefined;
  to: string;
}

@Component({
  selector: 'app-workspace-change-confirm-dialog',
  template: `
    <h2 mat-dialog-title>Changer d'espace de travail</h2>
    <mat-dialog-content>
      <p>Voulez-vous passer de <strong>{{ data.from || 'l\'espace actuel' }}</strong> 
         à <strong>{{ data.to }}</strong> ?</p>
      <p class="warning">
        <mat-icon>info</mat-icon>
        Les données affichées seront mises à jour et la page sera rechargée.
      </p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Annuler</button>
      <button mat-raised-button color="primary" (click)="onConfirm()">Confirmer</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .warning {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background-color: #fff3cd;
      border-radius: 4px;
      margin-top: 16px;
      
      mat-icon {
        color: #856404;
      }
    }
  `]
})
export class WorkspaceChangeConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<WorkspaceChangeConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
```

### 3.2 Intégrer le sélecteur dans l'AppBar

**Fichier**: Trouver le composant toolbar/header et ajouter:

```html
<!-- Dans la toolbar, après le titre de l'app -->
<app-workspace-selector *ngIf="isAuthenticated$ | async"></app-workspace-selector>
```

### 3.3 Améliorer `SelectWorkspaceComponent`

**Fichier**: `frontend/src/app/features/workspaces/select-workspace/select-workspace.component.ts`

**Modifications:**

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { MaterialModule } from '../../../core/material/material.module';
import { WorkspaceService, WorkspaceSummary } from '../../../core/services/workspace.service';
import { environment } from '../../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-select-workspace',
  templateUrl: './select-workspace.component.html',
  styleUrls: ['./select-workspace.component.scss'],
  imports: [CommonModule, MaterialModule]
})
export class SelectWorkspaceComponent implements OnInit {
  workspaces$!: Observable<WorkspaceSummary[]>;
  loading = false;
  error: string | null = null;
  private returnUrl: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private workspaceService: WorkspaceService
  ) {}

  ngOnInit(): void {
    // Récupérer l'URL de retour éventuelle
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    // Afficher un message si on a été redirigé
    const reason = this.route.snapshot.queryParamMap.get('reason');
    if (reason === 'workspace-unavailable') {
      this.error = 'Votre espace de travail n\'est plus accessible (supprimé ou droits retirés). ' +
        'Veuillez sélectionner un autre espace.';
    }

    this.loadWorkspaces();
  }

  loadWorkspaces(): void {
    this.loading = true;
    this.error = null;

    const url = `${environment.apiUrl}/workspaces/me`;
    this.workspaces$ = this.http.get<WorkspaceSummary[]>(url).pipe(
      map((items: WorkspaceSummary[]) => {
        this.loading = false;
        return items || [];
      }),
      tap((workspaces) => {
        if (workspaces.length === 0) {
          this.error = 'Aucun espace de travail disponible. Contactez un administrateur.';
          return;
        }

        if (workspaces.length === 1) {
          // Sélection automatique si 1 seul workspace
          this.selectWorkspace(workspaces[0]);
          return;
        }

        // NOUVEAU: Pré-sélection si workspace précédent toujours valide
        const current = this.workspaceService.getCurrentWorkspace();
        if (current && workspaces.find(w => w.id === current.id)) {
          // Workspace toujours valide, rediriger directement
          console.log('[SelectWorkspace] Previous workspace still valid, redirecting');
          this.router.navigateByUrl(this.returnUrl || '/');
        }
      })
    );
  }

  selectWorkspace(ws: WorkspaceSummary): void {
    this.workspaceService.setCurrentWorkspace(ws);
    const target = this.returnUrl || '/';
    this.router.navigateByUrl(target);
  }

  getWorkspaceIcon(workspace: WorkspaceSummary): string {
    if (workspace.name === 'BASE') return 'library_books';
    if (workspace.name === 'TEST') return 'science';
    return 'business';
  }

  getWorkspaceDescription(workspace: WorkspaceSummary): string {
    if (workspace.name === 'BASE') {
      return 'Bibliothèque de référence - Exercices et tags modèles';
    }
    if (workspace.name === 'TEST') {
      return 'Espace de test réservé aux administrateurs';
    }
    return 'Espace de travail personnel';
  }
}
```

**Fichier**: `frontend/src/app/features/workspaces/select-workspace/select-workspace.component.html`

**Améliorer le template:**

```html
<div class="select-workspace-container">
  <mat-card class="select-workspace-card">
    <mat-card-header>
      <div mat-card-avatar class="workspace-avatar">
        <mat-icon>business</mat-icon>
      </div>
      <mat-card-title>Sélectionner un espace de travail</mat-card-title>
      <mat-card-subtitle>Choisissez l'espace dans lequel vous souhaitez travailler</mat-card-subtitle>
    </mat-card-header>

    <mat-card-content>
      <!-- Message d'erreur -->
      <mat-error *ngIf="error" class="error-message">
        <mat-icon>warning</mat-icon>
        {{ error }}
      </mat-error>

      <!-- Loading -->
      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Chargement de vos espaces de travail...</p>
      </div>

      <!-- Liste des workspaces -->
      <div *ngIf="!loading && !error" class="workspaces-grid">
        <mat-card 
          *ngFor="let workspace of workspaces$ | async"
          class="workspace-card"
          (click)="selectWorkspace(workspace)">
          <mat-card-header>
            <div mat-card-avatar class="workspace-icon">
              <mat-icon>{{ getWorkspaceIcon(workspace) }}</mat-icon>
            </div>
            <mat-card-title>{{ workspace.name }}</mat-card-title>
            <mat-card-subtitle>{{ workspace.role }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p class="workspace-description">{{ getWorkspaceDescription(workspace) }}</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary">
              Sélectionner
              <mat-icon>arrow_forward</mat-icon>
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </mat-card-content>
  </mat-card>
</div>
```

**✅ Checklist Phase 3:**
- [ ] Créer `WorkspaceSelectorComponent`
- [ ] Créer `WorkspaceChangeConfirmDialogComponent`
- [ ] Intégrer le sélecteur dans l'AppBar
- [ ] Améliorer `SelectWorkspaceComponent`
- [ ] Améliorer le template de sélection
- [ ] Tester le changement de workspace
- [ ] Tester la pré-sélection
- [ ] Commit: `feat(workspace): add workspace selector in appbar and improve UX`

---

## 🧪 PHASE 4: TESTS

**Durée estimée**: 1-2 heures  
**Objectif**: Valider toutes les corrections avec des tests automatisés

### 4.1 Tests Backend

**Fichier**: `backend/__tests__/workspace-isolation.test.js`

Voir section 1.5 pour les tests d'isolation.

**Ajouter également:**

```javascript
describe('Workspace Isolation - Exercices', () => {
  test('Ne doit pas permettre d\'accéder à un exercice d\'un autre workspace', async () => {
    // Test GET
    const response = await request(app)
      .get(`/api/exercises/${exerciceWs2.id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('X-Workspace-Id', workspace1.id);

    expect(response.status).toBe(404);
  });

  test('Ne doit pas permettre de modifier un exercice d\'un autre workspace', async () => {
    // Test PUT
    const response = await request(app)
      .put(`/api/exercises/${exerciceWs2.id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('X-Workspace-Id', workspace1.id)
      .send({ nom: 'Modified' });

    expect(response.status).toBe(404);
  });

  test('Ne doit pas permettre de supprimer un exercice d\'un autre workspace', async () => {
    // Test DELETE
    const response = await request(app)
      .delete(`/api/exercises/${exerciceWs2.id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('X-Workspace-Id', workspace1.id);

    expect(response.status).toBe(404);
  });
});
```

### 4.2 Tests Frontend

**Fichier**: `frontend/src/app/core/services/workspace.service.spec.ts`

```typescript
import { TestBed } from '@angular/core/testing';
import { WorkspaceService, WorkspaceSummary } from './workspace.service';

describe('WorkspaceService', () => {
  let service: WorkspaceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkspaceService);
    localStorage.clear();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should store workspace in localStorage', () => {
    const workspace: WorkspaceSummary = {
      id: '123',
      name: 'Test Workspace',
      role: 'OWNER'
    };

    service.setCurrentWorkspace(workspace);

    const stored = localStorage.getItem('ufm.currentWorkspace');
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!)).toEqual(workspace);
  });

  it('should retrieve workspace from localStorage on init', () => {
    const workspace: WorkspaceSummary = {
      id: '123',
      name: 'Test Workspace',
      role: 'OWNER'
    };

    localStorage.setItem('ufm.currentWorkspace', JSON.stringify(workspace));

    // Créer une nouvelle instance pour tester l'init
    const newService = new WorkspaceService();
    expect(newService.getCurrentWorkspace()).toEqual(workspace);
  });

  it('should clear workspace', () => {
    const workspace: WorkspaceSummary = {
      id: '123',
      name: 'Test Workspace',
      role: 'OWNER'
    };

    service.setCurrentWorkspace(workspace);
    expect(service.getCurrentWorkspace()).toEqual(workspace);

    service.clear();
    expect(service.getCurrentWorkspace()).toBeNull();
    expect(localStorage.getItem('ufm.currentWorkspace')).toBeNull();
  });
});
```

### 4.3 Tests E2E (Optionnel mais recommandé)

**Fichier**: `frontend/cypress/e2e/workspace-selection.cy.ts`

```typescript
describe('Workspace Selection', () => {
  beforeEach(() => {
    // Login
    cy.visit('/login');
    cy.get('input[formControlName="email"]').type('admin@ultimate.com');
    cy.get('input[formControlName="password"]').type('correct-password');
    cy.get('button[type="submit"]').click();
  });

  it('should automatically select workspace if only one available', () => {
    // Si l'utilisateur n'a qu'un workspace, il devrait être redirigé automatiquement
    cy.url().should('not.include', '/select-workspace');
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('should show workspace selector in appbar', () => {
    cy.get('app-workspace-selector').should('exist');
    cy.get('app-workspace-selector button').should('contain', 'BASE');
  });

  it('should allow changing workspace from appbar', () => {
    // Ouvrir le menu
    cy.get('app-workspace-selector button').click();
    
    // Sélectionner un autre workspace
    cy.get('.workspace-menu button').contains('TEST').click();
    
    // Confirmer
    cy.get('mat-dialog-container button').contains('Confirmer').click();
    
    // La page devrait recharger avec le nouveau workspace
    cy.get('app-workspace-selector button').should('contain', 'TEST');
  });

  it('should redirect to select-workspace if workspace is invalid', () => {
    // Simuler un workspace invalide en localStorage
    cy.window().then((win) => {
      win.localStorage.setItem('ufm.currentWorkspace', JSON.stringify({
        id: 'invalid-id',
        name: 'Invalid'
      }));
    });

    // Recharger la page
    cy.reload();

    // Devrait être redirigé vers la sélection
    cy.url().should('include', '/select-workspace');
    cy.contains('n\'est plus accessible').should('exist');
  });
});
```

**✅ Checklist Phase 4:**
- [ ] Écrire tests d'isolation backend
- [ ] Écrire tests unitaires frontend
- [ ] Écrire tests E2E (optionnel)
- [ ] Exécuter tous les tests
- [ ] Corriger les tests qui échouent
- [ ] Commit: `test(workspace): add comprehensive workspace tests`

---

## 📚 PHASE 5: DOCUMENTATION ET DÉPLOIEMENT

**Durée estimée**: 30 minutes  
**Objectif**: Documenter les changements et déployer en production

### 5.1 Créer un guide utilisateur

**Fichier**: `docs/GUIDE_WORKSPACES.md` (nouveau)

```markdown
# Guide des Espaces de Travail (Workspaces)

## Qu'est-ce qu'un workspace ?

Un workspace (espace de travail) est un environnement isolé contenant :
- Vos exercices
- Vos entraînements
- Vos échauffements
- Vos situations de match
- Vos tags

Les données d'un workspace sont complètement isolées des autres workspaces.

## Workspaces par défaut

### BASE
- Accessible à tous les utilisateurs
- Contient les exercices et tags de référence
- Rôle: USER (lecture seule pour la plupart des utilisateurs)

### TEST
- Réservé aux administrateurs
- Espace de test pour nouvelles fonctionnalités
- Rôle: OWNER (accès complet)

## Sélectionner un workspace

### À la connexion
- Si vous n'avez qu'un seul workspace, il est sélectionné automatiquement
- Si vous avez plusieurs workspaces, vous devez en choisir un

### Changer de workspace
1. Cliquez sur le nom du workspace dans la barre supérieure
2. Sélectionnez le workspace souhaité
3. Confirmez le changement
4. La page se recharge avec les données du nouveau workspace

## Créer un workspace (Admin)

1. Aller dans **Paramètres** > **Workspaces**
2. Cliquer sur **Créer un workspace**
3. Entrer le nom du workspace
4. Sélectionner le propriétaire (optionnel)
5. Le workspace est créé avec une copie des tags de BASE

## Gérer les membres d'un workspace (Owner)

1. Sélectionner le workspace
2. Aller dans **Paramètres** > **Membres**
3. Ajouter ou retirer des utilisateurs
4. Définir les rôles (OWNER, USER)

## Rôles

### OWNER
- Accès complet au workspace
- Peut modifier les paramètres
- Peut gérer les membres

### USER
- Accès en lecture/écriture aux données
- Ne peut pas modifier les paramètres
- Ne peut pas gérer les membres

## Isolation des données

⚠️ **Important**: Les données sont strictement isolées par workspace.

Vous ne pouvez pas :
- Accéder aux exercices d'un autre workspace
- Utiliser des tags d'un autre workspace
- Voir les entraînements d'un autre workspace

## Suppression d'un workspace

⚠️ **Attention**: La suppression d'un workspace est **irréversible**.

Toutes les données seront supprimées :
- Exercices
- Entraînements
- Échauffements
- Situations de match
- Tags
- Liens avec les utilisateurs

## FAQ

**Q: Puis-je copier un exercice d'un workspace à un autre ?**
R: Oui, utilisez la fonction "Dupliquer" puis changez de workspace.

**Q: Que se passe-t-il si mon workspace est supprimé ?**
R: Vous serez automatiquement redirigé vers la page de sélection de workspace.

**Q: Puis-je avoir plusieurs workspaces en même temps ?**
R: Non, vous ne pouvez travailler que dans un workspace à la fois. Vous pouvez changer de workspace à tout moment.

**Q: Les tags sont-ils partagés entre workspaces ?**
R: Non, chaque workspace a ses propres tags. Lors de la création d'un workspace, les tags de BASE sont copiés.
```

### 5.2 Créer un changelog

**Fichier**: `CHANGELOG.md` (ajouter)

```markdown
## [Version X.X.X] - 2026-01-26

### 🔒 Sécurité
- **CRITIQUE**: Correction de la faille permettant l'accès à des tags d'autres workspaces
- Ajout de validation stricte pour toutes les relations cross-workspace
- Amélioration de l'isolation des données

### ✨ Nouvelles fonctionnalités
- Ajout d'un sélecteur de workspace dans la barre supérieure
- Changement de workspace sans déconnexion
- Pré-sélection automatique du workspace précédent

### 🐛 Corrections de bugs
- Correction de la validation du workspace au démarrage
- Amélioration de la gestion des erreurs workspace
- Correction de la redirection en cas de workspace supprimé
- Amélioration du guard de sélection de workspace

### 🎨 Améliorations UX
- Meilleure visualisation des workspaces disponibles
- Descriptions des workspaces
- Icônes différenciées par type de workspace
- Confirmation avant changement de workspace

### 🧪 Tests
- Ajout de tests d'isolation des données
- Ajout de tests de validation frontend
- Ajout de tests E2E pour la sélection de workspace
```

### 5.3 Créer un guide de migration

**Fichier**: `docs/MIGRATION_WORKSPACES.md` (nouveau)

```markdown
# Guide de Migration - Système de Workspaces

## Changements importants

### Pour les développeurs

1. **Validation des tags**: Tous les contrôleurs vérifient maintenant que les tags appartiennent au workspace
2. **Validation au démarrage**: L'application valide le workspace au démarrage
3. **Nouveau composant**: `WorkspaceSelectorComponent` dans l'AppBar
4. **Amélioration des guards**: Le guard vérifie maintenant la validité du workspace

### Pour les utilisateurs

1. **Sélecteur dans l'AppBar**: Vous pouvez maintenant changer de workspace sans vous déconnecter
2. **Validation automatique**: Si votre workspace est supprimé, vous serez automatiquement redirigé
3. **Meilleure UX**: Interface améliorée pour la sélection de workspace

## Migration des données

Aucune migration de données n'est nécessaire. Les changements sont uniquement au niveau du code.

## Tests recommandés après déploiement

1. Tester la sélection de workspace à la connexion
2. Tester le changement de workspace depuis l'AppBar
3. Tester la création d'un exercice avec des tags
4. Vérifier que les données sont bien isolées par workspace
5. Tester la suppression d'un workspace et la redirection

## Rollback

En cas de problème, vous pouvez revenir à la version précédente :

```bash
git revert <commit-hash>
git push
```

Les données ne seront pas affectées.
```

### 5.4 Déploiement

**Étapes:**

1. **Vérifier tous les tests**
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

2. **Commit final**
```bash
git add .
git commit -m "feat(workspace): complete workspace system overhaul

- Fix critical security issue with cross-workspace tags
- Add workspace selector in appbar
- Improve validation and error handling
- Add comprehensive tests
- Update documentation

BREAKING CHANGES: None
SECURITY: Fixes cross-workspace data access vulnerability"
```

3. **Push et déploiement**
```bash
git push origin master
```

4. **Vérifier le déploiement Vercel**
- Attendre le build (2-3 minutes)
- Vérifier les logs
- Tester en production

5. **Tests post-déploiement**
- [ ] Login avec un utilisateur ayant 1 workspace
- [ ] Login avec un utilisateur ayant plusieurs workspaces
- [ ] Changer de workspace depuis l'AppBar
- [ ] Créer un exercice avec des tags
- [ ] Vérifier l'isolation des données

**✅ Checklist Phase 5:**
- [ ] Créer `GUIDE_WORKSPACES.md`
- [ ] Mettre à jour `CHANGELOG.md`
- [ ] Créer `MIGRATION_WORKSPACES.md`
- [ ] Commit final
- [ ] Push et déploiement
- [ ] Tests post-déploiement
- [ ] Commit: `docs(workspace): add comprehensive workspace documentation`

---

## 📊 RÉSUMÉ DU PLAN

### Ordre d'Implémentation

```
1. PHASE 1: SÉCURITÉ (CRITIQUE)
   └── 1.1 Créer workspace-validation.js
   └── 1.2 Modifier exercice.controller.js
   └── 1.3 Modifier entrainement.controller.js
   └── 1.4 Modifier situationmatch.controller.js
   └── 1.5 Créer tests d'isolation
   └── Commit: "fix(security): prevent cross-workspace tag access"

2. PHASE 2: VALIDATION
   └── 2.1 Améliorer WorkspaceErrorInterceptor
   └── 2.2 Améliorer WorkspaceSelectedGuard
   └── 2.3 Ajouter validation au démarrage (app.component.ts)
   └── Commit: "fix(workspace): improve validation and error handling"

3. PHASE 3: UX
   └── 3.1 Créer WorkspaceSelectorComponent
   └── 3.2 Intégrer dans l'AppBar
   └── 3.3 Améliorer SelectWorkspaceComponent
   └── Commit: "feat(workspace): add workspace selector and improve UX"

4. PHASE 4: TESTS
   └── 4.1 Tests backend
   └── 4.2 Tests frontend
   └── 4.3 Tests E2E (optionnel)
   └── Commit: "test(workspace): add comprehensive tests"

5. PHASE 5: DOCUMENTATION
   └── 5.1 Guide utilisateur
   └── 5.2 Changelog
   └── 5.3 Guide migration
   └── 5.4 Déploiement
   └── Commit: "docs(workspace): add documentation"
```

### Durée Totale Estimée

- **Phase 1**: 1-2 heures (CRITIQUE)
- **Phase 2**: 2 heures
- **Phase 3**: 2-3 heures
- **Phase 4**: 1-2 heures
- **Phase 5**: 30 minutes

**Total**: 6.5 - 9.5 heures

### Dépendances

- Phase 2 peut commencer en parallèle de Phase 1
- Phase 3 dépend de Phase 2 (validation doit être en place)
- Phase 4 dépend de Phases 1, 2, 3 (tous les changements doivent être implémentés)
- Phase 5 dépend de Phase 4 (tests doivent passer)

### Priorités

1. **CRITIQUE**: Phase 1 (Sécurité) - À faire immédiatement
2. **HAUTE**: Phase 2 (Validation) - Nécessaire pour stabilité
3. **HAUTE**: Phase 3 (UX) - Amélioration majeure de l'expérience
4. **MOYENNE**: Phase 4 (Tests) - Important mais peut être fait après
5. **BASSE**: Phase 5 (Documentation) - Peut être fait en dernier

---

## 🎯 PROCHAINES ÉTAPES

**Voulez-vous que je commence l'implémentation ?**

**Option A**: Commencer par Phase 1 (Sécurité) - RECOMMANDÉ
**Option B**: Commencer par Phase 2 (Validation)
**Option C**: Tout implémenter d'un coup
**Option D**: Autre approche

**Indiquez votre choix et je commence immédiatement !**
