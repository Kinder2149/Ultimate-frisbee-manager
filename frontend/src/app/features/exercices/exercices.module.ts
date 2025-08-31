import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CoreModule } from '../../core/core.module';
import { ExerciceListComponent } from './pages/exercice-list.component';
import { ExerciceFormComponent } from './pages/exercice-form/exercice-form.component';

// Routes spécifiques à la feature "exercices"
const routes: Routes = [
  { 
    path: '', 
    component: ExerciceListComponent
  },
  {
    path: 'ajouter',
    component: ExerciceFormComponent,
    data: { formMode: 'add' }
  },
  {
    path: 'modifier/:id',
    component: ExerciceFormComponent,
    data: { formMode: 'edit' }
  },
  {
    path: 'voir/:id',
    component: ExerciceFormComponent,
    data: { formMode: 'view' }
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];

/**
 * Module regroupant toutes les fonctionnalités liées aux exercices
 */
@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    RouterModule.forChild(routes),
    // Import des composants standalone
    ExerciceListComponent,
    ExerciceFormComponent
  ],
  declarations: []
})
export class ExercicesModule { 
  constructor() {
    console.log('ExercicesModule chargé avec succès');
    console.log('Routes configurées:', routes);
  }
}