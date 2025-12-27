import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { lastValueFrom } from 'rxjs';
import { ServiceService } from './service.service';
import { PaymentService } from './payment.service';

@Injectable({
  providedIn: 'root'
})
export class LatexService {

  constructor(
    public http: HttpClient,
    private translate: TranslateService,
    private service: ServiceService,
    private payMent: PaymentService
  ) { }
  async getLatexFromUrl(url: string) {
    const result = await this.getObjFromUrl(url);
    if (result) {
      return result.text as string;
    }
    return '';
  }
  async getObjFromUrl(url: string) {
    const body = {
      src: url,
      formats: ['text', 'data'],
      data_options: {
        include_asciimath: true
      }
    };
    let result: any;
    // try {
    //   result = await lastValueFrom<any>(this.postApiText(body));
    // } catch (error) {
    //   console.log(error);
    //   this.service.messageSuccess(this.translate.instant('NOTI.NOTI_CONNECTING'));
    // }
    if (result) {
      this.payMent.countSubscription.mathPix++;
      if (this.payMent.countSubscription.mathPix % 10 === 0) {
        this.payMent.updateSubscription('mathPix');
      }
    }
    return result;
  }
  // tai file lên
  postApiText(body) {
    const url = 'https://api.mathpix.com/v3/text';
    const headers = new HttpHeaders()
      .append('Access-Control-Allow-Origin', '*')
      .append('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT')
      .append('Accept', 'application/json')
      .append('Content-Type', 'application/json')
      .append('app_key', 'b4175fda933a37d03e14640bb900b5103ad65bae91bb33eb88f81c42c8f045ac');
    const result = this.http.post(url, body, { headers });
    return result;
  }
}
