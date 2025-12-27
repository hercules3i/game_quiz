import { Injectable } from '@angular/core';
import * as jxl from 'jxl';

@Injectable({
  providedIn: 'root'
})
export class ImageConverterService {

  constructor() { }

  async convertJxlToJpeg(blob: Blob): Promise<Blob> {
    // Check if the blob is a JPEG XL image
    const isJxl = await this.isJxlImage(blob);

    if (isJxl) {
      // Decode JPEG XL image
      const jxlDataBinary = await this.readBlobAsBinary(blob);
      const jxlImage = new jxl.Codec();
      await jxlImage.parse(jxlDataBinary);

      // Encode JPEG from decoded image
      const jpegImageData = await jxlImage.encode({ format: 'jpeg' });

      // Convert base64 encoded data to Blob
      return this.base64ToBlob(jpegImageData, 'image/jpeg');
    } else {
      // If it's not a JPEG XL image, return the original blob
      return blob;
    }
  }

  private async isJxlImage(blob: Blob): Promise<boolean> {
    const blobSlice = blob.slice(0, 12); // Read the first 12 bytes
    let fileReader = new FileReader();
    const realFileReader = (fileReader as any)._realReader;
    if (realFileReader) {
      fileReader = realFileReader;
    }
    return new Promise<boolean>((resolve) => {
      fileReader.onloadend = () => {
        const view = new DataView(fileReader.result as ArrayBuffer);
        const signature = view.getUint32(0, false);
        resolve(signature === 0x00000c4a); // Check if the signature matches JXL
      };
      fileReader.readAsArrayBuffer(blobSlice);
    });
  }

  private async readBlobAsBinary(blob: Blob): Promise<ArrayBuffer> {
    return new Promise<ArrayBuffer>((resolve) => {
      let fileReader = new FileReader();
      const realFileReader = (fileReader as any)._realReader;
      if (realFileReader) {
        fileReader = realFileReader;
      }
      fileReader.onloadend = () => {
        resolve(fileReader.result as ArrayBuffer);
      };
      fileReader.readAsArrayBuffer(blob);
    });
  }

  private blobToDataUrl(blob: Blob): string {
    return URL.createObjectURL(blob);
  }
  private base64ToBlob(base64Data: string, contentType: string): Blob {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }
}
