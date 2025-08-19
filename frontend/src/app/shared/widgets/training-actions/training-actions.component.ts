import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

/**
 * Widget réutilisable pour les boutons d'action sur un entraînement
 * Fournit des boutons pour éditer, voir, dupliquer et supprimer un entraînement
 */
@Component({
  selector: 'app-training-actions',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  template: `
    <div class="action-buttons">
      <button mat-icon-button color="primary" matTooltip="Voir les détails" 
              *ngIf="showView" (click)="onViewClick()">
        <mat-icon>visibility</mat-icon>
      </button>
      <button mat-icon-button color="accent" matTooltip="Modifier" 
              *ngIf="showEdit" (click)="onEditClick()">
        <mat-icon>edit</mat-icon>
      </button>
      <button mat-icon-button color="primary" matTooltip="Dupliquer" 
              *ngIf="showDuplicate" (click)="onDuplicateClick()">
        <mat-icon>content_copy</mat-icon>
      </button>
      <button mat-icon-button color="warn" matTooltip="Supprimer" 
              *ngIf="showDelete" (click)="onDeleteClick()">
        <mat-icon>delete</mat-icon>
      </button>
    </div>
  `,
  styleUrls: ['./training-actions.component.css']
})
export class TrainingActionsComponent {
  @Input() showView = true;
  @Input() showEdit = true;
  @Input() showDuplicate = true;
  @Input() showDelete = true;
  @Input() trainingId: string = '';
  
  @Output() view = new EventEmitter<string>();
  @Output() edit = new EventEmitter<string>();
  @Output() duplicate = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();
  
  /**
   * Émet un événement de vue avec l'ID de l'entraînement
   */
  onViewClick(): void {
    this.view.emit(this.trainingId);
  }
  
  /**
   * Émet un événement de modification avec l'ID de l'entraînement
   */
  onEditClick(): void {
    this.edit.emit(this.trainingId);
  }
  
  /**
   * Émet un événement de duplication avec l'ID de l'entraînement
   */
  onDuplicateClick(): void {
    this.duplicate.emit(this.trainingId);
  }
  
  /**
   * Émet un événement de suppression avec l'ID de l'entraînement
   */
  onDeleteClick(): void {
    this.delete.emit(this.trainingId);
  }
}
