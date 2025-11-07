import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

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
    component: EntrainementFormComponent
  },
  {
    path: 'modifier/:id',
    component: EntrainementFormComponent
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
