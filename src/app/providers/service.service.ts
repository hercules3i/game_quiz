// @ts-nocheck
/* eslint-disable no-bitwise */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-var */
import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpRequest } from '@angular/common/http';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { TranslateService } from '@ngx-translate/core';
import { ToastServiceService } from './toast-service.service';
import { NavigationExtras, Route, Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { Storage } from '@ionic/storage-angular';
import { Keyboard } from '@awesome-cordova-plugins/keyboard/ngx';
import { Observable, Subject, Subscription, lastValueFrom } from 'rxjs';
import * as moment from 'moment';
import { AnimationController, Platform } from '@ionic/angular';
import { IntentClipItem } from '@awesome-cordova-plugins/web-intent/ngx';
import { File, FileEntry } from '@awesome-cordova-plugins/file/ngx';
import { environment } from 'src/environments/environment';
import { Badge } from '@awesome-cordova-plugins/badge/ngx';
import { DocTrackingPage } from './file-support.service';
import { SocialInfo } from './social.service';

var SMS;

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  social: SocialInfo;
  idItem: number = undefined;
  checkTabMenu = true;
  showList = false;
  showModalMeeting = false;
  MenuApp: any;
  userName: string;
  checkModal: boolean;
  flagSet = 0;
  setTake: number;
  setApi: boolean;
  tokenDevice: string;
  displayName: any;
  Host: any = 'https://admin.metalearn.vn/'; //https://admin.metalearn.vn/
  host: any = 'https://quanghanh.s-work.vn/';
  isTutor888 = false;
  AppCode = 'METALEARN';
  isFacebookLogin = false;
  isGoogleLogin = false;
  isAppleLogin = false;
  id: any;
  email: any;
  phone: any;
  img: any;
  TypeStaff: any;
  Password: any;
  txtPinCode: string = null;
  checkpass: boolean;
  language = 'vi';
  Role: string;
  Gender: any;
  ShiftCode: any;
  listPage = [];
  width: number;
  height: number;
  allowCheck = false;
  isApp = true;
  mainFontsize = 17;
  menuFontsize = 17;
  headerFontsize = 17;
  messageFontsize = 17;
  controlFontsize = 13;
  bodyTextFontsize = 17;
  bodyLabelFontsize = 17;
  bodyControlFontsize = 17;
  bodyTreeviewFontsize = 17;
  articleViewFontsize = 17;
  mainFontColor = '#000';
  menuFontColor = '#000';
  headerFontColor = '#000';
  messageFontColor = '#000';
  controlFontColor = '#000';
  bodyTextFontColor = '#000';
  bodyLabelFontColor = '#000';
  bodyControlFontColor = '#000';
  bodyTreeviewFontColor = '#000';
  articleViewFontColor = '#000';
  menuFontFamily = '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Roboto, sans-serif';
  headerFontFamily = '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Roboto, sans-serif';
  messageFontFamily = '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Roboto, sans-serif';
  controlFontFamily = '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Roboto, sans-serif';
  bodyTextFontFamily = '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Roboto, sans-serif';
  bodyLabelFontFamily = '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Roboto, sans-serif';
  bodyControlFontFamily = '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Roboto, sans-serif';
  bodyTreeviewFontFamily = '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Roboto, sans-serif';
  articleViewFontFamily = '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Roboto, sans-serif';
  supportFontsize = 13;
  fontFamily = '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Roboto, sans-serif';
  /////
  menuLinks = [
    //   { component: '/dash-board', name: this.translate.instant('MAINPAGE.DASHBOARD'), uri: 'assets/icon/icon_dashBoard.png', id: 1 },
    //   { component: '/time-keeping', name: this.translate.instant('MAINPAGE.EXECUTIVEWORK'),
    //uri: 'assets/icon/icon_Trello_Menu.png', id: 2 },
    //   { component: '/conversation', name: this.translate.instant('MENU.ChatPage'), uri: 'assets/icon/icon_video.png', id: 2 },
    // ];
    {
      component: '/dash-board', name: this.translate.instant('MAINPAGE.DASHBOARD'),
      uri: 'assets/icon/icon_home.png', id: 1, iconFa: 'fa-solid fa-house-chimney color-orange', selected: false
    },
    {
      component: '/dash-board', name: this.translate.instant('MAINPAGE.EXECUTIVEWORK'),
      uri: 'assets/imgs/icon_menu.png', id: 2/* , iconFa: 'fa-solid fa-grip color-green' */, selected: true
    },
    {
      component: '/conversation', name: this.translate.instant('MENU.ChatPage'),
      uri: 'assets/icon/icon_CallVideo.png', id: 2, iconFa: 'fa-solid fa-comment-dots color-green', selected: false
    },
    {
      component: '/setting-menu', name: '',
      uri: 'assets/icon/icon_Trello.png', id: 2, iconFa: 'fa-solid fa-gear color-dark', selected: false
    },
    {
      component: '/setting-menu', name: '',
      uri: 'assets/icon/icon_Trello.png', id: 2, iconFa: 'fa-solid fa-gear color-dark', selected: false
    },
  ];
  NEWWORK = this.translate.instant('MAINPAGE.NEWWORK');
  THINGSTODO = this.translate.instant('MAINPAGE.THINGSTODO');
  NOTIFICATION = this.translate.instant('MAINPAGE.NOTIFICATION');
  LOCATION = this.translate.instant('MAINPAGE.LOCATION');
  LOADING = this.translate.instant('PoCustomerPage.PoCustomerPage_loadingText');
  BTN_SEARCH = this.translate.instant('BUTTON.BTN_SEARCH');
  BTN_SAVE = this.translate.instant('BUTTON.BTN_SAVE');
  BTN_DIRECT = this.translate.instant('BUTTON.BTN_DIRECT');
  BTN_ADD = this.translate.instant('BUTTON.BTN_ADD');
  BTN_EDIT = this.translate.instant('BUTTON.BTN_EDIT');
  BTN_GETLOCATION = this.translate.instant('BUTTON.BTN_GETLOCATION');
  BTN_DELETE = this.translate.instant('BUTTON.BTN_DELETE');
  CHECKIN = this.translate.instant('Servicetranslate.CHECKIN');
  ONLINE = this.translate.instant('Servicetranslate.ONLINE');
  uuid: any;
  listFileShare: IntentClipItem[] = [];
  CountCheckIn = '';
  CountOnline = '';
  CountUser = '';
  UserType: any;
  ////
  Lat: any = null;
  Log: any = null;
  LatNext: any = null;
  LogNext: any = null;
  stopIntervalGps = null;
  hasAllPermission = false;
  appComponent: AppComponent;
  roleCode: any;
  DepartmentId: any;
  CheckGPS = false;
  CheckCallVideo = false;
  CheckAds = false;
  checkStream = false;
  listFuncationAPI = [];
  BranchId: any;
  CheckInputKey = false;
  CheckLoading = false;
  countHREmployees = '';
  TimeOut = 180;
  myTimer: any;
  regex = /^[a-zA-Z0-9_äöüÄÖÜ]*$/;
  regexUserName = /^[a-zA-Z0-9_äöüÄÖÜ@.]*$/;
  regexNumberInteger = /^[1-9]\d*(\\d+)?$/;
  regexNumber = /^[+]?\d+(\,\d+)?$/;
  regexBigNumber = /^[+]?(\d|\,)+(\d+)?$/;
  regexEmailS1 = '^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)';
  regexEmailS2 = '|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])';
  regexEmailS3 = '|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$';
  regexEmail = new RegExp(this.regexEmailS1 + this.regexEmailS2 + this.regexEmailS3, 'i');
  regexCharS1 = '(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]';
  regexCharS2 = '|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]';
  regexCharS3 = '|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]';
  regexCharS4 = '|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6';
  regexCharS5 = '|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05';
  regexCharS6 = '|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]';
  regexCharS7 = '|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])';
  regexCharS = this.regexCharS1 + this.regexCharS2 + this.regexCharS3 +
    this.regexCharS4 + this.regexCharS5 + this.regexCharS6 + this.regexCharS7;
  //regexChar = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]
  //|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]
  //|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]
  //|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6
  //|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05
  //|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]
  //|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
  regexChar = new RegExp(this.regexCharS, 'g');
  AddressText = '';
  AddressGPS = '';
  CustomerCode = '';
  CustomerId = '';
  public ListLanguage = [
    {
      Code: 'en',
      lang: 'en-US',
      Valuse: 'English',
      DefaultPayment: true,
      src: 'assets/imgs/iconen.png'
    },
    {
      Code: 'vi',
      lang: 'vi-VN',
      Valuse: 'Tiếng Việt',
      DefaultPayment: true,
      src: 'assets/imgs/iconvi.png'
    },
    {
      Code: 'ja',
      lang: 'ja-JP',
      Valuse: 'Japan',
      DefaultPayment: true,
      src: 'assets/imgs/coNhat.png'
    },
    {
      Code: 'fr',
      lang: 'fr-FR',
      Valuse: 'France',
      DefaultPayment: true,
      src: 'assets/imgs/coPhap.png'
    },
    {
      Code: 'ko',
      lang: 'ko-KR',
      Valuse: 'Korean',
      DefaultPayment: true,
      src: 'assets/imgs/han.jpg'
    },
    {
      Code: 'zh',
      lang: 'zh-TW',//only IOS
      Valuse: 'China',
      DefaultPayment: true,
      src: 'assets/imgs/china.png'
    },
    {
      Code: 'ca',
      lang: 'en-US',// not support speech campuchia
      Valuse: 'Campuchia',
      DefaultPayment: true,
      src: 'assets/imgs/cambodia.png'
    },
    {
      Code: 'mm',
      lang: 'en-US',// not support speech myanma
      Valuse: 'Myanma',
      DefaultPayment: true,
      src: 'assets/imgs/myanmar.png'
    },
    {
      Code: 'la',
      lang: 'en-US',
      Valuse: 'Laos',// not support speech Laos
      DefaultPayment: true,
      src: 'assets/imgs/Laos.jpg'
    },
  ];
  listLanguageCms = [];
  cmsLanguageCode = 'CMS_LANGUAGE20211027001';
  Balance: number;
  version = '2.9.1';
  latestVersion = '1.0.0';
  latestVersionNum = '10000';
  checkStatusCheckOut = false;
  checkInOutEvent = new EventEmitter<any>();
  interstitial;
  listNotification: any[];
  countNotiTask = 5;
  countNotiTutor = 0;
  countNotiClass = 0;
  countNotiExam = 0;
  countNotiQuiz = 0;
  countNotiDocument = 0;
  countNotiCourse = 0;
  countNotiOffline = 0;
  countConnection = 0;
  allowNotiRedirect = true;
  channels = [];
  taskCode = '';
  fileCode = '';
  timeStart = '';
  globalCart: any[] = [];
  cart: any[] = [];
  foodTemp = '';
  foodTemp2: any[] = [];
  quizIndex = -1;
  quizLength = -1;
  listQuestion: any[] = [];
  selectedSchool = [];
  isBlogDeleted = false;
  isDataDriven = false;
  paymentObject = {
    itemCode: '',
    itemType: 'METALEARN_SERVICE',
    packageId: 'PACKAGE_BRONZE',
    price: 0,
    itemId: -1
  };
  contentQuizUpdate = '';
  listDetailQuiz = [];
  markLessonDirty = false;
  markBlogDirty = false;
  listWishListSubject = [];
  websyncServerAddress = 'http://103.249.158.69:8089/websync.ashx';
  private _storage: Storage | null = null;
  firstClick: boolean;
  isAppleAccount = true;

  storeSessionKey = '__service_session_metalearn___';
  toStoreProperties = [
    'idItem', 'checkTabMenu', 'showList', 'showModalMeeting',
    'MenuApp', 'userName', 'checkModal', 'flagSet',
    'setTake', 'setApi', 'tokenDevice', 'displayName',
    'id', 'Email',
    'phone', 'img', 'TypeStaff', 'Password',
    'txtPinCode', 'checkpass', 'language', 'Role',
    'Gender', 'ShiftCode', 'listPage', 'width',
    'height', 'allowCheck', 'isApp', 'uuid',
    'listFileShare', 'listNotification', 'CountCheckIn', 'CountOnline',
    'CountUser', 'UserType', 'Lat', 'Log',
    'LatNext', 'LogNext', 'stopIntervalGps',
    'roleCode', 'DepartmentId', 'listFuncationAPI', 'AddressText',
    'AddressGPS', 'CustomerCode', 'CustomerId', 'Balance',
  ];
  listModule = [];
  listPermission = [];
  apiToken = '';
  constructor(
    public http: HttpClient,
    public platform: Platform,
    public nativeStorage: NativeStorage,
    public toast: ToastServiceService,
    private translate: TranslateService,
    public router: Router,
    public file: File,
    private storage: Storage,
    private keyboard: Keyboard,
    private animationCtrl: AnimationController,
    private badge: Badge
  ) {
    this.loadServiceSession();
    this.init();
    this.translate.use('vi');
    this.get('language').then((val1) => {
      if (val1 == null) {
        this.language = 'vi';
      }
      else {
        this.language = val1.language;
      }
      this.changeLanguage();
    });
    this.subscribe('language', () => {
      this.changeLanguage();
    });
    this.version = environment.version;
  }

  storeServiceSession() {
    console.log('[storeServiceSession] init');

    for (const key of this.toStoreProperties) {
      sessionStorage.setItem(
        this.storeSessionKey + key,
        JSON.stringify(this[key as any])
      );

      console.log('[storeServiceSession] stored', key);
    }
  }

  loadServiceSession() {
    console.log('[loadServiceSession] init');

    for (const key of this.toStoreProperties) {
      const json = sessionStorage.getItem(this.storeSessionKey + key);
      if (!json) continue;

      try {
        const data = JSON.parse(json);
        this[key as any] = data;
        console.log('[loadServiceSession] loaded', key, data);
      } catch (e) { }
    }

    window.addEventListener('beforeunload', () => this.storeServiceSession());
  }

  async showInterstitialAds() {
    if (this.interstitial) {
      await this.interstitial.load();
      await this.interstitial.show();
    }
  }

  async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
    const storage = await this.storage.create();
    this._storage = storage;
  }

  // Create and expose methods that users of this service can
  // call, for example:
  public set(key: string, value: any) {
    return this._storage?.set(key, value);
  }
  public get(key: string) {
    return this.storage?.get(key);
  }
  clearTimeOut() {
    if (this.myTimer) {
      clearInterval(this.myTimer);
      this.myTimer = null;
    }
  }

  // Add cleanup method for iOS memory optimization
  cleanupForIOS() {
    if (this.platform.is('ios')) {
      // Clear timer
      this.clearTimeOut();

      // Clear any cached data that might cause memory issues
      this.listNotification = [];
      this.listQuestion = [];
      this.listDetailQuiz = [];
      this.globalCart = [];
      this.cart = [];
      this.foodTemp2 = [];
      this.selectedSchool = [];

      // Reset counters
      this.countNotiTask = 0;
      this.countNotiTutor = 0;
      this.countNotiClass = 0;
      this.countNotiExam = 0;
      this.countNotiQuiz = 0;
      this.countNotiDocument = 0;
      this.countNotiCourse = 0;
      this.countNotiOffline = 0;
      this.countConnection = 0;

      // Clear flags
      this.checkTabMenu = false;
      this.showList = false;
      this.showModalMeeting = false;
      this.checkModal = false;
      this.allowCheck = false;
      this.CheckLoading = false;
      this.CheckInputKey = false;
      this.checkStatusCheckOut = false;
      this.isBlogDeleted = false;
      this.markLessonDirty = false;
      this.markBlogDirty = false;

      console.log('Service cleanup completed for iOS');
    }
  }

  // Optimized SetTimeOut for iOS
  SetTimeOut() {
    // Clear any existing timer first to prevent memory leaks
    this.clearTimeOut();

    // For iOS, use a more conservative approach
    if (this.platform.is('ios')) {
      this.myTimer = setInterval(() => {
        this.TimeOut = this.TimeOut - 1;
        if (this.TimeOut === 0) {
          this.clearTimeOut();
          // Perform cleanup for iOS
          this.cleanupForIOS();
        }
      }, 1000);
    } else {
      this.myTimer = setInterval(() => {
        this.TimeOut = this.TimeOut - 1;
        if (this.TimeOut === 0) {
          this.clearTimeOut();
        }
      }, 1000);
    }
  }
  setDeviceSetting() {
    document.body.style.setProperty('--main-font-size', this.mainFontsize + 'px');
    document.body.style.setProperty('--menu-font-size', this.menuFontsize + 'px');
    document.body.style.setProperty('--header-font-size', this.headerFontsize + 'px');
    document.body.style.setProperty('--message-font-size', this.messageFontsize + 'px');
    document.body.style.setProperty('--control-font-size', this.controlFontsize + 'px');
    document.body.style.setProperty('--body-text-font-size', this.bodyTextFontsize + 'px');
    document.body.style.setProperty('--body-label-font-size', this.bodyLabelFontsize + 'px');
    document.body.style.setProperty('--body-control-font-size', this.bodyControlFontsize + 'px');
    document.body.style.setProperty('--body-treeview-font-size', this.bodyTreeviewFontsize + 'px');
    document.body.style.setProperty('--article-font-size', this.articleViewFontsize + 'px');
    document.body.style.setProperty('--support-font-size', this.supportFontsize + 'px');
    document.body.style.setProperty('--menu-font-color', this.menuFontColor);
    document.body.style.setProperty('--header-font-color', this.headerFontColor);
    document.body.style.setProperty('--message-font-color', this.messageFontColor);
    document.body.style.setProperty('--control-font-color', this.controlFontColor);
    document.body.style.setProperty('--body-text-font-color', this.bodyTextFontColor);
    document.body.style.setProperty('--body-label-font-color', this.bodyLabelFontColor);
    document.body.style.setProperty('--body-control-font-color', this.bodyControlFontColor);
    document.body.style.setProperty('--body-treeview-font-color', this.bodyTreeviewFontColor);
    document.body.style.setProperty('--article-font-color', this.articleViewFontColor);
    document.body.style.setProperty('--menu-font-family', this.menuFontFamily);
    document.body.style.setProperty('--header-font-family', this.headerFontFamily);
    document.body.style.setProperty('--message-font-family', this.messageFontFamily);
    document.body.style.setProperty('--control-font-family', this.controlFontFamily);
    document.body.style.setProperty('--body-text-font-family', this.bodyTextFontFamily);
    document.body.style.setProperty('--body-label-font-family', this.bodyLabelFontFamily);
    document.body.style.setProperty('--body-control-font-family', this.bodyControlFontFamily);
    document.body.style.setProperty('--body-treeview-font-family', this.bodyTreeviewFontFamily);
    document.body.style.setProperty('--article-font-family', this.articleViewFontFamily);
    document.body.style.setProperty('--main-font-family', this.fontFamily);
  }
  changeSet() {
    this.flagSet = 1;
  }
  getHost() {
    return this.Host;
  }
  gethost() {
    return this.host;
  }
  async getApiToken(userName: string, password: string) {
    const urlencoded = new URLSearchParams();
    urlencoded.append("username", userName);
    urlencoded.append("password", password);
    urlencoded.append("client_id", "mobile_client");
    urlencoded.append("grant_type", "password");
    urlencoded.append("scope", "openid email phone profile offline_access roles");
    return lastValueFrom(this.postApi<any>(this.getHost() + 'MobileAuth/Connect', urlencoded));
  }
  getAPI(url) {
    const headers = new HttpHeaders()
      .append('Authorization', 'Bearer ' + this.apiToken);
    const response = this.http.get(url, { headers });
    return response;
  }
  downloadFile(url) {
    const headers = new HttpHeaders()
      .append('Authorization', 'Bearer ' + this.apiToken);
    const response = this.http.get(url, { headers, responseType: 'blob' });
    return response;
  }
  getAPINoJson(url) {
    const headers = new HttpHeaders()
      .append('Authorization', 'Bearer ' + this.apiToken);
    const response = this.http.get(url, { headers });
    return response;
  }
  getDataNativeStore(msg) {
    // set data user
    const data = this.nativeStorage.getItem(msg);
    return data;
  }
  setDataNativeStore(msg) {
    // set data user
    const data = this.nativeStorage.setItem(msg, {});
    return data;
  }
  removeDataNativeStore(msg) {
    // set data user
    const data = this.nativeStorage.remove(msg);
    return data;
  }
  async checkLatestAppVersion() {
    if (!this.platform.is('capacitor')) {
      const version = await lastValueFrom<SettingObject>(
        this.getApi(`https://admin.metalearn.vn/MobileApp/GetAppVersion?platformCode=APP_VERSION`));
      this.latestVersion = version.Title;
      this.latestVersionNum = version.ValueSet;
    }
    else if (this.platform.is('android')) {
      const version = await lastValueFrom<SettingObject>(
        this.getApi(`https://admin.metalearn.vn/MobileApp/GetAppVersion?platformCode=APP_VERSION_ANDROID`));
      this.latestVersion = version.Title;
      this.latestVersionNum = version.ValueSet;
    }
    else if (this.platform.is('ios')) {
      const version = await lastValueFrom<SettingObject>(
        this.getApi(`https://admin.metalearn.vn/MobileApp/GetAppVersion?platformCode=APP_VERSION_APPLE`));
      this.latestVersion = version.Title;
      this.latestVersionNum = version.ValueSet;
    }
  }
  async getWebsyncServerAddress() {
    let address = '';
    try {
      address = await lastValueFrom(this.getApiResultText(this.getHost() + 'MobileChat/GetWebsyncServerAddress'));
    } catch (error) {
      console.log(error);
    }
    if (address) {
      this.websyncServerAddress = address;
    }
  }
  async getListNotification() {
    const listNoti = await lastValueFrom(this.getApi<Notify[]>(this.getHost() + `MobileApp/GetNotifications?userName=${this.userName}`));
    this.listNotification = listNoti;
    await this.set('listNotification', this.listNotification);
    this.badge.set(this.listNotification.filter(x => x.ReceiverConfirm === 'NO').length);
  }
  GetAPI(url) {
    const headers = new HttpHeaders()
      .append('Authorization', 'Bearer ' + this.apiToken);
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    const result = this.http.get(url, { headers });
    return result;
  }
  getApi<T>(url: string, body: HttpParams): Observable<T>;
  getApi<T>(url: string): Observable<T>;
  getApi<T>(url: string, body: HttpParams | null = null): Observable<T> {
    if (body == null) {
      const headers = new HttpHeaders()
        .append('Authorization', 'Bearer ' + this.apiToken)
        .append('Content-Type', 'application/x-www-form-urlencoded');
      // console.log(url);

      const result = this.http.get<T>(url, { headers });
      return result;
    }
    else {
      const headers = new HttpHeaders()
        .append('Authorization', 'Bearer ' + this.apiToken)
        .append('Content-Type', 'application/x-www-form-urlencoded');
      // console.log(url);

      const result = this.http.get<T>(url, { headers, params: body });
      return result;
    }
    // console.log(result);

  }
  getApiBlob(url: string) {
    const headers = new HttpHeaders()
      .append('Authorization', 'Bearer ' + this.apiToken);
    const result = this.http.get(url, { headers, responseType: 'blob' });

    return result;
  }
  getApiArrayBuffer(url: string) {
    const headers = new HttpHeaders()
      .append('Authorization', 'Bearer ' + this.apiToken);
    const result = this.http.get(url, { headers, responseType: 'arraybuffer' });

    return result;
  }
  getApiResultText(url) {
    const headers = new HttpHeaders()
      .append('Authorization', 'Bearer ' + this.apiToken);
    const result = this.http.get(url, { headers, responseType: 'text' });

    return result;
  }
  postApi<T>(url: string, body: string | URLSearchParams): Observable<T>;
  postApi<T>(url: string, body: FormData): Observable<T>;
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  postApi<T>(url: string, body: any): Observable<T>;
  postApi<T>(url: string, body: string | URLSearchParams | FormData | any) {
    if (typeof (body) === 'string' || body instanceof URLSearchParams) {
      console.log('this type is string');

      const headers = new HttpHeaders()
        .append('Authorization', 'Bearer ' + this.apiToken)
        .append('Access-Control-Allow-Origin', '*')
        .append('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT')
        .append('Accept', 'application/x-www-form-urlencoded')
        .append('Content-Type', 'application/x-www-form-urlencoded');
      const result = this.http.post<T>(url, body, { headers });
      return result;
    }
    else if (body instanceof FormData) {
      const headers = new HttpHeaders()
        .append('Authorization', 'Bearer ' + this.apiToken);
      const result = this.http.post<T>(url, body, { headers });
      return result;
    }
    else {
      const headers = new HttpHeaders()
        .append('Authorization', 'Bearer ' + this.apiToken)
        .append('Access-Control-Allow-Origin', '*')
        .append('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT')
        .append('Accept', 'application/json')
        .append('Content-Type', 'application/json');
      const result = this.http.post<T>(url, body, { headers });
      return result;
    }
  }
  deleteApi<T>(url: string) {
    const headers = new HttpHeaders()
      .append('Authorization', 'Bearer ' + this.apiToken)
      .append('Content-Type', 'application/x-www-form-urlencoded');
    // console.log(url);

    const result = this.http.delete<T>(url, { headers });
    // console.log(result);

    return result;
  }
  deleteApiTextResult(url: string) {
    const headers = new HttpHeaders()
      .append('Authorization', 'Bearer ' + this.apiToken)
      .append('Content-Type', 'application/x-www-form-urlencoded');
    // console.log(url);

    const result = this.http.delete(url, { headers, responseType: 'text' });
    // console.log(result);

    return result;
  }
  postAPI<T>(url, body) {
    const headers = new HttpHeaders()
      .append('Authorization', 'Bearer ' + this.apiToken)
      .append('Access-Control-Allow-Origin', '*')
      .append('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT')
      .append('Accept', 'application/x-www-form-urlencoded')
      .append('Content-Type', 'application/x-www-form-urlencoded');
    const result = this.http.post<T>(url, body, { headers });
    return result;
  }
  postApiResultText(url: string, body: string): Observable<string>;
  postApiResultText(url: string, body: FormData): Observable<string>;
  postApiResultText(url: string, body: any): Observable<string>;
  postApiResultText(url: string, body: string | FormData | any) {
    if (typeof (body) === 'string') {
      console.log("this type is string");

      const headers = new HttpHeaders()
        .append('Authorization', 'Bearer ' + this.apiToken)
        .append('Access-Control-Allow-Origin', '*')
        .append('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT')
        .append('Accept', 'application/x-www-form-urlencoded')
        .append('Content-Type', 'application/x-www-form-urlencoded');
      const result = this.http.post(url, body, { headers, responseType: 'text' });
      return result;
    }
    else if (body instanceof FormData) {
      const headers = new HttpHeaders()
        .append('Authorization', 'Bearer ' + this.apiToken)
        .append('Access-Control-Allow-Origin', '*')
        .append('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT');
      const result = this.http.post(url, body, { headers, responseType: 'text' });
      return result;
    }
    else {
      const headers = new HttpHeaders()
        .append('Authorization', 'Bearer ' + this.apiToken)
        .append('Access-Control-Allow-Origin', '*')
        .append('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT')
        .append('Accept', 'application/json')
        .append('Content-Type', 'application/json');
      const result = this.http.post(url, body, { headers, responseType: 'text' });
      return result;
    }
  }
  postApiResultBlob(url: string, body: string): Observable<Blob>;
  postApiResultBlob(url: string, body: FormData): Observable<Blob>;
  postApiResultBlob(url: string, body: any): Observable<Blob>;
  postApiResultBlob(url, body) {
    if (typeof (body) === 'string') {
      console.log("this type is string");

      const headers = new HttpHeaders()
        .append('Authorization', 'Bearer ' + this.apiToken)
        .append('Access-Control-Allow-Origin', '*')
        .append('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT')
        .append('Accept', 'application/x-www-form-urlencoded')
        .append('Content-Type', 'application/x-www-form-urlencoded');
      const result = this.http.post(url, body, { headers, responseType: 'blob' });
      return result;
    }
    else if (body instanceof FormData) {
      const headers = new HttpHeaders()
        .append('Authorization', 'Bearer ' + this.apiToken)
        .append('Access-Control-Allow-Origin', '*')
        .append('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT');
      const result = this.http.post(url, body, { headers, responseType: 'blob' });
      return result;
    }
    else {
      const headers = new HttpHeaders()
        .append('Authorization', 'Bearer ' + this.apiToken)
        .append('Access-Control-Allow-Origin', '*')
        .append('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT')
        .append('Accept', 'application/json')
        .append('Content-Type', 'application/json');
      const result = this.http.post(url, body, { headers, responseType: 'blob' });
      return result;
    }
  }
  postAPI1(url, body) {
    const headers = new HttpHeaders()
      .append('Authorization', 'Bearer ' + this.apiToken)
      .append('Access-Control-Allow-Origin', '*')
      .append('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT')
      .append('Accept', 'application/json')
      .append('Content-Type', 'application/json');
    const result = this.http.post(url, body, { headers });
    return result;
  }
  GetListFuncationAPI(funcationCode) {
    var body = (
      '?userId=' + this.id +
      '&funcationCode=' + funcationCode
    );

    var url = this.getHost() + 'MobileLogin/GetListFuncationAPI';
    const headers = new HttpHeaders();
    headers.append('Authorization', 'Bearer ' + this.apiToken);
    headers.append('Access-Control-Allow-Origin', '*');
    headers.append('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT');
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');
    const result = this.http.post(url, body, { headers });
    return result;
  }
  message(p) {
    this.toast.showToast(p);
  }
  messageSuccess(p) {
    this.toast.showToastSuccess(p);
  }
  messageSuccessWithDismiss(p) {
    const messageDismiss = this.translate.instant('NOTI.NOTI_DIMISS');
    this.toast.showToastWithDimiss(p, messageDismiss, 'success');
  }
  messageError(p) {
    this.toast.showToastError(p);
  }
  changeLanguage() {
    this.translate.use(this.language);
    this.menuLinks = [
      {
        component: '/dash-board', name: this.translate.instant('MAINPAGE.DASHBOARD'),
        uri: 'assets/icon/icon_home.png', id: 1, iconFa: 'fa-solid fa-house-chimney color-orange', selected: false
      },
      {
        component: '/dash-board', name: this.translate.instant('MAINPAGE.EXECUTIVEWORK'),
        uri: 'assets/imgs/icon_menu.png', id: 2/* , iconFa: 'fa-solid fa-grip color-green' */, selected: true
      },
      {
        component: '/conversation', name: this.translate.instant('MENU.ChatPage'),
        uri: 'assets/icon/icon_CallVideo.png', id: 2, iconFa: 'fa-solid fa-comment-dots color-green', selected: false
      },
      {
        component: '/setting-menu', name: '',
        uri: 'assets/icon/icon_Trello.png', id: 2, iconFa: 'fa-solid fa-gear color-dark', selected: false
      },
      {
        component: '/setting-menu', name: '',
        uri: 'assets/icon/icon_Trello.png', id: 2, iconFa: 'fa-solid fa-gear color-dark', selected: false
      },
    ];
    this.NEWWORK = this.translate.instant('MAINPAGE.NEWWORK');
    this.THINGSTODO = this.translate.instant('MAINPAGE.THINGSTODO');
    this.NOTIFICATION = this.translate.instant('MAINPAGE.NOTIFICATION');
    this.LOCATION = this.translate.instant('MAINPAGE.LOCATION');
    this.LOADING = this.translate.instant('PoCustomerPage.PoCustomerPage_loadingText');
    this.BTN_SEARCH = this.translate.instant('BUTTON.BTN_SEARCH');
    this.BTN_SAVE = this.translate.instant('BUTTON.BTN_SAVE');
    this.BTN_DIRECT = this.translate.instant('BUTTON.BTN_DIRECT');
    this.BTN_ADD = this.translate.instant('BUTTON.BTN_ADD');
    this.BTN_EDIT = this.translate.instant('BUTTON.BTN_EDIT');
    this.BTN_GETLOCATION = this.translate.instant('BUTTON.BTN_GETLOCATION');
    this.BTN_DELETE = this.translate.instant('BUTTON.BTN_DELETE');
    this.CHECKIN = this.translate.instant('Servicetranslate.CHECKIN');
    this.ONLINE = this.translate.instant('Servicetranslate.ONLINE');
    this.cmsLanguageCode = this.listLanguageCms?.find(x => x.Value === this.language)?.Code ?? 'CMS_LANGUAGE20211027001';
    console.log('cmsLanguageCode', this.cmsLanguageCode);
    setTimeout(() => {
      this.publish('user:login');
    }, 300);
  }
  async openMenuPage(p) {
    if (p.id === 1) {
      this.checkTabMenu = true;
      this.router.navigateByUrl(p.component);
    } else if (p.id === 3) {
    } else if (p.id === 2) {
      this.checkTabMenu = false;
      this.router.navigate([p.component]);
    } else {
      this.router.navigate([p.component]);
    }
  }
  CloseMenu() {
    // setTimeout(() => {
    //   this.CheckInputKey = this.keyboard.isVisible;
    // }, 200);
    this.GetCountCheckInAndOnline();
    this.publish('modal');
    this.showList = false;
    // this.appComponent.reset();
  }
  GetUserBalance() {
    this.postAPI(this.getHost() + `MobileLogin/GetUserBalance?userName=${this.userName}`, '')
      .subscribe((rs: any) => {
        const result = rs;
        this.Balance = result ?? 0;
      }, error => {
      });
  }
  GetCountCheckInAndOnline() {
    this.postAPI(this.getHost() + 'MobileLogin/GetCountCheckInAndOnline', '')
      .subscribe((rs: any) => {
        const result = rs;
        if (!result.Error) {
          this.CountCheckIn = result.Object.CountCheckIn;
          this.CountOnline = result.Object.CountOnline;
          this.CountUser = result.Object.CountUser;
        }
      }, error => {
      });
  }

  public GetTextTime(data) {
    let textTime = '';
    let cssTime = '';
    if (data == null || data === '') {
      textTime = this.translate.instant('Servicetranslate.NO_TIME_LIMIT');
      cssTime = 'NotSetTimecss';
    } else {
      const created = new Date(data);
      const now = new Date();
      const diffMs = created.getTime() - now.getTime();
      const diffDay = Math.floor((diffMs / 86400000));
      if (diffDay < 0) {
        textTime = this.translate.instant('Servicetranslate.OVER_TIME_LIMIT');
        cssTime = 'OUTOFDATECss';
      } else if (diffDay > 0) {
        textTime = this.translate.instant('Servicetranslate.REMAIN_TIME') + ' '
          + (diffDay + 1) + ' ' + this.translate.instant('TIMEKEEPPAGE.TS_KEY_DATE');
        cssTime = 'RESTcss';
      } else {
        // const end = new Date(new Date().setHours(23, 59, 59, 999));
        // const diffMs1 = (end.getTime() - now.getTime());

        const diffHrs = Math.floor((diffMs % 86400000) / 3600000);
        const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
        textTime = this.translate.instant('Servicetranslate.REMAIN_TIME') + ' '
          + diffHrs + 'h ' + diffMins + 'm';
        cssTime = 'RESTcss';
      }
    }
    return {
      textTime,
      cssTime,
    };
  }
  public GetTextTimeDate(data) {
    let textTime = '';
    let cssTime = '';
    if (data == null || data === '') {
      textTime = this.translate.instant('Servicetranslate.NO_TIME_LIMIT');
      cssTime = 'NotSetTimecss';
    } else {
      data = this.convertDatetime(data);
      var created = new Date(data);
      var now = new Date();
      var diffMs = (created.getTime() - now.getTime());
      var diffDay = Math.floor((diffMs / 86400000));
      if ((diffDay + 1) < 0) {
        textTime = this.translate.instant('Servicetranslate.OVER_TIME_LIMIT');
        cssTime = 'OUTOFDATECss';

      } else if ((diffDay + 1) > 0) {
        textTime = this.translate.instant('Servicetranslate.REMAIN_TIME') + ' '
          + (diffDay + 1) + ' ' + this.translate.instant('TIMEKEEPPAGE.TS_KEY_DATE');
        cssTime = 'RESTcss';
      } else {
        var end = new Date(new Date().setHours(23, 59, 59, 999));
        var diffMs1 = (end.getTime() - now.getTime());

        var diffHrs = Math.floor((diffMs1 % 86400000) / 3600000);
        var diffMins = Math.round(((diffMs1 % 86400000) % 3600000) / 60000);
        textTime = this.translate.instant('Servicetranslate.REMAIN_TIME') + ' '
          + diffHrs + 'h ' + diffMins + 'm';
        cssTime = 'RESTcss';
      }
    }
    return {
      textTime,
      cssTime,
    };
  }
  convertDatetime(date) {
    var result = '';
    if (date != null && date !== '') {
      var array = date.split('/');
      result = array[1] + '/' + array[0] + '/' + array[2];
    }
    return result;
  }
  ClickShowList() {
    this.publish('modal');
    this.showList = !this.showList;
  }
  formatNumber(num) {
    var n1; var n2;

    num = (Math.round(num * 100) / 100) + '' || '';
    n1 = num.split('.');
    n2 = n1[1] || null;
    n1 = n1[0].replace(/(\d)(?=(\d\d)+\d$)/g, ',');
    num = n2 ? n1 + '.' + n2 : n1;
    return num;
  }

  formatNumberValue(n) {
    // format number 1000000 to 1,234,567
    return n.replace(/[^.0-9]+/g, '').replace(/\.(?=.*\.)/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  setValue(event) {
    return event.replace(/[^.0-9]+/g, '').replace(/\.(?=.*\.)/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  propagateChange = (_: any) => {
  };
  CheckAPI(api) {
    var checkPermission = false;
    this.listFuncationAPI.forEach(element => {
      if (api === element.Api) {
        checkPermission = true;
      }
    });
    return checkPermission;
  }
  async getListModule() {
    const rs = await lastValueFrom<any>(this.getAPI(this.getHost() + 'MobileLogin/GetListModule'));
    if (rs) {
      this.listModule = rs.Object;
    }
  }
  // Check state of virtual keyboard
  CheckInput() {
    this.keyboard.onKeyboardShow().subscribe(() => {
      this.CheckInputKey = true;
    });
    this.keyboard.onKeyboardHide().subscribe(() => {
      this.CheckInputKey = false;
    });
    // setTimeout(() => {
    //   this.CheckInputKey = this.keyboard.isVisible;
    //   this.CheckInput();
    // }, 500);
  }
  checkOutLogin() {
    this.TimeOut = 180;
  }
  // View Cms Item
  GetItemGuide(helpId) {
    this.postAPI(this.getHost() + 'MobileLogin/GetItemGuide?helpId=' + helpId, '')
      .subscribe((rs: any) => {
        const result = rs;
        if (result) {
          var articleId = result.ArticleId;
          this.getAPI(this.getHost() + 'MobileLogin/GetContentCms?id=' + articleId)
            .subscribe((rs1: any) => {
              const result1 = rs1;
              if (result1) {
                const navigationExtras: NavigationExtras = {
                  queryParams: {
                    Data: result1,
                    listNoti: []
                  }
                };
                this.router.navigate(['/cmsitem-view'], navigationExtras);
              }
            }, error => {
              this.messageSuccess(this.translate.instant('NOTI.NOTI_CONNECTING'));
            });
        }
        else {

        }
      }, error => {
        this.messageSuccess(this.translate.instant('NOTI.NOTI_CONNECTING'));
      });
  }

  /* #region menu */
  openPersonal() {
    this.menuLinks[0].selected = true;
    this.menuLinks[1].selected = false;
    this.menuLinks[2].selected = false;
    this.menuLinks[3].selected = false;
    this.menuLinks[4].selected = false;
    this.router.navigate(['/personal']);
  }

  openMenuTab() {
    this.menuLinks[0].selected = false;
    this.menuLinks[1].selected = true;
    this.menuLinks[2].selected = false;
    this.menuLinks[3].selected = false;
    this.menuLinks[4].selected = false;
    //this.checkTabMenu = !this.checkTabMenu;
  }
  openConnect() {
    this.menuLinks[0].selected = false;
    this.menuLinks[1].selected = false;
    this.menuLinks[2].selected = false;
    this.menuLinks[3].selected = true;
    this.menuLinks[4].selected = false;
    this.router.navigate(['/lms-student-management']);
  }
  openNoti() {
    this.menuLinks[0].selected = false;
    this.menuLinks[1].selected = false;
    this.menuLinks[2].selected = false;
    this.menuLinks[3].selected = false;
    this.menuLinks[4].selected = true;
    this.router.navigate(['/notification-list']);
  }
  /* #endregion */

  // Events
  /* #region  Events */
  subscribe(topic: string, observer: (_: any) => void): Subscription {
    if (!this.channels[topic]) {
      this.channels[topic] = new Subject<any>();
    }
    return this.channels[topic].subscribe(observer);
  }

  publish(topic: string, data?: any): void {
    const subject = this.channels[topic];
    if (!subject) {
      // Or you can create a new subject for future subscribers
      return;
    }
    subject.next(data);
  }

  destroy(topic: string): null {
    const subject = this.channels[topic];
    if (!subject) {
      return;
    }
    subject.complete();
    delete this.channels[topic];
  }
  /* #endregion */
  // SMS

  /* #region  SMS */
  sendSMS(numberSms, message) {
    var windowSMS: any = window;
    SMS = windowSMS.SMS;
    SMS.sendSMS(numberSms, message, () => {
      console.log('SMS sent.');
    }, Error => {
      console.log('Error sending SMS.');
    });

  }

  readListSMS() {
    var windowSMS: any = window;
    SMS = windowSMS.SMS;
    console.log('readListSMS.');
    const filter = {
      box: 'inbox', // 'inbox' (default), 'sent', 'draft'
      indexFrom: 0, // Start from index 0.
      maxCount: 20, // Count of SMS to return each time.
    };

    return new Promise((resolve, reject) => {
      if (SMS) {
        SMS.listSMS(filter, (listSMS) => {
          console.log('SMS', listSMS);
          resolve(listSMS);
        }, Error => {
          console.log('Error list sms:' + Error);
          reject(Error);
        });
      }
    });
  }

  waitingForSMS() {
    var windowSMS: any = window;
    SMS = windowSMS.SMS;
    console.log('waitingForSMS');
    return new Promise((resolve, reject) => {
      if (SMS) {
        SMS.startWatch(() => {
          console.log('Waiting for SMS...');
        }, Error => {
          console.log('Error waiting for SMS.');
        });
      }
      document.addEventListener('onSMSArrive', (e: any) => {
        var sms = e.data;
        console.log({ mensaje_entrante: sms });
        this.publish('onSMSArrive', sms);
        resolve(sms);
      });
    });

  }
  /* #endregion */
  /* #region  speech to text handler */
  getValueFromRecording(myKey, valueRecording) {
    var arrRecording: any[] = [];
    var arrToSplit = [];
    var myString = ' ' + valueRecording.toLowerCase();
    var obMyValue;

    for (let index = 0; index < myKey.length; index++) {
      var arr = myString.split(' ' + myKey[index].Name.toString().replace(/\s+/g, ' ').toLowerCase() + ' ');
      if (arr.length > 1) {
        obMyValue = {
          id: 'undefine',
          value: arr[0],
        };
        arrToSplit.push(obMyValue);
        obMyValue = {
          id: myKey[index].Code,
          value: arr[1],
        };
        arrToSplit.push(obMyValue);
        break;
      }
    }
    if (arrToSplit.length > 0) {
      do {
        var check = false;
        for (let index = 0; index < myKey.length; index++) {
          var subArr = arrToSplit[0].value.toString().split(' ' + myKey[index].Name.toLowerCase() + ' ');
          if (subArr.length > 1) {
            obMyValue = {
              id: arrToSplit[0].id,
              value: subArr[0],
            };
            arrToSplit.push(obMyValue);
            obMyValue = {
              id: myKey[index].Code,
              value: subArr[1],
            };
            arrToSplit.push(obMyValue);
            check = true;
            break;
          }
        }
        if (check === false) {
          arrRecording.push(arrToSplit[0]);
        }
        const indexOfArrSplit = arrToSplit.indexOf(arrToSplit[0], 0);
        arrToSplit.splice(indexOfArrSplit, 1);
      } while (arrToSplit.length > 0);

    }
    return arrRecording;
  }
  checkIsValueNumber(valueRecording) {
    const arr_Number = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
    let myValue: number;
    for (let index = 0; index < arr_Number.length; index++) {
      if (arr_Number[index] === valueRecording) {
        return myValue = index;
      }
      else {
        if (valueRecording === 'mười lăm') { // special case
          return myValue = 15;
        }
        if (valueRecording === 'năm lăm') { // special case
          return myValue = 55;
        }
      }
    }
    if (valueRecording === 'hay') {
      return myValue = 2;
    }
    if (valueRecording === 'bẩy') {
      return myValue = 7;
    }
    if (valueRecording === 'bẩy') {
      return myValue = 7;
    }
    return this.checkNegativeNumber(valueRecording);
  }
  checkNegativeNumber(valueRecording) {
    if (this.platform.is('ios')) {
      var negativeWord = this.translate.instant('TIMEKEEPPAGE.TS_KEY_NEGATIVE');
    }
    else {
      negativeWord = '- ';
    }
    let myValue: number;
    const arrayNegativeWord = valueRecording.split(negativeWord).length > 1 ? valueRecording.split(negativeWord) : [];
    if (arrayNegativeWord.length > 1) {
      if (!hasWhiteSpace(arrayNegativeWord[1].toString())) {
        const valueNumber = - arrayNegativeWord[1].replaceAll('.', '').replace(',', '.').replace(/[^.\d]/g, '');
        myValue = valueNumber;
        return myValue;
      }
      else if (isNumeric(arrayNegativeWord[1].replaceAll('.', '').replace(',', '.').replace(/[^.\d]/g, ''))) {
        const valueNumber = - arrayNegativeWord[1].replaceAll('.', '').replace(',', '.').replace(/[^.\d]/g, '');
        myValue = valueNumber;
        return myValue;
      }
      else {
        return this.checkAnotherCase(arrayNegativeWord[1].toString());
      }
    }
    else {
      if (!hasWhiteSpace(valueRecording.toString())) {
        const valueNumber = + valueRecording.replaceAll('.', '').replace(',', '.').replace(/[^.\d]/g, '');
        myValue = valueNumber;
        return myValue;
      }
      else if (isNumeric(valueRecording.replaceAll('.', '').replace(',', '.').replace(/[^.\d]/g, ''))) {
        const valueNumber = + valueRecording.replaceAll('.', '').replace(',', '.').replace(/[^.\d]/g, '');
        myValue = valueNumber;
        return myValue;
      }
      else {
        return this.checkAnotherCase(valueRecording.toString());
      }
    }
  }
  checkAnotherCase(valueRecording) {
    var billionWord = 'tỷ';
    var millionWord = 'triệu';
    var thousand = 'nghìn';
    var lotArray = ['tỷ', 'triệu', 'nghìn'];
    var thousandSpecial = '1000';
    const wordsToInclude = new Set(lotArray);
    var value: string = valueRecording.toString();
    const lots = value.split(' ').filter(word => wordsToInclude.has(word));
    if (lots.length > 0) {
      var lot = lots[0];
      if (lot === 'tỷ') {
        const arrayBillionC = valueRecording.split(billionWord).length > 1 ? valueRecording.split(billionWord) : [];
        if (arrayBillionC.length > 1) {
          const arrayBillionWord = value.split(/tỷ(.*)/s);
          var firstNumber = arrayBillionWord[0].trim();
          var secondNumber = arrayBillionWord[1].trim();
          var result = Math.pow(1000000000, arrayBillionC.length - 1)
            * this.convertThereDigitsNumber(firstNumber)
            + this.checkAnotherCase(secondNumber);
          return result;
        }
      }
      if (lot === 'triệu') {
        const arrayMillion = valueRecording.split(millionWord).length > 1 ? valueRecording.split(millionWord) : [];
        if (arrayMillion.length > 1) {
          const arrayMillionWord = value.split(/triệu(.*)/s);
          var firstNumber = arrayMillionWord[0].trim();
          var secondNumber = arrayMillionWord[1].trim();
          var arrayBillion = valueRecording.split(billionWord).length > 1 ? valueRecording.split(billionWord) : [];
          if (arrayBillion.length > 1) {
            var result = 1000000 * Math.pow(1000000000, arrayBillion.length - 1)
              * this.convertThereDigitsNumber(firstNumber)
              + this.checkAnotherCase(secondNumber);
          }
          else {
            result = this.convertThereDigitsNumber(firstNumber) * 1000000 + this.checkAnotherCase(secondNumber);
          }
          return result;
        }
      }
      if (lot === 'nghìn') {
        const arrayThousand = valueRecording.split(thousand).length > 1 ? valueRecording.split(thousand) : [];
        if (arrayThousand.length > 1) {
          const arrayThousandWord = value.split(/nghìn(.*)/s);
          var firstNumber = arrayThousandWord[0].trim();
          var secondNumber = arrayThousandWord[1].trim();
          var arrayBillion = valueRecording.split(billionWord).length > 1 ? valueRecording.split(billionWord) : [];
          if (arrayBillion.length > 1) {
            var result = 1000 *
              Math.pow(1000000000, arrayBillion.length - 1)
              * this.convertThereDigitsNumber(firstNumber)
              + this.checkAnotherCase(secondNumber);
          }
          else {
            result = this.convertThereDigitsNumber(firstNumber) * 1000 + this.checkAnotherCase(secondNumber);
          }
          return result;
        }
      }
    }
    else {
      const arrayThounsandTail = valueRecording.split(thousandSpecial).length > 0 ? valueRecording.split(thousandSpecial) : [];
      if (valueRecording.indexOf(thousandSpecial) !== -1) {
        return this.convertThereDigitsNumber(arrayThounsandTail[0].trim()) * 1000;
      }
      else {
        return this.convertThereDigitsNumber(valueRecording);
      }
    }
  }
  convertThereDigitsNumber(value: string) {
    const wordsToInclude = new Set(['không', 'một',
      'hai', 'ba', 'bốn', 'năm', 'lăm',
      'sáu', 'bảy', 'bẩy', 'tám', 'chín', 'mười', 'mươi', 'linh', 'trăm']);
    const words = value.split(' ').filter(word => wordsToInclude.has(word) || isNumeric(word.replace(/[^.\d]/g, ''))).join(' ');
    var linhWord = ' linh ';
    var muoiLamWord = 'mười lăm';
    var namLamWord = 'năm lăm';
    var lamWord = 'lăm';
    if (value.trim() === muoiLamWord) {
      return 15;
    }
    if (value.trim() === namLamWord) {
      return 55;
    }
    const arrayLinhWord = words.split(linhWord).length > 1 ? words.split(linhWord) : [];
    if (arrayLinhWord.length > 1) {
      var result = parseInt(arrayLinhWord[0], 10) + getSingleWordToString(arrayLinhWord[1]);
      return result;
    }
    const arrayMuoiLamWord = words.split(muoiLamWord).length > 0 ? words.split(muoiLamWord) : [];
    if (words.indexOf(muoiLamWord) !== -1) {
      var result = parseInt(arrayMuoiLamWord[0], 10) + 15;
      return result;
    }
    const arrayLamWord = words.split(lamWord).length > 0 ? words.split(lamWord) : [];
    if (words.indexOf(lamWord) !== -1) {
      if (isNumeric(arrayLamWord[0])) {
        var result = parseInt(arrayLamWord[0], 10) * 10 + 5;
        return result;
      }
      else {
        var tramWord = ' trăm ';
        const arrayTramWord = arrayLamWord[0].split(tramWord).length > 0 ? arrayLamWord[0].split(tramWord) : [];
        if (arrayTramWord.length > 1) {
          var result = getSingleWordToString(arrayTramWord[0]) * 100 + 55;
          return result;
        }
        else {
          return this.convertTwoDigitsNumber(arrayLamWord[0]);
        }
      }
    }
    if (isNumeric(words)) {
      return parseFloat(words.replace(/[^\d]/g, ''));
    }
    if (!hasWhiteSpace(words)) {
      return parseFloat(words.replace(/[^\d]/g, ''));
    }
    return 0;
  }
  convertTwoDigitsNumber(value: string) {
    if (isNumeric(value)) {
      return parseFloat(value);
    }
    const wordsToInclude = new Set(['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'lăm', 'sáu', 'bảy', 'bẩy', 'tám', 'chín', 'mười', 'mươi']);
    const words = value.split(' ').filter(word => wordsToInclude.has(word) || isNumeric(word.replace(/[^.\d]/g, ''))).join(' ');
    if (words === 'mười lăm') {
      return 15;
    }
    else if (words === 'năm lăm') {
      return 55;
    }
    else if (!hasWhiteSpace(words)) {
      return getSingleWordToString(words);
    }
    else {
      return 0;
    }
  }
  // checkMuoiLam(valueRecording) {
  //   var muoiLamWord = " mười lăm";
  // }
  checkDateMonthYear(valueDatetTime: string) {
    const stringDate = this.translate.instant('TIMEKEEPPAGE.TS_KEY_DATE');// "ngày "
    const stringMonth = this.translate.instant('CheckListWithCardPage.TS_MONTH');
    const stringYear = this.translate.instant('CheckListWithCardPage.TS_YEAR');
    const arrStartDate = valueDatetTime.split(stringMonth).length > 1 ? valueDatetTime.split(stringMonth) : [];
    let arrStartMonth = [];
    if (arrStartDate.length > 0) {
      arrStartMonth = arrStartDate[1].split(stringYear).length > 1 ? arrStartDate[1].split(stringYear) : [];
      arrStartMonth[0] = this.checkIsValueNumber(arrStartMonth[0]);
      arrStartMonth[1] = this.checkIsValueNumber(arrStartMonth[1]);
    }
    if (arrStartMonth.length > 0) {
      var removeDate = arrStartDate[0].split(stringDate);
      if (removeDate.length > 1) {
        arrStartDate[0] = removeDate[1];
      }
      arrStartDate[0] = this.checkIsValueNumber(arrStartDate[0]).toString();
      arrStartDate[0] = this.formatDate(arrStartDate[0], arrStartMonth[0], arrStartMonth[1]);
      arrStartMonth[0] = this.formatMonth(arrStartMonth[0]);
      return arrStartMonth[1] + '-' + arrStartMonth[0] + '-' + arrStartDate[0] + 'T00:00:00';
    }
  }
  formatDate(d: string, m: string, y: string) {
    var checkDateFormat = +d;
    if (!checkDateFormat) {
      return '01';
    }
    const maxDate = +moment(moment(y + '-' + m)).clone().endOf('month').format('DD');
    if (checkDateFormat > maxDate) {
      d = maxDate + '';
    }
    if (checkDateFormat < 10 && checkDateFormat > 0) {
      d = '0' + d;
    } else if (checkDateFormat < 1) {
      d = '01';
    }
    return d;
  }
  formatMonth(m: string) {
    var checkMonthFormat = +m;
    if (!checkMonthFormat) {
      return '01';
    }
    if (checkMonthFormat < 10 && checkMonthFormat > 0) {
      m = '0' + m;
    } else if (checkMonthFormat < 1) {
      m = '01';
    } else if (checkMonthFormat > 12) {
      m = '12';
    }
    return m;
  }
  getIndexValueFromRecording(valueRecording) {
    var regx = /\d{3}/g;
    var countKey = this.count(valueRecording, regx);
    var lastIndex = 0;
    var equal = this.translate.instant('DATA_SET.TS_EQUAL').toLowerCase();
    var end = this.translate.instant('DATA_SET.TS_OVER').toLowerCase();
    var arrayResult: { key: string; value: string }[] = [];
    for (let i = 0; i < countKey; i++) {
      // const element = countKey[i];
      var keyStr = valueRecording.slice(lastIndex);
      var objKey = this.extractKey(keyStr, regx, equal);
      if (objKey) {
        var key = objKey.key; // get key
        lastIndex += objKey.endindex; // lastIndex of equal string
      }
      else {
        break;
      }
      var valStr = valueRecording.slice(lastIndex);
      var objValue = this.extractValue(valStr, regx, end);
      if (objValue) {
        var value = objValue.value;
        lastIndex += objValue.nextindex;
      }
      else {
        break;
      }
      arrayResult.push({
        key,
        value
      });
      if (!objValue.nextindex) {
        break;
      }
    }
    return arrayResult;
  }
  count = (str: string, reg: RegExp) => ((str || '').match(reg) || []).length;
  extractKey(str: string, reg: RegExp, end: string) {
    // var regx = /^\d{3}$/;
    var endRegx = new RegExp(end, 'i');
    var startindex = str.search(reg);
    var key = str.match(reg);
    // var endindex = str.indexOf(end, startindex);
    var endindex = startindex + str.slice(startindex).search(endRegx);
    var substring = str.substring(startindex, endindex);
    if (startindex !== -1 && endindex !== -1 && endindex > startindex && key && key.length > 0) {
      return {
        key: key[0],
        startindex,
        endindex: startindex + substring.length + end.length
      };
    }
    else { return null; }
  }
  findNextStart(str: string, reg: RegExp, end: string) {
    // var regx = /^\d{3}$/;
    var endindex = str.indexOf(end);
    var startindex = endindex + str.slice(endindex).search(reg);
    var key = str.slice(endindex).match(reg);
    if (startindex !== -1 && key && key.length > 0 && startindex > endindex) {
      return {
        key: key[0],
        nextindex: startindex
      };
    }
    else { return null; }
  }
  extractValue(str: string, reg: RegExp, end: string) {
    var endRegx = new RegExp(end, 'gi');
    var res = this.findNextStart(str, reg, end);
    if (res) {
      var startindex = res.nextindex;
      var newstr = str.slice(0, startindex);
      // var endindex = newstr.lastIndexOf(end);
      endRegx.test(newstr);
      var endindex = endRegx.lastIndex;
    }
    else {
      // var endindex = str.lastIndexOf(end);
      endRegx.test(str);
      var endindex = endRegx.lastIndex;
    }
    if (endindex !== 0) {
      return {
        value: str.substring(0, endindex - end.length).trim(),
        nextindex: startindex, //Where next key start
        endindex // Where end word is
      };
    }
    else { return null; }
  }
  /* #endregion */

  /*
sendTextMessage(number, message) {
  console.log("Number: " + number);
  console.log("Message: " + message);
  this.sms.send(number, message).then((result) => {
    let successToast = this.toastCtrl.create({
      message: "Text message sent successfully! :)",
      duration: 3000
    })
    successToast.present();
  }, (error) => {
    let errorToast = this.toastCtrl.create({
      message: "Text message not sent. :(",
      duration: 3000
    })
    errorToast.present();
  });
}
*/

  printpath(parent: string, config: Route[]) {
    for (let i = 0; i < config.length; i++) {
      const route = config[i];
      console.log(parent + '/' + route.path);
      if (route.children) {
        const currentPath = route.path ? parent + '/' + route.path : parent;
        this.printpath(currentPath, route.children);
      }
    }
  }
  async pushFileIncome(item: IntentClipItem) {
    this.listFileShare.push(item);
    await this.set('listFileShare', this.listFileShare);
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
  getUUID() {
    return create_UUID();
  }
  async cacheFile(key, url) {
    try {
      var listUrl = await this.get(key);
      console.log(listUrl.length);
    } catch (error) {
      console.log(error);
      listUrl = [];
    }
    var filename = url.substring(url.lastIndexOf('/') + 1);
    try {
      var rs: any = await this.postAPI(this.getHost() + 'MobileLogin/CreateTempFileFromUrl', 'url=' + url).toPromise();
      console.log(rs);
      var newUrl = rs.Object;
      if (newUrl) {
        var fileObject = await this.downloadFile(this.getHost() + newUrl).toPromise();
        console.log(fileObject);
      }
      else {
        return null;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
    if (this.platform.is('capacitor')) {
      try {
        var saveDir = this.file.dataDirectory + '/' + key;
        // var isFolderExist = await this.file.checkDir(this.file.dataDirectory, key);
        // if (!isFolderExist) {
        //   var newDir = await this.file.createDir(this.file.dataDirectory, key, false);
        //   saveDir = newDir.nativeURL;
        // }
        var fileEntry: FileEntry = await this.file.writeFile(
          this.file.dataDirectory,
          filename,
          fileObject,
          { replace: true }
        );

      } catch (error) {
        console.log(error);
        return null;
      }
      // var metaData = await fileEntry.getMetadata()
      if (fileObject.type.indexOf('image') === -1) {
        listUrl.push({
          fileName: filename,
          id: create_UUID(),
          url: fileEntry.nativeURL
        });
      }
      else {
        const win: any = window; // hack ionic/angular compilator
        var myURL = win.Ionic.WebView.convertFileSrc(fileEntry.nativeURL);
        listUrl.push({
          fileName: filename,
          id: create_UUID(),
          url: myURL
        });
      }
      try {
        await this.set(key, listUrl);
        await this.DeleteTempFile(newUrl);
        return fileEntry.nativeURL;
      } catch (error) {
        console.log(error);
        return null;
      }
    }
    else {
      return null;
    }
  }
  async findFile(key, url) {
    try {
      var listUrl = await this.get(key);
      console.log(listUrl.length);
    } catch (error) {
      console.log(error);
      listUrl = [];
    }
    var filename = url.substring(url.lastIndexOf('/') + 1);
    var indexFile = listUrl.findIndex(x => x.fileName === filename);
    if (indexFile !== -1) {
      return listUrl[indexFile].url;
    }
    else {
      return null;
    }
  }
  async DeleteTempFile(url) {
    var rs: any = this.postAPI(this.getHost() + 'MobileLogin/DeleteFileTemp?filePath=' + url, '').toPromise();
    const result = rs;
    return result;
  }
  // animation
  modalEnterAnimation = (baseEl: any) => {
    const root = baseEl.shadowRoot;

    const backdropAnimation = this.animationCtrl
      .create()
      .addElement(root.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = this.animationCtrl
      .create()
      .addElement(root.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, opacity: '0', transform: 'scale(0)' },
        { offset: 1, opacity: '0.99', transform: 'scale(1)' },
      ]);

    return this.animationCtrl
      .create()
      .addElement(baseEl)
      .easing('ease-out')
      .duration(0)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  };
  modalEnterAnimationMessage = (baseEl: any) => {
    const root = baseEl.shadowRoot;

    const backdropAnimation = this.animationCtrl
      .create()
      .addElement(root.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = this.animationCtrl
      .create()
      .addElement(root.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, opacity: '1', transform: 'translateY(-100%)' },
        { offset: 1, opacity: '1', transform: 'translateY(0)' },
      ]);

    return this.animationCtrl
      .create()
      .addElement(baseEl)
      .easing('ease-out')
      .duration(500) // Set duration to 2 seconds
      .addAnimation([backdropAnimation, wrapperAnimation]);
  }
  modalLeaveAnimation = (baseEl: any) => this.modalEnterAnimation(baseEl).direction('reverse');
  // mark document as read
  startReadDocument(taskCode, objCode, timeStart) {
    this.taskCode = taskCode;
    this.fileCode = objCode;
    this.timeStart = timeStart;
  }
  async trackDiligence(taskCode, objCode) {
    var listTrackDiligent = [];
    var listPracticeResult = [];
    // var userResult = this.listUserResult[index];
    // var correctAnswer = this.getCorrectAnswer(index);
    // let listDocTrackingPage: DocTrackingPage[] = [];
    // try {
    //   listDocTrackingPage = await this.get('listDocTrackingPage');
    // } catch (error) {
    //   console.log(error);
    // }
    // listDocTrackingPage = listDocTrackingPage ? listDocTrackingPage : [];
    // const indexFile = listDocTrackingPage.findIndex(x => x.id === this.fileSupport.trackingFileId);
    let listTick = [];
    let countTick = 0;
    let totalTick = 1;
    // if (indexFile !== -1) {
    //   listTick = listDocTrackingPage[indexFile].listPage.map(x => x.pageNo);
    //   countTick = listTick.length;
    //   totalTick = listDocTrackingPage[indexFile].totalPage;
    // }
    var objPracticeResult = {
      Id: 1, // will be changed in server side
      StartTime: this.timeStart,
      EndTime: moment().format('DD/MM/YYYY HH:mm:ss'),
      UserResult: '',
      CorrectResult: '',
      IsCorrect: '',
      Device: 'MOBILE',
      SessionCode: create_UUID(),
      NumSuggest: 0,
      TaskCode: taskCode,
      QuizType: '',
      QuizObjCode: '',
      TotalTick: totalTick,
      ListTick: listTick,
      CountTick: countTick,
    };
    listPracticeResult.push(objPracticeResult);
    var objTrackDilligent = {
      ObjectType: 'FILE',
      ObjectCode: objCode,
      ObjectResult: JSON.stringify(listPracticeResult)
    };
    listTrackDiligent.push(objTrackDilligent);
    const body =
      'sListDilligence=' + JSON.stringify(listTrackDiligent) +
      '&UserName=' + this.userName;
    this.postAPI(this.getHost() + 'MobileLogin/TrackDilligence', body).
      subscribe((rs: any) => {
        var result: any = rs;
        this.updateFileProgess();
      }, error => {

      });
  }
  updateFileProgess() {
    const body =
      'createdBy=' +
      this.userName +
      '&userNameFilter=' +
      this.userName;
    this.postAPI(this.getHost() + 'MobileLogin/UpdateFileProgess', body)
      .subscribe(
        (result: any) => {
          const rs = result;
          this.publish('RELOAD_COURSE_WARE');
        },
        (error) => {
          this.messageSuccess(this.translate.instant('NOTI.NOTI_CONNECTING'));
        }
      );
  }
  getApiResultJson(url: string) {
    const headers = new HttpHeaders()
      .append('Authorization', 'Bearer ' + this.apiToken);
    const response = this.http.get(url, { headers });
    return response;
  }
  postApiQuery(url: string, body: any) {
    const headers = new HttpHeaders()
      .append('Authorization', 'Bearer ' + this.apiToken)
      .append('Access-Control-Allow-Origin', '*')
      .append('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT')
      .append('Accept', 'application/x-www-form-urlencoded')
      .append('Content-Type', 'application/x-www-form-urlencoded');
    const result = this.http.post(url, body, { headers });
    return result;
  }
  postApiJson<T>(url: string, body: any) {
    const headers = new HttpHeaders()
      .append('Authorization', 'Bearer ' + this.apiToken)
      .append('Access-Control-Allow-Origin', '*')
      .append('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT')
      .append('Accept', 'application/json')
      .append('Content-Type', 'application/json');
    const result = this.http.post<T>(url, body, { headers });
    return result;
  }

  deleteApiJsonParams<T>(url: string, params: any) {
    const headers = new HttpHeaders()
      .append('Authorization', 'Bearer ' + this.apiToken)
      .append('Access-Control-Allow-Origin', '*')
      .append('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT')
      .append('Accept', 'application/json')
      .append('Content-Type', 'application/json');
    const options = {
      headers,
      params
    };
    const result = this.http.delete<T>(url, options);
    return result;
  }


  deleteApiJson<T>(url: string) {
    const headers = new HttpHeaders()
      .append('Authorization', 'Bearer ' + this.apiToken)
      .append('Access-Control-Allow-Origin', '*')
      .append('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT')
      .append('Accept', 'application/json')
      .append('Content-Type', 'application/json');
    const result = this.http.delete<T>(url, { headers });
    return result;
  }
  putApiQuery<T>(url: string, body: string) {
    const headers = new HttpHeaders()
      .append('Authorization', 'Bearer ' + this.apiToken)
      .append('Access-Control-Allow-Origin', '*')
      .append('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT')
      .append('Accept', 'application/x-www-form-urlencoded')
      .append('Content-Type', 'application/x-www-form-urlencoded');
    const result = this.http.put<T>(url, body, { headers });
    return result;
  }
  putApiJson<T>(url: string, body: any) {
    const headers = new HttpHeaders()
      .append('Authorization', 'Bearer ' + this.apiToken)
      .append('Access-Control-Allow-Origin', '*')
      .append('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT')
      .append('Accept', 'application/json')
      .append('Content-Type', 'application/json');
    const result = this.http.put<T>(url, body, { headers });
    return result;
  }
  postWithProgress<T>(url, body) {
    const headers = new HttpHeaders()
      .append('Authorization', 'Bearer ' + this.apiToken)
      .append('Access-Control-Allow-Origin', '*')
      .append('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT')
      .append('Accept', 'application/json')
      .append('Content-Type', 'application/json');
    const req = new HttpRequest('POST', url, body, {
      headers, reportProgress: true
    });
    return this.http.request<T>(req);
    // const result = this.http.post<T>(url, body, { headers, reportProgress: true });
    // return result;
  }
  putApi<T>(url: string, body: string): Observable<T>;
  putApi<T>(url: string, body: FormData): Observable<T>;
  putApi<T>(url: string, body: any): Observable<T>;
  putApi<T>(url: string, body: string | FormData | any) {
    if (typeof (body) === 'string') {
      console.log("this type is string");

      const headers = new HttpHeaders()
        .append('Authorization', 'Bearer ' + this.apiToken)
        .append('Access-Control-Allow-Origin', '*')
        .append('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT')
        .append('Accept', 'application/x-www-form-urlencoded')
        .append('Content-Type', 'application/x-www-form-urlencoded');
      const result = this.http.put<T>(url, body, { headers });
      return result;
    }
    else if (body instanceof FormData) {
      const headers = new HttpHeaders()
        .append('Authorization', 'Bearer ' + this.apiToken);
      const result = this.http.post<T>(url, body, { headers });
      return result;
    }
    else {
      const headers = new HttpHeaders()
        .append('Authorization', 'Bearer ' + this.apiToken)
        .append('Access-Control-Allow-Origin', '*')
        .append('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT')
        .append('Accept', 'application/json')
        .append('Content-Type', 'application/json');
      const result = this.http.put<T>(url, body, { headers });
      return result;
    }
  }

  convertToZoomusLink(zoomUrl: string): string | null {
    try {
      // Parse the URL
      const url = new URL(zoomUrl);

      // Extract meeting ID (confno) and password (pwd) from query parameters
      const meetingId = url.pathname.split('/').pop(); // Extract from path
      const password = url.searchParams.get('pwd');

      if (meetingId && password) {
        // Construct the Zoomus deep link
        return `zoomus://zoom.us/join?confno=${meetingId}&pwd=${password}`;
      } else {
        console.error('Invalid Zoom URL: Missing confno or pwd.');
        return null;
      }
    } catch (error) {
      console.error('Error parsing Zoom URL:', error);
      return null;
    }
  }

  async logout() {
    // Clear timer first
    this.clearTimeOut();

    // Perform iOS cleanup
    this.cleanupForIOS();

    // Clear notification counts
    this.countNotiTask = 0;
    this.countNotiTutor = 0;
    this.countNotiClass = 0;
    this.countNotiExam = 0;
    this.countNotiQuiz = 0;
    this.countNotiDocument = 0;
    this.countNotiCourse = 0;
    this.countNotiOffline = 0;

    // Clear cached data
    this.listNotification = [];
    this.listQuestion = [];
    this.listDetailQuiz = [];
    this.globalCart = [];
    this.cart = [];
    this.foodTemp2 = [];
    this.selectedSchool = [];

    // Clear storage
    await this.set('listVideoTrackingDuration', []);
    await this.set('countNotification', {
      countNotiTask: 0,
      countNotiTutor: 0,
      countNotiClass: 0,
      countNotiExam: 0,
      countNotiQuiz: 0,
      countNotiDocument: 0,
      countNotiCourse: 0,
      countNotiOffline: 0
    });
    await this.set('listNotification', []);

    console.log('Logout cleanup completed');
  }
}
function hasWhiteSpace(s) {
  return s.indexOf(' ') >= 0;
}
function isNumeric(str) {
  if (typeof str !== 'string') { return false; } // we only process strings!
  return !isNaN(+str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str)); // ...and ensure strings of whitespace fail
}
function getSingleWordToString(str) {
  const arr_Number = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  for (let index = 0; index < arr_Number.length; index++) {
    if (arr_Number[index] === str) {
      return index;
    }
  }
  if (str === 'bẩy') {
    return 7;
  }
  if (str === 'hay') {
    return 2;
  }
  if (str === 'mốt') {
    return 1;
  }
}
function create_UUID() {
  var dt = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    var r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}
export interface ResponseMeta {
  ID: number;
  Title: any;
  Error: boolean;
  Object: any;
  Code: any;
}

export interface Notify {
  NotifyID: number
  NotifyCode: string
  Title: string
  Content: string
  DateEvent: any
  DateWarning: any
  IsWarning: any
  Status: string
  LstContractCode: any
  Receiver: string
  ReceiverConfirm: string
  ConfirmTime: any
  CreatedBy: string
  CreatorName: string
  CreatorPicture: string
  CreatedTime: string
  // UpdatedBy: any
  // UpdatedTime: any
  // DeletedBy: any
  // DeletedTime: any
  // IsDeleted: boolean
}
export interface SettingObject {
  SettingID: number;
  CodeSet: string;
  ValueSet: string;
  Group: string;
  CreatedBy: string;
  CreatedTime: string;
  UpdatedBy: string;
  UpdatedTime: string;
  DeletedBy: any;
  DeletedTime: any;
  AssetCode: string;
  GroupNote: string;
  IsDeleted: boolean;
  Priority: any;
  Logo: any;
  Type: string;
  Unit: any;
  Title: string;
}


export interface PasswordError {
  type: PasswordErrorTypes;
  caption: string;
}

export type PasswordErrorTypes = 'capital' | 'normal' | 'digit' | 'nonAlpha' | 'length' | 'other';
