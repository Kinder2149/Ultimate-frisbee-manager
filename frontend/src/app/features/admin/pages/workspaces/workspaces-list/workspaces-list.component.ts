import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiUrlService } from '../../../../../core/services/api-url.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface Workspace {
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

@Component({
  selector: 'app-workspaces-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './workspaces-list.component.html',
  styleUrls: ['./workspaces-list.component.scss']
})
export class WorkspacesListComponent implements OnInit {
  loading = false;
  workspaces: Workspace[] = [];
  filteredWorkspaces: Workspace[] = [];
  
  // Filtres
  searchTerm = '';
  sortBy = 'name';
  
  // Stats
  totalWorkspaces = 0;
  totalMembers = 0;
  totalContent = 0;

  constructor(
    private http: HttpClient,
    private api: ApiUrlService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadWorkspaces();
  }

  loadWorkspaces(): void {
    this.loading = true;
    const url = this.api.getUrl('workspaces');
    
    this.http.get<Workspace[]>(url).subscribe({
      next: (workspaces: Workspace[]) => {
        // Admin API renvoie déjà des compteurs réels
        this.workspaces = workspaces;
        
        this.filteredWorkspaces = [...this.workspaces];
        this.calculateStats();
        this.applyFilters();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur:', error);
        this.snackBar.open('Erreur de chargement', 'Fermer', { duration: 4000 });
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    this.totalWorkspaces = this.workspaces.length;
    this.totalMembers = this.workspaces.reduce((sum, ws) => sum + (ws.membersCount || 0), 0);
    this.totalContent = this.workspaces.reduce(
      (sum, ws) =>
        sum +
        (ws.exercicesCount || 0) +
        (ws.entrainementsCount || 0) +
        (ws.echauffementsCount || 0) +
        (ws.situationsCount || 0),
      0
    );
  }

  applyFilters(): void {
    let filtered = [...this.workspaces];

    // Recherche
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(ws => 
        ws.name.toLowerCase().includes(search) ||
        (ws.description && ws.description.toLowerCase().includes(search))
      );
    }

    // Tri
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'members':
          return (b.membersCount || 0) - (a.membersCount || 0);
        default:
          return 0;
      }
    });

    this.filteredWorkspaces = filtered;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.sortBy = 'name';
    this.applyFilters();
  }

  refresh(): void {
    this.loadWorkspaces();
    this.snackBar.open('Liste actualisée', '', { duration: 2000 });
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

  viewWorkspace(id: string): void {
    this.router.navigate(['/admin/workspaces', id]);
  }
}
