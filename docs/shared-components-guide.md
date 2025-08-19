# Guide des Composants et Services Partagés

Ce document sert de guide de référence pour l'utilisation des composants UI et services partagés dans l'application Ultimate-frisbee-manager. Il présente les composants disponibles, leur fonctionnalité et des exemples d'utilisation.

## Table des matières

1. [Services Partagés](#services-partagés)
   - [HttpGenericService](#httpgenericservice)
   - [MapperService](#mapperservice)
   - [ErrorHandlerService](#errorhandlerservice)
   - [ValidationService](#validationservice)
2. [Composants UI Partagés](#composants-ui-partagés)
   - [ContentCardComponent](#contentcardcomponent)
   - [SearchFilterComponent](#searchfiltercomponent)
   - [DataTableComponent](#datatablecomponent)
   - [AlertComponent](#alertcomponent)
3. [Bonnes pratiques](#bonnes-pratiques)

## Services Partagés

### HttpGenericService

Service générique pour les appels HTTP avec gestion du cache intégrée.

**Fonctionnalités clés :**
- Méthodes CRUD standards (GET, POST, PUT, DELETE)
- Intégration avec le cache pour les requêtes GET
- Gestion centralisée des erreurs
- Invalidation automatique du cache lors des mutations

**Exemple d'utilisation :**

```typescript
// Injection du service
constructor(private http: HttpGenericService) {}

// Récupération de données avec cache
getTrainings(): Observable<Training[]> {
  return this.http.get<Training[]>('trainings', { 
    useCache: true,
    cacheConfig: { ttl: 600 } // 10 minutes
  });
}

// Création d'une entité
createTraining(training: Training): Observable<Training> {
  return this.http.post<Training>('trainings', training, { 
    useCache: true // Invalidera automatiquement le cache des trainings
  });
}

// Mise à jour avec paramètres
updateTraining(id: string, changes: Partial<Training>): Observable<Training> {
  return this.http.put<Training>(`trainings/${id}`, changes);
}

// Suppression avec headers personnalisés
deleteTraining(id: string): Observable<void> {
  return this.http.delete<void>(`trainings/${id}`, {
    headers: new HttpHeaders().set('X-Reason', 'Obsolète')
  });
}
```

### MapperService

Service de mappage de données entre différents formats (API vers frontend et vice-versa).

**Fonctionnalités clés :**
- Transformation de structure de données selon une configuration
- Support pour le mappage d'attributs simples et de collections
- Fonctions de transformation personnalisées
- Support pour la notation par points pour les propriétés imbriquées

**Exemple d'utilisation :**

```typescript
// Injection du service
constructor(private mapper: MapperService) {}

// Définition d'un mappage
const trainingMapping: EntityMapping = {
  attributes: [
    { source: 'id', target: 'id' },
    { source: 'title', target: 'titre' },
    { source: 'description', target: 'description' },
    { 
      source: 'date', 
      target: 'date', 
      transform: (value) => new Date(value) 
    },
    { 
      source: 'duration', 
      target: 'dureeMinutes', 
      defaultValue: 60 
    }
  ],
  collections: {
    'phases': {
      attributes: [
        { source: 'id', target: 'id' },
        { source: 'title', target: 'titre' },
        { source: 'duration', target: 'duree' }
      ]
    }
  }
};

// Création d'un mappeur spécialisé
const trainingToApiMapper = this.mapper.createEntityMapper<TrainingUI, TrainingAPI>(trainingMapping);

// Utilisation du mappeur
const apiTraining = trainingToApiMapper(uiTraining);
```

### ErrorHandlerService

Service centralisé pour la gestion des erreurs d'application.

**Fonctionnalités clés :**
- Traitement uniforme des erreurs HTTP
- Support pour différents types d'erreurs (validation, authentification, etc.)
- Système d'écouteurs pour réagir aux erreurs
- Logging des erreurs avec informations contextuelles

**Exemple d'utilisation :**

```typescript
// Injection du service
constructor(private errorHandler: ErrorHandlerService) {
  // Ajout d'un écouteur
  this.errorHandler.addListener({
    onError: (error: AppError) => {
      if (error.type === ErrorType.AUTHENTICATION) {
        // Rediriger vers la page de connexion
      } else {
        // Afficher une notification d'erreur
      }
    }
  });
}

// Gestion d'erreur HTTP dans un intercepteur
intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  return next.handle(req).pipe(
    catchError((error: HttpErrorResponse) => {
      return this.errorHandler.handleHttpError(error, 'API Request');
    })
  );
}

// Signalement d'une erreur applicative
onFormSubmitError(): void {
  this.errorHandler.handleAppError(
    'Impossible de soumettre le formulaire. Veuillez vérifier votre connexion.',
    ErrorType.NETWORK
  );
}
```

### ValidationService

Service de validation des formulaires avec des validateurs réutilisables.

**Fonctionnalités clés :**
- Validateurs personnalisés (unicité, correspondance, etc.)
- Extraction de messages d'erreur formatés
- Vérification simplifiée des erreurs
- Support pour les champs obligatoires, min/max, patterns, etc.

**Exemple d'utilisation :**

```typescript
// Injection du service
constructor(
  private fb: FormBuilder,
  private validation: ValidationService
) {}

// Création d'un formulaire avec validateurs
initForm(): void {
  this.trainingForm = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(100)]],
    description: [''],
    date: ['', [Validators.required, this.validation.dateFormat('YYYY-MM-DD')]],
    duration: [60, [Validators.min(10), Validators.max(240)]],
    passwordConfirm: ['']
  }, {
    validators: this.validation.matchValues('password', 'passwordConfirm')
  });
}

// Vérification des erreurs dans le template
get hasErrors(): boolean {
  return this.validation.hasError(this.trainingForm, 'title', 'required', this.submitted);
}

// Obtenir un message d'erreur formaté
getTitleErrorMessage(): string {
  return this.validation.getErrorMessage(this.trainingForm, 'title', 'Titre', this.submitted);
}
```

## Composants UI Partagés

### ContentCardComponent

Composant de carte de contenu générique avec en-tête, corps et pied de page.

**Fonctionnalités clés :**
- En-tête avec titre, sous-titre et image
- Support pour le repliage/dépliage
- Thèmes de couleur prédéfinis
- Personnalisation de l'apparence (bordures, ombres, etc.)

**Exemple d'utilisation :**

```html
<app-content-card 
  title="Entraînement du 15 mars" 
  subtitle="Débutants et intermédiaires"
  [headerImageUrl]="training.imageUrl"
  [collapsible]="true"
  theme="primary"
  (cardClick)="onCardClick(training)"
  (collapsedChange)="onCollapseChange($event)"
>
  <div class="card-content">
    <p>{{ training.description }}</p>
    <div class="tags">
      <span class="tag" *ngFor="let tag of training.tags">{{ tag.label }}</span>
    </div>
  </div>
  
  <div card-footer>
    <button class="btn">Modifier</button>
    <button class="btn btn-primary">Voir les détails</button>
  </div>
</app-content-card>
```

### SearchFilterComponent

Composant pour la recherche et le filtrage des données.

**Fonctionnalités clés :**
- Champ de recherche textuelle
- Filtres multiples et configurables
- Support pour différents types de filtres (texte, sélection, date, etc.)
- État de filtre persistant

**Exemple d'utilisation :**

```typescript
// Définition des filtres dans le composant
filterOptions: FilterOption[] = [
  {
    key: 'level',
    label: 'Niveau',
    type: 'select',
    options: [
      { value: 'beginner', label: 'Débutant' },
      { value: 'intermediate', label: 'Intermédiaire' },
      { value: 'advanced', label: 'Avancé' }
    ]
  },
  {
    key: 'date',
    label: 'Date',
    type: 'date'
  },
  {
    key: 'duration',
    label: 'Durée (min)',
    type: 'range'
  }
];
```

```html
<app-search-filter
  searchPlaceholder="Rechercher un entraînement..."
  [filterOptions]="filterOptions"
  [initialSearchTerm]="searchTerm"
  [initialFilters]="activeFilters"
  (search)="onSearch($event)"
  (reset)="onReset()"
></app-search-filter>
```

### DataTableComponent

Composant de tableau de données avec tri, pagination et formatage.

**Fonctionnalités clés :**
- Colonnes configurables (largeur, tri, formatage)
- Pagination intégrée
- Tri des colonnes
- Actions par ligne
- Support pour différents types de données (texte, date, booléen, etc.)

**Exemple d'utilisation :**

```typescript
// Configuration des colonnes
columns: ColumnConfig[] = [
  { key: 'title', header: 'Titre', sortable: true },
  { key: 'date', header: 'Date', type: 'date', sortable: true },
  { key: 'level', header: 'Niveau', type: 'tag' },
  { key: 'duration', header: 'Durée (min)', type: 'number', width: '100px' },
  { key: 'actions', header: 'Actions', type: 'actions', width: '120px' }
];

// Pagination
paginationConfig: PaginationConfig = {
  currentPage: 1,
  pageSize: 10,
  totalItems: 150,
  pageSizeOptions: [5, 10, 25, 50]
};
```

```html
<app-data-table
  [data]="trainings"
  [columns]="columns"
  [pagination]="paginationConfig"
  [sort]="{ key: 'date', direction: 'desc' }"
  [striped]="true"
  [hover]="true"
  (rowClick)="onRowClick($event)"
  (pageChange)="onPageChange($event)"
  (sortChange)="onSortChange($event)"
  (action)="onAction($event)"
></app-data-table>
```

### AlertComponent

Composant pour l'affichage d'alertes et de notifications.

**Fonctionnalités clés :**
- Types d'alertes prédéfinis (info, succès, avertissement, erreur)
- Support pour titre et message
- Option pour fermeture manuelle ou automatique
- Animations d'entrée/sortie
- Styles variés (bordure, fond plein, etc.)

**Exemple d'utilisation :**

```html
<!-- Alerte simple -->
<app-alert
  type="success"
  message="L'entraînement a été créé avec succès !"
  [autoClose]="true"
></app-alert>

<!-- Alerte complexe -->
<app-alert
  type="warning"
  title="Attention"
  message="Certains participants n'ont pas confirmé leur présence."
  [solid]="true"
  [dismissible]="true"
  (closed)="onAlertClosed()"
></app-alert>
```

## Bonnes pratiques

1. **Cohérence visuelle** : Utilisez les composants partagés plutôt que de créer des éléments similaires pour garantir une expérience utilisateur cohérente.

2. **Réutilisation des services** : Préférez injecter et utiliser les services partagés plutôt que dupliquer leur logique.

3. **Extension** : Étendez les composants existants plutôt que de créer des variantes complètement nouvelles.

4. **Documentation** : Documentez les cas d'utilisation spécifiques ou les configurations personnalisées.

5. **Tests** : Ajoutez des tests unitaires pour tous les composants et services partagés créés.

6. **Feedback** : Signalez les problèmes ou suggérez des améliorations aux composants partagés.

7. **Module dédié** : Importez le module partagé plutôt que d'importer chaque composant individuellement.

```typescript
// Exemple d'import du module partagé
import { SharedModule } from '@app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    // ...
  ],
  // ...
})
export class FeatureModule { }
```
