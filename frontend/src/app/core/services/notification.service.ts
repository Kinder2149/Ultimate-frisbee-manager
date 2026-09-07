import { Injectable, NgZone } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

/**
 * Détail d'erreur structuré (validation, champ, code)
 */
export interface ErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

/**
 * Options de notification
 */
export interface NotificationOptions {
  duration?: number;
  action?: string;
  requestId?: string;
  details?: ErrorDetail[];
  showCopyButton?: boolean;
}

/**
 * Service UNIQUE de notifications utilisateur (snackbar Material).
 * - API riche : success/error/info/warning(message, options) + showHttpError + copyErrorDetails
 * - API simple historique conservée : showSuccess/showError/showInfo/showWarning(message, duration)
 * Fusion de l'ancien NotificationManagerService (2026-09-06).
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
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

  /** Notification de succès */
  success(message: string, options: NotificationOptions = {}): void {
    this.show(message, {
      ...options,
      duration: options.duration || this.defaultDuration,
      panelClass: [this.successClass]
    });
  }

  /** Notification d'erreur (supporte détails + requestId) */
  error(message: string, options: NotificationOptions = {}): void {
    const duration = options.duration || this.errorDuration;

    let fullMessage = message;
    if (options.details && options.details.length > 0) {
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

    // Log console uniquement pour les erreurs structurées (évite le bruit)
    if (options.requestId || (options.details && options.details.length > 0)) {
      console.error('[Notification] Error:', {
        message,
        requestId: options.requestId,
        details: options.details
      });
    }
  }

  /** Notification d'information */
  info(message: string, options: NotificationOptions = {}): void {
    this.show(message, {
      ...options,
      duration: options.duration || this.defaultDuration,
      panelClass: [this.infoClass]
    });
  }

  /** Notification d'avertissement */
  warning(message: string, options: NotificationOptions = {}): void {
    this.show(message, {
      ...options,
      duration: options.duration || this.defaultDuration,
      panelClass: [this.warningClass]
    });
  }

  /** Erreur HTTP avec extraction automatique du message / détails / requestId */
  showHttpError(error: any, fallbackMessage: string = 'Une erreur est survenue'): void {
    let message = fallbackMessage;
    let details: ErrorDetail[] | undefined;
    let requestId: string | undefined;

    if (error?.error?.error) {
      message = error.error.error;
    } else if (error?.error?.message) {
      message = error.error.message;
    } else if (error?.message) {
      message = error.message;
    }

    if (Array.isArray(error?.error?.details)) {
      details = error.error.details;
    }

    if (error?.error?.requestId) {
      requestId = error.error.requestId;
    }

    this.error(message, { details, requestId });
  }

  /** Copie un rapport d'erreur dans le presse-papier (support technique) */
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

  // --- API simple historique (conservée pour compatibilité) ---

  showSuccess(message: string, duration: number = this.defaultDuration): void {
    this.success(message, { duration });
  }

  showError(message: string, duration: number = this.errorDuration): void {
    this.error(message, { duration });
  }

  showInfo(message: string, duration: number = this.defaultDuration): void {
    this.info(message, { duration });
  }

  showWarning(message: string, duration: number = this.defaultDuration): void {
    this.warning(message, { duration });
  }

  /** Affichage bas-niveau (dans la zone Angular) */
  private show(message: string, config: NotificationOptions & { panelClass?: string[] }): void {
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
}
