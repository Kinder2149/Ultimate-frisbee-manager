import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from '../../core/core.module';

// Imports des composants depuis leurs nouveaux emplacements
import { ExerciceListComponent } from './pages/exercice-list.component';
import { ExerciceCardComponent } from './components/exercice-card.component';
import { ExerciceFormComponent } from './pages/exercice-form/exercice-form.component';

// Routes spécifiques à la feature "exercices"
const routes: Routes = [
  { path: '', component: ExerciceListComponent },
  { path: 'ajouter', component: ExerciceFormComponent },
  { path: 'modifier/:id', component: ExerciceFormComponent },
];

/**
 * Module regroupant toutes les fonctionnalités liées aux exercices
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CoreModule,
    RouterModule.forChild(routes),
    ExerciceListComponent,
    ExerciceCardComponent
  ],
  exports: []
  // Le composant ExerciceFormComponent est désormais standalone et n'a plus besoin d'être déclaré/exporté
})
export class ExercicesModule { }