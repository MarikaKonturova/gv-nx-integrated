import { Routes } from '@angular/router';

import { MainComponent } from './main.component';

export const mainRoutes: Routes = [
  {
    children: [
      {
        loadComponent: () =>
          import('./map/map.component').then((c) => c.MapComponent),
        path: '',
      },
    ],
    component: MainComponent,
    path: '',
  },
];
