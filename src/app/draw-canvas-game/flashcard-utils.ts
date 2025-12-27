// @ts-nocheck
import { fabric } from 'fabric';
import { AudioRecorderService } from 'src/app/providers/audio-recorder.service';
import { getPronunciationAssessment } from "./pronunciation-assessment";
import { playBase64Audio, createFabricImageFromUrl, resizeImageFromUrl } from './utils';
import { playAudio } from './draw-canvas-game.page';
import { TranslateService } from '@ngx-translate/core';
// import { updatePronounceCorrectRate, updateVocabularyCorrectRate } from '../learn-statistics/learn-statistics-storage';

// Stub functions - file learn-statistics-storage does not exist
function updatePronounceCorrectRate(score: number) {
  // Stub implementation
}

function updateVocabularyCorrectRate(isCorrect: boolean) {
  // Stub implementation
}
// import { Howl } from 'howler';
// Stub for Howl
const Howl: any = class {
  constructor(options: any) {}
  play() {}
};

export const iconMoreButton = '🔆';
export const iconResultButton = '💡';
export const iconProrounce = '👄';
export const labelPronounce = 'Pronounce';
export const labelRecording = '🔴 Recording...';
export const labelLoading = '🕗 Loading...';

export const ratio = 3 / 4;
export const cardWidth = 200;
export const cardHeight = cardWidth / ratio;
export const padding = 5;
export const scale = 1;
export const cornerRadius = 8;

export async function createFlashcard(
    word: string,
    spelling: string,
    partOfSpeech: string,
    imageData: string,
    audioLabel1 = 'Audio 1',
    audioLabel2 = 'Audio 2',
    audioData1: string,
    audioData2?: string,
    localeCode = 'en-US',
    example1?: string,
    example2?: string,
): Promise<fabric.Group> {
    const frontFace = await createFlashcardFrontFace(imageData);
    const backFace = await createFlashcardBackFace(
        word,
        spelling,
        partOfSpeech,
        audioLabel1,
        audioLabel2,
        audioData2 !== undefined,
    );
    const infoFace = createFlashcardInfoFace(
        example1,
        example2,
    );
    infoFace.set('visible', false);

    const group = new fabric.Group([frontFace, backFace, infoFace], {
        name: "quiz-flashcard",
        top: 200,
        left: 200,
        ...({ audioData1: audioData1, audioData2: audioData2, localeCode, example1, example2 } as any),
        scaleX: scale,
        scaleY: scale,
    });

    group.item(1).set('visible', false);
    return group;
}

export function handleFlashcard(
    flashcard: fabric.Group,
    isDoQuiz: () => boolean,
    audioRecorder: AudioRecorderService,
    translate: TranslateService,
) {
    generateFlashcardAudioPlayer(flashcard);

    let status: FlashcardStatus = FlashcardStatus.IDLE;

    const inputFaceToResultFace = () => {
        disableFlashcardInputText(flashcard);
        enableFlashcardResultFace(flashcard);
        status = FlashcardStatus.RESULT;
        (flashcard as any).canvas?.requestRenderAll();
    }

    const inputFaceToFrontFace = () => {
        disableFlashcardInputText(flashcard);
        status = FlashcardStatus.IDLE;
    }

    listenFlashcardInputEvent(
        flashcard,
        () => status,
        inputFaceToResultFace,
        inputFaceToFrontFace,
    );

    flashcard.on("mouseup", event => {
        if (!isDoQuiz()) return console.log('[handleFlashcard] rejected by isDoQuiz');
        if ((flashcard as any).canvas?.flashcardIsDragging) return console.log('[handleFlashcard] rejected by isDragging');
        if ((flashcard as any).canvas?.flashcardIsFromDragging) {
            (flashcard as any).canvas.flashcardIsFromDragging = false;
            console.log('[handleFlashcard] rejected by isFromDragging');
            return;
        }

        if (status == FlashcardStatus.INFO) {
            console.log('[flashcard] on info');

            disableFlashcardInfoFace(flashcard);
            status = FlashcardStatus.RESULT;
            playAudio('inputObject');
        } else if (status == FlashcardStatus.RESULT) {
            console.log('[flashcard] on result');
            const action = handleFlashcardResultFace(event, flashcard, audioRecorder);;

            if (action === FlashcardAction.TO_IDLE) {
                disableFlashcardResultFace(flashcard, audioRecorder);
                status = FlashcardStatus.IDLE;
                playAudio('inputObject');
            }

            if (action === FlashcardAction.TO_INFO) {
                status = FlashcardStatus.INFO;
                playAudio('inputObject');
                enableFlashcardInfoFace(flashcard, translate);
            }
        } else {
            if (status == FlashcardStatus.INPUT) {
                console.log('[flashcard] on input');

                const toResultAction = handleFlashcardToResultButton(flashcard, event);
                const inputAction = handleFlashcardInputText(flashcard, event);

                if (
                    toResultAction === FlashcardAction.TO_RESULT
                    || inputAction === FlashcardAction.TO_RESULT
                ) {
                    playAudio('inputObject');
                    inputFaceToResultFace();
                }
            } else {
                console.log('[flashcard] on front');
                const action = handleFlashcardIdleFace(flashcard, event);

                if (action === FlashcardAction.TO_RESULT) {
                    inputFaceToResultFace();
                } else if (action === FlashcardAction.TO_INPUT) {
                    status = FlashcardStatus.INPUT;
                }

                playAudio('inputObject');
            }
        }

        (flashcard as any).canvas?.requestRenderAll();
    });
}

