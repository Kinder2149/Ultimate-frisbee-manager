import { Injectable, NgZone } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Service centralisé pour l'affichage des notifications d'erreurs.
 * Utilise MatSnackBar pour fournir un feedback utilisateur cohérent.
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  constructor(private snackBar: MatSnackBar, private zone: NgZone) {}

  /**
   * Affiche une notification d'erreur à l'utilisateur.
   * @param message Le message convivial à afficher.
   * @param error L'objet d'erreur original pour le logging.
   */
  showError(message: string, error?: any): void {
    // S'assure que l'affichage du SnackBar s'exécute dans la zone Angular
    // pour éviter les problèmes de détection de changement.
    this.zone.run(() => {
      this.snackBar.open(message, 'Fermer', {
        duration: 5000, // Durée d'affichage en ms
        panelClass: ['error-snackbar'], // Classe CSS pour la personnalisation
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    });

    // Log l'erreur détaillée en console pour le débogage
    if (error) {
      console.error('Erreur détaillée interceptée :', error);
    }
  }
}
