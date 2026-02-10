import { Routes } from '@angular/router';

export const MOBILE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./mobile-layout.component').then(c => c.MobileLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/mobile-home/mobile-home.component').then(c => c.MobileHomeComponent),
      },
      {
        path: 'detail/:type/:id',
        loadComponent: () => import('./pages/mobile-detail/mobile-detail.component').then(c => c.MobileDetailComponent),
      },
    ],
  },
];
