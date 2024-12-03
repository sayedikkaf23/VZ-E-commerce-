// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { environment } from '../../environments/environment';
// @Injectable({
//   providedIn: 'root'
// })
// export class BankTransferService {

//   constructor(private http: HttpClient) { }

//   // Example function to call the backend endpoint
//   makeBankTransfer(transferData: any) {
//     return this.http.post(`${environment.apiUrl}/user/addbankTransfer`, transferData);
//   }
// }




import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BankTransferService {

  constructor(private http: HttpClient) { }

  sendBankTransferData(quoteId: string, formData: any, files: File[]) {
    const url = `${environment.apiUrl}/user/addbankTransfer/${quoteId}`;
    
    const uploadData = new FormData();

    // Append form data properties to uploadData
    for (const key in formData) {
      if (formData.hasOwnProperty(key)) {
        uploadData.append(key, formData[key]);
      }
    }

    // Append files to uploadData
    for (const file of files) {
      uploadData.append('transfer_copy', file, file.name);
    }

    // Send the HTTP POST request with the formData to the specified URL
    return this.http.post(url, uploadData);
  }

  convertCurrency(fromCurrency: string, toCurrency: string, amount: number) {
    const body = { fromCurrency, toCurrency, amount };
    return this.http.post(`${environment.apiUrl}/user/convert-currency`, body);
  }

}
