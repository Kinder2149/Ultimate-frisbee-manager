// Angular Core
import { Component, ElementRef, EventEmitter, Inject, Input, OnDestroy, OnInit, Optional, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

// RxJS
import { Observable, of, Subject, throwError } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';

// Modèles
import { Exercice } from '../../../../core/models/exercice.model';
import { Tag, TagCategory } from '../../../../core/models/tag.model';

// Services
import { ApiUrlService } from '../../../../core/services/api-url.service';
import { ExerciceService } from '../../../../core/services/exercice.service';
import { TagService } from '../../../../core/services/tag.service';

// Composants partagés
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../../shared/shared.module';
import { ExerciceVariablesComponent } from '../../../../shared/components/exercice-variables/exercice-variables.component';
import { ImageUploadComponent } from '../../../../shared/components/image-upload/image-upload.component';

interface ExerciceVariables {
  nbJoueurs?: string;
  nbEquipes?: string;
  duree?: string;
  espace?: string;
  materiel?: string;
  consignes?: string;
  variantes?: string;
  pointsAttention?: string;
  objectifsPedagogiques?: string;
  variablesPlus?: any[];
  variablesMinus?: any[];
  [key: string]: any; // Pour permettre l'accès par index
}

// Interface pour les propriétés du tag
interface TagProperties {
  id: string;
  label: string;
  description?: string;
  [key: string]: any;
}

/**
 * Composant de formulaire de création et édition d'exercices
 * Permet d'ajouter un nouvel exercice ou de modifier un exercice existant avec des tags associés
 * Fonctionne en trois modes : création, édition et visualisation
 */
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
    ExerciceVariablesComponent,
    ImageUploadComponent
  ],
  templateUrl: './exercice-form.component.html',
  styleUrls: ['./exercice-form.component.css'],
  host: {
    class: 'block h-full overflow-auto p-4'
  }
})
export class ExerciceFormComponent implements OnInit, OnDestroy {
  // Propriétés du formulaire
  exerciceForm!: FormGroup;
  
  // Propriétés d'entrée et de sortie
  @Input() mode: 'create' | 'edit' | 'view' = 'create';
  @Input() exercice: Partial<Exercice> = {};
  @Input() exerciceToEdit: Exercice | null = null;
  @Input() isSubmitDisabled = false;
  @Input() ignoreRouteParams = false;
  
  /**
   * Getter pour accéder facilement aux contrôles du formulaire
   */
  get f() { 
    return this.exerciceForm.controls; 
  }

  /**
   * Alias pour la compatibilité avec le template
   */
  get editMode(): boolean { 
    return this.mode === 'edit'; 
  }
  
  // Événements de sortie
  @Output() cancel = new EventEmitter<void>();
  @Output() submit = new EventEmitter<Exercice>();
  @Output() exerciceCreated = new EventEmitter<Exercice>();
  @Output() exerciceUpdated = new EventEmitter<Exercice>();
  @Output() formCancelled = new EventEmitter<void>();
  
  // Variables de l'exercice
  private exerciceVars: ExerciceVariables = {};
  exerciceId: string | null = null;
  
  // Propriétés pour la gestion des tags
  allTags: Tag[] = [];
  objectifTags: Tag[] = [];
  travailSpecifiqueTags: Tag[] = [];
  niveauTags: Tag[] = [];
  tempsTags: Tag[] = [];
  formatTags: Tag[] = [];
  selectedTags: Tag[] = [];
  filteredTags: Tag[] = [];
  selectedTagCategory: TagCategory | 'all' = 'all';
  tagSearchQuery = '';
  
  // Propriétés pour la gestion des tags sélectionnés
  selectedObjectifTag: Tag | null = null;
  selectedTravailSpecifiqueTags: Tag[] = [];
  selectedNiveauTags: Tag[] = [];
  selectedTempsTags: Tag[] = [];
  selectedFormatTags: Tag[] = [];
  
  // Propriétés pour la gestion des images
  selectedImageFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  
  // Propriétés pour les dropdowns
  showTravailSpecifiqueDropdown = false;
  showObjectifDropdown = false;
  showNiveauDropdown = false;
  showTempsDropdown = false;
  showFormatDropdown = false;
  
