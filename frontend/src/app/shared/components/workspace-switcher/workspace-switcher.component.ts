import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { WorkspaceService, WorkspaceSummary } from '../../../core/services/workspace.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-workspace-switcher',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './workspace-switcher.component.html',
  styleUrls: ['./workspace-switcher.component.scss']
})
export class WorkspaceSwitcherComponent implements OnInit {
  currentWorkspace: WorkspaceSummary | null = null;
  workspaces: WorkspaceSummary[] = [];
  isMenuOpen = false;
  loading = false;

  constructor(
    private workspaceService: WorkspaceService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentWorkspace = this.workspaceService.getCurrentWorkspace();
    this.loadWorkspaces();
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
      },
      error: () => {
        this.loading = false;
        this.workspaces = [];
      }
    });
  }

  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    if (this.loading) {
      return;
    }
    this.isMenuOpen = !this.isMenuOpen;
  }

  selectWorkspace(ws: WorkspaceSummary, event: MouseEvent): void {
    event.stopPropagation();
    this.workspaceService.setCurrentWorkspace(ws);
    this.currentWorkspace = ws;
    this.isMenuOpen = false;
    this.router.navigate(['/']);
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }
}
