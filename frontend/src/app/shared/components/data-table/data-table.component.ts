import { Component, EventEmitter, Input, Output, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Configuration d'une colonne
 */
export interface ColumnConfig {
  /** Clé de la propriété à afficher */
  key: string;
  /** En-tête de la colonne */
  header: string;
  /** Largeur de la colonne (CSS) */
  width?: string;
  /** Si la colonne est triable */
  sortable?: boolean;
  /** Si la colonne est filtrée */
  filtered?: boolean;
  /** Fonction de formatage personnalisée */
  formatter?: (value: any, row: any) => string;
  /** Type de cellule */
  type?: 'text' | 'date' | 'number' | 'boolean' | 'tag' | 'actions' | 'custom' | 'custom-actions';
  /** Si la colonne doit être masquée sur petit écran */
  hideOnMobile?: boolean;
}

/**
 * Options de pagination
 */
export interface PaginationConfig {
  /** Page actuelle (commence à 1) */
  currentPage: number;
  /** Nombre d'éléments par page */
  pageSize: number;
  /** Nombre total d'éléments */
  totalItems: number;
  /** Options de taille de page */
  pageSizeOptions?: number[];
}

/**
 * Options de tri
 */
export interface SortConfig {
  /** Clé de la colonne de tri */
  key: string;
  /** Direction de tri */
  direction: 'asc' | 'desc';
}

/**
 * Événement de pagination
 */
export interface PageEvent {
  /** Page demandée */
  page: number;
  /** Taille de page demandée */
  pageSize: number;
}

/**
 * Événement de tri
 */
export interface SortEvent {
  /** Configuration du tri */
  sort: SortConfig;
}

/**
 * Composant réutilisable pour afficher des données tabulaires
 */
@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class DataTableComponent {
  /** Données à afficher */
  @Input() data: unknown[] = [];
  
  /** Configuration des colonnes */
  @Input() columns: ColumnConfig[] = [];
  
  /** Configuration de la pagination */
  @Input() pagination?: PaginationConfig;
  
  /** Configuration du tri */
  @Input() sort?: SortConfig;
  
  /** Si le tableau peut être trié */
  @Input() sortable: boolean = true;
  
  /** Si le tableau a des bordures */
  @Input() bordered: boolean = true;
  
  /** Si le tableau a des lignes colorées alternativement */
  @Input() striped: boolean = true;
  
  /** Si le tableau a un survol des lignes */
  @Input() hover: boolean = true;
  
  /** Si le tableau est compact */
  @Input() dense: boolean = false;
  
  /** Message à afficher si aucune donnée n'est disponible */
  @Input() noDataMessage: string = 'Aucune donnée disponible';
  
  /** Classes CSS supplémentaires */
  @Input() additionalClasses: string = '';
  
  /** Référence à l'objet Math pour l'utiliser dans le template */
  Math = Math;

  /** Événement émis lors du changement de page */
  @Output() pageChange = new EventEmitter<PageEvent>();
  
  /** Événement émis lors du changement de tri */
  @Output() sortChange = new EventEmitter<SortEvent>();
  
  /** Événement émis lors du clic sur une ligne */
  @Output() rowClick = new EventEmitter<unknown>();
  
  /** Événement émis lors du clic sur une action */
  @Output() action = new EventEmitter<{ type: 'view' | 'edit' | 'delete' | 'duplicate'; row: unknown }>();
  
  /** Template personnalisé pour les actions */
  @ContentChild('actionTemplate') actionTemplate: TemplateRef<{row: unknown}> | null = null;
  
  constructor() {}
  
  /**
   * Formatte une valeur en fonction de la configuration de la colonne
   * @param value Valeur à formater
   * @param column Configuration de la colonne
   * @param row Ligne complète
   * @returns Valeur formatée
   */
  formatValue(value: unknown, column: ColumnConfig, row: unknown): string {
    if (value === undefined || value === null) {
      return '';
    }
    
    // Utiliser le formateur personnalisé s'il existe
    if (column.formatter) {
      return column.formatter(value, row);
    }
    
    // Formater en fonction du type
    switch (column.type) {
      case 'date':
        return this.formatDate(value);
      case 'boolean':
        return value ? 'Oui' : 'Non';
      default:
        return String(value);
    }
  }
  
  /**
   * Formatte une date
   * @param date Date à formater
   * @returns Date formatée
   */
  private formatDate(date: unknown): string {
    if (!date) return '';
    
    // Convertir en objet Date si c'est une chaîne
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Vérifier si la date est valide
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return '';
    }
    
    // Formater la date au format français
    return dateObj.toLocaleDateString('fr-FR');
  }
  
  /**
   * Gère le clic sur une ligne
   * @param row Ligne cliquée
   * @param event Événement de clic
   */
  onRowClick(row: unknown, event: MouseEvent): void {
    // Ne pas déclencher si le clic vient d'un bouton d'action
    if ((event.target as HTMLElement).closest('.action-cell')) {
      return;
    }
    
    this.rowClick.emit(row);
  }
  
  /**
   * Gère le clic sur une action
   * @param type Type d'action
   * @param row Ligne concernée
   * @param event Événement de clic
   */
  onActionClick(type: 'view' | 'edit' | 'delete' | 'duplicate', row: unknown, event: MouseEvent): void {
    event.stopPropagation();
    this.action.emit({ type, row });
  }
  
  /**
   * Change la colonne et la direction de tri
   * @param column Colonne à trier
   */
  toggleSort(column: ColumnConfig): void {
    if (!this.sortable || !column.sortable) {
      return;
    }
    
    const newSort: SortConfig = {
      key: column.key,
      direction: 'asc'
    };
    
    // Si la même colonne est déjà triée, inverser la direction
    if (this.sort && this.sort.key === column.key) {
      newSort.direction = this.sort.direction === 'asc' ? 'desc' : 'asc';
    }
    
    this.sortChange.emit({ sort: newSort });
  }
  
  /**
   * Navigue vers une page spécifique
   * @param page Numéro de page
   */
  goToPage(page: number): void {
    if (!this.pagination) {
      return;
    }
    
    // Vérifier que la page est dans les limites
    const totalPages = Math.ceil(this.pagination.totalItems / this.pagination.pageSize);
    if (page < 1 || page > totalPages) {
      return;
    }
    
    this.pageChange.emit({
      page,
      pageSize: this.pagination.pageSize
    });
  }
  
  /**
   * Change la taille de la page
   * @param size Nouvelle taille
   */
  changePageSize(size: number): void {
    if (!this.pagination) {
      return;
    }
    
    this.pageChange.emit({
      page: 1, // Retourner à la première page
      pageSize: size
    });
  }
  
  /**
   * Récupère la valeur d'un élément select à partir d'un événement
   * @param event Événement DOM
   * @returns Valeur numérique
   */
  getSelectValue(event: Event): number {
    const target = event.target as HTMLSelectElement;
    return target?.value ? +target.value : 0;
  }
  
  /**
   * Récupère la valeur d'une propriété d'un objet
   */
  getRowValue(row: unknown, key: string): string {
    const obj = row as Record<string, unknown>;
    return obj[key]?.toString() || '';
  }

  /**
   * Calcule le nombre total de pages
   */
  getTotalPages(): number {
    if (!this.pagination) {
      return 1;
    }
    return Math.ceil(this.pagination.totalItems / this.pagination.pageSize);
  }

  /**
   * Calcule les numéros de page à afficher
   */
  get pageNumbers(): (number | string)[] {
    if (!this.pagination) {
      return [];
    }
    
    const totalPages = this.getTotalPages();
    
    // Si peu de pages, afficher toutes les pages
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Sinon, afficher la première page, la dernière page et quelques pages autour de la page actuelle
    const pages: (number | string)[] = [];
    const current = this.pagination.currentPage;
    
    pages.push(1);
    
    if (current > 3) {
      pages.push('...');
    }
    
    // Pages autour de la page actuelle
    for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) {
      pages.push(i);
    }
    
    if (current < totalPages - 2) {
      pages.push('...');
    }
    
    pages.push(totalPages);
    
    return pages;
  }
}
