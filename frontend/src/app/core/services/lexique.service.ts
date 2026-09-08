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
}
