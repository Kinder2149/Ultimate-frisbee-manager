import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Modules Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// Composants partagés
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { TrainingActionsComponent } from '../../shared/widgets/training-actions/training-actions.component';
import { DialogBaseComponent } from '../../shared/components/dialog';

// Import des composants standalone
import { TrainingListSimpleComponent } from './pages/training-list-simple.component';
import { AddTrainingButtonComponent } from './components/add-training-button.component';

// Import des nouveaux composants de dialogue
import { AddTrainingDialogComponent } from './components/add-training-dialog.component';
import { TrainingEditDialogComponent } from './components/training-edit-dialog.component';
import { TrainingViewDialogComponent } from './components/training-view-dialog.component';

/**
 * Routes pour le module simplifié d'entraînements
 */
const routes: Routes = [
  {
    path: '',
    component: TrainingListSimpleComponent
  }
];

/**
 * Module simplifié pour la gestion des entraînements
 * Version minimaliste qui ne gère que l'affichage et la création d'entraînements basiques
 */
@NgModule({
  imports: [
    // Modules Angular
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    
    // Modules Material
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    
    // Composants standalone
    TrainingActionsComponent,
    DataTableComponent,
    TrainingListSimpleComponent,
    AddTrainingButtonComponent,
    AddTrainingDialogComponent,
    TrainingEditDialogComponent,
    TrainingViewDialogComponent,
    DialogBaseComponent
  ],
  providers: [
    { provide: MatDialogRef, useValue: {} },
    { provide: MAT_DIALOG_DATA, useValue: {} }
  ],
  exports: [
    TrainingListSimpleComponent,
    AddTrainingButtonComponent
  ]
})
export class TrainingsSimpleModule { }
