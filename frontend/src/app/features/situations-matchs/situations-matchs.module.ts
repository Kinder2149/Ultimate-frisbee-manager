import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { WriteGuard } from '../../core/guards/write.guard';

import { SituationMatchListComponent } from './pages/situationmatch-list/situationmatch-list.component';
import { SituationMatchFormComponent } from './pages/situationmatch-form/situationmatch-form.component';
import { SituationMatchDetailComponent } from './pages/situationmatch-detail/situationmatch-detail.component';

const routes: Routes = [
  {
    path: '',
    component: SituationMatchListComponent
  },
  {
    path: 'ajouter',
    component: SituationMatchFormComponent,
    canActivate: [WriteGuard]
  },
  {
    path: 'modifier/:id',
    component: SituationMatchFormComponent,
    canActivate: [WriteGuard]
  },
  {
    path: ':id',
    component: SituationMatchDetailComponent
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SituationMatchListComponent,
    SituationMatchFormComponent,
    SituationMatchDetailComponent
  ]
})
export class SituationsMatchsModule { }
