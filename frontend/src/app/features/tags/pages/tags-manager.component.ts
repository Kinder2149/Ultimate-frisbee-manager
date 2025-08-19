import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TagService } from '../../../core/services/tag.service';
import { Tag, TagCategory } from '../../../core/models/tag.model';
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
  styleUrls: ['./tags-manager.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, TagFormComponent, TagListComponent, RouterModule, MatTabsModule, MatIconModule]
})
export class TagsManagerComponent implements OnInit {
  // Tags groupés par catégorie
  tagsByCategory: { [key: string]: Tag[] } = {};
  
  // Catégories disponibles
  categories = Object.values(TagCategory);
  
  // Catégorie actuellement sélectionnée pour l'ajout d'un tag
  selectedCategory: TagCategory = TagCategory.OBJECTIF;
  
  // Messages de succès et d'erreur
  successMessage: string = '';
  errorMessage: string = '';
  
  // Tag sélectionné pour l'édition
  selectedTag: Tag | null = null;

  constructor(private tagService: TagService) { }

  ngOnInit(): void {
    this.loadAllTags();
  }

  /**
   * Charge tous les tags depuis l'API et les groupe par catégorie
   */
  loadAllTags(): void {
    this.tagService.getTags().subscribe({
      next: (tags) => {
        // Réinitialiser les tags par catégorie
        this.tagsByCategory = {};
        
        // Initialiser les tableaux pour chaque catégorie
        this.categories.forEach(category => {
          this.tagsByCategory[category] = [];
        });
        
        // Regrouper les tags par catégorie
        tags.forEach(tag => {
          if (this.tagsByCategory[tag.category]) {
            this.tagsByCategory[tag.category].push(tag);
          }
        });
        
        // Réinitialiser les messages
        this.resetMessages();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des tags:', err);
        this.errorMessage = 'Impossible de charger les tags. Veuillez réessayer.';
      }
    });
  }

  /**
   * Sélectionne un tag pour l'édition
   * @param tag Le tag à éditer
   */
  editTag(tag: Tag): void {
    this.selectedTag = { ...tag };
    this.resetMessages();
  }

  /**
   * Gère l'événement de sauvegarde d'un tag (ajout ou mise à jour)
   * @param tag Le tag à sauvegarder
   */
  onTagSaved(tag: Tag): void {
    this.loadAllTags();
    this.successMessage = `Tag "${tag.label}" sauvegardé avec succès !`;
    this.selectedTag = null;
  }

  /**
   * Supprime un tag après confirmation
   * @param tag Le tag à supprimer
   */
  deleteTag(tag: Tag): void {
    if (!tag.id) return;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer le tag "${tag.label}" ?`)) {
      this.tagService.deleteTag(tag.id).subscribe({
        next: () => {
          this.successMessage = `Tag "${tag.label}" supprimé avec succès !`;
          this.loadAllTags();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression du tag:', err);
          
          // Vérifier s'il s'agit d'une erreur de tag utilisé par des exercices
          if (err.status === 409) {
            this.errorMessage = `Impossible de supprimer ce tag car il est utilisé par ${err.error.exercicesCount} exercice(s).`;
          } else {
            this.errorMessage = 'Erreur lors de la suppression du tag. Veuillez réessayer.';
          }
        }
      });
    }
  }

  /**
   * Annule l'édition d'un tag
   */
  cancelEdit(): void {
    this.selectedTag = null;
    this.resetMessages();
  }

  /**
   * Réinitialise les messages de succès et d'erreur
   */
  resetMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  /**
   * Retourne le nom d'une catégorie pour l'affichage
   * @param category La catégorie
   * @returns Le nom formaté
   */
  getCategoryDisplayName(category: string): string {
    const displayNames: { [key: string]: string } = {
      'objectif': 'Objectifs',
      'travail_specifique': 'Travail Spécifique',
      'niveau': 'Niveaux',
      'temps': 'Temps',
      'format': 'Format',
      'theme_entrainement': 'Thèmes Entraînements'
    };
    
    return displayNames[category] || category;
  }
}