import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { WorkspaceService } from '../services/workspace.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WorkspaceSelectedGuard implements CanActivate {
  constructor(
    private workspaceService: WorkspaceService,
    private router: Router,
    private http: HttpClient
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const workspaceId = this.workspaceService.getCurrentWorkspaceId();

    // Pas de workspace en localStorage
    if (!workspaceId) {
      console.log('[WorkspaceGuard] No workspace selected');
      this.router.navigate(['/select-workspace'], {
        queryParams: { returnUrl: state.url }
      });
      return of(false);
    }

    // Vérifier que le workspace existe toujours côté backend
    console.log('[WorkspaceGuard] Validating workspace:', workspaceId);
    return this.http.get<any[]>(`${environment.apiUrl}/workspaces/me`).pipe(
      map(workspaces => {
        const isValid = workspaces.some(w => w.id === workspaceId);
        
        if (!isValid) {
          console.warn('[WorkspaceGuard] Workspace no longer accessible:', workspaceId);
          this.workspaceService.clear();
          this.router.navigate(['/select-workspace'], {
            queryParams: { 
              returnUrl: state.url,
              reason: 'workspace-invalid'
            }
          });
          return false;
        }
        
        console.log('[WorkspaceGuard] Workspace valid');
        return true;
      }),
      catchError((error) => {
        console.error('[WorkspaceGuard] Error validating workspace:', error);
        // En cas d'erreur réseau, laisser passer
        // L'interceptor WorkspaceError gérera les erreurs 403/404
        return of(true);
      })
    );
  }
}
