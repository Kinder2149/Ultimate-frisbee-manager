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

import { Exercice } from '../../../../../core/models/exercice.model';
import { Tag } from '../../../../../core/models/tag.model';
import { ExerciceService } from '../../../../../core/services/exercice.service';
import { TagService } from '../../../../../core/services/tag.service';
import { UploadService } from '../../../../../core/services/upload.service';

@Component({
  selector: 'app-mobile-create-exercice',
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
  templateUrl: './mobile-create-exercice.component.html',
  styleUrls: ['./mobile-create-exercice.component.scss']
})
export class MobileCreateExerciceComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  exerciceForm!: FormGroup;
  currentStep = 0;
  steps: StepConfig[] = [
    { label: 'Informations', completed: false },
    { label: 'Détails', completed: false },
    { label: 'Image', completed: false, optional: true },
    { label: 'Tags', completed: false },
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
    private exerciceService: ExerciceService,
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
    this.exerciceForm = this.fb.group({
      nom: ['', Validators.required],
      description: ['', Validators.required],
      duree_minutes: [null],
      nombre_joueurs_min: [null],
      nombre_joueurs_max: [null],
      materiel: [''],
      notes: [''],
      critereReussite: [''],
      imageUrl: ['']
    });
  }

  private loadTags(): void {
    this.tagService.getTags()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tags) => {
          this.allTags = tags;
          this.initializeTagCategories(tags);
        },
        error: (err) => {
          console.error('Erreur chargement tags:', err);
          this.snackBar.open('Erreur lors du chargement des tags', 'Fermer', { duration: 3000 });
        }
      });
  }

  private initializeTagCategories(tags: Tag[]): void {
    const categories = [
      { key: 'objectif', name: 'Objectif', multiple: false },
      { key: 'travail_specifique', name: 'Travail spécifique', multiple: true },
      { key: 'niveau', name: 'Niveau', multiple: true },
      { key: 'temps', name: 'Temps', multiple: false },
      { key: 'format', name: 'Format', multiple: false }
    ];

    this.tagCategories = categories.map(cat => ({
      name: cat.name,
      tags: tags.filter(t => t.category === cat.key),
      multiple: cat.multiple,
      expanded: false
    })).filter(cat => cat.tags.length > 0);
  }

  get canProceedStep(): boolean {
    switch (this.currentStep) {
      case 0:
        return !!(this.exerciceForm.get('nom')?.valid && 
               this.exerciceForm.get('description')?.valid);
      case 1:
        return true;
      case 2:
        return true;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  }

  get canComplete(): boolean {
    return this.exerciceForm.valid && !this.submitting;
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
    if (this.exerciceForm.dirty) {
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
    this.exerciceForm.patchValue({ imageUrl: '' });
  }

  async onComplete(): Promise<void> {
    if (!this.canComplete) return;

    this.submitting = true;

    try {
      let imageUrl = '';

      if (this.imageFile) {
        this.uploading = true;
        const result = await this.uploadService.uploadImage('entrainements', this.imageFile).toPromise();
        imageUrl = result?.imageUrl || '';
        this.uploading = false;
      }

      const exerciceData: Partial<Exercice> = {
        ...this.exerciceForm.value,
        imageUrl: imageUrl || undefined,
        tags: this.selectedTags,
        tagIds: this.selectedTags.map(t => t.id!).filter(id => id)
      };

      this.exerciceService.createExercice(exerciceData as Exercice)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (created) => {
            this.submitting = false;
            this.snackBar.open('Exercice créé avec succès', 'Fermer', { duration: 3000 });
            this.router.navigate(['/mobile/detail/exercice', created.id]);
          },
          error: (err) => {
            console.error('Erreur création exercice:', err);
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
