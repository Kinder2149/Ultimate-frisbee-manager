import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Composant réutilisable pour les boutons d'action (modification, suppression, expansion)
 */
@Component({
  selector: 'app-action-button',
  templateUrl: './action-button.component.html',
  styleUrls: ['./action-button.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ActionButtonComponent {
  @Input() icon: string = ''; // Icône Material Design ou Font Awesome (ex: 'edit', 'trash', 'expand_more')
  @Input() iconType: 'material' | 'fontawesome' = 'material'; // Type d'icône
  @Input() buttonColor: string = '#333'; // Couleur du bouton
  @Input() iconColor: string = '#fff'; // Couleur de l'icône
  @Input() tooltip: string = ''; // Texte au survol
  @Input() disabled: boolean = false; // État désactivé
  
  @Output() click = new EventEmitter<MouseEvent>(); // Émetteur d'événement de clic
  
  /**
   * Gère le clic sur le bouton
   * @param event Événement de clic
   */
  onClick(event: MouseEvent): void {
    event.stopPropagation(); // Empêche la propagation de l'événement
    
    if (!this.disabled) {
      this.click.emit(event);
    }
  }
}
