import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { filter, take, map } from 'rxjs/operators';
import { WorkspaceService } from '../services/workspace.service';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class WorkspaceSelectedGuard implements CanActivate {
  constructor(
    private workspaceService: WorkspaceService,
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // Attendre que authReady$ soit true avant toute vérification
    return this.authService.authReady$.pipe(
      filter((isReady: boolean) => isReady === true),
      take(1),
      map(() => {
        // Auth prête (ensureWorkspaceSelected() a déjà validé le workspace)
        const workspace = this.workspaceService.getCurrentWorkspace();
        const workspaceId = workspace?.id;

        // Pas de workspace sélectionné
        if (!workspaceId) {
          console.log('[WorkspaceGuard] No workspace selected');
          this.router.navigate(['/select-workspace'], {
            queryParams: { returnUrl: state.url }
          });
          return false;
        }

        // Empêcher l'accès au contenu si aucun rôle workspace explicite
        if (!workspace?.role) {
          console.warn('[WorkspaceGuard] Workspace has no explicit role, access to content blocked:', workspaceId);
          this.workspaceService.clear();
          this.router.navigate(['/select-workspace'], {
            queryParams: {
              returnUrl: state.url,
              reason: 'workspace-role-required'
            }
          });
          return false;
        }
        
        console.log('[WorkspaceGuard] Workspace valid:', workspace.name);
        return true;
      })
    );
  }
}
