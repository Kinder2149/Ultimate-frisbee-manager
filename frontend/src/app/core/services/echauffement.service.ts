import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Echauffement } from '../models/echauffement.model';
import { EntityCrudService, CrudOptions } from '../../shared/services/entity-crud.service';
import { validate } from '../utils/import-validator';
import { mapLegacyTag } from '@ufm/shared/constants/tag-mapping';

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

  /**
   * Crée un Echauffement depuis un payload d'import non-securisé.
   * Valide et applique les mappings de tags avant de déléguer à createEchauffement.
   * @throws Error si champs critiques manquants
   */
  createFromImport(data: Partial<Echauffement>): Observable<Echauffement> {
    const payload: any = { ...(data || {}) };
    const result = validate('echauffement', payload);
    const criticalMissing = result.missingFields.filter(m => m.critical).map(m => m.field);
    if (criticalMissing.length) {
      throw new Error(`Champs requis manquants: ${criticalMissing.join(', ')}`);
    }
    if (Array.isArray(payload.tags)) {
      payload.tags = (payload.tags as unknown[]).map(t => {
        if (typeof t !== 'string') return t;
        const m = mapLegacyTag(t);
        return m.mapped || t;
      });
    }
    if ('updatedAt' in payload) {
      payload.updatedAt = new Date().toISOString();
    }
    return this.createEchauffement(payload);
  }
}
