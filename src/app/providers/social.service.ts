import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class SocialService {

  constructor(
    public platform: Platform,
  ) { }

  openSkypeOrRedirect(skypeUsername: string) {
    const skypeUri = `skype:${skypeUsername}?call`;

    // Attempt to open Skype
    try {
      window.location.href = skypeUri;

      if (this.platform.is('capacitor')) {
        // Set a timeout to detect failure
        setTimeout(() => {
          // Redirect to App Store if Skype does not open
          if (this.platform.is('ios')) {
            window.location.href = 'https://apps.apple.com/app/skype-for-iphone/id304878510';
          } else {
            window.location.href = 'https://play.google.com/store/apps/details?id=com.skype.raider';
          }
        }, 1500); // Adjust delay as needed
      }
    } catch (error) {
      console.error("Skype app is not installed:", error);
      // Directly redirect to store in case of immediate failure
      if (this.platform.is('capacitor')) {
        if (this.platform.is('ios')) {
          window.location.href = 'https://apps.apple.com/app/skype-for-iphone/id304878510';
        } else {
          window.location.href = 'https://play.google.com/store/apps/details?id=com.skype.raider';
        }
      }
    }
  }
  openWhatsAppCall(phoneNumber: string) {
    const whatsappCallUri = !this.platform.is('capacitor') ?
      `whatsapp://send?phone=${phoneNumber}` :
      `whatsapp://call?phone=${phoneNumber}`;

    try {
      // Try to initiate a WhatsApp voice call
      window.location.href = whatsappCallUri;

      if (this.platform.is('capacitor')) {
        // Set a timeout to detect failure
        setTimeout(() => {
          // Redirect to App Store if Skype does not open
          if (this.platform.is('ios')) {
            window.location.href = 'https://apps.apple.com/app/whatsapp-messenger/id310633997';
          } else {
            window.location.href = 'https://play.google.com/store/apps/details?id=com.whatsapp';
          }
        }, 1500); // Adjust delay as needed
      }
    } catch (error) {
      console.error("WhatsApp app is not installed:", error);
      // Directly redirect to store if WhatsApp is not installed
      if (this.platform.is('capacitor')) {
        if (this.platform.is('ios')) {
          window.location.href = 'https://apps.apple.com/app/whatsapp-messenger/id310633997';
        } else {
          window.location.href = 'https://play.google.com/store/apps/details?id=com.whatsapp';
        }
      }
    }
  }
  openZaloCall(phoneNumber: string) {
    const whatsappCallUri = `zalo://call?phone=${phoneNumber}`;

    try {
      // Try to initiate a WhatsApp voice call
      window.location.href = whatsappCallUri;

      if (this.platform.is('capacitor')) {
        // Set a timeout to detect failure
        setTimeout(() => {
          // Redirect to App Store if Skype does not open
          if (this.platform.is('ios')) {
            window.location.href = 'https://apps.apple.com/app/zalo/id579523206';
          } else {
            window.location.href = 'https://play.google.com/store/apps/details?id=com.zing.zalo';
          }
        }, 1500); // Adjust delay as needed
      }
    } catch (error) {
      console.error("WhatsApp app is not installed:", error);
      // Directly redirect to store if WhatsApp is not installed
      if (this.platform.is('capacitor')) {
        if (this.platform.is('ios')) {
          window.location.href = 'https://apps.apple.com/app/zalo/id579523206';
        } else {
          window.location.href = 'https://play.google.com/store/apps/details?id=com.zing.zalo';
        }
      }
    }
  }
  openLineChatOrRedirect(userId: string) {
    const lineChatUri = `line://ti/p/~${userId}`;

    try {
      // Attempt to open LINE chat
      window.location.href = lineChatUri;

      if (this.platform.is('capacitor')) {
        // Set a timeout to detect failure
        setTimeout(() => {
          // Redirect to App Store if Skype does not open
          if (this.platform.is('ios')) {
            window.location.href = 'https://apps.apple.com/app/line/id443904275';
          } else {
            window.location.href = 'https://play.google.com/store/apps/details?id=jp.naver.line.android';
          }
        }, 1500); // Adjust delay as needed
      }
    } catch (error) {
      console.error("LINE app is not installed:", error);
      // Redirect to store immediately if it fails
      if (this.platform.is('capacitor')) {
        if (this.platform.is('ios')) {
          window.location.href = 'https://apps.apple.com/app/line/id443904275';
        } else {
          window.location.href = 'https://play.google.com/store/apps/details?id=jp.naver.line.android';
        }
      }
    }
  }
  openKakaoChat(kakaoId: string) {
    const kakaoChatUri = `kakaotalk://plusfriend/home/${kakaoId}`;

    try {
      // Try to open KakaoTalk chat
      window.location.href = kakaoChatUri;

      if (this.platform.is('capacitor')) {
        // Set a timeout to detect failure
        setTimeout(() => {
          // Redirect to App Store if KakaoTalk does not open
          if (this.platform.is('ios')) {
            window.location.href = 'https://apps.apple.com/app/kakaotalk/id362057947';
          } else {
            window.location.href = 'https://play.google.com/store/apps/details?id=com.kakao.talk';
          }
        }, 1500); // Adjust delay as needed
      }
    } catch (error) {
      console.error("KakaoTalk app is not installed:", error);
      // Directly redirect to store if KakaoTalk is not installed
      if (this.platform.is('capacitor')) {
        if (this.platform.is('ios')) {
          window.location.href = 'https://apps.apple.com/app/kakaotalk/id362057947';
        } else {
          window.location.href = 'https://play.google.com/store/apps/details?id=com.kakao.talk';
        }
      }
    }
  }
  openViberCall(phoneNumber: string) {
    const viberUri = `viber://call?number=${phoneNumber}`;

    try {
      // Try to open Viber chat or call
      window.location.href = viberUri;

      if (this.platform.is('capacitor')) {
        // Set a timeout to detect failure and redirect
        setTimeout(() => {
          // Redirect to App Store if Viber does not open
          if (this.platform.is('ios')) {
            window.location.href = 'https://apps.apple.com/app/viber-messenger-chats-calls/id382617920';
          } else {
            window.location.href = 'https://play.google.com/store/apps/details?id=com.viber.voip';
          }
        }, 1500); // Adjust delay as needed
      }
    } catch (error) {
      console.error("Viber app is not installed:", error);
      // Directly redirect to store if Viber is not installed
      if (this.platform.is('capacitor')) {
        if (this.platform.is('ios')) {
          window.location.href = 'https://apps.apple.com/app/viber-messenger-chats-calls/id382617920';
        } else {
          window.location.href = 'https://play.google.com/store/apps/details?id=com.viber.voip';
        }
      }
    }

  }
  openTelegramChat(phoneNumber: string) {
    const telegramUri = `tg://resolve?phone=${phoneNumber}`;

    try {
      // Try to open Telegram chat
      window.location.href = telegramUri;

      if (this.platform.is('capacitor')) {
        // Set a timeout to detect failure and redirect to store
        setTimeout(() => {
          // Redirect to App Store if Telegram does not open
          if (this.platform.is('ios')) {
            window.location.href = 'https://apps.apple.com/app/telegram-messenger/id686449807';
          } else {
            window.location.href = 'https://play.google.com/store/apps/details?id=org.telegram.messenger';
          }
        }, 1500); // Adjust delay as needed
      }
    } catch (error) {
      console.error("Telegram app is not installed:", error);
      // Directly redirect to store if Telegram is not installed
      if (this.platform.is('capacitor')) {
        if (this.platform.is('ios')) {
          window.location.href = 'https://apps.apple.com/app/telegram-messenger/id686449807';
        } else {
          window.location.href = 'https://play.google.com/store/apps/details?id=org.telegram.messenger';
        }
      }
    }


  }

}

export interface SocialInfo {
  Skype: string;
  Whatsapp: string;
  Zalo: string;
  Line: string;
  Kakaotalk: string;
  Viber: string;
  Telegram: string;
}

export type Social = 'skype' | 'whatsapp' | 'zalo' | 'line' | 'kakaotalk' | 'viber' | 'telegram';
