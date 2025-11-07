import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { CacheService } from '../../../core/services/cache.service';
import { ApiUrlService } from '../../../core/services/api-url.service';
import { ModelAdapterService } from './model-adapter.service';
import { EntityCrudService } from '../../../shared/services/entity-crud.service';
import { Phase } from './training.models';
import { 
  PhaseEntity, 
  PhaseFormDataEntity, 
  PhaseDuplicateOptions, 
  PhaseReorderOptions 
} from './phase-entity.models';
import { environment } from '../../../../environments/environment';

/**
 * Service optimisé pour la gestion des phases d'entraînement
 * Utilise le pattern EntityCrudService pour les opérations CRUD standard
 */
@Injectable({
  providedIn: 'root'
})
export class PhaseOptimizedService {
  // Service CRUD générique pour les phases
  private entityService: EntityCrudService<PhaseEntity, PhaseFormDataEntity>;
  
  // URL de l'API pour les phases (corrigée pour correspondre aux routes réelles)
  private apiUrl = `${environment.apiUrl}/entrainements`;
  
  // Préfixe pour les clés de cache
  private readonly CACHE_PREFIX = 'phases';
  
  // TTL du cache en secondes (2 minutes)
  private readonly CACHE_TTL = 120;

  constructor(
    private http: HttpClient,
    private cacheService: CacheService,
    private apiUrlService: ApiUrlService,
    private modelAdapter: ModelAdapterService
  ) {
    // Initialisation du service CRUD générique
    this.entityService = new EntityCrudService<PhaseEntity, PhaseFormDataEntity>(
      http,
      cacheService,
      {
        apiUrl: this.apiUrl,
        cacheTtl: this.CACHE_TTL,
        cachePrefix: this.CACHE_PREFIX,
        transformResponseFn: (data: any) => this.modelAdapter.normalizePhase(data) as PhaseEntity,
        transformRequestFn: (entity: Partial<PhaseFormDataEntity>) => this.modelAdapter.prepareForApi(entity)
      }
    );
  }
  
  /**
   * Récupère une phase par son ID
   * @param id ID de la phase
   */
  getPhaseById(id: string): Observable<PhaseEntity> {
    if (!id) {
      console.error('[PhaseOptimizedService] getPhaseById appelé sans ID');
      return throwError(() => new Error('ID de phase requis'));
    }
    
    // Vérifier s'il s'agit d'un ID temporaire (ne pas faire d'appel API)
    if (id.startsWith('new-')) {
      console.warn(`[PhaseOptimizedService] Tentative d'accès à une phase temporaire (${id}) - retourne un Observable vide`);
      return of({} as PhaseEntity);
    }
    
    // Utiliser le service CRUD générique
    return this.entityService.getById(id);
  }
  
  /**
   * Récupère toutes les phases d'un entraînement
   * @param entrainementId ID de l'entraînement
   */
  getPhasesByEntrainement(entrainementId: string): Observable<PhaseEntity[]> {
    if (!entrainementId) {
      console.error('[PhaseOptimizedService] getPhasesByEntrainement appelé sans entrainementId');
      return throwError(() => new Error('ID d\'entraînement requis'));
    }
    
    // Vérifier si les données sont en cache
    const cacheKey = `${this.CACHE_PREFIX}.entrainement.${entrainementId}`;
    const cachedData = this.cacheService.get<PhaseEntity[]>(cacheKey);
    if (cachedData) {
      console.debug(`[PhaseOptimizedService] Utilisation du cache pour l'entraînement ${entrainementId}`);
      return of(cachedData);
    }
    
    // Faire une requête API spécifique pour récupérer les phases d'un entraînement
    const url = `${environment.apiUrl}/trainings/${entrainementId}/phases`;
    return this.http.get<any[]>(url).pipe(
      map(phases => phases.map(phase => this.modelAdapter.normalizePhase(phase) as PhaseEntity)),
      map(phases => {
        // Trier les phases par ordre croissant
        return phases.sort((a, b) => (a.ordre || 0) - (b.ordre || 0));
      }),
      map(phases => {
        // Mettre en cache le résultat
        this.cacheService.set({ key: cacheKey, ttl: this.CACHE_TTL }, phases);
        return phases;
      })
    );
  }
  
