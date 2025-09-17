import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpGenericService, HttpOptions } from './http-generic.service';
import { tap, map } from 'rxjs/operators';
import { CacheService } from '../../core/services/cache.service';

/**
 * Interface générique pour les entités avec un ID
 */
export interface Entity {
  id?: string | number;
  [key: string]: any;
}

/**
 * Options pour les opérations CRUD
 */
export interface CrudOptions<T> {
  /** Préfixe pour les clés de cache */
  cachePrefix?: string;
  /** Durée de vie du cache en secondes */
  cacheTTL?: number;
  /** Si le cache doit être utilisé */
  useCache?: boolean;
  /** Options HTTP supplémentaires */
  httpOptions?: HttpOptions;
  /** Fonction de transformation avant l'envoi */
  transformBeforeSend?: (entity: T) => unknown;
  /** Nom du champ contenant le fichier à uploader */
  fileUploadField?: string;
  /** Fonction de transformation après réception */
  transformAfterReceive?: (data: unknown) => T;
}

/**
 * Service CRUD générique pour les entités
 * Fournit des opérations standardisées et réutilisables pour différentes entités
 */
@Injectable()
export class EntityCrudService<T extends Entity> {
  /** Endpoint de l'API pour l'entité */
  protected endpoint: string = ''; // Initialisation avec une chaîne vide
  
  /** Options par défaut pour les opérations CRUD */
  protected defaultOptions: CrudOptions<T> = {
    useCache: true,
    cacheTTL: 300, // 5 minutes
    httpOptions: {}
  };

  constructor(
    protected httpService: HttpGenericService,
    protected cacheService: CacheService
  ) { }

  /**
   * Accès au service HTTP pour les opérations personnalisées
   */
  get http(): HttpGenericService {
    return this.httpService;
  }

  /**
   * Invalide le cache pour cette entité
   */
  invalidateCache(): void {
    this.cacheService.clear();
  }

  /**
   * Configure le service pour une entité spécifique
   * @param endpoint Endpoint de l'API pour l'entité
   * @param defaultOptions Options par défaut pour cette entité
   * @returns Le service configuré (pour le chaînage)
   */
  public configure(endpoint: string, defaultOptions?: Partial<CrudOptions<T>>): EntityCrudService<T> {
    this.endpoint = endpoint;
    if (defaultOptions) {
      this.defaultOptions = { ...this.defaultOptions, ...defaultOptions };
    }
    return this;
  }

  /**
   * Récupère toutes les entités
   * @param options Options pour cette opération
   * @returns Observable avec la liste des entités
   */
  public getAll(options?: Partial<CrudOptions<T>>): Observable<T[]> {
    const mergedOptions = this.mergeOptions(options);
    const httpOptions: HttpOptions = {
      ...mergedOptions.httpOptions,
      useCache: mergedOptions.useCache,
      cacheConfig: {
        ttl: mergedOptions.cacheTTL,
        key: `${mergedOptions.cachePrefix || this.endpoint}.all`
      }
    };

    return this.httpService.get<T[]>(this.endpoint, httpOptions)
      .pipe(
        tap(data => {
          // Mettre en cache individuellement chaque entité pour les requêtes getById futures
          if (mergedOptions.useCache) {
            data.forEach(item => {
              const entity = mergedOptions.transformAfterReceive ? mergedOptions.transformAfterReceive(item as unknown) : item;
              this.cacheEntity(entity, mergedOptions);
            });
          }
        }),
        // Transformer les données si nécessaire
        map(data => data.map(item => 
          mergedOptions.transformAfterReceive ? mergedOptions.transformAfterReceive(item as unknown) : item
        ))
      );
  }

  /**
   * Récupère une entité par son ID
   * @param id ID de l'entité à récupérer
   * @param options Options pour cette opération
   * @returns Observable avec l'entité
   */
  public getById(id: string | number, options?: Partial<CrudOptions<T>>): Observable<T> {
    const mergedOptions = this.mergeOptions(options);
    const cacheKey = `${mergedOptions.cachePrefix || this.endpoint}.${id}`;

    // Vérifier si l'entité est déjà en cache
    if (mergedOptions.useCache && this.cacheService.has(cacheKey)) {
      const cached = this.cacheService.get<T>(cacheKey);
      if (cached) {
        return of(cached);
      }
    }

    const httpOptions: HttpOptions = {
      ...mergedOptions.httpOptions,
      useCache: mergedOptions.useCache,
      cacheConfig: {
        ttl: mergedOptions.cacheTTL,
        key: cacheKey
      }
    };

    const url = `${this.endpoint}/${id}`;
    return this.httpService.get<T>(url, httpOptions)
      .pipe(
        // Transformer les données si nécessaire
        map(data => mergedOptions.transformAfterReceive ? mergedOptions.transformAfterReceive(data as unknown) : data)
      );
  }

  /**
   * Crée une nouvelle entité
   * @param entity Entité à créer
   * @param options Options pour cette opération
   * @returns Observable avec l'entité créée
   */
  public create(entity: T, options?: Partial<CrudOptions<T>>): Observable<T> {
    const mergedOptions = this.mergeOptions(options);
    const httpOptions: HttpOptions = {
      ...mergedOptions.httpOptions,
      useCache: mergedOptions.useCache
    };

    // Transformer les données avant envoi si nécessaire
    let dataToSend = mergedOptions.transformBeforeSend ? mergedOptions.transformBeforeSend(entity) : entity;

    // Gérer l'upload de fichier si un champ est spécifié
    if (mergedOptions.fileUploadField && (entity as any)[mergedOptions.fileUploadField] instanceof File) {
      dataToSend = this.createFormData(entity, mergedOptions.fileUploadField);
    }

    return this.httpService.post<T>(this.endpoint, dataToSend, httpOptions)
      .pipe(
        tap(createdEntity => {
          // Invalider le cache pour getAll
          if (mergedOptions.useCache) {
            this.invalidateListCache(mergedOptions);
          }
        }),
        // Transformer les données après réception si nécessaire
        map(data => mergedOptions.transformAfterReceive ? mergedOptions.transformAfterReceive(data as unknown) : data),
        // Mettre en cache l'entité créée
        tap(createdEntity => {
          if (mergedOptions.useCache) {
            this.cacheEntity(createdEntity, mergedOptions);
          }
        })
      );
  }

