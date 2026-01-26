import { Injectable } from '@angular/core';
import { Observable, of, shareReplay, tap } from 'rxjs';
import { WorkspaceService } from './workspace.service';
import { AuthService } from './auth.service';

interface CacheEntry<T> {
  data$: Observable<T>;
  timestamp: number;
  workspaceId: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataCacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes par défaut

  constructor(
    private workspaceService: WorkspaceService,
    private authService: AuthService
  ) {
    // Nettoyer le cache quand le workspace change
    this.workspaceService.currentWorkspace$.subscribe(() => {
      this.clearAll();
    });

    // Nettoyer le cache lors de la déconnexion
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (!isAuth) {
        this.clearAll();
      }
    });
  }

  /**
   * Récupère des données depuis le cache ou exécute la requête
   */
  get<T>(
    key: string,
    fetchFn: () => Observable<T>,
    ttl: number = this.defaultTTL
  ): Observable<T> {
    const currentWorkspaceId = this.workspaceService.getCurrentWorkspaceId();
    const cacheKey = `${currentWorkspaceId}_${key}`;
    const now = Date.now();
    const cached = this.cache.get(cacheKey);

    // Vérifier si le cache est valide
    if (cached && 
        cached.workspaceId === currentWorkspaceId &&
        (now - cached.timestamp) < ttl) {
      console.log(`[DataCache] Cache HIT for ${key}`);
      return cached.data$;
    }

    // Cache expiré ou inexistant, faire la requête
    console.log(`[DataCache] Cache MISS for ${key}, fetching...`);
    const data$ = fetchFn().pipe(
      shareReplay(1), // Partager le résultat entre tous les subscribers
      tap(() => console.log(`[DataCache] Data fetched for ${key}`))
    );

    this.cache.set(cacheKey, {
      data$,
      timestamp: now,
      workspaceId: currentWorkspaceId || ''
    });

    return data$;
  }

  /**
   * Invalide une entrée spécifique du cache (alias pour invalidate)
   */
  clear(key: string): void {
    this.invalidate(key);
  }

  /**
   * Invalide une entrée spécifique du cache
   */
  invalidate(key: string): void {
    const currentWorkspaceId = this.workspaceService.getCurrentWorkspaceId();
    const cacheKey = `${currentWorkspaceId}_${key}`;
    this.cache.delete(cacheKey);
    console.log(`[DataCache] Invalidated ${key} for workspace ${currentWorkspaceId}`);
  }

  /**
   * Invalide toutes les entrées correspondant à un pattern
   */
  invalidatePattern(pattern: string): void {
    const currentWorkspaceId = this.workspaceService.getCurrentWorkspaceId();
    const prefix = `${currentWorkspaceId}_`;
    
    Array.from(this.cache.keys())
      .filter(key => key.startsWith(prefix) && key.includes(pattern))
      .forEach(key => this.cache.delete(key));
    
    console.log(`[DataCache] Invalidated pattern ${pattern}`);
  }

  /**
   * Nettoie tout le cache
   */
  clearAll(): void {
    this.cache.clear();
    console.log('[DataCache] Cache cleared');
  }
}
