import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { SpeechRecognition } from '@awesome-cordova-plugins/speech-recognition/ngx';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { Keyboard } from '@awesome-cordova-plugins/keyboard/ngx';
import { Badge } from '@awesome-cordova-plugins/badge/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { IonicStorageModule } from '@ionic/storage-angular';
import { IonicModule } from '@ionic/angular';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { AppLauncher } from '@ionic-native/app-launcher/ngx';
import { WebIntent } from '@awesome-cordova-plugins/web-intent/ngx';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { FileTransfer } from '@awesome-cordova-plugins/file-transfer/ngx';
import { Screenshot } from '@ionic-native/screenshot/ngx';
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    SpeechRecognition,
    NativeStorage,
    Keyboard,
    Badge,
    File,
    FileOpener,
    SocialSharing,
    AppLauncher,
    WebIntent,
    InAppBrowser,
    FileTransfer,
    Screenshot,
    importProvidersFrom(
      IonicModule.forRoot(),
      IonicStorageModule.forRoot(),
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient],
        },
        defaultLanguage: 'en',
      })
    ),
  ],
}).catch((error) => {
});
