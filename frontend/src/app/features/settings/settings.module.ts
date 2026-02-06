import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';
import { SharedModule } from '../../shared/shared.module';
import { TagsManagerComponent } from '../tags/pages/tags-manager.component';
import { ProfilePageComponent } from './pages/profile/profile-page.component';
import { ImportExercicesComponent } from './pages/import-exercices/import-exercices.component';
import { ImportExportComponent } from './pages/import-export/import-export.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: 'tags', component: TagsManagerComponent },
      { path: 'import-export', component: ImportExportComponent, canActivate: [RoleGuard], data: { role: 'admin' } },
      { path: 'import-exercices', component: ImportExercicesComponent },
      { path: 'profil', component: ProfilePageComponent },
      // Redirection de l'ancienne admin vers la nouvelle
      { path: 'admin', redirectTo: '/admin', pathMatch: 'full' },
      { path: 'admin/**', redirectTo: '/admin' },
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
    ImportExercicesComponent
  ]
})
export class SettingsModule {}
