import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiUrlService {

  private apiBaseUrl = environment.apiUrl;

  constructor() {
    // Log supprimé pour réduire le bruit en console
  }

  getUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    const fullUrl = `${this.apiBaseUrl}/${cleanEndpoint}`;
    return fullUrl.replace(/([^:])\/\/+/g, '$1');
  }

  /**
   * Construit une URL pour une ressource statique (média) à partir de son nom de fichier et de son contexte.
   * @param fileName Le nom du fichier (ex: 'image.jpg') ou une URL complète.
   * @param context Le dossier de la ressource (ex: 'entrainements', 'exercices')
   * @returns URL relative ou absolue en fonction de l'environnement.
   */
  getMediaUrl(fileName?: string | null, context?: string): string | null {
    if (!fileName) {
      return null;
    }

    // Si le chemin est déjà une URL complète (http, https), on le retourne directement
    if (/^https?:\/\//i.test(fileName)) {
      return fileName;
    }

    // Pour les chemins relatifs, un contexte est requis
    if (!context) {
      return null;
    }

    const baseFileName = fileName.split('/').pop();
    if (!baseFileName) {
      return null;
    }

    const relativePath = `uploads/${context}/${baseFileName}`;

    // En production, URL absolue. En dev, URL relative pour le proxy.
    if (environment.production) {
      const origin = new URL(this.apiBaseUrl).origin;
      return `${origin}/${relativePath}`;
    } else {
      return `/api/${relativePath}`;
    }
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