import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ApiUrlService } from '../../../../../core/services/api-url.service';
import { WorkspaceMembersDialogComponent } from '../workspace-members-dialog/workspace-members-dialog.component';
import { DialogService } from '../../../../../shared/components/dialog/dialog.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface WorkspaceDetail {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  membersCount?: number;
  exercicesCount?: number;
  entrainementsCount?: number;
  echauffementsCount?: number;
  situationsCount?: number;
}

interface WorkspaceMember {
  userId: string;
  email: string;
  nom?: string;
  prenom?: string;
  role: string;
  linkId: string;
}

interface WorkspaceStats {
  membersCount: number;
  exercicesCount: number;
  entrainementsCount: number;
  echauffementsCount: number;
  situationsCount: number;
}

interface ActivityItem {
  type: string;
  title: string;
  author: string;
  date: Date;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-workspace-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatChipsModule,
    MatDividerModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './workspace-detail.component.html',
  styleUrls: ['./workspace-detail.component.scss']
})
export class WorkspaceDetailComponent implements OnInit {
  workspaceId: string | null = null;
  loading = false;
  workspace: WorkspaceDetail | null = null;
  members: WorkspaceMember[] = [];
  stats: WorkspaceStats = {
    membersCount: 0,
    exercicesCount: 0,
    entrainementsCount: 0,
    echauffementsCount: 0,
    situationsCount: 0
  };
  recentActivity: ActivityItem[] = [];
  displayedColumns = ['avatar', 'name', 'email', 'role', 'actions'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private api: ApiUrlService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.workspaceId = this.route.snapshot.paramMap.get('id');
    if (this.workspaceId) {
      this.loadWorkspaceData();
    }
  }

  loadWorkspaceData(): void {
    if (!this.workspaceId) return;

    this.loading = true;
    const workspacesUrl = this.api.getUrl('workspaces');
    const membersUrl = this.api.getUrl(`workspaces/${this.workspaceId}/users`);

    forkJoin({
      workspaces: this.http.get<WorkspaceDetail[]>(workspacesUrl).pipe(catchError(() => of([]))),
      members: this.http.get<{ workspaceId: string; name: string; users: WorkspaceMember[] }>(membersUrl).pipe(
        catchError(() => of({ workspaceId: this.workspaceId as string, name: '', users: [] }))
      )
    }).subscribe({
      next: (result) => {
        const ws = (result.workspaces || []).find(w => w.id === this.workspaceId) || null;
        if (!ws) {
          this.snackBar.open('Workspace introuvable', 'Fermer', { duration: 4000 });
          this.goBack();
          this.loading = false;
          return;
        }

        this.workspace = ws;
        this.members = result.members?.users || [];

        // Stats réelles (issues de l'API admin)
        this.stats.membersCount = ws.membersCount ?? this.members.length;
        this.stats.exercicesCount = ws.exercicesCount ?? 0;
        this.stats.entrainementsCount = ws.entrainementsCount ?? 0;
        this.stats.echauffementsCount = ws.echauffementsCount ?? 0;
        this.stats.situationsCount = ws.situationsCount ?? 0;

        // Activity: encore mock pour l'instant
        this.generateMockActivity();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement workspace:', error);
        this.snackBar.open('Erreur lors du chargement', 'Fermer', { duration: 4000 });
        this.loading = false;
      }
    });
  }

  generateMockActivity(): void {
    const activities: ActivityItem[] = [
      {
        type: 'exercice',
        title: 'Nouvel exercice ajouté',
        author: 'John Doe',
        date: new Date(Date.now() - 3 * 3600000),
        icon: 'fitness_center',
        color: '#3b82f6'
      },
      {
        type: 'member',
        title: 'Nouveau membre ajouté',
        author: 'Admin',
        date: new Date(Date.now() - 24 * 3600000),
        icon: 'person_add',
        color: '#10b981'
      },
      {
        type: 'entrainement',
        title: 'Entraînement modifié',
        author: 'Jane Smith',
        date: new Date(Date.now() - 2 * 24 * 3600000),
        icon: 'event',
        color: '#8b5cf6'
      }
    ];
    this.recentActivity = activities;
  }

