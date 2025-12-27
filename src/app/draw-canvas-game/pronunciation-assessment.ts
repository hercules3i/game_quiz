import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { environment } from 'src/environments/environment';

export function getPronunciationAssessment(
  file: File | Buffer,
  content: string,
  localeCode: string,
): Promise<PronunciationAssessment> {
  return new Promise((resolve, reject) => {
    console.log('[getPronunciationAssessment] initial', content, localeCode);

    const speechConfig = sdk.SpeechConfig.fromSubscription(
      (environment as any).azure?.speechSubscription?.key1 || '',
      (environment as any).azure?.speechSubscription?.region || '',
    );
    speechConfig.speechRecognitionLanguage = localeCode;

    const audioConfig = sdk.AudioConfig.fromWavFileInput(file);
    const pronuciationAssessmentConfig = new sdk.PronunciationAssessmentConfig(
      content,
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.FullText,
      false,
    );

    const reco = new sdk.SpeechRecognizer(speechConfig, audioConfig);
    pronuciationAssessmentConfig.applyTo(reco);

    console.log('[getPronunciationAssessment] start recognize');
    reco.recognizeOnceAsync((result: sdk.SpeechRecognitionResult) => {
      const data = JSON.parse(result.json) as RecognitionResult;
      console.log('[getPronunciationAssessment]', data);

      const durationInSeconds = 6; // Thời gian trong giây từ kết quả API
      const durationInHours = durationInSeconds / 3600; // Chuyển sang giờ
      const cost = durationInHours * 0.3; // Tính chi phí
      console.log('Estimated Cost:', cost, durationInHours);

      if (data.RecognitionStatus != 'Success') reject(new Error(data.RecognitionStatus));

      const assessment = data.NBest[0].PronunciationAssessment;
      resolve(assessment);
    });
  });
}

interface Word {
  Word: string;
  Offset: number;
  Duration: number;
}

export interface PronunciationAssessment {
  AccuracyScore: number;
  FluencyScore: number;
  CompletenessScore: number;
  PronScore: number;
}

interface NBest {
  Confidence: number;
  Lexical: string;
  ITN: string;
  MaskedITN: string;
  Display: string;
  PronunciationAssessment: PronunciationAssessment;
  Words: Word[];
}

export interface RecognitionResult {
  Id: string;
  RecognitionStatus: string;
  Offset: number;
  Duration: number;
  Channel: number;
  DisplayText: string;
  SNR: number;
  NBest: NBest[];
}
