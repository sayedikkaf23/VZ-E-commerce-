import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CashovercounterService {
  constructor(private http: HttpClient) { }

  sendCashCounterData(quoteId: string,formData: FormData) {
    const url = `${environment.apiUrl}/payment/addCashCounter/${quoteId}`;
    return this.http.post(url, formData);
    // const uploadData = new FormData();
    // uploadData.append('transfer_copy', file, file.name);
  
    // return this.http.post(url, uploadData);
  }
}