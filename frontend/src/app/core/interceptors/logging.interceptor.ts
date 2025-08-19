import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Intercepteur pour journaliser toutes les requêtes HTTP
 * Aide à détecter les problèmes d'URL incorrectes et les erreurs 404
 */
@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  
  /**
   * Intercepte chaque requête HTTP pour en afficher les détails
   * @param req La requête HTTP interceptée
   * @param next Le gestionnaire pour passer à l'intercepteur suivant
   * @returns Observable de l'événement HTTP (réponse)
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    
    console.log(`[API] [${requestId}] Requête ${req.method} vers: ${req.url}`);
    
    return next.handle(req).pipe(
      tap({
        next: (event) => {
          if (event instanceof HttpResponse) {
            const duration = Date.now() - startTime;
            console.log(`[API] [${requestId}] Réponse de ${req.url} en ${duration}ms - Status: ${event.status}`);
          }
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          console.error(`[API] [${requestId}] Erreur pour ${req.url} en ${duration}ms - Status: ${error.status}`, error);
          
          // Journalisation spéciale pour les erreurs 404
          if (error.status === 404) {
            console.error(`[API] [${requestId}] URL non trouvée: ${req.url}`);
            console.error(`[API] [${requestId}] Headers:`, req.headers);
            console.error(`[API] [${requestId}] Body:`, req.body);
          }
        }
      })
    );
  }
  
  /**
   * Génère un identifiant unique pour chaque requête
   * @returns Identifiant de requête au format court
   */
  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 8);
  }
}
