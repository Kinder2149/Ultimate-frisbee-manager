import { Component, Input, OnInit, forwardRef, ElementRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule, FormControl, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

/**
 * Interface représentant les variables d'un exercice
 */
export interface ExerciceVariables {
  /** Variables qui augmentent la difficulté (+) */
  variablesPlus?: string | string[];
  /** Variables qui diminuent la difficulté (-) */
  variablesMinus?: string | string[];
}

/**
 * Composant réutilisable pour la gestion des variables d'exercice
 * Permet de saisir et d'afficher les variables de difficulté (+ et -) d'un exercice
 */
@Component({
  selector: 'app-exercice-variables',
  templateUrl: './exercice-variables.component.html',
  styleUrls: ['./exercice-variables.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ExerciceVariablesComponent),
      multi: true
    }
  ]
})
export class ExerciceVariablesComponent implements OnInit, ControlValueAccessor {
  /** Mode d'affichage : 'edit' (formulaire) ou 'view' (lecture seule) */
  @Input() mode: 'edit' | 'view' = 'edit';
  
  /** Formulaire pour la gestion des variables */
  variablesForm: FormGroup;
  
  /** Variables sous forme de tableaux pour les chips */
  variablesPlusArray: string[] = [];
  variablesMinusArray: string[] = [];
  
  // Assurer que ces tableaux ne sont jamais undefined
  private ensureArraysInitialized(): void {
    if (!this.variablesPlusArray) this.variablesPlusArray = [];
    if (!this.variablesMinusArray) this.variablesMinusArray = [];
  }
  
  /** Contrôle de saisie pour les nouvelles variables */
  newVariablePlusCtrl = new FormControl('');
  newVariableMinusCtrl = new FormControl('');
  
  /** Références pour les champs de saisie */
  @ViewChild('variablePlusInput') variablePlusInput!: ElementRef<HTMLInputElement>;
  @ViewChild('variableMinusInput') variableMinusInput!: ElementRef<HTMLInputElement>;
  
  /** Touches pour ajouter une variable (Enter et virgule) */
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  
  /** Indicateur de désactivation du composant */
  disabled = false;

  /** Fonction appelée lors d'un changement de valeur */
  onChange: (value: ExerciceVariables) => void = () => {};
  
  /** Fonction appelée lors d'un toucher du champ */
  onTouched: () => void = () => {};

  constructor(private fb: FormBuilder) {
    this.variablesForm = this.fb.group({
      variablesPlus: this.fb.array([]),
      variablesMinus: this.fb.array([])
    });
  }

  ngOnInit(): void {
    // S'assurer que les tableaux sont initialisés
    this.ensureArraysInitialized();
    // La souscription à valueChanges a été supprimée car elle est redondante
    // et peut causer des effets de bord. La mise à jour est gérée par les
    // actions utilisateur (add/remove) et writeValue.
  }
  
  /**
   * Met à jour le formulaire à partir des tableaux de variables
   * et propage les changements au formulaire parent
   */
  private updateFormValues(propagateChange = true): void {
    // S'assurer que les tableaux sont initialisés et nettoyés
    this.ensureArraysInitialized();
    
    // Filtrer les valeurs vides ou invalides pour garantir la cohérence des données
    const cleanVariablesPlusArray = this.variablesPlusArray
      .filter(v => v !== null && v !== undefined && v.trim && v.trim() !== '');
    
    const cleanVariablesMinusArray = this.variablesMinusArray
      .filter(v => v !== null && v !== undefined && v.trim && v.trim() !== '');
    
    // Mettre à jour les tableaux du formulaire
    const variablesPlusArray = this.variablesForm.get('variablesPlus') as FormArray;
    const variablesMinusArray = this.variablesForm.get('variablesMinus') as FormArray;
    
    // Vider les tableaux existants
    while (variablesPlusArray.length) variablesPlusArray.removeAt(0);
    while (variablesMinusArray.length) variablesMinusArray.removeAt(0);
    
    // Ajouter les nouvelles valeurs
    cleanVariablesPlusArray.forEach(variable => 
      variablesPlusArray.push(this.fb.control(variable))
    );
    
    cleanVariablesMinusArray.forEach(variable => 
      variablesMinusArray.push(this.fb.control(variable))
    );
    
    // Mettre à jour les tableaux propres
    this.variablesPlusArray = cleanVariablesPlusArray;
    this.variablesMinusArray = cleanVariablesMinusArray;
    
    // Propager les tableaux au FormGroup parent
    const valueToEmit = {
      variablesPlus: [...this.variablesPlusArray],
      variablesMinus: [...this.variablesMinusArray]
    };
    
    if (propagateChange) {
      this.onChange(valueToEmit);
    }
    this.onTouched();
  }
  
