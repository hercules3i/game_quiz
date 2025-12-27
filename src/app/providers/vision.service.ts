import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VisionService {
  private apiKey = 'AIzaSyBns_Z_0kDSaymedamrR1n44OMTejvKRWM'; // Thay YOUR_GOOGLE_CLOUD_API_KEY bằng API key của bạn
  private apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${this.apiKey}`;

  constructor(private http: HttpClient) { }

  analyzeImage(imageUri: string): Observable<any> {
    const body = {
      "requests": [
        {
          "image": {
            "source": {
              "imageUri": imageUri  // Sử dụng URI của ảnh thay vì base64
            }
          },
          "features": [
            {
              "type": "TEXT_DETECTION"
            }
          ]
        }
      ]
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(this.apiUrl, body, { headers });

  }
}
