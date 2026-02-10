import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { CategoryType, SortOrder } from '../../models/content-item.model';
import { Tag } from '../../../../core/models/tag.model';

interface CategoryConfig {
  type: CategoryType;
  label: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-mobile-filter-bar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule
  ],
  templateUrl: './mobile-filter-bar.component.html',
  styleUrls: ['./mobile-filter-bar.component.scss']
})
export class MobileFilterBarComponent {
  @Input() activeCategory: CategoryType = 'all';
  @Input() sortOrder: SortOrder = 'recent';
  @Input() categoryCount: Record<CategoryType, number> = {
    all: 0,
    exercice: 0,
    entrainement: 0,
    echauffement: 0,
    situation: 0
  };
  @Input() selectedTags: Tag[] = [];
  @Input() availableTags: Tag[] = [];

  @Output() categoryChange = new EventEmitter<CategoryType>();
  @Output() sortChange = new EventEmitter<SortOrder>();
  @Output() tagAdd = new EventEmitter<Tag>();
  @Output() tagRemove = new EventEmitter<string>();

  categories: CategoryConfig[] = [
    { type: 'all', label: 'Tout', icon: 'apps', color: '#2c3e50' },
    { type: 'exercice', label: 'Exercices', icon: 'fitness_center', color: '#e74c3c' },
    { type: 'entrainement', label: 'Entraînements', icon: 'sports', color: '#3498db' },
    { type: 'echauffement', label: 'Échauffements', icon: 'directions_run', color: '#FF9800' },
    { type: 'situation', label: 'Situations', icon: 'sports_soccer', color: '#4CAF50' }
  ];

  onCategoryClick(category: CategoryType): void {
    if (this.activeCategory !== category) {
      this.categoryChange.emit(category);
    }
  }

  onSortClick(): void {
    const newOrder: SortOrder = this.sortOrder === 'recent' ? 'old' : 'recent';
    this.sortChange.emit(newOrder);
  }

  getCategoryCount(type: CategoryType): number {
    return this.categoryCount[type] || 0;
  }

  get sortIcon(): string {
    return this.sortOrder === 'recent' ? 'arrow_downward' : 'arrow_upward';
  }

  get sortLabel(): string {
    return this.sortOrder === 'recent' ? 'Récent' : 'Ancien';
  }

  onTagRemove(tagId: string): void {
    this.tagRemove.emit(tagId);
  }

  isTagSelected(tag: Tag): boolean {
    return this.selectedTags.some(t => t.id === tag.id);
  }

  onTagClick(tag: Tag): void {
    if (this.isTagSelected(tag)) {
      if (tag.id) {
        this.tagRemove.emit(tag.id);
      }
    } else {
      this.tagAdd.emit(tag);
    }
  }
}
