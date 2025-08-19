import { Component, Input, OnInit, forwardRef, ElementRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule, FormControl } from '@angular/forms';
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
      variablesPlus: [''],
      variablesMinus: ['']
    });
  }

  ngOnInit(): void {
    // S'assurer que les tableaux sont initialisés
    this.ensureArraysInitialized();
    
    // S'abonner aux changements pour propager les valeurs
    this.variablesForm.valueChanges.subscribe(() => {
      if (!this.disabled) {
        this.updateFormValues();
      }
    });
  }
  
  /**
   * Met à jour le formulaire à partir des tableaux de variables
   * et propage les changements au formulaire parent
   */
  private updateFormValues(): void {
    // S'assurer que les tableaux sont initialisés et nettoyés
    this.ensureArraysInitialized();
    
    // Filtrer les valeurs vides ou invalides pour garantir la cohérence des données
    const cleanVariablesPlusArray = this.variablesPlusArray
      .filter(v => v !== null && v !== undefined && v.trim && v.trim() !== '');
    
    const cleanVariablesMinusArray = this.variablesMinusArray
      .filter(v => v !== null && v !== undefined && v.trim && v.trim() !== '');
    
    // Conserver les valeurs sous forme de tableaux ET de chaînes
    const variablesPlusStr = cleanVariablesPlusArray.join('\n');
    const variablesMinusStr = cleanVariablesMinusArray.join('\n');
    
    // Mettre à jour le formulaire interne avec les chaînes (pour compatibilité)
    this.variablesForm.patchValue(
      { variablesPlus: variablesPlusStr, variablesMinus: variablesMinusStr },
      { emitEvent: false }
    );
    
    // Mettre à jour les tableaux propres
    this.variablesPlusArray = cleanVariablesPlusArray;
    this.variablesMinusArray = cleanVariablesMinusArray;
    
    // Propager les tableaux au FormGroup parent
    const valueToEmit = {
      variablesPlus: [...this.variablesPlusArray], // Envoyer une copie du tableau
      variablesMinus: [...this.variablesMinusArray] // Envoyer une copie du tableau
    };
    
    console.log('ExerciceVariablesComponent - valeurs propagées au parent:', valueToEmit);
    this.onChange(valueToEmit);
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
    console.log('ExerciceVariablesComponent - writeValue reçoit:', value);
    
    // S'assurer que les tableaux sont toujours initialisés
    this.ensureArraysInitialized();
    
    if (!value) {
      // Réinitialiser proprement en cas de valeur null/undefined
      console.log('ExerciceVariablesComponent - writeValue reçoit null/undefined, réinitialisation');
      this.variablesPlusArray = [];
      this.variablesMinusArray = [];
      
      this.variablesForm.patchValue(
        { variablesPlus: '', variablesMinus: '' },
        { emitEvent: false }
      );
      return;
    }
    
    // Traitement des variablesPlus
    if (value.variablesPlus) {
      if (Array.isArray(value.variablesPlus)) {
        // Si c'est déjà un tableau, l'utiliser directement
        this.variablesPlusArray = value.variablesPlus
          .filter(v => v !== null && v !== undefined && v.trim && v.trim() !== '')
          .map(v => typeof v === 'string' ? v : String(v));
      } else if (typeof value.variablesPlus === 'string') {
        // Si c'est une chaîne, la convertir en tableau
        this.variablesPlusArray = this.convertTextToArray(value.variablesPlus);
      }
    } else {
      this.variablesPlusArray = [];
    }
    
    // Traitement des variablesMinus
    if (value.variablesMinus) {
      if (Array.isArray(value.variablesMinus)) {
        // Si c'est déjà un tableau, l'utiliser directement
        this.variablesMinusArray = value.variablesMinus
          .filter(v => v !== null && v !== undefined && v.trim && v.trim() !== '')
          .map(v => typeof v === 'string' ? v : String(v));
      } else if (typeof value.variablesMinus === 'string') {
        // Si c'est une chaîne, la convertir en tableau
        this.variablesMinusArray = this.convertTextToArray(value.variablesMinus);
      }
    } else {
      this.variablesMinusArray = [];
    }
    
    // Convertir les tableaux en chaînes pour le formulaire interne
    const variablesPlusString = this.variablesPlusArray.join('\n');
    const variablesMinusString = this.variablesMinusArray.join('\n');
    
    // Mettre à jour le formulaire sans déclencher d'événement onChange
    this.variablesForm.patchValue(
      { variablesPlus: variablesPlusString, variablesMinus: variablesMinusString },
      { emitEvent: false }
    );
    
    // Log pour débogage
    console.log('ExerciceVariablesComponent - après writeValue:', {
      variablesPlusArray: this.variablesPlusArray,
      variablesMinusArray: this.variablesMinusArray
    });
    
    // Forcer une mise à jour du modèle pour s'assurer que les valeurs sont propagées
    this.updateFormValues();
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
