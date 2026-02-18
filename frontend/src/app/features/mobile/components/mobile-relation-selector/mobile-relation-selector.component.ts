import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';

export interface RelationItem {
  id: string;
  title: string;
  duration?: number;
  imageUrl?: string;
  selected?: boolean;
  order?: number;
}

@Component({
  selector: 'app-mobile-relation-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatListModule
  ],
  template: `
    <div class="mobile-relation-selector">
      <mat-form-field class="search-field" appearance="outline">
        <mat-label>Rechercher</mat-label>
        <input matInput [(ngModel)]="searchQuery" (ngModelChange)="onSearchChange()">
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>

      <div class="selected-section" *ngIf="selectedItems.length > 0">
        <h3>Sélectionnés ({{ selectedItems.length }})</h3>
        <div 
          cdkDropList 
          class="selected-list"
          (cdkDropListDropped)="onDrop($event)"
        >
          <div 
            *ngFor="let item of selectedItems; let i = index"
            cdkDrag
            class="selected-item"
          >
            <div class="drag-handle" cdkDragHandle>
              <mat-icon>drag_indicator</mat-icon>
            </div>
            <div class="item-info">
              <span class="item-order">{{ i + 1 }}.</span>
              <span class="item-title">{{ item.title }}</span>
              <span class="item-duration" *ngIf="item.duration">{{ item.duration }} min</span>
            </div>
            <button 
              mat-icon-button 
              (click)="onRemoveItem(item)"
              class="remove-button"
            >
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </div>
      </div>

      <div class="available-section">
        <h3>Disponibles ({{ filteredItems.length }})</h3>
        <div class="available-list">
          <div 
            *ngFor="let item of filteredItems"
            class="available-item"
            [class.selected]="isSelected(item)"
            (click)="onToggleItem(item)"
          >
            <mat-checkbox 
              [checked]="isSelected(item)"
              (click)="$event.stopPropagation()"
              (change)="onToggleItem(item)"
            ></mat-checkbox>
            <div class="item-content">
              <img 
                *ngIf="item.imageUrl" 
                [src]="item.imageUrl" 
                [alt]="item.title"
                class="item-image"
              >
              <div class="item-details">
                <span class="item-title">{{ item.title }}</span>
                <span class="item-duration" *ngIf="item.duration">{{ item.duration }} min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mobile-relation-selector {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .search-field {
      width: 100%;
    }

    .selected-section,
    .available-section {
      h3 {
        margin: 0 0 12px 0;
        font-size: 16px;
        font-weight: 500;
        color: #333;
      }
    }

    .selected-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-height: 60px;
      padding: 8px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .selected-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      cursor: move;
    }

    .drag-handle {
      color: #999;
      cursor: grab;
    }

    .drag-handle:active {
      cursor: grabbing;
    }

    .item-info {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .item-order {
      font-weight: 600;
      color: #666;
      min-width: 24px;
    }

    .item-title {
      flex: 1;
      font-size: 14px;
    }

    .item-duration {
      font-size: 12px;
      color: #666;
      padding: 2px 8px;
      background: #e3f2fd;
      border-radius: 12px;
    }

    .remove-button {
      color: #f44336;
    }

    .available-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 400px;
      overflow-y: auto;
    }

    .available-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .available-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    }

    .available-item.selected {
      background: #e8f5e9;
      border: 2px solid #4caf50;
    }

    .item-content {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .item-image {
      width: 48px;
      height: 48px;
      object-fit: cover;
      border-radius: 4px;
    }

    .item-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .cdk-drag-preview {
      box-shadow: 0 5px 15px rgba(0,0,0,0.3);
      opacity: 0.8;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileRelationSelectorComponent implements OnInit {
  @Input() availableItems: RelationItem[] = [];
  @Input() selectedItems: RelationItem[] = [];
  
  @Output() selectionChange = new EventEmitter<RelationItem[]>();

  searchQuery = '';
  filteredItems: RelationItem[] = [];

  ngOnInit(): void {
    this.filteredItems = [...this.availableItems];
  }

  onSearchChange(): void {
    const query = this.searchQuery.toLowerCase().trim();
    
    if (!query) {
      this.filteredItems = [...this.availableItems];
      return;
    }

    this.filteredItems = this.availableItems.filter(item =>
      item.title.toLowerCase().includes(query)
    );
  }

  onToggleItem(item: RelationItem): void {
    const index = this.selectedItems.findIndex(i => i.id === item.id);
    
    if (index > -1) {
      const updated = [...this.selectedItems];
      updated.splice(index, 1);
      this.selectedItems = updated;
    } else {
      this.selectedItems = [...this.selectedItems, { ...item, order: this.selectedItems.length }];
    }
    
    this.selectionChange.emit(this.selectedItems);
  }

  onRemoveItem(item: RelationItem): void {
    this.selectedItems = this.selectedItems.filter(i => i.id !== item.id);
    this.selectionChange.emit(this.selectedItems);
  }

  isSelected(item: RelationItem): boolean {
    return this.selectedItems.some(i => i.id === item.id);
  }

  onDrop(event: CdkDragDrop<RelationItem[]>): void {
    const items = [...this.selectedItems];
    moveItemInArray(items, event.previousIndex, event.currentIndex);
    this.selectedItems = items.map((item, index) => ({ ...item, order: index }));
    this.selectionChange.emit(this.selectedItems);
  }
}
