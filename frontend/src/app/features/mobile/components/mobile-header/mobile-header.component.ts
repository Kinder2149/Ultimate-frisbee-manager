import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { User } from '../../../../core/models/user.model';

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
  @Input() currentUser: User | null = null;
  @Output() searchClick = new EventEmitter<void>();
  @Output() settingsClick = new EventEmitter<void>();
  @Output() profileClick = new EventEmitter<void>();
  @Output() tagsClick = new EventEmitter<void>();
  @Output() adminClick = new EventEmitter<void>();
  @Output() logoutClick = new EventEmitter<void>();

  onSearchClick(): void {
    this.searchClick.emit();
  }

  onSettingsClick(): void {
    this.settingsClick.emit();
  }

  onProfileClick(): void {
    this.profileClick.emit();
  }

  onTagsClick(): void {
    this.tagsClick.emit();
  }

  onAdminClick(): void {
    this.adminClick.emit();
  }

  onLogoutClick(): void {
    this.logoutClick.emit();
  }

  get userInitials(): string {
    if (!this.currentUser) return '?';
    
    const prenom = this.currentUser.prenom || '';
    const nom = this.currentUser.nom || '';
    
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase() || '?';
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }
}
