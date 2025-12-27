import { marked } from 'marked';
import type { OpenAiService } from '../../providers/open-ai.service';
import type { SpeechCreateParams } from 'openai/resources/audio/speech';
import type { Message, ChatWebsyncService } from '../../providers/chat-websync.service';
import { GoogleApiService } from '../google-api.service';

export class ConcurrencyTextToSpeech {
  rawContent = '';
  separatedContent = '';
  textQueue = <string[]>[];
  audioQueue = <ChunkData[]>[];
  highlightIndex = 0;

  public audioIndex = 0;
  public message: Message | undefined;

  lockLoopTTS = false;
  lockLoopPlayAudio = false;
  isPlaying = true;

  //less laggy
  words = <string[]>[];
  currentCharStart = 0;
  wordIndex = 0;
  currentService = 'openai';


  constructor(
    private openAi: OpenAiService,
    private voice: SpeechCreateParams['voice'],
    private speed: number,
    private studyWithApiPage: ChatWebsyncService,
    public isOtherPlaying: () => boolean,
    private googleApi: GoogleApiService = null,
    public service: string = 'openai',
  ) {
    this.currentService = service;
  }

  getIsPageActive(): boolean {
    return this.studyWithApiPage.isPageActive;
  }

  getHighlightColor(): string {
    return this.studyWithApiPage.currentHighlightColor;
  }

  public updateMessagePlayingStatus(value: boolean) {
    if (!this.message) return;

    if (value) {
      this.message.isPlay = true;
    } else {
      this.message.isPlay = false;
    }
  }

  pushContent(content: string, isFinal: boolean) {
    if (isFinal) this.rawContent = content;

    const word = this.words[this.wordIndex];
    if (word) {
      const wordStart = this.rawContent.indexOf(word, this.currentCharStart);
      const wordLength = word.length;
      this.highlightTextByWordIndex(wordStart, wordLength);
    }
    this.updateTextQueue(isFinal);
  }

  pushAudio(blob: Blob, charStart: number, text: string) {
    const blobUrl = URL.createObjectURL(blob);
    const howl = new Howl({
      src: [blobUrl],
      html5: true,
      preload: 'metadata',
    });

    this.audioQueue.push({
      audio: howl,
      text,
      charStart,
      charLength: text.length,
    });

    howl.on('play', () => {
      this.lockLoopPlayAudio = true;
      this.startHighlightTextByWord(text, charStart, howl);
    });

    howl.on('end', () => {
      this.lockLoopPlayAudio = false;
      this.loopPlayAudio();
    });
  }

  updateTextQueue(isFinal: boolean) {
    let newContent = this.rawContent;

    if (!isFinal) {
      const regex = /.+[!?.;:]|.+\n\n/gs;
      const match = this.rawContent.match(regex);
      if (!match) return;
      newContent = match[0];
    }

    const wordLimit = 80;
    const newSentence = newContent.replace(this.separatedContent, '');
    if (!isFinal && newSentence.length < wordLimit) return;

    if (newSentence) {
      this.textQueue.push(newSentence);
      this.separatedContent += newSentence;
      this.loopTTS();
      console.log('[updateTextQueue pushed]', newSentence);
    }
  }

  async loopTTS() {
    if (this.lockLoopTTS) return console.log('[loopTTS] rejected by lock');

    const text = this.textQueue.shift();
    if (!text) return console.log('text is undefined');

    this.lockLoopTTS = true;

    if (this.currentService === 'openai') {
      const blob = await this.openAi.getAudioBlobFromText(text, 'fable', this.speed);
      this.pushAudio(blob, this.highlightIndex, text);
    }
    if (this.currentService === 'google') {
      const lang = await this.googleApi.detect(text);
      const blob = await this.googleApi.speak(text, lang);
      this.pushAudio(blob, this.highlightIndex, text);
    }
    this.highlightIndex += text.length;

    this.lockLoopTTS = false;
    this.loopTTS();
    this.loopPlayAudio();

    this.studyWithApiPage.setCredit()
  }

