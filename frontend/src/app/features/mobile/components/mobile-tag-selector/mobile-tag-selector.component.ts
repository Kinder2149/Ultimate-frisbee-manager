import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';

import { Tag } from '../../../../core/models/tag.model';

@Component({
  selector: 'app-mobile-tag-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatChipsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatExpansionModule
  ],
  template: `
    <div class="mobile-tag-selector">
      <mat-form-field class="search-field" appearance="outline">
        <mat-label>Rechercher un tag</mat-label>
        <input matInput [(ngModel)]="searchQuery" (ngModelChange)="onSearchChange()">
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>

      <div class="selected-tags" *ngIf="selectedTags.length > 0">
        <h3>Tags sélectionnés</h3>
        <mat-chip-set>
          <mat-chip 
            *ngFor="let tag of selectedTags"
            (removed)="onRemoveTag(tag)"
          >
            {{ tag.label }}
            <button matChipRemove>
              <mat-icon>cancel</mat-icon>
            </button>
          </mat-chip>
        </mat-chip-set>
      </div>

      <mat-accordion class="categories-accordion">
        <mat-expansion-panel 
          *ngFor="let category of filteredCategories"
          [expanded]="category.expanded"
        >
          <mat-expansion-panel-header>
            <mat-panel-title>
              {{ category.name }}
              <span class="tag-count">({{ category.tags.length }})</span>
            </mat-panel-title>
          </mat-expansion-panel-header>

          <div class="tags-list">
            <mat-chip-set>
              <mat-chip 
                *ngFor="let tag of category.tags"
                [class.selected]="isSelected(tag)"
                (click)="onToggleTag(tag, category.multiple)"
              >
                {{ tag.label }}
                <mat-icon *ngIf="isSelected(tag)">check</mat-icon>
              </mat-chip>
            </mat-chip-set>
          </div>
        </mat-expansion-panel>
      </mat-accordion>
    </div>
  `,
  styles: [`
    .mobile-tag-selector {
      padding: 16px;
    }

    .search-field {
      width: 100%;
      margin-bottom: 16px;
    }

    .selected-tags {
      margin-bottom: 24px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .selected-tags h3 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 500;
      color: #666;
    }

    .categories-accordion {
      display: block;
    }

    .tag-count {
      margin-left: 8px;
      color: #666;
      font-size: 12px;
    }

    .tags-list {
      padding: 8px 0;
    }

    mat-chip {
      cursor: pointer;
      margin: 4px;
    }

    mat-chip.selected {
      background-color: #3f51b5 !important;
      color: white !important;
    }

    mat-chip mat-icon {
      margin-left: 4px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileTagSelectorComponent implements OnInit {
  @Input() availableTags: Tag[] = [];
  @Input() selectedTags: Tag[] = [];
  @Input() categories: TagCategory[] = [];
  
  @Output() tagsChange = new EventEmitter<Tag[]>();

  searchQuery = '';
  filteredCategories: TagCategory[] = [];

  ngOnInit(): void {
    this.initializeCategories();
    this.filteredCategories = [...this.categories];
  }

  private initializeCategories(): void {
    if (this.categories.length === 0 && this.availableTags.length > 0) {
      this.categories = [{
        name: 'Tous les tags',
        tags: this.availableTags,
        multiple: true,
        expanded: true
      }];
    }
  }

  onSearchChange(): void {
    const query = this.searchQuery.toLowerCase().trim();
    
    if (!query) {
      this.filteredCategories = [...this.categories];
      return;
    }

    this.filteredCategories = this.categories
      .map(category => ({
        ...category,
        tags: category.tags.filter(tag => 
          tag.label.toLowerCase().includes(query)
        )
      }))
      .filter(category => category.tags.length > 0);
  }

  onToggleTag(tag: Tag, multiple: boolean): void {
    const index = this.selectedTags.findIndex(t => t.id === tag.id);
    
    if (index > -1) {
      const updated = [...this.selectedTags];
      updated.splice(index, 1);
      this.selectedTags = updated;
    } else {
      if (multiple) {
        this.selectedTags = [...this.selectedTags, tag];
      } else {
        const categoryTags = this.getCategoryTags(tag);
        const filtered = this.selectedTags.filter(t => 
          !categoryTags.some(ct => ct.id === t.id)
        );
        this.selectedTags = [...filtered, tag];
      }
    }
    
    this.tagsChange.emit(this.selectedTags);
  }

  onRemoveTag(tag: Tag): void {
    this.selectedTags = this.selectedTags.filter(t => t.id !== tag.id);
    this.tagsChange.emit(this.selectedTags);
  }

  isSelected(tag: Tag): boolean {
    return this.selectedTags.some(t => t.id === tag.id);
  }

  private getCategoryTags(tag: Tag): Tag[] {
    for (const category of this.categories) {
      if (category.tags.some(t => t.id === tag.id)) {
        return category.tags;
      }
    }
    return [];
  }
}

export interface TagCategory {
  name: string;
  tags: Tag[];
  multiple: boolean;
  expanded?: boolean;
}
