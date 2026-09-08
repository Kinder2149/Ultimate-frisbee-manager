import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="settings-container">
      <h1><mat-icon>settings</mat-icon> Paramètres système</h1>
      
      <mat-card class="settings-section">
        <h2>Export de données</h2>
        <p>Exporter toutes les données de la plateforme au format UFM</p>
        <button mat-raised-button color="primary" (click)="exportData()">
          <mat-icon>download</mat-icon>
          Exporter toutes les données (UFM)
        </button>
      </mat-card>

      <mat-card class="settings-section">
        <h2>Informations système</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Version</span>
            <span class="value">{{ version }}</span>
          </div>
          <div class="info-item">
            <span class="label">Environnement</span>
            <span class="value">{{ environnement }}</span>
          </div>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .settings-container { max-width: 1000px; margin: 0 auto; }
    .settings-container h1 { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
    .settings-section { margin-bottom: 24px; }
    .settings-section h2 { margin: 0 0 12px 0; font-size: 18px; color: #475569; }
    .settings-section p { margin: 0 0 16px 0; color: #64748b; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
    .info-item { display: flex; flex-direction: column; gap: 4px; }
    .info-item .label { font-size: 13px; color: #64748b; }
    .info-item .value { font-weight: 600; color: #1e293b; }
  `]
})
export class SettingsComponent implements OnInit {
  version = 'Chargement…';
  environnement = 'Chargement…';

  constructor(
    private snackBar: MatSnackBar,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Source de verite : le serveur lui-meme, via /api/health.
    this.http.get<{ env?: string; version?: string | null }>(`${environment.apiUrl}/health`)
      .subscribe({
        next: (etat) => {
          this.environnement = etat?.env === 'production' ? 'Production' : 'Développement';
          this.version = etat?.version || 'Non renseignée';
        },
        error: () => {
          this.environnement = 'Indisponible';
          this.version = 'Indisponible';
        }
      });
  }

  exportData(): void {
    this.router.navigate(['/parametres/import-export']);
    this.snackBar.open('Accédez à Import/Export pour sélectionner les éléments à exporter.', 'Fermer', { duration: 3500 });
  }
}
