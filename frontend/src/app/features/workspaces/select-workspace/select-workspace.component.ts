import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MaterialModule } from '../../../core/material/material.module';
import { WorkspaceService, WorkspaceSummary } from '../../../core/services/workspace.service';
import { environment } from '../../../../environments/environment';

interface WorkspaceApiDto {
  id: string;
  name: string;
  createdAt?: string;
  role?: string;
}

@Component({
  standalone: true,
  selector: 'app-select-workspace',
  templateUrl: './select-workspace.component.html',
  styleUrls: ['./select-workspace.component.scss'],
  imports: [CommonModule, MaterialModule]
})
export class SelectWorkspaceComponent implements OnInit {
  workspaces$!: Observable<WorkspaceSummary[]>;
  loading = false;
  error: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private workspaceService: WorkspaceService
  ) {}

  ngOnInit(): void {
    this.loadWorkspaces();
  }

  loadWorkspaces(): void {
    this.loading = true;
    this.error = null;

    const url = `${environment.apiUrl}/workspaces/me`;
    this.workspaces$ = this.http.get<WorkspaceApiDto[]>(url).pipe(
      map((items: WorkspaceApiDto[]) => {
        this.loading = false;
        return (items || []).map((w: WorkspaceApiDto) => ({
          id: w.id,
          name: w.name,
          createdAt: w.createdAt,
          role: w.role,
        }));
      })
    );
  }

  selectWorkspace(ws: WorkspaceSummary): void {
    this.workspaceService.setCurrentWorkspace(ws);
    this.router.navigate(['/']);
  }
}
