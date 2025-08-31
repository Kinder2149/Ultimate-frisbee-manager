/**
 * Intercepteur HTTP pour ajouter automatiquement le token d'authentification
 */
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Ajouter le token d'authentification si disponible
    const authReq = this.addTokenHeader(req);

    return next.handle(authReq).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          const url = authReq.url || '';
          // Eviter toute logique de refresh sur les endpoints d'auth eux-mêmes
          if (url.includes('/auth/refresh') || url.includes('/auth/login') || url.includes('/auth/logout')) {
            // Sécurise l'état local et renvoie l'erreur sans tenter un refresh
            this.authService.logoutLocal();
            return throwError(error);
          }
          return this.handle401Error(authReq, next);
        }
        return throwError(error);
      })
    );
  }

  /**
   * Ajouter le header Authorization avec le token
   */
  private addTokenHeader(request: HttpRequest<any>): HttpRequest<any> {
    const token = this.authService.getToken();
    
    if (token && !request.url.includes('/auth/login') && !request.url.includes('/auth/refresh')) {
      return request.clone({
        headers: request.headers.set('Authorization', `Bearer ${token}`)
      });
    }
    
    return request;
  }

  /**
   * Gérer les erreurs 401 (non autorisé)
   */
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.authService.getRefreshToken();
      
      if (refreshToken) {
        return this.authService.refreshToken().pipe(
          switchMap((response: any) => {
            this.isRefreshing = false;
            this.refreshTokenSubject.next(response.token);
            
            return next.handle(this.addTokenHeader(request));
          }),
          catchError((error) => {
            this.isRefreshing = false;
            this.authService.logoutLocal();
            return throwError(error);
          })
        );
      } else {
        this.isRefreshing = false;
        this.authService.logoutLocal();
        return throwError('No refresh token available');
      }
    }

    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(() => next.handle(this.addTokenHeader(request)))
    );
  }
}
