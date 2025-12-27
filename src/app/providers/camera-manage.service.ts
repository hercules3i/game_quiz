import { Injectable } from '@angular/core';
import { Camera } from '@awesome-cordova-plugins/camera/ngx';
import { FileTransfer, FileTransferObject } from '@awesome-cordova-plugins/file-transfer/ngx';
import { ActionSheetController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ServiceService } from './service.service';
import { File as FilePlugin } from '@awesome-cordova-plugins/file/ngx';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

declare var cordova: any;

@Injectable({
  providedIn: 'root'
})
export class CameraManageService {

  constructor(
    public actionSheetCtrl: ActionSheetController,
    private camera: Camera,
    private translate: TranslateService,
    public service: ServiceService,
    private file: FilePlugin,
    private transfer: FileTransfer,
  ) { }

  // tai anh
  async presentActionSheet(type, detail) {
    const actionSheet = await this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Camera',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.CAMERA, type, detail);
          },
        },
        {
          text: 'PhotoLib',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY, type, detail);
          },
        },
        {
          text: 'Album',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.SAVEDPHOTOALBUM, type, detail);
          },
        },
        {
          text: this.translate.instant(
            'ADMINISTRATIVEREPORTPAGE.ADMINISTRATIVEREPORTPAGE_USE_CANNEL'
          ),
          role: 'cancel',
        },
      ],
    });
    await actionSheet.present();
  }
  async takePictureByCameraAsync() {
    return await this.takePictureAsync(this.camera.PictureSourceType.CAMERA);
  }
  async takePictureByPhotoAsync() {
    return await this.takePictureAsync(this.camera.PictureSourceType.PHOTOLIBRARY);
  }
  async takePictureAsync(sourceType): Promise<any> {
    const options = {
      quality: 20,
      sourceType: sourceType,
      saveToPhotoAlbum: false,
      correctOrientation: true,
    };
    let imagePath: string;
    try {
      imagePath = await this.camera.getPicture(options);
    } catch (error) {
      console.log(error);
      this.service.messageError(
        this.translate.instant('Có lỗi khi chụp ảnh')
      );
    }
    if (imagePath) {
      const currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
      const currentPath = imagePath.substr(
        0,
        imagePath.lastIndexOf('/') + 1
      );
      const newFileName = this.createFileName();
      const rs = await this.copyFileToLocalDirAsync(currentPath, currentName, newFileName);
      if (rs) {
        return {
          newFileName,
          newFilePath: this.pathForImage(newFileName)
        };
      }
    }
    return null;
  }
  async copyFileToLocalDirAsync(currentPath, currentName, newFileName) {
    try {
      const rs = await this.file
        .copyFile(currentPath, currentName, cordova.file.dataDirectory, newFileName);
      return true;
    } catch (error) {
      console.log(error);
      this.service.messageError(
        this.translate.instant('Có lỗi khi copy ảnh')
      );
      return false;
    }
  }
  public takePicture(sourceType, type, detail): Promise<string> {
    return new Promise((resolve, reject) => {
      // Create options for the Camera Dialog
      const options = {
        quality: 20,
        sourceType: sourceType,
        saveToPhotoAlbum: false,
        correctOrientation: true,
      };
  
      // Get the data of an image
      this.camera.getPicture(options).then(
        (imagePath) => {
          const currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
          const correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
  
          // Gọi hàm copyFileToLocalDir và trả về kết quả từ hàm này
          this.copyFileToLocalDir(correctPath, currentName, this.createFileName(), type, detail)
            .then((editedImagePath) => {
              resolve(editedImagePath);  // Trả về đường dẫn ảnh đã chỉnh sửa
            })
            .catch((err) => {
              reject(err);  // Nếu có lỗi xảy ra
            });
        },
        (err) => {
          this.service.messageError(
            this.translate.instant('TAIKHOANPAGE.TAIKHOANPAGE_IMFG_UPLOAD_ERROR')
          );
          reject(err);  // Lỗi khi chụp ảnh
        }
      );
    });
  }
  
  public createFileName() {
    const d = new Date(),
      n = d.getTime(),
      newFileName = n + '.jpg';
    return newFileName;
  }

  private pathForImage(img) {
    if (img === null) {
      return '';
    } else {
      return cordova.file.dataDirectory + img;
    }
  }
  copyFileToLocalDir(namePath: string, currentName: string, newFileName: string, type: string, detail: any): Promise<string> {
    return new Promise((resolve, reject) => {
      this.file.copyFile(namePath, currentName, cordova.file.dataDirectory, newFileName)
        .then(success => {
          this.addTextToImage(this.pathForImage(newFileName), this.service.userName)
            .then((editedImagePath: string) => {
              resolve(editedImagePath);  // Trả về đường dẫn của ảnh đã chỉnh sửa
            })
            .catch(err => {
              reject(err);  // Nếu lỗi khi thêm text vào ảnh
            });
        })
        .catch(error => {
          this.service.messageError(
            this.translate.instant('ADMINISTRATIVEREPORTPAGE.ADMINISTRATIVEREPORTPAGE_ERROR_SAVE_IMG')
          );
          reject(error);  // Lỗi khi sao chép file
        });
    });
  }
  

  public uploadImageEDMS(lastImage, newFileName) {
    var CateRepoSettingId = "";
    // this is card job exclusive api
    // if (this.sltCategoryFolder != null) {
    //   CateRepoSettingId = this.sltCategoryFolder.Id;
    // }
    // const url = this.service.getHost() + 'MobileLogin/UploadImageEdms';
    // const filename = newFileName;
    // const options = {
    //   fileKey: 'pictureFile',
    //   fileName: filename,
    //   chunkedMode: false,
    //   mimeType: 'multipart/form-data',
    //   params: {
    //     fileName: filename,
    //     'CateRepoSettingId': CateRepoSettingId,
    //     'ObjectCode': this.cardCode,
    //     'ObjectType': "CARDJOB",
    //     'CreatedBy': this.service.userName,
    //   },
    // };
    // const fileTransfer: FileTransferObject = this.transfer.create();
    // fileTransfer.upload(lastImage, url, options).then(
    //   (data) => {
    //     const rs = JSON.parse(data.response);
    //     if (rs.Error == false) {
    //       this.service.message(rs.Title);
    //       this.GetFileByCard();
    //       this.GetListItemChecks();
    //       this.InsertFileShareCard(rs.Object)

    //     } else {
    //       this.service.messageError(rs.Title);
    //     }
    //   },
    //   (err) => {
    //     this.service.message(
    //       this.translate.instant(
    //         'ADMINISTRATIVEREPORTPAGE.ADMINISTRATIVEREPORTPAGE_ERROR_IMG'
    //       )
    //     );
    //     console.log(err);
    //   }
    // );
  }

  getDeviceInfo() {
    const userAgent = navigator.userAgent;
  
    // Biểu thức chính quy để lấy platform, hệ điều hành và model, loại bỏ phần 'Build/...' sau model
    const regex = /\(([^;]+); ([^;]+); ([^;]+)/;
    const match = userAgent.match(regex);
  
    if (match && match.length >= 4) {
      const platform = match[1];  // Linux
      const os = match[2];        // Android 14
      const model = match[3].split(' ')[0];  // Chỉ lấy model trước dấu cách, bỏ phần 'Build/...'
  
      return `Platform: ${platform}; OS: ${os}; Model: ${model}`;
    } else {
      return 'Không thể xác định thông tin thiết bị';
    }
  }
  
  async addTextToImage(imagePath, text) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const webviewPath = Capacitor.convertFileSrc(imagePath);
      img.src = webviewPath;
  
      img.onload = () => {
        console.log("Kích thước ảnh:", img.width, img.height);
  
        if (img.width === 0 || img.height === 0) {
          console.error("Ảnh không có kích thước hợp lệ.");
          return;
        }
  
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
  
        // Set canvas size to match image size
        canvas.width = img.width;
        canvas.height = img.height;
  
        // Draw image on canvas
        ctx.drawImage(img, 0, 0);
  
        const now = new Date();
        const timeString = now.toLocaleString();
        const deviceInfo = this.getDeviceInfo();
        console.log(deviceInfo);
  
        ctx.font = 'bold 75px "Dialog", sans-serif'; // Font chữ
        ctx.fillStyle = 'red'; // Màu chữ
        ctx.strokeStyle = 'white'; // Màu viền
        ctx.lineWidth = 2; // Độ dày viền
  
        const padding = 12; // Khoảng cách từ cạnh canvas
        const textHeight = 75; // Chiều cao chữ
  
        // Vị trí y cho các văn bản
        const yText1 = canvas.height - (textHeight * 3) - (padding * 3); // Vị trí y cho tên
        const yText2 = canvas.height - (textHeight * 2) - (padding * 2); // Vị trí y cho thời gian
        const yLocation = canvas.height - padding; // Vị trí y cho tọa độ
        const yDeviceInfo = yLocation - textHeight - padding; // Vị trí y cho tên thiết bị
  
        // Vị trí x để căn phải
        const xTime = canvas.width - ctx.measureText(timeString).width - padding;
        const xText = canvas.width - ctx.measureText(text).width - padding;
        const xDevice = canvas.width - ctx.measureText(deviceInfo).width - padding;
  
        // Vẽ viền và chữ cho tên
        ctx.strokeText(text, xText, yText1);
        ctx.fillText(text, xText, yText1);
  
        // Vẽ viền và chữ cho thời gian
        ctx.strokeText(timeString, xTime, yText2);
        ctx.fillText(timeString, xTime, yText2);
  
        // Lấy vị trí người dùng với timeout
        ctx.fillStyle = 'lightgreen';
        const timeout = 10000; // 10 giây
        let timedOut = false;
  
        const positionPromise = new Promise((resolvePosition, rejectPosition) => {
          navigator.geolocation.getCurrentPosition(resolvePosition, rejectPosition);
        });
  
        const timeoutPromise = new Promise((_, rejectTimeout) => {
          setTimeout(() => {
            timedOut = true;
            rejectTimeout(new Error("Timeout khi lấy vị trí"));
          }, timeout);
        });
  
        Promise.race([positionPromise, timeoutPromise])
          .then((position: GeolocationPosition) => {
            const coords = position.coords;
            const latitude = coords.latitude;
            const longitude = coords.longitude;
            const locationString = `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;
            const xLocation = canvas.width - ctx.measureText(locationString).width - padding;
  
            // Vẽ viền và chữ cho tọa độ
            ctx.strokeText(locationString, xLocation, yLocation);
            ctx.fillText(locationString, xLocation, yLocation);
  
            // Vẽ viền và chữ cho tên thiết bị
            ctx.strokeText(deviceInfo, xDevice, yDeviceInfo);
            ctx.fillText(deviceInfo, xDevice, yDeviceInfo);
  
            // Convert canvas to image data URL (base64)
            // const dataURL = canvas.toDataURL('image/jpeg');
            const dataURL = this.getCanvasBlob(canvas);
            console.log("Canvas đã vẽ ảnh thành công.");
            resolve(dataURL);
          })
          .catch(error => {
            if (timedOut) {
              console.error("Không thể lấy vị trí trong thời gian quy định:", error);
              // Vẽ tên thiết bị mà không có tọa độ
              ctx.strokeText(deviceInfo, xDevice, yDeviceInfo);
              ctx.fillText(deviceInfo, xDevice, yDeviceInfo);
            } else {
              console.error("Không thể lấy vị trí:", error);
            }
  
            // Convert canvas to image data URL (base64)
            // const dataURL = canvas.toDataURL('image/jpeg');
            const dataURL = this.getCanvasBlob(canvas);
            console.log("Canvas đã vẽ ảnh thành công mặc dù không lấy được vị trí.");
            resolve(dataURL);
          });
      };
  
      img.onerror = error => {
        console.error("Ảnh không hợp lệ hoặc lỗi khi tải:", error);
        reject(error);
      };
    });
  }

  getCanvasBlob(canvas): Promise<Blob | null> {
    return new Promise<Blob | null>((resolve, reject) => {
      if (canvas) {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            resolve(null);
          }
        }, 'image/png');  // Specify the desired format
      } else {
        reject(new Error('Canvas is not available'));
      }
    });
  }

  async saveBase64AsFile(base64Data: string, fileName: string): Promise<string> {
    try {
      const result = await Filesystem.writeFile({
        path: fileName,
        data: base64Data.split(',')[1],  
        directory: Directory.Data,       
        encoding: Encoding.UTF8,          
      });
      console.log('File đã lưu thành công:', result.uri);
      return result.uri; 
    } catch (error) {
      console.error('Lỗi khi lưu file:', error);
      throw error;
    }
  }
  
}
