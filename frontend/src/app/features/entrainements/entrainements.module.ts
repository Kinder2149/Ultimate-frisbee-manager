import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { WriteGuard } from '../../core/guards/write.guard';

// Composants
import { EntrainementListComponent } from './pages/entrainement-list/entrainement-list.component';
import { EntrainementFormComponent } from './pages/entrainement-form/entrainement-form.component';
import { EntrainementDetailComponent } from './pages/entrainement-detail/entrainement-detail.component';

// Routes du module
const routes: Routes = [
  {
    path: '',
    component: EntrainementListComponent
  },
  {
    path: 'nouveau',
    component: EntrainementFormComponent,
    canActivate: [WriteGuard]
  },
  {
    path: 'modifier/:id',
    component: EntrainementFormComponent,
    canActivate: [WriteGuard]
  },

];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    // Composants standalone
    EntrainementListComponent,
    EntrainementFormComponent,
    EntrainementDetailComponent
  ]
})
export class EntrainementsModule { }
