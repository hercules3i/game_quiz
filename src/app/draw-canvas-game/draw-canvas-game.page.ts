import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  ViewChild,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  IonRouterOutlet,
  MenuController,
  IonModal,
  NavController,
  Platform,
  ModalController,
  ViewDidEnter,
  ViewDidLeave,
  ViewWillLeave,
} from '@ionic/angular';

import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ServiceService } from 'src/app/providers/service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
// import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { ScreenOrientation, OrientationType } from '@capawesome/capacitor-screen-orientation';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { fabric } from 'fabric';
import * as katex from 'katex';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { Storage } from '@ionic/storage-angular';
import { format } from 'date-fns';
import { ImageDefaultService } from 'src/app/providers/image-default.service';
import { GameJsonService } from 'src/app/providers/game-json.service';
import { GameJsonService as GameManageService } from 'src/app/providers/game-manage.service';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { FileSupportService } from 'src/app/providers/file-support.service';
import { CreateFlashcardComponent } from './create-flashcard-component/create-flashcard.component';
import { GenerateFlashcardComponent } from './generate-flashcard-component/generate-flashcard.component';
import { playAudioFromUrl, createFabricImageFromUrl } from './utils';
import { AudioRecorderService } from 'src/app/providers/audio-recorder.service';
import { disableFlashcardInputText, handleFlashcard } from './flashcard-utils';
import { PronunciationAssessment } from './pronunciation-assessment';
declare var webkitSpeechRecognition: any;
import { SpeechRecognition } from '@awesome-cordova-plugins/speech-recognition/ngx';
import { OpenAiService } from 'src/app/providers/open-ai.service';
import { IonButton } from "@ionic/angular/standalone";
import { Howl } from 'howler';

// import * as smartcrop from 'smartcrop';

let vSearch: any;
var windowCanvas: any;
var superThis: any;
var queueThis: any;
var OldFile: any;
var correctAnswers: any[] = [];
var selectedAnswers: any[] = [];
var pool_data: any[] = [];
var currentObjectColorElement: HTMLInputElement;
var quizType = 'quiz-1';
var isDoQuiz = false;

var tempJson: any = null;

var grid = 40;
var height_grid = 40;

var isAddConnection = false;
var currentLine: any = null;
let copiedObject: any;
var snap = 20;
var stanza = 999999;
var isSelectAnswer = false;
var selectedNameObject;
var isSelectPort = false;
var selectedPort: any;
//dont let canvas move out of screen
var isMove = false;
var isGroup = false;
var drawing = false;
var lastSelectedObject = null;
var objCover: any = null;
var isChoosePort = false;
var userID = '';
var isChoosePortUnConnect = false;
var isRemoveConnection = false;
var selectedOrientation = 'horizontal';
var selectedAnswersString;
var correctAnswersString;

let brickProperties = [
  {
    imageUrl: 'boots.svg',
    voice: 'boots.mp3',
  },
  {
    imageUrl: 'cart.svg',
    voice: 'cart.mp3',
  },
  {
    imageUrl: 'chestnut.svg',
    voice: 'chestnut.mp3',
  },
  {
    imageUrl: 'hedgehog.svg',
    voice: 'hedgehog.mp3',
  },
  {
    imageUrl: 'tree.svg',
    voice: 'tree.mp3',
  },
  {
    imageUrl: 'leaf.svg',
    voice: 'leaf.mp3',
  },
  {
    imageUrl: 'pumpkin.svg',
    voice: 'pumpkin.mp3',
  },
  {
    imageUrl: 'umbrella.svg',
    voice: 'umbrella.mp3',
  },
  {
    imageUrl: 'agaric.svg',
    voice: 'agaric.mp3',
  },
  {
    imageUrl: 'mushroom.svg',
    voice: 'mushroom.mp3',
  },
];
let selectObjGame: any = null;
let animationProperties = [
  {
    imageUrl: '/assets/animation/explosion_tank_scene-sheet0.png',
    width: 512,
    height: 162,
    numberImage: 3,
  },
];

// store custom attributes to save and load json
const customAttributes = [
  // canvas
  'backgroundColor',
  'typeGrid',
  'layer',

  // object
  'fontSize',
  'textAlign',
  'underline',
  'fontStyle',
  'cellID',

  // group
  'groupID',

  'name',
  'id',
  'port1',
  'port2',
  'idObject1',
  'idObject2',
  'objectID',
  'objectCode',
  'port',
  'lineID',
  'line2',
  'isDrop',
  'isDrag',
  'isBackground',
  'answerId',
  'text',
  'subTargetCheck',

  // 'isChoosePort',
  'colorBorder',
  'widthBorder',
  'curve',
  'hasShadow',
  'shadowObj',
  'fixed',
  'position',

  'isMoving',
  'isRepeat',
  'isDrawingPath',
  'speedMoving',
  'pathObj',
  'soundMoving',
  'nameSoundMoving',

  'blink',
  'lineStyle',
  'lineType',
  'lockMovementX',
  'lockMovementY',
  'customProps',
  'funct',
  'coord_x1',

  'select',
  'status',
  'colorText',
  'colorTextSelected',
  'colorSelected',
  'colorUnselected',
  'soundSelected',
  'nameSoundSelected',
  'soundUnselected',
  'nameSoundUnselected',
  // 'imageContent',
  'nameImageContent',

  'input',
  'soundTyping',
  'nameSoundTyping',

  'snap',
  'soundSnap',
  'nameSoundSnap',

  // device record
  'nameDevice',
  'device',
  'src',
  'countRecord',
  'files',

  //worksheet
  'soundWorksheet',

  // Audio
  'audioData1',
  'audioData2',
  'localeCode',
  'audioUrl',
  // Flashcard example
  'example1',
  'example2',

  'uuid',

  //Mic
  'MicId',
  'value',
];

@Component({
  selector: 'app-draw-canvas-game',
  templateUrl: './draw-canvas-game.page.html',
  styleUrls: ['./draw-canvas-game.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    CreateFlashcardComponent,
    GenerateFlashcardComponent,
  ],
  providers: [
    SpeechRecognition,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA,
  ],
})
export class DrawCanvasGamePage implements OnInit, OnDestroy, ViewDidEnter, ViewWillLeave, ViewDidLeave {
  alignIcons = [
    { class: 'fa-align-center', visible: true },
    { class: 'fa-align-right', visible: false },
    { class: 'fa-align-left', visible: false },
  ];

  recordingSubscription!: Subscription;
  resultText = '';
  blob: any;

  currentAlignIndex = 0;
  drawingCanvas!: DrawingCanvas;
  Data = null;
  id = create_UUID();
  type = '';
  // canvas = document.createElement('canvas');
  htmlExpression!: SafeHtml;
  html!: SafeHtml;
  JsonCanvas;
  CmtContent;
  showObject = false;
  showCreateGame = false;
  showLayer = false;
  lineTypeValue: any;
  selectedOption1 = '';
  selectedAnswerQuiz = '';
  matchOption = '';
  addConnected = '';
  multiOption = '';
  clickCount = 0;
  quizType = '';
  lastSelectedOption = '';
  isActiveQuiz = false;

  selectedOrientationDisplay = 'horizontal';


  hiddenQuiz1 = false;
  hiddenQuiz2 = false;
  hiddenQuiz3 = false;
  hiddenQuiz4 = false;
  hiddenQuiz11 = false;
  //hiddenQuiz011 = false; Dùng để khi close MenuPopup Multichoose thì vẩn giữ chọn thuộc tính Button trên Header
  hiddenQuiz011 = false;
  hiddenGame = false;
  checkClose = true;
  checkB01 = false;
  checkB02 = false;


  svg: any;
  updateContentApi = 'MobileLogin/UpdateCommentCardJobJson';
  updateCanvasApi = 'MobileLogin/UpdateCommentJsonCanvas';
  channelExport = '';
  channelCanvas = '';
  bgColor = '#ffc107';
  isHiddenExport = false;
  createdBy = '';
  teacher = '';

  @ViewChild('mappingModal', { static: false }) mappingModal?: MappingComponent;
  @ViewChild('fileNameModal', { static: false }) fileNameModal?: FileNameComponent;
  @ViewChild('createFlashcardModal', { static: false }) _createFlashcardModal?: CreateFlashcardComponent;
  @ViewChild('generateFlashcardModal', { static: false }) _generateFlashcardModal?: GenerateFlashcardComponent;
  
  get createFlashcardModal(): CreateFlashcardComponent | any {
    return this._createFlashcardModal || { openModal: () => {}, openModalEditing: () => {} };
  }
  
  get generateFlashcardModal(): GenerateFlashcardComponent | any {
    return this._generateFlashcardModal || { openModal: () => {} };
  }

  isBrowser = false;
  test = false;
  isLocalOnly = false;
  latexExpression = 'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}';
  customAttributes = [...customAttributes];
  data: any;
  @ViewChild('modal', { static: false }) modal?: IonModal;
  imageFileName = '';
  listJsonCanvas = [];
  updateListJsonCanvasApi = '';
  queryFileName: string | null = null;
  jsonFileName = '';
  indexJson = -1;
  // listLocalJson: FileJson[] = [];
  // private _storage: Storage | null = null;
  @ViewChild('modalAttribution', { static: false }) modalAttribute?: IonModal;
  shadowStatus: any;
  blinkStatus: any;
  textColorValue: any;
  borderColorValue: any;
  fillColorValue: any;
  borderRadiusValue: any;
  borderWidthValue: any;
  fontFamilyValue: any;
  fontSizeValue: any;
  answerMutipleValue!: string;
  matchObjectType!: string;
  ObjectPosValue: any;
  lineColorValue: any;
  lineWidthValue: any;
  matchObjectLineWidthValue: any;
  gameMode = 'constraint';
  jsonContentSave = '';
  currentActiveFlashcard: fabric.Group | undefined;

  constructor(
    private speechRecognition: SpeechRecognition,
    private sanitizer: DomSanitizer,
    public service: ServiceService,
    public openAi: OpenAiService,
    private translate: TranslateService,
    @Optional() private routerOutlet: IonRouterOutlet,
    private menuCtrl: MenuController,
    public router: Router,
    private route: ActivatedRoute,
    public navCtrl: NavController,
    // public iab: InAppBrowser,
    public platform: Platform,
    private http: HttpClient,
    private modalCtrl: ModalController,
    // private socketIo: SocketIo,
    private storage: Storage,
    private file: File,
    private fileOpener: FileOpener,
    public imageDefaultService: ImageDefaultService,
    public gameJson: GameJsonService,
    public gameManage: GameManageService,
    public fileSupport: FileSupportService,
    private audioRecorder: AudioRecorderService,
  ) {
    try {
      let datas: any = {
        queryParams: {
          id: '1326',
          JsonCanvas: null,
          UpdateContentApi: '',
          UpdateCanvasApi: 'MobileLogin/UpdateTutoringJsonCanvas',
          type: 'tutor_schedule',
          createdBy: 'zeta7',
          teacher: 'zeta7',
          CmtContent: null,
          listJsonCanvas: null,
          indexJson: null,
          UpdateListJsonCanvas: null,
          channelExport: null,
          channelCanvas: null,
          isLocalOnly: null
        }
      };
      try {
        if (this.router) {
          const extras = this.router.getCurrentNavigation()?.extras;
          if (extras && extras.queryParams) {
            datas = extras;
          }
        }
      } catch (error) {
      }
      
      try {
        if (this.route) {
          const queryParams = this.route.snapshot.queryParams;
          if (queryParams && Object.keys(queryParams).length > 0) {
            datas.queryParams = { ...datas.queryParams, ...queryParams };
          }
        }
      } catch (error) {
      }
      this.id = datas.queryParams?.id || '1326';
      this.type = datas.queryParams?.type || '';
      this.createdBy = datas.queryParams?.createdBy || '';
      this.teacher = datas.queryParams?.teacher || '';
      this.JsonCanvas = datas.queryParams?.JsonCanvas;
      this.CmtContent = datas.queryParams?.CmtContent;
      this.listJsonCanvas = datas.queryParams?.listJsonCanvas;
      this.indexJson = datas.queryParams?.indexJson ?? -1;
      this.queryFileName = datas.queryParams?.fileName;

      if (datas.queryParams?.gameMode) {
        this.gameMode = datas.queryParams.gameMode;
      }
      if (datas.queryParams?.UpdateContentApi) {
        this.updateContentApi = datas.queryParams.UpdateContentApi;
      }
      if (datas.queryParams?.UpdateCanvasApi) {
        this.updateCanvasApi = datas.queryParams.UpdateCanvasApi;
      }
      if (datas.queryParams?.UpdateListJsonCanvas) {
        this.updateListJsonCanvasApi = datas.queryParams.UpdateListJsonCanvas;
      }
      if (datas.queryParams?.channelExport) {
        this.channelExport = datas.queryParams.channelExport;
      }
      if (datas.queryParams?.channelCanvas) {
        this.channelCanvas = datas.queryParams.channelCanvas;
      }
      if (datas.queryParams?.UpdateContentApi === '') {
        this.isHiddenExport = true;
      }
      if (datas.queryParams?.isLocalOnly) {
        this.isLocalOnly = true;
      }
    } catch (error) {
    }
    
    setTimeout(() => {
      try {
        if (this.platform && !this.platform.is('capacitor')) {
          this.isBrowser = true;
        } else {
          this.isBrowser = true;
        }
      } catch (error) {
        this.isBrowser = true;
      }
      
      try {
        if (!this.isLocalOnly && this.platform) {
          this.platform.pause.subscribe(async () => {
            try {
              if (this.drawingCanvas) {
                this.drawingCanvas.hibernate();
              }
            } catch (error) {
            }
          });
          this.platform.resume.subscribe(async () => {
            try {
              if (this.drawingCanvas && this.service?.userName) {
                this.drawingCanvas.wake(this.service.userName);
              }
            } catch (error) {
            }
          });
        }
      } catch (error) {
      }
    }, 0);
  }



  async ngOnInit() {
    try {
      if (this.routerOutlet) {
        this.routerOutlet.swipeGesture = false;
      }
    } catch (error) {
    }
    try {
      // const storage = await this.storage.create();
      // this._storage = storage;
      this.drawingColor = '#33FF00';
    } catch (error) {
      this.drawingColor = '#33FF00';
    }
    
    try {
      if (this.route) {
        this.route.queryParams.subscribe(params => {
          if (params['gameMode']) {
            this.gameMode = params['gameMode'];
          }
          if (params['id']) {
            this.id = params['id'];
          }
          if (params['type']) {
            this.type = params['type'];
          }
          if (params['createdBy']) {
            this.createdBy = params['createdBy'];
          }
          if (params['teacher']) {
            this.teacher = params['teacher'];
          }
          if (params['JsonCanvas']) {
            this.JsonCanvas = params['JsonCanvas'];
          }
          if (params['CmtContent']) {
            this.CmtContent = params['CmtContent'];
          }
          if (params['isLocalOnly']) {
            this.isLocalOnly = params['isLocalOnly'] === 'true' || params['isLocalOnly'] === true;
          }
        });
      }
    } catch (error) {
    }
  }
  ngOnDestroy() {
    try {
      if (this.routerOutlet) {
        this.routerOutlet.swipeGesture = true;
      }
    } catch (error) {
    }
  }
  async ionViewDidEnter() {
    try {
      if (this.menuCtrl) {
        await this.menuCtrl.enable(false);
      }
    } catch (error) {
    }
    
    try {
      if (this.platform && this.platform.is('capacitor')) {
        await ScreenOrientation.lock({ type: OrientationType.LANDSCAPE });
        await sleep(500);
      }
    } catch (error) {
    }

    try {
      this.renderDrawingCanvas();
    } catch (error) {
    }

    try {
      document.addEventListener('keydown', (e: KeyboardEvent) => {
        // Kiểm tra xem phím Ctrl và phím C đã được nhấn
        if (e.ctrlKey && e.key === 'c') {
          copyObjectQuiz();
        }

        // Kiểm tra xem phím Ctrl và phím V đã được nhấn
        if (e.ctrlKey && e.key === 'v') {
          pasteObjectQuiz(this.audioRecorder, this.translate);
        }
      });
    } catch (error) {
    }
  }

  startRecording2(inputElement: any) {
    if (this.platform.is('capacitor')) {
      this.speechRecognition.hasPermission().then((hasPermission: boolean) => {
        if (!hasPermission) {
          this.speechRecognition.requestPermission();
        } else {
          this.speechRecognition.isRecognitionAvailable().then(() => {
            const listFilter = this.service.ListLanguage.filter(x => x.Code == this.service.language);

            const options = {
              language: listFilter.length > 0 ? listFilter[0].lang : 'vi-VN',
              showPopup: false,
              showPartial: true,
            };

            this.isRecording = true;

            this.recordingSubscription = this.speechRecognition.startListening(options)
              .subscribe({
                next: async (value) => {
                  console.log("[Speech Recognition]", value);
                  this.resultText = value[0];
                  inputElement.value = this.resultText;
                },
                error: (error) => {
                  this.isRecording = false;
                }
              });
          });
        }
      });
    }
  }

  async checkPermission() {
    // Plugins API deprecated in Capacitor 3+, use individual plugin imports instead
    // const { Permissions } = Plugins;
    // const result = await Permissions.checkPermission({ name: 'storage' });
    // if (result.state === 'granted') {
    //   console.log('Storage permission is already granted');
    // } else {
    //   console.log('Storage permission is not granted');
    //   await this.openAi.requestStoragePermission(); // Yêu cầu quyền nếu chưa có
    // }
    await this.openAi.requestStoragePermission(); // Yêu cầu quyền nếu chưa có
  }

  isRecording = false;
  isLoading = false;
  recordedAudioUrl: string | undefined;
  assessment: PronunciationAssessment | null = null;

  startRecording = async (inputElement: any, ID: any) => {
    console.log(this.isRecording)
    if (this.isRecording) {
      console.log("start save audio ...")
      // this.isRecording = true;
      // this.isLoading = true;

      try {
        const { blob } = await this.audioRecorder.startRecordBlobAsync();
        console.log("blob: ", { blob });
        const OldFile = (window as any).OldFile;
        const file = new OldFile([blob], 'pronunciation.mp3', { type: 'audio/mpeg' });
        console.log("file: ", file);
        const transcription = await this.openAi.speechToText(file, 'vi');
        console.log("text: ", transcription);
        inputElement.value = transcription;
        this.recordedAudioUrl = URL.createObjectURL(blob);
        console.log('recordedAudioUrl:', this.recordedAudioUrl);

        this.drawingCanvas.addHeadphonesIcon(this.recordedAudioUrl, inputElement, ID);

        //const file = await this.openAi.blobToFile(blob, 'recording.mp3');
        // const transcript = await this.audioRecorder.transcribeAudio(blob);
        // console.log("Transcribed text:", transcript);
        // inputElement.value = transcript;
      } catch (error) {
        console.error("Error during recording:", error);
      } finally {
        await this.stopRecording();
        // this.isRecording = false;
        // this.isLoading = false;
      }
    }
    else {
      this.stopRecording();
    }

  };

  startTranscription(blob: Blob) {
    // Phát lại âm thanh từ blob
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);

    audio.play().then(() => {
      // Khởi tạo Web Speech API
      const vSearch = new webkitSpeechRecognition();
      vSearch.lang = 'vi-VN'; // Ngôn ngữ
      vSearch.interimResults = false; // Kết quả cuối cùng
      vSearch.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('Recognized Text:', transcript);
        // Xử lý văn bản đã nhận diện ở đây
      };

      audio.onended = () => {
        // Bắt đầu nhận diện giọng nói khi âm thanh đã phát xong
        vSearch.start();
      };
    });
  }

  playAudio(audioUrl: string | null) {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  }

  stopRecording() {
    this.isRecording = false;
    return this.audioRecorder.stopRecord();
  }

  stopRecording2() {
    if (this.recordingSubscription) {
      this.recordingSubscription.unsubscribe();
    }
    this.speechRecognition.stopListening().then(() => {
      this.isRecording = false;
    });
  }

  renderDrawingCanvas() {
    try {
      if (this.drawingCanvas && this.drawingCanvas.canvas) {
        try {
          this.drawingCanvas.canvas.dispose();
        } catch (error) {
        }
      }

      this.drawingCanvas = new DrawingCanvas(this);
      this.drawingCanvas.isLoadLocal = true;
      
      setTimeout(() => {
        try {
          const canvasElement = document.getElementById('drawingCanvas');
          if (canvasElement) {
            this.drawingCanvas.init();
            this.drawingCanvas.disableShapeMode();

            if (this.isLocalOnly) {
              try {
                this.drawingCanvas.loadJsonFromText(this.JsonCanvas);
              } catch (error) {
              }
            }
          } else {
            setTimeout(() => this.renderDrawingCanvas(), 100);
          }
        } catch (error) {
        }
      }, 0);
    } catch (error) {
    }
  }

  async ionViewWillLeave() {
    await ScreenOrientation.lock({ type: OrientationType.PORTRAIT });
  }
  ionViewDidLeave() {
    this.menuCtrl.enable(true);
  }
  zoomInGame() {
    windowCanvas.setZoom(windowCanvas.getZoom() * 1.1);
    console.log(windowCanvas.getZoom());
  }
  zoomOutGame() {
    if (windowCanvas.getZoom() <= 1) {
      return;
    }
    windowCanvas.setZoom(windowCanvas.getZoom() / 1.1);
    console.log(windowCanvas.getZoom());
  }
  resetCanvas() {

    windowCanvas.setZoom(1);
    windowCanvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    windowCanvas.clear();
    this.drawingCanvas.isLoadLocal = true;
    this.drawingCanvas.loadData(this.JsonCanvas);

    // if (!this.interactLesson.hasBackground) {
    //   windowCanvas.clear();
    //   this.interactLesson.loadCanvasJsonNew(this.startingCanvas, windowCanvas);
    // }
    // this.interactLesson.icon = this.listTypeRole[this.indexTypeRole].icon;
    // this.interactLesson.indexTab = this.indexTab;
    // this.interactLesson.reset();
  }

  group() {
    this.drawingCanvas.group();
  }

  unGroup() {
    this.drawingCanvas.unGroup();
  }

  switchToolAction(caseTool: string) {
    switch (caseTool) {
      case 'group':
        this.drawingCanvas.group();
        break;
      case 'unGroup':
        this.drawingCanvas.unGroup();
        break;
      case 'connect':
        this.drawingCanvas.connect();
        break;
      case 'unConnect':
        this.drawingCanvas.unConnect();
        break;
      case 'erase':
        this.toggleErase();
    }
  }
  selectFontSizeOption(selectedFontSize: any) {
    this.drawingCanvas.changeFontSize(selectedFontSize);
  }
  selectBorderRadiusOption(selectedBorderRadius: any) {
    this.drawingCanvas.changeBorderRadius(selectedBorderRadius);
  }
  selectBorderWidthOption(selectedBorderWidth: any) {
    this.drawingCanvas.changeBorderWidth(selectedBorderWidth);
  }
  changeFillColor(color: string) {
    this.drawingCanvas.changeFillColor(color);
  }
  changeLineColor(color: string) {
    this.drawingCanvas.changeLineColor(color);
  }
  changeTextBoxColor(color: string) {
    // this.textColorValue = color;
    this.drawingCanvas.changeTextBoxColor(color);
  }
  changeBorderColor(color: string) {
    this.drawingCanvas.changeBorderColor(color);
  }
  toggleBold() {
    this.drawingCanvas.toggleBold();
  }
  toggleItalic() {
    this.drawingCanvas.toggleItalic();
  }
  selectFontFamilyOption(selectedFontFamily: string) {
    this.drawingCanvas.changeFontFamily(selectedFontFamily);
  }
  toggleAlign() {
    this.drawingCanvas.toggleAlign();
    this.alignIcons[this.currentAlignIndex].visible = false;
    // Chuyển sang icon tiếp theo
    this.currentAlignIndex = (this.currentAlignIndex + 1) % this.alignIcons.length;
    this.alignIcons[this.currentAlignIndex].visible = true;
  }
  toggleUnderline() {
    this.drawingCanvas.toggleUnderline();
  }
  selectLineStyleOption(selectedLineStyle: string) {
    this.drawingCanvas.changeLineStyle(selectedLineStyle);
  }
  selectPenStyleOption(selectPenStyle: string) {
    this.drawingCanvas.changePenStyle(selectPenStyle);
  }
  async exportImage() {
    const img = await this.createImageFromCanvas();
    var random = Math.random();
    var nameImage = 'imagecanvas' + random + '.png';
    console.log('nameImage', nameImage);
    // const dataURL = await this.cropImage(img.src);
    const dataURL = this.removeImageBlanks(img);
    var file = this.dataURLtoFile(dataURL, nameImage);
    // await this.drawingCanvas.wait1sec();
    var host = this.service.Host;
    const options = {};
    const body = new FormData();
    body.append('fileUpload', file);
    console.log('$event.target.files[0]', file);
    body.append('ModuleName', 'SUBJECT');
    body.append('IsMore', 'false');
    body.append('CreatedBy', this.service.userName);
    this.service.postApi(this.service.getHost() + 'MobileLogin/InsertObjectFileSubject', body)
      .subscribe((result: any) => {
        const rs = result;
        if (rs.Error === false) {
          this.service.messageSuccess(this.translate.instant('ADD_COURSE.UPLOAD_FILE_SUCCESS'));
        } else {
          this.service.messageError(rs.Title);
        }
      }),
      (err: any) => {
        this.service.messageSuccess(this.translate.instant('NOTI.NOTI_CONNECTING'));
      };

    var imgnew = `<img src="${host}uploads/repository/SUBJECT/${nameImage}" class="export-image">`;

    const newCmtContent = this.CmtContent + imgnew;
    console.log('CmtContent', newCmtContent);

    const body2 = {
      Id: this.id,
      CmtContent: newCmtContent,
      RefContent: newCmtContent,
      UpdatedBy: this.service.userName,
      MemberId: this.service.userName,
    };
    var oldAPi = 'MobileLogin/UpdateCommentCardJobJson';
    this.service
      .postAPI1(this.service.getHost() + this.updateContentApi, body2)
      .subscribe(
        (result: any) => {
          const rs = result;
          if (rs.Error === false) {
            // this.loadAllRef();
            // this.GetTreeCategory();
            this.service.messageSuccess(
              this.translate.instant('LMS_QUIZ_REF.TS_SUCCESS_UPDATE')
            );
            // this.emitReload();
            // this.modalCtrl.dismiss(rs.Object);
          }
          else {
            this.service.messageError(
              this.translate.instant('LMS_QUIZ_REF.TS_ERROR_UPDATE')
            );
          }
        },
        (error) => {
          this.service.messageSuccess(this.translate.instant('NOTI.NOTI_CONNECTING'));
        }
      );
  }
  async exportImageChannel() {
    const img = await this.createImageFromCanvas();
    const random = Math.random();
    var nameImage = Boolean(this.imageFileName) ? this.imageFileName
      : ('imagecanvas' + random + '.png');
    console.log('nameImage', nameImage);
    // const dataURL = await this.cropImage(img.src);
    const dataURL = this.removeImageBlanks(img);
    var file = this.dataURLtoFile(dataURL, nameImage);
    var host = this.service.Host;
    const options = {};
    const body = new FormData();
    body.append('fileUpload', file);
    console.log('$event.target.files[0]', file);
    body.append('ModuleName', 'SUBJECT');
    body.append('IsMore', 'false');
    body.append('CreatedBy', this.service.userName);
    this.service.postApi(this.service.getHost() + 'MobileLogin/InsertObjectFileMeta', body)
      .subscribe((result: any) => {
        const rs = result;
        if (rs.Error === false) {
          this.service.messageSuccess(this.translate.instant('ADD_COURSE.UPLOAD_FILE_SUCCESS'));

          var imgnew = `<img src="${host}uploads/repository/SUBJECT/${nameImage}">`;

          this.service.publish(this.channelExport, { imgnew, objEdms: rs.Object });
        } else {
          this.service.messageError(rs.Title);
        }
      }),
      (err: any) => {
        this.service.messageSuccess(this.translate.instant('NOTI.NOTI_CONNECTING'));
      };
  }

  removeImageBlanks(imageObject: any) {
    const imgWidth = imageObject.width;
    const imgHeight = imageObject.height;
    var canvas = document.createElement('canvas');
    canvas.setAttribute('width', imgWidth);
    canvas.setAttribute('height', imgHeight);
    var context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(imageObject, 0, 0);

    var imageData = context.getImageData(0, 0, imgWidth, imgHeight);
    var data = imageData.data;
    var getRBG = (x: any, y: any) => {
      var offset = imgWidth * y + x;
      return {
        red: data[offset * 4],
        green: data[offset * 4 + 1],
        blue: data[offset * 4 + 2],
        opacity: data[offset * 4 + 3]
      };
    };
    var isWhite = (rgb: any) =>
      // many images contain noise, as the white is not a pure #fff white
      rgb.red > 200 && rgb.green > 200 && rgb.blue > 200
      ;
    var scanY = (fromTop: any) => {
      var offset = fromTop ? 1 : -1;

      // loop through each row
      for (var y = fromTop ? 0 : imgHeight - 1; fromTop ? (y < imgHeight) : (y > -1); y += offset) {

        // loop through each column
        for (var x = 0; x < imgWidth; x++) {
          var rgb = getRBG(x, y);
          if (!isWhite(rgb)) {
            if (fromTop) {
              return y;
            } else {
              return Math.min(y + 1, imgHeight);
            }
          }
        }
      }
      return null; // all image is white
    };
    var scanX = (fromLeft: any) => {
      var offset = fromLeft ? 1 : -1;

      // loop through each column
      for (var x = fromLeft ? 0 : imgWidth - 1; fromLeft ? (x < imgWidth) : (x > -1); x += offset) {

        // loop through each row
        for (var y = 0; y < imgHeight; y++) {
          var rgb = getRBG(x, y);
          if (!isWhite(rgb)) {
            if (fromLeft) {
              return x;
            } else {
              return Math.min(x + 1, imgWidth);
            }
          }
        }
      }
      return null; // all image is white
    };

    var cropTop = scanY(true);
    var cropBottom = scanY(false);
    var cropLeft = scanX(true);
    var cropRight = scanX(false);
    var cropLeftVal = cropLeft ?? 0;
    var cropRightVal = cropRight ?? imgWidth;
    var cropTopVal = cropTop ?? 0;
    var cropBottomVal = cropBottom ?? imgHeight;
    var cropWidth = cropRightVal - cropLeftVal;
    var cropHeight = cropBottomVal - cropTopVal;

    canvas.setAttribute('width', cropWidth.toString());
    canvas.setAttribute('height', cropHeight.toString());
    // finally crop the guy
    const cropContext = canvas.getContext('2d');
    if (cropContext) {
      cropContext.drawImage(imageObject,
        cropLeftVal, cropTopVal, cropWidth, cropHeight,
        0, 0, cropWidth, cropHeight);
    }

    return canvas.toDataURL();
  }
  createImageFromCanvas() {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      windowCanvas.backgroundColor = '#ffffff';
      const dataURL = windowCanvas.toDataURL();
      const img = document.createElement('img');
      img.src = dataURL;
      img.onload = () => {
        resolve(img);
      };
    });
  }
  dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(',');
    var mime = arr[0].match(/:(.*?);/)[1];
    var bstr = atob(arr[1]);
    var n = bstr.length;
    var u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    var thisWindow: any = window;
    OldFile = thisWindow.OldFile;
    return new OldFile([u8arr], filename, { type: mime });
  }
  drawing() {
    this.modal.present();
  }
  popupAttribute() {
    this.showObjectQuiz11 = false; // default
    this.showObjectQuiz3 = false; // default
    this.showTextStyle = false;
    this.showBoxStyle = false;
    this.showImageStyle = false;
    this.showPenStyle = false;
    this.showpopUp = true;
    this.ObjectPosValue = null;
    this.lineColorValue = null;
    this.lineWidthValue = null;
    this.modalAttribute.present();
    var activeObject = windowCanvas.getActiveObject();
    if (activeObject) {
      console.log('activeObjectzzz', activeObject._objects);
      // currentObjectColorElement = document.getElementById('colorObject');
      // currentObjectColorElement.value = activeObject.fill;
      this.shadowStatus = activeObject.shadow;
      this.ObjectPosValue = activeObject.pos;
      //this.LineStyleValue = activeObject.lineStyle;
      if (activeObject._objects) {
        this.textColorValue = activeObject._objects[1].fill;
        this.borderColorValue = activeObject._objects[0].stroke;
        this.fillColorValue = activeObject._objects[0].fill;
        this.borderRadiusValue = activeObject._objects[0].rx;
        this.borderWidthValue = activeObject._objects[0].strokeWidth;
        this.fontFamilyValue = activeObject._objects[1].fontFamily;
        this.fontSizeValue = activeObject._objects[1].fontSize;
        console.log('fontFamilyValue', this.fontFamilyValue);
        console.log('fontSizeValue', this.fontSizeValue);

      }
      else {
        this.textColorValue = activeObject.fill;
        this.borderColorValue = activeObject.stroke;
        this.fillColorValue = activeObject.fill;
        this.borderRadiusValue = activeObject.rx;
        this.borderWidthValue = activeObject.strokeWidth;
        this.fontFamilyValue = activeObject.fontFamily;
        this.fontSizeValue = activeObject.fontSize;
      }
      if (activeObject.name && (activeObject.name.startsWith('quiz-MutipleObject') || activeObject.name.startsWith('object-box'))) {
        this.showObjectQuiz11 = true;
        if (activeObject.name.startsWith('quiz-MutipleObject-true')) {
          this.answerMutipleValue = 'True';
        }
        else if (activeObject.name.startsWith('quiz-MutipleObject-false')) {
          this.answerMutipleValue = 'False';
        }
      }
      else if (activeObject.name && activeObject.name.startsWith('quiz-matchObj')) {
        this.showObjectQuiz3 = true;
        if (activeObject.name === 'quiz-matchObj-vessel') {
          this.matchObjectType = 'Vessel';
        }
        else if (activeObject.name === 'quiz-matchObj-answer') {
          this.matchObjectType = 'Answer';
        }
        else {
          this.matchObjectType = 'No Choose';
        }
        //get all object line has name connect-line-xxx
        // var listLine = windowCanvas.getObjects().filter(function (obj) {
        //   return obj.name && obj.name.startsWith('connect-line-');
        // });
      }
      if (
        (activeObject.type === 'textbox' || activeObject.type === 'i-text' || activeObject.type === 'text') ||
        (activeObject._objects && activeObject._objects[1] &&
          (activeObject._objects[1].type === 'text' || activeObject._objects[1].type === 'i-text' || activeObject._objects[1].type === 'textbox'))
      ) {
        this.showTextStyle = true;
      }
      else {
        this.showTextStyle = false;
      }
      //check if object or group of object can change border color
      if (
        (activeObject.type === 'rect' || activeObject.type === 'circle' || activeObject.type === 'triangle' || activeObject.type === 'polygon' || activeObject.type === 'ellipse') ||
        (activeObject._objects && activeObject._objects[0] &&
          (activeObject._objects[0].type === 'rect' || activeObject._objects[0].type === 'circle' || activeObject._objects[0].type === 'triangle' || activeObject._objects[0].type === 'polygon' || activeObject._objects[0].type === 'ellipse'))
      ) {
        this.showBoxStyle = true;
        console.log('showBoxStyle', this.showBoxStyle);
      }
      else {
        this.showBoxStyle = false;
      }
      if (activeObject.type === 'image') {
        this.showImageStyle = true;
      }
      if (activeObject.type === 'path' || activeObject.type === 'line') {
        this.showPenStyle = true;
        this.showpopUp = true;
        this.lineColorValue = activeObject.stroke;
        this.lineWidthValue = activeObject.strokeWidth;
      }


      console.log('Line Name', activeObject.name);
      console.log('Line Color', activeObject.stroke);
      console.log('Line Width', activeObject.strokeWidth);
    }
    else {
      this.showpopUp = false;
      console.log('activeObject', activeObject);
    }
  }
  backPage() {
    try {
      windowCanvas._objects.forEach((element: any) => {
        if (element.type === 'image') {
          element.dispose();
        }
      });
      windowCanvas._objects.forEach((element: any) => {
        windowCanvas.remove(element);
      });
      windowCanvas.clear();
      windowCanvas.dispose();
      // var wrapperEl = this.canvases.first;
      // wrapperEl.nativeElement.style.height = 0;
      // wrapperEl.nativeElement.style.weight = 0;
    } catch (error) {
      console.log(error);
    }
    if (this.drawingCanvas) {
      if (!this.isLocalOnly) {
        this.drawingCanvas.clearEvent();
      }
      delete this.drawingCanvas.canvas;
      delete this.drawingCanvas;
    }
    // var endMemory = {
    //   jsHeapSizeLimit: (window.performance as any).memory.jsHeapSizeLimit / 1000000 + " MB",
    //   totalJSHeapSize: (window.performance as any).memory.totalJSHeapSize / 1000000 + " MB",
    //   usedJSHeapSize: (window.performance as any).memory.usedJSHeapSize / 1000000 + " MB",
    // }
    // console.log(endMemory);
    var thisRouter = this.router;
    var userId = this.service.id;
    var navCtrl = this.navCtrl;
    setTimeout(function () {
      if (userId != null && userId != '' && userId != undefined) {
        navCtrl.pop();
      }
      else {
        thisRouter.navigate(['/login']);
      }

      console.log('[backPage] ended');
    }, 500);
    console.log('[backPage] starting');
  }
  presentingElement: any;
  selectedJsonOption!: string;
  selectedImageOption!: string;
  selectImage!: string;
  drawingColor!: string;
  // drawingColor = '#000608';
  selectedColor = 'black';
  selectedWidth = '1';
  selectPen: any;
  @ViewChild('colorInput', { static: false }) colorInput!: ElementRef;
  @ViewChild('rangeInput', { static: false }) rangeInput!: ElementRef;
  changeColor2(value: any) {
    this.selectedColor = value;
    this.drawingCanvas.selectedColor = value;
    windowCanvas.freeDrawingBrush.color = this.selectedColor;
    // this.iconPencil();
    // this.vLinePatternBrush();
    // this.hLinePatternBrush();
    // this.squarePatternBrush();
    // this.diamondPatternBrush();
  }
  changeValue(value: string) {
    this.selectedWidth = value;
    this.drawingCanvas.selectedWidth = value;
    windowCanvas.freeDrawingBrush.width = this.selectedWidth;
    // this.iconPencil();
    // this.vLinePatternBrush();
    // this.hLinePatternBrush();
    // this.squarePatternBrush();
    // this.diamondPatternBrush();
  }

  onImageOptionChange() {
    // console.log('Selected Json Option:', this.selectedImageOption);
  }

  ExitQuizDoMode() {
    isDoQuiz = false;
    this.showMenuQuiz = !this.showMenuQuiz;
    this.drawingCanvas.ExitQuizDoMode(null)
    this.checkClose = true;
  }

  changeColor() {
    console.log('this.colorInput', this.colorInput);
    this.colorInput.nativeElement.click();
  }

  iconRecording() {
    this.drawingCanvas.iconRecording(null);
  }
  iconGame(gameValue: string) {
    this.selectedOption1 = gameValue
    console.log('gameValue', this.selectedOption1);
    if (this.hiddenGame = true) {
      this.hiddenQuiz1 = false;
      this.hiddenQuiz2 = false;
      this.hiddenQuiz3 = false;
      this.hiddenQuiz11 = false;
      this.hiddenQuiz011 = false;
    }
    this.drawingCanvas.iconGame(null);
  }
  iconTriangle() {
    this.drawingCanvas.iconTriangle(null);
  }
  iconCircle() {
    this.drawingCanvas.iconCircle(null);
  }
  iconRoundedRect() {
    this.drawingCanvas.iconRoundedRect(null);
  }
  iconStar() {
    this.drawingCanvas.iconStar(null);
  }
  iconHexagon() {
    this.drawingCanvas.iconHexagon(null);
  }
  iconArrowTo() {
    this.drawingCanvas.iconArrowTo(null);
  }

  iconHeart() {
    this.drawingCanvas.iconHeart(null);
  }
  //Huy edit
  gameQuiz() {
    this.drawingCanvas.gameQuiz(null);
  }

  doQuiz(e: any) {
    isDoQuiz = true;
    isSelectAnswer = false;

    // windowCanvas.forEachObject(function (obj) {
    //   console.log("obj", obj);
    //   if (obj) {
    //     if (obj.name) {
    //       // if (obj._objects) {
    //       //   obj.item(1).exitEditing();
    //       // }y
    //     }
    //   }
    // })

    this.showMenuQuiz = !this.showMenuQuiz;
    this.drawingCanvas.doQuiz(null);

    //kHi vào doQuiz ẩn Header Right
    this.checkClose = false;

    setCursorToViewMode();
  }

  selectAnswerQuiz(selectAnswerQuizId: string) {
    isSelectAnswer = !isSelectAnswer;
    this.selectedAnswerQuiz = selectAnswerQuizId;
    console.log('selectedAnswerQuiz', this.selectedAnswerQuiz);

    this.clickCount++;
    if (this.clickCount === 2) {
      this.selectedAnswerQuiz = null;
      this.clickCount = 0;

      windowCanvas.getObjects().forEach((element: any) => {
        //if element has objects
        if (element._objects) {
          element.item(1).exitEditing();
        }
      });
    }
  }

  createQuiz() {
    this.drawingCanvas.createQuiz(null);
  }

  toggleShadow() {
    this.drawingCanvas.toggleShadow();
    this.shadowStatus = !this.shadowStatus;
  }
  blinkText() {
    this.drawingCanvas.blinkText();
    this.blinkStatus = !this.blinkStatus;
  }

  defaultSetting() {
    this.drawingCanvas.defaultSetting();
  }

  inputObject() {
    this.drawingCanvas.createInputObject(null);
  }

  toggleBringTo() {
    if (this.ObjectPosValue === 'back') {
      this.ObjectPosValue = 'front';
    }
    else {
      this.ObjectPosValue = 'back';
    }
    this.drawingCanvas.toggleBringTo();
  }

  public showTextMode03 = false;

  public showQuiz11 = false;

  public showTextMode6 = false;

  public showTextMode2 = false;

  public showMenuQuiz = true;

  public showObjectQuiz11 = false;

  public showObjectQuiz3 = false;

  public showTextStyle = false;

  public showBoxStyle = false;

  public showImageStyle = false;

  public showPenStyle = false;

  public showpopUp = true;

  toggleTextMode2() {
    this.showTextMode2 = !this.showTextMode2;
  }


  toggleTextMode03() {
    this.showTextMode03 = !this.showTextMode03;
  }


  toggleTextMode04() {
    this.showQuiz11 = !this.showQuiz11;
  }


  toggleTextMode6() {
    this.showTextMode6 = !this.showTextMode6;
  }


  // selectOption(selectedOptionId: string) {
  //   quizType = selectedOptionId;
  //   this.selectedOption1 = selectedOptionId;
  //   console.log('selection', this.selectedOption1);
  //   console.log('quizType: ', quizType);

  //   quizType = selectedOptionId;
  //   console.log('quizType: ', quizType);
  //   this.showTextMode03 = quizType === 'quiz-1';
  //   this.showQuiz11 = quizType === 'quiz-11';
  //   this.showTextMode6 = quizType === 'quiz-3';
  //   this.showTextMode2 = quizType === 'quiz-2';

  //   this.hiddenQuiz1 = false;
  //   this.hiddenQuiz2 = false;
  //   this.hiddenQuiz3 = false;
  //   this.hiddenQuiz4 = false;
  //   this.hiddenQuiz11 = false;
  //   this.hiddenQuiz011 = false;

  //   switch (quizType) {
  //     case 'quiz-1':
  //       console.log(quizType);
  //       this.hiddenQuiz1 = true;
  //       break;
  //     case 'quiz-2':
  //       console.log(quizType);
  //       this.hiddenQuiz2 = true;
  //       break;
  //     case 'quiz-3':
  //       console.log(quizType);
  //       this.hiddenQuiz3 = true;
  //       break;
  //     case 'quiz-4':
  //       console.log(quizType);
  //       this.hiddenQuiz4 = true;
  //       break;
  //     case 'quiz-5':
  //       console.log(quizType);
  //       break;
  //     case 'quiz-11':
  //       console.log(quizType);
  //       this.hiddenQuiz11 = true;
  //       this.hiddenQuiz011 = true;
  //       break;
  //     default:
  //       console.log('Error');
  //   }
  // }

  selectOption(selectedOptionId: string) {
    // Nếu người dùng click vào cùng một quiz, thoát khỏi chế độ chỉnh sửa
    if (this.lastSelectedOption === selectedOptionId) {
        console.log('Thoát chế độ chỉnh sửa');
        this.selectedOption1 = null;
        this.quizType = null;
        this.showTextMode03 = false;
        this.showQuiz11 = false;
        this.showTextMode6 = false;
        this.showTextMode2 = false;

        this.hiddenQuiz1 = false;
        this.hiddenQuiz2 = false;
        this.hiddenQuiz3 = false;
        this.hiddenQuiz4 = false;
        this.hiddenQuiz11 = false;

        this.lastSelectedOption = null; // Reset trạng thái
        return;
    }

    // Cập nhật lựa chọn mới
    this.quizType = selectedOptionId;
    this.selectedOption1 = selectedOptionId;
    this.lastSelectedOption = selectedOptionId; // Lưu trạng thái chọn lần trước

    console.log('selection', this.selectedOption1);
    console.log('quizType: ', this.quizType);

    this.showTextMode03 = this.quizType === 'quiz-1';
    this.showQuiz11 = this.quizType === 'quiz-11';
    this.showTextMode6 = this.quizType === 'quiz-3';
    this.showTextMode2 = this.quizType === 'quiz-2';

    // Hiển thị tất cả các phần tử quiz trước khi xác định phần nào cần ẩn
    this.hiddenQuiz1 = false;
    this.hiddenQuiz2 = false;
    this.hiddenQuiz3 = false;
    this.hiddenQuiz4 = false;
    this.hiddenQuiz11 = false;

    this.hiddenQuiz011 = false;

    // Ẩn quiz theo lựa chọn
    switch (this.quizType) {
      case 'quiz-1':
        this.hiddenQuiz1 = true;
        break;
      case 'quiz-2':
        this.hiddenQuiz2 = true;
        break;
      case 'quiz-3':
        this.hiddenQuiz3 = true;
        break;
      case 'quiz-4':
        this.hiddenQuiz4 = true;
        break;
      case 'quiz-11':
        this.hiddenQuiz11 = true;
        this.hiddenQuiz011 = true;
        break;
      default:
        console.log('Error');
    }
}

  async selectOrientation(selectedOrientationValue: string) {
    this.selectedOrientationDisplay = selectedOrientationValue;
    selectedOrientation = selectedOrientationValue;
    if (selectedOrientation === 'horizontal') {
      await ScreenOrientation.lock({ type: OrientationType.LANDSCAPE });
    }
    else {
      await ScreenOrientation.lock({ type: OrientationType.PORTRAIT });
    }

    await sleep(500);
    this.renderDrawingCanvas();
  }


  CloseMenuPopupQuiz() {
    this.hiddenQuiz1 = false;
    this.hiddenQuiz2 = false;
    this.hiddenQuiz3 = false;
    this.hiddenQuiz11 = false;
    this.hiddenGame = false;

    this.isActiveQuiz = false;
    // this.selectedOption1 = '';
  }

  async loadBackGroundDefault(selectedImage: string) {
    console.log('loadImageDefault');
    console.log('selectedImageOption', selectedImage);
    if (this.imageDefaultService.listLocalImage && this.imageDefaultService.listLocalImage.length > 0) {
      var index = selectedImage;
      var path = this.imageDefaultService.listLocalImage[index].url;
      console.log('path', path);
      const dataUrl = await this.imageDefaultService.loadImage(path);
      this.drawingCanvas.loadBackGroundFromPath(dataUrl);
    }
  }
  onJsonOptionChange() {
    console.log('Selected Json Option:', this.selectedJsonOption);
    this.loadJsonChange(this.selectedJsonOption);
    if (this.gameJson.listLocalJson && this.gameJson.listLocalJson.length > 0) {
      var index = this.selectedJsonOption;
      const file = this.gameJson.listLocalJson[index];
      selectedNameObject = file.fileName;
    }
  }

  async loadJsonChange(index: string | number) {
    if (this.gameJson.listLocalJson && this.gameJson.listLocalJson.length > 0) {
      const file = this.gameJson.listLocalJson[index];
      const rs = await this.gameJson.loadJson(file.url);
      this.drawingCanvas.loadJsonFromText(rs);
    }
  }


  //Hung edit
  checkResult() {
    this.drawingCanvas.checkResult(null);
  }
  addConnection(addConnectValue: string) {
    //console.log('addConnection');
    this.addConnected = addConnectValue;
    console.log('addConnected', this.addConnected);
    this.drawingCanvas.addConnection();
  }
  normalAddimage(e: any) {
    console.log('normalAddimage');
    this.drawingCanvas.addImage(e);
  }

  normalAddAudio(e: any) {
    console.log('normalAddimage');
    this.drawingCanvas.addAudio(e);
  }
  loadJson(e: any) {
    console.log('loadJson');
    this.drawingCanvas.loadJson(e);
  }
  loadBackGround(e) {
    console.log('loadBackGround');
    this.drawingCanvas.loadBackGround(e);
  }
  async loadImageApi() {
    console.log('loadImageApi');
    await this.imageDefaultService.loadImagesApi();
    console.log('listImage', this.imageDefaultService.listLocalImage);
    // this.drawingCanvas.loadImageApi(null);
  }

  async loadJsonApi() {
    await this.gameJson.loadJsonApi();
    console.log(this.gameJson.listLocalJson);
    if (this.gameJson.listLocalJson && this.gameJson.listLocalJson.length > 0) {
      const file = this.gameJson.listLocalJson[0];
      const rs = await this.gameJson.loadJson(file.url);
      this.drawingCanvas.loadJsonFromText(rs);
    }
  }
  replaceImage(e) {
    console.log('replaceImage');
    this.drawingCanvas.replaceImage(e);
  }
  loadImage(e) {
    console.log('loadImage');
    this.drawingCanvas.loadImage(e);
  }
  iconPencil() {
    this.drawingCanvas.canvas.lineType = '';
    this.drawingCanvas.removeDrawLineListener();
    this.selectPen = 1;
    this.drawingCanvas.selectedPen = 1;
    this.drawingCanvas.toggleDrawMode(this.selectedColor, this.selectedWidth);
  }

  changeAnswerSelectValue(changeValue: string) {
    this.drawingCanvas.changeAnswerValue(changeValue);
    this.multiOption = changeValue;
    console.log('multiOption', this.multiOption);
  }

  changeImageSelectValue(changeValue: string) {
    this.drawingCanvas.changeImageValue(changeValue);
    this.matchOption = changeValue;
    console.log('matchVessel', this.matchOption);
  }

  removeConnection(deleteValue: string) {
    isRemoveConnection = true;
    this.matchOption = deleteValue;
    console.log('deleteValue', this.matchOption);
  }
  ConnectLine() {
    this.drawingCanvas.isConnect = !this.drawingCanvas.isConnect;
  }


  changeTextBoxFillColor(color: string) {
    console.log('changeTextBoxFillColor', color);
    this.drawingCanvas.changeTextBoxFillColor(color);
  }

  changeInputTextBoxText(text: string) {
    console.log('changeInputTextBoxText', text);
    this.drawingCanvas.changeInputTextBoxText(text);
  }

  vLinePatternBrush() {
    this.drawingCanvas.removeDrawLineListener();
    this.drawingCanvas.canvas.lineType = '';
    this.selectPen = 2;
    this.drawingCanvas.selectedPen = 2;
    this.drawingCanvas.vLinePatternBrush(this.selectedColor, this.selectedWidth);
  }

  hLinePatternBrush() {
    this.drawingCanvas.removeDrawLineListener();
    this.drawingCanvas.canvas.lineType = '';
    this.selectPen = 3;
    this.drawingCanvas.selectedPen = 3;
    this.drawingCanvas.hLinePatternBrush(this.selectedColor, this.selectedWidth);
  }

  squarePatternBrush() {
    this.drawingCanvas.removeDrawLineListener();
    this.drawingCanvas.canvas.lineType = '';
    this.selectPen = 4;
    this.drawingCanvas.selectedPen = 4;
    this.drawingCanvas.squarePatternBrush(this.selectedColor, this.selectedWidth);
  }

  diamondPatternBrush() {
    this.drawingCanvas.removeDrawLineListener();
    this.drawingCanvas.canvas.lineType = '';
    this.selectPen = 5;
    this.drawingCanvas.selectedPen = 5;
    this.drawingCanvas.diamondPatternBrush(this.selectedColor, this.selectedWidth);
  }

  dotDrawing(event: MouseEvent) {
    this.selectPen = 6;
    this.drawingCanvas.removeDrawLineListener();
    this.drawingCanvas.setFreeDrawingMode(false);
    this.drawingCanvas.pointArray = [];

    // this.drawingCanvas.dotDrawing(event);
    if (this.drawingCanvas.canvas.lineType !== 'dot') {
      this.drawingCanvas.canvas.lineType = 'dot';

      this.drawingCanvas.disableShapeMode();
      this.drawingCanvas.drawing = true;
      this.drawingCanvas.addDrawLineListener();
    }
    else {
      this.drawingCanvas.canvas.lineType = '';
    }
  }

  arcLine() {
    this.drawingCanvas.drawQuadratic();
  }

  simpleDrawing(event: MouseEvent) {
    this.selectPen = 7;
    this.drawingCanvas.pointArray = [];
    this.drawingCanvas.setFreeDrawingMode(false);
    this.drawingCanvas.removeDrawLineListener();
    this.drawingCanvas.drawing = false;

    if (this.drawingCanvas.canvas.lineType !== 'simple') {
      this.drawingCanvas.canvas.lineType = 'simple';

      this.drawingCanvas.disableShapeMode();
      this.drawingCanvas.drawing = true;
      this.drawingCanvas.addDrawLineListener();
    }
    else {
      this.drawingCanvas.canvas.lineType = '';
    }
  }

  dashLine(event: MouseEvent) {
    this.selectPen = 8;
    this.drawingCanvas.pointArray = [];
    this.drawingCanvas.setFreeDrawingMode(false);
    this.drawingCanvas.removeDrawLineListener();
    this.drawingCanvas.drawing = false;

    if (this.drawingCanvas.canvas.lineType !== 'dash') {
      this.drawingCanvas.canvas.lineType = 'dash';

      this.drawingCanvas.disableShapeMode();
      this.drawingCanvas.drawing = true;
      this.drawingCanvas.addDrawLineListener();
    }
    else {
      this.drawingCanvas.canvas.lineType = '';
    }
  }

  multipleLine(event: MouseEvent) {
    this.selectPen = 9;
    this.drawingCanvas.pointArray = [];
    this.drawingCanvas.setFreeDrawingMode(false);
    this.drawingCanvas.removeDrawLineListener();
    this.drawingCanvas.drawing = false;

    if (this.drawingCanvas.canvas.lineType !== 'multiple') {
      this.drawingCanvas.canvas.lineType = 'multiple';

      this.drawingCanvas.disableShapeMode();
      this.drawingCanvas.drawing = true;
      this.drawingCanvas.addDrawLineListener();
    }
    else {
      this.drawingCanvas.canvas.lineType = '';
    }
  }

  curveDrawinng(event: MouseEvent) {
    this.selectPen = 10;
    this.drawingCanvas.pointArray = [];
    this.drawingCanvas.setFreeDrawingMode(false);
    this.drawingCanvas.removeDrawLineListener();
    this.drawingCanvas.drawing = false;

    if (this.drawingCanvas.canvas.lineType !== 'curve') {
      this.drawingCanvas.canvas.lineType = 'curve';

      this.drawingCanvas.disableShapeMode();
      this.drawingCanvas.drawing = true;
      this.drawingCanvas.addDrawLineListener();
    }
    else {
      this.drawingCanvas.canvas.lineType = '';
    }
  }
  // Huy edit
  //   gameQuiz(event: MouseEvent) {
  //     // Assuming you have a function to create a modal/dialog
  //     const userChoice = this.showObjectOptions(); // This function should display a modal and return the user's choice

  //     // Based on the user's choice, create and add the corresponding object
  //     if (userChoice === 'heart') {
  //         this.createAndAddHeart();
  //     } else if (userChoice === 'rectangle') {
  //         this.createAndAddRectangle();
  //     }
  //     // Add more conditions for other object types as needed
  // }

  resetQuiz() {
    this.hiddenQuiz1 = false;
    this.hiddenQuiz2 = false;
    this.hiddenQuiz3 = false;
    this.hiddenQuiz11 = false;
    this.hiddenQuiz011 = false;
    this.selectedOption1 = '';


    this.drawingCanvas.resetQuiz();

  }

  addText() {
    setTimeout(() => {
      eval('MathJax.typeset()');
    }, 1000);
    this.drawingCanvas.textMode();

    console.log(123, this.htmlExpression);
    const expression = 'widehat{ab}';
    this.svg = katex.renderToString(expression, {
      throwOnError: false,
      output: 'html',
    });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // var image = Canvg.fromString('image/svg+xml');
    // console.log('data', data);
    // const img = new Image();
    // img.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(this.svg);
    // console.log('img.src',img.src);
  }

  addMic() {
    console.log("okj");
    this.drawingCanvas.addMic();
    // this.startRecording();
  }

  addText2(event: Event) {
    console.log('addText2');
    const userInput = document.getElementById('textInput') as HTMLInputElement;
    if (userInput) {
      const enteredText = userInput.value;
      console.log('Text Nhập vào: ', enteredText);
      this.drawingCanvas.toggleShadow();
      this.drawingCanvas.textMode2(enteredText);

      // Reset the value of the input to an empty string
      userInput.value = '';

      // Prevent the default form submission behavior
      event.preventDefault();
    }
  }


  addTextSelectQuiz() {
    console.log('addTextSelectQuiz');
    const userInput = document.getElementById('textAreaSelectQuiz') as HTMLInputElement;
    if (userInput) {
      const enteredText = userInput.value.toUpperCase();
      this.drawingCanvas.textModeSelectQuiz(enteredText);
    }
    this.hiddenQuiz1 = false;
  }

  addTextAreaInputQuiz() {
    console.log('addTextAreaInputQuiz');
    const row = document.getElementById('textAreaSelectQuizRow') as HTMLInputElement;
    const col = document.getElementById('textAreaSelectQuizCol') as HTMLInputElement;
    if (row && col) {
      const enteredRow = row.value;
      const enteredCol = col.value;
      console.log('Text Nhập vào: ', enteredRow, enteredCol);
      this.drawingCanvas.textAreaMNInputQuiz(enteredRow, enteredCol);
    }
  }

  addTextAreaInputQuiz2() {
    const userInput = document.getElementById('textAreaInputQuiz2') as HTMLInputElement;
    if (userInput) {
      const enteredText = userInput.value.toLowerCase();
      this.drawingCanvas.textModeInputQuiz(enteredText);
    }
    this.hiddenQuiz2 = false;
  }

  addLatex() {
    this.drawingCanvas.createLatex();
  }
  async takeScreenshotAnswer() {
    console.log('takeScreenshotAnswer');
    const newName = await this.exportCanvasImage();
    this.gameManage.picHintAnswer = newName;
  }
  async exportCanvasImage() {
    // const img = await this.createImageFromCanvas();
    return new Promise<string>((resolve, reject) => {
      try {
        const canvas = windowCanvas;
        const dataURL = canvas.toDataURL();
        var random = Math.random();
        var nameImage = 'imagecanvas' + random + '.png';
        console.log('nameImage', nameImage);
        // const dataURL = await this.cropImage(img.src);
        // const dataURL = this.removeImageBlanks(img);
        var file = this.dataURLtoFile(dataURL, nameImage);
      } catch (error) {
        console.log(error);
        reject('Failed');
      }
      // await this.drawingCanvas.wait1sec();
      // var host = this.service.Host;
      const options = {};
      const body = new FormData();
      body.append('fileUpload', file);
      console.log('$event.target.files[0]', file);
      body.append('ModuleName', 'SUBJECT');
      body.append('IsMore', 'false');
      body.append('CreatedBy', this.service.userName);
      this.service.postApi(this.service.getHost() + 'MobileLogin/InsertObjectFileSubject', body)
        .subscribe((result: any) => {
          const rs = result;
          if (rs.Error === false) {
            this.service.message(this.translate.instant('ADD_COURSE.UPLOAD_FILE_SUCCESS'));
            resolve(rs.Object);
          } else {
            this.service.messageError(rs.Title);
            reject('Failed');
          }
        }),
        (err) => {
          this.service.messageSuccess(this.translate.instant('NOTI.NOTI_CONNECTING'));
          reject('Failed');
        };
    });
  }

  async saveJsonToLocal(event) {
    const currentDate = format(new Date(), 'ddMMyyyyHHmmss');
    const deviceSize = getCurrentDeviceSize();

    await this.takeScreenshotAnswer();
    console.log(this.customAttributes);
    //mutipleObject quiz to json
    const saveData = {
      canvas: JSON.stringify(windowCanvas.toJSON(this.customAttributes)),
      correctAnswers,
      connectedImagePairs: this.drawingCanvas.connectedImagePairs || [],
      //setting: quizSetting,
      gameType: quizType,
      screenSize: {
        width: deviceSize.width,
        height: deviceSize.height
      },
      picHintAnswer: this.gameManage.picHintAnswer,
      screenOrientation: selectedOrientation,
    };
    this.jsonContentSave = JSON.stringify(saveData);
    const fileName = `${currentDate}.json`;
    this.fileNameModal.txtFileName = fileName;
    this.fileNameModal.action = 'UPDATE';
    this.fileNameModal.openModal();
  }

  async updateJsonCanvas(event) {
    //mutipleObject quiz to json
    await this.takeScreenshotAnswer();
    const saveData = {
      canvas: JSON.stringify(windowCanvas.toJSON(this.customAttributes)),
      correctAnswers,
      //setting: quizSetting,
      gameType: quizType,
      screenSize: getCurrentDeviceSize(),
      picHintAnswer: this.gameManage.picHintAnswer,
      screenOrientation: selectedOrientation,
    };

    const jsonData = JSON.stringify(saveData);
    this.gameManage.currentJson = jsonData;

    if (this.queryFileName) {
      await this.gameManage.storeFileLocal(jsonData, this.queryFileName);
    } else {
      console.log("Has no queryFileName");
    }

    this.backPage();
    console.info("Update json canvas");
    // var element = document.createElement("a");
    // var file = new Blob([JSON.stringify(saveData)], { type: 'text/plain' });
    // element.href = URL.createObjectURL(file);
    // element.download = "myFile.json";
    // element.click();


    // const loadedData = JSON.parse(JSON.stringify(saveData));
    // if (loadedData.blinkStatus !== undefined) {
    //   this.blinkStatus = loadedData.blinkStatus;
    // }

    // // In ra console cho mục đích kiểm tra
    // console.log('Blink Status after loading JSON:', this.blinkStatus);


    // console.log('update comment', event);
    // console.log('comment.JsonCanvas', windowCanvas.toJSON(this.customAttributes));
    // if (this.channelCanvas) {
    //   this.service.publish(this.channelCanvas, JSON.stringify(windowCanvas.toJSON(this.customAttributes)));
    //   this.service.message(
    //     this.translate.instant('LMS_QUIZ_REF.TS_SUCCESS_UPDATE')
    //   );
    // }
    // else if (this.updateListJsonCanvasApi) {
    //   this.prepareFileUpload();
    // }
    // else {
    //   const body = {
    //     Id: this.id,
    //     JsonCanvas: JSON.stringify(windowCanvas.toJSON(this.customAttributes)),
    //     UpdatedBy: this.service.userName,
    //     MemberId: this.service.userName,
    //   };
    //   var oldAPi = 'MobileLogin/UpdateCommentJsonCanvas';
    //   this.service
    //     .postAPI1(this.service.getHost() + this.updateCanvasApi, body)
    //     .subscribe(
    //       (result: any) => {
    //         const rs = result;
    //         if (rs.Error === false) {
    //           // this.loadAllRef();
    //           // this.GetTreeCategory();
    //           this.service.messageSuccess(
    //             this.translate.instant('LMS_QUIZ_REF.TS_SUCCESS_UPDATE')
    //           );
    //           // this.emitReload();
    //           // this.modalCtrl.dismiss(rs.Object);
    //         }
    //         else {
    //           this.service.messageError(
    //             this.translate.instant('LMS_QUIZ_REF.TS_ERROR_UPDATE')
    //           );
    //         }
    //       },
    //       (error) => {
    //         this.service.messageError(
    //           this.translate.instant('NOTI.NOTI_CONNECT_SERVER_ERROR')
    //         );
    //       }
    //     );
    // }
  }
  updateListJsonCanvas() {
    if (!this.listJsonCanvas || !this.listJsonCanvas.length) {
      this.listJsonCanvas = [];
    }
    if (this.indexJson === -1) {
      this.listJsonCanvas.push({
        FileName: this.jsonFileName,
        JsonCanvas: windowCanvas.toJSON(this.customAttributes)
      });
    }
    else {
      this.listJsonCanvas[this.indexJson].JsonCanvas = windowCanvas.toJSON(this.customAttributes);
    }
    const body = {
      Id: this.id,
      ListJsonCanvas: JSON.stringify(this.listJsonCanvas),
      CreatedBy: this.service.userName,
      // MemberId: this.service.userName,
    };
    var oldAPi = 'MobileLogin/UpdateCourseJsonCanvas';
    this.service
      .postAPI1(this.service.getHost() + this.updateListJsonCanvasApi, body)
      .subscribe(
        (result: any) => {
          const rs = result;
          if (rs.Error === false) {
            // this.loadAllRef();
            // this.GetTreeCategory();
            this.service.messageSuccess(
              this.translate.instant('DRAWING_CANVAS.TS_SUCCESS_ADD_CANVAS')
            );
            // this.emitReload();
            // this.modalCtrl.dismiss(rs.Object);
          }
          else {
            this.service.messageError(
              this.translate.instant('DRAWING_CANVAS.TS_FAILED_ADD_CANVAS')
            );
          }
        },
        (error) => {
          this.service.messageSuccess(this.translate.instant('NOTI.NOTI_CONNECTING'));
        }
      );
  }

  canErasing = false;
  @ViewChild('divRubber', { static: false }) divRubber!: ElementRef;
  @ViewChild('canvass', { static: false }) canvass!: ElementRef;
  getActiveObject() {
    return windowCanvas?.getActiveObject();
  }
  toggleErase() {
    var activeObject = windowCanvas.getActiveObject();
    if (activeObject) {
      lastSelectedObject = activeObject;
      console.log('lastSelectedObject', lastSelectedObject);
    }
    if (activeObject) {
      if (activeObject.name && activeObject.name === 'quiz-selectObj') {
      }
      else if (activeObject.name && activeObject.name === 'quiz-inputObj') {
        //remove input object in correct answer
        const index = correctAnswers.findIndex(x => x.objectID === activeObject.objectID);
        if (index !== -1) {
          correctAnswers.splice(index, 1);
        }
      }
      else if (activeObject.name && activeObject.name.startsWith('quiz-matchObj')) {
        this.drawingCanvas.deleteObjects(activeObject.ports);
        activeObject.removeConnection();
      }
      else if (activeObject.name && activeObject.name.startsWith('quiz-MutipleObject')) {
        //remove mutiple object in correct answer
        const index = correctAnswers.findIndex(x => x.objectID === activeObject.objectID);
        if (index !== -1) {
          correctAnswers.splice(index, 1);
        }
      } else
        if (activeObject?._objects && activeObject?._objects[0]?.MicId) {
          var inputActive = document.querySelector('.' + activeObject?._objects[0]?.MicId);
          if (inputActive) {
            inputActive.remove();

          }
          console.log(inputActive);
          const existingIcon = this.drawingCanvas.canvas.getObjects().find(obj => obj.idHeadphone === activeObject?._objects[0]?.MicId);
          if (existingIcon) {
            // this.drawingCanvas.deleteObjects(existingIcon)
            this.drawingCanvas.canvas.remove(existingIcon)
          }
        }

      // Tìm tất cả các đường thẳng kết nối giữa img1 và img2
      const connectedPairs = this.drawingCanvas.userConnectedImagePairs.filter(pair =>
        (pair.id1 === activeObject.objectID || pair.id2 === activeObject.objectID)
      );

      connectedPairs.forEach(pair => {
        if (pair.lines) {
          // Xóa từng đoạn line trong các đường gấp khúc (từ lines array)
          pair.lines.forEach(line => {
            this.drawingCanvas.canvas.remove(line);
          });
        }

        // Loại bỏ cặp này ra khỏi mảng userConnectedImagePairs
        this.drawingCanvas.userConnectedImagePairs = this.drawingCanvas.userConnectedImagePairs.filter(p =>
          !(p.id1 === activeObject.objectID || p.id2 === activeObject.objectID)
        );
      });

      this.drawingCanvas.canvas.renderAll();
      this.drawingCanvas.selectedImagesForLine = [];
    }
    this.drawingCanvas.deleteObjects(windowCanvas.getActiveObjects());
    // this.drawingCanvas.canvas.remove(windowCanvas.getActiveObject());
    this.drawingCanvas.canvas.renderAll();

    // this.canErasing = !this.canErasing;
    // if (this.canErasing && this.divRubber.nativeElement.draggable != 'true') {
    //   console.log('a')

    //   this.divRubber.nativeElement.draggable;
    //   console.log(this.divRubber)

    //   var _this = this;
    //   var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    //   this.divRubber.nativeElement.addEventListener("mousedown", function(e) {
    //     console.log('a1')
    //     _this.drawingCanvas.drawing = false;
    //     _this.drawingCanvas.isErasing = true;
    //     // handle mousedown
    //     e = e || window.event;
    //     e.preventDefault();
    //     // get the mouse cursor position at startup:
    //     pos3 = e.clientX;
    //     pos4 = e.clientY;
    //   });
    //   this.divRubber.nativeElement.addEventListener("mouseup", function(e) {
    //     console.log('a2')

    //     _this.drawingCanvas.drawing = false;
    //     _this.drawingCanvas.controlrubber = false;
    //     _this.drawingCanvas.isErasing = false;
    //   });

    //   this.divRubber.nativeElement.addEventListener("mousemove", function(e) {
    //     console.log('a3', _this.drawingCanvas.isErasing)

    //     if (true) {
    //     console.log('a4')

    //       e = e || window.event;
    //       e.preventDefault();
    //       // calculate the new cursor position:
    //       pos1 = pos3 - e.clientX;
    //       pos2 = pos4 - e.clientY;
    //       pos3 = e.clientX;
    //       pos4 = e.clientY;
    //       // set the element's new position:
    //       _this.divRubber.nativeElement.style.top = (_this.divRubber.nativeElement.offsetTop - pos2) + "px";
    //       _this.divRubber.nativeElement.style.left = (_this.divRubber.nativeElement.offsetLeft - pos1) + "px";
    //       const deleteObjs = [];

    //       _this.drawingCanvas.canvas.getObjects().forEach((obj) => {
    //         const zoom = _this.drawingCanvas.canvas.getZoom();
    //         const points = [
    //           {
    //             top: obj.top * zoom + _this.drawingCanvas.canvas.viewportTransform[5],
    //             left: obj.left * zoom + _this.drawingCanvas.canvas.viewportTransform[4],
    //           },
    //           {
    //             top:
    //               (obj.top + obj.height) * obj.scaleY * zoom +
    //               _this.drawingCanvas.canvas.viewportTransform[5],
    //             left: obj.left * zoom + _this.drawingCanvas.canvas.viewportTransform[4],
    //           },
    //           {
    //             top:
    //               (obj.top + obj.height) * obj.scaleY * zoom +
    //               _this.drawingCanvas.canvas.viewportTransform[5],
    //             left:
    //               (obj.left + obj.width) * obj.scaleX * zoom +
    //               _this.drawingCanvas.canvas.viewportTransform[4],
    //           },
    //           {
    //             top: obj.top * zoom + _this.drawingCanvas.canvas.viewportTransform[5],
    //             left:
    //               (obj.left + obj.width) * obj.scaleX * zoom +
    //               _this.drawingCanvas.canvas.viewportTransform[4],
    //           },
    //         ];

    //         points.some((point) => {
    //           if (
    //             Math.abs(point.top - _this.divRubber.nativeElement.style.top) <=
    //             _this.divRubber.nativeElement.style.offsetHeight &&
    //             Math.abs(point.left - _this.divRubber.nativeElement.style.left) <=
    //             _this.divRubber.nativeElement.style.offsetWidth
    //           ) {
    //             deleteObjs.push(obj);
    //             return true;
    //           }
    //           return false;
    //         });
    //       });

    //       _this.drawingCanvas.deleteObjects(deleteObjs);
    //     }
    //   });
    // }
  }
  //Huy and Lâm 26/12/2023
  // toggleB1() {
  //   this.checkB1 = !this.checkB1;
  //   if (this.checkB1) {
  //     this.checkB2 = false;
  //   }
  // }
  // toggleB2() {
  //   this.checkB2 = !this.checkB2;
  //   if (this.checkB2) {
  //     this.checkB1 = false;
  //   }
  // }

  toggleMoveObject() {
    this.drawingCanvas.setFreeDrawingMode(false);
    this.drawingCanvas.removeDrawLineListener();
    this.drawingCanvas.drawing = false;
    this.drawingCanvas.pointArray = [];
  }
  pasteObjects() {
    if (windowCanvas?.getActiveObject()) {
      this.drawingCanvas.pasteObjects();
    }
  }
  copyObjectQuiz() {
    if (windowCanvas?.getActiveObject()) {
      copyObjectQuiz();
    }
  }
  pasteObjectQuiz() {
    pasteObjectQuiz(this.audioRecorder, this.translate);
  }
  isCurrentlyDrawing() {
    // const permissionToDraw = this.drawingCanvas?.role === 'master' || this.isLocalOnly;
    // const indexD = this.drawingCanvas?.listMember.findIndex(x => x.username === this.service.userName) ?? -1;

    // if (indexD !== -1) {
    //   return (this.drawingCanvas.listMember[indexD].isDrawing && (permissionToDraw || this.drawingCanvas.listMember[indexD].haveDrawingPermission));
    // }
    // else {
    //   return false || this.isLocalOnly;
    // }
    return true;
  }
  isRequestingDrawing() {
    // const permissionToDraw = this.drawingCanvas?.role === 'master';
    // const indexD = this.drawingCanvas?.listMember.findIndex(x => x.username === this.service.userName) ?? -1;
    // if (indexD !== -1) {
    //   return (this.drawingCanvas.listMember[indexD].isDrawing && !(permissionToDraw || this.drawingCanvas.listMember[indexD].haveDrawingPermission));
    // }
    // else {
    //   return false;
    // }
    return false;
  }
  isNotDrawing() {
    const indexD = this.drawingCanvas?.listMember.findIndex(x => x.username === this.service.userName) ?? -1;
    if (indexD !== -1) {
      return !this.drawingCanvas.listMember[indexD].isDrawing;
    }
    else {
      return true;
    }
  }
  openMapping() {
    // this.mappingModal.listUser = this.drawingCanvas.listMember;
    this.mappingModal.openModal();
  }
  async hibernate() {
    // this.drawingCanvas.hibernate();
    // await this.drawingCanvas.wait1sec();
    // this.drawingCanvas.socket.disconnect();
  }
  wake() {
    this.drawingCanvas.wake(this.service.userName);
  }
  prepareFileUpload(isChannel = false) {
    // console.log('rename', data);
    // this.fileNameModal.fileId = data.FileID;
    this.fileNameModal.isChannel = isChannel;
    const random = Math.random();
    if (this.indexJson === -1) {
      this.fileNameModal.txtFileName = 'canvas' + random + '.json';
      this.fileNameModal.action = 'UPDATE';
      this.fileNameModal.openModal();
    }
    else {
      this.jsonFileName = this.listJsonCanvas[this.indexJson].FileName;
      this.updateListJsonCanvas();
    }
  }
  async updateFileName(event) {
    console.log(event);
    this.jsonFileName = event.FileName;
    await this.gameManage.storeFileLocal(this.jsonContentSave, this.jsonFileName);

    if (this.isBrowser) {
      downloadJsonOnBrowser(this.jsonFileName, this.jsonContentSave);
    }
  }
}

export class DrawingCanvas {
  id = 1;
  page: any;
  path = '';
  outerWidth;
  outerHeight;
  color = '#ffffff';
  slides;
  smartAudio;
  canvas: any;
  snap = 20;
  userResult = [];
  displayUserResultGame = [];
  matchQuizData: any;
  userAnswers: any;
  table: any;
  questions: any;
  oldObject: any;
  activeObject: any;
  groupPosition: any;
  startingCanvas: any;
  hasBackground: any;
  platform: Platform;
  router: Router;
  data;
  strokeWidthArea = 25;
  strokeWidthFloor = 25;
  strokeWidthLine = 25;
  strokeWidthRack = 25;
  strokeWidthPosition = 12;
  isDrawLine = false;
  pool_data = [];
  isLoadLocal = true;
  drawingLineTimeId = null;
  isDrawingLine = false;
  typesOfLinesIter = -1;
  typesOfLines = [
    // Default: sine
    null,
    // Custom: tangens
    [
      function (x: any) {
        return Math.max(-10, Math.min(Math.tan(x / 2) / 3, 10));
      },
      4 * Math.PI,
    ],
    // Custom: Triangle function
    [
      function (x: any) {
        const g = x % 6;
        if (g <= 3) {
          return g * 5;
        }
        if (g > 3) {
          return (6 - g) * 5;
        }
      },
      6,
    ],
    // Custom: Square function
    [
      function (x: any) {
        const g = x % 6;
        if (g <= 3) {
          return 15;
        }
        if (g > 3) {
          return -15;
        }
      },
      6,
    ],
  ];
  modalCtrl: ModalController;
  lineArray = [];
  pointArray = [];
  drawLine: any;
  isCurving = false;
  lineType = '';
  isDown: any;
  nextPointStart = null;
  isLoadDataLocal = true;
  drawLineTimeId = null;
  updateAtributes = [
    'top',
    'left',
    'text',
    'width',
    'height',
    'textAlign',
    'fontSize',
    'fill',
    'stroke',
    'strokeWidth',
    'hasControls',
    'lockMovementX',
    'lockMovementY',
    'fontWeight',
    'fontStyle',
    'underline',
    'angle',
    'scaleX',
    'scaleY',
    'skewX',
    'skewY',
    'flipX',
    'originX',
    'flipY',
    'originY',
    'fillRule',
  ];
  role = 'user';
  fetchData: any;
  isFetched = false;
  isDbLoaded = false;
  listMember = [];
  modalWarning: HTMLIonModalElement | null = null;
  firstLoad = true;
  isHibernate = false;
  queue: Queue = new Queue();
  selectedColor = 'black';
  selectedWidth = '1';
  selectedPen = 0;
  length = 0;
  width = 0;
  layerStorage = [
    {
      id: this.randomID(),
      canvas: {
        backgroundColor: '#ffffff',
        gridObj: null,
      },
    },
  ];
  layerNum = 1;
  currentLayer = 1;
  selectedAlignment = 'left'; // Default value align
  shadowStatus = true;
  blinkStatus = true;
  objCover: any = null;
  isChoosePort: any;
  constructor(
    page: any
  ) {
    this.page = page;
    this.path = this.page.path;
    this.outerWidth =
      this.page.service.width !== undefined ? this.page.service.width : 375;
    this.outerHeight =
      this.page.service.height !== undefined ? this.page.service.height : 680;
    this.slides = this.page.slides;
    this.smartAudio = this.page.smartAudio;
    //this.canvas = this.page.canvas;
    this.data = this.page.data;
    this.platform = this.page.platform;
    this.modalCtrl = this.page.modalCtrl;
    this.router = this.page.router;
    this.updateAtributes = this.updateAtributes.concat(
      this.page.customAttributes
    );
  }
  async init() {
    try {
      const canvasElement = document.getElementById('drawingCanvas');
      if (!canvasElement) {
        setTimeout(() => this.init(), 100);
        return;
      }

      var outerWidth = this.outerWidth;
      var outerHeight = this.outerHeight;
      var color = this.color;

      windowCanvas = new fabric.Canvas('drawingCanvas', {
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: color,
      });
      this.width = window.innerHeight;
      this.length = window.innerWidth;
      
      try {
        var scale = this.zoomFull();
        this.enlargeBackground(outerWidth, outerHeight, scale);
        this.resetCenter();
      } catch (error) {
      }

      this.canvas = windowCanvas;
      (windowCanvas as any).id = 1;

      // windowCanvas.clear();
      // this.loadData(this.data);
      //set default background src\assets\background\default_background.png
      //reset canvas

      correctAnswers = [];
      selectedAnswers = [];
      pool_data = [];
      quizType = 'quiz-1';
      isDoQuiz = false;

      isAddConnection = false;
      currentLine = null;
      isSelectAnswer = false;
      isSelectPort = false;
      //dont let canvas move out of screen
      isMove = false;
      isGroup = false;
      drawing = false;
      lastSelectedObject = null;
      objCover = null;
      isChoosePort = false;
      userID = '';
      isChoosePortUnConnect = false;
      isRemoveConnection = false;

      selectedAnswersString = null;
      correctAnswersString = null;

      try {
        windowCanvas.on({
          'object:selected': this.onObjectSelected.bind(this),
          'object:moving': this.onObjectMoving.bind(this),
          'selection:cleared': this.onSelectionCleared.bind(this),
        });
        this.handleWheel();
      } catch (error) {
      }

      try {
        const defaultBackgroundSrc = 'assets/background/default_background.png';
        const screenSize = getCurrentDeviceSize();

        const img = await createFabricImageFromUrl(defaultBackgroundSrc, {
          name: 'background',
          left: screenSize.width / 2,
          top: screenSize.height / 2,
          isBackground: true,
          objectType: '',
          objectCaching: false,
          hasControls: true,
          hasBorders: true,
        });

        const scaleX = screenSize.width / (img.width || 1);
        const scaleY = screenSize.height / (img.height || 1);
        img.set({ scaleX, scaleY });

        windowCanvas.setBackgroundImage(
          img,
          windowCanvas.renderAll.bind(windowCanvas),
          { scaleX, scaleY },
        );
      } catch (error) {
      }

      try {
        windowCanvas.requestRenderAll();
      } catch (error) {
      }
    } catch (error) {
    }
  }

  hibernate() {
    // this.isFetched = false;
    // this.isHibernate = true;
    // const id = `${this.page.type}_${this.page.service.txtPinCode?.trim() ?? ''
    //   }_${this.page.id}`;
    // this.socket.emit('hibernate', `Smart Work ${id}`);
  }
  async wake(userId) {
    // this.isHibernate = false;
    // this.socket.reconnect();
    // const id = `${this.page.type}_${this.page.service.txtPinCode?.trim() ?? ''
    //   }_${this.page.id}`;
    // await this.wait1sec();
    // this.socket.removeAllListeners();
    // await this.wait1sec();
    // this.socket.emit('wake', { room: `Smart Work ${id}`, userID: userId });
    // this.socket.init();
    // await this.wait1sec();
    // this.socketOnHandler();
  }
  zoomOnBackground(object, canvas) {
    var scaleHeight = object.scaleY
      ? (object.height / canvas.height) * object.scaleY
      : object.height / canvas.height;
    var scaleWidth = object.scaleX
      ? (object.width / canvas.width) * object.scaleX
      : object.width / canvas.width;
    if (scaleHeight > scaleWidth) {
      // if object scale with height more than weight, zoom out based on height
      var zoom = 1 / scaleHeight;
      canvas.setZoom(zoom);
      var scale = 'HEIGHT';
    } else {
      // if object scale with height more than weight, zoom out based on height
      var zoom = 1 / scaleWidth;
      canvas.setZoom(zoom);
      scale = 'WIDTH';
    }
    return scale;
  }

  centerOnBackground(object, canvas) {
    var zoom = canvas.getZoom();
    canvas.setZoom(1); // reset zoom so pan actions work as expected
    var vpw = canvas.width / zoom;
    var vph = canvas.height / zoom;
    var x = object.left + object.width / 2 - vpw / 2; // x is the location where the top left of the viewport should be
    var y = object.top + object.height / 2 - vph / 2; // y idem
    if (object.scaleX && object.scaleY) {
      x = object.left + (object.width * object.scaleX) / 2 - vpw / 2; // x is the location where the top left of the viewport should be
      y = object.top + (object.height * object.scaleY) / 2 - vph / 2; // y idem
    }
    canvas.absolutePan({ x, y });
    canvas.setZoom(zoom);
  }
  _setPositionDimensions = function (options) {
    console.log('custom _setPositionDimensions');
    var calcDim = this._calcDimensions(options);
    var correctLeftTop;
    var correctSize = this.exactBoundingBox ? this.strokeWidth : 0;
    this.width = calcDim.width - correctSize;
    this.height = calcDim.height - correctSize;
    if (!options.fromSVG) {
      correctLeftTop = this.translateToGivenOrigin(
        {
          // this looks bad, but is one way to keep it optional for now.
          x: calcDim.left - this.strokeWidth / 2 + correctSize / 2,
          y: calcDim.top - this.strokeWidth / 2 + correctSize / 2,
        },
        'left',
        'top',
        this.originX,
        this.originY
      );
    }
    console.log('correctSize', correctSize);
    if (typeof options.left === 'undefined') {
      this.left = options.fromSVG ? calcDim.left : correctLeftTop.x;
    }
    if (typeof options.top === 'undefined') {
      this.top = options.fromSVG ? calcDim.top : correctLeftTop.y;
    }
    this.pathOffset = {
      x: calcDim.left + this.width / 2 + correctSize / 2,
      y: calcDim.top + this.height / 2 + correctSize / 2,
    };
  };
  _finalizeAndAddPath = async function () {
    console.log('custom _finalizeAndAddPath');
    var ctx = this.canvas.contextTop;
    ctx.closePath();
    if (this.decimate) {
      this._points = this.decimatePoints(this._points, this.decimate);
    }
    var pathData = this.convertPointsToSVGPath(this._points);
    if (this._isEmptySVGPath(pathData)) {
      // do not create 0 width/height paths, as they are
      // rendered inconsistently across browsers
      // Firefox 4, for example, renders a dot,
      // whereas Chrome 10 renders nothing
      this.canvas.requestRenderAll();
      return;
    }

    var path = this.createPath(pathData);
    this.canvas.clearContext(this.canvas.contextTop);
    this.canvas.fire('before:path:created', { path });
    console.log('pen', superThis.selectedPen);
    switch (superThis.selectedPen) {
      case 1:
        path.name = 'pen_1';
        break;
      case 2:
        path.name = 'pen_2';
        break;
      case 3:
        path.name = 'pen_3';
        break;
      case 4:
        path.name = 'pen_4';
        break;
      case 5:
        path.name = 'pen_5';
        break;

      default:
        break;
    }

    path.left = path.pathOffset.x;
    path.top = path.pathOffset.y;
    if (path.stroke && path.stroke.offsetX) {
      path.stroke.offsetX = Math.round(path.stroke.offsetX * 100) / 100;
      path.stroke.offsetY = Math.round(path.stroke.offsetY * 100) / 100;
      console.log(
        `stroke.offsetX: ${path.stroke.offsetX}, stroke.offsetY: ${path.stroke.offsetY}`
      );
    }
    console.log('path', path);
    this.canvas.add(path);
    this.canvas.requestRenderAll();
    path.setCoords();
    this._resetShadow();

    // fire event 'path' created
    this.canvas.fire('path:created', { path });
  };
  mouseDownX = -1;
  mouseDownY = -1;
  PRESS_DURATION = 1000;
  MIN_MOVE = 5;
  timer;
  aborted = false;
  circlePress;
  clearTimer() {
    this.aborted = true;
    windowCanvas.remove(this.circlePress);
    clearTimeout(this.timer);
  }
  handleWheel() {
    var _this = this;
    let isPlaying = false;
    windowCanvas.on('mouse:down', function (opt) {
      if (activeObject && activeObject.name && activeObject !== 'port') {
        isSelectPort = false;
      }
      //curve line connect
      var target = opt.target;
      var mousePos = windowCanvas.getPointer(opt.e);
      if (target && target.type == 'group-extended') {
        var obj = opt.subTargets && opt.subTargets[0];
        if (obj) {
          target._selectedObject = obj;
        } else {
          target._selectedObject = null;
        }
        target._showSelectedBorder();
      }

      if (isChoosePortUnConnect && target && target.name != 'curve-point') {
        if (!objCover) {
          objCover = target;

          const circle = new fabric.Circle({
            top: objCover.top - 20,
            left: objCover.left,
            fill: 'red',
            radius: 6,
            selectable: false,
            ...({ blink: true } as any),
          });

          windowCanvas.add(circle);
          blink(circle);
          objCover.portMark = circle;

          windowCanvas.discardActiveObject();
        } else if (target !== objCover) {
          windowCanvas.remove(objCover.portMark);
          objCover.portMark = null;
          removeLine(target, objCover);
        }
      }
      if (isChoosePort && target && target.name != 'curve-point') {
        if (!objCover) {
          objCover = target;

          const circle = new fabric.Circle({
            top: objCover.top - 20,
            left: objCover.left,
            fill: 'red',
            radius: 6,
            selectable: false,
            ...({ blink: true } as any),
          });

          windowCanvas.add(circle);
          blink(circle);
          objCover.portMark = circle;

          windowCanvas.discardActiveObject();
        } else if (target !== objCover) {
          windowCanvas.remove(objCover.portMark);
          objCover.portMark = null;

          const point1 = findTargetPort(target, 'mt');
          const point2 = findTargetPort(objCover, 'mt');

          point1.x2 = point2.x2;
          point1.y2 = point2.y2;
          const line = makeLine(
            windowCanvas,
            point1,
            target.objectID,
            objCover.objectID,
            'mt',
            'mt',
            randomID(),
            userID
          );
          changeCoordinateConnectLine(target);
          changeCoordinateConnectLine(objCover);
          // line.selectable = true;
          // setDefaultAttributes(line);
          // startActiveObject(line);
          objCover = null;
          windowCanvas.discardActiveObject();
        }
      }
      //quiz-3
      if (currentLine) {
        var activeObject = windowCanvas.getActiveObject();
        if (!activeObject) {
          windowCanvas.remove(currentLine);
          currentLine = null;
          // get all object has quiz-inputObj and set it color
          return;
        }
      }

      // slides.lockSwipes(true);
      if (!_this.drawing) {
        if (opt.target) {
          opt.target.setCoords();
          // opt.target.setPath();
          // opt.target.setCoords();
          windowCanvas.setActiveObject(opt.target);
        }
        var evt = opt.e;
        this.isDragging = true;
        this.selection = true;
        var pointer = windowCanvas.getPointer(opt.e, true);
        var posX = pointer.x;
        var posY = pointer.y;
        this.lastPosX = posX;
        this.lastPosY = posY;

        _this.circlePress = new fabric.Circle({
          left: opt.absolutePointer.x,
          top: opt.absolutePointer.y,
          fill: 'red',
          opacity: 0.5,
          radius: 1,
          originX: 'center',
          originY: 'center',
        });

        windowCanvas.add(_this.circlePress);

        var activeObject = windowCanvas.getActiveObject();
        //mutiple choose
        if (activeObject) {
          console.log('activeObject', activeObject);
          if (activeObject.audioUrl) {
            const audio = new Audio(activeObject.audioUrl);
            audio.controls = true;
            if (!isPlaying) {
              audio.play();
              isPlaying = true;
            } else {
              audio.pause();
              isPlaying = false;
            }
          }
          if (_this.isConnect) {
            _this.selectImageForLine(activeObject);
          } else {
            _this.selectedImagesForLine = []
          }
          //multipleObjectEvent(activeObject);
          //inputObjectEvent(activeObject);

          //exit editing in quiz-inputObj if change object
          var objs = windowCanvas.getObjects();
          objs.forEach((obj) => {
            if (obj && obj.name === 'quiz-inputObj' && obj !== activeObject) {
              console.log('exit');
              obj.item(1).exitEditing();
            }
          });
          var currentObjectColorElement =
            document.getElementById('answer-value');
          console.log('currentObjectColorElement', currentObjectColorElement);

          if (activeObject.name == 'quiz-flashcard') {
            _this.page.currentActiveFlashcard = activeObject;
          } else {
            _this.page.currentActiveFlashcard = undefined;
          }
        } else {
          // exit editing in quiz-inputObj
          var objs = windowCanvas.getObjects();
          objs.forEach((obj) => {
            if (obj && obj.name === 'quiz-inputObj') {
              console.log('exit');
              obj.item(1).exitEditing();
            }
          });

          _this.page.currentActiveFlashcard = undefined;
        }

        window.requestAnimationFrame(() => {
          _this.circlePress.animate('radius', 50, {
            duration: _this.PRESS_DURATION,
            onChange: () => windowCanvas.renderAll(),
            onComplete: () => {
              _this.circlePress.set({
                fill: 'green',
              });
              windowCanvas.renderAll();
              setTimeout(() => windowCanvas.remove(_this.circlePress), 300); // TODO Clear timeout
            },
            //easing: fabric.util.ease.easeOutBounce,
            abort: () => this.aborted,
          });
        });

        windowCanvas.requestRenderAll();
        _this.timer = setTimeout(() => {
          // remove pan handlers
          // windowCanvas.off('mouse:up', onUpPan);
          // windowCanvas.off('mouse:move', onMovePan);
          this.isDragging = false;

          console.log('Selection enabled');

          const calcSelectionBox = (e) => {
            const { x: x1, y: y1 } = opt.absolutePointer;
            const { x: x2, y: y2 } = opt.absolutePointer;
            return {
              left: Math.min(x1, x2),
              top: Math.min(y1, y2),
              width: Math.abs(x1 - x2),
              height: Math.abs(y1 - y2),
            };
          };

          const selectionRect = new fabric.Rect({
            ...calcSelectionBox(opt),
            opacity: 0.5,
            fill: 'red',
            stroke: 'red',
            strokeWidth: 1,
          });

          windowCanvas.add(selectionRect);

          windowCanvas.requestRenderAll();

          const onMoveSelect = (e) => {
            selectionRect.set(calcSelectionBox(e)).setCoords();
            windowCanvas.requestRenderAll();
          };

          windowCanvas.on('mouse:move', onMoveSelect);

          windowCanvas.on('mouse:up', function onUpSelect(e) {
            windowCanvas.off('mouse:up', onUpSelect);
            windowCanvas.off('mouse:move', onMoveSelect);

            onMoveSelect(e); // trigger last redraw of selection rect

            const objectsToSelect = windowCanvas.getObjects().filter((o) => {
              if (o === selectionRect || o === _this.circlePress) {
                return false;
              }
              return selectionRect.intersectsWithObject(o); // see http://fabricjs.com/intersection
            });

            console.log(objectsToSelect);

            if (!objectsToSelect.length) {
              return;
            }
            const activeObject = new fabric.ActiveSelection(objectsToSelect, {});

            windowCanvas.setActiveObject(activeObject);
            windowCanvas.discardActiveObject();
            windowCanvas.remove(selectionRect);
            windowCanvas.requestRenderAll();
          });
        }, _this.PRESS_DURATION);
      } else {
        if (_this.isFreeDrawing) {
          _this.isLoadLocal = false;
          superThis = _this;
        }
        const pointer = windowCanvas.getPointer(opt.e, true);
        _this.mouseDownX = pointer.x;
        _this.mouseDownY = pointer.y;
      }
      superThis = _this;
    });
    windowCanvas.on('mouse:move', function (opt) {
      //quiz3
      var pointer = windowCanvas.getPointer(opt.e);
      if (currentLine) {
        console.log('currentLine', {
          x2: pointer.x,
          y2: pointer.y,
        });
        if (currentLine) {
          currentLine.set({
            x2: pointer.x,
            y2: pointer.y,
          });
          windowCanvas.renderAll();
        }
        windowCanvas.renderAll();
      }

      if (this.isDragging && !isDoQuiz && isMove) {
        if (opt.target) {
          return;
        }
        const dx = opt.e.clientX - this.lastPosX;
        const dy = opt.e.clientY - this.lastPosY;
        if (dx < _this.MIN_MOVE && dy < _this.MIN_MOVE && !_this.aborted) {
          return;
        } // ignore minor movements if not aborted
        _this.clearTimer();
        var e = opt.e;
        var vpt = this.viewportTransform;
        var pointer = windowCanvas.getPointer(opt.e, true);
        var posX = pointer.x;
        var posY = pointer.y;
        vpt[4] += posX - this.lastPosX;
        vpt[5] += posY - this.lastPosY;
        this.requestRenderAll();
        this.lastPosX = posX;
        this.lastPosY = posY;
      }
    });
    windowCanvas.on('mouse:up', function (e) {
      this.isMoving = false;
      if (this.isDragging) {
        _this.clearTimer();
        this.setViewportTransform(this.viewportTransform);
        this.isDragging = false;
        this.selection = true;
      }
      if (
        e.target !== null &&
        e.target.type !== 'image' &&
        e.target.name !== 'quiz-inputObj' &&
        e.target.name !== 'line-style' &&
        e.target.name !== 'custom-group' &&
        !this.isDrawLine &&
        !this.isChoosePort
      ) {
        // console.log('_objects',e.target)

        if (e.target._objects && e.target._objects.length > 0) {
          // if (this.findTargetPort(e.target).x1) {

          // } else {
          _this.mouseUp(e);
          // }
        } else {
          _this.mouseUp(e);
        }
      } else {
        // if (e.target) {
        //   console.log(e.target);
        //   if (_this.isConnect) {
        //     _this.selectImageForLine(e.target);
        //   } else {
        //     _this.selectedImagesForLine = []
        //   }
        // }
      }
    });
  }
  isMoving = false;
  handleMoving() {
    var _this = this;
    windowCanvas.on('object:moving', function (e) {
      _this.isMoving = true;
    });
  }
  pasteObjects() {
    const _clipboard = windowCanvas.getActiveObject();
    const _this = this;
    if (_clipboard) {
      _this.queue.addFunction(function () {
        _clipboard.clone(function (clonedObj) {
          windowCanvas.discardActiveObject();
          clonedObj.set({
            left: clonedObj.left + 10,
            top: clonedObj.top + 10,
            evented: true,
          });
          // end
          if (clonedObj.type === 'activeSelection') {
            // active selection needs a reference to the windowCanvas.
            // clonedObj.canvas = canvas;
            // clonedObj.forEachObject(function(obj) {
            //   obj.objectID = randomID();
            //   if(obj.name === "media") {
            //     if(obj.nameDevice === "attach-file") {
            //       attachFileObj = obj;
            //       startActiveFileObj(obj);

            //     } else {
            //       activeDeviceObject = obj;
            //       startActiveMedia(obj);
            //     }
            //   } else {
            //     activeDeviceObject = obj;
            //     startActiveMedia(obj);
            //   }
            //   windowCanvas.add(obj);
            // });
            // this should solve the unselectability
            // clonedObj.setCoords();
            console.log('maybe');
          } else {
            clonedObj.objectID = _this.randomID();
            if (clonedObj.name != 'custom-group') {
              _this.isLoadLocal = false;
              _this.startActiveObject(clonedObj);
              windowCanvas.add(clonedObj);
            } else {
              var listObject = clonedObj._objects;
              _this.isLoadLocal = false;
              for (let index = 0; index < listObject.length; index++) {
                const element = listObject[index];
                if (element.__eventListeners) {
                  element.__eventListeners.mousedblclick = [];
                }
                console.log(element);
                // if(element.type != "textbox") {
                //   element.on("mousedblclick", handleDbclickChild);
                // } else {
                //   element.on("mouseup", function(e) {
                //     if(e.button === 1) {
                //       console.log("left click");
                //     }
                //     // if(e.button === 2) {
                //     //     console.log("middle click");
                //     // }
                //     if(e.button === 3) {
                //       handleTextboxRightclick(this);
                //     }
                //   });
                // }
              }
              windowCanvas.add(clonedObj);
            }
          }
          // _clipboard.top += 10;
          // _clipboard.left += 10;
          // if (isMakingAnswer) {
          //   objectSnapAdjacent(clonedObj);
          // }
          windowCanvas.setActiveObject(clonedObj);
          windowCanvas.requestRenderAll();
          queueThis.next();
          // isLoadDataLocal = false;
          // emitEvent();
        }, _this.page.customAttributes);
        return false;
      });
    }
  }
  enlargeBackground(outerWidth, outerHeight, scale) {
    var zoom = windowCanvas.getZoom();
    var isBackgroundCentered = false;
    var scaleY = 1;
    var scaleX = 1;
    windowCanvas.forEachObject((obj) => {
      if (obj.isBackground === true && isBackgroundCentered === false) {
        console.log('has background');
        if (scale === 'WIDTH') {
          obj.scaleY =
            obj.scaleY * (outerWidth / (obj.height * obj.scaleY * zoom));
          scaleY = obj.scaleY;
        } else {
          obj.scaleX =
            obj.scaleX * (outerHeight / (obj.width * obj.scaleX * zoom));
          scaleX = obj.scaleX;
        }
        isBackgroundCentered = true;
      }
    });
    windowCanvas.forEachObject((obj) => {
      if (obj.isBackground != true) {
        if (scale === 'WIDTH') {
          obj.scaleY = obj.scaleY * scaleY;
          obj.scaleX = obj.scaleX * scaleY;
        } else {
          obj.scaleY = obj.scaleY * scaleX;
          obj.scaleX = obj.scaleX * scaleX;
        }
        isBackgroundCentered = true;
      }
    });
  }

  zoomFull() {
    var isBackgroundCentered = false;
    var scale = 'HEIGHT';
    windowCanvas.forEachObject((obj) => {
      if (obj.isBackground === true && isBackgroundCentered === false) {
        scale = this.zoomOnBackground(obj, windowCanvas);
        // this.centerOnBackground(obj, windowCanvas);
        isBackgroundCentered = true;
      }
    });
    return scale;
  }

  resetCenter() {
    var isBackgroundCentered = false;
    windowCanvas.forEachObject((obj) => {
      if (obj.isBackground === true && isBackgroundCentered === false) {
        this.centerOnBackground(obj, windowCanvas);
        isBackgroundCentered = true;
      }
    });
  }

  startActiveObject(obj) {
    if (obj.blink) {
      this.blink(obj);
    }
    var _this = this;
    // obj.on('mousedown', function(e) {
    //   // activeDeviceObject = this;
    //   // activeObject = this;

    //   _this.touchPopupMenu(e.pointer, () => _this.viewDetail(obj));
    // });
  }

  //function getTextForObject(obj, item) {
  //    // startActiveTextbox(obj);
  //    this.canvas.add(obj);
  //}

  // blink object animation
  blink(obj) {
    var _this = this;
    if (obj.blink && obj.opacity === 1) {
      obj.animate('opacity', '0.3', {
        duration: 300,
        onChange: this.canvas.renderAll.bind(this.canvas),
        onComplete() {
          _this.blink(obj);
        },
      });
    } else {
      obj.animate('opacity', '1', {
        duration: 300,
        onChange: this.canvas.renderAll.bind(this.canvas),
        onComplete() {
          _this.blink(obj);
        },
      });
    }
  }
  zoom(object) {
    this.canvas.setZoom(1); // reset zoom so pan actions work as expected
    var zoom = windowCanvas.getZoom();
    var vpw = this.canvas.width / zoom;
    var vph = this.canvas.height / zoom;
    var x = object.left - vpw / 2; // x is the location where the top left of the viewport should be
    var y = object.top - vph / 2; // y idem
    this.canvas.absolutePan({ x, y });
    // if (this.canvas.height / object.height < 1) {
    //   var newZoom = this.canvas.height / (object.height * 3.5);
    // }
    // else {
    //   var newZoom = 1 / 3.5;
    // }
    var newZoom = 0.18;
    console.log(newZoom);
    this.canvas.setZoom(newZoom);
  }
  //Canvas event with mouse
  changeCoordinateConnectLine(obj) {
    function updateCoords() {
      const connectors = this.canvas
        .getObjects()
        .filter(
          (value) =>
            value.name === 'lineConnect' &&
            (value.idObject1 === obj.objectID ||
              value.idObject2 === obj.objectID)
        );

      if (connectors) {
        for (let i = 0; i < connectors.length; i++) {
          if (connectors[i].idObject1 === obj.objectID) {
            obj.__corner = connectors[i].port1;
            const targetPort = findTargetPort(obj, 'mt');
            connectors[i].path[0][1] = targetPort.x1;
            connectors[i].path[0][2] = targetPort.y1;
            this.movelinename(
              this.canvas,
              obj.objectID,
              targetPort.y1,
              targetPort.x1,
              connectors[i].port1
            );
          } else {
            obj.__corner = connectors[i].port2;
            const portCenterPoint = findTargetPort(obj, 'mt');
            connectors[i].path[1][3] = portCenterPoint.x2;
            connectors[i].path[1][4] = portCenterPoint.y2;
            this.movelinename(
              this.canvas,
              obj.objectID,
              portCenterPoint.y2,
              portCenterPoint.x2,
              connectors[i].port2
            );
          }
        }
      }
    }
    obj.on('moving', updateCoords);
    obj.on('scaling', updateCoords);
  }
  randomID() {
    return '_' + Math.random().toString(36).substr(2, 9);
  }
  iconAnimation(e, w, h, top, left) {
    console.log('iconAnimation');
    (fabric as any).Sprite = (fabric as any).util.createClass(fabric.Image, {
      type: 'sprite',
      spriteWidth: w,
      spriteHeight: h,
      spriteIndex: 0,
      frameTime: 100,
      spriteImages: [],
      initialize(element, options) {
        options || (options = {});

        options.width = this.spriteWidth;
        options.height = this.spriteHeight;

        this.callSuper('initialize', element, options);

        this.createSpriteImages();
      },

      createSpriteImages() {
        this.spriteImages = [];

        var steps = Math.floor(this.getElement().width / this.spriteWidth);

        for (var i = 0; i < steps; i++) {
          var tmpImg = new Image();
          tmpImg.src = this.getElement().src;
          tmpImg.onload = this.createSpriteImage.bind(this, i);
        }
      },

      createSpriteImage(i) {
        var tmpCanvas = fabric.util.createCanvasElement();
        var tmpCtx = tmpCanvas.getContext('2d');
        tmpCanvas.width = this.spriteWidth;
        tmpCanvas.height = this.spriteHeight;

        tmpCtx.drawImage(
          this.getElement(),
          -i * this.spriteWidth,
          0,
          this.getElement().width,
          this.getElement().height
        );

        var clip = new fabric.Image(tmpCanvas, {
          originX: 'left',
          originY: 'top',
          left: 0,
          top: 0,
          width: this.spriteWidth,
          height: this.spriteHeight,
        });

        this.spriteImages.push(clip);
      },

      _render(ctx) {
        if (this.spriteImages[this.spriteIndex]) {
          ctx.drawImage(
            this.spriteImages[this.spriteIndex].getElement(),
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
          );
        }
      },

      play() {
        var _this = this;
        this.animInterval = setInterval(function () {
          this.onPlay && this.onPlay();
          _this.dirty = true;
          _this.spriteIndex++;
          if (this.spriteIndex === this.spriteImages.length) {
            _this.spriteIndex = 0;
          }
        }, this.frameTime);
      },

      stop() {
        clearInterval(this.animInterval);
      },
    });

    (fabric as any).Sprite.fromURL = function (url, callback, imgOptions) {
      fabric.util.loadImage(url, function (img) {
        callback(new (fabric as any).Sprite(img, imgOptions));
      });
    };

    (fabric as any).Sprite.async = true;
    (fabric as any).Sprite.fromURL(e, createSprite, null);

    function createSprite(sprite) {
      sprite.set({
        left,
        top,
        scaleX: 100 / w,
        scaleY: 100 / h,
      });
      windowCanvas.add(sprite);
      setTimeout(function () {
        sprite.stop(); // Stop the animation
        windowCanvas.remove(sprite); // Remove the sprite from the canvas
        windowCanvas.requestRenderAll(); // Render the canvas after removing the sprite
        console.log('Remove animation');
      }, 1000); // Remove after 1 second (1000 milliseconds)
      sprite.play(); // Start the animation
    }

    function render() {
      windowCanvas.renderAll();
      fabric.util.requestAnimFrame(render);
    }
    render();
  }
  iconGame(e) {
    let canvas: any = this.canvas;
    let score = 0; // Initialize score variable
    let brickRowCount = 1;
    let brickColumnCount = 10;
    if (canvas.width != 667) {
      brickColumnCount = Math.floor((canvas.width / 667) * brickColumnCount);
    }
    let brickWidth = 50;
    let brickHeight = 50;
    let brickOffsetTop = 5;
    let brickOffsetLeft = 5;
    let gunSpeed = 10;
    let bulletSpeed = 5;
    let bullets = [];
    let bricksI = [];
    function createFabricButton() {
      const buttonWidth = 100;
      const buttonHeight = 40;

      const button = new fabric.Rect({
        width: buttonWidth,
        height: buttonHeight,
        fill: 'blue',
        rx: 6, // Rounded corners
        ry: 6, // Rounded corners
        selectable: false,
        originX: 'center',
        originY: 'center',
        left: canvas.width / 2,
        top: canvas.height / 2 - 50,
      });

      const buttonText = new fabric.Text('Start Game', {
        fontSize: 16,
        fill: 'white',
        selectable: false,
        originX: 'center',
        originY: 'center',
        left: button.left,
        top: button.top,
        fontFamily: 'Arial',
      });

      const buttonGroup = new fabric.Group([button, buttonText], {
        selectable: false,
      });

      canvas.add(buttonGroup);

      // Handling click event for the button
      buttonGroup.on('mousedown', function () {
        // Replace this with the action you want the button to perform
        console.log('Button clicked!');
        check++;
        canvas.clear();
        startGame(canvas);
        // Add your custom function or action here
      });
    }
    function createEndButton() {
      const buttonWidth = 100;
      const buttonHeight = 40;

      const button = new fabric.Rect({
        width: buttonWidth,
        height: buttonHeight,
        fill: 'blue',
        rx: 6, // Rounded corners
        ry: 6, // Rounded corners
        selectable: false,
        originX: 'center',
        originY: 'center',
        left: canvas.width / 2,
        top: canvas.height / 2,
      });

      const buttonText = new fabric.Text('End Game', {
        fontSize: 16,
        fill: 'white',
        selectable: false,
        originX: 'center',
        originY: 'center',
        left: button.left,
        top: button.top,
        fontFamily: 'Arial',
      });
      const buttonGroup = new fabric.Group([button, buttonText], {
        selectable: false,
      });

      canvas.add(buttonGroup);

      // Handling click event for the button
      buttonGroup.on('mousedown', function () {
        // Replace this with the action you want the button to perform
        console.log('Button clicked!');
        check++;
        canvas.clear();
        // Add your custom function or action here
      });
    }

    function btnMove() {
      var isMouseDown = false;
      fabric.Image.fromURL('assets/animation/back.svg', function (btnBack) {
        btnBack.set({
          width: 170,
          height: 170,
          left: 60,
          top: canvas.height - 80,
          selectable: false,
          angle: 0,
          hasControls: false,
          hasBorders: false,
          lockMovementX: true,
          lockMovementY: true,
          opacity: 0.3,
        });
        btnBack.on('mousedown', function () {
          isMouseDown = true;
          simulateKeyPress('ArrowLeft');
          startContinuousKeyPress('ArrowLeft');
        });

        btnBack.on('mouseup', function () {
          isMouseDown = false;
          stopContinuousKeyPress('ArrowLeft');
        });

        btnBack.on('mouseout', function () {
          if (isMouseDown) {
            isMouseDown = false;
            stopContinuousKeyPress('ArrowLeft');
          }
        });

        canvas.add(btnBack);
      });
      fabric.Image.fromURL('assets/animation/back.svg', function (btnNext) {
        btnNext.set({
          width: 170,
          height: 170,
          left: canvas.width - 60,
          top: canvas.height - 80,
          selectable: false,
          angle: 180,
          hasControls: false,
          hasBorders: false,
          lockMovementX: true,
          lockMovementY: true,
          opacity: 0.3,
        });
        btnNext.on('mousedown', function () {
          isMouseDown = true;
          simulateKeyPress('ArrowRight');
          startContinuousKeyPress('ArrowRight');
        });
        btnNext.on('mouseup', function () {
          isMouseDown = false;
          stopContinuousKeyPress('ArrowRight');
        });
        btnNext.on('mouseout', function () {
          if (isMouseDown) {
            isMouseDown = false;
            stopContinuousKeyPress('ArrowRight');
          }
        });
        canvas.add(btnNext);
      });
      // Function to simulate key press
      function simulateKeyPress(key) {
        var eventObj = new KeyboardEvent('keydown', {
          code: key,
        });
        document.dispatchEvent(eventObj);
      }

      function startContinuousKeyPress(key) {
        if (isMouseDown) {
          simulateKeyPress(key);
          setTimeout(function () {
            startContinuousKeyPress(key);
          }, 100); // Adjust the delay to control the speed of key presses
        }
      }

      function stopContinuousKeyPress(key) {
        // Dispatch keyup event to stop continuous key presses
        var eventObj = new KeyboardEvent('keyup', {
          code: key,
        });
        document.dispatchEvent(eventObj);
      }
    }
    const gunPos = {
      x: canvas.width / 2,
      y: canvas.height - 80,
    };
    // Create the gun and its associated image
    const gun = new fabric.Rect({
      width: 30,
      height: 30,
      fill: 'white',
      left: gunPos.x,
      top: gunPos.y,
      selectable: false,
      hasControls: false,
      hasBorders: false,
      opacity: 0,
    });
    canvas.add(gun);
    function Image() {
      // Load the image and add it to the canvas
      fabric.Image.fromURL(
        'assets/animation/iconGame/ufo-svgrepo-com.svg',
        function (img) {
          img.set({
            width: 800,
            height: 800,
            left: gunPos.x,
            top: gunPos.y,
            selectable: false,
            scaleX: 0.05,
            scaleY: 0.05,
            hasControls: false,
            hasBorders: false,
          });
          canvas.add(img); // Add the image to the canvas
          // Function to update the position of the image based on the gun's position
          function updateImagePosition() {
            img.set({
              left: gun.left,
              top: gun.top,
            });
            canvas.renderAll();
          }
          // Function to move the gun (and hence the image)
          function moveGun(speedX, speedY) {
            gun.set({
              left: gun.left + speedX,
              top: gun.top + speedY,
            });
            updateImagePosition(); // Update the image position
            canvas.renderAll();
          }
          interface KeyboardEvent {
            code: string;
          }
          // Keyboard event listeners to move the gun (and image) using arrow keys
          document.addEventListener('keydown', function (e: KeyboardEvent) {
            switch (e.code) {
              case 'ArrowLeft':
                moveGun(-1, 0); // Move left
                break;
              case 'ArrowRight':
                moveGun(1, 0); // Move right
                break;
              default:
                break;
            }
          });
        }
      );
    }
    // Define the KeyboardEvent interface
    interface KeyboardEvent {
      code: string;
    }
    // Add event listeners for keydown and keyup events
    document.addEventListener('keydown', handleKeyDown);
    // Set initial values for movement
    let horizontalMovement = 0;
    // Function to handle keydown events
    function handleKeyDown(e: KeyboardEvent) {
      switch (e.code) {
        case 'ArrowLeft':
          horizontalMovement = -gunSpeed;
          break;
        case 'ArrowRight':
          horizontalMovement = gunSpeed;
          break;
        default:
          break;
      }
      updateGunPosition();
    }
    // Function to update the gun's position based on movement
    function updateGunPosition() {
      if (canvas && canvas.requestRenderAll) {
        const newLeft = Math.max(
          Math.min(gun.left + horizontalMovement, canvas.width - gun.width),
          0
        );
        gun.set({
          left: newLeft,
        });

        canvas.requestRenderAll();
      } else {
        console.error('Canvas or requestRenderAll method is undefined.');
      }
    }
    let shootingInterval; // Variable to hold the shooting interval
    // Start automatic shooting
    function startAutomaticShooting(canvas) {
      shootingInterval = setInterval(function () {
        shoot(canvas);
        if (check != 0) {
          clearInterval(shootingInterval);
        }
      }, 2000); // Adjust the interval time as needed (e.g., 500ms for half a second delay between shots)
    }
    // Implement the shoot function as before
    function shoot(canvas) {
      if (canvas) {
        fabric.Image.fromURL('assets/animation/bullet.svg', function (img) {
          img.set({
            width: 170,
            height: 170,
            left: gun.left + gun.width / 2 - 13,
            top: gun.top - 15,
            selectable: false,
            scaleX: 0.2,
            scaleY: 0.2,
            hasControls: false,
            hasBorders: false,
          });
          canvas.add(img);
          bullets.push(img);
        });
      } else {
        console.error('Canvas is undefined.');
      }
    }
    function moveBullets() {
      bullets.forEach(function (bullet, index) {
        bullet.set('top', bullet.top - bulletSpeed);
        checkCollisionWithBricks(bullet);
        // Check if bullet's top value is less than or equal to 0
        if (bullet.top <= 50) {
          // Remove the bullet from the canvas and bullets array
          canvas.remove(bullet);
          bullets.splice(index, 1);
        }
      });
      canvas.renderAll();
    }
    function animate(canvas) {
      moveBullets();
      requestAnimationFrame(function () {
        animate(canvas);
      });
    }
    function Brick() {
      for (var i = 0; i < brickColumnCount; i++) {
        for (var r = 0; r < brickRowCount; r++) {
          var random = Math.floor(Math.random() * brickProperties.length);
          createBrick(i, r, brickProperties[random]);
        }
      }
    }
    let sizeBrick = 50;
    function createBrick(i, r, properties) {
      //imageUrl if item.imageUrl end with .svg
      var objectUrl;
      if (properties.imageUrl.endsWith('.svg')) {
        objectUrl = 'assets/animation/imgObj/' + properties.imageUrl;
      } else {
        objectUrl = properties.imageUrl;
      }
      if (canvas.width >= 667) {
        sizeBrick = (canvas.width / 667) * 50;
      }
      fabric.Image.fromURL(objectUrl, function (img) {
        img.set({
          width: img.width,
          height: img.height,
          left: i * brickWidth + brickOffsetLeft + 100,
          top: r * brickHeight + brickOffsetTop + 70,
          selectable: false,
          scaleX: sizeBrick / img.width / 1.5,
          scaleY: sizeBrick / img.height / 1.5,
          hasControls: false,
          hasBorders: false,
        });
        canvas.add(img);
        // Lưu trữ reference tới viên gạch được tạo ra
        if (!bricksI[i]) {
          bricksI[i] = [];
        }
        bricksI[i][r] = {
          left: img.left,
          top: img.top,
          status: true,
          image: img,
          sound: new Audio(`assets/animation/voice/${properties.voice}`), // Lưu trữ đối tượng âm thanh
        };
      });
    }

    // Keep track of created text objects
    function removeBrick(i, r) {
      if (bricksI[i] && bricksI[i][r]) {
        if (check == 0) {
          canvas.remove(bricksI[i][r].image);
          gameDuration += 2;
          if (Timeout >= 2000) {
            Timeout -= 50;
          }
        }
      } else {
        setTimeout(function () {
          removeBrick(i, r);
        }, 10);
      }
    }
    function checkCollisionWithBricks(bullet) {
      for (var c = 0; c < brickColumnCount; c++) {
        for (var r = 0; r < brickRowCount; r++) {
          if (bricksI[c] && bricksI[c][r] && bricksI[c][r].status) {
            var brick = bricksI[c][r];
            if (check == 0) {
              if (
                bullet.left >= brick.left - 30 &&
                bullet.left <= brick.left + brickWidth - 30 &&
                bullet.top >= brick.top &&
                bullet.top <= brick.top + brickHeight
              ) {
                removeBrick(c, r);
                handleBrickCollision(c, r);
                canvas.remove(bullet);
                if (brick.sound) {
                  brick.sound.play();
                }
                var bulletIndex = bullets.indexOf(bullet);
                if (bulletIndex !== -1) {
                  bullets.splice(bulletIndex, 1);
                }
              }
            }
          }
        }
      }
    }

    function handleBrickCollision(c, r) {
      var brick = bricksI[c][r];
      brick.status = 0;
      canvas.remove(brick);
      canvas.forEachObject(function (obj) {
        if (obj.type === 'text' && obj.text.startsWith('Score:')) {
          canvas.remove(obj); // Remove the score text object
        }
      });
      score++;
      updateScore();
      var explosionX = brick.left + brickWidth / 2 - 30;
      var explosionY = brick.top + brickHeight / 2;
      var animate = animationProperties[0];
      DrawingCanvas.prototype.iconAnimation(
        animate.imageUrl,
        animate.width / animate.numberImage,
        animate.height,
        explosionY,
        explosionX
      );
      checkEndGame();
    }
    let Timeout = 5000;
    let fallInterval = 4000; // Time interval between each item falling
    function animateFallingItems() {
      const fallDistance = canvas.height - 60; // Distance to fall (entire canvas height)
      const items = ['assets/animation/present_noel.svg'];
      const falling = setInterval(() => {
        const randomItem = items[Math.floor(Math.random() * items.length)];
        fabric.Image.fromURL(randomItem, function (img) {
          img.set({
            width: 512,
            height: 512,
            left: Math.random() * canvas.width, // Random X position within canvas width
            top: 0, // Start from top of the canvas
            selectable: false,
            hasControls: false,
            hasBorders: false,
            scaleX: 0.1,
            scaleY: 0.1,
          });
          canvas.add(img);
          fabric.util.animate({
            startValue: 0,
            endValue: fallDistance,
            duration: Timeout,
            onChange: function (value) {
              img.set('top', value);
              if (
                value + img.height * img.scaleY - 10 >= gun.top &&
                value <= gun.top + gun.height &&
                img.left <= gun.left + gun.width &&
                img.left + img.width * img.scaleX - 10 >= gun.left
              ) {
                // canvas.remove(img);
                gameOver();
                return;
              }
              canvas.renderAll();
            },
            onComplete() {
              canvas.remove(img);
            },
          });
        });
        if (check != 0) {
          clearInterval(falling);
        }
      }, fallInterval);
    }
    function background() {
      fabric.Image.fromURL('assets/animation/bg.png', function (bgImg) {
        bgImg.set({
          width: canvas.width,
          height: canvas.height,
          top: canvas.height / 2,
          left: canvas.width / 2,
          selectable: false,
          evented: false, // Ensures it cannot be selected or interacted with
          hasControls: false,
          hasBorders: false,
          lockMovementX: true,
          lockMovementY: true,
        });
        canvas.setBackgroundImage(bgImg, canvas.renderAll.bind(canvas));
        console.log("LOAD background");
      });
    }
    // Khởi tạo text object để hiển thị thời gian
    let gameDuration = 60;
    // Thời gian ban đầu của trò chơi (ví dụ: 60 giây)
    function TimeGame() {
      let timeText = new fabric.Text('Time: 60', {
        left: 150,
        top: 50,
        fontFamily: 'Arial',
        fontSize: 20,
        fill: 'white',
        hasControls: false,
        hasBorders: false,
      });
      // Thêm text object vào canvas
      canvas.add(timeText);
      // Bắt đầu đồng hồ đếm thời gian
      const gameTimer = setInterval(() => {
        // Giảm thời gian còn lại
        gameDuration--;
        // Hiển thị thời gian còn lại trên canvas
        timeText.set('text', 'Time: ' + gameDuration);
        // Kiểm tra nếu thời gian còn lại là 0, kết thúc trò chơi
        if (gameDuration <= 0) {
          clearInterval(gameTimer); // Dừng đồng hồ đếm thời gian
          gameOver(); // Thực hiện các hành động khi kết thúc trò chơi
          return;
        }
        if (check != 0) {
          clearInterval(gameTimer); // Dừng đồng hồ đếm thời gian
        }
        // Cập nhật canvas để hiển thị thay đổi về thời gian
        canvas.renderAll();
      }, 1000); // Cập nhật thời gian mỗi giây (1000 milliseconds)
    }
    //Update the Score;

    function updateScore() {
      var scoreText = new fabric.Text(`Score: ${score}`, {
        left: 50,
        top: 50,
        fontSize: 20,
        fontFamily: 'Arial',
        selectable: false,
        fill: 'white',
        hasControls: false,
        hasBorders: false,
      });
      canvas.add(scoreText);
    }
    function checkEndGame() {
      var hasBricksLeft = false;
      for (var c = 0; c < brickColumnCount; c++) {
        for (var r = 0; r < brickRowCount; r++) {
          if (bricksI[c][r].status) {
            hasBricksLeft = true;
            break;
          }
        }
        if (hasBricksLeft) {
          break;
        }
      }
      if (!hasBricksLeft) {
        if (fallInterval >= 2000) {
          fallInterval -= 500;
        }
        Brick();
      }
    }
    let check = 0;
    function gameOver() {
      if (check == 0) {
        alert(`Game Over! Your final score is: ${score}`);
        check++;
        restartGame(0); // Restart the game
      }
    }
    function restartGame(e) {
      canvas.clear();
      background();
      createEndButton();
      createFabricButton();
    }
    function startGame(canvas) {
      gameDuration = 60;
      score = 0;
      check = 0;
      TimeGame();
      Image();
      background();
      startAutomaticShooting(canvas); // Start automatic shooting
      Brick();
      btnMove();
      animateFallingItems();
      updateScore();
      animate(canvas);
    }
    background();
    createEndButton();
    createFabricButton();
  }

  iconRecording(e) {
    let mediaRecorder;
    let recordedChunks = [];
    const canvas: any = this.canvas;
    const audioElement: HTMLAudioElement = document.createElement('audio');
    document.body.appendChild(audioElement);

    function btnMove() {
      var back; var next;
      var isMouseDown = false;

      fabric.Image.fromURL(
        'assets/icon-/Play_02.png',
        function (btnBack) {

          var desiredWidth = 20;
          var desiredHeight = 20;
          var scaleX = desiredWidth / btnBack.width;
          var scaleY = desiredHeight / btnBack.height;
          btnBack.scaleX = scaleX;
          btnBack.scaleY = scaleY;
          btnBack.set({
            left: 50,
            top: 70,
            selectable: false,
            angle: 0,
            hasControls: false,
            hasBorders: false,
            lockMovementX: true,
            lockMovementY: true,

          });
          btnBack.on('mousedown', function () {
            isMouseDown = true;
            startRecording();
          });
          canvas.add(btnBack);
          back = btnBack;
        }
      );

      fabric.Image.fromURL('assets/icon-/Pause_02.png', function (btnNext) {

        var desiredWidth = 20;
        var desiredHeight = 20;
        var scaleX = desiredWidth / btnNext.width;
        var scaleY = desiredHeight / btnNext.height;
        btnNext.scaleX = scaleX;
        btnNext.scaleY = scaleY;

        btnNext.set({
          left: 80,
          top: 70,
          selectable: false,
          angle: 180,
          hasControls: false,
          hasBorders: false,
          lockMovementX: true,
          lockMovementY: true,
        });
        btnNext.on('mousedown', function () {
          isMouseDown = true;
          stopRecording();
        });

        canvas.add(btnNext);
        next = btnNext;
      });

      fabric.Image.fromURL('assets/icon-/Export_01.png', function (btnSave) {

        btnSave.set({
          left: 110,
          top: 70,
          selectable: false,
          hasControls: false,
          hasBorders: false,
          lockMovementX: true,
          lockMovementY: true,
          scaleX: 0.1,
          scaleY: 0.1,
        });
        btnSave.on('mousedown', function () {
          isMouseDown = true;
          downloadRecording();
        });

        canvas.add(btnSave);
        next = btnSave;
      });

      // async function startRecording() {
      //   const stream = await navigator.mediaDevices.getUserMedia({
      //     audio: true,
      //   });
      //   mediaRecorder = new MediaRecorder(stream);
      //   mediaRecorder.ondataavailable = function (event) {
      //     recordedChunks.push(event.data);
      //   };
      //   mediaRecorder.start();
      // }





      async function startRecording() {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaRecorder = new MediaRecorder(stream);

          mediaRecorder.ondataavailable = function (event) {
            if (event.data.size > 0) {
              recordedChunks.push(event.data);
            }
          };

          mediaRecorder.onstop = function () {
            downloadRecording();
          };

          mediaRecorder.start();
        } catch (error) {
          console.error('Error accessing microphone:', error);

        }
      }

      function stopRecording() {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }

      function downloadRecording() {
        const blob = new Blob(recordedChunks, { type: 'audio/mp3' });
        const url = URL.createObjectURL(blob);
        audioElement.src = url;
        audioElement.controls = true;

        document.body.appendChild(audioElement);

        audioElement.play();

        recordedChunks = [];
      }

      mediaRecorder.onstop = function () {
        downloadRecording();
      };
    }

    btnMove();

  }

  iconTriangle(e) {
    // superThis.lineType = ''
    var triangle = new fabric.Triangle({
      width: 100,
      height: 100,
      stroke: this.selectedColor,
      strokeWidth: Number(this.selectedWidth),
      fill: '#fff',
      originX: 'center',
      originY: 'center',
    });


    var obj = this.createTextBox(triangle, null);
    startActiveObjectQuiz(obj, this.page.audioRecorder, this.page.translate);
    this.canvas.add(obj);
    this.canvas.requestRenderAll();
  }
  //Lâm fix
  iconCircle(e) {
    // superThis.lineType = ''
    var circle = new fabric.Circle({
      radius: 50,
      stroke: this.selectedColor,
      strokeWidth: Number(this.selectedWidth),
      fill: '#fff',
      originX: 'center',
      originY: 'center',
    });
    var obj = this.createTextBox(circle, null);
    startActiveObjectQuiz(obj, this.page.audioRecorder, this.page.translate);
    this.canvas.add(obj);
    this.canvas.requestRenderAll();
  }
  iconRoundedRect(e) {
    // superThis.lineType = ''
    var roundedRect = new fabric.Rect({
      width: 100,
      height: 100,
      stroke: this.selectedColor,
      strokeWidth: Number(this.selectedWidth),
      fill: '#fff',
      originX: 'center',
      originY: 'center',
      rx: 10,
      ry: 10,
    });

    roundedRect.on('scaling', function () {
      console.log('scaling');
      this.set({
        width: this.width * this.scaleX,
        height: this.height * this.scaleY,
        scaleX: 1,
        scaleY: 1,
      });
    });

    var obj = this.createTextBox(roundedRect, null);
    startActiveObjectQuiz(obj, this.page.audioRecorder, this.page.translate);
    this.canvas.add(obj);
    this.canvas.requestRenderAll();
  }
  iconStar(e) {
    // superThis.lineType = ''
    var poly = new fabric.Path(
      // eslint-disable-next-line max-len
      'M 251 30.5725 C 239.505 33.871 233.143 56.2086 228.247 66 L 192.247 139 C 187.613 148.267 183.524 162.173 176.363 169.682 C 170.726 175.592 151.9 174.914 144 176 L 57 188.729 C 46.5089 190.241 22.8477 189.409 18.0093 201.015 C 12.21 214.927 32.8242 228.824 41 237 L 95 289.83 C 104.569 298.489 120.214 309.405 126.11 321 C 130.001 328.651 123.466 345.797 122.081 354 L 107 442 C 105.042 452.114 99.142 469.478 105.228 478.895 C 109.142 484.95 116.903 484.628 123 482.64 C 137.319 477.973 151.822 468.444 165 461.139 L 232 425.756 C 238.285 422.561 249.81 413.279 257 415.071 C 268.469 417.93 280.613 427.074 291 432.691 L 359 468.258 C 369.618 473.739 386.314 487.437 398.985 483.347 C 413.495 478.664 405.025 453.214 403.25 443 L 388.75 358 C 387.045 348.184 380.847 332.006 383.194 322.285 C 385.381 313.225 403.044 300.467 410 294.424 L 469 237 C 477.267 228.733 493.411 218.004 492.941 205 C 492.398 189.944 465.753 190.478 455 189 L 369 176.421 C 359.569 175.025 343.388 175.914 335.213 170.976 C 328.335 166.822 323.703 151.166 320.576 144 L 289.753 82 L 268.532 39 C 264.58 32.6459 258.751 28.3485 251 30.5725 z',

      {
        stroke: this.selectedColor,
        strokeWidth: Number(this.selectedWidth),
        fill: '#fff',
        // scaleX: 0.2,
        // scaleY: 0.2,
        top: -50,
        left: -50,
        originX: 'center',
        originY: 'center',
        // width: 100,
        // height: 100,
      }
    );

    var obj = this.createTextBox(poly, null);
    obj.set({
      scaleX: 0.2,
      scaleY: 0.2,
    });
    startActiveObjectQuiz(obj, this.page.audioRecorder, this.page.translate);
    this.canvas.add(obj);
    this.canvas.requestRenderAll();
  }

  iconHexagon(e) {
    // superThis.lineType = ''
    var poly = new fabric.Polygon(
      [
        { x: 850, y: 75 },
        { x: 958, y: 137.5 },
        { x: 958, y: 262.5 },
        { x: 850, y: 325 },
        { x: 742, y: 262.5 },
        { x: 742, y: 137.5 },
      ],
      {
        stroke: this.selectedColor,
        strokeWidth: Number(this.selectedWidth),
        fill: '#fff',
        // scaleX: 0.2,
        // scaleY: 0.2,
        top: -50,
        left: -50,
        originX: 'center',
        originY: 'center',
        // width: 100,
        // height: 100,
      }
    );

    var obj = this.createTextBox(poly, null);
    obj.set({
      scaleX: 0.35,
      scaleY: 0.35,
    });


    startActiveObjectQuiz(obj, this.page.audioRecorder, this.page.translate);
    this.canvas.add(obj);
    this.canvas.requestRenderAll();
  }

  iconArrowTo(e) {
    // superThis.lineType = ''
    var arrow = new fabric.Polygon(
      [
        { x: 10, y: 20 },
        { x: 20, y: 40 },
        { x: 10, y: 60 },
        { x: 40, y: 60 },

        { x: 50, y: 40 },
        { x: 40, y: 20 },
        { x: 10, y: 20 },
      ],
      {
        stroke: this.selectedColor,
        strokeWidth: Number(this.selectedWidth),
        fill: '#fff',
        // scaleX: 1.5,
        // scaleY: 1.5,
        left: -30,
        top: -30,
        originX: 'center',
        originY: 'center',
        // width: 100,
        // height: 100,
      }
    );

    var obj = this.createTextBox(arrow, null);
    obj.set({
      scaleX: 1.5,
      scaleY: 1.5,
    });
    startActiveObjectQuiz(obj, this.page.audioRecorder, this.page.translate);
    this.canvas.add(obj);
    this.canvas.requestRenderAll();
  }
  iconHeart(e) {
    // Capture a reference to the canvas outside the function
    var canvas = this.canvas;

    var heart = new fabric.Path(
      'M10,6 Q10,0 15,0 T20,6 Q20,10 15,14 T10,20 Q10,18 5,14 T0,6 Q0,0 5,0 T10,6 Z',
      {
        stroke: this.selectedColor,
        strokeWidth: 0.2,
        fill: '#fff',
        top: -45,
        left: -45,
        originX: 'center',
        originY: 'center',
      }
    );

    var obj = this.createTextBox(heart, null);
    obj.set({
      scaleX: 4.5,
      scaleY: 4.5,
    });

    // startActiveObjectQuiz(obj);

    canvas.add(obj);
    canvas.requestRenderAll();
  }
  //Lâm and Huy fix

  // createQuizGame(selectedOptionId) {

  //   fabric.Image.fromURL('https://img.lovepik.com/free-png/20211129/lovepik-learning-supplies-border-png-image_401196175_wh1200.png',
  //     (backgroundImg) => {
  //       backgroundImg.set({
  //         originX: 'left',
  //         originY: 'top',
  //         scaleX: this.canvas.width / backgroundImg.width,
  //         scaleY: this.canvas.height / backgroundImg.height,
  //         selectable: false,
  //       });

  //       this.canvas.add(backgroundImg);
  //       backgroundImg.moveTo(0);
  //       // this.canvas.setActiveObject(backgroundImg); // Đặt đối tượng backgroundImg làm đối tượng được chọn
  //       // this.canvas.sendToBack(backgroundImg); // Đưa ảnh backgroundImg xuống dưới cùng

  //       fabric.Image.fromURL('https://cdn.popsww.com/blog-kids-learn/sites/5/2022/12/toan-hinh-lop-1.jpg', (img) => {
  //         img.set({
  //           stroke: this.selectedColor,
  //           strokeWidth: Number(this.selectedWidth),
  //           originX: 'center',
  //           originY: 'center',
  //           left: -30,
  //           top: -30,
  //           scaleX: 0.5,
  //           scaleY: 0.5,
  //         });

  //         const textObject = new fabric.Text('Hình trên có bao nhiêu hình chữ nhật?', {
  //           fontSize: 20,
  //           fill: 'black',
  //           originX: 'center',
  //           originY: 'center',
  //         });

  //         const trueButton = new fabric.Rect({
  //           width: 60,
  //           height: 30,
  //           fill: 'white',
  //           originX: 'center',
  //           originY: 'center',
  //         });

  //         const trueButtonText = new fabric.Text('4', {
  //           fontSize: 16,
  //           fill: 'black',
  //           originX: 'center',
  //           originY: 'center',
  //         });

  //         trueButton.on('mousedown', () => {
  //           // Thay đổi màu chữ khi nhấp chuột
  //           trueButtonText.set({ fill: 'red' });
  //           trueButton.set({ fill: 'green' });

  //           var result = "Đúng";
  //           var resultBox = new fabric.Text(`Kết quả: ${result}`, {
  //             fontSize: 50,
  //             fill: 'black',
  //             fontFamily: 'Time New Roman',
  //             left: 200,
  //             top: 400,
  //             originX: 'center',
  //             originY: 'center',
  //           });
  //           this.canvas.add(resultBox);
  //           this.canvas.requestRenderAll();
  //         });

  //         const falseButton = new fabric.Rect({
  //           width: 60,
  //           height: 30,
  //           fill: 'white',
  //           originX: 'center',
  //           originY: 'center',
  //         });
  //         const falseButtonText = new fabric.Text('5', {
  //           fontSize: 16,
  //           fill: 'black',
  //           originX: 'center',
  //           originY: 'center',
  //         });

  //         trueButton.on('mousedown', () => {
  //           // Thay đổi màu chữ khi nhấp chuột
  //           trueButtonText.set({ fill: 'red' });
  //           falseButton.set({ fill: 'red' });
  //           this.canvas.requestRenderAll();
  //         });
  //         this.canvas.add(img, textObject, trueButton, trueButtonText, falseButton, falseButtonText);
  //         img.on('modified', () => {
  //           textObject.set({
  //             left: img.left,
  //             top: img.top,
  //           });
  //           trueButton.set({
  //             left: img.left + 20,
  //             top: img.top + img.height / 2 + 20,
  //           });
  //           trueButtonText.set({
  //             left: trueButton.left,
  //             top: trueButton.top,
  //           });
  //           falseButton.set({
  //             left: img.left - 40,
  //             top: img.top + img.height / 2 + 20,
  //           });
  //           falseButtonText.set({
  //             left: falseButton.left,
  //             top: falseButton.top,
  //           });
  //           this.canvas.requestRenderAll();
  //         });
  //         this.canvas.requestRenderAll();
  //       });
  //     }
  //   );

  // }

  // createInputObject(e) {
  //     const square = new fabric.Rect({
  //       width: 50, // Kích thước cố định
  //       height: 30, // Kích thước cố định
  //       fill: 'red', // Màu nền trong suốt
  //       stroke: 'black', // Màu border
  //       strokeWidth: 2, // Độ dày border
  //       originX: 'center',
  //       originY: 'center',
  //     });

  //     // Thêm sự kiện contextmenu để mở menu context khi chuột phải
  //     square.on('mousedblclick', (event) => {
  //       event.e.preventDefault(); // Ngăn chặn hành động mặc định của menu context trình duyệt

  //       // Tạo menu context
  //       const contextMenu = document.createElement('div');
  //       contextMenu.innerHTML = 'Nhập text'; // Nội dung menu context
  //       contextMenu.style.position = 'absolute';
  //       contextMenu.style.left = `${event.e.clientX}px`;
  //       contextMenu.style.top = `${event.e.clientY}px`;
  //       contextMenu.style.backgroundColor = 'white';
  //       contextMenu.style.padding = '10px';
  //       contextMenu.style.border = '1px solid black';
  //       contextMenu.style.cursor = 'pointer';

  //       // Thêm sự kiện click cho menu context
  //       contextMenu.onclick = () => {
  //         this.addIText(square);
  //         document.body.removeChild(contextMenu); // Xóa menu context sau khi chọn
  //       };

  //       // Thêm menu context vào body
  //       document.body.appendChild(contextMenu);
  //     });

  //     // Thêm hình vuông vào canvas
  //     this.canvas.add(square);
  //   }

  //   addIText(square) {
  //     // Tạo đối tượng IText từ vị trí và kích thước của hình vuông
  //     const iText = new fabric.IText('', {
  //       left: square.left,
  //       top: square.top,
  //       fontSize: 20,
  //       fill: 'black',
  //       originX: 'center',
  //       originY: 'center',
  //     });

  //     // Thêm iText vào canvas
  //     this.canvas.add(iText);
  //     this.canvas.setActiveObject(iText);

  //     iText.enterEditing();

  //     // Thêm sự kiện blur để xử lý khi người dùng kết thúc chỉnh sửa văn bản
  //     iText.on('blur', () => {
  //       this.canvas.renderAll();
  //     });
  // }

  // createInputObject(e) {
  //   const square = new fabric.Rect({
  //       width: 50,
  //       height: 30,
  //       fill: 'red',
  //       stroke: 'black',
  //       strokeWidth: 2,
  //       originX: 'center',
  //       originY: 'center',
  //   });

  //   square.on('mousedblclick', (event) => {
  //       event.e.preventDefault();

  //       const contextMenu = document.createElement('div');
  //       contextMenu.innerHTML = 'Nhập text';
  //       contextMenu.style.position = 'absolute';
  //       contextMenu.style.left = `${event.e.clientX}px`;
  //       contextMenu.style.top = `${event.e.clientY}px`;
  //       contextMenu.style.backgroundColor = 'white';
  //       contextMenu.style.padding = '10px';
  //       contextMenu.style.border = '1px solid black';
  //       contextMenu.style.cursor = 'pointer';

  //       contextMenu.onclick = () => {
  //           this.addIText(square);
  //           document.body.removeChild(contextMenu);
  //       };

  //       document.body.appendChild(contextMenu);
  //   });

  //   this.canvas.add(square);
  // }

  // addIText(square) {
  //   const iText = new fabric.IText('', {
  //       left: square.left,
  //       top: square.top,
  //       fontSize: 20,
  //       fill: 'black',
  //       originX: 'center',
  //       originY: 'center',
  //   });

  //   // Set the square size based on the initial text width
  //   const initialTextWidth = iText.width * iText.scaleX;
  //   const initialTextHeight = iText.height * iText.scaleY;

  //   square.set({
  //       width: initialTextWidth + 20, // Add some padding
  //       height: initialTextHeight + 20, // Add some padding
  //   });

  //   this.canvas.add(iText);
  //   this.canvas.setActiveObject(iText);

  //   iText.enterEditing();

  //   iText.on('changed', () => {
  //       // Adjust the square size based on the updated text width
  //       const textWidth = iText.width * iText.scaleX;
  //       const textHeight = iText.height * iText.scaleY;

  //       square.set({
  //           width: textWidth + 20, // Add some padding
  //           height: textHeight + 20, // Add some padding
  //       });

  //       this.canvas.renderAll();
  //   });
  // }

  createInputObject(e) {
    const square = new fabric.Rect({
      left: 100,
      top: 100,
      width: 40,
      height: 40,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 2,
      originX: 'center',
      originY: 'center',
    });
    this.addIText(square, '');
  }

  createInputObjectMN(InputLeft, InputTop) {
    const square = new fabric.Rect({
      left: InputLeft,
      top: InputTop,
      width: 40,
      height: 40,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 2,
      originX: 'center',
      originY: 'center',
    });
    const iText = new fabric.IText('', {
      left: square.left,
      top: square.top,
      fontSize: 20,
      fill: 'black',
      originX: 'center',
      originY: 'center',
      width: square.width,
      height: square.height,
    });
    const group = new fabric.Group([square, iText], {
      name: 'quiz-inputObj',
      left: InputLeft,
      top: InputTop,
      originX: 'center',
      originY: 'center',
      objectID: this.randomID() as any,
      width: square.width,
      height: square.height,
    } as any);
    correctAnswers.push({
      objectID: (group as any).objectID,
      answer: iText.text,
    });
    // console.log(correctAnswers);
    startActiveObjectQuiz(group, this.page.audioRecorder, this.page.translate);

    group.on('moving', () => {
      // Disable text editing when the group is being moved
      iText.exitEditing();
    });
    return group;
  }

  addIText(square, userInputText) {
    console.log('User Input Text:', userInputText);

    const iText = new fabric.IText(userInputText, {
      left: square.left,
      top: square.top,
      fontSize: 20,
      fill: 'black',
      originX: 'center',
      originY: 'center',
      width: square.width,
      height: square.height,
    });

    const group = new fabric.Group([square, iText], {
      name: 'quiz-inputObj',
      originX: 'center',
      originY: 'center',
      objectID: this.randomID() as any,
      width: square.width,
      height: square.height,
    } as any);
    this.canvas.add(group);
    correctAnswers.push({
      objectID: (group as any).objectID,
      answer: iText.text,
    });
    // console.log(correctAnswers);
    startActiveObjectQuiz(group, this.page.audioRecorder, this.page.translate);

    group.on('moving', () => {
      // Disable text editing when the group is being moved
      iText.exitEditing();
    });
  }

  createQuiz(e) {
    fabric.Image.fromURL(
      'https://img.lovepik.com/free-png/20211129/lovepik-learning-supplies-border-png-image_401196175_wh1200.png',
      (backgroundImg) => {
        backgroundImg.set({
          originX: 'left',
          originY: 'top',
          scaleX: this.canvas.width / backgroundImg.width,
          scaleY: this.canvas.height / backgroundImg.height,
          selectable: false,
        });

        this.canvas.add(backgroundImg);
        backgroundImg.moveTo(0);
        // this.canvas.setActiveObject(backgroundImg); // Đặt đối tượng backgroundImg làm đối tượng được chọn
        // this.canvas.sendToBack(backgroundImg); // Đưa ảnh backgroundImg xuống dưới cùng

        fabric.Image.fromURL(
          'https://cdn.popsww.com/blog-kids-learn/sites/5/2022/12/toan-hinh-lop-1.jpg',
          (img) => {
            img.set({
              stroke: this.selectedColor,
              strokeWidth: Number(this.selectedWidth),
              originX: 'center',
              originY: 'center',
              left: -30,
              top: -30,
              scaleX: 0.5,
              scaleY: 0.5,
            });

            const textObject = new fabric.Text(
              'Hình trên có bao nhiêu hình chữ nhật?',
              {
                fontSize: 20,
                fill: 'black',
                originX: 'center',
                originY: 'center',
              }
            );

            const trueButton = new fabric.Rect({
              width: 60,
              height: 30,
              fill: 'white',
              originX: 'center',
              originY: 'center',
            });

            const trueButtonText = new fabric.Text('4', {
              fontSize: 16,
              fill: 'black',
              originX: 'center',
              originY: 'center',
            });

            trueButton.on('mousedown', () => {
              // Thay đổi màu chữ khi nhấp chuột
              trueButtonText.set({ fill: 'red' });
              trueButton.set({ fill: 'green' });

              var result = 'Đúng';
              var resultBox = new fabric.Text(`Kết quả: ${result}`, {
                fontSize: 20,
                fill: 'black',
                fontFamily: 'Time New Roman',
                left: 200,
                top: 400,
                originX: 'center',
                originY: 'center',
              });
              this.canvas.add(resultBox);
              this.canvas.requestRenderAll();
            });

            const falseButton = new fabric.Rect({
              width: 60,
              height: 30,
              fill: 'white',
              originX: 'center',
              originY: 'center',
            });
            const falseButtonText = new fabric.Text('5', {
              fontSize: 16,
              fill: 'black',
              originX: 'center',
              originY: 'center',
            });

            trueButton.on('mousedown', () => {
              // Thay đổi màu chữ khi nhấp chuột
              trueButtonText.set({ fill: 'red' });
              falseButton.set({ fill: 'red' });
              this.canvas.requestRenderAll();
            });
            this.canvas.add(
              img,
              textObject,
              trueButton,
              trueButtonText,
              falseButton,
              falseButtonText
            );
            img.on('modified', () => {
              textObject.set({
                left: img.left,
                top: img.top,
              });
              trueButton.set({
                left: img.left + 20,
                top: img.top + img.height / 2 + 20,
              });
              trueButtonText.set({
                left: trueButton.left,
                top: trueButton.top,
              });
              falseButton.set({
                left: img.left - 40,
                top: img.top + img.height / 2 + 20,
              });
              falseButtonText.set({
                left: falseButton.left,
                top: falseButton.top,
              });
              this.canvas.requestRenderAll();
            });
            this.canvas.requestRenderAll();
          }
        );
      }
    );
  }

  gameQuiz(e) {
    fabric.Image.fromURL(
      'https://img.lovepik.com/free-png/20211129/lovepik-learning-supplies-border-png-image_401196175_wh1200.png',
      (backgroundImg) => {
        backgroundImg.set({
          originX: 'left',
          originY: 'top',
          scaleX: this.canvas.width / backgroundImg.width,
          scaleY: this.canvas.height / backgroundImg.height,
          selectable: false,
        });

        this.canvas.add(backgroundImg);
        backgroundImg.moveTo(0);
        // this.canvas.setActiveObject(backgroundImg); // Đặt đối tượng backgroundImg làm đối tượng được chọn
        // this.canvas.sendToBack(backgroundImg); // Đưa ảnh backgroundImg xuống dưới cùng

        fabric.Image.fromURL(
          'https://cdn.popsww.com/blog-kids-learn/sites/5/2022/12/toan-hinh-lop-1.jpg',
          (img) => {
            img.set({
              stroke: this.selectedColor,
              strokeWidth: Number(this.selectedWidth),
              originX: 'center',
              originY: 'center',
              left: -30,
              top: -30,
              scaleX: 0.5,
              scaleY: 0.5,
            });

            const textObject = new fabric.Text(
              'Hình trên có bao nhiêu hình chữ nhật?',
              {
                fontSize: 20,
                fill: 'black',
                originX: 'center',
                originY: 'center',
              }
            );

            const trueButton = new fabric.Rect({
              width: 60,
              height: 30,
              fill: 'white',
              originX: 'center',
              originY: 'center',
            });

            const trueButtonText = new fabric.Text('4', {
              fontSize: 16,
              fill: 'black',
              originX: 'center',
              originY: 'center',
            });

            trueButton.on('mousedown', () => {
              // Thay đổi màu chữ khi nhấp chuột
              trueButtonText.set({ fill: 'red' });
              trueButton.set({ fill: 'green' });

              var result = 'Đúng';
              var resultBox = new fabric.Text(`Kết quả: ${result}`, {
                fontSize: 50,
                fill: 'black',
                fontFamily: 'Time New Roman',
                left: 200,
                top: 400,
                originX: 'center',
                originY: 'center',
              });
              this.canvas.add(resultBox);
              this.canvas.requestRenderAll();
            });

            const falseButton = new fabric.Rect({
              width: 60,
              height: 30,
              fill: 'white',
              originX: 'center',
              originY: 'center',
            });
            const falseButtonText = new fabric.Text('5', {
              fontSize: 16,
              fill: 'black',
              originX: 'center',
              originY: 'center',
            });

            trueButton.on('mousedown', () => {
              // Thay đổi màu chữ khi nhấp chuột
              trueButtonText.set({ fill: 'red' });
              falseButton.set({ fill: 'red' });
              this.canvas.requestRenderAll();
            });
            this.canvas.add(
              img,
              textObject,
              trueButton,
              trueButtonText,
              falseButton,
              falseButtonText
            );
            img.on('modified', () => {
              textObject.set({
                left: img.left,
                top: img.top,
              });
              trueButton.set({
                left: img.left + 20,
                top: img.top + img.height / 2 + 20,
              });
              trueButtonText.set({
                left: trueButton.left,
                top: trueButton.top,
              });
              falseButton.set({
                left: img.left - 40,
                top: img.top + img.height / 2 + 20,
              });
              falseButtonText.set({
                left: falseButton.left,
                top: falseButton.top,
              });
              this.canvas.requestRenderAll();
            });
            this.canvas.requestRenderAll();
          }
        );
      }
    );
  }
  listAnswer = [];
  doQuiz(e) {
    const canvas = this.canvas;
    const _this = this;
    _this.userConnectedImagePairs = [];
    _this.isEdit = false;
    _this.selectedImagesForLine = [];
    _this.isConnect = true;

    const objectsToRemove = [];
    canvas.getObjects('line').forEach((obj) => {
      objectsToRemove.push(obj);
    });
    objectsToRemove.forEach((obj) => canvas.remove(obj));
    const inputElements = document.querySelectorAll('.mic-input') as NodeListOf<HTMLInputElement>;

    inputElements.forEach((inputElement, index) => {
      const userAnswer = inputElement.value; // Access the value of each input
      this.listAnswer.push(userAnswer);
      inputElement.value = '';
      // Compare the user answer with the original answer (assuming you have an array of correct answers)
      const correctAnswer = this.originalAnswer[index]; // Replace with your logic for getting the correct answer
      if (userAnswer === correctAnswer) {
        console.log(`Correct Answer for mic-input ${index + 1}`);
        // Implement correct answer logic (e.g., score tracking)
      } else {
        console.log(`Wrong Answer for mic-input ${index + 1}`);
        // Implement wrong answer logic
      }
    });

    tempJson = {
      canvas: JSON.stringify(windowCanvas.toJSON(customAttributes)),
      correctAnswers: correctAnswers,
      gameType: quizType,
      screenSize: getCurrentDeviceSize(),
      screenOrientation: selectedOrientation,
    };
    console.log('doQuiz');
    isDoQuiz = true;
    isSelectAnswer = false;

    //reset color of all quiz item
    windowCanvas.forEachObject(function (obj) {
      console.log('obj', obj);
      if (obj && _this.connectedImagePairs.length == 0) {
        if (obj.name && obj.name === 'quiz-inputObj') {
          obj.item(0).set({ fill: 'white' });
          obj.item(1).set({ text: '' });
          obj.item(1).exitEditing();

          //Khóa Object của Input khi doQuiz
          obj.set({
            selectable: false,
            hasControls: false,
            hasBorders: false,
            lockMovementX: true,
            lockMovementY: true,
          });
          console.log('obj.item(0).fill', obj);
          windowCanvas.renderAll();
        } else if (obj.name && (obj.name === 'quiz-MutipleObject-false' || obj.name === 'quiz-MutipleObject-true')) {
          obj._objects[0].set({
            shadow: null,
          });
          obj.set({
            selectable: false,
            hasControls: false,
            hasBorders: false,
            lockMovementX: true,
            lockMovementY: true,
          });
        }
        else if (obj.name && obj.name === 'quiz-matchObj-vessel') {
          //set object cant move
          obj.set({
            lockMovementX: true,
            lockMovementY: true,
            hasControls: false,
            hasBorders: false,
            selectable: false,
            evented: false,
          });
        } else if (obj.name && obj.name === 'quiz-matchObj-answer') {
          obj.set({
            hasBorders: false,
            hasControls: false,
            lockMovementX: false,
            lockMovementY: false,
            selectable: true,
            evented: true,
          });
        } else if (obj.name && (
          obj.name.startsWith('connect-line') ||
          obj.name.startsWith('controller') ||
          obj.name.startsWith('port')
        )
        ) {
          obj.set({
            fill: 'transparent',
            stroke: 'transparent',
            visible: false,
          });
        } else if (obj.name && obj.name === 'quiz-matchObj-line') {
          obj.set({
            fill: 'transparent',
            stroke: 'transparent',
            visible: false,
          });
        }

        else if (obj._objects) {
          obj._objects.forEach(function (item) {
            if (item) {
              if (item.name === 'quiz-selectObj') {
                if (item.item(0).fill === 'yellow') {
                  item.item(0).set({ fill: 'white' });
                  console.log('item.item(0).fill', item);
                }
              }
              else {
                //Khóa Object của Select khi doQuiz
                obj.set({
                  selectable: false,
                  hasControls: false,
                  hasBorders: false,
                  lockMovementX: true,
                  lockMovementY: true,
                });
              }
            }
          });
        }
        else if (obj.idHeadphone) {
          obj.set({
            selectable: false,
            hasControls: false,
            hasBorders: false,
            lockMovementX: true,
            lockMovementY: true,
          });
        } else {
          // Khóa Object của Select khi doQuiz
          obj.set({
            selectable: false,
            hasControls: false,
            hasBorders: false,
            lockMovementX: true,
            lockMovementY: true,
          });
        }
        windowCanvas.renderAll();
      } else {
        obj.set({
          selectable: false,
          hasControls: false,
          hasBorders: false,
        });
        windowCanvas.renderAll();
      }
    });
    selectedAnswers = [];
    if (this.canvas.getActiveObject()) {
      this.canvas.discardActiveObject();
      this.canvas.renderAll();
    }
  }

  async ExitQuizDoMode(e) {
    console.log('exitDoQuiz');
    windowCanvas.forEachObject(function (obj) {
      if (obj) {
        if (obj.name && obj.name === 'quiz-inputObj') {
          obj.item(1).exitEditing();
        } else if (obj.name == 'quiz-flashcard') {
          disableFlashcardInputText(obj);
        }
      }
    });

    //reset canvas
    const _this = this;
    _this.isConnect = false;
    correctAnswers = [];
    selectedAnswers = [];
    pool_data = [];
    isDoQuiz = false;

    isAddConnection = false;
    currentLine = null;
    isSelectAnswer = false;
    isSelectPort = false;
    //dont let canvas move out of screen
    isMove = false;
    isGroup = false;
    drawing = false;
    lastSelectedObject = null;
    objCover = null;
    isChoosePort = false;
    userID = '';
    isChoosePortUnConnect = false;
    isRemoveConnection = false;

    selectedAnswersString = null;
    correctAnswersString = null;

    console.log('resetQuiz');
    windowCanvas.clear();
    correctAnswers = tempJson.correctAnswers;
    var oldDeviceScreenSize = tempJson.screenSize;

    const canvasObj = JSON.parse(tempJson.canvas);
    quizType = tempJson.gameType;
    console.log('quizType temp', quizType)
    if (tempJson.gameType === 'quiz-1') {
      this.loadCanvasQuiz1(canvasObj, oldDeviceScreenSize);
    } else if (tempJson.gameType === 'quiz-3') {
      this.loadCanvasQuiz3(canvasObj, oldDeviceScreenSize);
    }
    else if (tempJson.gameType === 'quiz-4') {
      await this.loadCanvasDefault(canvasObj, oldDeviceScreenSize);
    } else {
      this.loadCanvasDefault(canvasObj, oldDeviceScreenSize);
    }

    setCursorToEditMode();
  }

  loadBackGroundFromPath(dataURL: string) {
    const screenSize = getCurrentDeviceSize();
    fabric.Image.fromURL(dataURL, function (img) {
      img.set({
        name: 'background',
        left: screenSize.width / 2,
        top: screenSize.height / 2,
        objectType: '',
        objectCaching: false,
        hasControls: true,
        hasBorders: true,
      } as any);
      (img as any).isBackground = true;
      const scaleX = screenSize.width / img.width;
      const scaleY = screenSize.height / img.height;
      img.set({
        scaleX,
        scaleY,
      });
      windowCanvas.setBackgroundImage(
        img,
        windowCanvas.renderAll.bind(windowCanvas),
        {
          scaleX,
          scaleY,
        }
      );
      console.log("LOAD background");
      windowCanvas.renderAll();
    });
  }

  loadJsonFromPath(path: string, HttpClient: HttpClient) {
    HttpClient.get(path).subscribe((data: any) => {
      console.log('data', data);
      console.log('data.gameType', data.gameType);
      correctAnswers = data.correctAnswers;
      var oldDeviceScreenSize = data.screenSize;

      const canvasObj = JSON.parse(data.canvas);
      quizType = data.gameType;
      if (data.gameType === 'quiz-1') {
        this.loadCanvasQuiz1(canvasObj, oldDeviceScreenSize);
      } else if (data.gameType === 'quiz-3') {
        this.loadCanvasQuiz3(canvasObj, oldDeviceScreenSize);
      } else {
        this.loadCanvasDefault(canvasObj, oldDeviceScreenSize);
      }
    });
  }

  attachQuizHandler(obj: any) {
    if (obj.name === 'quiz') {
      obj._objects.forEach((obj2) => {
        startActiveObjectQuiz(obj2, this.page.audioRecorder, this.page.translate);
      });
    } else if (obj.name == "quiz-flashcard") {
      handleFlashcard(obj, getIsDoQuiz, this.page.audioRecorder, this.page.translate);
    }
  }

  loadCanvasQuiz1(canvasObj, oldDeviceScreenSize) {
    const _this = this;
    windowCanvas.loadFromJSON(canvasObj, () => {
      const backgroundImage = windowCanvas.backgroundImage;
      this.resizeCanvas(backgroundImage);

      var screenSize = getCurrentDeviceSize();
      var allObjects = windowCanvas.getObjects();

      // allObjects.forEach((obj) => {
      //   windowCanvas.remove(obj);

      //   // Calculate new position based on scaling factors
      //   obj.left = obj.left * (screenSize.width / oldDeviceScreenSize.width);
      //   obj.top = obj.top * (screenSize.height / oldDeviceScreenSize.height);
      //   if (obj._objects[0].MicId) {
      //     const invisibleText = new fabric.IText('', {
      //       left: obj._objects[0].left! + obj._objects[0].width! * obj._objects[0].scaleX + 10,
      //       top: obj._objects[0].top,
      //       width: 120,
      //       fontSize: 16,
      //       fill: 'transparent',
      //       editable: true,
      //       evented: false
      //     });
      //     const input = document.createElement('input');
      //     const container = document.querySelector('.canvas-container');
      //     input.type = 'text';
      //     input.placeholder = '';
      //     input.style.position = 'absolute'; // Use absolute positioning
      //     input.style.left = `${obj.left + invisibleText.width! + 20}px`; // Position it next to the icon
      //     input.style.top = `${obj.top - 15}px`;
      //     input.style.fontSize = '16px'; // Font size
      //     input.style.padding = '5px'; // Padding for better appearance
      //     input.style.border = '1px solid #00aaff'; // Border style
      //     input.style.borderRadius = '4px'; // Rounded corners
      //     input.style.outline = 'none';
      //     input.disabled = true;
      //     input.value = obj._objects[0].value
      //     // input.style.backgroundColor = '#f0f0f0'; // Background color
      //     input.classList.add('mic-input', 'hidden-value', "" + obj._objects[0].MicId);
      //     this.originalAnswer = input.value;
      //     // Append the input element to the body or a specific container
      //     container.appendChild(input);
      //     obj.on('modified', function () {
      //       input.style.left = `${obj.left + invisibleText.width! + 20}px`;
      //       input.style.top = `${obj.top - 15}px`;
      //     });
      //     // Event for the mic icon (inside the obj._objects[0])
      //     obj.on('mousedown', function () {
      //       _this.page.startRecording(input, obj._objects[0].MicId);
      //       // _this.startListening(input);
      //       _this.page.isRecording = !_this.page.isRecording;
      //       // console.log(_this.page);
      //     })
      //   }
      //   this.attachQuizHandler(obj);
      //   windowCanvas.add(obj);
      // });

      allObjects.forEach((obj) => {
        windowCanvas.remove(obj);

        if(obj._objects && obj._objects.length > 0){
            const firstObj = obj._objects[0];
            if(firstObj.MicId && firstObj.left !==undefined && firstObj.width !== undefined && firstObj.scaleX !== undefined){
              // Calculate new position based on scaling factors
        obj.left = obj.left * (screenSize.width / oldDeviceScreenSize.width);
        obj.top = obj.top * (screenSize.height / oldDeviceScreenSize.height);
        if (obj._objects[0].MicId) {
          const invisibleText = new fabric.IText('', {
            left: obj._objects[0].left! + obj._objects[0].width! * obj._objects[0].scaleX + 10,
            top: obj._objects[0].top,
            width: 120,
            fontSize: 16,
            fill: 'transparent',
            editable: true,
            evented: false
          });
          const input = document.createElement('input');
          const container = document.querySelector('.canvas-container');
          input.type = 'text';
          input.placeholder = '';
          input.style.position = 'absolute'; // Use absolute positioning
          input.style.left = `${obj.left + invisibleText.width! + 20}px`; // Position it next to the icon
          input.style.top = `${obj.top - 15}px`;
          input.style.fontSize = '16px'; // Font size
          input.style.padding = '5px'; // Padding for better appearance
          input.style.border = '1px solid #00aaff'; // Border style
          input.style.borderRadius = '4px'; // Rounded corners
          input.style.outline = 'none';
          input.disabled = true;
          input.value = obj._objects[0].value
          // input.style.backgroundColor = '#f0f0f0'; // Background color
          input.classList.add('mic-input', 'hidden-value', "" + obj._objects[0].MicId);
          this.originalAnswer = input.value;
          // Append the input element to the body or a specific container
          container.appendChild(input);
          obj.on('modified', function () {
            input.style.left = `${obj.left + invisibleText.width! + 20}px`;
            input.style.top = `${obj.top - 15}px`;
          });
          // Event for the mic icon (inside the obj._objects[0])
          obj.on('mousedown', function () {
            _this.page.startRecording(input, obj._objects[0].MicId);
            // _this.startListening(input);
            _this.page.isRecording = !_this.page.isRecording;
            // console.log(_this.page);
          })
        }
            }
          }
        this.attachQuizHandler(obj);
        windowCanvas.add(obj);
      });

      windowCanvas.requestRenderAll();
    });
  }

  loadCanvasQuiz3(canvasObj, oldDeviceScreenSize) {
    windowCanvas.loadFromJSON(canvasObj, () => {
      const backgroundImage = windowCanvas.backgroundImage;
      this.resizeCanvas(backgroundImage);

      var screenSize = getCurrentDeviceSize();
      console.log('data.gameType', windowCanvas.getObjects());
      var allObjects = windowCanvas.getObjects();

      allObjects.forEach((obj) => {
        windowCanvas.remove(obj);

        if (obj.name && obj.name.startsWith('quiz-matchObj')) {
          // Calculate new position based on scaling factors
          obj.left = obj.left * (screenSize.width / oldDeviceScreenSize.width);
          obj.top = obj.top * (screenSize.height / oldDeviceScreenSize.height);

          // Scale object size
          // obj.scaleX *= screenSize.width / oldDeviceScreenSize.width;
          // obj.scaleY *= screenSize.height / oldDeviceScreenSize.height;
          startActiveObjectQuiz(obj, this.page.audioRecorder, this.page.translate);
        }
        // || obj.name.startsWith('port')
        // obj.name === 'connect-line' || obj.name === 'controller' ||
        else if (
          obj.name &&
          (obj.name.startsWith('port') ||
            obj.name.startsWith('connect-line') ||
            obj.name.startsWith('controller'))
        ) {
          //windowCanvas.remove(obj);
          return;
        }
        windowCanvas.add(obj);
      });
      // var lineObjects = windowCanvas.getObjects().filter((obj) => obj.name.startsWith('connect-line'));
      correctAnswers.forEach((correctAnswer) => {
        var vesselObj = windowCanvas
          .getObjects()
          .find((obj) => obj.objectID === correctAnswer.vesselID);
        var answerObj = windowCanvas
          .getObjects()
          .find((obj) => obj.objectID === correctAnswer.answerID);
        this.addPortToObject(vesselObj);
        this.addPortToObject(answerObj);
        var vesselPortIndex = correctAnswer.vesselPort;
        var answerPortIndex = correctAnswer.answerPort;
        var vesselPort = vesselObj.ports[vesselPortIndex];
        var answerPort = answerObj.ports[answerPortIndex];
        console.log('vesselPortIndex', vesselPort);
        console.log('answerPortIndex', answerPort);
        var allController = allObjects.filter(
          (obj) =>
            obj.name.startsWith(
              `controller-${vesselObj.objectID}-${answerObj.objectID}`
            ) ||
            obj.name.startsWith(
              `controller-${answerObj.objectID}-${vesselObj.objectID}`
            )
        );
        var controller1 = allController.find(
          (obj) =>
            obj.name ===
            `controller-${vesselObj.objectID}-${answerObj.objectID}-0` ||
            obj.name ===
            `controller-${answerObj.objectID}-${vesselObj.objectID}-0`
        );
        var controller2 = allController.find(
          (obj) =>
            obj.name ===
            `controller-${vesselObj.objectID}-${answerObj.objectID}-1` ||
            obj.name ===
            `controller-${answerObj.objectID}-${vesselObj.objectID}-1`
        );
        ConnectPorts(vesselObj, answerObj, vesselPort, answerPort);
      });
      windowCanvas.requestRenderAll();
    });
  }

  loadCanvasQuiz4() {
    const canvas = this.canvas;

    // Xóa tất cả các dòng do người dùng đã tạo
    const userLines = canvas.getObjects('line');
    userLines.forEach(line => {
      canvas.remove(line);
    });
    this.userConnectedImagePairs = [];
    this.restoreInitialLines();
    canvas.renderAll();
  }

  // Hàm khôi phục các dòng nối ban đầu
  restoreInitialLines() {
    const canvas = this.canvas;

    this.connectedImagePairs.forEach(pair => {
      const img1 = this.getImageById(pair.id1);
      const img2 = this.getImageById(pair.id2);

      if (img1 && img2) {
        const img1Center = img1.getCenterPoint();
        const img2Center = img2.getCenterPoint();

        const img1Width = img1.width * img1.scaleX;
        const img2Width = img2.width * img2.scaleX;

        const offset = 20;  // Khoảng cách từ biên hình ảnh

        const point1 = { x: img1Center.x + img1Width / 2 + offset, y: img1Center.y };
        const point2 = { x: point1.x, y: img2Center.y };

        // Tạo 3 đoạn thẳng (dọc, ngang, dọc)
        const line1 = new fabric.Line([img1Center.x + img1Width / 2, img1Center.y, point1.x, point1.y], {
          stroke: 'black',
          strokeWidth: 2,
          selectable: false,
          hasControls: false,
          hasBorders: false,
        });

        const line2 = new fabric.Line([point1.x, point1.y, point2.x, point2.y], {
          stroke: 'black',
          strokeWidth: 2,
          selectable: false,
          hasControls: false,
          hasBorders: false,
        });

        const line3 = new fabric.Line([point2.x, point2.y, img2Center.x - img2Width / 2, img2Center.y], {
          stroke: 'black',
          strokeWidth: 2,
          selectable: false,
          hasControls: false,
          hasBorders: false,
        });

        // Thêm các đoạn thẳng vào canvas
        canvas.add(line1);
        canvas.add(line2);
        canvas.add(line3);

        this.userConnectedImagePairs.push({
          id1: img1.objectID,
          id2: img2.objectID,
          lines: [line1, line2, line3]  // Lưu các line vào để quản lý
        });

        this.selectedImagesForLine = [];
        canvas.renderAll();

        // Gắn sự kiện 'moving' cho mỗi hình ảnh
        img1.on('moving', () => this.updateLines(img1));
        img2.on('moving', () => this.updateLines(img2));
      }
    });
  }


  // Hàm để tìm hình ảnh theo objectID
  // Hàm tìm hình ảnh theo objectID
  getImageById(objectID: string) {
    console.log(this.canvas.getObjects())
    return this.canvas.getObjects().find(obj => obj.objectID === objectID);
  }


  loadCanvasDefault(canvasObj, oldDeviceScreenSize) {
    console.log('load default')
    if (quizType == 'quiz-11') {
      const allAnswers = correctAnswers.every(
        (item) => typeof item === 'object'
      );
      if (allAnswers) {
        var oldAnswers = correctAnswers;
        correctAnswers = [];
        oldAnswers.forEach((answer) => {
          correctAnswers.push(answer.objectID);
        });
      }
    }

    console.log('correctAnswers', correctAnswers);
    windowCanvas.loadFromJSON(canvasObj, () => {
      const backgroundImage = windowCanvas.backgroundImage;
      this.resizeCanvas(backgroundImage);

      var screenSize = getCurrentDeviceSize();
      console.log('data.gameType', windowCanvas.getObjects());
      var allObjects = windowCanvas.getObjects();

      // Scale each object individually
      allObjects.forEach((obj) => {
        windowCanvas.remove(obj);

        // Calculate new position based on scaling factors
        obj.left = obj.left * (screenSize.width / oldDeviceScreenSize.width);
        obj.top = obj.top * (screenSize.height / oldDeviceScreenSize.height);

        //edit Hung 02/1/2024
        if (obj.name && obj.name === "quiz-inputObj") {
          obj.width = obj.width * (screenSize.width / oldDeviceScreenSize.width);
          obj.height = obj.height * (screenSize.height / oldDeviceScreenSize.height);
          obj.item(0).width = obj.width;
          obj.item(0).height = obj.height;
          grid = obj.item(0).width;
          height_grid = obj.item(0).height;
        }

        startActiveObjectQuiz(obj, this.page.audioRecorder, this.page.translate);
        windowCanvas.add(obj);
      });
      windowCanvas.requestRenderAll();
      if (quizType == 'quiz-4') {
        this.loadCanvasQuiz4();
      }
    });


  }

  resizeCanvas(backgroundImage) {
    if (backgroundImage) {
      const screenSize = getCurrentDeviceSize();
      const scaleX = screenSize.width / backgroundImage.width;
      const scaleY = screenSize.height / backgroundImage.height;

      backgroundImage.set({
        scaleX,
        scaleY,
        left: screenSize.width / 2,
        top: screenSize.height / 2,
      });

      windowCanvas.centerObject(backgroundImage);
      windowCanvas.renderAll();
    } else {
      console.log("backgroundImage is undefined");
    }
  }

  checkResult(e) {
    var result = 'True';
    var existingResultBox = windowCanvas
      .getObjects()
      .find((obj) => obj.name === 'result-box');
    windowCanvas.remove(existingResultBox);
    if (quizType == 'quiz-1') {
      const inputElements = document.querySelectorAll('.mic-input') as NodeListOf<HTMLInputElement>;
      console.log('checkResult', correctAnswers, selectedAnswers);

      //check if all item in selectedAnswers is in correctAnswers
      if (selectedAnswers.length !== correctAnswers.length) {
        result = 'False';
      }
      // Check if every item in selectedAnswers is present in correctAnswers
      const isEveryAnswerCorrect = selectedAnswers.every((selectedAnswer) =>
        correctAnswers.some(
          (correctAnswer) => correctAnswer === selectedAnswer.objectID
        )
      );
      const incorrectAnswers = selectedAnswers.filter(
        (selectedAnswer) =>
          !correctAnswers.some(
            (correctAnswer) => correctAnswer === selectedAnswer.objectID
          )
      );

      if (!isEveryAnswerCorrect) {
        result = 'False';
      }
      incorrectAnswers.forEach((incorrectAnswer) => {
        incorrectAnswer.item(0).set({ fill: 'red' });
      });
      selectedAnswers.forEach((selectedAnswer) => {
        if (
          correctAnswers.some(
            (correctAnswer) => correctAnswer === selectedAnswer.objectID
          )
        ) {
          selectedAnswer.item(0).set({ fill: 'green' });
          selectedAnswer.item(1).set({
            stroke: 'white',
          })
        }
      });
      if (inputElements.length > 0) {

        var Wrong = 0
        inputElements.forEach((inputElement, index) => {
          const userAnswer = inputElement.value;
          const correctAnswer = this.listAnswer[index]; // Replace with your logic for getting the correct answer

          if (userAnswer === correctAnswer) {
            console.log(`Correct Answer for mic-input ${index + 1}`);
            // Implement correct answer logic (e.g., score tracking)
          } else {
            console.log(`Wrong Answer for mic-input ${index + 1}`);
            Wrong++;
          }

        });
        if (Wrong != 0) {
          result = 'False';
        }
      }
      // Lâm fix code 14h25p 23/01/2024
    } else if (quizType == 'quiz-2') {
      console.log('checkResult', correctAnswers, selectedAnswers);
      // var result = 'True';
      if (selectedAnswers.length !== correctAnswers.length) {
        result = 'False';
      } else {
        console.log('selectedAnswers', selectedAnswers);
        console.log('correctAnswers', correctAnswers);
        const isEveryAnswerCorrect = selectedAnswers.every((selectAnswer) => {
          const correctAnswer = correctAnswers.find(
            (ca) => ca.objectID === selectAnswer.objectID
          );
          if (correctAnswer) {
            console.log('correctAnswer.answer', correctAnswer.answer);
            console.log('selectAnswer', selectAnswer.item(1).text);
            if (correctAnswer.answer !== selectAnswer.item(1).text) {
              result = 'False';
              selectAnswer.item(0).set({ fill: 'red' });
            } else {
              selectAnswer.item(0).set({ fill: 'green' });
              selectAnswer.item(1).set({ stroke: 'white' });
            }
          } else {
            result = 'False';
          }
          return true;
        });
      }
    } else if (quizType == 'quiz-3') {
      //get all answerID in correctAnswers
      var correctAnswersID = [];
      correctAnswers.forEach(function (item) {
        correctAnswersID.push(item.answerID);
      });
      //get all answerID in selectedAnswers
      var selectedAnswersID = [];
      selectedAnswers.forEach(function (item) {
        selectedAnswersID.push(item.answerID);
      });
      selectedAnswersID.sort();
      correctAnswersID.sort();
      selectedAnswersString = JSON.stringify(selectedAnswersID);
      correctAnswersString = JSON.stringify(correctAnswersID);
      console.log('checkResult', correctAnswersString, selectedAnswersString);
      //compare selectAnswersString and correctAnswersString
      if (selectedAnswersString != correctAnswersString) {
        result = 'False';
      } else {
        result = 'True';
      }

    } else if (quizType == 'quiz-4') {
      const correctPairs = this.connectedImagePairs;
      const userPairs = this.userConnectedImagePairs;
      var isCorrect = 0
      userPairs.forEach(userPair => {
        correctPairs.forEach(correctPair => {
          if ((userPair.id1 === correctPair.id1 && userPair.id2 === correctPair.id2) || (userPair.id1 === correctPair.id2 && userPair.id2 === correctPair.id1)) {
            isCorrect++;
          }
        });
      });
      if (isCorrect === correctPairs.length && correctPairs.length == userPairs.length) {
        result = 'True';
      } else {
        result = 'False';
      }
    } else if (quizType == 'quiz-11') {
      console.log('checkResult', correctAnswers, selectedAnswers);
      //sort correctAnswers and selectedAnswers
      correctAnswers.sort();
      selectedAnswers.sort();
      selectedAnswersString = JSON.stringify(selectedAnswers);
      correctAnswersString = JSON.stringify(correctAnswers);
      //all answer in canvas
      var allCanvasObject = this.canvas.getObjects();
      allCanvasObject.forEach(function (item) {
        if (item) {
          if (item.name && item.name == 'quiz-MutipleObject-true') {
            item._objects[0].set({ fill: 'green' });
            item._objects[1].set({
              stroke: 'black',
              fill: 'black',
            });
          } else if (item.name && item.name == 'quiz-MutipleObject-false') {
            item._objects[0].set({ fill: 'red' });
            item._objects[1].set({
              stroke: 'black',
              fill: 'black',
            });
          }
        }
      });
      //compare selectAnswersString and correctAnswersString
      if (selectedAnswersString != correctAnswersString) {
        result = 'False';
      } else {
        result = 'True';
      }
    } else {
      console.log('checkResult', correctAnswers, selectedAnswers);
      // var result = 'True';
      //check if all item in selectedAnswers is in correctAnswers
      if (selectedAnswers.length != correctAnswers.length) {
        result = 'False';
      }
      // Check if every item in selectedAnswers is present in correctAnswers
      const isEveryAnswerCorrect = selectedAnswers.every((selectedAnswer) =>
        correctAnswers.some(
          (correctAnswer) => correctAnswer.name === selectedAnswer.name
        )
      );
      if (!isEveryAnswerCorrect) {
        result = 'False';
      }

    }
    var audioCorrect = new Audio('https://admin.metalearn.vn/app/song/correct.mp3');
    var audioIncorrect = new Audio('https://admin.metalearn.vn/app/song/incorrect.mp3');
    if (audioCorrect.canPlayType && audioIncorrect.canPlayType) {
      if (result === 'True') {
        audioCorrect.play();
      } else {
        audioIncorrect.play();
      }
    }
    var screenSize = getCurrentDeviceSize();
    var resultBox = new fabric.Text(`Result: ${result}`, {
      name: 'result-box',
      fontSize: 20,
      fill: 'black',
      fontFamily: 'Time New Roman',
      left: screenSize.width / 8,
      top: screenSize.height - 20,
      originX: 'center',
      originY: 'center',
      selectable: false,
      hasControls: false,
      hasBorders: false,
      lockMovementX: true,
      lockMovementY: true,
    });
    this.canvas.add(resultBox);
    this.canvas.requestRenderAll();
  }

  addConnection() {
    console.log('addConnection');
    isAddConnection = true;
  }

  /////////////////////
  createTextBox(obj, item) {
    // superThis.lineType = ''
    this.isLoadLocal = false;
    var textbox = new fabric.IText('', {
      // type: 'text-box',
      // fontSize: 25,
      // fontFamily: 'Time New Roman',
      originX: 'center',
      originY: 'center',
      left: obj.left,
      top: obj.top,
      width: obj.width,
      fill: '#333',
      // textAlign: 'center',
      // fontWidth: 600,
      lockScalingX: true, // Prevent scaling in X-axis
      lockScalingY: true, // Prevent scaling in Y-axis
    });

    // if (item.TextY) {
    //   textbox.originY = 'bottom';
    //   textbox.top = -item.TextY;
    // }

    const group = new fabric.Group([obj, textbox], {
      name: 'object-box',
      top: 100,
      left: 100,
      // name: obj.type,
      // subTargetCheck: false,
      // fontSize: 25,
      // fontFamily: 'Time New Roman',
      // textAlign: 'center',
      // fontWeight: 'normal',
      // fontStyle: 'normal',
      // underline: false,
      width: obj.width,
      height: obj.height,
      objectID: this.randomID() as any,
    } as any);

    // this.setDefaultAttributes(group, item.UserData);
    //this.startActiveObject(group);
    startActiveObjectQuiz(group, this.page.audioRecorder, this.page.translate);
    return group;
  }

  drawing = false;
  toggleDrawMode(color, width) {
    // superThis.lineType = ''
    if (this.canvas.isDrawingMode) {
      this.setFreeDrawingMode(false);
      this.drawing = false;
    } else {
      this.setFreeDrawingMode(true);
      this.drawing = true;
      console.log('this.drawing', this.drawing);
      // windowCanvas.freeDrawingBrush = this.getSourceBrushNormal();
      windowCanvas.freeDrawingBrush = new fabric['Pencil' + 'Brush'](
        windowCanvas
      );
      //set default drawing line
      windowCanvas.freeDrawingBrush.color = this.selectedColor;
      windowCanvas.freeDrawingBrush.width = this.selectedWidth;
      windowCanvas.freeDrawingBrush._finalizeAndAddPath =
        this._finalizeAndAddPath;
      // if (this.canvas.freeDrawingBrush.getPatternSrc) {
      //   this.canvas.freeDrawingBrush.source =
      //     this.canvas.freeDrawingBrush.getPatternSrc.call(this.canvas.freeDrawingBrush);
      // }
      // this.canvas.freeDrawingBrush.shadow = new fabric.Shadow({
      //   blur: 0,
      //   offsetX: 0,
      //   offsetY: 0,
      //   affectStroke: true,
      //   color: "#ffffff",
      // });
    }
  }

  arcLine1(color, width) {
    var patternCanvas = document.createElement('canvas');
    patternCanvas.width = patternCanvas.height = 10;
    var ctx = patternCanvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(75, 50);
    ctx.quadraticCurveTo(100, 0, 125, 50);
    ctx.stroke();
  }

  vLinePatternBrush(color, width) {
    // superThis.lineType = ''
    var vLinePatternBrush = new fabric.PatternBrush(windowCanvas);

    // vLinePatternBrush.getPatternSrc = this.getSourceBrushVLine();
    vLinePatternBrush.getPatternSrc = function () {
      var patternCanvas = document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = 10;
      var ctx = patternCanvas.getContext('2d');

      ctx.strokeStyle = this.color;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(0, 5);
      ctx.lineTo(10, 5);
      ctx.closePath();
      ctx.stroke();

      return patternCanvas;
    };

    windowCanvas.freeDrawingBrush = vLinePatternBrush;

    if (this.canvas.isDrawingMode) {
      // this.setFreeDrawingMode(false);
      // this.drawing = false;
    } else {
      this.setFreeDrawingMode(true);
      this.drawing = true;
    }

    //set default drawing line
    windowCanvas.freeDrawingBrush.color = color;
    windowCanvas.freeDrawingBrush.width = width;
    windowCanvas.freeDrawingBrush._finalizeAndAddPath =
      this._finalizeAndAddPath;
    if (this.canvas.freeDrawingBrush.getPatternSrc) {
      this.canvas.freeDrawingBrush.source =
        this.canvas.freeDrawingBrush.getPatternSrc.call(
          this.canvas.freeDrawingBrush
        );
    }
    this.canvas.freeDrawingBrush.shadow = new fabric.Shadow({
      blur: 0,
      offsetX: 0,
      offsetY: 0,
      affectStroke: true,
      color: '#ffffff',
    });
  }

  hLinePatternBrush(color, width) {
    // superThis.lineType = ''
    var hLinePatternBrush = new fabric.PatternBrush(windowCanvas);
    hLinePatternBrush.getPatternSrc = function () {
      var patternCanvas = document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = 10;
      var ctx = patternCanvas.getContext('2d');

      ctx.strokeStyle = this.color;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(5, 0);
      ctx.lineTo(5, 10);
      ctx.closePath();
      ctx.stroke();

      return patternCanvas;
    };
    // hLinePatternBrush.getPatternSrc = this.getSourceBrushHLight();

    windowCanvas.freeDrawingBrush = hLinePatternBrush;

    if (this.canvas.isDrawingMode) {
      // this.setFreeDrawingMode(false);
      // this.drawing = false;
    } else {
      this.setFreeDrawingMode(true);
      this.drawing = true;
    }

    //set default drawing line
    windowCanvas.freeDrawingBrush.color = color;
    windowCanvas.freeDrawingBrush.width = width;
    windowCanvas.freeDrawingBrush._finalizeAndAddPath =
      this._finalizeAndAddPath;
    if (this.canvas.freeDrawingBrush.getPatternSrc) {
      this.canvas.freeDrawingBrush.source =
        this.canvas.freeDrawingBrush.getPatternSrc.call(
          this.canvas.freeDrawingBrush
        );
    }
    this.canvas.freeDrawingBrush.shadow = new fabric.Shadow({
      blur: 0,
      offsetX: 0,
      offsetY: 0,
      affectStroke: true,
      color: '#ffffff',
    });
  }

  squarePatternBrush(color, width) {
    // superThis.lineType = ''
    var squarePatternBrush = new fabric.PatternBrush(windowCanvas);
    squarePatternBrush.getPatternSrc = function () {
      var squareWidth = 10;
      var squareDistance = 2;

      var patternCanvas = document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = squareWidth + squareDistance;
      var ctx = patternCanvas.getContext('2d');

      ctx.fillStyle = this.color;
      ctx.fillRect(0, 0, squareWidth, squareWidth);

      return patternCanvas;
    };
    // squarePatternBrush.getPatternSrc = this.getSourceBrushSquare();

    windowCanvas.freeDrawingBrush = squarePatternBrush;

    if (this.canvas.isDrawingMode) {
      // this.setFreeDrawingMode(false);
      // this.drawing = false;
    } else {
      this.setFreeDrawingMode(true);
      this.drawing = true;
    }

    //set default drawing line
    windowCanvas.freeDrawingBrush.color = color;
    windowCanvas.freeDrawingBrush.width = width;
    windowCanvas.freeDrawingBrush._finalizeAndAddPath =
      this._finalizeAndAddPath;
    if (this.canvas.freeDrawingBrush.getPatternSrc) {
      this.canvas.freeDrawingBrush.source =
        this.canvas.freeDrawingBrush.getPatternSrc.call(
          this.canvas.freeDrawingBrush
        );
    }
    this.canvas.freeDrawingBrush.shadow = new fabric.Shadow({
      blur: 0,
      offsetX: 0,
      offsetY: 0,
      affectStroke: true,
      color: '#ffffff',
    });
  }

  diamondPatternBrush(color, width) {
    // superThis.lineType = ''
    var diamondPatternBrush = new fabric.PatternBrush(windowCanvas);
    diamondPatternBrush.getPatternSrc = function () {
      var squareWidth = 10;
      var squareDistance = 5;
      var patternCanvas = document.createElement('canvas');
      var rect = new fabric.Rect({
        width: squareWidth,
        height: squareWidth,
        angle: 45,
        fill: this.color,
      });

      var canvasWidth = rect.getBoundingRect().width;

      patternCanvas.width = patternCanvas.height = canvasWidth + squareDistance;
      rect.set({ left: canvasWidth / 2, top: canvasWidth / 2 });

      var ctx = patternCanvas.getContext('2d');
      rect.render(ctx);
      console.log('patternCanvas', patternCanvas);
      return patternCanvas;
    };
    // diamondPatternBrush.getPatternSrc = this.getSourceBrushDiamond();

    windowCanvas.freeDrawingBrush = diamondPatternBrush;

    if (this.canvas.isDrawingMode) {
      // this.setFreeDrawingMode(false);
      // this.drawing = false;
    } else {
      this.setFreeDrawingMode(true);
      this.drawing = true;
    }

    //set default drawing line
    windowCanvas.freeDrawingBrush.color = color;
    windowCanvas.freeDrawingBrush.width = width;
    windowCanvas.freeDrawingBrush._finalizeAndAddPath =
      this._finalizeAndAddPath;
    if (this.canvas.freeDrawingBrush.getPatternSrc) {
      this.canvas.freeDrawingBrush.source =
        this.canvas.freeDrawingBrush.getPatternSrc.call(
          this.canvas.freeDrawingBrush
        );
    }
    this.canvas.freeDrawingBrush.shadow = new fabric.Shadow({
      blur: 0,
      offsetX: 0,
      offsetY: 0,
      affectStroke: true,
      color: '#ffffff',
    });
  }

  getSourceBrushNormal() {
    return new fabric['Pencil' + 'Brush'](windowCanvas);
  }

  getSourceBrushVLine() {
    var patternCanvas = document.createElement('canvas');
    patternCanvas.width = patternCanvas.height = 10;
    var ctx = patternCanvas.getContext('2d');

    ctx.strokeStyle = this.color;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.lineTo(10, 5);
    ctx.closePath();
    ctx.stroke();

    return patternCanvas;
  }

  getSourceBrushHLight() {
    var patternCanvas = document.createElement('canvas');
    patternCanvas.width = patternCanvas.height = 10;
    var ctx = patternCanvas.getContext('2d');

    ctx.strokeStyle = this.color;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(5, 0);
    ctx.lineTo(5, 10);
    ctx.closePath();
    ctx.stroke();

    return patternCanvas;
  }

  getSourceBrushSquare() {
    var squareWidth = 10;
    var squareDistance = 2;

    var patternCanvas = document.createElement('canvas');
    patternCanvas.width = patternCanvas.height = squareWidth + squareDistance;
    var ctx = patternCanvas.getContext('2d');

    ctx.fillStyle = this.color;
    ctx.fillRect(0, 0, squareWidth, squareWidth);

    return patternCanvas;
  }

  getSourceBrushDiamond() {
    var squareWidth = 10;
    var squareDistance = 5;
    var patternCanvas = document.createElement('canvas');
    var rect = new fabric.Rect({
      width: squareWidth,
      height: squareWidth,
      angle: 45,
      fill: this.color,
    });

    var canvasWidth = rect.getBoundingRect().width;

    patternCanvas.width = patternCanvas.height = canvasWidth + squareDistance;
    rect.set({ left: canvasWidth / 2, top: canvasWidth / 2 });

    var ctx = patternCanvas.getContext('2d');
    rect.render(ctx);
    console.log('patternCanvas', patternCanvas);
    return patternCanvas;
  }

  onDrawLineMouseUp(options) {
    this.isCurving = false;
    if (this.lineType === 'waving' || this.lineType === 'simple') {
      this.isDown = false;
      if (this.drawLine) {
        this.drawLine.setCoords();
        // setDefaultAttributes(this.drawLine);
        // startActiveObject(this.drawLine);
        this.drawLine.set({
          name: 'line-style',
          // this.lineType,
        });

        windowCanvas.setActiveObject(this.drawLine).renderAll();
        this.drawLine = null;
      }
      // this.isLoadDataLocal = false;
      // emitEvent();

      //"#lines").click();
    }
    // else if (this.lineType === 'curve') {
    //   const pointer = windowCanvas.getPointer(options.e);
    // }

    var time = 500;

    if (true) {
      time = 1000;
    }
    this.drawLineTimeId = setTimeout(() => {
      // onDrawLineDblClick()
    }, time);
  }

  onDrawLineDblClick() {
    if (this.drawingLineTimeId) {
      clearTimeout(this.drawingLineTimeId);
      this.drawingLineTimeId = null;
    }
    if (this.drawLineTimeId) {
      clearTimeout(this.drawLineTimeId);
      this.drawLineTimeId = null;
    }
    if (
      superThis.lineType === 'multiple' ||
      superThis.lineType === 'dash' ||
      superThis.lineType === 'curve' ||
      superThis.lineType === 'dot'
    ) {
      if (this.drawLine) {
        this.drawLine.setCoords();
      }
      this.isDown = false;
      this.isDrawingLine = false;
      this.drawLine = null;
      if (this.lineArray.length > 0) {
        this.lineArray.forEach((line) => windowCanvas.canvas.remove(line));

        let lines;
        if (this.lineType === 'curve') {
          lines = new fabric.Path('M 0 0', {
            fill: null,
            selectable: true,
            stroke: superThis.selectedColor,
            strokeWidth: Number(superThis.selectedWidth),
          });

          const path = [];

          this.lineArray.forEach((line, index) => {
            if (index === 0) {
              path.push(line.path[0]);
            }

            path.push(line.path[1]);

            // if(index === this.lineArray.length - 1) lines.path.push([ 'L', line.path[ 1 ][ 3 ], line.path[ 1 ][ 4 ] ]);
          });

          lines._setPath(path);
        } else {
          lines = new fabric.Group(this.lineArray, {
            objectID: Math.random() as any,
            name: 'line-style',
            // this.lineType,
          } as any);
        }
        if (superThis.lineType === 'dash') {
          lines.lineStyle = 'dash';
        }

        // setDefaultAttributes(lines);
        // startActiveObject(lines);
        windowCanvas.canvas.add(lines);
        this.isLoadDataLocal = false;
        // emitEvent();

        this.lineArray = [];
      }
      if (this.pointArray.length > 0) {
        this.pointArray = [];
      }
      windowCanvas.canvas.requestRenderAll();

      //"#lines").click();
    }
  }

  onDrawLineMouseMove(options) {
    if (this.drawLineTimeId) {
      clearTimeout(this.drawLineTimeId);
      this.drawLineTimeId = null;
    }

    if (!this.isDown) {
      return;
    }
    var pointer = windowCanvas.getPointer(options.e);
    if (this.lineType === 'curve') {
      const length = superThis.pointArray.length;
      if (this.isCurving && length > 1) {
        superThis.pointArray[length - 1].line1.path[1][1] = pointer.x;
        superThis.pointArray[length - 1].line1.path[1][2] = pointer.y;
        if (superThis.page.isLocalOnly) {
          superThis.updateLocal(
            superThis.pool_data,
            superThis.pointArray[length - 1].line1.objectID,
            superThis.pointArray[length - 1].line1.toObject(
              superThis.page.customAttributes
            ),
            superThis.socket,
            false,
            'drawLine_setPath'
          );
        }
      }


      // else {
      //   this.drawLine.path[1][3] = pointer.x;
      //   this.drawLine.path[1][4] = pointer.y;
      // }
    } else if (
      this.lineType === 'dot' ||
      this.lineType === 'multiple' ||
      (this.lineType === 'dash' && options.target)
    ) {
      // if (options.target.name === 'dot-line') {
      //     const obj = options.target;
      //     obj.line1.set({
      //         x2: obj.
      //         y2:
      //     })
      // }
    } else if (
      // lineType === 'multiple' || lineType === 'waving' || lineType === 'dash' &&
      this.drawLine
    ) {
      this.drawLine.set({
        x2: pointer.x,
        y2: pointer.y,
      });
      if (superThis.page.isLocalOnly) {
        superThis.updateLocal(
          superThis.pool_data,
          this.drawLine.objectID,
          this.drawLine.toObject(superThis.page.customAttributes),
          superThis.socket,
          false,
          'drawLine_set'
        );
      }
    }
    windowCanvas.requestRenderAll();
  }

  onDrawLineMouseDown(options) {
    var _this = this;

    // fake double click event for ipad,...
    if (_this.isDrawingLine) {
      // onDrawLineDblClick();
      _this.isDrawingLine = false;
    } else {
      _this.isDrawingLine = true;
      console.log('__this', _this);
      _this.drawingLineTimeId = setTimeout(() => {
        _this.isDrawingLine = false;
      }, 500);
    }

    if (_this.drawLineTimeId) {
      clearTimeout(_this.drawLineTimeId);
      _this.drawLineTimeId = null;
    }

    _this.isDown = true;
    const pointer = windowCanvas.getPointer(options.e);
    const points = [pointer.x, pointer.y, pointer.x, pointer.y];
    console.log('pointer', pointer);
    console.log('points', points);

    if (_this.lineType === 'multiple') {
      var point = new fabric.Circle({
        left: pointer.x,
        top: pointer.y,
        radius: 8,
        fill: 'green',
        originX: 'center',
        originY: 'center',
        hasControls: false,
        name: 'dot-line',
      });
      superThis.isLoadLocal = false;

      superThis.pointArray.push(point);

      const length = superThis.pointArray.length;
      if (length > 1) {
        const line = new fabric.Line(
          [
            superThis.pointArray[length - 2].left,
            superThis.pointArray[length - 2].top,
            superThis.pointArray[length - 1].left,
            superThis.pointArray[length - 1].top,
          ],
          {
            stroke: superThis.selectedColor,
            strokeWidth: Number(superThis.selectedWidth),
            name: 'multiple',
            hasControls: false,
            hasBorders: false,
            lockMovementX: false,
            lockMovementY: false,
            hoverCursor: 'default',
            selectable: false,
          }
        );

        superThis.pointArray[length - 2].line2 = line;
        superThis.pointArray[length - 1].line1 = line;

        superThis.lineArray.unshift(line);
        windowCanvas.add(line);
        windowCanvas.sendToBack(line);
      }
      // _this.drawLine = new fabric.Line(points, {
      //   stroke: 'black',
      //   name: 'multiple',
      //   hasControls: false,
      //   hasBorders: false,
      //   lockMovementX: false,
      //   lockMovementY: false,
      //   hoverCursor: 'default',
      //   selectable: false,
      // });

      // superThis.lineArray.push(_this.drawLine);
      // windowCanvas.add(_this.drawLine);
      // emitEvent();
    } else if (_this.lineType === 'dash') {
      var point = new fabric.Circle({
        left: pointer.x,
        top: pointer.y,
        radius: 8,
        fill: 'green',
        originX: 'center',
        originY: 'center',
        hasControls: false,
        name: 'dot-line',
      });
      superThis.isLoadLocal = false;

      superThis.pointArray.push(point);

      const length = superThis.pointArray.length;
      if (length > 1) {
        const line = new fabric.Line(
          [
            superThis.pointArray[length - 2].left,
            superThis.pointArray[length - 2].top,
            superThis.pointArray[length - 1].left,
            superThis.pointArray[length - 1].top,
          ],
          {
            stroke: superThis.selectedColor,
            strokeWidth: Number(superThis.selectedWidth),
            name: 'dash',
            hasControls: false,
            hasBorders: false,
            lockMovementX: false,
            lockMovementY: false,
            hoverCursor: 'default',
            strokeDashArray: [5, 5],
            selectable: false,
          }
        );

        superThis.pointArray[length - 2].line2 = line;
        superThis.pointArray[length - 1].line1 = line;

        superThis.lineArray.unshift(line);
        windowCanvas.add(line);
        windowCanvas.sendToBack(line);
      }
    } else if (_this.lineType === 'curve') {
      var point = new fabric.Circle({
        left: pointer.x,
        top: pointer.y,
        radius: 8,
        fill: 'green',
        originX: 'center',
        originY: 'center',
        hasControls: false,
        name: 'dot-line',
      });
      superThis.isLoadLocal = false;

      superThis.pointArray.push(point);

      const length = superThis.pointArray.length;
      if (length > 1) {
        _this.isCurving = true;
        const drawLine = new fabric.Path('M 0 0 Q 100 100 200 0', {
          stroke: superThis.selectedColor,
          strokeWidth: Number(superThis.selectedWidth),
          hasControls: false,
          hasBorders: false,
          fill: '',
        });

        // this.drawLine.path[0] = ['M', pointer.x, pointer.y];
        // this.drawLine.path[1] = ['Q', pointer.x, pointer.y, pointer.x, pointer.y];

        (drawLine.path as any)[0] = [
          'M',
          superThis.pointArray[length - 2].left,
          superThis.pointArray[length - 2].top,
        ];
        (drawLine.path as any)[1] = [
          'Q',
          superThis.pointArray[length - 2].left,
          superThis.pointArray[length - 2].top,
          superThis.pointArray[length - 1].left,
          superThis.pointArray[length - 1].top,
        ];

        superThis.pointArray[length - 2].line2 = drawLine;
        superThis.pointArray[length - 1].line1 = drawLine;

        superThis.lineArray.push(drawLine);
        windowCanvas.add(drawLine);
        // drawLine.left = drawLine.pathOffset.x;
        // drawLine.top = drawLine.pathOffset.y;
        (fabric.Polyline.prototype as any)._setPositionDimensions.call(drawLine, {});
        drawLine.setCoords();
      }
    } else if (_this.lineType === 'simple') {
      superThis.isLoadLocal = false;
      _this.drawLine = new (fabric as any).LineWithArrow(points, {
        stroke: superThis.selectedColor,
        strokeWidth: Number(superThis.selectedWidth),
      });

      windowCanvas.add(_this.drawLine);
    } else if (_this.lineType === 'waving') {
      ++_this.typesOfLinesIter;
      _this.typesOfLinesIter %= _this.typesOfLines.length;

      _this.drawLine = new (fabric as any).WavyLineWithArrow(points, {
        stroke: superThis.selectedColor,
        strokeWidth: Number(superThis.selectedWidth),
        funct: _this.typesOfLines[_this.typesOfLinesIter],
      });

      windowCanvas.add(_this.drawLine);
    } else if (
      _this.lineType === 'dot' &&
      (!options.target ||
        (options.target && options.target.name !== 'dot-line'))
    ) {
      superThis.isLoadLocal = false;
      var point = new fabric.Circle({
        left: pointer.x,
        top: pointer.y,
        radius: 8,
        fill: 'green',
        originX: 'center',
        originY: 'center',
        hasControls: false,
        name: 'dot-line',
      });

      windowCanvas.add(point);
      superThis.isLoadLocal = false;

      superThis.pointArray.push(point);

      const length = superThis.pointArray.length;
      if (length > 1) {
        const line = new fabric.Line(
          [
            superThis.pointArray[length - 2].left,
            superThis.pointArray[length - 2].top,
            superThis.pointArray[length - 1].left,
            superThis.pointArray[length - 1].top,
          ],
          {
            fill: 'black',
            stroke: superThis.selectedColor,
            strokeWidth: Number(superThis.selectedWidth),
            originX: 'center',
            originY: 'center',
            selectable: false,
          }
        );

        superThis.pointArray[length - 2].line2 = line;
        superThis.pointArray[length - 1].line1 = line;

        superThis.lineArray.unshift(line);
        windowCanvas.add(line);
        windowCanvas.sendToBack(line);
      }
      // }

      point.on('moving', function () {
        if ((point as any).line1) {
          (point as any).line1.set({
            x2: point.left,
            y2: point.top,
          });
        }
        if ((point as any).line2) {
          (point as any).line2.set({
            x1: point.left,
            y1: point.top,
          });
        }
      });
    }
    // else if (this.lineType === 'curve') {
    //   this.nextPointStart = pointer;
    //   this.isCurving = true;
    // }
    windowCanvas.requestRenderAll();
  }

  simpleDrawing(options) {
    this.lineType = 'simple';
    this.addDrawLineListener();
    // const pointer = windowCanvas.getPointer(options);
    // const points = [pointer.x, pointer.y, pointer.x, pointer.y];
    // this.drawLine = new fabric.LineWithArrow(points, {
    //   strokeWidth: 1,
    //   stroke: '#000',
    // });

    // windowCanvas.add(this.drawLine);
  }

  dotDrawing(options) {
    // const pointer = windowCanvas.getPointer(options);
    this.lineType = 'dot';
    this.addDrawLineListener();
    // var point = new fabric.Circle({
    //   left: pointer.x,
    //   top: pointer.y,
    //   radius: 8,
    //   fill: 'green',
    //   originX: 'center',
    //   originY: 'center',
    //   hasControls: false,
    //   name: 'dot-line',
    // });

    // this.lineArray.push(point);
    // windowCanvas.add(point);
    // this.pointArray.push(point);

    // const length = this.pointArray.length;
    // if (length > 1) {
    //   const line = new fabric.Line(
    //     [
    //       this.pointArray[length - 2].left,
    //       this.pointArray[length - 2].top,
    //       this.pointArray[length - 1].left,
    //       this.pointArray[length - 1].top,
    //     ],
    //     {
    //       strokeWidth: 2,
    //       fill: 'black',
    //       stroke: 'black',
    //       originX: 'center',
    //       originY: 'center',
    //       selectable: false,
    //     }
    //   );

    //   this.pointArray[length - 2].line2 = line;
    //   this.pointArray[length - 1].line1 = line;

    //   this.lineArray.unshift(line);
    //   windowCanvas.add(line);
    //   windowCanvas.sendToBack(line);
    // }

    // point.on('moving', function() {
    //   if (point.line1) {
    //     point.line1.set({
    //       x2: point.left,
    //       y2: point.top,
    //     });
    //   }
    //   if (point.line2) {
    //     point.line2.set({
    //       x1: point.left,
    //       y1: point.top,
    //     });
    //   }
    // });
  }


  dashLine(options) {
    // const pointer = windowCanvas.getPointer(options);
    // const points = [pointer.x, pointer.y, pointer.x, pointer.y];
    this.lineType = 'dash';
    this.addDrawLineListener();
    // this.drawLine = new fabric.Line(points, {
    //   stroke: 'black',
    //   hasControls: false,
    //   hasBorders: false,
    //   lockMovementX: false,
    //   lockMovementY: false,
    //   hoverCursor: 'default',
    //   strokeDashArray: [5, 5],
    //   selectable: false,
    // });

    // this.lineArray.push(this.drawLine);
    // windowCanvas.add(this.drawLine);
    // emitEvent();
  }

  curveDrawinng(options) {
    // console.log('windowCanvas.getPointer', windowCanvas.getPointer)
    // const pointer = windowCanvas.getPointer(options);
    // const lineArray = []
    // var nextPointStart = null;
    // var drawLine = new fabric.Path('M 0 0 Q 100 100 200 0', {
    //   stroke: 'black',
    //   hasControls: false,
    //   hasBorders: false,
    //   strokeWidth: 1,
    //   fill: '',
    // });
    // drawLine.path[0] = ['M', pointer.x, pointer.y];
    // drawLine.path[1] = ['Q', pointer.x, pointer.y, pointer.x, pointer.y];
    // if (nextPointStart) {
    //   drawLine.path[0] = ['M', nextPointStart.x, nextPointStart.y];
    //   drawLine.path[1] = [
    //     'Q',
    //     nextPointStart.x,
    //     nextPointStart.y,
    //     nextPointStart.x,
    //     nextPointStart.y,
    //   ];
    // }
    // lineArray.push(drawLine);
    // windowCanvas.add(drawLine);
    // windowCanvas.renderAll();
  }

  addDrawLineListener() {
    superThis = this;
    windowCanvas.on('mouse:up', this.onDrawLineMouseUp);
    windowCanvas.on('mouse:down', this.onDrawLineMouseDown);
    windowCanvas.on('mouse:dblclick', this.onDrawLineDblClick);
    windowCanvas.on('mouse:move', this.onDrawLineMouseMove);
  }

  removeDrawLineListener() {
    windowCanvas.off('mouse:up', this.onDrawLineMouseUp);
    windowCanvas.off('mouse:down', this.onDrawLineMouseDown);
    windowCanvas.off('mouse:dblclick', this.onDrawLineDblClick);
    windowCanvas.off('mouse:move', this.onDrawLineMouseMove);
  }

  setDefaultAttributes(obj) {
    obj.set({
      // isChoosePort: false,
      // port: [],

      groupID: null,

      colorBorder: '#000',
      widthBorder: 1,
      curve: 0,
      hasShadow: false,
      shadow: null,
      shadowObj: new fabric.Shadow({
        blur: 30,
        color: '#999',
        offsetX: 0,
        offsetY: 0,
      }),
      fixed: false,
      position: 'front',

      isMoving: false,
      isRepeat: false,
      isDrawingPath: false,
      speedMoving: 1,
      pathObj: null,
      soundMoving: '',
      nameSoundMoving: '',

      blink: false,
      lineStyle: 'solid',
      lockMovementX: false,
      lockMovementY: false,

      select: false,
      status: false,
      colorText: '#000',
      colorTextSelected: '#000',
      colorSelected: '#ccc',
      colorUnselected: '#fff',
      soundSelected: '',
      nameSoundSelected: '',
      soundUnselected: '',
      nameSoundUnselected: '',

      input: false,
      soundTyping: '',
      nameSoundTyping: '',

      snap: false,
      soundSnap: 'https://admin.metalearn.vn/app/song/snap.mp3',
      nameSoundSnap: '',
    });
  }

  drawQuadratic() {
    var line = new fabric.Path('M 65 0 Q 100, 100, 200, 0', {
      fill: '',
      stroke: 'black',
      objectCaching: false,
    });

    line.path[0][1] = 100;
    line.path[0][2] = 100;

    line.path[1][1] = 200;
    line.path[1][2] = 200;

    line.path[1][3] = 300;
    line.path[1][4] = 100;

    line.selectable = false;
    windowCanvas.add(line);

    var p1 = this.makeCurvePoint(200, 200, null, line, null);
    p1.name = 'p1';
    windowCanvas.add(p1);

    var p0 = this.makeCurveCircle(100, 100, line, p1, null);
    p0.name = 'p0';
    windowCanvas.add(p0);

    var p2 = this.makeCurveCircle(300, 100, null, p1, line);
    p2.name = 'p2';
    windowCanvas.add(p2);
  }

  makeCurveCircle(left, top, line1, line2, line3) {
    var c = new fabric.Circle({
      left,
      top,
      strokeWidth: 5,
      radius: 12,
      fill: '#fff',
      stroke: '#666',
    });

    c.hasBorders = c.hasControls = false;

    (c as any).line1 = line1;
    (c as any).line2 = line2;
    (c as any).line3 = line3;

    return c;
  }

  makeCurvePoint(left, top, line1, line2, line3) {
    var c = new fabric.Circle({
      left,
      top,
      strokeWidth: 8,
      radius: 14,
      fill: '#fff',
      stroke: '#666',
    });

    c.hasBorders = c.hasControls = false;

    (c as any).line1 = line1;
    (c as any).line2 = line2;
    (c as any).line3 = line3;

    return c;
  }
  onObjectSelected(e) {
    var activeObject = e.target;

    if (activeObject.name === 'p0' || activeObject.name === 'p2') {
      activeObject.line2.animate('opacity', '1', {
        duration: 200,
        onChange: windowCanvas.renderAll.bind(windowCanvas),
      });
      activeObject.line2.selectable = true;
    }
  }

  onSelectionCleared(e) {
    var activeObject = e.target;
    if (activeObject) {
      if (activeObject.name === 'p0' || activeObject.name === 'p2') {
        activeObject.line2.animate('opacity', '0', {
          duration: 200,
          onChange: windowCanvas.renderAll.bind(windowCanvas),
        });
        activeObject.line2.selectable = false;
      } else if (activeObject.name === 'p1') {
        activeObject.animate('opacity', '0', {
          duration: 200,
          onChange: windowCanvas.renderAll.bind(windowCanvas),
        });
        activeObject.selectable = false;
      }
    }
  }

  onBeforeSelectionCleared(e) {
    var activeObject = e.target;
    if (activeObject.name === 'p0' || activeObject.name === 'p2') {
      activeObject.line2.animate('opacity', '0', {
        duration: 200,
        onChange: windowCanvas.renderAll.bind(windowCanvas),
      });
      activeObject.line2.selectable = false;
    } else if (activeObject.name === 'p1') {
      activeObject.animate('opacity', '0', {
        duration: 200,
        onChange: windowCanvas.renderAll.bind(windowCanvas),
      });
      activeObject.selectable = false;
    }
  }

  onObjectMoving(e) {
    if (e.target.name === 'p0' || e.target.name === 'p2') {
      var p = e.target;

      if (p.line1) {
        p.line1.path[0][1] = p.left;
        p.line1.path[0][2] = p.top;
      } else if (p.line3) {
        p.line3.path[1][3] = p.left;
        p.line3.path[1][4] = p.top;
      }
    } else if (e.target.name === 'p1') {
      var p = e.target;

      if (p.line2) {
        p.line2.path[1][1] = p.left;
        p.line2.path[1][2] = p.top;
      }
    } else if (e.target.name === 'p0' || e.target.name === 'p2') {
      var p = e.target;

      p.line1 && p.line1.set({ x2: p.left, y2: p.top });
      p.line2 && p.line2.set({ x1: p.left, y1: p.top });
      p.line3 && p.line3.set({ x1: p.left, y1: p.top });
      p.line4 && p.line4.set({ x1: p.left, y1: p.top });
    }
  }

  imageMode(e) {
    console.log('imageMode', e);
    if (!superThis.isFetched && !superThis.page.isLocalOnly) {
      console.log('isCurrentlyHibernate');
      const subscription: Subscription = superThis.loadEvent.subscribe(
        async () => {
          subscription.unsubscribe();
          console.log('wake up');
          await superThis.wait1sec();
          superThis.isLoadLocal = false;
          fabric.Image.fromURL(e.target.result, function (img) {
            //i create an extra var for to change some image properties
            console.log('e32131');

            const maxWidth = 600;
            const maxHeight = 400;

            if (img.width > maxWidth) {
              img.scaleToWidth(maxWidth);
            }

            if (img.height > maxHeight) {
              img.scaleToHeight(maxHeight);
            }

            // console.log(e.target.result.name);

            console.log('img', img);
            img.set({
              top: 100,
              left: 100,
              name: 'image',
              nameImageContent: '' as any,
              objectID: Math.random() as any,
            } as any);
            console.log('im32323g', img);

            // setDefaultAttributes(img);
            // startActiveObject(img);

            windowCanvas.add(img);

            // isLoadDataLocal = false
            // emitEvent();

            // var grid = canvas._objects.find(obj => obj.name === 'grid')
            // if (grid) {
            //     img.moveTo(1)
            // }
            // else img.moveTo(0)

            windowCanvas.requestRenderAll();
          });
        }
      );
    } else {
      superThis.isLoadLocal = false;
      fabric.Image.fromURL(e.target.result, function (img) {
        //i create an extra var for to change some image properties
        console.log('e32131');

        const maxWidth = 600;
        const maxHeight = 400;

        if (img.width > maxWidth) {
          img.scaleToWidth(maxWidth);
        }

        if (img.height > maxHeight) {
          img.scaleToHeight(maxHeight);
        }

        // console.log(e.target.result.name);

        console.log('img', img);
        img.set({
          top: 100,
          left: 100,
          name: 'image',
          nameImageContent: '' as any,
          objectID: Math.random() as any,
        } as any);
        console.log('im32323g', img);

        // setDefaultAttributes(img);
        // startActiveObject(img);

        windowCanvas.add(img);

        // isLoadDataLocal = false
        // emitEvent();

        // var grid = canvas._objects.find(obj => obj.name === 'grid')
        // if (grid) {
        //     img.moveTo(1)
        // }
        // else img.moveTo(0)

        windowCanvas.requestRenderAll();
      });
    }
  }
  wait1sec() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('Ok');
      }, 1000);
    });
  }

  arcLine() {
    const startX = 100;
    const startY = 100;
    const endX = 300;
    const endY = 100;

    // Define the angle of the control point, in radians
    const angle = Math.PI / 4;

    // Calculate the position of the control point
    const distance = Math.sqrt((startX - endX) ** 2 + (startY - endY) ** 2);
    const controlX = startX + distance * Math.cos(angle);
    const controlY = startY + distance * Math.sin(angle);

    // Create the path data string for the curve
    const pathData = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;

    // Create a new path object and set its properties
    const path = new fabric.Path(pathData, {
      fill: 'transparent',
      stroke: 'black',
      strokeWidth: 2,
    });

    // Add the path object to the canvas and render it
    windowCanvas.add(path);
    windowCanvas.renderAll();
  }

  selectedImagesForLine = [];
  connectedImagePairs: Array<{ id1: string, id2: string, lines: fabric.Line[] }> = [];
  userConnectedImagePairs: Array<{ id1: string, id2: string, lines: fabric.Line[] }> = [];
  isEdit = true;
  isConnect = false;

  areImagesConnected(img1, img2) {
    return this.userConnectedImagePairs.some(pair =>
      (pair.id1 === img1.objectID && pair.id2 === img2.objectID) ||
      (pair.id1 === img2.objectID && pair.id2 === img1.objectID)
    );
  }
  drawManualLine() {
    const canvas = this.canvas;

    const img1 = this.selectedImagesForLine[0];
    const img2 = this.selectedImagesForLine[1];
    if (img1.objectID === img2.objectID) {
      this.selectedImagesForLine = [];
      return;
    }
    if (this.areImagesConnected(img1, img2)) {
      this.removeConnectedLine(img1, img2);
      return;
    }

    const img1Center = img1.getCenterPoint();
    const img2Center = img2.getCenterPoint();

    const img1Width = img1.width * img1.scaleX;
    const img1Height = img1.height * img1.scaleY;
    const img2Width = img2.width * img2.scaleX;
    const img2Height = img2.height * img2.scaleY;

    const offset = 20; // Khoảng cách từ biên hình ảnh

    const point1 = { x: img1Center.x + img1Width / 2 + offset, y: img1Center.y };
    const point2 = { x: point1.x, y: img2Center.y };

    const line1 = new fabric.Line([img1Center.x + img1Width / 2, img1Center.y, point1.x, point1.y], {
      stroke: 'black',
      strokeWidth: 2,
      selectable: false,
      hasControls: false,
      hasBorders: false,
    });

    const line2 = new fabric.Line([point1.x, point1.y, point2.x, point2.y], {
      stroke: 'black',
      strokeWidth: 2,
      selectable: false,
      hasControls: false,
      hasBorders: false,
    });

    const line3 = new fabric.Line([point2.x, point2.y, img2Center.x - img2Width / 2, img2Center.y], {
      stroke: 'black',
      strokeWidth: 2,
      selectable: false,
      hasControls: false,
      hasBorders: false,
    });

    canvas.add(line1);
    canvas.add(line2);
    canvas.add(line3);

    this.userConnectedImagePairs.push({
      id1: img1.objectID,
      id2: img2.objectID,
      lines: [line1, line2, line3] // Lưu các line vào để dễ cập nhật khi di chuyển
    });

    if (this.isEdit) {
      this.connectedImagePairs.push({ id1: img1.objectID, id2: img2.objectID, lines: [line1, line2, line3] });
    }

    this.selectedImagesForLine = [];
    canvas.renderAll();

    // Gắn sự kiện di chuyển cho hình ảnh
    img1.on('moving', () => this.updateLines(img1));
    img2.on('moving', () => this.updateLines(img2));
  }

  // Hàm updateLines
  updateLines(image) {
    const imageCenter = image.getCenterPoint();
    const imageWidth = image.width * image.scaleX;
    const imageHeight = image.height * image.scaleY;
    const offset = 20;  // Khoảng cách bù trừ từ biên ảnh

    // Tìm tất cả các đường line kết nối với hình ảnh này
    const connectedPairs = this.userConnectedImagePairs.filter(pair =>
      pair.id1 === image.objectID || pair.id2 === image.objectID
    );

    connectedPairs.forEach(pair => {
      const otherImageId = pair.id1 === image.objectID ? pair.id2 : pair.id1;
      const otherImage = this.canvas.getObjects().find(obj => obj.objectID === otherImageId);
      const otherImageCenter = otherImage.getCenterPoint();

      const otherImageWidth = otherImage.width * otherImage.scaleX;
      const otherImageHeight = otherImage.height * otherImage.scaleY;

      // Xác định điểm nối của hình ảnh hiện tại (img1)
      const img1Port = {
        x: imageCenter.x + imageWidth / 2 + offset,
        y: imageCenter.y
      };

      // Xác định điểm nối của hình ảnh kia (img2)
      const img2Port = {
        x: otherImageCenter.x - otherImageWidth / 2 - offset,
        y: otherImageCenter.y
      };

      // Tính điểm gấp khúc thứ 2 theo phương Y (vuông góc với đường nối)
      const bendPoint = {
        x: img1Port.x,
        y: img2Port.y
      };

      // Cập nhật vị trí cho các line
      const line1 = pair.lines[0];
      const line2 = pair.lines[1];
      const line3 = pair.lines[2];

      // Đường nối từ hình ảnh 1 đến điểm gấp khúc
      line1.set({ x1: imageCenter.x + imageWidth / 2, y1: imageCenter.y, x2: img1Port.x, y2: img1Port.y });
      // Đường gấp khúc
      line2.set({ x1: img1Port.x, y1: img1Port.y, x2: bendPoint.x, y2: bendPoint.y });
      // Đường nối từ điểm gấp khúc tới hình ảnh 2
      line3.set({ x1: bendPoint.x, y1: bendPoint.y, x2: otherImageCenter.x - otherImageWidth / 2, y2: otherImageCenter.y });

      // Yêu cầu canvas cập nhật lại
      this.canvas.renderAll();
    });
  }

  removeConnectedLine(img1, img2) {
    const canvas = this.canvas;

    // Tìm tất cả các đường thẳng kết nối giữa img1 và img2
    const connectedPairs = this.userConnectedImagePairs.filter(pair =>
      (pair.id1 === img1.objectID && pair.id2 === img2.objectID) ||
      (pair.id1 === img2.objectID && pair.id2 === img1.objectID)
    );

    connectedPairs.forEach(pair => {
      if (pair.lines) {
        // Xóa từng đoạn line trong các đường gấp khúc (từ lines array)
        pair.lines.forEach(line => {
          canvas.remove(line);
        });
      }

      // Loại bỏ cặp này ra khỏi mảng userConnectedImagePairs
      this.userConnectedImagePairs = this.userConnectedImagePairs.filter(p =>
        !(p.id1 === img1.objectID && p.id2 === img2.objectID) &&
        !(p.id1 === img2.objectID && p.id2 === img1.objectID)
      );
    });

    // Cập nhật lại canvas
    canvas.renderAll();

    // Xóa danh sách hình ảnh đã chọn
    this.selectedImagesForLine = [];
  }


  selectImageForLine(image) {
    this.selectedImagesForLine.push(image);
    if (this.selectedImagesForLine.length === 2) {
      this.drawManualLine();
    }
  }

  addImage(e) {
    var files = e.target.files;
    var imageType = /image.*/;

    if (files.length === 0) {
      this.isLoadLocal = true;
      return;
    }

    for (const file of files) {
      if (!file.type.match(imageType)) {
        this.isLoadLocal = true;
        return;
      }

      var reader = this.page.fileSupport.getFileReader();
      const canvas = this.canvas;

      reader.onload = (f) => {
        const dataURL = f.target.result as string;

        fabric.Image.fromURL(dataURL, (img) => {
          // Đặt các thuộc tính cho hình ảnh
          (img as any).objectID = randomID();
          img.set({
            left: 300,
            top: 300,
            objectCaching: false,
            hasControls: true,
            hasBorders: true,
          });

          img.scaleX = 1 / 8;
          img.scaleY = 1 / 8;

          img.on('mousedown', () => {
            // if (this.isConnect) {
            //   this.selectImageForLine(img);
            // } else {
            //   this.selectedImagesForLine = []
            // }
          });

          canvas.add(img);
        });
      };

      reader.readAsDataURL(file);
    }

    e.target.value = '';
  }



  addAudio(e) {
    const _this = this;
    var files = e.target.files;
    var audioType = /audio.*/;
    console.log('e.target', e.target);
    console.log('files', files);
    if (files.length === 0) {
      this.isLoadLocal = true;
      return;
    }
    for (const file of files) {
      if (!file.type.match(audioType)) {
        this.isLoadLocal = true;
        return;
      }
      var reader = this.page.fileSupport.getFileReader();
      const canvas = this.canvas;
      reader.onload = function (f) {
        const dataURL = f.target.result as string;
        console.log('dataURL', dataURL);
        const audio = new Audio(dataURL);
        audio.controls = true;

        fabric.Image.fromURL('assets/icon/Presentation.png', function (img) {
          img.set({
            left: 300,
            top: 300,
            scaleX: 0.1,
            scaleY: 0.1,
            objectCaching: false,
            hasControls: true,
            hasBorders: true,
            audioUrl: dataURL as any
          } as any);
          canvas.add(img);
          (img as any).audioElement = audio;
          let isPlaying = false;
          img.on('mousedown', function () {
            if (!isPlaying) {
              (img as any).audioElement.play();
              // _this.page.stopRecording();
              isPlaying = true;
            } else {
              (img as any).audioElement.pause();
              isPlaying = false;
            }
          });

        });
      };
      reader.readAsDataURL(file); // Read the file as a data URL
    }
    // }
    e.target.value = '';
  }
  generateRandomId(length = 8) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomId = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomId += characters[randomIndex];
    }

    return randomId;
  }
  originalAnswer

  addMic() {
    const canvas = this.canvas;
    const _this = this;
    fabric.Image.fromURL('assets/icon/Mic.png', function (img) {
      img.set({
        left: 300,
        top: 300,
        scaleX: 0.2,
        scaleY: 0.2,
        objectCaching: false,
        hasControls: true,
        hasBorders: true,
        MicId: _this.generateRandomId(10) as any,
        value: "" as any,
        opacity: 1,
      } as any);

      const invisibleText = new fabric.IText('', {
        left: img.left! + img.width! * img.scaleX + 10,
        top: img.top,
        width: 120,
        fontSize: 16,
        fill: 'transparent',
        editable: true,
        evented: false
      });

      const group = new fabric.Group([img, invisibleText], {
        left: img.left,
        top: img.top,
        hasControls: true,
        hasBorders: true,
      });
      canvas.add(group);
      const input = document.createElement('input');
      const container = document.querySelector('.canvas-container');
      input.type = 'text';
      input.placeholder = '';
      input.style.position = 'absolute'; // Use absolute positioning
      input.style.left = `${group.left + invisibleText.width! + 20}px`; // Position it next to the icon
      input.style.top = `${group.top - 15}px`;
      input.style.fontSize = '16px'; // Font size
      input.style.padding = '5px'; // Padding for better appearance
      input.style.border = '1px solid #00aaff'; // Border style
      input.style.borderRadius = '4px'; // Rounded corners
      input.style.outline = 'none';
      input.disabled = true;
      // input.style.backgroundColor = '#f0f0f0'; // Background color
      input.classList.add('mic-input', 'hidden-value', '' + (img as any).MicId);
      _this.originalAnswer = input.value;
      // Append the input element to the body or a specific container
      container.appendChild(input);

      input.addEventListener('input', function () {
        (img as any).value = input.value;
      });

      // Update input position on group movement
      group.on('modified', function () {
        input.style.left = `${group.left + invisibleText.width! + 20}px`;
        input.style.top = `${group.top - 15}px`;
      });
      // Event for the mic icon (inside the group)
      group.on('mousedown', async function () {
        _this.page.isRecording = !_this.page.isRecording;
        img.opacity = (img.opacity === 1) ? 0.5 : 1;
        //await _this.startListening(input);
        (img as any).value = input.value;
        await _this.page.startRecording(input, (img as any).MicId);

        //_this.page.startRecording2(input)
        //_this.page.startRecording(input, img.MicId);
        // console.log(_this.page);
      }.bind(this));
    });
  }

  startListening2(inputElement) {
    this.page.startRecording2();
    inputElement.value = this.page.results;
  }

  // startListening(inputElement) {
  //   if ('webkitSpeechRecognition' in window) {
  //     // Khởi tạo vSearch nếu chưa khởi tạo
  //     let results;
  //     if (!vSearch) {
  //       if (this.page.isRecording) {
  //         vSearch = new webkitSpeechRecognition();
  //         vSearch.continuous = false; // Dừng khi nhận diện xong
  //         vSearch.interimResults = false; // Chỉ lấy kết quả cuối cùng
  //         vSearch.lang = 'vi-VN';
  //         vSearch.start();
  //         vSearch.onresult = (e) => {
  //           console.log(e);
  //           results = e.results[0][0].transcript;
  //           inputElement.value = results;
  //           // Dừng ghi âm và ngừng vSearch
  //           // this.page.stopRecording();
  //           vSearch.stop();
  //           console.log('Recognition stopped.');
  //         }
  //       } else {
  //         vSearch.stop();
  //         inputElement.value = results;
  //         console.log('Recognition stopped.');
  //       }
  //     }
  //     // if (this.page.isRecording) {
  //     //
  //     // }
  //     // else {
  //     // vSearch.stop();
  //     // console.log('Current recognized text:', results);
  //     // inputElement.value = results;
  //     //}
  //   } else {
  //     alert('Your browser does not support voice recognition!');
  //   }
  // }


  // addHeadphonesIcon(audioUrl,inputElement) {
  //   const canvas = this.canvas;
  //   const _this = this;
  //   // // Create a headphones icon
  //   // const headphoneIcon = document.createElement('img');
  //   // headphoneIcon.src = 'assets/icon/headphone1.png'; // Path to headphones icon
  //   // headphoneIcon.style.position = 'absolute';
  //   // headphoneIcon.style.left = `${inputElement.offsetLeft}px`; // Position it relative to input
  //   // headphoneIcon.style.top = `${inputElement.offsetTop + inputElement.offsetHeight + 10}px`; // Right below input
  //   // headphoneIcon.style.width = '30px';
  //   // headphoneIcon.style.height = '30px';
  //   // headphoneIcon.style.cursor = 'pointer'; // Make it clickable

  //   // // Append to body (or any container where you want the icon to be)
  //   // document.body.appendChild(headphoneIcon);

  //   // // Add click event to play the audio
  //   // headphoneIcon.addEventListener('click', () => {
  //   //   this.page.playAudio(audioUrl); // Play the recorded audio when clicked
  //   // });

  //   fabric.Image.fromURL('assets/icon/headphone1.png', function (img) {
  //     img.set({
  //       left: inputElement.offsetLeft + 20,
  //       top: inputElement.offsetTop + inputElement.offsetHeight + 20,
  //       scaleX: 0.05,
  //       scaleY: 0.05,
  //       objectCaching: false,
  //       hasControls: false,
  //       hasBorders: false,
  //     });
  //     canvas.add(img);
  //     img.on('mousedown', function () {
  //       _this.page.playAudio(audioUrl);
  //     }.bind(this));
  //   });

  // }

  addHeadphonesIcon(audioUrl, inputElement, ID) {
    const canvas = this.canvas;
    const _this = this;

    // Check if the headphones icon already exists
    const existingIcon = canvas.getObjects().find(obj => obj.idHeadphone === ID);

    if (existingIcon) {
      // Update the existing icon's position and audio URL
      existingIcon.set({
        left: inputElement.offsetLeft + 20,
        top: inputElement.offsetTop + inputElement.offsetHeight + 20,
        audioUrl: audioUrl
      });

      // Update the URL if needed (note: fabric.js may require a different approach for changing the image source)
      canvas.update(existingIcon); // Update the source if necessary

      canvas.renderAll(); // Re-render the canvas to reflect changes
    } else {
      // Create a new headphones icon if it does not exist
      fabric.Image.fromURL('assets/icon/headphone1.png', function (img) {
        img.set({
          left: inputElement.offsetLeft + 20,
          top: inputElement.offsetTop + inputElement.offsetHeight + 20,
          scaleX: 0.05,
          scaleY: 0.05,
          objectCaching: false,
          hasControls: false,
          hasBorders: false,
        } as any);
        (img as any).idHeadphone = ID;
        (img as any).audioUrl = audioUrl;
        canvas.add(img);
        img.on('mousedown', function () {
          _this.page.playAudio((img as any).audioUrl);
        }.bind(this));
      });
    }
  }

  selectFileType(i) {
    let selectedFileType = null;
    selectedFileType = i.target.value;
    return selectedFileType;
  }
  numberCollision(i) {
    let selectObjGameAnimation = null;
    selectObjGameAnimation = i.target.value;
    return selectObjGameAnimation;
  }
  changeObjectGameCollision(e) {
    console.log('changeObjectGameImage');
    var files = e.target.files;
    var imageType = /image.*/;
    console.log('e.target', e.target);
    console.log('files', files);

    if (files.length === 0) {
      this.isLoadLocal = true;
      return;
    }

    for (const file of files) {
      if (!file.type.match(imageType)) {
        this.isLoadLocal = true;
        return;
      }
      var reader = this.page.fileSupport.getFileReader();
      reader.onload = (f) => {
        const dataURL = f.target.result as string;
        const image = new Image();
        image.src = dataURL;
        image.onload = () => {
          animationProperties[0].imageUrl = dataURL;
          animationProperties[0].width = image.width;
          animationProperties[0].height = image.height;
          console.log('Animation: ', image.width, image.height);
          console.log(
            'animationProperties',
            animationProperties[0].height,
            animationProperties[0].width
          );
          // You can perform further processing or update here
        };
      };
      console.log('animationProperties outside', animationProperties);
      reader.readAsDataURL(file); // Read the file as a data URL
    }
    console.log(
      'animationProperties 2',
      animationProperties[0].height,
      animationProperties[0].width
    );
  }
  changeObjectGameImage(e) {
    console.log('changeObjectGameImage');
    var index = selectObjGame;
    var files = e.target.files;
    var imageType = /image.*/;
    console.log('e.target', e.target);
    console.log('files', files);
    // console.log('imageType', imageType)
    if (files.length === 0) {
      this.isLoadLocal = true;
      return;
    }
    for (const file of files) {
      if (!file.type.match(imageType)) {
        this.isLoadLocal = true;
        return;
      }
      var reader = this.page.fileSupport.getFileReader();
      reader.onload = function (f) {
        const dataURL = f.target.result as string;
        // console.log('dataURL', dataURL);
        brickProperties[index].imageUrl = dataURL;
      };
      console.log('brickProperties', brickProperties);

      reader.readAsDataURL(file); // Read the file as a data URL
    }
    // }

    e.target.value = '';
  }
  changeObjectGameAudio(e) {
    console.log('changeObjectGameAudio');
    var files = e.target.files;
    var index = selectObjGame;
    var audioType = /audio.*/;
    console.log('e.target', e.target);
    console.log('files', files);

    if (files.length === 0) {
      this.isLoadLocal = true;
      return;
    }

    for (const file of files) {
      if (!file.type.match(audioType)) {
        this.isLoadLocal = true;
        return;
      }
      var reader = this.page.fileSupport.getFileReader();
      reader.onload = function (f) {
        const audioURL = f.target.result as string;
        // console.log('audioURL', audioURL);
        brickProperties[index].voice = audioURL;
      };

      reader.readAsDataURL(file); // Read the file as a data URL
    }

    e.target.value = '';
  }

  loadJson(e) {
    console.log('loadJson');
    var files = e.target.files;
    var jsonType = /json.*/;
    if (files.length === 0) {
      this.isLoadLocal = true;
      return;
    }
    for (const file of files) {
      if (!file.type.match(jsonType)) {
        this.isLoadLocal = true;
        return;
      }
      var reader = this.page.fileSupport.getFileReader();
      reader.onload = function (f) {
        var backgroundObj = this.canvas
          .getObjects()
          .find((obj) => obj.isBackground);
        var data = JSON.parse(f.target.result as string);
        console.log('data', data.gameType);
        correctAnswers = data.correctAnswers;
        var oldDeviceScreenSize = data.screenSize;
        console.log('oldDeviceScreenSize', oldDeviceScreenSize);
        const canvasObj = JSON.parse(data.canvas);
        quizType = data.gameType;
        var screenOrientationJson = data.screenOrientation;
        //rotate screen base on screenOrientation
        // if (screenOrientationJson === 'vertical') {
        //   this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
        // } else {
        //   this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
        // }
        if (data.gameType === 'quiz-1') {
          this.loadCanvasQuiz1(canvasObj, oldDeviceScreenSize);
        } else if (data.gameType === 'quiz-3') {
          this.loadCanvasQuiz3(canvasObj, oldDeviceScreenSize);
        } else {
          this.connectedImagePairs = data.connectedImagePairs || [];
          this.isConnect = false;
          this.loadCanvasDefault(canvasObj, oldDeviceScreenSize);
        }
      }.bind(this);
      reader.readAsText(file);
    }
  }

  loadJsonFromText(text: string) {
    const data = JSON.parse(text);
    correctAnswers = data.correctAnswers;
    var oldDeviceScreenSize = data.screenSize;
    const canvasObj = JSON.parse(data.canvas);
    quizType = data.gameType;

    if (data.gameType === 'quiz-1') {
      console.log("START load quiz-1");
      this.loadCanvasQuiz1(canvasObj, oldDeviceScreenSize);
    } else if (data.gameType === 'quiz-3') {
      console.log("START load quiz-3");
      this.loadCanvasQuiz3(canvasObj, oldDeviceScreenSize);
    } else {
      console.log("START load quiz-default");
      this.loadCanvasDefault(canvasObj, oldDeviceScreenSize);
    }
  }

  loadBackGround(e) {
    var files = e.target.files;
    var imageType = /image.*/;
    if (files.length === 0) {
      this.isLoadLocal = true;
      return;
    }
    const file = files[0];

    if (file) {
      var reader = this.page.fileSupport.getFileReader();
      const canvas = this.canvas; // Capture the reference of 'this.canvas'

      reader.onload = function (f) {
        const dataURL = f.target.result as string;
        var screenSize = getCurrentDeviceSize();
        //background
        fabric.Image.fromURL(dataURL, function (img) {
          img.set({
            name: 'background',
            left: screenSize.width / 2,
            top: screenSize.height / 2,
            isBackground: true,
            objectType: '',
            objectCaching: false,
            hasControls: true, // Enable resizing handles
            hasBorders: true, // Enable borders
          });
          var scaleX = screenSize.width / img.width;
          var scaleY = screenSize.height / img.height;
          canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
            scaleX,
            scaleY,
          });
          console.log("LOAD background");
          canvas.renderAll();
        });
        //image object of background
        // fabric.Image.fromURL(dataURL, function (img) {
        //   img.set({
        //     name: 'background',
        //     left: screenSize.width / 2,
        //     top: screenSize.height / 2,
        //     isBackground: true,
        //     objectType: '',
        //     objectCaching: false,
        //     hasControls: true, // Enable resizing handles
        //     hasBorders: true, // Enable borders
        //   });
        //   var scaleX = screenSize.width / img.width;
        //   var scaleY = screenSize.height / img.height;
        //   img.set({
        //     scaleX: scaleX,
        //     scaleY: scaleY,
        //     visible: false,
        //   });
        //   canvas.add(img);
        //   canvas.renderAll();
        // });
      };

      reader.readAsDataURL(file); // Read the file as a data URL
    }
  }

  loadBackGroundFile(file) {
    if (file) {
      var reader = this.page.fileSupport.getFileReader();
      const canvas = this.canvas; // Capture the reference of 'this.canvas'

      reader.onload = function (f) {
        const dataURL = f.target.result as string;
        console.log('dataURL', dataURL);
        var screenSize = getCurrentDeviceSize();
        //background
        fabric.Image.fromURL(dataURL, function (img) {
          img.set({
            name: 'background',
            left: screenSize.width / 2,
            top: screenSize.height / 2,
            isBackground: true,
            objectType: '',
            objectCaching: false,
            hasControls: true, // Enable resizing handles
            hasBorders: true, // Enable borders
          });
          var scaleX = screenSize.width / img.width;
          var scaleY = screenSize.height / img.height;
          canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
            scaleX,
            scaleY,
          });
          console.log("LOAD background");
          canvas.renderAll();
        });
        //image object of background
        fabric.Image.fromURL(dataURL, function (img) {
          img.set({
            name: 'background',
            left: screenSize.width / 2,
            top: screenSize.height / 2,
            isBackground: true,
            objectType: '',
            objectCaching: false,
            hasControls: true, // Enable resizing handles
            hasBorders: true, // Enable borders
          });
          var scaleX = screenSize.width / img.width;
          var scaleY = screenSize.height / img.height;
          img.set({
            scaleX,
            scaleY,
            visible: false,
          });
          canvas.add(img);
          canvas.renderAll();
        });
      };

      reader.readAsDataURL(file); // Read the file as a data URL
    }
  }

  replaceImage(e) {
    //activeObj
    var activeObject = this.canvas.getActiveObject();
    var files = e.target.files;
    var imageType = /image.*/;
    if (files.length === 0) {
      this.isLoadLocal = true;
      return;
    }
    const file = files[0];
    if (file) {
      //replace image for active Object
      var reader = this.page.fileSupport.getFileReader();
      const canvas = this.canvas; // Capture the reference of 'this.canvas'

      reader.onload = function (f) {
        const dataURL = f.target.result as string;
        console.log('dataURL', dataURL);
        activeObject.setSrc(dataURL, function (img) {
          activeObject.set({
            width: img.width,
            height: img.height,
          });
          canvas.renderAll();
        });
      };
      reader.readAsDataURL(file); // Read the file as a data URL
    }
  }

  loadImage(e) {
    var files = e.target.files;
    var imageType = /image.*/;
    if (files.length === 0) {
      this.isLoadLocal = true;
      return;
    }
    const file = files[0];
    if (file) {
      var reader = this.page.fileSupport.getFileReader();
      const canvas = this.canvas; // Capture the reference of 'this.canvas'

      reader.onload = function (f) {
        const dataURL = f.target.result as string;
        console.log('dataURL', dataURL);
        var screenSize = getCurrentDeviceSize();
        fabric.Image.fromURL(dataURL, function (img) {
          // Center the image on the canvas
          img.set({
            name: 'quiz-matchObj',
            objectID: randomID(),
            //result: false,
            //objectType: "",
            left: screenSize.width / 2,
            top: screenSize.height / 2,
            objectCaching: false,
            hasControls: true, // Enable resizing handles
            hasBorders: true, // Enable borders
          });
          //thu nho hinh lai theo kich thuoc thiet bi
          var scaleX = screenSize.width / img.width;
          var scaleY = screenSize.height / img.height;
          img.scaleX = 1 / 4;
          img.scaleY = 1 / 4;
          startActiveObjectQuiz(img, this.page.audioRecorder, this.page.translate);
          canvas.add(img);
        });
      };

      reader.readAsDataURL(file); // Read the file as a data URL
    }
  }

  loadQuiz(data) {
    correctAnswers = data.correctAnswers;
    const canvasObj = JSON.parse(data.canvas);
    console.log('canvasObj', canvasObj);
    // Assuming 'canvas' and 'canvasObj' are defined elsewhere
    this.canvas.loadFromJSON(canvasObj, function () {
      this.canvas.getObjects().forEach(function (obj) {
        if (obj.name === 'quiz') {
          obj.set({
            fill: 'transparent',
            stroke: 'transparent',
            strokeWidth: 0,
            selectable: false,
          });
        }
      });

      this.canvas.renderAll(); // Render the canvas again after modifying objects
    });
  }

  resetQuiz() {

    correctAnswers = [];
    selectedAnswers = [];
    pool_data = [];
    quizType = 'quiz-1';
    isDoQuiz = false;

    isAddConnection = false;
    currentLine = null;
    isSelectAnswer = false;
    isSelectPort = false;
    //dont let canvas move out of screen
    isMove = false;
    isGroup = false;
    drawing = false;
    lastSelectedObject = null;
    objCover = null;
    isChoosePort = false;
    userID = '';
    isChoosePortUnConnect = false;
    isRemoveConnection = false;

    selectedAnswersString = null;
    correctAnswersString = null;

    //reset canvas
    console.log('resetQuiz');
    windowCanvas.clear();
    //set default background src\assets\background\default_background.png
    const defaultBackground = 'assets/background/default_background.png';
    const screenSize = getCurrentDeviceSize();
    fabric.Image.fromURL(defaultBackground, function (img) {
      img.set({
        name: 'background',
        left: screenSize.width / 2,
        top: screenSize.height / 2,
        isBackground: true,
        objectType: '',
        objectCaching: false,
        hasControls: true,
        hasBorders: true,
      });
      const scaleX = screenSize.width / img.width;
      const scaleY = screenSize.height / img.height;
      img.set({
        scaleX: scaleX,
        scaleY: scaleY,
      });
      windowCanvas.setBackgroundImage(
        img,
        windowCanvas.renderAll.bind(windowCanvas),
        {
          scaleX: scaleX,
          scaleY: scaleY,
        }
      );
      console.log("LOAD background");
      windowCanvas.renderAll();
    });
  }

  //add text
  textMode() {
    this.isLoadLocal = false;
    var textbox = new fabric.Textbox('Text', {
      left: 50,
      top: 50,
      width: 100,
      fontSize: 14,
      name: 'text',
      textAlign: 'center',
      fontFamily: 'Times New Roman',
      stroke: this.selectedColor,
      objectID: this.randomID(),
    });
    setTimeout(() => {
      eval('MathJax.typeset()');
    }, 1000);

    // setDefaultAttributes(textbox)
    // startActiveObject(textbox)
    this.getTextForObject(textbox, true);

    //'#moveObject')[0].click();
  }

  //add blinkText
  private blinkIntervalId: any;
  blinkText() {
    console.log('Đã nhấp chuột');
    const activeObject = this.canvas.getActiveObject();

    if (activeObject) {
      if (!this.blinkIntervalId) {
        this.startBlinkAnimation(activeObject);
        this.blinkIntervalId = setInterval(() => {
          this.startBlinkAnimation(activeObject);
        }, 2000); // Thay đổi khoảng thời gian nhấp nháy ở đây
      } else {
        clearInterval(this.blinkIntervalId);
        this.blinkIntervalId = null;
        activeObject.set('opacity', 1);
        this.canvas.renderAll();
      }
    }
  }
  defaultSetting() {
    var activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      if (
        activeObject.name &&
        (activeObject.name === 'object-box' ||
          activeObject.name.startsWith('quiz-MutipleObject'))
      ) {
        activeObject.item(0).set({
          fill: 'lightblue', // Change the fill color to 'lightblue'
          stroke: 'white',
          strokeWidth: 2,
          rx: 10,
          ry: 10,
          shadow: {
            color: 'rgba(0, 0, 0, 0.5)',
            blur: 10,
            offsetX: 5,
            offsetY: 5,
          },
          cornerColor: 'blue',
          cornerSize: 10,
        });
      }
      activeObject.set({
        shadow: {
          color: 'rgba(0, 0, 0, 0.8)',
          blur: 10,
          offsetX: 5,
        },
      });
    }
    this.canvas.renderAll();
  }
  startBlinkAnimation(activeObject: fabric.Object) {
    activeObject.animate('opacity', 0, {
      duration: 1000, // Thay đổi thời gian fade-out ở đây
      onChange: () => {
        fabric.util.requestAnimFrame(() => {
          this.canvas.renderAll();
        });
      },
      onComplete: () => {
        activeObject.animate('opacity', 1, {
          duration: 1000, // Thay đổi thời gian fade-in ở đây
          onChange: () => {
            fabric.util.requestAnimFrame(() => {
              this.canvas.renderAll();
            });
          },
        });
      },
    });
  }



  //Add Shadow
  toggleShadow() {
    console.log('đã click');
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      // Kiểm tra xem object có shadow hay không
      console.log('Current Shadow:', activeObject.shadow);

      if (activeObject.shadow) {
        // Nếu có shadow, xóa nó đi
        activeObject.set('shadow', null);
      } else {
        // Nếu không có shadow, thêm shadow vào
        activeObject.set('shadow', {
          color: 'rgba(0, 0, 0, 0.8)',
          blur: 10,
          offsetX: 5,
        });
      }

      console.log('New Shadow:', activeObject.shadow);
      this.canvas.renderAll();
    }
  }

  toggleBringTo() {
    var activeObject = this.canvas.getActiveObject();
    if (activeObject.pos === 'back') {
      activeObject.set({
        pos: 'front',
      });
      this.canvas.bringToFront(activeObject);
    } else {
      activeObject.set({
        pos: 'back',
      });
      this.canvas.sendToBack(activeObject);
    }
    this.canvas.renderAll();
  }

  //Create Text Input
  textMode2(userInput) {
    var randomID = this.randomID();
    var textbox = new fabric.IText(userInput, {
      left: 200,
      top: 200,
      width: 100,
      fontSize: 30,
      name: 'text',
      textAlign: 'center',
      fontFamily: 'Times New Roman',
      stroke: this.selectedColor,
    });

    //shadow for false answer
    var shadow = new fabric.Shadow({
      color: 'red',
      blur: 10,
      offsetX: 10,
      offsetY: 10,
    });

    var rect = new fabric.Rect({
      left: 200,
      top: 200,
      width: textbox.width + 60,
      height: textbox.height + 60,
      fill: 'lightblue', // Change the fill color to 'lightblue'
      stroke: 'white',
      strokeWidth: 2,
      rx: 10,
      ry: 10,
      shadow: shadow,
      cornerColor: 'blue',
      cornerSize: 10,
    });

    var group = new fabric.Group([rect, textbox], {
      left: 200,
      top: 200,
      width: textbox.width + 50,
      height: textbox.height + 50,
      name: `quiz-MutipleObject-false`,
      objectID: this.randomID(),
      rectObject: rect,
    });

    var groupShadow = new fabric.Shadow({
      color: 'rgba(0, 0, 0, 0.5)',
      blur: 10,
      offsetX: 5,
      offsetY: 5,
    });
    group.set({
      shadow: groupShadow,
    });

    startActiveObjectQuiz(group, this.page.audioRecorder, this.page.translate);
    this.canvas.add(group);

    this.canvas.renderAll();
  }

  textModeSelectQuiz(enteredText: string) {
    console.log('userInput', enteredText);
    var questionValue = enteredText;
    // if (this.questions.length > 0) this.questions = [];
    if (correctAnswers.length > 0) correctAnswers = [];
    const table = createTable(createTableObject(questionValue, this.page.audioRecorder, this.page.translate));
    this.canvas.add(table);
    this.canvas.renderAll();
  }

  textModeInputQuiz(enteredText: string) {
    console.log('userInput', enteredText);
    var questionValue = enteredText;
    // if (this.questions.length > 0) this.questions = [];
    // if (correctAnswers.length > 0) correctAnswers = [];
    // const table = createTableInput(createTableInputObject(questionValue));
    // table.on("moving", function () {
    //   var cells = table._objects;
    //   //exit editing mode for all cells
    //   cells.forEach(function (cell) {
    //     var cellTextBox = cell._objects[1];
    //     cellTextBox.exitEditing();
    //   });
    // });
    createTableInput(createTableInputObject(questionValue, this.page.audioRecorder, this.page.translate));
    this.canvas.renderAll();
  }

  textAreaMNInputQuiz(numberRow: string, numberColumn: string) {
    console.log('numberRow', numberRow);
    console.log('numberColumn', numberColumn);
    //add m rows and n columns of createInputObjectMN(left, top)
    //convert string to number
    var m = Number(numberRow);
    var n = Number(numberColumn);
    console.log('m', m);
    console.log('n', n);
    for (var i = 0; i < m; i++) {
      for (var j = 0; j < n; j++) {
        const input = this.createInputObjectMN(200 + j * 40, 200 + i * 40);
        this.canvas.add(input);
      }
    }
    this.canvas.renderAll();
  }

  changeAnswerValue(changeValue: string) {
    console.log('changeValue', changeValue);
    var activeObject = this.canvas.getActiveObject();
    if (
      (activeObject && activeObject.name && activeObject.name === 'quiz-MutipleObject-false') ||
      activeObject.name === `quiz-MutipleObject-true` ||
      activeObject.name === `quiz-MutipleObject` ||
      activeObject.name === `object-box`
    ) {
      if (
        activeObject.name === 'quiz-MutipleObject-false' ||
        activeObject.name === `quiz-MutipleObject`
      ) {
        if (changeValue === 'True') {
          activeObject.name = `quiz-MutipleObject-true`;
          correctAnswers.push(activeObject.objectID);
          console.log('activeObject.name', activeObject.name);
        } else if (
          activeObject.name === `quiz-MutipleObject` &&
          changeValue === 'False'
        ) {
          activeObject.name = `quiz-MutipleObject-false`;
          console.log('activeObject.name', activeObject.name);
        }
      } else if (activeObject.name === 'quiz-MutipleObject-true') {
        if (changeValue === 'False' || changeValue === '') {
          correctAnswers = correctAnswers.filter(
            (item) => item !== activeObject.objectID
          );
          activeObject.name = `quiz-MutipleObject-false`;
          console.log('activeObject.name', activeObject.name);
        }
      } else {
        if (changeValue === 'True') {
          activeObject.name = `quiz-MutipleObject-true`;
          correctAnswers.push(activeObject.objectID);
        } else if (changeValue === 'False') {
          activeObject.name = `quiz-MutipleObject-false`;
          correctAnswers = correctAnswers.filter(
            (item) => item !== activeObject.objectID
          );
        } else if (changeValue === '') {
          activeObject.name = `quiz-MutipleObject`;
          correctAnswers = correctAnswers.filter(
            (item) => item !== activeObject.objectID
          );
        }
        startActiveObjectQuiz(activeObject, this.page.audioRecorder, this.page.translate);
        console.log('activeObject.name', correctAnswers);
      }
      //make shadow for true false
      if (activeObject.name === 'quiz-MutipleObject-true') {
        var shadow = new fabric.Shadow({
          color: 'blue',
          blur: 10,
          offsetX: 10,
          offsetY: 10,
        });
        activeObject._objects[0].set({
          shadow: shadow,
        });
      } else if (activeObject.name === 'quiz-MutipleObject-false') {
        var shadow = new fabric.Shadow({
          color: 'red',
          blur: 10,
          offsetX: 10,
          offsetY: 10,
        });
        activeObject._objects[0].set({
          shadow: shadow,
        });
      }
    } else if (activeObject._objects && activeObject._objects.length > 1) {
      activeObject._objects.forEach((object) => {
        if (
          (object && object.name === 'quiz-MutipleObject-false') ||
          object.name === `quiz-MutipleObject-true` ||
          object.name === `quiz-MutipleObject` ||
          object.name === `object-box`
        ) {
          if (
            object.name === 'quiz-MutipleObject-false' ||
            object.name === `quiz-MutipleObject`
          ) {
            if (changeValue === 'True') {
              object.name = `quiz-MutipleObject-true`;
              correctAnswers.push(object.objectID);
              console.log('activeObject.name', object.name);
            } else if (
              object.name === `quiz-MutipleObject` &&
              changeValue === 'False'
            ) {
              object.name = `quiz-MutipleObject-false`;
              console.log('activeObject.name', object.name);
            }
          } else if (object.name === 'quiz-MutipleObject-true') {
            if (changeValue === 'False' || changeValue === '') {
              correctAnswers = correctAnswers.filter(
                (item) => item !== object.objectID);
              object.name = `quiz-MutipleObject-false`;
              console.log('activeObject.name', object.name);
            }
          } else {
            if (changeValue === 'True') {
              object.name = `quiz-MutipleObject-true`;
              correctAnswers.push(object.objectID);
            } else if (changeValue === 'False') {
              object.name = `quiz-MutipleObject-false`;
              correctAnswers = correctAnswers.filter(
                (item) => item !== object.objectID
              );
            } else if (changeValue === '') {
              object.name = `quiz-MutipleObject`;
              correctAnswers = correctAnswers.filter(
                (item) => item !== object.objectID
              );
            }
            startActiveObjectQuiz(object, this.page.audioRecorder, this.page.translate);
            console.log('activeObject.name', correctAnswers);
          }
        }
        //make shadow for true false
        if (object.name === 'quiz-MutipleObject-true') {
          var shadow = new fabric.Shadow({
            color: 'blue',
            blur: 10,
            offsetX: 10,
            offsetY: 10,
          });
          object._objects[0].set({
            shadow: shadow,
          });
        } else if (object.name === 'quiz-MutipleObject-false') {
          var shadow = new fabric.Shadow({
            color: 'red',
            blur: 10,
            offsetX: 10,
            offsetY: 10,
          });
          object._objects[0].set({
            shadow: shadow,
          });
        }
      });
    }
    windowCanvas.renderAll();
  }

  changeImageValue(changeValue: string) {
    console.log('changeValue', changeValue);
    var activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      if (activeObject._objects && activeObject._objects.length > 1) {
        var allSelectObjects = activeObject._objects;
        windowCanvas.discardActiveObject();
        console.log('activeObject._objects 1', activeObject._objects);
        allSelectObjects.forEach((object) => {
          if (object.name === 'object-box' || object.type === 'image') {
            if (changeValue === 'Vessel') {
              object.name = 'quiz-matchObj-vessel';
              this.canvas.sendToBack(object);
              this.addPortToObject(object);
              updatePortPositions(object);
              startActiveObjectQuiz(object, this.page.audioRecorder, this.page.translate);
            } else if (changeValue === 'Answer') {
              object.name = 'quiz-matchObj-answer';
              this.canvas.sendToBack(object);
              this.addPortToObject(object);
              updatePortPositions(object);
              startActiveObjectQuiz(object, this.page.audioRecorder, this.page.translate);
            } else {
              object.name = 'quiz-matchObj';
              console.log('activeObject.name', object.name);
            }
          } else if (
            object.name === 'quiz-matchObj-vessel' ||
            object.name === 'quiz-matchObj-answer'
          ) {
            if (changeValue === 'Vessel') {
              object.name = 'quiz-matchObj-vessel';
              this.canvas.sendToBack(object);
              startActiveObjectQuiz(object, this.page.audioRecorder, this.page.translate);
            } else if (changeValue === 'Answer') {
              object.name = 'quiz-matchObj-answer';
              this.canvas.bringToFront(object);
              startActiveObjectQuiz(object, this.page.audioRecorder, this.page.translate);
            } else {
              object.name = 'quiz-matchObj';
              console.log('activeObject.name', object.name);
            }
          }
        });
      }
      if (activeObject) {
        if (
          activeObject.name === 'quiz-matchObj-vessel' ||
          activeObject.name === 'quiz-matchObj-answer'
        ) {
          console.log('activeObject._objects 2', activeObject);
          if (changeValue === 'Vessel') {
            activeObject.name = 'quiz-matchObj-vessel';
            this.canvas.sendToBack(activeObject);
            startActiveObjectQuiz(activeObject, this.page.audioRecorder, this.page.translate);
          } else if (changeValue === 'Answer') {
            activeObject.name = 'quiz-matchObj-answer';
            this.canvas.bringToFront(activeObject);
            startActiveObjectQuiz(activeObject, this.page.audioRecorder, this.page.translate);
          }
        } else if (
          activeObject.name === 'object-box' ||
          activeObject.type === 'image'
        ) {
          console.log('activeObject._objects 2', activeObject);
          if (changeValue === 'Vessel') {
            activeObject.name = 'quiz-matchObj-vessel';
            console.log('activeObject.name', activeObject.name);
            this.canvas.sendToBack(activeObject);
            this.addPortToObject(activeObject);
            updatePortPositions(activeObject);
            startActiveObjectQuiz(activeObject, this.page.audioRecorder, this.page.translate);
          } else if (changeValue === 'Answer') {
            activeObject.name = 'quiz-matchObj-answer';
            this.canvas.bringToFront(activeObject);
            console.log('activeObject.name', activeObject.name);
            this.addPortToObject(activeObject);
            updatePortPositions(activeObject);
            startActiveObjectQuiz(activeObject, this.page.audioRecorder, this.page.translate);
          } else {
            activeObject.name = 'quiz-matchObj';
            console.log('activeObject.name', activeObject.name);
          }
        }
      }
    }
  }

  addPortToObject(shape) {
    // shape.set({
    //   hasBorders: false,
    //   hasControls: false,
    // });

    function findMidpoint(p1, p2) {
      return {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2,
      };
    }

    var shapeBounds = shape.getBoundingRect();
    var topMidpoint = findMidpoint(
      { x: shapeBounds.left, y: shapeBounds.top },
      { x: shapeBounds.left + shapeBounds.width, y: shapeBounds.top }
    );
    var bottomMidpoint = findMidpoint(
      { x: shapeBounds.left, y: shapeBounds.top + shapeBounds.height },
      {
        x: shapeBounds.left + shapeBounds.width,
        y: shapeBounds.top + shapeBounds.height,
      }
    );
    var leftMidpoint = findMidpoint(
      { x: shapeBounds.left, y: shapeBounds.top },
      { x: shapeBounds.left, y: shapeBounds.top + shapeBounds.height }
    );
    var rightMidpoint = findMidpoint(
      { x: shapeBounds.left + shapeBounds.width, y: shapeBounds.top },
      {
        x: shapeBounds.left + shapeBounds.width,
        y: shapeBounds.top + shapeBounds.height,
      }
    );

    var ports = [
      this.addPortToEdge(topMidpoint.x, topMidpoint.y, shape.objectID, 0),
      this.addPortToEdge(bottomMidpoint.x, bottomMidpoint.y, shape.objectID, 1),
      this.addPortToEdge(leftMidpoint.x, leftMidpoint.y, shape.objectID, 2),
      this.addPortToEdge(rightMidpoint.x, rightMidpoint.y, shape.objectID, 3),
    ];

    shape.ports = ports;

    updatePortPositions(shape);

    shape.on('moving', function (e) {
      updatePortPositions(shape);
    });
  }

  addPortToObject1(shape, allPorts) {
    // shape.set({
    //   hasBorders: false,
    //   hasControls: false,
    // });

    function findMidpoint(p1, p2) {
      return {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2,
      };
    }

    var shapeBounds = shape.getBoundingRect();
    var topMidpoint = findMidpoint(
      { x: shapeBounds.left, y: shapeBounds.top },
      { x: shapeBounds.left + shapeBounds.width, y: shapeBounds.top }
    );
    var bottomMidpoint = findMidpoint(
      { x: shapeBounds.left, y: shapeBounds.top + shapeBounds.height },
      {
        x: shapeBounds.left + shapeBounds.width,
        y: shapeBounds.top + shapeBounds.height,
      }
    );
    var leftMidpoint = findMidpoint(
      { x: shapeBounds.left, y: shapeBounds.top },
      { x: shapeBounds.left, y: shapeBounds.top + shapeBounds.height }
    );
    var rightMidpoint = findMidpoint(
      { x: shapeBounds.left + shapeBounds.width, y: shapeBounds.top },
      {
        x: shapeBounds.left + shapeBounds.width,
        y: shapeBounds.top + shapeBounds.height,
      }
    );

    // ports = allPorts
    for (var i = 0; i < allPorts.length; i++) {
      startActiveObjectQuiz(allPorts[i], this.page.audioRecorder, this.page.translate);
    }
    var ports = [...allPorts];

    shape.ports = allPorts;

    shape.on('moving', function (e) {
      updatePortPositions1(shape);
    });
  }



  // addPortToEdge(x, y, canvas, shapeNumber) {
  addPortToEdge(x, y, objectID, portNumber) {
    var circle = new fabric.Circle({
      radius: 10,
      fill: '#fff',
      stroke: '#666',
      strokeWidth: 1,
      left: x,
      top: y,
      selectable: false,
      hasBorders: false,
      hasControls: false,
      //hoverCursor: 'default',
      originX: 'center',
      originY: 'center',
      lockMovementX: true, // Prevent horizontal movement
      lockMovementY: true, // Prevent vertical movement
      name: `port-${objectID}-${portNumber}`,
    });
    startActiveObjectQuiz(circle, this.page.audioRecorder, this.page.translate);
    this.canvas.add(circle);
    //allPorts.push(circle);
    return circle;
  }

  changeTextBoxFillColor(color) {
    var activeObject = this.canvas.getActiveObject();
    if (activeObject && activeObject.name.startsWith('quiz-matchObj')) {
      console.log('color', color);
      console.log('activeObject', activeObject);
      activeObject._objects[0].set({
        fill: color,
      });
      activeObject.set({
        fill: color,
      });
    }
    this.canvas.renderAll();
  }

  changeInputTextBoxText(text) {
    var activeObject = this.canvas.getActiveObject();
    if (activeObject && activeObject.name.startsWith('quiz-matchObj')) {
      activeObject._objects[1].set({
        text,
      });
    }
  }

  //
  findTargetPort(object, ports) {
    let points = new Array(4);
    let port;
    if (ports) {
      port = ports;
    } else {
      port = object.__corner;
    }
    switch (port) {
      case 'mt':
        points = [
          object.left + (object.width * object.scaleX) / 2,
          object.top,
          object.left + (object.width * object.scaleX) / 2,
          object.top,
        ];
        break;
      case 'mr':
        points = [
          object.left + object.width * object.scaleX,
          object.top + (object.height * object.scaleY) / 2,
          object.left + object.width * object.scaleX,
          object.top + (object.height * object.scaleY) / 2,
        ];
        break;
      case 'mb':
        points = [
          object.left + (object.width * object.scaleX) / 2,
          object.top + object.height * object.scaleY,
          object.left + (object.width * object.scaleX) / 2,
          object.top + object.height * object.scaleY,
        ];
        break;
      case 'ml':
        points = [
          object.left,
          object.top + (object.height * object.scaleY) / 2,
          object.left,
          object.top + (object.height * object.scaleY) / 2,
        ];
        break;

      default:
        break;
    }

    return {
      x1: points[0],
      y1: points[1],
      x2: points[2],
      y2: points[3],
    };
  }

  mouseUp(e) {
    const object = e.target;
    const objectMiro = null;
    if (
      !this.isChoosePort &&
      object.type === 'group' &&
      object.name !== 'quiz' &&
      object.name !== 'media'
    ) {
      if (e.button === 3) {
        object.clicked = false;
      }
      if (object.clicked) {
        console.log(123123);
        object._objects.forEach((obj) => {
          if (obj.type === 'textbox') {
            this.handleTextEdit(object, obj, this);
          }
        });
        object.clicked = false;
      } else {
        object.clicked = true;
      }
    }
  }

  //h12andleTextEdit

  handleTextEdit(object, textObj, self) {
    console.log('edit text');
    //'#edit-form-textbox').css({ 'visibility': 'hidden' })

    if (object.name === 'latex') {
      var textForEditing = new fabric.Textbox(textObj.text, {
        originX: 'center',
        originY: 'center',

        textAlign: textObj.textAlign,
        fontSize: textObj.fontSize,
        width: object.width,
        height: object.height,
        fontFamily: textObj.fontFamily,

        left: object.left,
        top: object.top,
        scaleX: object.scaleX,
        scaleY: object.scaleY,
        name: 'textBoxEditor',
      });
      textForEditing.set({
        fontSize: object.fontSize,
      });
      object.visible = false;
    } else {
      var textForEditing = new fabric.Textbox(textObj.text, {
        originX: 'center',
        originY: 'center',

        textAlign: textObj.textAlign,
        fontSize: textObj.fontSize,
        width: object.width,
        fontFamily: textObj.fontFamily,

        left: textObj.left + object.left + object.width / 2,
        top: textObj.top + object.top + object.height / 2,
        scaleX: textObj.scaleX,
        scaleY: textObj.scaleY,
        name: 'textBoxEditor',
      });
      object.visible = false;
    }

    // hide group inside text
    // note important, text cannot be hidden without this
    object.addWithUpdate();
    textForEditing.set({
      visible: true,
      hasBorders: true,
      hasControls: false,
    });

    // now add this temporary obj to canvas
    windowCanvas.add(textForEditing);
    windowCanvas.setActiveObject(textForEditing);
    // make the cursor showing
    textForEditing.enterEditing();
    textForEditing.selectAll();

    // editing:exited means you click outside of the textForEditing
    textForEditing.on('editing:exited', async () => {
      const newVal = textForEditing.text;
      const oldVal = textObj.text;

      windowCanvas.remove(textForEditing);
      if (newVal != oldVal) {
        if (object.name === 'latex') {
          const src = await self.latexToImg(newVal, self);
          object._objects[1].setSrc(src, function () {
            object._objects[1].setCoords();
            windowCanvas.requestRenderAll();
          });
          textObj.set({
            text: newVal,
            // width: textForEditing.width,
            // fontSize: textForEditing.fontSize,
            // fontFamily: textForEditing.fontFamily
          });

          object.set({
            visible: true,
          });
          object.addWithUpdate();
          // var options = {
          //   fontSize: object.fontSize,
          //   top: object.top,
          //   left: object.left,
          // }
          // this.createLatex(newVal, options);
          // textObj.visible = true;
          // deleteObjects([object])
        } else {
          textObj.set({
            text: newVal,
            // width: textForEditing.width,
            // fontSize: textForEditing.fontSize,
            // fontFamily: textForEditing.fontFamily
          });

          object.set({
            visible: true,
          });
          // comment before, you must call this
          object.addWithUpdate();

          // we do not need textForEditing anymore
          // updateLocal(pool_data, object.objectID, object.toObject(customAttributes), socket);
          // optional, buf for better user experience
          // canvas.setActiveObject(object);
        }
      } else {
        object.set({
          visible: true,
        });
        object.addWithUpdate();
        // canvas.setActiveObject(object);
      }
    });
  }

  getTextForObject(obj, isText) {
    // var text = username;
    var fontSize = 10;
    // startActiveTextbox(obj);
    windowCanvas.add(obj);

    // isLoadDataLocal = false;
    // emitEvent();
  }

  //Create Text Input
  getTextForObject2(obj) {
    windowCanvas.add(obj);
  }

  // latex
  async createLatex(
    latex = 'Latex',
    options = {
      fontSize: 14,
      top: 250,
      left: 250,
      stroke: 'black',
    }
  ) {
    this.isLoadLocal = false;
    var svg = await this.latexToImg(latex);
    options.stroke = this.selectedColor;
    fabric.Image.fromURL(svg, function (img) {
      // var text = username;
      var text = new fabric.Textbox(latex, {
        angle: 0,
        fontSize: options.fontSize,
        textAlign: 'center',
        top: img.top,
        left: img.left,
        visible: false,
        stroke: options.stroke,
      });
      img.set({
        scaleX: (options.fontSize + 16) / 12,
        scaleY: (options.fontSize + 16) / 12,
      });
      var alltogetherObj = new fabric.Group([text, img], {
        top: options.top,
        left: options.left,
        fontSize: options.fontSize,
        originX: 'center',
        originY: 'center',
        name: 'latex',
      });

      // startActiveTextbox(alltogetherObj);
      // startActiveObject(alltogetherObj);

      windowCanvas.add(alltogetherObj).setActiveObject(alltogetherObj);

      // isLoadDataLocal = false;
      // emitEvent();
    });
  }

  async latexToImg(formula) {
    var thisWindow: any = window;
    console.log('wrapper', thisWindow.MathJax);
    const wrapper = await thisWindow.MathJax.tex2svg(formula, {
      em: 10,
      ex: 5,
      display: true,
    });
    const fin = btoa(
      unescape(encodeURIComponent(wrapper.querySelector('svg').outerHTML))
    );
    const svg = 'data:image/svg+xml;base64,' + fin;
    return svg;
  }

  // randomID() {
  //   return '_' + Math.random().toString(36).substr(2, 9);
  // }

  isFreeDrawing;
  setFreeDrawingMode(val) {
    console.log('val', val);
    this.isFreeDrawing = val;
    if (val) {
      this.disableShapeMode();
    } else {
      this.enableShapeMode();
    }
  }
  enableShapeMode() {
    this.canvas.isDrawingMode = false;
    this.canvas.selection = false;
    this.setCanvasSelectableStatus(true);
  }
  disableShapeMode() {
    this.canvas.isDrawingMode = this.isFreeDrawing;
    this.canvas.selection = true;
    this.setCanvasSelectableStatus(false);
  }
  setCanvasSelectableStatus(val) {
    this.canvas.forEachObject(function (obj) {
      obj.lockMovementX = !val;
      obj.lockMovementY = !val;
      obj.hasControls = val;
      obj.hasBorders = val;
      obj.selectable = val;
    });
    this.canvas.renderAll();
  }
  controlrubber = false;
  isErasing = false;
  deleteObjects(objects: any[]) {
    var _this = this;
    if (objects) {
      objects.forEach(function (object) {
        // remove lineConnect + curvePoint
        _this.canvas.getObjects().forEach((item) => {
          if (
            object.name === 'curve-point' &&
            item.objectID === object.lineID
          ) {
            _this.deleteObjInPool(
              item.objectID,
              _this.pool_data,
              _this.canvas.id,
              _this.canvas
            );
            _this.canvas.remove(item);
          } else if (
            item.name === 'lineConnect' &&
            (item.idObject1 === object.objectID ||
              item.idObject2 === object.objectID)
          ) {
            const curvePoint = _this.canvas
              .getObjects()
              .find((obj) => obj.lineID === item.objectID);
            _this.deleteObjInPool(
              item.objectID,
              _this.pool_data,
              _this.canvas.id,
              _this.canvas
            );
            _this.canvas.remove(item);
            curvePoint && _this.canvas.remove(curvePoint);
          }
          if (item?._objects && item?._objects[0]?.MicId) {
            var className = item?._objects[0]?.MicId;
            var escapedClassName = CSS.escape(className);

            var inputActive = document.querySelector('.' + escapedClassName);
            if (inputActive) {
              inputActive.remove();
            }
            const existingIcon = _this.canvas.getObjects().find(obj => obj.idHeadphone === className);
            if (existingIcon) {
              _this.canvas.remove(existingIcon);
            }
          }



        });
        _this.deleteObjInPool(
          object.objectID,
          _this.pool_data,
          _this.canvas.id,
          _this.canvas
        );
        _this.canvas.remove(object);
        console.log(object);
        const connectedPairs = _this.userConnectedImagePairs.filter(pair =>
          (pair.id1 === object.objectID || pair.id2 === object.objectID)
        );

        connectedPairs.forEach(pair => {
          if (pair.lines) {
            // Xóa từng đoạn line trong các đường gấp khúc (từ lines array)
            pair.lines.forEach(line => {
              _this.canvas.remove(line);
            });
          }
          _this.userConnectedImagePairs = _this.userConnectedImagePairs.filter(p =>
            !(p.id1 === object.objectID || p.id2 === object.objectID)
          );
        });

        _this.canvas.renderAll();
        _this.selectedImagesForLine = [];
      });
    }
  }

  deleteObjInPool(data, pool_data, layer, canvas) {
    const indexDelete = pool_data.findIndex(
      (item) => item.objectID === data && item.layer === layer
    );
    if (indexDelete >= 0) {
      pool_data.splice(indexDelete, 1);
    }
  }
  Mapping = '';
  loadData(json_data) {
    // this.canvas.clear();
    // var json_data = [];
    // var blinkObj = null;
    // for (var i = 0; i < res.length; i++) {
    //   var type = res[i].Type;
    //   var item = res[i];
    //   var code = res[i].Code;
    //   var dataObj = JSON.parse(res[i].ShapeData);
    //   if (dataObj != null && dataObj != undefined) {
    //     var data = JSON.parse(res[i].ShapeData);
    //     data.userData = res[i];
    //     if (res[i].Mapping === this.Mapping) {
    //       data.blink = true;
    //       blinkObj = data;
    //     }
    //     data.isFromDb = true;
    //     json_data.push(data);
    //   } else {
    //     var data = this.initObject(type, item, true);
    //     if (res[i].Mapping === this.Mapping) {
    //       data.blink = true;
    //       blinkObj = data;
    //     }
    //     data.isFromDb = false;
    //     json_data.push(data);
    //   }
    // }
    this.loadCanvasJson(json_data, this.canvas);
    this.canvas.renderAll();
  }

  //
  changeFontSize(value: number) {
    var activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      activeObject.set({
        fontSize: value,
      });
      if (activeObject._objects) {
        activeObject._objects[1].set({
          fontSize: value,
        });
      }
      this.canvas.renderAll();
    }
  }

  changeBorderRadius(value: number) {
    console.log('value', value);
    var activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      activeObject.set({
        rx: value,
        ry: value,
      });
      this.canvas.renderAll();
    }
    if (activeObject._objects) {
      activeObject._objects[0].set({
        rx: value,
        ry: value,
      });
      this.canvas.renderAll();
    }
  }

  changeBorderWidth(value: number) {
    var activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      activeObject.set({
        strokeWidth: value,
      });
      this.canvas.renderAll();
    }
    if (activeObject._objects) {
      activeObject._objects[0].set({
        strokeWidth: value,
      });
      this.canvas.renderAll();
    }
  }

  changeFontFamily(value: string) {
    var activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      activeObject.set({
        fontFamily: value,
      });
      this.canvas.renderAll();
      if (activeObject._objects) {
        activeObject._objects[1].set({
          fontFamily: value,
        });
        this.canvas.renderAll();
      }
    }
  }

  toggleAlign() {
    // Thay đổi giá trị được chọn theo nhu cầu của bạn
    if (this.selectedAlignment === 'right') {
      this.selectedAlignment = 'left';
    }
    else if (this.selectedAlignment === 'left') {
      this.selectedAlignment = 'center';
    }
    else {
      this.selectedAlignment = 'right';
    }
    console.log('this.selectedAlignment', this.selectedAlignment);
    var activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      activeObject.set({
        textAlign: this.selectedAlignment,
      });
      this.canvas.renderAll();
    }
  }

  toggleUnderline() {
    var activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      if (activeObject.underline) {
        activeObject.set({
          underline: false,
        });
      } else {
        activeObject.set({
          underline: true,
        });
      }
      this.canvas.renderAll();
    }
    if (activeObject._objects) {
      if (activeObject._objects[1].underline) {
        activeObject._objects[1].set({
          underline: false,
        });
      } else {
        activeObject._objects[1].set({
          underline: true,
        });
      }
    }
  }

  changeLineStyle(value: string) {
    var strokeDashArray = [];
    if (value === 'solid') {
      strokeDashArray = [];
    } else if (value === 'dashed') {
      strokeDashArray = [5, 5];
    } else if (value === 'dotted') {
      strokeDashArray = [1, 5];
    } else if (value === 'double') {
      strokeDashArray = [5, 5, 1, 5];
    } else if (value === 'groove') {
      strokeDashArray = [5, 5, 1, 5, 1, 5];
    } else if (value === 'ridge') {
      strokeDashArray = [5, 5, 1, 5, 1, 5, 1, 5];
    } else if (value === 'inset') {
      strokeDashArray = [5, 5, 1, 5];
    } else if (value === 'outset') {
      strokeDashArray = [5, 5, 1, 5];
    }
    var activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      if (activeObject._objects) {
        activeObject.item(0).set({
          strokeDashArray,
        });
        this.canvas.renderAll();
      }
    }
  }
  //tuyển sửa
  changePenStyle(value: string) {

  }

  changeTextBoxColor(color: string) {
    var activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      activeObject.set({
        stroke: color,
        fill: color,
      });
      this.canvas.renderAll();
    }
    if (activeObject._objects) {
      activeObject._objects[1].set({
        stroke: color,
        fill: color,
      });
      this.canvas.renderAll();
    }
  }

  changeLineColor(color: string) {
    var activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      activeObject.set({
        stroke: color,
      });
      this.canvas.renderAll();
    }
    if (activeObject._objects) {
      activeObject._objects[0].set({
        stroke: color,
      });
      this.canvas.renderAll();
    }
  }

  changeFillColor(color: string) {
    var activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      activeObject.set({
        fill: color,
      });
      windowCanvas.renderAll();
    }
    if (activeObject._objects) {
      activeObject._objects[0].set({
        fill: color,
      });
      windowCanvas.renderAll();
    }
  }

  changeBorderColor(color: string) {
    var activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      activeObject.set({
        stroke: color,
      });
      windowCanvas.renderAll();
    }
    if (activeObject._objects) {
      activeObject._objects[0].set({
        stroke: color,
      });
      windowCanvas.renderAll();
    }
  }

  group() {
    isGroup = !isGroup;
    if (isGroup) {
      console.log('has group');
      this.handleGroup();
    }
    isGroup = !isGroup;
  }

  unGroup() {
    if (!this.canvas.getActiveObject()) {
      return;
    }
    if (this.canvas.getActiveObject().type !== 'group') {
      return;
    }
    const group = this.canvas.getActiveObject();
    pool_data = pool_data.filter((o) => o.objectID !== group.objectID);
    group.forEachObject((i) => {
      group.removeWithUpdate(i);
      this.canvas.add(i);
      pool_data.push({
        objectID: i.objectID,
        room: stanza,
        layer: this.canvas.id,
        data: i.toObject(customAttributes),
      });
    });
    this.canvas.remove(group);

    console.log('emit ungroup', pool_data);

    windowCanvas.renderAll();
    //"#moveObject")[0].click();
  }

  handleGroup() {
    if (!this.canvas.getActiveObject()) {
      return;
    }
    if (this.canvas.getActiveObject().type !== 'activeSelection') {
      return;
    }
    const group = this.canvas.getActiveObject().toGroup();
    const objID = randomID();
    group.set({
      subTargetCheck: false,
      name: 'custom-group',
      objectID: objID,
    });
    group._objects.forEach((o) => {
      o.groupID = objID;
      pool_data = pool_data.filter((item) => item.objectID !== o.objectID);
    });

    const data = {
      objectID: objID,
      layer: this.canvas.id,
      data: group.toObject(customAttributes),
    };
    pool_data.push(data);
    console.log('emit group', pool_data);
    windowCanvas.renderAll();
  }

  connect() {
    isChoosePort = !isChoosePort;
    if (isChoosePort) {
      console.log('connect');
      this.canvas.getObjects().forEach((obj) => {
        obj.portMark && this.canvas.remove(obj.portMark);
      });
      objCover = null;
    }
  }

  unConnect() {
    console.log('unConnect');
    isChoosePortUnConnect = !isChoosePortUnConnect;
    if (isChoosePortUnConnect) {
      console.log('connect');
      this.canvas.getObjects().forEach((obj) => {
        obj.portMark && this.canvas.remove(obj.portMark);
      });
      objCover = null;
    }
  }

  toggleBold() {
    var activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      if (activeObject.fontWeight === 'bold') {
        activeObject.set({
          fontWeight: 'normal',
        });
      } else {
        activeObject.set({
          fontWeight: 'bold',
        });
      }
      this.canvas.renderAll();
    }
  }
  toggleItalic() {
    var activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      if (activeObject.fontStyle === 'italic') {
        activeObject.set({
          fontStyle: 'normal',
        });
      } else {
        activeObject.set({
          fontStyle: 'italic',
        });
      }
      this.canvas.renderAll();
    }
  }
  //
  loadCanvasJson(objects, canvas) {
    var isBackgroundCentered = false;
    var _this = this;
    // var canvasLength = canvasObj.objects.length;
    objects.forEach((x) => {
      if (x.type === 'path') {
        x.oLeft = x.left;
        x.oTop = x.top;
      }
    });
    fabric.util.enlivenObjects(objects, function (enlivenedObjects) {
      var eLength = enlivenedObjects.length;
      var group_left;
      var group_top;
      var group_right;
      var group_bottom;
      group_left = group_top = group_right = group_bottom = 0;
      enlivenedObjects.forEach(function (obj, i) {
        if (group_left === 0) {
          group_left = obj.left;
        } else {
          if (obj.left < group_left) {
            group_left = obj.left;
          }
        }
        if (group_top === 0) {
          group_top = obj.top;
        } else {
          if (obj.top < group_top) {
            group_top = obj.top;
          }
        }
        if (group_right === 0) {
          group_right = obj.left + obj.width * obj.scaleX;
        } else {
          if (obj.left + obj.width > group_right) {
            group_right = obj.left + obj.width * obj.scaleX;
          }
        }
        if (group_bottom === 0) {
          group_bottom = obj.top + obj.height * obj.scaleY;
        } else {
          if (obj.top + obj.height > group_bottom) {
            group_bottom = obj.top + obj.height * obj.scaleY;
          }
        }
        if (obj.name === 'lineConnect') {
          var line = new fabric.Path('M 65 0 Q 100 100 200 0', {
            //  M 65 0 L 73 6 M 65 0 L 62 6 z
            fill: '',
            stroke: '#000',
            objectCaching: false,
            originX: 'center',
            originY: 'center',
            name: 'lineConnect',
            idObject1: obj.idObject1 as any,
            idObject2: obj.idObject2 as any,
            port1: obj.port1 as any,
            port2: obj.port2 as any,
            objectID: obj.objectID as any,
          } as any);

          line.selectable = false;
          line.path = obj.path;

          canvas.add(line);
        } else if (obj.type === 'group') {
          if (obj.name === 'line-style' && obj.lineType === 'curve') {
            obj._objects.forEach((obj) => obj._setPath(obj.path));
          }

          if (obj.name === 'grid') {
            obj.set({
              evented: false,
              selectable: false,
              renderOnAddRemove: false,
              objectCaching: false,
            });
          }

          _this.startActiveObject(obj);
          canvas.add(obj);
        } else if (obj.type === 'image') {
          fabric.Image.fromURL(obj.src, function (img) {
            img.set({
              top: obj.top,
              left: obj.left,
              width: obj.width,
              height: obj.height,
              scaleX: obj.scaleX,
              scaleY: obj.scaleY,
              isBackground: obj.isBackground,
            });
            _this.startActiveObject(img);

            canvas.add(img);
          });
        } else if (obj.name === 'line-style') {
          if (obj.type === 'wavy-line-with-arrow') {
            obj._objects = [];
            obj.objects = [];
            obj.updateInternalPointsData();
          }

          _this.startActiveObject(obj);
          canvas.add(obj);
        } else {
          obj.hasBorders = obj.hasControls = false;

          if (obj.name === 'curve-point') {
            obj.on('moving', function () {
              const line = canvas
                .getObjects()
                .find(
                  (item) => item.type === 'path' && item.objectID === obj.lineID
                );

              if (line) {
                line.path[1][1] = obj.left;
                line.path[1][2] = obj.top;
              }
            });
          } else if (obj.type === 'path') {
            obj._setPath(obj.path);
            obj.selectable = false;
            console.log(obj);
            if (obj.oLeft) {
              obj.set({
                left: obj.oLeft,
                top: obj.oTop,
              });
            }
            obj.setCoords();
            if (obj.name === 'svg') {
              _this.startActiveObject(obj);
            }
          }
          canvas.add(obj);
        }
        /* if (obj.isBackground === true && isBackgroundCentered === false) {
          _this.zoomOnBackground(obj, canvas);
          _this.centerOnBackground(obj, canvas);
          //centerOnBackground(obj, canvas);
        }
        var group = {
          left: group_left,
          top: group_top,
          width: group_right - group_left,
          height: group_bottom - group_top
        }
        _this.groupPosition = group;
        if (i === canvasLength - 1) {
          _this.hasBackground = windowCanvas._objects.findIndex(x => x.isBackground === true) != -1;
          if (!_this.hasBackground) {
            _this.zoomOnBackground(_this.groupPosition, windowCanvas);
            _this.centerOnBackground(_this.groupPosition, windowCanvas);
          }
        } */
      });
    }, null, null);

    canvas.renderAll();

    this.isDbLoaded = true;
    if (this.role === 'user' && this.isFetched) {
      this.loadData888(this.fetchData);
    }
    if (this.role === 'master' && this.isFetched) {
      //this.save888();
    }
  }
  loadData888(data) {
    this.layerNum = Boolean(data.layerNum) ? data.layerNum : 1;
    this.layerStorage = data.layerStorage;
    this.pool_data = data.drawData;

    //".icon-selector").remove();
    // layerStorage.forEach((layer, index) => {
    //   const li = document.createElement("li");

    //   li.classList.add("icon-layer", "icon-selector");
    //li).attr("data-cnt", index + 1);
    //li).attr("data-id", layer.id);
    //   console.log(`  ~ layer.id1`, layer.id);
    //   li.innerHTML = `<img src="assets/images/notepad/layer/layer-${index + 1
    //     }.png">`;

    //"#layers-body").append(li);
    // });
    // this.currentLayer = 1;
    if (!this.canvas.id) {
      this.canvas.id = this.layerStorage[0].id;
    }

    windowCanvas.clear();
    this.loadLayerCanvasJsonNew(this.pool_data, windowCanvas);
    console.log(`  ~ loadLayerCanvasJsonNew`, 1);

    // updateToolBarStatus();
  }
  loadEvent = new EventEmitter();
  loadLayerCanvasJsonNew(arr, canvas) {
    var groups = [];
    var _this = this;
    var countObj = 0;
    for (let index = 0; index < arr.length; index++) {
      if (arr[index].data && arr[index].layer === canvas.id) {
        var jsonObj = arr[index].data;
        if (arr[index].type === 'lineConnect') {
          // }
          // if (jsonObj.name === 'custom-group') {
        } else if (arr[index].data.type === 'line-with-arrow') {
          const points = [
            arr[index].data.x1,
            arr[index].data.y1,
            arr[index].data.x2,
            arr[index].data.y2,
          ];
          const drawLine = new (fabric as any).LineWithArrow(points, {
            strokeWidth: 1,
            stroke: '#000',
            objectID: arr[index].data.objectID,
          });

          windowCanvas.add(drawLine);
          countObj++;
        } else {
          (fabric as any).util.enlivenObjects([jsonObj], function (enlivenedObjects) {
            enlivenedObjects.forEach(function (obj) {
              // console.log(obj);
              // if (obj.groupID) {
              //     const group = groups.find(g => g.id === obj.groupID)
              //     if (group) {
              //         group.objs.push(obj)
              //     }
              //     else {
              //         groups.push({
              //             id: obj.groupID,
              //             objs: [obj]
              //         })
              //     }
              //     return;
              // }
              //"#quiz-type").val();
              // if(obj.isDrag === true || obj.isDrop === true) {
              //   countItem++;
              // }
              if (obj?.name === 'line-style') {
                obj.set({
                  selectable: true,
                  hasBorders: true,
                  hasRotatingPoint: true,
                  transparentCorners: false,
                });
                obj.setControlsVisibility({
                  tl: true,
                  tr: true,
                  bl: true,
                  br: true,
                  mtr: true,
                  mb: true,
                  mt: true,
                  ml: true,
                  mr: true,
                });
              }

              if (obj.name === 'lineConnect') {
                var line = new fabric.Path('M 65 0 Q 100 100 200 0', {
                  //  M 65 0 L 73 6 M 65 0 L 62 6 z
                  fill: '',
                  stroke: '#000',
                  objectCaching: false,
                  originX: 'center',
                  originY: 'center',
                  name: 'lineConnect',
                  idObject1: obj.idObject1,
                  idObject2: obj.idObject2,
                  port1: obj.port1,
                  port2: obj.port2,
                  objectID: obj.objectID,
                });

                line.selectable = false;
                line.path = obj.path;

                canvas.add(line);
                countObj++;
              } else if (obj.name === 'media') {
                // console.log("media", obj);
                // if(obj.nameDevice === "attach-file") {
                //   attachFileObj = obj;
                //   startActiveFileObj(obj);
                // } else {
                //   activeDeviceObject = obj;
                //   obj.on("mouseup", handleMouseUpSvg);
                //   startActiveMedia(obj);
                // }
                // obj.set({
                //   objectID: arr[index].objectID,
                //   userID: arr[index].userID,
                // });
                // canvas.add(obj);
              } else if (obj.name === 'latex') {
                obj.set({
                  objectID: arr[index].objectID,
                  userID: arr[index].userID,
                });
                // startActiveTextbox(obj)
                // startActiveObject(obj);
                canvas.add(obj);
                countObj++;
              } else if (obj.type === 'group') {
                if (obj.name === 'line-style' && obj.lineType === 'curve') {
                  obj._objects.forEach((obj) => obj._setPath(obj.path));
                } else if (obj.name === 'quiz-inputObj') {
                  // objectSnapAdjacent(obj);
                }
                obj._objects.forEach((child) => {
                  // if(child.id === "answer-correct-textbox") {
                  //   correctAnswerBox = child;
                  //   if(quizType === "quiz-3") {
                  //     console.log(correctAnswerBox);
                  //     correctAnswerBox.text = correctAnswerMatch
                  //       .map((item) => item)
                  //       .join(", ");
                  //   }
                  //   const title = new fabric.Text("User Answer", {
                  //     top: 0,
                  //     left: 30,
                  //     fontSize: 16,
                  //     fontFamily: "Times New Roman",
                  //   });
                  //   userAnswerBox = new fabric.Textbox("", {
                  //     left: 0,
                  //     top: 40,
                  //     width: 200,
                  //     fontSize: 10,
                  //     fontFamily: "Times New Roman",
                  //     id: "answer-correct-textbox",
                  //   });
                  //   const group = new fabric.Group([title, userAnswerBox], {
                  //     top: 150,
                  //     left: 50,
                  //     selectable: false,
                  //   });
                  //   canvas.add(group);
                  //   isCreateDoquiz = true;
                  // } else if(child.type === "textbox") {
                  //   // startActiveTextbox(obj)
                  //   startActiveObject(obj);
                  // }
                });

                if (obj.name === 'grid') {
                  obj.set({
                    evented: false,
                    selectable: false,
                    renderOnAddRemove: false,
                    objectCaching: false,
                  });
                  obj.moveTo(0);
                }

                obj.set({
                  objectID: arr[index].objectID,
                  userID: arr[index].userID,
                });

                _this.startActiveObject(obj);
                canvas.add(obj);
                countObj++;
              } else if (obj.type === 'image') {
                fabric.util.loadImage(
                  obj.src,
                  function (para) {
                    var img = new fabric.Image(para);
                    img.set({
                      ...obj,
                    });
                    // if(quizType === "quiz-3") {
                    //   img.set({
                    //     name: obj.name,
                    //     id: obj.id,
                    //     port1: obj.port1,
                    //     port2: obj.port2,
                    //     idObject1: obj.idObject1,
                    //     idObject2: obj.idObject2,
                    //     objectID: obj.objectID,
                    //     port: obj.port,
                    //     lineID: obj.lineID,
                    //     hasShadow: obj.hasShadow,
                    //     shadowObj: obj.shadowObj,
                    //     pos: obj.pos,
                    //     snap: obj.snap,
                    //     readySound: obj.readySound,
                    //     sound: obj.sound,
                    //     line2: obj.line2,
                    //     isDrop: obj.isDrop,
                    //     isDrag: obj.isDrag,
                    //     isBackground: obj.isBackground,
                    //     answerId: obj.answerId,
                    //   });
                    // }
                    _this.startActiveObject(img);
                    img.set({
                      objectID: arr[index].objectID,
                      userID: arr[index].userID,
                    });
                    console.log('load image', img, obj);
                    canvas.add(img);
                    countObj++;
                    // repositionBackground();
                  },
                  null,
                  'anonymous' as any
                );
              } else if (obj.name === 'line-style') {
                if (obj.type === 'wavy-line-with-arrow') {
                  console.log('obj', obj);
                  obj._objects = [];
                  obj.objects = [];
                  obj.updateInternalPointsData();
                }

                _this.startActiveObject(obj);
                obj.set({
                  objectID: arr[index].objectID,
                  userID: arr[index].userID,
                });
                canvas.add(obj);
                countObj++;
              } else if (obj.name && obj.name.includes('pen')) {
                obj.set({
                  objectID: arr[index].objectID,
                  userID: arr[index].userID,
                });
                console.log(obj.stroke);
                // switch (obj.name) {
                //   case 'pen_1':
                //     obj.stroke.src = _this.getSourceBrushNormal();
                //     break;

                //   default:
                //     break;
                // }
                // startActiveTextbox(obj)
                _this.startActiveObject(obj);
                canvas.add(obj);
                countObj++;
              } else if (obj.type === 'textbox') {
                obj.set({
                  objectID: arr[index].objectID,
                  userID: arr[index].userID,
                });
                // startActiveTextbox(obj)
                _this.startActiveObject(obj);
                canvas.add(obj);
                countObj++;
              } else {
                obj.hasBorders = obj.hasControls = false;

                if (obj.name === 'curve-point') {
                  obj.on('moving', function () {
                    const line = canvas
                      .getObjects()
                      .find(
                        (item) =>
                          item.type === 'path' && item.objectID === obj.lineID
                      );

                    if (line) {
                      line.path[1][1] = obj.left;
                      line.path[1][2] = obj.top;
                    }
                  });
                } else if (obj.type === 'path') {
                  obj._setPath(obj.path);

                  if (obj.name === 'svg') {
                    _this.startActiveObject(obj);
                    obj.set({
                      objectID: arr[index].objectID,
                      userID: arr[index].userID,
                    });
                  }
                }
                canvas.add(obj);
                countObj++;
              }
              if (obj.isMoving && obj.startMoving) {
                obj.startMoving();
              }
            });
          });
        }
      }
    }

    // groups.forEach((g) => {
    //   const grp = this.pool_data.find((o) => o.objectID === g.id);
    //   const group = new fabric.Group(g.objs, {
    //     ...grp?.data,
    //     name: "custom-group",
    //     objectID: g.id,
    //   });
    //   canvas.add(group);
    // });
    canvas.renderAll();
    this.loadEvent.emit();
  }
  updateLocal(pool_data, objectID, dataChange, socket, moving?, options?) {
    var index = pool_data.findIndex((item) => item.objectID === objectID);
    if (index >= 0) {
      if (moving) {
        if (pool_data[index].type != 'lineConnect') {
          Object.keys(dataChange).forEach((key) => {
            pool_data[index].data[key] = dataChange[key];
          });
        }
      } else {
        pool_data[index].data = dataChange;
      }
    } else {
    }
    socket.emit('updated', {
      objectID,
      dataChange,
      moving,
      options,
    });
  }
  updateObjectByID(pool_data, dataChange, objectID, moving) {
    var index = pool_data.findIndex((item) => item.objectID === objectID);
    if (index >= 0) {
      if (moving) {
        if (pool_data[index].name != 'lineConnect') {
          Object.keys(dataChange).forEach((key) => {
            pool_data[index].data[key] = dataChange[key];
          });
        }
      } else {
        pool_data[index].data = dataChange;
      }
    }
  }
  socketEmitHandler() {
    const _this = this;

    windowCanvas.on('object:added', function (e) {
      console.log('copy', _this.isLoadLocal);
      if (_this.isLoadLocal) {
        return;
      }
      console.log('~ canvas on object added', e, _this.isLoadLocal);
      const json = windowCanvas.getObjects();
      const obj = windowCanvas.item(json.length - 1);
      console.log('~ last obj may be different', obj);
      if (obj?.name === 'line-style') {
        obj.set({
          selectable: true,
          hasBorders: true,
          hasRotatingPoint: true,
          transparentCorners: false,
        });
        obj.setControlsVisibility({
          tl: true,
          tr: true,
          bl: true,
          br: true,
          mtr: true,
          mb: true,
          mt: true,
          ml: true,
          mr: true,
        });
      }
      obj.userName = _this.page.service.userName;
      obj?.clone((lastObject) => {
        // lastObject.stroke = getColor();
        // lastObject.strokeWidth = getPencil();
        lastObject.objectID = _this.randomID();
        const data = {
          // w: w,
          // h: h,
          // drawing: drawing,
          // color: getColor(),
          // id: id,
          // userID: userID,
          objectID: lastObject.objectID,
          // username: username,
          // spessremo: getPencil(),
          // room: stanza,
          layer: windowCanvas?.id || 1,
          data: lastObject.toObject(_this.page.customAttributes),
        };
        // _this.pool_data.push(data);
        _this.pool_data.push(data);
        _this.isLoadLocal = true;
        windowCanvas.item(json.length - 1).set({
          objectID: lastObject.objectID,
        });
      }, _this.page.customAttributes);
      windowCanvas.requestRenderAll();
    });

    windowCanvas.on('object:moving', function (e) {
      const object = e.target;
      console.log('~ on object modified:', { object });
      _this.updateLocal(
        _this.pool_data,
        object.objectID,
        {
          top: object.top,
          left: object.left,
        },
        null,
        true
      );
    });

    windowCanvas.on('object:modified', function (e) {
      const object = e.target;
      console.log('~ on object modified:', { object });
      _this.updateLocal(
        _this.pool_data,
        object.objectID,
        object.toObject(_this.page.customAttributes),
        null
      );
    });
  }
  socketOnHandler() {
    const _this = this;
  }
  clearEvent() {
    // this.socket.emit('clearEvent');
    // this.socket.removeAllListeners();
  }
  addLayer() {
    var len = this.layerStorage.length;
    if (len < 6) {
      // update current layer to layerStorage
      windowCanvas.getObjects().forEach((obj) => {
        if (obj.isMoving && obj.stopAudio) {
          obj.stopAudio();
        }
      });

      //".icon-selector.active").removeClass("active");

      // create new layer
      const layer = {
        id: this.randomID(),
        canvas: {
          backgroundColor: '#ffffff',
          gridObj: null,
        },
      };
      this.currentLayer = len + 1;
      windowCanvas.id = layer.id;
      windowCanvas.clear();
      windowCanvas.setBackgroundColor(
        layer.canvas.backgroundColor,
        windowCanvas.renderAll.bind(windowCanvas)
      );

      this.layerStorage.push(layer);
    }
  }
  deleteLayer() {
    if (this.layerStorage.length > 1) {
      //"#panel").find(".typing-input").remove();
      windowCanvas.clear();

      const layer = JSON.parse(
        JSON.stringify(
          this.layerStorage.find((item) => item.id === windowCanvas.id)
        )
      );

      console.log('delete layer:', layer, this.currentLayer);

      this.layerStorage = this.layerStorage.filter(
        (item) => item.id !== windowCanvas.id
      );
      this.pool_data = this.pool_data.filter(
        (obj) => obj.layer !== windowCanvas.id
      );

      //".icon-selector").remove();

      // load next layer
      if (this.currentLayer > 1) {
        this.currentLayer--;
      }
      windowCanvas.id = this.layerStorage[this.currentLayer - 1].id;

      // updateToolBarStatus();

      this.loadLayerCanvasJsonNew(this.pool_data, windowCanvas);
    }
  }
  selectLayer(layer, index) {
    // save current layer
    windowCanvas.getObjects().forEach((obj) => {
      if (obj.isMoving && obj.stopAudio) {
        obj.stopAudio();
      }
    });
    windowCanvas.clear();

    this.currentLayer = index + 1;
    windowCanvas.id = layer.id;
    console.log(`  ~ currentLayer`, this.currentLayer);
    console.log(`  ~ canvas.id `, windowCanvas.id);

    // load target layer
    // const canvasObj = JSON.parse(layer.canvas);
    // loadCanvasJsonNew(canvasObj);
    this.loadLayerCanvasJsonNew(this.pool_data, windowCanvas);

    windowCanvas.setBackgroundColor(
      this.layerStorage[this.currentLayer - 1].canvas.backgroundColor,
      windowCanvas.renderAll.bind(windowCanvas)
    );

    console.log('change layer', this.layerStorage); //vuong
    //reset correctAnswer
    correctAnswers = [];
    //reset selected Answer
    selectedAnswers = [];
  }
}

(fabric as any).LineWithArrow = fabric.util.createClass(fabric.Line, {
  type: 'line-with-arrow',

  initialize(element, options) {
    console.log(element, options);
    options || (options = element);

    this.callSuper('initialize', element, options);
    this.set(options);
  },

  _render(ctx) {
    this.callSuper('_render', ctx);
    ctx.save();
    const xDiff = this.x2 - this.x1;
    const yDiff = this.y2 - this.y1;
    const angle = Math.atan2(yDiff, xDiff);
    ctx.translate((this.x2 - this.x1) / 2, (this.y2 - this.y1) / 2);
    ctx.rotate(angle);
    ctx.beginPath();
    // Move 5px in front of line to start the arrow so it does not have the square line end showing in front (0,0)
    ctx.moveTo(5, 0);
    ctx.lineTo(-5, 5);
    ctx.lineTo(-5, -5);
    ctx.closePath();
    ctx.fillStyle = this.stroke;
    ctx.fill();
    ctx.restore();
  },

  toObject(propertiesToInclude) {
    return fabric.util.object.extend(this.callSuper('toObject', propertiesToInclude), {
      x1: this.x1,
      y1: this.y1,
      x2: this.x2,
      y2: this.y2,
    });
  },

  // toObject: function() {
  //   return fabric.util.object.extend(this.callSuper('toObject'), {
  //     label: this.get('label')
  //   });
  // },

});

fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

type ActionTypes = 'ADD' | 'UPDATE';
@Component({
  selector: 'mapping-modal',
  styleUrls: ['./mapping.component.scss'],
  template: `
    <!-- <ion-modal class="custom-modal" #modal trigger="open-modal" canDismiss="true"
      [presentingElement]="presentingElement"> -->
      <ng-template>
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button color="dark" class="cssBtnBack" (click)="modal.dismiss()">
              <i class="fa-solid fa-xmark fs30"></i>
            </ion-button>
          </ion-buttons>
          <ion-title>
            {{'DRAWING_CANVAS.HTML_DRAW_PERMISSION'|translate}}
            &nbsp;[ {{listUser.length - 1 > 0 ? listUser.length - 1 : 0}} ]
          </ion-title>
          <div class="btnHeader" slot="end" style="text-align: right;display: flex;width: calc(15% + 30px);">
            <button class=" btn_openSearch"
              style="border: none; box-shadow: none; font-size: 25px; margin-right:30px">
              <i class="fa-solid fa-hand fs30 color-yellow"></i>
              <!-- <i class="fa-solid fa-hand fs30 color-green" *ngIf="isRequestingDrawing" (click)="stopDrawing()"></i>
              <i class="fa-regular fa-hand fs30 color-green" *ngIf="isNotDrawing" (click)="requestDrawing()"></i> -->
            </button>
            <!-- <div>
              <i class="fa-solid fa-square fs30 " style="color: #183153;" (click)="toggleDrawingAllPermission(true)"
                *ngIf="!haveAllDrawingPermission()"></i>
              <i class="fa-solid fa-square-check fs30" style="color: #183153;" (click)="toggleDrawingAllPermission(false)"
                *ngIf="haveAllDrawingPermission()"></i>
            </div> -->
          </div>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <div class="info-students"
        *ngFor="let user of listUser | orderBy:'isDrawing':'desc', let i=index, trackBy: trackByFn"
        [hidden]="user.isHidden">
          <div class="info">
            <span style="font-weight: 600;">{{user.displayName}} [{{user.role}}]</span>
          </div>
          <div class="icon-wrapper">
            <div style="margin-right: 30px">
              <i class="fa-solid fa-hand fs30 color-green" *ngIf="user.isDrawing"></i>
              <i class="fa-regular fa-hand fs30 color-green" *ngIf="!user.isDrawing"></i>
            </div>
            <div>
              <i class="fa-solid fa-square fs30 " style="color: #183153;" (click)="toggleDrawingPermission(user)"
                *ngIf="!user.haveDrawingPermission"></i>
              <i class="fa-solid fa-square-check fs30" style="color: #183153;" (click)="toggleDrawingPermission(user)"
                *ngIf="user.haveDrawingPermission"></i>
            </div>
          </div>
        </div>
      </ion-content>
      </ng-template>
 
  `,
})
export class MappingComponent {
  name: string;
  action: ActionTypes;
  constructor(
    public service: ServiceService,
    private translate: TranslateService,
  ) {
    this.name = 'Angular2';
  }
  @Input() listUser = [];
  presentingElement;
  origin: any;
  @Output() onStopDrawing = new EventEmitter<any>();
  @Output() onRequestDrawing = new EventEmitter<any>();
  @Output() onRequestAccept = new EventEmitter<any>();
  @Output() onRequestAcceptAll = new EventEmitter<any>();
  @Input() isCurrentlyDrawing: boolean;
  @Input() isRequestingDrawing: boolean;
  @Input() isNotDrawing: boolean;
  @ViewChild('modal', { static: false }) modal: IonModal;
  openModal() {
    this.modal.present();
  }
  trackByFn(index, item) {
    console.log('TrackBy:', item.socketID, 'at index', index);
    return (item.socketID);
  }
  requestDrawing() {
    this.onRequestDrawing.emit();
  }
  stopDrawing() {
    this.onStopDrawing.emit();
  }
  toggleDrawingPermission(user) {
    this.onRequestAccept.emit(user);
  }
  toggleDrawingAllPermission(value) {
    this.onRequestAcceptAll.emit(value);
  }
  haveAllDrawingPermission() {
    return !this.listUser.some(x => !x.haveDrawingPermission && !x.isHidden);
  }
}

@Component({
  selector: 'file-name-modal',
  styleUrls: ['./file-name.component.scss', './lms-exam-edit.page.scss'],
  template: `
    <!-- <ion-modal class="custom-modal" #modal trigger="open-modal" canDismiss="true"
      [presentingElement]="presentingElement"> -->
      <ng-template>
        <ion-header>
          <ion-toolbar>
            <!-- <ion-title>{{'LMS_EXAM.HTML_DETAIL' | translate}}</ion-title> -->
            <ion-buttons slot="start">
              <ion-button color="dark" class="cssBtnBack" (click)="modal.dismiss()">
                <i class="fa-solid fa-xmark fs30"></i>
              </ion-button>
            </ion-buttons>
            <div class="btnHeader" slot="end" *ngIf="action==='ADD'">
              <button (click)="updateDetail()" class=" btn_openSearch"
                style="border: none; box-shadow: none; font-size: 25px;">
                <i class="fa-regular fa-floppy-disk"></i>
              </button>
            </div>
            <div class="btnHeader" slot="end" *ngIf="action==='UPDATE'">
              <button (click)="updateDetail()" class=" btn_openSearch"
                style="border: none; box-shadow: none; font-size: 25px;">
                <i class="fa-regular fa-floppy-disk"></i>
              </button>
            </div>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <!-- <div class="height_header">
            <div class="viewHeadSearchName">
              <div class="question-header">
                <div class="question-area">
                  <div class="question-content" style="font-family: monospace;" [innerHTML]="quizContent"></div>
                </div>
              </div>
            </div>
          </div> -->
          <div class="">
            <div class="inner-background">
              <div class="viewHeadSearchName">
                <label class="viewLable">
                  <i class="fas fa-sort-numeric-up fs13 color-dark"></i>
                  {{'DRAWING_CANVAS.HTML_FILE_NAME' | translate}}
                </label>
                <input class="HeaderGeneral" type="text" [(ngModel)]="txtFileName" />
              </div>
            </div>
          </div>
        </ion-content>
      </ng-template>
 
  `,
})
export class FileNameComponent {
  name: string;
  action: ActionTypes;
  txtQstDuration = '';
  sltQstUnit;
  txtOrder = '';
  txtMark = '';
  txtFileName = '';
  numQuiz = 0;
  quizContent = '';
  quizCode = '';
  fileId = 0;
  listUnit = [
    {
      Code: 'MINUTE',
      Name: this.translate.instant('LMS_LECTURE.TS_MINUTE')
    }, {
      Code: 'HOUR',
      Name: this.translate.instant('LMS_LECTURE.TS_HOUR')
    },
  ];
  presentingElement;
  @Output() onFinishMapping = new EventEmitter<any>();
  @Output() onFinishUpdating = new EventEmitter<any>();
  @ViewChild('modal', { static: false }) modal: IonModal;
  listLevel = [
    {
      Code: 'VERY_EASY',
      Name: this.translate.instant('LMS_QUIZ.TS_LEVEL_VERY_EASY')
    },
    {
      Code: 'EASY',
      Name: this.translate.instant('LMS_QUIZ.TS_LEVEL_EASY')
    },
    {
      Code: 'NORMAL',
      Name: this.translate.instant('LMS_QUIZ.TS_LEVEL_NORMAL')
    },
    {
      Code: 'HARD',
      Name: this.translate.instant('LMS_QUIZ.TS_LEVEL_HARD')
    },
    {
      Code: 'QUITE_HARD',
      Name: this.translate.instant('LMS_QUIZ.TS_LEVEL_QUITE_HARD')
    },
    {
      Code: 'VERY_HARD',
      Name: this.translate.instant('LMS_QUIZ.TS_LEVEL_VERY_HARD')
    },
  ];
  sltLevel;
  level = '';
  isChannel = false;
  constructor(
    public service: ServiceService,
    private translate: TranslateService,
  ) {
    this.name = 'Angular2';
  }
  openModal() {
    this.modal.present();
  }
  updateDetail() {
    // if (!this.lstMapping.some(x => x.Quantity > 0)) {
    //   return this.service.messageErorr(this.translate.instant("MaterialImpStoreProductPage.TS_NO_QUANTITY"));
    // }
    // if (this.action == 'ADD') {
    //   this.onFinishMapping.emit(this.lstMapping.filter(x => x.Quantity > 0));
    // }
    // else {
    //   console.log('UPDATE');
    //   this.onFinishUpdating.emit(this.lstMapping);
    // }
    if (!this.txtFileName || this.txtFileName.trim() === '') {
      return this.service.messageError(this.translate.instant('ADD_COURSE.TS_NULL_FILE_NAME'));
    }
    this.onFinishUpdating.emit({ IsChannel: this.isChannel, FileName: this.txtFileName });
    this.modal.dismiss();
  }
  keyPressNumbers(event) {
    var eventKey = event.key;
    // Only Numbers 0-9
    if ((eventKey < 0 || eventKey > 9) && eventKey !== 'Backspace') {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }
}

class Queue {
  queue: any[] = [];
  running = false;
  constructor() {

  }
  addFunction = function (callback) {
    var _this = this;
    queueThis = this;
    //add callback to the queue
    this.queue.push(function () {
      var finished = callback();
      if (typeof finished === 'undefined' || finished) {
        //  if callback returns `false`, then you have to
        //  call `next` somewhere in the callback
        _this.next();
      }
    });

    if (!this.running) {
      // if nothing is running, then start the engines!
      this.next();
    }

    return this; // for chaining fun!
  };
  next = function () {
    this.running = false;
    //get the first element off the queue
    var shift = this.queue.shift();
    if (shift) {
      this.running = true;
      shift();
    }
  };
}
const create_UUID = () => {
  var dt = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    var r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
};

function inputObjectEvent(activeObject: any) {

  if (activeObject && activeObject.name == 'quiz-inputObj') {
    console.log('quiz-inputObj', activeObject._objects[1]);
    //edit text in activeObject._objects[1]
    activeObject._objects[1].set({
      editable: true,
    });
  }
}

function createTable(objs: any) {
  const table = new fabric.Group(objs, {
    top: 50,
    left: 250,
    name: 'quiz',
    selectable: true,
    subTargetCheck: true,
    // selectSound: new Audio(quizSetting.selectSound),
    // correctSound: new Audio(quizSetting.correctSound),
    // incorrectSound: new Audio(quizSetting.incorrectSound),
  });

  // table.selectSound.volume = 0.6;
  // table.correctSound.volume = 0.6;
  // table.incorrectSound.volume = 0.6;

  return table;
}

function createTableInput(objs: any) {
  // const table = new fabric.Group(objs, {
  //   top: 50,
  //   left: 250,
  //   name: "quiz",
  //   selectable: false,
  //   subTargetCheck: true,
  // });

  //render all object in objs
  objs.forEach((obj) => {
    windowCanvas.add(obj);
  });

}

function createTableObject(questionValue: string, audioRecorder: AudioRecorderService, translate: TranslateService): any {
  const questionArr = questionValue.replace(/ |\t/g, "").split('\n');
  const table = [];
  const size = questionArr.length;
  const inset = 20;
  const grid = 40;
  for (var i = 0; i < size; i++) {
    table.push(
      new fabric.Text(String(), {
        //Comment số ma trận cũa Quiz1
        // left: inset / 2 + (i + 0.5) * grid,
        // top: 0,
        fontSize: 14,
        name: 'quiz-index',
        selectable: false,
      })
    );

    table.push(
      new fabric.Text(String(), {
        //Comment số ma trận cũa Quiz1
        // left: 0,
        // top: inset / 2 + (i + 0.5) * grid,
        fontSize: 14,
        textAlign: 'right',
        name: 'quiz-index',
        selectable: false,
      })
    );
  }
  questionArr.map((question, index) => {
    for (let i = 0; i < question.length && i < 15; i++) {
      const newCell = createCell(i, index, question[i], audioRecorder, translate);
      table.push(newCell);
    }
  });

  return table;
}

function createTableInputObject(questionValue: string, audioRecorder: AudioRecorderService, translate: TranslateService): any {
  const questionArr = questionValue.split('\n');
  const table = [];
  const size = questionArr.length;
  const inset = 20;
  const grid = 40;
  questionArr.map((question, index) => {
    for (let i = 0; i < question.length && i < 15; i++) {
      const newCell = createCellInput(i, index, question[i], audioRecorder, translate);
      table.push(newCell);
    }
  });
  return table;
}



function createCell(idX, idY, character, audioRecorder: AudioRecorderService, translate: TranslateService) {
  const inset = 30;
  const grid = 40;
  const rect = new fabric.Rect({
    left: idX * grid + inset,
    top: idY * grid + inset,
    width: grid,
    height: grid,
    //fill: quizSetting.bgColor,
    fill: 'white',
    stroke: 'blue',
    strokeWidth: 2,
    originX: 'left',
    originY: 'top',
    centeredRotation: true,
  });

  const textbox = new fabric.Text(character, {
    fontSize: 16,
    fontFamily: 'Time New Roman',
    fontStyle: 'normal',
    originX: 'center',
    originY: 'center',
    //fill: quizSetting.textColor,
    left: rect.left + rect.width / 2,
    top: rect.top + rect.height / 2,
    textAlign: 'center',
  });

  const cell = new fabric.Group([rect, textbox], {
    top: rect.top,
    left: rect.left,
    selectable: false,
    text: character,
    objectID: randomID(),
    name: 'quiz-selectObj',
  });
  startActiveObjectQuiz(cell, audioRecorder, translate);
  return cell;
}

function createCellInput(idX, idY, character, audioRecorder: AudioRecorderService, translate: TranslateService) {
  const inset = 175;
  const grid = 40;
  var chracterUpper = character.toUpperCase();
  const square = new fabric.Rect({
    left: idX * grid + inset,
    top: idY * grid + inset,
    width: grid,
    height: grid,
    fill: 'red',
    stroke: 'blue',
    strokeWidth: 2,
    originX: 'center',
    originY: 'center',
  });
  const iText = new fabric.IText('', {
    left: square.left,
    top: square.top,
    fontSize: 20,
    fill: 'black',
    originX: 'center',
    originY: 'center',
    width: square.width,
    height: square.height,
    text: chracterUpper,
  });
  const cell = new fabric.Group([square, iText], {
    name: 'quiz-inputObj',
    left: square.left,
    top: square.top,
    originX: 'center',
    originY: 'center',
    objectID: this.randomID(),
    width: square.width,
    height: square.height,
  });
  correctAnswers.push({
    objectID: cell.objectID,
    answer: iText.text,
  });
  startActiveObjectQuiz(cell, audioRecorder, translate);
  return cell;
}

function randomID() {
  return '_' + Math.random().toString(36).substr(2, 9);
}


function startActiveObjectQuiz(obj, audioRecorder: AudioRecorderService, translate: TranslateService) {
  if (obj.name) {
    if (obj.name === 'quiz-selectObj') {
      handleSelectObject(obj);
    }
    else if (obj.name === 'quiz-inputObj') {
      handleInputObject(obj);
    }
    else if (obj.name.startsWith('quiz-matchObj')) {
      handleMatchObject(obj);
    }
    else if (obj.name.startsWith('quiz-MutipleObject')) {
      handleMultipleObject(obj);
    }
    else if (obj.name === 'object-box') {
      handleObjectBox(obj);
    }
    else if (obj.name.startsWith('port')) {
      handlePort(obj);
    } else if (obj.name == "quiz-flashcard") {
      handleFlashcard(obj, getIsDoQuiz, audioRecorder, translate);
    }
  }
}

// add audio
const audioSelect = new Howl({ src: 'https://admin.metalearn.vn/app/song/select_Sound.mp3' });
const audioMatch = new Howl({ src: 'https://admin.metalearn.vn/app/song/match_Sound.mp3' });
const audioMulti = new Howl({ src: 'https://admin.metalearn.vn/app/song/multi_Sound.mp3' });
const audioInput = new Howl({ src: 'https://admin.metalearn.vn/app/song/input_Sound.mp3' });
const audioCorrect = new Howl({ src: 'https://admin.metalearn.vn/app/song/correct.mp3' });
const audioIncorrect = new Howl({ src: 'https://admin.metalearn.vn/app/song/incorrect.mp3' });

export function playAudio(audio: 'selectObject' | 'inputObject' | 'matchObject' | 'multiObject' | 'correct' | 'incorrect') {
  if (audio == 'selectObject') {
    audioSelect.play();
  } else if (audio == 'inputObject') {
    audioInput.play();
  } else if (audio == 'matchObject') {
    audioMatch.play();
  } else if (audio == 'multiObject') {
    audioMulti.play();
  } else if (audio == 'correct') {
    audioCorrect.play();
  } else if (audio == 'incorrect') {
    audioIncorrect.play();
  } else {
    console.error('Audio is not supported.');
  }
}

function handleMultipleObject(obj) {
  //make shadow for true false
  if (obj.name === 'quiz-MutipleObject-true') {
    var shadow = new fabric.Shadow({
      color: 'blue',
      blur: 10,
      offsetX: 10,
      offsetY: 10,
    });
    obj._objects[0].set({
      shadow: shadow,
    });
  } else if (obj.name === 'quiz-MutipleObject-false') {
    var shadow = new fabric.Shadow({
      color: 'red',
      blur: 10,
      offsetX: 10,
      offsetY: 10,
    });
    obj._objects[0].set({
      shadow: shadow,
    });
  }

  obj.on('mousedown', function (e) {
    playAudio('multiObject');
    console.log('textbox-false');
    if (isDoQuiz) {
      if (obj.name && obj.name === 'quiz-MutipleObject-false') {
        console.log('textbox-false');
        if (obj._objects[0].fill !== 'blue') {
          var oldColor = obj._objects[0].fill;
          const oldTextColor = obj._objects[1].stroke
          obj._objects[0].set({
            fill: 'blue',
            oldColor: oldColor,
          });
          obj._objects[1].set({
            stroke: 'white',
            fill: 'white',
            oldTextColor: oldTextColor
          });
          selectedAnswers.push(obj.objectID);
          console.log('selectedAnswers', selectedAnswers);
        } else {
          const Oldcolor = obj._objects[0].oldColor;
          const oldTextColor = obj._objects[1].oldTextColor;
          obj._objects[0].set({
            fill: Oldcolor,
          });
          obj._objects[1].set({
            //text color white
            stroke: oldTextColor,
            fill: oldTextColor,
          });
          selectedAnswers = selectedAnswers.filter(
            (item) => item != obj.objectID
          );
          console.log('selectedAnswers', selectedAnswers);
        }
      } else if (obj.name && obj.name === 'quiz-MutipleObject-true') {
        if (obj._objects[0].fill !== 'blue') {
          var oldColor = obj._objects[0].fill;
          const oldTextColor = obj._objects[1].stroke
          obj._objects[0].set({
            fill: 'blue',
            oldColor: oldColor,
          });
          obj._objects[1].set({
            stroke: 'white',
            fill: 'white',
            oldTextColor: oldTextColor
          });
          selectedAnswers.push(obj.objectID);
          console.log('selectedAnswers', selectedAnswers);
        } else {
          const Oldcolor = obj._objects[0].oldColor;
          const oldTextColor = obj._objects[1].oldTextColor;
          obj._objects[0].set({
            fill: Oldcolor,
          });
          obj._objects[1].set({
            //text color white
            stroke: oldTextColor,
            fill: oldTextColor,
          });
          selectedAnswers = selectedAnswers.filter(
            (item) => item != obj.objectID
          );
          console.log('selectedAnswers', selectedAnswers);
        }
      }
      console.log('selectedAnswers', selectedAnswers);
    } else if (!isDoQuiz && isSelectAnswer) {
      console.log('mousedown select');
      //click and change obj true false value
      // if (obj.name && obj.name === 'quiz-MutipleObject-false') {
      //   obj.name = 'quiz-MutipleObject-true';
      //   correctAnswers.push(obj.objectID);
      //   console.log('textbox-true');
      //   console.log('correctAnswers', correctAnswers);
      // } else if (obj.name && obj.name === 'quiz-MutipleObject-true') {
      //   obj.name = 'quiz-MutipleObject-false';
      //   console.log('textbox-false');
      //   correctAnswers = correctAnswers.filter((item) => item != obj.objectID);
      //   console.log('correctAnswers', correctAnswers);
      // }
      obj.item(1).enterEditing();
      obj.item(1).on('changed', (e) => {
        console.log('changed', e);
        //const newText = obj.item(1).text.slice(-1).toUpperCase(); // Keep the last entered character and convert to uppercase
        // const newText = obj.item(1).text.toUpperCase(); // Keep the last entered character and convert to uppercase
        const textWidth = obj.item(1).width * obj.item(1).scaleX;
        const textHeight = obj.item(1).height * obj.item(1).scaleY;
        //object type is rect
        if (obj.item(0).type === 'rect') {
          obj.item(0).set({
            width: textWidth + 60,
            height: textHeight + 60,
            originX: 'center',
            originY: 'center',
          });
          obj.set({
            width: obj.item(0).width,
            height: obj.item(0).height,
            originX: 'center',
            originY: 'center',
          });
        }
        //object type is circle
        else if (obj.item(0).type === 'circle') {
          obj.item(0).set({
            radius: textWidth + 60,
            originX: 'center',
            originY: 'center',
          });
          obj.set({
            width: obj.item(0).radius * 2,
            height: obj.item(0).radius * 2,
            originX: 'center',
            originY: 'center',
          });
        } else if (obj.item(0).type === 'triangle') {
          obj.item(0).set({
            width: textWidth + 60,
            height: textWidth + 60,
            originX: 'center',
            originY: 'center',
          });
          obj.set({
            width: obj.item(0).width,
            height: obj.item(0).height,
            originX: 'center',
            originY: 'center',
          });
        }
        windowCanvas.renderAll();
      });
    }
  });
  obj.on('moving', function (e) {
    obj.item(1).exitEditing();
  });
}

function handleObjectBox(obj) {
  obj.on('mousedown', function (e) {
    var oldTextLength = obj.item(1).text.length;
    if (!isDoQuiz && isSelectAnswer) {
      obj.item(1).enterEditing();
      obj.item(1).on('changed', (e) => {
        console.log('changed', e);
        //const newText = obj.item(1).text.slice(-1).toUpperCase(); // Keep the last entered character and convert to uppercase
        // const newText = obj.item(1).text.toUpperCase(); // Keep the last entered character and convert to uppercase
        const textWidth = obj.item(1).width * obj.item(1).scaleX;
        const textHeight = obj.item(1).height * obj.item(1).scaleY;
        //object type is rect
        if (obj.item(0).type === 'rect') {
          obj.item(0).set({
            width: textWidth + 30,
            height: textHeight + 30,
            originX: 'center',
            originY: 'center',
          });
          obj.set({
            width: obj.item(0).width,
            height: obj.item(0).height,
            originX: 'center',
            originY: 'center',
          });
        }
        //object type is circle
        else if (obj.item(0).type === 'circle') {
          if (textWidth > obj.item(0).radius * 2 - 10 || textHeight > obj.item(0).radius * 2 - 10) {
            const diameter = textWidth + 20;
            obj.item(0).set({
              radius: diameter / 2,
              originX: 'center',
              originY: 'center',
            });
            obj.set({
              width: obj.item(0).radius * 2,
              height: obj.item(0).radius * 2,
              originX: 'center',
              originY: 'center',
            });
          }
        }
        else if (obj.item(0).type === 'triangle') {
          obj.item(0).set({
            width: textWidth + 30,
            height: textWidth + 30,
            originX: 'center',
            originY: 'center',
          });
          obj.set({
            width: obj.item(0).width,
            height: obj.item(0).height,
            originX: 'center',
            originY: 'center',
          });
        }
        else if (obj.item(0).type === 'polygon') {
          var textLength = obj.item(1).text.length;
          var polyWidth = obj.item(0).width;
          var polyHeight = obj.item(0).height;
          let scaleNumber;
          if (textLength < 5) {
            scaleNumber = 0.02;
          }
          else if (textLength < 10) {
            scaleNumber = 0.03;
          }
          else if (textLength < 15) {
            scaleNumber = 0.04;
          }
          // else if (textLength < 20) {
          //   scaleNumber = 0.3
          // }
          // else if (textLength < 25) {
          //   scaleNumber = 0.4
          // }
          // else if (textLength < 30) {
          //   scaleNumber = 0.5
          // }
          else {
            scaleNumber = 0.05;
          }
          // if (obj.item(1).width + 20 > obj.width || obj.item(1).height + 20 > obj.height) {
          var oldWidth = obj.item(0).width;
          var oldHeight = obj.item(0).height;
          // Adjusting the scale of obj.item(0)
          obj.item(0).set({
            scaleX: 1 + 0.35 + textLength * scaleNumber,
            scaleY: 1 + 0.35 + textLength * scaleNumber,
          });
          // Calculating absolute width and height changes
          var absWidth = obj.item(0).width * obj.item(0).scaleX - oldWidth;
          var absHeight = obj.item(0).height * obj.item(0).scaleY - oldHeight;
          // Updating the coordinates of the object
          obj.setCoords();
          obj.set({
            width: 216 + absWidth,
            height: 216 + absHeight,
          });;
        }
        windowCanvas.renderAll();
      });
    }
  });
  obj.on('moving', function (e) {
    obj.item(1).exitEditing();
  });
}

function handlePort(obj) {
  obj.on('mousedown', function (e) {
    console.log('mousedown port');
    obj.set({
      fill: 'green',
    });
    if (!isSelectPort) {
      isSelectPort = true;
      selectedPort = obj;
    }
    else {
      //check if selectedPort in any object in canvas
      var shape1;
      var shape2;
      var vesselPortIndex;
      var answerPortIndex;
      const allObjects = windowCanvas.getObjects();
      for (let i = 0; i < allObjects.length; i++) {
        const object = allObjects[i];
        if (object.ports) {
          if (object.ports.includes(selectedPort)) {
            shape1 = object;
          }
        }
      }
      for (let i = 0; i < allObjects.length; i++) {
        const object = allObjects[i];
        if (object.ports) {
          if (object.ports.includes(obj)) {
            shape2 = object;
          }
        }
      }
      console.log('shape1', shape1);
      console.log('shape2', shape2);
      var vesselID;
      var answerID;
      ConnectPorts(shape1, shape2, selectedPort, obj);
      if (shape1.name && shape1.name === 'quiz-matchObj-vessel') {
        vesselID = shape1.objectID;
        answerID = shape2.objectID;
        vesselPortIndex = selectedPort.name.split('-')[2];
        answerPortIndex = obj.name.split('-')[2];
      }
      else if (shape1.name && shape1.name === 'quiz-matchObj-answer') {
        vesselID = shape2.objectID;
        answerID = shape1.objectID;
        vesselPortIndex = obj.name.split('-')[2];
        answerPortIndex = selectedPort.name.split('-')[2];
      }
      correctAnswers.push({
        answerID,
        vesselID,
        // vesselPort: obj.name.split('-')[2],
        // answerPort: obj.name.split('-')[2],
        vesselPort: vesselPortIndex,
        answerPort: answerPortIndex,
      });
      console.log('correctAnswers', correctAnswers);
      isSelectPort = false;
      selectedPort = null;
    }
  });
}

function handleSelectObject(obj) {
  obj.on('mousedown', function (e) {
    //if not i doQuiz mode
    if (!isDoQuiz) {
      console.log('mousedown');
      console.log('obj', obj);
      if (isSelectAnswer) {
        playAudio('selectObject');
        if (obj.item(0).fill !== 'yellow') {
          obj.item(0).set({
            fill: 'yellow',
          });
          correctAnswers.push(obj.objectID);
        }
        else if (obj.item(0).fill === 'yellow') {
          obj.item(0).set({
            fill: 'white',
          });
          correctAnswers = correctAnswers.filter((item) => item != obj.objectID);
        }
        console.log('correctAnswers', correctAnswers);
      }
    }
    else {
      if (obj.item(0).fill !== 'yellow') {
        playAudio('selectObject');
        obj.item(0).set({
          fill: 'yellow',
        });
        selectedAnswers.push(obj);
      }
      else if (obj.item(0).fill === 'yellow') {
        obj.item(0).set({
          fill: 'white',
        });
        selectedAnswers = selectedAnswers.filter((item) => item.objectID != obj.objectID);
      }
      console.log('selectedAnswers', selectedAnswers);
    }
  });
}

function handleInputObject(obj) {

  //
  obj.on('mousedown', function (e) {
    if (isDoQuiz || isSelectAnswer) {

      playAudio('inputObject');
      console.log('handleInputObject', isDoQuiz);

      obj.item(1).enterEditing();
      obj.item(1).on('changed', (e) => {
        console.log('changed', e);
        //const newText = obj.item(1).text.slice(-1).toUpperCase(); // Keep the last entered character and convert to uppercase
        const newText = obj.item(1).text.toUpperCase(); // Keep the last entered character and convert to uppercase

        const textWidth = obj.item(1).width * obj.item(1).scaleX;
        const textHeight = obj.item(1).height * obj.item(1).scaleY;

        if (textWidth + 20 > 40) {
          obj.item(0).set({
            width: textWidth + 20,
            //height: textHeight + 40,
            originX: 'center',
            originY: 'center',
          });
          obj.item(1).set({
            originX: 'center',
            originY: 'center',
          });
          obj.set({
            width: obj.item(0).width,
            originX: 'center',
            originY: 'center',
          });
        }

        // Set the text to the last entered character
        obj.item(1).set({
          text: newText,
        });
        windowCanvas.renderAll();

        if (!isDoQuiz) {
          console.log('mousedown', obj.objectID);
          correctAnswers.find((x) => x.objectID === obj.objectID).answer =
            obj.item(1).text;
          console.log('correctAnswers', correctAnswers);
        } else {
          console.log('mousedown x');
          // Check if obj exists in selectedAnswers
          const existingObj = selectedAnswers.find(
            (x) => x.objectID === obj.objectID
          );

          if (!existingObj) {
            // If obj doesn't exist in selectedAnswers, add it
            selectedAnswers.push(obj);
            console.log('selectedAnswers', selectedAnswers);
          }

          console.log('selectedAnswers', selectedAnswers);
          console.log('correctAnswers', correctAnswers);
        }

      });
    }
  });
  obj.on('moving', function (e) {
    obj.item(1).exitEditing();
    obj.snap = true;
    if (obj.snap) {
      console.log('snap');
      // objectSnapCanvas(obj);
      objectSnapAdjacent(obj);
    }
  });
}

function handleMatchObject(obj) {
  obj.on('mousedown', function (e) {
    playAudio('matchObject');
    if (!currentLine && !isDoQuiz) {
      if (
        obj.name === 'quiz-matchObj-vessel' ||
        obj.name === 'quiz-matchObj-answer'
      ) {
        console.log('handleMatchObject', isAddConnection);
        if (isAddConnection) {
          console.log('mousedown connection');
          if (currentLine) {
            if (
              currentLine.vesselID !== obj.objectID &&
              currentLine.answerID !== obj.objectID
            ) {
              currentLine.set({
                x2: obj.left,
                y2: obj.top,
              });
              windowCanvas.remove(currentLine);
              return;
            }
            else {
              currentLine = null;
              windowCanvas.remove(currentLine);
              return;
            }
          }
          else {
            const canvas = windowCanvas;
            var objCenter = obj.getCenterPoint();
            currentLine = new fabric.Line(
              [objCenter.x, objCenter.y, objCenter.x, objCenter.y],
              {
                fill: 'red',
                stroke: 'red',
                strokeWidth: 2,
                //dont select new line
                selectable: false,
              }
            );
            if (obj.name === 'quiz-matchObj-vessel') {
              currentLine.set({
                vesselObj: obj,
              });
            }
            else if (obj.name === 'quiz-matchObj-answer') {
              currentLine.set({
                answerObj: obj,
              });
            }
            console.log('currentLine', currentLine);
            canvas.add(currentLine); // Add the line object to the canvas
            return;
          }
        }
      }
    } else {
      if (
        obj.name === 'quiz-matchObj-vessel' ||
        obj.name === 'quiz-matchObj-answer'
      ) {
        console.log('mouseup connection');
        if (currentLine) {
          var objCenter = obj.getCenterPoint();
          if (obj.name === 'quiz-matchObj-vessel') {
            if (!currentLine.vesselObj) {
              currentLine.set({
                x2: objCenter.x,
                y2: objCenter.y,
                vesselObj: obj,
              });
            } else {
              windowCanvas.remove(currentLine);
              currentLine = null;
              return;
            }
          }
          else if (obj.name === 'quiz-matchObj-answer') {
            if (!currentLine.answerObj) {
              currentLine.set({
                x2: objCenter.x,
                y2: objCenter.y,
                answerObj: obj,
              });
            } else {
              windowCanvas.remove(currentLine);
              currentLine = null;
              return;
            }
          }
          windowCanvas.remove(currentLine);
          console.log('currentLine', currentLine);
          connectTwoObjects(currentLine.vesselObj, currentLine.answerObj);
          correctAnswers.push({
            vesselID: currentLine.vesselObj.objectID,
            answerID: currentLine.answerObj.objectID,
          });
          currentLine = null;
        }
        // else {
        //   const canvas = windowCanvas;
        //   var objCenter = obj.getCenterPoint();
        //   currentLine = new fabric.Line([objCenter.x, objCenter.y, objCenter.x, objCenter.y], {
        //     fill: 'red',
        //     stroke: 'red',
        //     strokeWidth: 2,
        //     //dont select new line
        //     selectable: false
        //   });
        //   canvas.add(currentLine); // Add the line object to the canvas
        //   return;
        // }
        windowCanvas.renderAll();
      }
    }
  });
  obj.on('moving', function (e) {
    if (obj.name === 'quiz-matchObj-answer') {
      console.log('moving answer', correctAnswers);
      // Get vesselID of answerID in correctAnswers
      const vesselID = correctAnswers.find(
        (x) => x.answerID === obj.objectID
      )?.vesselID;
      console.log('vesselID', vesselID);
      // Get vesselObj of vesselID
      const vesselObj = windowCanvas
        .getObjects()
        .find((x) => x.objectID === vesselID);
      if (vesselObj) {
        // Set perPixelTargetFind to true for accurate intersection check
        // obj.set('perPixelTargetFind', true);
        const isOverlapping = obj.intersectsWithObject(vesselObj);
        obj.setCoords();
        // obj.set({
        //   fill: isOverlapping ? 'green' : 'red',
        // perPixelTargetFind: false, // Reset to false after the check
        // });
        if (isOverlapping) {
          if (
            !selectedAnswers.some(
              (item) =>
                item.vesselID === vesselID && item.answerID === obj.objectID
            )
          ) {
            selectedAnswers.push({
              vesselID,
              answerID: obj.objectID,
            });
          }
        } else {
          selectedAnswers = selectedAnswers.filter(
            (item) =>
              item.vesselID !== vesselID && item.answerID !== obj.objectID
          );
        }
        console.log('isOverlapping', isOverlapping);
        //windowCanvas.bringToFront(obj);
      }
    }
  });
}

function connectTwoObjects(obj1, obj2) {
  const canvas = windowCanvas;
  var objCenter1 = obj1.getCenterPoint();
  var objCenter2 = obj2.getCenterPoint();
  var line = new fabric.Line(
    [objCenter1.x, objCenter1.y, objCenter2.x, objCenter2.y],
    {
      name: 'quiz-matchObj-line',
      fill: 'blue',
      stroke: 'blue',
      strokeWidth: 2,
      selectable: false,
      evented: false,
      hasControls: false,
      lockMovementX: true, // Disable horizontal movement
      lockMovementY: true, // Disable vertical movement
    }
  );
  //line di chuyen khi object di chuyen
  obj1.on('moving', function () {
    var objCenter1 = obj1.getCenterPoint();
    line.set({
      x1: objCenter1.x,
      y1: objCenter1.y,
    });
    windowCanvas.renderAll();
  });
  obj2.on('moving', function () {
    var objCenter2 = obj2.getCenterPoint();
    line.set({
      x2: objCenter2.x,
      y2: objCenter2.y,
    });
    windowCanvas.renderAll();
  });
  canvas.add(line); // Add the line object to the canvas
  windowCanvas.renderAll();
}

function copyObjectQuiz() {
  const activeObject = windowCanvas.getActiveObject();
  if (!activeObject) {
    return;
  }
  // Sử dụng toObject để chuyển đối tượng thành một đối tượng JSON
  activeObject.clone((cloned: any) => {
    // Gán đối tượng đã sao chép cho biến global
    copiedObject = cloned;
    //console.log('Copied Object:', cloned);
  }, customAttributes);

  // Log thông tin đối tượng đã được sao chép
  console.log('Copied Object:', copiedObject);
}

function pasteObjectQuiz(audioRecorder: AudioRecorderService, translate: TranslateService) {
  console.log('pasteObjectQuiz');
  if (copiedObject) {
    // Ensure that copiedObject is a valid object
    console.log('Copied Object Before Enliven:', copiedObject);
    copiedObject.clone((clonedObj) => {
      console.log('Copied Object After Enliven:', clonedObj);
      windowCanvas.discardActiveObject();
      clonedObj.set({
        name: copiedObject.name,
        objectID: randomID(),
        left: clonedObj.left + 10,
        top: clonedObj.top + 10,
        evented: true,
      });
      // if (clonedObj.name === 'quiz-selectObj' || clonedObj.name === 'quiz-inputObj' || clonedObj.name === 'quiz-matchObj-vessel') {
      //   clonedObj.set({
      //     name: clonedObj.name,
      //     objectID: randomID(),
      //   });
      // }
      if (clonedObj.name === 'quiz-inputObj') {
        correctAnswers.push({
          objectID: clonedObj.objectID,
          answer: clonedObj.item(1).text,
        });
      }
      startActiveObjectQuiz(clonedObj, audioRecorder, translate);
      windowCanvas.add(clonedObj);
      windowCanvas.renderAll();
    });
  }
}

export interface FileJson {
  fileName: string;
  url: string;
}

// Don't allow objects off the canvas
function objectSnapCanvas(obj) {
  if (obj.snap) {
    obj.setCoords();

    const width = obj.width * obj.scaleX;
    const height = obj.height * obj.scaleY;

    if (obj.left < snap) {
      obj.left = 0;
    }

    if (obj.top < snap) {
      obj.top = 0;
    }

    if (width + obj.left > windowCanvas.width - snap) {
      obj.left = windowCanvas.width - width;
    }

    if (height + obj.top > windowCanvas.height - snap) {
      obj.top = windowCanvas.height - height;
    }

    windowCanvas.requestRenderAll();
  }
}

function objectSnapAdjacent(object) {
  // Sets corner position coordinates based on current angle, width and height
  object.setCoords();
  // Loop through objects
  windowCanvas.forEachObject(function (obj) {
    if (obj === object || obj.name != 'quiz-inputObj') { return; }

    // If objects intersect
    if (
      object.isContainedWithinObject(obj) ||
      object.intersectsWithObject(obj) ||
      obj.isContainedWithinObject(object)
    ) {
      console.log('check snap');

      var distX =
        (obj.left + obj.width) / 2 - (object.left + object.width) / 2;
      var distY =
        (obj.top + obj.height) / 2 - (object.top + object.height) / 2;

      // Set new position
      findNewPos(distX, distY, object, obj);
    }

    // Snap objects to each other horizontally

    // If bottom points are on same Y axis
    if (
      Math.abs(object.top + object.height - (obj.top + obj.height)) < snap
    ) {
      // Snap target BL to object BR
      if (Math.abs(object.left - (obj.left + obj.width)) < snap) {
        object.left = obj.left + obj.width;
        object.top = obj.top + obj.height - object.height;
      }

      // Snap target BR to object BL
      if (Math.abs(object.left + object.width - obj.left) < snap) {
        object.left = obj.left - object.width;
        object.top = obj.top + obj.height - object.height;
      }
    }

    // If top points are on same Y axis
    if (Math.abs(object.top - obj.top) < snap) {
      // Snap target TL to object TR
      if (Math.abs(object.left - (obj.left + obj.width)) < snap) {
        object.left = obj.left + obj.width;
        object.top = obj.top;
      }

      // Snap target TR to object TL
      if (Math.abs(object.left + object.width - obj.left) < snap) {
        object.left = obj.left - object.width;
        object.top = obj.top;
      }
    }

    // Snap objects to each other vertically

    // If right points are on same X axis
    if (
      Math.abs(object.left + object.width - (obj.left + obj.width)) < snap
    ) {
      // Snap target TR to object BR
      if (Math.abs(object.top - (obj.top + obj.height)) < snap) {
        object.left = obj.left + obj.width - object.width;
        object.top = obj.top + obj.height;
      }

      // Snap target BR to object TR
      if (Math.abs(object.top + object.height - obj.top) < snap) {
        object.left = obj.left + obj.width - object.width;
        object.top = obj.top - object.height;
      }
    }

    // If left points are on same X axis
    if (Math.abs(object.left - obj.left) < snap) {
      // Snap target TL to object BL
      if (Math.abs(object.top - (obj.top + obj.height)) < snap) {
        object.left = obj.left;
        object.top = obj.top + obj.height;
      }

      // Snap target BL to object TL
      if (Math.abs(object.top + object.height - obj.top) < snap) {
        object.left = obj.left;
        object.top = obj.top - object.height;
      }
    }
  });

  object.setCoords();

  // If objects still overlap

  var outerAreaLeft = null;
  var outerAreaTop = null;
  var outerAreaRight = null;
  var outerAreaBottom = null;

  windowCanvas.forEachObject(function (obj) {
    if (obj === object || obj.name != 'quiz-inputObj') { return; }

    if (
      object.isContainedWithinObject(obj) ||
      object.intersectsWithObject(obj) ||
      obj.isContainedWithinObject(object)
    ) {
      var intersectLeft = null;
      var intersectTop = null;
      var intersectWidth = null;
      var intersectHeight = null;
      var intersectSize = null;
      var targetLeft = object.left;
      var targetRight = targetLeft + object.width;
      var targetTop = object.top;
      var targetBottom = targetTop + object.height;
      var objectLeft = obj.left;
      var objectRight = objectLeft + obj.width;
      var objectTop = obj.top;
      var objectBottom = objectTop + obj.height;

      // Find intersect information for X axis
      if (targetLeft >= objectLeft && targetLeft <= objectRight) {
        intersectLeft = targetLeft;
        intersectWidth = obj.width - (intersectLeft - objectLeft);
      } else if (objectLeft >= targetLeft && objectLeft <= targetRight) {
        intersectLeft = objectLeft;
        intersectWidth = object.width - (intersectLeft - targetLeft);
      }

      // Find intersect information for Y axis
      if (targetTop >= objectTop && targetTop <= objectBottom) {
        intersectTop = targetTop;
        intersectHeight = obj.height - (intersectTop - objectTop);
      } else if (objectTop >= targetTop && objectTop <= targetBottom) {
        intersectTop = objectTop;
        intersectHeight = object.height - (intersectTop - targetTop);
      }

      // Find intersect size (this will be 0 if objects are touching but not overlapping)
      if (intersectWidth > 0 && intersectHeight > 0) {
        intersectSize = intersectWidth * intersectHeight;
      }

      // Set outer snapping area
      if (obj.left < outerAreaLeft || outerAreaLeft == null) {
        outerAreaLeft = obj.left;
      }

      if (obj.top < outerAreaTop || outerAreaTop == null) {
        outerAreaTop = obj.top;
      }

      if (obj.left + obj.width > outerAreaRight || outerAreaRight == null) {
        outerAreaRight = obj.left + obj.width;
      }

      if (
        obj.top + obj.height > outerAreaBottom ||
        outerAreaBottom == null
      ) {
        outerAreaBottom = obj.top + obj.height;
      }

      // If objects are intersecting, reposition outside all shapes which touch
      if (intersectSize) {
        var distX = outerAreaRight / 2 - (object.left + object.width) / 2;
        var distY = outerAreaBottom / 2 - (object.top + object.height) / 2;

        // Set new position
        findNewPos(distX, distY, object, obj);
      }
    }
  });
}

// find new position for snap adjacent if obj is overlap
function findNewPos(distX, distY, target, obj) {

  if (Math.abs(distX) > Math.abs(distY)) {
    if (distX > 0) {
      target.left = obj.left - target.width;
    } else {
      target.left = obj.left + obj.width;
    }
  } else {
    if (distY > 0) {
      target.top = obj.top - target.height;
    } else {
      target.top = obj.top + obj.height;
    }
  }
}
function updatePortPositions(shape) {
  console.log('updatePortPositions');
  var shapeBound = shape.getBoundingRect();
  // Extract relevant properties of the shape
  var newLeft = shape.left;
  var newTop = shape.top;
  var newWidth = shape.width * shape.scaleX;
  var newHeight = shape.height * shape.scaleY;

  // Calculate midpoints for the top, bottom, left, and right edges
  var topMidpoint = findMidpoint({
    x1: newLeft,
    y1: newTop,
    x2: newLeft + newWidth,
    y2: newTop,
  });
  var bottomMidpoint = findMidpoint({
    x1: newLeft,
    y1: newTop + newHeight,
    x2: newLeft + newWidth,
    y2: newTop + newHeight,
  });
  var leftMidpoint = findMidpoint({
    x1: newLeft,
    y1: newTop,
    x2: newLeft,
    y2: newTop + newHeight,
  });
  var rightMidpoint = findMidpoint({
    x1: newLeft + newWidth,
    y1: newTop,
    x2: newLeft + newWidth,
    y2: newTop + newHeight,
  });

  // Update the positions of the ports based on the calculated midpoints
  shape.ports[0].set({
    left: topMidpoint.x - newWidth / 2,
    top: topMidpoint.y - newHeight / 2,
  });
  shape.ports[1].set({
    left: bottomMidpoint.x - newWidth / 2,
    top: bottomMidpoint.y - newHeight / 2,
  });
  shape.ports[2].set({
    left: leftMidpoint.x - newWidth / 2,
    top: leftMidpoint.y - newHeight / 2,
  });
  shape.ports[3].set({
    left: rightMidpoint.x - newWidth / 2,
    top: rightMidpoint.y - newHeight / 2,
  });
}

function findMidpoint(edge) {
  // Calculate the midpoint of a given edge
  return {
    x: (edge.x1 + edge.x2) / 2,
    y: (edge.y1 + edge.y2) / 2,
  };
}

function updatePortPositions1(shape) {
  //shape.setCoords();
  var shapeBound = shape.getBoundingRect();
  // Extract relevant properties of the shape
  var newLeft = shape.left;
  var newTop = shape.top;
  var newWidth = shape.width * shape.scaleX;
  var newHeight = shape.height * shape.scaleY;
  // var newWidth = 0;
  // var newHeight = 0;

  // Calculate midpoints for the top, bottom, left, and right edges
  var topMidpoint = findMidpoint({
    x1: newLeft,
    y1: newTop,
    x2: newLeft + newWidth,
    y2: newTop,
  });
  var bottomMidpoint = findMidpoint({
    x1: newLeft,
    y1: newTop + newHeight,
    x2: newLeft + newWidth,
    y2: newTop + newHeight,
  });
  var leftMidpoint = findMidpoint({
    x1: newLeft,
    y1: newTop,
    x2: newLeft,
    y2: newTop + newHeight,
  });
  var rightMidpoint = findMidpoint({
    x1: newLeft + newWidth,
    y1: newTop,
    x2: newLeft + newWidth,
    y2: newTop + newHeight,
  });

  // Update the positions of the ports based on the calculated midpoints
  shape.ports[0].set({
    left: topMidpoint.x - newWidth / 2,
    top: topMidpoint.y - newHeight / 2,
  });
  shape.ports[1].set({
    left: bottomMidpoint.x - newWidth / 2,
    top: bottomMidpoint.y - newHeight / 2,
  });
  shape.ports[2].set({
    left: leftMidpoint.x - newWidth / 2,
    top: leftMidpoint.y - newHeight / 2,
  });
  shape.ports[3].set({
    left: rightMidpoint.x - newWidth / 2,
    top: rightMidpoint.y - newHeight / 2,
  });
}

function ConnectPorts(shape1, shape2, port1, port2) {
  console.log('ConnectPorts', port1, port2);
  var line = drawLineBezier(shape1, shape2, port1, port2);
  shape1.on('moving', function () {
    //updateLine(line, port1, '1');
    updateLineBezier(line, port1, port2);
    console.log('moving');
  });
  shape2.on('moving', function () {
    //updateLine(line, port2, '2');
    //checkifCrossShapes(line, shape1, shape2);
    updateLineBezier(line, port1, port2);
  });
  shape1.on('scaling', function () {
    //updateLine(line, port1, '1');
    updateLineBezier(line, port1, port2);
  });
  shape2.on('scaling', function () {
    //updateLine(line, port2, '2');
    updateLineBezier(line, port1, port2);
  });

  shape1.removeConnection = () => {
    windowCanvas.remove((line as any).controllers[0]);
    windowCanvas.remove((line as any).controllers[1]);
    windowCanvas.remove(line);
    port1.set({
      fill: 'white',
    });
    port2.set({
      fill: 'white',
    });
    console.log('shape1', shape1.objectID);
    console.log('shape2', shape2.objectID);
    console.log('correctAnswers', correctAnswers);
    var find = correctAnswers.find(
      (item) =>
        (item.answerID === shape1.objectID &&
          item.vesselID === shape2.objectID) ||
        (item.answerID === shape2.objectID &&
          item.vesselID === shape1.objectID)
    );
    console.log('find', find);
    correctAnswers = correctAnswers.filter((item) => (item !== find));
    console.log('correctAnswers', correctAnswers);
  }

  shape2.removeConnection = () => {
    windowCanvas.remove((line as any).controllers[0]);
    windowCanvas.remove((line as any).controllers[1]);
    windowCanvas.remove(line);
    port1.set({
      fill: 'white',
    });
    port2.set({
      fill: 'white',
    });
    console.log('shape1', shape1.objectID);
    console.log('shape2', shape2.objectID);
    console.log('correctAnswers', correctAnswers);
    //find item in correctAnswers
    var find = correctAnswers.find(
      (item) =>
        (item.answerID === shape1.objectID &&
          item.vesselID === shape2.objectID) ||
        (item.answerID === shape2.objectID &&
          item.vesselID === shape1.objectID)
    );
    console.log('find', find);
    //remove find in correctAnswers
    correctAnswers = correctAnswers.filter((item) => item !== find);
    console.log('correctAnswers', correctAnswers);
  }

  // remove line when click  on 2 shape when removeline button down
  shape1.on('mousedown', function () {
    if (isRemoveConnection) {
      shape2.on('mousedown', () => shape2.removeConnection());
    }
    isRemoveConnection = false;
  });
  shape2.on('mousedown', function () {
    if (isRemoveConnection) {
      shape1.on('mousedown', () => shape1.removeConnection());
      isRemoveConnection = false;
    }
  });
  return line;
}

function ConnectPorts1(shape1, shape2, port1, port2, controllers) {
  console.log('ConnectPorts', port1, port2);
  var line = drawLineBezier1(shape1, shape2, port1, port2, controllers);
  shape1.on('moving', function () {
    //updateLine(line, port1, '1');
    updateLineBezier(line, port1, port2);
    console.log('moving');
  });
  shape2.on('moving', function () {
    //updateLine(line, port2, '2');
    //checkifCrossShapes(line, shape1, shape2);
    updateLineBezier(line, port1, port2);
  });
  shape1.on('scaling', function () {
    //updateLine(line, port1, '1');
    updateLineBezier(line, port1, port2);
  });
  shape2.on('scaling', function () {
    //updateLine(line, port2, '2');
    updateLineBezier(line, port1, port2);
  });
  return line;
}

function updateLineConnections(line, port1, port2) {
  // Update the line's connection points
  line.set({
    x1: port1.left,
    y1: port1.top,
    x2: port2.left,
    y2: port2.top
  });
  windowCanvas.renderAll();
}

function calculateMidpoint(point1, point2) {
  var x = (point1.x + point2.x) / 2;
  var y = (point1.y + point2.y) / 2;
  return { x, y };
}

// Calculate a point perpendicular to a line segment with a specified distance
function calculatePerpendicularPoint(point1, point2, distance) {
  // Step 1: Calculate the midpoint
  var midpoint = calculateMidpoint(point1, point2);

  // Step 2: Calculate the direction vector from point1 to point2
  var directionVector = {
    x: point2.x - point1.x,
    y: point2.y - point1.y,
  };

  // Step 3: Calculate a unit vector perpendicular to the direction vector
  var perpendicularVector = {
    x: -directionVector.y,
    y: directionVector.x,
  };

  // Calculate the length of the perpendicular vector
  var length = Math.sqrt(
    perpendicularVector.x * perpendicularVector.x +
    perpendicularVector.y * perpendicularVector.y
  );

  // Normalize the perpendicular vector to get a unit vector
  perpendicularVector.x /= length;
  perpendicularVector.y /= length;

  // Step 4: Scale the unit vector by the given distance
  var scaledVector = {
    x: perpendicularVector.x * distance,
    y: perpendicularVector.y * distance,
  };

  // Step 5: Add the scaled vector to the midpoint to get the final point
  var resultPoint = {
    x: midpoint.x + scaledVector.x,
    y: midpoint.y + scaledVector.y,
  };

  return resultPoint;
}

function drawLineBezier(shape1, shape2, object1, object2) {
  var point1 = object1.getCenterPoint();
  var point2 = object2.getCenterPoint();
  var midpoint = calculateMidpoint(point1, point2);
  var perpendicularPoint = calculatePerpendicularPoint(point1, point2, 0);

  var controller1Coords = calculatePerpendicularPoint(
    point1,
    perpendicularPoint,
    0
  );
  var controller2Coords = calculatePerpendicularPoint(
    point2,
    perpendicularPoint,
    0
  );
  var controllerName = `controller-${shape1.objectID}-${shape2.objectID}`;
  //var centerPoint = drawSmallCircle(perpendicularPoint.x, perpendicularPoint.y);
  var controller1 = drawSmallCircle(
    controller1Coords.x,
    controller1Coords.y,
    `${controllerName}-0`
  );
  var controller2 = drawSmallCircle(
    controller2Coords.x,
    controller2Coords.y,
    `${controllerName}-1`
  );
  //var centerPointcoords = getCenterPoint(centerPoint);
  //var quadraticCurve = new fabric.Path(`M ${point1.x} ${point1.y} L ${controller1Coords.x} ${controller1Coords.y} ${controller2Coords.x} ${controller2Coords.y} Q ${centerPointcoords.x} ${centerPointcoords.y} ${point2.x} ${point2.y}`, {
  var quadraticCurve = new fabric.Path(
    `M ${point1.x} ${point1.y} C  ${controller1Coords.x} ${controller1Coords.y} ${controller2Coords.x} ${controller2Coords.y} ${point2.x} ${point2.y}`,
    {
      fill: '',
      stroke: 'blue',
      strokeWidth: 2,
      objectCaching: false,
      selectable: false,
      lockScalingX: true, // Prevent horizontal scaling
      lockScalingY: true, // Prevent vertical scaling
      hasControls: false, // Hide selection controls
      hasBorders: false, // Hide selection borders
      lockMovementX: true, // Prevent horizontal movement
      lockMovementY: true, // Prevent vertical movement
      name: `connect-line-${shape1.objectID}-${shape2.objectID}`,
    }
  );
  var line = quadraticCurve;
  //centerPointSave = centerPoint
  //controller1Save = controller1;
  //controller2Save = controller2;
  (line as any).controllers = [controller1, controller2];

  var midX =
    (point1.x + 2 * controller1Coords.x + 2 * controller2Coords.x + point2.x) /
    6;
  var midY =
    (point1.y + 2 * controller1Coords.y + 2 * controller2Coords.y + point2.y) /
    6;
  //var textLine = addTextToLine('text', line, midX, midY);
  //canvas.add(textLine);

  windowCanvas.add(quadraticCurve);
  windowCanvas.sendToBack(quadraticCurve);
  //canvas.add(quadraticCurve);
  windowCanvas.add(controller1);
  windowCanvas.add(controller2);
  controller1.on('moving', function () {
    updateLineBezier(line, object1, object2);
  });
  controller2.on('moving', function () {
    updateLineBezier(line, object1, object2);
  });
  return line;
}
function drawLineBezier1(shape1, shape2, object1, object2, controllers) {
  var point1 = object1.getCenterPoint();
  var point2 = object2.getCenterPoint();
  var midpoint = calculateMidpoint(point1, point2);
  var perpendicularPoint = calculatePerpendicularPoint(point1, point2, 0);

  var controller1Coords = calculatePerpendicularPoint(
    point1,
    perpendicularPoint,
    0
  );
  var controller2Coords = calculatePerpendicularPoint(
    point2,
    perpendicularPoint,
    0
  );
  var controllerName = `controller-${shape1.objectID}-${shape2.objectID}`;
  //var centerPoint = drawSmallCircle(perpendicularPoint.x, perpendicularPoint.y);
  var controller1 = drawSmallCircle(
    controller1Coords.x,
    controller1Coords.y,
    `${controllerName}-0`
  );
  var controller2 = drawSmallCircle(
    controller2Coords.x,
    controller2Coords.y,
    `${controllerName}-1`
  );
  //var centerPointcoords = getCenterPoint(centerPoint);
  //var quadraticCurve = new fabric.Path(`M ${point1.x} ${point1.y} L ${controller1Coords.x} ${controller1Coords.y} ${controller2Coords.x} ${controller2Coords.y} Q ${centerPointcoords.x} ${centerPointcoords.y} ${point2.x} ${point2.y}`, {
  var quadraticCurve = new fabric.Path(
    `M ${point1.x} ${point1.y} C  ${controller1Coords.x} ${controller1Coords.y} ${controller2Coords.x} ${controller2Coords.y} ${point2.x} ${point2.y}`,
    {
      fill: '',
      stroke: 'blue',
      strokeWidth: 2,
      objectCaching: false,
      selectable: false,
      lockScalingX: true, // Prevent horizontal scaling
      lockScalingY: true, // Prevent vertical scaling
      hasControls: false, // Hide selection controls
      hasBorders: false, // Hide selection borders
      lockMovementX: true, // Prevent horizontal movement
      lockMovementY: true, // Prevent vertical movement
      name: `connect-line-${shape1.objectID}-${shape2.objectID}`,
    }
  );
  var line = quadraticCurve;
  //centerPointSave = centerPoint
  //controller1Save = controller1;
  //controller2Save = controller2;
  (line as any).controllers = controllers;

  var midX =
    (point1.x + 2 * controller1Coords.x + 2 * controller2Coords.x + point2.x) /
    6;
  var midY =
    (point1.y + 2 * controller1Coords.y + 2 * controller2Coords.y + point2.y) /
    6;
  //var textLine = addTextToLine('text', line, midX, midY);
  //canvas.add(textLine);

  windowCanvas.add(quadraticCurve);
  windowCanvas.sendToBack(quadraticCurve);
  //canvas.add(quadraticCurve);
  windowCanvas.add(controller1);
  windowCanvas.add(controller2);
  controller1.on('moving', function () {
    updateLineBezier(line, object1, object2);
  });
  controller2.on('moving', function () {
    updateLineBezier(line, object1, object2);
  });
  return line;
}
//bezier curve connect
function drawSmallCircle(left, top, controllerName) {
  var smallCircle = new fabric.Circle({
    radius: 5,
    fill: 'green',
    left: left - 5,
    top: top - 5,
    selectable: true,
    hoverCursor: 'move', // Change the cursor to the "move" cursor on hover
    lockScalingX: true,   // Prevent horizontal scaling
    lockScalingY: true,   // Prevent vertical scaling
    hasControls: false,  // Hide selection controls
    hasBorders: false,   // Hide selection borders
    name: `${controllerName}`
  });
  return smallCircle;
}


// Function to update the line based on circle movements
function updateLineBezier(line, object1, object2) {
  // line.setCoords();
  // object1.setCoords();
  // object1.setCoords();
  var controller1 = line.controllers[0];
  var controller2 = line.controllers[1];
  var point1 = object1.getCenterPoint();
  var point2 = object2.getCenterPoint();

  var controller1Coords = controller1.getCenterPoint();
  var controller2Coords = controller2.getCenterPoint();
  var p1 = ['M', point1.x, point1.y];
  var p2 = [
    'C',
    controller1Coords.x,
    controller1Coords.y,
    controller2Coords.x,
    controller2Coords.y,
    point2.x,
    point2.y,
  ];

  var midX =
    (point1.x + 2 * controller1Coords.x + 2 * controller2Coords.x + point2.x) /
    6;
  var midY =
    (point1.y + 2 * controller1Coords.y + 2 * controller2Coords.y + point2.y) /
    6;
  //line.text.set({ left: midX, top: midY });
  line.set({
    path: [p1, p2],
  });
  windowCanvas.renderAll();
}

function updateLineBezier1(line, object1, object2) {
  // line.setCoords();
  // object1.setCoords();
  // object1.setCoords();
  var controller1 = line.controllers[0];
  var controller2 = line.controllers[1];
  var point1 = object1.getCenterPoint();
  var point2 = object2.getCenterPoint();

  var controller1Coords = controller1.getCenterPoint();
  var controller2Coords = controller2.getCenterPoint();
  var p1 = ['M', point1.x, point1.y];
  var p2 = [
    'C',
    controller1Coords.x,
    controller1Coords.y,
    controller2Coords.x,
    controller2Coords.y,
    point2.x,
    point2.y,
  ];

  var midX =
    (point1.x + 2 * controller1Coords.x + 2 * controller2Coords.x + point2.x) /
    6;
  var midY =
    (point1.y + 2 * controller1Coords.y + 2 * controller2Coords.y + point2.y) /
    6;
  //line.text.set({ left: midX, top: midY });
  line.set({
    path: [p1, p2],
  });
  windowCanvas.renderAll();
}

export function getCurrentDeviceSize() {
  let width = window.innerWidth
    || document.documentElement.clientWidth
    || document.body.clientWidth;

  let height = window.innerHeight
    || document.documentElement.clientHeight
    || document.body.clientHeight;

  return { width, height };
}

function changeCoordinateConnectLine(obj) {
  function updateCoords() {
    const connectors = windowCanvas
      .getObjects()
      .filter(
        (value) =>
          value.name == 'lineConnect' &&
          (value.idObject1 === obj.objectID ||
            value.idObject2 === obj.objectID)
      );

    if (connectors) {
      for (let i = 0; i < connectors.length; i++) {
        if (connectors[i].idObject1 === obj.objectID) {
          obj.__corner = connectors[i].port1;
          const targetPort = findTargetPort(obj, 'mt');
          connectors[i].path[0][1] = targetPort.x1;
          connectors[i].path[0][2] = targetPort.y1;
          movelinename(
            windowCanvas,
            obj.objectID,
            targetPort.y1,
            targetPort.x1,
            connectors[i].port1
          );
        } else {
          obj.__corner = connectors[i].port2;
          const portCenterPoint = findTargetPort(obj, 'mt');
          connectors[i].path[1][3] = portCenterPoint.x2;
          connectors[i].path[1][4] = portCenterPoint.y2;
          movelinename(
            windowCanvas,
            obj.objectID,
            portCenterPoint.y2,
            portCenterPoint.x2,
            connectors[i].port2
          );
        }
      }
    }
  }
  obj.on('moving', updateCoords);
  obj.on('scaling', updateCoords);
  isChoosePort = false;
}

function findTargetPort(object, ports) {
  let points = new Array(4);
  let port;
  if (ports) {
    port = ports;
  } else {
    port = object.__corner;
  }
  switch (port) {
    case 'mt':
      points = [
        object.left + (object.width * object.scaleX) / 2,
        object.top,
        object.left + (object.width * object.scaleX) / 2,
        object.top,
      ];
      break;
    case 'mr':
      points = [
        object.left + object.width * object.scaleX,
        object.top + (object.height * object.scaleY) / 2,
        object.left + object.width * object.scaleX,
        object.top + (object.height * object.scaleY) / 2,
      ];
      break;
    case 'mb':
      points = [
        object.left + (object.width * object.scaleX) / 2,
        object.top + object.height * object.scaleY,
        object.left + (object.width * object.scaleX) / 2,
        object.top + object.height * object.scaleY,
      ];
      break;
    case 'ml':
      points = [
        object.left,
        object.top + (object.height * object.scaleY) / 2,
        object.left,
        object.top + (object.height * object.scaleY) / 2,
      ];
      break;

    default:
      break;
  }

  return {
    x1: points[0],
    y1: points[1],
    x2: points[2],
    y2: points[3],
  };
}

function makeLine(
  canvas,
  point,
  idObject1,
  idObject2,
  corner1,
  corner2,
  objectID,
  text
) {
  var line = new fabric.Path('M 65 0 Q 100 100 200 0', {
    //  M 65 0 L 73 6 M 65 0 L 62 6 z
    fill: '',
    stroke: '#000',
    // objectCaching: false,
    originX: 'center',
    originY: 'center',
    name: 'lineConnect',
    idObject1: idObject1,
    idObject2: idObject2,
    port1: corner1,
    port2: corner2,
    objectID,
  });

  if (line.path) {
    (line.path[0] as any)[1] = point.x1;
    (line.path[0] as any)[2] = point.y1;

    (line.path[1] as any)[1] = point.x1 + 100;
    (line.path[1] as any)[2] = point.y1 + 100;

    (line.path[1] as any)[3] = point.x2;
    (line.path[1] as any)[4] = point.y2;
  }

  canvas.add(line);

  var p1 = makeCurvePoint(
    canvas,
    objectID,
    point.x1 + 100,
    point.y1 + 100,
    line
  );
  canvas.add(p1);

  return line;
}

function removeLine(object1: any, object2: any) {
  var allLine = windowCanvas
    .getObjects()
    .filter((value: any) => value.name == 'lineConnect');
  var curvePoint = windowCanvas
    .getObjects()
    .filter((value: any) => value.name == 'curve-point');

  if (allLine) {
    for (let i = 0; i < allLine.length; i++) {
      if (
        (allLine[i].idObject1 === object1.objectID &&
          allLine[i].idObject2 === object2.objectID) ||
        (allLine[i].idObject1 === object2.objectID &&
          allLine[i].idObject2 === object1.objectID)
      ) {
        windowCanvas.remove(allLine[i]);
        var lineId = allLine[i].objectID;
        for (let j = 0; j < curvePoint.length; j++) {
          if (curvePoint[j].lineID === lineId) {
            windowCanvas.remove(curvePoint[j]);
          }
        }
      }
    }
  }
  isChoosePortUnConnect = false;
}


function makeCurvePoint(canvas: any, objectID: any, left: any, top: any, line: any) {
  var c = new fabric.Circle({
    left,
    top,
    strokeWidth: 4,
    radius: 8,
    fill: '#fff',
    stroke: '#666',
    originX: 'center',
    originY: 'center',
    ...({ lineID: objectID } as any),
    name: 'curve-point',
  });

  c.hasBorders = c.hasControls = false;

  c.on('moving', function () {
    if (line && line.path) {
      (line.path[1] as any)[1] = c.left;
      (line.path[1] as any)[2] = c.top;
    }
  });

  return c;
}

function blink(obj) {
  if (obj.blink && obj.opacity == 1) {
    obj.animate('opacity', '0.3', {
      duration: 300,
      onChange: windowCanvas.renderAll.bind(windowCanvas),
      onComplete() {
        blink(obj);
      },
    });
  } else {
    obj.animate('opacity', '1', {
      duration: 300,
      onChange: windowCanvas.renderAll.bind(windowCanvas),
      onComplete() {
        blink(obj);
      },
    });
  }
}

function movelinename(canvas: any, objectID: any, top: any, left: any, corner: any) {
  canvas.getObjects().forEach((item: any) => {
    if (
      item.name == 'lineusername' &&
      item.lineID == objectID &&
      item.corner == corner
    ) {
      item.set({
        top,
        left,
      });
    }
  });
}

function downloadJsonOnBrowser(fileName: string, content: string) {
  let el = document.createElement('a');
  el.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
  el.setAttribute('download', fileName);
  el.click();
}

function setCursorToViewMode() {
  windowCanvas.hoverCursor = 'pointer';
}

function setCursorToEditMode() {
  windowCanvas.hoverCursor = 'move';
}

export function sleep(durationInMs: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, durationInMs);
  });
}

export const getIsDoQuiz = () => isDoQuiz;

// var results
// function startListening(inputElement) {
//   // let voiceHandler = this.hiddenSearchHandler?.nativeElement;
//   if ('webkitSpeechRecognition' in window) {
//     const vSearch = new webkitSpeechRecognition();
//     vSearch.continuous = false;
//     vSearch.interimresults = false;
//     vSearch.lang = 'en-US';
//     vSearch.start();
//     vSearch.onresult = (e) => {
//       console.log(e);
//       // voiceHandler.value = e?.results[0][0]?.transcript;
//       results = e.results[0][0].transcript;
//       inputElement.value = results;

//       // getResult();
//       // console.log(this.results);
//       vSearch.stop();
//     };
//   } else {
//     alert('Your browser does not support voice recognition!');
//   }
// }


