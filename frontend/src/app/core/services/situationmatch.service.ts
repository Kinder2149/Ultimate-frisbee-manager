import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SituationMatch } from '../models/situationmatch.model';
import { EntityCrudService, CrudOptions } from '../../shared/services/entity-crud.service';
 

@Injectable({
  providedIn: 'root'
})
export class SituationMatchService {
  private endpoint = 'situations-matchs';
  private crudOptions: Partial<CrudOptions<SituationMatch>> = {
    fileUploadField: 'image'
  };

  constructor(private entityCrudService: EntityCrudService<SituationMatch>) {}

  getSituationsMatchs(): Observable<SituationMatch[]> {
    return this.entityCrudService.getAll(this.endpoint);
  }

  getSituationMatchById(id: string): Observable<SituationMatch> {
    return this.entityCrudService.getById(this.endpoint, id);
  }

  createSituationMatch(data: Partial<SituationMatch> | FormData): Observable<SituationMatch> {
    return this.entityCrudService.create(this.endpoint, data as any, this.crudOptions).pipe(
      tap(() => this.entityCrudService.invalidateCache())
    );
  }

  updateSituationMatch(id: string, data: Partial<SituationMatch> | FormData): Observable<SituationMatch> {
    return this.entityCrudService.update(this.endpoint, id, data as any, this.crudOptions).pipe(
      tap(() => this.entityCrudService.invalidateCache())
    );
  }

  deleteSituationMatch(id: string): Observable<void> {
    return this.entityCrudService.delete(this.endpoint, id).pipe(
      tap(() => this.entityCrudService.invalidateCache())
    );
  }

  duplicateSituationMatch(id: string): Observable<SituationMatch> {
    const url = `${this.endpoint}/${id}/duplicate`;
    return this.entityCrudService.http.post<SituationMatch>(url, {}).pipe(
      tap(() => this.entityCrudService.invalidateCache())
    );
  }
}
