import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Category } from '../../../core/models/mobile-content.model';

/**
 * Sous-navigation par catégories (chips horizontales)
 * Permet de filtrer le contenu par catégorie métier
 */
@Component({
  selector: 'app-content-categories',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatMenuModule],
  templateUrl: './content-categories.component.html',
  styleUrls: ['./content-categories.component.scss']
})
export class ContentCategoriesComponent {
  @Input() categories: Category[] = [];
  @Input() activeCategory: string | null = null;
  
  @Output() categoryChange = new EventEmitter<string>();

  onCategoryClick(categoryId: string): void {
    this.categoryChange.emit(categoryId);
  }

  isActive(categoryId: string): boolean {
    return this.activeCategory === categoryId;
  }
}
