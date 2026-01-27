import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { Exercice } from '../models/exercice.model';
import { environment } from '../../../environments/environment';
import { DataCacheService } from './data-cache.service';
import { SyncService } from './sync.service';
import { CacheOptions } from '../models/cache.model';

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
    private sync: SyncService
  ) {}

  private normalizeExercice(ex: Exercice): Exercice {
    // Normalisation défensive: si imageUrl est absent/vidé dans certaines réponses (liste),
    // mapper uniquement d'éventuels champs legacy d'images vers imageUrl (sans schemaUrl).
    const anyEx: any = ex as any;
    const legacy = anyEx.image || anyEx.picture;
    const imageUrl = (anyEx.imageUrl && anyEx.imageUrl !== '') ? anyEx.imageUrl : (legacy || null);
    return { ...ex, imageUrl };
  }

  getExercices(options: CacheOptions = {}): Observable<Exercice[]> {
    return this.cache.get<Exercice[]>(
      'exercices-list',
      'exercices',
      () => this.http.get<Exercice[]>(this.apiUrl).pipe(
        map(list => list.map(ex => this.normalizeExercice(ex)))
      ),
      options
    );
  }

  getExerciceById(id: string, options: CacheOptions = {}): Observable<Exercice> {
    return this.cache.get<Exercice>(
      `exercice-${id}`,
      'exercices',
      () => this.http.get<Exercice>(`${this.apiUrl}/${id}`).pipe(
        map(ex => this.normalizeExercice(ex))
      ),
      options
    );
  }

  createExercice(data: FormData | Partial<Exercice>): Observable<Exercice> {
    return this.http.post<Exercice>(this.apiUrl, data).pipe(
      tap((exercice) => {
        // Invalider le cache
        this.cache.invalidate('exercices-list', 'exercices');
        
        // Notifier les autres onglets
        this.sync.notifyChange({
          type: 'exercice',
          action: 'create',
          id: exercice.id,
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
        // Invalider le cache
        this.cache.invalidate('exercices-list', 'exercices');
        this.cache.invalidate(`exercice-${id}`, 'exercices');
        
        // Notifier les autres onglets
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
        // Invalider le cache
        this.cache.invalidate('exercices-list', 'exercices');
        this.cache.invalidate(`exercice-${id}`, 'exercices');
        
        // Notifier les autres onglets
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

  duplicateExercice(id: string): Observable<Exercice> {
    return this.http.post<Exercice>(`${this.apiUrl}/${id}/duplicate`, {}).pipe(
      tap((exercice) => {
        // Invalider le cache
        this.cache.invalidate('exercices-list', 'exercices');
        
        // Notifier les autres onglets
        this.sync.notifyChange({
          type: 'exercice',
          action: 'create',
          id: exercice.id,
          workspaceId: this.cache.getCurrentWorkspaceId() || '',
          timestamp: Date.now()
        });
        
        this.exercicesUpdated.next();
      })
    );
  }
}
