import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'draw-canvas-game',
    loadComponent: () => import('./draw-canvas-game/draw-canvas-game.page').then((m) => m.DrawCanvasGamePage).catch((error) => {
      return import('./home/home.page').then((m) => m.HomePage);
    }),
  },
  {
    path: '',
    redirectTo: 'draw-canvas-game',
    pathMatch: 'full',
  },
];
