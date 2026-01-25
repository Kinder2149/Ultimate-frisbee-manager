import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AdminService } from '../../../../../core/services/admin.service';
import { UserEditDialogComponent } from '../user-edit-dialog/user-edit-dialog.component';

interface UserRow {
  id: string;
  email: string;
  nom?: string;
  prenom?: string;
  role: string;
  isActive: boolean;
  iconUrl?: string | null;
  createdAt: string;
  fullName?: string;
  workspacesCount?: number;
}

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent implements OnInit {
  loading = false;
  dataSource = new MatTableDataSource<UserRow>([]);
  displayedColumns = ['avatar', 'fullName', 'email', 'role', 'status', 'workspaces', 'createdAt', 'actions'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Filtres
  searchTerm = '';
  roleFilter = 'all';
  statusFilter = 'all';
  
  // Stats
  totalUsers = 0;
  activeUsers = 0;
  adminUsers = 0;

  constructor(
    private adminService: AdminService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.setupFilters();
  }

  loadUsers(): void {
    this.loading = true;
    this.adminService.getUsers().subscribe({
      next: (response) => {
        const users = response.users.map(user => ({
          ...user,
          fullName: this.getFullName(user.prenom, user.nom),
          workspacesCount: 0
        }));
        
        this.dataSource.data = users;
        this.calculateStats(users);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement utilisateurs:', error);
        this.snackBar.open('Erreur lors du chargement', 'Fermer', { duration: 4000 });
        this.loading = false;
      }
    });
  }

  setupFilters(): void {
    this.dataSource.filterPredicate = (data: UserRow, filter: string): boolean => {
      const searchStr = filter.toLowerCase();
      const matchesSearch = !this.searchTerm || 
        data.email.toLowerCase().includes(searchStr) ||
        (!!data.fullName && data.fullName.toLowerCase().includes(searchStr));
      
      const matchesRole = this.roleFilter === 'all' || data.role === this.roleFilter;
      const matchesStatus = this.statusFilter === 'all' || 
        (this.statusFilter === 'active' && data.isActive) ||
        (this.statusFilter === 'inactive' && !data.isActive);
      
      return !!(matchesSearch && matchesRole && matchesStatus);
    };
  }

  applyFilters(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.roleFilter = 'all';
    this.statusFilter = 'all';
    this.applyFilters();
  }

  calculateStats(users: UserRow[]): void {
    this.totalUsers = users.length;
    this.activeUsers = users.filter(u => u.isActive).length;
    this.adminUsers = users.filter(u => u.role === 'ADMIN').length;
  }

  refresh(): void {
    this.loadUsers();
    this.snackBar.open('Liste actualisée', '', { duration: 2000 });
  }

  getFullName(prenom?: string, nom?: string): string {
    const parts = [prenom, nom].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'Sans nom';
  }

  getInitials(prenom?: string, nom?: string): string {
    const p = prenom?.charAt(0)?.toUpperCase() || '';
    const n = nom?.charAt(0)?.toUpperCase() || '';
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

  viewUser(userId: string): void {
    this.router.navigate(['/admin/users', userId]);
  }

  getRoleColor(role: string): string {
    return role === 'ADMIN' ? '#f59e0b' : '#3b82f6';
  }

  getRoleLabel(role: string): string {
    return role === 'ADMIN' ? 'Administrateur' : 'Utilisateur';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'Actif' : 'Inactif';
  }

  getStatusColor(isActive: boolean): string {
    return isActive ? '#10b981' : '#ef4444';
  }

  getRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} sem`;
    if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
    return date.toLocaleDateString('fr-FR');
  }

  editUser(userId: string, event: Event): void {
    event.stopPropagation();
    
    const user = this.dataSource.data.find(u => u.id === userId);
    if (!user) return;

    const dialogRef = this.dialog.open(UserEditDialogComponent, {
      width: '600px',
      data: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        isActive: user.isActive,
        iconUrl: user.iconUrl
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.updated) {
        // Recharger la liste des utilisateurs
        this.loadUsers();
      }
    });
  }
}
