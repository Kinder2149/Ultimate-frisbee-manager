import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
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
  private returnUrl: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private workspaceService: WorkspaceService
  ) {}

  ngOnInit(): void {
    // Récupérer l'URL de retour éventuelle (quand on vient d'un guard ou d'un intercepteur)
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    // Afficher un message si on a été redirigé parce que le workspace courant n'est plus disponible
    const reason = this.route.snapshot.queryParamMap.get('reason');
    if (reason === 'workspace-unavailable') {
      this.error = 'Votre workspace courant n\'est plus accessible (supprimé ou droits retirés). ' +
        'Veuillez sélectionner une autre base de travail.';
    }

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
      }),
      tap((workspaces) => {
        if (workspaces.length === 1) {
          this.selectWorkspace(workspaces[0]);
        }
      })
    );
  }

  selectWorkspace(ws: WorkspaceSummary): void {
    this.workspaceService.setCurrentWorkspace(ws);
    const target = this.returnUrl || '/';
    this.router.navigateByUrl(target);
  }
}
