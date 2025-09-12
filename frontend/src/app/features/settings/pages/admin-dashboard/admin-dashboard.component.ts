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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSlideToggleModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatSnackBarModule,
    RouterModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  // Onglet actif (0 pour l'aperçu, 1 pour la gestion des utilisateurs)
  activeTab: number = 0;
  
  // Données d'aperçu
  loading = false;
  error: string | null = null;
  counts = {
    exercices: 0,
    entrainements: 0,
    echauffements: 0,
    situations: 0,
    tags: 0,
    users: 0
  };

  // Tableaux de données
  exercicesDS = new MatTableDataSource<AdminOverviewItem>([]);
  entrainementsDS = new MatTableDataSource<AdminOverviewItem>([]);
  echauffementsDS = new MatTableDataSource<AdminOverviewItem>([]);
  situationsDS = new MatTableDataSource<AdminOverviewItem>([]);
  tagsDS = new MatTableDataSource<AdminOverviewItem>([]);
  usersDS = new MatTableDataSource<UserRow>([]);

  // Colonnes affichées
  overviewColumns = ['id', 'titre', 'category', 'email', 'role', 'createdAt'];
  usersColumns = ['avatar', 'name', 'email', 'role', 'active', 'actions'];

  // Paginateurs et tris
  @ViewChild('exPaginator') exPaginator!: MatPaginator;
  @ViewChild('enPaginator') enPaginator!: MatPaginator;
  @ViewChild('ecPaginator') ecPaginator!: MatPaginator;
  @ViewChild('siPaginator') siPaginator!: MatPaginator;
  @ViewChild('taPaginator') taPaginator!: MatPaginator;
  @ViewChild('usPaginator') usPaginator!: MatPaginator;

  @ViewChild('exSort') exSort!: MatSort;
  @ViewChild('enSort') enSort!: MatSort;
  @ViewChild('ecSort') ecSort!: MatSort;
  @ViewChild('siSort') siSort!: MatSort;
  @ViewChild('taSort') taSort!: MatSort;
  @ViewChild('usSort') usSort!: MatSort;

  // Données pour un nouvel utilisateur
  newUser: any = {
    id: '',
    email: '',
    password: '',
    prenom: '',
    nom: '',
    role: 'user',
    isActive: true,
    createdAt: new Date().toISOString(),
    _saving: false
  };
  hidePassword = true;
  creating = false;

  constructor(
    private adminService: AdminService, 
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadOverview();
    this.loadUsers();
  }

  // Charge les données d'aperçu
  loadOverview(): void {
    this.loading = true;
    this.error = null;
    this.adminService.getOverview().subscribe({
      next: (res: AdminOverviewResponse) => {
        this.counts = res.counts;
        this.exercicesDS.data = res.recent.exercices;
        this.entrainementsDS.data = res.recent.entrainements;
        this.echauffementsDS.data = res.recent.echauffements;
        this.situationsDS.data = res.recent.situations;
        this.tagsDS.data = res.recent.tags;
        
        // Configuration des paginateurs et tris
        setTimeout(() => this.setupDataSources());
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des données:', err);
        this.error = 'Erreur lors du chargement des données';
        this.loading = false;
      }
    });
  }

  // Charge la liste des utilisateurs
  loadUsers(): void {
    this.loading = true;
    this.adminService.getUsers().subscribe({
      next: (res: { users: UserRow[] }) => {
        this.usersDS.data = res.users.map(user => ({
          ...user,
          _saving: false
        }));
        if (this.usPaginator) this.usersDS.paginator = this.usPaginator;
        if (this.usSort) this.usersDS.sort = this.usSort;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des utilisateurs:', err);
        this.loading = false;
        this.snack.open('Erreur de chargement des utilisateurs', 'Fermer', { 
          duration: 4000, 
          panelClass: ['error-snackbar'] 
        });
      }
    });
  }

  // Configure les paginateurs et les tris pour les tableaux
  private setupDataSources(): void {
    if (this.exPaginator) this.exercicesDS.paginator = this.exPaginator;
    if (this.enPaginator) this.entrainementsDS.paginator = this.enPaginator;
    if (this.ecPaginator) this.echauffementsDS.paginator = this.ecPaginator;
    if (this.siPaginator) this.situationsDS.paginator = this.siPaginator;
    if (this.taPaginator) this.tagsDS.paginator = this.taPaginator;
    if (this.usPaginator) this.usersDS.paginator = this.usPaginator;

    if (this.exSort) this.exercicesDS.sort = this.exSort;
    if (this.enSort) this.entrainementsDS.sort = this.enSort;
    if (this.ecSort) this.echauffementsDS.sort = this.ecSort;
    if (this.siSort) this.situationsDS.sort = this.siSort;
    if (this.taSort) this.tagsDS.sort = this.taSort;
    if (this.usSort) this.usersDS.sort = this.usSort;
  }

  // Met à jour un utilisateur
  updateUser(user: any): void {
    if (!user) return;
    
    user._saving = true;
    this.adminService.updateUser(user.id, { 
      role: user.role, 
      isActive: user.isActive 
    }).subscribe({
      next: (res: any) => {
        user._saving = false;
        this.snack.open('Utilisateur mis à jour', 'Fermer', { 
          duration: 2000,
          panelClass: ['success-snackbar'] 
        });
      },
      error: (err: any) => {
        user._saving = false;
        this.snack.open(err.error?.message || 'Erreur lors de la mise à jour', 'Fermer', { 
          duration: 4000,
          panelClass: ['error-snackbar'] 
        });
      }
    });
  }

  // Crée un nouvel utilisateur
  createUser(): void {
    if (!this.newUser.email || !this.newUser.password) {
      this.snack.open('Email et mot de passe sont obligatoires', 'Fermer', { 
        duration: 4000,
        panelClass: ['error-snackbar'] 
      });
      return;
    }

    this.creating = true;
    this.adminService.createUser({
      email: this.newUser.email,
      password: this.newUser.password,
      nom: this.newUser.nom,
      prenom: this.newUser.prenom,
      role: this.newUser.role,
      isActive: this.newUser.isActive
    }).subscribe({
      next: () => {
        this.creating = false;
        this.newUser = {
          id: '',
          email: '',
          password: '',
          prenom: '',
          nom: '',
          role: 'user',
          isActive: true,
          createdAt: new Date().toISOString(),
          _saving: false
        };
        this.loadUsers();
        this.activeTab = 1; // Index de l'onglet Utilisateurs
        this.snack.open('Utilisateur créé avec succès', 'Fermer', { 
          duration: 2000,
          panelClass: ['success-snackbar'] 
        });
      },
      error: (err: any) => {
        this.creating = false;
        this.snack.open(err.error?.message || 'Erreur lors de la création', 'Fermer', { 
          duration: 4000,
          panelClass: ['error-snackbar'] 
        });
      }
    });
  }
}
