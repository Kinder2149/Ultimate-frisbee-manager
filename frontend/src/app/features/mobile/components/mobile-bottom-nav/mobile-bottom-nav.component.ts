import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PermissionsService } from '../../../../core/services/permissions.service';
import { MatIconModule } from '@angular/material/icon';

export interface NavItem {
  route: string;
  icon: string;
  label: string;
}

@Component({
  selector: 'app-mobile-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './mobile-bottom-nav.component.html',
  styleUrls: ['./mobile-bottom-nav.component.scss']
})
export class MobileBottomNavComponent {
  @Input() activeRoute: string = 'home';
  @Output() navigationChange = new EventEmitter<string>();

  private readonly tousLesOnglets: NavItem[] = [
    { route: '/mobile/home', icon: 'home', label: 'Accueil' },
    { route: '/mobile/library', icon: 'library_books', label: 'Bibliothèque' },
    { route: '/mobile/create', icon: 'add_circle', label: 'Créer' },
    { route: '/mobile/profile', icon: 'person', label: 'Profil' }
  ];

  constructor(
    private router: Router,
    private permissionsService: PermissionsService
  ) {}

  /**
   * « Créer » n'apparait que pour ceux qui ont le droit d'ecrire dans l'espace courant.
   */
  get navItems(): NavItem[] {
    if (this.permissionsService.canWrite()) {
      return this.tousLesOnglets;
    }
    return this.tousLesOnglets.filter(onglet => onglet.route !== '/mobile/create');
  }

  onNavItemClick(item: NavItem): void {
    this.navigationChange.emit(item.route);
    this.router.navigate([item.route]);
  }

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }
}
