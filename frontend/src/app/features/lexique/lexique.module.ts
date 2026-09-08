import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LexiqueListComponent } from './pages/lexique-list.component';

const routes: Routes = [
  { path: '', component: LexiqueListComponent }
];

/**
 * Module regroupant la fonctionnalité "lexique" (vocabulaire commun du club)
 */
@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(routes),
    LexiqueListComponent
  ],
  exports: []
})
export class LexiqueModule { }
