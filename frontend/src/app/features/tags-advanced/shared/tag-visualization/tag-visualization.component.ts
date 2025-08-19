import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

// Angular Material
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';

import { Tag } from '../../services/tag-recommendation.service';

// Définition locale de l'interface TagSuggestion (anciennement dans pipeline-integration.service)
export interface TagSuggestion {
  id: string;
  label: string;
  category: string;
  confidence: number;
  source?: string;
  color?: string;
}

// Interface locale pour remplacer TagUsageStats supprimé
interface TagUsageStats {
  tagId: string;
  tagLabel: string;
  tagCategory: string;
  count: number;
  percentage: number;
  color?: string;
}

@Component({
  selector: 'app-tag-visualization',
  templateUrl: './tag-visualization.component.html',
  styleUrls: ['./tag-visualization.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatChipsModule,
    MatTooltipModule,
    MatBadgeModule,
    MatIconModule
  ]
})
export class TagVisualizationComponent {
  @Input() tags: (Tag | TagSuggestion | TagUsageStats)[] = [];
  @Input() showConfidence: boolean = false;
  @Input() showRemove: boolean = false;
  @Input() showCategory: boolean = false;
  @Input() interactive: boolean = false;
  @Input() selectable: boolean = false;
  @Input() showTooltip: boolean = true;
  @Input() groupByCategory: boolean = false;
  @Input() maxTagsToShow: number | null = null;
  
  @Output() tagClicked = new EventEmitter<Tag | TagSuggestion | TagUsageStats>();
  @Output() tagRemoved = new EventEmitter<Tag | TagSuggestion | TagUsageStats>();
  @Output() tagSelected = new EventEmitter<Tag | TagSuggestion | TagUsageStats>();

  selectedTagIds: Set<string> = new Set();
  
  /**
   * Vérifie si un objet est de type TagSuggestion
   */
  isTagSuggestion(tag: Tag | TagSuggestion | TagUsageStats): tag is TagSuggestion {
    return (tag as TagSuggestion).confidence !== undefined && (tag as TagSuggestion).source !== undefined;
  }
  
  /**
   * Vérifie si un objet est de type TagUsageStats
   */
  isTagUsageStats(tag: Tag | TagSuggestion | TagUsageStats): tag is TagUsageStats {
    return (tag as TagUsageStats).tagId !== undefined;
  }
  
  /**
   * Récupère les catégories uniques pour grouper les tags
   */
  get uniqueCategories(): string[] {
    if (!this.groupByCategory) {
      return [];
    }
    
    const categories = new Set<string>();
    this.tags.forEach(tag => categories.add(this.getCategory(tag)));
    return Array.from(categories);
  }
  
  /**
   * Récupère les tags pour une catégorie spécifique
   */
  getTagsForCategory(category: string): (Tag | TagSuggestion | TagUsageStats)[] {
    return this.tags.filter(tag => this.getCategory(tag) === category);
  }
  
  /**
   * Récupère la catégorie d'un tag
   */
  getCategory(tag: Tag | TagSuggestion | TagUsageStats): string {
    if (this.isTagUsageStats(tag)) {
      return tag.tagCategory;
    } else if (this.isTagSuggestion(tag)) {
      return tag.category;
    }
    return tag.category;
  }
  
  /**
   * Récupère le libellé d'un tag
   */
  getLabel(tag: Tag | TagSuggestion | TagUsageStats): string {
    if (this.isTagUsageStats(tag)) {
      return tag.tagLabel;
    } else if (this.isTagSuggestion(tag)) {
      return tag.label;
    }
    return tag.label;
  }
  
  /**
   * Récupère la couleur d'un tag
   */
  getColor(tag: Tag | TagSuggestion | TagUsageStats): string {
    if (this.isTagUsageStats(tag)) {
      return tag.color || this.getCategoryColor(tag.tagCategory);
    } else if (this.isTagSuggestion(tag)) {
      return tag.color || this.getCategoryColor(tag.category);
    }
    return tag.color || this.getCategoryColor(tag.category);
  }
  
