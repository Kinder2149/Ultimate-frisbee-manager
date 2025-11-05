import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Entrainement } from '../models/entrainement.model';
import { EntityCrudService, CrudOptions } from '../../shared/services/entity-crud.service';
import { validate } from '../utils/import-validator';
import { mapLegacyTag } from '@ufm/shared/constants/tag-mapping';

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

  createEntrainement(data: Partial<Entrainement>): Observable<Entrainement> {
    return this.entityCrudService.create(this.endpoint, data as Entrainement, this.crudOptions).pipe(
      tap(() => this.entityCrudService.invalidateCache())
    );
  }

  updateEntrainement(id: string, data: Partial<Entrainement>): Observable<Entrainement> {
    return this.entityCrudService.update(this.endpoint, id, data, this.crudOptions).pipe(
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

  /**
   * Crée un Entrainement depuis un payload d'import non-securisé.
   * - Valide le payload (champs requis/optionnels, tags)
   * - Applique les mappings de tags
   * - Délègue la persistance à createEntrainement (EntityCrudService)
   * @throws Error si champs critiques manquants
   */
  createFromImport(data: Partial<Entrainement>): Observable<Entrainement> {
    const payload: any = { ...(data || {}) };
    const result = validate('entrainement', payload);
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
    return this.createEntrainement(payload);
  }
}
