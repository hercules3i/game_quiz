import { fabric } from "fabric";

export function playAudioFromUrl(url: string) {
    console.log('[playAudioFromUrl] init');
    let isStarted = false;
    const audio = new Audio(url);
    audio.play();
    audio.onplay = () => {
        isStarted = true;
        console.log('[playAudioFromUrl] played');
    }

    audio.onloadeddata = () => {
        if (isStarted) return;
        console.log('[playAudioFromUrl] loadeddata');
        audio.play();
    };
}

export function base64ToAudioUrl(base64: string, format = 'wav'): string {
    if (base64.startsWith('data')) return base64;
    return `data:audio/${format};base64,${base64}`;
}

export function playBase64Audio(base64: string) {
    playAudioFromUrl(base64ToAudioUrl(base64));
}

export function base64ToImageDataUrl(base64: string, format = 'jpeg') {
    const url = `data:image/${format};base64,${base64}`;
    return url;
}

export function bufferToBase64(buffer: ArrayBuffer) {
    var bytes = new Uint8Array(buffer);
    var len = buffer.byteLength;
    var binary = "";
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

export async function fileEventToBase64(event: Event): Promise<string> {
    const files = (event.target as HTMLInputElement).files;

    if (files && files.length > 0) {
        const file = files[0];

        if (file.type.startsWith('audio')) {
            return bufferToBase64(await file.arrayBuffer());
        } else if (file.type.startsWith('image')) {
            return resizeImageFileToBase64(file);
        } else {
            throw new Error("Invalid format");
        }
    } else {
        throw new Error("Invalid file");
    }
}

export function createImageElement(url: string): Promise<HTMLImageElement> {
    return new Promise(resolve => {
        const el = new Image();
        el.src = url;
        el.onload = () => {
            resolve(el);
        }
    });
}

export async function createFabricImageFromUrl(url: string, options?: any): Promise<fabric.Image> {
    const el = await createImageElement(url);
    const image = new fabric.Image(el, options);
    return image;
}

export function isStringCorrect(str: string): boolean {
    if (str.trim().length > 0) return true;
    return false;
}

export function resizeImage(
    imgEl: HTMLImageElement,
    targetWidth: number,
    targetHeight: number,
): string {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Cannot get context 2d");

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const targetRatio = targetWidth / targetHeight;
    const currentRatio = imgEl.width / imgEl.height;

    if (currentRatio > targetRatio) {
        const scale = imgEl.height / targetHeight;
        const width = imgEl.width / scale;
        const dx = (width / 2) - (targetWidth / 2);

        ctx.drawImage(imgEl, -dx, 0, width, targetHeight);
    } else {
        const scale = imgEl.width / targetWidth;
        let height = imgEl.height / scale;
        let dy = (height / 2) - (targetHeight / 2);

        ctx.drawImage(imgEl, 0, -dy, targetWidth, height);
    }

    const base64 = canvas.toDataURL();
    return base64;
}

export function resizeImageFromUrl(
    url: string,
    targetWidth: number,
    targetHeight: number,
): Promise<string> {
    return new Promise(resolve => {
        const imgEl = new Image();
        imgEl.onload = async () => {
            const base64 = resizeImage(imgEl, targetWidth, targetHeight);
            resolve(base64);
        }
        imgEl.src = url;
    });
}

export async function resizeImageFileToBase64(
    file: File,
    targetWidth = 300,
    targetHeight = 400,
): Promise<string> {
    return new Promise(resolve => {
        const imgEl = document.createElement("img");
        imgEl.onload = () => {
            URL.revokeObjectURL(imgEl.src);
            const base64 = resizeImage(imgEl, targetWidth, targetHeight);
            resolve(base64);
        }
        imgEl.src = URL.createObjectURL(file);
    });
}

export function getFileReader(): FileReader {
    let reader = new FileReader();
    const realReader = (reader as any).realReader as FileReader;
    if (realReader) reader = realReader;
    return reader;
}

export async function getDataUrlFromUrl(url: string): Promise<string> {
    const res = await fetch(url, {
        mode: 'no-cors',
        credentials: 'omit',
        referrerPolicy: 'strict-origin-when-cross-origin'
    });
    const blob = await res.blob();

    return new Promise((resolve, reject) => {
        const reader = getFileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
    });
}

export function pickImageFromDevice(): Promise<File> {
    const inputEl = document.createElement('input');
    inputEl.setAttribute('type', 'file');
    inputEl.setAttribute('accept', 'image/*');

    return new Promise((resolve, reject) => {
        inputEl.onchange = event => {
            const files = (event.target as HTMLInputElement).files;
            if (!files || files.length == 0) reject("Invalid file");

            resolve(files[0]);
        }
        inputEl.click();
    });
}
