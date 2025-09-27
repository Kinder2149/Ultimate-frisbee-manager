import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Echauffement } from '../models/echauffement.model';
import { EntityCrudService } from '../../shared/services/entity-crud.service';

@Injectable({
  providedIn: 'root'
})
export class EchauffementService {
  private echauffementCrudService: EntityCrudService<Echauffement>;

  constructor(private entityCrudService: EntityCrudService<Echauffement>) {
    this.echauffementCrudService = this.entityCrudService.configure('echauffements', {
      fileUploadField: 'schemaUrl'
    });
  }

  getEchauffements(): Observable<Echauffement[]> {
    return this.echauffementCrudService.getAll();
  }

  getEchauffementById(id: string): Observable<Echauffement> {
    return this.echauffementCrudService.getById(id);
  }

  createEchauffement(data: Partial<Echauffement>): Observable<Echauffement> {
    return this.echauffementCrudService.create(data as Echauffement).pipe(
      tap(() => this.echauffementCrudService.invalidateCache())
    );
  }

  updateEchauffement(id: string, data: Partial<Echauffement>): Observable<Echauffement> {
    return this.echauffementCrudService.update(id, data as Echauffement).pipe(
      tap(() => this.echauffementCrudService.invalidateCache())
    );
  }

  deleteEchauffement(id: string): Observable<void> {
    return this.echauffementCrudService.delete(id).pipe(
      tap(() => this.echauffementCrudService.invalidateCache())
    );
  }

  duplicateEchauffement(id: string): Observable<Echauffement> {
    const endpoint = `echauffements/${id}/duplicate`;
    return this.echauffementCrudService.http.post<Echauffement>(endpoint, {}).pipe(
      tap(() => this.echauffementCrudService.invalidateCache())
    );
  }
}
