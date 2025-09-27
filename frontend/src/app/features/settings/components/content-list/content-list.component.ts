import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, AllContentResponse } from '../../../../core/services/admin.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { SearchFilterComponent, FilterOption, SearchEvent } from '../../../../shared/components/search-filter/search-filter.component';
import { TagService } from '../../../../core/services/tag.service';
import { Tag } from '../../../../core/models/tag.model';
import { DEFAULT_TAG_COLORS } from '../../../tags/constants/tag.constants';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../../../core/services/notification.service';

export interface ContentItem {
  id: string;
  titre: string;
  type: 'Exercice' | 'Entraînement' | 'Échauffement' | 'Situation';
  tags: { label: string; category: string; color?: string }[];
  createdAt: string;
}

@Component({
  selector: 'app-content-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    SearchFilterComponent,
    MatCheckboxModule,
    MatToolbarModule
  ],
  templateUrl: './content-list.component.html',
  styleUrls: ['./content-list.component.scss']
})
export class ContentListComponent implements OnInit, AfterViewInit {
  selection = new SelectionModel<ContentItem>(true, []);
  displayedColumns: string[] = ['select', 'type', 'titre', 'tags', 'createdAt'];
  dataSource = new MatTableDataSource<ContentItem>();
  loading = true;
  filterOptions: FilterOption[] = [];
  error: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private adminService: AdminService, 
    private tagService: TagService, 
    private router: Router,
    public dialog: MatDialog,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadAllContent();
    this.setupFilters();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  navigateToEdit(item: ContentItem, event: MouseEvent): void {
    event.stopPropagation(); // Empêche la sélection de la ligne lors du clic sur le lien

    let path = '';
    switch (item.type) {
      case 'Exercice':
        path = `/exercices/modifier/${item.id}`;
        break;
      case 'Entraînement':
        path = `/entrainements/modifier/${item.id}`;
        break;
      case 'Échauffement':
        path = `/echauffements/modifier/${item.id}`;
        break;
      case 'Situation':
        path = `/situations-matchs/modifier/${item.id}`;
        break;
    }

    if (path) {
      this.router.navigate([path]);
    }
  }

  deleteSelected(): void {
    const numSelected = this.selection.selected.length;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmation de suppression',
        message: `Êtes-vous sûr de vouloir supprimer les ${numSelected} élément(s) sélectionné(s) ? Cette action est irréversible.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const itemsToDelete = this.selection.selected.map(item => ({ id: item.id, type: item.type }));
        this.adminService.bulkDelete(itemsToDelete).subscribe({
          next: () => {
            this.notificationService.showSuccess('Éléments supprimés avec succès.');
            this.loadAllContent(); // Recharger les données
            this.selection.clear(); // Vider la sélection
          },
          error: () => {
            this.notificationService.showError('Une erreur est survenue lors de la suppression.');
          }
        });
      }
    });
  }

  duplicateSelected(): void {
    const numSelected = this.selection.selected.length;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmation de duplication',
        message: `Êtes-vous sûr de vouloir dupliquer les ${numSelected} élément(s) sélectionné(s) ?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const itemsToDuplicate = this.selection.selected.map(item => ({ id: item.id, type: item.type }));
        this.adminService.bulkDuplicate(itemsToDuplicate).subscribe({
          next: () => {
            this.notificationService.showSuccess('Éléments dupliqués avec succès.');
            this.loadAllContent(); // Recharger les données
            this.selection.clear(); // Vider la sélection
          },
          error: () => {
            this.notificationService.showError('Une erreur est survenue lors de la duplication.');
          }
        });
      }
    });
  }

  checkboxLabel(row?: ContentItem): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id}`;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadAllContent(): void {
    this.loading = true;
    this.adminService.getAllContent().subscribe({
      next: (response: AllContentResponse) => {
        const allContent: ContentItem[] = [];
        response.exercices.forEach(item => allContent.push({ ...item, type: 'Exercice', tags: item.tags || [] }));
        response.entrainements.forEach(item => allContent.push({ ...item, type: 'Entraînement', tags: item.tags || [] }));
        response.echauffements.forEach(item => allContent.push({ ...item, type: 'Échauffement', tags: [] }));
        response.situations.forEach(item => allContent.push({ ...item, type: 'Situation', tags: item.tags || [] }));
        
        this.dataSource.data = allContent;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des contenus.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  setupFilters(): void {
    const contentTypeColors: { [key: string]: string } = {
      'Exercice': '#f44336',
      'Entraînement': '#3f51b5',
      'Échauffement': '#ff9800',
      'Situation': '#9c27b0'
    };
    this.tagService.getTags().subscribe((tags: Tag[]) => {
      const tagsByCategory = tags.reduce((acc, tag) => {
        const category = tag.category;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(tag);
        return acc;
      }, {} as { [key: string]: Tag[] });

      const tagFilters: FilterOption[] = Object.keys(tagsByCategory).map(category => {
        const label = category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return {
          key: `tag_${category}`,
          label: label,
          type: 'select',
          options: tagsByCategory[category].map(t => ({ 
            value: t.label, 
            label: t.label, 
            color: t.color || DEFAULT_TAG_COLORS[t.category] || '#757575' // Utilise la couleur du tag, ou la couleur par défaut de la catégorie, ou le gris
          }))
        };
      });

      this.filterOptions = [
        {
          key: 'type',
          label: 'Type de contenu',
          type: 'select',
          options: [
            { value: 'Exercice', label: 'Exercice', color: contentTypeColors['Exercice'] },
            { value: 'Entraînement', label: 'Entraînement', color: contentTypeColors['Entraînement'] },
            { value: 'Échauffement', label: 'Échauffement', color: contentTypeColors['Échauffement'] },
            { value: 'Situation', label: 'Situation', color: contentTypeColors['Situation'] },
          ]
        },
        ...tagFilters
      ];
    });
  }

  isLight(color?: string): boolean {
    if (!color) return false;
    const hex = color.replace('#', '');
    const c_r = parseInt(hex.substring(0, 2), 16);
    const c_g = parseInt(hex.substring(2, 4), 16);
    const c_b = parseInt(hex.substring(4, 6), 16);
    const brightness = ((c_r * 299) + (c_g * 587) + (c_b * 114)) / 1000;
    return brightness < 155;
  }

  onSearch(event: SearchEvent): void {
    this.dataSource.filterPredicate = (data: ContentItem, filter: string): boolean => {
      const searchData = JSON.parse(filter);
      const searchTerm = searchData.searchTerm.toLowerCase();
      const filters = searchData.filters;

      // 1. Filtre par terme de recherche
      const matchSearchTerm = !searchTerm || data.titre.toLowerCase().includes(searchTerm);

      // 2. Filtre par type
      const matchType = !filters.type || data.type === filters.type;

      // 3. Filtre par catégories de tags
      const tagFilters = Object.keys(filters).filter(key => key.startsWith('tag_'));
      const allTagsMatch = tagFilters.every(filterKey => {
        const selectedTag = filters[filterKey];
        return !selectedTag || data.tags.some(t => t.label === selectedTag);
      });

      return matchSearchTerm && matchType && allTagsMatch;
    };

    this.dataSource.filter = JSON.stringify(event);

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
