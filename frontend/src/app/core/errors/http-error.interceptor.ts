import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ErrorService } from './error.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private errorService: ErrorService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let userMessage = 'Une erreur est survenue';

        if (error.error instanceof ErrorEvent) {
          // Erreur côté client (réseau, etc.)
          userMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
        } else {
          // Erreur côté serveur - mapper vers messages utilisateur
          userMessage = this.getErrorMessage(error.status);
        }

        // Afficher le message utilisateur (logs techniques conservés dans ErrorService)
        this.errorService.showError(userMessage, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Mappe les codes HTTP vers des messages utilisateur compréhensibles
   */
  private getErrorMessage(status: number): string {
    switch (status) {
      case 0:
        return 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
      case 400:
        return 'Les informations fournies sont incorrectes. Veuillez vérifier votre saisie.';
      case 401:
        return 'Votre session a expiré. Veuillez vous reconnecter.';
      case 403:
        return 'Vous n\'avez pas les droits nécessaires pour effectuer cette action.';
      case 404:
        return 'Les données demandées sont introuvables.';
      case 408:
        return 'La requête a pris trop de temps. Veuillez réessayer.';
      case 409:
        return 'Cette action entre en conflit avec des données existantes.';
      case 422:
        return 'Les données fournies ne peuvent pas être traitées. Vérifiez votre saisie.';
      case 429:
        return 'Trop de tentatives. Veuillez patienter quelques instants avant de réessayer.';
      case 500:
        return 'Un problème est survenu sur le serveur. Veuillez réessayer dans quelques instants.';
      case 502:
      case 503:
        return 'Le service est temporairement indisponible. Veuillez réessayer dans quelques instants.';
      case 504:
        return 'Le serveur met trop de temps à répondre. Veuillez réessayer.';
      default:
        return 'Une erreur inattendue est survenue. Veuillez réessayer.';
    }
  }
}
