import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// Notre architecture de dialogue
import { DialogBaseComponent, DialogConfig } from '../../../shared/components/dialog';
import { TrainingDialogData } from './training-edit-dialog.component';

/**
 * Composant de dialogue pour visualiser un entraînement
 * Utilise l'architecture générique de dialogue
 */
@Component({
  selector: 'app-training-view-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DialogBaseComponent
  ],
  template: `
    <app-dialog-base [config]="dialogConfig">
      <div class="training-details">
        <div class="info-row">
          <div class="info-label">Nom:</div>
          <div class="info-value">{{ training.titre }}</div>
        </div>
        
        <div class="info-row">
          <div class="info-label">Identifiant:</div>
          <div class="info-value id-value">{{ training.id }}</div>
        </div>
      </div>
    </app-dialog-base>
  `,
  styles: [`
    .training-details {
      padding: 8px 0;
    }
    
    .info-row {
      display: flex;
      margin-bottom: 12px;
    }
    
    .info-label {
      font-weight: 500;
      min-width: 100px;
      color: rgba(0, 0, 0, 0.7);
    }
    
    .info-value {
      flex: 1;
    }
    
    .id-value {
      font-family: monospace;
      color: rgba(0, 0, 0, 0.6);
      font-size: 0.9em;
    }
  `]
})
export class TrainingViewDialogComponent {
  dialogConfig: DialogConfig;
  training: TrainingDialogData;
  
  constructor(
    public dialogRef: MatDialogRef<TrainingViewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { dialogConfig: DialogConfig, customData: TrainingDialogData }
  ) {
    // Récupérer la configuration du dialogue et les données d'entraînement
    this.dialogConfig = {
      ...data.dialogConfig,
      title: data.dialogConfig.title || 'Détails de l\'entraînement',
      showSubmitButton: false,
      closeButtonText: 'Fermer'
    };
    
    this.training = data.customData;
  }
}
