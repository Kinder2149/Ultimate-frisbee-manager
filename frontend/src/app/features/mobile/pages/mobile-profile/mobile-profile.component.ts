import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MobileHeaderComponent } from '../../components/mobile-header/mobile-header.component';
import { MobileNavigationService } from '../../../../core/services/mobile-navigation.service';
import { AuthService } from '../../../../core/services/auth.service';
import { WorkspaceService, WorkspaceSummary } from '../../../../core/services/workspace.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-mobile-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatDividerModule,
    MobileHeaderComponent
  ],
  templateUrl: './mobile-profile.component.html',
  styleUrls: ['./mobile-profile.component.scss']
})
export class MobileProfileComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  currentUser: User | null = null;
  currentWorkspace: WorkspaceSummary | null = null;

  constructor(
    private router: Router,
    private mobileNavigationService: MobileNavigationService,
    private authService: AuthService,
    private workspaceService: WorkspaceService
  ) {}

  ngOnInit(): void {
    this.mobileNavigationService.setCurrentTab('profile');
    this.loadUserData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserData(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    this.workspaceService.currentWorkspace$
      .pipe(takeUntil(this.destroy$))
      .subscribe(workspace => {
        this.currentWorkspace = workspace;
      });
  }

  get userInitials(): string {
    if (!this.currentUser) return '?';
    const prenom = this.currentUser.prenom || '';
    const nom = this.currentUser.nom || '';
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase() || '?';
  }

  get userFullName(): string {
    if (!this.currentUser) return 'Utilisateur';
    const prenom = this.currentUser.prenom || '';
    const nom = this.currentUser.nom || '';
    return `${prenom} ${nom}`.trim() || 'Utilisateur';
  }

  onChangeWorkspace(): void {
    this.router.navigate(['/select-workspace']);
  }

  onEditProfile(): void {
    this.router.navigate(['/parametres/profil']);
  }

  onNotifications(): void {
    // TODO: Implémenter la page de notifications
    console.log('Notifications');
  }

  onOfflineMode(): void {
    // TODO: Implémenter la gestion du mode hors ligne
    console.log('Mode hors ligne');
  }

  onSync(): void {
    // TODO: Implémenter la synchronisation
    console.log('Synchronisation');
  }

  onTheme(): void {
    // TODO: Implémenter le changement de thème
    console.log('Thème');
  }

  onLogout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