  goBack(): void {
    this.router.navigate(['/admin/workspaces']);
  }

  isBaseWorkspace(): boolean {
    return String(this.workspace?.name || '').trim().toUpperCase() === 'BASE';
  }

  deleteWorkspace(): void {
    if (!this.workspaceId || !this.workspace) return;
    if (this.isBaseWorkspace()) {
      this.snackBar.open('Le workspace BASE ne peut pas être supprimé', 'Fermer', { duration: 4000 });
      return;
    }

    const message =
      `Vous allez supprimer définitivement la base <strong>${this.workspace.name}</strong> et toutes les données associées (contenus, membres, etc.).<br>` +
      '<strong>Cette action est irréversible.</strong>';

    this.dialogService
      .confirm('Confirmer la suppression', message, 'Supprimer', 'Annuler', true)
      .subscribe((confirmed) => {
        if (!confirmed || !this.workspaceId) return;

        this.loading = true;
        const url = this.api.getUrl(`workspaces/${this.workspaceId}`);
        this.http.delete<void>(url).subscribe({
          next: () => {
            this.loading = false;
            this.snackBar.open('Workspace supprimé', 'Fermer', { duration: 2500 });
            this.goBack();
          },
          error: (error: any) => {
            this.loading = false;
            console.error('Erreur suppression workspace:', error);
            if (error?.status === 403) {
              this.snackBar.open('Suppression interdite (BASE protégé ou droits insuffisants)', 'Fermer', { duration: 4500 });
            } else if (error?.status === 404) {
              this.snackBar.open('Workspace introuvable', 'Fermer', { duration: 4000 });
            } else {
              this.snackBar.open('Erreur lors de la suppression du workspace', 'Fermer', { duration: 4500 });
            }
          },
        });
      });
  }

  getFullName(member: WorkspaceMember): string {
    const parts = [member.prenom, member.nom].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'Sans nom';
  }

  getInitials(member: WorkspaceMember): string {
    const p = member.prenom?.charAt(0)?.toUpperCase() || '';
    const n = member.nom?.charAt(0)?.toUpperCase() || '';
    return p + n || '?';
  }

  getAvatarColor(email: string): string {
    const colors = [
      '#e3f2fd', '#f3e5f5', '#e8f5e9', '#fff3e0',
      '#fce4ec', '#e0f2f1', '#f1f8e9', '#ede7f6'
    ];
    const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  getAvatarTextColor(email: string): string {
    const colors = [
      '#1976d2', '#7b1fa2', '#388e3c', '#f57c00',
      '#c2185b', '#00796b', '#689f38', '#5e35b1'
    ];
    const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  getRoleColor(role: string): string {
    return role === 'ADMIN' ? '#f59e0b' : '#3b82f6';
  }

  getRoleLabel(role: string): string {
    return role === 'ADMIN' ? 'Admin' : 'Membre';
  }

  changeRole(member: WorkspaceMember): void {
    this.openMembersDialog();
  }

  removeMember(member: WorkspaceMember): void {
    this.openMembersDialog();
  }

  addMember(): void {
    this.openMembersDialog();
  }

  viewUser(userId: string): void {
    this.router.navigate(['/admin/users', userId]);
  }

  private openMembersDialog(): void {
    if (!this.workspaceId) return;

    const ref = this.dialog.open(WorkspaceMembersDialogComponent, {
      width: '720px',
      disableClose: true,
      data: {
        workspaceId: this.workspaceId,
        workspaceName: this.workspace?.name,
      },
    });

    ref.afterClosed().subscribe((result: any) => {
      if (result?.updated) {
        this.loadWorkspaceData();
        this.snackBar.open('Membres mis à jour', 'Fermer', { duration: 2000 });
      }
    });
  }

  getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  }
}
