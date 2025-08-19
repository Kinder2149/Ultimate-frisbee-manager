import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import { Tag } from '../../services/tag-recommendation.service';

@Component({
  selector: 'app-tag-filter',
  templateUrl: './tag-filter.component.html',
  styleUrls: ['./tag-filter.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ]
})
export class TagFilterComponent implements OnInit {
  @Input() categories: string[] = ['objectif', 'element', 'niveau'];
  @Input() showSearch = true;
  @Input() showCategoryFilter = true;
  
  @Output() filterChange = new EventEmitter<{ search: string, categories: string[] }>();
  
  searchControl = new FormControl('');
  selectedCategories: string[] = [];
  
  constructor() { }

  ngOnInit(): void {
    // S'abonner aux changements de la recherche avec un debounce
    this.searchControl.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(value => {
      this.emitFilterChange();
    });
    
    // Par défaut, sélectionner toutes les catégories
    this.selectedCategories = [...this.categories];
  }
  
  /**
   * Bascule la sélection d'une catégorie
   */
  toggleCategory(category: string): void {
    const index = this.selectedCategories.indexOf(category);
    if (index === -1) {
      this.selectedCategories.push(category);
    } else {
      this.selectedCategories.splice(index, 1);
    }
    this.emitFilterChange();
  }
  
  /**
   * Vérifie si une catégorie est sélectionnée
   */
  isCategorySelected(category: string): boolean {
    return this.selectedCategories.includes(category);
  }
  
  /**
   * Réinitialise les filtres
   */
  resetFilters(): void {
    this.searchControl.setValue('');
    this.selectedCategories = [...this.categories];
    this.emitFilterChange();
  }
  
  /**
   * Émet l'événement de changement de filtre
   */
  private emitFilterChange(): void {
    this.filterChange.emit({
      search: this.searchControl.value || '',
      categories: this.selectedCategories
    });
  }
  
  /**
   * Applique un filtre sur un tableau de tags
   */
  filterTags(tags: Tag[]): Tag[] {
    if (!tags) return [];
    
    // Filtrer par catégorie
    let filtered = tags.filter(tag => 
      this.selectedCategories.includes(tag.category)
    );
    
    // Filtrer par recherche
    const search = (this.searchControl.value || '').toLowerCase();
    if (search) {
      filtered = filtered.filter(tag => 
        tag.label.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  }
}
