import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SituationMatch } from '../models/situationmatch.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SituationMatchService {
  private readonly apiUrl = `${environment.apiUrl}/matches`;

  constructor(private http: HttpClient) {}

  getSituationsMatchs(): Observable<SituationMatch[]> {
    return this.http.get<SituationMatch[]>(this.apiUrl);
  }

  getSituationMatchById(id: string): Observable<SituationMatch> {
    return this.http.get<SituationMatch>(`${this.apiUrl}/${id}`);
  }

  createSituationMatch(data: FormData | Partial<SituationMatch>): Observable<SituationMatch> {
    return this.http.post<SituationMatch>(this.apiUrl, data);
  }

  updateSituationMatch(id: string, data: FormData | Partial<SituationMatch>): Observable<SituationMatch> {
    return this.http.put<SituationMatch>(`${this.apiUrl}/${id}`, data);
  }

  deleteSituationMatch(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  duplicateSituationMatch(id: string): Observable<SituationMatch> {
    return this.http.post<SituationMatch>(`${this.apiUrl}/${id}/duplicate`, {});
  }
}
