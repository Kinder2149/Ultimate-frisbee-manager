// Angular Core
import { Component, ElementRef, EventEmitter, Inject, Input, OnDestroy, OnInit, Optional, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
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
import { Observable, of, Subject } from 'rxjs';
import { map, switchMap, takeUntil, tap } from 'rxjs/operators';

// Modèles
import { Exercice } from '../../../../core/models/exercice.model';
import { Tag } from '../../../../core/models/tag.model';

// Services
import { ApiUrlService } from '../../../../core/services/api-url.service';
import { ExerciceService } from '../../../../core/services/exercice.service';
import { TagService } from '../../../../core/services/tag.service';

// Composants partagés
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../../shared/shared.module';
import { ExerciceVariablesComponent } from '../../../../shared/components/exercice-variables/exercice-variables.component';
import { ImageUploadComponent } from '../../../../shared/components/image-upload/image-upload.component';

@Component({
  selector: 'app-exercice-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule, MatButtonModule, MatCardModule,
    MatChipsModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule,
    MatSelectModule, MatTooltipModule, MatProgressSpinnerModule, ExerciceVariablesComponent,
    ImageUploadComponent
  ],
  templateUrl: './exercice-form.component.html',
  styleUrls: ['./exercice-form.component.css'],
  host: { class: 'block h-full overflow-auto p-4' }
})
export class ExerciceFormComponent implements OnInit, OnDestroy {
  // --- Propriétés du formulaire et des données ---
  exerciceForm!: FormGroup;
  @Input() mode: 'create' | 'edit' | 'view' = 'create';
  @Input() exercice: Partial<Exercice> = {};
  @Input() exerciceToEdit: Exercice | null = null;
  @Input() ignoreRouteParams = false;
  exerciceId: string | null = null;

  // --- Événements de sortie ---
  @Output() cancel = new EventEmitter<void>();
  @Output() submit = new EventEmitter<Exercice>();
  @Output() exerciceCreated = new EventEmitter<Exercice>();
  @Output() exerciceUpdated = new EventEmitter<Exercice>();
  @Output() formCancelled = new EventEmitter<void>();

  // --- Getters pour le template ---
  get f() { return this.exerciceForm.controls; }
  get editMode(): boolean { return this.mode === 'edit'; }

  // --- Gestion des tags ---
  allTags: Tag[] = [];
  objectifTags: Tag[] = [];
  travailSpecifiqueTags: Tag[] = [];
  niveauTags: Tag[] = [];
  tempsTags: Tag[] = [];
  formatTags: Tag[] = [];
  selectedTags: Tag[] = [];
  
  selectedObjectifTag: Tag | null = null;
  selectedTravailSpecifiqueTags: Tag[] = [];
  selectedNiveauTags: Tag[] = [];
  selectedTempsTags: Tag[] = [];
  selectedFormatTags: Tag[] = [];
  
  // --- Gestion des images ---
  selectedImageFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  
  // --- États pour l'UI ---
  readonlyMode = false;
  loading = false;
  submitting = false;
  submitted = false;
  successMessage = '';
  errorMessage: string | null = null;

  // --- Gestion des dropdowns de tags (obsolète, géré par mat-select) ---
  
  // --- Filtres pour les dropdowns de tags ---
  filteredTravailSpecifiqueTags: Tag[] = [];
  filteredObjectifTags: Tag[] = [];
  filteredNiveauTags: Tag[] = [];
  filteredTempsTags: Tag[] = [];
  filteredFormatTags: Tag[] = [];
  
  private destroy$ = new Subject<void>();

  constructor(
    private exerciceService: ExerciceService,
    private tagService: TagService,
    private route: ActivatedRoute,
    private router: Router,
    private apiUrlService: ApiUrlService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private dialog: MatDialog,
    @Optional() public dialogRef?: MatDialogRef<ExerciceFormComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: any
  ) {
    console.log('[ExerciceForm] TRACE: Constructor - Component instantiated.');
    this.initForm();
    if (this.data?.customData) {
      const cd = this.data.customData as { mode?: 'create'|'edit'|'view'; exercice?: any };
      this.mode = cd.mode || 'create';
      this.ignoreRouteParams = true;
      if (cd.exercice) {
        this.exercice = { ...cd.exercice };
        this.exerciceId = this.exercice.id || null;
      }
    }
  }