function generateFlashcardAudioPlayer(flashcard: fabric.Group) {
    if ((flashcard as any).audioData1) (flashcard as any).audio1 = new Howl({ src: (flashcard as any).audioData1 });
    if ((flashcard as any).audioData2) (flashcard as any).audio2 = new Howl({ src: (flashcard as any).audioData2 });
}

function listenFlashcardInputEvent(
    flashcard: fabric.Object,
    status: () => FlashcardStatus,
    inputFaceToResultFace: () => void,
    inputFaceToFrontFace: () => void,
) {
    const frontFace = (flashcard as any).item(0);
    if (!frontFace) return false;

    const textBox = frontFace.item(2);
    if (!textBox) return false;

    const iText = textBox.item(1) as any;

    iText.onKeyDown = (event: any) => {
        if (status() != FlashcardStatus.INPUT) return;
        if (event.key != 'Enter') return;

        console.log('iText keydown enter');

        const value = (iText as any).text.trim().toLowerCase();
        (iText as any).text = '';
        submitFlashcardInputText(flashcard as any, value);
        inputFaceToResultFace();
    }

    flashcard.on('selected', () => {
        if (status() != FlashcardStatus.INPUT) return;
        if ((flashcard as any).canvas?.flashcardIsDraggable) {
          return;
        }
        console.log('iText selected');

        iText.enterEditing();
    });

    flashcard.on('deselected', () => {
        iText.exitEditing();
        console.log('iText deselected');

        if (status() == FlashcardStatus.INPUT) {
            inputFaceToFrontFace();
        }
    });
}

function createFlashcardTextBox(): fabric.Group {
    const text = new fabric.IText('', {
        name: 'flashcard-input-text',
        fontSize: 32,
        fontWeight: '900',
    });

    const bg = new fabric.Rect({
        name: 'flashcard-input-background',
        top: 0,
        width: cardWidth - (padding * 2),
        height: 64,
        fill: '#ffffff99',
        stroke: '#00000016',
        strokeWidth: 1,
        rx: cornerRadius,
        ry: cornerRadius,
    });

    const group = new fabric.Group([bg, text], {
        originY: 'top',
        top: -(cardHeight / 2 - 64),
    });
    return group;
}

function handleFlashcardIdleFace(flashcard: fabric.Group, event: any): FlashcardAction {
    const action = handleFlashcardToResultButton(flashcard, event);
    if (action === FlashcardAction.TO_RESULT) return action;

    return enableFlashcardInputText(flashcard);
}

