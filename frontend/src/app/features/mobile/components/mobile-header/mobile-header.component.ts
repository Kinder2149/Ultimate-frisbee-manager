import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router } from '@angular/router';
import { User } from '../../../../core/models/user.model';
import { MobileDetectorService } from '../../../../core/services/mobile-detector.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-mobile-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './mobile-header.component.html',
  styleUrls: ['./mobile-header.component.scss']
})
export class MobileHeaderComponent {
  @Input() currentUser: User | null = null;
  @Input() returnUrl?: string;
  @Input() showSearch = true;
  @Output() searchChange = new EventEmitter<string>();
  @Output() settingsClick = new EventEmitter<void>();
  @Output() profileClick = new EventEmitter<void>();
  @Output() tagsClick = new EventEmitter<void>();
  @Output() adminClick = new EventEmitter<void>();
  @Output() logoutClick = new EventEmitter<void>();

  searchQuery = '';
  searchExpanded = false;
  private searchSubject = new Subject<string>();

  constructor(
    private router: Router,
    private mobileDetector: MobileDetectorService
  ) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchChange.emit(query);
    });
  }

  onSearchInput(query: string): void {
    this.searchSubject.next(query);
  }

  toggleSearch(): void {
    this.searchExpanded = !this.searchExpanded;
    if (!this.searchExpanded) {
      this.searchQuery = '';
      this.searchSubject.next('');
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchSubject.next('');
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

  get userFullName(): string {
    if (!this.currentUser) return 'Utilisateur';
    
    const prenom = this.currentUser.prenom || '';
    const nom = this.currentUser.nom || '';
    
    return `${prenom} ${nom}`.trim() || 'Utilisateur';
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }
}