  // Filtres pour les tags
  filteredTravailSpecifiqueTags: Tag[] = [];
  filteredObjectifTags: Tag[] = [];
  filteredNiveauTags: Tag[] = [];
  filteredTempsTags: Tag[] = [];
  filteredFormatTags: Tag[] = [];
  
  // Mode lecture seule
  readonlyMode = false;
  
  // États supplémentaires
  submitted = false;
  loading = false;
  loadingTags = false;
  submitting = false;
  schemaPreview: string | ArrayBuffer | null = null;
  
  // Références aux éléments du DOM
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('schemaInput') schemaInput!: ElementRef<HTMLInputElement>;
  
  // Sujet pour la gestion des abonnements
  private destroy$ = new Subject<void>();
  
  // Messages et états
  isSubmitted = false;
  successMessage = '';
  errorMessage: string | null = null;

  constructor(
    private exerciceService: ExerciceService,
    private tagService: TagService,
    private route: ActivatedRoute,
    private router: Router,
    private apiUrlService: ApiUrlService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private http: HttpClient,
    private dialog: MatDialog,
    @Optional() public dialogRef?: MatDialogRef<ExerciceFormComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: any
  ) {
    
    // Initialiser le formulaire
    this.exerciceForm = this.fb.group({
      nom: ['', [Validators.required]],
      description: ['', [Validators.required]],
      objectif: [''],
      imageUrl: [''],
      schemaUrl: [''],
      materiel: [''],
      notes: [''],
      // 'variables' est un FormControl pour fonctionner avec le CVA <app-exercice-variables>
      variables: new FormControl({ variablesPlus: [], variablesMinus: [] })
    });
    
    // Initialiser le mode et les données en fonction des paramètres
    if (this.data && this.data.customData) {
      const cd = this.data.customData as { mode?: 'create'|'edit'|'view'; exercice?: any };
      this.mode = cd.mode || 'create';
      // Lorsqu'on ouvre via un dialogue, on doit ignorer les paramètres de route
      this.ignoreRouteParams = true;
      // Définir immédiatement le mode lecture seule si besoin
      this.readonlyMode = this.mode === 'view';
      
      if (cd.exercice) {
        this.exercice = { ...cd.exercice };
        this.exerciceId = this.exercice.id || null;
      }
    }
  }

  // plus de FormArray internes: le CVA gère l'état des variables

