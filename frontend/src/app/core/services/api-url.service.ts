import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Service centralisé pour la gestion des URLs d'API
 * Permet d'éviter les doublons et d'assurer la cohérence des chemins d'API
 */
@Injectable({
  providedIn: 'root'
})
export class ApiUrlService {

  /**
   * Base URL de l'API extraite de l'environnement
   * @private
   */
  private apiBaseUrl = environment.apiUrl;

  constructor() { 
    console.log('ApiUrlService initialisé avec baseUrl:', this.apiBaseUrl);
  }

  /**
   * Construit une URL d'API complète à partir d'un endpoint
   * Nettoie les barres obliques multiples pour éviter les doublons
   * @param endpoint Chemin de l'endpoint sans le préfixe de base
   * @returns URL complète et nettoyée
   */
  getUrl(endpoint: string): string {
    // Enlève les barres obliques au début de l'endpoint pour éviter les doublons
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    // Construit l'URL complète
    const fullUrl = `${this.apiBaseUrl}/${cleanEndpoint}`;
    // Nettoie les doubles barres obliques mais préserve le protocole
    const cleanUrl = fullUrl.replace(/([^:]\/)\/+/g, '$1');
    console.log('ApiUrlService.getUrl:', { endpoint, cleanEndpoint, apiBaseUrl: this.apiBaseUrl, fullUrl, cleanUrl });
    return cleanUrl;
  }

  /**
   * Construit une URL absolue pour un média (ex: /uploads/...).
   * - Si l'entrée est déjà absolue (http/https), on la retourne telle quelle.
   * - Si l'entrée commence par '/', on la préfixe par la base d'hôte dérivée de apiUrl (sans le suffixe /api).
   * - Sinon on considère que c'est un chemin relatif d'API et on passe par getUrl.
   */
  getMediaUrl(pathOrUrl?: string | null): string | null {
    if (!pathOrUrl) return null;

    const val = String(pathOrUrl).trim();
    if (!val) return null;

    // Déjà absolu
    if (/^https?:\/\//i.test(val)) {
      return val;
    }

    // Dériver l'origine de l'API (ex: http://localhost:3002)
    const origin = new URL(this.apiBaseUrl).origin;

    // Si le chemin commence par '/', c'est un chemin absolu par rapport à l'hôte.
    if (val.startsWith('/')) {
      return `${origin}${val}`;
    }

    // Pour les autres cas (chemins relatifs comme 'uploads/...'), on le traite comme un endpoint d'API.
    return this.getUrl(val);
  }

  /**
   * Retourne l'URL pour les entraînements
   * @returns URL complète pour l'API des entraînements
   */
  getTrainingsUrl(): string {
    return this.getUrl('entrainements');
  }

  /**
   * Retourne l'URL pour les tags d'entraînement
   * @returns URL complète pour l'API des tags d'entraînement
   */
  getTagsUrl(): string {
    return this.getUrl('tags');
  }

  /**
   * Retourne l'URL pour les exercices
   * @returns URL complète pour l'API des exercices
   */
  getExercicesUrl(): string {
    return this.getUrl('exercices');
  }

  /**
   * Retourne l'URL pour les phases d'entraînement
   * @returns URL complète pour l'API des phases
   */
  getPhasesUrl(): string {
    return this.getUrl('phases');
  }

  /**
   * Retourne l'URL pour une ressource spécifique via son ID
   * @param baseUrl URL de base de la ressource
   * @param id Identifiant de la ressource
   * @returns URL complète pour accéder à la ressource par ID
   */
  getResourceUrl(baseUrl: string, id: string): string {
    return `${baseUrl}/${id}`;
  }
}
