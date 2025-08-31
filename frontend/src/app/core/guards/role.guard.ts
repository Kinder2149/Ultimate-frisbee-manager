/**
 * Guard de rôle pour restreindre l'accès aux routes admin
 */
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

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
          this.router.navigate(['/']);
          return false;
        }
        return true;
      })
    );
  }
}
