import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CategoryType, ContentItem } from '../../models/content-item.model';

@Component({
  selector: 'app-hero-contextuel',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './hero-contextuel.component.html',
  styleUrls: ['./hero-contextuel.component.scss']
})
export class HeroContextuelComponent {
  @Input() item: ContentItem | null = null;
  @Input() category: CategoryType = 'all';
  @Output() itemClick = new EventEmitter<ContentItem>();

  onItemClick(): void {
    if (this.item) {
      this.itemClick.emit(this.item);
    }
  }

  get categoryLabel(): string {
    const labels: Record<CategoryType, string> = {
      all: 'Dernière activité',
      exercice: 'Dernier exercice',
      entrainement: 'Dernier entraînement',
      echauffement: 'Dernier échauffement',
      situation: 'Dernière situation'
    };
    return labels[this.category];
  }

  get categoryColor(): string {
    const colors: Record<CategoryType, string> = {
      all: '#2c3e50',
      exercice: '#e74c3c',
      entrainement: '#3498db',
      echauffement: '#FF9800',
      situation: '#4CAF50'
    };
    return colors[this.category];
  }

  get typeIcon(): string {
    if (!this.item) return 'star';
    
    const icons: Record<ContentItem['type'], string> = {
      exercice: 'fitness_center',
      entrainement: 'sports',
      echauffement: 'directions_run',
      situation: 'sports_soccer'
    };
    return icons[this.item.type];
  }

  get typeLabel(): string {
    if (!this.item) return '';
    
    const labels: Record<ContentItem['type'], string> = {
      exercice: 'Exercice',
      entrainement: 'Entraînement',
      echauffement: 'Échauffement',
      situation: 'Situation'
    };
    return labels[this.item.type];
  }

  truncateText(text: string | undefined, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
}
