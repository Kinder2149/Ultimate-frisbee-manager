import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Echauffement } from '../models/echauffement.model';
import { EntityCrudService, CrudOptions } from '../../shared/services/entity-crud.service';
 

@Injectable({
  providedIn: 'root'
})
export class EchauffementService {
  private endpoint = 'echauffements';
  private crudOptions: Partial<CrudOptions<Echauffement>> = {
    fileUploadField: 'image'
  };

  constructor(private entityCrudService: EntityCrudService<Echauffement>) {}

  getEchauffements(): Observable<Echauffement[]> {
    return this.entityCrudService.getAll(this.endpoint);
  }

  getEchauffementById(id: string): Observable<Echauffement> {
    return this.entityCrudService.getById(this.endpoint, id);
  }

  createEchauffement(data: Partial<Echauffement>): Observable<Echauffement> {
    return this.entityCrudService.create(this.endpoint, data as Echauffement, this.crudOptions).pipe(
      tap(() => this.entityCrudService.invalidateCache())
    );
  }

  updateEchauffement(id: string, data: Partial<Echauffement>): Observable<Echauffement> {
    return this.entityCrudService.update(this.endpoint, id, data, this.crudOptions).pipe(
      tap(() => this.entityCrudService.invalidateCache())
    );
  }

  deleteEchauffement(id: string): Observable<void> {
    return this.entityCrudService.delete(this.endpoint, id).pipe(
      tap(() => this.entityCrudService.invalidateCache())
    );
  }

  duplicateEchauffement(id: string): Observable<Echauffement> {
    const url = `${this.endpoint}/${id}/duplicate`;
    return this.entityCrudService.http.post<Echauffement>(url, {}).pipe(
      tap(() => this.entityCrudService.invalidateCache())
    );
  }
}
