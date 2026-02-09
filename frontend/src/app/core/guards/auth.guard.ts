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
    return this.authService.authReady$.pipe(
      take(1),
      map(isReady => {
        if (isReady) {
          // Authentification complète (profil + workspace chargés)
          return true;
        }

        // Vérifier si authentification en cours
        const isAuthenticating = this.authService.isAuthenticated();
        if (isAuthenticating) {
          // Session Supabase existe mais données pas encore prêtes
          // Bloquer la navigation sans rediriger (authReady$ passera à true bientôt)
          return false;
        }

        // Pas de session du tout, rediriger vers login
        this.router.navigate(['/login'], {
          queryParams: { returnUrl: state.url }
        });
        return false;
      })
    );
  }
}
