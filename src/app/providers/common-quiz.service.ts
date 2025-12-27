import { Injectable } from '@angular/core';
import { ServiceService } from './service.service';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { SmartAudioService } from './smart-audio.service';

@Injectable({
  providedIn: 'root'
})
export class CommonQuizService {
  listDetail = [];
  listDetailBackup = [];
  listUserResult = [];
  listUserResultBackup = [];
  listUserResultGame = [];
  countQuizDone = 0;
  countQuizCorrect = 0;
  countQuizWrong = 0;
  countTotalQuiz = 0;
  countTotalTime = '';
  countTotalSuggest = 0;
  objectCode = '';
  code='';
  oldPage = '';
  title = '';
  lmsTaskCode = '';
  type = '';
  idTest = -1;
  countTry = 0;
  isAlreadyDone = false;
  isInit = false;
  isGameModal = false;
  modalObject: HTMLIonModalElement;
  indexQuiz = 0;
  isLoadAudio = false;
  constructor(
    private service: ServiceService,
    private translate: TranslateService,
    private smartAudio: SmartAudioService
  ) { }
  cleanDataAndInitService() {
    this.listDetail = [];
    this.listDetailBackup = [];
    this.listUserResult = [];
    this.listUserResultGame = [];
    this.listUserResultBackup = [];
    this.countQuizDone = 0;
    this.countQuizCorrect = 0;
    this.countQuizWrong = 0;
    this.countTotalQuiz = 0;
    this.countTotalTime = '';
    this.countTotalSuggest = 0;
    this.objectCode = '';
    this.oldPage = '';
    this.title = '';
    this.lmsTaskCode = '';
    this.type = '';
    this.idTest = -1;
    this.countTry = 0;
    this.indexQuiz = 0;
    this.isAlreadyDone = false;
    this.isGameModal = false;
    this.isInit = true;
  }
  async preloadAudioData() {
    if (this.isLoadAudio) {
      console.log('already load audio');
      return;
    }
    console.log('loading audio');
    await this.smartAudio.preload('resultCorrect', 'Right.mp3');
    await this.smartAudio.preload('resultWrong', 'Wrong.mp3');
    await this.smartAudio.preload('hint', 'Hint.mp3');
    await this.smartAudio.preload('snap', 'snap.mp3');
    await this.smartAudio.preload('check', 'check.mp3');
    await this.smartAudio.preload('incorrect', 'incorrect.mp3');
    await this.smartAudio.preload('correct', 'correct.mp3');
    await this.smartAudio.preload('keypress', 'keypress.mp3');
    this.isLoadAudio = true;
  }
  // @ViewChild('viewResult', { static: false }) viewResult: ElementRef;
  logResult(nextPage?) {
    let listDetail = this.listDetail.map(x => Object.assign({}, x));
    if (this.type === 'QUIZ') {
      listDetail = this.listDetailBackup;
    }
    let countQuizDone = 0;
    let countQuizNoAnswer = 0;
    let countQuizCorrect = 0;
    const countTotalQuiz = listDetail.length;
    let countTotalSuggest = 0;
    let countTotalTime = 0;
    let progressAuto = 0;
    let teacherApproved = 0;
    for (let i = 0; i < listDetail.length; i++) {
      try {
        // var correctAnswer = this.getCorrectAnswer(i).toString();
        const userResult = this.listUserResultBackup[i];
        console.log(userResult);
        if (userResult !== -1 && userResult !== '') {
          countQuizDone++;
          if (listDetail[i].Mark && listDetail[i].Mark > 0) {
            progressAuto += listDetail[i].Mark;
          }
          else {
            progressAuto += 0;
          }
          // var indexCorrect = correctAnswer.indexOf(userResult.toString());
          if (listDetail[i].isAnswerCorrected) {
            countQuizCorrect++;
            if (listDetail[i].Mark && listDetail[i].Mark > 0) {
              teacherApproved += listDetail[i].Mark;
            }
            else {
              teacherApproved += 0;
            }
          }
          if (listDetail[i].Type === 'QUIZ_888_REPLY_WORD') {
            countQuizNoAnswer++;
          }
        }
        if (listDetail[i].NumSuggest) {
          countTotalSuggest += listDetail[i].NumSuggest;
        }
        if (listDetail[i].duration) {
          countTotalTime += listDetail[i].duration;
        }
      } catch (error) {
        //console.log(error);
      }
    }
    this.countQuizDone = countQuizDone;
    this.countQuizCorrect = countQuizCorrect;
    this.countTotalQuiz = countTotalQuiz;
    this.countQuizWrong = countQuizDone - countQuizCorrect - countQuizNoAnswer;
    this.countTotalSuggest = countTotalSuggest;
    this.countTotalTime = moment.utc(countTotalTime * 1000).format('HH:mm:ss');
    // var element = this.viewResult.nativeElement as HTMLElement;
    // element.classList.add('run');
    // this.isViewResult = true;
    // this.countTotalTime = countTotalTime;
    const obj = {
      oldPage: this.oldPage,
      examName: this.title,
      objectCode: this.objectCode,
      idTest: this.idTest,
      type: this.type,
      progressAuto,
      teacherApproved,
      countQuizDone: this.countQuizDone,
      countTry: this.countTry,
      countQuizCorrect: this.countQuizCorrect,
      countQuizWrong: this.countQuizWrong,
      countTotalQuiz: this.countTotalQuiz,
      countTotalTime: this.countTotalTime,
      countTotalSuggest: this.countTotalSuggest,
      Code:this.code,
    };
    // if (nextPage === true) {
    //   this.logPage(obj);
    // }
    if (this.type === 'PRACTICE') {
      this.updateTestProgress();
    }
    else if (this.type === 'QUIZ') {
      this.updateQuizProgress();
    }
    else if (this.type === 'EXAM') {
      this.updateExamProgress();
    }
    if (this.isAlreadyDone !== true) {
      if (this.type === 'PRACTICE') {
        const body =
          'ItemCode=' + this.objectCode +
          '&LmsTaskCode=' + this.lmsTaskCode +
          '&ProgressAuto=' + progressAuto +
          '&TeacherApproved=' + teacherApproved +
          '&User=' + this.service.id;
        this.service.postAPI(this.service.getHost() + 'MobileLogin/UpdateDoingPracticeProgress', body).
          subscribe((rs: any) => {
            const result: any = rs;
            //console.log(result);
          }, error => {

          });
      }
    }
    return obj;
  }
  updateExamProgress() {
    const body =
      'createdBy=' +
      this.service.userName +
      '&userNameFilter=' +
      this.service.userName +
      '&examCodeFilter=' +
      this.objectCode;
    this.service
      .postAPI(this.service.getHost() + 'MobileLogin/UpdateExamProgess', body)
      .subscribe(
        (result: any) => {
          const rs = result;
          this.service.publish('RELOAD_EXAM_SCHEDULE_LIST');
        },
        (error) => {
          this.service.messageSuccess(this.translate.instant('NOTI.NOTI_CONNECTING'));
        }
      );
  }
  updateTestProgress() {
    const body =
      'createdBy=' +
      this.service.userName +
      '&userNameFilter=' +
      this.service.userName +
      '&testCodeFilter=' +
      this.objectCode;
    this.service
      .postAPI(this.service.getHost() + 'MobileLogin/UpdateTestProgess', body)
      .subscribe(
        (result: any) => {
          const rs = result;
          this.service.publish('RELOAD_BANK_EXAM');
        },
        (error) => {
          this.service.messageSuccess(this.translate.instant('NOTI.NOTI_CONNECTING'));
        }
      );
  }
  updateQuizProgress() {
    const body =
      'createdBy=' +
      this.service.userName +
      '&userNameFilter=' +
      this.service.userName +
      '&quizCodeFilter=' +
      this.objectCode;
    this.service
      .postAPI(this.service.getHost() + 'MobileLogin/UpdateQuizProgess', body)
      .subscribe(
        (result: any) => {
          const rs = result;
          // this.service.publish('RELOAD_BANK_QUIZ');
        },
        (error) => {
          this.service.messageSuccess(this.translate.instant('NOTI.NOTI_CONNECTING'));
        }
      );
  }
}
