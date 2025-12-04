import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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

  private readonly STORAGE_KEY = 'ufm.currentWorkspace';

  constructor() {
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

  setCurrentWorkspace(workspace: WorkspaceSummary | null): void {
    this.currentWorkspaceSubject.next(workspace);
    if (typeof window === 'undefined') return;

    if (workspace) {
      window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(workspace));
    } else {
      window.localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  clear(): void {
    this.setCurrentWorkspace(null);
  }
}
