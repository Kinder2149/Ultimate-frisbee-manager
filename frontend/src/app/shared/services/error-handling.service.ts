import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Types d'erreurs possibles dans l'application
 */
export enum ErrorType {
  NETWORK = 'network',
  VALIDATION = 'validation',
  SERVER = 'server',
  UNAUTHORIZED = 'unauthorized',
  NOT_FOUND = 'not_found',
  UNKNOWN = 'unknown'
}

/**
 * Configuration d'un message d'erreur
 */
export interface ErrorConfig {
  /**
   * Type d'erreur
   */
  type: ErrorType;
  
  /**
   * Message à afficher à l'utilisateur
   */
  userMessage: string;
  
  /**
   * Message pour les logs (optionnel)
   */
  logMessage?: string;
  
  /**
   * Données d'erreur originales (optionnel)
   */
  originalError?: unknown;
  
  /**
   * Durée d'affichage en millisecondes (optionnel, par défaut 3000ms)
   */
  duration?: number;
}

/**
 * Service de gestion centralisée des erreurs
 * Permet d'uniformiser l'affichage et le traitement des erreurs dans toute l'application
 * 
 * @example
 * // Usage simple
 * this.errorService.handleError(error);
 * 
 * @example
 * // Usage avec type spécifique
 * this.errorService.handleErrorWithType(ErrorType.VALIDATION, 'Données invalides');
 * 
 * @example
 * // Usage avec configuration complète
 * this.errorService.handleErrorWithConfig({
 *   type: ErrorType.SERVER,
 *   userMessage: 'Erreur serveur, réessayez plus tard',
 *   logMessage: 'Erreur HTTP 500 lors de la création d\'entraînement',
 *   originalError: error,
 *   duration: 5000
 * });
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {
  // Durée par défaut d'affichage des messages d'erreur (3 secondes)
  private defaultDuration = 3000;
  
  // Messages d'erreur par défaut selon le type
  private defaultMessages: Record<ErrorType, string> = {
    [ErrorType.NETWORK]: 'Problème de connexion réseau, vérifiez votre connexion internet',
    [ErrorType.VALIDATION]: 'Données invalides, vérifiez les informations saisies',
    [ErrorType.SERVER]: 'Erreur serveur, veuillez réessayer ultérieurement',
    [ErrorType.UNAUTHORIZED]: 'Vous n\'êtes pas autorisé à effectuer cette action',
    [ErrorType.NOT_FOUND]: 'Ressource non trouvée',
    [ErrorType.UNKNOWN]: 'Une erreur inattendue s\'est produite'
  };

  constructor(private snackBar: MatSnackBar) { }
  
  /**
   * Traite et affiche une erreur avec détection automatique du type
   * @param error L'erreur à traiter (HttpErrorResponse ou autre)
   * @param customMessage Message personnalisé (optionnel)
   */
  handleError(error: unknown, customMessage?: string): void {
    console.error('Erreur détectée:', error);
    
    const errorType = this.detectErrorType(error);
    const message = customMessage || this.getMessageForType(errorType);
    
    this.displayError({
      type: errorType,
      userMessage: message,
      originalError: error
    });
  }
  
  /**
   * Traite et affiche une erreur avec un type spécifique
   * @param type Type d'erreur
   * @param customMessage Message personnalisé (optionnel)
   */
  handleErrorWithType(type: ErrorType, customMessage?: string): void {
    const message = customMessage || this.getMessageForType(type);
    
    this.displayError({
      type,
      userMessage: message
    });
  }
  
  /**
   * Traite et affiche une erreur avec une configuration complète
   * @param config Configuration complète de l'erreur
   */
  handleErrorWithConfig(config: ErrorConfig): void {
    // Logging si un message de log est fourni
    if (config.logMessage) {
      console.error(config.logMessage, config.originalError);
    }
    
    this.displayError(config);
  }
  
  /**
   * Affiche l'erreur à l'utilisateur
   * @param config Configuration de l'erreur
   * @private
   */
  private displayError(config: ErrorConfig): void {
    this.snackBar.open(config.userMessage, 'Fermer', {
      duration: config.duration || this.defaultDuration,
      panelClass: ['error-snackbar', `error-${config.type}`]
    });
  }
  
  /**
   * Détecte le type d'erreur
   * @param error L'erreur à analyser
   * @private
   */
  private detectErrorType(error: unknown): ErrorType {
    if (!navigator.onLine) {
      return ErrorType.NETWORK;
    }
    
    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 0:
          return ErrorType.NETWORK;
        case 400:
          return ErrorType.VALIDATION;
        case 401:
        case 403:
          return ErrorType.UNAUTHORIZED;
        case 404:
          return ErrorType.NOT_FOUND;
        case 500:
          return ErrorType.SERVER;
      }
    }
    
    return ErrorType.UNKNOWN;
  }
  
  /**
   * Récupère le message par défaut pour un type d'erreur donné
   * @param type Type d'erreur
   * @private
   */
  private getMessageForType(type: ErrorType): string {
    return this.defaultMessages[type];
  }
  
  /**
   * Génère un message d'erreur spécifique à une action CRUD
   * @param action Action CRUD (créer, modifier, supprimer, etc.)
   * @param ressource Type de ressource concernée
   * @returns Message d'erreur formaté
   */
  getActionErrorMessage(action: string, ressource: string): string {
    return `Erreur lors de l'action "${action}" sur ${ressource}`;
  }
}
