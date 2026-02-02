import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, fromEvent, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class MobileDetectorService {
  private readonly MOBILE_BREAKPOINT = 768;
  private readonly DESKTOP_FORCE_STORAGE_KEY = 'ufm.forceDesktop';
  private isMobileSubject = new BehaviorSubject<boolean>(false);
  private isDesktopForcedSubject = new BehaviorSubject<boolean>(false);

  public isMobile$: Observable<boolean> = this.isMobileSubject.asObservable();
  public isDesktopForced$: Observable<boolean> = this.isDesktopForcedSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.restoreDesktopForce();
      this.updateMobileStatus();
      this.setupResizeListener();
    }
  }

  private restoreDesktopForce(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const storedValue = window.localStorage.getItem(this.DESKTOP_FORCE_STORAGE_KEY);
      this.isDesktopForcedSubject.next(storedValue === 'true');
    } catch {
      // Ignore storage errors (private mode, blocked storage, etc.)
      this.isDesktopForcedSubject.next(false);
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

    if (!isPlatformBrowser(this.platformId)) return;
    try {
      window.localStorage.setItem(this.DESKTOP_FORCE_STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
  }

  // Réinitialiser le forçage desktop (quand on revient en auto)
  resetDesktopForce(): void {
    this.isDesktopForcedSubject.next(false);

    if (!isPlatformBrowser(this.platformId)) return;
    try {
      window.localStorage.setItem(this.DESKTOP_FORCE_STORAGE_KEY, 'false');
    } catch {
      // ignore
    }
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
