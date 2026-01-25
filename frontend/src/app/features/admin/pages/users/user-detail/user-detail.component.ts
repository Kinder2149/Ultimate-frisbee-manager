import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AdminService } from '../../../../../core/services/admin.service';
import { HttpClient } from '@angular/common/http';
import { ApiUrlService } from '../../../../../core/services/api-url.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserEditDialogComponent } from '../user-edit-dialog/user-edit-dialog.component';

interface UserDetail {
  id: string;
  email: string;
  nom?: string;
  prenom?: string;
  role: string;
  isActive: boolean;
  iconUrl?: string | null;
  createdAt: string;
}

interface UserStats {
  workspacesCount: number;
  exercicesCount: number;
  entrainementsCount: number;
  echauffementsCount: number;
  situationsCount: number;
}

interface Workspace {
  id: string;
  name: string;
  role?: string;
  createdAt?: string;
}

interface ActivityItem {
  type: string;
  title: string;
  date: Date;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit {
  userId: string | null = null;
  loading = false;
  user: UserDetail | null = null;
  stats: UserStats = {
    workspacesCount: 0,
    exercicesCount: 0,
    entrainementsCount: 0,
    echauffementsCount: 0,
    situationsCount: 0
  };
  workspaces: Workspace[] = [];
  recentActivity: ActivityItem[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private http: HttpClient,
    private api: ApiUrlService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.loadUserData();
    }
  }

  loadUserData(): void {
    if (!this.userId) return;

    this.loading = true;

    // Charger les données utilisateur depuis la liste
    this.adminService.getUsers().subscribe({
      next: (response) => {
        const foundUser = response.users.find(u => u.id === this.userId);
        if (foundUser) {
          this.user = foundUser;
          this.loadWorkspaces();
          this.generateMockStats();
          this.generateMockActivity();
        } else {
          this.snackBar.open('Utilisateur introuvable', 'Fermer', { duration: 4000 });
          this.goBack();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement utilisateur:', error);
        this.snackBar.open('Erreur lors du chargement', 'Fermer', { duration: 4000 });
        this.loading = false;
      }
    });
  }

  loadWorkspaces(): void {
    // Charger les workspaces de l'utilisateur
    const url = this.api.getUrl('workspaces/me');
    this.http.get<Workspace[]>(url)
      .pipe(catchError(() => of([])))
      .subscribe(workspaces => {
        this.workspaces = workspaces;
        this.stats.workspacesCount = workspaces.length;
      });
  }

  generateMockStats(): void {
    // Générer des stats mockées (à remplacer par vraies données si API disponible)
    this.stats.exercicesCount = Math.floor(Math.random() * 20);
    this.stats.entrainementsCount = Math.floor(Math.random() * 15);
    this.stats.echauffementsCount = Math.floor(Math.random() * 10);
    this.stats.situationsCount = Math.floor(Math.random() * 8);
  }

  generateMockActivity(): void {
    // Générer une activité mockée (à remplacer par vraies données si API disponible)
    const activities: ActivityItem[] = [
      {
        type: 'exercice',
        title: 'Créé un exercice',
        date: new Date(Date.now() - 2 * 3600000),
        icon: 'fitness_center',
        color: '#3b82f6'
      },
      {
        type: 'entrainement',
        title: 'Modifié un entraînement',
        date: new Date(Date.now() - 24 * 3600000),
        icon: 'event',
        color: '#8b5cf6'
      },
      {
        type: 'workspace',
        title: 'Rejoint un workspace',
        date: new Date(Date.now() - 3 * 24 * 3600000),
        icon: 'workspaces',
        color: '#10b981'
      }
    ];
    this.recentActivity = activities;
  }

  goBack(): void {
    this.router.navigate(['/admin/users']);
  }

  editUser(): void {
    if (!this.user) return;

    const dialogRef = this.dialog.open(UserEditDialogComponent, {
      width: '600px',
      data: {
        id: this.user.id,
        email: this.user.email,
        nom: this.user.nom,
        prenom: this.user.prenom,
        role: this.user.role,
        isActive: this.user.isActive,
        iconUrl: this.user.iconUrl
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.updated) {
        // Recharger les données utilisateur
        this.loadUserData();
      }
    });
  }

  toggleStatus(): void {
    if (!this.user) return;
    this.snackBar.open('Fonctionnalité de changement de statut à venir', '', { duration: 2000 });
  }

  getFullName(): string {
    if (!this.user) return '';
    const parts = [this.user.prenom, this.user.nom].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'Sans nom';
  }

  getInitials(): string {
    if (!this.user) return '?';
    const p = this.user.prenom?.charAt(0)?.toUpperCase() || '';
    const n = this.user.nom?.charAt(0)?.toUpperCase() || '';
    return p + n || '?';
  }

  getAvatarColor(): string {
    if (!this.user) return '#e3f2fd';
    const colors = [
      '#e3f2fd', '#f3e5f5', '#e8f5e9', '#fff3e0',
      '#fce4ec', '#e0f2f1', '#f1f8e9', '#ede7f6'
    ];
    const hash = this.user.email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  getAvatarTextColor(): string {
    if (!this.user) return '#1976d2';
    const colors = [
      '#1976d2', '#7b1fa2', '#388e3c', '#f57c00',
      '#c2185b', '#00796b', '#689f38', '#5e35b1'
    ];
    const hash = this.user.email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  getRoleColor(): string {
    return this.user?.role === 'ADMIN' ? '#f59e0b' : '#3b82f6';
  }

  getRoleLabel(): string {
    return this.user?.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur';
  }

  getStatusColor(): string {
    return this.user?.isActive ? '#10b981' : '#ef4444';
  }

  getStatusLabel(): string {
    return this.user?.isActive ? 'Actif' : 'Inactif';
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

  viewWorkspace(workspaceId: string): void {
    this.router.navigate(['/admin/workspaces', workspaceId]);
  }
}
