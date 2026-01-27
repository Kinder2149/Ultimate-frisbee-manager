import { Injectable } from '@angular/core';
import { Observable, of, from, shareReplay, tap, switchMap } from 'rxjs';
import { WorkspaceService } from './workspace.service';
import { AuthService } from './auth.service';
import { IndexedDbService } from './indexed-db.service';
import { CacheOptions, CacheStats } from '../models/cache.model';

interface CacheEntry<T> {
  data$: Observable<T>;
  timestamp: number;
  workspaceId: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataCacheService {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes par défaut
  
  // Configuration TTL par type de données
  private readonly TTL_CONFIG = {
    auth: 24 * 60 * 60 * 1000,      // 24h
    workspaces: 60 * 60 * 1000,     // 1h
    exercices: 30 * 60 * 1000,      // 30min
    entrainements: 30 * 60 * 1000,  // 30min
    tags: 60 * 60 * 1000,           // 1h
    echauffements: 30 * 60 * 1000,  // 30min
    situations: 30 * 60 * 1000      // 30min
  };
  
  // Statistiques de cache
  private stats = {
    hits: 0,
    misses: 0
  };

  constructor(
    private workspaceService: WorkspaceService,
    private authService: AuthService,
    private indexedDb: IndexedDbService
  ) {
    // Initialiser IndexedDB
    this.indexedDb.init().catch(err => {
      console.error('[DataCache] Failed to initialize IndexedDB:', err);
    });
    
    // Nettoyer le cache mémoire quand le workspace change
    this.workspaceService.currentWorkspace$.subscribe(() => {
      this.clearMemoryCache();
    });

    // Nettoyer tout lors de la déconnexion
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (!isAuth) {
        this.clearAll();
      }
    });
    
