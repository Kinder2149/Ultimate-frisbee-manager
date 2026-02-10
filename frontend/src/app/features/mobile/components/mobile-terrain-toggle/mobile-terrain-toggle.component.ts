import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

/**
 * Composant FAB (Floating Action Button) pour le mode terrain.
 * Permet de basculer entre le mode normal et le mode terrain.
 * 
 * Le mode terrain affiche les contenus de manière optimisée pour une utilisation
 * sur le terrain (affichage simplifié, actions rapides).
 */
@Component({
  selector: 'app-mobile-terrain-toggle',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './mobile-terrain-toggle.component.html',
  styleUrls: ['./mobile-terrain-toggle.component.scss']
})
export class MobileTerrainToggleComponent {
  @Input() terrainMode = false;
  @Output() terrainModeChange = new EventEmitter<boolean>();

  onToggle(): void {
    this.terrainModeChange.emit(!this.terrainMode);
  }

  get tooltipText(): string {
    return this.terrainMode ? 'Quitter le mode terrain' : 'Activer le mode terrain';
  }

  get iconName(): string {
    return this.terrainMode ? 'sports_soccer' : 'sports';
  }
}
