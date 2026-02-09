import { Injectable, Injector, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, interval, Subscription } from 'rxjs';
import { switchMap, filter, catchError } from 'rxjs/operators';
import { WorkspaceService } from './workspace.service';
import { DataCacheService } from './data-cache.service';
import { SyncMessage, SyncVersion } from '../models/cache.model';
import { environment } from '../../../environments/environment';

/**
 * Service de synchronisation des données
 * Gère la synchronisation périodique et la communication multi-onglets
 */
@Injectable({
  providedIn: 'root'
})
export class SyncService implements OnDestroy {
  private syncChannel: BroadcastChannel | null = null;
  private syncSubscription: Subscription | null = null;
  private lastVersions: SyncVersion | null = null;
  private isOnline = true;
  private isUserActive = true;
  private isAuthReady = false;
  private lastActivityTime = Date.now();
  private authReadySubscription: Subscription | null = null;
  
  // Configuration du polling adaptatif
  private readonly ACTIVE_INTERVAL = 10 * 1000;    // 10s si utilisateur actif
  private readonly INACTIVE_INTERVAL = 60 * 1000;  // 1min si inactif
  
  // Événements de synchronisation
  private dataChanged$ = new Subject<SyncMessage>();
  public dataChanged = this.dataChanged$.asObservable();

  constructor(
    private http: HttpClient,
    private workspaceService: WorkspaceService,
    private cache: DataCacheService,
    private injector: Injector
  ) {
    this.initBroadcastChannel();
    this.setupOnlineDetection();
    this.setupActivityDetection();
    this.bindToAuthLifecycle();
  }

  ngOnDestroy(): void {
    this.stopPeriodicSync();
    if (this.syncChannel) {
      this.syncChannel.close();
    }
    if (this.authReadySubscription) {
      this.authReadySubscription.unsubscribe();
    }
  }

  /**
   * Lie le polling au lifecycle auth : start quand authReady=true, stop quand false
   */
  private bindToAuthLifecycle(): void {
    // Injection différée pour éviter la dépendance circulaire AuthService ↔ SyncService
    setTimeout(() => {
      try {
        const { AuthService } = require('./auth.service');
        const authService = this.injector.get(AuthService);
        this.authReadySubscription = authService.authReady$.subscribe((isReady: boolean) => {
          this.isAuthReady = isReady;
          if (!isReady) {
            this.stopPeriodicSync();
            this.resetVersions();
          }
        });
      } catch (e) {
        console.warn('[Sync] Could not bind to auth lifecycle:', e);
      }
    }, 0);
  }

  /**
   * Initialise le BroadcastChannel pour la synchronisation multi-onglets
   */
  private initBroadcastChannel(): void {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
      console.warn('[Sync] BroadcastChannel not available');
      return;
    }

