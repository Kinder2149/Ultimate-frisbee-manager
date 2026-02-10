import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

import { MobileHeaderComponent } from './components/mobile-header/mobile-header.component';
import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { MobileDetectorService } from '../../core/services/mobile-detector.service';

@Component({
  selector: 'app-mobile-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSnackBarModule,
    MobileHeaderComponent
  ],
  templateUrl: './mobile-layout.component.html',
  styleUrls: ['./mobile-layout.component.scss']
})
export class MobileLayoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  currentUser: User | null = null;
  returnUrl: string | undefined;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private mobileDetector: MobileDetectorService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadReturnUrl();
    this.setupResizeListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCurrentUser(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: User | null) => {
        this.currentUser = user;
      });
  }

  private loadReturnUrl(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || undefined;
  }

  private setupResizeListener(): void {
    fromEvent(window, 'resize')
      .pipe(
        takeUntil(this.destroy$),
        filter(() => !this.mobileDetector.shouldShowMobileView && window.innerWidth >= 768)
      )
      .subscribe(() => {
        this.showDesktopSuggestion();
      });
  }

  private showDesktopSuggestion(): void {
    const snackBarRef = this.snackBar.open(
      'Votre écran est maintenant assez grand pour la version desktop',
      'Passer en desktop',
      { duration: 8000 }
    );

    snackBarRef.onAction().subscribe(() => {
      this.mobileDetector.forceDesktop();
      const targetUrl = this.returnUrl || '/';
      this.router.navigate([targetUrl]);
    });
  }

  onSearchClick(): void {
    // Transmis au child MobileHomeComponent via un service ou événement
    // En Phase 1, le header émet l'événement mais la search bar est dans MobileHome
    // Ce handler est un placeholder — la logique de recherche est dans MobileHomeComponent
  }

  onSettingsClick(): void {
    this.snackBar.open('Paramètres - Fonctionnalité en cours de développement pour mobile', 'Fermer', {
      duration: 3000
    });
  }

  onProfileClick(): void {
    this.snackBar.open('Profil - Fonctionnalité en cours de développement pour mobile', 'Fermer', {
      duration: 3000
    });
  }

  onTagsClick(): void {
    this.snackBar.open('Tags - Fonctionnalité en cours de développement pour mobile', 'Fermer', {
      duration: 3000
    });
  }

  onAdminClick(): void {
    this.snackBar.open('Administration - Fonctionnalité en cours de développement pour mobile', 'Fermer', {
      duration: 3000
    });
  }

  onLogoutClick(): void {
    this.authService.logout().subscribe();
    this.router.navigate(['/login']);
  }
}
