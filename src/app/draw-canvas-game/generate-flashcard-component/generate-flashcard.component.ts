import {
  Component,
  ViewChild,
  Input,
  ViewEncapsulation,
} from "@angular/core";
// import { IonModal } from "@ionic/angular";
import { ServiceService } from 'src/app/providers/service.service';
import { TranslateService, TranslateModule } from "@ngx-translate/core";
import { OpenAiService } from "src/app/providers/open-ai.service";
import { AudioRecorderService } from "src/app/providers/audio-recorder.service";
import { DrawingCanvas, sleep } from "../draw-canvas-game.page";
import { fabric } from 'fabric';
import {
  createFlashcard,
  handleFlashcard,
  cardWidth, cardHeight,
  padding, scale,
} from "../flashcard-utils";
import {
  base64ToAudioUrl,
  base64ToImageDataUrl,
  bufferToBase64,
  pickImageFromDevice,
  resizeImageFileToBase64,
} from "../utils";
import { getIsDoQuiz, getCurrentDeviceSize } from "../draw-canvas-game.page";
import { PaymentService } from "src/app/providers/payment.service";
import { IonModal } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'generate-flashcard-modal',
  styleUrls: ["./generate-flashcard.component.scss"],
  templateUrl: './generate-flashcard.component.html',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
  ],
})
export class GenerateFlashcardComponent {
  @ViewChild('modal') modal!: IonModal;
  @Input() drawingCanvas: DrawingCanvas | null = null;

  seperator = '___';
  openAiInstruction = "Hãy tạo ra câu trả lời là những từ vựng. "
    + "Nếu người dùng không chỉ định, mặc định là tiếng Anh "
    + "theo chủ đề mà người dùng đưa ra, "
    + "dòng đầu tiên chỉ chứa nội dung Locale Code gồm 5 ký tự theo mẫu sau:\n"
    + "en-US\n"
    + "mỗi dòng tiếp theo dựa theo mẫu sau, "
    + "không kèm theo  số thứ tự, spelling theo định dạng IPA: \n"
    + `<word>___<part of speech>___<spelling>___<example 1>___<example 2>`
  ;

  userPrompt = '';
  localeCode = 'en-US';
  flashcards: Flashcard[] = [];
  isLoading = false;

  cacheStorageName = 'generate-flashcard-media-cache';

  constructor(
    public service: ServiceService,
    private translate: TranslateService,
    private openAi: OpenAiService,
    private audioRecorder: AudioRecorderService,
    private payment: PaymentService
  ) {}

  openModal() {
    this.modal.backdropDismiss = false;
    this.modal.present();
  }

  closeModal() {
    this.modal.dismiss();
  }

  async didPresent() {
    const isEnough = await this.payment.checkAndPurchaseCredit();
    if (!isEnough) {
      this.service.messageError(this.translate.instant('STUDY_WITH_AI.NOT_ENOUGH_CREDIT'));
      this.modal.dismiss();
    }
  }

  async pickImage(flashcardIndex: number) {
    const flashcard = this.flashcards[flashcardIndex];
    if (!flashcard) throw new Error('flashcard is undefined');

    const file = await pickImageFromDevice();
    const base64 = await resizeImageFileToBase64(file);
    flashcard.imageData = base64;
  }

  updateAudioData(flashcardIndex: number, base64: string) {
    const flashcard = this.flashcards[flashcardIndex];
    if (!flashcard) return console.error('flashcard is undefined');

    base64 = base64ToAudioUrl(base64);
    if (!flashcard.audioData1) flashcard.audioData1 = base64;
    else if (!flashcard.audioData2) flashcard.audioData2 = base64;
    else flashcard.audioData1 = base64;
  }

  async generateCompletion() {
    console.log('[generateCompletion] init with prompt:', this.userPrompt);
    this.isLoading = true;

    try {
      const completion = await this.openAi.getOnceCompletion(this.openAiInstruction, this.userPrompt);
      this.flashcards = this.flashcards.concat(this.completionToListOfFlashcards(completion));

      console.log('[generateCompletion] completion:', completion);
    } catch(e) {
      console.error(e);
      this.service.messageError(this.translate.instant('FLASHCARD.GENERATE_IMAGE_ERROR'));
    }

    this.isLoading = false;
  }

  completionToListOfFlashcards(completion: string): Flashcard[] {
    let lines = completion.split('\n');
    lines = lines.filter(line => line.length > 0);

    const flashcards: Flashcard[] = [];
    lines.forEach((line, index) => {
      if (index == 0) return this.updateLocaleCode(line);

      const items = line.split(this.seperator);
      if (items.length < 5) return console.error("Item is missed", items);

      flashcards.push({
        word: items[0],
        partOfSpeech: items[1],
        spelling: items[2],
        examples: [items[3], items[4]],
        localeCode: this.localeCode,
      });
    });

    return flashcards;
  }

  async generateFlashcardImage(flashcardIndex: number) {
    const flashcard = this.flashcards[flashcardIndex];
    if (!flashcard) throw new Error("Flashcard is undefined");
    flashcard.isGeneratingImage = true;

    const prefix = 'flashcard_generated_image_';
    const key = prefix + flashcard.word.trim().toLowerCase();
    const cache = await caches.open(this.cacheStorageName);
    const cachedResponse = await cache.match(key);

    let imageData = '';

    if (cachedResponse) {
      const json = await cachedResponse.json();
      imageData = base64ToImageDataUrl(json.b64_json);
      console.log('[generateFlashcardImage] loaded image', key);
    } else {
      try {
        const res = await this.openAi.generateImage(flashcard.word, '256x256', 'b64_json');
        imageData = base64ToImageDataUrl(res.b64_json);

        cache.put(
          key,
          new Response(JSON.stringify(res))
        );

        console.log('[generateFlashcardImage] cached image', key);
      } catch(e) {
        console.error(e);
        this.service.messageError(this.translate.instant('FLASHCARD.GENERATE_IMAGE_ERROR'));
      }
    }

    flashcard.imageData = imageData;
    flashcard.isGeneratingImage = false;
  }

