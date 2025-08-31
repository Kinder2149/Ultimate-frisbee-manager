import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ExerciceService } from '../../../../core/services/exercice.service';
import { TagService } from '../../../../core/services/tag.service';
import { ApiUrlService } from '../../../../core/services/api-url.service';
import { Exercice } from '../../../../core/models/exercice.model';
import { Tag, TagCategory } from '../../../../core/models/tag.model';
import { DialogBaseComponent } from '../../../../shared/components/dialog/dialog-base.component';
import { DialogConfig } from '../../../../shared/components/dialog/dialog-config.model';
import { ExerciceVariablesComponent } from '../../../../shared/components/exercice-variables/exercice-variables.component';

@Component({
  selector: 'app-exercice-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    ExerciceVariablesComponent
  ],
  templateUrl: './exercice-form.component.html',
  styleUrls: ['./exercice-form.component.css'],
  host: {
    class: 'block h-full overflow-auto p-4'
  }
})
export class ExerciceFormComponent extends DialogBaseComponent implements OnInit {
  // Mode du formulaire (création, édition ou visualisation)
  mode: 'create' | 'edit' | 'view' = 'create';
  
  // ID de l'exercice en cours d'édition
  exerciceId: string | null = null;
  
  // États de chargement
  loading = false;
  loadingTags = false;
  submitting = false;
  
  // Données de l'exercice
  exercice: Partial<Exercice> = {};
  
  // Tags disponibles
  allTags: Tag[] = [];
  
  // Tags sélectionnés
  selectedTags: Tag[] = [];
  
  // Filtres de tags
  selectedTagCategory: TagCategory | 'all' = 'all';
  tagSearchQuery = '';
  
  // Catégories de tags pour le filtre
  tagCategories: TagCategory[] = [
    TagCategory.OBJECTIF,
    TagCategory.TRAVAIL_SPECIFIQUE,
    TagCategory.NIVEAU,
    TagCategory.TEMPS,
    TagCategory.FORMAT,
    TagCategory.THEME_ENTRAINEMENT
  ];
  
  // Filtres appliqués
  filteredTags: Tag[] = [];
  
  // Prévisualisation d'image
  imagePreview: string | ArrayBuffer | null = null;
  schemaPreview: string | ArrayBuffer | null = null;
  
  // Références aux éléments du DOM
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('schemaInput') schemaInput!: ElementRef<HTMLInputElement>;
  
  // Sujet pour la gestion des abonnements
  private destroy$ = new Subject<void>();
  
  // Messages et états
  isSubmitted = false;
  successMessage = '';
  errorMessage = '';
  
  // Formulaire
  exerciceForm: FormGroup = this.formBuilder.group({
    nom: ['', Validators.required],
    description: ['', Validators.required],
    objectif: ['', Validators.required],
    imageUrl: [''],
    schemaUrl: [''],
    variables: this.formBuilder.group({
      nbJoueurs: [''],
      nbEquipes: [''],
      duree: [''],
      espace: [''],
      materiel: [''],
      consignes: [''],
      variantes: [''],
      pointsAttention: [''],
      objectifsPedagogiques: [''],
      variablesPlus: [[]],
      variablesMinus: [[]]
    })
  });

  constructor(
    private formBuilder: FormBuilder,
    private exerciceService: ExerciceService,
    private tagService: TagService,
    private route: ActivatedRoute,
    private router: Router,
    private apiUrlService: ApiUrlService,
    private snackBar: MatSnackBar,
    public override dialogRef: MatDialogRef<ExerciceFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    super();
    
    // Initialiser le mode et les données en fonction des paramètres
    if (data) {
      this.mode = data.mode || 'create';
      
      if (data.exercice) {
        this.exercice = { ...data.exercice };
        this.exerciceId = this.exercice.id || null;
      }
    }
  }

  override ngOnInit(): void {
    super.ngOnInit();
    
    // Mettre à jour le mode lecture seule en fonction du mode
    this.readonlyMode = this.mode === 'view';
    
    // Initialiser le formulaire
    this.initForm();
    
    // Charger les tags
    this.loadTags();
    
    // Si on a un ID d'exercice, charger les données
    if (this.exerciceId) {
      this.loadExercice(this.exerciceId);
    }
  }

