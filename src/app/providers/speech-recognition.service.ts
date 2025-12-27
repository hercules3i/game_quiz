import { Injectable } from '@angular/core';
import { SpeechRecognition } from '@awesome-cordova-plugins/speech-recognition/ngx';
import { Platform } from '@ionic/angular';
import { type } from 'os';
import { ServiceService } from './service.service';
import { CommentSdkComponent } from '../components/comment-sdk/comment-sdk.component';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpeechRecognitionService {
  valueRecording = '';
  dem = 0;
  subscription: Subscription;
  constructor(
    public service: ServiceService,
    public platform: Platform,
    private speechRecognition: SpeechRecognition,
  ) { }
  startRecording(option: RecognitionOption) {
    if (!this.platform.is('capacitor')) {
      console.log('Not app');
      const arrcheck = [
        "mở tìm kiếm",
        "từ ngày 31 tháng 7 năm 2022 đến ngày 31 tháng 9 năm 2022",
        "nhân sự",
        "trạng thái",
        "tạo báo phép có",
        "đóng",
      ];
      this.testDisplayValueRecording(option.component, arrcheck);
      // Probably Browser
      // alert(this.translate.instant("CheckListWithCardPage.TS_ALERT_RECORD"));
    } else {
      // this.updateDisplayValueRecording('', type);
      this.speechRecognition.hasPermission().then((hasPermission: boolean) => {
        if (!hasPermission) {
          this.speechRecognition.requestPermission();
        } else {
          this.speechRecognition.isRecognitionAvailable().then(() => {
            // this.updateIsRecording(2, type);
            option.updateRecording(2);
            var listFilter = this.service.ListLanguage.filter(x => x.Code == this.service.language);
            let options = {
              language: listFilter.length > 0 ? listFilter[0].lang : "vi-VN",//mặc định tiếng Việt, nếu có giá trị sẽ thay đổi
              showPopup: false,
              showPartial: true,
            };
            this.subscription = this.speechRecognition.startListening(options).subscribe({
              next: (value) => {
                this.valueRecording = value[0];
                this.updateDislayValueRecording(option.component, this.valueRecording);
                // this.updateDisplayValueRecording(value[0], type);
                // if (this.valueRecording.length > 30) {
                //   var myArr = this.valueRecording.split(" ");
                //   for (let i = myArr.length - 1; i > 0; i--) {
                //     // this.displayValueRecording = " " + myArr[i] + this.displayValueRecording;
                //     // this.updateDisplayValueRecording(" " + myArr[i] + this.getDisplayValueRecording(type), type);
                //     // var displayValueRecording = this.getDisplayValueRecording(type);
                //     // if (displayValueRecording.length > 24) {
                //     //   var checkString = myArr[i + 1] + " " + this.getDisplayValueRecording(type);
                //     //   if (checkString.length > 30) {
                //     //     break;
                //     //   } else {
                //     //     // this.updateDisplayValueRecording(checkString, type);
                //     //     break;
                //     //   }
                //     // }
                //   }
                //   // this.updateDisplayValueRecording("..." + this.getDisplayValueRecording(type), type);
                // } else {
                //   // this.updateDisplayValueRecording(value[0], type);
                // }
                // this.updateIsRecording(2, type);
                option.updateRecording(2);
              },
              error: (error) => {
                // this.updateIsRecording(0, type);
                option.updateRecording(0);
              }
            });
          });
        }
      });
    }
  }
  async testDisplayValueRecording(component: CommentSdkComponent, arrayTxt: string[]) {
    for (const txt of arrayTxt) {
      component.replaceSelectionOrInsertText(txt);
      await this.wait1sec();
    }
    component.unselectAndMoveToLastPosition();
  }
  wait1sec() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('Ok');
      }, 1000);
    });
  }
  updateDislayValueRecording(component: CommentSdkComponent, value: string) {
    if (component) {
      component.replaceSelectionOrInsertText(value);
    }
  }
  stopRecording(option: RecognitionOption) {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.speechRecognition.stopListening().then(() => {
      // this.processValueRecordingComment(type);
      option.component.replaceSelectionOrInsertText(this.valueRecording);
      // option.processRecording();
      // this.updateIsRecording(0, type);
      option.updateRecording(0);
      this.valueRecording = '';
      // this.updateDisplayValueRecording('', type);
      option.component.unselectAndMoveToLastPosition();
    });
  }
}
export interface RecognitionOption {
  component: CommentSdkComponent;
  updateRecording: (value) => any;
  processRecording?: () => any;
}