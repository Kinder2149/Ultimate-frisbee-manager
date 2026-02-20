import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MobileHeaderComponent, HeaderAction } from '../../components/mobile-header/mobile-header.component';
import { CollapsibleSectionComponent } from '../../../../shared/components/collapsible-section/collapsible-section.component';
import { MobileImageViewerComponent } from '../../../../shared/components/mobile-image-viewer/mobile-image-viewer.component';
import { MobileConfirmDialogComponent } from '../../components/mobile-confirm-dialog/mobile-confirm-dialog.component';
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
    MatDialogModule,
    MobileHeaderComponent,
    CollapsibleSectionComponent,
    MobileImageViewerComponent
  ],
  template: `
    <div class="mobile-detail">
      <app-mobile-header
        [title]="itemTitle"
        [showBack]="true"
        [actions]="headerActions"
      ></app-mobile-header>

      <div class="detail-content" *ngIf="!loading && !error && item">
        <!-- Images -->
        <div class="image-section" *ngIf="itemImages.length > 0">
          <img 
            *ngFor="let img of itemImages; let i = index"
            [src]="img"
            [alt]="itemTitle"
            class="detail-image"
            (click)="onImageClick(i)"
          />
        </div>

        <!-- Métadonnées Exercice -->
        <div class="metadata-section" *ngIf="itemType === 'exercice' && exerciceData">
          <div class="metadata-item">
            <mat-icon>schedule</mat-icon>
            <span>{{ exerciceData['duree_minutes'] }} min</span>
          </div>
          <div class="metadata-item" *ngIf="exerciceData['nombre_joueurs_min']">
            <mat-icon>group</mat-icon>
            <span>{{ exerciceData['nombre_joueurs_min'] }}-{{ exerciceData['nombre_joueurs_max'] }} joueurs</span>
          </div>
        </div>

        <!-- Description -->
        <app-collapsible-section 
          *ngIf="item.description"
          title="Description" 
          icon="description"
          [defaultOpen]="true"
        >
          <div [innerHTML]="item.description"></div>
        </app-collapsible-section>

        <!-- Tags -->
        <app-collapsible-section 
          *ngIf="item.tags && item.tags.length > 0"
          title="Tags" 
          icon="label"
          [defaultOpen]="false"
        >
          <mat-chip-set>
            <mat-chip *ngFor="let tag of item.tags">{{ tag.nom }}</mat-chip>
          </mat-chip-set>
        </app-collapsible-section>

        <!-- Actions -->
        <div class="actions-section">
          <button 
            mat-raised-button 
            [color]="isFavorite() ? 'accent' : 'primary'"
            (click)="toggleFavorite()"
          >
            <mat-icon>{{ isFavorite() ? 'star' : 'star_border' }}</mat-icon>
            {{ isFavorite() ? 'Retirer des favoris' : 'Ajouter aux favoris' }}
          </button>
          
          <button 
            mat-raised-button 
            (click)="onDuplicate()"
          >
            <mat-icon>content_copy</mat-icon>
            Dupliquer
          </button>
          
          <button 
            mat-raised-button 
            color="warn"
            (click)="onDelete()"
          >
            <mat-icon>delete</mat-icon>
            Supprimer
          </button>
        </div>
      </div>

      <div class="loading-section" *ngIf="loading">
        <mat-spinner></mat-spinner>
      </div>

      <div class="error-section" *ngIf="error">
        <p>{{ error }}</p>
        <button mat-raised-button (click)="goBack()">Retour</button>
      </div>

      <app-mobile-image-viewer
        *ngIf="showImageViewer"
        [images]="itemImages"
        [currentIndex]="currentImageIndex"
        (close)="onImageViewerClose()"
      ></app-mobile-image-viewer>
    </div>
  `,
  styles: [`
    .mobile-detail {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .detail-content {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }

    .image-section {
      margin-bottom: 16px;
    }

    .detail-image {
      width: 100%;
      border-radius: 8px;
      cursor: pointer;
    }

    .metadata-section {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .metadata-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .actions-section {
      margin-top: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      
      button {
        width: 100%;
        min-height: 48px;
      }
    }

    .loading-section, .error-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 16px;
      text-align: center;
    }
  `]
})
export class MobileDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  item: any = null;
  loading = true;
  error: string | null = null;
  showImageViewer = false;
  currentImageIndex = 0;

  itemType = '';
  itemId = '';
  headerActions: HeaderAction[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private exerciceService: ExerciceService,
    private entrainementService: EntrainementService,
    private echauffementService: EchauffementService,
    private situationMatchService: SituationMatchService,
    private mobileNavigationService: MobileNavigationService,
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
          next: (item) => {
            this.item = item;
            this.loading = false;
            this.cdr.markForCheck();
          },
          error: () => this.setError()
        });
        break;
      case 'entrainement':
        this.entrainementService.getEntrainementById(this.itemId).subscribe({
          next: (item) => {
            this.item = item;
            this.loading = false;
            this.cdr.markForCheck();
          },
          error: () => this.setError()
        });
        break;
      case 'echauffement':
        this.echauffementService.getEchauffementById(this.itemId).subscribe({
          next: (item) => {
            this.item = item;
            this.loading = false;
            this.cdr.markForCheck();
          },
          error: () => this.setError()
        });
        break;
      case 'situation':
        this.situationMatchService.getSituationMatchById(this.itemId).subscribe({
          next: (item) => {
            this.item = item;
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
        { icon: 'share', label: 'Partager', action: () => this.onShare() }
      );
    }
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

  get exerciceData(): Exercice | null {
    if (!this.item || this.itemType !== 'exercice') return null;
    return this.item as Exercice;
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
    const isFav = this.mobileNavigationService.isFavorite(this.itemId);
    if (isFav) {
      this.mobileNavigationService.removeFavorite(this.itemId);
      this.snackBar.open('Retiré des favoris', 'Fermer', { duration: 2000 });
    } else {
      this.mobileNavigationService.addFavorite(this.itemId);
      this.snackBar.open('Ajouté aux favoris', 'Fermer', { duration: 2000 });
    }
  }

  isFavorite(): boolean {
    return this.mobileNavigationService.isFavorite(this.itemId);
  }

  onEdit(): void {
    this.router.navigate(['/mobile/edit', this.itemType, this.itemId]);
  }

  onShare(): void {
    this.snackBar.open('Fonctionnalité de partage à venir', 'Fermer', { duration: 2000 });
  }

  onDuplicate(): void {
    if (!this.item) return;
    
    const canDuplicate = this.permissionsService.canCreate();
    if (!canDuplicate) {
      this.snackBar.open('Permissions insuffisantes', 'OK', { duration: 3000 });
      return;
    }
    
    switch (this.itemType) {
      case 'exercice':
        this.exerciceService.duplicateExercice(this.itemId).subscribe({
          next: (newItem) => {
            this.snackBar.open('Exercice dupliqué', 'OK', { duration: 3000 });
            this.router.navigate(['/mobile/detail/exercice', newItem.id]);
          },
          error: () => this.snackBar.open('Erreur lors de la duplication', 'OK', { duration: 3000 })
        });
        break;
      case 'entrainement':
        this.entrainementService.duplicateEntrainement(this.itemId).subscribe({
          next: (newItem) => {
            this.snackBar.open('Entraînement dupliqué', 'OK', { duration: 3000 });
            this.router.navigate(['/mobile/detail/entrainement', newItem.id]);
          },
          error: () => this.snackBar.open('Erreur lors de la duplication', 'OK', { duration: 3000 })
        });
        break;
      case 'echauffement':
        this.echauffementService.duplicateEchauffement(this.itemId).subscribe({
          next: (newItem) => {
            this.snackBar.open('Échauffement dupliqué', 'OK', { duration: 3000 });
            this.router.navigate(['/mobile/detail/echauffement', newItem.id]);
          },
          error: () => this.snackBar.open('Erreur lors de la duplication', 'OK', { duration: 3000 })
        });
        break;
      case 'situation':
        this.situationMatchService.duplicateSituationMatch(this.itemId).subscribe({
          next: (newItem) => {
            this.snackBar.open('Situation dupliquée', 'OK', { duration: 3000 });
            this.router.navigate(['/mobile/detail/situation', newItem.id]);
          },
          error: () => this.snackBar.open('Erreur lors de la duplication', 'OK', { duration: 3000 })
        });
        break;
    }
  }

  onDelete(): void {
    if (!this.item) return;
    
    const canDelete = this.permissionsService.canDelete();
    if (!canDelete) {
      this.snackBar.open('Permissions insuffisantes', 'OK', { duration: 3000 });
      return;
    }
    
    const dialogRef = this.dialog.open(MobileConfirmDialogComponent, {
      data: {
        title: 'Confirmer la suppression',
        message: `Voulez-vous vraiment supprimer "${this.itemTitle}" ?`,
        confirmLabel: 'Supprimer',
        cancelLabel: 'Annuler',
        confirmColor: 'warn'
      }
    });
    
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.deleteItem();
      }
    });
  }

  private deleteItem(): void {
    switch (this.itemType) {
      case 'exercice':
        this.exerciceService.deleteExercice(this.itemId).subscribe({
          next: () => {
            this.snackBar.open('Exercice supprimé', 'OK', { duration: 3000 });
            this.router.navigate(['/mobile/library']);
          },
          error: () => this.snackBar.open('Erreur lors de la suppression', 'OK', { duration: 3000 })
        });
        break;
      case 'entrainement':
        this.entrainementService.deleteEntrainement(this.itemId).subscribe({
          next: () => {
            this.snackBar.open('Entraînement supprimé', 'OK', { duration: 3000 });
            this.router.navigate(['/mobile/library']);
          },
          error: () => this.snackBar.open('Erreur lors de la suppression', 'OK', { duration: 3000 })
        });
        break;
      case 'echauffement':
        this.echauffementService.deleteEchauffement(this.itemId).subscribe({
          next: () => {
            this.snackBar.open('Échauffement supprimé', 'OK', { duration: 3000 });
            this.router.navigate(['/mobile/library']);
          },
          error: () => this.snackBar.open('Erreur lors de la suppression', 'OK', { duration: 3000 })
        });
        break;
      case 'situation':
        this.situationMatchService.deleteSituationMatch(this.itemId).subscribe({
          next: () => {
            this.snackBar.open('Situation supprimée', 'OK', { duration: 3000 });
            this.router.navigate(['/mobile/library']);
          },
          error: () => this.snackBar.open('Erreur lors de la suppression', 'OK', { duration: 3000 })
        });
        break;
    }
  }

  goBack(): void {
    this.router.navigate(['/mobile/home']);
  }
}
