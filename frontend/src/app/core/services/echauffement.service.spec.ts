import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { EchauffementService } from './echauffement.service';
import { EntityCrudService } from '../../shared/services/entity-crud.service';

class EntityCrudServiceMock<T> {
  create = jasmine.createSpy('create').and.callFake((_endpoint: string, entity: T) => of({ ...(entity as any), id: '1' }));
  invalidateCache() {}
}

describe('EchauffementService.createFromImport', () => {
  let service: EchauffementService;
  let crud: EntityCrudServiceMock<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EchauffementService,
        { provide: EntityCrudService, useClass: EntityCrudServiceMock }
      ]
    });
    service = TestBed.inject(EchauffementService);
    crud = TestBed.inject(EntityCrudService) as any;
  });

  it('devrait valider et créer via EntityCrudService', (done) => {
    service.createFromImport({ nom: 'Warmup', tags: ['échauffement'] }).subscribe(result => {
      expect(crud.create).toHaveBeenCalled();
      expect(result.id).toBeDefined();
      done();
    });
  });

  it('devrait lever une erreur si nom manquant', () => {
    expect(() => service.createFromImport({} as any)).toThrow();
  });
});