    try {
      this.syncChannel = new BroadcastChannel('ufm-sync');
      this.listenToOtherTabs();
      console.log('[Sync] BroadcastChannel initialized');
    } catch (error) {
      console.error('[Sync] Failed to initialize BroadcastChannel:', error);
    }
  }

  /**
   * Écoute les messages des autres onglets
   */
  private listenToOtherTabs(): void {
    if (!this.syncChannel) return;

    this.syncChannel.onmessage = (event) => {
      const message = event.data as SyncMessage;
      const currentWorkspaceId = this.workspaceService.getCurrentWorkspaceId();

      // Ignorer les messages d'autres workspaces
      if (message.workspaceId !== currentWorkspaceId) {
        return;
      }

      console.log('[Sync] Message received from another tab:', message);

      // Invalider le cache selon le type
      this.handleSyncMessage(message);

      // Émettre l'événement pour que les composants puissent réagir
      this.dataChanged$.next(message);
    };
  }

  /**
   * Gère un message de synchronisation
   */
  private handleSyncMessage(message: SyncMessage): void {
    const { type, action, id } = message;

    switch (type) {
      case 'exercice':
        this.cache.invalidate('exercices-list', 'exercices');
        if (action === 'update' || action === 'delete') {
          this.cache.invalidate(`exercice-${id}`, 'exercices');
        }
        break;

      case 'entrainement':
        this.cache.invalidate('entrainements-list', 'entrainements');
        if (action === 'update' || action === 'delete') {
          this.cache.invalidate(`entrainement-${id}`, 'entrainements');
        }
        break;

      case 'tag':
        this.cache.invalidate('tags-list', 'tags');
        if (action === 'update' || action === 'delete') {
          this.cache.invalidate(`tag-${id}`, 'tags');
        }
        break;

      case 'echauffement':
        this.cache.invalidate('echauffements-list', 'echauffements');
        if (action === 'update' || action === 'delete') {
          this.cache.invalidate(`echauffement-${id}`, 'echauffements');
        }
        break;

      case 'situation':
        this.cache.invalidate('situations-list', 'situations');
        if (action === 'update' || action === 'delete') {
          this.cache.invalidate(`situation-${id}`, 'situations');
        }
        break;

      case 'workspace':
        this.cache.invalidate('workspaces-list', 'workspaces');
        break;

      case 'auth':
        this.cache.invalidate('user-profile', 'auth');
        break;
    }
  }

  /**
   * Notifie les autres onglets d'un changement
   */
  notifyChange(message: SyncMessage): void {
    if (!this.syncChannel) {
      console.warn('[Sync] BroadcastChannel not available, cannot notify');
      return;
    }

    try {
      this.syncChannel.postMessage(message);
      console.log('[Sync] Change notification sent:', message);
    } catch (error) {
      console.error('[Sync] Failed to send notification:', error);
    }
  }

  /**
   * Démarre la synchronisation périodique avec polling adaptatif
   */
  startPeriodicSync(intervalMs: number = 10000): void {
    if (this.syncSubscription) {
      console.warn('[Sync] Periodic sync already running');
      return;
    }

    console.log(`[Sync] Starting adaptive periodic sync (active: ${this.ACTIVE_INTERVAL}ms, inactive: ${this.INACTIVE_INTERVAL}ms)`);

    // Polling adaptatif basé sur l'activité utilisateur
    this.syncSubscription = interval(1000)
      .pipe(
        filter(() => this.isOnline),
        filter(() => this.isAuthReady),
        filter(() => !!this.workspaceService.getCurrentWorkspaceId()),
        // Vérifier si on doit faire un sync selon l'activité
        filter(() => {
          const now = Date.now();
          const timeSinceLastActivity = now - this.lastActivityTime;
          this.isUserActive = timeSinceLastActivity < 60000; // Actif si activité < 1min
          
          const interval = this.isUserActive ? this.ACTIVE_INTERVAL : this.INACTIVE_INTERVAL;
          const lastCheck = (this as any).lastSyncCheck || 0;
          const shouldSync = (now - lastCheck) >= interval;
          
          if (shouldSync) {
            (this as any).lastSyncCheck = now;
          }
          
          return shouldSync;
        }),
        switchMap(() => this.checkForUpdates()),
        catchError((error) => {
          console.error('[Sync] Error during periodic sync:', error);
          return [];
        })
      )
      .subscribe();
  }

  /**
   * Arrête la synchronisation périodique
   */
  stopPeriodicSync(): void {
    if (this.syncSubscription) {
      this.syncSubscription.unsubscribe();
      this.syncSubscription = null;
      console.log('[Sync] Periodic sync stopped');
    }
  }

  /**
   * Vérifie les mises à jour depuis le serveur
   */
  private async checkForUpdates(): Promise<void> {
    const workspaceId = this.workspaceService.getCurrentWorkspaceId();
    if (!workspaceId) {
      return;
    }

    try {
      const url = `${environment.apiUrl}/sync/versions`;
      const versions = await this.http.get<SyncVersion>(url).toPromise();

      if (!versions) {
        return;
      }

      // Première vérification, sauvegarder les versions
      if (!this.lastVersions) {
        this.lastVersions = versions;
        return;
      }

      // Comparer les versions et invalider le cache si nécessaire
      if (versions.exercices !== this.lastVersions.exercices) {
        console.log('[Sync] Exercices updated, invalidating cache');
        this.cache.invalidate('exercices-list', 'exercices');
        this.dataChanged$.next({
          type: 'exercice',
          action: 'refresh',
          id: 'all',
          workspaceId,
          timestamp: Date.now()
        });
      }

      if (versions.entrainements !== this.lastVersions.entrainements) {
        console.log('[Sync] Entrainements updated, invalidating cache');
        this.cache.invalidate('entrainements-list', 'entrainements');
        this.dataChanged$.next({
          type: 'entrainement',
          action: 'refresh',
          id: 'all',
          workspaceId,
          timestamp: Date.now()
        });
      }

      if (versions.tags !== this.lastVersions.tags) {
        console.log('[Sync] Tags updated, invalidating cache');
        this.cache.invalidate('tags-list', 'tags');
        this.dataChanged$.next({
          type: 'tag',
          action: 'refresh',
          id: 'all',
          workspaceId,
          timestamp: Date.now()
        });
      }

      if (versions.echauffements !== this.lastVersions.echauffements) {
        console.log('[Sync] Echauffements updated, invalidating cache');
        this.cache.invalidate('echauffements-list', 'echauffements');
        this.dataChanged$.next({
          type: 'echauffement',
          action: 'refresh',
          id: 'all',
          workspaceId,
          timestamp: Date.now()
        });
      }

      if (versions.situations !== this.lastVersions.situations) {
        console.log('[Sync] Situations updated, invalidating cache');
        this.cache.invalidate('situations-list', 'situations');
        this.dataChanged$.next({
          type: 'situation',
          action: 'refresh',
          id: 'all',
          workspaceId,
          timestamp: Date.now()
        });
      }

      // Mettre à jour les versions
      this.lastVersions = versions;
    } catch (error) {
      console.error('[Sync] Failed to check for updates:', error);
    }
  }

  /**
   * Force une vérification immédiate des mises à jour
   */
  async forceSync(): Promise<void> {
    console.log('[Sync] Forcing sync check');
    await this.checkForUpdates();
  }

  /**
   * Réinitialise les versions (utile lors du changement de workspace)
   */
  resetVersions(): void {
    this.lastVersions = null;
    console.log('[Sync] Versions reset');
  }

  /**
   * Configure la détection d'activité utilisateur
   */
  private setupActivityDetection(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, () => {
        this.lastActivityTime = Date.now();
        this.isUserActive = true;
      }, { passive: true });
    });

    console.log('[Sync] Activity detection initialized');
  }

  /**
   * Configure la détection en ligne/hors ligne
   */
  private setupOnlineDetection(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.addEventListener('online', () => {
      console.log('[Sync] Connection restored');
      this.isOnline = true;
      this.forceSync();
    });

    window.addEventListener('offline', () => {
      console.log('[Sync] Connection lost');
      this.isOnline = false;
    });

    this.isOnline = navigator.onLine;
  }

  /**
   * Vérifie si le service est en ligne
   */
  isServiceOnline(): boolean {
    return this.isOnline;
  }
}