  async loopPlayAudio() {
    if (this.isOtherPlaying()) return console.log('[loopPlayAudio] rejected by isOtherPlaying');
    if (this.lockLoopPlayAudio) return console.log('[loopPlayAudio] rejected by lock');
    if (!this.getIsPageActive()) return console.log('[loopPlayAudio] Reject by page is inactive');
    if (!this.isPlaying) return console.log('[loopPlayAudio] Reject by isPlaying is false');

    const audioChunk = this.audioQueue[this.audioIndex];

    if (!audioChunk) {
      this.clearHighlight(); // Xóa highlight khi kết thúc
      this.stopPlayAudio();
      // setTimeout(() => {
      //   this.studyWithApiPage.startRecordingFooter();
      // }, 1500);
      return console.log('[loopPlayAudio] onStop');
    } else if (this.audioIndex === 0) {
      console.log('[loopPlayAudio] onStart');
      this.updateMessagePlayingStatus(true); // Đặt isPlay của message về true khi bắt đầu phát
    }

    console.log('[loopPlayAudio] start load audio');

    const audio = audioChunk.audio;
    audio.play();
    this.audioIndex++;
  }

  startPlayAudio() {
    this.stopPlayAudio();
    this.isPlaying = true;
    this.lockLoopPlayAudio = false;
    this.loopPlayAudio();
  }

  stopPlayAudio() {
    for (const chunk of this.audioQueue) {
      chunk.audio.stop();
    }

    this.isPlaying = false;
    this.audioIndex = 0;
    this.highlightIndex = 0;
    this.lockLoopPlayAudio = true;
    this.currentCharStart = 0;
    this.wordIndex = 0;
    this.words = [];
    this.updateMessagePlayingStatus(false);
  }

  startHighlightTextByWord(text: string, charStart: number, audio: Howl) {
    let words;
    if (text.includes(' ')) {
      words = text.split(' ');
    } else {
      words = text.split('');
    }

    let currentWordIndex = 0;
    let currentCharStart = charStart;
    this.words = words;
    this.currentCharStart = charStart;

    const interval = setInterval(() => {
      const duration = audio.duration();
      const elapsed = audio.seek();
      const progress = elapsed / duration;
      const wordIndex = Math.floor(progress * words.length);
      this.wordIndex = wordIndex;

      if (wordIndex > currentWordIndex) {
        const word = words[wordIndex];
        const wordStart = this.rawContent.indexOf(word, currentCharStart);
        const wordLength = word.length;
        this.highlightTextByWordIndex(wordStart, wordLength);
        // this.studyWithApiPage.playGif();
        currentCharStart = wordStart + wordLength; // cập nhật vị trí bắt đầu cho từ tiếp theo
        currentWordIndex = wordIndex;
      }


      if (!audio.playing()) {
        clearInterval(interval);
        this.clearHighlight();
      }
    }, 100);
  }

  async highlightTextByWordIndex(wordStart: number, wordLength: number): Promise<boolean> {
    const wordEnd = wordStart + wordLength;

    const before = this.rawContent.slice(0, wordStart);
    const highlight = this.rawContent.slice(wordStart, wordEnd);
    const after = this.rawContent.slice(wordEnd);

    if (highlight.startsWith('1. ')) return;
    if (highlight.startsWith('+ ')) return;
    if (highlight.startsWith('- ')) return;

    const textHighlighted = `<span id="message-highlighted" style="background-color: ${this.getHighlightColor()}; border-radius: 8px;"> ${highlight} </span>`;
    const html = await markdownToHtml(before + textHighlighted + after);
    this.message.translatedContent = html;

    setTimeout(() => {
      // this.studyWithApiPage.scrollToHighlight.tryScrollToHighlight();
    }, 100);

    return true;
  }

  async clearHighlight() {
    if (this.message) {
      const html = await markdownToHtml(this.rawContent);
      this.message.translatedContent = html;
    }

    // this.studyWithApiPage.stopGif();
    // setTimeout(() => {
    //   this.studyWithApiPage.startRecordingFooter();
    //   this.studyWithApiPage.gifSound = this.studyWithApiPage.gifSoundSrcPlaying;
    // }, 2000);
  }
}

interface ChunkData {
  audio: Howl,
  text: string
  charStart: number
  charLength: number
}

export async function markdownToHtml(content: string): Promise<string> {
  const html = marked.parse(content);
  if (typeof html == 'string') return html;
  return await html;
}
