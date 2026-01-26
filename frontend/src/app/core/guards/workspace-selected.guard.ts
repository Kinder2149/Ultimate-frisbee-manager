import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { WorkspaceService } from '../services/workspace.service';

@Injectable({ providedIn: 'root' })
export class WorkspaceSelectedGuard implements CanActivate {
  constructor(
    private workspaceService: WorkspaceService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot
  ): boolean {
    const workspaceId = this.workspaceService.getCurrentWorkspaceId();

    if (!workspaceId) {
      // Aucun workspace sélectionné, rediriger vers la sélection
      this.router.navigate(['/select-workspace'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }

    // Workspace présent en localStorage, laisser passer
    // La validation de l'existence sera faite par l'interceptor en cas d'erreur API
    return true;
  }
}
