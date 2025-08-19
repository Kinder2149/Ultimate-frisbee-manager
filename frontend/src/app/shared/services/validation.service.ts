import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Service centralisé pour la validation des données
 * Fournit des validateurs réutilisables pour les formulaires
 */
@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() { }

  /**
   * Vérifie si un formulaire a des erreurs pour un contrôle donné
   * @param form Formulaire à vérifier
   * @param controlName Nom du contrôle
   * @param errorName Nom de l'erreur (optionnel)
   * @param submitted Si le formulaire a été soumis
   * @returns Vrai si le contrôle contient l'erreur spécifiée
   */
  hasError(form: FormGroup, controlName: string, errorName?: string, submitted: boolean = false): boolean {
    const control = form.get(controlName);
    
    if (!control) return false;
    
    const hasError = errorName
      ? control.hasError(errorName)
      : control.errors !== null;
    
    return (control.invalid && (control.dirty || control.touched || submitted)) && hasError;
  }

  /**
   * Retourne le message d'erreur pour un contrôle
   * @param form Formulaire contenant le contrôle
   * @param controlName Nom du contrôle
   * @param label Libellé du champ (pour le message)
   * @param submitted Si le formulaire a été soumis
   * @returns Message d'erreur ou chaîne vide
   */
  getErrorMessage(form: FormGroup, controlName: string, label: string = '', submitted: boolean = false): string {
    const control = form.get(controlName);
    
    if (!control || !control.errors || !(control.dirty || control.touched || submitted)) {
      return '';
    }
    
    const fieldName = label || controlName;
    const errors = control.errors;
    
    if (errors['required']) {
      return `Le champ ${fieldName} est obligatoire`;
    }
    
    if (errors['email']) {
      return `Format d'e-mail invalide`;
    }
    
    if (errors['minlength']) {
      return `${fieldName} doit contenir au moins ${errors['minlength'].requiredLength} caractères`;
    }
    
    if (errors['maxlength']) {
      return `${fieldName} ne peut pas dépasser ${errors['maxlength'].requiredLength} caractères`;
    }
    
    if (errors['min']) {
      return `${fieldName} doit être supérieur ou égal à ${errors['min'].min}`;
    }
    
    if (errors['max']) {
      return `${fieldName} doit être inférieur ou égal à ${errors['max'].max}`;
    }
    
    if (errors['pattern']) {
      return `Format de ${fieldName} invalide`;
    }
    
    if (errors['notUnique']) {
      return `Ce ${fieldName} existe déjà`;
    }
    
    if (errors['invalidFormat']) {
      return errors['invalidFormat'].message || `Format de ${fieldName} invalide`;
    }
    
    // Messages personnalisés pour d'autres types d'erreurs
    return `Erreur de validation pour ${fieldName}`;
  }

  /**
   * Validateur pour vérifier qu'une valeur ne se trouve pas dans une liste
   * @param values Liste des valeurs interdites
   * @param caseSensitive Si la comparaison est sensible à la casse
   * @returns Validateur
   */
  notInList(values: (string | number)[], caseSensitive: boolean = false): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Ne pas valider si vide
      }
      
      const value = caseSensitive ? control.value : control.value.toLowerCase();
      const list = caseSensitive ? values : values.map(v => String(v).toLowerCase());
      
      return list.includes(value) ? { 'inList': { value: control.value, forbidden: values } } : null;
    };
  }

  /**
   * Validateur pour vérifier qu'une valeur est unique
   * @param checkFn Fonction qui vérifie l'unicité (doit retourner un Observable<boolean>)
   * @param debounceTime Temps d'attente en ms avant de lancer la validation
   * @returns Validateur asynchrone
   */
  unique(checkFn: (value: string | number) => Promise<boolean>, debounceTime: number = 300): ValidatorFn {
    let timeout: NodeJS.Timeout | null = null;
    
    return (control: AbstractControl): Promise<ValidationErrors | null> | null => {
      if (!control.value) {
        return null; // Ne pas valider si vide
      }
      
      return new Promise(resolve => {
        // Annuler le timeout précédent
        if (timeout) {
          clearTimeout(timeout);
        }
        
        // Définir un nouveau timeout
        timeout = setTimeout(() => {
          checkFn(control.value)
            .then(isUnique => {
              resolve(isUnique ? null : { 'notUnique': true });
            })
            .catch(() => {
              resolve({ 'checkFailed': true });
            });
        }, debounceTime);
      });
    };
  }

  /**
   * Validateur pour vérifier que deux champs sont identiques
   * @param controlName Nom du premier contrôle
   * @param matchingControlName Nom du second contrôle
   * @returns Validateur
   */
  matchValues(controlName: string, matchingControlName: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const control = formGroup.get(controlName);
      const matchingControl = formGroup.get(matchingControlName);
      
      if (!control || !matchingControl || !matchingControl.value) {
        return null;
      }
      
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ 'notMatching': true });
      } else {
        // Conserver les autres erreurs potentielles
        const errors = { ...matchingControl.errors };
        delete errors['notMatching'];
        
        matchingControl.setErrors(Object.keys(errors).length ? errors : null);
      }
      
      return null;
    };
  }

  /**
   * Validateur pour vérifier qu'au moins un contrôle du groupe est rempli
   * @param controlNames Liste des noms de contrôles
   * @returns Validateur
   */
  requireAtLeastOne(controlNames: string[]): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const controls = controlNames.map(name => formGroup.get(name));
      const hasValue = controls.some(control => control && control.value);
      
      if (!hasValue) {
        return { 'requireAtLeastOne': { controls: controlNames } };
      }
      
      return null;
    };
  }

  /**
   * Validateur pour les formats de dates
   * @param format Format attendu ('YYYY-MM-DD', 'DD/MM/YYYY', etc.)
   * @returns Validateur
   */
  dateFormat(format: string = 'YYYY-MM-DD'): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      
      // Implémentation simple avec regex, à adapter selon les besoins
      let regex: RegExp;
      let message: string;
      
      switch (format) {
        case 'YYYY-MM-DD':
          regex = /^\d{4}-\d{2}-\d{2}$/;
          message = 'Format de date invalide (AAAA-MM-JJ)';
          break;
        case 'DD/MM/YYYY':
          regex = /^\d{2}\/\d{2}\/\d{4}$/;
          message = 'Format de date invalide (JJ/MM/AAAA)';
          break;
        default:
          regex = /^\d{4}-\d{2}-\d{2}$/;
          message = 'Format de date invalide';
      }
      
      if (!regex.test(control.value)) {
        return { 'invalidFormat': { value: control.value, format, message } };
      }
      
      return null;
    };
  }
}
