import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Service centralisé pour la gestion des notifications utilisateur
 * Utilise MatSnackBar pour afficher des messages élégants à l'utilisateur
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // Configuration par défaut des notifications
  private readonly defaultDuration = 4000;
  private readonly errorDuration = 6000;
  private readonly successClass = 'success-snackbar';
  private readonly errorClass = 'error-snackbar';
  private readonly infoClass = 'info-snackbar';
  private readonly warningClass = 'warning-snackbar';

  constructor(private snackBar: MatSnackBar) {}

  /**
   * Affiche une notification de succès
   * @param message Le message à afficher
   * @param duration Durée d'affichage en ms (par défaut 4000ms)
   */
  showSuccess(message: string, duration: number = this.defaultDuration): void {
    this.snackBar.open(message, 'Fermer', {
      duration,
      panelClass: [this.successClass],
      horizontalPosition: 'end',
      verticalPosition: 'bottom'
    });
  }

  /**
   * Affiche une notification d'erreur
   * @param message Le message d'erreur à afficher
   * @param duration Durée d'affichage en ms (par défaut 6000ms)
   */
  showError(message: string, duration: number = this.errorDuration): void {
    this.snackBar.open(message, 'Fermer', {
      duration,
      panelClass: [this.errorClass],
      horizontalPosition: 'end',
      verticalPosition: 'bottom'
    });
  }

  /**
   * Affiche une notification d'information
   * @param message Le message d'information à afficher
   * @param duration Durée d'affichage en ms (par défaut 4000ms)
   */
  showInfo(message: string, duration: number = this.defaultDuration): void {
    this.snackBar.open(message, 'Fermer', {
      duration,
      panelClass: [this.infoClass],
      horizontalPosition: 'end',
      verticalPosition: 'bottom'
    });
  }

  /**
   * Affiche une notification d'avertissement
   * @param message Le message d'avertissement à afficher
   * @param duration Durée d'affichage en ms (par défaut 4000ms)
   */
  showWarning(message: string, duration: number = this.defaultDuration): void {
    this.snackBar.open(message, 'Fermer', {
      duration,
      panelClass: [this.warningClass],
      horizontalPosition: 'end',
      verticalPosition: 'bottom'
    });
  }
}
