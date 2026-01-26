import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { WorkspaceService } from '../services/workspace.service';
import { environment } from '../../../environments/environment';

interface WorkspaceSummary {
  id: string;
  name: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class WorkspaceSelectedGuard implements CanActivate {
  private validationCache: { [key: string]: boolean } = {};
  private cacheTimeout = 60000; // 1 minute

  constructor(
    private workspaceService: WorkspaceService,
    private router: Router,
    private http: HttpClient
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    const workspaceId = this.workspaceService.getCurrentWorkspaceId();

    if (!workspaceId) {
      // Aucun workspace sélectionné
      this.router.navigate(['/select-workspace'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }

    // Vérifier le cache
    if (this.validationCache[workspaceId]) {
      return true;
    }

    // Valider que le workspace existe toujours
    return this.http.get<WorkspaceSummary[]>(`${environment.apiUrl}/workspaces/me`).pipe(
      map(workspaces => {
        const exists = workspaces.some(w => w.id === workspaceId);
        
        if (exists) {
          // Mettre en cache
          this.validationCache[workspaceId] = true;
          setTimeout(() => {
            delete this.validationCache[workspaceId];
          }, this.cacheTimeout);
          return true;
        } else {
          // Workspace n'existe plus
          console.warn('[WorkspaceSelectedGuard] Workspace no longer available:', workspaceId);
          this.workspaceService.clear();
          this.router.navigate(['/select-workspace'], {
            queryParams: { 
              returnUrl: state.url,
              reason: 'workspace-unavailable'
            }
          });
          return false;
        }
      }),
      catchError(error => {
        console.error('[WorkspaceSelectedGuard] Error validating workspace:', error);
        // En cas d'erreur réseau, laisser passer (l'intercepteur gérera)
        return of(true);
      })
    );
  }
}
