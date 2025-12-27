import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FamilyTreeChatAiService {
  // Voice settings
  private voiceSettings = new BehaviorSubject<any>({
    voice: null,
    speed: 1,
    maxSilenceDuration: 2000
  });

  // Theme settings
  private themeSettings = new BehaviorSubject<any>({
    background: '',
    textColor: '#000000',
    fontSize: 1,
    fontWeight: 1,
    fontFamily: 'Arial',
    fontStyle: 'normal'
  });

  // OpenAI settings
  private openAiSettings = new BehaviorSubject<any>({
    outputToTextbox: false,
    isUsingDallE: false,
    currentModel: null,
    selectedAccount: null
  });

  // Language settings
  private languageSettings = new BehaviorSubject<any>({
    languages: ['', '']
  });

  constructor() { }

  // Voice settings methods
  getVoiceSettings() {
    return this.voiceSettings.asObservable();
  }

  updateVoiceSettings(settings: any) {
    this.voiceSettings.next(settings);
  }

  // Theme settings methods
  getThemeSettings() {
    return this.themeSettings.asObservable();
  }

  updateThemeSettings(settings: any) {
    this.themeSettings.next(settings);
  }

  // OpenAI settings methods
  getOpenAiSettings() {
    return this.openAiSettings.asObservable();
  }

  updateOpenAiSettings(settings: any) {
    this.openAiSettings.next(settings);
  }

  // Language settings methods
  getLanguageSettings() {
    return this.languageSettings.asObservable();
  }

  updateLanguageSettings(settings: any) {
    this.languageSettings.next(settings);
  }

  // Save all settings
  saveAllSettings(settings: any) {
    if (settings.voice) {
      this.updateVoiceSettings(settings.voice);
    }
    if (settings.theme) {
      this.updateThemeSettings(settings.theme);
    }
    if (settings.openAi) {
      this.updateOpenAiSettings(settings.openAi);
    }
    if (settings.language) {
      this.updateLanguageSettings(settings.language);
    }
  }

  // Get all settings
  getAllSettings() {
    return {
      voice: this.voiceSettings.value,
      theme: this.themeSettings.value,
      openAi: this.openAiSettings.value,
      language: this.languageSettings.value
    };
  }
} 