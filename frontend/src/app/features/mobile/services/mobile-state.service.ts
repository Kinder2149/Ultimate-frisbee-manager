import { Injectable, signal, computed, Signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ContentItem, CategoryType, SortOrder } from '../models/content-item.model';
import { Tag } from '../../../core/models/tag.model';
import { MobileDataService } from './mobile-data.service';
import { MobileFiltersService } from './mobile-filters.service';

/**
 * Service de gestion d'état centralisé pour la vue mobile.
 * Utilise Angular Signals pour une réactivité optimale.
 * 
 * Responsabilités :
 * - Gérer l'état global de la vue mobile (items, filtres, recherche, tri)
 * - Exposer des Signals en lecture seule pour les composants
 * - Fournir des méthodes pour modifier l'état
 * - Calculer automatiquement les items filtrés
 */
@Injectable({
  providedIn: 'root'
})
export class MobileStateService {
  // État privé (WritableSignals)
  private _items = signal<ContentItem[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _activeCategory = signal<CategoryType>('all');
  private _searchQuery = signal<string>('');
  private _sortOrder = signal<SortOrder>('recent');
  private _selectedTags = signal<Tag[]>([]);
  private _terrainMode = signal<boolean>(false);

  // Signals publics en lecture seule
  readonly items: Signal<ContentItem[]> = this._items.asReadonly();
  readonly loading: Signal<boolean> = this._loading.asReadonly();
  readonly error: Signal<string | null> = this._error.asReadonly();
  readonly activeCategory: Signal<CategoryType> = this._activeCategory.asReadonly();
  readonly searchQuery: Signal<string> = this._searchQuery.asReadonly();
  readonly sortOrder: Signal<SortOrder> = this._sortOrder.asReadonly();
  readonly selectedTags: Signal<Tag[]> = this._selectedTags.asReadonly();
  readonly terrainMode: Signal<boolean> = this._terrainMode.asReadonly();

  // Signal calculé : items filtrés
  readonly filteredItems: Signal<ContentItem[]> = computed(() => {
    const items = this._items();
    const category = this._activeCategory();
    const query = this._searchQuery();
    const tags = this._selectedTags();
    const order = this._sortOrder();

    return this.filtersService.applyAllFilters(items, {
      category,
      searchQuery: query,
      selectedTags: tags,
      sortOrder: order
    });
  });

  // Signal calculé : nombre d'items par catégorie
  readonly categoryCount: Signal<Record<CategoryType, number>> = computed(() => {
    const items = this._items();
    return this.calculateCategoryCount(items);
  });

  constructor(
    private dataService: MobileDataService,
    private filtersService: MobileFiltersService
  ) {}

  /**
   * Charge tous les contenus depuis le MobileDataService.
   * @param forceRefresh Force le rechargement depuis le serveur
   */
  loadAllContent(forceRefresh = false): void {
    this._loading.set(true);
    this._error.set(null);

    this.dataService.getAllContent({ forceRefresh }).subscribe({
      next: (items: ContentItem[]) => {
        this._items.set(items);
        this._loading.set(false);
      },
      error: (err: unknown) => {
        console.error('[MobileStateService] Erreur chargement:', err);
        this._error.set('Erreur lors du chargement des données');
        this._loading.set(false);
      }
    });
  }

  /**
   * Recharge un item spécifique après modification.
   * @param type Type de contenu
   * @param id ID du contenu
   */
  reloadItem(type: ContentItem['type'], id: string): void {
    this.dataService.getContentById(type, id, { forceRefresh: true }).subscribe({
      next: (updatedItem: ContentItem) => {
        const currentItems = this._items();
        const index = currentItems.findIndex(item => item.id === id && item.type === type);
        
        if (index !== -1) {
          const newItems = [...currentItems];
          newItems[index] = updatedItem;
          this._items.set(newItems);
        }
      },
      error: (err: unknown) => {
        console.error('[MobileStateService] Erreur rechargement item:', err);
      }
    });
  }

  /**
   * Supprime un item de l'état local (après suppression réussie).
   * @param id ID de l'item
   */
  removeItem(id: string): void {
    const currentItems = this._items();
    this._items.set(currentItems.filter(item => item.id !== id));
  }

  /**
   * Ajoute un item à l'état local (après duplication réussie).
   * @param item Nouvel item
   */
  addItem(item: ContentItem): void {
    const currentItems = this._items();
    this._items.set([item, ...currentItems]);
  }

  /**
   * Change la catégorie active.
   * @param category Nouvelle catégorie
   */
  setCategory(category: CategoryType): void {
    this._activeCategory.set(category);
  }

  /**
   * Change la requête de recherche.
   * @param query Nouvelle requête
   */
  setSearchQuery(query: string): void {
    this._searchQuery.set(query);
  }

  /**
   * Change l'ordre de tri.
   * @param order Nouvel ordre
   */
  setSortOrder(order: SortOrder): void {
    this._sortOrder.set(order);
  }

  /**
   * Ajoute un tag aux filtres.
   * @param tag Tag à ajouter
   */
  addTagFilter(tag: Tag): void {
    const currentTags = this._selectedTags();
    if (!currentTags.find(t => t.id === tag.id)) {
      this._selectedTags.set([...currentTags, tag]);
    }
  }

  /**
   * Retire un tag des filtres.
   * @param tagId ID du tag à retirer
   */
  removeTagFilter(tagId: string): void {
    const currentTags = this._selectedTags();
    this._selectedTags.set(currentTags.filter(t => t.id !== tagId));
  }

  /**
   * Réinitialise tous les filtres de tags.
   */
  clearTagFilters(): void {
    this._selectedTags.set([]);
  }

  /**
   * Toggle le mode terrain.
   */
  toggleTerrainMode(): void {
    this._terrainMode.set(!this._terrainMode());
  }

  /**
   * Active ou désactive le mode terrain.
   * @param enabled État du mode terrain
   */
  setTerrainMode(enabled: boolean): void {
    this._terrainMode.set(enabled);
  }

  /**
   * Réinitialise tous les filtres (catégorie, recherche, tags).
   */
  resetFilters(): void {
    this._activeCategory.set('all');
    this._searchQuery.set('');
    this._selectedTags.set([]);
  }

  /**
   * Calcule le nombre d'items par catégorie.
   */
  private calculateCategoryCount(items: ContentItem[]): Record<CategoryType, number> {
    const counts: Record<CategoryType, number> = {
      all: items.length,
      exercice: 0,
      entrainement: 0,
      echauffement: 0,
      situation: 0
    };

    items.forEach(item => {
      if (item.type in counts) {
        counts[item.type]++;
      }
    });

    return counts;
  }
}
