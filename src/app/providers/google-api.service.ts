import { Injectable } from '@angular/core';
import { ServiceService } from './service.service';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GoogleApiService {
  translateEndpoint = 'https://api.mobile.3i.com.vn/MobileGoogle/Translate';
  detectEndpoint = 'https://api.mobile.3i.com.vn/MobileGoogle/Detect';
  speakEndpoint = 'https://api.mobile.3i.com.vn/MobileGoogle/Speak';
  constructor(private service: ServiceService) { }
  async translate(text: string, targetLanguage: string) {
    try {
      const body = {
        text,
        targetLanguage,
        email: this.service.email
      };
      const result = await lastValueFrom(this.service.postApiResultText(this.translateEndpoint, body));
      return result.replace(/^"(.*)"$/, '$1');
    } catch (error) {
      if (error.response?.status) {
        console.error(error.response.status, error.message);
        error.response.data.on('data', data => {
          const message = data.toString();
          try {
            const parsed = JSON.parse(message);
            console.error('An error occurred during Google API request: ', parsed);
          } catch (errorO) {
            console.error('An error occurred during Google API request: ', message);
          }
        });
      } else {
        console.error('An error occurred during Google API request', error);
      }
      return '';
    }
  }

  async detect(text: string) {
    try {
      const body = {
        text,
        email: this.service.email
      };
      const result = await lastValueFrom(this.service.postApiResultText(this.detectEndpoint, body));
      return result.replace(/^"(.*)"$/, '$1');
    } catch (error) {
      if (error.response?.status) {
        console.error(error.response.status, error.message);
        error.response.data.on('data', data => {
          const message = data.toString();
          try {
            const parsed = JSON.parse(message);
            console.error('An error occurred during Google API request: ', parsed);
          } catch (errorO) {
            console.error('An error occurred during Google API request: ', message);
          }
        });
      } else {
        console.error('An error occurred during Google API request', error);
      }
      return '';
    }
  }

  async speak(text: string, targetLanguage: string) {
    try {
      const body = {
        text,
        targetLanguage,
        email: this.service.email
      };
      return await lastValueFrom(this.service.postApiResultBlob(this.speakEndpoint, body));
    } catch (error) {
      if (error.response?.status) {
        console.error(error.response.status, error.message);
        error.response.data.on('data', data => {
          const message = data.toString();
          try {
            const parsed = JSON.parse(message);
            console.error('An error occurred during Google API request: ', parsed);
          } catch (errorO) {
            console.error('An error occurred during Google API request: ', message);
          }
        });
      } else {
        console.error('An error occurred during Google API request', error);
      }
      return null;
    }
  }
}
