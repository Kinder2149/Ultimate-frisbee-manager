import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WorkspaceService } from '../services/workspace.service';

@Injectable()
export class WorkspaceErrorInterceptor implements HttpInterceptor {
  constructor(
    private workspaceService: WorkspaceService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Ne traiter que les requêtes vers notre API backend
    if (!req.url.startsWith(environment.apiUrl)) {
      return next.handle(req);
    }

    return next.handle(req).pipe(
      catchError((err: any) => {
        if (err instanceof HttpErrorResponse) {
          const status = err.status;

          // On ne s'intéresse ici qu'aux 403/404 potentiellement liés au workspace courant
          if (status === 403 || status === 404) {
            const currentUrl = this.router.url || '/';

            // Si on est déjà sur la page de sélection, ne pas boucler
            if (!currentUrl.startsWith('/select-workspace')) {
              // On nettoie le workspace courant côté front
              this.workspaceService.clear();

              // Redirection vers la sélection de workspace avec retour prévu
              this.router.navigate(['/select-workspace'], {
                queryParams: {
                  returnUrl: currentUrl,
                  reason: 'workspace-unavailable'
                }
              });
            }
          }
        }

        return throwError(() => err);
      })
    );
  }
}
