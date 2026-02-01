import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, forkJoin, of } from 'rxjs';
import { map, tap, catchError, finalize, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { IndexedDbService } from './indexed-db.service';
import { DataCacheService } from './data-cache.service';
import { WorkspaceDataStore } from './workspace-data.store';
import { Exercice } from '../models/exercice.model';
import { Tag } from '../models/tag.model';

export interface PreloadProgress {
  current: number;
  total: number;
  percentage: number;
  currentTask: string;
  completed: boolean;
}

export interface WorkspaceData {
  exercices: Exercice[];
  entrainements: any[];
  echauffements: any[];
  situations: any[];
  tags: Tag[];
  stats: {
    totalExercices: number;
    totalEntrainements: number;
    totalEchauffements: number;
    totalSituations: number;
    totalTags: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class WorkspacePreloaderService {
  private progressSubject = new Subject<PreloadProgress>();
  
  constructor(
    private http: HttpClient,
    private indexedDb: IndexedDbService,
    private cache: DataCacheService,
    private workspaceDataStore: WorkspaceDataStore
  ) {}

  /**
   * Vérifie si un workspace est déjà en cache
   */
  async isWorkspaceCached(workspaceId: string): Promise<boolean> {
    if (!this.indexedDb.isDbAvailable()) {
      return false;
    }

    try {
      const [exercices, entrainements, tags] = await Promise.all([
        this.indexedDb.get<any[]>('exercices', 'exercices-list', workspaceId),
        this.indexedDb.get<any[]>('entrainements', 'entrainements-list', workspaceId),
        this.indexedDb.get<any[]>('tags', 'tags-list', workspaceId)
      ]);

      return !!(exercices && entrainements && tags);
    } catch (error) {
      console.error('[WorkspacePreloader] Error checking cache:', error);
      return false;
    }
  }

  /**
   * Obtient le pourcentage de données disponibles en cache
   */
  async getCacheCompleteness(workspaceId: string): Promise<number> {
    if (!this.indexedDb.isDbAvailable()) {
      return 0;
    }

    try {
      const checks = await Promise.all([
        this.indexedDb.get<any[]>('exercices', 'exercices-list', workspaceId),
        this.indexedDb.get<any[]>('entrainements', 'entrainements-list', workspaceId),
        this.indexedDb.get<any[]>('echauffements', 'echauffements-list', workspaceId),
        this.indexedDb.get<any[]>('situations', 'situations-list', workspaceId),
        this.indexedDb.get<any[]>('tags', 'tags-list', workspaceId)
      ]);

      const availableCount = checks.filter(data => data !== null).length;
      return (availableCount / checks.length) * 100;
    } catch (error) {
      console.error('[WorkspacePreloader] Error checking completeness:', error);
      return 0;
    }
  }

  /**
   * Précharge toutes les données d'un workspace
   */
  preloadWorkspace(workspaceId: string): Observable<PreloadProgress> {
    console.log('[WorkspacePreloader] Starting preload for workspace:', workspaceId);
    
    const tasks = [
      { name: 'Tags', key: 'tags-list', store: 'tags', url: `${environment.apiUrl}/tags` },
      { name: 'Exercices', key: 'exercices-list', store: 'exercices', url: `${environment.apiUrl}/exercises` },
      { name: 'Entrainements', key: 'entrainements-list', store: 'entrainements', url: `${environment.apiUrl}/trainings` },
      { name: 'Échauffements', key: 'echauffements-list', store: 'echauffements', url: `${environment.apiUrl}/warmups` },
      { name: 'Situations', key: 'situations-list', store: 'situations', url: `${environment.apiUrl}/matches` },
      { name: 'Stats Dashboard', key: 'dashboard-stats', store: 'dashboard-stats', url: `${environment.apiUrl}/dashboard/stats` }
    ];

    const total = tasks.length; // 6 tâches maintenant (avec stats dashboard)
    let current = 0;

    // Créer les observables pour chaque tâche
    const taskObservables = tasks.map(task => 
      this.http.get<any[]>(task.url).pipe(
        tap(data => {
          // Sauvegarder dans le cache
          this.cache.get(
            task.key,
            task.store,
            () => of(data),
            { forceRefresh: false }
          ).subscribe();
          
          current++;
          this.progressSubject.next({
            current,
            total,
            percentage: Math.round((current / total) * 100),
            currentTask: `Chargement des ${task.name}...`,
            completed: false
          });
        }),
        catchError(error => {
          console.error(`[WorkspacePreloader] Error loading ${task.name}:`, error);
          current++;
          this.progressSubject.next({
            current,
            total,
            percentage: Math.round((current / total) * 100),
            currentTask: `Erreur lors du chargement des ${task.name}`,
            completed: false
          });
          return of([]);
        })
      )
    );

    // Exécuter toutes les tâches en parallèle
    forkJoin(taskObservables).pipe(
      finalize(() => {
        this.progressSubject.next({
          current: total,
          total,
          percentage: 100,
          currentTask: 'Préchargement terminé',
          completed: true
        });
        console.log('[WorkspacePreloader] Preload completed for workspace:', workspaceId);
      })
    ).subscribe();

    return this.progressSubject.asObservable();
  }

  /**
   * Précharge via l'endpoint optimisé (si disponible)
   * NOUVEAU : Alimente également le WorkspaceDataStore
   */
  preloadFromBulkEndpoint(workspaceId: string): Observable<WorkspaceData> {
    console.log('[WorkspacePreloader] Using bulk endpoint for workspace:', workspaceId);
    
    // ✅ Marquer le Store comme en chargement
    this.workspaceDataStore.setLoading(true);
    this.workspaceDataStore.setError(null);
    
    // ✅ Émettre immédiatement la progression de démarrage
    this.progressSubject.next({
      current: 0,
      total: 6,
      percentage: 0,
      currentTask: 'Démarrage du préchargement...',
      completed: false
    });
    
    return this.http.get<WorkspaceData>(`${environment.apiUrl}/workspaces/${workspaceId}/preload`).pipe(
      tap(data => {
        console.log('[WorkspacePreloader] Bulk data received from backend:', {
          exercices: data.exercices?.length || 0,
          entrainements: data.entrainements?.length || 0,
          echauffements: data.echauffements?.length || 0,
          situations: data.situations?.length || 0,
          tags: data.tags?.length || 0
        });
        
        // ✅ Émettre progression pendant le chargement
        this.progressSubject.next({
          current: 3,
          total: 6,
          percentage: 50,
          currentTask: 'Sauvegarde des données en cache...',
          completed: false
        });
      }),
      switchMap(data => {
        // ✅ Sauvegarder toutes les données dans le cache et ATTENDRE la fin
        const cacheObservables = [
          this.cache.get('exercices-list', 'exercices', () => of(data.exercices)),
          this.cache.get('entrainements-list', 'entrainements', () => of(data.entrainements)),
          this.cache.get('echauffements-list', 'echauffements', () => of(data.echauffements)),
          this.cache.get('situations-list', 'situations', () => of(data.situations)),
          this.cache.get('tags-list', 'tags', () => of(data.tags)),
          this.cache.get('dashboard-stats', 'dashboard-stats', () => of(data.stats))
        ];

        return forkJoin(cacheObservables).pipe(
          tap(() => {
            console.log('[WorkspacePreloader] All data cached successfully');
            
            // 🆕 NOUVEAU : Alimenter le WorkspaceDataStore
            console.log('[WorkspacePreloader] Feeding WorkspaceDataStore...');
            this.workspaceDataStore.loadWorkspaceData({
              exercices: data.exercices || [],
              entrainements: data.entrainements || [],
              echauffements: data.echauffements || [],
              situations: data.situations || [],
              tags: data.tags || []
            });
            console.log('[WorkspacePreloader] WorkspaceDataStore updated successfully');
          }),
          map(() => data) // Retourner les données originales
        );
      }),
      tap(() => {
        // ✅ Émettre la progression finale APRÈS que le cache soit complet
        this.progressSubject.next({
          current: 6,
          total: 6,
          percentage: 100,
          currentTask: 'Préchargement terminé',
          completed: true
        });
        
        // ✅ Marquer le Store comme chargé
        this.workspaceDataStore.setLoading(false);
      }),
      catchError(error => {
        console.error('[WorkspacePreloader] Error with bulk endpoint:', error);
        
        // 🆕 NOUVEAU : Gestion d'erreur centralisée dans le Store
        const errorMessage = error?.error?.message || error?.message || 'Erreur lors du préchargement';
        this.workspaceDataStore.setError(errorMessage);
        this.workspaceDataStore.setLoading(false);
        
        // Fallback vers le préchargement individuel
        console.log('[WorkspacePreloader] Falling back to individual loading');
        throw error;
      })
    );
  }

  /**
   * Précharge avec stratégie intelligente (bulk endpoint ou individuel)
   */
  smartPreload(workspaceId: string): Observable<PreloadProgress> {
    return new Observable(observer => {
      // ✅ S'abonner au progressSubject AVANT de démarrer le préchargement
      const progressSub = this.progressSubject.subscribe(
        progress => observer.next(progress)
      );

      // Essayer d'abord l'endpoint bulk
      this.preloadFromBulkEndpoint(workspaceId).subscribe({
        next: () => {
          // Succès avec l'endpoint bulk
          console.log('[WorkspacePreloader] Bulk endpoint completed successfully');
        },
        error: (err) => {
          // Fallback vers le préchargement individuel
          console.log('[WorkspacePreloader] Using fallback individual loading');
          progressSub.unsubscribe(); // Nettoyer l'ancien abonnement
          
          this.preloadWorkspace(workspaceId).subscribe(
            progress => observer.next(progress),
            error => {
              observer.error(error);
            },
            () => observer.complete()
          );
        },
        complete: () => {
          // ✅ Nettoyer et compléter l'observable
          progressSub.unsubscribe();
          observer.complete();
        }
      });
    });
  }
}
