import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Tag, TagCategory } from '../../../../core/models/tag.model';
import { DEFAULT_TAG_COLORS, NIVEAU_LABELS } from '../../constants/tag.constants';
import { TAG_CATEGORIES } from '@ufm/shared/constants/tag-categories';
import { TagService } from '../../../../core/services/tag.service';

/**
 * Composant de formulaire pour la création ou la modification d'un tag
 */
@Component({
  selector: 'app-tag-form',
  templateUrl: './tag-form.component.html',
  styleUrls: ['./tag-form.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule]
})
export class TagFormComponent implements OnInit, OnChanges {

  getCategoryDisplayName(category: string): string {
    return category.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  }

    @Input() category: TagCategory = 'objectif';
  @Input() editTag: Tag | null = null;
  @Output() tagSaved = new EventEmitter<Tag>();
  @Output() cancel = new EventEmitter<void>();

  tagForm: FormGroup = this.formBuilder.group({
    label: ['', [Validators.required, this.conditionalLabelLengthValidator()]],
    category: ['', Validators.required],
    color: [''],
    level: [null]
  });

  // Référence aux énums pour le template
      niveauLabels = NIVEAU_LABELS;
  tagCategories = TAG_CATEGORIES;
  
  // Messages d'erreur
  errorMessage: string = '';
  
  // Liste des niveaux pour la sélection
  niveaux = [1, 2, 3, 4, 5];

  constructor(
    private formBuilder: FormBuilder,
    private tagService: TagService
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Si le tag à éditer change, réinitialiser le formulaire
    if (changes['editTag'] && this.tagForm) {
      this.initForm();
    }
    
    // Si la catégorie change et qu'il n'y a pas de tag à éditer, mettre à jour la catégorie dans le form
    if (changes['category'] && !this.editTag && this.tagForm) {
      this.tagForm.patchValue({
        category: this.category,
        color: DEFAULT_TAG_COLORS[this.category]
      });
      
      // Gérer la validation du level pour la catégorie niveau
      this.updateLevelValidation();
    }
  }

  /**
   * Initialise le formulaire avec les valeurs par défaut ou celles du tag à éditer
   */
  initForm(): void {
    if (this.editTag) {
      // Mode édition
      this.tagForm.patchValue({
        label: this.editTag.label,
        category: this.editTag.category,
        color: this.editTag.color || DEFAULT_TAG_COLORS[this.editTag.category],
        level: this.editTag.level || null
      });
      
      // Désactiver le champ de catégorie en mode édition
      this.tagForm.get('category')?.disable();
    } else {
      // Mode création
      this.tagForm.patchValue({
        label: '',
        category: this.category,
        color: DEFAULT_TAG_COLORS[this.category],
                level: this.category === 'niveau' ? 1 : null
      });
      
      this.tagForm.get('category')?.enable();
    }
    
    // Mettre à jour la validation du level
    this.updateLevelValidation();
  }

  /**
   * Met à jour la validation du champ level en fonction de la catégorie
   * Le champ level est obligatoire pour la catégorie "niveau"
   */
  updateLevelValidation(): void {
    const levelControl = this.tagForm.get('level');
    const categoryControl = this.tagForm.get('category');
    
    if (!levelControl || !categoryControl) return;
    
    const category = categoryControl.value;
    
        if (category === 'niveau') {
      // Pour la catégorie niveau, le level est obligatoire (1-5)
      levelControl.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(5)
      ]);
      
      // Si pas de valeur, mettre 1 par défaut
      if (!levelControl.value) {
        levelControl.setValue(1);
      }
    } else {
      // Pour les autres catégories, pas de validation level
      levelControl.clearValidators();
      levelControl.setValue(null);
    }
    
    levelControl.updateValueAndValidity();
  }

  /**
   * Gère le changement de catégorie
   */
  onCategoryChange(): void {
    const categoryValue = this.tagForm.get('category')?.value;
    if (categoryValue) {
      // Mettre à jour la couleur par défaut
      this.tagForm.patchValue({
        color: DEFAULT_TAG_COLORS[categoryValue as string]
      });
      
      // Mettre à jour la validation du level
      this.updateLevelValidation();
    }
  }

  /**
   * Soumet le formulaire pour créer ou mettre à jour un tag
   */
  onSubmit(): void {
    if (this.tagForm.invalid) {
      return;
    }
    
    const formValue = this.tagForm.getRawValue(); // getRawValue pour inclure les champs désactivés
    
    // Préparer les données du tag
    const tagData: Tag = {
      label: formValue.label,
      category: formValue.category,
      color: formValue.color || DEFAULT_TAG_COLORS[formValue.category as string],
      // Inclure le level si c'est un tag de niveau
              level: formValue.category === 'niveau' ? formValue.level : undefined
    };
    
    // Ajouter ou mettre à jour le tag
    if (this.editTag && this.editTag.id) {
      // Mode édition
      this.tagService.updateTag(this.editTag.id, tagData).subscribe({
        next: (updatedTag) => {
          this.tagSaved.emit(updatedTag);
          this.resetForm();
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour du tag:', err);
          this.handleError(err);
        }
      });
    } else {
      // Mode création
      this.tagService.createTag(tagData).subscribe({
        next: (newTag) => {
          this.tagSaved.emit(newTag);
          this.resetForm();
        },
        error: (err) => {
          console.error('Erreur lors de la création du tag:', err);
          this.handleError(err);
        }
      });
    }
  }

  /**
   * Gère les erreurs de l'API
   */
  handleError(err: any): void {
    if (err.status === 409) {
      this.errorMessage = 'Ce tag existe déjà dans cette catégorie.';
    } else {
      this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
    }
  }

  /**
   * Réinitialise le formulaire
   */
  resetForm(): void {
    this.errorMessage = '';
    this.initForm();
  }

  /**
   * Annule l'édition du tag
   */
  cancelEdit(): void {
    this.cancel.emit();
    this.resetForm();
  }
  
  /**
   * Validateur personnalisé pour la longueur minimale du label en fonction de la catégorie
   * Accepte 1 caractère minimum pour les tags de niveau, 2 caractères minimum pour les autres
   */
  conditionalLabelLengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Laissez Validators.required s'occuper des valeurs vides
      }
      
      const categoryControl = this.tagForm?.get('category');
      if (!categoryControl) return null;
      
            const isNiveau = categoryControl.value === 'niveau';
      const minLength = isNiveau ? 1 : 2;
      
      return control.value.length < minLength
        ? { minlength: { requiredLength: minLength, actualLength: control.value.length } }
        : null;
    };
  }
}