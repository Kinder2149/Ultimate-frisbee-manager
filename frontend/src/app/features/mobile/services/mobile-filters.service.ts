import { Injectable } from '@angular/core';
import { ContentItem, CategoryType, SortOrder } from '../models/content-item.model';
import { Tag } from '../../../core/models/tag.model';

/**
 * État des filtres pour l'application de tous les filtres.
 */
export interface FilterState {
  category: CategoryType;
  searchQuery: string;
  selectedTags: Tag[];
  sortOrder: SortOrder;
}

/**
 * Service de logique de filtrage pour la vue mobile.
 * Toutes les méthodes sont pures (sans état interne).
 * 
 * Responsabilités :
 * - Filtrer par catégorie
 * - Filtrer par recherche textuelle
 * - Filtrer par tags
 * - Trier les items
 * - Appliquer tous les filtres en une passe
 */
@Injectable({
  providedIn: 'root'
})
export class MobileFiltersService {
  /**
   * Filtre les items par catégorie.
   * @param items Liste d'items
   * @param category Catégorie active
   * @returns Items filtrés
   */
  filterByCategory(items: ContentItem[], category: CategoryType): ContentItem[] {
    if (category === 'all') {
      return items;
    }
    return items.filter(item => item.type === category);
  }

  /**
   * Filtre les items par recherche textuelle.
   * Recherche dans le titre, la description et les labels de tags.
   * @param items Liste d'items
   * @param query Requête de recherche
   * @returns Items filtrés
   */
  filterBySearch(items: ContentItem[], query: string): ContentItem[] {
    if (!query || query.trim() === '') {
      return items;
    }

    const normalizedQuery = query.toLowerCase().trim();

    return items.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(normalizedQuery);
      const descriptionMatch = item.description?.toLowerCase().includes(normalizedQuery) || false;
      const tagsMatch = item.tags?.some(tag => 
        tag.label.toLowerCase().includes(normalizedQuery)
      ) || false;

      return titleMatch || descriptionMatch || tagsMatch;
    });
  }

  /**
   * Filtre les items par tags sélectionnés.
   * Un item doit avoir AU MOINS UN des tags sélectionnés (OR logique).
   * @param items Liste d'items
   * @param selectedTags Tags sélectionnés
   * @returns Items filtrés
   */
  filterByTags(items: ContentItem[], selectedTags: Tag[]): ContentItem[] {
    if (!selectedTags || selectedTags.length === 0) {
      return items;
    }

    const selectedTagIds = new Set(selectedTags.filter(tag => tag.id).map(tag => tag.id!));

    return items.filter(item => {
      if (!item.tags || item.tags.length === 0) {
        return false;
      }
      return item.tags.some(tag => tag.id && selectedTagIds.has(tag.id));
    });
  }

  /**
   * Trie les items selon l'ordre spécifié.
   * @param items Liste d'items
   * @param order Ordre de tri
   * @returns Items triés
   */
  sortItems(items: ContentItem[], order: SortOrder): ContentItem[] {
    const sorted = [...items];

    sorted.sort((a, b) => {
      const dateA = a.createdAt.getTime();
      const dateB = b.createdAt.getTime();

      if (order === 'recent') {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });

    return sorted;
  }

  /**
   * Applique tous les filtres en une seule passe.
   * Ordre d'application : catégorie → tags → recherche → tri.
   * @param items Liste d'items
   * @param filters État des filtres
   * @returns Items filtrés et triés
   */
  applyAllFilters(items: ContentItem[], filters: FilterState): ContentItem[] {
    let filtered = items;

    filtered = this.filterByCategory(filtered, filters.category);
    filtered = this.filterByTags(filtered, filters.selectedTags);
    filtered = this.filterBySearch(filtered, filters.searchQuery);
    filtered = this.sortItems(filtered, filters.sortOrder);

    return filtered;
  }

  /**
   * Extrait tous les tags uniques présents dans une liste d'items.
   * Utile pour construire une liste de tags disponibles pour le filtrage.
   * @param items Liste d'items
   * @returns Liste de tags uniques
   */
  extractUniqueTags(items: ContentItem[]): Tag[] {
    const tagMap = new Map<string, Tag>();

    items.forEach(item => {
      if (item.tags) {
        item.tags.forEach(tag => {
          if (tag.id && !tagMap.has(tag.id)) {
            tagMap.set(tag.id, tag);
          }
        });
      }
    });

    return Array.from(tagMap.values());
  }

  /**
   * Compte le nombre d'items par tag.
   * Utile pour afficher le nombre d'items associés à chaque tag.
   * @param items Liste d'items
   * @returns Map<tagId, count>
   */
  countItemsByTag(items: ContentItem[]): Map<string, number> {
    const counts = new Map<string, number>();

    items.forEach(item => {
      if (item.tags) {
        item.tags.forEach(tag => {
          if (tag.id) {
            const current = counts.get(tag.id) || 0;
            counts.set(tag.id, current + 1);
          }
        });
      }
    });

    return counts;
  }
}
