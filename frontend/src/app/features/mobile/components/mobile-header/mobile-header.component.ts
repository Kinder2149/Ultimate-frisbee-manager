import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { User } from '../../../../core/models/user.model';
import { MobileDetectorService } from '../../../../core/services/mobile-detector.service';

@Component({
  selector: 'app-mobile-header',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './mobile-header.component.html',
  styleUrls: ['./mobile-header.component.scss']
})
export class MobileHeaderComponent {
  @Input() currentUser: User | null = null;
  @Input() returnUrl?: string; // URL de retour optionnelle
  @Output() searchClick = new EventEmitter<void>();
  @Output() settingsClick = new EventEmitter<void>();
  @Output() profileClick = new EventEmitter<void>();
  @Output() tagsClick = new EventEmitter<void>();
  @Output() adminClick = new EventEmitter<void>();
  @Output() logoutClick = new EventEmitter<void>();

  constructor(
    private router: Router,
    private mobileDetector: MobileDetectorService
  ) {}

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

  onDesktopViewClick(): void {
    // Forcer la vue desktop
    this.mobileDetector.forceDesktop();
    
    // Rediriger vers la page demandée ou le dashboard
    const targetUrl = this.returnUrl || '/';
    this.router.navigate([targetUrl]);
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
