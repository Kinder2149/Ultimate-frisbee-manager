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
import { ImageUploadComponent } from '../../image-upload/image-upload.component';

import { SituationMatch } from '../../../../core/models/situationmatch.model';
import { Tag } from '../../../../core/models/tag.model';

// Définition locale des types pour le formulaire
const SITUATION_MATCH_TYPES: { value: 'Match' | 'Situation'; label: string }[] = [
  { value: 'Match', label: 'Match' },
  { value: 'Situation', label: 'Situation' }
];

export interface SituationMatchFormData {
  type: 'Match' | 'Situation';
  description?: string;
  temps?: string;
  imageUrl?: string;
  image?: File;
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
    MatChipsModule,
    ImageUploadComponent
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
  selectedImageFile: File | null = null;
  imagePreview: string | null = null;
  
  // Options pour le sélecteur de type
  typeOptions = SITUATION_MATCH_TYPES;

  constructor(private fb: FormBuilder) {
    this.form = this.createForm();
  }

  private parseTemps(temps: string): { valeur: number | null; unite: 'min' | 'sec' } {
    if (!temps || typeof temps !== 'string') {
      return { valeur: null, unite: 'min' };
    }
    const trimmed = temps.trim().toLowerCase();
    const regex = /^(\d+(?:[\.,]\d+)?)\s*(min|m|sec|s)?$/i;
    const match = trimmed.match(regex);
    if (match) {
      const rawVal = match[1]?.replace(',', '.') || '';
      const num = rawVal ? Number(rawVal) : NaN;
      const unitRaw = (match[2] || 'min').toLowerCase();
      const unit: 'min' | 'sec' = unitRaw.startsWith('s') ? 'sec' : 'min';
      return { valeur: isNaN(num) ? null : num, unite: unit };
    }
    return { valeur: null, unite: 'min' };
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
      // UI controls for time
      tempsValeur: [null, [Validators.min(0)]],
      tempsUnite: ['min'],
      imageUrl: ['']
    });
  }

  private populateForm(situationMatch: SituationMatch): void {
    const parsed = this.parseTemps(situationMatch.temps || '');
    this.form.patchValue({
      type: situationMatch.type,
      description: situationMatch.description || '',
      tempsValeur: parsed.valeur,
      tempsUnite: parsed.unite,
      imageUrl: situationMatch.imageUrl || ''
    });

    if (situationMatch.imageUrl) {
      this.imagePreview = situationMatch.imageUrl;
    }
    
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
    const valeur = formData.tempsValeur;
    const unite = formData.tempsUnite as ('min'|'sec');
    const temps = (valeur === null || valeur === undefined || valeur === '') ? undefined : `${valeur} ${unite}`;

    const situationMatchData: SituationMatchFormData = {
      type: formData.type,
      description: formData.description || undefined,
      temps,
      imageUrl: formData.imageUrl || undefined,
      image: this.selectedImageFile || undefined, // Attach the file for upload
      tagIds: this.selectedTags.map(tag => tag.id).filter(id => id !== undefined) as string[]
    };

    this.formSubmit.emit(situationMatchData);
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
      this.form.patchValue({ imageUrl: '' });
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }
}