  /**
   * Met à jour une entité existante
   * @param id ID de l'entité à mettre à jour
   * @param entity Données mises à jour de l'entité
   * @param options Options pour cette opération
   * @returns Observable avec l'entité mise à jour
   */
  public update(id: string | number, entity: T, options?: Partial<CrudOptions<T>>): Observable<T> {
    const mergedOptions = this.mergeOptions(options);
    const httpOptions: HttpOptions = {
      ...mergedOptions.httpOptions,
      useCache: mergedOptions.useCache
    };

    // Transformer les données avant envoi si nécessaire
    let dataToSend = mergedOptions.transformBeforeSend ? mergedOptions.transformBeforeSend(entity) : entity;

    // Gérer l'upload de fichier si un champ est spécifié
    if (mergedOptions.fileUploadField && (entity as any)[mergedOptions.fileUploadField] instanceof File) {
      dataToSend = this.createFormData(entity, mergedOptions.fileUploadField);
    }
    
    const url = `${this.endpoint}/${id}`;
    return this.httpService.put<T>(url, dataToSend, httpOptions)
      .pipe(
        tap(() => {
          // Invalider les caches concernés
          if (mergedOptions.useCache) {
            this.invalidateEntityCache(id, mergedOptions);
            this.invalidateListCache(mergedOptions);
          }
        }),
        // Transformer les données après réception si nécessaire
        map(data => mergedOptions.transformAfterReceive ? mergedOptions.transformAfterReceive(data as unknown) : data),
        // Mettre en cache l'entité mise à jour
        tap(updatedEntity => {
          if (mergedOptions.useCache) {
            this.cacheEntity(updatedEntity, mergedOptions);
          }
        })
      );
  }

  /**
   * Supprime une entité
   * @param id ID de l'entité à supprimer
   * @param options Options pour cette opération
   * @returns Observable avec la réponse de suppression
   */
  public delete(id: string | number, options?: Partial<CrudOptions<T>>): Observable<void> {
    const mergedOptions = this.mergeOptions(options);
    const httpOptions: HttpOptions = {
      ...mergedOptions.httpOptions,
      useCache: false
    };

    const url = `${this.endpoint}/${id}`;
    return this.httpService.delete<void>(url, httpOptions)
      .pipe(
        tap(() => {
          // Invalider les caches concernés
          if (mergedOptions.useCache) {
            this.invalidateEntityCache(id, mergedOptions);
            this.invalidateListCache(mergedOptions);
          }
        })
      );
  }

  /**
   * Fusionne les options par défaut avec les options spécifiques
   * @param options Options spécifiques
   * @returns Options fusionnées
   */
  protected mergeOptions(options?: Partial<CrudOptions<T>>): CrudOptions<T> {
    return { ...this.defaultOptions, ...options };
  }

  /**
   * Met en cache une entité
   * @param entity Entité à mettre en cache
   * @param options Options de cache
   */
  protected cacheEntity(entity: T, options: CrudOptions<T>): void {
    if (!entity || !entity.id) return;

    const cacheKey = `${options.cachePrefix || this.endpoint}.${entity.id}`;
    this.cacheService.set({
      key: cacheKey,
      ttl: options.cacheTTL
    }, entity);
  }

  /**
   * Invalide le cache pour une entité spécifique
   * @param id ID de l'entité
   * @param options Options de cache
   */
  protected invalidateEntityCache(id: string | number, options: CrudOptions<T>): void {
    const cacheKey = `${options.cachePrefix || this.endpoint}.${id}`;
    this.cacheService.remove(cacheKey);
  }

  /**
   * Invalide le cache pour la liste d'entités
   * @param options Options de cache
   */
  protected invalidateListCache(options: CrudOptions<T>): void {
    const cacheKey = `${options.cachePrefix || this.endpoint}.all`;
    this.cacheService.remove(cacheKey);
  }

  /**
   * Crée un objet FormData à partir d'une entité pour l'upload de fichier.
   * @param entity L'entité contenant les données et le fichier.
   * @param fileField Le nom du champ qui contient le fichier.
   * @returns Un objet FormData.
   */
  private createFormData(entity: T, fileField: string): FormData {
    const formData = new FormData();
    const file = (entity as any)[fileField];

    // Ajouter le fichier
    if (file instanceof File) {
      formData.append(fileField, file, file.name);
    }

    // Ajouter les autres champs de l'entité
    for (const key in entity) {
      if (Object.prototype.hasOwnProperty.call(entity, key) && key !== fileField) {
        const value = entity[key];
        if (value === null || value === undefined) {
          // Ne pas ajouter les champs null ou undefined, sauf si c'est intentionnel
          // Pour la suppression d'image, on envoie une chaîne vide
          if (key === 'imageUrl' || key === 'iconUrl') {
            formData.append(key, '');
          }
        } else if (value !== null && typeof value === 'object' && !(value instanceof File)) {
          // Stringify les objets et les tableaux
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value as string);
        }
      }
    }

    return formData;
  }
}

