import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';

/**
 * Type d'alerte
 */
export type AlertType = 'info' | 'success' | 'warning' | 'error';

/**
 * Composant réutilisable pour afficher des alertes et notifications
 */
@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('alertAnimation', [
      state('void', style({
        transform: 'translateY(-20px)',
        opacity: 0
      })),
      state('*', style({
        transform: 'translateY(0)',
        opacity: 1
      })),
      transition('void => *', animate('300ms ease-out')),
      transition('* => void', animate('200ms ease-in'))
    ])
  ]
})
export class AlertComponent {
  /** Type d'alerte */
  @Input() type: AlertType = 'info';
  
  /** Titre de l'alerte */
  @Input() title: string = '';
  
  /** Message de l'alerte */
  @Input() message: string = '';
  
  /** Si l'alerte peut être fermée */
  @Input() dismissible: boolean = true;
  
  /** Si l'alerte disparaît automatiquement */
  @Input() autoClose: boolean = false;
  
  /** Délai avant fermeture automatique (ms) */
  @Input() autoCloseDelay: number = 5000;
  
  /** Si l'alerte est visible */
  @Input() visible: boolean = true;
  
  /** Si l'alerte est solide (fond plein) */
  @Input() solid: boolean = false;
  
  /** Si l'alerte a une bordure */
  @Input() bordered: boolean = true;
  
  /** Si l'alerte a une icône */
  @Input() showIcon: boolean = true;
  
  /** Classes CSS supplémentaires */
  @Input() additionalClasses: string = '';
  
  /** Événement émis lors de la fermeture de l'alerte */
  @Output() closed = new EventEmitter<void>();
  
  /** Timer pour la fermeture automatique */
  private autoCloseTimer: any;
  
  constructor() {}
  
  ngOnInit(): void {
    this.setupAutoClose();
  }
  
  ngOnChanges(): void {
    // Reconfigurer le timer si les propriétés changent
    this.setupAutoClose();
  }
  
  ngOnDestroy(): void {
    this.clearAutoCloseTimer();
  }
  
  /**
   * Configure la fermeture automatique si nécessaire
   */
  private setupAutoClose(): void {
    this.clearAutoCloseTimer();
    
    if (this.visible && this.autoClose) {
      this.autoCloseTimer = setTimeout(() => {
        this.close();
      }, this.autoCloseDelay);
    }
  }
  
  /**
   * Supprime le timer de fermeture automatique
   */
  private clearAutoCloseTimer(): void {
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
      this.autoCloseTimer = null;
    }
  }
  
  /**
   * Ferme l'alerte
   */
  close(): void {
    this.visible = false;
    this.clearAutoCloseTimer();
    this.closed.emit();
  }
  
  /**
   * Récupère l'icône en fonction du type d'alerte
   */
  get icon(): string {
    switch (this.type) {
      case 'success':
        return 'check_circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'info':
      default:
        return 'info';
    }
  }
}
