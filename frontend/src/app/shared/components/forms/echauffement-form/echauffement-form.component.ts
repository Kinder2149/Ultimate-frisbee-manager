import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

import { Echauffement, BlocEchauffement } from '../../../../core/models/echauffement.model';

export interface EchauffementFormData {
  nom: string;
  description: string;
  blocs: BlocEchauffement[];
}

@Component({
  selector: 'app-echauffement-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './echauffement-form.component.html',
  styleUrls: ['./echauffement-form.component.scss']
})
export class EchauffementFormComponent implements OnInit, OnChanges {
  @Input() echauffement?: Echauffement;
  @Input() isEditMode = false;
  @Input() isLoading = false;
  
  @Output() formSubmit = new EventEmitter<EchauffementFormData>();
  @Output() formCancel = new EventEmitter<void>();

  echauffementForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.echauffementForm = this.createForm();
  }

  ngOnInit(): void {
    if (!this.isEditMode) {
      // Ajouter un bloc par défaut pour un nouvel échauffement
      this.ajouterBloc();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['echauffement'] && this.echauffement) {
      this.populateForm(this.echauffement);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      blocs: this.fb.array([])
    });
  }

  get blocsFormArray(): FormArray {
    return this.echauffementForm.get('blocs') as FormArray;
  }

  private createBlocFormGroup(bloc?: BlocEchauffement): FormGroup {
    return this.fb.group({
      id: [bloc?.id || ''],
      ordre: [bloc?.ordre || this.blocsFormArray.length + 1],
      titre: [bloc?.titre || '', [Validators.required]],
      repetitions: [bloc?.repetitions || ''],
      temps: [bloc?.temps || ''],
      informations: [bloc?.informations || ''],
      fonctionnement: [bloc?.fonctionnement || ''],
      notes: [bloc?.notes || '']
    });
  }

  ajouterBloc(): void {
    const newBloc = this.createBlocFormGroup();
    this.blocsFormArray.push(newBloc);
  }

  supprimerBloc(index: number): void {
    if (this.blocsFormArray.length > 1) {
      this.blocsFormArray.removeAt(index);
      this.updateOrdreBlocs();
    }
  }

  monterBloc(index: number): void {
    if (index > 0) {
      const bloc = this.blocsFormArray.at(index);
      this.blocsFormArray.removeAt(index);
      this.blocsFormArray.insert(index - 1, bloc);
      this.updateOrdreBlocs();
    }
  }

  descendreBloc(index: number): void {
    if (index < this.blocsFormArray.length - 1) {
      const bloc = this.blocsFormArray.at(index);
      this.blocsFormArray.removeAt(index);
      this.blocsFormArray.insert(index + 1, bloc);
      this.updateOrdreBlocs();
    }
  }

  private updateOrdreBlocs(): void {
    this.blocsFormArray.controls.forEach((control, index) => {
      control.get('ordre')?.setValue(index + 1);
    });
  }

  private populateForm(echauffement: Echauffement): void {
    this.echauffementForm.patchValue({
      nom: echauffement.nom,
      description: echauffement.description
    });

    // Vider le FormArray et ajouter les blocs
    while (this.blocsFormArray.length !== 0) {
      this.blocsFormArray.removeAt(0);
    }

    if (echauffement.blocs && echauffement.blocs.length > 0) {
      echauffement.blocs.forEach(bloc => {
        this.blocsFormArray.push(this.createBlocFormGroup(bloc));
      });
    } else {
      // Ajouter un bloc par défaut si aucun bloc n'existe
      this.ajouterBloc();
    }
  }

  onSubmit(): void {
    if (this.echauffementForm.valid) {
      const formData = this.echauffementForm.value;
      
      const echauffementData: EchauffementFormData = {
        nom: formData.nom,
        description: formData.description,
        blocs: formData.blocs.map((bloc: any, index: number) => ({
          ...bloc,
          ordre: index + 1
        }))
      };

      this.formSubmit.emit(echauffementData);
    } else {
      this.markFormGroupTouched(this.echauffementForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          }
        });
      }
    });
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  getErrorMessage(controlName: string): string {
    const control = this.echauffementForm.get(controlName);
    if (control?.hasError('required')) {
      return `${controlName} est requis`;
    }
    if (control?.hasError('minlength')) {
      const requiredLength = control.errors?.['minlength']?.requiredLength;
      return `${controlName} doit contenir au moins ${requiredLength} caractères`;
    }
    return '';
  }

  getBlocErrorMessage(index: number, controlName: string): string {
    const control = this.blocsFormArray.at(index).get(controlName);
    if (control?.hasError('required')) {
      return `${controlName} est requis`;
    }
    return '';
  }
}
