import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Niveaux de log disponibles
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

/**
 * Interface pour le contexte de log
 */
export interface LogContext {
  userId?: string;
  workspaceId?: string;
  route?: string;
  component?: string;
  action?: string;
  [key: string]: any;
}

/**
 * Service de logging centralisé pour le frontend
 * Remplace les console.log/error dispersés dans l'application
 * Permet un contrôle fin des logs selon l'environnement
 */
@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private currentLevel: LogLevel;
  private readonly isDevelopment: boolean;

  constructor() {
    this.isDevelopment = !environment.production;
    // En production, logger uniquement WARN et ERROR
    // En développement, logger tout sauf DEBUG (sauf si explicitement activé)
    this.currentLevel = this.isDevelopment ? LogLevel.INFO : LogLevel.WARN;
    
    // Permettre l'override via localStorage pour le debug
    const storedLevel = localStorage.getItem('logLevel');
    if (storedLevel && LogLevel[storedLevel as keyof typeof LogLevel] !== undefined) {
      this.currentLevel = LogLevel[storedLevel as keyof typeof LogLevel];
    }
  }

  /**
   * Change le niveau de log dynamiquement
   */
  setLevel(level: LogLevel): void {
    this.currentLevel = level;
    localStorage.setItem('logLevel', LogLevel[level]);
  }

  /**
   * Log de niveau DEBUG
   * Utilisé pour les informations de débogage détaillées
   */
  debug(message: string, context?: LogContext): void {
    if (this.currentLevel <= LogLevel.DEBUG) {
      this.log('DEBUG', message, context, console.debug);
    }
  }

  /**
   * Log de niveau INFO
   * Utilisé pour les informations générales sur le flux de l'application
   */
  info(message: string, context?: LogContext): void {
    if (this.currentLevel <= LogLevel.INFO) {
      this.log('INFO', message, context, console.info);
    }
  }

  /**
   * Log de niveau WARN
   * Utilisé pour les avertissements (situations anormales mais non bloquantes)
   */
  warn(message: string, context?: LogContext): void {
    if (this.currentLevel <= LogLevel.WARN) {
      this.log('WARN', message, context, console.warn);
    }
  }

  /**
   * Log de niveau ERROR
   * Utilisé pour les erreurs (situations bloquantes)
   */
  error(message: string, error?: any, context?: LogContext): void {
    if (this.currentLevel <= LogLevel.ERROR) {
      const errorContext = {
        ...context,
        errorName: error?.name,
        errorMessage: error?.message,
        errorStack: error?.stack
      };
      this.log('ERROR', message, errorContext, console.error);
      
      // En production, on pourrait envoyer les erreurs à un service externe
      if (!this.isDevelopment) {
        this.sendToRemote('ERROR', message, errorContext);
      }
    }
  }

  /**
   * Log une action utilisateur
   */
  logAction(action: string, context?: LogContext): void {
    this.info(`Action: ${action}`, { ...context, action });
  }

  /**
   * Log une navigation
   */
  logNavigation(route: string, context?: LogContext): void {
    this.debug(`Navigation: ${route}`, { ...context, route });
  }

  /**
   * Log une requête HTTP
   */
  logHttpRequest(method: string, url: string, context?: LogContext): void {
    this.debug(`HTTP ${method}: ${url}`, { ...context, method, url });
  }

  /**
   * Log une réponse HTTP
   */
  logHttpResponse(method: string, url: string, status: number, duration?: number, context?: LogContext): void {
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'debug';
    const message = `HTTP ${method} ${url} - ${status}${duration ? ` (${duration}ms)` : ''}`;
    
    if (level === 'error') {
      this.error(message, null, { ...context, method, url, status, duration });
    } else if (level === 'warn') {
      this.warn(message, { ...context, method, url, status, duration });
    } else {
      this.debug(message, { ...context, method, url, status, duration });
    }
  }

  /**
   * Méthode privée pour formater et logger
   */
  private log(
    level: string,
    message: string,
    context: LogContext | undefined,
    logFn: (...args: any[]) => void
  ): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}]`;
    
    if (context && Object.keys(context).length > 0) {
      logFn(`${prefix} ${message}`, context);
    } else {
      logFn(`${prefix} ${message}`);
    }
  }

  /**
   * Envoie les logs à un service distant (optionnel, pour la production)
   * À implémenter selon les besoins (Sentry, LogRocket, etc.)
   */
  private sendToRemote(level: string, message: string, context?: LogContext): void {
    // TODO: Implémenter l'envoi vers un service de logging externe si nécessaire
    // Exemple: Sentry, LogRocket, CloudWatch, etc.
    // Pour l'instant, on ne fait rien
  }

  /**
   * Groupe de logs (pour regrouper visuellement dans la console)
   */
  group(label: string): void {
    if (this.isDevelopment) {
      console.group(label);
    }
  }

  /**
   * Fin du groupe de logs
   */
  groupEnd(): void {
    if (this.isDevelopment) {
      console.groupEnd();
    }
  }

  /**
   * Table de données (pour afficher des tableaux dans la console)
   */
  table(data: any): void {
    if (this.isDevelopment && this.currentLevel <= LogLevel.DEBUG) {
      console.table(data);
    }
  }
}
