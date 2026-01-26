import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Echauffement } from '../models/echauffement.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EchauffementService {
  private readonly apiUrl = `${environment.apiUrl}/warmups`;

  constructor(private http: HttpClient) {}

  getEchauffements(): Observable<Echauffement[]> {
    return this.http.get<Echauffement[]>(this.apiUrl);
  }

  getEchauffementById(id: string): Observable<Echauffement> {
    return this.http.get<Echauffement>(`${this.apiUrl}/${id}`);
  }

  createEchauffement(data: FormData | Partial<Echauffement>): Observable<Echauffement> {
    return this.http.post<Echauffement>(this.apiUrl, data);
  }

  updateEchauffement(id: string, data: FormData | Partial<Echauffement>): Observable<Echauffement> {
    return this.http.put<Echauffement>(`${this.apiUrl}/${id}`, data);
  }

  deleteEchauffement(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  duplicateEchauffement(id: string): Observable<Echauffement> {
    return this.http.post<Echauffement>(`${this.apiUrl}/${id}/duplicate`, {});
  }
}
