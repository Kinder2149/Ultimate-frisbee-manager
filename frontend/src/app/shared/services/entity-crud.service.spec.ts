import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EntityCrudService, Entity, CrudOptions } from './entity-crud.service';
import { HttpGenericService } from './http-generic.service';
import { CacheService } from '../../core/services/cache.service';
import { ApiUrlService } from '../../core/services/api-url.service';

interface TestEntity extends Entity {
  id?: string | number;
  name: string;
  value?: number;
}

class MockCacheService {
  private cache = new Map<string, any>();
  has(key: string): boolean { return this.cache.has(key); }
  get<T>(key: string): T | null { return this.cache.get(key) || null; }
  set(config: { key: string, ttl?: number }, value: any): void { this.cache.set(config.key, value); }
  remove(key: string): boolean { return this.cache.delete(key); }
  clearByPrefix(prefix: string): number { return 0; }
}

describe('EntityCrudService (Stateless)', () => {
  let service: EntityCrudService<TestEntity>;
  let httpMock: HttpTestingController;
  const endpoint = 'test-entities';
  const apiUrl = 'http://localhost:3000/api';

  beforeEach(() => {
    const apiUrlServiceMock = {
      getUrl: (path: string) => `${apiUrl}/${path}`
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        EntityCrudService,
        HttpGenericService,
        { provide: CacheService, useClass: MockCacheService },
        { provide: ApiUrlService, useValue: apiUrlServiceMock }
      ]
    });

    service = TestBed.inject(EntityCrudService) as EntityCrudService<TestEntity>;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  it('devrait récupérer toutes les entités', () => {
    const mockEntities: TestEntity[] = [{ id: '1', name: 'Entity 1' }];
    service.getAll(endpoint).subscribe(entities => {
      expect(entities.length).toBe(1);
      expect(entities).toEqual(mockEntities);
    });
    const req = httpMock.expectOne(`${apiUrl}/${endpoint}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockEntities);
  });

  it('devrait créer une nouvelle entité', () => {
    const newEntity: TestEntity = { name: 'New Entity' };
    const createdEntity: TestEntity = { id: '2', name: 'New Entity' };
    service.create(endpoint, newEntity).subscribe(entity => {
      expect(entity).toEqual(createdEntity);
    });
    const req = httpMock.expectOne(`${apiUrl}/${endpoint}`);
    expect(req.request.method).toBe('POST');
    req.flush(createdEntity);
  });

  it('devrait mettre à jour une entité', () => {
    const updatedEntity: TestEntity = { id: '1', name: 'Updated' };
    service.update(endpoint, '1', { name: 'Updated' }).subscribe(entity => {
      expect(entity).toEqual(updatedEntity);
    });
    const req = httpMock.expectOne(`${apiUrl}/${endpoint}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(updatedEntity);
  });
});
