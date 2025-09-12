import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UploadResponse {
  message: string;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Uploade une image pour une entité spécifique.
   * @param entityType - Le type d'entité ('echauffements', 'situations-matchs', 'entrainements').
   * @param file - Le fichier image à uploader.
   * @returns Un Observable avec l'URL de l'image uploadée.
   */
  uploadImage(entityType: 'echauffements' | 'situations-matchs' | 'entrainements', file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file, file.name);

    const uploadUrl = `${this.apiUrl}/${entityType}/upload-image`;

    return this.http.post<UploadResponse>(uploadUrl, formData);
  }
}