  ngOnInit(): void {
    // Mettre à jour le mode lecture seule en fonction du mode
    this.readonlyMode = this.mode === 'view';
    
    // Initialiser le formulaire
    this.initForm();
    
    // Charger les tags
    this.loadTags();
    
    // Lire les paramètres de route si applicable
    if (!this.ignoreRouteParams) {
      // Déterminer le mode depuis les route data (ex: { formMode: 'edit' })
      this.route.data.pipe(takeUntil(this.destroy$)).subscribe((data) => {
        const formMode = data && (data as any)['formMode'];
        if (formMode === 'edit') {
          this.mode = 'edit';
          this.readonlyMode = false;
        } else if (formMode === 'add') {
          this.mode = 'create';
          this.readonlyMode = false;
        } else if (formMode === 'view') {
          this.mode = 'view';
          this.readonlyMode = true;
        }
      });

      // Récupérer l'ID depuis l'URL /exercices/modifier/:id
      this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
        const id = params.get('id');
        if (id && id !== this.exerciceId) {
          this.exerciceId = id;
          this.loadExercice(id);
        }
      });
    } else if (this.exerciceId) {
      // Mode intégration par Input/Data: charger si déjà connu
      this.loadExercice(this.exerciceId);
    }
  }

  /**
   * Charge les tags disponibles depuis le service
   */
  private loadTags(): void {
    this.loadingTags = true;
    this.tagService.getTags()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tags: Tag[]) => {
          this.allTags = tags;
          this.filteredTags = [...tags];

          // Répartition par catégories pour les dropdowns
          this.objectifTags = this.allTags.filter(tag => tag.category === 'objectif');
          this.travailSpecifiqueTags = this.allTags.filter(tag => tag.category === 'travail_specifique');
          this.niveauTags = this.allTags.filter(tag => tag.category === 'niveau');
          this.tempsTags = this.allTags.filter(tag => tag.category === 'temps');
          this.formatTags = this.allTags.filter(tag => tag.category === 'format');

          // Initialiser les listes filtrées affichées dans les menus
          this.filteredTravailSpecifiqueTags = [...this.travailSpecifiqueTags];
          this.filteredObjectifTags = [...this.objectifTags];
          this.filteredNiveauTags = [...this.niveauTags];
          this.filteredTempsTags = [...this.tempsTags];
          this.filteredFormatTags = [...this.formatTags];

          // Si un exercice est déjà chargé mais ne contient que des tagIds, mapper maintenant
          if (this.exercice) {
            const ex: any = this.exercice as any;
            if ((!this.selectedTags || this.selectedTags.length === 0)) {
              if (Array.isArray(ex.tags) && ex.tags.length) {
                this.selectedTags = [...ex.tags];
                this.distributeTagsByCategory();
              } else if (Array.isArray(ex.tagIds) && ex.tagIds.length) {
                this.selectedTags = this.allTags.filter(t => ex.tagIds.includes(t.id));
                this.distributeTagsByCategory();
              }
            }
            // Déduire l'objectif à partir du champ texte si nécessaire
            if (!this.selectedObjectifTag && ex['objectif']) {
              const match = this.objectifTags.find(t => (t as any).label === ex['objectif']);
              if (match) {
                this.selectedObjectifTag = match;
                this.syncSelectedTags();
              }
            }
          }

          this.loadingTags = false;
        },
        error: () => {
          this.loadingTags = false;
        }
      });
  }

  /**
   * Charge un exercice existant par son ID
   * @param id L'identifiant de l'exercice à charger
   */
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
        error: () => {
          this.loading = false;
        }
      });
  }

  /**
   * Met à jour le formulaire avec les données d'un exercice existant
   */
  private updateFormWithExercice(exercice: Exercice): void {
    // Construire l'état des variables à partir des champs renvoyés par le backend
    this.exerciceVars = {
      ...(exercice as any).variables, // rétrocompat éventuelle
      variablesPlus: Array.isArray((exercice as any).variablesPlus) ? (exercice as any).variablesPlus : [],
      variablesMinus: Array.isArray((exercice as any).variablesMinus) ? (exercice as any).variablesMinus : []
    } as any;

    // Mettre à jour les champs simples
    this.exerciceForm.patchValue({
      nom: exercice.nom || '',
      description: exercice.description || '',
      objectif: (exercice as any)['objectif'] || '',
      imageUrl: exercice.imageUrl || '',
      schemaUrl: (exercice as any).schemaUrl || '',
      materiel: (exercice as any).materiel || '',
      notes: (exercice as any).notes || ''
    });

    // Mettre à jour le FormControl 'variables' pour le CVA
    const variablesControl = this.exerciceForm.get('variables') as FormControl;
    variablesControl.setValue({
      variablesPlus: Array.isArray(this.exerciceVars.variablesPlus) ? this.exerciceVars.variablesPlus : [],
      variablesMinus: Array.isArray(this.exerciceVars.variablesMinus) ? this.exerciceVars.variablesMinus : []
    }, { emitEvent: false });

    // Tags sélectionnés
    if ((exercice as any).tags && (exercice as any).tags.length) {
      // Cas où l'API renvoie directement les objets Tag
      this.selectedTags = [...(exercice as any).tags];
      this.distributeTagsByCategory();
    } else if (Array.isArray((exercice as any).tagIds) && (exercice as any).tagIds.length && this.allTags.length) {
      // Mapper les IDs -> objets Tag si les tags sont déjà chargés
      const tagIds: string[] = (exercice as any).tagIds;
      this.selectedTags = this.allTags.filter(t => !!t.id && tagIds.includes(t.id as string));
      this.distributeTagsByCategory();
    } else {
      // Tags non encore disponibles: seront mappés après loadTags()
      // Tenter aussi de déduire l'objectif à partir du champ texte
      const objectifText = (exercice as any)['objectif'];
      if (objectifText && this.objectifTags.length && !this.selectedObjectifTag) {
        const match = this.objectifTags.find(t => (t as any).label === objectifText);
        if (match) {
          this.selectedObjectifTag = match;
          this.syncSelectedTags();
        }
      }
    }

    // Prévisualisations d'images (utiliser URL résolues pour les chemins relatifs)
    if (exercice.imageUrl) this.imagePreview = this.apiUrlService.getMediaUrl(exercice.imageUrl);
    if ((exercice as any).schemaUrl) this.schemaPreview = this.apiUrlService.getMediaUrl((exercice as any).schemaUrl);
  }

  /**
   * Initialise le formulaire avec les valeurs par défaut
   */
  private initForm(): void {
    // Créer le formulaire avec des valeurs par défaut
    this.exerciceForm = this.fb.group({
      nom: [this.exercice?.nom || '', Validators.required],
      description: [this.exercice?.description || '', Validators.required],
      objectif: [this.exercice?.['objectif'] || ''],
      imageUrl: [this.exercice?.imageUrl || ''],
      schemaUrl: [this.exercice?.schemaUrl || ''],
      materiel: [(this.exercice as any)?.materiel || ''],
      notes: [(this.exercice as any)?.notes || ''],
      variables: new FormControl({
        variablesPlus: Array.isArray(this.exerciceVars['variablesPlus']) ? this.exerciceVars['variablesPlus'] : [],
        variablesMinus: Array.isArray(this.exerciceVars['variablesMinus']) ? this.exerciceVars['variablesMinus'] : []
      })
    });

    // Mettre à jour les tags sélectionnés
    if (this.exercice?.tags) {
      this.selectedTags = [...this.exercice.tags];
      this.distributeTagsByCategory();
    }
  }

  /**
   * Synchronise la liste des tags sélectionnés à partir des tableaux par catégorie
   */
  private syncSelectedTags(): void {
    // Réinitialiser la liste des tags sélectionnés
    this.selectedTags = [];
    
    // Ajouter le tag objectif s'il existe
    if (this.selectedObjectifTag) {
      this.selectedTags.push(this.selectedObjectifTag);
    }
    
    // Ajouter les tags travail spécifique
    this.selectedTags = [...this.selectedTags, ...this.selectedTravailSpecifiqueTags];
    
    // Ajouter les tags niveau
    this.selectedTags = [...this.selectedTags, ...this.selectedNiveauTags];
    
    // Ajouter les tags temps
    this.selectedTags = [...this.selectedTags, ...this.selectedTempsTags];
    
    // Ajouter les tags format
    this.selectedTags = [...this.selectedTags, ...this.selectedFormatTags];
    
    // Éliminer les doublons basés sur l'ID
    const uniqueTags: {[key: string]: Tag} = {};
    this.selectedTags.forEach(tag => {
      if (tag && tag.id) {
        uniqueTags[tag.id] = tag;
      }
    });
    
    this.selectedTags = Object.values(uniqueTags);
  }

  /**
   * Construit une URL média complète à partir d'un chemin ou URL partielle
   */
  mediaUrl(path?: string | null): string | null {
    return this.apiUrlService.getMediaUrl(path ?? undefined);
  }

  /**
   * Navigation depuis la vue lecture seule
   */
  goBackToList(): void {
    this.router.navigate(['/exercices']);
  }

  goToEdit(): void {
    this.mode = 'edit';
    this.readonlyMode = false;
  }

  // ---------- Gestion des dropdowns de tags ----------
  toggleTravailDropdown(): void {
    this.showTravailSpecifiqueDropdown = !this.showTravailSpecifiqueDropdown;
  }

  toggleObjectifDropdown(): void {
    this.showObjectifDropdown = !this.showObjectifDropdown;
  }

  toggleNiveauDropdown(): void {
    this.showNiveauDropdown = !this.showNiveauDropdown;
  }

  toggleTempsDropdown(): void {
    this.showTempsDropdown = !this.showTempsDropdown;
  }

  toggleFormatDropdown(): void {
    this.showFormatDropdown = !this.showFormatDropdown;
  }

  // ---------- Sélection / retrait des tags par catégorie ----------
  selectTravailSpecifiqueTag(tag: Tag): void {
    if (!tag) return;
    if (!this.selectedTravailSpecifiqueTags.some(t => t.id === tag.id)) {
      this.selectedTravailSpecifiqueTags.push(tag);
      this.syncSelectedTags();
    }
    this.showTravailSpecifiqueDropdown = false;
  }

  removeTravailSpecifiqueTag(index: number): void {
    if (index >= 0 && index < this.selectedTravailSpecifiqueTags.length) {
      this.selectedTravailSpecifiqueTags.splice(index, 1);
      this.syncSelectedTags();
    }
  }

  selectNiveauTag(tag: Tag): void {
    if (!tag) return;
    if (!this.selectedNiveauTags.some(t => t.id === tag.id)) {
      this.selectedNiveauTags.push(tag);
      this.syncSelectedTags();
    }
    this.showNiveauDropdown = false;
  }

  removeNiveauTag(index: number): void {
    if (index >= 0 && index < this.selectedNiveauTags.length) {
      this.selectedNiveauTags.splice(index, 1);
      this.syncSelectedTags();
    }
  }

  selectTempsTag(tag: Tag): void {
    if (!tag) return;
    if (!this.selectedTempsTags.some(t => t.id === tag.id)) {
      this.selectedTempsTags.push(tag);
      this.syncSelectedTags();
    }
    this.showTempsDropdown = false;
  }

  removeTempsTag(index: number): void {
    if (index >= 0 && index < this.selectedTempsTags.length) {
      this.selectedTempsTags.splice(index, 1);
      this.syncSelectedTags();
    }
  }

  selectFormatTag(tag: Tag): void {
    if (!tag) return;
    if (!this.selectedFormatTags.some(t => t.id === tag.id)) {
      this.selectedFormatTags.push(tag);
      this.syncSelectedTags();
    }
    this.showFormatDropdown = false;
  }

  removeFormatTag(index: number): void {
    if (index >= 0 && index < this.selectedFormatTags.length) {
      this.selectedFormatTags.splice(index, 1);
      this.syncSelectedTags();
    }
  }

  // ---------- Gestion image (input file) ----------
  onImageSelected(file: File | null): void {
    this.selectedImageFile = file;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.imagePreview = null;
    }
  }
  
  /**
   * Répartit les tags sélectionnés dans les tableaux par catégorie
   */
  private distributeTagsByCategory(): void {
    // Réinitialiser les tableaux de tags
    this.selectedObjectifTag = null;
    this.selectedTravailSpecifiqueTags = [];
    this.selectedNiveauTags = [];
    this.selectedTempsTags = [];
    this.selectedFormatTags = [];

    // Répartir les tags dans les tableaux correspondants
    this.selectedTags.forEach(tag => {
      switch (tag.category) {
        case 'objectif':
          this.selectedObjectifTag = tag;
          break;
        case 'travail_specifique':
          this.selectedTravailSpecifiqueTags.push(tag);
          break;
        case 'temps':
          this.selectedTempsTags.push(tag);
          break;
        case 'format':
          this.selectedFormatTags.push(tag);
          break;
        case 'niveau':
          this.selectedNiveauTags.push(tag);
          break;
      }
    });
  }


