import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MobileHeaderComponent } from '../../../components/mobile-header/mobile-header.component';
import { MobileStepperComponent, StepConfig } from '../../../components/mobile-stepper/mobile-stepper.component';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { Echauffement } from '../../../../../core/models/echauffement.model';
import { EchauffementService } from '../../../../../core/services/echauffement.service';

@Component({
  selector: 'app-mobile-create-echauffement',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatCardModule,
    MobileHeaderComponent,
    MobileStepperComponent
  ],
  templateUrl: './mobile-create-echauffement.component.html',
  styleUrls: ['./mobile-create-echauffement.component.scss']
})
export class MobileCreateEchauffementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  echauffementForm!: FormGroup;
  currentStep = 0;
  steps: StepConfig[] = [
    { label: 'Informations', completed: false },
    { label: 'Blocs', completed: false },
    { label: 'Résumé', completed: false }
  ];

  submitting = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private echauffementService: EchauffementService
  ) {
    this.initForm();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.echauffementForm = this.fb.group({
      nom: ['', Validators.required],
      description: ['', Validators.required],
      blocs: this.fb.array([])
    });

    this.addBloc();
  }

  get blocs(): FormArray {
    return this.echauffementForm.get('blocs') as FormArray;
  }

  addBloc(): void {
    const blocGroup = this.fb.group({
      titre: ['', Validators.required],
      description: [''],
      duree: [null]
    });
    this.blocs.push(blocGroup);
  }

  removeBloc(index: number): void {
    if (this.blocs.length > 1) {
      this.blocs.removeAt(index);
    }
  }

  get canProceedStep(): boolean {
    switch (this.currentStep) {
      case 0:
        return this.echauffementForm.get('nom')?.valid && 
               this.echauffementForm.get('description')?.valid;
      case 1:
        return this.blocs.length > 0 && this.blocs.valid;
      case 2:
        return true;
      default:
        return false;
    }
  }

  get canComplete(): boolean {
    return this.echauffementForm.valid && !this.submitting;
  }

  onNext(): void {
    if (this.canProceedStep && this.currentStep < this.steps.length - 1) {
      this.steps[this.currentStep].completed = true;
      this.currentStep++;
    }
  }

  onPrevious(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  onStepChange(step: number): void {
    this.currentStep = step;
  }

  onCancel(): void {
    if (this.echauffementForm.dirty) {
      if (confirm('Voulez-vous vraiment annuler ? Les modifications seront perdues.')) {
        this.router.navigate(['/mobile/library']);
      }
    } else {
      this.router.navigate(['/mobile/library']);
    }
  }

  onComplete(): void {
    if (!this.canComplete) return;

    this.submitting = true;

    const echauffementData: Partial<Echauffement> = {
      nom: this.echauffementForm.value.nom,
      description: this.echauffementForm.value.description,
      blocs: this.echauffementForm.value.blocs
    };

    this.echauffementService.createEchauffement(echauffementData as Echauffement)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (created) => {
          this.submitting = false;
          this.snackBar.open('Échauffement créé avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['/mobile/detail/echauffement', created.id]);
        },
        error: (err) => {
          console.error('Erreur création échauffement:', err);
          this.submitting = false;
          this.snackBar.open('Erreur lors de la création', 'Fermer', { duration: 3000 });
        }
      });
  }
}
