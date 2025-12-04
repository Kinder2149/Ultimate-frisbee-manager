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
    if (!req.url.startsWith(environment.apiUrl)) {
      return next.handle(req);
    }

    const workspaceId = this.workspaceService.getCurrentWorkspaceId();

    // Ne rien ajouter pour les routes qui servent justement à récupérer les workspaces
    if (!workspaceId) {
      return next.handle(req);
    }

    const cloned = req.clone({
      setHeaders: {
        'X-Workspace-Id': workspaceId,
      },
    });

    return next.handle(cloned);
  }
}
