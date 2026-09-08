import { Routes } from '@angular/router';
import { WriteGuard } from '../../core/guards/write.guard';

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
        path: 'profile',
        loadComponent: () => import('./pages/mobile-profile/mobile-profile.component').then(c => c.MobileProfileComponent),
      },
      {
        path: 'tags',
        loadComponent: () => import('./pages/mobile-tags/mobile-tags.component').then(c => c.MobileTagsComponent),
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/mobile-create/mobile-create.component').then(c => c.MobileCreateComponent),
        canActivate: [WriteGuard],
      },
      {
        path: 'create/exercice',
        loadComponent: () => import('./pages/mobile-create/mobile-create-exercice/mobile-create-exercice.component').then(c => c.MobileCreateExerciceComponent),
        canActivate: [WriteGuard],
      },
      {
        path: 'create/entrainement',
        loadComponent: () => import('./pages/mobile-create/mobile-create-entrainement/mobile-create-entrainement.component').then(c => c.MobileCreateEntrainementComponent),
        canActivate: [WriteGuard],
      },
      {
        path: 'create/echauffement',
        loadComponent: () => import('./pages/mobile-create/mobile-create-echauffement/mobile-create-echauffement.component').then(c => c.MobileCreateEchauffementComponent),
        canActivate: [WriteGuard],
      },
      {
        path: 'create/situation',
        loadComponent: () => import('./pages/mobile-create/mobile-create-situation/mobile-create-situation.component').then(c => c.MobileCreateSituationComponent),
        canActivate: [WriteGuard],
      },
      {
        path: 'create/:type',
        loadComponent: () => import('./pages/mobile-create/mobile-create.component').then(c => c.MobileCreateComponent),
        canActivate: [WriteGuard],
      },
      {
        path: 'edit/:type/:id',
        loadComponent: () => import('./pages/mobile-edit/mobile-edit.component').then(c => c.MobileEditComponent),
        canActivate: [WriteGuard],
      },
      {
        path: 'edit/exercice/:id',
        loadComponent: () => import('./pages/mobile-create/mobile-create-exercice/mobile-create-exercice.component').then(c => c.MobileCreateExerciceComponent),
        canActivate: [WriteGuard],
      },
      {
        path: 'edit/entrainement/:id',
        loadComponent: () => import('./pages/mobile-create/mobile-create-entrainement/mobile-create-entrainement.component').then(c => c.MobileCreateEntrainementComponent),
        canActivate: [WriteGuard],
      },
      {
        path: 'edit/echauffement/:id',
        loadComponent: () => import('./pages/mobile-create/mobile-create-echauffement/mobile-create-echauffement.component').then(c => c.MobileCreateEchauffementComponent),
        canActivate: [WriteGuard],
      },
      {
        path: 'edit/situation/:id',
        loadComponent: () => import('./pages/mobile-create/mobile-create-situation/mobile-create-situation.component').then(c => c.MobileCreateSituationComponent),
        canActivate: [WriteGuard],
      },
      {
        path: 'detail/:type/:id',
        loadComponent: () => import('./pages/mobile-detail/mobile-detail-simple.component').then(c => c.MobileDetailComponent),
      },
    ],
  },
];
