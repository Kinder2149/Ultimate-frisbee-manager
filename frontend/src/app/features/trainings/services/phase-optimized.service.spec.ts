import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PhaseOptimizedService } from './phase-optimized.service';
import { HttpGenericService } from '../../../shared/services/http-generic.service';
import { CacheService } from '../../../core/services/cache.service';
import { ApiUrlService } from '../../../core/services/api-url.service';
import { ModelAdapterService } from './model-adapter.service';
import { PhaseEntity, PhaseFormDataEntity } from './phase-entity.models';

describe('PhaseOptimizedService', () => {
  let service: PhaseOptimizedService;
  let httpMock: HttpTestingController;
  let apiUrlService: jasmine.SpyObj<ApiUrlService>;
  let cacheService: jasmine.SpyObj<CacheService>;
  let modelAdapter: jasmine.SpyObj<ModelAdapterService>;

  // URL de base de l'API pour les tests
  const apiUrl = 'http://localhost:3000/api';
  const phasesEndpoint = 'phases';
  const fullApiUrl = `${apiUrl}/${phasesEndpoint}`;

  beforeEach(() => {
    // Création des mocks pour les dépendances
    const apiUrlServiceSpy = jasmine.createSpyObj('ApiUrlService', ['getUrl', 'getResourceUrl']);
    apiUrlServiceSpy.getUrl.and.callFake((path: string) => `${apiUrl}/${path}`);
    apiUrlServiceSpy.getResourceUrl.and.callFake((baseUrl: string, id: string) => `${baseUrl}/${id}`);

    const cacheServiceSpy = jasmine.createSpyObj('CacheService', ['get', 'set', 'has', 'remove', 'clearByPrefix']);
    const modelAdapterSpy = jasmine.createSpyObj('ModelAdapterService', ['normalizePhase', 'prepareForApi']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PhaseOptimizedService,
        HttpGenericService,
        { provide: ApiUrlService, useValue: apiUrlServiceSpy },
        { provide: CacheService, useValue: cacheServiceSpy },
        { provide: ModelAdapterService, useValue: modelAdapterSpy }
      ]
    });

    // Récupération des instances de services
    service = TestBed.inject(PhaseOptimizedService);
    httpMock = TestBed.inject(HttpTestingController);
    apiUrlService = TestBed.inject(ApiUrlService) as jasmine.SpyObj<ApiUrlService>;
    cacheService = TestBed.inject(CacheService) as jasmine.SpyObj<CacheService>;
    modelAdapter = TestBed.inject(ModelAdapterService) as jasmine.SpyObj<ModelAdapterService>;
  });

  afterEach(() => {
    // Vérifier qu'il ne reste pas de requêtes HTTP non traitées
    httpMock.verify();
  });

  // Test 1: Vérifier que le service est créé correctement
  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  // Test 2: Vérifier la récupération d'une phase par ID
  it('devrait récupérer une phase par son ID', () => {
    const mockPhase: PhaseEntity = { 
      id: '1', 
      titre: 'Échauffement',
      description: 'Échauffement en groupe',
      duree: 15,
      entrainementId: 'training-1',
      ordre: 1
    };
    
    // Configurer le mock du CacheService pour ne pas retourner de données (pas en cache)
    cacheService.get.and.returnValue(null);
    
    // Configurer le mock de l'adaptateur de modèle
    modelAdapter.normalizePhase.and.returnValue(mockPhase);
    
    // Appeler la méthode à tester
    service.getPhaseById('1').subscribe(phase => {
      expect(phase).toEqual(mockPhase);
      expect(phase.titre).toBe('Échauffement');
    });
    
    // Vérifier que le cache a été consulté
    expect(cacheService.get).toHaveBeenCalled();
    
    // Vérifier qu'une requête HTTP a été effectuée
    const req = httpMock.expectOne(`${fullApiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPhase);
    
    // Vérifier que les données ont été mises en cache
    expect(cacheService.set).toHaveBeenCalled();
  });

  // Test 3: Vérifier la récupération des phases d'un entraînement
  it('devrait récupérer toutes les phases d\'un entraînement', () => {
    const entrainementId = 'training-1';
    const mockPhases: PhaseEntity[] = [
      { 
        id: '1', 
        titre: 'Échauffement',
        description: 'Échauffement en groupe',
        duree: 15,
        entrainementId: entrainementId,
        ordre: 1
      },
      { 
        id: '2', 
        titre: 'Exercice technique',
        description: 'Travail de lancers',
        duree: 20,
        entrainementId: entrainementId,
        ordre: 2
      }
    ];
    
    // Configurer le mock du CacheService pour ne pas retourner de données (pas en cache)
    cacheService.get.and.returnValue(null);
    
    // Configurer le mock de l'adaptateur de modèle
    modelAdapter.normalizePhase.and.callFake((phase) => phase);
    
    // Appeler la méthode à tester
    service.getPhasesByEntrainement(entrainementId).subscribe(phases => {
      expect(phases).toEqual(mockPhases);
      expect(phases.length).toBe(2);
      expect(phases[0].ordre).toBeLessThan(phases[1].ordre);
    });
    
    // Vérifier que le cache a été consulté
    expect(cacheService.get).toHaveBeenCalled();
    
    // Vérifier qu'une requête HTTP a été effectuée à l'URL spécifique pour l'entraînement
    const req = httpMock.expectOne(`${apiUrl}/trainings/${entrainementId}/phases`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPhases);
    
    // Vérifier que les données ont été mises en cache
    expect(cacheService.set).toHaveBeenCalled();
  });

  // Test 4: Vérifier la création d'une phase
  it('devrait créer une nouvelle phase', () => {
    const entrainementId = 'training-1';
    const newPhase: PhaseFormDataEntity = { 
      titre: 'Nouvelle phase',
      description: 'Description de la phase',
      duree: 10
    };
    const createdPhase: PhaseEntity = { 
      id: '3',
      titre: 'Nouvelle phase',
      description: 'Description de la phase',
      duree: 10,
      entrainementId: entrainementId,
      ordre: 3
    };
    
    // Configurer le mock de l'adaptateur de modèle
    modelAdapter.prepareForApi.and.returnValue(newPhase);
    modelAdapter.normalizePhase.and.returnValue(createdPhase);
    
    // Appeler la méthode à tester
    service.createPhase(entrainementId, newPhase, 3).subscribe(phase => {
      expect(phase).toEqual(createdPhase);
      expect(phase.id).toBe('3');
    });
    
    // Vérifier qu'une requête HTTP a été effectuée
    const req = httpMock.expectOne(fullApiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.entrainementId).toBe(entrainementId);
    expect(req.request.body.ordre).toBe(3);
    req.flush(createdPhase);
    
    // Vérifier que le cache a été invalidé
    expect(cacheService.remove).toHaveBeenCalled();
  });

  // Test 5: Vérifier la mise à jour d'une phase
  it('devrait mettre à jour une phase existante', () => {
    const phaseId = '1';
    const entrainementId = 'training-1';
    const existingPhase: PhaseEntity = {
      id: phaseId,
      titre: 'Échauffement',
      description: 'Échauffement en groupe',
      duree: 15,
      entrainementId: entrainementId,
      ordre: 1
    };
    const updateData: Partial<PhaseFormDataEntity> = { 
      titre: 'Échauffement modifié',
      duree: 20
    };
    const updatedPhase: PhaseEntity = { 
      ...existingPhase,
      titre: 'Échauffement modifié',
      duree: 20
    };
    
    // Configurer le mock du CacheService pour la phase existante
    cacheService.get.and.returnValue(existingPhase);
    
    // Configurer le mock de l'adaptateur de modèle
    modelAdapter.prepareForApi.and.returnValue(updateData);
    modelAdapter.normalizePhase.and.returnValue(updatedPhase);
    
    // Appeler la méthode à tester
    service.updatePhase(phaseId, updateData).subscribe(phase => {
      expect(phase).toEqual(updatedPhase);
      expect(phase.titre).toBe('Échauffement modifié');
      expect(phase.duree).toBe(20);
    });
    
    // Vérifier qu'une requête HTTP a été effectuée
    const req = httpMock.expectOne(`${fullApiUrl}/${phaseId}`);
    expect(req.request.method).toBe('PUT');
    req.flush(updatedPhase);
    
    // Vérifier que le cache a été invalidé
    expect(cacheService.remove).toHaveBeenCalledTimes(1);
  });

  // Test 6: Vérifier la suppression d'une phase
  it('devrait supprimer une phase existante', () => {
    const phaseId = '1';
    const entrainementId = 'training-1';
    const existingPhase: PhaseEntity = {
      id: phaseId,
      titre: 'Échauffement',
      description: 'Échauffement en groupe',
      duree: 15,
      entrainementId: entrainementId,
      ordre: 1
    };
    
    // Configurer le mock du CacheService pour la phase existante
    cacheService.get.and.returnValue(existingPhase);
    
    // Appeler la méthode à tester
    service.deletePhase(phaseId).subscribe(response => {
      expect(response).toBeUndefined();
    });
    
    // Vérifier qu'une requête HTTP a été effectuée
    const req = httpMock.expectOne(`${fullApiUrl}/${phaseId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    
    // Vérifier que le cache a été invalidé
    expect(cacheService.remove).toHaveBeenCalled();
  });

  // Test 7: Vérifier la réorganisation d'une phase
  it('devrait réorganiser une phase existante', () => {
    const phaseId = '1';
    const entrainementId = 'training-1';
    const existingPhase: PhaseEntity = {
      id: phaseId,
      titre: 'Échauffement',
      description: 'Échauffement en groupe',
      duree: 15,
      entrainementId: entrainementId,
      ordre: 1
    };
    const newOrdre = 3;
    const reorderedPhase: PhaseEntity = { 
      ...existingPhase,
      ordre: newOrdre
    };
    
    // Configurer le mock du CacheService pour la phase existante
    cacheService.get.and.returnValue(existingPhase);
    
    // Configurer le mock de l'adaptateur de modèle
    modelAdapter.normalizePhase.and.returnValue(reorderedPhase);
    
    // Appeler la méthode à tester
    service.reorderPhase(phaseId, newOrdre).subscribe(phase => {
      expect(phase).toEqual(reorderedPhase);
      expect(phase.ordre).toBe(newOrdre);
    });
    
    // Vérifier qu'une requête HTTP a été effectuée
    const req = httpMock.expectOne(`${fullApiUrl}/${phaseId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.ordre).toBe(newOrdre);
    req.flush(reorderedPhase);
    
    // Vérifier que le cache a été invalidé
    expect(cacheService.remove).toHaveBeenCalled();
  });

  // Test 8: Vérifier le comportement avec un ID temporaire
  it('devrait gérer correctement les IDs temporaires', () => {
    const tempId = 'new-123';
    
    service.getPhaseById(tempId).subscribe(phase => {
      expect(phase).toEqual({} as PhaseEntity);
    });
    
    // Vérifier qu'aucune requête HTTP n'a été effectuée
    httpMock.expectNone(`${fullApiUrl}/${tempId}`);
    
    // Vérifier que le cache n'a pas été consulté
    expect(cacheService.get).not.toHaveBeenCalled();
  });

  // Test 9: Vérifier la gestion des erreurs pour un ID manquant
  it('devrait retourner une erreur si l\'ID est manquant', (done) => {
    service.getPhaseById('').subscribe({
      next: () => {
        fail('La méthode aurait dû échouer');
      },
      error: (error) => {
        expect(error.message).toContain('ID de phase requis');
        done();
      }
    });
  });

  // Test 10: Vérifier la gestion des erreurs pour un ID d'entraînement manquant
  it('devrait retourner une erreur si l\'ID d\'entraînement est manquant pour getPhasesByEntrainement', (done) => {
    service.getPhasesByEntrainement('').subscribe({
      next: () => {
        fail('La méthode aurait dû échouer');
      },
      error: (error) => {
        expect(error.message).toContain('ID d\'entraînement requis');
        done();
      }
    });
  });
});
