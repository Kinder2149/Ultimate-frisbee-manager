import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { SituationMatchService } from '../../../core/services/situationmatch.service';
import { TagService } from '../../../core/services/tag.service';
import { SituationMatch } from '../../../core/models/situationmatch.model';
import { Tag } from '../../../core/models/tag.model';
import { SituationMatchFormComponent, SituationMatchFormData } from '../forms/situationmatch-form/situationmatch-form.component';

export interface SituationMatchModalData {
  mode: 'select' | 'create';
  selectedSituationMatchId?: string;
}

@Component({
  selector: 'app-situationmatch-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    SituationMatchFormComponent
  ],
  templateUrl: './situationmatch-modal.component.html',
  styleUrls: ['./situationmatch-modal.component.scss']
})
export class SituationMatchModalComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  situationsMatchs: SituationMatch[] = [];
  availableTags: Tag[] = [];
  selectedTags: Tag[] = [];
  mode: 'select' | 'create';

  constructor(
    private fb: FormBuilder,
    private situationMatchService: SituationMatchService,
    private tagService: TagService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<SituationMatchModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SituationMatchModalData
  ) {
    this.mode = data.mode;
    this.form = this.createForm();
  }

  ngOnInit(): void {
    if (this.mode === 'select') {
      this.loadSituationsMatchs();
    } else {
      this.loadTags();
    }
    
    if (this.data.selectedSituationMatchId) {
      this.form.patchValue({ situationMatchId: this.data.selectedSituationMatchId });
    }
  }

  private createForm(): FormGroup {
    if (this.mode === 'select') {
      return this.fb.group({
        situationMatchId: ['', Validators.required]
      });
    } else {
      return this.fb.group({
        type: ['Situation', Validators.required],
        description: ['', [Validators.required, Validators.minLength(10)]],
        temps: ['']
      });
    }
  }

  private loadSituationsMatchs(): void {
    this.isLoading = true;
    this.situationMatchService.getSituationsMatchs()
      .pipe(
        catchError(error => {
          console.error('Erreur lors du chargement des situations/matchs:', error);
          this.snackBar.open('Erreur lors du chargement des situations/matchs', 'Fermer', { duration: 3000 });
          return of([]);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe((situationsMatchs: any) => {
        this.situationsMatchs = situationsMatchs;
      });
  }

  private loadTags(): void {
    this.isLoading = true;
    this.tagService.getTags()
      .pipe(
        catchError(error => {
          console.error('Erreur lors du chargement des tags:', error);
          this.snackBar.open('Erreur lors du chargement des tags', 'Fermer', { duration: 3000 });
          return of([]);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe((tags: any) => {
        this.availableTags = tags;
      });
  }

  onTagToggle(tag: Tag): void {
    const index = this.selectedTags.findIndex(t => t.id === tag.id);
    if (index >= 0) {
      this.selectedTags.splice(index, 1);
    } else {
      this.selectedTags.push(tag);
    }
  }

  isTagSelected(tag: Tag): boolean {
    return this.selectedTags.some(t => t.id === tag.id);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const selectedSituationMatch = this.situationsMatchs.find(sm => sm.id === this.form.value.situationMatchId);
    this.dialogRef.close({ 
      action: 'select', 
      situationMatch: selectedSituationMatch 
    });
  }

  onSituationMatchFormSubmit(formData: SituationMatchFormData): void {
    this.isLoading = true;

    // Transformer SituationMatchFormData en CreateSituationMatchRequest
    const createRequest = {
      type: formData.type,
      description: formData.description,
      temps: formData.temps,
      tagIds: formData.tagIds
    };

    console.log('Création situation/match avec données:', createRequest);

    this.situationMatchService.ajouterSituationMatch(createRequest)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la création de la situation/match:', error);
          this.snackBar.open('Erreur lors de la création de la situation/match', 'Fermer', { duration: 3000 });
          return of(null);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(situationMatch => {
        if (situationMatch) {
          console.log('Situation/Match créée avec succès:', situationMatch);
          this.snackBar.open('Situation/Match créée avec succès', 'Fermer', { duration: 3000 });
          this.dialogRef.close({ 
            action: 'create', 
            situationMatch 
          });
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  switchMode(): void {
    this.mode = this.mode === 'select' ? 'create' : 'select';
    
    if (this.mode === 'select') {
      this.form = this.createForm();
      this.selectedTags = [];
      if (this.situationsMatchs.length === 0) {
        this.loadSituationsMatchs();
      }
    } else if (this.mode === 'create' && this.availableTags.length === 0) {
      this.loadTags();
    }
  }
}
