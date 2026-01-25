import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Clé localStorage pour le token backend local (doit correspondre à AuthService)
const LOCAL_TOKEN_KEY = 'ufm_access_token';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Intercepter uniquement les requêtes vers notre API backend
    if (req.url.startsWith(environment.apiUrl)) {
      // Lire directement depuis localStorage (synchrone, plus fiable)
      const token = localStorage.getItem(LOCAL_TOKEN_KEY);
      
      if (token) {
        // Cloner la requête pour ajouter le header d'autorisation
        const clonedReq = req.clone({
          headers: req.headers
            .set('Authorization', `Bearer ${token}`)
            .set('apikey', environment.supabaseKey)
        });
        return next.handle(clonedReq);
      }
      // S'il n'y a pas de token, envoyer la requête originale
      return next.handle(req);
    }

    // Pour toutes les autres requêtes, ne rien faire
    return next.handle(req);
  }
}
