import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { SituationMatch } from '../models/situationmatch.model';
import { environment } from '../../../environments/environment';
import { DataCacheService } from './data-cache.service';
import { SyncService } from './sync.service';
import { WorkspaceDataStore } from './workspace-data.store';
import { CacheOptions } from '../models/cache.model';

@Injectable({
  providedIn: 'root'
})
export class SituationMatchService {
  private readonly apiUrl = `${environment.apiUrl}/matches`;

  private situationsUpdated = new Subject<void>();
  situationsUpdated$ = this.situationsUpdated.asObservable();

  constructor(
    private http: HttpClient,
    private cache: DataCacheService,
    private sync: SyncService,
    private workspaceDataStore: WorkspaceDataStore
  ) {}

  getSituationsMatchs(options: CacheOptions = {}): Observable<SituationMatch[]> {
    return this.cache.get<SituationMatch[]>(
      'situations-list',
      'situations',
      () => this.http.get<any>(this.apiUrl).pipe(
        map((response: any) => {
          // Gérer la réponse paginée du backend
          return Array.isArray(response) ? response : (response.data || []);
        })
      ),
      options
    );
  }

  getSituationMatchById(id: string, options: CacheOptions = {}): Observable<SituationMatch> {
    return this.cache.get<SituationMatch>(
      `situation-${id}`,
      'situations',
      () => this.http.get<SituationMatch>(`${this.apiUrl}/${id}`),
      options
    );
  }

  createSituationMatch(data: FormData | Partial<SituationMatch>): Observable<SituationMatch> {
    return this.http.post<SituationMatch>(this.apiUrl, data).pipe(
      tap((situation) => {
        const current = this.workspaceDataStore.getSituations();
        this.workspaceDataStore.setSituations([situation, ...current]);
        console.log('[SituationMatchService] Store patched after create', { id: situation.id });

        this.cache.invalidate('situations-list', 'situations');
        this.sync.notifyChange({
          type: 'situation',
          action: 'create',
          id: situation.id || '',
          workspaceId: this.cache.getCurrentWorkspaceId() || '',
          timestamp: Date.now()
        });
        this.situationsUpdated.next();
      })
    );
  }

  updateSituationMatch(id: string, data: FormData | Partial<SituationMatch>): Observable<SituationMatch> {
    return this.http.put<SituationMatch>(`${this.apiUrl}/${id}`, data).pipe(
      tap(() => {
        const current = this.workspaceDataStore.getSituations();
        const updated = current.map(s => (s.id === id ? ({ ...(s as any), ...(data as any), id } as SituationMatch) : s));
        this.workspaceDataStore.setSituations(updated);
        console.log('[SituationMatchService] Store patched after update', { id });

        this.cache.invalidate('situations-list', 'situations');
        this.cache.invalidate(`situation-${id}`, 'situations');
        this.sync.notifyChange({
          type: 'situation',
          action: 'update',
          id,
          workspaceId: this.cache.getCurrentWorkspaceId() || '',
          timestamp: Date.now()
        });
        this.situationsUpdated.next();
      })
    );
  }

  deleteSituationMatch(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const current = this.workspaceDataStore.getSituations();
        this.workspaceDataStore.setSituations(current.filter(s => s.id !== id));
        console.log('[SituationMatchService] Store patched after delete', { id });

        this.cache.invalidate('situations-list', 'situations');
        this.cache.invalidate(`situation-${id}`, 'situations');
        this.sync.notifyChange({
          type: 'situation',
          action: 'delete',
          id,
          workspaceId: this.cache.getCurrentWorkspaceId() || '',
          timestamp: Date.now()
        });
        this.situationsUpdated.next();
      })
    );
  }

  duplicateSituationMatch(id: string): Observable<SituationMatch> {
    return this.http.post<SituationMatch>(`${this.apiUrl}/${id}/duplicate`, {}).pipe(
      tap((situation) => {
        const current = this.workspaceDataStore.getSituations();
        this.workspaceDataStore.setSituations([situation, ...current]);
        console.log('[SituationMatchService] Store patched after duplicate', { sourceId: id, newId: situation.id });

        this.cache.invalidate('situations-list', 'situations');
        this.sync.notifyChange({
          type: 'situation',
          action: 'create',
          id: situation.id || '',
          workspaceId: this.cache.getCurrentWorkspaceId() || '',
          timestamp: Date.now()
        });
        this.situationsUpdated.next();
      })
    );
  }
}
