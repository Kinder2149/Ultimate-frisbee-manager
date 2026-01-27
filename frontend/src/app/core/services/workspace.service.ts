import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { IndexedDbService } from './indexed-db.service';
import { WorkspaceChangeState } from '../models/cache.model';

export interface WorkspaceSummary {
  id: string;
  name: string;
  createdAt?: string;
  role?: string;
}

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  private currentWorkspaceSubject = new BehaviorSubject<WorkspaceSummary | null>(null);
  currentWorkspace$ = this.currentWorkspaceSubject.asObservable();

  // Événement de changement de workspace (avant le reload)
  private workspaceChangingSubject = new Subject<{ from: WorkspaceSummary | null; to: WorkspaceSummary }>();
  workspaceChanging$ = this.workspaceChangingSubject.asObservable();

  private readonly STORAGE_KEY = 'ufm.currentWorkspace';
  private readonly CHANGE_STATE_KEY = 'ufm.workspaceChangeState';

  constructor(private indexedDb: IndexedDbService) {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(this.STORAGE_KEY) : null;
    if (stored) {
      try {
        const parsed: WorkspaceSummary = JSON.parse(stored);
        if (parsed && parsed.id) {
          this.currentWorkspaceSubject.next(parsed);
        }
      } catch {
        // ignore parsing errors
      }
    }
  }

  getCurrentWorkspace(): WorkspaceSummary | null {
    return this.currentWorkspaceSubject.value;
  }

  getCurrentWorkspaceId(): string | null {
    return this.currentWorkspaceSubject.value?.id ?? null;
  }

  async setCurrentWorkspace(workspace: WorkspaceSummary | null, skipReload = false): Promise<void> {
    const previous = this.currentWorkspaceSubject.value;
    
    // Si c'est le même workspace, ne rien faire
    if (previous?.id === workspace?.id) {
      return;
    }

    // Émettre l'événement de changement
    if (workspace) {
      this.workspaceChangingSubject.next({ from: previous, to: workspace });
    }

    // Nettoyer le cache du workspace précédent
    if (previous?.id) {
      console.log('[Workspace] Clearing cache for previous workspace:', previous.name);
      await this.indexedDb.clearWorkspace(previous.id);
    }

    // Mettre à jour le workspace actuel
    this.currentWorkspaceSubject.next(workspace);
    if (typeof window === 'undefined') return;

    if (workspace) {
      window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(workspace));
      
      // Mini-reload transparent si pas de skipReload
      if (!skipReload) {
        console.log('[Workspace] Performing mini-reload for workspace:', workspace.name);
        window.location.reload();
      }
    } else {
      window.localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Sauvegarde l'état UI avant changement de workspace
   */
  saveChangeState(state: WorkspaceChangeState): void {
    if (typeof window === 'undefined') return;
    
    try {
      window.sessionStorage.setItem(this.CHANGE_STATE_KEY, JSON.stringify(state));
      console.log('[Workspace] UI state saved:', state);
    } catch (error) {
      console.error('[Workspace] Failed to save change state:', error);
    }
  }

  /**
   * Restaure l'état UI après changement de workspace
   */
  restoreChangeState(): WorkspaceChangeState | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = window.sessionStorage.getItem(this.CHANGE_STATE_KEY);
      if (stored) {
        const state = JSON.parse(stored) as WorkspaceChangeState;
        // Nettoyer après lecture
        window.sessionStorage.removeItem(this.CHANGE_STATE_KEY);
        console.log('[Workspace] UI state restored:', state);
        return state;
      }
    } catch (error) {
      console.error('[Workspace] Failed to restore change state:', error);
    }
    
    return null;
  }

  async clear(): Promise<void> {
    await this.setCurrentWorkspace(null);
  }
}
