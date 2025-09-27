/**
 * Guard d'authentification pour protéger les routes
 */
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      take(1), // On ne s'intéresse qu'à l'état actuel au moment de la navigation
      map(isAuthenticated => {
        if (isAuthenticated) {
          return true; // L'utilisateur est authentifié, on autorise l'accès.
        }

        // L'utilisateur n'est pas authentifié, on le redirige vers la page de connexion.
        this.router.navigate(['/login'], {
          queryParams: { returnUrl: state.url }
        });
        return false;
      })
    );
  }
}
