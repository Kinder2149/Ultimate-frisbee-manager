import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { ContentItem } from '../../../core/models/mobile-content.model';

/**
 * Carte de contenu réutilisable pour la vue mobile
 * Affichage compact optimisé pour carrousels et grilles
 */
@Component({
  selector: 'app-mobile-content-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatChipsModule],
  templateUrl: './mobile-content-card.component.html',
  styleUrls: ['./mobile-content-card.component.scss']
})
export class MobileContentCardComponent {
  @Input() item!: ContentItem;
  @Input() compact: boolean = false;
  
  @Output() cardClick = new EventEmitter<ContentItem>();
  @Output() favoriteClick = new EventEmitter<ContentItem>();

  onCardClick(): void {
    this.cardClick.emit(this.item);
  }

  onFavoriteClick(event: Event): void {
    event.stopPropagation();
    this.favoriteClick.emit(this.item);
  }

  get hasImage(): boolean {
    return !!this.item.metadata.imageUrl;
  }

  get hasDuration(): boolean {
    return !!this.item.metadata.duration;
  }

  get isRecent(): boolean {
    return this.item.metadata.isRecent === true;
  }

  get isFavorite(): boolean {
    return this.item.metadata.isFavorite === true;
  }
}
