import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NotificationManagerService, ErrorDetail } from '../../../core/services/notification-manager.service';

/**
 * Type de sévérité pour l'affichage des erreurs
 */
export type ErrorSeverity = 'error' | 'warning' | 'info';

/**
 * Composant réutilisable pour afficher des erreurs avec détails
 * Supporte différents niveaux de sévérité et actions contextuelles
 */
@Component({
  selector: 'app-error-display',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './error-display.component.html',
  styleUrls: ['./error-display.component.scss']
})
export class ErrorDisplayComponent {
  @Input() message: string = '';
  @Input() severity: ErrorSeverity = 'error';
  @Input() details: ErrorDetail[] = [];
  @Input() requestId?: string;
  @Input() showCopyButton: boolean = true;
  @Input() actionLabel?: string;
  @Input() actionCallback?: () => void;

  constructor(private notificationManager: NotificationManagerService) {}

  /**
   * Retourne l'icône selon la sévérité
   */
  get icon(): string {
    switch (this.severity) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'error';
    }
  }

  /**
   * Retourne la classe CSS selon la sévérité
   */
  get severityClass(): string {
    return `error-display--${this.severity}`;
  }

  /**
   * Copie les détails d'erreur dans le presse-papier
   */
  copyDetails(): void {
    this.notificationManager.copyErrorDetails(this.message, this.requestId, this.details);
  }

  /**
   * Exécute l'action personnalisée si définie
   */
  executeAction(): void {
    if (this.actionCallback) {
      this.actionCallback();
    }
  }
}
