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
    const apiUrl = `${environment.apiUrl}/online/pi-data/${quoteId}`;
    return this.http.get(apiUrl);
  }

  payCheckout(quoteId: string) {
  return this.http.post<{ id: string; integrity: string }>(
    `${environment.apiUrl}/payment/initCheckout/${encodeURIComponent(quoteId)}`,
    {}
  );
}

  // Fix: Add parentheses to define getPaymentMethod as a function returning an Observable
  getPaymentMethods(): Observable<any[]> {
    const apiUrl = `${environment.apiUrl}/online/getpayment`;
    return this.http.get<any[]>(apiUrl);
  }

  getPayNowDataById(quoteId: string): Observable<any> {
    const apiUrl = `${environment.apiUrl}/payment/paynow/${quoteId}`;
    return this.http.get(apiUrl);
  }

  getAccountDetails(): Observable<any[]> {
    const apiUrl = `${environment.apiUrl}/online/account-details`;
    return this.http.get<any[]>(apiUrl);
  }

  getQuoteById(quoteId: string): Observable<any> {
    const apiUrl = `${environment.apiUrl}/online/checkQuoteId/${quoteId}`;
    return this.http.get(apiUrl);
  }

  getSidebarData(): Observable<any> {
    const apiUrl = `${environment.apiUrl}/online/sidebardata`;
    return this.http.get(apiUrl);
  }

  payNowSaleforce(quoteId: string): Observable<any> {
    const apiUrl = `${environment.apiUrl}/payment/payNowSaleforce/${quoteId}`;
    // Assuming an empty request body, adjust as needed
    const requestBody = {};

    return this.http.post(apiUrl, requestBody);
  }

  payNowByStripe(quoteId: string): Observable<any> {
    const apiUrl = `${environment.apiUrl}/payment/payNowByStripe/${quoteId}`;
    return this.http.get(apiUrl);
  }
  PayViaTelr(quoteId: string): Observable<any> {
    const apiUrl = `${environment.apiUrl}/payment/payNowByTelr/${quoteId}`;
    return this.http.get(apiUrl);
  }

  payNowByMagnati(quoteId: string): Observable<any> {
    const apiUrl = `${environment.apiUrl}/payment/payNowByFiserv/${quoteId}`;
    return this.http.get(apiUrl);
  }

  getPaymentModesHome(): Observable<any[]> {
    const apiUrl = `${environment.apiUrl}/online/getpaymentmods`;
    return this.http.get<any[]>(apiUrl);
  }

  getPaymentStatus(resourcePath: string) {
  return this.http.get<any>(`${environment.apiUrl}/payment/getPaymentStatus?resourcePath=${encodeURIComponent(resourcePath)}`);
}


  sendWaitingMail(email: string): Observable<any>  {
    const body = {email};
    const apiUrl = `${environment.apiUrl}/payment/waitingMail`;
    return this.http.post(apiUrl, body, {
      headers: { "Content-Type": "application/json" },});
  }


  sendSuccessEmail(email: string): Observable<any> {
    const body = {email};
    const apiUrl = `${environment.apiUrl}/payment/successMail`;
    return this.http.post(apiUrl, body, {
      headers: { "Content-Type": "application/json" },});
    }
}