  /**
   * Crée une nouvelle phase dans un entraînement
   * @param entrainementId ID de l'entraînement
   * @param phase Données de la phase à créer
   * @param ordre Position de la phase dans l'entraînement
   */
  createPhase(
    entrainementId: string, 
    phase: PhaseFormDataEntity, 
    ordre?: number
  ): Observable<PhaseEntity> {
    if (!entrainementId) {
      return throwError(() => new Error('ID d\'entraînement requis'));
    }
    
    // Préparer les données avec l'ID de l'entraînement et l'ordre
    const phaseData: PhaseFormDataEntity = {
      ...phase,
      entrainementId,
      ordre: ordre !== undefined ? ordre : 0
    };
    
    // Utiliser le service CRUD générique pour créer la phase
    return this.entityService.create(phaseData).pipe(
      map(createdPhase => {
        // Invalider également le cache des phases par entraînement
        const cacheKey = `${this.CACHE_PREFIX}.entrainement.${entrainementId}`;
        this.cacheService.remove(cacheKey);
        
        return createdPhase;
      })
    );
  }
  
  /**
   * Met à jour une phase existante
   * @param id ID de la phase à mettre à jour
   * @param phase Données de mise à jour
   */
  updatePhase(id: string, phase: Partial<PhaseFormDataEntity>): Observable<PhaseEntity> {
    if (!id) {
      return throwError(() => new Error('ID de phase requis'));
    }
    
    // Vérifier s'il s'agit d'un ID temporaire (ne pas faire d'appel API)
    if (id.startsWith('new-')) {
      console.warn(`[PhaseOptimizedService] Tentative de mise à jour d'une phase temporaire (${id}) - retourne les données modifiées sans appel API`);
      return of({...phase, id} as unknown as PhaseEntity);
    }
    
    // On récupère d'abord les données de la phase pour connaître son entrainementId
    return this.getPhaseById(id).pipe(
      switchMap(existingPhase => {
        // Utiliser le service CRUD générique pour mettre à jour la phase
        return this.entityService.update(id, phase).pipe(
          map(updatedPhase => {
            // Invalider également le cache des phases par entraînement
            if (existingPhase.entrainementId) {
              const cacheKey = `${this.CACHE_PREFIX}.entrainement.${existingPhase.entrainementId}`;
              this.cacheService.remove(cacheKey);
            }
            
            return updatedPhase;
          })
        );
      })
    );
  }
  
  /**
   * Supprime une phase
   * @param id ID de la phase à supprimer
   */
  deletePhase(id: string): Observable<void> {
    if (!id) {
      return throwError(() => new Error('ID de phase requis'));
    }
    
    // Vérifier s'il s'agit d'un ID temporaire (ne pas faire d'appel API)
    if (id.startsWith('new-')) {
      console.warn(`[PhaseOptimizedService] Tentative de suppression d'une phase temporaire (${id}) - aucun appel API nécessaire`);
      return of(void 0);
    }
    
    // On récupère d'abord les données de la phase pour connaître son entrainementId
    return this.getPhaseById(id).pipe(
      switchMap(phase => {
        // Utiliser le service CRUD générique pour supprimer la phase
        return this.entityService.delete(id).pipe(
          map(() => {
            // Invalider également le cache des phases par entraînement
            if (phase.entrainementId) {
              const cacheKey = `${this.CACHE_PREFIX}.entrainement.${phase.entrainementId}`;
              this.cacheService.remove(cacheKey);
            }
            
            return void 0;
          })
        );
      })
    );
  }
  
  /**
   * Réordonne une phase dans l'entraînement
   * @param id ID de la phase à réordonner
   * @param newOrdre Nouvel ordre de la phase
   */
  reorderPhase(id: string, newOrdre: number): Observable<PhaseEntity> {
    if (!id) {
      return throwError(() => new Error('ID de phase requis'));
    }
    
    // Vérifier s'il s'agit d'un ID temporaire (ne pas faire d'appel API)
    if (id.startsWith('new-')) {
      console.warn(`[PhaseOptimizedService] Tentative de réordonnancement d'une phase temporaire (${id}) - retourne les données modifiées sans appel API`);
      return of({id, ordre: newOrdre} as unknown as PhaseEntity);
    }
    
    const options: PhaseReorderOptions = { ordre: newOrdre };
    
    // On récupère d'abord les données de la phase pour connaître son entrainementId
    return this.getPhaseById(id).pipe(
      switchMap(phase => {
        // Utiliser le service CRUD générique pour mettre à jour l'ordre
        return this.entityService.update(id, options).pipe(
          map(updatedPhase => {
            // Invalider également le cache des phases par entraînement
            if (phase.entrainementId) {
              const cacheKey = `${this.CACHE_PREFIX}.entrainement.${phase.entrainementId}`;
              this.cacheService.remove(cacheKey);
            }
            
            return updatedPhase;
          })
        );
      })
    );
  }
}