    // Nettoyer les entrées expirées périodiquement (toutes les 5 minutes)
    setInterval(() => {
      this.indexedDb.cleanExpired().catch(err => {
        console.error('[DataCache] Error cleaning expired entries:', err);
      });
    }, 5 * 60 * 1000);
  }

  /**
   * Récupère des données avec stratégie multi-niveaux (mémoire → IndexedDB → API)
   */
  get<T>(
    key: string,
    store: string,
    fetchFn: () => Observable<T>,
    options: CacheOptions = {}
  ): Observable<T> {
    const workspaceId = this.workspaceService.getCurrentWorkspaceId();
    const { 
      ttl = this.getTTL(store), 
      forceRefresh = false, 
      skipCache = false,
      staleWhileRevalidate = false 
    } = options;
    
    // Bypass complet du cache si demandé
    if (skipCache) {
      return this.fetchAndCache(key, store, workspaceId, fetchFn, ttl);
    }
    
    // Forcer le rafraîchissement
    if (forceRefresh) {
      return this.fetchAndCache(key, store, workspaceId, fetchFn, ttl);
    }

    // NIVEAU 1: Vérifier cache mémoire
    const memoryData = this.getFromMemory(key, workspaceId, ttl);
    if (memoryData) {
      this.stats.hits++;
      return memoryData;
    }

    // NIVEAU 2: Vérifier IndexedDB
    return from(this.indexedDb.get<T>(store, key, workspaceId)).pipe(
      switchMap(cachedData => {
        if (cachedData) {
          console.log(`[DataCache] IndexedDB HIT for ${key}`);
          this.stats.hits++;
          
          // Mettre en cache mémoire
          this.setInMemory(key, workspaceId, of(cachedData), ttl);
          
          // Si stale-while-revalidate, rafraîchir en arrière-plan
          if (staleWhileRevalidate) {
            this.fetchAndCache(key, store, workspaceId, fetchFn, ttl).subscribe({
              error: (err) => console.error(`[DataCache] Background refresh failed for ${key}:`, err)
            });
          }
          
          return of(cachedData);
        }
        
        // NIVEAU 3: Fetch depuis API
        this.stats.misses++;
        return this.fetchAndCache(key, store, workspaceId, fetchFn, ttl);
      })
    );
  }
  
  /**
   * Récupère les données depuis l'API et les met en cache
   */
  private fetchAndCache<T>(
    key: string,
    store: string,
    workspaceId: string | null,
    fetchFn: () => Observable<T>,
    ttl: number
  ): Observable<T> {
    console.log(`[DataCache] Fetching from API: ${key}`);
    
    const data$ = fetchFn().pipe(
      tap(data => {
        // Sauvegarder dans IndexedDB
        this.indexedDb.set(store, key, data, workspaceId, ttl).catch(err => {
          console.error(`[DataCache] Failed to save to IndexedDB:`, err);
        });
        
        // Sauvegarder en mémoire
        this.setInMemory(key, workspaceId, of(data), ttl);
      }),
      shareReplay(1)
    );
    
    return data$;
  }
  
  /**
   * Récupère depuis le cache mémoire
   */
  private getFromMemory<T>(key: string, workspaceId: string | null, ttl: number): Observable<T> | null {
    const cacheKey = `${workspaceId}_${key}`;
    const cached = this.memoryCache.get(cacheKey);
    const now = Date.now();

    if (cached && 
        cached.workspaceId === (workspaceId || '') &&
        (now - cached.timestamp) < ttl) {
      console.log(`[DataCache] Memory HIT for ${key}`);
      return cached.data$;
    }
    
    return null;
  }
  
  /**
   * Sauvegarde dans le cache mémoire
   */
  private setInMemory<T>(key: string, workspaceId: string | null, data$: Observable<T>, ttl: number): void {
    const cacheKey = `${workspaceId}_${key}`;
    this.memoryCache.set(cacheKey, {
      data$,
      timestamp: Date.now(),
      workspaceId: workspaceId || ''
    });
  }
  
  /**
   * Obtient le TTL configuré pour un store
   */
  private getTTL(store: string): number {
    return (this.TTL_CONFIG as any)[store] || this.defaultTTL;
  }
  
  /**
   * Obtient l'ID du workspace actuel
   */
  getCurrentWorkspaceId(): string | null {
    return this.workspaceService.getCurrentWorkspaceId();
  }

  /**
   * Invalide une entrée spécifique du cache (mémoire + IndexedDB)
   */
  invalidate(key: string, store?: string): void {
    const currentWorkspaceId = this.workspaceService.getCurrentWorkspaceId();
    const cacheKey = `${currentWorkspaceId}_${key}`;
    
    // Invalider cache mémoire
    this.memoryCache.delete(cacheKey);
    
    // Invalider IndexedDB si store spécifié
    if (store) {
      this.indexedDb.delete(store, key, currentWorkspaceId).catch(err => {
        console.error(`[DataCache] Failed to delete from IndexedDB:`, err);
      });
    }
    
    console.log(`[DataCache] Invalidated ${key} for workspace ${currentWorkspaceId}`);
  }
  
  /**
   * Alias pour invalidate
   */
  clear(key: string, store?: string): void {
    this.invalidate(key, store);
  }

  /**
   * Invalide toutes les entrées correspondant à un pattern
   */
  invalidatePattern(pattern: string): void {
    const currentWorkspaceId = this.workspaceService.getCurrentWorkspaceId();
    const prefix = `${currentWorkspaceId}_`;
    
    // Invalider cache mémoire
    Array.from(this.memoryCache.keys())
      .filter(key => key.startsWith(prefix) && key.includes(pattern))
      .forEach(key => this.memoryCache.delete(key));
    
    console.log(`[DataCache] Invalidated pattern ${pattern}`);
  }
  
  /**
   * Nettoie le cache mémoire uniquement
   */
  clearMemoryCache(): void {
    this.memoryCache.clear();
    console.log('[DataCache] Memory cache cleared');
  }

  /**
   * Nettoie tout le cache (mémoire + IndexedDB)
   */
  clearAll(): void {
    this.memoryCache.clear();
    this.indexedDb.clearAll().catch(err => {
      console.error('[DataCache] Failed to clear IndexedDB:', err);
    });
    console.log('[DataCache] All caches cleared');
  }
  
  /**
   * Obtient les statistiques du cache
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
    
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      totalEntries: this.memoryCache.size,
      totalSize: 0 // À calculer si nécessaire
    };
  }
  
  /**
   * Réinitialise les statistiques
   */
  resetStats(): void {
    this.stats = { hits: 0, misses: 0 };
  }
}
