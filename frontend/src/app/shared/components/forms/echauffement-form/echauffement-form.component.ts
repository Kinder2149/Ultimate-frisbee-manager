import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Echauffement, BlocEchauffement } from '../../../../core/models/echauffement.model';
import { EchauffementService } from '../../../../core/services/echauffement.service';
import { ApiUrlService } from '../../../../core/services/api-url.service';

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
    MatDividerModule,
    MatSelectModule,
    MatProgressSpinnerModule
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

  // Image globale
  selectedImageFile: File | null = null;
  uploading = false;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(private fb: FormBuilder, private echauffementService: EchauffementService, private apiUrl: ApiUrlService) {
    this.echauffementForm = this.createForm();
  }

  ngOnInit(): void {
    // Ne pas ajouter de bloc par défaut
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['echauffement'] && this.echauffement) {
      this.populateForm(this.echauffement);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      // Description optionnelle, pas de contrainte de longueur minimale
      description: [''],
      imageUrl: [''],
      blocs: this.fb.array([])
    });
  }

  get blocsFormArray(): FormArray {
    return this.echauffementForm.get('blocs') as FormArray;
  }

  private createBlocFormGroup(bloc?: BlocEchauffement): FormGroup {
    const parsedTemps = this.parseTemps(bloc?.temps || '');
    return this.fb.group({
      id: [bloc?.id || ''],
      ordre: [bloc?.ordre || this.blocsFormArray.length + 1],
      titre: [bloc?.titre || '', [Validators.required]],
      repetitions: [bloc?.repetitions || ''],
      // UI controls for numeric time and unit (min/sec)
      tempsValeur: [parsedTemps.valeur, [Validators.min(0)]],
      tempsUnite: [parsedTemps.unite],
      informations: [bloc?.informations || ''],
      fonctionnement: [bloc?.fonctionnement || ''],
      notes: [bloc?.notes || '']
    });
  }

  private parseTemps(temps: string): { valeur: number | null; unite: 'min' | 'sec' } {
    if (!temps || typeof temps !== 'string') {
      return { valeur: null, unite: 'min' };
    }
    const trimmed = temps.trim().toLowerCase();
    // Try patterns like "5 min", "30 sec", "5m", "30s", or pure number defaults to min
    const regex = /^(\d+(?:[\.,]\d+)?)\s*(min|m|sec|s)?$/i;
    const match = trimmed.match(regex);
    if (match) {
      const rawVal = match[1]?.replace(',', '.') || '';
      const num = rawVal ? Number(rawVal) : NaN;
      const unitRaw = (match[2] || 'min').toLowerCase();
      const unit: 'min' | 'sec' = unitRaw.startsWith('s') ? 'sec' : 'min';
      return { valeur: isNaN(num) ? null : num, unite: unit };
    }
    return { valeur: null, unite: 'min' };
  }

  ajouterBloc(): void {
    const newBloc = this.createBlocFormGroup();
    this.blocsFormArray.push(newBloc);
  }

  supprimerBloc(index: number): void {
    if (this.blocsFormArray.length > 0) {
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
      description: echauffement.description,
      imageUrl: echauffement.imageUrl || ''
    });

    if (echauffement.imageUrl) {
      this.imagePreview = this.mediaUrl(echauffement.imageUrl);
    }

    // Vider le FormArray et ajouter les blocs
    while (this.blocsFormArray.length !== 0) {
      this.blocsFormArray.removeAt(0);
    }

    if (echauffement.blocs && echauffement.blocs.length > 0) {
      echauffement.blocs.forEach(bloc => {
        this.blocsFormArray.push(this.createBlocFormGroup(bloc));
      });
    }
  }

  onSubmit(): void {
    if (this.echauffementForm.valid) {
      const formData = this.echauffementForm.value;
      
      const echauffementData: EchauffementFormData = {
        nom: formData.nom,
        description: formData.description,
        blocs: formData.blocs.map((bloc: any, index: number) => {
          const valeur = bloc.tempsValeur;
          const unite = bloc.tempsUnite as ('min'|'sec');
          const temps = (valeur === null || valeur === undefined || valeur === '')
            ? ''
            : `${valeur} ${unite}`;
          const {
            tempsValeur, tempsUnite,
            ...rest
          } = bloc;
          return {
            ...rest,
            temps,
            ordre: index + 1
          };
        })
      };

      // Ajouter l'URL d'image si présente
      const imgUrl = this.echauffementForm.get('imageUrl')?.value;
      if (imgUrl) {
        (echauffementData as any).imageUrl = imgUrl;
      }

      this.formSubmit.emit(echauffementData);
    } else {
      this.markFormGroupTouched(this.echauffementForm);
    }
  }

  // ===== Gestion image globale =====
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input?.files || input.files.length === 0) return;
    const file = input.files[0];
    this.selectedImageFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    reader.readAsDataURL(file);
  }

  mediaUrl(path?: string | null): string | null {
    return this.apiUrl.getMediaUrl(path ?? undefined);
  }

  uploadSelectedImage(): void {
    if (!this.selectedImageFile || this.uploading) return;
    this.uploading = true;
    this.echauffementService.uploadImage(this.selectedImageFile).subscribe({
      next: (resp) => {
        this.uploading = false;
        this.echauffementForm.patchValue({ imageUrl: resp.imageUrl });
        this.imagePreview = this.mediaUrl(resp.imageUrl);
      },
      error: () => {
        this.uploading = false;
      }
    });
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
