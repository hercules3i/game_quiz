// @ts-nocheck
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as JSZip from 'jszip';
import { lastValueFrom } from 'rxjs';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { Storage } from '@ionic/storage-angular';
import { Platform } from '@ionic/angular';
import { ServiceService } from './service.service';
import { format } from 'date-fns';
import { TranslateService } from '@ngx-translate/core';
import { FileSupportService } from './file-support.service';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
// import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameJsonService {
  listLocalJson: FileJson[] = [
    // { fileName: 'Quiz 001.json', url: 'file://xyz' },
    // { fileName: 'Quiz 002.json', url: 'file://xyz' },
    // { fileName: 'Quiz 003.json', url: 'file://xyz' },
    // { fileName: 'Quiz 004.json', url: 'file://xyz' },
    // { fileName: 'Quiz 005.json', url: 'file://xyz' },
    // { fileName: 'Quiz 006.json', url: 'file://xyz' }
  ];
  currentJson = '';
  picDeeplink = '';
  picHintAnswer = '';
  idTest = -1;
  jsonStoreKey = '___game-manage-json-data___';

  constructor(
    private http: HttpClient,
    private storage: Storage,
    private file: File,
    private platform: Platform,
    private service: ServiceService,
    private translate: TranslateService,
    private fileSupport: FileSupportService
  ) {
    this.storage.create();
  }
  async storeFileLocal(jsonContent, fileName) {
    await this.storeInDirectory(jsonContent, fileName);
    await this.service.set('listLocalJson', this.listLocalJson);
    this.service.messageSuccess(
      this.translate.instant('TOKEN_MANAGER.TS_SAVE_SUCCESS')
    );
  }
  async loadJsonServer(pageNoJson: number, pageSizeJson: number, contentJson: string) {
    const query = '?pageNum=' + pageNoJson +
      '&pageLength=' + pageSizeJson +
      '&content=' + contentJson +
      '&catId=1354';
    let result = [];
    try {
      result = await lastValueFrom(this.service.getApi(this.service.getHost() + 'MobileFile/GetListFile' + query));
    } catch (error) {
      console.log(error);
    }
    return result;
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
  async uploadFile(jsonContent, fileName) {
    // Create a Blob with the file content
    const blob = new Blob([jsonContent], { type: 'application/json' });

    // Create FormData and append the Blob with the specified file name
    const formData = new FormData();
    formData.append('ModuleName', 'TEST_JSON');
    formData.append('IsMore', 'false');
    formData.append('FileUpload', blob, fileName);

    try {
      const result = await lastValueFrom<any>(this.service.postApi(this.service.getHost() +
        `MobileLogin/InsertObjectFileSubject`, formData));
      console.log('File uploaded successfully. File path:', result.FilePath);
      this.service.messageSuccess(
        this.translate.instant('NOTI.NOTI_UPLOAD_SUCCESS')
      );
    } catch (error) {
      console.error('Error during file upload:', error);
      this.service.messageSuccess(this.translate.instant('NOTI.NOTI_CONNECTING'));
    }
  }
  async loadJsonStore() {
    if (this.platform.is('capacitor')) {
      this.listLocalJson = await this.service.get('listLocalJson');
    } else {
      this.listLocalJson = [];

      const keys = await this.storage.keys();
      for (let key of keys) {
        console.log('[loadJsonStore] loading', key);

        if (key.startsWith(this.jsonStoreKey)) {
          key = key.substring(this.jsonStoreKey.length);

          this.listLocalJson.push({
            fileName: key,
            url: "",
          });
        }
      }
    }

    if (!this.listLocalJson) {
      this.listLocalJson = [];
    }
    // this.listLocalJson = [{
    //   fileName: 'a',
    //   url: 'bbb'
    // }]
    return this.listLocalJson;
  }
  async loadJson(item: FileJson) {
    if (this.platform.is('capacitor')) {
      const text = await Filesystem.readFile({
        path: item.url,
        encoding: Encoding.UTF8,
      });

      return text.data as string;
    } else {
      return await this.storage.get(this.jsonStoreKey + item.fileName);
    }
  }
  async loadJsonFromUrl(urlInput: string) {
    return await lastValueFrom(this.service.postApiResultText(this.service.getHost() +
      'MobileLogin/GetGameJsonData', 'url=' + urlInput));
  }
  async loadJsonWithCode(fileCode: string) {
    return await lastValueFrom(this.service.getApiResultText(this.service.getHost() +
      `MobileFile/DownloadFile?fileCode=${fileCode}`));
  }
  async deleteJsonFile(fileName: string, fileUrl: string) {
    if (this.platform.is('capacitor')) {
      try {
        const fileDir = this.file.dataDirectory;
        const fileNameLocal = this.fileSupport.getNameOfUri(fileUrl);
        await this.file.removeFile(fileDir, fileNameLocal);
        console.log(`File ${fileName} deleted successfully.`);
      } catch (error) {
        console.error(`Error deleting file ${fileName}:`, error);
      }
    } else {
      await this.storage.remove(this.jsonStoreKey + fileName);
    }

    if (!this.listLocalJson) {
      this.listLocalJson = [];
    }
    this.listLocalJson = this.listLocalJson.filter((file: any) => file.fileName !== fileName);
    await this.service.set('listLocalJson', this.listLocalJson);
    this.service.messageSuccess(
      this.translate.instant('DeleteItem.DeleteItem_SUCCESS')
    );
  }

  private async handleZipFile(zipData: ArrayBuffer) {
    try {
      const zip = await JSZip.loadAsync(zipData);

      // Find all JSON files in the ZIP archive
      const jsonFiles = Object.keys(zip.files).filter(filename => filename.endsWith('.json'));

      if (jsonFiles.length > 0) {
        // this.listLocalJson = [];
        // Process each JSON file
        let i = 0;
        for (const jsonFile of jsonFiles) {
          const jsonContent = await zip.files[jsonFile].async('text');
          if (this.platform.is('capacitor')) {
            await this.storeInDirectory(jsonContent);
          }
          else {
            // const jsonData = JSON.parse(jsonContent);
            // console.log(`JSON data from ${jsonFile}:`, jsonData);
            await this.storeWithLink(jsonFile);
          }
          i++;
          if (i % 10 === 0) {
            console.log('download a batch of 10 files');
            await this.service.set('listLocalJson', this.listLocalJson);
          }
        }
        await this.service.set('listLocalJson', this.listLocalJson);
      } else {
        console.error('No JSON files found in the ZIP archive.');
      }
    } catch (error) {
      console.error('Error handling ZIP file:', error);
    }
  }
  private async storeInDirectory(jsonContent: string, fileName = '') {
    const fileDir = this.file.dataDirectory;
    const dateTime = format(new Date(), 'ddMMyyyyHHmmss');
    const fileNameGen = `result_${dateTime}.json`;
    const fileEntry = await this.file.writeFile(fileDir, fileNameGen, jsonContent, { replace: true });
    console.log(fileEntry);
    if (!this.listLocalJson) {
      this.listLocalJson = [];
    }
    const newJson = {
      fileName: fileName ?? fileNameGen,
      url: fileDir + '/' + fileNameGen
    };
    const index = this.listLocalJson.findIndex(x => x.fileName === newJson.fileName);
    if (index === -1) {
      this.listLocalJson.push(newJson);
    }
    else {
      this.listLocalJson[index].url = fileDir + '/' + fileNameGen;
    }

    if (!this.platform.is('capacitor')) {
      await this.storage.set(this.jsonStoreKey + newJson.fileName, jsonContent);
      console.log('[storeInDirectory] stored', newJson.fileName);
    }
  }
  private async storeWithLink(fileName, index = 0) {
    const indexFileName = this.listLocalJson.findIndex(x => x.fileName === fileName);
    if (indexFileName === -1) {
      this.listLocalJson.push({
        fileName,
        url: `https://admin.metalearn.vn/uploads/repository/TEST_JSON/${fileName}`
      });
    }
  }
}
export interface FileJson {
  fileName: string;
  url: string;
}
