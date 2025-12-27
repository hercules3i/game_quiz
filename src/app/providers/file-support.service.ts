// @ts-nocheck
/* eslint-disable no-bitwise */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/prefer-for-of */
import { ElementRef, EventEmitter, Injectable } from '@angular/core';
import * as launcher from '../../assets/js/start-app';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, NavigationExtras } from '@angular/router';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { WebIntent } from '@awesome-cordova-plugins/web-intent/ngx';
import { AppLauncher, AppLauncherOptions } from '@ionic-native/app-launcher/ngx';
import { NavController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { ServiceService } from './service.service';
import { ToastServiceService } from './toast-service.service';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { FileInfo } from '@syncfusion/ej2-angular-inputs';
import { UploadInfo } from '../components/file-uploader/file-uploader.component';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { File as FilePlugin, FileEntry } from '@awesome-cordova-plugins/file/ngx';
import { FileTransfer, FileTransferObject } from '@awesome-cordova-plugins/file-transfer/ngx';
import { Screenshot } from '@ionic-native/screenshot/ngx';
import { lastValueFrom, Subscription } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class FileSupportService {
  uploadEvent = new EventEmitter<File>();
  uploadSuccessEvent = new EventEmitter<any>();
  uploadFailedEvent = new EventEmitter<any>();
  uploadProgressEvent = new EventEmitter<UploadInfo>();
  uploadCancelledEvent: EventEmitter<void> = new EventEmitter<void>();
  cancelled = false;
  currentFile: FileInfo;
  isUploadingFile = false;
  uploadStatus = 'none';
  uploadInfo: UploadInfo;
  trackingFileId: string;
  tempFileUrl = '';
  jsonDocDrive: any;
  acceptType = 'image/*';
  fileNameUpload = '';
  mimeType = '';
  inputFile: ElementRef<HTMLInputElement>;
  uploadResult = '';
  customEndpoint = '';
  customKey = '';
  customResult = '';
  constructor(
    public service: ServiceService,
    public router: Router,
    public socialSharing: SocialSharing,
    public toast: ToastServiceService,
    public navCtrl: NavController,
    public translate: TranslateService,
    private appLauncher: AppLauncher,
    public webIntent: WebIntent,
    public sanitizer: DomSanitizer,
    public platform: Platform,
    private nativeStorage: NativeStorage,
    private fileOpener: FileOpener,
    private file: FilePlugin,
    public iab: InAppBrowser,
    private transfer: FileTransfer,
    private screenshot: Screenshot,
  ) { }

  deleteTempFile() {
    if (this.tempFileUrl) {
      this.service.postAPI(this.service.getHost() + 'MobileLogin/DeleteFileTemp?filePath=' + this.tempFileUrl, '')
        .subscribe((rs: any) => {
          const result = rs;
          console.log(result);
        }, error => {
        });
    }
  }
  async viewDocument(detail, isFlipBook: boolean = false) {
    console.log(detail);
    const timeStart = moment().format('DD/MM/YYYY HH:mm:ss');
    this.service.startReadDocument(detail.TaskCode, detail.FileCode, timeStart);
    this.trackingFileId = (detail.Id as number | string).toString();
    if (detail.ReposType === 'DRIVER' && !isFlipBook) {
      this.viewDriveFile(detail);
      this.service.trackDiligence(this.service.taskCode, this.service.fileCode);
    }
    else {
      if (isFlipBook) {
        this.viewFtpFile(detail, true);
      } else {
        this.viewFtpFile(detail);
      }
      // this.nativeStorage.getItem('listFile')
      //   .then(
      //     data => {
      //       for (let i = 0; i < data.length; i++) {
      //         if (data[i].name === detail.FileName) {
      //           console.log('Get data from local!');
      //           const navigationExtras: NavigationExtras = { queryParams: data[i] };
      //           return this.router.navigate(['/message-view-imgage'], navigationExtras);
      //         }
      //       }
      //     },
      //     error => {
      //       this.viewFtpFile(detail);
      //     }
      //   );
    }
  }
  async viewMedia(detail) {
    const timeStart = moment().format('DD/MM/YYYY HH:mm:ss');
    this.service.startReadDocument(detail.TaskCode, detail.FileCode, timeStart);
    if (detail.ReposType === 'DRIVER') {
      // this.viewDriveMedia(detail);
      this.iab.create('https://docs.google.com/uc?export=play&id=' + detail.CloudFileId, '_blank', { location: 'no', zoom: 'yes' });
      this.service.trackDiligence(this.service.taskCode, this.service.fileCode);
    }
    else {
      this.viewFtpFile(detail);
    }
  }
  async viewDriveFile(detail) {
    // this.service.trackDiligence(this.service.taskCode, this.service.fileCode);
    if (detail.FileType === 'word') {
      const uri = 'https://docs.google.com/document/d/' + detail.CloudFileId + '/view?usp=sharing';
      if (this.platform.is('capacitor')) {
        if (this.platform.is('android')) {
          this.sendIntent(uri);
        } else if (this.platform.is('ios')) {
          this.openUriIos(uri);
        }
      }
      else {
        window.open(uri, '_blank');
      }
    }
    else if (detail.FileType === 'excel') {
      const uri = 'https://docs.google.com/spreadsheets/d/' + detail.CloudFileId + '/view?usp=sharing';
      if (this.platform.is('capacitor')) {
        if (this.platform.is('android')) {
          this.sendIntent(uri);
        } else if (this.platform.is('ios')) {
          this.openUriIos(uri);
        }
      }
      else {
        window.open(uri, '_blank');
      }
    }
    else if (detail.FileType === 'pptx') {
      const uri = 'https://docs.google.com/presentation/d/' + detail.CloudFileId + '/view?usp=sharing';
      if (this.platform.is('capacitor')) {
        if (this.platform.is('android')) {
          this.sendIntent(uri);
        } else if (this.platform.is('ios')) {
          this.openUriIos(uri);
        }
      }
      else {
        window.open(uri, '_blank');
      }
    }
    else {
      const uri = 'https://drive.google.com/file/d/' + detail.CloudFileId + '/view?usp=sharing';
      if (this.platform.is('capacitor')) {
        if (this.platform.is('android')) {
          this.sendIntent(uri);
        } else if (this.platform.is('ios')) {
          this.openUriIos(uri);
        }
      }
      else {
        window.open(uri, '_blank');
      }
    }
  }
  async viewDrivePdfFile(detail) {
    // this.service.trackDiligence(this.service.taskCode, this.service.fileCode);
    if (detail.FileType === 'excel') {
      try {
        const jsonData = await this.downloadAndCacheJson(detail);
        const navigationExtras: NavigationExtras = {
          queryParams: {
            detail: jsonData,
            FileName: detail.FileName,
            isEdit: false
          }
        };
        this.router.navigate(['/view-file-excel'], navigationExtras);
      } catch (error) {
        console.log(error);
      }
    }
    else if (detail.FileType === 'pptx') {
      try {
        const jsonData = await this.downloadAndCacheJson(detail);
        const obj = { Url: jsonData, FileName: detail.FileName, isEdit: false };
        const navigationExtras: NavigationExtras = { queryParams: obj };
        return this.router.navigate(['/view-file-sync-pptx'], navigationExtras);
      } catch (error) {
        console.log(error);
      }
    }
    else if (detail.FileType === 'word') {
      try {
        const jsonData = await this.downloadAndCacheJson(detail);
        const obj = { Json: jsonData, FileName: detail.FileName, isEdit: false };
        const navigationExtras: NavigationExtras = { queryParams: obj };
        return this.router.navigate(['/view-file-drive-doc'], navigationExtras);
      } catch (error) {
        console.log(error);
      }
    }
    else {
      try {
        await this.downloadAndCacheFile(detail);
      } catch (error) {
        console.log(error);
      }
      const result = await this.openFileFromCacheUrl(detail);
      console.log(result);
    }
  }
  async viewDriveMedia(detail) {
    // try {
    //   await this.downloadAndCacheFile(detail);
    // } catch (error) {
    //   console.log(error);
    // }
    const result = await this.openMediaFromCacheUrl(detail);
    console.log(result);
  }
  viewFileWithTask(detail, taskCode) {
    const timeStart = moment().format('DD/MM/YYYY HH:mm:ss');
    this.service.startReadDocument(taskCode, detail.FileCode, timeStart);
    this.trackingFileId = (detail.Id as number | string).toString();
    this.viewFtpFile(detail);
  }
  viewFileFromStorage(detail, isFlipBook: boolean = false) {
    const a = detail.FileName.split('.');
    const b: string = (a[a.length - 1] as string).toLowerCase();
    //format support
    if (detail.FileTypePhysic === '.doc' || detail.FileTypePhysic === '.docx') {
      detail.FileType = 'word';
    }
    else if (detail.FileTypePhysic === '.xlsx' || detail.FileTypePhysic === '.xlsm' || detail.FileTypePhysic === '.xls') {
      detail.FileType = 'excel';
    }
    else if (detail.FileTypePhysic === '.pptx' || detail.FileTypePhysic === '.pptm' || detail.FileTypePhysic === '.ppt') {
      detail.FileType = 'pptx';
    }
    else if (detail.FileTypePhysic === '.pdf') {
      detail.FileType = 'pdf';
    }
    else if (detail.FileTypePhysic === '.epub') {
      detail.FileType = 'epub';
    }
    else if (detail.FileTypePhysic === '.txt') {
      detail.FileType = 'text';
    }
    else if (detail.FileTypePhysic === '.zip' || detail.FileTypePhysic === '.rar') {
      detail.FileType = 'zip';
    }
    else if ((detail.MimeType?.indexOf('image/') ?? -1) !== -1) {
      detail.FileType = 'image';
    }
    else if ((detail.MimeType?.indexOf('audio/') ?? -1) !== -1) {
      detail.FileType = 'audio';
    }
    else if ((detail.MimeType?.indexOf('video/') ?? -1) !== -1) {
      detail.FileType = 'video';
    }
    else {
      detail.FileType = 'other';
    }

    const imageType: string[] = ['png', 'jpg', 'gif', 'tiff', 'bmp'];
    if (imageType.indexOf(b) !== -1 || detail.FileType === 'image') {
      this.toast.dismissToast();
      const obj = { Url: detail.UrlFileTemp, FileName: detail.FileName };
      const navigationExtras: NavigationExtras = { queryParams: obj };
      return this.router.navigate(['/message-view-imgage'], navigationExtras);
    }

    if (b === 'pdf' || detail.FileType === 'pdf') {
      this.toast.dismissToast();
      const obj = { Url: detail.UrlFileTemp, FileName: detail.FileName, isEdit: false };
      const navigationExtras: NavigationExtras = { queryParams: obj };
      const navi = isFlipBook ? "/flipbook" : "/view-file-sync-pdf"
      return this.router.navigate([navi], navigationExtras);
    }

    if (b === 'docx' || b === 'doc' || detail.FileType === 'word') {
      this.toast.dismissToast();
      const obj = { Url: detail.UrlFileTemp, FileName: detail.FileName, isEdit: false };
      const navigationExtras: NavigationExtras = { queryParams: obj };
      return this.router.navigate(['/view-file-sync'], navigationExtras);
    }

    if (b === 'epub' || detail.FileType === 'epub') {
      this.toast.dismissToast();
      const obj = { Url: 'https://admin.metalearn.vn/' + detail.UrlFileTemp, FileName: detail.FileName };
      const navigationExtras: NavigationExtras = { queryParams: obj };
      return this.router.navigate(['/ebook'], navigationExtras);
    }

    if (detail.FileType === 'video') {
      this.toast.dismissToast();
      const obj = { Url: detail.UrlFileTemp, FileName: detail.FileName };
      const navigationExtras: NavigationExtras = { queryParams: obj };
      return this.router.navigate(['/message-view-video'], navigationExtras);
    }

    if (detail.FileType === 'audio') {
      this.toast.dismissToast();
      const obj = { Url: detail.UrlFileTemp, FileName: detail.FileName };
      const navigationExtras: NavigationExtras = { queryParams: obj };
      return this.router.navigate(['/message-view-audio'], navigationExtras);
    }

    if (b === 'xlsx' || b === 'xls' || detail.FileType === 'excel') {
      let rowData = {};
      let dataView = [];
      const jsonData = [];
      const body = (
        'url=' + detail.UrlFileTemp
      );
      this.service.postAPI(this.service.getHost() + 'ExcelViewer/GetDataFile', body)
        .subscribe((rs1: any) => {
          const result1 = rs1;
          this.toast.dismissToast();

          for (let i = 0; i < result1.length; i++) {
            for (let j = 0; j < result1[i].data.length; j++) {
              for (let z = 0; z < result1[i].data[j].length; z++) {
                rowData[z] = result1[i].data[j][z].value;
              }
              dataView.push(rowData);
              rowData = {};
            }
            jsonData.push({
              Name: result1[i].name,
              Data: dataView
            });
            dataView = [];
          }
          const navigationExtras: NavigationExtras = {
            queryParams: {
              detail: jsonData,
              FileName: detail.FileName,
              isEdit: false
            }
          };
          this.router.navigate(['/view-file-excel'], navigationExtras);
        }, error => {
        });
      return;
    }
    // view file pptx
    if (detail.FileType === 'pptx' && !detail.UrlPptx) {
      const body = (
        'path=' + detail.UrlFileTemp
      );
      this.service.postApiResultText(this.service.getHost() + 'MobileLogin/GetDocumentPptx', body)
        .subscribe((rs1: any) => {
          this.toast.dismissToast();
          const result1 = rs1;
          const obj = { Url: result1, FileName: detail.FileName, isEdit: false };
          const navigationExtras: NavigationExtras = { queryParams: obj };
          this.router.navigate(['/view-file-sync-pptx'], navigationExtras);
        });
      return;
    }
    if (detail.FileType === 'pptx' && detail.UrlPptx) {
      this.toast.dismissToast();
      const obj = { Url: detail.UrlPptx, FileName: detail.FileName, isEdit: false };
      const navigationExtras: NavigationExtras = { queryParams: obj };
      return this.router.navigate(['/view-file-sync-pdf'], navigationExtras);
    }
    else {
      // this.router.navigate(["/show-documents"], result.Object);
      this.service.messageError(this.translate.instant('EDMSRepositoryPage.HTML_OPEN_FILE'));
    }
  }
  listFileStorage = []
  viewFtpFile(detail, isFlipBook: boolean = false) {
    this.toast.showLoading60('Loading...').then(() => {
      this.service.postAPI(this.service.getHost() + 'MobileLogin/CreateTempFile', 'Id=' + detail.Id).
        subscribe(async (rs: any) => {
          // try {
          //   const url = rs.Object;
          //   detail.UrlFileTemp = url;
          //   detail.isCached = true;
          //   this.listFileStorage = await this.service.get('listFileStorage');
          //   this.listFileStorage.push(detail);
          //   this.service.set('listFileStorage', this.listFileStorage);
          //   this.service.messageSuccess(
          //     this.translate.instant('LMS_QUIZ.HTML_DOWNLOAD_SUCCESS')
          //   );
          // } catch (err) {
          //   console.error(err);

          //   this.service.messageError(
          //     this.translate.instant('LMS_QUIZ.HTML_DOWNLOAD_ERROR')
          //   );
          // }
          const result = rs;
          const a = detail.FileName.split('.');
          const b: string = (a[a.length - 1] as string).toLowerCase();
          //format support
          if (detail.FileTypePhysic === '.doc' || detail.FileTypePhysic === '.docx') {
            detail.FileType = 'word';
          }
          else if (detail.FileTypePhysic === '.xlsx' || detail.FileTypePhysic === '.xlsm' || detail.FileTypePhysic === '.xls') {
            detail.FileType = 'excel';
          }
          else if (detail.FileTypePhysic === '.pptx' || detail.FileTypePhysic === '.pptm' || detail.FileTypePhysic === '.ppt') {
            detail.FileType = 'pptx';
          }
          else if (detail.FileTypePhysic === '.pdf') {
            detail.FileType = 'pdf';
          }
          else if (detail.FileTypePhysic === '.epub') {
            detail.FileType = 'epub';
          }
          else if (detail.FileTypePhysic === '.txt') {
            detail.FileType = 'text';
          }
          else if (detail.FileTypePhysic === '.zip' || detail.FileTypePhysic === '.rar') {
            detail.FileType = 'zip';
          }
          else if ((detail.MimeType?.indexOf('image/') ?? -1) !== -1) {
            detail.FileType = 'image';
          }
          else if ((detail.MimeType?.indexOf('audio/') ?? -1) !== -1) {
            detail.FileType = 'audio';
          }
          else if ((detail.MimeType?.indexOf('video/') ?? -1) !== -1) {
            detail.FileType = 'video';
          }
          else {
            detail.FileType = 'other';
          }

          const imageType: string[] = ['png', 'jpg', 'gif', 'tiff', 'bmp'];
          if (imageType.indexOf(b) !== -1 || detail.FileType === 'image') {
            this.toast.dismissToast();
            const obj = { Url: result.Object, FileName: detail.FileName };
            const navigationExtras: NavigationExtras = { queryParams: obj };
            return this.router.navigate(['/message-view-imgage'], navigationExtras);
          }

          if (b === 'pdf' || detail.FileType === 'pdf') {
            this.toast.dismissToast();
            const obj = { Url: result.Object, FileName: detail.FileName, isEdit: false };
            const navigationExtras: NavigationExtras = { queryParams: obj };
            const navi = isFlipBook ? "/flipbook" : "/view-file-sync-pdf"
            return this.router.navigate([navi], navigationExtras);
          }

          if (b === 'docx' || b === 'doc' || detail.FileType === 'word') {
            this.toast.dismissToast();
            const obj = { Url: result.Object, FileName: detail.FileName, isEdit: false };
            const navigationExtras: NavigationExtras = { queryParams: obj };
            return this.router.navigate(['/view-file-sync'], navigationExtras);
          }

          if (b === 'epub' || detail.FileType === 'epub') {
            this.toast.dismissToast();
            const obj = { Url: 'https://admin.metalearn.vn/' + result.Object, FileName: detail.FileName };
            const navigationExtras: NavigationExtras = { queryParams: obj };
            return this.router.navigate(['/ebook'], navigationExtras);
          }

          if (detail.FileType === 'video') {
            this.toast.dismissToast();
            const obj = { Url: result.Object, FileName: detail.FileName };
            const navigationExtras: NavigationExtras = { queryParams: obj };
            return this.router.navigate(['/message-view-video'], navigationExtras);
          }

          if (detail.FileType === 'audio') {
            this.toast.dismissToast();
            const obj = { Url: result.Object, FileName: detail.FileName };
            const navigationExtras: NavigationExtras = { queryParams: obj };
            return this.router.navigate(['/message-view-audio'], navigationExtras);
          }

          if (b === 'xlsx' || b === 'xls' || detail.FileType === 'excel') {
            let rowData = {};
            let dataView = [];
            const jsonData = [];
            const body = (
              'url=' + result.Object
            );
            this.service.postAPI(this.service.getHost() + 'ExcelViewer/GetDataFile', body)
              .subscribe((rs1: any) => {
                const result1 = rs1;
                this.toast.dismissToast();

                for (let i = 0; i < result1.length; i++) {
                  for (let j = 0; j < result1[i].data.length; j++) {
                    for (let z = 0; z < result1[i].data[j].length; z++) {
                      rowData[z] = result1[i].data[j][z].value;
                    }
                    dataView.push(rowData);
                    rowData = {};
                  }
                  jsonData.push({
                    Name: result1[i].name,
                    Data: dataView
                  });
                  dataView = [];
                }
                const navigationExtras: NavigationExtras = {
                  queryParams: {
                    detail: jsonData,
                    FileName: detail.FileName,
                    isEdit: false
                  }
                };
                this.router.navigate(['/view-file-excel'], navigationExtras);
              }, error => {
              });
            return;
          }
          // view file pptx
          if (detail.FileType === 'pptx' && !detail.UrlPptx) {
            const body = (
              'path=' + result.Object
            );
            this.service.postApiResultText(this.service.getHost() + 'MobileLogin/GetDocumentPptx', body)
              .subscribe((rs1: any) => {
                this.toast.dismissToast();
                const result1 = rs1;
                const obj = { Url: result1, FileName: detail.FileName, isEdit: false };
                const navigationExtras: NavigationExtras = { queryParams: obj };
                this.router.navigate(['/view-file-sync-pptx'], navigationExtras);
              });
            return;
          }
          if (detail.FileType === 'pptx' && detail.UrlPptx) {
            this.toast.dismissToast();
            const obj = { Url: detail.UrlPptx, FileName: detail.FileName, isEdit: false };
            const navigationExtras: NavigationExtras = { queryParams: obj };
            return this.router.navigate(['/view-file-sync-pdf'], navigationExtras);
          }
          else {
            // this.router.navigate(["/show-documents"], result.Object);
            this.service.messageError(this.translate.instant('EDMSRepositoryPage.HTML_OPEN_FILE'));
          }

        }, error => {
          this.service.messageError(this.translate.instant('EDMSRepositoryPage.HTML_FILE_NOT_EXIST'));
        });
    });
  }
  viewFtpFilePdf(detail) {
    this.toast.showLoading60('Loading...').then(() => {
      this.service.postAPI(this.service.getHost() + 'MobileLogin/CreateTempFile', 'Id=' + detail.Id).
        subscribe((rs: any) => {
          const result = rs;
          const a = detail.FileName.split('.');
          const b: string = (a[a.length - 1] as string).toLowerCase();
          //format support
          if (detail.FileTypePhysic === '.doc' || detail.FileTypePhysic === '.docx') {
            detail.FileType = 'word';
          }
          else if (detail.FileTypePhysic === '.xlsx' || detail.FileTypePhysic === '.xlsm' || detail.FileTypePhysic === '.xls') {
            detail.FileType = 'excel';
          }
          else if (detail.FileTypePhysic === '.pptx' || detail.FileTypePhysic === '.pptm' || detail.FileTypePhysic === '.ppt') {
            detail.FileType = 'pptx';
          }
          else if (detail.FileTypePhysic === '.pdf') {
            detail.FileType = 'pdf';
          }
          else if (detail.FileTypePhysic === '.epub') {
            detail.FileType = 'epub';
          }
          else if (detail.FileTypePhysic === '.txt') {
            detail.FileType = 'text';
          }
          else if (detail.FileTypePhysic === '.zip' || detail.FileTypePhysic === '.rar') {
            detail.FileType = 'zip';
          }
          else if ((detail.MimeType?.indexOf('image/') ?? -1) !== -1) {
            detail.FileType = 'image';
          }
          else if ((detail.MimeType?.indexOf('audio/') ?? -1) !== -1) {
            detail.FileType = 'audio';
          }
          else if ((detail.MimeType?.indexOf('video/') ?? -1) !== -1) {
            detail.FileType = 'video';
          }
          else {
            detail.FileType = 'other';
          }

          const imageType: string[] = ['png', 'jpg', 'gif', 'tiff', 'bmp'];
          if (imageType.indexOf(b) !== -1 || detail.FileType === 'image') {
            this.toast.dismissToast();
            const obj = { Url: result.Object, FileName: detail.FileName };
            const navigationExtras: NavigationExtras = { queryParams: obj };
            return this.router.navigate(['/message-view-imgage'], navigationExtras);
          }

          if (b === 'pdf' || detail.FileType === 'pdf') {
            this.toast.dismissToast();
            const obj = { Url: result.Object, FileName: detail.FileName, isEdit: false };
            const navigationExtras: NavigationExtras = { queryParams: obj };
            return this.router.navigate(['/view-file-sync-pdf'], navigationExtras);
          }

          if (b === 'docx' || b === 'doc' || detail.FileType === 'word') {
            const body = (
              'filePath=' + result.Object
            );
            this.service.postApiResultText(this.service.getHost() + 'MobileLogin/GetDocumentDocx', body)
              .subscribe((rs1: any) => {
                this.toast.dismissToast();
                const result1 = rs1;
                const obj = { Url: result1, FileName: detail.FileName, isEdit: false };
                const navigationExtras: NavigationExtras = { queryParams: obj };
                this.router.navigate(['/view-file-sync-pptx'], navigationExtras);
              });
            return;
          }

          if (b === 'epub' || detail.FileType === 'epub') {
            this.toast.dismissToast();
            const obj = { Url: 'https://admin.metalearn.vn/' + result.Object, FileName: detail.FileName };
            const navigationExtras: NavigationExtras = { queryParams: obj };
            return this.router.navigate(['/ebook'], navigationExtras);
          }

          if (detail.FileType === 'video') {
            this.toast.dismissToast();
            const obj = { Url: result.Object, FileName: detail.FileName };
            const navigationExtras: NavigationExtras = { queryParams: obj };
            return this.router.navigate(['/message-view-video'], navigationExtras);
          }

          if (detail.FileType === 'audio') {
            this.toast.dismissToast();
            const obj = { Url: result.Object, FileName: detail.FileName };
            const navigationExtras: NavigationExtras = { queryParams: obj };
            return this.router.navigate(['/message-view-audio'], navigationExtras);
          }

          if (b === 'xlsx' || b === 'xls' || detail.FileType === 'excel') {
            const body = (
              'filePath=' + result.Object
            );
            this.service.postApiResultText(this.service.getHost() + 'MobileLogin/GetDocumentExcel', body)
              .subscribe((rs1: any) => {
                this.toast.dismissToast();
                const result1 = rs1;
                const obj = { Url: result1, FileName: detail.FileName, isEdit: false };
                const navigationExtras: NavigationExtras = { queryParams: obj };
                this.router.navigate(['/view-file-sync-pptx'], navigationExtras);
              });
            return;
          }
          // view file pptx
          if (detail.FileType === 'pptx' && !detail.UrlPptx) {
            const body = (
              'path=' + result.Object
            );
            this.service.postApiResultText(this.service.getHost() + 'MobileLogin/GetDocumentPptx', body)
              .subscribe((rs1: any) => {
                this.toast.dismissToast();
                const result1 = rs1;
                const obj = { Url: result1, FileName: detail.FileName, isEdit: false };
                const navigationExtras: NavigationExtras = { queryParams: obj };
                this.router.navigate(['/view-file-sync-pptx'], navigationExtras);
              });
            return;
          }
          if (detail.FileType === 'pptx' && detail.UrlPptx) {
            this.toast.dismissToast();
            const obj = { Url: detail.UrlPptx, FileName: detail.FileName, isEdit: false };
            const navigationExtras: NavigationExtras = { queryParams: obj };
            return this.router.navigate(['/view-file-sync-pdf'], navigationExtras);
          }
          else {
            // this.router.navigate(["/show-documents"], result.Object);
            this.service.messageError(this.translate.instant('EDMSRepositoryPage.HTML_OPEN_FILE'));
          }

        }, error => {
          this.service.messageError(this.translate.instant('EDMSRepositoryPage.HTML_FILE_NOT_EXIST'));
        });
    });
  }

  async editDocument(detail) {
    const timeStart = moment().format('DD/MM/YYYY HH:mm:ss');
    this.service.startReadDocument(detail.TaskCode, detail.FileCode, timeStart);
    this.trackingFileId = (detail.Id as number | string).toString();
    if (detail.ReposType === 'DRIVER') {
      this.editDriveFile(detail);
      this.service.trackDiligence(this.service.taskCode, this.service.fileCode);
    }
    else {
      this.editFtpFile(detail);
    }
  }
  editDriveFile(detail) {
    if (detail.FileType === 'word') {
      const uri = 'https://docs.google.com/document/d/' + detail.CloudFileId + '/edit?usp=sharing';
      if (this.platform.is('android') || this.platform.is('desktop')) {
        this.sendIntent(uri);
      } else {
        this.openUriIos(uri);
      }
    }
    else if (detail.FileType === 'excel') {
      const uri = 'https://docs.google.com/spreadsheets/d/' + detail.CloudFileId + '/edit?usp=sharing';
      if (this.platform.is('android') || this.platform.is('desktop')) {
        this.sendIntent(uri);
      } else {
        this.openUriIos(uri);
      }
    }
    else if (detail.FileType === 'pptx') {
      const uri = 'https://docs.google.com/presentation/d/' + detail.CloudFileId + '/edit?usp=sharing';
      if (this.platform.is('android') || this.platform.is('desktop')) {
        this.sendIntent(uri);
      } else {
        this.openUriIos(uri);
      }
    }
    else {
      const uri = 'https://drive.google.com/file/d/' + detail.CloudFileId + '/edit?usp=sharing';
      if (this.platform.is('android') || this.platform.is('desktop')) {
        this.sendIntent(uri);
      } else {
        this.openUriIos(uri);
      }
    }
  }
  editFtpFile(detail) {
    this.toast.showLoading('Loading...').then(() => {
      this.service.postAPI(this.service.getHost() + 'MobileLogin/CreateTempFile', 'Id=' + detail.Id).
        subscribe((rs: any) => {
          const result = rs;
          const a = detail.FileName.split('.');
          const b: string = (a[a.length - 1] as string).toLowerCase();

          const imageType: string[] = ['png', 'jpg', 'gif', 'tiff', 'bmp'];
          if (imageType.indexOf(b) !== -1) {
            this.toast.dismissToast();
            const obj = { Url: result.Object, FileName: detail.FileName };
            const navigationExtras: NavigationExtras = { queryParams: obj };
            return this.router.navigate(['/message-view-imgage'], navigationExtras);
          }

          if (b === 'pdf') {
            this.toast.dismissToast();
            const obj = { Url: result.Object, FileName: detail.FileName, isEdit: true };
            const navigationExtras: NavigationExtras = { queryParams: obj };
            return this.router.navigate(['/view-file-sync-pdf'], navigationExtras);
          }

          if (b === 'docx' || b === 'doc') {
            this.toast.dismissToast();
            const obj = { Url: result.Object, FileName: detail.FileName, isEdit: true };
            const navigationExtras: NavigationExtras = { queryParams: obj };
            return this.router.navigate(['/view-file-sync'], navigationExtras);
          }

          if (b === 'epub') {
            this.toast.dismissToast();
            const obj = { Url: 'https://admin.metalearn.vn/' + result.Object, FileName: detail.FileName };
            const navigationExtras: NavigationExtras = { queryParams: obj };
            return this.router.navigate(['/ebook'], navigationExtras);
          }

          if (b === 'xlsx' || b === 'xls') {
            let rowData = {};
            let dataView = [];
            const jsonData = [];
            const body = (
              'url=' + result.Object
            );
            this.service.postAPI(this.service.getHost() + 'ExcelViewer/GetDataFile', body)
              .subscribe((rs1: any) => {
                this.toast.dismissToast();
                const result1 = rs1;

                for (let i = 0; i < result1.length; i++) {
                  for (let j = 0; j < result1[i].data.length; j++) {
                    for (let z = 0; z < result1[i].data[j].length; z++) {
                      rowData[z] = result1[i].data[j][z].value;
                    }
                    dataView.push(rowData);
                    rowData = {};
                  }
                  jsonData.push({
                    Name: result1[i].name,
                    Data: dataView
                  });
                  dataView = [];
                }
                const navigationExtras: NavigationExtras = {
                  queryParams: {
                    detail: jsonData,
                    FileName: detail.FileName,
                    isEdit: true
                  }
                };
                this.router.navigate(['/view-file-excel'], navigationExtras);
              }, error => {
              });
            return;
          }
          else {
            // this.router.navigate(["/show-documents"], result.Object);
            this.service.messageError(this.translate.instant('EDMSRepositoryPage.HTML_OPEN_FILE'));
          }
        }, error => {
          this.service.messageError(this.translate.instant('EDMSRepositoryPage.HTML_FILE_NOT_EXIST'));
        });
    });
  }
  //Open app android
  sendIntent(uri) {
    const optionsLaunch: AppLauncherOptions = {
      packageName: 'com.google.android.apps.docs',
      uri
    };
    this.appLauncher.canLaunch(optionsLaunch)
      .then((canLaunch: boolean) => {
        this.appLauncher.launch(optionsLaunch).then(() => {
          console.log('success');
        }).catch((err) => {
          console.log('failed: ', err);
        });
      })
      .catch(async (error: any) => {
        console.log('No app available');
        // const chooseModal = await this.modalCtrl.create({
        //   component: ModalLinkAppMessagePage,
        //   componentProps: {
        //   },
        //   cssClass: "modalmesss"
        // });
        // chooseModal.onDidDismiss().then((rs: any) => {
        // });
        // return await chooseModal.present();
      });
  }
  //Open app IOS
  openUriIos(uri) {
    launcher.uriLaunch(uri);
  }
  async readDocument(detail) {
    const timeStart = moment().format('DD/MM/YYYY HH:mm:ss');
    this.service.startReadDocument(detail.TaskCode, detail.FileCode, timeStart);
    this.toast.showLoading('Loading...').then(() => {
      this.service.postAPI(this.service.getHost() + 'MobileLogin/CreateTempFile', 'Id=' + detail.Id).
        subscribe((rs1: any) => {
          const result = rs1;
          const a = detail.FileName.split('.');
          const b: string = (a[a.length - 1] as string).toLowerCase();
          this.toast.dismissToast();
          console.log('result, a, b, detail', result, a, b, detail);
          const obj = { Url: result.Object, FileName: detail.FileName, Detail: detail };
          const navigationExtras: NavigationExtras = { queryParams: obj };
          return this.router.navigate(['/audio-book'], navigationExtras);
        }, error => {
          this.service.messageError(this.translate.instant('EDMSRepositoryPage.HTML_FILE_NOT_EXIST'));
        });
    });
  }
  async shareDocument(detail) {
    this.service.postAPI(this.service.getHost() + 'MobileLogin/CreateTempFile', 'Id=' + detail.Id).
      subscribe((rs1: any) => {

        const result = rs1;
        const listUrl = result.Object.split(' ');
        let str = listUrl[0];
        for (let i = 0; i < listUrl.length - 1; i++) {
          str += '%20' + listUrl[i + 1];
        }
        this.socialSharing.share(detail.FileName, 'subject', null, this.service.getHost() + str);
      }, error => {
        this.service.messageError(this.translate.instant('EDMSRepositoryPage.HTML_FILE_NOT_EXIST'));
      });
  }
  downloadAndCacheFile(detail) {
    return new Promise<string>((resolve, reject) => {
      this.toast.showLoading('Loading...').then(() => {
        this.service.postAPI(this.service.getHost() + 'MobileLogin/CreateTempFile', 'Id=' + detail.Id).
          subscribe(async (rs1: any) => {
            const result = rs1;
            const a = detail.FileName.split('.');
            const b: string = (a[a.length - 1] as string).toLowerCase();
            this.toast.dismissToast();
            console.log('result, a, b, detail', result, a, b, detail);
            let listFile = [];
            try {
              listFile = await this.service.get('listFile');
            } catch (error) {
              console.log(error);
            }
            const indexEntry = listFile ? listFile.findIndex(x => x.id === detail.Id) : -1;
            if (indexEntry === -1) {
              let objectFile: Blob;
              try {
                objectFile = await this.service.downloadFile(this.service.getHost() + result.Object).toPromise();
              } catch (error) {
                console.log(error);
                reject('Download file failed');
              }
              if (this.platform.is('capacitor')) {
                let fileEntry: FileEntry;
                try {
                  fileEntry = await this.file.writeFile(
                    this.file.dataDirectory,
                    detail.FileName,
                    objectFile,
                    { replace: true }
                  );
                } catch (error) {
                  console.log(error);
                  reject('Write file failed');
                }
                console.log(detail);
                const cacheEntry = {
                  id: detail.Id,
                  timeCache: new Date(),
                  url: fileEntry.nativeURL
                };
                if (!listFile) {
                  listFile = [];
                }
                listFile.push(cacheEntry);
                await this.service.set('listFile', listFile);
                resolve(fileEntry.nativeURL);
              }
              else {
                reject('Not cordova');
              }
            }
            else {
              const url = listFile[indexEntry].url;
              resolve(url);
            }
          }, async (error) => {
            this.service.messageError(this.translate.instant('EDMSRepositoryPage.HTML_FILE_NOT_EXIST'));
            await this.toast.dismissAllLoaders();
            reject('Create temp file failed');
          });
      });
    });
  }
  async openFileFromCacheUrl(detail) {
    let arrayBuffer: ArrayBuffer;
    try {
      arrayBuffer = await this.file.readAsArrayBuffer(this.file.dataDirectory, detail.FileName);
    } catch (error) {
      console.log(error);
      return 'failed to read file';
    }
    if (detail.FileType === 'pdf') {
      const fileEntry = new Blob([arrayBuffer], { type: 'application/pdf' });
      console.log(fileEntry);
      const obj = { fileName: detail.FileName, isEdit: false, fileEntry };
      const navigationExtras: NavigationExtras = { queryParams: obj };
      await this.toast.dismissAllLoaders();
      this.router.navigate(['/view-file-drive-pdf'], navigationExtras);
      return 'success';
    }
    return 'not supported';
  }
  async openMediaFromCacheUrl(detail) {
    // let arrayBuffer: ArrayBuffer;
    // try {
    //   arrayBuffer = await this.file.readAsArrayBuffer(this.file.dataDirectory, detail.FileName);
    // } catch (error) {
    //   console.log(error);
    //   return 'failed to read file';
    // }

    if (detail.FileType === 'image') {
      // const mimeType = detail.MimeType ?? 'image/png';
      // const blob = new Blob([arrayBuffer], { type: mimeType });
      const url = `https://drive.google.com/uc?id=${detail.CloudFileId}`;
      const obj = { Url: url, Mode: 'absolute', FileName: detail.FileName };
      const navigationExtras: NavigationExtras = { queryParams: obj };
      return this.router.navigate(['/message-view-imgage'], navigationExtras);
    }
    if (detail.FileType === 'video') {
      const url = `https://drive.google.com/uc?id=${detail.CloudFileId}`;
      const obj = { Url: url, Mode: 'absolute', FileName: detail.FileName };
      const navigationExtras: NavigationExtras = { queryParams: obj };
      return this.router.navigate(['/message-view-video'], navigationExtras);
    }

    if (detail.FileType === 'audio') {
      const url = `https://drive.google.com/uc?id=${detail.CloudFileId}`;
      const obj = { Url: url, Mode: 'absolute', FileName: detail.FileName };
      const navigationExtras: NavigationExtras = { queryParams: obj };
      return this.router.navigate(['/message-view-audio'], navigationExtras);
    }

    return 'not supported';
  }
  async blobToBase64(myBlob) {
    return new Promise<string>((resolve, reject) => {
      const reader = new window.FileReader();
      //read the blob data
      try {
        reader.readAsDataURL(myBlob);
      } catch (error) {
        console.log(error);
        reject(error as string);
      }
      reader.onloadend = () => {
        const base64data = reader.result as string;
        resolve(base64data);
      };
    });
  }
  getJsonFromServer(detail, object) {
    return new Promise<any[] | string>((resolve, reject) => {
      if (detail.FileType === 'excel') {
        let rowData = {};
        let dataView = [];
        const jsonData = [];
        const body = (
          'url=' + object
        );
        this.service.postAPI(this.service.getHost() + 'ExcelViewer/GetDataFile', body)
          .subscribe(async (rs2: any) => {
            const result1 = rs2;
            for (let i = 0; i < result1.length; i++) {
              for (let j = 0; j < result1[i].data.length; j++) {
                for (let z = 0; z < result1[i].data[j].length; z++) {
                  rowData[z] = result1[i].data[j][z].value;
                }
                dataView.push(rowData);
                rowData = {};
              }
              jsonData.push({
                Name: result1[i].name,
                Data: dataView
              });
              dataView = [];
            }
            resolve(jsonData);
          }, error => {
            reject('Get data file failed');
          });
      }
      if (detail.FileType === 'pptx') {
        const body = (
          'path=' + object
        );
        this.service.postApiResultText(this.service.getHost() + 'MobileLogin/GetDocumentPptx', body)
          .subscribe((rs1: any) => {
            const result1 = rs1;
            resolve(result1);
          }, error => {
            reject('Get data file failed');
          });
      }
      if (detail.FileType === 'word') {
        this.service.postAPI(this.service.getHost() + 'MobileLogin/Import', 'filePath=' + object)
          .subscribe((rs1: any) => {
            const result1 = rs1;
            resolve(result1);
          }, error => {
            reject('Get data file failed');
          });
      }
    });
  }
  downloadAndCacheJson(detail) {
    return new Promise<any>((resolve, reject) => {
      this.toast.showLoading('Loading...').then(() => {
        this.service.postAPI(this.service.getHost() + 'MobileLogin/CreateTempFile', 'Id=' + detail.Id).
          subscribe(async (rs1: any) => {
            const result = rs1;
            const a = detail.FileName.split('.');
            const b: string = (a[a.length - 1] as string).toLowerCase();
            this.toast.dismissToast();
            console.log('result, a, b, detail', result, a, b, detail);
            let listFileJson = [];
            try {
              listFileJson = await this.service.get('listFileJson');
            } catch (error) {
              console.log(error);
            }
            const indexEntry = listFileJson ? listFileJson.findIndex(x => x.id === detail.Id) : -1;
            if (indexEntry === -1) {
              let json;
              try {
                json = await this.getJsonFromServer(detail, result.Object);
              } catch (error) {
                console.log(error);
                reject('Get data file failed');
              }
              const cacheEntry = {
                id: detail.Id,
                timeCache: new Date(),
                json
              };
              if (!listFileJson) {
                listFileJson = [];
              }
              listFileJson.push(cacheEntry);
              await this.service.set('listFileJson', listFileJson);
              resolve(json);
            }
            else {
              const json = listFileJson[indexEntry].json;
              resolve(json);
            }
          }, async (error) => {
            this.service.messageError(this.translate.instant('EDMSRepositoryPage.HTML_FILE_NOT_EXIST'));
            await this.toast.dismissAllLoaders();
            reject('Create temp file failed');
          });
      });
    });
  }
  async downloadAndOpenDocument(detail) {
    const timeStart = moment().format('DD/MM/YYYY HH:mm:ss');
    this.service.startReadDocument(detail.TaskCode, detail.FileCode, timeStart);
    this.toast.showLoading('Loading...').then(() => {
      this.service.postAPI(this.service.getHost() + 'MobileLogin/CreateTempFile', 'Id=' + detail.Id).
        subscribe(async (rs1: any) => {
          const result = rs1;
          const a = detail.FileName.split('.');
          const b: string = (a[a.length - 1] as string).toLowerCase();
          this.toast.dismissToast();
          console.log('result, a, b, detail', result, a, b, detail);
          const objectFile: Blob = await this.service.downloadFile(this.service.getHost() + result.Object).toPromise();
          if (this.platform.is('capacitor')) {
            const fileEntry: FileEntry = await this.file.writeFile(
              this.file.dataDirectory,
              detail.FileName,
              objectFile,
              { replace: true }
            );
            try {
              // var result = await this.socialSharing.share(undefined, undefined, this.fileEntry.nativeURL, undefined);
              const openRs = await this.fileOpener
                .open(fileEntry.nativeURL, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
              console.log(result);
            } catch (error) {
              console.log(error);
            }
          }
        }, async (error) => {
          this.service.messageError(this.translate.instant('EDMSRepositoryPage.HTML_FILE_NOT_EXIST'));
          await this.toast.dismissAllLoaders();
        });
    });
  }
  async trackingDoc(id: string, page: TrackingPage, totalPage = 1) {
    let listDocTrackingPage: DocTrackingPage[] = [];
    try {
      listDocTrackingPage = await this.service.get('listDocTrackingPage');
    } catch (error) {
      console.log(error);
    }
    listDocTrackingPage = listDocTrackingPage ? listDocTrackingPage : [];
    const indexFile = listDocTrackingPage.findIndex(x => x.id === id);
    if (indexFile === -1) {
      const obj: DocTrackingPage = {
        id,
        listPage: [page],
        totalPage: totalPage
      };
      listDocTrackingPage.push(obj);
      console.log(obj);
    }
    else {
      const indexPage = listDocTrackingPage[indexFile].listPage.findIndex(x => x.pageNo === page.pageNo);
      if (indexPage === -1) {
        listDocTrackingPage[indexFile].listPage.push(page);
        console.log(listDocTrackingPage[indexFile]);
      }
      else {
        listDocTrackingPage[indexFile].listPage[indexPage].time = page.time;
      }
      if (totalPage !== 1) {
        listDocTrackingPage[indexFile].totalPage = totalPage;
      }
    }
    await this.service.set('listDocTrackingPage', listDocTrackingPage);
  }
  async trackDiligence(taskCode, objCode) {
    const listTrackDiligent = [];
    const listPracticeResult = [];
    // var userResult = this.listUserResult[index];
    // var correctAnswer = this.getCorrectAnswer(index);
    let listDocTrackingPage: DocTrackingPage[] = [];
    try {
      listDocTrackingPage = await this.service.get('listDocTrackingPage');
    } catch (error) {
      console.log(error);
    }
    listDocTrackingPage = listDocTrackingPage ? listDocTrackingPage : [];
    const indexFile = listDocTrackingPage.findIndex(x => x.id === this.trackingFileId);
    let listPage = [];
    let countTick = 0;
    let totalTick = 1;
    if (indexFile !== -1) {
      listPage = listDocTrackingPage[indexFile].listPage.map(x => ({
        Page: x.pageNo,
        Time: x.time.toISOString()
      }));
      countTick = listPage.length;
      totalTick = listDocTrackingPage[indexFile].totalPage;
    }
    const objPracticeResult = {
      Id: 1, // will be changed in server side
      StartTime: this.service.timeStart,
      EndTime: moment().format('DD/MM/YYYY HH:mm:ss'),
      UserResult: '',
      CorrectResult: '',
      IsCorrect: '',
      Device: 'MOBILE',
      SessionCode: create_UUID(),
      NumSuggest: 0,
      TaskCode: taskCode,
      QuizType: 'FILE',
      QuizObjCode: '',
      TotalTick: totalTick,
      ListPage: listPage,
      CountTick: countTick,
    };
    listPracticeResult.push(objPracticeResult);
    const objTrackDilligent = {
      ObjectType: 'FILE',
      ObjectCode: objCode,
      ObjectResult: JSON.stringify(listPracticeResult)
    };
    listTrackDiligent.push(objTrackDilligent);
    const body =
      'sListDilligence=' + JSON.stringify(listTrackDiligent) +
      '&UserName=' + this.service.userName;
    this.service.postAPI(this.service.getHost() + 'MobileLogin/TrackDilligence', body).
      subscribe((rs: any) => {
        const result: any = rs;
        this.service.updateFileProgess();
      }, error => {

      });
  }
  createImageFromUrl(url) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      // windowCanvas.backgroundColor = '#ffffff';
      // const dataURL = windowCanvas.toDataURL();
      const img = document.createElement('img');
      img.src = url;
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        resolve(img);
      };
    });
  }
  scaleImageCenterWithRatio(imageObject, scale) {
    return new Promise<Blob>((resolve, reject) => {
      const newWidth = imageObject.width / 3;
      const newHeight = imageObject.height / 3;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const edgeWidth = newWidth > newHeight ? newHeight : newWidth;
      canvas.width = Math.ceil(edgeWidth * scale);
      canvas.height = Math.ceil(edgeWidth * scale);
      // Calculate the center position on the canvas
      const centerX = canvas.width / 2 - newWidth / 2;
      const centerY = canvas.height / 2 - newHeight / 2;
      // Draw the image in the center
      ctx.drawImage(imageObject, centerX, 10, newWidth, newHeight);
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        }
        else {
          reject(null);
        }
      });
    });
  }
  async uploadFileShareDeepLinkBlob(blob, fileName) {
    const url = 'https://me.metalearn.vn/upload';
    const formData = new FormData();
    formData.append('file', blob, `${fileName}.jpg`); // You can adjust the filename as needed

    // Use the Fetch API to upload the blob
    fetch(url, {
      method: 'POST',
      body: formData
    })
      .then(response => {
        if (response.ok) {
          // Handle a successful upload here
          console.log('Upload successful');
        } else {
          // Handle upload errors
          console.error('Upload failed');
        }
      })
      .catch(error => {
        // Handle fetch errors
        console.error('Error:', error);
      });
  }
  async uploadFileShareDeepLink(fileUrl, newFileName) {
    const url = 'https://me.metalearn.vn/upload';
    const filename = newFileName;
    console.log(`upload options: {
      fileKey: 'file',
      fileName: ${filename}.jpg,
      chunkedMode: false,
      mimeType: 'multipart/form-data'
    }`);
    const options = {
      fileKey: 'file',
      fileName: `${filename}.jpg`,
      chunkedMode: false,
      mimeType: 'multipart/form-data',
    };
    const fileTransfer: FileTransferObject = this.transfer.create();
    try {
      console.log(`try fileTransfer.upload(fileUrl: ${fileUrl}, url: ${url}, options: something)`);
      const rs = await fileTransfer.upload(fileUrl, url, options);
      console.log('upload resp', rs.response);

    } catch (error) {
      console.log(error);
    }
  }
  createImgName() {
    const now = new Date();

    const year = now.getFullYear().toString().padStart(4, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');

    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0');

    return `M${this.service.userName}${day}${month}${year}${hours}${minutes}${seconds}${milliseconds}`;
  }

  uploadFile(file: File) {
    this.uploadEvent.emit(file);
    this.isUploadingFile = true;
    this.uploadStatus = 'uploading';
    return new Promise<string>((resolve, reject) => {
      const progressSubscription = this.uploadProgressEvent.subscribe((info) => {
        this.uploadInfo = info;
      });
      const successSubscription = this.uploadSuccessEvent.subscribe(() => {
        successSubscription.unsubscribe();
        if (progressSubscription) {
          progressSubscription.unsubscribe();
        }
        this.isUploadingFile = false;
        console.log('Upload success');
        this.uploadStatus = 'success';
        resolve('Ok');
      });
      const failedSubscription = this.uploadFailedEvent.subscribe(() => {
        failedSubscription.unsubscribe();
        if (progressSubscription) {
          progressSubscription.unsubscribe();
        }
        this.isUploadingFile = false;
        console.log('Upload failed');
        this.uploadStatus = 'failed';
        reject('Failed');
      });
      // setTimeout(() => {
      //   resolve('Ok');
      // }, 1000);
    });
  }
  cancelUpload() {

  }
  getFileExtension(fileName) {
    const a = fileName.split('.');
    const b: string = (a[a.length - 1] as string).toLowerCase();
    return '.' + b;
  }
  getFileNameWithoutExtension(fileName) {
    const a = fileName.split('.');
    const b: string = (a[0] as string);
    return b;
  }
  getNameOfUri(uri) {
    const a = uri.split('/');
    const b: string = (a[a.length - 1] as string);
    return b;
  }
  /**
   * Format bytes as human-readable text.
   *
   * @param bytes Number of bytes.
   * @param si True to use metric (SI) units, aka powers of 1000. False to use
   *           binary (IEC), aka powers of 1024.
   * @param dp Number of decimal places to display.
   *
   * @return Formatted string.
   */
  humanFileSize(bytes, si = false, dp = 1) {
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
      return bytes + ' B';
    }

    const units = si
      ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10 ** dp;

    do {
      bytes /= thresh;
      ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


    return bytes.toFixed(dp) + ' ' + units[u];
  }
  getFileReader(): FileReader {
    const fileReader = new FileReader();
    const zoneOriginalInstance = (fileReader as any)["__zone_symbol__originalInstance"];
    return zoneOriginalInstance || fileReader;
  }
  async screenShot() {
    const name = this.createImgName();
    let newName = '';
    let res;
    if (this.platform.is('capacitor')) {
      try {
        await this.wait1sec();
        res = await this.screenshot.save('jpg', 80);
      } catch (error) {
        console.log(error);
        this.service.messageError(this.translate.instant('DO_EXAM.TS_ERROR_SCREENSHOT'));
      }
      if (res) {
        try {
          await this.wait1sec();
          await this.uploadFileShareDeepLink(res.filePath, name);
          await this.toast.showLoading60(`${this.translate.instant('DO_EXAM.TS_PROCESS_IMAGE')}...`);
          const url = `https://me.metalearn.vn/testImg/${name}.jpg`;
          const image = await this.createImageFromUrl(url);
          console.log('image', image);
          const blob = await this.scaleImageCenterWithRatio(image, 1);
          newName = this.createImgName();
          this.uploadFileShareDeepLinkBlob(blob, newName);
          // this.shareUrl(newName);
          // id = id.toString();
          // const funcCode = this.onlyDone ? 'lms_quiz' : 'lms_quiz_bank'; //Vì lấy 1 bản ghi nên k cần truyền môn học để gọi API
          // this.socialSharing.share(undefined, undefined, undefined,
          //   `https://metalearn.vn/me?func=${funcCode}&pin=${this.service.txtPinCode}&param=${this.subjectCode}` +
          //   `&id=${id}&param2=${this.onlyAssignment}&image=${newName ? newName : 'lms-quiz.png'}` +
          //   `&path=https://me.metalearn.vn/testImg`);
        } catch (error) {
          console.log(error);
          this.service.messageError(this.translate.instant('DO_EXAM.TS_ERROR_PROCESS_IMG'));
        }
      }
    }
    else {
      await this.wait3sec();
    }
    await this.toast.dismissAllLoaders();
    return newName + '.jpg';
  }
  wait3sec() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('Ok');
      }, 3000);
    });
  }
  wait1sec() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('Ok');
      }, 1000);
    });
  }
  async uploadImage() {
    this.acceptType = 'image/*';
    await this.wait01sec();
    this.inputFile.nativeElement.click();
    return new Promise<string>((resolve, reject) => {
      // const progressSubscription = this.uploadProgressEvent.subscribe((info) => {
      //   this.uploadInfo = info;
      // });
      const successSubscription = this.uploadSuccessEvent.subscribe(() => {
        successSubscription.unsubscribe();
        // if (progressSubscription) {
        //   progressSubscription.unsubscribe();
        // }
        // this.isUploadingFile = false;
        // console.log('Upload success');
        // this.uploadStatus = 'success';
        resolve(this.uploadResult);
      });
      const failedSubscription = this.uploadFailedEvent.subscribe(() => {
        failedSubscription.unsubscribe();
        // if (progressSubscription) {
        //   progressSubscription.unsubscribe();
        // }
        // this.isUploadingFile = false;
        // console.log('Upload failed');
        // this.uploadStatus = 'failed';
        reject('Failed');
      });
      // setTimeout(() => {
      //   resolve('Ok');
      // }, 1000);
    });
  }
  async openFile(fileName, fileUrl, mimeType) {
    if (this.platform.is('capacitor')) {
      let objectFile: Blob;
      try {
        objectFile = await lastValueFrom(this.service.downloadFile(fileUrl));
      } catch (error) {
        console.log(error);
        return;
      }
      try {
        const fileEntry = await this.file.writeFile(
          this.file.dataDirectory,
          fileName,
          objectFile,
          { replace: true }
        );
        // var result = await this.socialSharing.share(undefined, undefined, fileUrl, undefined);
        var openRs = await this.fileOpener.open(fileEntry.nativeURL, mimeType);
        console.log(openRs);
      } catch (error) {
        console.log(error);
      }
    }
    else {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;

      // Append the link to the body
      document.body.appendChild(link);

      // Trigger the download
      link.click();

      // Remove the link from the body
      document.body.removeChild(link);
    }
  }
  wait01sec() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('Ok');
      }, 100);
    });
  }
  async uploadFileWithType(type: string, endPoint = '', key = '', result = '') {
    this.acceptType = type;
    await this.wait01sec();
    this.inputFile.nativeElement.click();
    this.customEndpoint = endPoint;
    this.customKey = key;
    this.customResult = result;
    return new Promise<string>((resolve, reject) => {
      // const progressSubscription = this.uploadProgressEvent.subscribe((info) => {
      //   this.uploadInfo = info;
      // });
      const successSubscription = this.uploadSuccessEvent.subscribe(() => {
        successSubscription.unsubscribe();
        // if (progressSubscription) {
        //   progressSubscription.unsubscribe();
        // }
        // this.isUploadingFile = false;
        // console.log('Upload success');
        // this.uploadStatus = 'success';
        this.customEndpoint = '';
        this.customKey = '';
        this.customResult = '';
        resolve(this.uploadResult);
      });
      const failedSubscription = this.uploadFailedEvent.subscribe(() => {
        failedSubscription.unsubscribe();
        // if (progressSubscription) {
        //   progressSubscription.unsubscribe();
        // }
        // this.isUploadingFile = false;
        // console.log('Upload failed');
        // this.uploadStatus = 'failed';
        this.customEndpoint = '';
        this.customKey = '';
        this.customResult = '';
        reject('Failed');
      });
      // setTimeout(() => {
      //   resolve('Ok');
      // }, 1000);
    });
  }

  uploadFileAuto(file: File) {
    return new Promise<string>((resolve, reject) => {
      if (file.size / 1024 > 153600) {
        this.service.messageError(
          this.translate.instant(
            'PROJECTREPORTPAGE.PROJECTREPORTPAGE_NOTI_CHECK_FILE'
          )
        );
        reject('PROJECTREPORTPAGE.PROJECTREPORTPAGE_NOTI_CHECK_FILE');
      } else {
        // this.fileSupport.mimeType = event.target.files[0].type;
        // this.fileSupport.fileNameUpload = event.target.files[0].name;
        // this.fileUpload = $event.target.files[0];
        const body = new FormData();
        body.append('file', file);
        this.service
          .postApi(this.service.getHost() + 'MobileLogin/UploadFile', body)
          .subscribe({
            next: (result: any) => {
              const rs = result;
              const dataObject = rs.Object;
              if (rs.Error === false) {
                // this.InsertDocument(dataObject.FileName, dataObject.FilePath, this.ChkListCode);
                // this.ChkListCode = "";
                console.log(dataObject.FilePath);
                resolve(dataObject.FilePath);
                // this.updateImage(`/${dataObject.FilePath}`);
              } else {
                this.service.messageError(rs.Object.Title);
                reject(rs.Object.Title);
              }
            },
            error: (err) => {
              this.service.messageSuccess(this.translate.instant('NOTI.NOTI_CONNECTING'));
              reject('NOTI.NOTI_CONNECTING');
            }
          });
      }
    });
  }

  uploadFileBlog(file: File) {
    return new Promise<string>((resolve, reject) => {
      if (file.size / 1024 > 153600) {
        this.service.messageError(
          this.translate.instant(
            'PROJECTREPORTPAGE.PROJECTREPORTPAGE_NOTI_CHECK_FILE'
          )
        );
        reject('PROJECTREPORTPAGE.PROJECTREPORTPAGE_NOTI_CHECK_FILE');
      } else {
        // this.fileSupport.mimeType = event.target.files[0].type;
        // this.fileSupport.fileNameUpload = event.target.files[0].name;
        // this.fileUpload = $event.target.files[0];
        const body = new FormData();
        body.append('file', file);
        this.service
          .postApi(this.service.getHost() + 'MobileBlog/UploadFile', body)
          .subscribe({
            next: (result: any) => {
              const rs = result;
              const dataObject = rs.Object;
              if (rs.Error === false) {
                // this.InsertDocument(dataObject.FileName, dataObject.FilePath, this.ChkListCode);
                // this.ChkListCode = "";
                console.log(dataObject.FilePath);
                resolve(dataObject.FilePath);
                // this.updateImage(`/${dataObject.FilePath}`);
              } else {
                this.service.messageError(rs.Object.Title);
                reject(rs.Object.Title);
              }
            },
            error: (err) => {
              this.service.messageSuccess(this.translate.instant('NOTI.NOTI_CONNECTING'));
              reject('NOTI.NOTI_CONNECTING');
            }
          });
      }
    });
  }
}

export interface DocTrackingPage {
  id: string;
  listPage: TrackingPage[];
  totalPage: number;
}

export interface TrackingPage {
  pageNo: number;
  time: Date;
}

const create_UUID = () => {
  let dt = new Date().getTime();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
};
