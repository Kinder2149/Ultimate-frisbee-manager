import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';
import { AdminShellComponent } from './components/admin-shell/admin-shell.component';

const routes: Routes = [
  {
    path: '',
    component: AdminShellComponent,
    canActivate: [RoleGuard],
    data: { role: 'admin' },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'content',
        loadComponent: () => import('./pages/content/content.component').then(m => m.ContentComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users-list/users-list.component').then(m => m.UsersListComponent)
      },
      {
        path: 'users/:id',
        loadComponent: () => import('./pages/users/user-detail/user-detail.component').then(m => m.UserDetailComponent)
      },
      {
        path: 'workspaces',
        loadComponent: () => import('./pages/workspaces/workspaces-list/workspaces-list.component').then(m => m.WorkspacesListComponent)
      },
      {
        path: 'workspaces/:id',
        loadComponent: () => import('./pages/workspaces/workspace-detail/workspace-detail.component').then(m => m.WorkspaceDetailComponent)
      },
      {
        path: 'stats',
        loadComponent: () => import('./pages/stats/stats.component').then(m => m.StatsComponent)
      },
      {
        path: 'logs',
        loadComponent: () => import('./pages/activity/activity.component').then(m => m.ActivityComponent)
      },
      {
        path: 'roles-rights',
        loadComponent: () => import('./pages/roles-rights/roles-rights.component').then(m => m.RolesRightsComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