  /**
   * Ajoute une variable à la liste des variables plus
   * @param event Événement de saisie de chip
   */
  addVariablePlus(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.variablesPlusArray.push(value);
      this.updateFormValues();
    }
    
    // Réinitialiser le champ
    event.chipInput!.clear();
    this.newVariablePlusCtrl.setValue('');
  }
  
  /**
   * Ajoute une variable à la liste des variables moins
   * @param event Événement de saisie de chip
   */
  addVariableMinus(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.variablesMinusArray.push(value);
      this.updateFormValues();
    }
    
    // Réinitialiser le champ
    event.chipInput!.clear();
    this.newVariableMinusCtrl.setValue('');
  }
  
  /**
   * Supprime une variable de la liste des variables plus
   * @param variable La variable à supprimer
   */
  removeVariablePlus(variable: string): void {
    const index = this.variablesPlusArray.indexOf(variable);
    if (index >= 0) {
      this.variablesPlusArray.splice(index, 1);
      this.updateFormValues();
    }
  }
  
  /**
   * Supprime une variable de la liste des variables moins
   * @param variable La variable à supprimer
   */
  removeVariableMinus(variable: string): void {
    const index = this.variablesMinusArray.indexOf(variable);
    if (index >= 0) {
      this.variablesMinusArray.splice(index, 1);
      this.updateFormValues();
    }
  }

  /**
   * Écrit une nouvelle valeur dans le composant (appelé par Angular)
   * @param value Les nouvelles valeurs à afficher
   */
  writeValue(value: ExerciceVariables | null): void {
    // Cette méthode reçoit la valeur du formulaire parent.
    // Elle doit mettre à jour l'état interne du composant SANS notifier le parent en retour.
    if (value) {
      this.variablesPlusArray = Array.isArray(value.variablesPlus) ? [...value.variablesPlus] : [];
      this.variablesMinusArray = Array.isArray(value.variablesMinus) ? [...value.variablesMinus] : [];
    } else {
      this.variablesPlusArray = [];
      this.variablesMinusArray = [];
    }

    // Mettre à jour les FormArray internes sans propager le changement vers le parent.
    // C'est crucial pour éviter une boucle infinie.
    this.updateFormValues(false);
  }
  
  /**
   * Convertit un texte séparé par des sauts de ligne en tableau
   * @param text Texte à convertir
   * @returns Tableau de chaînes
   */
  private convertTextToArray(text: string): string[] {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line !== '');
  }

  /**
   * Enregistre la fonction de callback pour les changements (appelé par Angular)
   * @param fn La fonction de callback
   */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  /**
   * Enregistre la fonction de callback pour les touches (appelé par Angular)
   * @param fn La fonction de callback
   */
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  /**
   * Change l'état de désactivation du composant (appelé par Angular)
   * @param isDisabled État de désactivation
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    
    if (isDisabled) {
      this.variablesForm.disable();
      this.newVariablePlusCtrl.disable();
      this.newVariableMinusCtrl.disable();
    } else {
      this.variablesForm.enable();
      this.newVariablePlusCtrl.enable();
      this.newVariableMinusCtrl.enable();
    }
  }
  
  /**
   * Migre les anciennes variables au format texte vers le nouveau format
   * @param oldVariablesText Le texte des anciennes variables
   */
  migrateOldVariables(oldVariablesText: string | undefined): void {
    if (!oldVariablesText) return;
    
    const lines = oldVariablesText.split('\n');
    const plusVariables: string[] = [];
    const minusVariables: string[] = [];
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('+')) {
        plusVariables.push(trimmedLine.substring(1).trim());
      } else if (trimmedLine.startsWith('-')) {
        minusVariables.push(trimmedLine.substring(1).trim());
      } else if (trimmedLine) {
        // Si pas de préfixe, on le considère comme '+'
        plusVariables.push(trimmedLine);
      }
    });
    
    // Mettre à jour les tableaux et le formulaire
    this.variablesPlusArray = plusVariables;
    this.variablesMinusArray = minusVariables;
    this.updateFormValues();
  }

  /**
   * Convertit les variables au format ancien pour la rétrocompatibilité
   * @returns Le texte des variables au format ancien
   */
  getOldFormatVariables(): string {
    const plusLines = this.variablesPlusArray
      .map(variable => `+ ${variable.trim()}`); 
        
    const minusLines = this.variablesMinusArray
      .map(variable => `- ${variable.trim()}`);
    
    return [...plusLines, ...minusLines].join('\n');
  }
}
