import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SituationMatchService } from './situationmatch.service';
import { EntityCrudService } from '../../shared/services/entity-crud.service';

class EntityCrudServiceMock<T> {
  create = jasmine.createSpy('create').and.callFake((_endpoint: string, entity: T) => of({ ...(entity as any), id: '1' }));
  invalidateCache() {}
}

describe('SituationMatchService.createFromImport', () => {
  let service: SituationMatchService;
  let crud: EntityCrudServiceMock<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SituationMatchService,
        { provide: EntityCrudService, useClass: EntityCrudServiceMock }
      ]
    });
    service = TestBed.inject(SituationMatchService);
    crud = TestBed.inject(EntityCrudService) as any;
  });

  it('devrait valider et créer via EntityCrudService', (done) => {
    service.createFromImport({ nom: 'Situation 1', tags: ['défense'] }).subscribe(result => {
      expect(crud.create).toHaveBeenCalled();
      expect(result.id).toBeDefined();
      done();
    });
  });

  it('devrait lever une erreur si nom manquant', () => {
    expect(() => service.createFromImport({} as any)).toThrow();
  });
});
