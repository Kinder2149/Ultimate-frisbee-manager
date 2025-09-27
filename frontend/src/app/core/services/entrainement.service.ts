import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Entrainement } from '../models/entrainement.model';
import { EntityCrudService } from '../../shared/services/entity-crud.service';

@Injectable({
  providedIn: 'root'
})
export class EntrainementService {
  private entrainementCrudService: EntityCrudService<Entrainement>;

  constructor(private entityCrudService: EntityCrudService<Entrainement>) {
    this.entrainementCrudService = this.entityCrudService.configure('entrainements', {
      fileUploadField: 'schemaUrl'
    });
  }

  getEntrainements(): Observable<Entrainement[]> {
    return this.entrainementCrudService.getAll();
  }

  getEntrainementById(id: string): Observable<Entrainement> {
    return this.entrainementCrudService.getById(id);
  }

  createEntrainement(data: Partial<Entrainement>): Observable<Entrainement> {
    return this.entrainementCrudService.create(data as Entrainement).pipe(
      tap(() => this.entrainementCrudService.invalidateCache())
    );
  }

  updateEntrainement(id: string, data: Partial<Entrainement>): Observable<Entrainement> {
    return this.entrainementCrudService.update(id, data as Entrainement).pipe(
      tap(() => this.entrainementCrudService.invalidateCache())
    );
  }

  deleteEntrainement(id: string): Observable<void> {
    return this.entrainementCrudService.delete(id).pipe(
      tap(() => this.entrainementCrudService.invalidateCache())
    );
  }

  duplicateEntrainement(id: string): Observable<Entrainement> {
    const endpoint = `entrainements/${id}/duplicate`;
    return this.entrainementCrudService.http.post<Entrainement>(endpoint, {}).pipe(
      tap(() => this.entrainementCrudService.invalidateCache())
    );
  }
}
