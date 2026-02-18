import { Routes } from '@angular/router';

export const MOBILE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./mobile-layout.component').then(c => c.MobileLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadComponent: () => import('./pages/mobile-home/mobile-home.component').then(c => c.MobileHomeComponent),
      },
      {
        path: 'library',
        loadComponent: () => import('./pages/mobile-library/mobile-library.component').then(c => c.MobileLibraryComponent),
      },
      {
        path: 'terrain',
        loadComponent: () => import('./pages/mobile-terrain/mobile-terrain.component').then(c => c.MobileTerrainComponent),
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/mobile-profile/mobile-profile.component').then(c => c.MobileProfileComponent),
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/mobile-create/mobile-create.component').then(c => c.MobileCreateComponent),
      },
      {
        path: 'create/exercice',
        loadComponent: () => import('./pages/mobile-create/mobile-create-exercice/mobile-create-exercice.component').then(c => c.MobileCreateExerciceComponent),
      },
      {
        path: 'create/entrainement',
        loadComponent: () => import('./pages/mobile-create/mobile-create-entrainement/mobile-create-entrainement.component').then(c => c.MobileCreateEntrainementComponent),
      },
      {
        path: 'create/echauffement',
        loadComponent: () => import('./pages/mobile-create/mobile-create-echauffement/mobile-create-echauffement.component').then(c => c.MobileCreateEchauffementComponent),
      },
      {
        path: 'create/situation',
        loadComponent: () => import('./pages/mobile-create/mobile-create-situation/mobile-create-situation.component').then(c => c.MobileCreateSituationComponent),
      },
      {
        path: 'create/:type',
        loadComponent: () => import('./pages/mobile-create/mobile-create.component').then(c => c.MobileCreateComponent),
      },
      {
        path: 'edit/:type/:id',
        loadComponent: () => import('./pages/mobile-edit/mobile-edit.component').then(c => c.MobileEditComponent),
      },
      {
        path: 'edit/exercice/:id',
        loadComponent: () => import('./pages/mobile-create/mobile-create-exercice/mobile-create-exercice.component').then(c => c.MobileCreateExerciceComponent),
      },
      {
        path: 'edit/entrainement/:id',
        loadComponent: () => import('./pages/mobile-create/mobile-create-entrainement/mobile-create-entrainement.component').then(c => c.MobileCreateEntrainementComponent),
      },
      {
        path: 'edit/echauffement/:id',
        loadComponent: () => import('./pages/mobile-create/mobile-create-echauffement/mobile-create-echauffement.component').then(c => c.MobileCreateEchauffementComponent),
      },
      {
        path: 'edit/situation/:id',
        loadComponent: () => import('./pages/mobile-create/mobile-create-situation/mobile-create-situation.component').then(c => c.MobileCreateSituationComponent),
      },
      {
        path: 'detail/:type/:id',
        loadComponent: () => import('./pages/mobile-detail/mobile-detail-simple.component').then(c => c.MobileDetailComponent),
      },
    ],
  },
];
