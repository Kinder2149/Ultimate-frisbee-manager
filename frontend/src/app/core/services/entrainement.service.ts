import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { Entrainement } from '../models/entrainement.model';
import { environment } from '../../../environments/environment';
import { DataCacheService } from './data-cache.service';
import { SyncService } from './sync.service';
import { WorkspaceDataStore } from './workspace-data.store';
import { CacheOptions } from '../models/cache.model';

@Injectable({
  providedIn: 'root'
})
export class EntrainementService {
  private readonly apiUrl = `${environment.apiUrl}/trainings`;

  private entrainementsUpdated = new Subject<void>();
  entrainementsUpdated$ = this.entrainementsUpdated.asObservable();

  constructor(
    private http: HttpClient,
    private cache: DataCacheService,
    private sync: SyncService,
    private workspaceDataStore: WorkspaceDataStore
  ) {}

  getEntrainements(options: CacheOptions = {}): Observable<Entrainement[]> {
    return this.cache.get<Entrainement[]>(
      'entrainements-list',
      'entrainements',
      () => this.http.get<any>(this.apiUrl).pipe(
        map(response => {
          // Gérer la réponse paginée du backend
          return Array.isArray(response) ? response : (response.data || []);
        })
      ),
      options
    );
  }

  getEntrainementById(id: string, options: CacheOptions = {}): Observable<Entrainement> {
    return this.cache.get<Entrainement>(
      `entrainement-${id}`,
      'entrainements',
      () => this.http.get<Entrainement>(`${this.apiUrl}/${id}`),
      options
    );
  }

  createEntrainement(data: FormData | Partial<Entrainement>): Observable<Entrainement> {
    return this.http.post<Entrainement>(this.apiUrl, data).pipe(
      tap((entrainement) => {
        const current = this.workspaceDataStore.getEntrainements();
        this.workspaceDataStore.setEntrainements([entrainement, ...current]);
        console.log('[EntrainementService] Store patched after create', { id: entrainement.id });

        this.cache.invalidate('entrainements-list', 'entrainements');
        this.sync.notifyChange({
          type: 'entrainement',
          action: 'create',
          id: entrainement.id || '',
          workspaceId: this.cache.getCurrentWorkspaceId() || '',
          timestamp: Date.now()
        });
        this.entrainementsUpdated.next();
      })
    );
  }

  updateEntrainement(id: string, data: FormData | Partial<Entrainement>): Observable<Entrainement> {
    return this.http.put<Entrainement>(`${this.apiUrl}/${id}`, data).pipe(
      tap(() => {
        const current = this.workspaceDataStore.getEntrainements();
        const updated = current.map(e => (e.id === id ? ({ ...(e as any), ...(data as any), id } as Entrainement) : e));
        this.workspaceDataStore.setEntrainements(updated);
        console.log('[EntrainementService] Store patched after update', { id });

        this.cache.invalidate('entrainements-list', 'entrainements');
        this.cache.invalidate(`entrainement-${id}`, 'entrainements');
        this.sync.notifyChange({
          type: 'entrainement',
          action: 'update',
          id,
          workspaceId: this.cache.getCurrentWorkspaceId() || '',
          timestamp: Date.now()
        });
        this.entrainementsUpdated.next();
      })
    );
  }

  deleteEntrainement(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const current = this.workspaceDataStore.getEntrainements();
        this.workspaceDataStore.setEntrainements(current.filter(e => e.id !== id));
        console.log('[EntrainementService] Store patched after delete', { id });

        this.cache.invalidate('entrainements-list', 'entrainements');
        this.cache.invalidate(`entrainement-${id}`, 'entrainements');
        this.sync.notifyChange({
          type: 'entrainement',
          action: 'delete',
          id,
          workspaceId: this.cache.getCurrentWorkspaceId() || '',
          timestamp: Date.now()
        });
        this.entrainementsUpdated.next();
      })
    );
  }

  duplicateEntrainement(id: string): Observable<Entrainement> {
    return this.http.post<Entrainement>(`${this.apiUrl}/${id}/duplicate`, {}).pipe(
      tap((entrainement) => {
        const current = this.workspaceDataStore.getEntrainements();
        this.workspaceDataStore.setEntrainements([entrainement, ...current]);
        console.log('[EntrainementService] Store patched after duplicate', { sourceId: id, newId: entrainement.id });

        this.cache.invalidate('entrainements-list', 'entrainements');
        this.sync.notifyChange({
          type: 'entrainement',
          action: 'create',
          id: entrainement.id || '',
          workspaceId: this.cache.getCurrentWorkspaceId() || '',
          timestamp: Date.now()
        });
        this.entrainementsUpdated.next();
      })
    );
  }
}
