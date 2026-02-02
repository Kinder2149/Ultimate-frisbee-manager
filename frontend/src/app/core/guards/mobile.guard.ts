import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { MobileDetectorService } from '../services/mobile-detector.service';

@Injectable({
  providedIn: 'root'
})
export class MobileGuard implements CanActivate {
  constructor(
    private router: Router,
    private mobileDetector: MobileDetectorService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const url = state.url || '';
    if (url.includes('forceDesktop=1')) {
      this.mobileDetector.forceDesktop();
      return of(true);
    }

    const shouldShowMobile = this.mobileDetector.shouldShowMobileView;
    
    if (shouldShowMobile) {
      // On est sur mobile et non forcé desktop => rediriger vers /mobile
      this.router.navigate(['/mobile'], { 
        queryParams: { returnUrl: state.url } // pour pouvoir revenir si besoin
      });
      return of(false); // Bloquer l'accès à la route demandée
    }
    return of(true); // Autoriser l'accès
  }
}
