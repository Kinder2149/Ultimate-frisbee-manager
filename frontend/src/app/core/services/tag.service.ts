import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { Tag } from '../models/tag.model';
import { environment } from '../../../environments/environment';
import { DataCacheService } from './data-cache.service';
import { SyncService } from './sync.service';
import { WorkspaceDataStore } from './workspace-data.store';
import { CacheOptions } from '../models/cache.model';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  private readonly apiUrl = `${environment.apiUrl}/tags`;

  private tagsUpdatedSource = new Subject<void>();
  public tagsUpdated$ = this.tagsUpdatedSource.asObservable();

  constructor(
    private http: HttpClient,
    private cache: DataCacheService,
    private sync: SyncService,
    private workspaceDataStore: WorkspaceDataStore
  ) {}

  getTags(category?: string, options: CacheOptions = {}): Observable<Tag[]> {
    const cacheKey = category ? `tags-list-${category}` : 'tags-list';
    return this.cache.get<Tag[]>(
      cacheKey,
      'tags',
      () => {
        if (category) {
          return this.http.get<Tag[]>(this.apiUrl, { params: { category } });
        }
        return this.http.get<Tag[]>(this.apiUrl);
      },
      options
    );
  }

  getAllGrouped(options: CacheOptions = {}): Observable<{ [key: string]: Tag[] }> {
    return this.cache.get<{ [key: string]: Tag[] }>(
      'tags-grouped',
      'tags',
      () => this.http.get<{ [key: string]: Tag[] }>(`${this.apiUrl}/grouped`),
      options
    );
  }

  getTagById(id: string, options: CacheOptions = {}): Observable<Tag> {
    return this.cache.get<Tag>(
      `tag-${id}`,
      'tags',
      () => this.http.get<Tag>(`${this.apiUrl}/${id}`),
      options
    );
  }

  createTag(data: Partial<Tag>): Observable<Tag> {
    return this.http.post<Tag>(this.apiUrl, data).pipe(
      tap((tag) => {
        const current = this.workspaceDataStore.getTags();
        this.workspaceDataStore.setTags([tag, ...current]);
        console.log('[TagService] Store patched after create', { id: tag.id });

        this.cache.invalidate('tags-list', 'tags');
        this.cache.invalidatePattern('tags-list-');
        this.cache.invalidate('tags-grouped', 'tags');

        this.sync.notifyChange({
          type: 'tag',
          action: 'create',
          id: tag.id || '',
          workspaceId: this.cache.getCurrentWorkspaceId() || '',
          timestamp: Date.now()
        });
        this.tagsUpdatedSource.next();
      })
    );
  }

  updateTag(id: string, data: Partial<Tag>): Observable<Tag> {
    return this.http.put<Tag>(`${this.apiUrl}/${id}`, data).pipe(
      tap((tag) => {
        const current = this.workspaceDataStore.getTags();
        const updated = current.map(t => (t.id === id ? tag : t));
        this.workspaceDataStore.setTags(updated);
        console.log('[TagService] Store patched after update', { id });

        this.cache.invalidate('tags-list', 'tags');
        this.cache.invalidatePattern('tags-list-');
        this.cache.invalidate('tags-grouped', 'tags');

        this.cache.invalidate(`tag-${id}`, 'tags');
        this.sync.notifyChange({
          type: 'tag',
          action: 'update',
          id,
          workspaceId: this.cache.getCurrentWorkspaceId() || '',
          timestamp: Date.now()
        });
        this.tagsUpdatedSource.next();
      })
    );
  }

  deleteTag(id: string, force: boolean = false): Observable<void> {
    const deleteObs = force
      ? this.http.delete<void>(`${this.apiUrl}/${id}`, { params: { force: 'true' } })
      : this.http.delete<void>(`${this.apiUrl}/${id}`);

    return deleteObs.pipe(
      tap(() => {
        const current = this.workspaceDataStore.getTags();
        this.workspaceDataStore.setTags(current.filter(t => t.id !== id));
        console.log('[TagService] Store patched after delete', { id });

        this.cache.invalidate('tags-list', 'tags');
        this.cache.invalidatePattern('tags-list-');
        this.cache.invalidate('tags-grouped', 'tags');

        this.cache.invalidate(`tag-${id}`, 'tags');
        this.sync.notifyChange({
          type: 'tag',
          action: 'delete',
          id,
          workspaceId: this.cache.getCurrentWorkspaceId() || '',
          timestamp: Date.now()
        });
        this.tagsUpdatedSource.next();
      })
    );
  }
}