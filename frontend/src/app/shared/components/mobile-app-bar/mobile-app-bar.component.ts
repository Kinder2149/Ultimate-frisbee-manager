import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

/**
 * App Bar contextuelle pour la vue mobile
 * Affiche le titre dynamique et les actions principales
 */
@Component({
  selector: 'app-mobile-app-bar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './mobile-app-bar.component.html',
  styleUrls: ['./mobile-app-bar.component.scss']
})
export class MobileAppBarComponent {
  @Input() title: string = '';
  @Input() canCreate: boolean = false;
  @Input() showSearch: boolean = true;
  
  @Output() searchClick = new EventEmitter<void>();
  @Output() createClick = new EventEmitter<void>();
  @Output() menuClick = new EventEmitter<void>();

  onSearchClick(): void {
    this.searchClick.emit();
  }

  onCreateClick(): void {
    this.createClick.emit();
  }

  onMenuClick(): void {
    this.menuClick.emit();
  }
}
