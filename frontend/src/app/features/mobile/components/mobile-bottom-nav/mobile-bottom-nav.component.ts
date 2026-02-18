import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
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

  navItems: NavItem[] = [
    { route: '/mobile/home', icon: 'home', label: 'Accueil' },
    { route: '/mobile/library', icon: 'library_books', label: 'Bibliothèque' },
    { route: '/mobile/create', icon: 'add_circle', label: 'Créer' },
    { route: '/mobile/terrain', icon: 'sports', label: 'Terrain' },
    { route: '/mobile/profile', icon: 'person', label: 'Profil' }
  ];

  constructor(private router: Router) {}

  onNavItemClick(item: NavItem): void {
    this.navigationChange.emit(item.route);
    this.router.navigate([item.route]);
  }

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }
}
