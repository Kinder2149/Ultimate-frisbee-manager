import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil, filter, distinctUntilChanged } from 'rxjs/operators';
import { WorkspaceService, WorkspaceSummary } from '../../../core/services/workspace.service';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-workspace-switcher',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './workspace-switcher.component.html',
  styleUrls: ['./workspace-switcher.component.scss']
})
export class WorkspaceSwitcherComponent implements OnInit, OnDestroy {
  @Output() menuOpenChange = new EventEmitter<boolean>();

  currentWorkspace: WorkspaceSummary | null = null;
  workspaces: WorkspaceSummary[] = [];
  isMenuOpen = false;
  loading = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private workspaceService: WorkspaceService,
    private authService: AuthService,
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentWorkspace = this.workspaceService.getCurrentWorkspace();
    
    // Écouter les changements d'authentification pour recharger les workspaces
    this.authService.isAuthenticated$.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged()
    ).subscribe(isAuth => {
      if (isAuth) {
        this.loadWorkspaces();
      } else {
        this.workspaces = [];
        this.currentWorkspace = null;
      }
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadWorkspaces(): void {
    this.loading = true;
    const url = `${environment.apiUrl}/workspaces/me`;
    this.http.get<Array<{ id: string; name: string; createdAt?: string; role?: string }>>(url).subscribe({
      next: (items) => {
        this.loading = false;
        this.workspaces = (items || []).map((w) => ({
          id: w.id,
          name: w.name,
          createdAt: w.createdAt,
          role: w.role,
        }));

        // Si aucun workspace courant mais une seule base disponible, l'appliquer automatiquement
        if (!this.currentWorkspace && this.workspaces.length === 1) {
          const ws = this.workspaces[0];
          this.workspaceService.setCurrentWorkspace(ws);
          this.currentWorkspace = ws;
        }
      },
      error: (error) => {
        console.error('[WorkspaceSwitcher] Error loading workspaces:', error);
        this.loading = false;
        this.workspaces = [];
        this.snackBar.open('Impossible de charger vos espaces de travail. Veuillez réessayer.', 'Fermer', { duration: 5000 });
      }
    });
  }

  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    if (this.loading) {
      return;
    }
    this.isMenuOpen = !this.isMenuOpen;
    this.menuOpenChange.emit(this.isMenuOpen);
  }

  selectWorkspace(ws: WorkspaceSummary, event: MouseEvent): void {
    event.stopPropagation();
    console.log('[WorkspaceSwitcher] Changing workspace to:', ws.id, ws.name);
    
    // Définir le nouveau workspace
    this.workspaceService.setCurrentWorkspace(ws);
    this.currentWorkspace = ws;
    this.isMenuOpen = false;
    this.menuOpenChange.emit(false);
    
    // Recharger complètement la page pour forcer le rechargement de toutes les données
    // Cela garantit que tous les composants et services utilisent le nouveau workspace
    window.location.href = '/';
  }

  closeMenu(): void {
    this.isMenuOpen = false;
    this.menuOpenChange.emit(false);
  }
}
