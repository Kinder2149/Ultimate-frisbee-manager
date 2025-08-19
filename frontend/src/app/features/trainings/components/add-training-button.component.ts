import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

// Imports Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Imports de services
import { TrainingSimpleService } from '../../../core/services/training-simple.service';
import { DialogService } from '../../../shared/components/dialog';
import { DialogResult } from '../../../shared/components/dialog/dialog-config.model';

// Import du composant de dialogue
import { AddTrainingDialogComponent } from './add-training-dialog.component';
import { TrainingDialogData } from './training-edit-dialog.component';

/**
 * Composant de bouton pour ajouter un entraînement
 * Ouvre un dialogue simple avec un champ pour saisir le nom de l'entraînement
 */
@Component({
  selector: 'app-add-training-button',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  template: `
    <button mat-raised-button color="primary" (click)="openAddDialog()">
      <mat-icon>add</mat-icon>
      Ajouter un entraînement
    </button>
  `,
  styles: [`
    button {
      margin-bottom: 16px;
    }
  `]
})
export class AddTrainingButtonComponent {
  @Output() trainingAdded = new EventEmitter<void>();
  
  constructor(
    private dialogService: DialogService,
    private trainingService: TrainingSimpleService,
    private snackBar: MatSnackBar
  ) {}
  
  /**
   * Ouvre le dialogue d'ajout d'entraînement en utilisant notre DialogService
   */
  openAddDialog(): void {
    // Configuration du dialogue
    const dialogConfig = {
      title: 'Ajouter un entraînement',
      width: '400px',
      disableClose: true,
      submitButtonText: 'Créer',
      customData: {
        titre: ''
      }
    };

    // Ouvrir le dialogue avec notre service
    this.dialogService.open<AddTrainingDialogComponent, TrainingDialogData>(AddTrainingDialogComponent, dialogConfig)
      .subscribe((result: DialogResult<TrainingDialogData> | undefined) => {
        if (result && result.action === 'submit' && result.data) {
          this.trainingService.createTraining({ titre: result.data.titre }).subscribe({
            next: () => {
              this.snackBar.open('Entraînement créé avec succès', 'Fermer', {
                duration: 3000
              });
              this.trainingAdded.emit();
            },
            error: (error: any) => {
              console.error('Erreur lors de la création de l\'entraînement', error);
              this.snackBar.open('Erreur lors de la création de l\'entraînement', 'Fermer', {
                duration: 3000
              });
            }
          });
        }
      });
  }
}

// Le composant AddTrainingDialogComponent a été déplacé dans son propre fichier
// Voir add-training-dialog.component.ts
