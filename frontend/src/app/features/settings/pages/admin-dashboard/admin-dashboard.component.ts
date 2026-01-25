import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../core/services/admin.service';

type AdminOverviewResponse = any;
type AdminOverviewItem = any;

// Interface pour les données de l'utilisateur
interface UserData {
  id: string;
  email: string;
  nom?: string;
  prenom?: string;
  role: string;
  isActive: boolean;
  iconUrl?: string | null;
  createdAt: string;
  _saving?: boolean;
}

// Interface pour les lignes du tableau des utilisateurs
interface UserRow extends AdminOverviewItem {
  id: string;
  email: string;
  nom?: string;
  prenom?: string;
  role: string;
  isActive: boolean;
  iconUrl?: string | null;
  createdAt: string;
  _saving?: boolean;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule,
    RouterModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  loading = false;
  error: string | null = null;

  // Statistiques globales
  counts = {
    exercices: 0,
    entrainements: 0,
    echauffements: 0,
    situations: 0,
    tags: 0,
    users: 0
  };

  // Données récentes pour l'activité
  recentExercices: AdminOverviewItem[] = [];
  recentEntrainements: AdminOverviewItem[] = [];
  recentEchauffements: AdminOverviewItem[] = [];
  recentSituations: AdminOverviewItem[] = [];
  recentTags: AdminOverviewItem[] = [];
  recentUsers: UserRow[] = [];

  constructor(
    private adminService: AdminService, 
    private snack: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.refreshAll();
  }

  // Rafraîchir toutes les données
  refreshAll(): void {
    this.loading = true;
    this.error = null;
    
    this.adminService.getOverview().subscribe({
      next: (res: AdminOverviewResponse) => {
        this.counts = res.counts;
        this.recentExercices = res.recent.exercices || [];
        this.recentEntrainements = res.recent.entrainements || [];
        this.recentEchauffements = res.recent.echauffements || [];
        this.recentSituations = res.recent.situations || [];
        this.recentTags = res.recent.tags || [];
        this.recentUsers = res.recent.users || [];
        
        this.loading = false;
        this.snack.open('Données actualisées', 'Fermer', { 
          duration: 2000,
          panelClass: ['success-snackbar'] 
        });
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des données:', err);
        this.error = 'Impossible de charger les données. Vérifiez votre connexion.';
        this.loading = false;
        this.snack.open('Erreur de chargement', 'Fermer', { 
          duration: 4000,
          panelClass: ['error-snackbar'] 
        });
      }
    });
  }

  // Navigation vers une route
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  // Exporter les données
  exportData(): void {
    this.snack.open('Export en cours de développement...', 'Fermer', { 
      duration: 3000 
    });
    // TODO: Implémenter l'export via /api/admin/export-ufm
  }

}
