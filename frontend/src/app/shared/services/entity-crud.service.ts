import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpGenericService, HttpOptions } from './http-generic.service';
import { tap, map } from 'rxjs/operators';
import { CacheService } from '../../core/services/cache.service';

function isUploadFile(value: any): value is File {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.name === 'string' &&
    typeof value.size === 'number' &&
    typeof value.type === 'string' &&
    typeof value.lastModified === 'number'
  );
}

export interface Entity {
  id?: string | number;
  [key: string]: any;
}

export interface CrudOptions<T> {
  cachePrefix?: string;
  cacheTTL?: number;
  useCache?: boolean;
  httpOptions?: HttpOptions;
  transformBeforeSend?: (entity: T) => unknown;
  fileUploadField?: string;
  transformAfterReceive?: (data: unknown) => T;
}

@Injectable({ providedIn: 'root' })
export class EntityCrudService<T extends Entity> {
  constructor(
    protected httpService: HttpGenericService,
    protected cacheService: CacheService
  ) { }

  get http(): HttpGenericService {
    return this.httpService;
  }

  invalidateCache(): void {
    this.cacheService.clear();
  }

  public getAll(endpoint: string, options?: Partial<CrudOptions<T>>): Observable<T[]> {
    const mergedOptions = this.mergeOptions({}, options);
    const httpOptions: HttpOptions = {
      ...mergedOptions.httpOptions,
      useCache: mergedOptions.useCache,
      cacheConfig: {
        ttl: mergedOptions.cacheTTL,
        key: `${mergedOptions.cachePrefix || endpoint}.all`
      }
    };

    return this.httpService.get<T[]>(endpoint, httpOptions).pipe(
      tap(data => {
        if (mergedOptions.useCache) {
          data.forEach(item => {
            const entity = mergedOptions.transformAfterReceive ? mergedOptions.transformAfterReceive(item as unknown) : item;
            this.cacheEntity(endpoint, entity, mergedOptions);
          });
        }
      }),
      map(data => data.map(item => 
        mergedOptions.transformAfterReceive ? mergedOptions.transformAfterReceive(item as unknown) : item
      ))
    );
  }

  public getById(endpoint: string, id: string | number, options?: Partial<CrudOptions<T>>): Observable<T> {
    const mergedOptions = this.mergeOptions({}, options);
    const cacheKey = `${mergedOptions.cachePrefix || endpoint}.${id}`;

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

    const url = `${endpoint}/${id}`;
    return this.httpService.get<T>(url, httpOptions).pipe(
      map(data => mergedOptions.transformAfterReceive ? mergedOptions.transformAfterReceive(data as unknown) : data)
    );
  }

  public create(endpoint: string, entity: T, options?: Partial<CrudOptions<T>>): Observable<T> {
    const mergedOptions = this.mergeOptions({}, options);
    const httpOptions: HttpOptions = {
      ...mergedOptions.httpOptions,
      useCache: mergedOptions.useCache
    };

    let dataToSend = mergedOptions.transformBeforeSend ? mergedOptions.transformBeforeSend(entity) : entity;

    if (mergedOptions.fileUploadField && isUploadFile((entity as any)[mergedOptions.fileUploadField])) {
      dataToSend = this.createFormData(entity, mergedOptions.fileUploadField);
    }

    return this.httpService.post<T>(endpoint, dataToSend, httpOptions).pipe(
      tap(createdEntity => {
        if (mergedOptions.useCache) {
          this.invalidateListCache(endpoint, mergedOptions);
        }
      }),
      map(data => mergedOptions.transformAfterReceive ? mergedOptions.transformAfterReceive(data as unknown) : data),
      tap(createdEntity => {
        if (mergedOptions.useCache) {
          this.cacheEntity(endpoint, createdEntity, mergedOptions);
        }
      })
    );
  }

  public update(endpoint: string, id: string | number, entity: Partial<T>, options?: Partial<CrudOptions<T>>): Observable<T> {
    const mergedOptions = this.mergeOptions({}, options);
    const httpOptions: HttpOptions = {
      ...mergedOptions.httpOptions,
      useCache: mergedOptions.useCache
    };

    let dataToSend = mergedOptions.transformBeforeSend ? mergedOptions.transformBeforeSend(entity as T) : entity;

    if (mergedOptions.fileUploadField && isUploadFile((entity as any)[mergedOptions.fileUploadField])) {
      dataToSend = this.createFormData(entity, mergedOptions.fileUploadField);
    }
    
    const url = `${endpoint}/${id}`;
    return this.httpService.put<T>(url, dataToSend, httpOptions).pipe(
      tap(() => {
        if (mergedOptions.useCache) {
          this.invalidateEntityCache(endpoint, id, mergedOptions);
          this.invalidateListCache(endpoint, mergedOptions);
        }
      }),
      map(data => mergedOptions.transformAfterReceive ? mergedOptions.transformAfterReceive(data as unknown) : data),
      tap(updatedEntity => {
        if (mergedOptions.useCache) {
          this.cacheEntity(endpoint, updatedEntity, mergedOptions);
        }
      })
    );
  }

  public delete(endpoint: string, id: string | number, options?: Partial<CrudOptions<T>>): Observable<void> {
    const mergedOptions = this.mergeOptions({}, options);
    const httpOptions: HttpOptions = {
      ...mergedOptions.httpOptions,
      useCache: false
    };

    const url = `${endpoint}/${id}`;
    return this.httpService.delete<void>(url, httpOptions).pipe(
      tap(() => {
        if (mergedOptions.useCache) {
          this.invalidateEntityCache(endpoint, id, mergedOptions);
          this.invalidateListCache(endpoint, mergedOptions);
        }
      })
    );
  }

  protected mergeOptions(baseOptions: CrudOptions<T>, options?: Partial<CrudOptions<T>>): CrudOptions<T> {
    return { ...baseOptions, ...options };
  }

  protected cacheEntity(endpoint: string, entity: T, options: CrudOptions<T>): void {
    if (!entity || !entity.id) return;

    const cacheKey = `${options.cachePrefix || endpoint}.${entity.id}`;
    this.cacheService.set({
      key: cacheKey,
      ttl: options.cacheTTL
    }, entity);
  }

  protected invalidateEntityCache(endpoint: string, id: string | number, options: CrudOptions<T>): void {
    const cacheKey = `${options.cachePrefix || endpoint}.${id}`;
    this.cacheService.remove(cacheKey);
  }

  protected invalidateListCache(endpoint: string, options: CrudOptions<T>): void {
    const cacheKey = `${options.cachePrefix || endpoint}.all`;
    this.cacheService.remove(cacheKey);
  }

  private createFormData(entity: Partial<T>, fileField: string): FormData {
    const formData = new FormData();
    const file = (entity as any)[fileField];

    if (isUploadFile(file)) {
      formData.append(fileField, file, file.name);
    }

    Object.keys(entity).forEach(key => {
      if (key === fileField) return;

      const value = (entity as any)[key];

      if (value === null || value === undefined) {
        if (key === 'imageUrl' || key === 'iconUrl') {
          formData.append(key, '');
        }
        return;
      }

      if (typeof value === 'object' && !isUploadFile(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (!isUploadFile(value)) {
        formData.append(key, String(value));
      }
    });

    return formData;
  }
}

