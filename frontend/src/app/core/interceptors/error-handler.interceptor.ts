import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';
import { CacheService } from '../services/cache.service';


/**
 * Intercepteur pour gérer de manière centralisée les erreurs HTTP
 * Transforme les erreurs techniques en messages utilisateur compréhensibles
 */
@Injectable()
export class ErrorHandlerInterceptor implements HttpInterceptor {
  // Préfixes des URLs à traiter spécifiquement
  private readonly CACHE_PREFIXES = {
    trainings: '/api/entrainements',
    tags: '/api/tags',
    phases: '/api/phases',
    exercises: '/api/exercises'
  };
  
  constructor(
    private notificationService: NotificationService,
    private cacheService: CacheService
  ) {}

  /**
   * Intercepte les requêtes HTTP et gère les erreurs
   * @param req La requête HTTP
   * @param next Le gestionnaire HTTP suivant
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Journalisation des requêtes pour le débogage (uniquement en développement)
    const startTime = Date.now();
    console.debug(`[HTTP] ${req.method} ${req.url} - Démarrage`);
    
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error, req)),
      finalize(() => {
        const endTime = Date.now();
        const requestDuration = endTime - startTime;
        console.debug(`[HTTP] ${req.method} ${req.url} - Terminé en ${requestDuration}ms`);
      })
    );
  }

  /**
   * Gère les erreurs HTTP et affiche des notifications appropriées
   * @param error L'erreur HTTP interceptée
   * @param req La requête HTTP originale
   */
  private handleError(error: HttpErrorResponse, req: HttpRequest<any>): Observable<never> {
    let errorMessage = 'Une erreur est survenue';
    // Créer une signature pour l'erreur pour faciliter l'analyse et le regroupement
    const errorSignature = `${req.method}:${error.status}:${this.getResourceType(req.url)}`;

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
      console.error(`[Client Error] ${errorSignature}: ${error.error.message}`);
    } else {
      // Erreur côté serveur
      switch (error.status) {
        case 0:
          errorMessage = 'Problème de connexion au serveur. Vérifiez votre connexion internet.';
          break;
        case 400:
          errorMessage = `Requête invalide: ${error.error?.message || 'Les données envoyées sont invalides'}`;
          
          // Analyser les erreurs de validation pour fournir plus de détails
          if (error.error?.errors) {
            const validationErrors = Object.entries(error.error.errors)
              .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
              .join('; ');
            errorMessage = `Validation échouée: ${validationErrors}`;
          }
          break;
        case 401:
          errorMessage = 'Authentification requise. Veuillez vous connecter.';
          break;
        case 403:
          errorMessage = 'Accès non autorisé. Vous n\'avez pas les droits nécessaires.';
          break;
        case 404:
          errorMessage = `${this.getResourceName(req.url)} introuvable.`;
          break;
        case 409:
          errorMessage = `Conflit avec l\'état actuel de ${this.getResourceName(req.url)}.`;
          break;
        case 422:
          errorMessage = 'Les données fournies sont invalides.';
          break;
        case 500:
          errorMessage = 'Erreur interne du serveur. Veuillez réessayer plus tard.';
          break;
        default:
          errorMessage = `Erreur ${error.status}: ${error.error?.message || 'Une erreur inattendue est survenue'}`;
      }
      
      // Pour toute erreur 5xx, invalider le cache concerné
      if (error.status >= 500) {
        this.invalidateRelatedCache(req.url);
      }
    }

    // Log détaillé pour le débogage avec structure enrichie
    console.error('Détails de l\'erreur HTTP:', {
      signature: errorSignature,
      url: req.url,
      method: req.method,
      status: error.status,
      statusText: error.statusText,
      message: error.message,
      payload: req.body, // Données envoyées qui ont causé l'erreur
      error: error.error,
      timestamp: new Date().toISOString()
    });

    // Utilisation du service de notification pour afficher les erreurs
    this.notificationService.showError(errorMessage);

    // Renvoie l'erreur pour que les composants puissent la traiter si nécessaire
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Extrait un nom de ressource lisible à partir d'une URL
   * @param url URL de la requête
   * @returns Nom de la ressource formaté
   */
  private getResourceName(url: string): string {
    if (!url) return 'La ressource';
    
    // Extraction du dernier segment de l'URL (après le dernier /)
    const segments = url.split('/');
    let resourceName = segments[segments.length - 1];
    
    // Si c'est un ID (nombre ou UUID), prendre le segment précédent
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(resourceName) || 
        /^\d+$/.test(resourceName)) {
      resourceName = segments[segments.length - 2] || 'ressource';
    }
    
    // Conversion des noms d'API en noms plus lisibles
    const resourceMappings: Record<string, string> = {
      'entrainements': 'L\'entraînement',
      'tags': 'Le tag',
      'phases': 'La phase',
      'exercises': 'L\'exercice',
      'duplicate': 'La duplication',
    };
    
    // Vérifier si on a un mapping direct
    if (resourceName in resourceMappings) {
      return resourceMappings[resourceName];
    }
    
    // Sinon appliquer la règle standard
    // Mise en forme: suppression du 's' final et première lettre en majuscule
    resourceName = resourceName.endsWith('s') ? 
      resourceName.substring(0, resourceName.length - 1) : resourceName;
    
    return 'L\'' + resourceName.charAt(0).toUpperCase() + resourceName.slice(1);
  }
  
  /**
   * Détermine le type de ressource concernée par une URL
   * @param url URL à analyser
   * @returns Type de ressource (trainings, tags, phases, etc.)
   */
  private getResourceType(url: string): string {
    if (!url) return 'unknown';
    
    // Identifier à quel type de ressource appartient cette URL
    for (const [type, prefix] of Object.entries(this.CACHE_PREFIXES)) {
      if (url.includes(prefix)) {
        return type;
      }
    }
    
    return 'other';
  }
  
  /**
   * Invalide le cache en fonction de l'URL concernée par l'erreur
   * @param url URL qui a provoqué l'erreur
   */
  private invalidateRelatedCache(url: string): void {
    if (!url) return;
    
    let cachePrefix: string | null = null;
    
    // Déterminer quel cache doit être invalidé
    if (url.includes(this.CACHE_PREFIXES.trainings)) {
      cachePrefix = 'entrainements';
    } else if (url.includes(this.CACHE_PREFIXES.tags)) {
      cachePrefix = 'tags';
    } else if (url.includes(this.CACHE_PREFIXES.phases)) {
      cachePrefix = 'phases';
    } else if (url.includes(this.CACHE_PREFIXES.exercises)) {
      cachePrefix = 'exercises';
    }
    
    // Invalider le cache si nécessaire
    if (cachePrefix) {
      const count = this.cacheService.clearByPrefix(cachePrefix);
      console.info(`[ErrorHandlerInterceptor] Cache '${cachePrefix}' invalidé suite à une erreur (${count} entrées supprimées)`);
    }
  }
}
