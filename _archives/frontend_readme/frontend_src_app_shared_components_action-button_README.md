# Action Button Component

Composant réutilisable pour les boutons d'action (modification, suppression, expansion) avec une apparence cohérente et personnalisable.

## Installation

Le composant est disponible en tant que composant standalone dans le dossier `shared/components/action-button`.

```typescript
import { ActionButtonComponent } from '@app/shared/components/action-button/action-button.component';
```

## API

### Entrées (@Input)
- `icon: string` - Icône Material Design ou Font Awesome (ex: 'edit', 'trash', 'expand_more') (défaut: '')
- `iconType: 'material' | 'fontawesome'` - Type d'icône (défaut: 'material')
- `buttonColor: string` - Couleur du bouton (défaut: '#333')
- `iconColor: string` - Couleur de l'icône (défaut: '#fff')
- `tooltip: string` - Texte au survol (défaut: '')
- `disabled: boolean` - État désactivé (défaut: false)

### Sorties (@Output)
- `click: EventEmitter<MouseEvent>` - Émis lorsque le bouton est cliqué

## Exemple d'utilisation

### Bouton d'édition simple
```html
<app-action-button
  icon="edit"
  buttonColor="#2196f3"
  tooltip="Modifier"
  (click)="onEdit($event)">
</app-action-button>
```

### Bouton de suppression désactivé
```html
<app-action-button
  icon="delete"
  buttonColor="#f44336"
  iconColor="#ffffff"
  tooltip="Supprimer"
  [disabled]="!canDelete"
  (click)="onDelete($event)">
</app-action-button>
```

### Bouton avec icône Font Awesome
```html
<app-action-button
  icon="fa-heart"
  iconType="fontawesome"
  buttonColor="#e91e63"
  tooltip="Ajouter aux favoris"
  (click)="onAddToFavorites($event)">
</app-action-button>
```

## Conseils d'utilisation

- Utilisez des couleurs cohérentes pour les actions similaires dans toute l'application
- Préférez toujours un tooltip explicite pour améliorer l'accessibilité
- Pour les actions dangereuses (suppression), utilisez systématiquement la couleur rouge (#f44336)
- Pour les actions principales (édition), utilisez systématiquement la couleur bleue (#2196f3)

## Personnalisation

Le composant utilise un système de style encapsulé, mais vous pouvez surcharger certains styles en ciblant les classes CSS appropriées dans votre feuille de style globale.
