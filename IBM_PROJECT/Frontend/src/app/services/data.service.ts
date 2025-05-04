import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private textData: string = '';

  setTextData(data: string) {
    this.textData = data;
  }

  getTextData() {
    return this.textData;
  }
}
