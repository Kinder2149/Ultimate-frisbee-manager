import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MobileFilterBarComponent } from '../../components/mobile-filter-bar/mobile-filter-bar.component';
import { MobileTerrainToggleComponent } from '../../components/mobile-terrain-toggle/mobile-terrain-toggle.component';
import { ContentFeedComponent } from '../../components/content-feed/content-feed.component';
import { MobileConfirmDialogComponent } from '../../components/mobile-confirm-dialog/mobile-confirm-dialog.component';

import { CategoryType, SortOrder, ContentItem } from '../../models/content-item.model';
import { Tag } from '../../../../core/models/tag.model';

import { MobileStateService } from '../../services/mobile-state.service';
import { MobileDataService } from '../../services/mobile-data.service';
import { MobileFiltersService } from '../../services/mobile-filters.service';
import { ExerciceService } from '../../../../core/services/exercice.service';
import { EntrainementService } from '../../../../core/services/entrainement.service';
import { EchauffementService } from '../../../../core/services/echauffement.service';
import { SituationMatchService } from '../../../../core/services/situationmatch.service';

@Component({
  selector: 'app-mobile-home',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    MobileFilterBarComponent,
    MobileTerrainToggleComponent,
    ContentFeedComponent
  ],
  templateUrl: './mobile-home.component.html',
  styleUrls: ['./mobile-home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileHomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    public stateService: MobileStateService,
    private dataService: MobileDataService,
    private filtersService: MobileFiltersService,
    private exerciceService: ExerciceService,
    private entrainementService: EntrainementService,
    private echauffementService: EchauffementService,
    private situationMatchService: SituationMatchService
  ) {}

  ngOnInit(): void {
    this.stateService.loadAllContent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get availableTags(): Tag[] {
    return this.filtersService.extractUniqueTags(this.stateService.items());
  }

  // --- Handlers UI ---

  onCategoryChange(category: CategoryType): void {
    this.stateService.setCategory(category);
  }

  onSortChange(order: SortOrder): void {
    this.stateService.setSortOrder(order);
  }

  onSearchQueryChange(query: string): void {
    this.stateService.setSearchQuery(query);
  }

  onTagAdd(tag: Tag): void {
    this.stateService.addTagFilter(tag);
  }

  onTagRemove(tagId: string): void {
    this.stateService.removeTagFilter(tagId);
  }

  onTerrainModeChange(enabled: boolean): void {
    this.stateService.setTerrainMode(enabled);
  }

  // --- Handlers items ---

  onItemView(item: ContentItem): void {
    this.router.navigate(['/mobile/detail', item.type, item.id]);
  }

  onItemEdit(item: ContentItem): void {
    this.snackBar.open('Édition non disponible en mobile', 'Fermer', { duration: 3000 });
  }

  onItemDuplicate(item: ContentItem): void {
    const serviceMap: Record<ContentItem['type'], { service: any; method: string }> = {
      exercice: { service: this.exerciceService, method: 'duplicateExercice' },
      entrainement: { service: this.entrainementService, method: 'duplicateEntrainement' },
      echauffement: { service: this.echauffementService, method: 'duplicateEchauffement' },
      situation: { service: this.situationMatchService, method: 'duplicateSituationMatch' }
    };

    const { service, method } = serviceMap[item.type];

    if (typeof service[method] !== 'function') {
      this.snackBar.open('Fonctionnalité non disponible', 'Fermer', { duration: 3000 });
      return;
    }

    service[method](item.id).subscribe({
      next: () => {
        this.snackBar.open('Élément dupliqué avec succès', 'Fermer', { duration: 3000 });
        this.stateService.loadAllContent(true);
      },
      error: (err: any) => {
        console.error('[MobileHome] Erreur duplication:', err);
        this.snackBar.open('Erreur lors de la duplication', 'Fermer', { duration: 3000 });
      }
    });
  }

  onItemDelete(item: ContentItem): void {
    const dialogRef = this.dialog.open(MobileConfirmDialogComponent, {
      data: {
        title: 'Supprimer l\'élément',
        message: `Êtes-vous sûr de vouloir supprimer "${item.title}" ?`,
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
      if (!confirmed) return;

      const serviceMap: Record<ContentItem['type'], { service: any; method: string }> = {
        exercice: { service: this.exerciceService, method: 'deleteExercice' },
        entrainement: { service: this.entrainementService, method: 'deleteEntrainement' },
        echauffement: { service: this.echauffementService, method: 'deleteEchauffement' },
        situation: { service: this.situationMatchService, method: 'deleteSituationMatch' }
      };

      const { service, method } = serviceMap[item.type];

      if (typeof service[method] !== 'function') {
        this.snackBar.open('Fonctionnalité non disponible', 'Fermer', { duration: 3000 });
        return;
      }

      service[method](item.id).subscribe({
        next: () => {
          this.snackBar.open('Élément supprimé avec succès', 'Fermer', { duration: 3000 });
          this.stateService.removeItem(item.id);
        },
        error: (err: any) => {
          console.error('[MobileHome] Erreur suppression:', err);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    });
  }
}
