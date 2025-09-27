import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SituationMatch } from '../models/situationmatch.model';
import { EntityCrudService } from '../../shared/services/entity-crud.service';

@Injectable({
  providedIn: 'root'
})
export class SituationMatchService {
  private situationMatchCrudService: EntityCrudService<SituationMatch>;

  constructor(private entityCrudService: EntityCrudService<SituationMatch>) {
    this.situationMatchCrudService = this.entityCrudService.configure('situations-matchs', {
      fileUploadField: 'schemaUrl'
    });
  }

  getSituationsMatchs(): Observable<SituationMatch[]> {
    return this.situationMatchCrudService.getAll();
  }

  getSituationMatchById(id: string): Observable<SituationMatch> {
    return this.situationMatchCrudService.getById(id);
  }

  createSituationMatch(data: Partial<SituationMatch>): Observable<SituationMatch> {
    return this.situationMatchCrudService.create(data as SituationMatch).pipe(
      tap(() => this.situationMatchCrudService.invalidateCache())
    );
  }

  updateSituationMatch(id: string, data: Partial<SituationMatch>): Observable<SituationMatch> {
    return this.situationMatchCrudService.update(id, data as SituationMatch).pipe(
      tap(() => this.situationMatchCrudService.invalidateCache())
    );
  }

  deleteSituationMatch(id: string): Observable<void> {
    return this.situationMatchCrudService.delete(id).pipe(
      tap(() => this.situationMatchCrudService.invalidateCache())
    );
  }

  duplicateSituationMatch(id: string): Observable<SituationMatch> {
    const endpoint = `situations-matchs/${id}/duplicate`;
    return this.situationMatchCrudService.http.post<SituationMatch>(endpoint, {}).pipe(
      tap(() => this.situationMatchCrudService.invalidateCache())
    );
  }
}
