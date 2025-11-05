import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { EntrainementService } from './entrainement.service';
import { EntityCrudService } from '../../shared/services/entity-crud.service';

class EntityCrudServiceMock<T> {
  create = jasmine.createSpy('create').and.callFake((_endpoint: string, entity: T) => of({ ...(entity as any), id: '1' }));
  invalidateCache() {}
}

describe('EntrainementService.createFromImport', () => {
  let service: EntrainementService;
  let crud: EntityCrudServiceMock<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EntrainementService,
        { provide: EntityCrudService, useClass: EntityCrudServiceMock }
      ]
    });
    service = TestBed.inject(EntrainementService);
    crud = TestBed.inject(EntityCrudService) as any;
  });

  it('devrait valider et créer via EntityCrudService', (done) => {
    service.createFromImport({ nom: 'Test', tags: ['échauffement'] }).subscribe(result => {
      expect(crud.create).toHaveBeenCalled();
      expect(result.id).toBeDefined();
      done();
    });
  });

  it('devrait lever une erreur si nom manquant', () => {
    expect(() => service.createFromImport({} as any)).toThrow();
  });
});
