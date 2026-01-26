import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Entrainement } from '../models/entrainement.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EntrainementService {
  private readonly apiUrl = `${environment.apiUrl}/trainings`;

  constructor(private http: HttpClient) {}

  getEntrainements(): Observable<Entrainement[]> {
    return this.http.get<Entrainement[]>(this.apiUrl);
  }

  getEntrainementById(id: string): Observable<Entrainement> {
    return this.http.get<Entrainement>(`${this.apiUrl}/${id}`);
  }

  createEntrainement(data: FormData | Partial<Entrainement>): Observable<Entrainement> {
    return this.http.post<Entrainement>(this.apiUrl, data);
  }

  updateEntrainement(id: string, data: FormData | Partial<Entrainement>): Observable<Entrainement> {
    return this.http.put<Entrainement>(`${this.apiUrl}/${id}`, data);
  }

  deleteEntrainement(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  duplicateEntrainement(id: string): Observable<Entrainement> {
    return this.http.post<Entrainement>(`${this.apiUrl}/${id}/duplicate`, {});
  }
}