  // Charger un exercice existant
  private loadExercice(id: string): void {
    this.loading = true;
    this.exerciceService.getExerciceById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (exercice) => {
          this.exercice = exercice;
          this.updateFormWithExercice(exercice);
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement de l\'exercice:', error);
          this.snackBar.open('Erreur lors du chargement de l\'exercice', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.loading = false;
        }
      });
  }

  // Mettre à jour le formulaire avec les données de l'exercice
  private updateFormWithExercice(exercice: Exercice): void {
    this.exerciceForm.patchValue({
      nom: exercice.nom || '',
      description: exercice.description || '',
      objectif: exercice.objectif || '',
      imageUrl: exercice.imageUrl || '',
      schemaUrl: exercice.schemaUrl || '',
      variables: {
        ...exercice.variables,
        variablesPlus: exercice.variables?.variablesPlus || [],
        variablesMinus: exercice.variables?.variablesMinus || []
      }
    });
    
    // Mettre à jour les tags sélectionnés
    if (exercice.tags) {
      this.selectedTags = [...exercice.tags];
    }
    
    // Mettre à jour les prévisualisations d'images
    if (exercice.imageUrl) {
      this.imagePreview = this.mediaUrl(exercice.imageUrl);
    }
    if (exercice.schemaUrl) {
      this.schemaPreview = this.mediaUrl(exercice.schemaUrl);
    }
  }

  // Charger les tags disponibles
  private loadTags(): void {
    this.loadingTags = true;
    this.tagService.getAllTags()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tags) => {
          this.allTags = tags;
          this.filteredTags = [...tags];
          this.loadingTags = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des tags:', error);
          this.loadingTags = false;
        }
      });
  }

  // Filtrer les tags en fonction de la recherche et de la catégorie sélectionnée
  filterTags(): void {
    this.filteredTags = this.allTags.filter(tag => {
      const matchesCategory = this.selectedTagCategory === 'all' || tag.categorie === this.selectedTagCategory;
      const matchesSearch = !this.tagSearchQuery || 
        tag.nom.toLowerCase().includes(this.tagSearchQuery.toLowerCase()) ||
        tag.description?.toLowerCase().includes(this.tagSearchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  // Ajouter un tag sélectionné
  addTag(tag: Tag): void {
    if (!this.selectedTags.some(t => t.id === tag.id)) {
      this.selectedTags.push(tag);
      this.tagSearchQuery = '';
      this.filterTags();
    }
  }

  // Supprimer un tag sélectionné
  removeTag(tag: Tag): void {
    this.selectedTags = this.selectedTags.filter(t => t.id !== tag.id);
  }

  // Gérer la sélection d'un fichier image
  onFileSelected(event: Event, type: 'image' | 'schema'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (type === 'image') {
          this.imagePreview = reader.result;
          this.exerciceForm.patchValue({ imageUrl: file.name });
        } else {
          this.schemaPreview = reader.result;
          this.exerciceForm.patchValue({ schemaUrl: file.name });
        }
      };
      reader.readAsDataURL(file);
    }
  }

  // Soumettre le formulaire
  override onSubmit(): void {
    if (this.exerciceForm.invalid) {
      this.markFormGroupTouched(this.exerciceForm);
      return;
    }
    
    this.submitting = true;
    
    // Préparer les données de l'exercice
    const exerciceData: Partial<Exercice> = {
      ...this.exerciceForm.value,
      tagIds: this.selectedTags.map(tag => tag.id)
    };
    
    // Appeler le service approprié selon le mode
    const request = this.mode === 'create' 
      ? this.exerciceService.createExercice(exerciceData)
      : this.exerciceService.updateExercice(this.exerciceId!, exerciceData);
    
    request.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.snackBar.open(
          `Exercice ${this.mode === 'create' ? 'créé' : 'mis à jour'} avec succès`,
          'Fermer',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
        
        // Fermer le dialogue avec le résultat
        if (this.dialogRef) {
          this.dialogRef.close({
            action: 'submit',
            data: response
          });
        } else {
          // Redirection si pas en mode dialogue
          this.router.navigate(['/exercices']);
        }
      },
      error: (error) => {
        console.error(`Erreur lors de la ${this.mode === 'create' ? 'création' : 'mise à jour'} de l'exercice:`, error);
        this.snackBar.open(
          `Une erreur est survenue lors de la ${this.mode === 'create' ? 'création' : 'mise à jour'} de l'exercice`,
          'Fermer',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
        this.submitting = false;
      }
    });
  }

  // Annuler et fermer le dialogue
  override onCancel(): void {
    if (this.dialogRef) {
      this.dialogRef.close({
        action: 'cancel'
      });
    } else {
      this.router.navigate(['/exercices']);
    }
  }

  // Initialiser le formulaire
  private initForm(): void {
    if (this.mode === 'create') {
      this.exerciceForm.reset();
    } else if (this.mode === 'edit' && this.exercice) {
      this.updateFormWithExercice(this.exercice as Exercice);
    }
  }

  // Marquer tous les champs d'un formulaire comme touchés
  protected markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Construire une URL absolue pour une ressource média
  mediaUrl(val?: string | null): string | null {
    if (!val) return null;
    // Ne pas transformer les URLs de preview locales (blob:, data:)
    if (/^(blob:|data:)/i.test(val)) return val;
    return this.apiUrlService.getMediaUrl(val);
  }

  // Nettoyer les ressources lors de la destruction du composant
  override ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    super.ngOnDestroy();
  }
}