  async generateFlashcardAudio(flashcardIndex: number) {
    const flashcard = this.flashcards[flashcardIndex];
    if (!flashcard) throw new Error("Flashcard is undefined");
    flashcard.isGeneratingAudio = true;

    try {
      const buffer = await this.openAi.getAudioFromText(flashcard.word);
      const audioData = base64ToAudioUrl(bufferToBase64(buffer));

      flashcard.audioData1 = audioData;
    } catch(e) {
      console.error(e);
      this.service.messageError(this.translate.instant('FLASHCARD.GENERATE_AUDIO_ERROR'));
    }

    flashcard.isGeneratingAudio = false;
  }

  generateAllFlashcardsData() {
    this.generateAllFlashcardAudio();
    this.generateAllFlashcardImage();
  }

  async generateAllFlashcardAudio() {
    let index = 0;
    for (const flashcard of this.flashcards) {
      if (!flashcard.audioData1) {
        await this.generateFlashcardAudio(index);
      }
      index ++;
    }
  }

  async generateAllFlashcardImage() {
    let index = 0;
    for (const flashcard of this.flashcards) {
      if (!flashcard.imageData) {
        await this.generateFlashcardImage(index);
      }
      index ++;
    }
  }

  resetFlashcardData(index: number) {
    const flashcard = this.flashcards[index];
    if (!flashcard) return console.error('flashcard is undefined');

    flashcard.audioData1 = undefined;
    flashcard.audioData2 = undefined;
    flashcard.imageData = undefined;
  }

  deleteFlashcard(index: number) {
    this.flashcards.splice(index, 1);
  }

  validateFlashcard(): boolean {
    if (this.flashcards.length == 0) return false;

    for (const flashcard of this.flashcards) {
      if (!flashcard.audioData1 || !flashcard.imageData) return false;
    }

    return true;
  }

  async drawFlashcardsToCanvas() {
    if (!this.validateFlashcard()) {
      this.service.messageError(this.translate.instant("FLASHCARD.VALIDATE_ERROR"));
      throw new Error("Invalid data");
    }

    const groups = await listFlashcardsToListFabricObjects(
      this.flashcards,
      this.audioRecorder,
      this.translate,
    );

    arrangeIntoGrid(
      groups,
      getCurrentDeviceSize(),
      {
        width: cardWidth * scale,
        height: cardHeight * scale,
        gap: padding,
      },
    );

    if (this.drawingCanvas) {
      this.drawingCanvas.canvas.add(...groups);
    }

    this.flashcards = [];
    this.userPrompt = '';
    this.closeModal();
  }

  updateLocaleCode(localeCode: string) {
    if (localeCode.length) this.localeCode = localeCode;
    else console.error('New localeCode is empty');
  }
}

async function listFlashcardsToListFabricObjects(
  flashcards: Flashcard[],
  audioRecorder: AudioRecorderService,
  translate: TranslateService,
): Promise<fabric.Group[]> {
  const result: fabric.Group[] = [];

  for (const flashcard of flashcards) {
    const group = await createFlashcard(
      flashcard.word,
      flashcard.spelling,
      flashcard.partOfSpeech,
      flashcard.imageData!,
      'Audio 1',
      'Audio 2',
      flashcard.audioData1 || '',
      flashcard.audioData2 || '',
      flashcard.localeCode,
      flashcard.examples[0],
      flashcard.examples[1],
    );

    handleFlashcard(group, getIsDoQuiz, audioRecorder, translate);
    result.push(group);
  }

  return result;
}

export function arrangeIntoGrid(
  objects: fabric.Object[],
  screenSize: BoxSize,
  options: {
    width: number,
    height: number,
    gap: number,
    alignCenter?: boolean,
    marginTop?: number,
  },
): BoxSize {
  const {
    width,
    height,
    gap,
    alignCenter,
    marginTop,
  } = options;
  const objectWidth = width + gap;
  const objectHeight = height + gap;

  const colLength = Math.floor((screenSize.width - gap) / objectWidth);
  const rowLength = Math.ceil(objects.length / colLength);

  let boundLeft = gap;

  const contentWidth = objectWidth * colLength;
  const contentHeight = objectHeight * rowLength;

  if (alignCenter) {
    boundLeft = (screenSize.width - contentWidth + gap) / 2;
  }

  let objectIndex = 0;

  for (let row = 0; row < rowLength; row++) {
    for (let col = 0; col < colLength; col++) {
      const obj = objects[objectIndex];
      if (!obj) break;
      objectIndex++;

      const x = Math.round(objectWidth * col + boundLeft);
      const y = Math.round(objectHeight * row + gap + (marginTop || 0));

      obj.set('originX', 'left');
      obj.set('originY', 'top');
      obj.set('scaleX', width / (obj.width || 1));
      obj.set('scaleY', height / (obj.height || 1));
      obj.set('left', x);
      obj.set('top', y);
      console.log('[arrangeIntoGrid] set obj', objectIndex - 1, 'to', x, y);
    }
  }

  return {
    width: contentWidth + gap,
    height: contentHeight + gap,
  };
}

interface Flashcard {
  word: string,
  spelling: string,
  partOfSpeech: string,
  examples: string[],
  imageData?: string,
  audioData1?: string,
  audioData2?: string,
  isGeneratingImage?: boolean,
  isGeneratingAudio?: boolean,
  localeCode?: string,
}

export interface BoxSize {
  width: number,
  height: number,
}
