import { FormGroup, FormControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { ErrorDetail } from '../../core/services/notification-manager.service';

/**
 * Interface pour une erreur de validation formatée
 */
export interface FormValidationError {
  field: string;
  fieldLabel: string;
  message: string;
  errorType: string;
}

/**
 * Mapping des noms de champs vers leurs labels affichables
 */
const FIELD_LABELS: Record<string, string> = {
  nom: 'Nom',
  titre: 'Titre',
  description: 'Description',
  email: 'Email',
  password: 'Mot de passe',
  date: 'Date',
  duree: 'Durée',
  temps: 'Temps',
  materiel: 'Matériel',
  notes: 'Notes',
  critereReussite: 'Critère de réussite',
  imageUrl: 'Image',
  objectifTag: 'Objectif',
  travailSpecifiqueTags: 'Travail spécifique',
  niveauTags: 'Niveau',
  tempsTags: 'Temps',
  formatTags: 'Format',
  themeTags: 'Thème'
};

/**
 * Messages d'erreur par type de validation
 */
const ERROR_MESSAGES: Record<string, (params?: any) => string> = {
  required: () => 'Ce champ est obligatoire',
  email: () => 'Format d\'email invalide',
  minlength: (params) => `Minimum ${params?.requiredLength} caractères requis`,
  maxlength: (params) => `Maximum ${params?.requiredLength} caractères autorisés`,
  min: (params) => `La valeur minimale est ${params?.min}`,
  max: (params) => `La valeur maximale est ${params?.max}`,
  pattern: () => 'Format invalide',
  url: () => 'URL invalide'
};

/**
 * Obtient le label d'un champ
 */
function getFieldLabel(fieldName: string): string {
  return FIELD_LABELS[fieldName] || fieldName;
}

/**
 * Formate un message d'erreur selon le type de validation
 */
function formatErrorMessage(errorType: string, errorParams?: any): string {
  const formatter = ERROR_MESSAGES[errorType];
  return formatter ? formatter(errorParams) : `Erreur de validation: ${errorType}`;
}

/**
 * Extrait toutes les erreurs d'un FormControl
 */
function getControlErrors(
  controlName: string,
  control: AbstractControl
): FormValidationError[] {
  const errors: FormValidationError[] = [];
  
  if (control.errors) {
    Object.keys(control.errors).forEach(errorType => {
      errors.push({
        field: controlName,
        fieldLabel: getFieldLabel(controlName),
        message: formatErrorMessage(errorType, control.errors![errorType]),
        errorType
      });
    });
  }
  
  return errors;
}

/**
 * Extrait récursivement toutes les erreurs d'un FormGroup
 */
function extractFormGroupErrors(
  formGroup: FormGroup,
  parentPath: string = ''
): FormValidationError[] {
  const errors: FormValidationError[] = [];
  
  Object.keys(formGroup.controls).forEach(key => {
    const control = formGroup.get(key);
    const fullPath = parentPath ? `${parentPath}.${key}` : key;
    
    if (control instanceof FormGroup) {
      // Récursion pour les FormGroup imbriqués
      errors.push(...extractFormGroupErrors(control, fullPath));
    } else if (control) {
      // Extraire les erreurs du control
      errors.push(...getControlErrors(fullPath, control));
    }
  });
  
  return errors;
}

/**
 * Obtient toutes les erreurs de validation d'un formulaire
 * @param form Le FormGroup à valider
 * @returns Liste des erreurs formatées
 */
export function getFormErrors(form: FormGroup): FormValidationError[] {
  if (!form || form.valid) {
    return [];
  }
  
  return extractFormGroupErrors(form);
}

/**
 * Convertit les erreurs de formulaire en ErrorDetail pour le NotificationManager
 * @param formErrors Liste des erreurs de formulaire
 * @returns Liste des ErrorDetail
 */
export function formErrorsToErrorDetails(formErrors: FormValidationError[]): ErrorDetail[] {
  return formErrors.map(error => ({
    field: error.fieldLabel,
    message: error.message,
    code: error.errorType
  }));
}

/**
 * Obtient un message d'erreur résumé pour un formulaire
 * @param form Le FormGroup à valider
 * @returns Message résumé des erreurs
 */
export function getFormErrorSummary(form: FormGroup): string {
  const errors = getFormErrors(form);
  
  if (errors.length === 0) {
    return '';
  }
  
  if (errors.length === 1) {
    return `${errors[0].fieldLabel}: ${errors[0].message}`;
  }
  
  const fieldNames = errors.map(e => e.fieldLabel).join(', ');
  return `Champs invalides: ${fieldNames}`;
}

/**
 * Marque tous les champs d'un formulaire comme touchés
 * Utile pour afficher toutes les erreurs lors de la soumission
 * @param form Le FormGroup à marquer
 */
export function markFormGroupTouched(form: FormGroup): void {
  Object.keys(form.controls).forEach(key => {
    const control = form.get(key);
    
    if (control instanceof FormGroup) {
      markFormGroupTouched(control);
    } else if (control) {
      control.markAsTouched();
      control.updateValueAndValidity();
    }
  });
}

/**
 * Vérifie si un formulaire a des erreurs et les affiche
 * @param form Le FormGroup à valider
 * @returns true si le formulaire est valide, false sinon
 */
export function validateForm(form: FormGroup): boolean {
  if (form.valid) {
    return true;
  }
  
  // Marquer tous les champs comme touchés pour afficher les erreurs
  markFormGroupTouched(form);
  
  return false;
}

/**
 * Obtient le message d'erreur pour un champ spécifique
 * @param form Le FormGroup
 * @param fieldName Le nom du champ
 * @returns Le message d'erreur ou null
 */
export function getFieldError(form: FormGroup, fieldName: string): string | null {
  const control = form.get(fieldName);
  
  if (!control || !control.errors || !control.touched) {
    return null;
  }
  
  const errorType = Object.keys(control.errors)[0];
  return formatErrorMessage(errorType, control.errors[errorType]);
}

/**
 * Vérifie si un champ a une erreur
 * @param form Le FormGroup
 * @param fieldName Le nom du champ
 * @returns true si le champ a une erreur
 */
export function hasFieldError(form: FormGroup, fieldName: string): boolean {
  const control = form.get(fieldName);
  return !!(control && control.invalid && control.touched);
}
