import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

// Imports des composants
import { EchauffementListComponent } from './pages/echauffement-list/echauffement-list.component';
import { EchauffementFormComponent } from './pages/echauffement-form/echauffement-form.component';

// Routes spécifiques à la feature "echauffements"
const routes: Routes = [
  { path: '', component: EchauffementListComponent },
  { path: 'ajouter', component: EchauffementFormComponent },
  { path: 'modifier/:id', component: EchauffementFormComponent },
];

/**
 * Module regroupant toutes les fonctionnalités liées aux échauffements
 */
@NgModule({
  declarations: [],
  imports: [
    SharedModule,
    RouterModule.forChild(routes),
    EchauffementListComponent,
    EchauffementFormComponent
  ],
  exports: []
})
export class EchauffenementsModule { }
