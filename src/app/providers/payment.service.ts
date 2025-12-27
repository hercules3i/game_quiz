// @ts-nocheck
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ServiceService } from './service.service';
import { lastValueFrom } from 'rxjs';
import { MenuController, ModalController, NavController, Platform } from '@ionic/angular';
import { NavigationExtras, Params, Router } from '@angular/router';
// import { MessageConfirmPage } from '../page/message-confirm/message-confirm.page';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  currentSubscription: ItemPackage;
  countSubscription: CountSubscription = {
    quiz: 0,
    test: 0,
    courseware: 0,
    course: 0,
    class: 0,
    dataStorage: 0,
    mathPix: 0,
    openAi: 0
  };
  aiCostTable: AiCostTable = {
    AI_IN_TOKEN: 0,
    DOLLAR_EXCHANGE: 0,
    PRONUNCIATION_PER_HOUR: 0,
    AI_TEXT_TO_SPEECH: 0,
    AI_OUT_TOKEN: 0,
    GC_VISION_1000_UNIT: 0
  };
  aiChargeTracking: AiChargeTracking = {
    AiInToken: 0,
    AiInCharge: 0,
    AiOutToken: 0,
    AiOutCharge: 0,
    AiTtsToken: 0,
    AiTtsCharge: 0,
    GcVisionUnit: 0,
    GcVisionCharge: 0,
    PronunciationHour: 0,
    PronunciationCharge: 0,
    DollarExchange: 0,
    Credit: 0,
    IsSync: true,
    UserName: this.service.userName,
    LastJsonLog: ''
  }
  lastArrayLog: ObjectLog[] = [];
  objectLog: ObjectLog = {
    date: '',
    value: {
      AiIn: {
        token: 0,
        price: 0,
      },
      AiOut: {
        token: 0,
        price: 0,
      },
      AiTTS: {
        token: 0,
        price: 0,
      },
      GcVision: {
        token: 0,
        price: 0,
      },
      Pronunciation: {
        token: 0,
        price: 0,
      }
    },
    total: 0,
  }
  creditMin = 20;
  backPage = '';
  params: Params;
  constructor(
    public service: ServiceService,
    private translate: TranslateService,
    public platform: Platform,
    private router: Router,
    private modalCtrl: ModalController
  ) {
    this.initPayment();
  }

  initPayment() {
    this.backPage = '';
    this.getSubscription();
    this.getCountSubscription();
    this.getOpenAiCostTable();
    this.getUserAiServiceChargeTracking();
  }
  setCreditMin(number: number) {
    this.creditMin = number;
  }
  async updateSubscription(key: string) {
    let rs: any;
    const value = this.countSubscription[key] as number;
    const query = `userName=${this.service.userName}&key=${key}`
      + `&value=${value}`;
    try {
      rs = await lastValueFrom<any>(this.service.putApiQuery(this.service.getHost() +
        'MobilePayment/UpdateCountSubscription', query));
    } catch (error) {
      this.service.messageSuccess(this.translate.instant('NOTI.NOTI_CONNECTING'));
    }
    if (rs) {
      console.log(rs);
    }
  }
  getSubscription() {
    this.service.getApi<ItemPackage>(this.service.getHost() +
      `MobilePayment/GetSubscription?userName=${this.service.userName}`)
      .subscribe(
        {
          next: (result) => {
            const rs = result;
            this.currentSubscription = rs;
          },
          error: (error) => {
            this.service.messageSuccess(this.translate.instant('NOTI.NOTI_CONNECTING'));
          }
        }
      );
  }
  getCountSubscription() {
    this.service.getApi<CountSubscription>(this.service.getHost() +
      `MobilePayment/GetCountSubscription?userName=${this.service.userName}`)
      .subscribe(
        {
          next: (result) => {
            const rs = result;
            if (rs) {
              // this.countSubscription = rs;
              this.countSubscription.quiz = rs.quiz ?? 0;
              this.countSubscription.test = rs.test ?? 0;
              this.countSubscription.courseware = rs.courseware ?? 0;
              this.countSubscription.course = rs.course ?? 0;
              this.countSubscription.class = rs.class ?? 0;
              this.countSubscription.dataStorage = rs.dataStorage ?? 0;
              this.countSubscription.mathPix = rs.mathPix ?? 0;
              this.countSubscription.openAi = rs.openAi ?? 0;
            } else {
              this.countSubscription = {
                quiz: 0,
                test: 0,
                courseware: 0,
                course: 0,
                class: 0,
                dataStorage: 0,
                mathPix: 0,
                openAi: 0
              };
            }
          },
          error: (error) => {
            this.service.messageSuccess(this.translate.instant('NOTI.NOTI_CONNECTING'));
          }
        }
      );
  }
  getOpenAiCostTable() {
    this.service.getApi<AiCostTable>(this.service.getHost() + 'MobileToken/GetOpenAiCostTable')
      .subscribe(
        {
          next: (result) => {
            const rs = result;
            console.log(rs);
            this.aiCostTable = rs;
          },
          error: (error) => {
            this.service.messageSuccess(this.translate.instant('NOTI.NOTI_CONNECTING'));
          }
        }
      );
  }
  getUserAiServiceChargeTracking() {
    this.service.getApi<AiChargeTracking>(this.service.getHost() + 'MobileToken/GetUserAiServiceChargeTracking?userName=' + this.service.userName).subscribe({
      next: (result) => {
        const rs = result;
        if (rs != null) this.aiChargeTracking = rs;
        else {
          this.aiChargeTracking = {
            AiInToken: 0,
            AiInCharge: 0,
            AiOutToken: 0,
            AiOutCharge: 0,
            AiTtsToken: 0,
            AiTtsCharge: 0,
            GcVisionUnit: 0,
            GcVisionCharge: 0,
            PronunciationHour: 0,
            PronunciationCharge: 0,
            DollarExchange: 0,
            Credit: 0,
            IsSync: true,
            UserName: this.service.userName,
            LastJsonLog: ''
          }
        }

        if (this.aiChargeTracking.LastJsonLog && this.aiChargeTracking.LastJsonLog.trim() !== "") {
          let parsedLog = this.aiChargeTracking.LastJsonLog;

          // Xử lý chuỗi bị encode dư thừa "\"\""
          if (parsedLog === "\"\"") {
            parsedLog = ""; // Chuyển thành chuỗi rỗng thực sự
          }

          try {
            this.lastArrayLog = parsedLog ? JSON.parse(parsedLog) : [];
          } catch (error) {
            console.error('JSON parsing error:', error);
            this.lastArrayLog = [];
          }
        } else {
          this.lastArrayLog = [];
        }

        console.log(rs, this.aiChargeTracking);
      },
      error: (error) => {
        this.service.messageSuccess(this.translate.instant('NOTI.NOTI_CONNECTING'));
      }
    });
  }


  putUserAiServiceChargeTracking() {
    const data = this.transformObject(this.lastArrayLog);
    this.aiChargeTracking.LastJsonLog = JSON.stringify(data, null, 2);
    this.service.putApi(this.service.getHost() + 'MobileToken/PutUserAiServiceChargeTracking', this.aiChargeTracking).subscribe({
      next: (result: any) => {
        const rs = result;
        if (rs.Error == false) {
          console.log('Cập nhật thành công');
          this.updateLastJsonLog();
        }
        else {
          console.log('Cập nhât thất bại');
        }
      },
      error: (error) => {
        this.service.messageSuccess(this.translate.instant('NOTI.NOTI_CONNECTING'));
      }
    })
  }
  updateLastJsonLog() {
    this.service.putApi(this.service.getHost() + 'MobileToken/UpdateLastJsonLog', this.aiChargeTracking).subscribe({
      next: (result: any) => {
        const rs = result;
        if (rs.Error == false) {
          console.log('Cập nhật json thành công');
        }
        else {
          console.log('Cập nhât thất bại');

        }
      },
      error: (error) => {
        this.service.messageSuccess(this.translate.instant('NOTI.NOTI_CONNECTING'));
      }
    })
  }
  purchaseCredit(amount) {
    const query = `?code=CREDIT&type=CREDIT` +
      `&userName=${this.service.userName}&value=${amount}`;
    this.service.postApi(this.service.getHost() +
      'MobileLogin/PurchaseItem' + query, '').subscribe({
        next: (result: any) => {
          const rs = result;
          console.log(rs.Title);
        },
        error: (error) => {
          this.service.messageSuccess(this.translate.instant('NOTI.NOTI_CONNECTING'));
        }
      })
  }
  async checkAndPurchaseCredit(backPage = '', params: Params = null) {
    const change = Math.floor(this.creditMin - this.aiChargeTracking.Credit);
    if (change > 0) {
      if (this.aiChargeTracking.Credit < this.creditMin) {
        const isAgree = await this.confirmTransaction(change);
        if (!isAgree) return false;
        this.backPage = backPage ?? '';
        this.params = params;
        if (this.service.Balance >= change) {
          this.aiChargeTracking.Credit += change;
          this.purchaseCredit(change);
          this.service.Balance -= change;
          return true;
        }
        else {
          console.log('Tài khoản sắp hết');
          this.redirectBuyCoin();
          return false;
        }
      } else {
        return true;
      }
    }
    else return true;
  }

  async confirmTransaction(amount) {
    var message = await lastValueFrom(this.translate
      .get('STUDY_WITH_AI.TS_NOTI_PURCHASE', { price: amount }));
    // TODO: Implement MessageConfirmPage or use alternative modal
    const confirmed = confirm(message);
    return confirmed;
    /* const chooseModal = await this.modalCtrl.create({
      component: MessageConfirmPage,
      componentProps: {
        p: message,
        icon: "coin_enough.png"
      },
      cssClass: "modalmesss",
      leaveAnimation: this.service.modalLeaveAnimation,
      enterAnimation: this.service.modalEnterAnimation
    });
    await chooseModal.present();
    var rs = await chooseModal.onDidDismiss();
    if (rs.data === true) {
      return true;
    }
    else {
      return false;
    } */
  }

  async redirectBuyCoin() {
    this.service.messageError(this.translate.instant('STUDY_WITH_AI.NOT_ENOUGH_BALANCE'));
    setTimeout(() => {
      this.router.navigate(['/payment-methods']);
    }, 500);
  }

  updateTotal(log: ObjectLog): void {
    log.total =
      log.value.AiIn.price +
      log.value.AiOut.price +
      log.value.AiTTS.price +
      log.value.GcVision.price +
      log.value.Pronunciation.price;
  }

  addOrUpdateLog(newLog: ObjectLog): void {
    console.log('this.lastArrayLog', this.lastArrayLog);

    const existingLog = this.lastArrayLog.find(log => log.date === newLog.date);

    if (existingLog) {
      existingLog.value.AiIn.token = Number(existingLog.value.AiIn.token) || 0;
      existingLog.value.AiIn.price = Number(existingLog.value.AiIn.price) || 0;

      existingLog.value.AiOut.token = Number(existingLog.value.AiOut.token) || 0;
      existingLog.value.AiOut.price = Number(existingLog.value.AiOut.price) || 0;

      existingLog.value.AiTTS.token = Number(existingLog.value.AiTTS.token) || 0;
      existingLog.value.AiTTS.price = Number(existingLog.value.AiTTS.price) || 0;

      existingLog.value.GcVision.token = Number(existingLog.value.GcVision.token) || 0;
      existingLog.value.GcVision.price = Number(existingLog.value.GcVision.price) || 0;

      existingLog.value.Pronunciation.token = Number(existingLog.value.Pronunciation.token) || 0;
      existingLog.value.Pronunciation.price = Number(existingLog.value.Pronunciation.price) || 0;

      // Cộng giá trị mới
      existingLog.value.AiIn.token += Number(newLog.value.AiIn.token) || 0;
      existingLog.value.AiIn.price += Number(newLog.value.AiIn.price) || 0;

      existingLog.value.AiOut.token += Number(newLog.value.AiOut.token) || 0;
      existingLog.value.AiOut.price += Number(newLog.value.AiOut.price) || 0;

      existingLog.value.AiTTS.token += Number(newLog.value.AiTTS.token) || 0;
      existingLog.value.AiTTS.price += Number(newLog.value.AiTTS.price) || 0;

      existingLog.value.GcVision.token += Number(newLog.value.GcVision.token) || 0;
      existingLog.value.GcVision.price += Number(newLog.value.GcVision.price) || 0;

      existingLog.value.Pronunciation.token += Number(newLog.value.Pronunciation.token) || 0;
      existingLog.value.Pronunciation.price += Number(newLog.value.Pronunciation.price) || 0;

      this.updateTotal(existingLog);
    } else {
      // Thêm mới nếu không tìm thấy ngày trùng
      this.lastArrayLog.push(newLog);
      this.updateTotal(newLog);
    }
  }

  roundToDecimal(value, precision = 10) {
    return parseFloat(value.toFixed(precision));
  }

  transformObject(obj) {
    if (Array.isArray(obj)) {
      return obj.map(x => this.transformObject(x));
    } else if (typeof obj === 'object' && obj !== null) {
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        if (key != 'token' && typeof value === 'number') {
          // Round number to at least 8 digits
          result[key] = value.toFixed(10);
        } else if (typeof value === 'object') {
          // Recursively process nested objects
          result[key] = this.transformObject(value);
        } else {
          result[key] = value;
        }
      }
      return result;
    }
    return obj;
  }

  async handleCreditExhaustion() {
    const change = Math.floor(this.creditMin - this.aiChargeTracking.Credit);
    if (change > 0) {
      if (this.aiChargeTracking.Credit < this.creditMin) {
        const isAgree = await this.confirmTransaction(change);
        if (!isAgree) return false;
        if (this.service.Balance >= change) {
          this.aiChargeTracking.Credit += change;
          this.purchaseCredit(change);
          this.service.Balance -= change;
          return true;
        }
        else {
          console.log('Tài khoản sắp hết');
          this.redirectBuyCoin();
          return false;
        }
      } else {
        return true;
      }
    }
    else return true;
  }

  checkAndBackPage() {
    if (this.backPage) {
      const navigationExtras: NavigationExtras = {
        queryParams: this.params
      };
      const change = Math.floor(this.creditMin - this.aiChargeTracking.Credit);
      if (change > 0) {
        if (this.aiChargeTracking.Credit < this.creditMin) {
          if (this.service.Balance >= change) {
            this.aiChargeTracking.Credit += change;
            this.purchaseCredit(change);
            this.service.Balance -= change;
            this.router.navigate([this.backPage], navigationExtras);
            this.backPage = '';
          }
          else {
            console.log('Tài khoản sắp hết');
            this.backPage = '';
          }
        } else {
          this.router.navigate([this.backPage], navigationExtras);
          this.backPage = '';
        }
      }
      else {
        this.router.navigate([this.backPage], navigationExtras);
        this.backPage = '';
      }
    }
  }

  formatCurrency(value: number) {

    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 3 }).format(value);

  }
}

