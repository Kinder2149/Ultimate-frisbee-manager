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
import { MobileRelationSelectorComponent, RelationItem } from '../../../components/mobile-relation-selector/mobile-relation-selector.component';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { Entrainement, EntrainementExercice } from '../../../../../core/models/entrainement.model';
import { Exercice } from '../../../../../core/models/exercice.model';
import { Echauffement } from '../../../../../core/models/echauffement.model';
import { SituationMatch } from '../../../../../core/models/situationmatch.model';
import { Tag } from '../../../../../core/models/tag.model';

import { EntrainementService } from '../../../../../core/services/entrainement.service';
import { ExerciceService } from '../../../../../core/services/exercice.service';
import { EchauffementService } from '../../../../../core/services/echauffement.service';
import { SituationMatchService } from '../../../../../core/services/situationmatch.service';
import { TagService } from '../../../../../core/services/tag.service';

@Component({
  selector: 'app-mobile-create-entrainement',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MobileHeaderComponent,
    MobileStepperComponent,
    MobileTagSelectorComponent,
    MobileRelationSelectorComponent
  ],
  templateUrl: './mobile-create-entrainement.component.html',
  styleUrls: ['./mobile-create-entrainement.component.scss']
})
export class MobileCreateEntrainementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  entrainementForm!: FormGroup;
  currentStep = 0;
  steps: StepConfig[] = [
    { label: 'Informations', completed: false },
    { label: 'Échauffement', completed: false, optional: true },
    { label: 'Exercices', completed: false },
    { label: 'Situation', completed: false, optional: true },
    { label: 'Tags', completed: false, optional: true },
    { label: 'Résumé', completed: false }
  ];

  allTags: Tag[] = [];
  tagCategories: TagCategory[] = [];
  selectedTags: Tag[] = [];

  availableExercices: RelationItem[] = [];
  selectedExercices: RelationItem[] = [];

  availableEchauffements: RelationItem[] = [];
  selectedEchauffement: RelationItem | null = null;

  availableSituations: RelationItem[] = [];
  selectedSituation: RelationItem | null = null;

  submitting = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private entrainementService: EntrainementService,
    private exerciceService: ExerciceService,
    private echauffementService: EchauffementService,
    private situationMatchService: SituationMatchService,
    private tagService: TagService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.entrainementForm = this.fb.group({
      titre: ['', Validators.required],
      date: [new Date()]
    });
  }

  private loadData(): void {
    this.loadTags();
    this.loadExercices();
    this.loadEchauffements();
    this.loadSituations();
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
        error: (err) => console.error('Erreur chargement tags:', err)
      });
  }

  private loadExercices(): void {
    this.exerciceService.getExercices()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (exercices: Exercice[]) => {
          this.availableExercices = exercices.map(ex => ({
            id: ex.id!,
            title: ex.nom,
            duration: ex['duree_minutes'] as number,
            imageUrl: ex.imageUrl
          }));
        },
        error: (err) => console.error('Erreur chargement exercices:', err)
      });
  }

  private loadEchauffements(): void {
    this.echauffementService.getEchauffements()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (echauffements: Echauffement[]) => {
          this.availableEchauffements = echauffements.map(ech => ({
            id: ech.id!,
            title: ech.nom,
            duration: undefined
          }));
        },
        error: (err) => console.error('Erreur chargement échauffements:', err)
      });
  }

  private loadSituations(): void {
    this.situationMatchService.getSituationsMatchs()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (situations: SituationMatch[]) => {
          this.availableSituations = situations.map(sit => ({
            id: sit.id!,
            title: sit.nom || 'Sans titre',
            imageUrl: sit.imageUrl
          }));
        },
        error: (err) => console.error('Erreur chargement situations:', err)
      });
  }

  get canProceedStep(): boolean {
    switch (this.currentStep) {
      case 0:
        return this.entrainementForm.get('titre')?.valid || false;
      case 1:
      case 3:
      case 4:
        return true;
      case 2:
        return this.selectedExercices.length > 0;
      case 5:
        return true;
      default:
        return false;
    }
  }

  get canComplete(): boolean {
    return this.entrainementForm.valid && 
           this.selectedExercices.length > 0 && 
           !this.submitting;
  }

  get totalDuration(): number {
    return this.selectedExercices.reduce((sum, ex) => sum + (ex.duration || 0), 0);
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
    if (this.entrainementForm.dirty || this.selectedExercices.length > 0) {
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

  onExercicesChange(exercices: RelationItem[]): void {
    this.selectedExercices = exercices;
  }

  onEchauffementChange(echauffements: RelationItem[]): void {
    this.selectedEchauffement = echauffements.length > 0 ? echauffements[0] : null;
  }

  onSituationChange(situations: RelationItem[]): void {
    this.selectedSituation = situations.length > 0 ? situations[0] : null;
  }

  onComplete(): void {
    if (!this.canComplete) return;

    this.submitting = true;

    const exercices: EntrainementExercice[] = this.selectedExercices.map((ex, index) => ({
      exerciceId: ex.id,
      ordre: index + 1,
      duree: ex.duration,
      entrainementId: ''
    }));

    const entrainementData: Partial<Entrainement> = {
      titre: this.entrainementForm.value.titre,
      date: this.entrainementForm.value.date,
      exercices: exercices,
      echauffementId: this.selectedEchauffement?.id,
      situationMatchId: this.selectedSituation?.id,
      tags: this.selectedTags,
      dureeTotal: this.totalDuration
    };

    this.entrainementService.createEntrainement(entrainementData as Entrainement)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (created) => {
          this.submitting = false;
          this.snackBar.open('Entraînement créé avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['/mobile/detail/entrainement', created.id]);
        },
        error: (err) => {
          console.error('Erreur création entraînement:', err);
          this.submitting = false;
          this.snackBar.open('Erreur lors de la création', 'Fermer', { duration: 3000 });
        }
      });
  }
}
