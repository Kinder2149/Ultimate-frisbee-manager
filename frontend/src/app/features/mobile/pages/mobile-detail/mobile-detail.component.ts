import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MobileConfirmDialogComponent } from '../../components/mobile-confirm-dialog/mobile-confirm-dialog.component';
import { ContentItem } from '../../models/content-item.model';
import { Exercice } from '../../../../core/models/exercice.model';
import { Entrainement } from '../../../../core/models/entrainement.model';
import { Echauffement } from '../../../../core/models/echauffement.model';
import { SituationMatch } from '../../../../core/models/situationmatch.model';

import { ExerciceService } from '../../../../core/services/exercice.service';
import { EntrainementService } from '../../../../core/services/entrainement.service';
import { EchauffementService } from '../../../../core/services/echauffement.service';
import { SituationMatchService } from '../../../../core/services/situationmatch.service';

@Component({
  selector: 'app-mobile-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './mobile-detail.component.html',
  styleUrls: ['./mobile-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  item: ContentItem | null = null;
  loading = true;
  error: string | null = null;

  private itemType = '';
  private itemId = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private exerciceService: ExerciceService,
    private entrainementService: EntrainementService,
    private echauffementService: EchauffementService,
    private situationMatchService: SituationMatchService
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.itemType = params['type'];
        this.itemId = params['id'];
        this.loadItem();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadItem(): void {
    this.loading = true;
    this.error = null;

    switch (this.itemType) {
      case 'exercice':
        this.exerciceService.getExerciceById(this.itemId).subscribe({
          next: (exercice: Exercice) => this.setItem(this.mapExercice(exercice)),
          error: () => this.setError()
        });
        break;
      case 'entrainement':
        this.entrainementService.getEntrainementById(this.itemId).subscribe({
          next: (entrainement: Entrainement) => this.setItem(this.mapEntrainement(entrainement)),
          error: () => this.setError()
        });
        break;
      case 'echauffement':
        this.echauffementService.getEchauffementById(this.itemId).subscribe({
          next: (echauffement: Echauffement) => this.setItem(this.mapEchauffement(echauffement)),
          error: () => this.setError()
        });
        break;
      case 'situation':
        this.situationMatchService.getSituationMatchById(this.itemId).subscribe({
          next: (situation: SituationMatch) => this.setItem(this.mapSituation(situation)),
          error: () => this.setError()
        });
        break;
      default:
        this.setError();
    }
  }

  private setItem(item: ContentItem): void {
    this.item = item;
    this.loading = false;
    this.error = null;
    this.cdr.markForCheck();
  }

  private setError(): void {
    this.error = 'Élément introuvable';
    this.loading = false;
    this.cdr.markForCheck();
  }

  private mapExercice(exercice: Exercice): ContentItem {
    return {
      id: exercice.id!,
      type: 'exercice',
      title: exercice.nom,
      description: exercice.description,
      createdAt: new Date(exercice.createdAt!),
      tags: exercice.tags,
      imageUrl: exercice.imageUrl,
      originalData: exercice
    };
  }

  private mapEntrainement(entrainement: Entrainement): ContentItem {
    return {
      id: entrainement.id!,
      type: 'entrainement',
      title: entrainement.titre,
      createdAt: new Date(entrainement.createdAt!),
      tags: entrainement.tags,
      duree: this.calculateDureeEntrainement(entrainement),
      originalData: entrainement
    };
  }

  private mapEchauffement(echauffement: Echauffement): ContentItem {
    return {
      id: echauffement.id!,
      type: 'echauffement',
      title: echauffement.nom,
      description: echauffement.description,
      createdAt: new Date(echauffement.createdAt!),
      nombreBlocs: echauffement.blocs?.length || 0,
      originalData: echauffement
    };
  }

  private mapSituation(situation: SituationMatch): ContentItem {
    return {
      id: situation.id!,
      type: 'situation',
      title: situation.nom || 'Sans titre',
      description: situation.description,
      createdAt: new Date(situation.createdAt!),
      tags: situation.tags,
      imageUrl: situation.imageUrl,
      originalData: situation
    };
  }

  private calculateDureeEntrainement(entrainement: Entrainement): number {
    if (!entrainement.exercices || entrainement.exercices.length === 0) {
      return 0;
    }
    return entrainement.exercices.reduce((total, ex) => {
      if (!ex.duree) return total;
      const duree = typeof ex.duree === 'number' ? ex.duree : parseInt(String(ex.duree), 10) || 0;
      return total + duree;
    }, 0);
  }

  // --- Navigation ---

  goBack(): void {
    this.router.navigate(['/mobile']);
  }

  // --- Getters pour le template ---

  get typeIcon(): string {
    if (!this.item) return '';
    const icons: Record<ContentItem['type'], string> = {
      exercice: 'fitness_center',
      entrainement: 'sports',
      echauffement: 'whatshot',
      situation: 'flag'
    };
    return icons[this.item.type];
  }

  get typeLabel(): string {
    if (!this.item) return '';
    const labels: Record<ContentItem['type'], string> = {
      exercice: 'Exercice',
      entrainement: 'Entraînement',
      echauffement: 'Échauffement',
      situation: 'Situation'
    };
    return labels[this.item.type];
  }

  get plainDescription(): string {
    if (!this.item?.description) return '';
    return this.item.description.replace(/<[^>]*>/g, '');
  }

  formatDuree(duree: number | undefined): string {
    if (!duree) return '';
    return `${duree} min`;
  }

  // --- Getters pour données spécifiques par type ---

  get exerciceData(): Exercice | null {
    if (!this.item || this.item.type !== 'exercice') return null;
    return this.item.originalData as Exercice;
  }

  get entrainementData(): Entrainement | null {
    if (!this.item || this.item.type !== 'entrainement') return null;
    return this.item.originalData as Entrainement;
  }

  get echauffementData(): Echauffement | null {
    if (!this.item || this.item.type !== 'echauffement') return null;
    return this.item.originalData as Echauffement;
  }

  get situationData(): SituationMatch | null {
    if (!this.item || this.item.type !== 'situation') return null;
    return this.item.originalData as SituationMatch;
  }

  // --- Actions ---

  onDuplicate(): void {
    if (!this.item) return;

    const serviceMap: Record<ContentItem['type'], { service: any; method: string }> = {
      exercice: { service: this.exerciceService, method: 'duplicateExercice' },
      entrainement: { service: this.entrainementService, method: 'duplicateEntrainement' },
      echauffement: { service: this.echauffementService, method: 'duplicateEchauffement' },
      situation: { service: this.situationMatchService, method: 'duplicateSituationMatch' }
    };

    const { service, method } = serviceMap[this.item.type];

    if (typeof service[method] !== 'function') {
      this.snackBar.open('Fonctionnalité non disponible', 'Fermer', { duration: 3000 });
      return;
    }

    service[method](this.item.id).subscribe({
      next: () => {
        this.snackBar.open('Élément dupliqué avec succès', 'Fermer', { duration: 3000 });
      },
      error: (err: any) => {
        console.error('[MobileDetail] Erreur duplication:', err);
        this.snackBar.open('Erreur lors de la duplication', 'Fermer', { duration: 3000 });
      }
    });
  }

  onDelete(): void {
    if (!this.item) return;

    const dialogRef = this.dialog.open(MobileConfirmDialogComponent, {
      data: {
        title: 'Supprimer l\'élément',
        message: `Êtes-vous sûr de vouloir supprimer "${this.item.title}" ?`,
        confirmLabel: 'Supprimer',
        cancelLabel: 'Annuler',
        confirmColor: 'warn' as const
      },
      panelClass: 'mobile-confirm-dialog-panel',
      maxWidth: '95vw',
      width: '100%',
      position: { bottom: '0' }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed || !this.item) return;

      const serviceMap: Record<ContentItem['type'], { service: any; method: string }> = {
        exercice: { service: this.exerciceService, method: 'deleteExercice' },
        entrainement: { service: this.entrainementService, method: 'deleteEntrainement' },
        echauffement: { service: this.echauffementService, method: 'deleteEchauffement' },
        situation: { service: this.situationMatchService, method: 'deleteSituationMatch' }
      };

      const { service, method } = serviceMap[this.item.type];

      if (typeof service[method] !== 'function') {
        this.snackBar.open('Fonctionnalité non disponible', 'Fermer', { duration: 3000 });
        return;
      }

      service[method](this.item.id).subscribe({
        next: () => {
          this.snackBar.open('Élément supprimé avec succès', 'Fermer', { duration: 3000 });
          this.goBack();
        },
        error: (err: any) => {
          console.error('[MobileDetail] Erreur suppression:', err);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    });
  }
}
