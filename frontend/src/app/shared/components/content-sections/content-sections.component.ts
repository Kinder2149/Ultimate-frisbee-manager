import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ContentSection, ContentItem } from '../../../core/models/mobile-content.model';
import { MobileContentCardComponent } from '../mobile-content-card/mobile-content-card.component';

/**
 * Composant d'affichage des sections dynamiques (Netflix-like)
 * Gère les carrousels et grilles de contenu
 */
@Component({
  selector: 'app-content-sections',
  standalone: true,
  imports: [
    CommonModule, 
    MatButtonModule, 
    MatIconModule, 
    MatProgressSpinnerModule,
    MobileContentCardComponent
  ],
  templateUrl: './content-sections.component.html',
  styleUrls: ['./content-sections.component.scss']
})
export class ContentSectionsComponent {
  @Input() sections: ContentSection[] = [];
  @Input() isLoading: boolean = false;
  @Input() error: string | null = null;
  
  @Output() itemClick = new EventEmitter<ContentItem>();
  @Output() seeAll = new EventEmitter<ContentSection>();
  @Output() favoriteToggle = new EventEmitter<ContentItem>();

  onItemClick(item: ContentItem): void {
    this.itemClick.emit(item);
  }

  onSeeAll(section: ContentSection): void {
    this.seeAll.emit(section);
  }

  onFavoriteToggle(item: ContentItem): void {
    this.favoriteToggle.emit(item);
  }

  hasSeeAll(section: ContentSection): boolean {
    return section.totalCount > section.items.length;
  }
}
