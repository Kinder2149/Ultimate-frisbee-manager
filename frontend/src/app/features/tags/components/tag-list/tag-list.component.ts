import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tag, TagCategory } from '../../../../core/models/tag.model';
import { NIVEAU_LABELS } from '../../constants/tag.constants';

/**
 * Composant d'affichage de liste de tags avec options d'édition et suppression
 */
@Component({
  selector: 'app-tag-list',
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class TagListComponent {
  @Input() tags: Tag[] = [];
  @Input() category: string = '';
  @Output() editTag = new EventEmitter<Tag>();
  @Output() deleteTag = new EventEmitter<Tag>();
  
  // Référence aux énums pour le template
    niveauLabels = NIVEAU_LABELS;
  
  /**
   * Renvoie le texte à afficher pour un niveau
   * @param level Le niveau (1-5)
   * @returns Le texte associé au niveau
   */
  getNiveauLabel(level: number): string {
    return NIVEAU_LABELS[level] || `Niveau ${level}`;
  }
  
  /**
   * Génère un style pour un tag en fonction de sa couleur
   * @param tag Le tag
   * @returns Un objet de style pour l'élément
   */
  getTagStyle(tag: Tag): { [key: string]: string } {
    if (!tag.color) return {};
    
    return {
      'background-color': tag.color,
      'color': this.getContrastColor(tag.color),
      'border': 'none'
    };
  }
  
  /**
   * Détermine si le texte doit être blanc ou noir selon la couleur de fond
   * @param hexColor La couleur de fond en HEX
   * @returns La couleur de texte (#fff ou #000)
   */
  getContrastColor(hexColor: string): string {
    // Convertir la couleur HEX en RGB
    let r = 0, g = 0, b = 0;
    
    if (hexColor.length === 4) {
      // Format #RGB
      r = parseInt(hexColor[1] + hexColor[1], 16);
      g = parseInt(hexColor[2] + hexColor[2], 16);
      b = parseInt(hexColor[3] + hexColor[3], 16);
    } else if (hexColor.length === 7) {
      // Format #RRGGBB
      r = parseInt(hexColor.substring(1, 3), 16);
      g = parseInt(hexColor.substring(3, 5), 16);
      b = parseInt(hexColor.substring(5, 7), 16);
    }
    
    // Calculer la luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Si la luminance est élevée (couleur claire), utiliser du texte noir
    return luminance > 0.5 ? '#000' : '#fff';
  }
}