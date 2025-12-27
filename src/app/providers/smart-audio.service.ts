import { ElementRef, EventEmitter, Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { NativeAudio } from '@capacitor-community/native-audio';
import Crunker from 'crunker';
import { Howl } from "howler";
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SmartAudioService {
  audioType: string = 'html5';
  sounds: RegisteredSound[] = [];
  jsonAudioChunk: AudioChunk[] = [];
  audioParts: AudioPart[] = [];
  audioRef: ElementRef<HTMLAudioElement>;
  audioUrl = '';
  subscription: Subscription;
  constructor(
    // public nativeAudio: NativeAudio,
    public platform: Platform
  ) {
    // if (platform.is('capacitor')) {
    //   this.audioType = 'native';
    // }
    this.audioType = 'native';
  }
  async preload(key: string, asset: string, isUrl = false) {
    // if (this.audioType === 'html5') {
    //   let audio = {
    //     key: key,
    //     asset: asset,
    //     type: 'html5'
    //   };
    //   this.sounds.push(audio);
    // } else {
    //   // await this.nativeAudio.preloadSimple(key: string, asset);
    // }
    await NativeAudio.preload({
      assetId: key,
      assetPath: asset,
      audioChannelNum: 1,
      isUrl
    });
    let audio = {
      key: key,
      asset: key,
      type: 'native'
    };
    this.sounds.push(audio);
  }
  currentAudio: HTMLAudioElement[] = [];
  listKeyPlaying: string[] = [];
  playAudio() {
    if (!this.audioUrl) {
      return;
    }
    this.audioRef.nativeElement.pause();
    // this.audioSrc = blobUrl;
    // this.audioRef.nativeElement.play();
    this.audioRef.nativeElement.src = this.audioUrl;
    this.audioRef.nativeElement.play();
  }

  stopAudio() {
    this.pauseAudio();
    if (this.audioRef && this.audioRef.nativeElement) {
      this.audioRef.nativeElement.currentTime = 0;
    }
  }

  pauseAudio() {
    try {
      this.audioRef.nativeElement.pause();
    } catch (error) {
      console.log(error);
    }
  }

  async play(key: string, callback?) {
    let audio = this.sounds.find((sound) => {
      return sound.key === key;
    });
    if (audio) {
      // if (audio.type === 'html5') {
      //   let audioAsset = new Audio(audio.asset);
      //   audioAsset.addEventListener('ended', callback);
      //   this.currentAudio.push(audioAsset);
      //   var currentAudio = this.currentAudio;
      //   audioAsset.addEventListener('ended', (event) => {
      //     currentAudio = currentAudio.filter(x => x != event.target);
      //   });
      //   audioAsset.play();
      // } else {
      //   // this.nativeAudio.play(audio.asset, callback).then((res) => {
      //   //   console.log(res);
      //   //   this.listKeyPlaying.push(key: string);
      //   // }, (err) => {
      //   //   console.log(err);
      //   // });
      // }
      await NativeAudio.play({
        assetId: audio.asset,
        // time: 6.0 - seek time
      });
      this.listKeyPlaying.push(key);
    }
  }
  async seek(key: string, time: number) {
    await NativeAudio.play({
      assetId: key,
      time
    });
  }
  async pause(key: string) {
    await NativeAudio.pause({
      assetId: key
    });
  }
  async resume(key: string) {
    await NativeAudio.resume({
      assetId: key
    });
  }
  async getDuration(key: string) {
    return await NativeAudio.getDuration({
      assetId: key
    });
  }
  async getCurrentTime(key: string) {
    return await NativeAudio.getCurrentTime({
      assetId: key
    });
  }
  playHtml5(key: string, callback?) {
    let audio = this.sounds.find((sound) => {
      return sound.key === key;
    });
    let audioAsset = new Audio(audio.asset);
    audioAsset.addEventListener('ended', callback);
    this.currentAudio.push(audioAsset);
    var currentAudio = this.currentAudio;
    audioAsset.addEventListener('ended', (event) => {
      currentAudio = currentAudio.filter(x => x != event.target);
    });
    audioAsset.play();
  }
  async stopAll() {
    // if (this.audioType === 'html5') {
    //   for (const iterator of this.currentAudio) {
    //     iterator.pause();
    //   }
    //   this.currentAudio = [];
    // } else {
    //   for (const iterator of this.listKeyPlaying) {
    //     this.nativeAudio.stop(iterator);
    //   }
    // }
    for (const audio of this.listKeyPlaying) {
      await NativeAudio.stop({
        assetId: audio,
      });
    }
  }

  async concatenateAudio(audioFiles: string[]): Promise<Blob> {
    const crunker = new Crunker();
    return new Promise<Blob>((resolve, reject) => {
      crunker.fetchAudio(...audioFiles).then(buffers => {
        return crunker.concatAudio(buffers);
      }).then((concate) => {
        return crunker.export(concate);
      }).then(async (output) => {
        const waveBlob = output.blob;
        resolve(waveBlob);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  async convertFromPartToChunk(audioBlob: Blob) {
    const audioBlobUrls = await this.getAudioBlobUrls(audioBlob);
    const audioChunks = this.audioParts.map((x, i) => ({
      content: x.text,
      duration: x.end - x.start,
      order: i + 1,
      blobUrl: audioBlobUrls[i]
    }));
    this.jsonAudioChunk = audioChunks;
  }
  async getAudioBlobUrls(audioBlob: Blob, audioParts = this.audioParts) {
    const crunker = new Crunker();
    const buffer = await this.getAudioArray(audioBlob);
    const audioBlobUrls: string[] = [];
    for (const item of audioParts) {
      const audioChunk = await crunker.sliceAudio(buffer, item.start, item.end);
      const output = await crunker.export(audioChunk, 'audio/mp3');
      const blob = output.blob;
      const blobUrl = window.URL.createObjectURL(blob);
      audioBlobUrls.push(blobUrl);
    }
    return audioBlobUrls;
  }
  async getAudioArray(audioBlob: Blob) {
    return new Promise<AudioBuffer>((resolve, reject) => {
      // Assuming you have a Blob instance named 'audioBlob'
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)() as AudioContext;

      // Convert Blob to ArrayBuffer
      let fileReader = new FileReader();
      const realFileReader = (fileReader as any)._realReader;
      if (realFileReader) {
        fileReader = realFileReader;
      }
      fileReader.onload = function () {
        const arrayBuffer = this.result as ArrayBuffer;

        // Decode ArrayBuffer to AudioBuffer
        audioContext.decodeAudioData(
          arrayBuffer,
          function (audioBuffer) {
            // Now 'audioBuffer' contains the audio data
            console.log('AudioBuffer:', audioBuffer);
            resolve(audioBuffer);
            // You can do further processing with the AudioBuffer here
          },
          function (error) {
            console.error('Error decoding audio data:', error);
            reject(error);
          }
        );
      };

      fileReader.readAsArrayBuffer(audioBlob);
    });
  }
  async getBlobFromUrl(base64Url: string) {
    try {
      const resp = await fetch(base64Url);
      // const data = await resp.text();
      // // Decode Base64 to binary data
      // const binaryData = atob(data);

      // // Convert binary data to array buffer
      // const arrayBuffer = new ArrayBuffer(binaryData.length);
      // const uint8Array = new Uint8Array(arrayBuffer);
      // for (let i = 0; i < binaryData.length; i++) {
      //   uint8Array[i] = binaryData.charCodeAt(i);
      // }

      // Create Blob object from array buffer
      const blob = await resp.blob();
      return blob;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
export class SmartAudioPlayer {
  audioPlayer: any;
  playEvent = new EventEmitter();
  stopEvent = new EventEmitter();
  type: AudioPlayerType = 'howl';
  key = '';
  constructor(
    src: string,
    type: AudioPlayerType,
    private service: SmartAudioService,
    key = ''
  ) {
    if (type === 'howl') {
      this.audioPlayer = new Howl({
        src,
        html5: true,
        onplay: () => {
          console.log("onplay");
          this.playEvent.emit();
        },
        onend: () => {
          console.log("onend");
          this.stopEvent.emit();
        },
      });
    }
    // else if (key) {
    //   this.initNative(key, src);
    // }
    this.type = type;
    this.key = key;
  }
  async initNative(key: string, url: string) {
    const indexSound = this.service.sounds.findIndex(x => x.key === key);
    if (indexSound === -1) {
      await this.service.preload(key, url, true);
    }
    NativeAudio.addListener('complete', () => {
      this.stopEvent.emit();
    });
  }
  async play() {
    if (this.type === 'howl') {
      console.log('playing howl');
      if (!this.audioPlayer) {
        return false;
      }
      this.audioPlayer.play();
    }
    else {
      console.log('playing native');
      const indexSound = this.service.sounds.findIndex(x => x.key === this.key);
      if (indexSound === -1) {
        return false;
      }
      await this.service.play(this.key);
      this.playEvent.emit();
    }
    return true;
  }
  async stop() {
    if (this.type === 'howl') {
      if (!this.audioPlayer) {
        return false;
      }
      this.audioPlayer.stop();
    }
    else {
      await this.service.stopAll();
      this.stopEvent.emit();
    }
    return true;
  }
  async pause() {
    if (this.type === 'howl') {
      if (!this.audioPlayer) {
        return false;
      }
      this.audioPlayer.pause();
    }
    else {
      const indexSound = this.service.sounds.findIndex(x => x.key === this.key);
      if (indexSound === -1) {
        return false;
      }
      await this.service.pause(this.key);
    }
    return true;
  }
  async resume() {
    if (this.type === 'howl') {
      if (!this.audioPlayer) {
        return false;
      }
      this.audioPlayer.play();
    }
    else {
      const indexSound = this.service.sounds.findIndex(x => x.key === this.key);
      if (indexSound === -1) {
        return false;
      }
      await this.service.resume(this.key);
    }
    return true;
  }
  async duration() {
    if (this.type === 'howl') {
      if (!this.audioPlayer) {
        return 0;
      }
      const duration = this.audioPlayer.duration() as number;
      return duration;
    }
    else {
      const indexSound = this.service.sounds.findIndex(x => x.key === this.key);
      if (indexSound === -1) {
        return 0;
      }
      const obj = await this.service.getDuration(this.key);
      return obj.duration;
    }
  }
  async seek(newSeek?: number) {
    if (this.type === 'howl') {
      if (!this.audioPlayer) {
        return 0;
      }
      return this.audioPlayer.seek(newSeek) as number;
    }
    else {
      const indexSound = this.service.sounds.findIndex(x => x.key === this.key);
      if (indexSound === -1) {
        return 0;
      }
      if (newSeek) {
        await this.service.seek(this.key, newSeek);
      }
      const obj = await this.service.getCurrentTime(this.key);
      return obj.currentTime;
    }
  }
}
interface RegisteredSound {
  key: string;
  asset: string;
  type: string;
}
export interface AudioChunk {
  blobUrl: string;
  content: string;
  contentStartAt?: number;
  duration: number;
  order?: number;
  isPlaying?: boolean;
}
export interface AudioPart {
  text: string;
  start: number;
  end: number;
}
export type AudioPlayerType = 'howl' | 'native';
