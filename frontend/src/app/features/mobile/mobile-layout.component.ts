import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

import { MobileBottomNavComponent } from './components/mobile-bottom-nav/mobile-bottom-nav.component';
import { MobileNavigationService } from '../../core/services/mobile-navigation.service';
import { MobileDetectorService } from '../../core/services/mobile-detector.service';

@Component({
  selector: 'app-mobile-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSnackBarModule,
    MobileBottomNavComponent
  ],
  templateUrl: './mobile-layout.component.html',
  styleUrls: ['./mobile-layout.component.scss']
})
export class MobileLayoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  activeRoute: string = 'home';

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private mobileNavigationService: MobileNavigationService,
    private mobileDetector: MobileDetectorService
  ) {}

  ngOnInit(): void {
    this.setupRouteTracking();
    this.setupResizeListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupRouteTracking(): void {
    this.mobileNavigationService.currentTab$
      .pipe(takeUntil(this.destroy$))
      .subscribe(tab => {
        this.activeRoute = tab;
      });

    const currentPath = this.router.url;
    if (currentPath.includes('/home')) {
      this.mobileNavigationService.setCurrentTab('home');
    } else if (currentPath.includes('/library')) {
      this.mobileNavigationService.setCurrentTab('library');
    } else if (currentPath.includes('/create')) {
      this.mobileNavigationService.setCurrentTab('create');
    } else if (currentPath.includes('/terrain')) {
      this.mobileNavigationService.setCurrentTab('terrain');
    } else if (currentPath.includes('/profile')) {
      this.mobileNavigationService.setCurrentTab('profile');
    }
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
      this.router.navigate(['/']);
    });
  }

  onNavigationChange(route: string): void {
    const tab = route.split('/').pop() || 'home';
    this.mobileNavigationService.setCurrentTab(tab);
  }
}
