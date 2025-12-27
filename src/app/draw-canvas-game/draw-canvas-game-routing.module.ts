import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DrawCanvasGamePage } from './draw-canvas-game.page';

const routes: Routes = [
  {
    path: '',
    component: DrawCanvasGamePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DrawCanvasGamePageRoutingModule {}
