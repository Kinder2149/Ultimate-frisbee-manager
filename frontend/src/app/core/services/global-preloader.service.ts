import { Injectable } from '@angular/core';
import { combineLatest, Subject, Subscription } from 'rxjs';
import { filter, take, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { WorkspaceService } from './workspace.service';
import { WorkspacePreloaderService } from './workspace-preloader.service';

/**
 * Service de préchargement global
 * Déclenche automatiquement le préchargement des données après connexion
 */
@Injectable({
  providedIn: 'root'
})
export class GlobalPreloaderService {
  private preloadCompletedSubject = new Subject<boolean>();
  public preloadCompleted$ = this.preloadCompletedSubject.asObservable();
  
  private isPreloading = false;
  private preloadedWorkspaces = new Set<string>();
  private subscription?: Subscription;

  constructor(
    private authService: AuthService,
    private workspaceService: WorkspaceService,
    private workspacePreloader: WorkspacePreloaderService
  ) {}

  /**
   * Initialise le préchargement automatique
   * À appeler dans AppComponent.ngOnInit()
   */
  initialize(): void {
    console.log('[GlobalPreloader] Initializing automatic preloading');
    
    // S'abonner aux changements d'authentification et de workspace
    this.subscription = combineLatest([
      this.authService.isAuthenticated$,
      this.workspaceService.currentWorkspace$
    ]).pipe(
      filter(([isAuth, workspace]) => {
        // Précharger uniquement si :
        // 1. L'utilisateur est authentifié
        // 2. Un workspace est sélectionné
        // 3. Ce workspace n'a pas déjà été préchargé
        const shouldPreload = isAuth && 
                             workspace !== null && 
                             !this.preloadedWorkspaces.has(workspace.id) &&
                             !this.isPreloading;
        
        if (shouldPreload) {
          console.log('[GlobalPreloader] Conditions met for preloading workspace:', workspace.name);
        }
        
        return shouldPreload;
      }),
      tap(([_, workspace]) => {
        if (workspace) {
          this.preloadWorkspace(workspace.id);
        }
      })
    ).subscribe();
  }

  /**
   * Précharge toutes les données d'un workspace
   */
  private async preloadWorkspace(workspaceId: string): Promise<void> {
    if (this.isPreloading) {
      console.log('[GlobalPreloader] Preload already in progress, skipping');
      return;
    }

    this.isPreloading = true;
    console.log('[GlobalPreloader] Starting automatic preload for workspace:', workspaceId);

    try {
      // Vérifier la complétude du cache
      const completeness = await this.workspacePreloader.getCacheCompleteness(workspaceId);
      console.log(`[GlobalPreloader] Cache completeness: ${completeness}%`);

      if (completeness >= 80) {
        // Cache suffisant, juste un refresh en arrière-plan
        console.log('[GlobalPreloader] Cache sufficient, refreshing in background');
        this.workspacePreloader.smartPreload(workspaceId).pipe(
          take(1)
        ).subscribe({
          next: () => {
            console.log('[GlobalPreloader] Background refresh completed');
            this.markWorkspaceAsPreloaded(workspaceId);
          },
          error: (err) => {
            console.error('[GlobalPreloader] Background refresh failed:', err);
            this.isPreloading = false;
          }
        });
      } else {
        // Cache insuffisant, préchargement complet
        console.log('[GlobalPreloader] Cache insufficient, starting full preload');
        this.workspacePreloader.smartPreload(workspaceId).pipe(
          take(1)
        ).subscribe({
          next: () => {
            console.log('[GlobalPreloader] Full preload completed successfully');
            this.markWorkspaceAsPreloaded(workspaceId);
          },
          error: (err) => {
            console.error('[GlobalPreloader] Full preload failed:', err);
            this.isPreloading = false;
            // Ne pas marquer comme préchargé en cas d'erreur
          }
        });
      }
    } catch (error) {
      console.error('[GlobalPreloader] Error during preload:', error);
      this.isPreloading = false;
    }
  }

  /**
   * Marque un workspace comme préchargé
   */
  private markWorkspaceAsPreloaded(workspaceId: string): void {
    this.preloadedWorkspaces.add(workspaceId);
    this.isPreloading = false;
    this.preloadCompletedSubject.next(true);
    console.log('[GlobalPreloader] Workspace marked as preloaded:', workspaceId);
  }

  /**
   * Force le préchargement d'un workspace (même s'il a déjà été préchargé)
   */
  forcePreload(workspaceId: string): void {
    console.log('[GlobalPreloader] Forcing preload for workspace:', workspaceId);
    this.preloadedWorkspaces.delete(workspaceId);
    this.isPreloading = false;
    this.preloadWorkspace(workspaceId);
  }

  /**
   * Réinitialise l'état du préchargement
   */
  reset(): void {
    console.log('[GlobalPreloader] Resetting preload state');
    this.preloadedWorkspaces.clear();
    this.isPreloading = false;
  }

  /**
   * Nettoie les abonnements
   */
  destroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.preloadCompletedSubject.complete();
  }
}
