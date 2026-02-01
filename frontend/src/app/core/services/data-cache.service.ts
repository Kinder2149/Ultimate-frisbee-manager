import { Injectable } from '@angular/core';
import { Observable, of, from, shareReplay, tap, switchMap } from 'rxjs';
import { WorkspaceService } from './workspace.service';
import { AuthService } from './auth.service';
import { IndexedDbService } from './indexed-db.service';
import { CacheOptions, CacheStats } from '../models/cache.model';

interface CacheEntry<T = any> {
  data$: Observable<T>;
  timestamp: number;
  workspaceId: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataCacheService {
  private memoryCache = new Map<string, CacheEntry<unknown>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes par défaut
  private inFlightBackgroundRefresh = new Map<string, Observable<unknown>>();
  
  // Configuration TTL par type de données (centralisée)
  private readonly TTL_CONFIG = {
    // Authentification et workspaces
    auth: 24 * 60 * 60 * 1000,           // 24h (rarement modifié)
    workspaces: 60 * 60 * 1000,          // 1h (peut changer si admin modifie)
    
    // Données métier (réduites pour plus de fraîcheur avec stale-while-revalidate)
    exercices: 5 * 60 * 1000,            // 5min (au lieu de 15min)
    entrainements: 5 * 60 * 1000,        // 5min (au lieu de 15min)
    echauffements: 5 * 60 * 1000,        // 5min (au lieu de 15min)
    situations: 5 * 60 * 1000,           // 5min (au lieu de 15min)
    
    // Métadonnées
    tags: 30 * 60 * 1000,                // 30min (au lieu de 1h)
    
    // Dashboard et stats
    'dashboard-stats': 2 * 60 * 1000,    // 2min (au lieu de 5min)
    
    // Par défaut pour types non configurés
    default: 5 * 60 * 1000               // 5min
  };

  // Seuil de revalidation contrôlée (stale-while-revalidate)
  // RÈGLE :
  // - Si l'entrée cache est trop "vieille" (now - timestamp > revalidateAfter), on lance un refresh en arrière-plan
  // - Sinon, navigation simple = aucun appel réseau
  private readonly REVALIDATE_AFTER_CONFIG = {
    auth: 12 * 60 * 60 * 1000,           // 12h
    workspaces: 15 * 60 * 1000,          // 15min
    exercices: 2 * 60 * 1000,            // 2min
    entrainements: 2 * 60 * 1000,        // 2min
    echauffements: 2 * 60 * 1000,        // 2min
    situations: 2 * 60 * 1000,           // 2min
    tags: 10 * 60 * 1000,                // 10min
    'dashboard-stats': 30 * 1000,        // 30s
    default: 2 * 60 * 1000               // 2min
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
    
    // ✅ Vider uniquement le cache MÉMOIRE au changement de workspace
    // Le cache IndexedDB est CONSERVÉ pour permettre un retour rapide
    this.workspaceService.workspaceChanging$.subscribe(({ from, to }) => {
      console.log('[DataCache] Workspace changing from', from?.name, 'to', to.name);
      
      // Nettoyer le cache mémoire immédiatement (pour libérer la RAM)
      this.clearMemoryCache();
      console.log('[DataCache] Memory cache cleared, IndexedDB cache preserved for multi-workspace support');
      
      // ❌ NE PLUS vider IndexedDB pour conserver le cache multi-workspace
      // Le nettoyage LRU se fera automatiquement si nécessaire
      // if (from?.id) {
      //   this.indexedDb.clearWorkspace(from.id).catch(err => {
      //     console.error('[DataCache] Failed to clear IndexedDB for workspace:', err);
      //   });
      // }
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
      staleWhileRevalidate = true  // ✅ Activé par défaut pour affichage instantané
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
    const memoryEntry = this.getMemoryEntry(key, workspaceId, ttl);
    if (memoryEntry) {
      this.stats.hits++;

      if (staleWhileRevalidate && this.shouldBackgroundRevalidate(store, memoryEntry.timestamp)) {
        this.backgroundRefresh(key, store, workspaceId, fetchFn, ttl);
      }

      return memoryEntry.data$ as Observable<T>;
    }

    // NIVEAU 2: Vérifier IndexedDB
    return from(this.indexedDb.getEntry<T>(store, key, workspaceId)).pipe(
      switchMap(entry => {
        if (entry) {
          console.log(`[DataCache] IndexedDB HIT for ${key}`);
          this.stats.hits++;

          // Mettre en cache mémoire en conservant l'âge réel de l'entrée (important pour revalidation contrôlée)
          this.setInMemory(key, workspaceId, of(entry.data), ttl, entry.timestamp);

          if (staleWhileRevalidate && this.shouldBackgroundRevalidate(store, entry.timestamp)) {
            this.backgroundRefresh(key, store, workspaceId, fetchFn, ttl);
          }

          return of(entry.data);
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
    const entry = this.getMemoryEntry(key, workspaceId, ttl);
    if (!entry) {
      return null;
    }
    return entry.data$ as Observable<T>;
  }

  private getMemoryEntry(key: string, workspaceId: string | null, ttl: number): CacheEntry<unknown> | null {
    const cacheKey = `${workspaceId}_${key}`;
    const cached = this.memoryCache.get(cacheKey);
    const now = Date.now();

    if (
      cached &&
      cached.workspaceId === (workspaceId || '') &&
      (now - cached.timestamp) < ttl
    ) {
      console.log(`[DataCache] Memory HIT for ${key}`);
      return cached;
    }

    return null;
  }
  
  /**
   * Sauvegarde dans le cache mémoire
   */
  private setInMemory<T>(key: string, workspaceId: string | null, data$: Observable<T>, ttl: number): void;
  private setInMemory<T>(
    key: string,
    workspaceId: string | null,
    data$: Observable<T>,
    ttl: number,
    timestampOverride?: number
  ): void;
  private setInMemory<T>(
    key: string,
    workspaceId: string | null,
    data$: Observable<T>,
    ttl: number,
    timestampOverride?: number
  ): void {
    const cacheKey = `${workspaceId}_${key}`;
    this.memoryCache.set(cacheKey, {
      data$,
      timestamp: timestampOverride ?? Date.now(),
      workspaceId: workspaceId || ''
    });
  }

  private shouldBackgroundRevalidate(store: string, entryTimestamp: number): boolean {
    const now = Date.now();
    const revalidateAfter = this.getRevalidateAfter(store);
    return (now - entryTimestamp) > revalidateAfter;
  }

  private getRevalidateAfter(store: string): number {
    const value = (this.REVALIDATE_AFTER_CONFIG as any)[store];
    if (value !== undefined) {
      return value;
    }
    return this.REVALIDATE_AFTER_CONFIG.default;
  }

  private backgroundRefresh<T>(
    key: string,
    store: string,
    workspaceId: string | null,
    fetchFn: () => Observable<T>,
    ttl: number
  ): void {
    const inFlightKey = `${workspaceId}_${store}_${key}`;
    if (this.inFlightBackgroundRefresh.has(inFlightKey)) {
      return;
    }

    const refresh$ = this.fetchAndCache(key, store, workspaceId, fetchFn, ttl).pipe(
      tap({
        next: () => console.log(`[DataCache] Background refresh completed for ${key}`),
        error: (err) => console.error(`[DataCache] Background refresh failed for ${key}:`, err)
      }),
      shareReplay(1)
    );

    this.inFlightBackgroundRefresh.set(inFlightKey, refresh$ as Observable<unknown>);
    refresh$.subscribe({
      complete: () => this.inFlightBackgroundRefresh.delete(inFlightKey),
      error: () => this.inFlightBackgroundRefresh.delete(inFlightKey)
    });
  }
  
  /**
   * Obtient le TTL configuré pour un store
   */
  private getTTL(store: string): number {
    const ttl = (this.TTL_CONFIG as any)[store];
    if (ttl !== undefined) {
      return ttl;
    }
    console.warn(`[DataCache] No TTL configured for store "${store}", using default`);
    return this.TTL_CONFIG.default;
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
