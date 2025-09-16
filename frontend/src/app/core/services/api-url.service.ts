import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiUrlService {

  private apiBaseUrl = environment.apiUrl;

  constructor() {
    console.log('ApiUrlService initialisé avec baseUrl:', this.apiBaseUrl);
  }

  getUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    const fullUrl = `${this.apiBaseUrl}/${cleanEndpoint}`;
    return fullUrl.replace(/([^:])\/\/+/g, '$1');
  }

  /**
   * Construit une URL pour une ressource statique (média) à partir de son nom de fichier et de son contexte.
   * @param fileName Le nom du fichier (ex: 'image.jpg')
   * @param context Le dossier de la ressource (ex: 'entrainements', 'exercices')
   * @returns URL relative ou absolue en fonction de l'environnement.
   */
  getMediaUrl(fileName?: string | null, context?: string): string | null {
    if (!fileName || !context) {
      return null;
    }

    // Nettoyer le nom du fichier pour ne garder que le nom de base
    const baseFileName = fileName.split('/').pop();

    if (!baseFileName) {
        return null;
    }

    // Si le chemin est déjà une URL complète, on le retourne.
    if (/^https?:\/\//i.test(baseFileName)) {
      return baseFileName;
    }

    const relativePath = `uploads/${context}/${baseFileName}`;

    // En production, on construit une URL absolue à partir de l'origine de l'API.
    if (environment.production) {
      const origin = new URL(this.apiBaseUrl).origin;
      return `${origin}/${relativePath}`;
    }

    // En développement, on retourne une URL relative préfixée par /api pour que le proxy la gère.
    return `/api/${relativePath}`;
  }

  getTrainingsUrl(): string {
    return this.getUrl('entrainements');
  }

  getTagsUrl(): string {
    return this.getUrl('tags');
  }

  getExercicesUrl(): string {
    return this.getUrl('exercices');
  }

  getPhasesUrl(): string {
    return this.getUrl('phases');
  }

  getResourceUrl(baseUrl: string, id: string): string {
    return `${baseUrl}/${id}`;
  }
}
