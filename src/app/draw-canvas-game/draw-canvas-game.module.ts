import { NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DrawCanvasGamePageRoutingModule } from './draw-canvas-game-routing.module';

import {
  DrawCanvasGamePage,
  FileNameComponent,
  MappingComponent,
} from './draw-canvas-game.page';

import { CreateFlashcardComponent } from './create-flashcard-component/create-flashcard.component';
import { GenerateFlashcardComponent } from './generate-flashcard-component/generate-flashcard.component';
import { InputAudio } from './input-audio-component/input-audio.component';

import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    // MappingComponent,
    // FileNameComponent,
    // CreateFlashcardComponent,
    // GenerateFlashcardComponent,
    // InputAudio,
  ],
  imports: [
    IonicModule,
    CommonModule,
    TranslateModule,
    FormsModule,
    //IonicSelectableModule
  ],
  schemas: [
    NO_ERRORS_SCHEMA,
    CUSTOM_ELEMENTS_SCHEMA
  ],
  exports: [
    // MappingComponent,
    // FileNameComponent,
    // CreateFlashcardComponent,
    // GenerateFlashcardComponent,
    // InputAudio,
  ]
})
export class MappingModule { }

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    DrawCanvasGamePageRoutingModule,
    MappingModule,
    DrawCanvasGamePage,
    // KatexModule
  ],
  schemas: [
    NO_ERRORS_SCHEMA,
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class DrawCanvasGamePageModule { }
