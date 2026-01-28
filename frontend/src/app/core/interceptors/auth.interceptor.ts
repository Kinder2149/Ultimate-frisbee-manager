import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor HTTP pour l'authentification Supabase
 * Injecte automatiquement le token Supabase dans les requêtes API
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isBackendApiRequest =
      req.url.startsWith(environment.apiUrl) ||
      req.url.startsWith('/api/');

    // Intercepter uniquement les requêtes vers notre API backend
    if (isBackendApiRequest) {
      // Récupérer le token Supabase de manière asynchrone
      return from(this.authService.getAccessToken()).pipe(
        switchMap(token => {
          if (token) {
            console.log('[Interceptor] Token ajouté à la requête:', req.url);
            // Cloner la requête pour ajouter le header d'autorisation
            const clonedReq = req.clone({
              headers: req.headers.set('Authorization', `Bearer ${token}`)
            });
            return next.handle(clonedReq);
          }
          // S'il n'y a pas de token, envoyer la requête originale
          console.warn('[Interceptor] Pas de token disponible pour:', req.url);
          return next.handle(req);
        })
      );
    }

    // Pour toutes les autres requêtes, ne rien faire
    return next.handle(req);
  }
}