  ngOnInit(): void {
    console.log('[ExerciceForm] TRACE: ngOnInit - Lifecycle hook started.');
    this.readonlyMode = this.mode === 'view';
    // L'appel à initForm() a été supprimé d'ici car il est déjà dans le constructeur. Le double appel est une source de bugs.
    
    this.loading = true;
    // Flux de données contrôlé :
    // 1. Charger les tags
    // 2. Charger l'ID de l'exercice depuis la route (ou l'input)
    // 3. Charger l'exercice correspondant à l'ID
    // 4. Mettre à jour le formulaire une fois toutes les données reçues
    this.loadTags().pipe(
      tap(() => console.log('[ExerciceForm] TRACE: 1. Tags loaded.')),
      switchMap(() => this.ignoreRouteParams ? of(this.exerciceId) : this.route.paramMap.pipe(map(params => params.get('id')))),
      tap(id => console.log(`[ExerciceForm] TRACE: 2. Exercice ID found: ${id}`)),
      switchMap(id => {
        if (id) {
          this.exerciceId = id;
          return this.exerciceService.getExerciceById(id);
        }
        return of(null); // Mode création, pas d'exercice à charger
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (exercice) => {
        console.log('[ExerciceForm] TRACE: 3. Exercice data received.', exercice);
        if (exercice) {
          this.exercice = exercice;
          this.updateFormWithExercice(exercice);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error("Erreur critique lors du chargement des données du formulaire", err);
        this.loading = false;
        this.errorMessage = "Impossible de charger les données de l'exercice.";
      }
    });

    if (!this.ignoreRouteParams) {
      this.route.data.pipe(takeUntil(this.destroy$)).subscribe(data => {
        const formMode = (data as any)['formMode'];
        if (formMode === 'edit') this.mode = 'edit';
        else if (formMode === 'add') this.mode = 'create';
        else if (formMode === 'view') this.mode = 'view';
        this.readonlyMode = this.mode === 'view';
      });
    }
  }

  private loadTags(): Observable<Tag[]> {
    return this.tagService.getTags().pipe(
      tap(tags => {
        this.allTags = tags;
        this.objectifTags = tags.filter(t => t.category === 'objectif');
        this.filteredObjectifTags = [...this.objectifTags];
        this.travailSpecifiqueTags = tags.filter(t => t.category === 'travail_specifique');
        this.filteredTravailSpecifiqueTags = [...this.travailSpecifiqueTags];
        this.niveauTags = tags.filter(t => t.category === 'niveau');
        this.filteredNiveauTags = [...this.niveauTags];
        this.tempsTags = tags.filter(t => t.category === 'temps');
        this.filteredTempsTags = [...this.tempsTags];
        this.formatTags = tags.filter(t => t.category === 'format');
        this.filteredFormatTags = [...this.formatTags];
      })
    );
  }

  private initForm(): void {
    this.exerciceForm = this.fb.group({
      nom: ['', Validators.required],
      description: ['', Validators.required],
      imageUrl: [''],
      schemaUrl: [''],
      materiel: [''],
      notes: [''],
      critereReussite: [''],
      variables: new FormControl({ variablesPlus: [], variablesMinus: [] }),
      // Ajout des FormControls pour les tags
      objectifTag: [null],
      travailSpecifiqueTags: [[]],
      niveauTags: [[]],
      tempsTags: [[]],
      formatTags: [[]]
    });
  }

  private updateFormWithExercice(exercice: Exercice): void {
    console.log('[ExerciceForm] TRACE: 4. Updating form with exercice data.');

    // Pré-sélectionner les tags à partir des IDs ou des objets tags
    let tagsToSelect: Tag[] = [];
    if (exercice.tags?.length) {
        tagsToSelect = [...exercice.tags];
    } else if (exercice.tagIds?.length && this.allTags.length) {
        tagsToSelect = this.allTags.filter(t => exercice.tagIds!.includes(t.id!));
    }

    // Distribuer les tags par catégorie pour le patchValue
    const objectifTag = tagsToSelect.find(t => t.category === 'objectif') || null;
    const travailSpecifiqueTags = tagsToSelect.filter(t => t.category === 'travail_specifique');
    const niveauTags = tagsToSelect.filter(t => t.category === 'niveau');
    const tempsTags = tagsToSelect.filter(t => t.category === 'temps');
    const formatTags = tagsToSelect.filter(t => t.category === 'format');

    this.exerciceForm.patchValue({
      nom: exercice.nom || '',
      description: exercice.description || '',
      imageUrl: exercice.imageUrl || '',
      schemaUrl: (exercice as any).schemaUrl || '',
      materiel: (exercice as any).materiel || '',
      notes: (exercice as any).notes || '',
      critereReussite: (exercice as any).critereReussite || '',
      variables: {
        variablesPlus: (exercice as any).variablesPlus || [],
        variablesMinus: (exercice as any).variablesMinus || []
      },
      // Mise à jour des tags via le formulaire
      objectifTag: objectifTag,
      travailSpecifiqueTags: travailSpecifiqueTags,
      niveauTags: niveauTags,
      tempsTags: tempsTags,
      formatTags: formatTags
    });
    console.log('[ExerciceForm] TRACE: 5. Form patched with data.');

    if (exercice.imageUrl) {
      this.imagePreview = this.apiUrlService.getMediaUrl(exercice.imageUrl);
    }
  }



  onSubmit(): void {
    this.submitted = true;
    if (this.exerciceForm.invalid) {
      this.errorMessage = "Veuillez corriger les erreurs dans le formulaire.";
      return;
    }
    this.submitting = true;

    const formValue = this.exerciceForm.value;

    // Agréger tous les tags sélectionnés depuis les différents FormControls
    const allSelectedTags: Tag[] = [
      formValue.objectifTag,
      ...formValue.travailSpecifiqueTags,
      ...formValue.niveauTags,
      ...formValue.tempsTags,
      ...formValue.formatTags
    ].filter(t => t !== null && t !== undefined) as Tag[];

    const uniqueTagIds = [...new Set(allSelectedTags.map(t => t.id))];

    const formData: any = {
      nom: formValue.nom,
      description: formValue.description,
      materiel: formValue.materiel,
      notes: formValue.notes,
      critereReussite: formValue.critereReussite,
      imageUrl: formValue.imageUrl,
      schemaUrl: formValue.schemaUrl,
      tagIds: uniqueTagIds.filter(id => id) as string[],
      variablesPlus: formValue.variables.variablesPlus,
      variablesMinus: formValue.variables.variablesMinus,
    };

    if (this.selectedImageFile) {
      formData.image = this.selectedImageFile;
    } else if (this.mode === 'edit' && !this.imagePreview) {
      formData.imageUrl = '';
    }

    const saveObservable = this.exerciceId
      ? this.exerciceService.updateExercice(this.exerciceId, formData)
      : this.exerciceService.createExercice(formData);

    saveObservable.pipe(takeUntil(this.destroy$)).subscribe({
      next: (savedExercice) => {
        this.submitting = false;
        this.snackBar.open(`Exercice ${this.exerciceId ? 'mis à jour' : 'créé'}`, 'Fermer', { duration: 3000 });
        if (this.dialogRef) {
          this.dialogRef.close(savedExercice);
        } else {
          this.router.navigate(['/exercices']);
        }
        this.exerciceId ? this.exerciceUpdated.emit(savedExercice) : this.exerciceCreated.emit(savedExercice);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.error?.message || "Une erreur est survenue lors de l'enregistrement.";
      }
    });
  }

  onCancel(): void {
    if (this.exerciceForm.dirty) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        data: { title: 'Annuler les modifications', message: 'Voulez-vous vraiment annuler ?' } as ConfirmationDialogData
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) this.doCancel();
      });
    } else {
      this.doCancel();
    }
  }

  private doCancel(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    } else {
      this.router.navigate(['/exercices']);
    }
    this.formCancelled.emit();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  mediaUrl(path?: string | null): string | null {
    return this.apiUrlService.getMediaUrl(path ?? undefined);
  }

  onImageSelected(file: File | null): void {
    this.selectedImageFile = file;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result;
      reader.readAsDataURL(file);
    } else {
      this.imagePreview = null;
    }
  }
  


  // Fonction de comparaison pour les mat-select avec des objets
  compareTags(t1: Tag, t2: Tag): boolean {
    return t1 && t2 ? t1.id === t2.id : t1 === t2;
  }
}