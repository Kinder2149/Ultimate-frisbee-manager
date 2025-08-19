import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EntityCrudService, Entity } from './entity-crud.service';
import { HttpGenericService } from './http-generic.service';
import { CacheService } from '../../core/services/cache.service';

// Interface de test implémentant Entity
interface TestEntity extends Entity {
  id?: string | number;
  name: string;
  value?: number;
}

// Mock du service de cache
class MockCacheService {
  private cache = new Map<string, any>();

  has(key: string): boolean {
    return this.cache.has(key);
  }

  get<T>(key: string): T | null {
    return this.cache.get(key) || null;
  }

  set(config: { key: string, ttl?: number }, value: any): void {
    this.cache.set(config.key, value);
  }

  remove(key: string): boolean {
    return this.cache.delete(key);
  }

  clearByPrefix(prefix: string): number {
    let count = 0;
    this.cache.forEach((_, key) => {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        count++;
      }
    });
    return count;
  }
}

describe('EntityCrudService', () => {
  let service: EntityCrudService<TestEntity>;
  let httpMock: HttpTestingController;
  let cacheMock: MockCacheService;
  const endpoint = 'test-entities';
  const apiUrl = 'http://localhost:3000/api';

  // Configuration de base pour les tests
  beforeEach(() => {
    // Créer un mock pour ApiUrlService
    const apiUrlServiceMock = {
      getUrl: jasmine.createSpy('getUrl').and.callFake((path: string) => `${apiUrl}/${path}`)
    };

    cacheMock = new MockCacheService();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        HttpGenericService,
        { provide: CacheService, useValue: cacheMock },
        { provide: 'ApiUrlService', useValue: apiUrlServiceMock }
      ]
    });

    // Récupérer les instances de services
    const httpService = TestBed.inject(HttpGenericService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Créer et configurer le service à tester
    service = new EntityCrudService<TestEntity>(httpService, cacheMock);
    service.configure(endpoint);
  });

  // S'assurer que toutes les requêtes HTTP sont terminées après chaque test
  afterEach(() => {
    httpMock.verify();
  });

  // Test 1: Vérifier que le service est créé
  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  // Test 2: Récupérer toutes les entités
  it('devrait récupérer toutes les entités', () => {
    const mockEntities: TestEntity[] = [
      { id: '1', name: 'Entity 1', value: 100 },
      { id: '2', name: 'Entity 2', value: 200 }
    ];

    service.getAll().subscribe(entities => {
      expect(entities).toEqual(mockEntities);
      expect(entities.length).toBe(2);
    });

    const req = httpMock.expectOne(`${apiUrl}/${endpoint}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockEntities);
  });

  // Test 3: Récupérer une entité par son ID
  it('devrait récupérer une entité par son ID', () => {
    const mockEntity: TestEntity = { id: '1', name: 'Entity 1', value: 100 };

    service.getById('1').subscribe(entity => {
      expect(entity).toEqual(mockEntity);
    });

    const req = httpMock.expectOne(`${apiUrl}/${endpoint}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockEntity);
  });

  // Test 4: Créer une nouvelle entité
  it('devrait créer une nouvelle entité', () => {
    const newEntity: TestEntity = { name: 'New Entity', value: 300 };
    const createdEntity: TestEntity = { id: '3', name: 'New Entity', value: 300 };

    service.create(newEntity).subscribe(entity => {
      expect(entity).toEqual(createdEntity);
    });

    const req = httpMock.expectOne(`${apiUrl}/${endpoint}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newEntity);
    req.flush(createdEntity);
  });

  // Test 5: Mettre à jour une entité
  it('devrait mettre à jour une entité existante', () => {
    const entityId = '1';
    const updatedData: TestEntity = { name: 'Updated Entity', value: 150 };
    const updatedEntity: TestEntity = { id: entityId, name: 'Updated Entity', value: 150 };

    service.update(entityId, updatedData).subscribe(entity => {
      expect(entity).toEqual(updatedEntity);
    });

    const req = httpMock.expectOne(`${apiUrl}/${endpoint}/${entityId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedData);
    req.flush(updatedEntity);
  });

  // Test 6: Supprimer une entité
  it('devrait supprimer une entité', () => {
    const entityId = '1';

    service.delete(entityId).subscribe(response => {
      expect(response).toBeUndefined();
    });

    const req = httpMock.expectOne(`${apiUrl}/${endpoint}/${entityId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // Test 7: Vérifier l'utilisation du cache pour getAll
  it('devrait utiliser le cache pour getAll', () => {
    const mockEntities: TestEntity[] = [
      { id: '1', name: 'Entity 1', value: 100 },
      { id: '2', name: 'Entity 2', value: 200 }
    ];

    // Première requête qui met en cache
    service.getAll({ useCache: true }).subscribe();
    const req1 = httpMock.expectOne(`${apiUrl}/${endpoint}`);
    req1.flush(mockEntities);

    // Deuxième requête qui devrait utiliser le cache
    spyOn(cacheMock, 'get').and.callThrough();
    service.getAll({ useCache: true }).subscribe(entities => {
      expect(cacheMock.get).toHaveBeenCalled();
      expect(entities).toEqual(mockEntities);
    });

    // Vérifier qu'aucune nouvelle requête HTTP n'a été faite
    httpMock.expectNone(`${apiUrl}/${endpoint}`);
  });

  // Test 8: Vérifier l'invalidation du cache
  it('devrait invalider le cache lors des opérations de mutation', () => {
    // Mettre des données dans le cache
    cacheMock.set({ key: `${endpoint}.all` }, [{ id: '1', name: 'Entity 1' }]);
    
    // Espionner la méthode remove du cache
    spyOn(cacheMock, 'remove').and.callThrough();
    
    // Créer une nouvelle entité (opération de mutation)
    service.create({ name: 'New Entity' }).subscribe();
    
    const req = httpMock.expectOne(`${apiUrl}/${endpoint}`);
    req.flush({ id: '2', name: 'New Entity' });
    
    // Vérifier que le cache a été invalidé
    expect(cacheMock.remove).toHaveBeenCalledWith(`${endpoint}.all`);
  });

  // Test 9: Vérifier les transformations de données
  it('devrait transformer les données avant envoi et après réception', () => {
    const inputEntity: TestEntity = { name: 'Test', value: 123 };
    const transformedForApi = { name: 'Test', value: 123, transformed: true };
    const apiResponse = { id: '1', name: 'Test', value: 123, extraField: 'xyz' };
    const transformedFromApi: TestEntity = { id: '1', name: 'TEST', value: 123 };
    
    // Configurer les fonctions de transformation
    service.configure(endpoint, {
      transformBeforeSend: (entity) => ({ ...entity, transformed: true }),
      transformAfterReceive: (data) => ({ 
        id: data.id, 
        name: data.name.toUpperCase(), 
        value: data.value 
      })
    });
    
    // Tester la création qui utilisera les deux transformations
    service.create(inputEntity).subscribe(entity => {
      expect(entity).toEqual(transformedFromApi);
    });
    
    const req = httpMock.expectOne(`${apiUrl}/${endpoint}`);
    expect(req.request.body).toEqual(transformedForApi); // Vérifier la transformation avant envoi
    req.flush(apiResponse);
  });
});
