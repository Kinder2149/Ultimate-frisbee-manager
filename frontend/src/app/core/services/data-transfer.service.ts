import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ImportService, MdFilePayload } from './import.service';
import { ApiUrlService } from './api-url.service';

export type TransferType = 'exercice' | 'entrainement' | 'echauffement' | 'situation' | 'match';

export interface ImportAnalysisField {
  name: string;
  value: any;
  required: boolean;
  present: boolean;
}

export interface ImportAnalysisResult {
  type: TransferType;
  recognized: string[];
  missing: Array<{ name: string; required: boolean }>;
  fields: ImportAnalysisField[];
}

@Injectable({ providedIn: 'root' })
export class DataTransferService {
  constructor(private importService: ImportService, private http: HttpClient, private apiUrl: ApiUrlService) {}

  // IMPORT — Markdown (multi-fichiers)
  dryRunMarkdown(files: MdFilePayload[]): Observable<any> {
    return this.importService.dryRunFromMarkdown(files);
  }

  applyMarkdown(files: MdFilePayload[]): Observable<any> {
    return this.importService.applyFromMarkdown(files);
  }

  // IMPORT — JSON structuré (exercices)
  dryRunJson(json: any): Observable<any> {
    return this.importService.importExercices(json, true);
  }

  applyJson(json: any): Observable<any> {
    return this.importService.importExercices(json, false);
  }

  // IMPORT — Analyse d'un élément pour aperçu/correction
  importElement(type: TransferType, element: any, mode: 'dryRun'|'apply' = 'dryRun'): Observable<ImportAnalysisResult> {
    // Analyse locale (tolérante) basée sur un petit set de champs requis par type
    const requiredByType: Record<TransferType, string[]> = {
      exercice: ['nom', 'description'],
      entrainement: ['titre'],
      echauffement: ['nom'],
      situation: ['type'],
      match: ['nom']
    };
    const required = requiredByType[type] || [];
    const allKeys = Object.keys(element || {});
    const recognized: string[] = allKeys;
    const fields: ImportAnalysisField[] = [];
    const missing: Array<{ name: string; required: boolean }> = [];

    required.forEach((k) => {
      const present = element?.[k] !== undefined && element?.[k] !== null && String(element?.[k]).trim() !== '';
      if (!present) missing.push({ name: k, required: true });
    });
    recognized.forEach((k) => {
      const req = required.includes(k);
      fields.push({ name: k, value: element?.[k], required: req, present: element?.[k] !== undefined && element?.[k] !== null });
    });
    // Ajouter aussi les requis manquants dans le tableau fields
    required.filter(k => !recognized.includes(k)).forEach(k => fields.push({ name: k, value: '', required: true, present: false }));

    return of({ type, recognized, missing, fields });
  }

  // IMPORT — JSON structuré (multi-types): envoie chaque type présent vers son endpoint dédié
  dryRunPayload(payload: any): Observable<any> {
    return this.importPayload(payload, true);
  }

  applyPayload(payload: any): Observable<any> {
    return this.importPayload(payload, false);
  }

  private importPayload(payload: any, dryRun: boolean): Observable<any> {
    const tasks: Array<Observable<any>> = [];
    const keys: string[] = [];

    if (Array.isArray(payload?.exercices) && payload.exercices.length) {
      tasks.push(this.importService.importExercices({ exercices: payload.exercices }, dryRun));
      keys.push('exercices');
    }
    if (Array.isArray(payload?.entrainements) && payload.entrainements.length) {
      tasks.push(this.importService.importEntrainements({ entrainements: payload.entrainements }, dryRun));
      keys.push('entrainements');
    }
    if (Array.isArray(payload?.echauffements) && payload.echauffements.length) {
      tasks.push(this.importService.importEchauffements({ echauffements: payload.echauffements }, dryRun));
      keys.push('echauffements');
    }
    if (Array.isArray(payload?.situations) && payload.situations.length) {
      tasks.push(this.importService.importSituations({ situations: payload.situations }, dryRun));
      keys.push('situations');
    }

    if (tasks.length === 0) {
      return of({ dryRun, totals: { input: 0 }, note: 'Aucun élément à importer' });
    }

    return forkJoin(tasks).pipe(
      map((results) => {
        const combined: any = { dryRun, results: {} };
        results.forEach((res, i) => {
          combined.results[keys[i]] = res;
        });
        return combined;
      })
    );
  }

  // EXPORT — Appel API et téléchargement du fichier .ufm.json
  exportElement(type: TransferType, id: string): Observable<string> {
    const url = this.apiUrl.getUrl('admin/export-ufm');
    const params = new HttpParams().set('type', type).set('id', id);
    return this.http.get(url, { params, observe: 'response', responseType: 'blob' }).pipe(
      map((resp: HttpResponse<Blob>) => {
        // Déterminer le nom de fichier depuis les headers ou fallback
        const dispo = resp.headers.get('content-disposition') || '';
        const match = /filename\s*=\s*"?([^";]+)"?/i.exec(dispo);
        const filename = match?.[1] || `${type}_${id}.ufm.json`;

        // Déclencher le téléchargement
        const blob = resp.body || new Blob([JSON.stringify({})], { type: 'application/json' });
        const link = document.createElement('a');
        const urlObj = URL.createObjectURL(blob);
        try {
          link.href = urlObj;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
        } finally {
          document.body.removeChild(link);
          URL.revokeObjectURL(urlObj);
        }
        return filename;
      })
    );
  }

  exportMultiple(_items: Array<{ type: TransferType; id: string }>): Observable<string[]> {
    return of([]);
  }
}
