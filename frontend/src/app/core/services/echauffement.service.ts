import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Echauffement, CreateEchauffementRequest, UpdateEchauffementRequest } from '../models/echauffement.model';
import { EntityCrudService } from '../../shared/services/entity-crud.service';
import { HttpGenericService } from '../../shared/services/http-generic.service';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class EchauffementService {
  private crudService: EntityCrudService<Echauffement>;

  constructor(
    private httpService: HttpGenericService,
    private cacheService: CacheService
  ) {
    this.crudService = new EntityCrudService<Echauffement>(this.httpService, this.cacheService);
    this.crudService.configure('echauffements', {
      fileUploadField: 'schemaUrl',
      useCache: true,
      cacheTTL: 300 // 5 minutes
    });
  }

  getEchauffements(): Observable<Echauffement[]> {
    return this.crudService.getAll();
  }

  getEchauffementById(id: string): Observable<Echauffement> {
    return this.crudService.getById(id);
  }

  ajouterEchauffement(echauffement: CreateEchauffementRequest): Observable<Echauffement> {
    return this.crudService.create(echauffement as Echauffement).pipe(
      tap(() => this.crudService.invalidateCache())
    );
  }

  updateEchauffement(id: string, echauffement: UpdateEchauffementRequest): Observable<Echauffement> {
    return this.crudService.update(id, echauffement as Echauffement).pipe(
      tap(() => this.crudService.invalidateCache())
    );
  }

  deleteEchauffement(id: string): Observable<void> {
    return this.crudService.delete(id).pipe(
      tap(() => this.crudService.invalidateCache())
    );
  }

  duplicateEchauffement(id: string): Observable<Echauffement> {
    const endpoint = `echauffements/${id}/duplicate`;
    return this.crudService.http.post<Echauffement>(endpoint, {}).pipe(
      tap(() => this.crudService.invalidateCache())
    );
  }
}
