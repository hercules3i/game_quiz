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


export class GameJsonService {
  listLocalJson: FileJson[] = [];
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
    this.loadJsonStore();
  }

  // Create and expose methods that users of this service can
  // call, for example:
  public set(key: string, value: any) {
    return this._storage?.set(key, value);
  }
  public get(key: string) {
    return this.storage?.get(key);
  }
  async loadJsonApi() {
    try {
      const path = 'https://admin.metalearn.vn/MobileTeacher/DownloadFiles';

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
  async loadJsonStore() {
    this.listLocalJson = await this.get('listLocalJson');
    // this.listLocalJson = [{
    //   fileName: 'a',
    //   url: 'bbb'
    // }]
    return this.listLocalJson;
  }
  async loadJson(urlInput: string) {
    const url = new URL(urlInput);
    // Extracting the path and file name
    const filePath = url.origin + url.pathname.substring(0, url.pathname.lastIndexOf('/') + 1);
    const fileName = url.pathname.substring(url.pathname.lastIndexOf('/') + 1);
    const text = await this.file.readAsText(filePath, fileName);
    return text;
  }

  private async handleZipFile(zipData: ArrayBuffer) {
    try {
      const zip = await JSZip.loadAsync(zipData);

      // Find all JSON files in the ZIP archive
      const jsonFiles = Object.keys(zip.files).filter(filename => filename.endsWith('.json'));

      if (jsonFiles.length > 0) {
        this.listLocalJson = [];
        // Process each JSON file
        let i = 30;
        for (const jsonFile of jsonFiles) {
          const jsonContent = await zip.files[jsonFile].async('text');
          if (this.platform.is('capacitor')) {
            await this.storeInDirectory(jsonContent, i);
          }
          else {
            const jsonData = JSON.parse(jsonContent);
            console.log(`JSON data from ${jsonFile}:`, jsonData);
          }
          i++;
        }
        await this.set('listLocalJson', this.listLocalJson);
      } else {
        console.error('No JSON files found in the ZIP archive.');
      }
    } catch (error) {
      console.error('Error handling ZIP file:', error);
    }
  }
  private async storeInDirectory(jsonContent: string, index = 0) {
    var fileDir = this.file.applicationStorageDirectory;
    var filename = `result_${index}.json`;
    const fileEntry = await this.file.writeFile(fileDir, filename, jsonContent, { replace: true });
    console.log(fileEntry);
    this.listLocalJson.push({
      fileName: filename,
      url: fileDir + '/' + filename
    });
  }
  async deleteJsonFile(filename: string) {
    try {
      const fileDir = this.file.applicationStorageDirectory;
      await this.file.removeFile(fileDir, filename);
      console.log(`File ${filename} deleted successfully.`);

      // Update local storage by removing the deleted file from the list
      const storedJsonList = await this._storage?.get('listLocalJson');
      if (storedJsonList) {
        const parsedJsonList = JSON.parse(storedJsonList);

        const updatedJsonList = parsedJsonList.filter((file: any) => file.fileName !== filename);

        await this._storage?.set('listLocalJson', JSON.stringify(updatedJsonList));
      }
      this.listLocalJson.filter((file: any) => file.fileName !== filename);
    } catch (error) {
      console.error(`Error deleting file ${filename}:`, error);
    }
  }
}
export interface FileJson {
  fileName: string
  url: string
}
