import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { ContentItem } from '../../models/content-item.model';
import { MobileFeedCardComponent } from '../mobile-feed-card/mobile-feed-card.component';

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
    MobileFeedCardComponent
  ],
  templateUrl: './content-feed.component.html',
  styleUrls: ['./content-feed.component.scss']
})
export class ContentFeedComponent implements OnChanges {
  @Input() items: ContentItem[] = [];
  @Input() loading = false;
  @Input() error: string | null = null;

  @Output() itemView = new EventEmitter<ContentItem>();
  @Output() itemEdit = new EventEmitter<ContentItem>();
  @Output() itemDuplicate = new EventEmitter<ContentItem>();
  @Output() itemDelete = new EventEmitter<ContentItem>();

  duplicatingIds = new Set<string>();
  
  private readonly ITEMS_PER_PAGE = 20;
  private currentPage = 1;
  displayedItems: ContentItem[] = [];
  hasMore = false;
  loadingMore = false;

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

  onDelete(item: ContentItem, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.itemDelete.emit(item);
  }

  isDuplicating(id: string): boolean {
    return this.duplicatingIds.has(id);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) {
      this.currentPage = 1;
      this.updateDisplayedItems();
    }
  }

  private updateDisplayedItems(): void {
    const endIndex = this.currentPage * this.ITEMS_PER_PAGE;
    this.displayedItems = this.items.slice(0, endIndex);
    this.hasMore = endIndex < this.items.length;
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    if (this.loadingMore || !this.hasMore || this.loading) {
      return;
    }

    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.documentElement.scrollHeight - 300;

    if (scrollPosition >= threshold) {
      this.loadMore();
    }
  }

  loadMore(): void {
    if (this.loadingMore || !this.hasMore) {
      return;
    }

    this.loadingMore = true;
    
    setTimeout(() => {
      this.currentPage++;
      this.updateDisplayedItems();
      this.loadingMore = false;
    }, 300);
  }

  trackByItemId(index: number, item: ContentItem): string {
    return item.id;
  }

  formatDuree(duree: number | undefined): string {
    if (!duree) return '';
    return `${duree} min`;
  }

}
