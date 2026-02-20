import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MobileHeaderComponent } from '../../components/mobile-header/mobile-header.component';
import { MobileNavigationService } from '../../../../core/services/mobile-navigation.service';
import { WorkspaceDataStore, DashboardStats } from '../../../../core/services/workspace-data.store';
import { WorkspaceService, WorkspaceSummary } from '../../../../core/services/workspace.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-mobile-home',
  standalone: true,
  imports: [
    CommonModule,
    MobileHeaderComponent
  ],
  templateUrl: './mobile-home.component.html',
  styleUrls: ['./mobile-home.component.scss']
})
export class MobileHomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  currentWorkspace: WorkspaceSummary | null = null;
  stats: DashboardStats = {
    exercicesCount: 0,
    entrainementsCount: 0,
    echauffementsCount: 0,
    situationsCount: 0,
    tagsCount: 0,
    tagsDetails: {},
    recentActivity: 0
  };
  isLoading = true;
  userName = '';

  get totalElements(): number {
    return this.stats.exercicesCount + this.stats.entrainementsCount + 
           this.stats.echauffementsCount + this.stats.situationsCount;
  }

  getTagsDescription(): string {
    if (this.isLoading) return 'Chargement...';
    
    if (!this.stats.tagsDetails || typeof this.stats.tagsDetails !== 'object') {
      return 'Aucun tag créé';
    }
    
    const categories = Object.keys(this.stats.tagsDetails);
    if (categories.length === 0) return 'Aucun tag créé';
    
    if (categories.length === 1) {
      const category = categories[0];
      const count = this.stats.tagsDetails[category];
      return `${count} tag${count > 1 ? 's' : ''} ${category}`;
    }
    
    return `${this.stats.tagsCount} tags (${categories.length} catégories)`;
  }

  constructor(
    private router: Router,
    private mobileNavigationService: MobileNavigationService,
    private workspaceDataStore: WorkspaceDataStore,
    private workspaceService: WorkspaceService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.mobileNavigationService.setCurrentTab('home');

    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.userName = user?.email?.split('@')[0] || 'Utilisateur';
    });

    this.workspaceService.currentWorkspace$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(workspace => {
      this.currentWorkspace = workspace;
    });

    this.workspaceDataStore.stats$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(stats => {
      this.stats = stats;
    });

    this.workspaceDataStore.loading$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(loading => {
      this.isLoading = loading;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  navigateToProfile(): void {
    if (!this.currentWorkspace) return;
    this.router.navigate(['/mobile/profile']);
  }

  navigateToWorkspaceSelection(): void {
    if (!this.currentWorkspace) return;
    this.router.navigate(['/select-workspace'], {
      queryParams: { forceSelection: 'true' }
    });
  }

  navigateToLibrary(): void {
    if (!this.currentWorkspace) return;
    this.router.navigate(['/mobile/library']);
  }

  navigateToModule(type: string): void {
    if (!this.currentWorkspace) return;
    const tabIndex = {
      'exercice': 0,
      'entrainement': 1,
      'echauffement': 2,
      'situation': 3
    }[type] || 0;

    this.router.navigate(['/mobile/library'], {
      queryParams: { tab: tabIndex }
    });
  }

  navigateToTags(): void {
    if (!this.currentWorkspace) return;
    this.router.navigate(['/mobile/tags']);
  }

  getRoleLabel(role: string): string {
    switch(role) {
      case 'MANAGER': return 'Gestionnaire';
      case 'MEMBER': return 'Membre';
      case 'VIEWER': return 'Lecteur';
      default: return role;
    }
  }
}