export interface CountSubscription {
  quiz: number
  test: number
  courseware: number
  course: number
  class: number
  dataStorage: number
  mathPix: number
  openAi: number
}

export interface ItemPackage {
  ServiceCode: string
  Price: number
  StartTime: string
  EndTime: string
  Attributes: Attributes
}

export interface Service {
  ServiceCatId: number
  ServiceCode: string
  ServiceName: string
  CostId: number
  ServicePrice: number
  ServiceCurrency: string
  Attributes: Attributes
  Background: string
}

export interface Attributes {
  Quiz: Attribute
  Exam: Attribute
  Document: Attribute
  Course: Attribute
  Class: Attribute
  DataStorage: Attribute
}

export interface Attribute {
  AttributeId: number
  AttributeCode: string
  AttributeName: string
  AttributeValue: string
}

export interface AiCostTable {
  AI_IN_TOKEN: number
  DOLLAR_EXCHANGE: number
  PRONUNCIATION_PER_HOUR: number
  AI_TEXT_TO_SPEECH: number
  AI_OUT_TOKEN: number
  GC_VISION_1000_UNIT: number
}

export interface AiChargeTracking {
  AiInToken: number
  AiInCharge: number
  AiOutToken: number
  AiOutCharge: number
  AiTtsToken: number
  AiTtsCharge: number
  GcVisionUnit: number
  GcVisionCharge: number
  PronunciationHour: number
  PronunciationCharge: number
  DollarExchange: number
  Credit: number
  IsSync: boolean
  UserName: string
  LastJsonLog: string
}

export interface ObjectLog {
  date: string
  value: {
    AiIn: {
      token: number
      price: number
    },
    AiOut: {
      token: number
      price: number
    },
    AiTTS: {
      token: number
      price: number
    },
    GcVision: {
      token: number
      price: number
    },
    Pronunciation: {
      token: number
      price: number
    }
  }
  total: number
}
