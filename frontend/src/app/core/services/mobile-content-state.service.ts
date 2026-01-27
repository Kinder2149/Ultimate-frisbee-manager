import { Injectable, signal, computed } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest, switchMap, tap, catchError, of } from 'rxjs';
import { MobileContentService } from './mobile-content.service';
import {
  MobileContentState,
  ContentTypeId,
  ContentSection,
  Category,
  Filter,
  ContentParams
} from '../models/mobile-content.model';

/**
 * Service de gestion d'état global pour la vue mobile
 * Utilise Angular Signals pour la réactivité
 */
@Injectable({
  providedIn: 'root'
})
export class MobileContentStateService {
  private readonly initialState: MobileContentState = {
    activeContentType: 'exercices',
    activeCategory: null,
    activeFilters: {},
    searchTerm: '',
    sections: [],
    availableCategories: [],
    availableFilters: [],
    isLoading: false,
    error: null
  };

  private stateSignal = signal<MobileContentState>(this.initialState);
  
  readonly state = this.stateSignal.asReadonly();
  
  readonly activeContentType = computed(() => this.state().activeContentType);
  readonly activeCategory = computed(() => this.state().activeCategory);
  readonly activeFilters = computed(() => this.state().activeFilters);
  readonly searchTerm = computed(() => this.state().searchTerm);
  readonly sections = computed(() => this.state().sections);
  readonly availableCategories = computed(() => this.state().availableCategories);
  readonly availableFilters = computed(() => this.state().availableFilters);
  readonly isLoading = computed(() => this.state().isLoading);
  readonly error = computed(() => this.state().error);
  
  readonly activeFiltersCount = computed(() => {
    return Object.keys(this.state().activeFilters).length;
  });

  constructor(private mobileContentService: MobileContentService) {}

  /**
   * Initialise la vue mobile avec la configuration
   */
  initialize(): Observable<void> {
    this.updateState({ isLoading: true, error: null });

    return this.mobileContentService.getContentConfig().pipe(
      tap(config => {
        if (config.availableContentTypes.length > 0) {
          const firstType = config.availableContentTypes[0];
          this.updateState({
            activeContentType: firstType.id,
            availableCategories: firstType.categories,
            isLoading: false
          });
          
          this.loadContentSections();
        }
      }),
      catchError(error => {
        this.updateState({ 
          isLoading: false, 
          error: 'Erreur lors du chargement de la configuration' 
        });
        return of(void 0);
      }),
      switchMap(() => of(void 0))
    );
  }

  /**
   * Change le type de contenu actif
   */
  setContentType(contentType: ContentTypeId): void {
    if (this.state().activeContentType === contentType) {
      return;
    }

    this.updateState({
      activeContentType: contentType,
      activeCategory: null,
      activeFilters: {},
      searchTerm: '',
      sections: []
    });

    this.loadCategoriesAndFilters();
    this.loadContentSections();
  }

  /**
   * Change la catégorie active
   */
  setCategory(categoryId: string | null): void {
    if (this.state().activeCategory === categoryId) {
      return;
    }

    this.updateState({
      activeCategory: categoryId,
      activeFilters: {},
      sections: []
    });

    this.loadFilters();
    this.loadContentSections();
  }

  /**
   * Toggle un filtre
   */
  toggleFilter(filterId: string, value: string): void {
    const currentFilters = { ...this.state().activeFilters };
    const currentValue = currentFilters[filterId];

    if (Array.isArray(currentValue)) {
      const index = currentValue.indexOf(value);
      if (index > -1) {
        currentValue.splice(index, 1);
        if (currentValue.length === 0) {
          delete currentFilters[filterId];
        }
      } else {
        currentValue.push(value);
      }
    } else {
      if (currentValue === value) {
        delete currentFilters[filterId];
      } else {
        currentFilters[filterId] = value;
      }
    }

    this.updateState({ activeFilters: currentFilters });
    this.loadContentSections();
  }

  /**
   * Set un filtre (remplace la valeur)
   */
  setFilter(filterId: string, value: string | string[]): void {
    const currentFilters = { ...this.state().activeFilters };
    currentFilters[filterId] = value;

    this.updateState({ activeFilters: currentFilters });
    this.loadContentSections();
  }

  /**
   * Réinitialise tous les filtres
   */
  clearFilters(): void {
    this.updateState({ activeFilters: {} });
    this.loadContentSections();
  }

  /**
   * Set le terme de recherche
   */
  setSearchTerm(term: string): void {
    this.updateState({ searchTerm: term });
    
    if (term.length >= 2 || term.length === 0) {
      this.loadContentSections();
    }
  }

  /**
   * Charge les catégories et filtres pour le type actif
   */
  private loadCategoriesAndFilters(): void {
    this.mobileContentService.getContentConfig().subscribe(config => {
      const contentType = config.availableContentTypes.find(
        ct => ct.id === this.state().activeContentType
      );

      if (contentType) {
        this.updateState({ availableCategories: contentType.categories });
      }

      this.loadFilters();
    });
  }

  /**
   * Charge les filtres disponibles
   */
  private loadFilters(): void {
    const { activeContentType, activeCategory } = this.state();

    this.mobileContentService.getFilters(activeContentType, activeCategory || undefined)
      .subscribe(filters => {
        this.updateState({ availableFilters: filters });
      });
  }

  /**
   * Charge les sections de contenu
   */
  private loadContentSections(): void {
    const { activeContentType, activeCategory, activeFilters, searchTerm } = this.state();

    this.updateState({ isLoading: true, error: null });

    const params: ContentParams = {
      contentType: activeContentType,
      category: activeCategory || undefined,
      filters: Object.keys(activeFilters).length > 0 ? activeFilters : undefined,
      searchTerm: searchTerm || undefined
    };

    this.mobileContentService.getContentSections(params).pipe(
      tap(sections => {
        this.updateState({ 
          sections, 
          isLoading: false 
        });
      }),
      catchError(error => {
        this.updateState({ 
          isLoading: false, 
          error: 'Erreur lors du chargement du contenu' 
        });
        return of([]);
      })
    ).subscribe();
  }

  /**
   * Met à jour l'état (helper)
   */
  private updateState(partial: Partial<MobileContentState>): void {
    this.stateSignal.update(state => ({ ...state, ...partial }));
  }
}
