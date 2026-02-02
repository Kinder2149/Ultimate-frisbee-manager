import { Component, OnInit } from '@angular/core';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EntrainementService } from '../../../../core/services/entrainement.service';
import { ExerciceService } from '../../../../core/services/exercice.service';
import { TagService } from '../../../../core/services/tag.service';
import { Entrainement, EntrainementExercice } from '../../../../core/models/entrainement.model';
import { Echauffement, BlocEchauffement } from '../../../../core/models/echauffement.model';
import { SituationMatch } from '../../../../core/models/situationmatch.model';
import { Exercice } from '../../../../core/models/exercice.model';
import { Tag } from '../../../../core/models/tag.model';
import { ExerciceSelectorComponent } from '../../../../shared/components/exercice-selector/exercice-selector.component';
import { ExerciceFormModalComponent } from '../../../../shared/components/exercice-form-modal/exercice-form-modal.component';
import { EchauffementModalComponent } from '../../../../shared/components/echauffement-modal/echauffement-modal.component';
import { SituationMatchModalComponent } from '../../../../shared/components/situationmatch-modal/situationmatch-modal.component';
import { ImagePickerFieldComponent } from '../../../../shared/components/form-fields/image-picker-field/image-picker-field.component';
import { TagSelectMultiComponent } from '../../../../shared/components/form-fields/tag-select-multi/tag-select-multi.component';

