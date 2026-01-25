import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { AdminService } from '../../../../core/services/admin.service';
import type { AdminOverviewResponse, AdminOverviewItem } from '../../../../core/services/admin.service';

interface ActivityItem {
  type: 'exercice' | 'entrainement' | 'echauffement' | 'situation' | 'tag' | 'user';
  id: string;
  title: string;
  subtitle?: string;
  createdAt: Date;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  loading = false;
  data: AdminOverviewResponse | null = null;
  recentActivity: ActivityItem[] = [];

  statsCards = [
    { label: 'Exercices', key: 'exercices' as const, icon: 'fitness_center', color: '#3b82f6', route: '/admin/content?type=exercice' },
    { label: 'Entraînements', key: 'entrainements' as const, icon: 'event', color: '#8b5cf6', route: '/admin/content?type=entrainement' },
    { label: 'Échauffements', key: 'echauffements' as const, icon: 'local_fire_department', color: '#f59e0b', route: '/admin/content?type=echauffement' },
    { label: 'Situations', key: 'situations' as const, icon: 'sports', color: '#10b981', route: '/admin/content?type=situation' },
    { label: 'Tags', key: 'tags' as const, icon: 'label', color: '#ec4899', route: '/admin/content?type=tag' },
    { label: 'Utilisateurs', key: 'users' as const, icon: 'people', color: '#06b6d4', route: '/admin/users' }
  ];

  constructor(
    private adminService: AdminService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.adminService.getOverview().subscribe({
      next: (data) => {
        this.data = data;
        this.buildRecentActivity(data.recent);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement dashboard:', error);
        this.snackBar.open('Erreur lors du chargement des données', 'Fermer', { duration: 4000 });
        this.loading = false;
      }
    });
  }

  buildRecentActivity(recent: AdminOverviewResponse['recent']): void {
    const items: ActivityItem[] = [];

    // Exercices
    recent.exercices.slice(0, 5).forEach((ex: AdminOverviewItem) => {
      if (ex.titre) {
        items.push({
          type: 'exercice',
          id: ex.id,
          title: ex.titre,
          createdAt: new Date(ex.createdAt),
          icon: 'fitness_center',
          color: '#3b82f6'
        });
      }
    });

    // Entraînements
    recent.entrainements.slice(0, 5).forEach((ent: AdminOverviewItem) => {
      if (ent.titre) {
        items.push({
          type: 'entrainement',
          id: ent.id,
          title: ent.titre,
          createdAt: new Date(ent.createdAt),
          icon: 'event',
          color: '#8b5cf6'
        });
      }
    });

    // Utilisateurs
    recent.users.slice(0, 5).forEach((user: AdminOverviewItem) => {
      if (user.email) {
        items.push({
          type: 'user',
          id: user.id,
          title: user.email,
          subtitle: `${user.prenom || ''} ${user.nom || ''}`.trim() || undefined,
          createdAt: new Date(user.createdAt),
          icon: 'person_add',
          color: '#06b6d4'
        });
      }
    });

    // Trier par date décroissante et prendre les 15 plus récents
    this.recentActivity = items
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 15);
  }

  navigateTo(route: string): void {
    this.router.navigateByUrl(route);
  }

  exportData(): void {
    this.snackBar.open('Export en cours...', '', { duration: 2000 });
    
    // Utiliser la route backend existante GET /api/admin/export-ufm
    window.open('/api/admin/export-ufm', '_blank');
  }

  refresh(): void {
    this.loadData();
  }

  getActivityRoute(item: ActivityItem): string {
    switch (item.type) {
      case 'exercice':
        return `/exercices/${item.id}`;
      case 'entrainement':
        return `/entrainements/${item.id}`;
      case 'user':
        return `/admin/users/${item.id}`;
      default:
        return '/admin/content';
    }
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
