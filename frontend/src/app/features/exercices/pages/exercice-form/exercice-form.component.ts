// Angular Core
import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Optional, Output } from '@angular/core';

// Angular Common
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';

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
import { RichTextEditorComponent } from '../../../../shared/components/rich-text-editor/rich-text-editor.component';
import { ImageUploadComponent } from '../../../../shared/components/image-upload/image-upload.component';
import { ExerciceViewComponent } from '../../../../shared/components/exercice-view/exercice-view.component';

@Component({
  selector: 'app-exercice-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatButtonModule, MatCardModule, MatChipsModule, MatDialogModule, MatFormFieldModule,
    MatIconModule, MatInputModule, MatProgressSpinnerModule, MatSelectModule, MatTooltipModule,
    ExerciceVariablesComponent, ImageUploadComponent, RichTextEditorComponent, ExerciceViewComponent
  ],
  templateUrl: './exercice-form.component.html',
  styleUrls: ['./exercice-form.component.scss'],
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
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: any,
    @Optional() @Inject(DOCUMENT) private doc?: Document,
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
          // Cas classique: exercice chargé depuis l'API par ID
          this.exercice = exercice;
          this.updateFormWithExercice(exercice);
        } else if (this.exercice && this.mode !== 'create') {
          // Cas dialog: on a déjà un exercice passé en customData, mais aucun chargement API
          this.updateFormWithExercice(this.exercice as Exercice);
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
      materiel: [''],
      notes: [''],
      critereReussite: [''],
      variables: new FormControl({ variablesPlus: [], variablesMinus: [] }),
      // UI only: points importants (non persisté côté backend pour l'instant)
      points: this.fb.array<string>([]),
      // Ajout des FormControls pour les tags
      objectifTag: [null],
      travailSpecifiqueTags: [[]],
      niveauTags: [[]],
      tempsTags: [[]],
      formatTags: [[]]
    });
  }

  // --- Helpers UI ---
  get pointsArray() {
    return this.exerciceForm.get('points') as any;
  }

  get pointsControls() {
    return (this.exerciceForm.get('points') as any)?.controls || [];
  }

  addPoint() {
    const fa = this.exerciceForm.get('points') as any;
    fa.push(new FormControl(''));
  }

  removePoint(index: number) {
    const fa = this.exerciceForm.get('points') as any;
    fa.removeAt(index);
  }

  onDescriptionInput(html: string) {
    this.exerciceForm.get('description')?.setValue(html);
  }

  get imagePreviewString(): string | null {
    return typeof this.imagePreview === 'string' ? this.imagePreview : null;
  }

  private updateFormWithExercice(exercice: Exercice): void {
    console.log('[ExerciceForm] TRACE: 4. Updating form with exercice data.');

    // Préparer la sélection de tags
    let tagsToSelect: Tag[] = [];
    if (exercice.tags?.length) tagsToSelect = [...exercice.tags];
    else if (exercice.tagIds?.length && this.allTags.length) tagsToSelect = this.allTags.filter(t => exercice.tagIds!.includes(t.id!));

    const objectifTag = tagsToSelect.find(t => t.category === 'objectif') || null;
    const travailSpecifiqueTags = tagsToSelect.filter(t => t.category === 'travail_specifique');
    const niveauTags = tagsToSelect.filter(t => t.category === 'niveau');
    const tempsTags = tagsToSelect.filter(t => t.category === 'temps');
    const formatTags = tagsToSelect.filter(t => t.category === 'format');

    // Déterminer l'URL d'image principale à utiliser pour le formulaire et l'aperçu
    // À ce stade, imageUrl est déjà normalisé côté service (fallback éventuel sur anciens champs schéma).
    const effectiveImageUrl = exercice.imageUrl || '';

    this.exerciceForm.patchValue({
      nom: exercice.nom || '',
      description: exercice.description || '',
      imageUrl: effectiveImageUrl,
      materiel: (exercice as any).materiel || '',
      notes: (exercice as any).notes || '',
      critereReussite: (exercice as any).critereReussite || '',
      variables: {
        variablesPlus: (exercice as any).variablesPlus || [],
        variablesMinus: (exercice as any).variablesMinus || []
      },
      objectifTag,
      travailSpecifiqueTags,
      niveauTags,
      tempsTags,
      formatTags
    });
    console.log('[ExerciceForm] TRACE: 5. Form patched with data.');

    // Éditeur Quill: plus de synchronisation DOM manuelle

    // Pré-remplir le FormArray 'points' si présent sur l'exercice
    try {
      const raw: any = (exercice as any).points;
      let pts: string[] = [];
      if (Array.isArray(raw)) pts = raw;
      else if (typeof raw === 'string' && raw.trim().length) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) pts = parsed;
          else pts = [raw];
        } catch { pts = [raw]; }
      }
      const clean = pts.map(p => (p || '').trim()).filter(p => p.length > 0);
      const fa = this.exerciceForm.get('points') as any;
      if (fa && typeof fa.clear === 'function') {
        fa.clear();
        clean.forEach(p => fa.push(new FormControl(p)));
      }
    } catch {}

    if (effectiveImageUrl) {
      this.imagePreview = this.apiUrlService.getMediaUrl(effectiveImageUrl, 'exercices');
    }
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.exerciceForm.invalid) {
      this.errorMessage = "Veuillez corriger les erreurs dans le formulaire.";
      return;
    }
    this.submitting = true;

    const formValue: any = { ...this.exerciceForm.value };

    // Gestion de suppression: si l'utilisateur a retiré l'image, forcer imageUrl à vide
    if (!this.selectedImageFile && this.imagePreview === null) {
      // Si l'utilisateur a supprimé l'image, on s'assure que imageUrl est vide
      formValue.imageUrl = '';
    }

    // Créer un FormData pour l'upload de fichier
    const formData = new FormData();

    // Ajouter les champs du formulaire au FormData
    Object.keys(formValue).forEach(key => {
      const value = formValue[key];

      // Gérer les tableaux et objets (sauf File)
      if (Array.isArray(value) || (typeof value === 'object' && value !== null && !(value instanceof File))) {
        formData.append(key, JSON.stringify(value));
      } else if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    // Ajouter les IDs des tags
    const allSelectedTags: Tag[] = [
      formValue.objectifTag,
      ...(formValue.travailSpecifiqueTags || []),
      ...(formValue.niveauTags || []),
      ...(formValue.tempsTags || []),
      ...(formValue.formatTags || [])
    ].filter((tag): tag is Tag => tag !== null && tag !== undefined);

    formData.append('tagIds', JSON.stringify(allSelectedTags.map(tag => tag.id).filter(id => id !== undefined)));

    // Si une image est sélectionnée, l'ajouter AU FINAL au FormData (sans dupliquer dans le loop ci-dessus)
    if (this.selectedImageFile) {
      formData.append('image', this.selectedImageFile, this.selectedImageFile.name);
    }

    // Gérer la création ou la mise à jour
    const saveObservable = this.exerciceId
      ? this.exerciceService.updateExercice(this.exerciceId, formData as any)
      : this.exerciceService.createExercice(formData as any);

    saveObservable.subscribe({
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
    return this.apiUrlService.getMediaUrl(path ?? undefined, 'exercices');
  }

  onImageSelected(file: File | null): void {
    this.selectedImageFile = file;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      this.imagePreview = null;
      // Si l'utilisateur supprime l'image, on réinitialise l'URL
      this.exerciceForm.patchValue({
        imageUrl: ''
      });
    }
  }

  // Fonction de comparaison pour les mat-select avec des objets
  compareTags(t1: Tag, t2: Tag): boolean {
    return t1 && t2 ? t1.id === t2.id : t1 === t2;
  }
}