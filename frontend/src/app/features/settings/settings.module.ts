import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';
import { CoreModule } from '../../core/core.module';
import { TagsManagerComponent } from '../tags/pages/tags-manager.component';
import { ProfilePageComponent } from './pages/profile/profile-page.component';
import { ImportExercicesComponent } from './pages/import-exercices/import-exercices.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: 'tags', component: TagsManagerComponent },
      { path: 'import-exercices', component: ImportExercicesComponent },
      { path: 'profil', component: ProfilePageComponent },
      { 
        path: 'admin', 
        component: AdminDashboardComponent, 
        canActivate: [RoleGuard], 
        data: { role: 'admin' } 
      },
      // Redirection pour maintenir la compatibilité avec les anciennes URL
      { path: 'admin/overview', redirectTo: 'admin', pathMatch: 'full' },
      { path: 'admin/users', redirectTo: 'admin', pathMatch: 'full' },
      { path: '', pathMatch: 'full', redirectTo: 'tags' }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    RouterModule.forChild(routes),
    // standalone components imported directly (only those used in templates)
    TagsManagerComponent,
    ImportExercicesComponent,
    AdminDashboardComponent
  ]
})
export class SettingsModule {}

