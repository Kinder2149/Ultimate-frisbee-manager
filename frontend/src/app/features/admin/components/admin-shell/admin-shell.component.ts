import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule
  ],
  templateUrl: './admin-shell.component.html',
  styleUrls: ['./admin-shell.component.scss']
})
export class AdminShellComponent {
  navItems: NavItem[] = [
    { label: 'Tableau de bord', route: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Contenus', route: '/admin/content', icon: 'inventory_2' },
    { label: 'Utilisateurs', route: '/admin/users', icon: 'people' },
    { label: 'Workspaces', route: '/admin/workspaces', icon: 'workspaces' },
    { label: 'Statistiques', route: '/admin/stats', icon: 'bar_chart' },
    { label: 'Logs', route: '/admin/logs', icon: 'history' },
    { label: 'Rôles & droits', route: '/admin/roles-rights', icon: 'security' },
    { label: 'Paramètres', route: '/admin/settings', icon: 'settings' }
  ];
}
