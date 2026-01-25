import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminService } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="stats-container">
      <h1><mat-icon>bar_chart</mat-icon> Statistiques</h1>
      <mat-card *ngIf="loading">
        <mat-spinner diameter="60"></mat-spinner>
      </mat-card>
      <div *ngIf="!loading && data" class="stats-grid">
        <mat-card *ngFor="let stat of stats">
          <h3>{{ stat.label }}</h3>
          <div class="stat-value">{{ stat.value }}</div>
        </mat-card>
      </div>
      <mat-card *ngIf="!loading">
        <p class="info-message">
          <mat-icon>info</mat-icon>
          Graphiques détaillés en développement. Utilise les données de GET /api/admin/overview.
        </p>
      </mat-card>
    </div>
  `,
  styles: [`
    .stats-container { max-width: 1400px; margin: 0 auto; }
    .stats-container h1 { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 24px; }
    .stat-value { font-size: 36px; font-weight: 700; color: #667eea; }
    .info-message { display: flex; align-items: center; gap: 12px; color: #64748b; }
  `]
})
export class StatsComponent implements OnInit {
  loading = false;
  data: any = null;
  stats: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loading = true;
    this.adminService.getOverview().subscribe({
      next: (data) => {
        this.data = data;
        this.stats = [
          { label: 'Exercices', value: data.counts.exercices },
          { label: 'Entraînements', value: data.counts.entrainements },
          { label: 'Échauffements', value: data.counts.echauffements },
          { label: 'Situations', value: data.counts.situations },
          { label: 'Tags', value: data.counts.tags },
          { label: 'Utilisateurs', value: data.counts.users }
        ];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
