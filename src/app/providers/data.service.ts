import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private jsonData: any = null;
  private nameFile: any = null;

  constructor() {}

  setJsonData(data: any) {
    this.jsonData = data;
  }

  getJsonData() {
    return this.jsonData;
  }

  setDataName(data: any) {
    this.nameFile = data;
  }

  getDataName() {
    return this.nameFile;
  }


  clearJsonData() {
    this.jsonData = null; 
    this.nameFile = null;
  }

  parseTextToJSON(text: string) {
    const lines = text.replace(/\)\s*(?=[A-Z])/g, ')\n').split('\n');
    const familyTree: any[] = [];

    function getParentCode(nodeCode: string) {
      const parts = nodeCode.split('.');
      parts.pop();
      return parts.length ? parts.join('.') : null;
    }

    lines.forEach(line => {
      const match = line.match(/(.+?)\s*\(([\d.]+)\)/);
      if (!match || !match[2]) return;
      if (match) {
        const fullName = match[1].trim();
        const nodeCode = match[2].trim();
        const parentCode = getParentCode(nodeCode);

        familyTree.push({
          NodeCode: nodeCode,
          FullName: fullName,
          Parent: parentCode,
          Level: nodeCode.split('.').length - 1
        });
      }
    });

    return { list: familyTree };
  }
}
