import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Composants partagés
import { ContentCardComponent } from './components/content-card/content-card.component';
import { SearchFilterComponent } from './components/search-filter/search-filter.component';
import { DataTableComponent } from './components/data-table/data-table.component';
import { AlertComponent } from './components/alert/alert.component';
import { ActionButtonComponent } from './components/action-button/action-button.component';

// Services partagés
import { HttpGenericService } from './services/http-generic.service';
import { MapperService } from './services/mapper.service';
import { ErrorHandlerService } from './services/error-handler.service';
import { ValidationService } from './services/validation.service';

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
    HttpClientModule,
    
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
    
    // Composants partagés
    ContentCardComponent,
    SearchFilterComponent,
    DataTableComponent,
    AlertComponent,
    ActionButtonComponent
  ],
  providers: [
    // Services partagés
    HttpGenericService,
    MapperService,
    ErrorHandlerService,
    ValidationService
  ]
})
export class SharedModule { }
