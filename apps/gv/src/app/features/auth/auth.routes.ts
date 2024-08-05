import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'signin' },

  {
    loadComponent: () =>
      import('./singup/singup.component').then((c) => c.SingupComponent),
    path: 'signup',
  },

  {
    loadComponent: () =>
      import('./singin/singin.component').then((c) => c.SinginComponent),
    path: 'signin',
  },
];
