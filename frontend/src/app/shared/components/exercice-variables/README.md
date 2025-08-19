# Composant Exercice Variables

Ce composant réutilisable permet de gérer les variables d'exercice de manière standardisée dans toute l'application Ultimate Frisbee Manager.

## Fonctionnalités

- Support de deux types de variables :
  - **Variables (+)** : pour augmenter la difficulté de l'exercice
  - **Variables (-)** : pour diminuer la difficulté de l'exercice
- Modes d'affichage :
  - `edit` : pour la saisie/modification des variables (formulaires)
  - `view` : pour l'affichage formaté des variables (vue détaillée)
- Implémente `ControlValueAccessor` pour une intégration facile avec les formulaires réactifs
- Fonctionnalité de migration automatique depuis l'ancien format de variables

## Installation

Le composant est autonome (`standalone`) et inclut tous ses imports nécessaires.

## Utilisation

### Dans un formulaire (ReactiveFormsModule)

```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExerciceVariablesComponent } from 'path/to/exercice-variables.component';

@Component({
  selector: 'app-my-form',
  template: `
    <form [formGroup]="exerciceForm">
      <!-- Autres champs du formulaire -->
      <app-exercice-variables 
        formControlName="variables"
        mode="edit">
      </app-exercice-variables>
      <!-- Boutons et autres éléments -->
    </form>
  `,
  imports: [
    // Autres imports...
    ExerciceVariablesComponent
  ]
})
export class MyFormComponent implements OnInit {
  exerciceForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.exerciceForm = this.fb.group({
      // Autres contrôles...
      variables: this.fb.group({
        variablesPlus: [[]],  // Tableau vide pour les chips
        variablesMinus: [[]]  // Tableau vide pour les chips
      })
    });
  }

  // Reste du composant...
}
```

### En mode affichage

```typescript
import { Component, Input } from '@angular/core';
import { ExerciceVariablesComponent } from 'path/to/exercice-variables.component';
import { Exercice } from 'path/to/exercice.model';

@Component({
  selector: 'app-exercice-detail',
  template: `
    <div class="exercice-detail">
      <!-- Autres informations de l'exercice -->
      
      <h3>Variables de l'exercice</h3>
      <app-exercice-variables 
        [value]="{ 
          variablesPlus: exercice.variablesPlus, 
          variablesMinus: exercice.variablesMinus 
        }"
        mode="view">
      </app-exercice-variables>
    </div>
  `,
  imports: [
    // Autres imports...
    ExerciceVariablesComponent
  ]
})
export class ExerciceDetailComponent {
  @Input() exercice: Exercice;
}
```

### Migration depuis l'ancien format

Pour migrer depuis l'ancien format de variables (avec préfixes + et -), utilisez la méthode `migrateOldVariables` :

```typescript
// Dans un composant parent
@ViewChild(ExerciceVariablesComponent) variablesComponent: ExerciceVariablesComponent;

ngAfterViewInit() {
  // Si l'exercice utilise l'ancien format
  if (this.exercice.variablesText && !this.exercice.variablesPlus && !this.exercice.variablesMinus) {
    this.variablesComponent.migrateOldVariables(this.exercice.variablesText);
  }
}
```

## API

### Inputs

| Nom    | Type               | Défaut   | Description                                   |
|--------|-------------------|---------|-----------------------------------------------|
| `mode` | `'edit' \| 'view'` | `'edit'` | Mode d'affichage du composant                 |
| `value`| `ExerciceVariables` | `undefined` | Valeurs à afficher (en dehors d'un formulaire) |

### Interface ExerciceVariables

```typescript
export interface ExerciceVariables {
  variablesPlus?: string | string[];
  variablesMinus?: string | string[];
}
```

**Note**: Depuis la mise à jour du composant, les variables sont désormais gérées sous forme de tableaux (`string[]`), ce qui permet une manipulation plus flexible de chaque variable individuelle via les chips Angular Material. Le composant reste compatible avec les anciens formats (chaîne de caractères) pour assurer la rétrocompatibilité.

### Méthodes publiques

| Nom                  | Paramètres                | Retour    | Description                                           |
|---------------------|--------------------------|----------|-------------------------------------------------------|
| `migrateOldVariables` | `oldVariablesText: string` | `void`    | Convertit les anciennes variables vers le nouveau format |
| `getOldFormatVariables` | -                        | `string`  | Récupère les variables au format ancien (avec préfixes) |
