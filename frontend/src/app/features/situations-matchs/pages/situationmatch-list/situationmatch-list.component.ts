import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import { SituationMatch } from '../../../../core/models/situationmatch.model';
import { ExerciceFiltersComponent, ExerciceFiltersValue } from '../../../exercices/components/exercice-filters.component';
import { TagService } from '../../../../core/services/tag.service';
import { Tag, TagCategory } from '../../../../core/models/tag.model';
import { SituationMatchService } from '../../../../core/services/situationmatch.service';
import { ConfirmDialogComponent } from '../../../../shared/components/dialog/confirm-dialog.component';
import { DuplicateButtonComponent } from '../../../../shared/components/duplicate-button/duplicate-button.component';
import { SituationMatchViewComponent } from '../../../../shared/components/situationmatch-view/situationmatch-view.component';
import { ApiUrlService } from '../../../../core/services/api-url.service';
import { ImageViewerComponent, ImageViewerData } from '../../../../shared/components/image-viewer/image-viewer.component';

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
    ExerciceFiltersComponent
  ],
  templateUrl: './situationmatch-list.component.html',
  styleUrls: ['./situationmatch-list.component.scss']
})
export class SituationMatchListComponent implements OnInit {
  situationsMatchs: SituationMatch[] = [];
  filteredSituationsMatchs: SituationMatch[] = [];
  loading = false;
  duplicatingIds = new Set<string>();

  // Filtres
  searchTerm = '';
  tempsTags: Tag[] = [];
  formatTags: Tag[] = [];
  allTags: Tag[] = [];
  selectedTempsTags: string[] = [];
  selectedFormatTags: string[] = [];

  constructor(
    private situationMatchService: SituationMatchService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private tagService: TagService,
    private apiUrlService: ApiUrlService
  ) {}

  ngOnInit(): void {
    this.loadTags();
    this.loadSituationsMatchs();
  }

  private loadTags(): void {
    // Charger les catégories pertinentes pour Situations/Matchs: TEMPS et FORMAT
        this.tagService.getTags('temps').subscribe({
      next: (tags) => {
        this.tempsTags = [...tags].sort((a, b) => a.label.localeCompare(b.label));
        this.allTags = [...this.allTags, ...tags];
      },
      error: () => {}
    });
        this.tagService.getTags('format').subscribe({
      next: (tags) => {
        this.formatTags = [...tags].sort((a, b) => a.label.localeCompare(b.label));
        this.allTags = [...this.allTags, ...tags];
      },
      error: () => {}
    });
  }

  /**
   * Charge la liste des situations/matchs
   */
  loadSituationsMatchs(): void {
    this.loading = true;
    this.situationMatchService.getSituationsMatchs().subscribe({
      next: (situationsMatchs) => {
        this.situationsMatchs = situationsMatchs;
        this.applyFilters();
        this.loading = false;
        console.log(`${situationsMatchs.length} situations/matchs chargées`);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des situations/matchs:', error);
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement des situations/matchs', 'Fermer', { duration: 3000 });
      }
    });
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
