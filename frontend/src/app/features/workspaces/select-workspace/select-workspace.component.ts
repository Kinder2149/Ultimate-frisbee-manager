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
    // Récupérer l'URL de retour éventuelle
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    // Afficher un message si on a été redirigé
    const reason = this.route.snapshot.queryParamMap.get('reason');
    if (reason === 'workspace-unavailable') {
      this.error = 'Votre espace de travail n\'est plus accessible (supprimé ou droits retirés). ' +
        'Veuillez sélectionner un autre espace.';
    }

    this.loadWorkspaces();
  }

  loadWorkspaces(): void {
    this.loading = true;
    this.error = null;

    const url = `${environment.apiUrl}/workspaces/me`;
    this.workspaces$ = this.http.get<WorkspaceSummary[]>(url).pipe(
      map((items: WorkspaceSummary[]) => {
        this.loading = false;
        return items || [];
      }),
      tap((workspaces) => {
        if (workspaces.length === 0) {
          this.error = 'Aucun espace de travail disponible. Contactez un administrateur.';
          return;
        }

        if (workspaces.length === 1) {
          // Sélection automatique si 1 seul workspace
          this.selectWorkspace(workspaces[0]);
          return;
        }

        // Pré-sélection si workspace précédent toujours valide
        const current = this.workspaceService.getCurrentWorkspace();
        if (current && workspaces.find(w => w.id === current.id)) {
          // Workspace toujours valide, rediriger directement
          console.log('[SelectWorkspace] Previous workspace still valid, redirecting');
          this.router.navigateByUrl(this.returnUrl || '/');
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
