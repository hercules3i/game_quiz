import {
    Component,
    ViewChild,
    ElementRef,
    EventEmitter,
    Input,
    Output,
} from "@angular/core";

import { bufferToBase64, playBase64Audio } from "../utils";
import { TranslateService } from '@ngx-translate/core';
import { ServiceService } from 'src/app/providers/service.service';
import { AudioRecorderService } from "src/app/providers/audio-recorder.service";
import { IonModal, IonItem } from "@ionic/angular/standalone";

@Component({
    selector: 'input-audio',
    styleUrls: ["./input-audio.component.scss"],
    templateUrl: './input-audio.component.html',
})
export class InputAudio {
    name: string;
    audioData = "";
    fileLabel = "";
    isRecording = false;
    isLoading = false;

    @ViewChild('audioInput') elAudioInput!: ElementRef;
    @ViewChild('modal', { static: false }) modal!: IonModal;
    @Input() label!: string;
    @Output() onChange = new EventEmitter<string>(true);

    constructor(
        public service: ServiceService,
        private translate: TranslateService,
        private audioRecorder: AudioRecorderService,
    ) {
        this.name = "Angular";
    }

    openModal() {
        this.modal.backdropDismiss = false;
        this.modal.present();
    }

    closeModal() {
        this.modal.dismiss();
        this.audioRecorder.stopRecord();
        this.isRecording = false;
    }

    async onFileSelected(event: Event) {
        const files = (event.target as HTMLInputElement).files;
        if (files && files.length > 0) {
            const file = files[0];

            if (file.type.startsWith('audio')) {
                this.fileLabel = file.name;
                const base64 = bufferToBase64(await file.arrayBuffer());
                this.onChange.emit(base64);
            } else {
                this.service.messageError(this.translate.instant('FLASHCARD.INVALID_FILE_FORMAT'));
                this.elAudioInput.nativeElement.value = "";
            }
        }
    }

    emitChange(base64: string) {
        this.onChange.emit(base64);
        this.audioData = base64;
        this.fileLabel = 'record_data_' + Date.now();
        this.isRecording = false;
        console.log('[input-audio.component] Emited');
    }

    async startRecording() {
        try {
            await this.audioRecorder.startRecord({
                onStop: (base64: any) => {
                    this.emitChange(base64);
                    this.isLoading = true;
                },
            });

            this.isRecording = true;
        } catch (e) {
            console.error(e);
            const msg = (e as Error).message;
            this.service.messageError(msg);
        }
    }

    stopRecording() {
        this.audioRecorder.stopRecord();
        this.isLoading = true;
    }

    playCurrentAudioData() {
        playBase64Audio(this.audioData);
    }
}
