import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { User } from './core/models/user.model';
import { BackendStatusService } from './core/services/backend-status.service';
import { ApiUrlService } from './core/services/api-url.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Ultimate Frisbee Manager';
  currentUser$!: Observable<User | null>;
  isAuthenticated$ = this.authService.isAuthenticated$;
  
  isDropdownOpen = {
    exercices: false,
    entrainements: false,
    echauffements: false,
    situations: false,
    parametres: false
  };

  constructor(private cdr: ChangeDetectorRef, private authService: AuthService, private backendStatus: BackendStatusService, private apiUrlService: ApiUrlService) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    // Si l'utilisateur est authentifié, vérifier la santé du backend au démarrage
    this.isAuthenticated$.subscribe((auth) => {
      if (auth) {
        this.backendStatus.checkHealthOnce();
      }
    });
  }

  toggleDropdown(menu: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('Toggle dropdown:', menu, 'Current state:', (this.isDropdownOpen as any)[menu]);
    
    // Fermer tous les autres menus
    Object.keys(this.isDropdownOpen).forEach(key => {
      if (key !== menu) {
        (this.isDropdownOpen as any)[key] = false;
      }
    });
    
    // Basculer le menu sélectionné
    (this.isDropdownOpen as any)[menu] = !(this.isDropdownOpen as any)[menu];
    
    console.log('New state:', (this.isDropdownOpen as any)[menu]);
    console.log('All dropdown states:', this.isDropdownOpen);
    
    // Force la détection des changements Angular
    this.cdr.detectChanges();
    
    console.log('DOM Element for', menu, ':', document.querySelector(`.dropdown.${menu} .dropdown-menu`));
    
    // Vérification après détection forcée
    setTimeout(() => {
      console.log('After timeout - dropdown state for', menu, ':', (this.isDropdownOpen as any)[menu]);
      console.log('DOM Element after timeout:', document.querySelector(`.dropdown.${menu} .dropdown-menu`));
    }, 100);
  }

  closeAllDropdowns(): void {
    Object.keys(this.isDropdownOpen).forEach(key => {
      (this.isDropdownOpen as any)[key] = false;
    });
  }

  getAvatarUrl(path?: string | null): string | null {
    return this.apiUrlService.getMediaUrl(path, 'avatars');
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {},
      error: () => {}
    });
  }
}
