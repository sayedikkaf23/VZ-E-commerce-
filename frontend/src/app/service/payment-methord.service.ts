// src/app/services/payment-method.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PaymentMethodService {
  url = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // GET request to fetch payment methods
  getPaymentMethods(): Observable<any> {
    return this.http.get<any>(`${this.url}/payment/payment-methods`);
  }

  // PUT request to update payment method status
  updatePaymentMethodStatus(paymentMethodId: string, payload: any): Observable<any> {
    return this.http.put<any>(
      `${this.url}/payment/payment-methods/update/${paymentMethodId}`,
      payload
    );
  }
}
