/**
 * Guard de rôle pour restreindre l'accès aux routes admin
 */
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router, private notificationService: NotificationService) {}

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
}
