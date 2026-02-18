import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MobileHeaderComponent, HeaderAction } from '../../components/mobile-header/mobile-header.component';
import { CollapsibleSectionComponent } from '../../../../shared/components/collapsible-section/collapsible-section.component';
import { MobileImageViewerComponent } from '../../../../shared/components/mobile-image-viewer/mobile-image-viewer.component';
import { MobileNavigationService } from '../../../../core/services/mobile-navigation.service';
import { Exercice } from '../../../../core/models/exercice.model';
import { Entrainement } from '../../../../core/models/entrainement.model';
import { Echauffement } from '../../../../core/models/echauffement.model';
import { SituationMatch } from '../../../../core/models/situationmatch.model';

import { ExerciceService } from '../../../../core/services/exercice.service';
import { EntrainementService } from '../../../../core/services/entrainement.service';
import { EchauffementService } from '../../../../core/services/echauffement.service';
import { SituationMatchService } from '../../../../core/services/situationmatch.service';
import { PermissionsService } from '../../../../core/services/permissions.service';

@Component({
  selector: 'app-mobile-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MobileHeaderComponent,
    CollapsibleSectionComponent,
    MobileImageViewerComponent
  ],
  templateUrl: './mobile-detail.component.html',
  styleUrls: ['./mobile-detail.component.scss']
})
export class MobileDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  item: any = null;
  loading = true;
  error: string | null = null;
  showImageViewer = false;
  currentImageIndex = 0;

  private itemType = '';
  private itemId = '';

  headerActions: HeaderAction[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private exerciceService: ExerciceService,
    private entrainementService: EntrainementService,
    private echauffementService: EchauffementService,
    private situationMatchService: SituationMatchService,
    private mobileStateService: MobileStateService,
    private permissionsService: PermissionsService
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
    this.setupHeaderActions();

    switch (this.itemType) {
      case 'exercice':
        this.exerciceService.getExerciceById(this.itemId).subscribe({
          next: (exercice: Exercice) => {
            this.item = exercice;
            this.loading = false;
            this.cdr.markForCheck();
          },
          error: () => this.setError()
        });
        break;
      case 'entrainement':
        this.entrainementService.getEntrainementById(this.itemId).subscribe({
          next: (entrainement: Entrainement) => {
            this.item = entrainement;
            this.loading = false;
            this.cdr.markForCheck();
          },
          error: () => this.setError()
        });
        break;
      case 'echauffement':
        this.echauffementService.getEchauffementById(this.itemId).subscribe({
          next: (echauffement: Echauffement) => {
            this.item = echauffement;
            this.loading = false;
            this.cdr.markForCheck();
          },
          error: () => this.setError()
        });
        break;
      case 'situation':
        this.situationMatchService.getSituationMatchById(this.itemId).subscribe({
          next: (situation: SituationMatch) => {
            this.item = situation;
            this.loading = false;
            this.cdr.markForCheck();
          },
          error: () => this.setError()
        });
        break;
      default:
        this.setError();
    }
  }

  private setupHeaderActions(): void {
    this.headerActions = [];

    if (this.permissionsService.canWrite()) {
      this.headerActions.push(
        { icon: 'edit', label: 'Éditer', action: () => this.onEdit() },
        { icon: 'content_copy', label: 'Dupliquer', action: () => this.onDuplicate() }
      );
    }

    if (this.permissionsService.canWrite()) {
      this.headerActions.push(
        { icon: 'delete', label: 'Supprimer', action: () => this.onDelete() }
      );
    }

    this.headerActions.push(
      { icon: 'share', label: 'Partager', action: () => this.onShare() }
    );
  }


  private setError(): void {
    this.error = 'Élément introuvable';
    this.loading = false;
    this.cdr.markForCheck();
  }

  private setError(): void {
    this.error = 'Élément introuvable';
    this.loading = false;
    this.cdr.markForCheck();
  }

  get itemTitle(): string {
    if (!this.item) return '';
    if (this.itemType === 'exercice') return (this.item as Exercice).nom;
    if (this.itemType === 'entrainement') return (this.item as Entrainement).titre;
    if (this.itemType === 'echauffement') return (this.item as Echauffement).nom;
    if (this.itemType === 'situation') return (this.item as SituationMatch).nom || 'Sans titre';
    return '';
  }

  get itemImages(): string[] {
    if (!this.item) return [];
    if (this.itemType === 'exercice' && (this.item as Exercice).imageUrl) {
      return [(this.item as Exercice).imageUrl!];
    }
    if (this.itemType === 'situation' && (this.item as SituationMatch).imageUrl) {
      return [(this.item as SituationMatch).imageUrl!];
    }
    return [];
  }

  onImageClick(index: number): void {
    this.currentImageIndex = index;
    this.showImageViewer = true;
  }

  onImageViewerClose(): void {
    this.showImageViewer = false;
  }

  toggleFavorite(): void {
    if (!this.item) return;
    const isFavorite = this.mobileStateService.isFavorite(this.itemId);
    if (isFavorite) {
      this.mobileStateService.removeFavorite(this.itemId);
      this.snackBar.open('Retiré des favoris', 'Fermer', { duration: 2000 });
    } else {
      this.mobileStateService.addFavorite(this.itemId);
      this.snackBar.open('Ajouté aux favoris', 'Fermer', { duration: 2000 });
    }
  }

  isFavorite(): boolean {
    return this.mobileStateService.isFavorite(this.itemId);
  }

  onEdit(): void {
    const routes: Record<string, string> = {
      exercice: '/exercices/edit',
      entrainement: '/entrainements/edit',
      echauffement: '/echauffements/edit',
      situation: '/situations-matchs/edit'
    };
    this.router.navigate([routes[this.itemType], this.itemId]);
  }

  onShare(): void {
    this.snackBar.open('Fonctionnalité de partage à venir', 'Fermer', { duration: 2000 });
  }

  onDuplicate(): void {
    this.snackBar.open('Duplication en cours...', '', { duration: 1000 });
  }

  onDelete(): void {
    this.snackBar.open('Suppression à implémenter', 'Fermer', { duration: 2000 });
  }

  private mapExercice_UNUSED(exercice: Exercice): any {
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

  private mapEntrainement_UNUSED(entrainement: Entrainement): any {
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

  private mapEchauffement_UNUSED(echauffement: Echauffement): any {
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

  private mapSituation_UNUSED(situation: SituationMatch): any {
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
    const icons: Record<string, string> = {
      exercice: 'fitness_center',
      entrainement: 'sports',
      echauffement: 'whatshot',
      situation: 'flag'
    };
    return icons[this.itemType];
  }

  get typeLabel(): string {
    if (!this.item) return '';
    const labels: Record<string, string> = {
      exercice: 'Exercice',
      entrainement: 'Entraînement',
      echauffement: 'Échauffement',
      situation: 'Situation'
    };
    return labels[this.itemType];
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
    if (!this.item || this.itemType !== 'exercice') return null;
    return this.item as Exercice;
  }

  get entrainementData(): Entrainement | null {
    if (!this.item || this.itemType !== 'entrainement') return null;
    return this.item as Entrainement;
  }

  get echauffementData(): Echauffement | null {
    if (!this.item || this.itemType !== 'echauffement') return null;
    return this.item as Echauffement;
  }

  get situationData(): SituationMatch | null {
    if (!this.item || this.itemType !== 'situation') return null;
    return this.item as SituationMatch;
  }

  // --- Actions ---

  onDuplicate(): void {
    if (!this.item) return;

    const serviceMap: Record<string, { service: any; method: string }> = {
      exercice: { service: this.exerciceService, method: 'duplicateExercice' },
      entrainement: { service: this.entrainementService, method: 'duplicateEntrainement' },
      echauffement: { service: this.echauffementService, method: 'duplicateEchauffement' },
      situation: { service: this.situationMatchService, method: 'duplicateSituationMatch' }
    };

    const { service, method } = serviceMap[this.itemType];

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
        message: `Êtes-vous sûr de vouloir supprimer "${this.itemTitle}" ?`,
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

      const serviceMap: Record<string, { service: any; method: string }> = {
        exercice: { service: this.exerciceService, method: 'deleteExercice' },
        entrainement: { service: this.entrainementService, method: 'deleteEntrainement' },
        echauffement: { service: this.echauffementService, method: 'deleteEchauffement' },
        situation: { service: this.situationMatchService, method: 'deleteSituationMatch' }
      };

      const { service, method } = serviceMap[this.itemType];

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