@Component({
  selector: 'app-entrainement-form',
  templateUrl: './entrainement-form.component.html',
  styleUrls: ['./entrainement-form.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ExerciceSelectorComponent, ExerciceFormModalComponent, ImagePickerFieldComponent, TagSelectMultiComponent]
})
export class EntrainementFormComponent implements OnInit {
  entrainementForm!: FormGroup;
  isEditMode = false;
  entrainementId: string | null = null;
  loading = false;
  error: string | null = null;
  selectedImageFile: File | null = null;
  imagePreview: string | null = null;
  
  // Gestion des exercices
  availableExercices: Exercice[] = [];
  showExerciceSelector = false;
  showExerciceFormModal = false;

  // Gestion des tags thème
  availableThemeTags: Tag[] = [];

  // Gestion des nouvelles relations
  selectedEchauffement: Echauffement | null = null;
  selectedSituationMatch: SituationMatch | null = null;


  constructor(
    private fb: FormBuilder,
    private entrainementService: EntrainementService,
    private exerciceService: ExerciceService,
    private tagService: TagService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.checkEditMode();
    this.loadAvailableExercices();
    this.loadThemeTags();
  }

  /**
   * Initialise le formulaire simplifié
   */
  private initForm(): void {
    this.entrainementForm = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(3)]],
      date: [''],
      exercices: this.fb.array([]),
      imageUrl: [''],

      // Tags thème (standardisé)
      themeTags: [[]]
    });
  }

  /**
   * Getter pour le FormArray des exercices
   */
  get exercicesFormArray(): FormArray {
    return this.entrainementForm.get('exercices') as FormArray;
  }

  /**
   * Charge la liste des exercices disponibles
   */
  private loadAvailableExercices(): void {
    this.exerciceService.getExercices().subscribe({
      next: (exercices: Exercice[]) => {
        this.availableExercices = exercices;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des exercices:', err);
      }
    });
  }


  /**
   * Vérifie si on est en mode édition
   */
  private checkEditMode(): void {
    this.entrainementId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.entrainementId;

    if (this.isEditMode && this.entrainementId) {
      this.loadEntrainement(this.entrainementId);
    }
  }

  /**
   * Charge un entraînement pour l'édition
   */
  private loadEntrainement(id: string): void {
    this.loading = true;
    this.error = null;

    this.entrainementService.getEntrainementById(id).subscribe({
      next: (entrainement: Entrainement) => {
        this.populateForm(entrainement);
        this.loading = false;
      },
      error: (err: unknown) => {
        console.error('Erreur lors du chargement de l\'entraînement:', err);
        this.error = 'Erreur lors du chargement de l\'entraînement';
        this.loading = false;
      }
    });
  }

  /**
   * Remplit le formulaire avec les données de l'entraînement
   */
  private populateForm(entrainement: Entrainement): void {
    this.entrainementForm.patchValue({
      titre: entrainement.titre,
      date: entrainement.date ? new Date(entrainement.date).toISOString().split('T')[0] : '',
      imageUrl: entrainement.imageUrl || ''
    });

    if (entrainement.imageUrl) {
      this.imagePreview = entrainement.imageUrl;
    }
    
    // Charger les relations échauffement et situation/match
    if (entrainement.echauffement) {
      this.selectedEchauffement = entrainement.echauffement;
    }
    if (entrainement.situationMatch) {
      this.selectedSituationMatch = entrainement.situationMatch;
    }
    
    // Tags thème: patcher la sélection si les tags sont déjà fournis
    if (entrainement.tags && entrainement.tags.length > 0) {
      this.entrainementForm.patchValue({
        themeTags: entrainement.tags
      });
    }
    
    // Charger les exercices de l'entraînement
    if (entrainement.exercices && entrainement.exercices.length > 0) {
      const exercicesFormArray = this.exercicesFormArray;
      entrainement.exercices.forEach(exercice => {
        exercicesFormArray.push(this.createExerciceFormGroup(exercice));
      });
    }
  }

  /**
   * Soumet le formulaire
   */
  onSubmit(): void {
    if (this.entrainementForm.valid) {
      this.loading = true;
      this.error = null;

      const formValue = this.entrainementForm.value;

      // Construction explicite du FormData (aligné avec Échauffement)
      const fd = new FormData();
      fd.append('titre', formValue.titre);
      if (formValue.date) {
        fd.append('date', new Date(formValue.date).toISOString());
      }

      // Exercices: sérialiser uniquement les champs pertinents, en normalisant les types attendus par le backend
      const exercicesPayload = (formValue.exercices || [])
        .map((exo: any) => {
          const exerciceId = (exo.exerciceId || '').toString().trim();
          const ordreNum = Number(exo.ordre);
          const dureeNum = exo.duree === null || exo.duree === undefined || exo.duree === ''
            ? null
            : Number(exo.duree);

          const payload: any = {
            exerciceId,
            // garder ordre s'il est un entier positif
            ...(Number.isFinite(ordreNum) && ordreNum > 0 ? { ordre: Math.floor(ordreNum) } : {}),
            // Zod attend un nombre ou null pour duree
            ...(dureeNum === null ? { duree: null } : (Number.isFinite(dureeNum) && dureeNum >= 0 ? { duree: Math.floor(dureeNum) } : {})),
          };
          if (exo.notes != null && `${exo.notes}`.trim() !== '') {
            payload.notes = `${exo.notes}`.trim();
          }
          return payload;
        })
        // filtrer les éléments sans exerciceId
        .filter((e: any) => !!e.exerciceId);
      fd.append('exercices', JSON.stringify(exercicesPayload));

      // Relations: n'envoyer que si présentes
      if (this.selectedEchauffement?.id) {
        fd.append('echauffementId', this.selectedEchauffement.id);
      }
      if (this.selectedSituationMatch?.id) {
        fd.append('situationMatchId', this.selectedSituationMatch.id);
      }

      // Tags (ids)
      const themeTags = (formValue.themeTags || []) as Tag[];
      const tagIds = themeTags.map(tag => tag.id).filter((id): id is string => !!id);
      fd.append('tagIds', JSON.stringify(tagIds));

      // Gestion suppression image (édition uniquement): forcer imageUrl vide si supprimée
      if (!this.selectedImageFile && this.isEditMode && !this.imagePreview) {
        fd.append('imageUrl', '');
      } else if (formValue.imageUrl) {
        fd.append('imageUrl', formValue.imageUrl);
      }

      // Fichier image si présent
      if (this.selectedImageFile) {
        fd.append('image', this.selectedImageFile, this.selectedImageFile.name);
      }

      const saveOperation$ = this.isEditMode && this.entrainementId
        ? this.entrainementService.updateEntrainement(this.entrainementId, fd)
        : this.entrainementService.createEntrainement(fd);

      saveOperation$.subscribe({
        next: () => {
          console.log(`Entraînement ${this.isEditMode ? 'modifié' : 'créé'} avec succès`);
          this.loading = false;
          // Navigation simple, sans rechargement
          this.router.navigate(['/entrainements']);
        },
        error: (err: any) => {
          const title = this.isEditMode ? 'modification' : 'création';
          // Logs structurés pour le debug
          console.error(`[EntrainementForm] Échec ${title}:`, {
            status: err?.status,
            message: err?.error?.message || err?.message,
            details: err?.error?.details,
            body: err?.error
          });

          // Construire un message utilisateur exploitable
          const details = Array.isArray(err?.error?.details) ? err.error.details : [];
          let reason = err?.error?.message || `Erreur lors de la ${title} de l'entraînement.`;
          if (details.length > 0) {
            const readable = details
              .map((d: any) => (d?.field ? `${d.field}: ${d.message}` : d?.message))
              .filter((x: any) => !!x)
              .join(' \u2013 ');
            if (readable) reason = readable;
          }

          this.error = reason;
          // Notification visible
          this.snackBar.open(this.error || "Une erreur est survenue.", 'Fermer', { duration: 5000 });
          this.loading = false;
        }
      });
    }
  }

  /**
   * Annule et retourne à la liste
   */
  onCancel(): void {
    this.router.navigate(['/entrainements']);
  }

  /**
   * Crée un FormGroup pour un exercice d'entraînement
   */
  private createExerciceFormGroup(exercice: EntrainementExercice): FormGroup {
    return this.fb.group({
      id: [exercice.id],
      exerciceId: [exercice.exerciceId, Validators.required],
      ordre: [exercice.ordre, Validators.required],
      duree: [exercice.duree],
      notes: [exercice.notes],
      exercice: [exercice.exercice]
    });
  }

  /**
   * Ajoute un exercice à l'entraînement
   */
  ajouterExercice(exercice: Exercice): void {
    const exercicesArray = this.exercicesFormArray;
    const nouvelExercice: EntrainementExercice = {
      entrainementId: this.entrainementId || '',
      exerciceId: exercice.id || '',
      ordre: exercicesArray.length + 1,
      duree: undefined,
      notes: undefined,
      exercice: exercice
    };
    
    exercicesArray.push(this.createExerciceFormGroup(nouvelExercice));
    this.showExerciceSelector = false;
  }

  /**
   * Supprime un exercice de l'entraînement
   */
  supprimerExercice(index: number): void {
    this.exercicesFormArray.removeAt(index);
    // Réorganiser les ordres
    this.exercicesFormArray.controls.forEach((control, i) => {
      control.get('ordre')?.setValue(i + 1);
    });
  }

  /**
   * Déplace un exercice vers le haut
   */
  monterExercice(index: number): void {
    if (index > 0) {
      const exercicesArray = this.exercicesFormArray;
      const exercice = exercicesArray.at(index);
      exercicesArray.removeAt(index);
      exercicesArray.insert(index - 1, exercice);
      this.updateOrdres();
    }
  }

  /**
   * Déplace un exercice vers le bas
   */
  descendreExercice(index: number): void {
    const exercicesArray = this.exercicesFormArray;
    if (index < exercicesArray.length - 1) {
      const exercice = exercicesArray.at(index);
      exercicesArray.removeAt(index);
      exercicesArray.insert(index + 1, exercice);
      this.updateOrdres();
    }
  }

  /**
   * Met à jour les ordres des exercices
   */
  private updateOrdres(): void {
    this.exercicesFormArray.controls.forEach((control, i) => {
      control.get('ordre')?.setValue(i + 1);
    });
  }

  /**
   * Toggle l'affichage du sélecteur d'exercices
   */
  toggleExerciceSelector(): void {
    this.showExerciceSelector = !this.showExerciceSelector;
  }

  /**
   * Ouvre la modal de création d'exercice
   */
  openExerciceFormModal(): void {
    this.showExerciceFormModal = true;
  }

  /**
   * Ferme la modal de création d'exercice
   */
  closeExerciceFormModal(): void {
    this.showExerciceFormModal = false;
  }

  /**
   * Gère la création d'un nouvel exercice depuis la modal
   * L'exercice est automatiquement ajouté à la base de données globale
   * et devient disponible pour sélection dans l'entraînement
   */
  onNewExerciceCreated(exercice: Exercice): void {
    console.log('Nouvel exercice créé:', exercice);
    
    // Ajouter l'exercice à la liste des exercices disponibles
    this.availableExercices.push(exercice);
    
    // Ajouter automatiquement l'exercice à l'entraînement
    this.ajouterExercice(exercice);
    
    // Fermer la modal
    this.closeExerciceFormModal();
    
    // Message de confirmation (optionnel)
    console.log('Exercice ajouté à l\'entraînement et à la base de données globale');
  }

  /**
   * Retourne les IDs des exercices déjà sélectionnés
   */
  getSelectedExerciceIds(): string[] {
    return this.exercicesFormArray.controls
      .map(control => control.get('exerciceId')?.value)
      .filter(id => id) as string[];
  }

  /**
   * Vérifie si un champ a une erreur
   */
  hasError(fieldName: string, errorType?: string): boolean {
    const field = this.entrainementForm.get(fieldName);
    if (!field) return false;

    if (errorType) {
      return field.hasError(errorType) && (field.dirty || field.touched);
    }
    return field.invalid && (field.dirty || field.touched);
  }

  /**
   * Récupère le message d'erreur pour un champ
   */
  getErrorMessage(fieldName: string): string {
    const field = this.entrainementForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) {
      return `${fieldName} est requis`;
    }
    if (field.errors['minlength']) {
      return `${fieldName} doit contenir au moins ${field.errors['minlength'].requiredLength} caractères`;
    }
    return 'Erreur de validation';
  }

  /**
   * Ouvre la modal pour sélectionner/créer un échauffement
   */
  openEchauffementModal(): void {
    const dialogRef = this.dialog.open(EchauffementModalComponent, {
      width: '500px',
      data: {
        mode: 'select',
        selectedEchauffementId: this.selectedEchauffement?.id
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.echauffement) {
        this.selectedEchauffement = result.echauffement;
        console.log('Échauffement sélectionné:', this.selectedEchauffement);
      }
    });
  }

  /**
   * Retire l'échauffement sélectionné
   */
  removeEchauffement(): void {
    this.selectedEchauffement = null;
  }

  /**
   * Ouvre la modal pour sélectionner/créer une situation/match
   */
  openSituationMatchModal(): void {
    const dialogRef = this.dialog.open(SituationMatchModalComponent, {
      width: '600px',
      data: {
        mode: 'select',
        selectedSituationMatchId: this.selectedSituationMatch?.id
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.situationMatch) {
        this.selectedSituationMatch = result.situationMatch;
        console.log('Situation/Match sélectionnée:', this.selectedSituationMatch);
      }
    });
  }

  /**
   * Retire la situation/match sélectionnée
   */
  removeSituationMatch(): void {
    this.selectedSituationMatch = null;
  }

  /**
   * Charge les tags de thème entraînement disponibles
   */
  private loadThemeTags(): void {
    this.tagService.getTags('theme_entrainement').subscribe({
      next: (tags: Tag[]) => {
        this.availableThemeTags = tags;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des tags thème entraînement:', err);
      }
    });
  }

  /**
   * ===== Helpers Durées & Tags (affichage UI) =====
   */
  private parseTempsToSeconds(input?: string | null): number {
    if (!input) return 0;
    const s = String(input).trim().toLowerCase().replace(',', '.');
    // Formats: "mm", "mm min", "ss s", "mm:ss"
    const mmss = s.match(/^(\d{1,2}):(\d{2})$/);
    if (mmss) {
      const m = parseInt(mmss[1], 10) || 0;
      const sec = parseInt(mmss[2], 10) || 0;
      return m * 60 + sec;
    }
    const secMatch = s.match(/^(\d+(?:\.\d+)?)\s*(s|sec|secs|seconde|secondes)$/);
    if (secMatch) return Math.round(parseFloat(secMatch[1]));
    const minMatch = s.match(/^(\d+(?:\.\d+)?)\s*(m|min|mins|minute|minutes)?$/);
    if (minMatch) return Math.round(parseFloat(minMatch[1]) * 60);
    const asNumber = Number(s);
    if (!isNaN(asNumber)) return Math.round(asNumber * 60);
    return 0;
  }

  private formatSeconds(totalSeconds: number): string {
    const sec = Math.max(0, Math.round(totalSeconds));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    if (h > 0) {
      const mm = m.toString().padStart(2, '0');
      return `${h}h${mm}`;
    }
    return `${m} min`;
  }

  getEchauffementTotalSeconds(): number {
    if (!this.selectedEchauffement || !this.selectedEchauffement.blocs) return 0;
    return this.selectedEchauffement.blocs.reduce((acc: number, b: BlocEchauffement) => acc + this.parseTempsToSeconds(b.temps), 0);
  }

  getEchauffementTotalLabel(): string {
    return this.formatSeconds(this.getEchauffementTotalSeconds());
  }

  getSituationSeconds(): number {
    return this.parseTempsToSeconds(this.selectedSituationMatch?.temps);
  }

  getSituationLabel(): string {
    return this.formatSeconds(this.getSituationSeconds());
  }

  getExerciceMinutes(index: number): number {
    const ctrl = this.exercicesFormArray.at(index);
    const val = ctrl?.get('duree')?.value;
    const n = Number(val);
    return isNaN(n) ? 0 : Math.max(0, Math.floor(n));
  }

  onImageSelected(file: File | null): void {
    this.selectedImageFile = file;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result as string;
      reader.readAsDataURL(file);
    } else {
      this.imagePreview = null;
      // Si l'utilisateur supprime l'image, refléter explicitement la suppression côté formulaire
      this.entrainementForm.patchValue({ imageUrl: '' });
    }
  }

  getExerciceTags(index: number): Tag[] {
    const ctrl = this.exercicesFormArray.at(index);
    const exo = ctrl?.get('exercice')?.value as { tags?: Tag[] } | undefined;
    return exo?.tags ?? [];
  }

  // Formatage du temps d'un bloc d'échauffement (affichage UI)
  formatBlocTemps(temps?: string | null): string {
    return this.formatSeconds(this.parseTempsToSeconds(temps));
  }

}
