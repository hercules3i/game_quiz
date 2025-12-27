import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScriptManageService {

  constructor() { }
  checkAndLoadScript(scriptSrc: string, id?: string) {
    if (!this.isScriptLoaded(scriptSrc)) {
      // Load the script dynamically
      this.loadScript(scriptSrc, id);
    } else {
      // The script is already loaded
      console.log('Script is already loaded');
    }
  }
  private isScriptLoaded(scriptSrc: string): boolean {
    const existingScripts = Array.from(document.getElementsByTagName('script'));
    return existingScripts.some(script => script.src.includes(scriptSrc));
  }
  private loadScript(src: string, id?: string): void {
    const script = document.createElement('script');
    script.src = src;
    if (id) {
      script.id = id;
    }
    script.defer = true; // You can use 'async' as well
    document.body.appendChild(script);
  }
}
