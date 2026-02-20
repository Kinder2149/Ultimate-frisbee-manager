import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

import { MobileHeaderComponent } from '../../components/mobile-header/mobile-header.component';
import { MobileNavigationService } from '../../../../core/services/mobile-navigation.service';
import { TagService } from '../../../../core/services/tag.service';
import { WorkspaceService } from '../../../../core/services/workspace.service';
import { Tag, TagCategory } from '../../../../core/models/tag.model';
import { TAG_CATEGORIES } from '@ufm/shared/constants/tag-categories';
import { PermissionsService } from '../../../../core/services/permissions.service';

@Component({
  selector: 'app-mobile-tags',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MobileHeaderComponent
  ],
  templateUrl: './mobile-tags.component.html',
  styleUrls: ['./mobile-tags.component.scss']
})
export class MobileTagsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  groupedTags: { [key: string]: Tag[] } = {};
  tagCategories: TagCategory[] = Array.isArray((TAG_CATEGORIES as any))
    ? ([...TAG_CATEGORIES] as unknown as TagCategory[])
    : ['objectif', 'travail_specifique', 'niveau', 'temps', 'format', 'theme_entrainement'] as TagCategory[];

  selectedTabIndex = 0;
  editingTag: Tag | null = null;
  newTagLabel = '';
  newTagColor = '#667eea';
  isLoading = false;

  constructor(
    private router: Router,
    private mobileNavigationService: MobileNavigationService,
    private tagService: TagService,
    private snackBar: MatSnackBar,
    private workspaceService: WorkspaceService,
    public permissionsService: PermissionsService
  ) {}

  ngOnInit(): void {
    this.mobileNavigationService.setCurrentTab('library');
    this.groupedTags = this.buildEmptyGroups();

    // Attendre que le workspace soit disponible avant de charger les tags
    // Évite l'erreur WORKSPACE_ID_REQUIRED si navigation trop rapide
    this.workspaceService.currentWorkspace$
      .pipe(
        takeUntil(this.destroy$),
        filter(workspace => workspace !== null)
      )
      .subscribe(() => {
        this.loadTags();
      });

    this.tagService.tagsUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadTags();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildEmptyGroups(): { [key: string]: Tag[] } {
    return this.tagCategories.reduce((acc: { [key: string]: Tag[] }, category: string) => {
      acc[category] = [];
      return acc;
    }, {});
  }

  loadTags(): void {
    this.isLoading = true;
    this.tagService.getAllGrouped().subscribe({
      next: (data) => {
        const base = this.buildEmptyGroups();
        this.groupedTags = { ...base, ...(data || {}) };
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des tags:', err);
        this.snackBar.open('Impossible de charger les tags', 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  getCurrentCategory(): string {
    return this.tagCategories[this.selectedTabIndex] || 'objectif';
  }

  getCategoryDisplayName(category: string): string {
    const displayNames: { [key: string]: string } = {
      'objectif': 'Objectifs',
      'travail_specifique': 'Travail Spécifique',
      'niveau': 'Niveaux',
      'temps': 'Temps',
      'format': 'Format',
      'theme_entrainement': 'Thèmes'
    };
    return displayNames[category] || category;
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    this.cancelEdit();
  }

  onCreateTag(): void {
    if (!this.newTagLabel.trim()) {
      this.snackBar.open('Le nom du tag est requis', 'Fermer', { duration: 2000 });
      return;
    }

    const category = this.getCurrentCategory() as TagCategory;
    const newTag: Partial<Tag> = {
      label: this.newTagLabel.trim(),
      category: category,
      color: this.newTagColor
    };

    this.tagService.createTag(newTag as Tag).subscribe({
      next: (tag) => {
        this.snackBar.open(`Tag "${tag.label}" créé`, 'Fermer', { duration: 2000 });
        this.newTagLabel = '';
        this.newTagColor = '#667eea';
        this.loadTags();
      },
      error: (err) => {
        console.error('Erreur création tag:', err);
        this.snackBar.open(err.error?.message || 'Erreur lors de la création', 'Fermer', { duration: 3000 });
      }
    });
  }

  onEditTag(tag: Tag): void {
    this.editingTag = { ...tag };
    this.newTagLabel = tag.label;
    this.newTagColor = tag.color || '#667eea';
  }

  onUpdateTag(): void {
    if (!this.editingTag || !this.newTagLabel.trim()) {
      return;
    }

    const updatedTag: Tag = {
      ...this.editingTag,
      label: this.newTagLabel.trim(),
      color: this.newTagColor
    };

    this.tagService.updateTag(updatedTag.id!, updatedTag).subscribe({
      next: (tag) => {
        this.snackBar.open(`Tag "${tag.label}" modifié`, 'Fermer', { duration: 2000 });
        this.cancelEdit();
        this.loadTags();
      },
      error: (err) => {
        console.error('Erreur modification tag:', err);
        this.snackBar.open(err.error?.message || 'Erreur lors de la modification', 'Fermer', { duration: 3000 });
      }
    });
  }

  onDeleteTag(tag: Tag): void {
    if (!tag.id) return;

    const confirmDelete = confirm(`Supprimer le tag "${tag.label}" ?`);
    if (!confirmDelete) return;

    this.tagService.deleteTag(tag.id).subscribe({
      next: () => {
        this.snackBar.open('Tag supprimé', 'Fermer', { duration: 2000 });
        this.loadTags();
      },
      error: (err) => {
        console.error('Erreur suppression tag:', err);
        this.snackBar.open(err.error?.message || 'Erreur lors de la suppression', 'Fermer', { duration: 3000 });
      }
    });
  }

  cancelEdit(): void {
    this.editingTag = null;
    this.newTagLabel = '';
    this.newTagColor = '#667eea';
  }

  goBack(): void {
    this.router.navigate(['/mobile/library']);
  }
}
