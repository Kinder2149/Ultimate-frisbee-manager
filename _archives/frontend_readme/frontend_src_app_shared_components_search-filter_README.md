# Search Filter Component

Composant de recherche et filtrage réutilisable qui permet aux utilisateurs de rechercher et filtrer des données dans les listes et tableaux.

## Installation

Le composant est disponible en tant que composant standalone dans le dossier `shared/components/search-filter`.

```typescript
import { SearchFilterComponent } from '@app/shared/components/search-filter/search-filter.component';
```

## API

### Entrées (@Input)
- `placeholder: string` - Texte d'aide dans le champ de recherche (défaut: 'Rechercher...')
- `value: string` - Valeur actuelle du champ de recherche (défaut: '')
- `debounceTime: number` - Délai avant déclenchement de la recherche en millisecondes (défaut: 300)
- `filters: FilterOption[]` - Liste des filtres disponibles (défaut: [])
- `activeFilters: Filter[]` - Liste des filtres actuellement actifs (défaut: [])
- `showClearButton: boolean` - Afficher le bouton de réinitialisation (défaut: true)
- `showFilterButton: boolean` - Afficher le bouton de filtres (défaut: true)
- `additionalClasses: string` - Classes CSS supplémentaires (défaut: '')

### Sorties (@Output)
- `search: EventEmitter<string>` - Émis lorsque la recherche est modifiée (après debounce)
- `filterChange: EventEmitter<Filter[]>` - Émis lorsque les filtres sont modifiés
- `clear: EventEmitter<void>` - Émis lorsque la recherche est réinitialisée

### Types
```typescript
interface FilterOption {
  key: string;           // Identifiant unique du filtre
  label: string;         // Libellé affiché à l'utilisateur
  type: 'select' | 'checkbox' | 'radio' | 'date' | 'range';  // Type de filtre
  options?: {value: any, label: string}[];  // Options pour les filtres select/checkbox/radio
  multiple?: boolean;    // Pour les filtres select (multiselect)
}

interface Filter {
  key: string;          // Clé du filtre (correspondant à FilterOption.key)
  value: any;           // Valeur(s) sélectionnée(s)
}
```

## Exemples d'utilisation

### Recherche simple
```html
<app-search-filter
  placeholder="Rechercher un exercice..."
  [value]="searchValue"
  (search)="onSearch($event)">
</app-search-filter>
```

### Avec filtres
```typescript
// Dans le composant
const filters: FilterOption[] = [
  { 
    key: 'category', 
    label: 'Catégorie', 
    type: 'select',
    options: [
      { value: 'technique', label: 'Technique' },
      { value: 'tactique', label: 'Tactique' },
      { value: 'physique', label: 'Physique' }
    ],
    multiple: true
  },
  {
    key: 'level',
    label: 'Niveau',
    type: 'radio',
    options: [
      { value: 1, label: 'Débutant' },
      { value: 2, label: 'Intermédiaire' },
      { value: 3, label: 'Avancé' }
    ]
  },
  {
    key: 'dateRange',
    label: 'Période',
    type: 'date'
  }
];

// Filtres actifs initiaux
const activeFilters: Filter[] = [
  { key: 'category', value: ['technique'] }
];

// Gestion des événements
onSearch(searchText: string) {
  this.searchValue = searchText;
  this.loadData();
}

onFilterChange(filters: Filter[]) {
  this.activeFilters = filters;
  this.loadData();
}

onClear() {
  this.searchValue = '';
  this.activeFilters = [];
  this.loadData();
}
```

```html
<app-search-filter
  placeholder="Rechercher..."
  [value]="searchValue"
  [filters]="filters"
  [activeFilters]="activeFilters"
  (search)="onSearch($event)"
  (filterChange)="onFilterChange($event)"
  (clear)="onClear()">
</app-search-filter>
```

### Intégration avec DataTable
```html
<!-- Barre de recherche et filtres -->
<app-search-filter
  [value]="searchValue"
  [filters]="filters"
  [activeFilters]="activeFilters"
  (search)="onSearch($event)"
  (filterChange)="onFilterChange($event)">
</app-search-filter>

<!-- Tableau de données -->
<app-data-table
  [data]="filteredData"
  [columns]="columns"
  [pagination]="pagination">
</app-data-table>
```

## Bonnes pratiques

- Utiliser le même système de filtres dans toute l'application pour une expérience utilisateur cohérente
- Limiter le nombre de filtres à 3-5 maximum pour éviter de surcharger l'interface
- Privilégier des libellés courts et descriptifs pour les options de filtre
- Conserver l'état des filtres lors des navigations pour améliorer l'expérience utilisateur
- Fournir des valeurs par défaut pertinentes quand cela a du sens

## Personnalisation

Le composant utilise Angular Material pour le rendu, mais vous pouvez personnaliser son apparence en surchargeant les classes CSS ou en étendant le composant.
