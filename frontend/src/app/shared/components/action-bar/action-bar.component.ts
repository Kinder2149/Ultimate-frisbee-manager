import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionButtonComponent } from '../action-button/action-button.component';

/**
 * Barre d'actions regroupant les boutons d'action (modifier, supprimer, étendre)
 * pour les cartes d'exercices
 */
@Component({
  selector: 'app-action-bar',
  templateUrl: './action-bar.component.html',
  styleUrls: ['./action-bar.component.css'],
  standalone: true,
  imports: [CommonModule, ActionButtonComponent]
})
export class ActionBarComponent {
  @Input() expanded: boolean = false; // État d'expansion de la carte
  
  // Événements
  @Output() edit = new EventEmitter<void>();
  @Output() duplicate = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() toggleExpand = new EventEmitter<void>();
  
  /**
   * Déclenche l'événement d'édition
   * @param event Événement de clic
   */
  onEdit(event: MouseEvent): void {
    this.edit.emit();
  }
  
  /**
   * Déclenche l'événement de duplication
   * @param event Événement de clic
   */
  onDuplicate(event: MouseEvent): void {
    this.duplicate.emit();
  }
  
  /**
   * Déclenche l'événement de suppression
   * @param event Événement de clic
   */
  onDelete(event: MouseEvent): void {
    this.delete.emit();
  }
  
  /**
   * Déclenche l'événement d'expansion/réduction
   * @param event Événement de clic
   */
  onToggleExpand(event: MouseEvent): void {
    this.toggleExpand.emit();
  }
}
