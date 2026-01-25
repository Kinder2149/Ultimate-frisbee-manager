import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { HttpClient } from '@angular/common/http';
import { ApiUrlService } from '../../../../core/services/api-url.service';

interface ContentItem {
  id: string;
  titre: string;
  type: 'exercice' | 'entrainement' | 'echauffement' | 'situation';
  createdAt: string;
  tags?: Array<{ label: string; category: string; color?: string }>;
  selected?: boolean;
}

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatPaginatorModule
  ],
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss']
})
export class ContentComponent implements OnInit {
  loading = false;
  allContent: ContentItem[] = [];
  filteredContent: ContentItem[] = [];
  displayedContent: ContentItem[] = [];
  
  searchTerm = '';
  selectedType = 'all';
  
  displayedColumns = ['select', 'type', 'titre', 'tags', 'createdAt', 'actions'];
  
  pageSize = 20;
  pageIndex = 0;
  totalItems = 0;

  constructor(
    private http: HttpClient,
    private api: ApiUrlService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadContent();
  }

  loadContent(): void {
    this.loading = true;
    const url = this.api.getUrl('admin/all-content');
    
    this.http.get<{
      exercices: ContentItem[];
      entrainements: ContentItem[];
      echauffements: ContentItem[];
      situations: ContentItem[];
    }>(url).subscribe({
      next: (data) => {
        this.allContent = [
          ...data.exercices.map(e => ({ ...e, type: 'exercice' as const })),
          ...data.entrainements.map(e => ({ ...e, type: 'entrainement' as const })),
          ...data.echauffements.map(e => ({ ...e, type: 'echauffement' as const })),
          ...data.situations.map(e => ({ ...e, type: 'situation' as const }))
        ];
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement contenu:', error);
        this.snackBar.open('Erreur lors du chargement', 'Fermer', { duration: 4000 });
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.allContent];
    
    // Filtre par type
    if (this.selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === this.selectedType);
    }
    
    // Filtre par recherche
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.titre.toLowerCase().includes(term)
      );
    }
    
    this.filteredContent = filtered;
    this.totalItems = filtered.length;
    this.updateDisplayedContent();
  }

  updateDisplayedContent(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.displayedContent = this.filteredContent.slice(start, end);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateDisplayedContent();
  }

  toggleSelectAll(checked: boolean): void {
    this.displayedContent.forEach(item => item.selected = checked);
  }

  getSelectedCount(): number {
    return this.allContent.filter(item => item.selected).length;
  }

  bulkDelete(): void {
    const selected = this.allContent.filter(item => item.selected);
    if (selected.length === 0) {
      this.snackBar.open('Aucun élément sélectionné', 'Fermer', { duration: 3000 });
      return;
    }

    if (!confirm(`Supprimer ${selected.length} élément(s) ?`)) return;

    const url = this.api.getUrl('admin/bulk-delete');
    const items = selected.map(item => ({ id: item.id, type: item.type }));

    this.http.post(url, { items }).subscribe({
      next: () => {
        this.snackBar.open(`${selected.length} élément(s) supprimé(s)`, 'Fermer', { duration: 3000 });
        this.loadContent();
      },
      error: (error) => {
        console.error('Erreur suppression:', error);
        this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 4000 });
      }
    });
  }

  bulkDuplicate(): void {
    const selected = this.allContent.filter(item => item.selected);
    if (selected.length === 0) {
      this.snackBar.open('Aucun élément sélectionné', 'Fermer', { duration: 3000 });
      return;
    }

    const url = this.api.getUrl('admin/bulk-duplicate');
    const items = selected.map(item => ({ id: item.id, type: item.type }));

    this.http.post(url, { items }).subscribe({
      next: () => {
        this.snackBar.open(`${selected.length} élément(s) dupliqué(s)`, 'Fermer', { duration: 3000 });
        this.loadContent();
      },
      error: (error) => {
        console.error('Erreur duplication:', error);
        this.snackBar.open('Erreur lors de la duplication', 'Fermer', { duration: 4000 });
      }
    });
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      exercice: 'Exercice',
      entrainement: 'Entraînement',
      echauffement: 'Échauffement',
      situation: 'Situation'
    };
    return labels[type] || type;
  }

  getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      exercice: '#3b82f6',
      entrainement: '#8b5cf6',
      echauffement: '#f59e0b',
      situation: '#10b981'
    };
    return colors[type] || '#64748b';
  }
}
