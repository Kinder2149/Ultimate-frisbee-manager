import { Injectable } from '@angular/core';
import { Observable, Subject, tap, map } from 'rxjs';

import { Exercice } from '../models/exercice.model';
import { EntityCrudService, CrudOptions } from '../../shared/services/entity-crud.service';
import { HttpGenericService } from '../../shared/services/http-generic.service';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class ExerciceService extends EntityCrudService<Exercice> {
  private endpoint = 'exercices';
  private crudOptions: Partial<CrudOptions<Exercice>> = {
    fileUploadField: 'image'
  };

  private exercicesUpdated = new Subject<void>();
  exercicesUpdated$ = this.exercicesUpdated.asObservable();

  constructor(httpService: HttpGenericService, cacheService: CacheService) {
    super(httpService, cacheService);
  }

  private normalizeExercice(ex: Exercice): Exercice {
    // À ce stade, le backend ne fournit plus que imageUrl comme champ d'image.
    // On se contente donc de le relayer tel quel.
    return { ...ex, imageUrl: ex.imageUrl };
  }

  getExercices(): Observable<Exercice[]> {
    return this.getAll(this.endpoint).pipe(
      map(list => list.map(ex => this.normalizeExercice(ex)))
    );
  }

  getExerciceById(id: string): Observable<Exercice> {
    return this.getById(this.endpoint, id).pipe(
      tap(ex => console.log('Exercice reçu du backend:', ex)),
      map(ex => this.normalizeExercice(ex))
    );
  }

  createExercice(data: Partial<Exercice>): Observable<Exercice> {
    return this.create(this.endpoint, data as Exercice, this.crudOptions).pipe(
      tap(() => {
        this.exercicesUpdated.next();
        this.invalidateCache();
      })
    );
  }

  updateExercice(id: string, data: Partial<Exercice>): Observable<Exercice> {
    return this.update(this.endpoint, id, data, this.crudOptions).pipe(
      tap(() => {
        this.exercicesUpdated.next();
        this.invalidateCache();
      })
    );
  }

  deleteExercice(id: string): Observable<void> {
    return this.delete(this.endpoint, id).pipe(
      tap(() => {
        this.exercicesUpdated.next();
        this.invalidateCache();
      })
    );
  }

  duplicateExercice(id: string): Observable<Exercice> {
    const url = `${this.endpoint}/${id}/duplicate`;
    return this.http.post<Exercice>(url, {}).pipe(
      tap(() => {
        this.exercicesUpdated.next();
        this.invalidateCache();
      })
    );
  }
}