import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WorkspaceService } from '../services/workspace.service';

@Injectable()
export class WorkspaceErrorInterceptor implements HttpInterceptor {
  constructor(
    private workspaceService: WorkspaceService,
    private router: Router,
    private snackBar: MatSnackBar
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
          const errorCode = err.error?.code;

          // AMÉLIORATION: Vérifier le code d'erreur spécifique au workspace
          const isWorkspaceError = 
            errorCode === 'WORKSPACE_FORBIDDEN' ||
            errorCode === 'WORKSPACE_ID_REQUIRED' ||
            errorCode === 'WORKSPACE_NOT_FOUND' ||
            errorCode === 'NO_USER_FOR_WORKSPACE' ||
            errorCode === 'TESTER_BASE_FORBIDDEN';

          if (isWorkspaceError && (status === 403 || status === 400 || status === 404)) {
            const currentUrl = this.router.url || '/';

            // Si on est déjà sur la page de sélection, ne pas boucler
            if (!currentUrl.startsWith('/select-workspace')) {
              console.warn('[WorkspaceErrorInterceptor] Workspace error detected:', errorCode);
              
              // Nettoyer le workspace courant côté front
              this.workspaceService.clear();

              // Notifier l'utilisateur explicitement
              this.snackBar.open(
                'Le workspace sélectionné n\'est plus accessible. Veuillez en sélectionner un autre.',
                'OK',
                { duration: 5000, panelClass: ['snackbar-warning'] }
              );

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
