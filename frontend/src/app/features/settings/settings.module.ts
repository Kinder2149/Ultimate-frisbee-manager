import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';
import { SharedModule } from '../../shared/shared.module';
import { TagsManagerComponent } from '../tags/pages/tags-manager.component';
import { ProfilePageComponent } from './pages/profile/profile-page.component';
import { ImportExercicesComponent } from './pages/import-exercices/import-exercices.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { DataExplorerPageComponent } from './pages/data-explorer/data-explorer-page.component';
import { ImportExportComponent } from './pages/import-export/import-export.component';
import { AdminWorkspacesPageComponent } from './pages/admin-workspaces/admin-workspaces-page.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: 'tags', component: TagsManagerComponent },
      { path: 'import-export', component: ImportExportComponent },
      { path: 'import-exercices', component: ImportExercicesComponent },
      { path: 'profil', component: ProfilePageComponent },
      { 
        path: 'admin', 
        component: AdminDashboardComponent, 
        canActivate: [RoleGuard], 
        data: { role: 'admin' } 
      },
      {
        path: 'admin/workspaces',
        component: AdminWorkspacesPageComponent,
        canActivate: [RoleGuard],
        data: { role: 'admin' }
      },
      { 
        path: 'admin/explorer', 
        component: DataExplorerPageComponent, 
        canActivate: [RoleGuard], 
        data: { role: 'admin' } 
      },
      // Redirection pour maintenir la compatibilité avec les anciennes URL
      { path: 'admin/overview', redirectTo: 'admin', pathMatch: 'full' },
      { path: '', pathMatch: 'full', redirectTo: 'tags' }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    // standalone components imported directly (only those used in templates)
    TagsManagerComponent,
    ImportExportComponent,
    ImportExercicesComponent,
    AdminDashboardComponent,
    DataExplorerPageComponent,
    AdminWorkspacesPageComponent
  ]
})
export class SettingsModule {}
