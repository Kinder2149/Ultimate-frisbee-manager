import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MobileHeaderComponent } from '../../../components/mobile-header/mobile-header.component';
import { MobileStepperComponent, StepConfig } from '../../../components/mobile-stepper/mobile-stepper.component';
import { MobileTagSelectorComponent, TagCategory } from '../../../components/mobile-tag-selector/mobile-tag-selector.component';
import { MobileImagePickerComponent } from '../../../components/mobile-image-picker/mobile-image-picker.component';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { SituationMatch } from '../../../../../core/models/situationmatch.model';
import { Tag } from '../../../../../core/models/tag.model';
import { SituationMatchService } from '../../../../../core/services/situationmatch.service';
import { TagService } from '../../../../../core/services/tag.service';
import { UploadService } from '../../../../../core/services/upload.service';

@Component({
  selector: 'app-mobile-create-situation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MobileHeaderComponent,
    MobileStepperComponent,
    MobileTagSelectorComponent,
    MobileImagePickerComponent
  ],
  templateUrl: './mobile-create-situation.component.html',
  styleUrls: ['./mobile-create-situation.component.scss']
})
export class MobileCreateSituationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  situationForm!: FormGroup;
  currentStep = 0;
  steps: StepConfig[] = [
    { label: 'Informations', completed: false },
    { label: 'Image', completed: false, optional: true },
    { label: 'Tags', completed: false, optional: true },
    { label: 'Résumé', completed: false }
  ];

  allTags: Tag[] = [];
  tagCategories: TagCategory[] = [];
  selectedTags: Tag[] = [];
  
  imageFile: File | null = null;
  imagePreview: string | null = null;
  uploading = false;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private situationMatchService: SituationMatchService,
    private tagService: TagService,
    private uploadService: UploadService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadTags();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.situationForm = this.fb.group({
      nom: ['', Validators.required],
      description: ['', Validators.required],
      imageUrl: ['']
    });
  }

  private loadTags(): void {
    this.tagService.getTags()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tags) => {
          this.allTags = tags;
          this.tagCategories = [{
            name: 'Tous les tags',
            tags: tags,
            multiple: true,
            expanded: true
          }];
        },
        error: (err) => {
          console.error('Erreur chargement tags:', err);
          this.snackBar.open('Erreur lors du chargement des tags', 'Fermer', { duration: 3000 });
        }
      });
  }

  get canProceedStep(): boolean {
    switch (this.currentStep) {
      case 0:
        return !!(this.situationForm.get('nom')?.valid && 
               this.situationForm.get('description')?.valid);
      case 1:
      case 2:
      case 3:
        return true;
      default:
        return false;
    }
  }

  get canComplete(): boolean {
    return this.situationForm.valid && !this.submitting;
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
    if (this.situationForm.dirty) {
      if (confirm('Voulez-vous vraiment annuler ? Les modifications seront perdues.')) {
        this.router.navigate(['/mobile/library']);
      }
    } else {
      this.router.navigate(['/mobile/library']);
    }
  }

  onTagsChange(tags: Tag[]): void {
    this.selectedTags = tags;
  }

  onImageSelected(file: File): void {
    this.imageFile = file;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  onImageRemoved(): void {
    this.imageFile = null;
    this.imagePreview = null;
    this.situationForm.patchValue({ imageUrl: '' });
  }

  async onComplete(): Promise<void> {
    if (!this.canComplete) return;

    this.submitting = true;

    try {
      let imageUrl = '';

      if (this.imageFile) {
        this.uploading = true;
        const uploadResult = await this.uploadService.uploadImage('situations-matchs', this.imageFile).toPromise();
        imageUrl = uploadResult?.imageUrl || '';
        this.uploading = false;
      }

      const situationData: Partial<SituationMatch> = {
        nom: this.situationForm.value.nom,
        description: this.situationForm.value.description,
        imageUrl: imageUrl || undefined,
        tags: this.selectedTags
      };

      this.situationMatchService.createSituationMatch(situationData as SituationMatch)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (created) => {
            this.submitting = false;
            this.snackBar.open('Situation créée avec succès', 'Fermer', { duration: 3000 });
            this.router.navigate(['/mobile/detail/situation', created.id]);
          },
          error: (err) => {
            console.error('Erreur création situation:', err);
            this.submitting = false;
            this.uploading = false;
            this.snackBar.open('Erreur lors de la création', 'Fermer', { duration: 3000 });
          }
        });
    } catch (error) {
      console.error('Erreur upload image:', error);
      this.submitting = false;
      this.uploading = false;
      this.snackBar.open('Erreur lors de l\'upload de l\'image', 'Fermer', { duration: 3000 });
    }
  }
}
