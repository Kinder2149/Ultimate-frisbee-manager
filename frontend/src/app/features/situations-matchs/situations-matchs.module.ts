import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { SituationMatchListComponent } from './pages/situationmatch-list/situationmatch-list.component';
import { SituationMatchFormComponent } from './pages/situationmatch-form/situationmatch-form.component';

const routes: Routes = [
  {
    path: '',
    component: SituationMatchListComponent
  },
  {
    path: 'ajouter',
    component: SituationMatchFormComponent
  },
  {
    path: 'modifier/:id',
    component: SituationMatchFormComponent
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SituationMatchListComponent,
    SituationMatchFormComponent
  ]
})
export class SituationsMatchsModule { }
