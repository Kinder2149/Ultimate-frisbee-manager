import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { WorkspaceService } from '../services/workspace.service';

@Injectable({ providedIn: 'root' })
export class WorkspaceSelectedGuard implements CanActivate {
  constructor(
    private workspaceService: WorkspaceService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const workspaceId = this.workspaceService.getCurrentWorkspaceId();

    if (workspaceId) {
      return true;
    }

    // Si aucun workspace sélectionné, rediriger vers la page de sélection
    this.router.navigate(['/select-workspace'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
}