function handleFlashcardToResultButton(flashcard: fabric.Group, event: any): FlashcardAction {
    const frontFace = (flashcard as any).item(0);
    const toResultButton = getChildByName(frontFace, 'flashcard-to-result-button');
    const pointer = flashcard.getLocalPointer(event.e);
    const groupCenterVertical = ((flashcard as any).height || 0) * ((flashcard as any).scaleY || 1) / 2;
    const groupCenterHorizontal = ((flashcard as any).width || 0) * ((flashcard as any).scaleX || 1) / 2;

    if (toResultButton) {
        const width = ((toResultButton as any).width || 0) * ((flashcard as any).scaleX || 1);
        const left = groupCenterHorizontal + (((toResultButton as any).left || 0) * ((flashcard as any).scaleX || 1)) - width;
        const top = groupCenterVertical + (((toResultButton as any).top || 0) * ((flashcard as any).scaleY || 1));
        const height = ((toResultButton as any).height || 0) * ((flashcard as any).scaleY || 1);
        const bottom = top + height;

        const isMatchX = pointer.x >= left;
        const isMatchY = pointer.y <= bottom;
        if (isMatchX && isMatchY) {
            return FlashcardAction.TO_RESULT;
        }
    }

    return FlashcardAction.PREVENT;
}

function handleFlashcardInputText(flashcard: fabric.Group, event: any): FlashcardAction {
    const frontFace = (flashcard as any).item(0);
    if (!frontFace) return FlashcardAction.PREVENT;

    const textBox = frontFace.item(2);
    if (!textBox) return FlashcardAction.PREVENT;

    const checkButton = frontFace.item(3);
    if (!checkButton) return FlashcardAction.PREVENT;

    const text = textBox.item(1);

    // const pointer = flashcard.getLocalPointer(event.e);
    // const groupCenterVertical = flashcard.height * flashcard.scaleY / 2;

    // const checkButtonHeight = checkButton.height * flashcard.scaleY;
    // const checkButtonTop = groupCenterVertical + (checkButton.top * flashcard.scaleY);
    // const checkButtonBottom = checkButtonTop + checkButtonHeight;

    let isToResultFace = false;

    // Bỏ phần này đi để: Thay vì click vào nút check để check thì click vào đâu cũng được :v
    // if (pointer.y >= checkButtonTop && pointer.y <= checkButtonBottom) {
    //     isToResultFace = true;
    //     const userValue = text.text.trim().toLowerCase();
    //     text.text = '';
    //     submitFlashcardInputText(flashcard, userValue);
    // }

    if ((text as any).text?.length) {
        isToResultFace = true;
        const userValue = (text as any).text.trim().toLowerCase();
        (text as any).text = '';
        submitFlashcardInputText(flashcard as any, userValue);
    }

    if (isToResultFace) return FlashcardAction.TO_RESULT;
    return FlashcardAction.PREVENT;
}

function submitFlashcardInputText(
    flashcard: fabric.Group,
    userValue: string,
) {
    disableFlashcardInputText(flashcard);

    const fillCorrect = '#59ff75';
    const fillIncorrect = '#ff5959';

    const backFace = (flashcard as any).item(1);
    const word = (backFace.item(1) as any).text.trim().toLowerCase();
    backFace.item(0).set('strokeWidth', 3);

    const isCorrect = word == userValue;
    if (isCorrect) {
        playAudio('correct');
        startFlickerAnimation(backFace.item(0), fillCorrect);
    } else {
        playAudio('incorrect');
        startFlickerAnimation(backFace.item(0), fillIncorrect);
    }

    updateVocabularyCorrectRate(isCorrect);
}

function startFlickerAnimation(
    object: fabric.Object,
    color: string,
    time = 4,
    durationInMs = 300,
) {
    let currentColor = color;
    time *= 2;

    const loop = () => {
        object.set('stroke', currentColor);
        object.canvas.requestRenderAll();

        if (currentColor == color) currentColor = 'transparent';
        else currentColor = color;
        time --;

        if (time > 0) {
            setTimeout(() => loop(), durationInMs);
        }
    }
    loop();
}

export function disableFlashcardInputText(flashcard: fabric.Group) {
    const frontFace = (flashcard as any).item(0);
    if (!frontFace) return

    const textBox = frontFace.item(2);
    if (textBox) {
        textBox.set('visible', false);

        const iText = textBox.item(1);
        iText.exitEditing();
    }

    const checkButton = frontFace.item(3);
    if (checkButton) {
        checkButton.set('visible', false);
    }
}

