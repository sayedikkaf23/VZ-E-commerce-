import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AddcardService {

  private apiUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) { }

  addCard(cardDetails: any): Observable<any> {
    const endpoint = `${this.apiUrl}/customer/addCard`;
    return this.http.post(endpoint, cardDetails);
  }
  getCustomerCards(customerId: string,accountId:string): Observable<any> {
    const endpoint = `${this.apiUrl}/customer/cards/${customerId}/${accountId}`;
    return this.http.get(endpoint);
  }
  
  getUserProfile(userId: string): Observable<any> {
    const endpoint = `${this.apiUrl}/customer/userProfile/${userId}`;
    return this.http.get(endpoint);
  }
  prepareCheckout(payload: any) {
    return this.http.post(`${this.apiUrl}/customer/addcustomer_card`, payload);
  }
}