/**
 * Filtre les tags en fonction de la recherche
 */
private filterTags(): void {
  if (!this.tagSearchQuery) {
    this.filteredTags = [...this.allTags];
    return;
  }

  const query = this.tagSearchQuery.toLowerCase();
  this.filteredTags = this.allTags.filter(tag => {
    const tagProps = tag as unknown as TagProperties;
    return (
      tagProps.label?.toLowerCase().includes(query) || 
      (tagProps.description && tagProps.description.toLowerCase().includes(query))
    );
  });
}

/**
 * Sélectionne un tag objectif
 * @param tag Le tag objectif à sélectionner
 */
selectObjectifTag(tag: Tag): void {
  if (!tag || !tag.id) return;
  
  // Mettre à jour le tag objectif sélectionné
  this.selectedObjectifTag = tag;
  
  // Mettre à jour le formulaire
  const tagProps = tag as unknown as TagProperties;
  this.exerciceForm.patchValue({
    objectif: tagProps.label
  });
  
  // Mettre à jour la liste des tags sélectionnés
  this.syncSelectedTags();
  // Fermer le dropdown
  this.showObjectifDropdown = false;
}

removeObjectifTag(): void {
  this.selectedObjectifTag = null;
  this.exerciceForm.patchValue({ objectif: '' });
  this.syncSelectedTags();
}