function enableFlashcardInputText(flashcard: fabric.Group): FlashcardAction {
    const frontFace = (flashcard as any).item(0);
    if (!frontFace) return FlashcardAction.TO_RESULT;

    const textBox = frontFace.item(2);
    if (!textBox) return FlashcardAction.TO_RESULT;

    const checkButton = frontFace.item(3);
    if (!checkButton) return FlashcardAction.TO_RESULT;

    textBox.set('visible', true);
    checkButton.set('visible', true);

    const iText = textBox.item(1);
    iText.enterEditing();

    return FlashcardAction.TO_INPUT;
}

function enableFlashcardInfoFace(flashcard: fabric.Group, translate: TranslateService) {
    const infoFace = getChildByName(flashcard, 'flashcard-infoface');
    if (!infoFace) {
        console.log('infoFace is undefined');
        return false;
    }

    infoFace.set('visible', true);
    return true;
}

function disableFlashcardInfoFace(flashcard: fabric.Group) {
    const infoFace = getChildByName(flashcard, 'flashcard-infoface');
    if (infoFace) {
        infoFace.set('visible', false);
        return true;
    }

    console.log('infoFace is undefined');
    return false;
}

function handleFlashcardResultFace(
    event: any,
    flashcard: fabric.Group,
    audioRecorder: AudioRecorderService,
): FlashcardAction {
    const resultFace = flashcard.item(1);
    if (!resultFace) {
        console.error('Result face is undefined');
        return FlashcardAction.PREVENT;
    }

    const word: string = (getChildByName(resultFace, 'flashcard-backface-englishMeaning') as any)?.text || '';
    const pointer = flashcard.getLocalPointer(event.e);
    const groupCenterVertical = ((flashcard as any).height || 0) * ((flashcard as any).scaleY || 1) / 2;
    const groupCenterHorizontal = ((flashcard as any).width || 0) * ((flashcard as any).scaleX || 1) / 2;

    let isPreventToFrontFace = false;
    let isToInfoFace = false;

    const audioButton1 = getChildByName(resultFace, "flashcard-backface-audioButton1");
    if (audioButton1) {
        const audio1Height = ((audioButton1 as any).height || 0) * ((flashcard as any).scaleY || 1);
        const audio1Top = groupCenterVertical + (((audioButton1 as any).top || 0) * ((flashcard as any).scaleY || 1));
        const audio1Bottom = audio1Top + audio1Height;

        if (pointer.y >= audio1Top && pointer.y <= audio1Bottom) {
            if ((flashcard as any).audio1) (flashcard as any).audio1.play();
            else playBase64Audio((flashcard as any).audioData1);

            isPreventToFrontFace = true;
        }
    } else {
        console.log("Cannot find audioButton1");
    }

    const audioButton2 = getChildByName(resultFace, "flashcard-backface-audioButton2");
    if (audioButton2) {
        const audio2Height = ((audioButton2 as any).height || 0) * ((flashcard as any).scaleY || 1);
        const audio2Top = groupCenterVertical + (((audioButton2 as any).top || 0) * ((flashcard as any).scaleY || 1));
        const audio2Bottom = audio2Top + audio2Height;

        if (pointer.y >= audio2Top && pointer.y <= audio2Bottom) {
            if ((flashcard as any).audio2) (flashcard as any).audio2.play();
            else playBase64Audio((flashcard as any).audioData2);

            isPreventToFrontFace = true;
        }
    } else {
        console.log("Cannot find audioButton2");
    }

    const recordButton = getChildByName(resultFace, 'flashcard-backface-recordButton');
    if (recordButton) {
        const height = ((recordButton as any).height || 0) * ((flashcard as any).scaleY || 1);
        const top = groupCenterVertical + (((recordButton as any).top || 0) * ((flashcard as any).scaleY || 1));
        const bottom = top + height;

        if (pointer.y >= top && pointer.y <= bottom) {
            isPreventToFrontFace = true;
            handleRecordButton(
                recordButton as any,
                audioRecorder,
                word,
                (flashcard as any).localeCode || 'en-US',
            );
        }
    } else {
        console.log('Cannot find recordButton');
    }

    const moreButton = getChildByName(resultFace, 'flashcard-more-button');
    if (moreButton) {
        const width = moreButton.width * flashcard.scaleX;
        const left = groupCenterHorizontal + (moreButton.left * flashcard.scaleX) - width;
        const top = groupCenterVertical + (moreButton.top * flashcard.scaleY);
        const height = moreButton.height * flashcard.scaleY;
        const bottom = top + height;

        const isMatchX = pointer.x >= left;
        const isMatchY = pointer.y <= bottom;
        if (isMatchX && isMatchY) {
            isPreventToFrontFace = true;
            isToInfoFace = true;
        }
    } else {
        console.log('more button is undefined');
    }

    if (isToInfoFace) return FlashcardAction.TO_INFO;
    if (!isPreventToFrontFace) return FlashcardAction.TO_IDLE;
    return null;
}

