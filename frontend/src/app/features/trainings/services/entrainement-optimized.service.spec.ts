import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EntrainementOptimizedService } from './entrainement-optimized.service';
import { HttpGenericService } from '../../../shared/services/http-generic.service';
import { CacheService } from '../../../core/services/cache.service';
import { ApiUrlService } from '../../../core/services/api-url.service';
import { ModelAdapterService } from './model-adapter.service';
import { TrainingCacheService } from './training-cache.service';
import { EntrainementEntity, EntrainementFormDataEntity } from './training-entity.models';

describe('EntrainementOptimizedService', () => {
  let service: EntrainementOptimizedService;
  let httpMock: HttpTestingController;
  let apiUrlService: jasmine.SpyObj<ApiUrlService>;
  let cacheService: jasmine.SpyObj<CacheService>;
  let trainingCache: jasmine.SpyObj<TrainingCacheService>;
  let modelAdapter: jasmine.SpyObj<ModelAdapterService>;

  // URL de base de l'API pour les tests
  const apiUrl = 'http://localhost:3000/api';
  const trainingsEndpoint = 'trainings';
  const fullApiUrl = `${apiUrl}/${trainingsEndpoint}`;

  beforeEach(() => {
    // Création des mocks pour les dépendances
    const apiUrlServiceSpy = jasmine.createSpyObj('ApiUrlService', ['getUrl', 'getTrainingsUrl', 'getResourceUrl']);
    apiUrlServiceSpy.getUrl.and.callFake((path: string) => `${apiUrl}/${path}`);
    apiUrlServiceSpy.getTrainingsUrl.and.returnValue(fullApiUrl);
    apiUrlServiceSpy.getResourceUrl.and.callFake((baseUrl: string, id: string) => `${baseUrl}/${id}`);

    const cacheServiceSpy = jasmine.createSpyObj('CacheService', ['get', 'set', 'has', 'remove', 'clearByPrefix']);
    const trainingCacheSpy = jasmine.createSpyObj('TrainingCacheService', [
      'getAllTrainings', 'getTraining', 'cacheTraining', 'cacheAllTrainings', 'invalidateTraining', 'invalidateCache'
    ]);
    const modelAdapterSpy = jasmine.createSpyObj('ModelAdapterService', ['normalizeTraining', 'prepareForApi']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        EntrainementOptimizedService,
        HttpGenericService,
        { provide: ApiUrlService, useValue: apiUrlServiceSpy },
        { provide: CacheService, useValue: cacheServiceSpy },
        { provide: TrainingCacheService, useValue: trainingCacheSpy },
        { provide: ModelAdapterService, useValue: modelAdapterSpy }
      ]
    });

    // Récupération des instances de services
    service = TestBed.inject(EntrainementOptimizedService);
    httpMock = TestBed.inject(HttpTestingController);
    apiUrlService = TestBed.inject(ApiUrlService) as jasmine.SpyObj<ApiUrlService>;
    cacheService = TestBed.inject(CacheService) as jasmine.SpyObj<CacheService>;
    trainingCache = TestBed.inject(TrainingCacheService) as jasmine.SpyObj<TrainingCacheService>;
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

  // Test 2: Vérifier la récupération de tous les entraînements (avec cache TrainingCache)
  it('devrait récupérer tous les entraînements depuis le cache TrainingCache si disponible', () => {
    const mockEntrainements: EntrainementEntity[] = [
      { id: '1', titre: 'Entraînement 1' },
      { id: '2', titre: 'Entraînement 2' }
    ];
    
    // Configurer le mock du TrainingCache pour retourner des données
    trainingCache.getAllTrainings.and.returnValue(mockEntrainements);
    
    // Appeler la méthode à tester
    service.getAllEntrainements().subscribe(entrainements => {
      expect(entrainements).toEqual(mockEntrainements);
      expect(entrainements.length).toBe(2);
    });
    
    // Vérifier que le cache TrainingCache a été consulté
    expect(trainingCache.getAllTrainings).toHaveBeenCalled();
    
    // Vérifier qu'aucune requête HTTP n'a été effectuée
    httpMock.expectNone(`${fullApiUrl}`);
  });

  // Test 3: Vérifier la récupération de tous les entraînements (sans cache)
  it('devrait récupérer tous les entraînements depuis l\'API si pas dans le cache', () => {
    const mockEntrainements: EntrainementEntity[] = [
      { id: '1', titre: 'Entraînement 1' },
      { id: '2', titre: 'Entraînement 2' }
    ];
    
    // Configurer le mock du TrainingCache pour ne pas retourner de données
    trainingCache.getAllTrainings.and.returnValue(null);
    
    // Configurer le mock de l'adaptateur de modèle
    modelAdapter.normalizeTraining.and.callFake(data => data);
    
    // Appeler la méthode à tester
    service.getAllEntrainements().subscribe(entrainements => {
      expect(entrainements).toEqual(mockEntrainements);
      expect(entrainements.length).toBe(2);
    });
    
    // Vérifier que le cache TrainingCache a été consulté
    expect(trainingCache.getAllTrainings).toHaveBeenCalled();
    
    // Vérifier qu'une requête HTTP a été effectuée
    const req = httpMock.expectOne(`${fullApiUrl}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockEntrainements);
    
    // Vérifier que les données ont été mises en cache
    expect(trainingCache.cacheAllTrainings).toHaveBeenCalledWith(mockEntrainements);
  });

  // Test 4: Vérifier la récupération d'un entraînement par ID (avec cache TrainingCache)
  it('devrait récupérer un entraînement par ID depuis le cache TrainingCache si disponible', () => {
    const mockEntrainement: EntrainementEntity = { id: '1', titre: 'Entraînement 1' };
    const id = '1';
    
    // Configurer le mock du TrainingCache pour retourner des données
    trainingCache.getTraining.and.returnValue(mockEntrainement);
    
    // Appeler la méthode à tester
    service.getEntrainementById(id).subscribe(entrainement => {
      expect(entrainement).toEqual(mockEntrainement);
    });
    
    // Vérifier que le cache TrainingCache a été consulté avec le bon ID
    expect(trainingCache.getTraining).toHaveBeenCalledWith(id);
    
    // Vérifier qu'aucune requête HTTP n'a été effectuée
    httpMock.expectNone(`${fullApiUrl}/${id}`);
  });

  // Test 5: Vérifier la récupération d'un entraînement par ID (sans cache)
  it('devrait récupérer un entraînement par ID depuis l\'API si pas dans le cache', () => {
    const mockEntrainement: EntrainementEntity = { id: '1', titre: 'Entraînement 1' };
    const id = '1';
    
    // Configurer le mock du TrainingCache pour ne pas retourner de données
    trainingCache.getTraining.and.returnValue(null);
    
    // Configurer le mock de l'adaptateur de modèle
    modelAdapter.normalizeTraining.and.callFake(data => data);
    
    // Appeler la méthode à tester
    service.getEntrainementById(id).subscribe(entrainement => {
      expect(entrainement).toEqual(mockEntrainement);
    });
    
    // Vérifier que le cache TrainingCache a été consulté
    expect(trainingCache.getTraining).toHaveBeenCalledWith(id);
    
    // Vérifier qu'une requête HTTP a été effectuée
    const req = httpMock.expectOne(`${fullApiUrl}/${id}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockEntrainement);
    
    // Vérifier que les données ont été mises en cache
    expect(trainingCache.cacheTraining).toHaveBeenCalledWith(id, mockEntrainement);
  });

  // Test 6: Vérifier la création d'un entraînement
  it('devrait créer un nouvel entraînement', () => {
    const newEntrainement: EntrainementFormDataEntity = { 
      titre: 'Nouvel entraînement',
      date: '2025-01-01' 
    };
    const createdEntrainement: EntrainementEntity = { 
      id: '3', 
      titre: 'Nouvel entraînement',
      date: '2025-01-01' 
    };
    
    // Configurer le mock de l'adaptateur de modèle
    modelAdapter.prepareForApi.and.returnValue(newEntrainement);
    modelAdapter.normalizeTraining.and.returnValue(createdEntrainement);
    
    // Appeler la méthode à tester
    service.createEntrainement(newEntrainement).subscribe(entrainement => {
      expect(entrainement).toEqual(createdEntrainement);
    });
    
    // Vérifier qu'une requête HTTP a été effectuée
    const req = httpMock.expectOne(`${fullApiUrl}`);
    expect(req.request.method).toBe('POST');
    req.flush(createdEntrainement);
    
    // Vérifier que le cache a été invalidé
    expect(trainingCache.invalidateCache).toHaveBeenCalled();
  });

  // Test 7: Vérifier la mise à jour d'un entraînement
  it('devrait mettre à jour un entraînement existant', () => {
    const id = '1';
    const updatedData: EntrainementFormDataEntity = { 
      titre: 'Entraînement mis à jour',
      theme: 'Nouveau thème' 
    };
    const updatedEntrainement: EntrainementEntity = { 
      id: id, 
      titre: 'Entraînement mis à jour',
      theme: 'Nouveau thème' 
    };
    
    // Configurer le mock de l'adaptateur de modèle
    modelAdapter.prepareForApi.and.returnValue(updatedData);
    modelAdapter.normalizeTraining.and.returnValue(updatedEntrainement);
    
    // Appeler la méthode à tester
    service.updateEntrainement(id, updatedData).subscribe(entrainement => {
      expect(entrainement).toEqual(updatedEntrainement);
    });
    
    // Vérifier qu'une requête HTTP a été effectuée
    const req = httpMock.expectOne(`${fullApiUrl}/${id}`);
    expect(req.request.method).toBe('PUT');
    req.flush(updatedEntrainement);
    
    // Vérifier que le cache a été invalidé spécifiquement pour cet entraînement
    expect(trainingCache.invalidateTraining).toHaveBeenCalledWith(id);
  });

  // Test 8: Vérifier la suppression d'un entraînement
  it('devrait supprimer un entraînement existant', () => {
    const id = '1';
    
    // Appeler la méthode à tester
    service.deleteEntrainement(id).subscribe();
    
    // Vérifier qu'une requête HTTP a été effectuée
    const req = httpMock.expectOne(`${fullApiUrl}/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    
    // Vérifier que le cache a été invalidé spécifiquement pour cet entraînement
    expect(trainingCache.invalidateTraining).toHaveBeenCalledWith(id);
  });

  // Test 9: Vérifier la duplication d'un entraînement
  it('devrait dupliquer un entraînement existant', () => {
    const id = '1';
    const options = { titre: 'Copie de l\'entraînement', date: '2025-02-01' };
    const duplicatedEntrainement: EntrainementEntity = { 
      id: '4', 
      titre: 'Copie de l\'entraînement',
      date: '2025-02-01' 
    };
    
    // Configurer le mock de l'adaptateur de modèle
    modelAdapter.prepareForApi.and.returnValue(options);
    modelAdapter.normalizeTraining.and.returnValue(duplicatedEntrainement);
    
    // Appeler la méthode à tester
    service.duplicateEntrainement(id, options).subscribe(entrainement => {
      expect(entrainement).toEqual(duplicatedEntrainement);
    });
    
    // Vérifier qu'une requête HTTP a été effectuée
    const req = httpMock.expectOne(`${fullApiUrl}/${id}/duplicate`);
    expect(req.request.method).toBe('POST');
    req.flush(duplicatedEntrainement);
    
    // Vérifier que les caches ont été invalidés
    expect(trainingCache.invalidateCache).toHaveBeenCalled();
  });

  // Test 10: Vérifier le comportement en cas d'ID manquant
  it('devrait retourner une erreur si l\'ID est manquant', (done) => {
    service.getEntrainementById('').subscribe({
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
