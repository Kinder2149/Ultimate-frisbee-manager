import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

/**
 * Interface pour les valeurs de type range
 */
export interface RangeValue {
  min?: number | null;
  max?: number | null;
}

/**
 * Options de filtre
 */
export interface FilterOption {
  /** Clé unique du filtre */
  key: string;
  /** Libellé du filtre */
  label: string;
  /** Valeur actuelle du filtre */
  value?: unknown | RangeValue;
  /** Valeurs possibles pour les filtres à choix multiples */
  options?: { value: unknown; label: string }[];
  /** Type de filtre */
  type: 'text' | 'select' | 'date' | 'boolean' | 'range';
  /** Si le filtre est actuellement actif */
  active?: boolean;
}

/**
 * Événement de recherche
 */
export interface SearchEvent {
  /** Terme de recherche */
  searchTerm: string;
  /** Filtres actifs */
  filters: { [key: string]: unknown };
}

/**
 * Composant réutilisable pour les formulaires de recherche et de filtrage
 */
@Component({
  selector: 'app-search-filter',
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class SearchFilterComponent {
  /** Placeholder pour le champ de recherche */
  @Input() searchPlaceholder: string = 'Rechercher...';
  
  /** Si le champ de recherche est visible */
  @Input() showSearch: boolean = true;
  
  /** Options de filtres disponibles */
  @Input() filterOptions: FilterOption[] = [];
  
  /** Si les filtres sont initialement repliés */
  @Input() filtersCollapsed: boolean = true;
  
  /** Terme de recherche initial */
  @Input() set initialSearchTerm(value: string) {
    this.searchTerm = value || '';
  }
  
  /** Filtres initiaux */
  @Input() set initialFilters(filters: { [key: string]: unknown }) {
    if (filters) {
      this.filters = { ...filters };
      this.updateActiveFilters();
    }
  }
  
  /** Événement émis lors de la recherche/filtrage */
  @Output() search = new EventEmitter<SearchEvent>();
  
  /** Événement émis lors de la réinitialisation des filtres */
  @Output() reset = new EventEmitter<void>();
  
  /** Terme de recherche courant */
  searchTerm: string = '';
  
  /** Valeurs des filtres */
  filters: { [key: string]: unknown } = {};
  
  /** Si les filtres sont affichés */
  showFilters: boolean = false;
  
  /** Délai pour la recherche automatique */
  private searchTimeout: NodeJS.Timeout | null = null;
  
  constructor() {}
  
  /**
   * Gère le changement du terme de recherche
   */
  onSearchChange(): void {
    this.triggerSearch();
  }
  
  /**
   * Gère le changement d'un filtre
   * @param key Clé du filtre
   * @param value Nouvelle valeur
   */
  onFilterChange(key: string, value: unknown): void {
    this.filters[key] = value;
    this.updateActiveFilters();
    this.triggerSearch();
  }
  
  /**
   * Déclenche l'événement de recherche après un délai
   */
  private triggerSearch(): void {
    // Annuler le timeout précédent
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    // Définir un nouveau timeout pour éviter trop de requêtes
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.search.emit({
        searchTerm: this.searchTerm,
        filters: this.filters
      });
    }, 300);
  }
  
  /**
   * Réinitialise tous les filtres et la recherche
   */
  resetAll(): void {
    this.searchTerm = '';
    this.filters = {};
    this.updateActiveFilters();
    this.reset.emit();
    this.search.emit({
      searchTerm: '',
      filters: {}
    });
  }
  
  /**
   * Bascule l'affichage des filtres
   */
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }
  
  /**
   * Met à jour l'état actif des filtres
   */
  private updateActiveFilters(): void {
    this.filterOptions.forEach(option => {
      option.active = this.filters[option.key] !== undefined && 
                      this.filters[option.key] !== '' &&
                      this.filters[option.key] !== null;
      
      option.value = this.filters[option.key];
    });
  }
  
  /**
   * Vérifie si au moins un filtre est actif
   */
  get hasActiveFilters(): boolean {
    return this.filterOptions.some(option => option.active);
  }
  
  /**
   * Récupère la valeur d'un champ texte, select ou date depuis un événement
   * @param event Événement du DOM
   * @returns Valeur du champ
   */
  getInputValue(event: Event): string {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    return target?.value || '';
  }
  
  /**
   * Récupère l'état d'une case à cocher depuis un événement
   * @param event Événement du DOM
   * @returns État de la case (cochée ou non)
   */
  getCheckboxValue(event: Event): boolean {
    const target = event.target as HTMLInputElement;
    return target?.checked || false;
  }
  
  /**
   * Récupère la valeur d'un range (min ou max)
   * @param value Valeur du filtre
   * @param type Type de valeur ('min' ou 'max')
   * @returns Valeur formatée pour l'input
   */
  getRangeValue(value: unknown, type: 'min' | 'max'): string {
    if (!value || typeof value !== 'object') return '';
    const rangeValue = value as RangeValue;
    const val = rangeValue[type];
    return val !== null && val !== undefined ? val.toString() : '';
  }

  /**
   * Met à jour la valeur min d'un filtre de type range
   * @param event Événement du DOM
   * @param key Clé du filtre
   */
  updateRangeMin(event: Event, key: string): void {
    const minValue = this.getInputValue(event);
    const currentValue = this.filters[key] as RangeValue || {};
    
    this.onFilterChange(key, {
      min: minValue ? Number(minValue) : null,
      max: currentValue.max || null
    });
  }

  /**
   * Met à jour la valeur max d'un filtre de type range
   * @param event Événement du DOM
   * @param key Clé du filtre
   */
  updateRangeMax(event: Event, key: string): void {
    const maxValue = this.getInputValue(event);
    const currentValue = this.filters[key] as RangeValue || {};
    
    this.onFilterChange(key, {
      min: currentValue.min || null,
      max: maxValue ? Number(maxValue) : null
    });
  }
}
