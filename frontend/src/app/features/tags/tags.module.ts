import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

// Imports des composants depuis leurs nouveaux emplacements
import { TagsManagerComponent } from './pages/tags-manager.component';
import { TagFormComponent } from './components/tag-form/tag-form.component';
import { TagListComponent } from './components/tag-list/tag-list.component';

// Routes spécifiques à la feature "tags"
const routes: Routes = [
  { path: 'manager', component: TagsManagerComponent },
  { path: '', redirectTo: 'manager', pathMatch: 'full' }
];

/**
 * Module regroupant toutes les fonctionnalités liées aux tags
 */
@NgModule({
  declarations: [],
  // Les composants sont maintenant tous en standalone
  imports: [
    SharedModule,
    RouterModule.forChild(routes),
    TagsManagerComponent
  ],
  exports: []
  // Les composants standalone n'ont pas besoin d'être exportés
})
export class TagsModule { }