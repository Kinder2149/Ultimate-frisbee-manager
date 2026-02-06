import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { PermissionsService } from '../services/permissions.service';
import { NotificationService } from '../services/notification.service';

@Injectable({ providedIn: 'root' })
export class WriteGuard implements CanActivate {
  constructor(
    private permissionsService: PermissionsService,
    private notificationService: NotificationService,
    private router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.permissionsService.canWrite()) {
      return true;
    }

    this.notificationService.showError(this.permissionsService.getPermissionDeniedMessage());

    const url = String(state.url || '');
    if (url.startsWith('/exercices')) {
      this.router.navigate(['/exercices']);
      return false;
    }
    if (url.startsWith('/entrainements')) {
      this.router.navigate(['/entrainements']);
      return false;
    }
    if (url.startsWith('/echauffements')) {
      this.router.navigate(['/echauffements']);
      return false;
    }
    if (url.startsWith('/situations-matchs')) {
      this.router.navigate(['/situations-matchs']);
      return false;
    }

    this.router.navigate(['/']);
    return false;
  }
}
