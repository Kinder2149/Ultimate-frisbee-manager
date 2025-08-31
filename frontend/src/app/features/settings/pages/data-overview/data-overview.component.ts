import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminService, AdminOverviewResponse, AdminOverviewItem } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-data-overview',
  templateUrl: './data-overview.component.html',
  styleUrls: ['./data-overview.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule
  ]
})
export class DataOverviewComponent implements OnInit {
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

  exercicesDS = new MatTableDataSource<AdminOverviewItem>([]);
  entrainementsDS = new MatTableDataSource<AdminOverviewItem>([]);
  echauffementsDS = new MatTableDataSource<AdminOverviewItem>([]);
  situationsDS = new MatTableDataSource<AdminOverviewItem>([]);
  tagsDS = new MatTableDataSource<AdminOverviewItem>([]);
  usersDS = new MatTableDataSource<AdminOverviewItem>([]);

  displayedColumns = ['id', 'titre', 'category', 'email', 'role', 'createdAt'];

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

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.fetchOverview();
  }

  fetchOverview(): void {
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
        this.usersDS.data = res.recent.users;

        // Attacher paginator/sort au prochain tick
        setTimeout(() => {
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
        });

        this.loading = false;
      },
      error: (err) => {
        this.error = typeof err === 'string' ? err : 'Erreur lors du chargement des données admin';
        this.loading = false;
      }
    });
  }

  formatDate(value?: string): string {
    if (!value) return '';
    try {
      const d = new Date(value);
      return d.toLocaleString();
    } catch {
      return value;
    }
  }
}
