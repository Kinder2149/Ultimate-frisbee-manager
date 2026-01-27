import { Injectable, signal } from '@angular/core';
import { ContentItem, FiltersState } from '../models/mobile-content.model';

/**
 * Service centralisé pour la logique de filtrage
 * Évite la duplication de code dans les composants
 */
@Injectable({
  providedIn: 'root'
})
export class FiltersService {
  private filtersStateSignal = signal<FiltersState>({
    activeFilters: {},
    showFavoritesOnly: false,
    showRecentsOnly: false
  });

  readonly filtersState = this.filtersStateSignal.asReadonly();

  /**
   * Applique tous les filtres actifs sur une liste d'items
   */
  applyFilters(items: ContentItem[], filters: FiltersState): ContentItem[] {
    let filtered = [...items];

    if (filters.showFavoritesOnly) {
      filtered = filtered.filter(item => item.metadata.isFavorite === true);
    }

    if (filters.showRecentsOnly) {
      filtered = filtered.filter(item => item.metadata.isRecent === true);
    }

    Object.entries(filters.activeFilters).forEach(([filterId, value]) => {
      filtered = this.applyFilter(filtered, filterId, value);
    });

    return filtered;
  }

  /**
   * Applique un filtre spécifique
   */
  private applyFilter(items: ContentItem[], filterId: string, value: string | string[]): ContentItem[] {
    return items.filter(item => {
      const itemTags = item.metadata.tags?.map(t => t.id) || [];

      if (Array.isArray(value)) {
        return value.length === 0 || value.some(v => itemTags.includes(v));
      }

      return itemTags.includes(value);
    });
  }

  /**
   * Filtre par recherche textuelle
   */
  filterBySearch(items: ContentItem[], searchTerm: string): ContentItem[] {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return items;
    }

    const term = searchTerm.toLowerCase().trim();

    return items.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(term);
      const descriptionMatch = item.metadata.description?.toLowerCase().includes(term) || false;
      const tagsMatch = item.metadata.tags?.some(tag => 
        tag.label.toLowerCase().includes(term)
      ) || false;

      return titleMatch || descriptionMatch || tagsMatch;
    });
  }

  /**
   * Combine filtres et recherche
   */
  applyAllFilters(
    items: ContentItem[], 
    filters: FiltersState, 
    searchTerm?: string
  ): ContentItem[] {
    let filtered = this.applyFilters(items, filters);

    if (searchTerm) {
      filtered = this.filterBySearch(filtered, searchTerm);
    }

    return filtered;
  }

  /**
   * Vérifie si un filtre est actif
   */
  isFilterActive(filterId: string, value: string, filters: FiltersState): boolean {
    const filterValue = filters.activeFilters[filterId];

    if (Array.isArray(filterValue)) {
      return filterValue.includes(value);
    }

    return filterValue === value;
  }

  /**
   * Compte le nombre de filtres actifs
   */
  countActiveFilters(filters: FiltersState): number {
    let count = Object.keys(filters.activeFilters).length;

    if (filters.showFavoritesOnly) count++;
    if (filters.showRecentsOnly) count++;

    return count;
  }

  /**
   * Réinitialise l'état des filtres
   */
  resetFilters(): void {
    this.filtersStateSignal.set({
      activeFilters: {},
      showFavoritesOnly: false,
      showRecentsOnly: false
    });
  }

  /**
   * Toggle favori uniquement
   */
  toggleFavoritesFilter(): void {
    this.filtersStateSignal.update(state => ({
      ...state,
      showFavoritesOnly: !state.showFavoritesOnly
    }));
  }

  /**
   * Toggle récents uniquement
   */
  toggleRecentsFilter(): void {
    this.filtersStateSignal.update(state => ({
      ...state,
      showRecentsOnly: !state.showRecentsOnly
    }));
  }
}
