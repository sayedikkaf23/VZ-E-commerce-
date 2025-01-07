import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChequedepositService {

  constructor(private http: HttpClient) { }

  sendChequeDepositData(quoteId: string, files: File[]) {
    const url = `${environment.apiUrl}/payment/addChequeDeposit/${quoteId}`;
    
    const uploadData = new FormData();
    for (let i = 0; i < files.length; i++) {
      uploadData.append('transfer_copy', files[i], files[i].name);
    }
  
    return this.http.post(url, uploadData);
  }
}
