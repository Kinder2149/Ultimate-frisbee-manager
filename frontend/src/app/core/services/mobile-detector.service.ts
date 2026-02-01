import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, fromEvent, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class MobileDetectorService {
  private readonly MOBILE_BREAKPOINT = 768;
  private isMobileSubject = new BehaviorSubject<boolean>(false);
  private isDesktopForcedSubject = new BehaviorSubject<boolean>(false);

  public isMobile$: Observable<boolean> = this.isMobileSubject.asObservable();
  public isDesktopForced$: Observable<boolean> = this.isDesktopForcedSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.updateMobileStatus();
      this.setupResizeListener();
    }
  }

  private updateMobileStatus(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const isMobile = window.innerWidth < this.MOBILE_BREAKPOINT;
    this.isMobileSubject.next(isMobile);
  }

  private setupResizeListener(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    fromEvent(window, 'resize')
      .subscribe(() => {
        this.updateMobileStatus();
      });
  }

  // Forcer la vue desktop (utilisé par le bouton "Version desktop")
  forceDesktop(): void {
    this.isDesktopForcedSubject.next(true);
  }

  // Réinitialiser le forçage desktop (quand on revient en auto)
  resetDesktopForce(): void {
    this.isDesktopForcedSubject.next(false);
  }

  // Getter synchrone (utile dans les guards)
  get isMobile(): boolean {
    return this.isMobileSubject.value;
  }

  // Getter synchrone pour le forçage desktop
  get isDesktopForced(): boolean {
    return this.isDesktopForcedSubject.value;
  }

  // Combiné : doit-on afficher la vue mobile ?
  get shouldShowMobileView(): boolean {
    return this.isMobile && !this.isDesktopForced;
  }
}
