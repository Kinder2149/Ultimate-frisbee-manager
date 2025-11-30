import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Entrainement } from '../models/entrainement.model';
import { EntityCrudService, CrudOptions } from '../../shared/services/entity-crud.service';
 

@Injectable({
  providedIn: 'root'
})
export class EntrainementService {
  private endpoint = 'entrainements';
  private crudOptions: Partial<CrudOptions<Entrainement>> = {
    fileUploadField: 'image'
  };

  constructor(private entityCrudService: EntityCrudService<Entrainement>) {}

  getEntrainements(): Observable<Entrainement[]> {
    return this.entityCrudService.getAll(this.endpoint);
  }

  getEntrainementById(id: string): Observable<Entrainement> {
    return this.entityCrudService.getById(this.endpoint, id);
  }

  createEntrainement(data: Partial<Entrainement> | FormData): Observable<Entrainement> {
    return this.entityCrudService.create(this.endpoint, data as any, this.crudOptions).pipe(
      tap(() => this.entityCrudService.invalidateCache())
    );
  }

  updateEntrainement(id: string, data: Partial<Entrainement> | FormData): Observable<Entrainement> {
    return this.entityCrudService.update(this.endpoint, id, data as any, this.crudOptions).pipe(
      tap(() => this.entityCrudService.invalidateCache())
    );
  }

  deleteEntrainement(id: string): Observable<void> {
    return this.entityCrudService.delete(this.endpoint, id).pipe(
      tap(() => this.entityCrudService.invalidateCache())
    );
  }

  duplicateEntrainement(id: string): Observable<Entrainement> {
    const url = `${this.endpoint}/${id}/duplicate`;
    return this.entityCrudService.http.post<Entrainement>(url, {}).pipe(
      tap(() => this.entityCrudService.invalidateCache())
    );
  }
}
