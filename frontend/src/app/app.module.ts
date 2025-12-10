import { NgModule, CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, registerLocaleData } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpErrorInterceptor } from './core/errors/http-error.interceptor'; // Mise à jour du chemin
import { GlobalErrorHandler } from './core/errors/global-error-handler'; // Import du gestionnaire global
import { EntityCrudService } from './shared/services/entity-crud.service'; // Import du service CRUD générique
import localeFr from '@angular/common/locales/fr';

import { AppComponent } from './app.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { StartupLoaderComponent } from './core/components/startup-loader/startup-loader.component';

// Core module qui regroupe les services et composants partagés
import { CoreModule } from './core/core.module';

// Module de tags avancés
import { TagsAdvancedModule } from './features/tags-advanced/tags-advanced.module';
import { MaterialModule } from './core/material/material.module';
import { WorkspaceSwitcherComponent } from './shared/components/workspace-switcher/workspace-switcher.component';

// Import du guard d'authentification
import { AuthGuard } from './core/guards/auth.guard';
import { WorkspaceSelectedGuard } from './core/guards/workspace-selected.guard';

// Définition des routes de l'application
const routes: Routes = [
  // Routes publiques pour la réinitialisation de mot de passe
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/pages/forgot-password/forgot-password-page.component').then(c => c.ForgotPasswordPageComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/pages/reset-password/reset-password-page.component').then(c => c.ResetPasswordPageComponent)
  },

  // Route de connexion (publique)
  { 
    path: 'login', 
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  
  // Sélection de la base de travail (protégée par auth mais sans exigence de workspace déjà choisi)
  {
    path: 'select-workspace',
    loadComponent: () => import('./features/workspaces/select-workspace/select-workspace.component')
      .then(c => c.SelectWorkspaceComponent),
    canActivate: [AuthGuard]
  },

  // Administration du workspace courant (OWNER)
  {
    path: 'workspace/admin',
    loadComponent: () => import('./features/workspaces/workspace-admin/workspace-admin.component')
      .then(c => c.WorkspaceAdminComponent),
    canActivate: [AuthGuard, WorkspaceSelectedGuard]
  },
  
  // Route directe vers le dashboard (protégée)
  { 
    path: '', 
    component: DashboardComponent,
    pathMatch: 'full',
    canActivate: [AuthGuard, WorkspaceSelectedGuard]
  },
  
  // Routes des features avec lazy loading (toutes protégées)
  { 
    path: 'tags', 
    redirectTo: 'parametres/tags',
    pathMatch: 'full'
  },
  { 
    path: 'tags-advanced', 
    loadChildren: () => import('./features/tags-advanced/tags-advanced.module').then(m => m.TagsAdvancedModule),
    canActivate: [AuthGuard, WorkspaceSelectedGuard]
  },
  { 
    path: 'parametres', 
    loadChildren: () => import('./features/settings/settings.module').then(m => m.SettingsModule),
    canActivate: [AuthGuard, WorkspaceSelectedGuard]
  },
  { 
    path: 'exercices', 
    loadChildren: () => import('./features/exercices/exercices.module').then(m => m.ExercicesModule),
    canActivate: [AuthGuard, WorkspaceSelectedGuard],
    data: { preload: true } // Précharger le module
  },
  { 
    path: 'entrainements', 
    loadChildren: () => import('./features/entrainements/entrainements.module').then(m => m.EntrainementsModule),
    canActivate: [AuthGuard, WorkspaceSelectedGuard]
  },
  { 
    path: 'echauffements', 
    loadChildren: () => import('./features/echauffements/echauffements.module').then(m => m.EchauffenementsModule),
    canActivate: [AuthGuard, WorkspaceSelectedGuard]
  },
  { 
    path: 'situations-matchs', 
    loadChildren: () => import('./features/situations-matchs/situations-matchs.module').then(m => m.SituationsMatchsModule),
    canActivate: [AuthGuard, WorkspaceSelectedGuard]
  },
  // Route de debug export/import supprimée (ancien système)
  
  // Route de fallback
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    StartupLoaderComponent
    // Tous les autres composants sont maintenant déclarés dans leurs modules respectifs
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Ajout pour permettre l'utilisation des composants Angular Material
  imports: [
    BrowserModule,
    BrowserAnimationsModule, // Nécessaire pour Angular Material
    ReactiveFormsModule,
    FormsModule,  // Ajouté pour les formulaires template-driven
    CommonModule, // Ajout de CommonModule pour *ngIf
    MaterialModule,
    RouterModule.forRoot(routes),
    CoreModule, // Module core qui inclut MaterialModule et HttpClientModule
    WorkspaceSwitcherComponent
    // Tous les modules (ExercicesModule, TagsModule, TagsAdvancedModule, TrainingsModule) sont chargés en lazy loading
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    // Fournisseur pour le gestionnaire d'erreurs global
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    // Fournisseur pour l'intercepteur d'erreurs HTTP
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
    EntityCrudService // Fournir le service CRUD générique
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

// Enregistrer les données de locale française pour pipes (DatePipe, CurrencyPipe, etc.)
registerLocaleData(localeFr);
