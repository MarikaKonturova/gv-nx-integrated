import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'main' },
  {
    loadChildren: () => import('./features/auth/auth.routes').then(auth => auth.authRoutes),
    path: 'auth',
  },

  {
    loadChildren: () => import('./features/main/main.routes').then(c => c.mainRoutes),
    path: 'main',
  },
];
