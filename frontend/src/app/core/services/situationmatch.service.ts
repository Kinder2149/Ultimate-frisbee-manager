import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SituationMatch } from '../models/situationmatch.model';
import { EntityCrudService, CrudOptions } from '../../shared/services/entity-crud.service';
import { validate } from '../utils/import-validator';
import { mapLegacyTag } from '@ufm/shared/constants/tag-mapping';

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

  createSituationMatch(data: Partial<SituationMatch>): Observable<SituationMatch> {
    return this.entityCrudService.create(this.endpoint, data as SituationMatch, this.crudOptions).pipe(
      tap(() => this.entityCrudService.invalidateCache())
    );
  }

  updateSituationMatch(id: string, data: Partial<SituationMatch>): Observable<SituationMatch> {
    return this.entityCrudService.update(this.endpoint, id, data, this.crudOptions).pipe(
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

  /**
   * Crée une Situation de match depuis un payload d'import non-securisé.
   * Valide et applique les mappings de tags avant de déléguer à createSituationMatch.
   * @throws Error si champs critiques manquants
   */
  createFromImport(data: Partial<SituationMatch>): Observable<SituationMatch> {
    const payload: any = { ...(data || {}) };
    const result = validate('situation', payload);
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
    return this.createSituationMatch(payload);
  }
}
