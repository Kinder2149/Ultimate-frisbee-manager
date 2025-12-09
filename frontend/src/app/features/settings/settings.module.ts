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
import { AdminShellComponent } from './components/admin-shell/admin-shell.component';

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
        component: AdminShellComponent,
        canActivate: [RoleGuard],
        data: { role: 'admin' },
        children: [
          { path: '', component: AdminDashboardComponent },
          { path: 'workspaces', component: AdminWorkspacesPageComponent },
          { path: 'explorer', component: DataExplorerPageComponent },
          {
            path: 'users',
            loadComponent: () => import('./pages/users-admin/users-admin.component').then(c => c.UsersAdminComponent)
          }
        ]
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
    AdminWorkspacesPageComponent,
    AdminShellComponent
  ]
})
export class SettingsModule {}
