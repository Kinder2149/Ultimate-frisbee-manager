import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { switchMap, map, tap, catchError } from 'rxjs/operators';
import { PhaseExercice, PhaseExerciceFormData, ExerciceElement } from './training.models';
import { environment } from '../../../../environments/environment';
import { CacheService } from '../../../core/services/cache.service';
import { ModelAdapterService } from './model-adapter.service';

/**
 * Service pour la gestion des exercices dans les phases d'entraînement
 */
@Injectable({
  providedIn: 'root'
})
export class PhaseExerciceService {
  private apiUrl = `${environment.apiUrl}/phase-exercices`;
  
  // Préfixe pour les clés de cache
  private readonly CACHE_PREFIX = 'phase-exercices';
  
  // TTL du cache en secondes (2 minutes)
  private readonly CACHE_TTL = 120;

  constructor(
    private http: HttpClient,
    private cacheService: CacheService,
    private modelAdapter: ModelAdapterService
  ) { }
  
  /**
   * Invalide le cache des exercices de phase
   */
  private invalidateCache(): void {
    const count = this.cacheService.clearByPrefix(this.CACHE_PREFIX);
    console.debug(`[PhaseExerciceService] Cache invalidé (${count} entrées supprimées)`);
  }

  /**
   * Invalide le cache pour une phase spécifique
   * @param phaseId ID de la phase
   */
  private invalidatePhaseCache(phaseId: string): void {
    if (!phaseId) return;
    
    const cacheKey = `${this.CACHE_PREFIX}.phase.${phaseId}`;
    this.cacheService.remove(cacheKey);
    console.debug(`[PhaseExerciceService] Cache invalidé pour la phase ${phaseId}`);
  }

  /**
   * Gère les erreurs HTTP pour éviter que l'application ne plante
   * @param operation Nom de l'opération qui a échoué
   * @param result Valeur à retourner en cas d'erreur (optionnel)
   */
  private handleError<T>(operation = 'opération', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`[PhaseExerciceService] ${operation} a échoué:`, error);
      
      // Journaliser l'erreur de manière structurée
      console.error({
        service: 'PhaseExerciceService',
        operation,
        error: error.message,
        status: error.status,
        url: error.url || 'N/A'
      });

      // Laisser le intercepteur global gérer l'affichage de l'erreur à l'utilisateur
      
