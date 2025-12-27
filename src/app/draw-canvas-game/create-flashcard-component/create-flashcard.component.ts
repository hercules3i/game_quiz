import {
  Component,
  ViewChild,
  Input,
} from "@angular/core";
import { IonModal } from "@ionic/angular";
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ServiceService } from 'src/app/providers/service.service';
import { AudioRecorderService } from 'src/app/providers/audio-recorder.service';
import { getIsDoQuiz } from "../draw-canvas-game.page";
import {
  fileEventToBase64,
  isStringCorrect,
  createImageElement,
} from "../utils";
import { DrawingCanvas } from "../draw-canvas-game.page";
import {
  createFlashcard,
  getChildByName,
  handleFlashcard,
  cardWidth,
  padding,
  createFlashcardInfoFace,
  createPlayAudioButton,
  iconMoreButton,
  cardHeight,
} from "../flashcard-utils";
import { fabric } from 'fabric';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'create-flashcard-modal',
  styleUrls: ["./create-flashcard.component.scss"],
  templateUrl: './create-flashcard.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
  ],
})
export class CreateFlashcardComponent {
  name: string;
  @ViewChild('modal', { static: false }) modal!: IonModal;
  @Input() drawingCanvas: DrawingCanvas | null = null;

  isEditing = false;
  flashcard: fabric.Group | undefined;

  imageData = "";
  audioData1 = "";
  audioData2: string | null = null;
  audioLabel1 = "Audio 1";
  audioLabel2 = "Audio 2";
  englishMeaning = "";
  partOfSpeech = "Noun";
  spelling = "";
  example1: string | undefined;
  example2: string | undefined;
  localeCode = 'en-US';

  constructor(
    public service: ServiceService,
    private translate: TranslateService,
    private audioRecorder: AudioRecorderService,
  ) {
    this.name = "Angular";
  }

  async updateImageData(event: Event) {
    try {
      const base64 = await fileEventToBase64(event);
      this.imageData = base64;
    } catch (e) {
      this.service.messageError(this.translate.instant('FLASHCARD.INVALID_FILE_FORMAT'))
    }
  }

  updateAudioData1(base64: string) {
    this.audioData1 = base64;
  }

  updateAudioData2(base64: string) {
    this.audioData2 = base64;
  }

  openModal() {
    this.isEditing = false;
    this.modal.backdropDismiss = false;
    this.modal.present();
  }

  openModalEditing(flashcard: fabric.Group) {
    this.getFlashcardData(flashcard);

    this.isEditing = true;
    this.modal.backdropDismiss = false;
    this.modal.present();
  }

  closeModal() {
    this.isEditing = false;
    this.modal.dismiss();
  }

  async createFlashcard() {
    if (!this.validate()) {
      this.service.messageError(this.translate.instant('FLASHCARD.VALIDATE_ERROR'))
      return;
    }

    const group = await createFlashcard(
      this.englishMeaning,
      this.spelling,
      this.partOfSpeech,
      this.imageData,
      this.audioLabel1,
      this.audioLabel2,
      this.audioData1,
      this.audioData2 || undefined,
      this.localeCode,
      this.example1,
      this.example2,
    );

    handleFlashcard(group, getIsDoQuiz, this.audioRecorder, this.translate);
    if (this.drawingCanvas) {
      this.drawingCanvas.canvas.add(group);
    }
    this.closeModal();
    this.resetForm();
  }

  getFlashcardData(flashcard: fabric.Group) {
    this.flashcard = flashcard;
    this.localeCode = (flashcard as any).localeCode || 'en-US';

    const backFace = flashcard.item(1);
    if (!backFace) return;

    const englishMeaningObj = getChildByName(backFace, 'flashcard-backface-englishMeaning');
    const spellingObj = getChildByName(backFace, 'flashcard-backface-spelling');
    const partOfSpeechObj = getChildByName(backFace, 'flashcard-backface-partOfSpeech');

    if (englishMeaningObj && 'text' in englishMeaningObj) {
      this.englishMeaning = (englishMeaningObj as any).text;
    }
    if (spellingObj && 'text' in spellingObj) {
      this.spelling = (spellingObj as any).text;
    }
    if (partOfSpeechObj && 'text' in partOfSpeechObj) {
      this.partOfSpeech = (partOfSpeechObj as any).text;
    }
    this.example1 = (flashcard as any).example1;
    this.example2 = (flashcard as any).example2;
  }