function enableFlashcardResultFace(flashcard: fabric.Group) {
    const resultFace = flashcard.item(1);
    if (!resultFace) console.error('Result face is undefined');
    resultFace.set('visible', true);
}

function disableFlashcardResultFace(flashcard: fabric.Group | undefined, audioRecorder: AudioRecorderService) {
    if (!flashcard) return;
    const resultFace = (flashcard as any).item(1);
    if (!resultFace) console.error('Result face is undefined');
    resultFace.set('visible', false);

    const recordButton = getChildByName(resultFace, 'flashcard-backface-recordButton');
    if (recordButton) {
        setRecordButtonIdle(recordButton);
        audioRecorder.stopRecord();
    }
}

export function getChildByName(group: fabric.Group, name: string): fabric.Object | null {
    const objs = group.getObjects();

    for (const obj of objs) {
        if (obj.name == name) return obj;
    }
    return null;
}

function setRecordButtonIdle(recordButton: any) {
    const bg = recordButton.item(0);
    const text = recordButton.item(1) as any;
    bg.fill = '#ff907f47';
    text.text = iconProrounce;
    text.fontSize = 24;
    (recordButton as any).status = RecordStatus.IDLE;
}

function setRecordButtonRecording(recordButton: any) {
    const bg = recordButton.item(0);
    const text = recordButton.item(1) as any;
    bg.fill = '#ff5429';
    (text as any).text = labelRecording;
    (text as any).fontSize = 16;
    (recordButton as any).status = RecordStatus.RECORDING;
}

function setRecordButtonEnded(recordButton: any, content = labelLoading) {
    const bg = recordButton.item(0);
    const text = recordButton.item(1) as any;
    bg.fill = '#45ffd7';
    (text as any).text = content;
    (text as any).fontSize = 16;
    (recordButton as any).status = RecordStatus.ENDED;
}

function handleRecordButton(
    recordButton: fabric.Group,
    audioRecorder: AudioRecorderService,
    content: string,
    localeCode: string,
) {
    const status: RecordStatus | undefined = (recordButton as any).status;

    if (status == undefined || status == RecordStatus.IDLE) {
        setRecordButtonRecording(recordButton);

        audioRecorder.startRecord({
            onStopBlob: async (blob) => {
                const thisWindow: any = window;
                const OldFile = thisWindow.OldFile;
                const file = new OldFile([blob], 'test.wav');

                if ((recordButton as any).status == RecordStatus.ENDED) {

                    try {
                        const assessment = await getPronunciationAssessment(
                            file,
                            content,
                            localeCode,
                        );

                        if (assessment.PronScore >= 50) {
                            playAudio('correct');
                        } else {
                            playAudio('incorrect');
                        }

                        updatePronounceCorrectRate(assessment.PronScore);
                        setRecordButtonEnded(recordButton, `Result: ${assessment.PronScore}%`);
                    } catch (e) {
                        console.error(e);
                        setRecordButtonEnded(recordButton, "Error. Please try again.");
                    }

                    (recordButton as any).canvas?.renderAll();
                }
            },
        });
    } else {
        if (status == RecordStatus.ENDED) {
            setRecordButtonIdle(recordButton);
        } else if (status == RecordStatus.RECORDING) {
            setRecordButtonEnded(recordButton);
        }

        audioRecorder.stopRecord();
    }
}

