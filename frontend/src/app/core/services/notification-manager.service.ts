import { Injectable, NgZone } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

/**
 * Interface pour les détails d'erreur structurés
 */
export interface ErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

/**
 * Interface pour les options de notification
 */
export interface NotificationOptions {
  duration?: number;
  action?: string;
  requestId?: string;
  details?: ErrorDetail[];
  showCopyButton?: boolean;
}

/**
 * Service centralisé de gestion des notifications utilisateur
 * Fusionne les fonctionnalités de NotificationService et ErrorService
 * Gère les messages simples et les erreurs détaillées avec traçabilité
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationManagerService {
  // Configuration par défaut
  private readonly defaultDuration = 4000;
  private readonly errorDuration = 6000;
  private readonly successClass = 'success-snackbar';
  private readonly errorClass = 'error-snackbar';
  private readonly infoClass = 'info-snackbar';
  private readonly warningClass = 'warning-snackbar';

  constructor(
    private snackBar: MatSnackBar,
    private zone: NgZone
  ) {}

  /**
   * Affiche une notification de succès
   */
  success(message: string, options: NotificationOptions = {}): void {
    this.show(message, {
      ...options,
      duration: options.duration || this.defaultDuration,
      panelClass: [this.successClass]
    });
  }

  /**
   * Affiche une notification d'erreur
   * Supporte les erreurs simples et détaillées avec requestId
   */
  error(message: string, options: NotificationOptions = {}): void {
    const duration = options.duration || this.errorDuration;
    
    // Si on a des détails ou un requestId, construire un message enrichi
    let fullMessage = message;
    
    if (options.details && options.details.length > 0) {
      // Ajouter les détails d'erreur au message
      const detailMessages = options.details
        .map(d => d.field ? `${d.field}: ${d.message}` : d.message)
        .join(' • ');
      fullMessage = `${message}\n${detailMessages}`;
    }
    
    if (options.requestId) {
      fullMessage += `\n[ID: ${options.requestId}]`;
    }

    this.show(fullMessage, {
      ...options,
      duration,
      panelClass: [this.errorClass]
    });

    // Logger l'erreur en console pour le debug
    console.error('[NotificationManager] Error:', {
      message,
      requestId: options.requestId,
      details: options.details
    });
  }

  /**
   * Affiche une notification d'information
   */
  info(message: string, options: NotificationOptions = {}): void {
    this.show(message, {
      ...options,
      duration: options.duration || this.defaultDuration,
      panelClass: [this.infoClass]
    });
  }

  /**
   * Affiche une notification d'avertissement
   */
  warning(message: string, options: NotificationOptions = {}): void {
    this.show(message, {
      ...options,
      duration: options.duration || this.defaultDuration,
      panelClass: [this.warningClass]
    });
  }

  /**
   * Affiche une erreur HTTP avec extraction automatique des détails
   */
  showHttpError(error: any, fallbackMessage: string = 'Une erreur est survenue'): void {
    let message = fallbackMessage;
    let details: ErrorDetail[] | undefined;
    let requestId: string | undefined;

    // Extraire le message d'erreur
    if (error?.error?.error) {
      message = error.error.error;
    } else if (error?.error?.message) {
      message = error.error.message;
    } else if (error?.message) {
      message = error.message;
    }

    // Extraire les détails de validation
    if (Array.isArray(error?.error?.details)) {
      details = error.error.details;
    }

    // Extraire le requestId
    if (error?.error?.requestId) {
      requestId = error.error.requestId;
    }

    this.error(message, { details, requestId });
  }

  /**
   * Méthode privée pour afficher une notification
   */
  private show(message: string, config: NotificationOptions & { panelClass?: string[] }): void {
    // S'assurer que l'affichage s'exécute dans la zone Angular
    this.zone.run(() => {
      const snackBarConfig: MatSnackBarConfig = {
        duration: config.duration || this.defaultDuration,
        horizontalPosition: 'end',
        verticalPosition: 'bottom',
        panelClass: config.panelClass || []
      };

      this.snackBar.open(
        message,
        config.action || 'Fermer',
        snackBarConfig
      );
    });
  }

  /**
   * Copie les détails d'erreur dans le presse-papier
   * Utile pour le support technique
   */
  copyErrorDetails(message: string, requestId?: string, details?: ErrorDetail[]): void {
    const errorReport = [
      `Erreur: ${message}`,
      requestId ? `ID de requête: ${requestId}` : null,
      details && details.length > 0 ? `Détails: ${JSON.stringify(details, null, 2)}` : null,
      `Date: ${new Date().toISOString()}`
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(errorReport).then(() => {
      this.success('Détails copiés dans le presse-papier');
    }).catch(() => {
      this.warning('Impossible de copier dans le presse-papier');
    });
  }
}
