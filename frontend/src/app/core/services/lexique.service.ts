import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lexique } from '../models/lexique.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LexiqueService {
  private readonly apiUrl = `${environment.apiUrl}/lexique`;

  constructor(private http: HttpClient) {}

  getAll(categorie?: string): Observable<Lexique[]> {
    if (categorie) {
      return this.http.get<Lexique[]>(this.apiUrl, { params: { categorie } });
    }
    return this.http.get<Lexique[]>(this.apiUrl);
  }

  create(terme: Omit<Lexique, 'id' | 'createdAt'>): Observable<Lexique> {
    return this.http.post<Lexique>(this.apiUrl, terme);
  }

  update(id: string, terme: Partial<Lexique>): Observable<Lexique> {
    return this.http.put<Lexique>(`${this.apiUrl}/${id}`, terme);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
