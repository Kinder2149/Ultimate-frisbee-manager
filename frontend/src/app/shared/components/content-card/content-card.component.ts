import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Composant réutilisable pour afficher du contenu dans une carte
 * avec un en-tête, un corps et un pied de page optionnels
 */
@Component({
  selector: 'app-content-card',
  templateUrl: './content-card.component.html',
  styleUrls: ['./content-card.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ContentCardComponent {
  /** Titre de la carte */
  @Input() title: string = '';
  
  /** Sous-titre optionnel */
  @Input() subtitle: string = '';
  
  /** URL de l'image d'en-tête (optionnel) */
  @Input() headerImageUrl: string = '';
  
  /** Texte alternatif pour l'image */
  @Input() headerImageAlt: string = '';
  
  /** Si la carte peut être repliée */
  @Input() collapsible: boolean = false;
  
  /** État initial de la carte (repliée ou non) */
  @Input() initiallyCollapsed: boolean = false;
  
  /** Thème de couleur de la carte */
  @Input() theme: 'default' | 'primary' | 'success' | 'warning' | 'danger' = 'default';
  
  /** Si la carte a une ombre portée */
  @Input() elevation: boolean = true;
  
  /** Largeur de la carte (CSS) */
  @Input() width: string = '100%';
  
  /** Classes CSS supplémentaires */
  @Input() additionalClasses: string = '';
  
  /** Événement émis lors du clic sur la carte */
  @Output() cardClick = new EventEmitter<MouseEvent>();
  
  /** Événement émis lors du changement d'état (replié/déplié) */
  @Output() collapsedChange = new EventEmitter<boolean>();
  
  /** État actuel (replié ou non) */
  isCollapsed: boolean = false;
  
  constructor() {}
  
  ngOnInit(): void {
    this.isCollapsed = this.initiallyCollapsed;
  }
  
  /**
   * Gère le clic sur la carte
   * @param event Événement de clic
   */
  onCardClick(event: MouseEvent): void {
    this.cardClick.emit(event);
  }
  
  /**
   * Bascule l'état replié/déplié de la carte
   * @param event Événement de clic
   */
  toggleCollapsed(event: MouseEvent): void {
    event.stopPropagation();
    this.isCollapsed = !this.isCollapsed;
    this.collapsedChange.emit(this.isCollapsed);
  }
}
