import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import { Tag } from '../../services/tag-recommendation.service';

@Component({
  selector: 'app-tag-editor',
  templateUrl: './tag-editor.component.html',
  styleUrls: ['./tag-editor.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ]
})
export class TagEditorComponent implements OnInit {
  @Input() tag: Tag | null = null;
  @Input() categories: string[] = ['objectif', 'element', 'niveau'];
  @Input() disabledFields: string[] = [];
  @Input() submitLabel: string = 'Enregistrer';
  @Input() isCreating: boolean = false;
  
  @Output() saveTag = new EventEmitter<Tag>();
  @Output() cancelEdit = new EventEmitter<void>();

  tagForm!: FormGroup;
  colorPresets: string[] = ['#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#f44336', '#3f51b5', '#009688', '#607d8b'];
  previewColor: string = '';
  
  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
    
    if (this.tag) {
      this.tagForm.patchValue({
        id: this.tag.id,
        label: this.tag.label,
        category: this.tag.category,
        color: this.tag.color || this.getCategoryColor(this.tag.category),
        level: this.tag.level || null
      });
      
      this.previewColor = this.tagForm.get('color')?.value || '';
    } else {
      this.previewColor = '#9e9e9e';
    }
    
    // Désactiver les champs spécifiés
    for (const field of this.disabledFields) {
      if (this.tagForm.get(field)) {
        this.tagForm.get(field)?.disable();
      }
    }
    
    // Écouter les changements de catégorie
    this.tagForm.get('category')?.valueChanges.subscribe(category => {
      // Si la couleur n'a pas été personnalisée, utiliser la couleur par défaut de la catégorie
      if (!this.tagForm.get('color')?.dirty) {
        const color = this.getCategoryColor(category);
        this.tagForm.get('color')?.setValue(color);
        this.previewColor = color;
      }
      
      // Afficher le champ de niveau uniquement pour la catégorie "niveau"
      if (category === 'niveau') {
        this.tagForm.get('level')?.setValidators([Validators.required, Validators.min(1), Validators.max(5)]);
      } else {
        this.tagForm.get('level')?.clearValidators();
        this.tagForm.get('level')?.setValue(null);
      }
      this.tagForm.get('level')?.updateValueAndValidity();
    });
    
    // Écouter les changements de couleur
    this.tagForm.get('color')?.valueChanges.subscribe(color => {
      this.previewColor = color;
    });
  }
  
  initForm(): void {
    this.tagForm = this.fb.group({
      id: [this.isCreating ? '' : null],
      label: ['', [Validators.required, Validators.maxLength(30)]],
      category: ['', Validators.required],
      color: [''],
      level: [null]
    });
  }
  
  /**
   * Obtient la couleur par défaut pour une catégorie
   */
  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'objectif': '#4caf50',
      'element': '#2196f3',
      'variable': '#ff9800',
      'niveau': '#9c27b0'
    };
    
    return colors[category.toLowerCase()] || '#9e9e9e';
  }
  
  /**
   * Sélectionne une couleur prédéfinie
   */
  selectColor(color: string): void {
    this.tagForm.get('color')?.setValue(color);
    this.tagForm.get('color')?.markAsDirty();
    this.previewColor = color;
  }
  
  /**
   * Gère la soumission du formulaire
   */
  onSubmit(): void {
    if (this.tagForm.invalid) {
      return;
    }
    
    const formValue = this.tagForm.getRawValue();
    const tag: Tag = {
      id: formValue.id || this.generateId(formValue.label),
      label: formValue.label,
      category: formValue.category,
      color: formValue.color,
      level: formValue.level
    };
    
    this.saveTag.emit(tag);
  }
  
  /**
   * Annule l'édition
   */
  onCancel(): void {
    this.cancelEdit.emit();
  }
  
  /**
   * Génère un ID à partir du libellé (pour les nouveaux tags)
   */
  private generateId(label: string): string {
    return 'tag_' + label.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now().toString(36);
  }
  
  /**
   * Vérifie si un champ est invalide et a été touché
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.tagForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }
  
  /**
   * Récupère le message d'erreur pour un champ
   */
  getErrorMessage(fieldName: string): string {
    const field = this.tagForm.get(fieldName);
    
    if (!field) {
      return '';
    }
    
    if (field.hasError('required')) {
      return 'Ce champ est requis';
    }
    
    if (field.hasError('maxlength')) {
      return `Maximum ${field.getError('maxlength').requiredLength} caractères`;
    }
    
    if (field.hasError('min')) {
      return `Minimum ${field.getError('min').min}`;
    }
    
    if (field.hasError('max')) {
      return `Maximum ${field.getError('max').max}`;
    }
    
    return '';
  }
}
