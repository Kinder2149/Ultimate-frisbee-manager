import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ApiUrlService } from '../../core/services/api-url.service';
import { CacheService, CacheConfig } from '../../core/services/cache.service';

/**
 * Options pour les requêtes HTTP
 */
export interface HttpOptions {
  /** En-têtes HTTP */
  headers?: HttpHeaders;
  /** Paramètres de requête */
  params?: HttpParams | Record<string, string | number | boolean | string[]>;
  /** Activer le cache */
  useCache?: boolean;
  /** Configuration du cache (si useCache = true) */
  cacheConfig?: Partial<CacheConfig>;
}

/**
 * Service HTTP générique réutilisable
 * Fournit des méthodes CRUD génériques avec gestion d'erreur et de cache
 */
@Injectable({
  providedIn: 'root'
})
export class HttpGenericService {
  /** Durée de vie du cache par défaut en secondes */
  private defaultCacheTTL = 300; // 5 minutes

  constructor(
    private http: HttpClient,
    private apiUrlService: ApiUrlService,
    private cacheService: CacheService
  ) { }

  /**
   * Récupère des données depuis une API
   * @param endpoint Endpoint de l'API (sans le préfixe de base)
   * @param options Options de la requête
   * @returns Observable avec les données
   */
  get<T>(endpoint: string, options: HttpOptions = {}): Observable<T> {
    const url = this.apiUrlService.getUrl(endpoint);
    const cacheKey = `http.${endpoint}${this.serializeParams(options.params)}`;

    // Si le cache est activé et que les données sont en cache, les retourner
    if (options.useCache && this.cacheService.has(cacheKey)) {
      const cachedData = this.cacheService.get<T>(cacheKey);
      if (cachedData) {
        return of(cachedData);
      }
    }

    // Sinon, faire la requête HTTP
    return this.http.get<T>(url, {
      headers: options.headers,
      params: options.params
    }).pipe(
      tap(data => {
        // Mettre en cache si nécessaire
        if (options.useCache) {
          const ttl = options.cacheConfig?.ttl || this.defaultCacheTTL;
          this.cacheService.set({ key: cacheKey, ttl }, data);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Envoie des données à une API
   * @param endpoint Endpoint de l'API (sans le préfixe de base)
   * @param data Données à envoyer
   * @param options Options de la requête
   * @returns Observable avec la réponse
   */
  post<T>(endpoint: string, data: unknown, options: HttpOptions = {}): Observable<T> {
    const url = this.apiUrlService.getUrl(endpoint);
    
    return this.http.post<T>(url, data, {
      headers: options.headers,
      params: options.params
    }).pipe(
      tap(response => {
        // Invalider le cache pour cet endpoint si nécessaire
        if (options.useCache) {
          this.invalidateCache(endpoint);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Met à jour des données via une API
   * @param endpoint Endpoint de l'API (sans le préfixe de base)
   * @param data Données à mettre à jour
   * @param options Options de la requête
   * @returns Observable avec la réponse
   */
  put<T>(endpoint: string, data: unknown, options: HttpOptions = {}): Observable<T> {
    const url = this.apiUrlService.getUrl(endpoint);
    
    return this.http.put<T>(url, data, {
      headers: options.headers,
      params: options.params
    }).pipe(
      tap(response => {
        // Invalider le cache pour cet endpoint si nécessaire
        if (options.useCache) {
          this.invalidateCache(endpoint);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Supprime des données via une API
   * @param endpoint Endpoint de l'API (sans le préfixe de base)
   * @param options Options de la requête
   * @returns Observable avec la réponse
   */
  delete<T>(endpoint: string, options: HttpOptions = {}): Observable<T> {
    const url = this.apiUrlService.getUrl(endpoint);
    
    return this.http.delete<T>(url, {
      headers: options.headers,
      params: options.params
    }).pipe(
      tap(response => {
        // Invalider le cache pour cet endpoint si nécessaire
        if (options.useCache) {
          this.invalidateCache(endpoint);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Gestion générique des erreurs HTTP
   * @param error Erreur HTTP
   * @returns Observable d'erreur
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    // Log détaillé mais on relance l'objet HttpErrorResponse pour préserver status, error, headers, etc.
    try {
      const details = {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        error: error.error
      };
      console.error('Erreur HTTP:', details);
    } catch {
      console.error('Erreur HTTP:', error);
    }
    return throwError(() => error);
  }

  /**
   * Invalide le cache pour un endpoint donné
   * @param endpoint Endpoint dont le cache doit être invalidé
   */
  private invalidateCache(endpoint: string): void {
    const prefix = `http.${endpoint}`;
    this.cacheService.clearByPrefix(prefix);
  }

  /**
   * Sérialise les paramètres pour générer une clé de cache unique
   * @param params Paramètres à sérialiser
   * @returns Chaîne sérialisée
   */
  private serializeParams(params?: HttpParams | Record<string, string | number | boolean | string[]>): string {
    if (!params) return '';
    
    if (params instanceof HttpParams) {
      return `?${params.toString()}`;
    }
    
    // Convertir l'objet en chaîne de paramètres
    const parts = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return value.map(v => `${key}=${encodeURIComponent(v)}`).join('&');
        }
        return `${key}=${encodeURIComponent(String(value))}`;
      });
    
    return parts.length ? `?${parts.join('&')}` : '';
  }
}