  async updateFlashcard() {
    if (!this.flashcard) return;
    this.normalizeData();

    const frontFace = this.flashcard.item(0);
    const backFace = this.flashcard.item(1);
    const infoFace = this.flashcard.item(2);
    if (!frontFace || !backFace) return;

    if (this.imageData.length) {
      const instance = frontFace.item(1);
      if (instance) {
        const img = await createImageElement(this.imageData);
        if ('setElement' in instance) {
          (instance as any).setElement(img);
        }
      }

      if (instance) {
        const maxWidth = cardWidth - padding;
        instance.scaleToWidth(maxWidth);
        instance.scaleToWidth(maxWidth);
      }

      console.log('updated image data');
    }

    if (this.audioData1.length) (this.flashcard as any).audioData1 = this.audioData1;
    if (this.localeCode.length) (this.flashcard as any).localeCode = this.localeCode;

    if (this.englishMeaning.length) {
      const obj = getChildByName(backFace, 'flashcard-backface-englishMeaning');
      if (obj && 'text' in obj) {
        (obj as any).text = this.englishMeaning;
      }
    }

    if (this.spelling.length) {
      const obj = getChildByName(backFace, 'flashcard-backface-spelling');
      if (obj && 'text' in obj) {
        (obj as any).text = this.spelling;
      }
    }

    if (this.partOfSpeech.length) {
      const obj = getChildByName(backFace, 'flashcard-backface-partOfSpeech');
      if (obj && 'text' in obj) {
        (obj as any).text = this.partOfSpeech;
      }
    }

    // Examples
    if (this.example1 || this.example2) {
      if (infoFace) {
        const examples = [];
        if (this.example1) {
          examples.push('E.g.1: ' + this.example1);
          (this.flashcard as any).example1 = this.example1;
        }
        if (this.example2) {
          examples.push('E.g.2: ' + this.example2);
          (this.flashcard as any).example2 = this.example2;
        }

        const content = examples.join('\n\n');
        const textObj = infoFace.item(1);
        if (textObj && 'text' in textObj) {
          (textObj as any).text = content;
        }

        console.log('updated examples to', content);
      } else {
        const infoFace = createFlashcardInfoFace(this.example1, this.example2);
        infoFace.set('visible', false);
        infoFace.top = cardHeight / -2;
        this.flashcard.add(infoFace);

        const moreButton = new fabric.Text(iconMoreButton, {
          name: 'flashcard-more-button',
          originY: 'top',
          originX: 'right',
          top: padding / 2 - (cardHeight / 2),
          left: (cardWidth / 2) - (padding / 2),
          fontSize: 16,
          textAlign: 'right',
        });
        backFace.add(moreButton);

        console.log('Created new infoFace');
      }
    }

    // Audio 2
    if (this.audioData2 && this.audioData2.length) {
      (this.flashcard as any).audioData2 = this.audioData2;

      const audioButton2 = getChildByName(backFace, 'flashcard-backface-audioButton2');
      if (!audioButton2) {
        const audioButton2 = createPlayAudioButton('Audio 2', {
          name: 'flashcard-backface-audioButton2',
          top: 35,
          originY: 'top',
        });

        backFace.add(audioButton2);
        console.log("Created a new audioButton2");
      }
    }

    // Audio label 1
    if (this.audioLabel1.length) {
      const audioButton1 = getChildByName(backFace, 'flashcard-backface-audioButton1');
      if (audioButton1) {
        const textObj = (audioButton1 as any).item(0);
        if (textObj && 'text' in textObj) {
          (textObj as any).text = this.audioLabel1;
        }
      }
    }

    // Audio label 2
    if (this.audioLabel2.length) {
      const audioButton2 = getChildByName(backFace, 'flashcard-backface-audioButton2');

      if (audioButton2) {
        const textObj = (audioButton2 as any).item(0);
        if (textObj && 'text' in textObj) {
          (textObj as any).text = this.audioLabel2;
        }
      }
    }

    if (this.flashcard.canvas) {
      this.flashcard.canvas.renderAll();
    }
    this.closeModal();
    this.resetForm();
  }

  normalizeData() {
    this.imageData = this.imageData.trim();
    this.audioData1 = this.audioData1.trim();
    if (this.audioData2) this.audioData2 = this.audioData2.trim();
    this.audioLabel1 = this.audioLabel1.trim();
    this.audioLabel2 = this.audioLabel2.trim();
    this.localeCode = this.localeCode.trim();
    this.englishMeaning = this.englishMeaning.trim();
    this.spelling = this.spelling.trim();
    this.partOfSpeech = this.partOfSpeech.trim();
    if (this.example1) this.example1 = this.example1.trim();
    if (this.example2) this.example2 = this.example2.trim();
  }

  validate(): boolean {
    this.normalizeData();

    if (
      !isStringCorrect(this.imageData)
      || !isStringCorrect(this.audioData1)
      || !isStringCorrect(this.englishMeaning)
      || !isStringCorrect(this.spelling)
      || !isStringCorrect(this.partOfSpeech)
    ) return false;

    if (!isStringCorrect(this.audioLabel1)) this.audioLabel1 = "Audio 1";
    if (!isStringCorrect(this.audioLabel2)) this.audioLabel2 = "Audio 2";

    return true;
  }

  resetForm() {
    this.imageData = "";
    this.audioData1 = "";
    this.audioData2 = "";
    this.englishMeaning = "";
    this.spelling = "";
    this.partOfSpeech = "";
    this.example1 = "";
    this.example2 = "";
  }
}
