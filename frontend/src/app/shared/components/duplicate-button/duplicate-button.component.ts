import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

/**
 * Composant bouton de duplication réutilisable
 * Peut être utilisé pour dupliquer des exercices, entraînements ou autres entités
 */
@Component({
  selector: 'app-duplicate-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <button 
      mat-icon-button
      [disabled]="disabled || loading"
      [matTooltip]="tooltip || defaultTooltip"
      (click)="onDuplicate()"
      class="duplicate-button"
      [class.loading]="loading">
      
      <mat-icon *ngIf="!loading">content_copy</mat-icon>
      <mat-icon *ngIf="loading" class="spinning">sync</mat-icon>
    </button>
  `,
  styles: [`
    .duplicate-button {
      color: #1976d2;
      transition: all 0.3s ease;
    }
    
    .duplicate-button:hover:not(:disabled) {
      background-color: rgba(25, 118, 210, 0.1);
      transform: scale(1.05);
    }
    
    .duplicate-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .duplicate-button.loading {
      pointer-events: none;
    }
    
    .spinning {
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class DuplicateButtonComponent {
  /** ID de l'entité à dupliquer */
  @Input() entityId!: string;
  
  /** Type d'entité (pour le tooltip) */
  @Input() entityType: string = 'élément';
  
  /** État de chargement */
  @Input() loading: boolean = false;
  
  /** État désactivé */
  @Input() disabled: boolean = false;
  
  /** Tooltip personnalisé */
  @Input() tooltip?: string;
  
  /** Événement émis lors du clic sur dupliquer */
  @Output() duplicate = new EventEmitter<string>();
  
  /**
   * Getter pour le tooltip par défaut
   */
  get defaultTooltip(): string {
    return this.tooltip || `Dupliquer cet ${this.entityType}`;
  }
  
  /**
   * Gestion du clic sur le bouton dupliquer
   */
  onDuplicate(): void {
    if (!this.disabled && !this.loading && this.entityId) {
      this.duplicate.emit(this.entityId);
    }
  }
}
