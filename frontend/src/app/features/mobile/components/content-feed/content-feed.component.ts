import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { ContentItem } from '../../models/content-item.model';
import { ExerciceCardComponent } from '../../../exercices/components/exercice-card.component';
import { DuplicateButtonComponent } from '../../../../shared/components/duplicate-button/duplicate-button.component';
import { RichTextViewComponent } from '../../../../shared/components/rich-text-view/rich-text-view.component';

@Component({
  selector: 'app-content-feed',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule,
    ExerciceCardComponent,
    DuplicateButtonComponent,
    RichTextViewComponent
  ],
  templateUrl: './content-feed.component.html',
  styleUrls: ['./content-feed.component.scss']
})
export class ContentFeedComponent {
  @Input() items: ContentItem[] = [];
  @Input() loading = false;
  @Input() error: string | null = null;

  @Output() itemView = new EventEmitter<ContentItem>();
  @Output() itemEdit = new EventEmitter<ContentItem>();
  @Output() itemDuplicate = new EventEmitter<ContentItem>();
  @Output() itemDelete = new EventEmitter<ContentItem>();

  duplicatingIds = new Set<string>();

  onView(item: ContentItem, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.itemView.emit(item);
  }

  onEdit(item: ContentItem, event: Event): void {
    event.stopPropagation();
    this.itemEdit.emit(item);
  }

  onDuplicate(item: ContentItem, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.duplicatingIds.add(item.id);
    this.itemDuplicate.emit(item);
  }

  onDuplicateById(entityId: string, item: ContentItem): void {
    this.duplicatingIds.add(item.id);
    this.itemDuplicate.emit(item);
  }

  onDeleteExercice(exerciceId: string): void {
    const item = this.items.find(i => i.id === exerciceId);
    if (item) {
      this.itemDelete.emit(item);
    }
  }

  onDuplicateExercice(exercice: any): void {
    const item = this.items.find(i => i.id === exercice.id);
    if (item) {
      this.duplicatingIds.add(item.id);
      this.itemDuplicate.emit(item);
    }
  }

  onDelete(item: ContentItem, event: Event): void {
    event.stopPropagation();
    this.itemDelete.emit(item);
  }

  isDuplicating(id: string): boolean {
    return this.duplicatingIds.has(id);
  }

  trackByItemId(index: number, item: ContentItem): string {
    return item.id;
  }

  formatDuree(duree: number | undefined): string {
    if (!duree) return '';
    return `${duree} min`;
  }

  getCategoryColor(type: ContentItem['type']): string {
    const colors: Record<ContentItem['type'], string> = {
      exercice: '#e74c3c',
      entrainement: '#3498db',
      echauffement: '#f39c12',
      situation: '#9b59b6'
    };
    return colors[type];
  }
}
