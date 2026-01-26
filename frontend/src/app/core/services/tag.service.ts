import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { Tag } from '../models/tag.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  private readonly apiUrl = `${environment.apiUrl}/tags`;

  private tagsUpdatedSource = new Subject<void>();
  public tagsUpdated$ = this.tagsUpdatedSource.asObservable();

  constructor(private http: HttpClient) {}

  getTags(category?: string): Observable<Tag[]> {
    if (category) {
      return this.http.get<Tag[]>(this.apiUrl, { params: { category } });
    }
    return this.http.get<Tag[]>(this.apiUrl);
  }

  getAllGrouped(): Observable<{ [key: string]: Tag[] }> {
    return this.http.get<{ [key: string]: Tag[] }>(`${this.apiUrl}/grouped`);
  }

  getTagById(id: string): Observable<Tag> {
    return this.http.get<Tag>(`${this.apiUrl}/${id}`);
  }

  createTag(data: Partial<Tag>): Observable<Tag> {
    return this.http.post<Tag>(this.apiUrl, data).pipe(
      tap(() => this.tagsUpdatedSource.next())
    );
  }

  updateTag(id: string, data: Partial<Tag>): Observable<Tag> {
    return this.http.put<Tag>(`${this.apiUrl}/${id}`, data).pipe(
      tap(() => this.tagsUpdatedSource.next())
    );
  }

  deleteTag(id: string, force: boolean = false): Observable<void> {
    if (force) {
      return this.http.delete<void>(`${this.apiUrl}/${id}`, { params: { force: 'true' } }).pipe(
        tap(() => this.tagsUpdatedSource.next())
      );
    }
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.tagsUpdatedSource.next())
    );
  }
}