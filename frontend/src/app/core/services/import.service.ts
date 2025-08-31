import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiUrlService } from './api-url.service';

export interface MdFilePayload { name?: string; content: string }

@Injectable({ providedIn: 'root' })
export class ImportService {
  private baseUrl = this.apiUrl.getUrl('import');

  constructor(private http: HttpClient, private apiUrl: ApiUrlService) {}

  dryRunFromMarkdown(files: MdFilePayload[]): Observable<any> {
    const url = `${this.baseUrl}/markdown`;
    const params = new HttpParams().set('dryRun', 'true');
    return this.http.post(url, { files }, { params });
  }

  applyFromMarkdown(files: MdFilePayload[]): Observable<any> {
    const url = `${this.baseUrl}/markdown`;
    const params = new HttpParams().set('dryRun', 'false');
    return this.http.post(url, { files }, { params });
  }

  // Si on veut envoyer du JSON déjà parsé (parseur local) plus tard
  importExercices(json: any, dryRun = true): Observable<any> {
    const url = `${this.baseUrl}/exercices`;
    const params = new HttpParams().set('dryRun', String(dryRun));
    return this.http.post(url, json, { params });
  }
}
