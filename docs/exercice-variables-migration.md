# Migration des variables d'exercices

## Contexte

L'application Ultimate Frisbee Manager a évolué dans sa gestion des variables d'exercices. Initialement, les variables étaient stockées sous forme de texte brut dans un champ unique `variablesText` avec un préfixe pour distinguer les variables qui augmentent (`+`) ou diminuent (`-`) la difficulté.

Le nouveau système utilise deux champs distincts :
- `variablesPlus` : variables qui augmentent la difficulté
- `variablesMinus` : variables qui diminuent la difficulté

Cette documentation explique comment la migration a été réalisée et comment le système gère la compatibilité entre les formats.

## Architecture de la solution

### Modèle de données

#### Côté backend (Prisma)

```prisma
model Exercice {
  // ... autres champs
  variablesText String? // Ancienne version (à migrer et supprimer ultérieurement)
  variablesPlus String?  // Variables qui augmentent la difficulté (+)
  variablesMinus String? // Variables qui diminuent la difficulté (-)
}
```

#### Côté frontend (Angular)

```typescript
export interface Exercice {
  // ... autres champs
  variablesText?: string;
  variablesPlus?: string | string[];
  variablesMinus?: string | string[];
}
```

### Conversion des formats

#### Backend → Frontend

1. Le contrôleur backend stocke les variables sous forme de chaînes de caractères dans la base de données (séparées par des sauts de ligne)
2. Lors de la réponse HTTP, le contrôleur convertit ces chaînes en tableaux pour le frontend :
   ```javascript
   const clientResponse = {
     ...exercice,
     variablesPlus: exercice.variablesPlus ? 
       exercice.variablesPlus.split('\n').filter(v => v.trim() !== '') : 
       [],
     variablesMinus: exercice.variablesMinus ? 
       exercice.variablesMinus.split('\n').filter(v => v.trim() !== '') : 
       []
   };
   ```

#### Frontend → Backend

1. Le frontend manipule les variables sous forme de tableaux (`string[]`) dans le composant `ExerciceVariablesComponent` (chips)
2. Le service `ExerciceService` accepte à la fois des chaînes et des tableaux
3. Le contrôleur backend (`processExerciceVariables`) convertit tout en chaînes pour le stockage :
   ```javascript
   if (Array.isArray(variablesPlus)) {
     variablesPlusString = variablesPlus
       .filter(v => v !== null && v !== undefined && v.trim() !== '')
       .join('\n');
   }
   ```

## Rétrocompatibilité

### Migration automatique

Le contrôleur backend inclut une logique de migration automatique pour les anciennes données :

```javascript
// Si nous avons du texte dans l'ancien format mais pas dans le nouveau, migrer
if (variablesText && (!variablesPlusString && !variablesMinusString)) {
  console.log('Migration des variables depuis l\'ancien format');
  
  const lines = variablesText.split('\n');
  const plusVariables = [];
  const minusVariables = [];
  
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
  
  // Mettre à jour les variables au nouveau format
  result.variablesPlus = plusVariables.join('\n');
  result.variablesMinus = minusVariables.join('\n');
}
```

### Ancien format → Nouveau format

Le composant frontend `ExerciceVariablesComponent` peut migrer les données de l'ancien format :

```typescript
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
```

### Nouveau format → Ancien format

Le composant frontend peut également convertir les données au format ancien pour la rétrocompatibilité :

```typescript
getOldFormatVariables(): string {
  const plusLines = this.variablesPlusArray
    .map(variable => `+ ${variable.trim()}`); 
      
  const minusLines = this.variablesMinusArray
    .map(variable => `- ${variable.trim()}`);
  
  return [...plusLines, ...minusLines].join('\n');
}
```

## Bonnes pratiques

1. **Validation des données** : Les tableaux sont toujours filtrés pour éviter les valeurs vides ou null
2. **Logging détaillé** : Des journaux sont produits à chaque étape pour faciliter le débogage
3. **Gestion robuste des types** : Le frontend et le backend acceptent les deux formats
4. **Absence de rupture** : Les anciens exercices restent fonctionnels sans migration manuelle

## Évolutions futures

Pour finaliser la migration :

1. Envisager une migration complète de la base de données pour les anciennes données (convertir `variablesText` en `variablesPlus`/`variablesMinus`)
2. Une fois la migration terminée, supprimer le champ `variablesText` du modèle Prisma
3. Simplifier l'interface frontend pour ne plus gérer l'ancien format
