import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TrainingSimple, TrainingSimpleCreate } from '../models/training.simple';
import { EntityCrudService } from '../../shared/services/entity-crud.service';
import { HttpGenericService } from '../../shared/services/http-generic.service';
import { CacheService } from './cache.service';

/**
 * Service simplifié pour la gestion des entraînements
 * 
 * @description
 * Ce service fournit une interface simplifiée pour la gestion des entraînements
 * en utilisant le service CRUD générique. Il gère le cache et la transformation
 * des données pour correspondre au modèle de données attendu par le backend.
 * 
 * @example
 * // Utilisation typique dans un composant
 * constructor(private trainingService: TrainingSimpleService) {}
 * 
 * // Récupérer tous les entraînements
 * this.trainingService.getAllTrainings().subscribe(trainings => {
 *   this.trainings = trainings;
 * });
 */
@Injectable({
  providedIn: 'root'
})
export class TrainingSimpleService {
  /** Service CRUD générique pour les opérations de base */
  private readonly crudService: EntityCrudService<TrainingSimple>;
  
  /** Endpoint de l'API pour les entraînements */
  private readonly endpoint = 'entrainements-simple';

  /**
   * Initialise une nouvelle instance du service TrainingSimpleService
   * 
   * @param httpService Service HTTP générique pour les appels API
   * @param cacheService Service de gestion du cache
   */
  constructor(
    private readonly httpService: HttpGenericService,
    private readonly cacheService: CacheService
  ) {
    // Configuration du service CRUD générique avec les options appropriées
    this.crudService = new EntityCrudService<TrainingSimple>(httpService, cacheService)
      .configure(this.endpoint, {
        cachePrefix: 'training',
        cacheTTL: 300, // 5 minutes
        useCache: true,
        // S'assure que seul le titre est envoyé au backend lors des opérations d'update/create
        transformBeforeSend: (entity: TrainingSimple): Partial<TrainingSimple> => ({
          titre: entity.titre
        })
      });
  }

  /**
   * Récupère la liste des entraînements simplifiés
   * 
   * @returns {Observable<TrainingSimple[]>} Observable émettant un tableau d'entraînements
   * 
   * @example
   * // Récupérer tous les entraînements
   * this.trainingService.getAllTrainings().subscribe({
   *   next: (trainings) => console.log('Entraînements chargés:', trainings),
   *   error: (error) => console.error('Erreur lors du chargement des entraînements', error)
   * });
   */
  public getAllTrainings(): Observable<TrainingSimple[]> {
    return this.crudService.getAll();
  }

  /**
   * Crée un nouvel entraînement avec uniquement un titre
   * 
   * @param {TrainingSimpleCreate} training - Données minimales de l'entraînement (titre uniquement)
   * @returns {Observable<TrainingSimple>} Observable émettant l'entraînement créé avec son ID
   * 
   * @throws {Error} Si les données de l'entraînement sont invalides
   */
  public createTraining(training: TrainingSimpleCreate): Observable<TrainingSimple> {
    if (!training?.titre?.trim()) {
      throw new Error('Le titre de l\'entraînement est requis');
    }
    
    // Force l'invalidation du cache pour s'assurer que getAll récupère des données fraîches
    this.invalidateCache();
    
    // Conversion sûre du type TrainingSimpleCreate vers TrainingSimple
    const trainingToCreate: TrainingSimple = {
      ...training,
      id: '', // L'ID sera généré par le backend
      date: training.date || new Date().toISOString().split('T')[0] // Date du jour par défaut
    };
    
    return this.crudService.create(trainingToCreate);
  }

  /**
   * Supprime un entraînement par son ID
   * 
   * @param {string} id - Identifiant unique de l'entraînement à supprimer
   * @returns {Observable<void>} Observable qui se complète une fois la suppression effectuée
   * 
   * @throws {Error} Si l'ID fourni est invalide
   */
  public deleteTraining(id: string): Observable<void> {
    if (!id?.trim()) {
      throw new Error('Un identifiant valide est requis pour supprimer un entraînement');
    }
    
    // Force l'invalidation du cache pour s'assurer que getAll récupère des données fraîches
    this.invalidateCache();
    return this.crudService.delete(id);
  }

  /**
   * Récupère un entraînement par son ID
   * 
   * @param {string} id - Identifiant unique de l'entraînement à récupérer
   * @returns {Observable<TrainingSimple>} Observable émettant l'entraînement demandé
   * 
   * @throws {Error} Si l'ID fourni est invalide
   */
  public getTrainingById(id: string): Observable<TrainingSimple> {
    if (!id?.trim()) {
      throw new Error('Un identifiant valide est requis pour récupérer un entraînement');
    }
    
    return this.crudService.getById(id);
  }

  /**
   * Met à jour un entraînement existant
   * 
   * @param {string} id - Identifiant unique de l'entraînement à mettre à jour
   * @param {TrainingSimpleCreate} training - Nouvelles données de l'entraînement
   * @returns {Observable<TrainingSimple>} Observable émettant l'entraînement mis à jour
   * 
   * @throws {Error} Si l'ID ou les données sont invalides
   */
  public updateTraining(id: string, training: TrainingSimpleCreate): Observable<TrainingSimple> {
    if (!id?.trim()) {
      throw new Error('Un identifiant valide est requis pour mettre à jour un entraînement');
    }
    
    if (!training?.titre?.trim()) {
      throw new Error('Le titre de l\'entraînement est requis');
    }
    
    // Force l'invalidation du cache pour s'assurer que getAll récupère des données fraîches
    this.invalidateCache();
    
    // Conversion sûre du type TrainingSimpleCreate vers TrainingSimple
    const trainingToUpdate: TrainingSimple = {
      ...training,
      id // On s'assure que l'ID est bien défini
    };
    
    return this.crudService.update(id, trainingToUpdate);
  }
  
  /**
   * Invalide manuellement le cache pour les entraînements
   * 
   * @description
   * Cette méthode est utile après des opérations en masse ou des modifications externes
   * pour forcer le rechargement des données depuis le serveur.
   * 
   * @returns {void}
   */
  public invalidateCache(): void {
    try {
      // Utilisation d'une assertion de type sécurisée pour accéder à la méthode privée
      const crudService = this.crudService as unknown as {
        invalidateListCache: (options: { cachePrefix: string }) => void;
      };
      
      if (typeof crudService.invalidateListCache === 'function') {
        crudService.invalidateListCache({ cachePrefix: 'training' });
      } else {
        console.warn('La méthode invalidateListCache n\'est pas disponible sur le service CRUD');
      }
    } catch (error) {
      console.error('Erreur lors de l\'invalidation du cache:', error);
    }
  }
}
