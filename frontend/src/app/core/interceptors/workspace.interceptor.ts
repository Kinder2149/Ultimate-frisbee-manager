import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WorkspaceService } from '../services/workspace.service';

@Injectable()
export class WorkspaceInterceptor implements HttpInterceptor {
  constructor(private workspaceService: WorkspaceService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // N'ajouter le header que pour notre API backend
    const isBackendApiRequest =
      req.url.startsWith(environment.apiUrl) ||
      req.url.startsWith('/api/');

    if (!isBackendApiRequest) {
      return next.handle(req);
    }

    const workspaceId = this.workspaceService.getCurrentWorkspaceId();

    // Ne rien ajouter pour les routes qui servent justement à récupérer les workspaces
    if (!workspaceId) {
      return next.handle(req);
    }

    // Ajouter le header X-Workspace-Id pour filtrer les données par workspace
    const cloned = req.clone({
      setHeaders: {
        'X-Workspace-Id': workspaceId,
      },
    });

    return next.handle(cloned);
  }
}