function createFlashcardCheckButton(): fabric.Group {
    const height = 40;

    const bg = new fabric.Rect({
        name: 'flashcard-input-background',
        top: 0,
        width: cardWidth - (padding * 2),
        height,
        fill: '#70ff9b',
        rx: cornerRadius,
        ry: cornerRadius,
    });

    const label = new fabric.Text('Check', {
        fontSize: 16,
        fontWeight: '900',
    });

    const group = new fabric.Group([bg, label], {
        originY: 'top',
        top: cardHeight / 2 - padding - height,
    });
    return group;
}

export async function createFlashcardBackFace(
    word: string,
    spelling: string,
    partOfSpeech: string,
    audioLabel1: string,
    audioLabel2: string,
    isCreateAudioButton2?: boolean,
): Promise<fabric.Group> {
    // Background
    const bg = new fabric.Rect({
        name: 'flashcard-backface-background',
        top: 0,
        width: cardWidth,
        height: cardHeight,
        originY: 'top',
        strokeWidth: 3,
        stroke: 'transparent',
        fill: '#f2fff9',
    });

    // const gradient = new fabric.Gradient({
    //     type: 'linear',
    //     gradientUnits: 'pixels',
    //     coords: { x1: 0, y1: 0, x2: bg.width, y2: bg.height },
    //     colorStops: [
    //         { offset: 0, color: '#8de7eb' },
    //         { offset: 1, color: '#ffd4df' },
    //     ],
    // });

    // bg.set('fill', gradient);

    // English meaning
    const englishMeaning = new fabric.Text(word, {
        name: 'flashcard-backface-englishMeaning',
        fontSize: 32,
        fontWeight: '900',
        textAlign: 'center',
        originY: 'top',
        top: 36,
    });

    const text2Options = {
        fontSize: 16,
        originY: 'top',
    };

    // Spelling
    if (!spelling.startsWith('/')) spelling = `/${spelling}/`;
    const spellingObject = new fabric.Text(spelling.trim(), {
        name: 'flashcard-backface-spelling',
        top: 75,
        ...text2Options,
    });

    // part of speechs
    const partOfSpeechObject = new fabric.Text('[' + partOfSpeech.trim() + ']', {
        name: 'flashcard-backface-partOfSpeech',
        top: 95,
        ...text2Options,
    });

    // Play audio button 1
    const audioButton1 = createPlayAudioButton(audioLabel1, {
        name: 'flashcard-backface-audioButton1',
        top: 140,
        originY: 'top',
    });

    const recordButton = await createRecordButton(labelPronounce, {
        name: 'flashcard-backface-recordButton',
        top: cardHeight - (40 + padding),
        originY: 'top',
        status: RecordStatus.IDLE,
    })

    const status = new fabric.Text('', {
        name: 'flashcard-correct-status',
        top: padding,
        fontSize: 13,
    });

    const moreButton = new fabric.Text(iconMoreButton, {
        name: 'flashcard-more-button',
        originY: 'top',
        originX: 'right',
        top: padding / 2,
        left: (cardWidth / 2) - (padding / 2),
        fontSize: 16,
        textAlign: 'right',
    });

    // Group
    const group = new fabric.Group([
        bg,
        englishMeaning,
        spellingObject,
        partOfSpeechObject,
        audioButton1,
        recordButton,
        status,
        moreButton,
    ], { name: 'flashcard-backface' });

    // Play audio button 2
    if (isCreateAudioButton2) {
        const audioButton2 = createPlayAudioButton(audioLabel2, {
            name: 'flashcard-backface-audioButton2',
            top: 35,
            left: 0,
            originY: 'top',
            originX: 'center',
        });

        group.add(audioButton2);
    }

    return group;
}

