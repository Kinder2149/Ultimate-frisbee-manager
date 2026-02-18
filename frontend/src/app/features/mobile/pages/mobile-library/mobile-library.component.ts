import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MobileHeaderComponent } from '../../components/mobile-header/mobile-header.component';
import { MobileNavigationService } from '../../../../core/services/mobile-navigation.service';
import { WorkspaceDataStore } from '../../../../core/services/workspace-data.store';
import { PermissionsService } from '../../../../core/services/permissions.service';

@Component({
  selector: 'app-mobile-library',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MobileHeaderComponent
  ],
  templateUrl: './mobile-library.component.html',
  styleUrls: ['./mobile-library.component.scss']
})
export class MobileLibraryComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  selectedTabIndex = 0;
  searchQuery = '';

  exercices$ = this.workspaceDataStore.exercices$;
  entrainements$ = this.workspaceDataStore.entrainements$;
  echauffements$ = this.workspaceDataStore.echauffements$;
  situations$ = this.workspaceDataStore.situations$;

  constructor(
    private router: Router,
    private mobileNavigationService: MobileNavigationService,
    private workspaceDataStore: WorkspaceDataStore,
    public permissionsService: PermissionsService
  ) {}

  ngOnInit(): void {
    this.mobileNavigationService.setCurrentTab('library');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
  }

  onAddClick(): void {
    const types = ['exercice', 'entrainement', 'echauffement', 'situation'];
    const type = types[this.selectedTabIndex];
    this.router.navigate(['/mobile/create', type]);
  }

  onItemClick(type: string, id: string): void {
    this.router.navigate(['/mobile/detail', type, id]);
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
  }
}
