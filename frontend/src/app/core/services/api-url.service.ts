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
