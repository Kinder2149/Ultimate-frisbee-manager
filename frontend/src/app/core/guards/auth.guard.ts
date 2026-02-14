/**
 * Guard d'authentification pour protéger les routes
 */
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { filter, take, timeout, catchError, switchMap, map } from 'rxjs/operators';
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
      // Attendre que authReady$ devienne true (au lieu de take(1) immédiat)
      filter((isReady: boolean) => isReady === true),
      take(1),
      map(() => true),
      // Timeout de 5s : si authReady$ ne passe jamais à true
      // 5s suffit car le retry sur getSession() prend max 800ms
      timeout(5000),
      catchError(() => {
        console.error('[AuthGuard] Timeout: auth non prête après 5s');
        // Vérifier si l'utilisateur a au moins une session active
        if (this.authService.isAuthenticated()) {
          // Session existe mais init a échoué → laisser passer quand même
          // pour éviter un blocage total (l'utilisateur verra une erreur côté composant)
          console.warn('[AuthGuard] Session existe, passage autorisé malgré timeout');
          return of(true);
        }
        // Pas de session → rediriger vers login de manière synchrone
        console.error('[AuthGuard] Redirection immédiate vers /login');
        setTimeout(() => {
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: state.url }
          });
        }, 0);
        return of(false);
      })
    );
  }
}
