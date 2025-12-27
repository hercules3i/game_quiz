import { Injectable } from '@angular/core';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { Platform } from '@ionic/angular';
import { Filesystem, Encoding } from '@capacitor/filesystem';

@Injectable({
  providedIn: 'root'
})
export class SettingsStorage {
  settingsFilename = "settings.json";
  settingsData: SettingsData = {};

  constructor(
    private file: File,
    private platform: Platform,
  ) { }

  async storeSettings(newSettings?: SettingsData) {
    if (newSettings) this.settingsData = newSettings;

    const jsonContent = JSON.stringify(this.settingsData);

    if (this.platform.is('capacitor')) {
      const fileDir = this.file.dataDirectory;
      await this.file.writeFile(
        fileDir,
        this.settingsFilename,
        jsonContent,
        { replace: true }
      );
    } else {
      localStorage.setItem(this.settingsFilename, jsonContent);
    }
  }

  async loadStoredSettings() {
    const fileDir = this.file.dataDirectory;
    let json = '';

    try {
      if (this.platform.is('capacitor')) {
        const res = await Filesystem.readFile({
          path: fileDir + this.settingsFilename,
          encoding: Encoding.UTF8,
        });
        json = res.data as string;
      } else {
        json = localStorage.getItem(this.settingsFilename);
      }
    } catch (error) {
      console.log(error);
    }

    if (!json) json = "{}";
    this.settingsData = JSON.parse(json);
  }

  getStoredSettings() {
    return this.settingsData;
  }
}

export interface SettingsData {
  studyWithAi?: {
    service?: string
    voice?: string
    speechSpeed?: number
    speechToTextToInput?: boolean
    autoConversation?: boolean,
    modelIndex?: number,
    usingDallE?: boolean,

    speechRecogLang0?: string,
    speechRecogLang1?: string,

    fontColor?: string,
    highlightColor?: string,
    fontSize?: string,
    fontFamily?: string,
  }
}