export function createFlashcardInfoFace(
    example1?: string,
    example2?: string,
): fabric.Group {
    // Background
    const bg = new fabric.Rect({
        name: 'flashcard-infoface-background',
        width: cardWidth,
        height: cardHeight,
        fill: '#faf2ff',
    });

    // const gradient = new fabric.Gradient({
    //     type: 'linear',
    //     gradientUnits: 'pixels',
    //     coords: { x1: 0, y1: 0, x2: bg.width, y2: bg.height },
    //     colorStops: [
    //         { offset: 0, color: '#f2ccff' },
    //         { offset: 1, color: '#ffdbe5' },
    //     ],
    // });

    // bg.set('fill', gradient);

    // Example
    const examples = [];
    if (example1) examples.push('E.g.1: ' + example1);
    if (example2) examples.push('E.g.2: ' + example2);

    const exampleContent = examples.join('\n\n');
    const objExample = new fabric.Textbox(exampleContent, {
        name: 'flashcard-example',
        top: cardHeight / 2 - padding,
        originY: 'bottom',
        width: cardWidth - (padding * 2),
        fontSize: 14,
    });

    // Group
    const group = new fabric.Group([ bg, objExample, ], {
        name: 'flashcard-infoface',
        originY: 'top',
        top: 0,
    });

    return group;
}

export async function createFlashcardFrontFace(
    imageData: string,
): Promise<fabric.Group> {
    // Background
    const bg = new fabric.Rect({
        name: 'flashcard-frontface-background',
        width: cardWidth,
        height: cardHeight,
        fill: '#d9fffc',
        shadow: {
            blur: 16,
            offsetX: 0,
            offsetY: 4,
            color: '#00000032'
        },
    });

    // const gradient = new fabric.Gradient({
    //     type: 'linear',
    //     gradientUnits: 'pixels',
    //     coords: { x1: 0, y1: 0, x2: bg.width, y2: bg.height },
    //     colorStops: [
    //         { offset: 0, color: '#8deba6' },
    //         { offset: 1, color: '#8de7eb' },
    //     ],
    // });

    // bg.set('fill', gradient);

    // Image
    const url = await resizeImageFromUrl(
        imageData,
        cardWidth - padding,
        cardHeight - padding,
    );
    const image = await createFabricImageFromUrl(url);

    // Input
    const textBox = createFlashcardTextBox();
    const checkButton = createFlashcardCheckButton();

    textBox.set('visible', false);
    checkButton.set('visible', false);

    // To result face button
    const toResultButton = new fabric.Text(iconResultButton, {
        name: 'flashcard-to-result-button',
        originY: 'top',
        originX: 'right',
        top: padding - (cardHeight / 2),
        left: (cardWidth / 2) - padding,
        fontSize: 12,
        textAlign: 'right',
    });

    // Return
    const group = new fabric.Group([bg, image, textBox, checkButton, toResultButton], {
        name: 'flashcard-frontface',
        originY: 'top',
        top: 0,
    });
    return group;
}

export function createPlayAudioButton(label: string, options: any): fabric.Group {
    const text = new fabric.Text(label, {
        originX: 'left',
        left: cardWidth / -2 + 16,
        fontSize: 16,
    });

    const icon = new fabric.Text('🔊', {
        originX: 'right',
        left: cardWidth / 2 - 16,
        fontSize: 16,
    })

    const group = new fabric.Group([text, icon], options);
    return group;
}

function createRecordButton(label: string, options: any): fabric.Group {
    const icon = new fabric.Text(iconProrounce, {
        fontSize: 24,
        top: -8,
    });

    const text = new fabric.Text(label, {
        fontSize: 9,
        top: 13,
    });

    const bg = new fabric.Rect({
        width: cardWidth - (padding * 2),
        height: 40,
        fill: '#ff907f47',
        rx: cornerRadius,
        ry: cornerRadius,
    });

    const group = new fabric.Group([bg, icon, text], options);
    return group;
}

export enum RecordStatus {
    IDLE,
    RECORDING,
    ENDED,
}

export enum FlashcardStatus {
    IDLE,
    INPUT,
    RESULT,
    INFO,
}

export enum FlashcardAction {
    PREVENT,
    TO_IDLE,
    TO_INPUT,
    TO_RESULT,
    TO_INFO,
}
