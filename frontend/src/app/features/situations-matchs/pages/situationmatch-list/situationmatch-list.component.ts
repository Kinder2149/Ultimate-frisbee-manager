import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import { Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';

import { SituationMatch } from '../../../../core/models/situationmatch.model';
import { ExerciceFiltersComponent, ExerciceFiltersValue } from '../../../exercices/components/exercice-filters.component';
import { Tag, TagCategory } from '../../../../core/models/tag.model';
import { SituationMatchService } from '../../../../core/services/situationmatch.service';
import { WorkspaceDataStore } from '../../../../core/services/workspace-data.store';
import { ConfirmDialogComponent } from '../../../../shared/components/dialog/confirm-dialog.component';
import { DuplicateButtonComponent } from '../../../../shared/components/duplicate-button/duplicate-button.component';
import { SituationMatchViewComponent } from '../../../../shared/components/situationmatch-view/situationmatch-view.component';
import { ApiUrlService } from '../../../../core/services/api-url.service';
import { ImageViewerComponent, ImageViewerData } from '../../../../shared/components/image-viewer/image-viewer.component';
import { RichTextViewComponent } from '../../../../shared/components/rich-text-view/rich-text-view.component';
import { WorkspaceService } from '../../../../core/services/workspace.service';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';

/**
 * Composant de liste des situations et matchs
 * Basé sur l'architecture du composant des échauffements
 */
@Component({
  selector: 'app-situationmatch-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    DuplicateButtonComponent,
    ExerciceFiltersComponent,
    RichTextViewComponent
  ],
  templateUrl: './situationmatch-list.component.html',
  styleUrls: ['./situationmatch-list.component.scss']
})
export class SituationMatchListComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  canWrite = true;

  situationsMatchs: SituationMatch[] = [];
  filteredSituationsMatchs: SituationMatch[] = [];
  loading = false;
  duplicatingIds = new Set<string>();
  // Cartes dépliées par id
  expandedIds = new Set<string>();

  // Filtres
  searchTerm = '';
  tempsTags: Tag[] = [];
  formatTags: Tag[] = [];
  allTags: Tag[] = [];
  selectedTempsTags: string[] = [];
  selectedFormatTags: string[] = [];

  constructor(
    private situationMatchService: SituationMatchService,
    private workspaceDataStore: WorkspaceDataStore,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private apiUrlService: ApiUrlService,
    private workspaceService: WorkspaceService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const ws = this.workspaceService.getCurrentWorkspace();
    this.authService.currentUser$.pipe(take(1)).subscribe((user: User | null) => {
      const wsRole = String(ws?.role || '').toUpperCase();
      const isViewer = wsRole === 'VIEWER';
      const isBase = ws?.isBase === true;
      const isAdmin = String(user?.role || '').toUpperCase() === 'ADMIN';
      this.canWrite = !isViewer && (!isBase || isAdmin);
    });

    this.loadTags();

    this.workspaceDataStore.situations$
      .pipe(takeUntil(this.destroy$))
      .subscribe((situations) => {
        this.situationsMatchs = situations;
        this.applyFilters();
      });

    this.workspaceDataStore.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => {
        this.loading = loading && this.situationsMatchs.length === 0;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Expansion cartes =====
  isExpanded(id?: string | null): boolean {
    if (!id) return false;
    return this.expandedIds.has(id);
  }

  toggleExpanded(event: Event | undefined, id?: string | null): void {
    if (event) event.stopPropagation();
    if (!id) return;
    if (this.expandedIds.has(id)) {
      this.expandedIds.delete(id);
    } else {
      this.expandedIds.add(id);
    }
  }

  onHeaderKeydown(event: Event, id?: string | null): void {
    const kev = event as KeyboardEvent;
    const key = (kev.key || '').toLowerCase();
    if (key === 'enter' || key === ' ') {
      kev.preventDefault();
      this.toggleExpanded(event as Event, id);
    }
  }

  private loadTags(): void {
    this.workspaceDataStore.tags$
      .pipe(takeUntil(this.destroy$))
      .subscribe((tags: Tag[]) => {
        this.allTags = tags;
        this.tempsTags = [...tags]
          .filter(t => t.category === 'temps')
          .sort((a, b) => a.label.localeCompare(b.label));
        this.formatTags = [...tags]
          .filter(t => t.category === 'format')
          .sort((a, b) => a.label.localeCompare(b.label));
      });
  }

  /**
   * Charge la liste des situations/matchs
   */
  loadSituationsMatchs(): void {
    console.log('[SituationMatchList] loadSituationsMatchs() appelé - lecture seule via Store');
    this.situationsMatchs = this.workspaceDataStore.getSituations();
    this.applyFilters();
  }

  // Gestion des filtres
  onFiltersChange(value: ExerciceFiltersValue): void {
    this.searchTerm = value.searchTerm || '';
    this.selectedTempsTags = value.selectedTempsTags || [];
    this.selectedFormatTags = value.selectedFormatTags || [];
    this.applyFilters();
  }

  private applyFilters(): void {
    let list = [...this.situationsMatchs];

    if (this.searchTerm) {
      const s = this.searchTerm.toLowerCase();
      list = list.filter(sm =>
        (sm.nom && sm.nom.toLowerCase().includes(s)) ||
        (sm.description && sm.description.toLowerCase().includes(s)) ||
        (sm.type && sm.type.toLowerCase().includes(s)) ||
        (sm.tags && sm.tags.some(t => t.label.toLowerCase().includes(s)))
      );
    }

    if (this.selectedTempsTags.length > 0) {
      list = list.filter(sm => sm.tags?.some(t => t.category === 'temps' && this.selectedTempsTags.includes(t.id || '')));
    }
    if (this.selectedFormatTags.length > 0) {
      list = list.filter(sm => sm.tags?.some(t => t.category === 'format' && this.selectedFormatTags.includes(t.id || '')));
    }

    this.filteredSituationsMatchs = list;
  }

  /**
   * Navigue vers le formulaire de création
   */
  creerSituationMatch(): void {
    this.router.navigate(['/situations-matchs/ajouter']);
  }

  /**
   * Navigue vers le formulaire de modification
   */
  modifierSituationMatch(id: string): void {
    this.router.navigate(['/situations-matchs/modifier', id]);
  }

  /**
   * Duplique une situation/match
   */
  dupliquerSituationMatch(id: string): void {
    this.duplicatingIds.add(id);
    this.situationMatchService.duplicateSituationMatch(id).subscribe({
      next: (nouvelleSituationMatch) => {
        this.snackBar.open('Situation/Match dupliquée avec succès', 'Fermer', { duration: 3000 });
        this.loadSituationsMatchs(); // Recharger la liste
        this.duplicatingIds.delete(id);
      },
      error: (error) => {
        console.error('Erreur lors de la duplication:', error);
        this.snackBar.open('Erreur lors de la duplication', 'Fermer', { duration: 3000 });
        this.duplicatingIds.delete(id);
      }
    });
  }

  onDeleteSituationMatch(situationMatch: SituationMatch): void {
    if (!situationMatch.id) return;

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
          message: `Êtes-vous sûr de vouloir supprimer cette ${situationMatch.type.toLowerCase()} ?`,
          confirmText: 'Supprimer',
          cancelText: 'Annuler',
          dangerous: true
        }
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && situationMatch.id) {
        this.situationMatchService.deleteSituationMatch(situationMatch.id).subscribe({
          next: () => {
            this.snackBar.open('Situation/Match supprimée avec succès', 'Fermer', { duration: 3000 });
            this.loadSituationsMatchs(); // Recharger la liste
          },
          error: (error) => {
            console.error('Erreur lors de la suppression:', error);
            this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
          }
        });
      }
    });
  }

  /**
   * Retourne le texte d'affichage pour les tags
   */
  getTagsText(situationMatch: SituationMatch): string {
    const nombreTags = situationMatch.tags?.length || 0;
    return nombreTags === 0 ? 'Aucun tag' :
           nombreTags === 1 ? '1 tag' :
           `${nombreTags} tags`;
  }

  /**
   * Tronque la description pour l'affichage
   */
  getDescriptionTruncated(description: string | undefined, maxLength: number = 150): string {
    if (!description) {
      return '';
    }
    if (description.length <= maxLength) {
      return description;
    }
    return description.substring(0, maxLength) + '...';
  }

  /**
   * Formate la date pour l'affichage
   */
  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  mediaUrl(path?: string | null): string | null {
    return this.apiUrlService.getMediaUrl(path ?? undefined, 'situations-matchs');
  }

  openImageViewer(situationMatch: SituationMatch): void {
    if (!situationMatch.imageUrl) return;

    const fullImageUrl = this.mediaUrl(situationMatch.imageUrl);
    if (!fullImageUrl) return;

    this.dialog.open<ImageViewerComponent, ImageViewerData>(ImageViewerComponent, {
      data: {
        imageUrl: fullImageUrl,
        altText: `Illustration de: ${situationMatch.nom || situationMatch.type}`
      },
      panelClass: 'image-viewer-dialog-container',
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
    });
  }

  /**
   * Ouvre la modale de visualisation d'une situation/match
   */
  ouvrirVueSituationMatch(situationMatch: SituationMatch): void {
    this.dialog.open(SituationMatchViewComponent, {
      width: '720px',
      maxWidth: '90vw',
      panelClass: 'entity-view-dialog',
      data: { situationMatch }
    });
  }
}