  /**
   * Récupère la confiance d'un tag suggestion
   */
  getConfidence(tag: Tag | TagSuggestion | TagUsageStats): number {
    if (this.isTagSuggestion(tag)) {
      return tag.confidence;
    } else if (this.isTagUsageStats(tag)) {
      // Pour les statistiques, utiliser le pourcentage comme indice de confiance
      return tag.percentage / 100;
    }
    return 1.0;
  }
  
  /**
   * Récupère la source d'un tag suggestion
   */
  getSource(tag: Tag | TagSuggestion | TagUsageStats): string {
    if (this.isTagSuggestion(tag)) {
      return tag.source || 'Non spécifiée';
    } else if (this.isTagUsageStats(tag)) {
      return 'Statistiques';
    }
    return 'Manuel';
  }
  
  /**
   * Récupère l'ID d'un tag
   */
  getId(tag: Tag | TagSuggestion | TagUsageStats): string {
    if (this.isTagUsageStats(tag)) {
      return tag.tagId;
    } else if (this.isTagSuggestion(tag)) {
      return tag.id;
    }
    return tag.id;
  }
  
  /**
   * Formatte le pourcentage de confiance
   */
  formatConfidence(confidence: number): string {
    return Math.round(confidence * 100) + '%';
  }
  
  /**
   * Récupère la couleur correspondant à une catégorie
   */
  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'objectif': '#4caf50',
      'element': '#2196f3',
      'variable': '#ff9800',
      'niveau': '#9c27b0'
    };
    
    return colors[category.toLowerCase()] || '#9e9e9e';
  }
  
  /**
   * Gère le clic sur un tag
   */
  onTagClick(tag: Tag | TagSuggestion | TagUsageStats): void {
    if (this.interactive) {
      this.tagClicked.emit(tag);
    }
  }
  
  /**
   * Gère la suppression d'un tag
   */
  onTagRemove(event: Event, tag: Tag | TagSuggestion | TagUsageStats): void {
    event.stopPropagation();
    this.tagRemoved.emit(tag);
  }
  
  /**
   * Gère la sélection d'un tag
   */
  onTagSelect(tag: Tag | TagSuggestion | TagUsageStats): void {
    if (!this.selectable) return;
    
    const id = this.getId(tag);
    if (this.selectedTagIds.has(id)) {
      this.selectedTagIds.delete(id);
    } else {
      this.selectedTagIds.add(id);
    }
    
    this.tagSelected.emit(tag);
  }
  
  /**
   * Vérifie si un tag est sélectionné
   */
  isSelected(tag: Tag | TagSuggestion | TagUsageStats): boolean {
    return this.selectedTagIds.has(this.getId(tag));
  }
  
  /**
   * Récupère le texte du tooltip pour un tag
   */
  getTooltipText(tag: Tag | TagSuggestion | TagUsageStats): string {
    if (this.isTagUsageStats(tag)) {
      return `${tag.tagLabel} (${tag.tagCategory})
Utilisations: ${tag.count} (${tag.percentage.toFixed(1)}%)`;
    } else if (this.isTagSuggestion(tag)) {
      return `${tag.label} (${tag.category})
Confiance: ${this.formatConfidence(tag.confidence)}
Source: ${tag.source}`;
    }
    return `${tag.label} (${tag.category})`;
  }
  
  /**
   * Récupère les tags à afficher avec limitation
   */
  get displayedTags(): (Tag | TagSuggestion | TagUsageStats)[] {
    if (!this.maxTagsToShow) {
      return this.tags;
    }
    
    return this.tags.slice(0, this.maxTagsToShow);
  }
  
  /**
   * Vérifie s'il y a des tags cachés
   */
  get hasHiddenTags(): boolean {
    return this.maxTagsToShow !== null && this.tags.length > this.maxTagsToShow;
  }
  
  /**
   * Récupère le nombre de tags cachés
   */
  get hiddenTagsCount(): number {
    if (!this.maxTagsToShow) {
      return 0;
    }
    
    return Math.max(0, this.tags.length - this.maxTagsToShow);
  }
}
