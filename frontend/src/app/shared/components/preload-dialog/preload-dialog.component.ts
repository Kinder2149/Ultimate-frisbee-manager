import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WorkspacePreloaderService, PreloadProgress } from '../../../core/services/workspace-preloader.service';
import { WorkspaceSummary } from '../../../core/services/workspace.service';

export interface PreloadDialogData {
  workspace: WorkspaceSummary;
  allowSkip?: boolean;
}

@Component({
  selector: 'app-preload-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="preload-dialog">
      <div class="dialog-header">
        <mat-icon class="workspace-icon">folder_open</mat-icon>
        <h2 mat-dialog-title>Préparation de votre espace</h2>
      </div>

      <mat-dialog-content>
        <div class="workspace-name">{{ data.workspace.name }}</div>
        
        <div class="progress-section">
          <mat-progress-bar 
            mode="determinate" 
            [value]="progress.percentage"
            [color]="progress.completed ? 'accent' : 'primary'">
          </mat-progress-bar>
          
          <div class="progress-info">
            <span class="progress-text">{{ progress.currentTask }}</span>
            <span class="progress-percentage">{{ progress.percentage }}%</span>
          </div>
          
          <div class="progress-details">
            {{ progress.current }} / {{ progress.total }} tâches terminées
          </div>
        </div>

        <div class="info-message" *ngIf="!progress.completed">
          <mat-icon>info</mat-icon>
          <span>Nous chargeons vos données pour une expérience optimale...</span>
        </div>

        <div class="success-message" *ngIf="progress.completed">
          <mat-icon>check_circle</mat-icon>
          <span>Votre espace est prêt !</span>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end" *ngIf="data.allowSkip && !progress.completed">
        <button mat-button (click)="skip()" [disabled]="progress.percentage < 20">
          <mat-icon>skip_next</mat-icon>
          Continuer sans attendre
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .preload-dialog {
      min-width: 400px;
      max-width: 500px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .workspace-icon {
      font-size: 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
      color: #667eea;
    }

    h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #2c3e50;
    }

    mat-dialog-content {
      padding: 1.5rem 0;
    }

    .workspace-name {
      font-size: 1.1rem;
      font-weight: 500;
      color: #667eea;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .progress-section {
      margin: 1.5rem 0;
    }

    mat-progress-bar {
      height: 8px;
      border-radius: 4px;
    }

    .progress-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.75rem;
      font-size: 0.95rem;
    }

    .progress-text {
      color: #555;
      font-weight: 500;
    }

    .progress-percentage {
      color: #667eea;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .progress-details {
      text-align: center;
      color: #888;
      font-size: 0.85rem;
      margin-top: 0.5rem;
    }

    .info-message,
    .success-message {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: 8px;
      margin-top: 1.5rem;
    }

    .info-message {
      background: #e3f2fd;
      color: #1976d2;
    }

    .info-message mat-icon {
      color: #1976d2;
    }

    .success-message {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .success-message mat-icon {
      color: #2e7d32;
    }

    mat-dialog-actions {
      padding: 1rem 0 0 0;
    }

    mat-dialog-actions button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    mat-dialog-actions button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class PreloadDialogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  progress: PreloadProgress = {
    current: 0,
    total: 5,
    percentage: 0,
    currentTask: 'Initialisation...',
    completed: false
  };

  constructor(
    public dialogRef: MatDialogRef<PreloadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PreloadDialogData,
    private preloader: WorkspacePreloaderService
  ) {
    // Empêcher la fermeture par clic en dehors ou ESC
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    // Démarrer le préchargement
    this.startPreload();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private startPreload(): void {
    this.preloader.smartPreload(this.data.workspace.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (progress) => {
          this.progress = progress;
          
          // Fermer automatiquement quand terminé
          if (progress.completed) {
            setTimeout(() => {
              this.dialogRef.close({ completed: true });
            }, 500);
          }
        },
        error: (error) => {
          console.error('[PreloadDialog] Error during preload:', error);
          this.progress = {
            current: this.progress.current,
            total: this.progress.total,
            percentage: this.progress.percentage,
            currentTask: 'Le chargement a échoué. Vous pouvez continuer.',
            completed: false
          };
          
          // Permettre de continuer malgré l'erreur après 2 secondes
          setTimeout(() => {
            this.dialogRef.close({ completed: false, error });
          }, 2000);
        }
      });
  }

  skip(): void {
    this.dialogRef.close({ completed: false, skipped: true });
  }

  updateProgress(progress: PreloadProgress): void {
    this.progress = progress;
  }
}
