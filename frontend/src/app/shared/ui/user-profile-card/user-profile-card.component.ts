import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-profile-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './user-profile-card.component.html'
})
export class UserProfileCardComponent {
  @Input() user: User | null = null;
}
