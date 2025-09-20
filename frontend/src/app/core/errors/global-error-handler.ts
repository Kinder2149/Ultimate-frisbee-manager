import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { ErrorService } from './error.service';

/**
 * Gestionnaire d'erreurs global pour les exceptions côté client.
 * Il intercepte toutes les erreurs non capturées de l'application
 * et utilise ErrorService pour notifier l'utilisateur.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  // Nous utilisons l'injecteur pour éviter une dépendance circulaire,
  // car ErrorService peut lui-même dépendre d'autres services qui pourraient échouer.
  constructor(private injector: Injector) {}

  handleError(error: any): void {
    const errorService = this.injector.get(ErrorService);

    // Message générique pour les erreurs inattendues
    const message = 'Une erreur inattendue est survenue. L\'équipe technique a été notifiée.';

    // Affiche la notification à l'utilisateur et log l'erreur
    errorService.showError(message, error);

    // On peut aussi re-lancer l'erreur si on veut conserver le comportement par défaut (log en console)
    // console.error(error); // ErrorService le fait déjà, donc c'est redondant ici.
  }
}
