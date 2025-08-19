import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

// Core module qui regroupe les services et composants partagés
import { CoreModule } from './core/core.module';

// Module de tags avancés
import { TagsAdvancedModule } from './features/tags-advanced/tags-advanced.module';


// Définition des routes de l'application
const routes: Routes = [
  // Route directe vers le dashboard - PRIORITÉ ABSOLUE
  { 
    path: '', 
    component: DashboardComponent,
    pathMatch: 'full'
  },
  // Nouvelles routes pour la navigation réorganisée
  
  
  // Routes des features avec lazy loading
  { path: 'tags', loadChildren: () => import('./features/tags/tags.module').then(m => m.TagsModule) },
  { path: 'tags-advanced', loadChildren: () => import('./features/tags-advanced/tags-advanced.module').then(m => m.TagsAdvancedModule) },
  { path: 'exercices', loadChildren: () => import('./features/exercices/exercices.module').then(m => m.ExercicesModule) },
  // Routes pour les entraînements complets
  { path: 'entrainements', loadChildren: () => import('./features/entrainements/entrainements.module').then(m => m.EntrainementsModule) },
  // Routes pour les échauffements
  { path: 'echauffements', loadChildren: () => import('./features/echauffements/echauffements.module').then(m => m.EchauffenementsModule) },
  // Routes pour les situations/matchs
  { path: 'situations-matchs', loadChildren: () => import('./features/situations-matchs/situations-matchs.module').then(m => m.SituationsMatchsModule) },
  // Route de fallback
  { path: '**', redirectTo: '/' }
];

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent
    // Tous les autres composants sont maintenant déclarés dans leurs modules respectifs
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Ajout pour permettre l'utilisation des composants Angular Material
  imports: [
    BrowserModule,
    BrowserAnimationsModule, // Nécessaire pour Angular Material
    ReactiveFormsModule,
    FormsModule,  // Ajouté pour les formulaires template-driven
    CommonModule, // Ajout de CommonModule pour *ngIf
    RouterModule.forRoot(routes),
    CoreModule // Module core qui inclut MaterialModule et HttpClientModule
    // Tous les modules (ExercicesModule, TagsModule, TagsAdvancedModule, TrainingsModule) sont chargés en lazy loading
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
