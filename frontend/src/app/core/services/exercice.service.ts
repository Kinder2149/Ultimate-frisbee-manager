import { Injectable } from '@angular/core';
import { Observable, Subject, tap } from 'rxjs';
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

  getExercices(): Observable<Exercice[]> {
    return this.getAll(this.endpoint);
  }

  getExerciceById(id: string): Observable<Exercice> {
    return this.getById(this.endpoint, id);
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