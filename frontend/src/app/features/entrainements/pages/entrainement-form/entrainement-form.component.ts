import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EntrainementService } from '../../../../core/services/entrainement.service';
import { ExerciceService } from '../../../../core/services/exercice.service';
import { TagService } from '../../../../core/services/tag.service';
import { Entrainement, EntrainementExercice, Echauffement } from '../../../../core/models/entrainement.model';
import { SituationMatch } from '../../../../core/models/situationmatch.model';
import { Exercice } from '../../../../core/models/exercice.model';
import { Tag } from '../../../../core/models/tag.model';
import { ExerciceSelectorComponent } from '../../../../shared/components/exercice-selector/exercice-selector.component';
import { ExerciceFormModalComponent } from '../../../../shared/components/exercice-form-modal/exercice-form-modal.component';
import { EchauffementModalComponent } from '../../../../shared/components/echauffement-modal/echauffement-modal.component';
import { SituationMatchModalComponent } from '../../../../shared/components/situationmatch-modal/situationmatch-modal.component';
import { ImageUploadComponent } from '../../../../shared/components/image-upload/image-upload.component';

@Component({
  selector: 'app-entrainement-form',
  templateUrl: './entrainement-form.component.html',
  styleUrls: ['./entrainement-form.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ExerciceSelectorComponent, ExerciceFormModalComponent, ImageUploadComponent]
})
export class EntrainementFormComponent implements OnInit {
  entrainementForm!: FormGroup;
  isEditMode = false;
  entrainementId: string | null = null;
  loading = false;
  error: string | null = null;
  selectedImageFile: File | null = null;
  
  // Gestion des exercices
  availableExercices: Exercice[] = [];
  showExerciceSelector = false;
  showExerciceFormModal = false;

  // Gestion des tags thème
  availableThemeTags: Tag[] = [];
  selectedThemeTags: Tag[] = [];
  selectedTags: string[] = [];
  showThemeDropdown = false;
  filteredThemeTags: Tag[] = [];

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
    private dialog: MatDialog
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
      imageUrl: ['']
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
    
    // Charger les relations échauffement et situation/match
    if (entrainement.echauffement) {
      this.selectedEchauffement = entrainement.echauffement;
    }
    if (entrainement.situationMatch) {
      this.selectedSituationMatch = entrainement.situationMatch;
    }
    
    // Charger les tags existants
    if (entrainement.tags && entrainement.tags.length > 0) {
      this.selectedTags = entrainement.tags.map(tag => tag.id).filter((id): id is string => id !== undefined);
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

      const formData = this.entrainementForm.value;
      const entrainementData: any = {
        id: this.isEditMode ? this.entrainementId! : undefined,
        titre: formData.titre,
        date: formData.date ? new Date(formData.date) : undefined,
        createdAt: new Date(),
        exercices: formData.exercices || [],
        echauffementId: this.selectedEchauffement?.id || undefined,
        situationMatchId: this.selectedSituationMatch?.id || undefined,
        tagIds: this.selectedThemeTags.map(tag => tag.id).filter(id => id),
        imageUrl: formData.imageUrl || undefined,
        schemaUrl: this.selectedImageFile || undefined // Attach the file for upload
      };

      const operation = this.isEditMode && this.entrainementId
        ? this.entrainementService.updateEntrainement(this.entrainementId, entrainementData)
        : this.entrainementService.ajouterEntrainement(entrainementData);

      operation.subscribe({
        next: () => {
          console.log(`Entraînement ${this.isEditMode ? 'modifié' : 'créé'} avec succès`);
          this.loading = false;
          // Navigation avec rechargement forcé de la page
          this.router.navigate(['/entrainements']).then(() => {
            window.location.reload();
          });
        },
        error: (err: unknown) => {
          console.error(`Erreur lors de la ${this.isEditMode ? 'modification' : 'création'} de l'entraînement:`, err);
          this.error = `Erreur lors de la ${this.isEditMode ? 'modification' : 'création'} de l'entraînement`;
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
        this.filteredThemeTags = [...tags];
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des tags thème entraînement:', err);
      }
    });
  }

  /**
   * Gestion des tags thème entraînement
   */
  toggleThemeTag(tag: Tag): void {
    const isSelected = this.selectedThemeTags.some(t => t.id === tag.id);
    if (isSelected) {
      this.selectedThemeTags = this.selectedThemeTags.filter(t => t.id !== tag.id);
    } else {
      this.selectedThemeTags.push(tag);
    }
  }

  isThemeTagSelected(tag: Tag): boolean {
    return this.selectedThemeTags.some(t => t.id === tag.id);
  }

  /**
   * UI dropdown tags thème (pattern Niveau)
   */
  toggleThemeDropdown(): void {
    this.showThemeDropdown = !this.showThemeDropdown;
  }

  selectThemeTag(tag: Tag): void {
    if (!this.selectedThemeTags.some(t => t.id === tag.id)) {
      this.selectedThemeTags.push(tag);
    }
    this.showThemeDropdown = false;
  }

  removeThemeTag(index: number): void {
    this.selectedThemeTags.splice(index, 1);
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
    return this.selectedEchauffement.blocs.reduce((acc, b) => acc + this.parseTempsToSeconds(b.temps), 0);
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
    // Mettre à jour le champ imageUrl pour que la suppression d'image fonctionne
    this.entrainementForm.get('imageUrl')?.setValue(file ? 'file-present' : null);
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
