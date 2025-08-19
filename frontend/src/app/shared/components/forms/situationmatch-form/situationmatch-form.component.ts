import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import { SituationMatch, SITUATION_MATCH_TYPES } from '../../../../core/models/situationmatch.model';
import { Tag } from '../../../../core/models/tag.model';

export interface SituationMatchFormData {
  type: 'Match' | 'Situation';
  description?: string;
  temps?: string;
  tagIds: string[];
}

@Component({
  selector: 'app-situationmatch-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './situationmatch-form.component.html',
  styleUrls: ['./situationmatch-form.component.scss']
})
export class SituationMatchFormComponent implements OnInit, OnChanges {
  @Input() situationMatch?: SituationMatch;
  @Input() isEditMode = false;
  @Input() loading = false;
  @Input() availableTags: Tag[] = [];
  
  @Output() formSubmit = new EventEmitter<SituationMatchFormData>();
  @Output() formCancel = new EventEmitter<void>();

  form: FormGroup;
  selectedTags: Tag[] = [];
  
  // Options pour le sélecteur de type
  typeOptions = SITUATION_MATCH_TYPES;

  constructor(private fb: FormBuilder) {
    this.form = this.createForm();
  }

  ngOnInit(): void {
    // Initialisation si nécessaire
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['situationMatch'] && this.situationMatch) {
      this.populateForm(this.situationMatch);
    }
    
    if (changes['availableTags'] && this.availableTags) {
      // Filtrer les tags pertinents (format, temps, niveau)
      this.availableTags = this.availableTags.filter(tag => 
        ['format', 'temps', 'niveau'].includes(tag.category)
      );
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      type: ['', [Validators.required]],
      description: [''],
      temps: ['']
    });
  }

  private populateForm(situationMatch: SituationMatch): void {
    this.form.patchValue({
      type: situationMatch.type,
      description: situationMatch.description || '',
      temps: situationMatch.temps || ''
    });
    
    // Charger les tags sélectionnés
    this.selectedTags = situationMatch.tags || [];
  }

  // Méthodes pour la gestion des tags
  onTagSelect(tag: Tag): void {
    if (!this.selectedTags.find(t => t.id === tag.id)) {
      this.selectedTags.push(tag);
    }
  }

  removeTag(tag: Tag): void {
    this.selectedTags = this.selectedTags.filter(t => t.id !== tag.id);
  }

  // Getters pour le template
  get pageTitle(): string {
    return this.isEditMode ? 'Modifier la Situation/Match' : 'Nouvelle Situation/Match';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'Modifier' : 'Créer';
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const formData = this.form.value;
    
    const situationMatchData: SituationMatchFormData = {
      type: formData.type,
      description: formData.description || undefined,
      temps: formData.temps || undefined,
      tagIds: this.selectedTags.map(tag => tag.id).filter(id => id !== undefined) as string[]
    };

    this.formSubmit.emit(situationMatchData);
  }

  onCancel(): void {
    this.formCancel.emit();
  }
}
