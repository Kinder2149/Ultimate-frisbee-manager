import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Echauffement } from '../models/echauffement.model';
import { environment } from '../../../environments/environment';
import { DataCacheService } from './data-cache.service';
import { SyncService } from './sync.service';
import { CacheOptions } from '../models/cache.model';

@Injectable({
  providedIn: 'root'
})
export class EchauffementService {
  private readonly apiUrl = `${environment.apiUrl}/warmups`;

  private echauffementsUpdated = new Subject<void>();
  echauffementsUpdated$ = this.echauffementsUpdated.asObservable();

  constructor(
    private http: HttpClient,
    private cache: DataCacheService,
    private sync: SyncService
  ) {}

  getEchauffements(options: CacheOptions = {}): Observable<Echauffement[]> {
    return this.cache.get<Echauffement[]>(
      'echauffements-list',
      'echauffements',
      () => this.http.get<Echauffement[]>(this.apiUrl),
      options
    );
  }

  getEchauffementById(id: string, options: CacheOptions = {}): Observable<Echauffement> {
    return this.cache.get<Echauffement>(
      `echauffement-${id}`,
      'echauffements',
      () => this.http.get<Echauffement>(`${this.apiUrl}/${id}`),
      options
    );
  }

  createEchauffement(data: FormData | Partial<Echauffement>): Observable<Echauffement> {
    return this.http.post<Echauffement>(this.apiUrl, data).pipe(
      tap((echauffement) => {
        this.cache.invalidate('echauffements-list', 'echauffements');
        this.sync.notifyChange({
          type: 'echauffement',
          action: 'create',
          id: echauffement.id || '',
          workspaceId: this.cache.getCurrentWorkspaceId() || '',
          timestamp: Date.now()
        });
        this.echauffementsUpdated.next();
      })
    );
  }

  updateEchauffement(id: string, data: FormData | Partial<Echauffement>): Observable<Echauffement> {
    return this.http.put<Echauffement>(`${this.apiUrl}/${id}`, data).pipe(
      tap(() => {
        this.cache.invalidate('echauffements-list', 'echauffements');
        this.cache.invalidate(`echauffement-${id}`, 'echauffements');
        this.sync.notifyChange({
          type: 'echauffement',
          action: 'update',
          id,
          workspaceId: this.cache.getCurrentWorkspaceId() || '',
          timestamp: Date.now()
        });
        this.echauffementsUpdated.next();
      })
    );
  }

  deleteEchauffement(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.cache.invalidate('echauffements-list', 'echauffements');
        this.cache.invalidate(`echauffement-${id}`, 'echauffements');
        this.sync.notifyChange({
          type: 'echauffement',
          action: 'delete',
          id,
          workspaceId: this.cache.getCurrentWorkspaceId() || '',
          timestamp: Date.now()
        });
        this.echauffementsUpdated.next();
      })
    );
  }

  duplicateEchauffement(id: string): Observable<Echauffement> {
    return this.http.post<Echauffement>(`${this.apiUrl}/${id}/duplicate`, {}).pipe(
      tap((echauffement) => {
        this.cache.invalidate('echauffements-list', 'echauffements');
        this.sync.notifyChange({
          type: 'echauffement',
          action: 'create',
          id: echauffement.id || '',
          workspaceId: this.cache.getCurrentWorkspaceId() || '',
          timestamp: Date.now()
        });
        this.echauffementsUpdated.next();
      })
    );
  }
}
