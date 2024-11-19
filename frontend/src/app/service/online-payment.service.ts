import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OnlinePaymentService {
  constructor(private http: HttpClient) {}

  createTotalpaySession(orderData: any): Observable<any> {
    const apiUrl = `${environment.apiUrl}/proformainvoice`;
    return this.http.post(apiUrl, orderData);
  }

  getPiDataById(quoteId: string): Observable<any> {
    const apiUrl = `${environment.apiUrl}/admin/pi-data/${quoteId}`;
    return this.http.get(apiUrl);
  }

  // Fix: Add parentheses to define getPaymentMethod as a function returning an Observable
  getPaymentMethods(): Observable<any[]> {
    const apiUrl = `${environment.apiUrl}/admin/getpayment`;
    return this.http.get<any[]>(apiUrl);
  }

  getPayNowDataById(quoteId: string): Observable<any> {
    const apiUrl = `${environment.apiUrl}/user/paynow/${quoteId}`;
    return this.http.get(apiUrl);
  }

  getAccountDetails(): Observable<any[]> {
    const apiUrl = `${environment.apiUrl}/admin/account-details`;
    return this.http.get<any[]>(apiUrl);
  }

  getQuoteById(quoteId: string): Observable<any> {
    const apiUrl = `${environment.apiUrl}/user/checkQuoteId/${quoteId}`;
    return this.http.get(apiUrl);
  }

  getSidebarData(): Observable<any> {
    const apiUrl = `${environment.apiUrl}/user/sidebardata`;
    return this.http.get(apiUrl);
  }

  payNowSaleforce(quoteId: string): Observable<any> {
    const apiUrl = `${environment.apiUrl}/user/payNowSaleforce/${quoteId}`;
    // Assuming an empty request body, adjust as needed
    const requestBody = {};

    return this.http.post(apiUrl, requestBody);
  }

  payNowByStripe(quoteId: string): Observable<any> {
    const apiUrl = `${environment.apiUrl}/user/payNowByStripe/${quoteId}`;
    return this.http.get(apiUrl);
  }
  PayViaTelr(quoteId: string): Observable<any> {
    const apiUrl = `${environment.apiUrl}/user/payNowByTelr/${quoteId}`;
    return this.http.get(apiUrl);
  }

  payNowByMagnati(quoteId: string): Observable<any> {
    const apiUrl = `${environment.apiUrl}/user/payNowByFiserv/${quoteId}`;
    return this.http.get(apiUrl);
  }

  getPaymentModesHome(): Observable<any[]> {
    const apiUrl = `${environment.apiUrl}/admin/getpaymentmods`;
    return this.http.get<any[]>(apiUrl);
  }
}