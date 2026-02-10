import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MobileDataService } from './mobile-data.service';
import { ExerciceService } from '../../../core/services/exercice.service';
import { EntrainementService } from '../../../core/services/entrainement.service';
import { EchauffementService } from '../../../core/services/echauffement.service';
import { SituationMatchService } from '../../../core/services/situationmatch.service';

describe('MobileDataService', () => {
  let service: MobileDataService;
  let exerciceServiceSpy: jasmine.SpyObj<ExerciceService>;
  let entrainementServiceSpy: jasmine.SpyObj<EntrainementService>;
  let echauffementServiceSpy: jasmine.SpyObj<EchauffementService>;
  let situationMatchServiceSpy: jasmine.SpyObj<SituationMatchService>;

  beforeEach(() => {
    const exerciceSpy = jasmine.createSpyObj('ExerciceService', ['getExercices', 'getExerciceById']);
    const entrainementSpy = jasmine.createSpyObj('EntrainementService', ['getEntrainements', 'getEntrainementById']);
    const echauffementSpy = jasmine.createSpyObj('EchauffementService', ['getEchauffements', 'getEchauffementById']);
    const situationMatchSpy = jasmine.createSpyObj('SituationMatchService', ['getSituationsMatchs', 'getSituationMatchById']);

    TestBed.configureTestingModule({
      providers: [
        MobileDataService,
        { provide: ExerciceService, useValue: exerciceSpy },
        { provide: EntrainementService, useValue: entrainementSpy },
        { provide: EchauffementService, useValue: echauffementSpy },
        { provide: SituationMatchService, useValue: situationMatchSpy }
      ]
    });

    service = TestBed.inject(MobileDataService);
    exerciceServiceSpy = TestBed.inject(ExerciceService) as jasmine.SpyObj<ExerciceService>;
    entrainementServiceSpy = TestBed.inject(EntrainementService) as jasmine.SpyObj<EntrainementService>;
    echauffementServiceSpy = TestBed.inject(EchauffementService) as jasmine.SpyObj<EchauffementService>;
    situationMatchServiceSpy = TestBed.inject(SituationMatchService) as jasmine.SpyObj<SituationMatchService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should transform exercice to ContentItem', (done) => {
    const mockExercice = {
      id: 'ex1',
      nom: 'Test Exercice',
      description: 'Description test',
      createdAt: new Date().toISOString(),
      tags: [],
      imageUrl: 'http://example.com/image.jpg'
    };

    exerciceServiceSpy.getExerciceById.and.returnValue(of(mockExercice as any));

    service.getContentById('exercice', 'ex1').subscribe(item => {
      expect(item.id).toBe('ex1');
      expect(item.type).toBe('exercice');
      expect(item.title).toBe('Test Exercice');
      expect(item.description).toBe('Description test');
      expect(item.imageUrl).toBe('http://example.com/image.jpg');
      done();
    });
  });

  it('should aggregate all content types', (done) => {
    exerciceServiceSpy.getExercices.and.returnValue(of([{ id: 'ex1', nom: 'Ex1', createdAt: new Date().toISOString() }] as any));
    entrainementServiceSpy.getEntrainements.and.returnValue(of([{ id: 'en1', titre: 'En1', createdAt: new Date().toISOString(), exercices: [] }] as any));
    echauffementServiceSpy.getEchauffements.and.returnValue(of([{ id: 'ec1', nom: 'Ec1', createdAt: new Date().toISOString() }] as any));
    situationMatchServiceSpy.getSituationsMatchs.and.returnValue(of([{ id: 'si1', nom: 'Si1', createdAt: new Date().toISOString() }] as any));

    service.getAllContent().subscribe(items => {
      expect(items.length).toBe(4);
      expect(items.map(i => i.type)).toEqual(['exercice', 'entrainement', 'echauffement', 'situation']);
      done();
    });
  });
});
