import { Component, ChangeDetectorRef, OnInit, Renderer2, ElementRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { User } from './core/models/user.model';
import { BackendStatusService } from './core/services/backend-status.service';
import { ApiUrlService } from './core/services/api-url.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Ultimate Frisbee Manager';
  currentUser$!: Observable<User | null>;
  isAuthenticated$ = this.authService.isAuthenticated$;
  private routerSubscription!: Subscription;

  isDropdownOpen = {
    exercices: false,
    entrainements: false,
    echauffements: false,
    situations: false,
    parametres: false
  };

  constructor(
    private cdr: ChangeDetectorRef,
    public authService: AuthService, // public pour l'utiliser dans le template
    private backendStatus: BackendStatusService,
    private apiUrlService: ApiUrlService,
    private renderer: Renderer2,
    private el: ElementRef,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    // Si l'utilisateur est authentifié, vérifier la santé du backend au démarrage
    this.isAuthenticated$.subscribe((auth) => {
      if (auth) {
        this.backendStatus.checkHealthOnce();
      }
    });

    this.routerSubscription = this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe();
  }

  toggleDropdown(menu: keyof typeof this.isDropdownOpen, event: Event): void {
    console.log(`Clic détecté pour le menu : ${menu}`); // Log pour débogage
    event.preventDefault();
    event.stopPropagation();

    const currentState = this.isDropdownOpen[menu];

    // Fermer tous les menus
    Object.keys(this.isDropdownOpen).forEach(key => {
      (this.isDropdownOpen as any)[key] = false;
    });

    // Ouvrir le menu cliqué s'il était fermé
    this.isDropdownOpen[menu] = !currentState;

    // Forcer manuellement la détection des changements
    this.cdr.detectChanges();
  }

  closeAllDropdowns(): void {
    Object.keys(this.isDropdownOpen).forEach(key => {
      (this.isDropdownOpen as any)[key] = false;
    });
  }

  getAvatarUrl(path?: string | null): string | null {
    return this.apiUrlService.getMediaUrl(path, 'avatars');
  }

  async onLogout(): Promise<void> {
    try {
      await this.authService.logout();
      // La redirection est gérée par onAuthStateChange dans auth.service.ts
    } catch (error) {
      console.error('Erreur lors de la déconnexion', error);
    }
  }
}