      // Retourner un résultat par défaut ou relancer l'erreur
      return result !== undefined ? of(result) : throwError(() => new Error(
        `L'opération ${operation} a échoué: ${error.message}`));
    };
  }

  /**
   * Récupère un exercice de phase par son ID
   * Utilise le cache pour optimiser les performances
   * @param id ID de l'exercice de phase
   */
  getPhaseExerciceById(id: string): Observable<PhaseExercice> {
    if (!id) {
      console.error('[PhaseExerciceService] getPhaseExerciceById appelé sans ID');
      return throwError(() => new Error('ID d\'exercice de phase requis'));
    }
    
    const cacheKey = `${this.CACHE_PREFIX}.${id}`;
    
    // Vérifier si les données sont en cache
    const cachedData = this.cacheService.get<PhaseExercice>(cacheKey);
    if (cachedData) {
      console.debug(`[PhaseExerciceService] Utilisation du cache pour l'exercice de phase ${id}`);
      return of(cachedData);
    }
    
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(exercice => this.modelAdapter.normalizePhaseExercice(exercice)),
      tap(exercice => {
        // Mettre en cache le résultat
        this.cacheService.set({ key: cacheKey, ttl: this.CACHE_TTL }, exercice);
      }),
      catchError(this.handleError<PhaseExercice>(`getPhaseExerciceById id=${id}`))
    );
  }

  /**
   * Récupère tous les exercices disponibles dans la base de données
   * Utilise le cache pour optimiser les performances
   */
  getAllExercices(): Observable<PhaseExercice[]> {
    const cacheKey = `${this.CACHE_PREFIX}.all`;
    
    // Vérifier si les données sont en cache
    const cachedData = this.cacheService.get<PhaseExercice[]>(cacheKey);
    if (cachedData) {
      console.debug(`[PhaseExerciceService] Utilisation du cache pour tous les exercices`);
      return of(cachedData);
    }
    
    const exerciceDatabaseUrl = `${environment.apiUrl}/exercices`;
    
    return this.http.get<any[]>(exerciceDatabaseUrl).pipe(
      map(exercices => exercices.map(exercice => this.modelAdapter.normalizePhaseExercice(exercice))),
      tap(exercices => {
        // Mettre en cache le résultat
        this.cacheService.set({ key: cacheKey, ttl: this.CACHE_TTL }, exercices);
      }),
      catchError(this.handleError<PhaseExercice[]>(`getAllExercices`, []))
    );
  }

  /**
   * Récupère tous les exercices d'une phase
   * Utilise le cache pour optimiser les performances
   * @param phaseId ID de la phase
   */
  getExercicesByPhase(phaseId: string): Observable<PhaseExercice[]> {
    if (!phaseId) {
      console.error('[PhaseExerciceService] getExercicesByPhase appelé sans ID de phase');
      return throwError(() => new Error('ID de phase requis'));
    }
    
    const cacheKey = `${this.CACHE_PREFIX}.phase.${phaseId}`;
    
    // Vérifier si les données sont en cache
    const cachedData = this.cacheService.get<PhaseExercice[]>(cacheKey);
    if (cachedData) {
      console.debug(`[PhaseExerciceService] Utilisation du cache pour les exercices de la phase ${phaseId}`);
      return of(cachedData);
    }
    
    return this.http.get<any[]>(`${environment.apiUrl}/phases/${phaseId}/exercices`).pipe(
      map(exercices => exercices.map(exercice => this.modelAdapter.normalizePhaseExercice(exercice))),
      tap(exercices => {
        // Mettre en cache les résultats
        this.cacheService.set({ key: cacheKey, ttl: this.CACHE_TTL }, exercices);
        console.debug(`[PhaseExerciceService] ${exercices.length} exercices mis en cache pour la phase ${phaseId}`);
      }),
      catchError(this.handleError<PhaseExercice[]>(`getExercicesByPhase phaseId=${phaseId}`, []))
    );
  }

  /**
   * Ajoute un exercice à une phase
   * @param phaseId ID de la phase
   * @param exercice Données de l'exercice à ajouter
   * @param ordre Position de l'exercice dans la phase
   */
  addExerciceToPhase(
    phaseId: string, 
    exercice: PhaseExerciceFormData, 
    ordre: number
  ): Observable<PhaseExercice> {
    if (!phaseId) {
      console.error('[PhaseExerciceService] addExerciceToPhase appelé sans ID de phase');
      return throwError(() => new Error('ID de phase requis'));
    }
    
    // Préparer les données pour l'API
    const exerciceForApi = this.modelAdapter.prepareForApi({
      ...exercice,
      ordre: ordre || 0
    });
    
    return this.http.post<any>(
      `${environment.apiUrl}/phases/${phaseId}/exercices`, 
      exerciceForApi
    ).pipe(
      map(response => this.modelAdapter.normalizePhaseExercice(response)),
      tap(_ => {
        // Invalider le cache pour forcer un rafraîchissement
        this.invalidatePhaseCache(phaseId);
      }),
      catchError(this.handleError<PhaseExercice>(`addExerciceToPhase phaseId=${phaseId}`))
    );
  }

  /**
   * Met à jour un exercice de phase
   * @param id ID de l'exercice de phase
   * @param exercice Données de mise à jour
   * @param saveToDatabase Si true, sauvegarde également l'exercice dans la base de données globale
   */
  updatePhaseExercice(
    id: string, 
    exercice: Partial<PhaseExerciceFormData & {
      tags?: string[], 
      elements?: ExerciceElement[],
      addToDatabase?: boolean
    }>
  ): Observable<PhaseExercice> {
    if (!id) {
      console.error('[PhaseExerciceService] updatePhaseExercice appelé sans ID');
      return throwError(() => new Error('ID d\'exercice de phase requis'));
    }
    
    // Si l'exercice doit être ajouté à la base de données globale
    if (exercice.addToDatabase) {
      return this.saveToExerciceDatabase(exercice).pipe(
        switchMap(savedExercice => {
          // Mise à jour avec l'ID du nouvel exercice dans la base
          const updatedData = this.modelAdapter.prepareForApi({
            ...exercice,
            exerciceId: savedExercice.id
          });
          
          return this.http.put<any>(`${this.apiUrl}/${id}`, updatedData).pipe(
            map(response => this.modelAdapter.normalizePhaseExercice(response)),
            tap(updatedExercice => {
              // Invalider le cache pour forcer un rafraîchissement
              this.invalidateCache();
              this.cacheService.remove(`${this.CACHE_PREFIX}.${id}`);
              
              if (updatedExercice && updatedExercice.phaseId) {
                this.invalidatePhaseCache(updatedExercice.phaseId);
              }
            }),
            catchError(this.handleError<PhaseExercice>(`updatePhaseExercice id=${id} with database save`))
          );
        })
      );
    } else {
      // Mise à jour normale
      const exerciceForApi = this.modelAdapter.prepareForApi(exercice);
      
      return this.http.put<any>(`${this.apiUrl}/${id}`, exerciceForApi).pipe(
        map(response => this.modelAdapter.normalizePhaseExercice(response)),
        tap(updatedExercice => {
          // Invalider le cache pour forcer un rafraîchissement
          this.invalidateCache();
          this.cacheService.remove(`${this.CACHE_PREFIX}.${id}`);
          
          if (updatedExercice && updatedExercice.phaseId) {
            this.invalidatePhaseCache(updatedExercice.phaseId);
          }
        }),
        catchError(this.handleError<PhaseExercice>(`updatePhaseExercice id=${id}`))
      );
    }
  }

  /**
   * Supprime un exercice d'une phase
   * @param id ID de l'exercice de phase
   */
  deletePhaseExercice(id: string): Observable<void> {
    if (!id) {
      console.error('[PhaseExerciceService] deletePhaseExercice appelé sans ID');
      return throwError(() => new Error('ID d\'exercice de phase requis'));
    }
    
    // D'abord récupérer l'exercice pour connaître sa phaseId
    return this.getPhaseExerciceById(id).pipe(
      tap((exercice: PhaseExercice) => {
        // Mémoriser l'ID de la phase pour invalider son cache plus tard
        if (exercice && exercice.phaseId) {
          this.invalidatePhaseCache(exercice.phaseId);
        }
      }),
      switchMap((exercice: PhaseExercice) => this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
        tap(_ => {
          // Invalider le cache pour forcer un rafraîchissement
          this.invalidateCache();
          // Supprimer spécifiquement l'entrée de cet exercice
          this.cacheService.remove(`${this.CACHE_PREFIX}.${id}`);
        }),
        catchError(this.handleError<void>(`deletePhaseExercice id=${id}`))
      ))
    );
  }

  /**
   * Réordonne un exercice dans la phase
   * @param id ID de l'exercice à réordonner
   * @param newOrdre Nouvel ordre de l'exercice
   */
  reorderPhaseExercice(id: string, newOrdre: number): Observable<PhaseExercice> {
    if (!id) {
      console.error('[PhaseExerciceService] reorderPhaseExercice appelé sans ID');
      return throwError(() => new Error('ID d\'exercice de phase requis'));
    }
    
    return this.http.put<any>(`${this.apiUrl}/${id}`, { ordre: newOrdre }).pipe(
      map(response => this.modelAdapter.normalizePhaseExercice(response)),
      tap(updatedExercice => {
        // Invalider le cache pour forcer un rafraîchissement
        this.invalidateCache();
        // Supprimer spécifiquement l'entrée de cet exercice
        this.cacheService.remove(`${this.CACHE_PREFIX}.${id}`);
        
        if (updatedExercice && updatedExercice.phaseId) {
          this.invalidatePhaseCache(updatedExercice.phaseId);
        }
      }),
      catchError(this.handleError<PhaseExercice>(`reorderPhaseExercice id=${id} ordre=${newOrdre}`))
    );
  }
  
  /**
   * Crée un nouvel exercice dans le système
   * @param exercice Les données du nouvel exercice à créer
   * @param addToDatabase Si true, ajoute également l'exercice à la base de données globale
   */
  createExercice(exercice: PhaseExerciceFormData & {
    tags?: string[],
    elements?: ExerciceElement[],
    addToDatabase?: boolean
  }): Observable<PhaseExercice> {
    // Préparer les données pour l'API
    const exerciceData = this.modelAdapter.prepareForApi(exercice);
    
    // Si l'exercice doit être ajouté à la base de données globale
    if (exercice.addToDatabase) {
      return this.saveToExerciceDatabase(exercice).pipe(
        switchMap(createdExercice => {
          // Ajouter l'exercice à la phase
          if (exercice.phaseId) {
            return this.addExerciceToPhase(exercice.phaseId, exercice, exercice.ordre || 0);
          } else {
            return of(createdExercice);
          }
        })
      );
    } else {
      // Création simple d'un exercice pour une phase
      if (exercice.phaseId) {
        return this.addExerciceToPhase(exercice.phaseId, exercice, exercice.ordre || 0);
      } else {
        // Création d'un exercice sans phase (rare)
        return this.http.post<any>(`${this.apiUrl}`, exerciceData).pipe(
          map(response => this.modelAdapter.normalizePhaseExercice(response)),
          tap(newExercice => {
            // Invalider le cache
            this.invalidateCache();
          }),
          catchError(this.handleError<PhaseExercice>('createExercice'))
        );
      }
    }
  }

  /**
   * Sauvegarde un exercice dans la base de données globale des exercices
   * @param exercice Les données de l'exercice à sauvegarder
   */
  private saveToExerciceDatabase(exercice: Partial<PhaseExerciceFormData & {
    tags?: string[], 
    elements?: ExerciceElement[]
  }>): Observable<any> {
    // URL pour la base de données globale des exercices
    const exerciceDatabaseUrl = `${environment.apiUrl}/exercices`;
    
    // Préparer les données à envoyer à l'API avec le ModelAdapterService
    const exerciceData = this.modelAdapter.prepareForApi({
      nom: exercice.nom,
      description: exercice.description,
      duree: exercice.duree,
      variables: exercice.variables,
      notesPerso: exercice.notesPerso,
      notesOrales: exercice.notesOrales,
      tags: exercice.tags || [],
      elements: exercice.elements || []
    });
    
    return this.http.post<any>(exerciceDatabaseUrl, exerciceData).pipe(
      map(response => this.modelAdapter.normalizePhaseExercice(response)),
      catchError(this.handleError<any>('saveToExerciceDatabase'))
    );
  }
}
