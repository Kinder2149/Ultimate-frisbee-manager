import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { TrainingEditDialogComponent, TrainingDialogData } from './training-edit-dialog.component';
import { DialogConfig } from '../../../shared/components/dialog';

/**
 * Composant pour le dialogue d'ajout d'entraînement
 * Réutilise le composant d'édition avec une configuration spécifique
 */
@Component({
  selector: 'app-add-training-dialog',
  standalone: true,
  imports: [
    CommonModule,
    TrainingEditDialogComponent
  ],
  providers: [
    // Ces providers permettent à TrainingEditDialogComponent de fonctionner 
    // comme s'il était ouvert directement par MatDialog
    { 
      provide: MAT_DIALOG_DATA, 
      useFactory: function(dialogRef: MatDialogRef<AddTrainingDialogComponent>) {
        return {
          dialogConfig: {
            title: 'Ajouter un entraînement',
            submitButtonText: 'Créer'
          } as DialogConfig,
          customData: {
            titre: ''
          } as TrainingDialogData
        };
      },
      deps: [MatDialogRef]
    }
  ],
  template: `<app-training-edit-dialog></app-training-edit-dialog>`
})
export class AddTrainingDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AddTrainingDialogComponent>,
    private fb: FormBuilder
  ) {}
}
