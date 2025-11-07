import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

// Notre architecture de dialogue
import { DialogBaseComponent, DialogConfig, DialogResult } from '../../../shared/components/dialog';

/**
 * Interface pour les données d'entraînement utilisées dans les dialogues
 * @description Cette interface fournit une structure standardisée pour les données
 * d'entraînement échangées entre les dialogues et les composants parent
 */
export interface TrainingDialogData {
  /**
   * Identifiant unique de l'entraînement
   * Absent lors de la création d'un nouvel entraînement
   */
  id?: string;
  
  /**
   * Titre ou nom de l'entraînement
   * Champ obligatoire pour tous les types d'opérations (création, édition, visualisation)
   */
  titre: string;
}

/**
 * Composant de dialogue pour éditer un entraînement
 * Utilise l'architecture générique de dialogue
 */
@Component({
  selector: 'app-training-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    DialogBaseComponent
  ],
  template: `
    <app-dialog-base [config]="dialogConfig" [isSubmitDisabled]="!form.valid" (submit)="onSubmit()">
      <form [formGroup]="form" class="training-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nom de l'entraînement</mat-label>
          <input matInput formControlName="titre" placeholder="Saisissez un nom" required>
          <mat-error *ngIf="form.get('titre')?.hasError('required')">
            Le nom de l'entraînement est requis
          </mat-error>
        </mat-form-field>
      </form>
    </app-dialog-base>
  `,
  styles: [`
    .training-form {
      display: flex;
      flex-direction: column;
      padding: 8px 0;
    }
    
    .full-width {
      width: 100%;
    }
  `]
})
export class TrainingEditDialogComponent implements OnInit {
  form: FormGroup;
  dialogConfig: DialogConfig;
  
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TrainingEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { dialogConfig: DialogConfig, customData: TrainingDialogData }
  ) {
    // Récupérer la configuration du dialogue
    this.dialogConfig = data.dialogConfig;
    
    // Si le titre n'est pas défini, le définir en fonction de l'ID
    if (!this.dialogConfig.title) {
      this.dialogConfig.title = data.customData.id 
        ? 'Modifier l\'entraînement' 
        : 'Créer un entraînement';
    }
    
    // Créer le formulaire
    this.form = this.fb.group({
      titre: [data.customData.titre || '', [Validators.required]]
    });
  }
  
  ngOnInit(): void { }
  
  /**
   * Gère la soumission du formulaire
   */
  onSubmit(): void {
    if (this.form.valid) {
      const result: DialogResult<TrainingDialogData> = {
        action: 'submit',
        data: {
          ...this.data.customData,
          ...this.form.value
        }
      };
      
      this.dialogRef.close(result);
    }
  }
}
