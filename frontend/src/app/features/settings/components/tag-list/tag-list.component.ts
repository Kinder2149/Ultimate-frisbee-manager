import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../../core/services/admin.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SearchFilterComponent, FilterOption, SearchEvent } from '../../../../shared/components/search-filter/search-filter.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../../../core/services/notification.service';
import { Router } from '@angular/router';
import { Tag, TagCategory } from '../../../../core/models/tag.model';
import { DEFAULT_TAG_COLORS } from '../../../tags/constants/tag.constants';
import { TAG_CATEGORIES } from '@ufm/shared/constants/tag-categories';

export interface TagItem {
  id: string;
  label: string;
  category: string;
  createdAt: string;
}

@Component({
  selector: 'app-tag-list',
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
    SearchFilterComponent,
    MatCheckboxModule,
    MatToolbarModule
  ],
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.scss']
})
export class TagListComponent implements OnInit, AfterViewInit {
  selection = new SelectionModel<TagItem>(true, []);
  filterOptions: FilterOption[] = [];
  displayedColumns: string[] = ['select', 'label', 'category', 'createdAt'];
  dataSource = new MatTableDataSource<TagItem>();
  loading = true;
  error: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private adminService: AdminService,
    public dialog: MatDialog,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTags();
    this.setupFilters();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadTags(): void {
    this.loading = true;
    this.adminService.getAllTags().subscribe({
      next: (response) => {
        this.dataSource.data = response.tags;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des tags.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  setupFilters(): void {
        const categoryOptions = TAG_CATEGORIES.map((category: string) => ({
      value: category,
            label: category.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      color: DEFAULT_TAG_COLORS[category] || '#757575'
    }));

    this.filterOptions = [
      {
        key: 'category',
        label: 'Catégorie',
        type: 'select',
        options: categoryOptions
      }
    ];
  }

  onSearch(event: SearchEvent): void {
    this.dataSource.filterPredicate = (data: TagItem, filter: string): boolean => {
      const searchData = JSON.parse(filter);
      const searchTerm = searchData.searchTerm.toLowerCase();
      const filters = searchData.filters;

      const matchSearchTerm = !searchTerm || data.label.toLowerCase().includes(searchTerm);
      const matchCategory = !filters.category || data.category === filters.category;

      return matchSearchTerm && matchCategory;
    };

    this.dataSource.filter = JSON.stringify(event);

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }

  checkboxLabel(row?: TagItem): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id}`;
  }

  deleteSelected(): void {
    const numSelected = this.selection.selected.length;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmation de suppression',
        message: `Êtes-vous sûr de vouloir supprimer les ${numSelected} tag(s) sélectionné(s) ? Cette action est irréversible.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const itemsToDelete = this.selection.selected.map(item => ({ id: item.id, type: 'tag' }));
        this.adminService.bulkDelete(itemsToDelete).subscribe({
          next: () => {
            this.notificationService.showSuccess('Tags supprimés avec succès.');
            this.loadTags();
            this.selection.clear();
          },
          error: () => {
            this.notificationService.showError('Une erreur est survenue lors de la suppression des tags.');
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
        message: `Êtes-vous sûr de vouloir dupliquer les ${numSelected} tag(s) sélectionné(s) ?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const itemsToDuplicate = this.selection.selected.map(item => ({ id: item.id, type: 'tag' }));
        this.adminService.bulkDuplicate(itemsToDuplicate).subscribe({
          next: () => {
            this.notificationService.showSuccess('Tags dupliqués avec succès.');
            this.loadTags();
            this.selection.clear();
          },
          error: () => {
            this.notificationService.showError('Une erreur est survenue lors de la duplication des tags.');
          }
        });
      }
    });
  }

  getCategoryColor(category: string): string {
    return DEFAULT_TAG_COLORS[category] || '#757575'; // Gris par défaut
  }

  navigateToEdit(tag: TagItem, event: MouseEvent): void {
    event.stopPropagation();
    // La navigation vers la page d'édition des tags se fait via le TagManager
    this.router.navigate(['/parametres/tags'], { queryParams: { edit: tag.id } });
  }
}
