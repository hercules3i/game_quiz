/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { ServiceService } from './service.service';
import { TranslateService } from '@ngx-translate/core';
import { ModalController, Platform } from '@ionic/angular';
import { Device } from '@awesome-cordova-plugins/device/ngx';
import { GameJsonService } from './game-manage.service';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { FacebookLogin } from '@capacitor-community/facebook-login';
import { MessageConfirmPage } from '../page/message-confirm/message-confirm.page';
import { AudioCategoryExtraParams } from '../page/audio-category/audio-category.page';
import { AudioCmsExtraParams } from '../page/audio-cms/audio-cms.page';
import { ChatWebsyncService } from './chat-websync.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DeeplinkService {
  imageTemp = '';
  appleIdentityToken = '';
  userName = '';
  oldEmail = '';
  oldDisplayName = '';
  lobbyList = [
    'do_quiz',
    'do_exam',
    'do_quiz_game',
    'do_exam_game',
  ];
  constructor(
    public service: ServiceService,
    private router: Router,
    private translate: TranslateService,
    public platform: Platform,
    public device: Device,
    private gameJson: GameJsonService,
    private websync: ChatWebsyncService,
    private modalCtrl: ModalController
  ) { }

  resolveImage(data) {
    console.log(data);
    let icon = '';
    try {
      const jsonData = JSON.parse(data);
      console.log(jsonData.func);
      const dataInput = jsonData;
      switch (dataInput.func) {
        case 'course_ware':
          icon = `iconFa_fa-exclamation.png`;
          break;
        case 'course_ware_bank':
          icon = `iconFa_fa-exclamation.png`;
          break;
        case 'do_quiz':
          icon = `iconFa_fa-piece.png`;
          break;
        case 'do_quiz_game':
          icon = `iconFa_fa-piece.png`;
          break;
        case 'lms_quiz':
          icon = `iconFa_fa-piece.png`;
          break;
        case 'lms_my_quiz':
          icon = `iconFa_fa-piece.png`;
          break;
        case 'lms_quiz_bank':
          icon = `iconFa_fa-piece.png`;
          break;
        case 'do_exam':
          icon = `iconFa_fa-question.png`;
          break;
        case 'do_exam_game':
          icon = `iconFa_fa-question.png`;
          break;
        case 'lms_exam':
          icon = `iconFa_fa-question.png`;
          break;
        case 'lms_exam_Bank':
          icon = `iconFa_fa-question.png`;
          break;
        case 'lms_task_home':
          icon = `iconFa_fa-clipboard.png`;
          break;
        case 'lms_task_work':
          icon = `iconFa_fa-clipboard.png`;
          break;
        case 'lms_task_noti':
          icon = `iconFa_fa-clipboard.png`;
          break;
        case 'lms_task_deli':
          icon = `iconFa_fa-clipboard.png`;
          break;
        case 'lms_task_doc':
          icon = `iconFa_fa-clipboard.png`;
          break;
        case 'lms_task_mess':
          icon = `iconFa_fa-clipboard.png`;
          break;
        case 'lms_task_result':
          icon = `iconFa_fa-clipboard.png`;
          break;
        case 'lms_exam_schedule':
          icon = `iconFa_fa-graduation.png`;
          break;
        case 'view-blog-item':
          icon = `iconFa_fa-clipboard.png`;
          break;
        case 'audio-content':
          icon = `iconFa_fa-clipboard.png`;
          break;
        case 'audio-content-video':
          icon = `iconFa_fa-clipboard.png`;
          break;
        case 'audio-category':
          icon = `iconFa_fa-clipboard.png`;
          break;
        case 'audio-category-video':
          icon = `iconFa_fa-clipboard.png`;
          break;
        case 'audio-cms':
          icon = `iconFa_fa-clipboard.png`;
          break;
        case 'family_tree_lunar_calender':
          icon = `iconFa_fa-clipboard.png`;
          break;
        case 'dash_board':
          icon = `iconFa_fa-home.png`;
          break;
        case 'family_tree_category':
          icon = `iconFa_fa-sitemap.png`;
          break;
        default:
          icon = `iconFa_fa-clipboard.png`;
          break;
      }
    } catch (error) {
      console.log(error);
    }
    return icon;
  }
  isInLobby(func: string) {
    return this.lobbyList.includes(func);
  }
  async handleDeeplink(body: DeeplinkBody) {
    console.log('handledeeplink', body.func);
    const listPinVendor = await this.service.get('listCompanyPin');
    const pinResult = listPinVendor.find(vendor => vendor.AppVendorCode?.toLowerCase() === body.pin?.toLowerCase());
    if (pinResult) { this.service.Host = pinResult.ServerAddress; }
    switch (body.func) {
      case 'cms':
        await this.handleCms(body.id);
        break;
      case 'lms_cmt':
        this.handleLmsCmt({ id: body.id, param: body.param });
        break;
      case 'lms_tutor_schedule':
        this.handleLmsTutorSchedule({ id: body.id, isPublic: false });
        break;
      case 'lms_tutor_schedule_public':
        this.handleLmsTutorSchedule({ id: body.id, isPublic: true });
        break;
      case 'lms_class_forum':
        this.handleLmsClassForum({ id: body.id });
        break;
      case 'family_tree_print_pdf':
        this.handleLmsFamilyTreePrintPdf({ id: body.id, nodeCode: body.param, familyCode: body.param2, fileName: body.param3 });
        break;
      case 'family_tree_print_pdf_bank':
        this.handleLmsFamilyTreePrintPdf({ id: body.id, nodeCode: body.param, familyCode: body.param2, fileName: body.param3 });
        break;
      case 'family_tree_detail':
        this.handleFamilyTreeDetail({ id: body.id, nodeCode: body.param, familyCode: body.param2, fileName: body.param3 });
        break;
      case 'family_tree_lunar_calender':
        this.handleFamilyTreeLunarCelendar({ id: body.id, type: body.param, eventDate: body.param2 });
        break;
      case 'lms_class_forum_tutor':
        this.handleLmsClassForumTutor({ id: body.id, idTutor: body.param, checkTutor: true });
        break;
      case 'lms_quiz':
        this.handleLmsQuiz({ id: body.id, onlyDone: true, OnlyAssignment: body.param2 === 'true', OnlyShared: body.param2 !== 'true' });
        break;
      case 'lms_my_quiz':
        this.handleLmsMyQuiz({ id: body.id, onlyDone: true, OnlyAssignment: body.param2 === 'true', OnlyShared: body.param2 !== 'true' });
        break;
      case 'lms_quiz_bank':
        this.handleLmsQuizBank({ id: body.id, Code: body.param, onlyDone: false });
        break;
      case 'course_ware':
        this.handleCourseWare({ id: body.id, param: body.param, onlyDone: true });
        break;
      case 'course_ware_bank':
        this.handleCourseWare({ id: body.id, param: body.param, onlyDone: false });
        break;
      case 'view_course':
        this.handleViewCourse({ id: body.id, isPublic: false });
        break;
      case 'view_course_public':
        this.handleViewCourse({ id: body.id, isPublic: true });
        break;
      case 'lms_task_home':
        this.openCardHome({ LmsTaskCode: body.id });
        break;
      case 'lms_task_noti':
        this.openCardNotification({ LmsTaskCode: body.id });
        break;
      case 'lms_task_work':
        this.openCardProgress({ LmsTaskCode: body.id });
        break;
      case 'lms_task_mess':
        this.openCardComment({ LmsTaskCode: body.id });
        break;
      case 'lms_task_doc':
        this.openCardFile({ LmsTaskCode: body.id });
        break;
      case 'lms_task_result':
        this.openCardResult({ LmsTaskCode: body.id });
        break;
      case 'lms_task_deli':
        this.openCardDeli({ LmsTaskCode: body.id });
        break;
      case 'chat':
        this.openChat({ GroupCode: body.id });
        break;
      case 'lms_exam':
        await this.handleLmsExam({
          id: body.id, onlyDone: true, OnlyAssignment: body.param2 === 'true',
          OnlyShared: body.param2 !== 'true'
        });
        break;
      case 'lms_exam_Bank':
        await this.handleLmsExamBank({ id: body.id, Code: body.param, onlyDone: false });
        break;

      case 'lms_stat_quizVoluntary':
        await this.handleLmsStat({ id: body.id, type: body.param });
        break;
      case 'lms_stat_quizAssignment':
        await this.handleLmsStat({ id: body.id, type: body.param });
        break;
      case 'lms_stat_lectureVoluntary':
        await this.handleLmsStat({ id: body.id, type: body.param });
        break;
      case 'lms_stat_lectureAssignment':
        await this.handleLmsStat({ id: body.id, type: body.param });
        break;
      case 'lms_stat_testVoluntary':
        await this.handleLmsStat({ id: body.id, type: body.param });
        break;
      case 'lms_stat_testAssignment':
        await this.handleLmsStat({ id: body.id, type: body.param });
        break;
      case 'lms_stat_examStudent':
        await this.handleLmsStat({ id: body.id, type: body.param });
        break;
      case 'lms_stat_subjectStudent':
        await this.handleLmsStat({ id: body.id, type: body.param });
        break;
      case 'lms_stat_fileStudent':
        await this.handleLmsStat({ id: body.id, type: body.param });
        break;
      case 'lms_stat_exercise':
        await this.handleLmsStat({ id: body.id, type: body.param });
        break;
      case 'lms_stat_teach':
        await this.handleLmsStatTeach({ id: body.id, type: body.param });
        break;
      case 'view_pin_data':
        await this.handleViewPinData({ id: body.id, type: body.param });
        break;
      case 'do_exam':
        await this.handleDoExam({
          IdTest: body.id, IndexQuizz: body.param,
          LmsTaskCode: body.param2, ObjectCode: body.param3,
          Type: body.param4, OldPage: 'lms-exam'
        });
        break;
      case 'do_quiz':
        await this.handleDoQuiz({
          QuizId: body.id, IndexQuizz: body.param,
          LmsTaskCode: body.param2, ObjectCode: body.param3,
          Type: body.param4, OldPage: 'lms-quiz'
        });
        break;
      case 'do_exam_game':
        await this.handleDoExam({
          IdTest: body.id, IndexQuizz: body.param,
          LmsTaskCode: body.param2, ObjectCode: body.param3,
          Type: body.param4, OldPage: 'lms-exam'
        });
        break;
      case 'do_quiz_game':
        await this.handleDoQuizGame({
          QuizId: body.id, IndexQuizz: body.param,
          LmsTaskCode: body.param2, ObjectCode: body.param3,
          Type: body.param4, OldPage: 'lms-quiz'
        });
        break;
      case 'lms_quiz_ref':
        await this.handleLmsQuizRef({ id: body.id, quizCode: body.param });
        break;
      case 'lms_quiz_ref_Solver':
        await this.handleLmsQuizRefSolver({ id: body.id });
        break;
      case 'study_ai':
        await this.handleStudyWithAi();
        break;
      case 'lms_exam_schedule':
        await this.handleExamSchedule({ id: body.id, date: body.param });
        break;
      case 'view-blog-item':
        await this.handleViewBlogItem(body.id);
        break;
      case 'audio-content':
        this.handleAudioContent(
          body.id,
          body.param,
          body.param2,
          body.param3,
          body.param4,
        );
        break;
      case 'audio-content-video':
        this.handleAudioContent(
          body.id,
          body.param,
          body.param2,
          body.param3,
          body.param4,
        );
        break;
      case 'audio-category':
        try {
          const params: AudioCategoryExtraParams = JSON.parse(body.param);
          params.catId = Number(body.id);

          this.handleAudioCategory(params);
        } catch (e) {
          console.error(e);
        }

        break;
      case 'audio-category-video':
        try {
          const params: AudioCategoryExtraParams = JSON.parse(body.param);
          params.catId = Number(body.id);

          this.handleAudioCategory(params);
        } catch (e) {
          console.error(e);
        }

        break;

      case 'audio-cms':
        try {
          const params: AudioCmsExtraParams = JSON.parse(body.param);
          params.catId = Number(body.id);

          this.handleAudioCms(params);
        } catch (e) {
          console.error(e);
        }

        break;
      case 'dash_board':
        break;
      case 'family_tree_category':
        this.router.navigate(['/family-tree-category']);
        break;
      default:
        break;
    }
  }
  async confirmSocialLogout() {
    const chooseModal = await this.modalCtrl.create({
      component: MessageConfirmPage,
      componentProps: {
        p: this.translate.instant('NOTI.TS_LOGOUT_SOCIAL'),
      },
      cssClass: 'modalmesss',
      leaveAnimation: this.service.modalLeaveAnimation,
      enterAnimation: this.service.modalEnterAnimation
    });
    await chooseModal.present();
    const rs = await chooseModal.onDidDismiss();
    return Boolean(rs.data);
  }
  async externalLogin(obj: ExternalAuthDto) {
    // this.service.width = this.content['el'].clientWidth;
    // this.service.height = this.content['el'].clientHeight;
    const device = !this.platform.is('capacitor') ? 'web' : (this.platform.is('ios') ? 'ios' : 'android');
    var body = (
      'Provider=' + obj.provider +
      '&IdToken=' + obj.idToken +
      '&FullName=' + obj.fullName +
      '&Email=' + obj.email +
      '&Subject=' + obj.subject +
      '&DeviceToken=' + this.service.tokenDevice +
      '&Version=' + environment.androidVersionCode +
      '&Device=' + device);
    try {
      var result: any = await this.service.postAPI(this.service.getHost() + 'MobileLogin/ExternalLogin', body).toPromise();
    } catch (error) {
      console.log(error);
      this.service.messageSuccess(this.translate.instant('NOTI.NOTI_CONNECTING'));
      return false;
    }
    var rs = result;
    if (rs.Error === false && rs.Object != null) {
      this.service.id = rs.Object.Id;
      this.service.userName = rs.Object.UserName;
      this.service.displayName = rs.Object.GivenName;
      this.service.email = rs.Object.Email;
      this.service.phone = rs.Object.PhoneNumber;
      this.service.DepartmentId = rs.Object.DepartmentId;
      this.service.BranchId = rs.Object.BranchId;
      if (rs.Object.Picture != null && rs.Object.Picture !== '') {
        this.service.img = rs.Object.Picture;
      }
      else {
        this.service.img = this.imageTemp;
      }
      this.service.TypeStaff = rs.Object.TypeStaff;
      // this.service.Password = this.Password;
      // this.service.checkpass = this.checkpass;
      //this.service.txtPinCode = this.txtPinCode.toUpperCase();
      this.service.Gender = rs.Object.Gender;
      this.service.UserType = rs.Object.UserType;
      this.service.AddressText = rs.Object.AddressGPS;
      this.service.AddressGPS = rs.Object.AddressText;
      this.service.CustomerId = rs.Object.CustomersId;
      this.service.CustomerCode = rs.Object.CustomersCode;
      this.service.Balance = rs.Object.Balance ?? 0;
      this.service.checkTabMenu = true;
      return true;
    }
    else {
      this.service.messageError(rs.Title);
      return false;
    }
  }
  async googleLogin() {
    let params: any;
    // await // this.toast.showLoading60('Loading...');
    if (this.platform.is('capacitor')) {
      if (this.platform.is('android')) {
        params = {
          webClientId: '322906159773-c05ummubib9u1harvk47vc2f880vkpue.apps.googleusercontent.com', //  webclientID 'string'
          offline: true
        };
      } else {
        params = {};
      }
      let isLoggedIn = true;
      try {
        // var res = await this.googlePlus.trySilentLogin(params);
        var res = await GoogleAuth.refresh();
        console.log(res);
      } catch (error) {
        console.log(error);
        isLoggedIn = false;
        // // this.toast.dismissToast();
        // return this.service.messageErorr(this.translate.instant("NOTI.NOTI_CONNECT_SERVER_ERROR"));
      }
      if (!isLoggedIn) {
        return false;
      }
      // this.appleIdentityToken = '';
      // this.imageTemp = res.imageUrl;
      var isLoginSuccess = await this.externalLogin({ provider: 'google.com', idToken: res.idToken });
      if (isLoginSuccess) {
        this.service.isGoogleLogin = true;
      }
    }
    else {
      return false;
    }
    // this.toast.dismissToast();
    if (isLoginSuccess) {
      // this.router.navigateByUrl('/dash-board');
      return true;
    }
    return false;
  }
  async fbLogin() {
    // this.toast.showLoading60('Loading...');
    if (this.platform.is('capacitor')) {
      let isLoggedIn = true;
      try {
        var accessToken = '';
        const token = await FacebookLogin.getCurrentAccessToken();
        accessToken = token.accessToken.token;
        console.log(accessToken);
      } catch (error) {
        console.log(error);
        isLoggedIn = false;
        // // this.toast.dismissToast();
        // return this.service.messageErorr(this.translate.instant("NOTI.NOTI_CONNECT_SERVER_ERROR"));
      }
      if (!isLoggedIn) {
        return false;
      }
      // var profile: FacebookProfile = await this.fb
      //   .api(`me/?fields=id,name,email,picture&access_token=${accessToken}`, ['public_profile'], 'GET');
      // console.log(profile);
      // try {
      //   this.imageTemp = profile.picture.data.url;
      // } catch (error) {
      //   console.log(error);
      // }
      var isLoginSuccess = await this.externalLogin({ provider: 'facebook.com', idToken: accessToken });
      if (isLoginSuccess) {
        this.service.isFacebookLogin = true;
      }
    }
    else {
      return false;
    }
    // this.toast.dismissToast();
    if (isLoginSuccess) {
      // this.router.navigateByUrl('/dash-board');
      return true;
    }
    return false;
  }
  async loginApple() {
    // this.toast.showLoading60('Loading...');
    if (this.platform.is('capacitor')) {
      if (!this.appleIdentityToken) {
        return false;
      }
      var isLoginSuccess = await this.externalLogin({
        provider: 'apple.com', idToken: this.appleIdentityToken,
        subject: this.userName, email: this.oldEmail, fullName: this.oldDisplayName
      });
      if (isLoginSuccess) {
        this.service.isAppleLogin = true;
      }
    }
    else {
      return false;
    }
    // this.toast.dismissToast();
    if (isLoginSuccess) {
      // this.router.navigateByUrl('/dash-board');
      return true;
    }
    return false;
  }

  async handleDoExam(objInput) {
    const result = await lastValueFrom<any>(
      this.service.postAPI(this.service.getHost() +
        `MobileLogin/GetTestQuiz?practiceTestCode=${objInput.ObjectCode}`
        + `&userName=${this.service.userName ?? ''}`, ''));
    if (result.Object) {
      const obj = {
        Data: result.Object.details,
        IsAlreadyDone: result.Object.isAlreadyDone,
        Unit: result.Object.unit, Duration: result.Object.duration,
        Title: result.Object.title, IdTest: objInput.IdTest,
        IndexQuizz: objInput.IndexQuizz, LmsTaskCode: objInput.LmsTaskCode,
        ObjectCode: objInput.ObjectCode,
        Type: objInput.Type, OldPage: objInput.OldPage
      };
      const navigationExtras: NavigationExtras = { queryParams: obj };
      let target = '/do-exam';
      if (!this.service.id) {
        target = '/lobby-quiz';
      }
      this.router.navigate([target], navigationExtras);
    }

  }
  async handleDoQuiz(objInput) {
    const result = await lastValueFrom<any>(
      this.service.postAPI(this.service.getHost() +
        `MobileLogin/GetSingleQuiz?quizId=${objInput.QuizId}`
        + `&userName=${this.service.userName ?? ''}`, ''));
    if (result) {
      const obj = {
        Data: [result],
        Type: 'QUIZ',
        Title: objInput.QuizId,
        ObjectCode: result.Code,
        IsAlreadyDone: result.IsAlreadyDone,
        LmsTaskCode: result.LmsTaskCode,
        Downloaded: false,
        OldPage: 'lms-quiz'
      };
      const navigationExtras: NavigationExtras = { queryParams: obj };
      let target = '/do-exam';
      if (!this.service.id) {
        target = '/lobby-quiz';
      }
      this.router.navigate([target], navigationExtras);
    }

  }
  async handleDoQuizGame(objInput) {
    const result = await lastValueFrom<any>(
      this.service.postAPI(this.service.getHost() +
        `MobileLogin/GetSingleQuiz?quizId=${objInput.QuizId}`
        + `&userName=${this.service.userName ?? ''}`, ''));
    if (result) {
      const jsonCanvas = await this.gameJson.loadJsonFromUrl(result.Content);
      const navigationExtras: NavigationExtras = {
        queryParams: {
          isLocalOnly: true,
          isPreview: false,
          itemQa: result,
          JsonCanvas: jsonCanvas,
          type: 'QUIZ',
          objectCode: result.Code,
          lmsTaskCode: result.LmsTaskCode,
        }
      };
      let target = '/do-quiz';
      this.router.navigate([target], navigationExtras);
    }

  }
  async handleCms(id) {
    const check = await lastValueFrom<any>(this.service.postAPI(this.service.getHost() +
      `MobileLogin/CheckBlogItem?id=${id}&userName=${this.service.userName}`, ''));
    if (!check) {
      this.service.messageError(this.translate.instant('CMS_VIEW_ITEM.TS_ERROR'));
      return;
    }
    const result = await lastValueFrom<any>(this.service.postAPI(this.service.getHost() + `MobileLogin/GetItemCmsItem?id=${id}`, ''));
    if (result.Error === true && result.Object === 'NOT_PUBLISHED') {
      this.service.messageError(this.translate.instant('CMS_VIEW_ITEM.TS_ERROR'));
      return;
    }
    if (result.Object) {
      const obj = { Data: result.Object.Data, listNoti: result.Object.ListNoti };
      const navigationExtras: NavigationExtras = { queryParams: obj };
      this.router.navigate(['/cmsitem-view'], navigationExtras);
    }
  }
  async openCardHome(detail) {
    const check = await lastValueFrom<any>(this.service.postAPI(this.service.getHost() +
      `MobileLogin/CheckLmsTask?id=${detail.LmsTaskCode}&userName=${this.service.userName}`, ''));
    if (!check) {
      this.service.messageError(this.translate.instant('LOGINPAGE.TS_ERROR'));
      return;
    }
    else {

      const navigationExtras: NavigationExtras = detail;
      this.router.navigate(['/lms-task-edit'], navigationExtras);
    }
  }
  async openCardNotification(data) {
    // const myModal = await this.modalCtrl.create({
    //   component: ModalNotificationPage,
    //   componentProps: {
    //     data: data
    //   },
    //   cssClass: 'modalNotification'
    // });
    // return await myModal.present();
    const check = await lastValueFrom<any>(this.service.postAPI(this.service.getHost() +
      `MobileLogin/CheckLmsTask?id=${data.LmsTaskCode}&userName=${this.service.userName}`, ''));
    if (!check) {
      this.service.messageError(this.translate.instant('LOGINPAGE.TS_ERROR'));
      return;
    }
    else {

      const obj = Object.assign({}, data);
      obj.checkWork = false;
      obj.CheckMessage = false;
      obj.checkDocuments = false;
      obj.checkNotification = true;
      obj.checkDelivered = false;
      obj.checkResult = false;
      obj.backPage = true;
      const navigationExtras: NavigationExtras = obj;
      this.router.navigate(['/lms-task-edit'], navigationExtras);
    }
  }
  async openCardProgress(data) {
    // const myModal = await this.modalCtrl.create({
    //   component: ModalNotificationPage,
    //   componentProps: {
    //     data: data
    //   },
    //   cssClass: 'modalNotification'
    // });
    // return await myModal.present();
    const check = await lastValueFrom<any>(this.service.postAPI(this.service.getHost() +
      `MobileLogin/CheckLmsTask?id=${data.LmsTaskCode}&userName=${this.service.userName}`, ''));
    if (!check) {
      this.service.messageError(this.translate.instant('LOGINPAGE.TS_ERROR'));
      return;
    }
    else {
      const obj = Object.assign({}, data);
      obj.checkWork = true;
      obj.CheckMessage = false;
      obj.checkDocuments = false;
      obj.checkNotification = false;
      obj.checkDelivered = false;
      obj.checkResult = false;
      obj.backPage = true;
      const navigationExtras: NavigationExtras = obj;
      this.router.navigate(['/lms-task-edit'], navigationExtras);
    }
  }
  async openCardComment(data) {
    // const myModal = await this.modalCtrl.create({
    //   component: ModalNotificationPage,
    //   componentProps: {
    //     data: data
    //   },
    //   cssClass: 'modalNotification'
    // });
    // return await myModal.present();
    const check = await lastValueFrom<any>(this.service.postAPI(this.service.getHost() +
      `MobileLogin/CheckLmsTask?id=${data.LmsTaskCode}&userName=${this.service.userName}`, ''));
    if (!check) {
      this.service.messageError(this.translate.instant('LOGINPAGE.TS_ERROR'));
      return;
    }
    else {
      const obj = Object.assign({}, data);
      obj.checkWork = false;
      obj.CheckMessage = true;
      obj.checkDocuments = false;
      obj.checkNotification = false;
      obj.checkDelivered = false;
      obj.checkResult = false;
      obj.backPage = true;
      const navigationExtras: NavigationExtras = obj;
      this.router.navigate(['/lms-task-edit'], navigationExtras);
    }
  }
  async openCardFile(data) {
    // const myModal = await this.modalCtrl.create({
    //   component: ModalNotificationPage,
    //   componentProps: {
    //     data: data
    //   },
    //   cssClass: 'modalNotification'
    // });
    // return await myModal.present();
    const check = await lastValueFrom<any>(this.service.postAPI(this.service.getHost() +
      `MobileLogin/CheckLmsTask?id=${data.LmsTaskCode}&userName=${this.service.userName}`, ''));
    if (!check) {
      this.service.messageError(this.translate.instant('LOGINPAGE.TS_ERROR'));
      return;
    }
    else {
      const obj = Object.assign({}, data);
      obj.checkWork = false;
      obj.CheckMessage = false;
      obj.checkDocuments = true;
      obj.checkNotification = false;
      obj.checkDelivered = false;
      obj.checkResult = false;
      obj.backPage = true;
      const navigationExtras: NavigationExtras = obj;
      this.router.navigate(['/lms-task-edit'], navigationExtras);
    }
  }
  async openCardResult(data) {
    // const myModal = await this.modalCtrl.create({
    //   component: ModalNotificationPage,
    //   componentProps: {
    //     data: data
    //   },
    //   cssClass: 'modalNotification'
    // });
    // return await myModal.present();
    const check = await lastValueFrom<any>(this.service.postAPI(this.service.getHost() +
      `MobileLogin/CheckLmsTask?id=${data.LmsTaskCode}&userName=${this.service.userName}`, ''));
    if (!check) {
      this.service.messageError(this.translate.instant('LOGINPAGE.TS_ERROR'));
      return;
    }
    else {
      const obj = Object.assign({}, data);
      obj.checkWork = false;
      obj.CheckMessage = false;
      obj.checkDocuments = true;
      obj.checkNotification = false;
      obj.checkDelivered = false;
      obj.checkResult = true;
      obj.backPage = true;
      const navigationExtras: NavigationExtras = obj;
      this.router.navigate(['/lms-task-edit'], navigationExtras);
    }
  }
  async openCardDeli(data) {
    // const myModal = await this.modalCtrl.create({
    //   component: ModalNotificationPage,
    //   componentProps: {
    //     data: data
    //   },
    //   cssClass: 'modalNotification'
    // });
    // return await myModal.present();
    const check = await lastValueFrom<any>(this.service.postAPI(this.service.getHost() +
      `MobileLogin/CheckLmsTask?id=${data.LmsTaskCode}&userName=${this.service.userName}`, ''));
    if (!check) {
      this.service.messageError(this.translate.instant('LOGINPAGE.TS_ERROR'));
      return;
    }
    else {
      const obj = Object.assign({}, data);
      obj.checkWork = false;
      obj.CheckMessage = false;
      obj.checkDocuments = true;
      obj.checkNotification = false;
      obj.checkDelivered = true;
      obj.checkResult = false;
      obj.backPage = true;
      const navigationExtras: NavigationExtras = obj;
      this.router.navigate(['/lms-task-edit'], navigationExtras);
    }
  }

  async openChat(data: { GroupCode: string }) {
    setTimeout(async () => {
      if (!this.websync.isConnected()) {
        this.websync.initWebsync();
        await this.wait05sec();
      }
      await this.websync.getListGroupChatApi('', true);
      const chatGroup = this.websync.listGroupChat.find(x => x.GroupCode === data.GroupCode);
      if (chatGroup) {
        console.log('chatGroup exist, enter');
        let navigationExtras: NavigationExtras = {
          queryParams: chatGroup
        };
        this.router.navigate(["/chat"], navigationExtras);
      }
    }, 500);
  }
  wait05sec() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('Ok');
      }, 500);
    });
  }

  handleLmsExam(detail: any) {
    const navigationExtras: NavigationExtras = { queryParams: detail };
    this.router.navigate(['/lms-exam'], navigationExtras);
  }

  handleLmsExamBank(detail: any) {
    const navigationExtras: NavigationExtras = { queryParams: detail };
    this.router.navigate(['/lms-exam'], navigationExtras);
  }

  handleLmsStat(detail?: any) {
    const navigationExtras: NavigationExtras = { queryParams: detail };
    this.router.navigate(['/lms-stat'], navigationExtras);
  }
  handleLmsStatTeach(detail?: any) {
    const navigationExtras: NavigationExtras = { queryParams: detail };
    this.router.navigate(['/lms-stat-teach'], navigationExtras);
  }
  handleViewPinData(detail?: any) {
    const navigationExtras: NavigationExtras = { queryParams: detail };
    this.router.navigate(['/view-pin-data'], navigationExtras);
  }
  handleViewCourse(detail: any) {
    const navigationExtras: NavigationExtras = { queryParams: detail };
    this.router.navigate(['/view-course'], navigationExtras);
  }
  handleCourseWareBank(detail: any) {
    const navigationExtras: NavigationExtras = { queryParams: detail };
    this.router.navigate(['/course-ware'], navigationExtras);
  }
  handleCourseWare(detail: any) {
    console.log('handledeeplink', detail);
    const navigationExtras: NavigationExtras = { queryParams: detail };
    this.router.navigate(['/course-ware'], navigationExtras);
  }
  handleLmsQuizBank(detail: any) {
    console.log('handledeeplink', detail);
    const navigationExtras: NavigationExtras = { queryParams: detail };
    this.router.navigate(['/lms-quiz'], navigationExtras);
  }
  handleLmsQuiz(detail: any) {
    const navigationExtras: NavigationExtras = { queryParams: detail };
    this.router.navigate(['/lms-quiz'], navigationExtras);
  }
  handleLmsMyQuiz(detail: any) {
    const navigationExtras: NavigationExtras = { queryParams: detail };
    this.router.navigate(['/lms-my-quiz'], navigationExtras);
  }
  handleLmsClassForum(detail: any) {
    const navigationExtras: NavigationExtras = { queryParams: detail };
    this.router.navigate(['/lms-class-forum'], navigationExtras);
  }
  handleLmsFamilyTreePrintPdf(detail: any) {
    const navigationExtras: NavigationExtras = {
      queryParams:
      {
        nodeCode: detail.nodeCode,
        familyCode: detail.familyCode,
        fileName: detail.fileName
      }
    };
    this.router.navigate(['/family-tree-print-pdf'], navigationExtras);
  }
  handleFamilyTreeDetail(detail: any) {
    const navigationExtras: NavigationExtras = {
      queryParams:
      {
        id: detail.id,
        nodeCode: detail.nodeCode,
        familyCode: detail.familyCode,
        fileName: detail.fileName
      }
    };
    this.router.navigate(['/family-tree-detail'], navigationExtras);
  }
  handleFamilyTreeLunarCelendar(detail: any) {
    const navigationExtras: NavigationExtras = {
      queryParams:
      {
        id: detail.id,
        type: detail.type
      }
    };
    this.router.navigate(['/family-tree-lunar-calender'], navigationExtras);
  }
  handleLmsClassForumTutor(detail: any) {
    const navigationExtras: NavigationExtras = { queryParams: detail };
    this.router.navigate(['/lms-class-forum'], navigationExtras);
  }
  handleLmsTutorSchedule(detail: any) {
    const navigationExtras: NavigationExtras = { queryParams: detail };
    this.router.navigate(['/lms-tutor-schedule'], navigationExtras);
  }
  handleLmsCmt(detail: any) {
    const navigationExtras: NavigationExtras = { queryParams: detail };
    this.router.navigate(['/lms-cmt'], navigationExtras);
  }
  handleLmsQuizRef(detail: any) {
    const navigationExtras: NavigationExtras = { queryParams: detail };
    this.router.navigate(['/lms-quiz-ref'], navigationExtras);
  }
  handleLmsQuizRefSolver(detail: any) {
    const navigationExtras: NavigationExtras = { queryParams: detail };
    this.router.navigate(['/lms-quiz-ref'], navigationExtras);
  }
  handleStudyWithAi() {
    this.router.navigate(['/study-with-ai']);
  }
  handleExamSchedule(detail: any) {
    const navigationExtras: NavigationExtras = { queryParams: detail };
    this.router.navigate(['/lms-exam-schedule'], navigationExtras);
  }

  async handleViewBlogItem(id: number | string) {
    // const check = await lastValueFrom<any>(this.service.postAPI(this.service.getHost() +
    //   `MobileLogin/CheckBlogItem?id=${id}&userName=${this.service.userName}`, ''));
    // if (!check) {
    //   this.service.messageError(this.translate.instant('CMS_VIEW_ITEM.TS_ERROR'));
    //   return;
    // }
    const result = await lastValueFrom<any>(this.service.getApi<any>(this.service.getHost() + `MobileBlog/GetItemBlog?id=${id}`));
    if (result.Error === true && result.Object === 'NOT_PUBLISHED') {
      this.service.messageError(this.translate.instant('CMS_VIEW_ITEM.TS_ERROR'));
      return;
    }
    if (result) {
      const obj = { Data: result };
      const navigationExtras: NavigationExtras = { queryParams: obj };
      this.router.navigate(['view-blog-item'], navigationExtras);
    }
  }

  handleAudioContent(
    id: number | string,
    title: number | string = '',
    type = 'audio',
    source = 'system',
    thumbnail = 'assets/icon/icon_audio_book.jpeg'
  ) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        id: id,
        title: title,
        type: type,
        source: source,
        thumbnail: thumbnail,
      },
    };
    this.router.navigate(['/audio-content'], navigationExtras);
  }

  handleAudioCategory(params: AudioCategoryExtraParams) {
    let navigationExtras: NavigationExtras = {
      queryParams: params,
    };
    this.router.navigate(['/audio-category'], navigationExtras);
  }

  handleAudioCms(params: AudioCmsExtraParams) {
    let navigationExtras: NavigationExtras = {
      queryParams: params,
    };
    this.router.navigate(['/audio-cms'], navigationExtras);
  }
}

export interface DeeplinkBody {
  func: string;
  pin: string;
  id: string;
  param?: string;
  param2?: string;
  param3?: string;
  param4?: string;
}


export interface FacebookProfile {
  id: string;
  name: string;
  email: string;
  picture: Picture;
}
export interface Data {
  height: number;
  is_silhouette: boolean;
  url: string;
  width: number;
}

export interface Picture {
  data: Data;
}

export interface ExternalAuthDto {
  fullName?: string;
  email?: string;
  subject?: string;
  provider: string;
  idToken: string;
}
