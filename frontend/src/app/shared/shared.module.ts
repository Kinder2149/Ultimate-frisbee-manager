import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../core/material/material.module'; // Import du module centralisé pour Angular Material

// Composants partagés
import { ContentCardComponent } from './components/content-card/content-card.component';
import { SearchFilterComponent } from './components/search-filter/search-filter.component';
import { DataTableComponent } from './components/data-table/data-table.component';
import { AlertComponent } from './components/alert/alert.component';
import { ActionButtonComponent } from './components/action-button/action-button.component';

// Services partagés

// Composants et interfaces exportés
export { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
export { ConfirmationDialogData } from './components/confirmation-dialog/confirmation-dialog.component';

/**
 * Module partagé regroupant tous les composants, directives, pipes et services réutilisables
 * Ce module doit être importé dans chaque module de fonctionnalité ayant besoin
 * d'utiliser les éléments partagés
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule, // Ajout de MaterialModule
    
    // Composants standalone (Angular 14+)
    ContentCardComponent,
    SearchFilterComponent,
    DataTableComponent,
    AlertComponent,
    ActionButtonComponent
  ],
  exports: [
    // Modules Angular
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule, // Ré-export de MaterialModule,
    
    // Composants partagés
    ContentCardComponent,
    SearchFilterComponent,
    DataTableComponent,
    AlertComponent,
    ActionButtonComponent
  ]
})
export class SharedModule { }
