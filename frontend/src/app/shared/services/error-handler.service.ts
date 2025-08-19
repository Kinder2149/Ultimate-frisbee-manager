import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

/**
 * Types d'erreurs gérés par le service
 */
export enum ErrorType {
  HTTP = 'http',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NETWORK = 'network',
  INTERNAL = 'internal',
  UNKNOWN = 'unknown'
}

/**
 * Interface pour les erreurs personnalisées
 */
export interface AppError {
  /** Type d'erreur */
  type: ErrorType;
  /** Message d'erreur à afficher */
  message: string;
  /** Code d'erreur (HTTP ou personnalisé) */
  code?: number;
  /** Erreur technique détaillée (pour le débogage) */
  technicalDetails?: unknown;
  /** Date de l'erreur */
  timestamp: Date;
  /** URL concernée (pour les erreurs HTTP) */
  url?: string;
}

/**
 * Interface pour les écouteurs d'erreurs
 */
export interface ErrorListener {
  /** Méthode appelée lorsqu'une erreur est capturée */
  onError(error: AppError): void;
}

/**
 * Service centralisé de gestion des erreurs
 * Permet de capturer, traiter et analyser les erreurs de manière cohérente
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  /** Liste des écouteurs enregistrés */
  private listeners: ErrorListener[] = [];
  
  constructor() { }
  
  /**
   * Ajoute un écouteur d'erreurs
   * @param listener Écouteur à ajouter
   */
  addListener(listener: ErrorListener): void {
    if (!this.listeners.includes(listener)) {
      this.listeners.push(listener);
    }
  }
  
  /**
   * Supprime un écouteur d'erreurs
   * @param listener Écouteur à supprimer
   */
  removeListener(listener: ErrorListener): void {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }
  
  /**
   * Gère une erreur HTTP et retourne un Observable d'erreur
   * @param error Erreur HTTP
   * @param source Source de l'erreur (pour le logging)
   * @returns Observable d'erreur
   */
  handleHttpError(error: HttpErrorResponse, source: string = 'API'): Observable<never> {
    const appError = this.createAppErrorFromHttp(error, source);
    this.processError(appError);
    return throwError(() => appError);
  }
  
  /**
   * Gère une erreur d'application
   * @param message Message d'erreur
   * @param type Type d'erreur
   * @param details Détails techniques
   */
  handleAppError(message: string, type: ErrorType = ErrorType.INTERNAL, details?: unknown): void {
    const appError: AppError = {
      type,
      message,
      technicalDetails: details,
      timestamp: new Date()
    };
    
    this.processError(appError);
  }
  
  /**
   * Crée une erreur d'application à partir d'une erreur HTTP
   * @param error Erreur HTTP
   * @param source Source de l'erreur
   * @returns Erreur d'application
   */
  private createAppErrorFromHttp(error: HttpErrorResponse, source: string): AppError {
    let type = ErrorType.HTTP;
    let message = `Une erreur est survenue lors de la communication avec le serveur.`;
    
    // Déterminer le type d'erreur en fonction du code HTTP
    if (error.status === 0) {
      type = ErrorType.NETWORK;
      message = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
    } else if (error.status === 400) {
      type = ErrorType.VALIDATION;
      message = 'Données invalides. Veuillez vérifier les informations saisies.';
    } else if (error.status === 401) {
      type = ErrorType.AUTHENTICATION;
      message = 'Authentification requise. Veuillez vous connecter.';
    } else if (error.status === 403) {
      type = ErrorType.AUTHORIZATION;
      message = 'Vous n\'avez pas les droits nécessaires pour cette action.';
    } else if (error.status === 404) {
      type = ErrorType.HTTP;
      message = 'La ressource demandée est introuvable.';
    } else if (error.status === 500) {
      type = ErrorType.INTERNAL;
      message = 'Une erreur interne est survenue sur le serveur.';
    }
    
    // Extraire le message spécifique s'il existe
    if (error.error && typeof error.error === 'object' && error.error.message) {
      message = error.error.message;
    }
    
    // Créer l'erreur d'application
    return {
      type,
      message,
      code: error.status,
      technicalDetails: error.error,
      timestamp: new Date(),
      url: error.url || undefined
    };
  }
  
  /**
   * Traite une erreur (log et notification)
   * @param error Erreur à traiter
   */
  private processError(error: AppError): void {
    // Loguer l'erreur
    this.logError(error);
    
    // Notifier les écouteurs
    this.notifyListeners(error);
  }
  
  /**
   * Envoie l'erreur aux écouteurs enregistrés
   * @param error Erreur à envoyer
   */
  private notifyListeners(error: AppError): void {
    for (const listener of this.listeners) {
      try {
        listener.onError(error);
      } catch (e) {
        console.error('Erreur lors de la notification d\'un écouteur:', e);
      }
    }
  }
  
  /**
   * Enregistre l'erreur dans la console
   * @param error Erreur à loguer
   */
  private logError(error: AppError): void {
    const logMessage = `[ERREUR] [${error.type}] ${error.message}`;
    
    console.error(logMessage);
    if (error.technicalDetails) {
      console.error('Détails techniques:', error.technicalDetails);
    }
  }
}
