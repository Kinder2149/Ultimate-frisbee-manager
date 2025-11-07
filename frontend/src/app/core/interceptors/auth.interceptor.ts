import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Intercepter uniquement les requêtes vers notre API backend
    // Intercepter uniquement les requêtes vers notre API backend
    if (req.url.startsWith(environment.apiUrl)) {
      // Utiliser from pour convertir la promesse en observable, puis switchMap
      return from(this.authService.getAccessToken()).pipe(
        switchMap(token => {
          if (token) {
            // Cloner la requête pour ajouter le header d'autorisation
            const clonedReq = req.clone({
              headers: req.headers
                .set('Authorization', `Bearer ${token}`)
                .set('apikey', environment.supabaseKey)
            });
            return next.handle(clonedReq);
          }
          // S'il n'y a pas de token, envoyer la requête originale.
          // Le backend la rejettera avec une erreur 401 si la route est protégée.
          return next.handle(req);
        })
      );
    }

    // Pour toutes les autres requêtes, ne rien faire
    return next.handle(req);
  }
}
