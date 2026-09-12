import { NgModule, CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, registerLocaleData } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { GlobalErrorHandler } from './core/errors/global-error-handler'; // Import du gestionnaire global
import localeFr from '@angular/common/locales/fr';

import { AppComponent } from './app.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { StartupLoaderComponent } from './core/components/startup-loader/startup-loader.component';

// Core module qui regroupe les services et composants partagés
import { CoreModule } from './core/core.module';

// Seuls les modules Material reellement utilises au demarrage sont charges ici.
// Les ecrans charges a la demande passent par MaterialModule via SharedModule.
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { WorkspaceSwitcherComponent } from './shared/components/workspace-switcher/workspace-switcher.component';
import { EnvoisClocheComponent } from './shared/components/envois-cloche/envois-cloche.component';

// Import du guard d'authentification
import { AuthGuard } from './core/guards/auth.guard';
import { WorkspaceSelectedGuard } from './core/guards/workspace-selected.guard';
import { MobileGuard } from './core/guards/mobile.guard';
import { TitleStrategy } from '@angular/router';
import { PageTitleStrategy } from './core/services/page-title.strategy';

// Définition des routes de l'application
const routes: Routes = [
  // Routes publiques pour l'authentification
  {
    path: 'forgot-password',
    title: 'Mot de passe oublié',
    loadComponent: () => import('./features/auth/pages/forgot-password/forgot-password-page.component').then(c => c.ForgotPasswordPageComponent)
  },
  {
    path: 'reset-password',
    title: 'Réinitialiser le mot de passe',
    loadComponent: () => import('./features/auth/pages/reset-password/reset-password-page.component').then(c => c.ResetPasswordPageComponent)
  },
  {
    path: 'auth/confirm',
    title: 'Confirmation du compte',
    loadComponent: () => import('./features/auth/pages/confirm-email/confirm-email-page.component').then(c => c.ConfirmEmailPageComponent)
  },

  // Route de connexion (publique)
  { 
    path: 'login', 
    title: 'Connexion',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  
  // Sélection de la base de travail (protégée par auth mais sans exigence de workspace déjà choisi)
  {
    path: 'select-workspace',
    title: 'Choix de l’espace',
    loadComponent: () => import('./features/workspaces/select-workspace/select-workspace.component')
      .then(c => c.SelectWorkspaceComponent),
    canActivate: [AuthGuard]
  },

  // Administration du workspace courant (MANAGER)
  {
    path: 'workspace/admin',
    title: 'Administration de l’espace',
    loadComponent: () => import('./features/workspaces/workspace-admin/workspace-admin.component')
      .then(c => c.WorkspaceAdminComponent),
    canActivate: [AuthGuard, WorkspaceSelectedGuard]
  },
  
  // Route mobile (protégée)
  {
    path: 'mobile',
    title: 'Accueil',
    loadChildren: () => import('./features/mobile/mobile.routes').then(r => r.MOBILE_ROUTES),
    canActivate: [AuthGuard, WorkspaceSelectedGuard]
  },
  
  // Route par défaut : redirection vers login
  // Évite le blocage avec 3 guards sur la route racine
  { 
    path: '', 
    redirectTo: '/login',
    pathMatch: 'full'
  },
  
  // Dashboard accessible via route explicite (protégée)
  { 
    path: 'dashboard', 
    title: 'Tableau de bord',
    component: DashboardComponent,
    canActivate: [AuthGuard, WorkspaceSelectedGuard, MobileGuard]
  },
  
  // Routes des features avec lazy loading (toutes protégées)
  { 
    path: 'tags', 
    redirectTo: 'parametres/tags',
    pathMatch: 'full'
  },
  {
    path: 'admin',
    title: 'Administration',
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard, WorkspaceSelectedGuard, MobileGuard]
  },
  { 
    path: 'parametres', 
    title: 'Paramètres',
    loadChildren: () => import('./features/settings/settings.module').then(m => m.SettingsModule),
    canActivate: [AuthGuard, WorkspaceSelectedGuard, MobileGuard]
  },
  { 
    path: 'exercices', 
    title: 'Exercices',
    loadChildren: () => import('./features/exercices/exercices.module').then(m => m.ExercicesModule),
    canActivate: [AuthGuard, WorkspaceSelectedGuard, MobileGuard],
    data: { preload: true } // Précharger le module
  },
  { 
    path: 'entrainements', 
    title: 'Entraînements',
    loadChildren: () => import('./features/entrainements/entrainements.module').then(m => m.EntrainementsModule),
    canActivate: [AuthGuard, WorkspaceSelectedGuard, MobileGuard]
  },
  { 
    path: 'echauffements', 
    title: 'Échauffements',
    loadChildren: () => import('./features/echauffements/echauffements.module').then(m => m.EchauffenementsModule),
    canActivate: [AuthGuard, WorkspaceSelectedGuard, MobileGuard]
  },
  {
    path: 'situations-matchs',
    title: 'Situations & matchs',
    loadChildren: () => import('./features/situations-matchs/situations-matchs.module').then(m => m.SituationsMatchsModule),
    canActivate: [AuthGuard, WorkspaceSelectedGuard, MobileGuard]
  },
  {
    path: 'lexique',
    title: 'Lexique',
    loadChildren: () => import('./features/lexique/lexique.module').then(m => m.LexiqueModule),
    canActivate: [AuthGuard, WorkspaceSelectedGuard, MobileGuard]
  },
  // Route de debug export/import supprimée (ancien système)
  
  // Route de fallback
  // Adresse inconnue : afficher une page dediee plutot que rediriger en silence
  {
    path: '**',
    title: 'Page introuvable',
    loadComponent: () => import('./features/errors/not-found/not-found.component')
      .then(c => c.NotFoundComponent)
  }
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
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    RouterModule.forRoot(routes),
    CoreModule, // Services, intercepteurs et HttpClientModule
    WorkspaceSwitcherComponent,
    EnvoisClocheComponent
    // Tous les modules (ExercicesModule, TagsModule, TrainingsModule) sont chargés en lazy loading
  ],
  providers: [
    { provide: TitleStrategy, useClass: PageTitleStrategy },
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    // Fournisseur pour le gestionnaire d'erreurs global
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
    // HttpErrorInterceptor est fourni dans CoreModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

// Enregistrer les données de locale française pour pipes (DatePipe, CurrencyPipe, etc.)
registerLocaleData(localeFr);
