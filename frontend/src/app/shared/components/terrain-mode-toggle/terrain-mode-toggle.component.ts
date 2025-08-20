import { Component, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-terrain-mode-toggle',
  template: `
    <div class="terrain-mode-toggle">
      <button 
        mat-icon-button 
        [class.active]="isTerrainMode"
        (click)="toggleMode()"
        [matTooltip]="isTerrainMode ? 'Mode normal' : 'Mode terrain'"
        class="mode-toggle-btn">
        <mat-icon>{{ isTerrainMode ? 'desktop_windows' : 'sports' }}</mat-icon>
      </button>
      <span class="mode-label">{{ isTerrainMode ? 'Terrain' : 'Bureau' }}</span>
    </div>
  `,
  styles: [`
    .terrain-mode-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: rgba(255,255,255,0.1);
      border-radius: 20px;
      backdrop-filter: blur(10px);
    }
    
    .mode-toggle-btn {
      transition: all 0.3s ease;
    }
    
    .mode-toggle-btn.active {
      background: rgba(255,255,255,0.2);
      color: #4CAF50;
    }
    
    .mode-label {
      font-size: 0.8rem;
      color: white;
      font-weight: 500;
    }
    
    @media (max-width: 768px) {
      .terrain-mode-toggle {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      }
    }
  `]
})
export class TerrainModeToggleComponent {
  @Input() isTerrainMode: boolean = false;
  @Output() modeChanged = new EventEmitter<boolean>();

  toggleMode() {
    this.isTerrainMode = !this.isTerrainMode;
    this.modeChanged.emit(this.isTerrainMode);
    
    // Ajouter/retirer la classe CSS globale
    if (this.isTerrainMode) {
      document.body.classList.add('terrain-mode');
    } else {
      document.body.classList.remove('terrain-mode');
    }
  }
}
