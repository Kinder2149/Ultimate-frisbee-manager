import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ContentItem } from '../../models/content-item.model';

@Component({
  selector: 'app-mobile-feed-card',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './mobile-feed-card.component.html',
  styleUrls: ['./mobile-feed-card.component.scss']
})
export class MobileFeedCardComponent {
  @Input() item!: ContentItem;
  @Input() duplicating = false;

  @Output() cardClick = new EventEmitter<ContentItem>();
  @Output() viewClick = new EventEmitter<ContentItem>();
  @Output() duplicateClick = new EventEmitter<ContentItem>();
  @Output() deleteClick = new EventEmitter<ContentItem>();

  get typeIcon(): string {
    const icons: Record<ContentItem['type'], string> = {
      exercice: 'fitness_center',
      entrainement: 'sports',
      echauffement: 'whatshot',
      situation: 'flag'
    };
    return icons[this.item.type];
  }

  get typeLabel(): string {
    const labels: Record<ContentItem['type'], string> = {
      exercice: 'Exercice',
      entrainement: 'Entraînement',
      echauffement: 'Échauffement',
      situation: 'Situation'
    };
    return labels[this.item.type];
  }

  onCardClick(): void {
    this.cardClick.emit(this.item);
  }

  onViewClick(event: Event): void {
    event.stopPropagation();
    this.viewClick.emit(this.item);
  }

  onDuplicateClick(event: Event): void {
    event.stopPropagation();
    this.duplicateClick.emit(this.item);
  }

  onDeleteClick(event: Event): void {
    event.stopPropagation();
    this.deleteClick.emit(this.item);
  }

  onMenuButtonClick(event: Event): void {
    event.stopPropagation();
  }

  formatDuree(duree: number | undefined): string {
    if (!duree) return '';
    return `${duree} min`;
  }
}
