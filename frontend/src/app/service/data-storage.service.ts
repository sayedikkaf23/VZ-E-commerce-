import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataStorageService {
  private salesforceResponse: any = null;

  // Method to set the response data
  setSalesforceResponse(data: any) {
    this.salesforceResponse = data;
  }

  // Method to get the response data
  getSalesforceResponse() {
    return this.salesforceResponse;
  }


  
}
