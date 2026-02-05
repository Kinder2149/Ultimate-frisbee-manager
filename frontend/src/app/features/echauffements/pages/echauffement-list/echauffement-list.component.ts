import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';

import { EchauffementService } from '../../../../core/services/echauffement.service';
import { Echauffement } from '../../../../core/models/echauffement.model';
import { WorkspaceDataStore } from '../../../../core/services/workspace-data.store';
import { ConfirmDialogComponent } from '../../../../shared/components/dialog/confirm-dialog.component';
import { ExerciceFiltersComponent, ExerciceFiltersValue } from '../../../exercices/components/exercice-filters.component';
import { EchauffementViewComponent } from '../../../../shared/components/echauffement-view/echauffement-view.component';
import { ApiUrlService } from '../../../../core/services/api-url.service';
import { RichTextViewComponent } from '../../../../shared/components/rich-text-view/rich-text-view.component';

@Component({
  selector: 'app-echauffement-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    ExerciceFiltersComponent,
    RichTextViewComponent
  ],
  templateUrl: './echauffement-list.component.html',
  styleUrls: ['./echauffement-list.component.scss']
})
export class EchauffementListComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  echauffements: Echauffement[] = [];
  filteredEchauffements: Echauffement[] = [];
  isLoading = false;
  searchTerm = '';

  constructor(
    private echauffementService: EchauffementService,
    private workspaceDataStore: WorkspaceDataStore,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private apiUrlService: ApiUrlService
  ) {}

  ngOnInit(): void {
    this.workspaceDataStore.echauffements$
      .pipe(takeUntil(this.destroy$))
      .subscribe((echauffements) => {
        this.echauffements = echauffements;
        this.applyFilters();
      });

    this.workspaceDataStore.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => {
        this.isLoading = loading && this.echauffements.length === 0;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEchauffements(): void {
    console.log('[EchauffementList] loadEchauffements() appelé - lecture seule via Store');
    this.echauffements = this.workspaceDataStore.getEchauffements();
    this.applyFilters();
  }

  // Filtres: recherche uniquement
  onFiltersChange(value: ExerciceFiltersValue): void {
    this.searchTerm = value.searchTerm || '';
    this.applyFilters();
  }

  private applyFilters(): void {
    let list = [...this.echauffements];
    if (this.searchTerm) {
      const s = this.searchTerm.toLowerCase();
      list = list.filter(e =>
        (e.nom && e.nom.toLowerCase().includes(s)) ||
        (e.description && e.description.toLowerCase().includes(s)) ||
        (e.blocs && e.blocs.some(b => b.titre && b.titre.toLowerCase().includes(s)))
      );
    }
    this.filteredEchauffements = list;
  }

  onCreateEchauffement(): void {
    this.router.navigate(['/echauffements/ajouter']);
  }

  onEditEchauffement(echauffement: Echauffement): void {
    this.router.navigate(['/echauffements/modifier', echauffement.id]);
  }

  onViewEchauffement(echauffement: Echauffement): void {
    this.dialog.open(EchauffementViewComponent, {
      width: '720px',
      maxWidth: '90vw',
      panelClass: 'entity-view-dialog',
      data: { echauffement }
    });
  }

  onDuplicateEchauffement(echauffement: Echauffement): void {
    if (!echauffement.id) return;

    this.echauffementService.duplicateEchauffement(echauffement.id).subscribe({
      next: (duplicatedEchauffement) => {
        this.snackBar.open('Échauffement dupliqué avec succès', 'Fermer', { duration: 3000 });
        this.loadEchauffements(); // Recharger la liste
      },
      error: (error) => {
        console.error('Erreur lors de la duplication:', error);
        this.snackBar.open('Erreur lors de la duplication', 'Fermer', { duration: 3000 });
      }
    });
  }

  onDeleteEchauffement(echauffement: Echauffement): void {
    if (!echauffement.id) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        dialogConfig: {
          title: 'Confirmer la suppression',
          submitButtonText: 'Supprimer',
          closeButtonText: 'Annuler'
        },
        customData: {
          title: 'Confirmer la suppression',
          message: `Êtes-vous sûr de vouloir supprimer l'échauffement "${echauffement.nom}" ?`,
          confirmText: 'Supprimer',
          cancelText: 'Annuler',
          dangerous: true
        }
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && echauffement.id) {
        this.echauffementService.deleteEchauffement(echauffement.id).subscribe({
          next: () => {
            this.snackBar.open('Échauffement supprimé avec succès', 'Fermer', { duration: 3000 });
            this.loadEchauffements(); // Recharger la liste
          },
          error: (error) => {
            console.error('Erreur lors de la suppression:', error);
            this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
          }
        });
      }
    });
  }

  getNombreBlocsText(echauffement: Echauffement): string {
    const nombreBlocs = echauffement.blocs?.length || 0;
    return nombreBlocs === 0 ? 'Aucun bloc' :
           nombreBlocs === 1 ? '1 bloc' :
           `${nombreBlocs} blocs`;
  }

  getDescriptionTruncated(description: string | undefined, maxLength: number = 150): string {
    if (!description) {
      return '';
    }
    if (description.length <= maxLength) {
      return description;
    }
    return description.substring(0, maxLength) + '...';
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // --- Calcul du temps total des blocs ---
  private parseTempsToSeconds(temps: string | undefined): number {
    if (!temps) return 0;
    const t = temps.trim().toLowerCase();
    // Supporte "5 min", "30 sec", "5m", "30s", ou juste nombre (par défaut min)
    const regex = /^(\d+(?:[\.,]\d+)?)\s*(min|m|sec|s)?$/i;
    const m = t.match(regex);
    if (!m) return 0;
    const rawVal = (m[1] || '').replace(',', '.');
    const num = Number(rawVal);
    if (isNaN(num)) return 0;
    const unit = (m[2] || 'min').toLowerCase();
    if (unit.startsWith('s')) {
      return Math.round(num);
    }
    // minutes -> secondes
    return Math.round(num * 60);
  }

  private formatSeconds(totalSec: number): string {
    if (totalSec <= 0) return '0 min';
    const minutes = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;
    if (seconds === 0) return `${minutes} min`;
    return `${minutes} min ${seconds}s`;
  }

  getFullImageUrl(relativeUrl: string | undefined): string | null {
    return this.apiUrlService.getMediaUrl(relativeUrl, 'echauffements');
  }

  formatTotalTemps(echauffement: Echauffement): string {
    const total = (echauffement.blocs || [])
      .map(b => this.parseTempsToSeconds(b.temps))
      .reduce((acc, v) => acc + v, 0);
    return this.formatSeconds(total);
  }
}
