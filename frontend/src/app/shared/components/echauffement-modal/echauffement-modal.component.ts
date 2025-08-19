import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { EchauffementService } from '../../../core/services/echauffement.service';
import { Echauffement } from '../../../core/models/entrainement.model';
import { EchauffementFormComponent, EchauffementFormData } from '../forms/echauffement-form/echauffement-form.component';

export interface EchauffementModalData {
  mode: 'select' | 'create';
  selectedEchauffementId?: string;
}

@Component({
  selector: 'app-echauffement-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    EchauffementFormComponent
  ],
  templateUrl: './echauffement-modal.component.html',
  styleUrls: ['./echauffement-modal.component.scss']
})
export class EchauffementModalComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  echauffements: Echauffement[] = [];
  mode: 'select' | 'create';

  constructor(
    private fb: FormBuilder,
    private echauffementService: EchauffementService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<EchauffementModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EchauffementModalData
  ) {
    this.mode = data.mode;
    this.form = this.createForm();
  }

  ngOnInit(): void {
    if (this.mode === 'select') {
      this.loadEchauffements();
    }
    
    if (this.data.selectedEchauffementId) {
      this.form.patchValue({ echauffementId: this.data.selectedEchauffementId });
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      echauffementId: ['', Validators.required]
    });
  }

  private loadEchauffements(): void {
    this.isLoading = true;
    this.echauffementService.getEchauffements()
      .pipe(
        catchError(error => {
          console.error('Erreur lors du chargement des échauffements:', error);
          this.snackBar.open('Erreur lors du chargement des échauffements', 'Fermer', { duration: 3000 });
          return of([]);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe((echauffements: any) => {
        this.echauffements = echauffements;
      });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const selectedEchauffement = this.echauffements.find(e => e.id === this.form.value.echauffementId);
    this.dialogRef.close({ 
      action: 'select', 
      echauffement: selectedEchauffement 
    });
  }

  onEchauffementFormSubmit(formData: EchauffementFormData): void {
    this.isLoading = true;

    this.echauffementService.ajouterEchauffement(formData)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la création de l\'échauffement:', error);
          this.snackBar.open('Erreur lors de la création de l\'échauffement', 'Fermer', { duration: 3000 });
          return of(null);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(echauffement => {
        if (echauffement) {
          this.snackBar.open('Échauffement créé avec succès', 'Fermer', { duration: 3000 });
          this.dialogRef.close({ 
            action: 'create', 
            echauffement 
          });
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  switchMode(): void {
    this.mode = this.mode === 'select' ? 'create' : 'select';
    
    if (this.mode === 'select') {
      this.form = this.createForm();
      if (this.echauffements.length === 0) {
        this.loadEchauffements();
      }
    }
  }
}
