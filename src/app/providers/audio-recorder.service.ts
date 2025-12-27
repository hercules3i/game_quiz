// @ts-nocheck
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Microphone } from "@mozartec/capacitor-microphone";
import { TranslateService } from '@ngx-translate/core';
import { ServiceService } from 'src/app/providers/service.service';
import { bufferToBase64 } from '../draw-canvas-game/utils';
import audiobufferToWav from 'audiobuffer-to-wav';

@Injectable({
  providedIn: 'root'
})
export class AudioRecorderService {
  chunks: Blob[] = [];
  callback: AudioRecorderCallback = {};
  mediaRecorder: MediaRecorder | undefined;
  timestampStart = 0;

  onStop: (base64: string) => void | undefined;
  onStopBlob: (blob: Blob) => void | undefined;

  constructor(
    private service: ServiceService,
    private translate: TranslateService,
    private platform: Platform,
  ) { }

  handleMediaRecorder(mediaRecorder: MediaRecorder, callback: AudioRecorderCallback) {
    mediaRecorder.ondataavailable = e => {
      this.chunks.push(e.data);
    }

    mediaRecorder.onstop = async () => {
      const blob = new Blob(this.chunks, {
        type: 'audio/ogg; codecs=opus'
      });
      const buffer = await blob.arrayBuffer();
      this.chunks = [];

      const duration = Date.now() - this.timestampStart;

      if (callback.onStopBlob) {
        const waveBlob = await this.convertAudioToWav(buffer);
        callback.onStopBlob(waveBlob, {
          durationInMs: duration,
        });
      }
      if (callback.onStop) {
        const base64 = bufferToBase64(buffer);

        callback.onStop(base64, {
          durationInMs: duration,
        });
      }
    }
  }

  async convertUrlToWav(url: string) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return this.convertAudioToWav(arrayBuffer);
  }

  async convertAudioToWav(arrayBuffer: ArrayBuffer): Promise<Blob> {
    try {
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const wavBuffer = audiobufferToWav(audioBuffer);

      return new Blob([wavBuffer], { type: 'audio/wav' });
    } catch (error) {
      console.error('Error converting audio:', error);
      throw error;
    }
  }

  async getMediaRecorder(callback?: AudioRecorderCallback): Promise<MediaRecorder> {
    if (!navigator.mediaDevices) throw new Error('getUserMedia unsupported.');
    if (this.mediaRecorder) {
      if (callback) this.handleMediaRecorder(this.mediaRecorder, callback);
      return this.mediaRecorder;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    this.handleMediaRecorder(mediaRecorder, callback);
    return mediaRecorder;
  }

  async startRecord(callback: AudioRecorderCallback) {
    this.callback = callback;
    this.timestampStart = Date.now();

    if (this.platform.is('capacitor')) {
      console.log("capacitor")

      const permission = await Microphone.checkPermissions();

      if (permission.microphone != 'granted') {
        const requestResult = await Microphone.requestPermissions();
        if (requestResult.microphone != 'granted') {
          throw new Error(this.translate.instant('VOICE_RECORDER.REQUEST_PERMISSION'));
        }
      }

      await Microphone.startRecording();
    } else {
      console.log("! capacitor")
      this.mediaRecorder = await this.getMediaRecorder(callback);
      this.mediaRecorder.start();
    }
  }

  startRecordBlobAsync(): Promise<{ blob: Blob, extra: AudioCallbackExtra }> {
    return new Promise((resolve, _reject) => {
      this.startRecord({
        onStopBlob(blob, extra) {
          console.log('onStopBlob')
          resolve({ blob, extra });
        },
      });
    });
  }

  async transcribeAudio(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      const realFileReader = (reader as any)._realReader;
      if (realFileReader) {
        reader = realFileReader;
      }
      reader.onload = async (event) => {
        const audioData = event.target.result;

        const speechRecognition = new (window as any).webkitSpeechRecognition();
        speechRecognition.continuous = false;
        speechRecognition.interimResults = false;

        speechRecognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          resolve(transcript);
        };

        speechRecognition.onerror = (event) => {
          reject(new Error("Speech recognition error: " + event.error));
        };

        const audioContext = new (window as any).AudioContext();
        const source = audioContext.createBufferSource();
        const audioBuffer = await audioContext.decodeAudioData(audioData);
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();

        speechRecognition.start();
      };
      reader.readAsArrayBuffer(blob);
    });
  }


  async stopRecord() {
    if (this.platform.is('capacitor')) {
      try {
        const result = await Microphone.stopRecording();
        if (!result.base64String) throw new Error("Recorded data is null");

        if (this.callback.onStopBlob) {
          const waveBlob = await this.convertUrlToWav(result.dataUrl);
          this.callback.onStopBlob(waveBlob, {
            durationInMs: result.duration,
          });
        }

        if (this.callback.onStop) {
          this.callback.onStop(result.base64String, {
            durationInMs: result.duration,
          });
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      const mediaRecorder = await this.getMediaRecorder();
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
    }
    }
  }
}

interface AudioCallbackExtra {
  durationInMs: number
}

interface AudioRecorderCallback {
  onStop?(base64: string, options: AudioCallbackExtra): void,
  onStopBlob?(blob: Blob, options: AudioCallbackExtra): void,
}
