import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Tag } from '../models/tag.model';
import { EntityCrudService } from '../../shared/services/entity-crud.service';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  private tagCrudService: EntityCrudService<Tag>;

  constructor(private entityCrudService: EntityCrudService<Tag>) {
    this.tagCrudService = this.entityCrudService.configure('tags');
  }

  getTags(category?: string): Observable<Tag[]> {
    const httpOptions = category ? { params: { category } } : {};
    return this.tagCrudService.getAll({ httpOptions });
  }

  getTagById(id: string): Observable<Tag> {
    return this.tagCrudService.getById(id);
  }

  createTag(data: Partial<Tag>): Observable<Tag> {
    return this.tagCrudService.create(data as Tag).pipe(
      tap(() => this.tagCrudService.invalidateCache())
    );
  }

  updateTag(id: string, data: Partial<Tag>): Observable<Tag> {
    return this.tagCrudService.update(id, data as Tag).pipe(
      tap(() => this.tagCrudService.invalidateCache())
    );
  }

  deleteTag(id: string, force: boolean = false): Observable<void> {
    const httpOptions = force ? { params: { force: 'true' } } : {};
    return this.tagCrudService.delete(id, { httpOptions }).pipe(
      tap(() => this.tagCrudService.invalidateCache())
    );
  }
}