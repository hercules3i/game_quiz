// @ts-nocheck
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as JSZip from 'jszip';
import { lastValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { Storage } from '@ionic/storage-angular';
import { Platform } from '@ionic/angular';
import { ServiceService } from './service.service';
// import { lastValueFrom } from 'rxjs';

var cordova;

@Injectable({
  providedIn: 'root'
})

export class ImageDefaultService {
  listLocalImage: FileImage[] = [];
  private _storage: Storage | null = null;
  constructor(
    private http: HttpClient,
    private storage: Storage,
    private file: File,
    private platform: Platform,
    private service: ServiceService
  ) {
    this.init();
  }

  async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
    const storage = await this.storage.create();
    this._storage = storage;
    this.loadImageStore();

  }
  public set(key: string, value: any) {
    return this._storage?.set(key, value);
  }
  public get(key: string) {
    return this.storage?.get(key);
  }
  async loadImageStore() {
    this.listLocalImage = await this.get('listLocalImage');
    return this.listLocalImage;
  }
  async loadImage(urlInput: string) {
    //load image from url to dataUrl
    const url = new URL(urlInput);
    const filePath = url.origin + url.pathname.substring(0, url.pathname.lastIndexOf('/') + 1);
    const fileName = url.pathname.substring(url.pathname.lastIndexOf('/') + 1);
    const dataUrl = await this.file.readAsDataURL(filePath, fileName);
    return dataUrl;
  }
  async loadImagesApi() {
    try {
      const path = 'https://admin.metalearn.vn/MobileTeacher/DownloadImageFiles';

      // Load zip file from the API
      const zipData: ArrayBuffer = await lastValueFrom(this.service.getApiArrayBuffer(path));

      if (zipData) {
        await this.handleZipFile(zipData);
      }
    } catch (error) {
      console.error('Error loading ZIP file:', error);
      throw error; // Propagate the error if needed
    }
  }
  private async handleZipFile(zipData: ArrayBuffer) {
    try {
      const zip = await JSZip.loadAsync(zipData);

      // Find all image files in the ZIP archive with the extension '.jpg'
      const imageFiles = Object.keys(zip.files).filter(filename => filename.toLowerCase().endsWith('.jpg'));

      if (imageFiles.length > 0) {
        this.listLocalImage = [];
        // Process each image file
        let i = 0;
        for (const imageFile of imageFiles) {
          // Get the image data as binary
          const imageData = await zip.files[imageFile].async('uint8array');

          // Convert binary data to base64
          const base64ImageData = this.arrayBufferToBase64(imageData);

          if (this.platform.is('capacitor')) {
            await this.storeInDirectory(base64ImageData, i);
          } else {
            // If not using Cordova, you can directly handle the base64 image data or convert it to JSON if needed
            console.log(`Base64 data from ${imageFile}:`, base64ImageData);
          }
          i++;
        }
        // Save the listLocalImage after processing all images
        await this.set('listLocalImage', this.listLocalImage);
      } else {
        console.error('No image files found in the ZIP archive with the ".jpg" extension.');
      }
    } catch (error) {
      console.error('Error handling ZIP file:', error);
    }
  }

  // Function to convert binary data to base64
  private arrayBufferToBase64(buffer: Uint8Array) {
    let binary = '';
    for (let i = 0; i < buffer.length; i++) {
      binary += String.fromCharCode(buffer[i]);
    }
    return btoa(binary);
  }


  private async storeInDirectory(base64ImageData: string, index = 0) {
    try {
      var fileDir = this.file.applicationStorageDirectory;
      var filename = `result_${index}.jpg`;

      // Convert base64 to blob
      const blob = this.base64ToBlob(base64ImageData, 'image/jpeg');

      // Write blob data to file
      const fileEntry = await this.file.writeFile(fileDir, filename, blob, { replace: true });

      console.log(fileEntry);

      this.listLocalImage.push({
        fileName: filename,
        url: fileDir + '/' + filename
      });
    } catch (error) {
      console.error('Error storing image in directory:', error);
    }
  }

  // Function to convert base64 to blob
  private base64ToBlob(base64: string, mimeType: string): Blob {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const binaryArray = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      binaryArray[i] = binaryString.charCodeAt(i);
    }

    return new Blob([binaryArray], { type: mimeType });
  }

}

export interface FileImage {
  fileName: string
  url: string
}
