# Alert Component

Composant pour afficher des alertes et notifications avec animations et personnalisation avancée.

## Installation

Le composant est disponible en tant que composant standalone dans le dossier `shared/components/alert`.

```typescript
import { AlertComponent } from '@app/shared/components/alert/alert.component';
```

## API

### Types d'alertes
```typescript
export type AlertType = 'info' | 'success' | 'warning' | 'error';
```

- `info` (bleu) - Informations générales
- `success` (vert) - Confirmation d'opération réussie
- `warning` (orange) - Avertissement ou attention requise
- `error` (rouge) - Erreur ou problème

### Entrées (@Input)
- `type: AlertType` - Type d'alerte (défaut: 'info')
- `title: string` - Titre de l'alerte (défaut: '')
- `message: string` - Message principal de l'alerte (défaut: '')
- `dismissible: boolean` - Si l'alerte peut être fermée (défaut: true)
- `autoClose: boolean` - Si l'alerte disparaît automatiquement (défaut: false)
- `autoCloseDelay: number` - Délai avant fermeture automatique en ms (défaut: 5000)
- `visible: boolean` - Si l'alerte est visible (défaut: true)
- `solid: boolean` - Si l'alerte a un fond plein (défaut: false)
- `bordered: boolean` - Si l'alerte a une bordure (défaut: true)
- `showIcon: boolean` - Si l'alerte a une icône (défaut: true)
- `additionalClasses: string` - Classes CSS supplémentaires (défaut: '')

### Sorties (@Output)
- `closed: EventEmitter<void>` - Émis lorsque l'alerte est fermée

## Exemples d'utilisation

### Alerte simple d'information
```html
<app-alert 
  message="Un nouveau message est disponible.">
</app-alert>
```

### Alerte de succès avec titre et fermeture automatique
```html
<app-alert 
  type="success" 
  title="Succès" 
  message="L'opération a été effectuée avec succès !"
  [autoClose]="true"
  [autoCloseDelay]="5000">
</app-alert>
```

### Alerte d'erreur en fond plein
```html
<app-alert 
  type="error" 
  title="Erreur" 
  message="Une erreur est survenue lors du traitement de votre demande."
  [solid]="true">
</app-alert>
```

### Alerte d'avertissement non fermable
```html
<app-alert 
  type="warning" 
  message="Cette action est irréversible."
  [dismissible]="false">
</app-alert>
```

## Contrôle programmatique

Vous pouvez contrôler l'affichage de l'alerte par programmation :

```typescript
@ViewChild(AlertComponent) alert: AlertComponent;

// Afficher l'alerte
this.alert.visible = true;

// Masquer l'alerte
this.alert.visible = false;

// Fermer l'alerte (émet également l'événement closed)
this.alert.close();
```

## Animations

Le composant inclut des animations de transition fluides :
- Apparition avec translation vers le bas (300ms)
- Disparition avec fondu (200ms)

Ces animations sont configurées via Angular Animations et sont actives par défaut.
