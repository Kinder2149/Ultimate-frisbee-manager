import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, tap, switchMap, take } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { WorkspaceService, WorkspaceSummary } from '../services/workspace.service';
import { DataCacheService } from '../services/data-cache.service';
import { WorkspacePreloaderService } from '../services/workspace-preloader.service';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WorkspaceSelectedGuard implements CanActivate {
  constructor(
    private workspaceService: WorkspaceService,
    private router: Router,
    private http: HttpClient,
    private cache: DataCacheService,
    private authService: AuthService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // Attendre que authReady$ soit true avant toute vérification
    return this.authService.authReady$.pipe(
      take(1),
      switchMap(isReady => {
        if (!isReady) {
          // Auth pas encore prête, bloquer sans rediriger
          // ensureWorkspaceSelected() est en cours
          return of(false);
        }

        // Auth prête, vérifier le workspace
        const workspaceId = this.workspaceService.getCurrentWorkspaceId();

        // Pas de workspace en localStorage
        if (!workspaceId) {
          console.log('[WorkspaceGuard] No workspace selected');
          this.router.navigate(['/select-workspace'], {
            queryParams: { returnUrl: state.url }
          });
          return of(false);
        }

        // Vérifier que le workspace existe toujours côté backend (avec cache)
        console.log('[WorkspaceGuard] Validating workspace:', workspaceId);
        
        // Utiliser le cache avec TTL de 1h pour éviter les appels répétés
        return this.cache.get<WorkspaceSummary[]>(
          'workspaces-list',
          'workspaces',
          () => this.http.get<WorkspaceSummary[]>(`${environment.apiUrl}/workspaces/me`),
          { ttl: 60 * 60 * 1000 } // 1h
        ).pipe(
          map(workspaces => {
            const current = workspaces.find(w => w.id === workspaceId);
            const isValid = Boolean(current);
            
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

            // Doc 9.2: empêcher l'accès au contenu si aucun rôle workspace explicite
            if (!current?.role) {
              console.warn('[WorkspaceGuard] Workspace has no explicit role, access to content blocked:', workspaceId);
              this.workspaceService.clear();
              this.router.navigate(['/select-workspace'], {
                queryParams: {
                  returnUrl: state.url,
                  reason: 'workspace-role-required'
                }
              });
              return false;
            }
            
            console.log('[WorkspaceGuard] Workspace valid (from cache)');
            return true;
          }),
          catchError((error) => {
            console.error('[WorkspaceGuard] Error validating workspace:', error);
            // En cas d'erreur réseau, laisser passer
            // L'interceptor WorkspaceError gérera les erreurs 403/404
            return of(true);
          })
        );
      })
    );
  }
}
