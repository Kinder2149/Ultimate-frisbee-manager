import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TagService } from '../../../core/services/tag.service';
import { Tag, TagCategory } from '../../../core/models/tag.model';
import { TAG_CATEGORIES, TAG_CATEGORY_LABELS } from '@ufm/shared/constants/tag-categories';
import { TagFormComponent } from '../components/tag-form/tag-form.component';
import { TagListComponent } from '../components/tag-list/tag-list.component';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';

/**
 * Composant principal de gestion des tags
 * Permet de visualiser, créer, modifier et supprimer les tags du système
 */
@Component({
  selector: 'app-tags-manager',
  templateUrl: './tags-manager.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, TagFormComponent, TagListComponent, RouterModule, MatTabsModule, MatIconModule]
})
export class TagsManagerComponent implements OnInit {
  groupedTags: { [key: string]: Tag[] } = {};
  // Tolérance: si l'export partagé n'est pas résolu au runtime, utiliser un fallback
  tagCategories: TagCategory[] = Array.isArray((TAG_CATEGORIES as any))
    ? ([...TAG_CATEGORIES] as unknown as TagCategory[])
    : ['objectif', 'travail_specifique', 'niveau', 'temps', 'format', 'theme_entrainement', 'phase_entrainement', 'public_seance', 'statut_seance', 'type_echauffement'] as TagCategory[];

  successMessage: string = '';
  errorMessage: string = '';
  editingTag: Tag | null = null;

  constructor(private tagService: TagService) {}

  ngOnInit(): void {
    // Initialiser toutes les catégories vides pour éviter undefined dans le template
    this.groupedTags = this.buildEmptyGroups();
    this.loadTags();
    this.tagService.tagsUpdated$.subscribe(() => {
      this.loadTags();
    });
  }

  loadTags(): void {
    this.tagService.getAllGrouped().subscribe({
      next: (data) => {
        // Fusionner les données reçues avec les catégories vides par défaut
        const base = this.buildEmptyGroups();
        this.groupedTags = { ...base, ...(data || {}) };
        this.resetMessages();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des tags:', err);
        this.errorMessage = 'Impossible de charger les tags.';
      }
    });
  }

  private buildEmptyGroups(): { [key: string]: Tag[] } {
    return this.tagCategories.reduce((acc: { [key: string]: Tag[] }, category: string) => {
      acc[category] = [];
      return acc;
    }, {});
  }

  onTagSaved(tag: Tag): void {
    this.successMessage = `Le tag '${tag.label}' a été sauvegardé.`;
    this.editingTag = null;
    this.loadTags(); // Recharger pour voir la modification
  }

  editTag(tag: Tag): void {
    this.editingTag = { ...tag };
    this.resetMessages();
  }

  deleteTag(tag: Tag): void {
    if (!tag.id) return;

    if (confirm(`Êtes-vous sûr de vouloir supprimer le tag '${tag.label}' ?`)) {
      this.tagService.deleteTag(tag.id).subscribe({
        next: () => {
          this.successMessage = 'Tag supprimé avec succès.';
          this.loadTags(); // Recharger la liste
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Erreur lors de la suppression du tag.';
        }
      });
    }
  }

  cancelEdit(): void {
    this.editingTag = null;
    this.resetMessages();
  }

  resetMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  getCategoryDisplayName(category: string): string {
    return (TAG_CATEGORY_LABELS as { [key: string]: string })[category] || category;
  }

  // Helper pour obtenir les clés de l'objet groupedTags dans le template
  getGroupedTagKeys(): string[] {
    return Object.keys(this.groupedTags);
  }

  /**
   * Tous les tags candidats comme parent dans la hiérarchie Thème -> Phase -> Sous-phase,
   * transmis au formulaire pour peupler le sélecteur de parent.
   */
  get hierarchyTags(): Tag[] {
    return [
      ...(this.groupedTags['theme_entrainement'] || []),
      ...(this.groupedTags['phase_entrainement'] || [])
    ];
  }

  /**
   * Libellés des thèmes par ID, pour afficher "(dans « Le Cut »)" sous une phase racine.
   */
  get themeLabelsById(): { [id: string]: string } {
    return (this.groupedTags['theme_entrainement'] || []).reduce((acc: { [id: string]: string }, t) => {
      if (t.id) acc[t.id] = t.label;
      return acc;
    }, {});
  }
}