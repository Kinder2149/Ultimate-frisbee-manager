import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { Exercice } from '../../../core/models/exercice.model';
import { environment } from '../../../../environments/environment';
import { DataCacheService } from '../../../core/services/data-cache.service';
import { SyncService } from '../../../core/services/sync.service';
import { WorkspaceDataStore } from '../../../core/services/workspace-data.store';
import { CacheOptions } from '../../../core/models/cache.model';

/**
 * Service pour la gestion des exercices
 */
@Injectable({
  providedIn: 'root'
})
export class ExerciceService {
  private readonly apiUrl = `${environment.apiUrl}/exercises`;

  private exercicesUpdated = new Subject<void>();
  exercicesUpdated$ = this.exercicesUpdated.asObservable();

  constructor(
    private http: HttpClient,
    private cache: DataCacheService,
    private sync: SyncService,
    private workspaceDataStore: WorkspaceDataStore
  ) {}

  getAllExercices(options: CacheOptions = {}): Observable<Exercice[]> {
    return this.cache.get<Exercice[]>(
      'exercices-list',
      'exercices',
      () => this.http.get<any>(this.apiUrl).pipe(
        map(response => {
          return Array.isArray(response) ? response : (response.data || []);
        })
      ),
      options
    );
  }

  getExerciceById(id: string, options: CacheOptions = {}): Observable<Exercice> {
    return this.cache.get<Exercice>(
      `exercice-${id}`,
      'exercices',
      () => this.http.get<Exercice>(`${this.apiUrl}/${id}`),
      options
    );
  }

  createExercice(data: FormData | Partial<Exercice>): Observable<Exercice> {
    return this.http.post<Exercice>(this.apiUrl, data).pipe(
      tap((exercice) => {
        const current = this.workspaceDataStore.getExercices();
        this.workspaceDataStore.setExercices([exercice, ...current]);
        console.log('[ExerciceService] Store patched after create', { id: exercice.id });

        this.cache.invalidate('exercices-list', 'exercices');
        this.sync.notifyChange({
          type: 'exercice',
          action: 'create',
          id: exercice.id || '',
          workspaceId: this.cache.getCurrentWorkspaceId() || '',
          timestamp: Date.now()
        });
        this.exercicesUpdated.next();
      })
    );
  }

  updateExercice(id: string, data: FormData | Partial<Exercice>): Observable<Exercice> {
    return this.http.put<Exercice>(`${this.apiUrl}/${id}`, data).pipe(
      tap(() => {
        const current = this.workspaceDataStore.getExercices();
        const updated = current.map(e => (e.id === id ? ({ ...(e as any), ...(data as any), id } as Exercice) : e));
        this.workspaceDataStore.setExercices(updated);
        console.log('[ExerciceService] Store patched after update', { id });

        this.cache.invalidate('exercices-list', 'exercices');
        this.cache.invalidate(`exercice-${id}`, 'exercices');
        this.sync.notifyChange({
          type: 'exercice',
          action: 'update',
          id,
          workspaceId: this.cache.getCurrentWorkspaceId() || '',
          timestamp: Date.now()
        });
        this.exercicesUpdated.next();
      })
    );
  }

  deleteExercice(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const current = this.workspaceDataStore.getExercices();
        this.workspaceDataStore.setExercices(current.filter(e => e.id !== id));
        console.log('[ExerciceService] Store patched after delete', { id });

        this.cache.invalidate('exercices-list', 'exercices');
        this.cache.invalidate(`exercice-${id}`, 'exercices');
        this.sync.notifyChange({
          type: 'exercice',
          action: 'delete',
          id,
          workspaceId: this.cache.getCurrentWorkspaceId() || '',
          timestamp: Date.now()
        });
        this.exercicesUpdated.next();
      })
    );
  }
}
