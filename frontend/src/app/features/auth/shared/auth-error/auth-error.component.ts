import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-auth-error',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './auth-error.component.html',
  styleUrls: ['./auth-error.component.scss']
})
export class AuthErrorComponent {
  @Input() message: string = '';
  @Input() type: 'error' | 'warning' | 'info' = 'error';

  get icon(): string {
    switch (this.type) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'error';
    }
  }
}
