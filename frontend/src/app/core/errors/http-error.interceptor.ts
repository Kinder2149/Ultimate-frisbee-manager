import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorService } from './error.service';

/**
 * Intercepteur HTTP pour capturer les erreurs de l'API et les gérer de manière centralisée.
 */
@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private errorService: ErrorService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Une erreur inconnue est survenue lors de la communication avec le serveur.';

        if (error.error instanceof ErrorEvent) {
          // Erreur côté client ou réseau.
          errorMessage = `Erreur réseau: ${error.error.message}`;
        } else {
          // Le backend a retourné un code d'erreur.
          // On essaie d'extraire le message de notre format d'erreur standardisé.
          if (error.error && typeof error.error.error === 'string') {
            errorMessage = error.error.error;
          } else if (error.statusText) {
            errorMessage = `Erreur ${error.status}: ${error.statusText}`;
          }
        }

        // Utilise le service d'erreur pour afficher la notification
        this.errorService.showError(errorMessage, error);

        // Renvoie l'erreur pour que les gestionnaires d'erreurs locaux (s'il y en a) puissent réagir.
        return throwError(() => error);
      })
    );
  }
}