/**
 * Gère la soumission du formulaire
 */
onSubmit(): void {
  this.submitted = true;
  this.errorMessage = null;
  this.successMessage = '';

  // S'assurer que les tags sont synchronisés avant la soumission
  this.syncSelectedTags();

  if (this.exerciceForm.invalid) {
    return;
  }

  this.submitting = true;
  
  // Préparer les données du formulaire
  const formData: any = { 
    ...this.exerciceForm.value,
    // Inclure les tags sélectionnés dans les données du formulaire
    tags: [...this.selectedTags] // Utiliser directement les tags synchronisés
  };

  // Extraire les variables depuis le FormControl (CVA) et aplatir
  const vars = (this.exerciceForm.get('variables') as FormControl)?.value || {};
  const variablesPlusArray = Array.isArray(vars?.variablesPlus) ? vars.variablesPlus : [];
  const variablesMinusArray = Array.isArray(vars?.variablesMinus) ? vars.variablesMinus : [];
  formData.variablesPlus = variablesPlusArray;
  formData.variablesMinus = variablesMinusArray;
  // Nettoyage éventuel
  delete formData.variables;

  // Attacher directement le fichier au payload. Le service se chargera de créer le FormData.
  if (this.selectedImageFile) {
    formData.image = this.selectedImageFile;
  } else if (this.mode === 'edit' && !this.imagePreview) {
    // Si l'image a été supprimée en mode édition, s'assurer que l'URL est vide
    formData.imageUrl = '';
  }

  // Toujours appeler saveExercice une seule fois
  this.saveExercice(formData);
}

  private saveExercice(formData: any): void {
    const saveObservable = this.exerciceId
      ? this.exerciceService.updateExercice(this.exerciceId, formData)
      : this.exerciceService.createExercice(formData);

    const saveSubscription = saveObservable.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (savedExercice: Exercice) => {
        this.submitting = false;
        this.snackBar.open(
          `Exercice ${this.exerciceId ? 'mis à jour' : 'créé'} avec succès`,
          'Fermer',
          { 
            duration: 5000,
            panelClass: ['success-snackbar']
          }
        );
        
        if (this.dialogRef) {
          this.dialogRef.close(savedExercice);
        } else {
          this.router.navigate(['/exercices', savedExercice.id]);
        }

        // Émettre l'événement approprié
        if (this.exerciceId) {
          this.exerciceUpdated.emit(savedExercice);
        } else {
          this.exerciceCreated.emit(savedExercice);
        }
        
        saveSubscription.unsubscribe();
      },
      error: () => {
        this.submitting = false;
        saveSubscription.unsubscribe();
      }
    });
  }




  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Gère l'annulation du formulaire
   */
  onCancel(): void {
    if (this.exerciceForm.dirty) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '400px',
        data: {
          title: 'Annuler les modifications',
          message: 'Voulez-vous vraiment annuler ? Toutes les modifications non enregistrées seront perdues.',
          confirmText: 'Oui, annuler',
          cancelText: 'Non, continuer',
          warn: true
        } as ConfirmationDialogData
      });

      const subscription = dialogRef.afterClosed().subscribe((result: boolean) => {
        if (result) {
          this.doCancel();
        }
        subscription.unsubscribe();
      });
    } else {
      this.doCancel();
    }
  }

  /**
   * Effectue l'annulation du formulaire
   */
  private doCancel(): void {
    // Réinitialiser l'état du formulaire
    this.submitted = false;
    this.errorMessage = null;
    
    // Fermer la boîte de dialogue si elle est ouverte
    if (this.dialogRef) {
      this.dialogRef.close();
    } 
    // Sinon, naviguer vers la liste des exercices
    else {
      this.router.navigate(['/exercices']);
    }
    
    // Émettre les événements d'annulation
    this.formCancelled.emit();
    this.cancel.emit();
    
    // Afficher un message de confirmation
    this.snackBar.open('Modifications annulées', 'Fermer', { 
      duration: 3000,
      panelClass: ['info-snackbar']
    });
  }
}
