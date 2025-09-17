import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SituationMatch, CreateSituationMatchRequest, UpdateSituationMatchRequest } from '../models/situationmatch.model';
import { EntityCrudService } from '../../shared/services/entity-crud.service';
import { HttpGenericService } from '../../shared/services/http-generic.service';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class SituationMatchService {
  private crudService: EntityCrudService<SituationMatch>;

  constructor(
    private httpService: HttpGenericService,
    private cacheService: CacheService
  ) {
    this.crudService = new EntityCrudService<SituationMatch>(this.httpService, this.cacheService);
    this.crudService.configure('situations-matchs', {
      fileUploadField: 'schemaUrl',
      useCache: true,
      cacheTTL: 300 // 5 minutes
    });
  }

  getSituationsMatchs(): Observable<SituationMatch[]> {
    return this.crudService.getAll();
  }

  getSituationMatchById(id: string): Observable<SituationMatch> {
    return this.crudService.getById(id);
  }

  ajouterSituationMatch(situationMatch: CreateSituationMatchRequest): Observable<SituationMatch> {
    return this.crudService.create(situationMatch as SituationMatch).pipe(
      tap(() => this.crudService.invalidateCache())
    );
  }

  updateSituationMatch(id: string, situationMatch: UpdateSituationMatchRequest): Observable<SituationMatch> {
    return this.crudService.update(id, situationMatch as SituationMatch).pipe(
      tap(() => this.crudService.invalidateCache())
    );
  }

  deleteSituationMatch(id: string): Observable<void> {
    return this.crudService.delete(id).pipe(
      tap(() => this.crudService.invalidateCache())
    );
  }

  duplicateSituationMatch(id: string): Observable<SituationMatch> {
    const endpoint = `situations-matchs/${id}/duplicate`;
    return this.crudService.http.post<SituationMatch>(endpoint, {}).pipe(
      tap(() => this.crudService.invalidateCache())
    );
  }
}
}
