import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CardmachineService {

  constructor(private http: HttpClient) { }

  sendCashMachinData(quoteId: string) {
    const url = `${environment.apiUrl}/user/addCashMachin/${quoteId}`;
  
    // Remove the file-related code since you are not sending a file
    // const uploadData = new FormData();
    // uploadData.append('transfer_copy', file, file.name);
  
    // Send a POST request with the quoteId only
    return this.http.post(url, null); // No need for FormData since there's no file
  }
  
}