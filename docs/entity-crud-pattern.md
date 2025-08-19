# Pattern Entity CRUD Service

## Introduction

Ce document décrit le pattern `EntityCrudService` mis en place dans le projet Ultimate-frisbee-manager pour standardiser et optimiser les opérations CRUD (Create, Read, Update, Delete) sur les différentes entités de l'application.

## Objectifs

- **Réduire la duplication de code** : Centraliser les opérations CRUD communes
- **Uniformiser les pratiques** : Assurer une cohérence dans la manipulation des données
- **Faciliter la maintenance** : Une modification du comportement se fait à un seul endroit
- **Optimiser les performances** : Gestion intelligente du cache
- **Simplifier le développement** : Accélérer l'implémentation de nouveaux services

## Structure et composants

### 1. Interface Entity

```typescript
export interface Entity {
  id?: string | number;
  [key: string]: any;
}
```

Cette interface définit la structure minimale que doivent avoir les entités pour être compatibles avec le service CRUD générique.

### 2. Interface CrudOptions

```typescript
export interface CrudOptions<T> {
  cachePrefix?: string;
  cacheTTL?: number;
  useCache?: boolean;
  httpOptions?: HttpOptions;
  transformBeforeSend?: (entity: T) => any;
  transformAfterReceive?: (data: any) => T;
}
```

Cette interface permet de configurer le comportement du service CRUD pour chaque opération ou entité.

### 3. Service EntityCrudService

Ce service générique fournit des méthodes standardisées pour les opérations CRUD :
- `getAll()` : Récupération de toutes les entités
- `getById(id)` : Récupération d'une entité spécifique
- `create(entity)` : Création d'une nouvelle entité
- `update(id, entity)` : Mise à jour d'une entité existante
- `delete(id)` : Suppression d'une entité

Il s'occupe également de :
- La gestion du cache
- La transformation des données avant envoi et après réception
- L'invalidation intelligente du cache

## Utilisation

### 1. Configuration du service

```typescript
// Dans votre service métier
constructor(
  private httpService: HttpGenericService,
  private cacheService: CacheService
) {
  this.entityCrud = new EntityCrudService<MonEntite>(httpService, cacheService);
  this.entityCrud.configure('endpoint-api', {
    cachePrefix: 'mon-entite',
    cacheTTL: 300, // 5 minutes
    transformBeforeSend: this.preparerEntite,
    transformAfterReceive: this.traiterEntite
  });
}
```

### 2. Exemple d'implémentation complète

```typescript
@Injectable({
  providedIn: 'root'
})
export class ExerciceService {
  private exerciceCrud: EntityCrudService<Exercice>;
  
  constructor(
    private httpService: HttpGenericService,
    private cacheService: CacheService
  ) {
    this.exerciceCrud = new EntityCrudService<Exercice>(httpService, cacheService);
    this.exerciceCrud.configure('exercices', {
      cachePrefix: 'exercice',
      cacheTTL: 300
    });
  }
  
  getExercices(): Observable<Exercice[]> {
    return this.exerciceCrud.getAll();
  }
  
  getExerciceById(id: string): Observable<Exercice> {
    return this.exerciceCrud.getById(id);
  }
  
  ajouterExercice(exercice: Exercice): Observable<Exercice> {
    return this.exerciceCrud.create(exercice);
  }
  
  updateExercice(id: string, exercice: Exercice): Observable<Exercice> {
    return this.exerciceCrud.update(id, exercice);
  }
  
  deleteExercice(id: string): Observable<void> {
    return this.exerciceCrud.delete(id);
  }
}
```

### 3. Utilisation avancée avec transformation des données

```typescript
// Exemple de transformation avant envoi
private preparerExercice(exercice: Exercice): any {
  return {
    ...exercice,
    description: exercice.description || '',
    dateModification: new Date().toISOString()
  };
}

// Exemple de transformation après réception
private traiterExercice(data: any): Exercice {
  return {
    ...data,
    dateCreation: data.dateCreation ? new Date(data.dateCreation) : null
  };
}
```

## Migration des services existants

### Étapes de migration

1. **Identification** : Identifier les services avec des opérations CRUD similaires
2. **Adaptation des modèles** : S'assurer que les entités implémentent l'interface `Entity`
3. **Création d'une version optimisée** : Implémenter une version avec `EntityCrudService`
4. **Tests** : Vérifier l'équivalence fonctionnelle
5. **Remplacement** : Migrer progressivement les appels vers le nouveau service
6. **Fusion** : Une fois validé, remplacer l'ancien service

### Exemple de modèle adapté

```typescript
export interface Exercice extends Entity {
  nom: string;
  description?: string;
  niveau: number;
  // ... autres propriétés
}
```

## Avantages

1. **Réduction du code** : ~70% de code en moins par service
2. **Cohérence** : Comportement uniforme pour toutes les entités
3. **Performance** : Gestion optimisée du cache
4. **Maintenabilité** : Modifications centralisées
5. **Flexibilité** : Options configurables par entité ou par opération

## Tests unitaires

Pour garantir la qualité du code, il est recommandé de tester :
1. Le service `EntityCrudService` lui-même
2. Chaque service métier implémentant ce pattern
3. Les cas particuliers (transformations, gestion d'erreurs)

### Exemple de test unitaire

```typescript
describe('EntityCrudService', () => {
  let service: EntityCrudService<TestEntity>;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        EntityCrudService,
        { provide: CacheService, useClass: MockCacheService }
      ]
    });
    
    service = TestBed.inject(EntityCrudService);
    httpMock = TestBed.inject(HttpTestingController);
    
    service.configure('test-entity');
  });
  
  it('should retrieve all entities', () => {
    // ... test code
  });
  
  // ... other tests
});
```

## Bonnes pratiques

1. **Nommage cohérent** : Utiliser des noms de méthodes standards (`getAll`, `getById`, etc.)
2. **Documentation** : Commenter les transformations spécifiques
3. **Tests** : Couvrir les cas particuliers de chaque service
4. **TTL approprié** : Adapter la durée de vie du cache selon la fréquence de modification
5. **Invalidation** : Invalider les caches appropriés lors des mutations

## Conclusion

Le pattern `EntityCrudService` améliore considérablement la qualité du code tout en réduisant la charge de développement. Son adoption progressive permettra d'harmoniser la gestion des données dans l'application Ultimate-frisbee-manager.
