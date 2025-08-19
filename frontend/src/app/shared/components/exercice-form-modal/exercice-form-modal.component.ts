import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExerciceFormComponent } from '../../../features/exercices/pages/exercice-form/exercice-form.component';
import { Exercice } from '../../../core/models/exercice.model';

/**
 * Composant modal pour intégrer le formulaire d'exercice dans d'autres contextes
 * Permet de créer un nouvel exercice directement depuis la création d'entraînement
 */
@Component({
  selector: 'app-exercice-form-modal',
  standalone: true,
  imports: [CommonModule, ExerciceFormComponent],
  template: `
    <div class="modal-overlay" *ngIf="visible" (click)="onOverlayClick($event)">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ title || 'Créer un nouvel exercice' }}</h2>
          <button type="button" class="close-btn" (click)="onCancel()">
            <i class="material-icons">close</i>
          </button>
        </div>
        
        <div class="modal-content">
          <app-exercice-form
            #exerciceForm
            [editMode]="false"
            [exerciceToEdit]="null"
            [ignoreRouteParams]="true"
            (exerciceCreated)="onExerciceCreated($event)"
            (formCancelled)="onCancel()">
          </app-exercice-form>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./exercice-form-modal.component.css']
})
export class ExerciceFormModalComponent {
  @Input() visible: boolean = false;
  @Input() title?: string;
  
  @Output() exerciceCreated = new EventEmitter<Exercice>();
  @Output() cancelled = new EventEmitter<void>();
  
  @ViewChild('exerciceForm') exerciceFormComponent?: ExerciceFormComponent;

  /**
   * Gère le clic sur l'overlay pour fermer la modal
   */
  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  /**
   * Gère la création d'un exercice
   */
  onExerciceCreated(exercice: Exercice): void {
    this.exerciceCreated.emit(exercice);
    this.visible = false;
  }

  /**
   * Gère l'annulation du formulaire
   */
  onCancel(): void {
    this.cancelled.emit();
    this.visible = false;
  }
}
