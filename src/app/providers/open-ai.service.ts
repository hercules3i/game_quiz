// @ts-nocheck
/* eslint-disable @typescript-eslint/naming-convention */
import { EventEmitter, Injectable } from '@angular/core';
// import { Plugins } from '@capacitor/core'; // Deprecated in Capacitor 5+
// import { Configuration, OpenAIApi, ChatCompletionRequestMessageRoleEnum } from 'openai';
import OpenAI from 'openai';
import { filter, from, lastValueFrom, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { PaymentService, ObjectLog } from './payment.service';
import type { SpeechCreateParams } from 'openai/resources/audio/speech';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { ToastServiceService } from 'src/app/providers/toast-service.service';
import { TranslateService } from '@ngx-translate/core';
import { ServiceService } from './service.service';
import type { ChatCompletionMessageParam } from 'openai/resources/chat';

// const { Permissions } = Plugins; // Deprecated in Capacitor 5+

@Injectable({
  providedIn: 'root'
})
export class OpenAiService {
  openai: OpenAI;
  deepseek: OpenAI;
  messages = [];
  messagesFamilyTree = [];
  fetchEvent = new EventEmitter();
  ctrl = new AbortController();
  listVoice = [
    'alloy',
    'echo',
    'fable',
    'onyx',
    'nova',
    'shimmer',
  ];
  private apiUrl = 'https://api.mymemory.translated.net/get';
  apiEndpoint = 'https://api.openai.com/v1/chat/completions';
  apiKey = '';
  defaultModel = 'gpt-4o-mini';
  defaultImageModel = 'dall-e-2';
  assistantId = 'asst_yLhXPJEmZsQGfHynXpj7e3PO';

  currentThread: OpenAI.Beta.Threads.Thread | undefined;

  messContent;

  isEnough = true;

  // Thêm biến lưu token usage lần gọi gần nhất
  public lastTokenUsage: {
    model: string,
    inputTokens: number,
    outputTokens: number,
    totalTokens: number,
    inputCost: number,
    outputCost: number,
    totalCost: number
  } = null;

  constructor(
    private payment: PaymentService,
    private http: HttpClient,
    private toast: ToastServiceService,
    private translateService: TranslateService,
    private service: ServiceService
  ) {
    this.updateOpenAiInstance();
    this.updateDeepseekInstance();
  }

  updateOpenAiInstance() {
    const key = ((environment.openAIToken == '' || environment.openAIToken == null) ? environment.openAITokenDefault : environment.openAIToken) || localStorage.getItem('selectedOpenAiKey') || '';
    if (!key) {
      this.toast.showToast('Thiếu OpenAI API key!');
    }
    this.openai = new OpenAI({
      apiKey: key,
      dangerouslyAllowBrowser: true
    });
  }
  updateDeepseekInstance() {
    try {
      if (!environment || !environment.deepseekToken) {
        const key = localStorage.getItem('selectedDeepseekKey') || '';
        if (key) {
          this.deepseek = new OpenAI({
            baseURL: 'https://api.deepseek.com/v1',
            apiKey: key,
            dangerouslyAllowBrowser: true
          });
        }
        return;
      }
      
      const key = ((environment.deepseekToken.key == '' || environment.deepseekToken.key == null) ? (environment.deepseekToken.keyDefault || '') : environment.deepseekToken.key) || localStorage.getItem('selectedDeepseekKey') || '';
      if (!key) {
        this.toast.showToast('Thiếu DeepSeek API key!');
      }
      this.deepseek = new OpenAI({
        baseURL: environment.deepseekToken.baseURL || 'https://api.deepseek.com/v1',
        apiKey: key,
        dangerouslyAllowBrowser: true
      });
    } catch (error) {
    }
  }

  /**
   * Kiểm tra và chuyển đổi token DeepSeek dựa trên giới hạn sử dụng
   * @param currentKey Token hiện tại đang sử dụng
   * @returns Token phù hợp để sử dụng
   */
  private getAppropriateDeepseekKey(currentKey: string): string {
    if (!environment || !environment.deepseekToken) {
      return currentKey || localStorage.getItem('selectedDeepseekKey') || '';
    }
    
    // Nếu đang dùng keyDefault thì không có giới hạn
    if (currentKey === environment.deepseekToken.keyDefault) {
      return currentKey;
    }

    // Chỉ kiểm tra giới hạn cho .key (không phải keyDefault)
    if (currentKey === environment.deepseekToken.key) {
      // Lấy thông tin sử dụng token từ localStorage
      const tokenUsageKey = `deepseekTokenUsage_${currentKey}`;
      const usage = JSON.parse(localStorage.getItem(tokenUsageKey) || '{"tokens": 0, "lastReset": 0}');

      const now = Date.now();
      const oneMonth = 30 * 24 * 60 * 60 * 1000; // 30 ngày

      // Reset usage nếu đã qua 1 tháng
      if (now - usage.lastReset > oneMonth) {
        usage.tokens = 0;3
        usage.lastReset = now;
        localStorage.setItem(tokenUsageKey, JSON.stringify(usage));
      }

      // Chỉ cảnh báo, không tự động chuyển đổi
      if (usage.tokens >= 1000000) {
        console.warn('⚠️ Đã đạt giới hạn 1 triệu token! Vui lòng chuyển sang key không giới hạn thủ công.');
      }
    }

    return currentKey; // Luôn trả về key hiện tại, không chuyển đổi
  }

  /**
   * Cập nhật số token đã sử dụng
   * @param key Token đang sử dụng
   * @param tokens Số token đã sử dụng
   */
  private updateTokenUsage(key: string, tokens: number) {
    if (!environment || !environment.deepseekToken) {
      return;
    }
    
    // Chỉ track usage cho .key, không track cho keyDefault
    if (key === environment.deepseekToken.keyDefault) {
      console.log(`Sử dụng key không giới hạn: ${key}`);
      return;
    }

    // Chỉ track usage cho .key
    if (key === environment.deepseekToken.key) {
      const tokenUsageKey = `deepseekTokenUsage_${key}`;
      const usage = JSON.parse(localStorage.getItem(tokenUsageKey) || '{"tokens": 0, "lastReset": 0}');
      usage.tokens += tokens;
      localStorage.setItem(tokenUsageKey, JSON.stringify(usage));

      const remaining = Math.max(0, 1000000 - usage.tokens);
      const percentage = ((usage.tokens / 1000000) * 100).toFixed(2);

      console.log(`Token usage cho ${key}: ${usage.tokens.toLocaleString()}/1,000,000 (${percentage}%)`);
      console.log(`Token còn lại: ${remaining.toLocaleString()}`);

      if (usage.tokens >= 1000000) {
        console.warn('⚠️ Đã đạt giới hạn 1 triệu token! Vui lòng chuyển sang key không giới hạn thủ công.');
      } else if (usage.tokens >= 900000) {
        console.warn('⚠️ Sắp đạt giới hạn token (90%+). Cân nhắc chuyển sang key không giới hạn.');
      }
    }
  }

  changeApiKey(newKey: string) {
    environment.openAIToken = newKey;
    this.updateOpenAiInstance();
  }
  changeDeepseekKey(newKey: string) {
    if (environment?.deepseekToken) {
      environment.deepseekToken.key = newKey;
      this.updateDeepseekInstance();
    }
  }

  /**
   * Lấy thông tin sử dụng token DeepSeek
   * @param key Token cần kiểm tra (nếu không có thì kiểm tra key hiện tại)
   * @returns Thông tin sử dụng token
   */
  getDeepseekTokenUsage(key?: string): { tokens: number; limit: number; remaining: number; isUnlimited: boolean } {
    if (!environment || !environment.deepseekToken) {
      return { tokens: 0, limit: Infinity, remaining: Infinity, isUnlimited: true };
    }
    
    const currentKey = key || environment.deepseekToken.key || localStorage.getItem('selectedDeepseekKey') || environment.deepseekToken.keyDefault;

    // Nếu là keyDefault thì không có giới hạn
    if (currentKey === environment.deepseekToken.keyDefault) {
      return { tokens: 0, limit: Infinity, remaining: Infinity, isUnlimited: true };
    }

    // Nếu là .key thì có giới hạn 1 triệu token
    if (currentKey === environment.deepseekToken.key) {
      const tokenUsageKey = `deepseekTokenUsage_${currentKey}`;
      const usage = JSON.parse(localStorage.getItem(tokenUsageKey) || '{"tokens": 0, "lastReset": 0}');

      return {
        tokens: usage.tokens,
        limit: 1000000,
        remaining: Math.max(0, 1000000 - usage.tokens),
        isUnlimited: false
      };
    }

    // Các key khác (từ localStorage) cũng có giới hạn 1 triệu token
    const tokenUsageKey = `deepseekTokenUsage_${currentKey}`;
    const usage = JSON.parse(localStorage.getItem(tokenUsageKey) || '{"tokens": 0, "lastReset": 0}');

    return {
      tokens: usage.tokens,
      limit: 1000000,
      remaining: Math.max(0, 1000000 - usage.tokens),
      isUnlimited: false
    };
  }

  /**
   * Reset thông tin sử dụng token DeepSeek
   * @param key Token cần reset (nếu không có thì reset key hiện tại)
   */
  resetDeepseekTokenUsage(key?: string) {
    const currentKey = key || environment.deepseekToken.key || localStorage.getItem('selectedDeepseekKey') || environment.deepseekToken.keyDefault;
    const tokenUsageKey = `deepseekTokenUsage_${currentKey}`;
    const usage = { tokens: 0, lastReset: Date.now() };
    localStorage.setItem(tokenUsageKey, JSON.stringify(usage));
    console.log(`Đã reset token usage cho ${currentKey}`);
  }

  translate(text: string): Observable<any> {
    const detectLangUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=|`;

    return this.http.get<any>(detectLangUrl).pipe(
      switchMap((detectResponse) => {
        const detectedLang = detectResponse?.responseData?.matchedLanguage || 'en'; // Ngôn ngữ mặc định nếu không phát hiện được
        const targetLang = detectedLang === 'vi' ? 'en' : 'vi';

        // Kiểm tra để đảm bảo rằng các ngôn ngữ được hỗ trợ
        const langPair = `${detectedLang}|${targetLang}`;
        return this.http.get<any>(`${this.apiUrl}?q=${encodeURIComponent(text)}&langpair=${langPair}`);
      }),
      catchError((error) => {
        console.error('Error occurred while translating:', error);
        throw error; // Bỏ qua lỗi nếu cần
      })
    );
  }

  clearMessages() {
    this.messages = [];
  }

  pushMessage(role: 'user' | 'assistant' | 'system', content: string) {
    this.messages.push({ role, content });
  }

  updateSubscriptionCount() {
    this.payment.countSubscription.openAi++;
    if (this.payment.countSubscription.openAi % 10 === 0) {
      this.payment.updateSubscription('openAi');
    }
  }
  async getDataFromOpenAI(text: string, role: any, model = this.defaultModel, isHide = false) {
    this.updateOpenAiInstance();
    this.updateSubscriptionCount();

    return new Promise<string>(async (resolve, reject) => {
      if (this.payment.aiChargeTracking.Credit <= 0) {
        this.isEnough = await this.payment.handleCreditExhaustion();
        if (!this.isEnough) {
          reject();
        }
      }
      const messages = [
        { role, content: text }
      ];
      if (isHide = false) this.messages.push({ role, content: text });
      const params: OpenAI.Chat.ChatCompletionCreateParams = {
        messages,
        model: model,
      };
      this.openai.chat.completions.create(params).then(async (completion) => {
        console.log(completion);
        const resp = completion.choices[0].message;

        const inputTokens = this.countTokens(text);
        const outputTokens = this.countTokens(resp.content);

        const inputCost = this.calculateCost(inputTokens, true);
        const outputCost = this.calculateCost(outputTokens, false);
        const totalCost = inputCost + outputCost;

        console.log(`Tokens đầu vào: ${inputTokens}`);
        console.log(`Tokens đầu ra: ${outputTokens}`);
        console.log(`Chi phí đầu vào: $${inputCost.toFixed(6)}`);
        console.log(`Chi phí đầu ra: $${outputCost.toFixed(6)}`);
        console.log(`Tổng chi phí: $${totalCost.toFixed(6)}`);

        this.payment.aiChargeTracking.AiInToken += inputTokens;
        this.payment.aiChargeTracking.AiOutToken += outputTokens;

        this.payment.aiChargeTracking.AiInCharge += inputCost;
        this.payment.aiChargeTracking.AiOutCharge += outputCost;

        this.payment.aiChargeTracking.Credit -= inputCost * this.payment.aiCostTable.DOLLAR_EXCHANGE / 1000;
        this.payment.aiChargeTracking.Credit -= outputCost * this.payment.aiCostTable.DOLLAR_EXCHANGE / 1000;

        const log: ObjectLog = {
          date: new Date().toLocaleDateString('en-CA'),
          value: {
            AiIn: { token: inputTokens, price: inputCost },
            AiOut: { token: outputTokens, price: outputCost },
            AiTTS: { token: 0, price: 0 },
            GcVision: { token: 0, price: 0 },
            Pronunciation: { token: 0, price: 0 },
          },
          total: 0,
        };
        this.payment.addOrUpdateLog(log);
        resolve(resp.content);
      }).catch((error) => {
        console.log(error);
        reject(error);
      });
    });
  }
  getAudioFromText(text: string, voice = 'alloy' as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer', speed = 1) {
    this.updateSubscriptionCount();
    return new Promise<ArrayBuffer>(async (resolve, reject) => {
      if (this.payment.aiChargeTracking.Credit <= 0) {
        this.isEnough = await this.payment.handleCreditExhaustion();
        if (!this.isEnough) {
          reject();
        }
      }
      const params: OpenAI.Audio.SpeechCreateParams = {
        input: text,
        model: 'tts-1',
        voice,
        speed
      };
      this.openai.audio.speech.create(params).then(async (resp) => {
        const ttsTokens = this.countCharacters(text);
        const ttsCost = this.calculateTTSCost(ttsTokens);
        console.log(`Ký tự tts: ${ttsTokens}`);
        console.log(`Chi phí tts: $${ttsCost.toFixed(6)}`);
        this.payment.aiChargeTracking.AiTtsToken += ttsTokens;
        this.payment.aiChargeTracking.AiTtsCharge += ttsCost;
        this.payment.aiChargeTracking.Credit -= ttsCost * this.payment.aiCostTable.DOLLAR_EXCHANGE / 1000;
        console.log(resp);
        const arrayBuffer = await resp.arrayBuffer();
        const log: ObjectLog = {
          date: new Date().toLocaleDateString('en-CA'),
          value: {
            AiIn: { token: 0, price: 0 },
            AiOut: { token: 0, price: 0 },
            AiTTS: { token: ttsTokens, price: ttsCost },
            GcVision: { token: 0, price: 0 },
            Pronunciation: { token: 0, price: 0 },
          },
          total: 0,
        };
        this.payment.addOrUpdateLog(log);
        resolve(arrayBuffer);
      }).catch((error) => {
        console.log(error);
        reject(error);
      });
    });
  }
  getAudioFromText68(text,voice='Phan nhân thọ') {
    // const body = "?gen_text=" + text + "&checkpoint_person_name="+'phung trung'
    const formData: FormData = new FormData();
    formData.append('gen_text', text);
    formData.append('checkpoint_person_name', voice);

    const url = 'https://tts.metalearn.vn/infer';

    return lastValueFrom(this.service.postApiResultBlob(url, formData));
  }

  async getAudioBlobFromText(text: string, voice: SpeechCreateParams['voice'] = 'fable', speed = 1) {
    this.updateSubscriptionCount();

    if (this.payment.aiChargeTracking.Credit <= 0) {
      this.isEnough = await this.payment.handleCreditExhaustion();
      if (!this.isEnough) {
        return null;
      }
    }
    const params: OpenAI.Audio.SpeechCreateParams = {
      input: text,
      model: 'tts-1',
      voice,
      speed
    };

    const ttsTokens = this.countCharacters(text);
    const ttsCost = this.calculateTTSCost(ttsTokens);
    console.log(`Ký tự tts: ${ttsTokens}`);
    console.log(`Chi phí tts: $${ttsCost.toFixed(6)}`);
    this.payment.aiChargeTracking.AiTtsToken += ttsTokens;
    this.payment.aiChargeTracking.AiTtsCharge += ttsCost;
    this.payment.aiChargeTracking.Credit -= ttsCost * this.payment.aiCostTable.DOLLAR_EXCHANGE / 1000;

    const response = await this.openai.audio.speech.create(params)
    const log: ObjectLog = {
      date: new Date().toLocaleDateString('en-CA'),
      value: {
        AiIn: { token: 0, price: 0 },
        AiOut: { token: 0, price: 0 },
        AiTTS: { token: ttsTokens, price: ttsCost },
        GcVision: { token: 0, price: 0 },
        Pronunciation: { token: 0, price: 0 },
      },
      total: 0,
    };
    this.payment.addOrUpdateLog(log);
    return await response.blob();
  }

  countTokens(text: string): number {
    const tokenRegex = /([\p{L}\p{N}]+|[^\p{L}\p{N}\s])/gu;
    const tokens = text.match(tokenRegex);
    return tokens ? tokens.length : 0;
  }

  countCharacters(text: string): number {
    if (!text || typeof text !== 'string') {
      return 0;
    }
    return text.length;
  }

  calculateCost = (tokens: number, isInput: boolean): number => {
    const costPerMillionTokens = isInput ? this.payment.aiCostTable.AI_IN_TOKEN : this.payment.aiCostTable.AI_OUT_TOKEN;
    return (tokens / 1_000_000) * costPerMillionTokens;
  };

  calculateTTSCost(tokens: number) {
    const costPerCharacter = this.payment.aiCostTable.AI_TEXT_TO_SPEECH;
    const ttsCost = tokens * costPerCharacter;
    return ttsCost;
  };

  async getStreamingDataFromOpenAI(text: string, role: any, model = this.defaultModel) {
    console.log('getStreamingDataFromOpenAI');
    this.updateSubscriptionCount();

    if (this.payment.aiChargeTracking.Credit <= 0) {
      this.isEnough = await this.payment.handleCreditExhaustion();
      if (!this.isEnough) {
        return;
      }
    }
    this.messages = [];
    this.messages.push({ role, content: text });
    let content = '';
    let roleChat = '';

    let apiEndpoint = this.apiEndpoint;
    let apiKey = this.apiKey;
    if (model === 'deepseek-chat') {
      apiEndpoint = 'https://api.deepseek.com/v1/chat/completions';

      // Lấy key hiện tại
      const currentKey = (environment?.deepseekToken?.key) || localStorage.getItem('selectedDeepseekKey') || (environment?.deepseekToken?.keyDefault) || '';

      // Kiểm tra và lấy key phù hợp
      const appropriateKey = this.getAppropriateDeepseekKey(currentKey);

      // Nếu key thay đổi, cập nhật instance và environment
      if (appropriateKey !== currentKey) {
        if (environment?.deepseekToken) {
          environment.deepseekToken.key = appropriateKey;
          this.updateDeepseekInstance();
        }
      }

      apiKey = appropriateKey;
    } else {
      apiKey = localStorage.getItem('selectedOpenAiKey') || ((environment.openAIToken == '' || environment.openAIToken == null) ? environment.openAITokenDefault : environment.openAIToken) || '';
    }

    try {
      const requestBody = {
        model: model,
        messages: this.messages,
        stream: true,
      };
      const requestHeaders = {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      };
      let waiting = true;

      const r = [];

      await fetchEventSource(apiEndpoint, {
        headers: requestHeaders,
        body: JSON.stringify(requestBody),
        method: 'POST',
        openWhenHidden: false,
        signal: this.ctrl.signal,
        onmessage: (ev) => {
          const response = JSON.parse(ev.data);
          try {
            const choice = response.choices[0];
            if (choice.finish_reason === 'stop') {
              this.ctrl.abort();

              // Tính toán tokens và chi phí sau mỗi phản hồi
              console.log('content', content);

              const inputTokens = this.countTokens(text);
              const outputTokens = this.countTokens(content);

              const inputCost = this.calculateCost(inputTokens, true);
              const outputCost = this.calculateCost(outputTokens, false);
              const totalCost = inputCost + outputCost;

              console.log(`Tokens đầu vào: ${inputTokens}`);
              console.log(`Tokens đầu ra: ${outputTokens}`);
              console.log(`Chi phí đầu vào: $${inputCost.toFixed(6)}`);
              console.log(`Chi phí đầu ra: $${outputCost.toFixed(6)}`);
              console.log(`Tổng chi phí: $${totalCost.toFixed(6)}`);

              // Cập nhật token usage cho DeepSeek
              if (model === 'deepseek-chat') {
                this.updateTokenUsage(apiKey, inputTokens + outputTokens);
              }

              this.payment.aiChargeTracking.AiInToken += inputTokens;
              this.payment.aiChargeTracking.AiOutToken += outputTokens;

              this.payment.aiChargeTracking.AiInCharge += inputCost;
              this.payment.aiChargeTracking.AiOutCharge += outputCost;

              this.payment.aiChargeTracking.Credit -= inputCost * this.payment.aiCostTable.DOLLAR_EXCHANGE / 1000;
              this.payment.aiChargeTracking.Credit -= outputCost * this.payment.aiCostTable.DOLLAR_EXCHANGE / 1000;

              const log: ObjectLog = {
                date: new Date().toLocaleDateString('en-CA'),
                value: {
                  AiIn: { token: inputTokens, price: inputCost },
                  AiOut: { token: outputTokens, price: outputCost },
                  AiTTS: { token: 0, price: 0 },
                  GcVision: { token: 0, price: 0 },
                  Pronunciation: { token: 0, price: 0 },
                },
                total: 0,
              };
              this.payment.addOrUpdateLog(log);
            }
            if (waiting) {
              waiting = false;
              content = '';
            }
            const textRs = choice.delta.content;
            if (typeof textRs === 'string') {
              content += textRs;
            }
            else if (typeof choice.delta.role === 'string') {
              roleChat = choice.delta.role;
            }
            console.log(textRs);
            this.messContent = textRs;
          } catch (error) {
            console.log(error);
          }

          this.fetchEvent.emit(content);
        },
        onclose: () => {
          console.log('closed');
        },
        onerror: (error) => {
          console.log(error);
        },
      });

    } catch (error) {
      if (error.response?.status) {
        console.error(error.response.status, error.message);
        error.response.data.on('data', data => {
          const message = data.toString();
          try {
            const parsed = JSON.parse(message);
            console.error('An error occurred during OpenAI request: ', parsed);
          } catch (errorO) {
            console.error('An error occurred during OpenAI request: ', message);
          }
        });
      } else {
        console.error('An error occurred during OpenAI request', error);
      }
    }
    if (content && roleChat) {
      this.messages.push({ role: roleChat, content });
    }
  }
  async setCreditAiServiceChargeTracking() {
    this.isEnough = await this.payment.checkAndPurchaseCredit();
  }
  putUserAiServiceChargeTracking() {
    this.payment.putUserAiServiceChargeTracking();
  }
  stropStreamingData() {
    this.ctrl.abort();
    this.ctrl = new AbortController()
  }

  async createThread() {
    this.currentThread = await this.openai.beta.threads.create();
    console.log('createThread', this.currentThread);
  }

  async createAssistantMessage(content: string): Promise<OpenAI.Beta.Threads.Messages.Message> {
    if (!this.currentThread) await this.createThread();

    return await this.openai.beta.threads.messages.create(
      this.currentThread.id,
      {
        role: 'user',
        content,
      },
    );
  }

  createAssistantRun() {
    return this.openai.beta.threads.runs.stream(this.currentThread.id, {
      assistant_id: this.assistantId
    });
  }

  listModels() {
    return this.openai.models.list();
  }

  listAssistants() {
    return this.openai.beta.assistants.list();
  }

  async generateImage(
    prompt: string,
    size: OpenAI.ImageGenerateParams['size'] = '512x512',
    responseFormat: 'url' | 'b64_json' = 'url',
    model = this.defaultImageModel,
  ): Promise<OpenAI.Images.Image> {
    const response = await this.openai.images.generate({
      n: 1,
      model,
      size,
      prompt,
      response_format: responseFormat,
    })

    return response.data[0];
  }

  async getOnceCompletion(instruction: string, prompt: string, model = this.defaultModel) {
    if (this.payment.aiChargeTracking.Credit <= 0) {
      this.isEnough = await this.payment.handleCreditExhaustion();
      if (!this.isEnough) {
        return '';
      }
    }

    const completion = await this.openai.chat.completions.create({
      messages: [
        { role: 'system', content: instruction },
        { role: 'user', content: prompt },
      ],
      model,
    });

    const inputTokens = this.countTokens(instruction) + this.countTokens(prompt);
    const outputTokens = this.countTokens(completion.choices[0].message.content);

    const inputCost = this.calculateCost(inputTokens, true);
    const outputCost = this.calculateCost(outputTokens, false);
    const totalCost = inputCost + outputCost;

    console.log(`Tokens đầu vào: ${inputTokens}`);
    console.log(`Tokens đầu ra: ${outputTokens}`);
    console.log(`Chi phí đầu vào: $${inputCost.toFixed(6)}`);
    console.log(`Chi phí đầu ra: $${outputCost.toFixed(6)}`);
    console.log(`Tổng chi phí: $${totalCost.toFixed(6)}`);

    this.payment.aiChargeTracking.AiInToken += inputTokens;
    this.payment.aiChargeTracking.AiOutToken += outputTokens;

    this.payment.aiChargeTracking.AiInCharge += inputCost;
    this.payment.aiChargeTracking.AiOutCharge += outputCost;

    this.payment.aiChargeTracking.Credit -= inputCost * this.payment.aiCostTable.DOLLAR_EXCHANGE / 1000;
    this.payment.aiChargeTracking.Credit -= outputCost * this.payment.aiCostTable.DOLLAR_EXCHANGE / 1000;

    const log: ObjectLog = {
      date: new Date().toLocaleDateString('en-CA'),
      value: {
        AiIn: { token: inputTokens, price: inputCost },
        AiOut: { token: outputTokens, price: outputCost },
        AiTTS: { token: 0, price: 0 },
        GcVision: { token: 0, price: 0 },
        Pronunciation: { token: 0, price: 0 },
      },
      total: 0,
    };
    this.payment.addOrUpdateLog(log);

    return completion.choices[0].message.content;

  }

  // async speechToText(file: File, language = 'vi', model = 'whisper-1') {
  //   const transcription = await this.openai.audio.transcriptions.create({
  //     file,
  //     model,
  //     language,
  //   });

  //   return transcription.text;
  // }

  getAudioDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.addEventListener('loadedmetadata', () => {
        resolve(audio.duration); // Trả về thời lượng (giây)
      });
      audio.addEventListener('error', (e) => reject(e));
    });
  }

  async speechToText(file: File, language = 'vi', model = 'whisper-1') {
    if (this.isEnough) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('model', model);
      formData.append('language', language);

      let fileDuration;
      this.getAudioDuration(file).then(duration => {
        console.log(`Duration: ${duration} seconds`);
        fileDuration = duration;
      }).catch(err => {
        console.error('Error reading duration:', err);
      });

      try {
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${environment.openAIToken}`, // Thay YOUR_API_KEY bằng khóa API của bạn
          },
          body: formData,
        });

        // Kiểm tra phản hồi
        if (!response.ok) {
          const errorDetails = await response.json(); // Lấy thông tin lỗi
          console.error("API Error Details:", errorDetails); // Log chi tiết lỗi
          throw new Error(`Error: ${errorDetails.message}`); // Ném lỗi ra ngoài với thông điệp chi tiết
        }

        const ttsCost = fileDuration * 0.006 / 60;
        console.log(`Chi phí tts: $${ttsCost.toFixed(6)}`);
        this.payment.aiChargeTracking.AiTtsCharge += ttsCost;
        this.payment.aiChargeTracking.Credit -= ttsCost * this.payment.aiCostTable.DOLLAR_EXCHANGE / 1000;

        const transcription = await response.json();
        return transcription.text;

      } catch (error) {
        console.error("Error during transcription:", error);
        throw error; // Ném lỗi ra ngoài
      }
    } else {
      // this.toast.showToast(this.translateService.instant('STUDY_WITH_AI.NOT_ENOUGH_BALANCE'))
      return this.translateService.instant('STUDY_WITH_AI.NOT_ENOUGH_BALANCE');
    }
  }


  blobToFile(blob: Blob, filename: string): Promise<File> {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      const realFileReader = (reader as any)._realReader;
      if (realFileReader) {
        reader = realFileReader;
      }
      reader.onloadend = () => {
        const thisWindow: any = window;
        const OldFile = thisWindow.OldFile;
        const file = new OldFile([reader.result as ArrayBuffer], filename, { type: blob.type });
        resolve(file);
      };
      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        reject(error);
      };
      reader.readAsArrayBuffer(blob);
    });
  }

  async requestStoragePermission() {
    // Capacitor 5+ removed Plugins API
    // Storage permissions are handled automatically on web
    // For native, use specific permission plugins if needed
    return Promise.resolve();
  }

  async checkPermission() {
    // Capacitor 5+ removed Plugins API
    // Storage permissions are handled automatically on web
    return Promise.resolve();
  }

  // Gộp logic OpenAI và DeepSeek, chỉ cần 1 hàm chat duy nhất
  async chat(messages: ChatCompletionMessageParam[], model: string) {
    const params = { messages, model };

    if (model === 'deepseek-chat') {
      // Lấy key hiện tại
      const currentKey = (environment?.deepseekToken?.key) || localStorage.getItem('selectedDeepseekKey') || (environment?.deepseekToken?.keyDefault) || '';

      // Kiểm tra và lấy key phù hợp
      const appropriateKey = this.getAppropriateDeepseekKey(currentKey);

      // Nếu key thay đổi, cập nhật instance
      if (appropriateKey !== currentKey) {
        if (environment?.deepseekToken) {
          environment.deepseekToken.key = appropriateKey;
          this.updateDeepseekInstance();
        }
      }

      const client = this.deepseek;
      const completion = await client.chat.completions.create(params);

      // Tính và log số token
      const inputTokens = this.countTokens(messages.map(m => m.content).join(' '));
      const outputTokens = this.countTokens(completion.choices[0].message.content);
      const totalTokens = inputTokens + outputTokens;

      // Cập nhật usage cho key đang sử dụng
      this.updateTokenUsage(appropriateKey, totalTokens);

      console.log(`Tokens đầu vào: ${inputTokens}`);
      console.log(`Tokens đầu ra: ${outputTokens}`);
      console.log(`Tổng tokens: ${totalTokens}`);
      console.log(`Sử dụng key: ${appropriateKey}`);

      return completion.choices[0].message.content;
    } else {
      const client = this.openai;
      const completion = await client.chat.completions.create(params);

      // Tính và log số token
      const inputTokens = this.countTokens(messages.map(m => m.content).join(' '));
      const outputTokens = this.countTokens(completion.choices[0].message.content);
      const totalTokens = inputTokens + outputTokens;

      console.log(`Tokens đầu vào: ${inputTokens}`);
      console.log(`Tokens đầu ra: ${outputTokens}`);
      console.log(`Tổng tokens: ${totalTokens}`);

      return completion.choices[0].message.content;
    }
  }

  /**
   * Hàm gọi AI (OpenAI hoặc DeepSeek) theo model, trả về content và log token usage
   */
  async getDataFromAnyAI(text: string, role: any, model: string = this.defaultModel, isHide = false) {
    this.updateOpenAiInstance();
    this.updateSubscriptionCount();
    return new Promise<string>(async (resolve, reject) => {
      if (this.payment.aiChargeTracking.Credit <= 0) {
        this.isEnough = await this.payment.handleCreditExhaustion();
        if (!this.isEnough) {
          reject();
        }
      }
      const messages = [
        { role, content: text }
      ];
      let client = this.openai;
      let params: OpenAI.Chat.ChatCompletionCreateParams = {
        messages,
        model: model,
      };
      // Nếu là deepseek thì dùng đúng instance và baseURL
      if (model && model.toLowerCase().includes('deepseek')) {
        this.updateDeepseekInstance();
        client = this.deepseek;
        // Đảm bảo baseURL đúng của DeepSeek
        if (client.baseURL !== (environment.deepseekToken.baseURL || 'https://api.deepseek.com/v1')) {
          client.baseURL = environment.deepseekToken.baseURL || 'https://api.deepseek.com/v1';
        }
      }
      client.chat.completions.create(params).then(async (completion) => {
        const resp = completion.choices[0].message;
        const inputTokens = this.countTokens(text);
        const outputTokens = this.countTokens(resp.content);
        const inputCost = this.calculateCost(inputTokens, true);
        const outputCost = this.calculateCost(outputTokens, false);
        const totalCost = inputCost + outputCost;
        this.lastTokenUsage = {
          model,
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
          inputCost,
          outputCost,
          totalCost
        };
        console.log(`[AI] Model: ${model} | Input tokens: ${inputTokens} | Output tokens: ${outputTokens} | Total: ${inputTokens + outputTokens} | Cost: $${totalCost.toFixed(6)}`);
        resolve(resp.content);
      }).catch((error) => {
        reject(error);
      });
    });
  }
}
