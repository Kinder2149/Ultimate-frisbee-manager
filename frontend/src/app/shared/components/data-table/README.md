# Data Table Component

Table de données avancée avec pagination, tri, filtrage et actions personnalisables pour présenter des données tabulaires de manière cohérente dans l'application.

## Installation

Le composant est disponible en tant que composant standalone dans le dossier `shared/components/data-table`.

```typescript
import { DataTableComponent } from '@app/shared/components/data-table/data-table.component';
```

## Modèles de configuration

### Configuration des colonnes
```typescript
interface ColumnConfig {
  key: string;         // Clé correspondant à la propriété de l'objet data
  header: string;      // Texte d'en-tête de colonne
  type?: 'text' | 'date' | 'number' | 'boolean' | 'custom'; // Type de données (défaut: 'text')
  sortable?: boolean;  // Si la colonne est triable (défaut: true)
  width?: string;      // Largeur de la colonne (ex: '100px', '10%')
  tooltip?: boolean;   // Afficher le contenu comme tooltip (défaut: false)
  pipe?: PipeTransform; // Pipe Angular à appliquer aux valeurs
  format?: string;     // Format pour les dates ou nombres (ex: 'dd/MM/yyyy')
  align?: 'left' | 'center' | 'right'; // Alignement du texte (défaut: 'left')
  hidden?: boolean;    // Si la colonne est masquée (défaut: false)
}
```

### Configuration de pagination
```typescript
interface PaginationConfig {
  currentPage: number;      // Page actuelle
  pageSize: number;         // Nombre d'éléments par page
  totalItems: number;       // Nombre total d'éléments
  pageSizeOptions?: number[]; // Options de taille de page (défaut: [5, 10, 25, 50])
}
```

### Configuration de tri
```typescript
interface SortConfig {
  column: string;           // Colonne de tri
  direction: 'asc' | 'desc'; // Direction de tri
}
```

### Événement de page
```typescript
interface PageEvent {
  pageIndex: number;  // Index de la page
  pageSize: number;   // Taille de la page
  previousPageIndex?: number; // Index de la page précédente
}
```

### Événement de tri
```typescript
interface SortEvent {
  column: string;           // Colonne triée
  direction: 'asc' | 'desc'; // Direction de tri
}
```

## API

### Entrées (@Input)
- `data: any[]` - Données à afficher dans la table
- `columns: ColumnConfig[]` - Configuration des colonnes
- `pagination?: PaginationConfig` - Configuration de pagination
- `sort?: SortConfig` - Configuration du tri
- `sortable: boolean` - Si le tableau peut être trié (défaut: true)
- `bordered: boolean` - Si le tableau a des bordures (défaut: true)
- `striped: boolean` - Si le tableau a des lignes colorées alternativement (défaut: true)
- `hover: boolean` - Si le tableau a un survol des lignes (défaut: true)
- `dense: boolean` - Si le tableau est compact (défaut: false)
- `noDataMessage: string` - Message à afficher si aucune donnée n'est disponible (défaut: 'Aucune donnée disponible')
- `additionalClasses: string` - Classes CSS supplémentaires pour la table

### Sorties (@Output)
- `pageChange: EventEmitter<PageEvent>` - Émis lors du changement de page
- `sortChange: EventEmitter<SortEvent>` - Émis lors du changement de tri
- `rowClick: EventEmitter<any>` - Émis lors du clic sur une ligne
- `action: EventEmitter<{ type: string; row: any }>` - Émis lors du clic sur une action

## Exemples d'utilisation

### Configuration basique
```typescript
// Dans le composant
const columns: ColumnConfig[] = [
  { key: 'id', header: 'ID', sortable: true },
  { key: 'name', header: 'Nom', sortable: true },
  { key: 'date', header: 'Date', type: 'date', format: 'dd/MM/yyyy', sortable: true },
  { key: 'status', header: 'Statut', type: 'custom' }
];

const pagination: PaginationConfig = {
  currentPage: 1,
  pageSize: 10,
  totalItems: items.length,
  pageSizeOptions: [5, 10, 25, 50]
};
```

```html
<app-data-table
  [data]="items"
  [columns]="columns"
  [pagination]="pagination"
  (pageChange)="onPageChange($event)"
  (sortChange)="onSortChange($event)"
  (rowClick)="onRowClick($event)">
  
  <!-- Template personnalisé pour les cellules de type 'custom' -->
  <ng-template #customTemplate let-value let-row="row" let-column="column">
    <ng-container *ngIf="column.key === 'status'">
      <app-status-badge [status]="value"></app-status-badge>
    </ng-container>
  </ng-template>
</app-data-table>
```

### Avec actions personnalisées
```html
<app-data-table
  [data]="exercises"
  [columns]="columns"
  [pagination]="pagination"
  (action)="onAction($event)">
  
  <!-- Template pour la colonne d'actions -->
  <ng-template #actionsTemplate let-row>
    <button mat-icon-button (click)="onAction({type: 'edit', row: row})">
      <mat-icon>edit</mat-icon>
    </button>
    <button mat-icon-button (click)="onAction({type: 'delete', row: row})">
      <mat-icon>delete</mat-icon>
    </button>
  </ng-template>
</app-data-table>
```

### Traitement des événements
```typescript
onPageChange(event: PageEvent) {
  // Mettre à jour la pagination
  this.pagination = {
    ...this.pagination,
    currentPage: event.pageIndex + 1,
    pageSize: event.pageSize
  };
  
  // Charger les données de la nouvelle page
  this.loadData();
}

onSortChange(event: SortEvent) {
  // Mettre à jour le tri
  this.sort = {
    column: event.column,
    direction: event.direction
  };
  
  // Recharger les données triées
  this.loadData();
}

onRowClick(row: any) {
  // Traiter le clic sur une ligne
  console.log('Ligne cliquée:', row);
}

onAction(event: { type: string; row: any }) {
  // Traiter l'action
  switch (event.type) {
    case 'edit':
      this.editItem(event.row);
      break;
    case 'delete':
      this.deleteItem(event.row);
      break;
  }
}
```

## Bonnes pratiques

- Utilisez des types pour garantir la cohérence des données
- Définissez toutes les colonnes avec des propriétés explicites
- Gérez correctement les événements de pagination et de tri
- Utilisez des templates personnalisés pour les contenus complexes
- Uniformisez la présentation des données dans toute l'application
