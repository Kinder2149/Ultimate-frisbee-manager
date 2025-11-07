import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Tag } from '../models/tag.model';
import { EntityCrudService, CrudOptions } from '../../shared/services/entity-crud.service';
import { HttpGenericService } from '../../shared/services/http-generic.service';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class TagService extends EntityCrudService<Tag> {
  private endpoint = 'tags';

  private tagsUpdatedSource = new Subject<void>();
  public tagsUpdated$ = this.tagsUpdatedSource.asObservable();

  constructor(httpService: HttpGenericService, cacheService: CacheService) {
    super(httpService, cacheService);
  }

  getTags(category?: string): Observable<Tag[]> {
    const httpOptions = category ? { params: { category } } : {};
    return this.getAll(this.endpoint, { httpOptions });
  }

  getAllGrouped(): Observable<{ [key: string]: Tag[] }> {
    return this.httpService.get<{ [key: string]: Tag[] }>(`${this.endpoint}/grouped`);
  }

  getTagById(id: string): Observable<Tag> {
    return this.getById(this.endpoint, id);
  }

  createTag(data: Partial<Tag>): Observable<Tag> {
    return this.create(this.endpoint, data as Tag).pipe(
      tap(() => this.tagsUpdatedSource.next())
    );
  }

  updateTag(id: string, data: Partial<Tag>): Observable<Tag> {
    return this.update(this.endpoint, id, data as Tag).pipe(
      tap(() => this.tagsUpdatedSource.next())
    );
  }

  deleteTag(id: string, force: boolean = false): Observable<void> {
    const httpOptions = force ? { params: { force: 'true' } } : {};
    return this.delete(this.endpoint, id, { httpOptions }).pipe(
      tap(() => this.tagsUpdatedSource.next())
    );
  }
}