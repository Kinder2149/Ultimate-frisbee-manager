import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

export interface HeaderAction {
  icon: string;
  label: string;
  action: () => void;
}

@Component({
  selector: 'app-mobile-header',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule
  ],
  templateUrl: './mobile-header.component.html',
  styleUrls: ['./mobile-header.component.scss']
})
export class MobileHeaderComponent {
  @Input() title: string = '';
  @Input() showBack: boolean = false;
  @Input() actions: HeaderAction[] = [];
  @Output() backClick = new EventEmitter<void>();
  @Output() actionClick = new EventEmitter<string>();

  constructor(private location: Location) {}

  onBackClick(): void {
    if (this.backClick.observers.length > 0) {
      this.backClick.emit();
    } else {
      this.location.back();
    }
  }

  onActionClick(action: HeaderAction): void {
    action.action();
    this.actionClick.emit(action.label);
  }
}
