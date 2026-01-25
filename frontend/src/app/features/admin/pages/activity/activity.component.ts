import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule
  ],
  template: `
    <div class="activity-container">
      <h1><mat-icon>history</mat-icon> Historique d'activité</h1>
      <mat-card>
        <div class="empty-state">
          <mat-icon>inbox</mat-icon>
          <h3>Fonctionnalité en attente</h3>
          <p>L'historique d'activité sera disponible lorsque le backend fournira les logs.</p>
          <p class="tech-note">Structure UI prête : date, utilisateur, action, type, objet</p>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .activity-container { max-width: 1400px; margin: 0 auto; }
    .activity-container h1 { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
    .empty-state { text-align: center; padding: 80px 20px; color: #64748b; }
    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; margin-bottom: 16px; opacity: 0.5; }
    .empty-state h3 { margin: 16px 0; color: #475569; }
    .tech-note { font-size: 13px; font-style: italic; margin-top: 16px; }
  `]
})
export class ActivityComponent {}
