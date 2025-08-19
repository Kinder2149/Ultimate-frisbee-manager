# Action Bar Component

Barre d'actions regroupant les boutons d'action (modifier, supprimer, étendre) pour les cartes et éléments de l'interface.

## Installation

Le composant est déjà disponible en tant que composant standalone dans le dossier `shared/components/action-bar`.

```typescript
import { ActionBarComponent } from '@app/shared/components/action-bar/action-bar.component';
```

## API

### Entrées (@Input)
- `expanded: boolean` - État d'expansion de la carte (défaut: false)

### Sorties (@Output)
- `edit: EventEmitter<void>` - Émis lorsque le bouton d'édition est cliqué
- `delete: EventEmitter<void>` - Émis lorsque le bouton de suppression est cliqué
- `toggleExpand: EventEmitter<void>` - Émis lorsque le bouton d'expansion/réduction est cliqué

## Exemple d'utilisation

```html
<app-action-bar
  [expanded]="item.expanded"
  (edit)="onEditItem(item)"
  (delete)="onDeleteItem(item)"
  (toggleExpand)="onToggleExpand(item)">
</app-action-bar>
```

## Intégration avec ActionButtonComponent

Ce composant utilise `ActionButtonComponent` pour chaque bouton d'action. Les boutons sont préconfigurés avec les icônes et les couleurs appropriées :

- Bouton d'édition : icône "edit", couleur bleue
- Bouton de suppression : icône "delete", couleur rouge
- Bouton d'expansion/réduction : icône "expand_more"/"expand_less" selon l'état, couleur grise

## Personnalisation

Pour modifier l'apparence ou le comportement des boutons, vous pouvez personnaliser le CSS du composant ou créer une version étendue selon vos besoins.
