import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Platform, LoadingController , ToastController  } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})
export class ToastServiceService {
  toast: ToastController;
  loading: HTMLIonLoadingElement;
  constructor(public http: HttpClient,
    public toastCtrl: ToastController,
    public platform: Platform,
    public loadingCtrl: LoadingController,
  ) {
  }
  async showLoading(msg) {
    const loading = await this.loadingCtrl.create({
      message: msg,
      duration: 2000
    });
    await loading.present();
  }
  async showLoading1(msg) {
    const loading = await this.loadingCtrl.create({
      message: msg,
      duration: 4000
    });
    await loading.present();
  }
  async showLoadingNoTimeout(msg) {
    const loading = await this.loadingCtrl.create({
        message: msg,
    });
    await loading.present();
}
  async showToast(msg) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
    });
    await toast.present();
  }
  async showToastError(msg) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
  }
  async showToastSuccess(msg) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color: 'success'
    });
    await toast.present();
  }
  async showToastWithDimiss(msg, dimissTxt = 'Dismiss', color = 'success') {
    const toast = await this.toastCtrl.create({
      message: msg,
      color,
      // duration: 3000,
      buttons: [
        {
          text: dimissTxt,
          role: 'cancel',
          handler: () => {
            // this.handlerMessage = 'Dismiss clicked';
          },
        },
      ],
    });

    await toast.present();

    const { role } = await toast.onDidDismiss();
  }
  async showLoading60(msg) {
    const loading = await this.loadingCtrl.create({
      message: msg,
      duration: 60000
    });
    await loading.present();
  }
  async showLoading300(msg) {
    const loading = await this.loadingCtrl.create({
      message: msg,
      duration: 300000
    });
    await loading.present();
  }
  wait1sec() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('Ok');
      }, 1000);
    });
  }
  async dismissToast() {
    await this.wait1sec();
    await this.loadingCtrl.dismiss();
  }
  async dismissAllLoaders() {
    let topLoader = await this.loadingCtrl.getTop();
    while (topLoader) {
      if (!(await topLoader.dismiss())) {
        throw new Error('Could not dismiss the topmost loader. Aborting...');
      }
      topLoader = await this.loadingCtrl.getTop();
    }
  }
  async forceDismissAllLoaders() {
    try {
        let topLoader = await this.loadingCtrl.getTop();
        while (topLoader) {
            await topLoader.dismiss();
            topLoader = await this.loadingCtrl.getTop();
        }
        console.log("All loaders dismissed successfully.");
    } catch (error) {
        console.error("Error dismissing loaders:", error);
    }
}
}
