import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ExerciceService } from './exercice.service';
import { HttpGenericService } from '../../shared/services/http-generic.service';
import { CacheService } from './cache.service';

class HttpGenericServiceMock {
  post = jasmine.createSpy('post').and.callFake((_url: string, body: any) => of({ ...(body as any), id: '1' }));
}
class CacheServiceMock {
  clear() {}
}

describe('ExerciceService.createFromImport', () => {
  let service: ExerciceService;
  let http: HttpGenericServiceMock;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ExerciceService,
        { provide: HttpGenericService, useClass: HttpGenericServiceMock },
        { provide: CacheService, useClass: CacheServiceMock }
      ]
    });
    service = TestBed.inject(ExerciceService);
    http = TestBed.inject(HttpGenericService) as any;
  });

  it('devrait valider et créer via createExercice', (done) => {
    spyOn(service, 'createExercice').and.callFake((data: any) => of({ ...(data as any), id: '1' }));
    service.createFromImport({ nom: 'Ex1', tags: ['défense'] }).subscribe(result => {
      expect(service.createExercice).toHaveBeenCalled();
      expect(result.id).toBeDefined();
      done();
    });
  });

  it('devrait lever une erreur si nom manquant', () => {
    expect(() => service.createFromImport({} as any)).toThrow();
  });
});
